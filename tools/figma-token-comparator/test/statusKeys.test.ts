/**
 * Ключ статуса строки: что покажет бейдж и что предложит фильтр.
 *
 * Найдено при проверке батча 6: подмена статуса типом привязки действовала на
 * обе категории, поэтому все строки типографики со стилем получали бейдж
 * «Стиль вместо токена» и один-единственный пункт в фильтре — расхождения,
 * которые компаратор честно вычислил в батче 3, до пользователя не доходили.
 */

import { describe, expect, it } from "vitest";

import { getResultStatusFilterKey } from "../src/lib/statusKeys";
import type { ComparisonResult } from "../src/comparators/types";
import { colorRecord, typographyRecord } from "./fixtures";

function colorResult(overrides: Partial<ComparisonResult>): ComparisonResult {
  return { ...colorRecord({ hex: "#3D6AFE" }), status: "layout-only", ...overrides };
}

function typographyResult(overrides: Partial<ComparisonResult>): ComparisonResult {
  return { ...typographyRecord({}), status: "layout-only", ...overrides };
}

describe("цвета", () => {
  it("paint-стиль важнее результата сравнения — его нельзя перепривязать автоматически", () => {
    expect(getResultStatusFilterKey(colorResult({ bindingType: "style", status: "value" }))).toBe(
      "style-binding"
    );
  });

  it("ручной цвет без совпадений получает свой ключ", () => {
    expect(
      getResultStatusFilterKey(colorResult({ bindingType: "hardcoded", status: "layout-only" }))
    ).toBe("hardcoded-no-analog");
  });

  it("ручной цвет с совпадением сохраняет статус сравнения", () => {
    expect(getResultStatusFilterKey(colorResult({ bindingType: "hardcoded", status: "value" }))).toBe(
      "value"
    );
  });

  it("переменная не из библиотеки сохраняет статус сравнения", () => {
    expect(
      getResultStatusFilterKey(colorResult({ bindingType: "variable", status: "conflict" }))
    ).toBe("conflict");
  });
});

describe("типографика", () => {
  it("стиль текста — это и есть токен, статус сравнения сохраняется", () => {
    expect(
      getResultStatusFilterKey(typographyResult({ bindingType: "style", status: "conflict" }))
    ).toBe("conflict");
  });

  it("разные расхождения дают разные ключи, а не один общий", () => {
    const keys = (["conflict", "name-match", "name-mismatch", "mixed-unresolved"] as const).map(
      (status) => getResultStatusFilterKey(typographyResult({ bindingType: "style", status }))
    );

    expect(new Set(keys).size).toBe(4);
  });

  it("ручная типографика без совпадений получает тот же ключ, что и цвет", () => {
    expect(
      getResultStatusFilterKey(typographyResult({ bindingType: "hardcoded", status: "layout-only" }))
    ).toBe("hardcoded-no-analog");
  });
});

describe("общее для обеих категорий", () => {
  it("битая ссылка на стиль важнее результата сравнения", () => {
    expect(getResultStatusFilterKey(colorResult({ bindingType: "ghost", status: "value" }))).toBe(
      "ghost-binding"
    );
    expect(
      getResultStatusFilterKey(typographyResult({ bindingType: "ghost", status: "conflict" }))
    ).toBe("ghost-binding");
  });
});
