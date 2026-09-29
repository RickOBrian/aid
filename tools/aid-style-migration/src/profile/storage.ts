/**
 * Профили и индексы материалов в figma.clientStorage.
 *
 * clientStorage, а не pluginData файла: профиль нужен в любом файле с
 * макетами, а лимит pluginData — 100 kB на запись (проверено на этапе 0).
 * Список профилей — под одним ключом, индекс каждого материала — под своим:
 * в одну запись все индексы не поместятся (так же у Token Comparator).
 */

import type { MaterialIndex, ProductProfile } from "./types";

const KEYS = {
  PROFILES: "sm_profiles",
  ACTIVE: "sm_active_profile",
} as const;
const INDEX_PREFIX = "sm_index:";

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
