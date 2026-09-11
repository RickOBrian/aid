import type { LibraryTextStyle } from "../comparators/types";

/**
 * Имя semantic-коллекции типографики в портале Driver (`typographyData.ts` →
 * `typographyCollection.collectionName`). Параллель `color-sem` у цветов.
 *
 * OPEN QUESTION (PD): у Text Styles в Figma REST нет поля `collectionName`, как
 * у Variables. Маркер semantic-стиля в библиотеке пока не зафиксирован.
 *
 * Текущая эвристика (до PD-решения):
 * - включаем стили с путём `typography-sem/...` (если библиотека использует
 *   папку с именем коллекции);
 * - включаем «плоские» имена без `/` (как `headline 1` в Driver typographyData);
 * - исключаем стили в других папках (`Guide/...`, `Debug/...` и т.п.).
 */
export const SEMANTIC_TYPOGRAPHY_COLLECTION_NAME = "typography-sem";

export function isSemanticTypographyStyle(style: LibraryTextStyle): boolean {
  const normalized = style.name.trim().toLowerCase();
  const collectionPrefix = `${SEMANTIC_TYPOGRAPHY_COLLECTION_NAME}/`;
  if (normalized.startsWith(collectionPrefix)) return true;
  if (normalized.includes("/")) return false;
  return true;
}

/** Text Styles для автопредложений и сравнения (без стилей из прочих папок). */
export function filterSemanticTypographyStyles(styles: LibraryTextStyle[]): LibraryTextStyle[] {
  return styles.filter(isSemanticTypographyStyle);
}
