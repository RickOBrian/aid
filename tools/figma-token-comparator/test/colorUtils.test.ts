/**
 * Подпись цвета: HEX и прозрачность через тонкую точку, старое «@» из кэша
 * приводится к ней же.
 */

import { describe, expect, it } from "vitest";

import { formatColorValue, normalizeColorDisplayValue } from "../src/lib/colorUtils";

describe("formatColorValue", () => {
  it("непрозрачный — только HEX", () => {
    expect(formatColorValue("#2D6CDF", 1)).toBe("#2D6CDF");
  });

  it("полупрозрачный — HEX · процент", () => {
    expect(formatColorValue("#2D6CDF", 0.8)).toBe("#2D6CDF · 80%");
  });
});

describe("normalizeColorDisplayValue", () => {
  it("«@» из кэша до 1.5.0 → тонкая точка", () => {
    expect(normalizeColorDisplayValue("#2D6CDF @ 80%")).toBe("#2D6CDF · 80%");
  });

  it("остальное не трогает", () => {
    expect(normalizeColorDisplayValue("#2D6CDF")).toBe("#2D6CDF");
    expect(normalizeColorDisplayValue("#2D6CDF · 80%")).toBe("#2D6CDF · 80%");
    expect(normalizeColorDisplayValue("значение не получено (внешняя ссылка)")).toBe(
      "значение не получено (внешняя ссылка)"
    );
  });
});
