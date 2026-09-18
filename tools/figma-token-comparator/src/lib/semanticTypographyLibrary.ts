import type { LibraryTextStyle } from "../comparators/types";

/**
 * Имя semantic-коллекции типографики в портале Driver (`typographyData.ts` →
 * `typographyCollection.collectionName`). Параллель `color-sem` у цветов.
 *
 * Маркер semantic Text Style в Figma-библиотеке (решение PD, 2026-09-16):
 * denylist служебных префиксов первого сегмента пути (`NON_SEMANTIC_PREFIXES`).
 * Стили с путём `typography-sem/...` также проходят, если папка появится явно.
 *
 * У Text Styles в Figma REST нет поля `collectionName`, как у Variables —
 * фильтрация только по имени стиля.
 */
export const SEMANTIC_TYPOGRAPHY_COLLECTION_NAME = "typography-sem";

/** Первый сегмент пути стиля (до `/`), case-insensitive — служебные, не semantic. */
export const NON_SEMANTIC_PREFIXES = ["guide", "debug", "_archive", "draft", "wip"];

function getStyleNameFirstSegment(styleName: string): string {
  const trimmed = styleName.trim();
  const slashIndex = trimmed.indexOf("/");
  if (slashIndex === -1) return trimmed;
  return trimmed.slice(0, slashIndex);
}

export function isSemanticTypographyStyle(style: LibraryTextStyle): boolean {
  const segment = getStyleNameFirstSegment(style.name).trim().toLowerCase();
  return !NON_SEMANTIC_PREFIXES.includes(segment);
}

/** Text Styles для автопредложений и сравнения (без стилей из служебных папок). */
export function filterSemanticTypographyStyles(styles: LibraryTextStyle[]): LibraryTextStyle[] {
  return styles.filter(isSemanticTypographyStyle);
}
