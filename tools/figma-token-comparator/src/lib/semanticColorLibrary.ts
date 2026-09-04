import type { LibraryToken } from "../comparators/types";

/** Коллекция semantic-цветов библиотеки AID — единственный источник для «Предлагаем» и combobox. */
export const SEMANTIC_COLOR_COLLECTION_NAME = "color-sem";

export function isSemanticColorToken(token: LibraryToken): boolean {
  return token.collectionName.trim().toLowerCase() === SEMANTIC_COLOR_COLLECTION_NAME;
}

/** Токены для автопредложений и ручного выбора (без effects и прочих коллекций). */
export function filterSemanticColorTokens(tokens: LibraryToken[]): LibraryToken[] {
  return tokens.filter(isSemanticColorToken);
}
