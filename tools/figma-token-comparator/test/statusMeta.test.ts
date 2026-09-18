/**
 * Находка №24: тексты статусов в таблице типографики говорили о цвете.
 *
 * Строка типографики без стиля и без аналога получала бейдж «Цвет вручную»,
 * а подсказки «Совпало значение» и «Конфликт значений» объясняли расхождение
 * цвета. Ключи статусов общие для обеих категорий, а тексты — нет.
 */

import { describe, expect, it } from "vitest";

import { getStatusMeta } from "../src/lib/statusMeta";
import type { StatusFilterKey } from "../src/lib/statusKeys";

const ALL_KEYS: StatusFilterKey[] = [
  "exact",
  "mapped",
  "value",
  "name-match",
  "name-match-unresolved",
  "conflict",
  "approximate",
  "name-mismatch",
  "mixed-unresolved",
  "layout-only",
  "style-binding",
  "ghost-binding",
  "hardcoded-no-analog",
];

/** Ключи, которые реально возникают в таблице типографики. */
const TYPOGRAPHY_KEYS: StatusFilterKey[] = [
  "exact",
  "mapped",
  "value",
  "name-match",
  "conflict",
  "name-mismatch",
  "mixed-unresolved",
  "layout-only",
  "ghost-binding",
  "hardcoded-no-analog",
];

describe("getStatusMeta", () => {
  it("у цветов текст ручного значения прежний", () => {
    expect(getStatusMeta("hardcoded-no-analog", "colors").label).toBe("Цвет вручную");
  });

  it("у типографики ручное значение не называется цветом", () => {
    expect(getStatusMeta("hardcoded-no-analog", "typography").label).not.toMatch(/цвет/i);
  });

  it.each(TYPOGRAPHY_KEYS)("типографика, %s: ни название, ни подсказка не говорят о цвете", (key) => {
    const meta = getStatusMeta(key, "typography");
    expect(meta.label).not.toMatch(/цвет/i);
    expect(meta.hint).not.toMatch(/цвет|оттен/i);
  });

  it.each(ALL_KEYS)("%s: тональность одна для обеих категорий — цвет бейджа означает срочность", (key) => {
    expect(getStatusMeta(key, "typography").tone).toBe(getStatusMeta(key, "colors").tone);
  });
});
