/**
 * Фон под PNG превью: светлая или тёмная шахматка.
 *
 * Экспорт слоя прозрачный там, где у слоя нет заливки, — белый текст без
 * подложки на светлой шахматке не виден. Фон выбирается по тому, насколько
 * читаемы непрозрачные пиксели снимка на каждой из шахматок.
 */

import { describe, expect, it } from "vitest";

import { contrastRatio, parseCssColor, pickPreviewBackdrop, type Rgb } from "../src/lib/previewBackdrop";

const WHITE: Rgb = { r: 255, g: 255, b: 255 };
const BLACK: Rgb = { r: 0, g: 0, b: 0 };

const backdrops = {
  light: [{ r: 255, g: 255, b: 255 }, { r: 238, g: 238, b: 238 }] as [Rgb, Rgb],
  dark: [{ r: 45, g: 44, b: 46 }, { r: 58, g: 57, b: 60 }] as [Rgb, Rgb],
};

/** RGBA-буфер: `ink` пикселей цвета `color` с непрозрачностью `alpha`, остальное прозрачно. */
function image(total: number, ink: number, color: Rgb, alpha = 255): Uint8ClampedArray {
  const data = new Uint8ClampedArray(total * 4);
  for (let i = 0; i < ink; i += 1) {
    data.set([color.r, color.g, color.b, alpha], i * 4);
  }
  return data;
}

describe("contrastRatio", () => {
  it("чёрный на белом — 21:1, одинаковые цвета — 1:1", () => {
    expect(contrastRatio(BLACK, WHITE)).toBeCloseTo(21, 1);
    expect(contrastRatio(WHITE, WHITE)).toBe(1);
  });
});

describe("pickPreviewBackdrop", () => {
  it("белый текст на прозрачном — тёмная шахматка (случай со скриншота)", () => {
    expect(pickPreviewBackdrop(image(1000, 150, WHITE), backdrops)).toBe("dark");
  });

  it("тёмный текст на прозрачном — остаётся светлая", () => {
    expect(pickPreviewBackdrop(image(1000, 150, { r: 45, g: 44, b: 46 }), backdrops)).toBe("light");
  });

  it("светло-серый текст, плохо читаемый на светлой шахматке, — тёмная", () => {
    expect(pickPreviewBackdrop(image(1000, 150, { r: 220, g: 220, b: 220 }), backdrops)).toBe("dark");
  });

  it("насыщенный акцентный цвет читается на светлой — остаётся светлая", () => {
    expect(pickPreviewBackdrop(image(1000, 150, { r: 61, g: 106, b: 254 }), backdrops)).toBe("light");
  });

  it("непрозрачный снимок (карточка с белой заливкой) — светлая: шахматки не видно", () => {
    expect(pickPreviewBackdrop(image(1000, 1000, WHITE), backdrops)).toBe("light");
  });

  it("полностью прозрачный снимок — светлая по умолчанию", () => {
    expect(pickPreviewBackdrop(image(1000, 0, WHITE), backdrops)).toBe("light");
  });

  it("полупрозрачные пиксели сглаживания не голосуют", () => {
    expect(pickPreviewBackdrop(image(1000, 150, WHITE, 60), backdrops)).toBe("light");
  });
});

describe("parseCssColor", () => {
  it.each([
    ["#eeeeee", { r: 238, g: 238, b: 238 }],
    ["  #FFF ", { r: 255, g: 255, b: 255 }],
    ["rgb(45, 44, 46)", { r: 45, g: 44, b: 46 }],
    ["rgba(45, 44, 46, 1)", { r: 45, g: 44, b: 46 }],
  ])("%s", (value, expected) => {
    expect(parseCssColor(value)).toEqual(expected);
  });

  it("нераспознанное значение — null", () => {
    expect(parseCssColor("var(--core-neutral-x-15)")).toBeNull();
    expect(parseCssColor("")).toBeNull();
  });
});
