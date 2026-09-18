/**
 * Ключ статуса строки — то, что показывает бейдж и по чему работает фильтр.
 *
 * Обычно это сам `MatchStatus`, но для цветов тип привязки важнее результата
 * сравнения: цвет, заданный paint-стилем, нельзя перепривязать автоматически,
 * поэтому «Стиль вместо токена» и есть его настоящая классификация.
 *
 * Для типографики это НЕ так: стиль текста — это и есть токен, нормальное
 * состояние слоя. Значение имеет то, разошлись ли свойства слоя со стилем.
 * Пока подмена действовала на обе категории, все строки типографики со
 * стилем получали один и тот же бейдж, а фильтр предлагал единственный
 * пункт — расхождения, найденные компаратором, до пользователя не доходили.
 */

import type { ComparisonResult, MatchStatus } from "../comparators/types";

/** Ключ фильтра в шапке «Статус» — может отличаться от MatchStatus. */
export type StatusFilterKey =
  | MatchStatus
  | "style-binding"
  | "ghost-binding"
  | "hardcoded-no-analog";

export function getResultStatusFilterKey(result: ComparisonResult): StatusFilterKey {
  // Битая ссылка на стиль — проблема в любой категории.
  if (result.bindingType === "ghost") return "ghost-binding";

  // Значение задано вручную и ничего похожего в библиотеке нет.
  if (result.status === "layout-only" && result.bindingType === "hardcoded") {
    return "hardcoded-no-analog";
  }

  // Только цвета: paint-стиль вместо переменной.
  if (result.bindingType === "style" && result.category !== "typography") {
    return "style-binding";
  }

  return result.status;
}
