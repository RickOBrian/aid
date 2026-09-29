/**
 * Чистая логика профиля: создание, материалы, тема, экспорт и импорт.
 */

import { hasDarkWord, hasLightWord, THEME_ROLES } from "../lib/vocabulary";
import {
  PROFILE_EXPORT_FORMAT,
  PROFILE_EXPORT_VERSION,
  type ExemplarIndex,
  type IndexedCollection,
  type Material,
  type MaterialIndex,
  type MaterialKind,
  type ProductProfile,
  type ProfileExport,
  type ThemeRole,
  type ThemeSetting,
} from "./types";

export function slug(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-zа-яё0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "product"
  );
}

export function createProfile(name: string, existingIds: string[], now: string): ProductProfile {
  const base = slug(name);
  let id = base;
  for (let n = 2; existingIds.includes(id); n++) id = `${base}-${n}`;
  return { id, name: name.trim(), materials: [], theme: null, standardsMode: "reference", createdAt: now, updatedAt: now };
}

export function materialId(kind: MaterialKind, fileName: string): string {
  return `${kind}:${fileName}`;
}

/** Тот же вид из того же файла заменяется, новый добавляется в конец. */
export function upsertMaterial(profile: ProductProfile, material: Material, now: string): ProductProfile {
  const materials = profile.materials.some((m) => m.id === material.id)
    ? profile.materials.map((m) => (m.id === material.id ? material : m))
    : [...profile.materials, material];
  return { ...profile, materials, updatedAt: now };
}

export function removeMaterial(profile: ProductProfile, id: string, now: string): ProductProfile {
  const materials = profile.materials.filter((m) => m.id !== id);
  // Тема живёт в токенах: ушли все токены — темы тоже нет.
  const theme = materials.some((m) => m.kind === "tokens") ? profile.theme : null;
  return { ...profile, materials, theme, updatedAt: now };
}

export function modeRole(name: string): ThemeRole {
  if (hasDarkWord(name)) return THEME_ROLES.dark;
  if (hasLightWord(name)) return THEME_ROLES.light;
  return THEME_ROLES.other;
}

/**
 * Коллекция темы — та, где режимы похожи на «светлый / тёмный». Если таких
 * несколько — с большим числом цветовых переменных. Пользователь может
 * выбрать другую; это предложение, а не решение.
 */
export function suggestTheme(collections: IndexedCollection[]): ThemeSetting | null {
  let best: { c: IndexedCollection; colors: number } | null = null;
  for (const c of collections) {
    if (c.modes.length < 2) continue;
    const roles = c.modes.map((m) => modeRole(m.name));
    if (!roles.includes(THEME_ROLES.dark)) continue;
    const colors = c.variables.filter((v) => v.resolvedType === "COLOR").length;
    if (!best || colors > best.colors) best = { c, colors };
  }
  if (!best) return null;
  const roles = best.c.modes.map((m) => modeRole(m.name));
  return {
    collectionKey: best.c.key,
    collectionName: best.c.name,
    modes: best.c.modes.map((m, i) => ({
      modeId: m.modeId,
      name: m.name,
      // Единственный не-тёмный режим пары — светлый, даже если назван иначе.
      role: roles[i] === THEME_ROLES.other && best!.c.modes.length === 2 ? THEME_ROLES.light : roles[i],
    })),
  };
}

/** Каких материалов не хватает и что из-за этого хуже (трекер, «Материалы продукта»). */
export function missingMaterials(profile: ProductProfile): Array<{ kind: MaterialKind; impact: string }> {
  const has = (k: MaterialKind) => profile.materials.some((m) => m.kind === k);
  const out: Array<{ kind: MaterialKind; impact: string }> = [];
  if (!has("tokens")) out.push({ kind: "tokens", impact: "перевод невозможен — единственный обязательный материал" });
  if (!has("components")) out.push({ kind: "components", impact: "только токены; компоненты — в предложения" });
  if (!has("icons")) out.push({ kind: "icons", impact: "иконки не трогаются" });
  if (!has("exemplars")) out.push({ kind: "exemplars", impact: "роли — только по именам токенов, уверенность ниже" });
  return out;
}

export function buildExport(profile: ProductProfile, indexes: Record<string, MaterialIndex>): ProfileExport {
  return { format: PROFILE_EXPORT_FORMAT, version: PROFILE_EXPORT_VERSION, profile, indexes };
}

/** Проверка импортируемого файла; ошибка — понятным текстом для пользователя. */
export function parseExport(text: string): ProfileExport | { error: string } {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { error: "Это не JSON" };
  }
  const d = data as Partial<ProfileExport>;
  if (d.format !== PROFILE_EXPORT_FORMAT) return { error: "Это не профиль AID Style Migration" };
  if (typeof d.version !== "number" || d.version > PROFILE_EXPORT_VERSION) {
    return { error: "Профиль из более новой версии плагина — обновите плагин" };
  }
  const p = d.profile as Partial<ProductProfile> | undefined;
  if (!p || typeof p.id !== "string" || typeof p.name !== "string" || !Array.isArray(p.materials)) {
    return { error: "В файле нет профиля продукта" };
  }
  return {
    format: PROFILE_EXPORT_FORMAT,
    version: d.version,
    profile: { ...(p as ProductProfile), theme: p.theme ?? null, standardsMode: p.standardsMode ?? "reference" },
    indexes: d.indexes && typeof d.indexes === "object" ? d.indexes : {},
  };
}

/** Раскладка токенов образцов по происхождению — чистая часть exemplarOrigin. */
export function exemplarVariableOrigin(
  data: ExemplarIndex,
  productKeys: Set<string>,
  productNames: Set<string>,
): { fromProduct: number; sameNameOnly: number; local: number; other: number; foreignCollections: Array<[string, number]> } {
  let fromProduct = 0;
  let sameNameOnly = 0;
  let local = 0;
  let other = 0;
  const foreign = new Map<string, number>();
  for (const [key, v] of Object.entries(data.variables)) {
    if (productKeys.has(key)) {
      fromProduct++;
      continue;
    }
    if (productNames.has(v.name)) sameNameOnly++;
    else if (!v.remote) local++;
    else other++;
    foreign.set(v.collection, (foreign.get(v.collection) ?? 0) + 1);
  }
  const foreignCollections = [...foreign.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  return { fromProduct, sameNameOnly, local, other, foreignCollections };
}
