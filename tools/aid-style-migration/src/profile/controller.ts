/**
 * Действия с профилями в главном потоке: создать, выбрать, проиндексировать
 * открытый файл, настроить тему, экспорт и импорт. Возвращают состояние,
 * которое целиком перерисовывает вкладку «Продукт».
 */

import {
  buildExport,
  createProfile,
  materialId,
  missingMaterials,
  parseExport,
  removeMaterial,
  suggestTheme,
  upsertMaterial,
} from "./profile";
import { exemplarStats, indexExemplars, type ExemplarScope } from "./exemplars";
import { componentsStats, indexComponents, indexTokens, tokensStats } from "./indexFile";
import { fetchTokens } from "./restTokens";
import { THEME_ROLES } from "../lib/vocabulary";
import * as store from "./storage";
import { exemplarVariableOrigin } from "./profile";
import type { ExemplarIndex, MaterialIndex, MaterialKind, ProductProfile, ThemeRole, ThemeSetting } from "./types";

export interface ThemeCandidate {
  key: string;
  name: string;
  modes: Array<{ modeId: string; name: string }>;
}

export interface LibraryStatus {
  materialId: string;
  /** true — подключена в этом файле; false — нет; null — проверить нельзя (компоненты, иконки). */
  enabled: boolean | null;
}

export interface ProfileState {
  fileName: string;
  /** Задан ли токен для чтения по ссылке. Сам токен в UI не уходит. */
  hasPat: boolean;
  profiles: Array<{ id: string; name: string }>;
  active: ProductProfile | null;
  themeCandidates: ThemeCandidate[];
  missing: Array<{ kind: MaterialKind; impact: string }>;
  libraries: LibraryStatus[];
}

const now = () => new Date().toISOString();

async function activeProfile(): Promise<ProductProfile | null> {
  const profiles = await store.getProfiles();
  const id = await store.getActiveProfileId();
  return profiles.find((p) => p.id === id) ?? profiles[0] ?? null;
}

async function themeCandidates(profile: ProductProfile): Promise<ThemeCandidate[]> {
  const out: ThemeCandidate[] = [];
  for (const m of profile.materials.filter((x) => x.kind === "tokens")) {
    const index = await store.getIndex(profile.id, m.id);
    if (index?.kind !== "tokens") continue;
    for (const c of index.data.collections) if (c.published && c.modes.length >= 2) out.push({ key: c.key, name: c.name, modes: c.modes });
  }
  return out;
}

/** Подключена ли библиотека токенов в текущем файле — по имени библиотеки у teamLibrary. */
async function libraryStatus(profile: ProductProfile): Promise<LibraryStatus[]> {
  let names = new Set<string>();
  try {
    const collections = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
    names = new Set(collections.map((c) => c.libraryName));
  } catch {
    // Нет доступа к teamLibrary — статус неизвестен.
  }
  const local = figma.root.name;
  return profile.materials.map((m) => ({
    materialId: m.id,
    enabled: m.kind === "tokens" ? m.fileName === local || names.has(m.fileName) : null,
  }));
}

export async function state(): Promise<ProfileState> {
  const profiles = await store.getProfiles();
  const active = await activeProfile();
  return {
    fileName: figma.root.name,
    hasPat: Boolean(await store.getPat()),
    profiles: profiles.map((p) => ({ id: p.id, name: p.name })),
    active,
    themeCandidates: active ? await themeCandidates(active) : [],
    missing: active ? missingMaterials(active) : [],
    libraries: active ? await libraryStatus(active) : [],
  };
}

export async function create(name: string): Promise<ProfileState | { error: string }> {
  const profiles = await store.getProfiles();
  // Два продукта с одним именем путают: не видно, в какой из них ушёл материал.
  const same = profiles.find((p) => p.name.trim().toLowerCase() === name.trim().toLowerCase());
  if (same) {
    await store.setActiveProfileId(same.id);
    return { error: `Продукт «${same.name}» уже есть — он выбран` };
  }
  const profile = createProfile(name, profiles.map((p) => p.id), now());
  await store.saveProfile(profile);
  await store.setActiveProfileId(profile.id);
  return state();
}

export async function select(id: string): Promise<ProfileState> {
  await store.setActiveProfileId(id);
  return state();
}

export async function remove(id: string): Promise<ProfileState> {
  await store.deleteProfile(id);
  return state();
}

/** Индексирует открытый файл для выбранных видов материалов активного профиля. */
export async function indexOpenFile(
  kinds: MaterialKind[],
  exemplarScope: ExemplarScope,
  report: (title: string) => void,
): Promise<ProfileState> {
  let profile = await activeProfile();
  if (!profile) throw new Error("Сначала создайте продукт");
  const fileName = figma.root.name;

  for (const kind of kinds) {
    let index: MaterialIndex;
    let stats: Record<string, number>;
    let notes: string[] | undefined;
    if (kind === "tokens") {
      report("токены и стили");
      const data = await indexTokens();
      index = { kind, data };
      stats = tokensStats(data);
    } else if (kind === "components" || kind === "icons") {
      report(kind === "icons" ? "иконки" : "компоненты");
      const data = await indexComponents();
      index = { kind, data };
      stats = componentsStats(data);
    } else if (kind === "exemplars") {
      const data = await indexExemplars(exemplarScope, (done, total) => report(`образцы: экран ${done} из ${total}`));
      index = { kind, data };
      const origin = await exemplarOrigin(profile, data);
      stats = { ...exemplarStats(data), ...origin.stats };
      notes = origin.notes;
    } else {
      // Стандарты — пакетом правил, позже.
      continue;
    }
    const id = materialId(kind, fileName);
    await store.saveIndex(profile.id, id, index);
    profile = upsertMaterial(profile, { id, kind, fileName, source: "open-file", indexedAt: now(), stats, notes }, now());

    // Тема предлагается автоматически, если её ещё нет; пользователь может поменять.
    if (kind === "tokens" && !profile.theme && index.kind === "tokens") {
      profile = { ...profile, theme: suggestTheme(index.data.collections.filter((c) => c.published)) };
    }
  }
  await store.saveProfile(profile);
  return state();
}

/**
 * Материал по ссылке через REST API — без открытия файла. Пока — токены и
 * стили; компоненты и иконки по ссылке — следующим шагом. Имя материала —
 * имя файла из REST: то же, что у индексации открытого файла, поэтому
 * повторное чтение любым способом заменяет запись, а не дублирует.
 */
export async function indexFromUrl(url: string, report: (title: string) => void): Promise<ProfileState> {
  let profile = await activeProfile();
  if (!profile) throw new Error("Сначала создайте продукт");
  const { fileName, index } = await fetchTokens(url, await store.getPat(), report);
  const id = materialId("tokens", fileName);
  await store.saveIndex(profile.id, id, { kind: "tokens", data: index });
  profile = upsertMaterial(profile, { id, kind: "tokens", fileName, source: "rest", indexedAt: now(), stats: tokensStats(index) }, now());
  if (!profile.theme) profile = { ...profile, theme: suggestTheme(index.collections.filter((c) => c.published)) };
  await store.saveProfile(profile);
  return state();
}

export async function savePat(token: string): Promise<ProfileState> {
  await store.setPat(token.trim());
  return state();
}

/**
 * Откуда токены образцов: из продукта (тот же ключ), похоже на копию
 * библиотеки продукта (то же имя, другой ключ), локальные переменные
 * файла образцов, другие библиотеки. От этого зависит, насколько
 * образцам верить на этапе 3.
 */
async function exemplarOrigin(profile: ProductProfile, data: ExemplarIndex): Promise<{ stats: Record<string, number>; notes: string[] }> {
  const keys = new Set<string>();
  const names = new Set<string>();
  for (const m of profile.materials.filter((x) => x.kind === "tokens")) {
    const index = await store.getIndex(profile.id, m.id);
    if (index?.kind !== "tokens") continue;
    for (const c of index.data.collections) {
      for (const v of c.variables) {
        if (!v.published) continue;
        keys.add(v.key);
        names.add(v.name);
      }
    }
  }
  const origin = exemplarVariableOrigin(data, keys, names);
  const notes = origin.foreignCollections.length
    ? [`Не из продукта, по коллекциям: ${origin.foreignCollections.map(([name, n]) => `«${name || "без имени"}» — ${n}`).join(", ")}`]
    : [];
  return {
    stats: { fromProduct: origin.fromProduct, sameNameOnly: origin.sameNameOnly, localInFile: origin.local, otherLibraries: origin.other },
    notes,
  };
}

export async function dropMaterial(id: string): Promise<ProfileState> {
  const profile = await activeProfile();
  if (!profile) return state();
  await store.deleteIndex(profile.id, id);
  await store.saveProfile(removeMaterial(profile, id, now()));
  return state();
}

export async function setTheme(collectionKey: string | null, roles: Record<string, ThemeRole>): Promise<ProfileState> {
  const profile = await activeProfile();
  if (!profile) return state();
  let theme: ThemeSetting | null = null;
  if (collectionKey) {
    const candidate = (await themeCandidates(profile)).find((c) => c.key === collectionKey);
    if (candidate) {
      theme = {
        collectionKey,
        collectionName: candidate.name,
        modes: candidate.modes.map((m) => ({ ...m, role: roles[m.modeId] ?? THEME_ROLES.other })),
      };
    }
  }
  await store.saveProfile({ ...profile, theme, updatedAt: now() });
  return state();
}

export async function exportActive(): Promise<{ fileName: string; text: string } | null> {
  const profile = await activeProfile();
  if (!profile) return null;
  const data = buildExport(profile, await store.getAllIndexes(profile));
  return { fileName: `${profile.id}.aid-profile.json`, text: JSON.stringify(data, null, 2) };
}

/** Импорт: профиль с тем же id заменяется целиком — вместе с индексами. */
export async function importProfile(text: string): Promise<ProfileState | { error: string }> {
  const parsed = parseExport(text);
  if ("error" in parsed) return parsed;
  const existing = (await store.getProfiles()).find((p) => p.id === parsed.profile.id);
  if (existing) for (const m of existing.materials) await store.deleteIndex(existing.id, m.id);
  for (const [id, index] of Object.entries(parsed.indexes)) await store.saveIndex(parsed.profile.id, id, index);
  await store.saveProfile(parsed.profile);
  await store.setActiveProfileId(parsed.profile.id);
  return state();
}
