/**
 * Профили и индексы материалов в figma.clientStorage.
 *
 * clientStorage, а не pluginData файла: профиль нужен в любом файле с
 * макетами, а лимит pluginData — 100 kB на запись (проверено на этапе 0).
 * Список профилей — под одним ключом, индекс каждого материала — под своим:
 * в одну запись все индексы не поместятся (так же у Token Comparator).
 */

import type { LanguageSource } from "../core/language";
import type { Answer } from "../core/questions";
import type { MaterialIndex, ProductProfile } from "./types";

const KEYS = {
  PROFILES: "sm_profiles",
  ACTIVE: "sm_active_profile",
  PAT: "sm_pat",
} as const;
const INDEX_PREFIX = "sm_index:";
/** Наблюдения языка продукта — по источникам, под своим ключом на продукт. */
const LANGUAGE_PREFIX = "sm_lang:";
/** Ответы анкеты — по продукту. */
const ANSWERS_PREFIX = "sm_answers:";
/** Картинки примеров — по продукту и узлу образца; список ключей — отдельно, чтобы чистить. */
const THUMB_PREFIX = "sm_thumb:";

function indexKey(profileId: string, materialId: string): string {
  return `${INDEX_PREFIX}${profileId}:${materialId}`;
}

export async function getProfiles(): Promise<ProductProfile[]> {
  const value = await figma.clientStorage.getAsync(KEYS.PROFILES);
  return Array.isArray(value) ? (value as ProductProfile[]) : [];
}

export async function saveProfile(profile: ProductProfile): Promise<ProductProfile[]> {
  const profiles = await getProfiles();
  const i = profiles.findIndex((p) => p.id === profile.id);
  if (i === -1) profiles.push(profile);
  else profiles[i] = profile;
  await figma.clientStorage.setAsync(KEYS.PROFILES, profiles);
  return profiles;
}

export async function deleteProfile(id: string): Promise<ProductProfile[]> {
  const profiles = await getProfiles();
  const target = profiles.find((p) => p.id === id);
  if (target) for (const m of target.materials) await figma.clientStorage.deleteAsync(indexKey(id, m.id));
  await figma.clientStorage.deleteAsync(`${LANGUAGE_PREFIX}${id}`);
  await figma.clientStorage.deleteAsync(`${ANSWERS_PREFIX}${id}`);
  await deleteThumbs(id);
  const rest = profiles.filter((p) => p.id !== id);
  await figma.clientStorage.setAsync(KEYS.PROFILES, rest);
  if ((await getActiveProfileId()) === id) await setActiveProfileId(rest[0]?.id ?? null);
  return rest;
}

export async function getActiveProfileId(): Promise<string | null> {
  const value = await figma.clientStorage.getAsync(KEYS.ACTIVE);
  return typeof value === "string" && value ? value : null;
}

export async function setActiveProfileId(id: string | null): Promise<void> {
  if (id) await figma.clientStorage.setAsync(KEYS.ACTIVE, id);
  else await figma.clientStorage.deleteAsync(KEYS.ACTIVE);
}

export async function getIndex(profileId: string, materialId: string): Promise<MaterialIndex | null> {
  const value = await figma.clientStorage.getAsync(indexKey(profileId, materialId));
  return value && typeof value === "object" ? (value as MaterialIndex) : null;
}

export async function saveIndex(profileId: string, materialId: string, index: MaterialIndex): Promise<void> {
  await figma.clientStorage.setAsync(indexKey(profileId, materialId), index);
}

export async function deleteIndex(profileId: string, materialId: string): Promise<void> {
  await figma.clientStorage.deleteAsync(indexKey(profileId, materialId));
}

export async function getAllIndexes(profile: ProductProfile): Promise<Record<string, MaterialIndex>> {
  const out: Record<string, MaterialIndex> = {};
  for (const m of profile.materials) {
    const index = await getIndex(profile.id, m.id);
    if (index) out[m.id] = index;
  }
  return out;
}

/**
 * Personal Access Token для чтения по ссылке. Хранится только здесь: не
 * уходит в UI (туда — лишь «задан / не задан»), не попадает в экспорт
 * профиля и в логи.
 */
export async function getPat(): Promise<string> {
  const value = await figma.clientStorage.getAsync(KEYS.PAT);
  return typeof value === "string" ? value : "";
}

export async function setPat(token: string): Promise<void> {
  if (token) await figma.clientStorage.setAsync(KEYS.PAT, token);
  else await figma.clientStorage.deleteAsync(KEYS.PAT);
}

export async function getLanguageSources(profileId: string): Promise<LanguageSource[]> {
  const value = await figma.clientStorage.getAsync(`${LANGUAGE_PREFIX}${profileId}`);
  return Array.isArray(value) ? (value as LanguageSource[]) : [];
}

export async function saveLanguageSources(profileId: string, sources: LanguageSource[]): Promise<void> {
  if (sources.length) await figma.clientStorage.setAsync(`${LANGUAGE_PREFIX}${profileId}`, sources);
  else await figma.clientStorage.deleteAsync(`${LANGUAGE_PREFIX}${profileId}`);
}

export async function getAnswers(profileId: string): Promise<Record<string, Answer>> {
  const value = await figma.clientStorage.getAsync(`${ANSWERS_PREFIX}${profileId}`);
  return value && typeof value === "object" ? (value as Record<string, Answer>) : {};
}

export async function saveAnswers(profileId: string, answers: Record<string, Answer>): Promise<void> {
  await figma.clientStorage.setAsync(`${ANSWERS_PREFIX}${profileId}`, answers);
}

async function thumbIds(profileId: string): Promise<string[]> {
  const value = await figma.clientStorage.getAsync(`${THUMB_PREFIX}${profileId}`);
  return Array.isArray(value) ? (value as string[]) : [];
}

export async function saveThumbs(profileId: string, thumbs: Array<{ nodeId: string; png: Uint8Array }>): Promise<void> {
  const ids = new Set(await thumbIds(profileId));
  for (const t of thumbs) {
    await figma.clientStorage.setAsync(`${THUMB_PREFIX}${profileId}:${t.nodeId}`, t.png);
    ids.add(t.nodeId);
  }
  await figma.clientStorage.setAsync(`${THUMB_PREFIX}${profileId}`, [...ids]);
}

export async function getThumb(profileId: string, nodeId: string): Promise<Uint8Array | null> {
  const value = await figma.clientStorage.getAsync(`${THUMB_PREFIX}${profileId}:${nodeId}`);
  return value instanceof Uint8Array ? value : null;
}

async function deleteThumbs(profileId: string): Promise<void> {
  for (const id of await thumbIds(profileId)) await figma.clientStorage.deleteAsync(`${THUMB_PREFIX}${profileId}:${id}`);
  await figma.clientStorage.deleteAsync(`${THUMB_PREFIX}${profileId}`);
}
