/**
 * Подписи токенов и стилей библиотеки в выпадающих списках — и обратный
 * поиск по подписи.
 *
 * Пара «форматирование ↔ поиск» держится здесь вместе намеренно: подпись
 * токена содержит не только имя (`bg/accent (color-sem)`), и стоит один раз
 * перепутать подпись с именем — в реестр решений уедет строка вида
 * «bg/accent (color-sem)» вместо имени токена. Именно так и было до правки
 * находки №11.
 */

import type { LibraryTextStyle, LibraryToken } from "../comparators/types";

/** Подпись токена в списке: имя и коллекция, чтобы различать одноимённые. */
export function formatLibraryTokenLabel(token: LibraryToken): string {
  return `${token.name} (${token.collectionName})`;
}

/** Токен по подписи из списка. Подпись — не имя: сравнивать нужно так же, как форматировали. */
export function findLibraryTokenByLabel(
  label: string,
  tokens: LibraryToken[]
): LibraryToken | undefined {
  const needle = label.trim();
  if (!needle) return undefined;
  return tokens.find((token) => formatLibraryTokenLabel(token) === needle);
}

/** Подпись стиля текста в списке совпадает с его именем. */
export function formatLibraryTextStyleLabel(style: LibraryTextStyle): string {
  return style.name;
}

export function findLibraryTextStyleByLabel(
  label: string,
  styles: LibraryTextStyle[]
): LibraryTextStyle | undefined {
  const needle = label.trim();
  if (!needle) return undefined;
  return styles.find((style) => formatLibraryTextStyleLabel(style) === needle);
}
