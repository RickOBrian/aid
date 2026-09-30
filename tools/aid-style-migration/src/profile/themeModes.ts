/**
 * Коллекция темы продукта в открытом файле и её светлый и тёмный режимы —
 * чтобы показать живую копию элемента в обеих темах (доска вопроса) или
 * включить тёмную тему секции («ПОСЛЕ · тёмная тема»).
 */

import { THEME_ROLES } from "../lib/vocabulary";
import * as store from "./storage";
import type { ProductProfile } from "./types";

export interface ThemeModes {
  collection: VariableCollection;
  lightModeId: string | null;
  darkModeId: string | null;
}

export async function themeModes(profile: ProductProfile): Promise<ThemeModes | null> {
  const theme = profile.theme;
  if (!theme) return null;
  const light = theme.modes.find((m) => m.role === THEME_ROLES.light)?.modeId ?? null;
  const dark = theme.modes.find((m) => m.role === THEME_ROLES.dark)?.modeId ?? null;
  if (!dark) return null;
  for (const m of profile.materials) {
    const index = await store.getIndex(profile.id, m.id);
    if (index?.kind !== "tokens") continue;
    const sample = index.data.collections.find((c) => c.key === theme.collectionKey)?.variables.find((v) => v.published);
    if (!sample) continue;
    try {
      const imported = await figma.variables.importVariableByKeyAsync(sample.key);
      const collection = await figma.variables.getVariableCollectionByIdAsync(imported.variableCollectionId);
      if (collection) return { collection, lightModeId: light, darkModeId: dark };
    } catch {
      // Библиотека не подключена в этом файле — попробуем локальные коллекции.
    }
  }
  const local = (await figma.variables.getLocalVariableCollectionsAsync()).find((c) => c.key === theme.collectionKey || c.name === theme.collectionName);
  return local ? { collection: local, lightModeId: light, darkModeId: dark } : null;
}
