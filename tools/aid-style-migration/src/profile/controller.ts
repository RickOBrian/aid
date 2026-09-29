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
import { parseFigmaFileKey } from "../lib/figmaUrl";
import { fileName } from "./rest";
import { fetchComponents } from "./restComponents";
import { smallShare } from "./restParse";
import { fetchTokens } from "./restTokens";
import { THEME_ROLES } from "../lib/vocabulary";
import * as store from "./storage";
import { exemplarVariableOrigin } from "./profile";
import type {
  ExemplarIndex,
  LibraryLink,
  LinkKind,
  MaterialIndex,
  MaterialKind,
  ProductProfile,
  ThemeRole,
  ThemeSetting,
} from "./types";

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
 * Библиотеки по ссылкам через REST API — без открытия файлов. Каждая
 * ссылка — свой вид материала или «определить сам»: переменные и стили →
 * токены; компоненты → иконки, если ≥ 70 % не больше 48×48, иначе
 * компоненты. Имя материала — имя файла из REST: повторное чтение любым
 * способом заменяет запись, а не дублирует. Ошибка по одной ссылке не
 * останавливает остальные.
 */
export async function indexLinks(links: LibraryLink[], report: (title: string) => void): Promise<{ state: ProfileState; errors: string[] }> {
  let profile = await activeProfile();
  if (!profile) throw new Error("Сначала создайте продукт");
  const token = await store.getPat();
  if (!token) throw new Error("Нужен токен — задайте его в «Доступ по ссылке»");
  const errors: string[] = [];

  for (const [i, link] of links.entries()) {
    const file = parseFigmaFileKey(link.url);
    const label = `ссылка ${i + 1} из ${links.length}`;
    if (!file) {
      errors.push(`${label}: не получилось взять ключ файла — нужна ссылка на файл Figma целиком`);
      continue;
    }
    try {
      report(`${label}: имя файла`);
      const name = await fileName(file, token);
      const found: Array<{ kind: MaterialKind; index: MaterialIndex; stats: Record<string, number> }> = [];

      if (link.kind === "tokens" || link.kind === "auto") {
        const data = await fetchTokens(file, token, (t) => report(`${name}: ${t}`));
        const stats = tokensStats(data);
        if (link.kind === "tokens" || stats.variables + stats.textStyles + stats.effectStyles > 0) found.push({ kind: "tokens", index: { kind: "tokens", data }, stats });
      }
      if (link.kind !== "tokens") {
        const data = await fetchComponents(file, token, (t) => report(`${name}: ${t}`));
        const stats = componentsStats(data);
        const count = stats.sets + stats.components;
        if (link.kind !== "auto" || count > 0) {
          const kind: MaterialKind = link.kind === "auto" ? (smallShare(data) >= 0.7 ? "icons" : "components") : link.kind;
          found.push({ kind, index: kind === "icons" ? { kind: "icons", data } : { kind: "components", data }, stats });
        }
      }
      if (found.length === 0) {
        errors.push(`«${name}»: не нашлось ни опубликованных токенов, ни компонентов`);
        continue;
      }
      for (const f of found) {
        const id = materialId(f.kind, name);
        await store.saveIndex(profile.id, id, f.index);
        profile = upsertMaterial(
          profile,
          { id, kind: f.kind, fileName: name, source: "rest", url: link.url, indexedAt: now(), stats: f.stats },
          now(),
        );
        if (f.index.kind === "tokens" && !profile.theme) {
          profile = { ...profile, theme: suggestTheme(f.index.data.collections.filter((c) => c.published)) };
        }
      }
      // Сохраняем после каждой ссылки: ошибка на следующей не должна терять прочитанное.
      await store.saveProfile(profile);
    } catch (e) {
      errors.push(`${label}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return { state: await state(), errors };
}

/** Перечитать всё, что добавлено по ссылкам, — когда библиотеки обновили. */
export async function refreshLinks(report: (title: string) => void): Promise<{ state: ProfileState; errors: string[] }> {
  const profile = await activeProfile();
  const links: LibraryLink[] = (profile?.materials ?? [])
    .filter((m) => m.url && m.kind !== "exemplars" && m.kind !== "standards")
    .map((m) => ({ url: m.url!, kind: m.kind as LinkKind }));
  if (links.length === 0) return { state: await state(), errors: ["Материалов, добавленных по ссылке, нет"] };
  return indexLinks(links, report);
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
