/**
 * Применение типографики в макет — выбор начертания шрифта.
 *
 * Находка №6 аудита: начертание пересобиралось из числового веса
 * (`weightToFigmaStyle`), из-за чего терялся курсив и любое нестандартное
 * имя начертания. Курсив в значении для сравнения не хранится вовсе, поэтому
 * восстановить его из веса невозможно — его нужно брать с самого слоя.
 */

import { describe, expect, it } from "vitest";

import { resolveFontNameForApply } from "../src/lib/typographyApply";
import { typographyValue } from "./fixtures";

describe("то же семейство шрифта", () => {
  it("№6: курсив сохраняется", () => {
    const current: FontName = { family: "Inter", style: "Italic" };

    expect(resolveFontNameForApply(current, typographyValue({ fontFamily: "Inter" }))).toEqual(current);
  });

  it("№6: нестандартное имя начертания сохраняется", () => {
    const current: FontName = { family: "Inter", style: "Demi Bold" };

    expect(resolveFontNameForApply(current, typographyValue({ fontFamily: "Inter", fontWeight: 600 }))).toEqual(
      current
    );
  });

  it("семейство сравнивается без учёта регистра и пробелов", () => {
    const current: FontName = { family: " inter ", style: "Bold Italic" };

    expect(resolveFontNameForApply(current, typographyValue({ fontFamily: "Inter" }))).toEqual(current);
  });
});

describe("другое семейство шрифта", () => {
  it("начертание собирается из веса", () => {
    const current: FontName = { family: "Roboto", style: "Regular" };

    expect(resolveFontNameForApply(current, typographyValue({ fontFamily: "Inter", fontWeight: 600 }))).toEqual(
      { family: "Inter", style: "SemiBold" }
    );
  });

  it("курсив переносится на новое семейство", () => {
    const current: FontName = { family: "Roboto", style: "Bold Italic" };

    expect(resolveFontNameForApply(current, typographyValue({ fontFamily: "Inter", fontWeight: 700 }))).toEqual(
      { family: "Inter", style: "Bold Italic" }
    );
  });

  it("курсив обычного веса называется просто Italic", () => {
    const current: FontName = { family: "Roboto", style: "Italic" };

    expect(resolveFontNameForApply(current, typographyValue({ fontFamily: "Inter", fontWeight: 400 }))).toEqual(
      { family: "Inter", style: "Italic" }
    );
  });

  it("веса раскладываются по стандартным именам начертаний", () => {
    const current: FontName = { family: "Roboto", style: "Regular" };
    const styleFor = (fontWeight: number) =>
      resolveFontNameForApply(current, typographyValue({ fontFamily: "Inter", fontWeight })).style;

    expect(styleFor(300)).toBe("Light");
    expect(styleFor(400)).toBe("Regular");
    expect(styleFor(500)).toBe("Medium");
    expect(styleFor(600)).toBe("SemiBold");
    expect(styleFor(700)).toBe("Bold");
  });
});
