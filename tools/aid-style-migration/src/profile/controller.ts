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
import { LANGUAGE_SCHEMA, mergeSources, upsertSource, type StyleLanguage } from "../core/language";
import { learnOpenFile } from "./learn";
import type { ScanScope } from "../assemble/types";
import { applyAnswers, buildQuestions, isOpen, type Answer, type Question, type TokenCandidate } from "../core/questions";
import { buildBoard } from "../board/questionBoard";
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
  VariableValue,
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
  /** Язык продукта — сумма изученных файлов образцов с решениями анкеты; null — ещё не изучали. */
  language: StyleLanguage | null;
  /** Анкета по языку: открытые — первыми. */
  questions: Question[];
  answers: Record<string, Answer>;
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
    ...(active ? await languageState(active) : { language: null, questions: [], answers: {} }),
  };
}

async function rawLanguage(profile: ProductProfile): Promise<StyleLanguage | null> {
  const sources = await store.getLanguageSources(profile.id);
  return sources.length ? mergeSources({ id: profile.id, name: profile.name }, sources, sources.map((s) => s.learnedAt).sort().reverse()[0] ?? now()) : null;
}

function hexOf(v: VariableValue | null | undefined): string | undefined {
  if (!v || v.kind !== "color") return undefined;
  const h = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${h(v.r)}${h(v.g)}${h(v.b)}`;
}

/** Цветовые токены продукта — кандидаты для пробелов анкеты, с цветом в светлой и тёмной теме. */
async function tokenCandidates(profile: ProductProfile): Promise<TokenCandidate[]> {
  const out: TokenCandidate[] = [];
  const light = profile.theme?.modes.find((m) => m.role === THEME_ROLES.light)?.modeId;
  const dark = profile.theme?.modes.find((m) => m.role === THEME_ROLES.dark)?.modeId;
  for (const m of profile.materials.filter((x) => x.kind === "tokens")) {
    const index = await store.getIndex(profile.id, m.id);
    if (index?.kind !== "tokens") continue;
    for (const c of index.data.collections) {
      if (!c.published) continue;
      const first = c.modes[0]?.modeId;
      for (const v of c.variables) {
        if (!v.published || v.resolvedType !== "COLOR") continue;
        out.push({
          key: v.key,
          name: v.name,
          collection: c.name,
          hexLight: hexOf(v.resolvedByMode[light ?? ""] ?? v.resolvedByMode[first]),
          hexDark: hexOf(v.resolvedByMode[dark ?? ""] ?? v.resolvedByMode[first]),
        });
      }
    }
  }
  return out;
}

async function languageState(profile: ProductProfile): Promise<Pick<ProfileState, "language" | "questions" | "answers">> {
  const raw = await rawLanguage(profile);
  if (!raw) return { language: null, questions: [], answers: {} };
  const answers = await store.getAnswers(profile.id);
  const questions = buildQuestions(raw, await tokenCandidates(profile));
  const open = questions.filter((q) => isOpen(q, answers));
  const closed = questions.filter((q) => !isOpen(q, answers));
  return { language: applyAnswers(raw, questions, answers), questions: [...open, ...closed], answers };
}

/** Изучить образцы в открытом файле: вклад этого файла в язык продукта заменяется. */
export async function learn(scope: ScanScope, report: (title: string) => void): Promise<{ state: ProfileState; screens: number }> {
  const profile = await activeProfile();
  if (!profile) throw new Error("Сначала создайте продукт");
  const { source } = await learnOpenFile(scope, report);
  if (source.screens === 0) return { state: await state(), screens: 0 };
  await store.saveLanguageSources(profile.id, upsertSource(await store.getLanguageSources(profile.id), source));
  return { state: await state(), screens: source.screens };
}

export async function answer(questionId: string, optionId: string | null, note?: string): Promise<ProfileState> {
  const profile = await activeProfile();
  if (!profile) return state();
  const answers = await store.getAnswers(profile.id);
  if (optionId === null) delete answers[questionId];
  else answers[questionId] = { questionId, optionId, ...(note ? { note } : {}), answeredAt: now() };
  await store.saveAnswers(profile.id, answers);
  return state();
}

export async function purgeLegacy(): Promise<void> {
  await store.purgeLegacyThumbs();
}

/** Доска вопросов на канвасе: собрать страницу и показать вопрос. */
export async function board(questionId: string | null, report: (title: string) => void): Promise<void> {
  const profile = await activeProfile();
  if (!profile) throw new Error("Сначала создайте продукт");
  const { questions, answers } = await languageState(profile);
  if (!questions.length) throw new Error("Вопросов нет — сначала изучите образцы");
  await buildBoard(profile.name, questions, answers, questionId, report);
}

export async function forgetLanguageSource(fileName: string): Promise<ProfileState> {
  const profile = await activeProfile();
  if (profile) {
    const rest = (await store.getLanguageSources(profile.id)).filter((s) => s.fileName !== fileName);
    await store.saveLanguageSources(profile.id, rest);
  }
  return state();
}

/** Файл для репозитория: `products/<id>/style-language.json` (Я7, после ADR). */
export async function exportLanguage(): Promise<{ fileName: string; text: string } | null> {
  const profile = await activeProfile();
  if (!profile) return null;
  const lang = (await languageState(profile)).language;
  if (!lang) return null;
  return { fileName: "style-language.json", text: JSON.stringify({ ...lang, $schema: LANGUAGE_SCHEMA }, null, 2) };
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
      // Токены и компоненты читаем порознь: отказ одного запроса (например,
      // нет scope на переменные) не должен прятать остальное.
      const reasons: string[] = [];

      if (link.kind === "tokens" || link.kind === "auto") {
        try {
          const { index: data, variablesError } = await fetchTokens(file, token, (t) => report(`${name}: ${t}`));
          if (variablesError) reasons.push(`токены: переменные не прочитаны — ${variablesError}`);
          const stats = tokensStats(data);
          if (stats.variables + stats.textStyles + stats.effectStyles > 0) found.push({ kind: "tokens", index: { kind: "tokens", data }, stats });
          else reasons.push("опубликованных переменных и стилей нет");
        } catch (e) {
          reasons.push(`токены: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
      if (link.kind !== "tokens") {
        try {
          const data = await fetchComponents(file, token, (t) => report(`${name}: ${t}`));
          const stats = componentsStats(data);
          if (stats.sets + stats.components > 0) {
            const kind: MaterialKind = link.kind === "auto" ? (smallShare(data) >= 0.7 ? "icons" : "components") : link.kind;
            found.push({ kind, index: kind === "icons" ? { kind: "icons", data } : { kind: "components", data }, stats });
          } else {
            reasons.push("опубликованных компонентов нет");
          }
        } catch (e) {
          reasons.push(`компоненты: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
      // Пустой материал не сохраняем — он выглядит как прочитанный и путает.
      if (found.length === 0) {
        errors.push(`«${name}»: ${reasons.join("; ")}`);
        continue;
      }
      // Прочитали не всё, что ожидали (например, стили есть, а переменные не отдались) — сказать.
      if (reasons.length && link.kind === "tokens") errors.push(`«${name}»: ${reasons.join("; ")}`);
      if (reasons.some((r) => r.startsWith("токены:")) && link.kind === "auto") errors.push(`«${name}»: ${reasons.filter((r) => r.startsWith("токены:")).join("; ")}`);
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
