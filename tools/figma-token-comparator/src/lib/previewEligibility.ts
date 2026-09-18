/**
 * Для каких строк доступна кнопка «Показать превью» — «Было / Будет» на
 * клоне слоя с привязанной целью строки.
 *
 * Общее правило обеих категорий: у строки есть цель, которую можно применить,
 * и сравнение не считает её уже совпавшей (`exact`) или подтверждённой
 * (`mapped` — для неё превью показывает модалка «Применить в макет»).
 */

import type { ComparisonResult, MatchStatus, TokenCategory } from "../comparators/types";

const COLOR_PREVIEW_STATUSES: ReadonlySet<MatchStatus> = new Set([
  "value",
  "name-match",
  "conflict",
  "approximate",
]);

/**
 * `name-mismatch` — стиль применён, но по значениям ближе другой стиль
 * библиотеки: превью показывает, как слой выглядел бы с ним.
 * `mixed-unresolved` исключён — применение такие строки тоже не трогает.
 */
const TYPOGRAPHY_PREVIEW_STATUSES: ReadonlySet<MatchStatus> = new Set([
  "value",
  "name-match",
  "conflict",
  "name-mismatch",
]);

export function canShowPreview(result: ComparisonResult, category: TokenCategory): boolean {
  if (category === "typography") {
    // Без key стиль не импортировать в файл — привязывать к клону нечего.
    return TYPOGRAPHY_PREVIEW_STATUSES.has(result.status) && Boolean(result.target?.styleKey);
  }
  return (
    COLOR_PREVIEW_STATUSES.has(result.status) &&
    Boolean(result.target) &&
    result.target?.valueUnresolved !== true
  );
}
