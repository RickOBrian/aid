/**
 * Нормализация типографики: line height, letter spacing, сравнение свойств.
 *
 * Здесь же живут заготовки под находки №5 и №6 аудита — обе про то, что
 * числовой вес шрифта выводится из имени начертания и обратно, теряя
 * информацию.
 */

import { describe, expect, it } from "vitest";

import {
  allTypographyPropertiesMatch,
  criticalTypographyMatches,
  diffTypographyProperties,
  normalizeLineHeightFromPlugin,
  normalizeLineHeightFromRest,
  normalizeStyleName,
  normalizeTextCase,
  normalizeTextDecoration,
  readTypographyComparisonValue,
  readTypographyFromRestTypeStyle,
  readTypographyFromTextStyle,
  typographyValueKey,
  typographyValuesEqual,
} from "../src/lib/typographyUtils";
import { typographyValue } from "./fixtures";

/** TextStyle из Plugin API: у него нет числового веса, только имя начертания. */
function textStyle(styleName: string): TextStyle {
  return {
    fontName: { family: "Inter", style: styleName },
    fontSize: 14,
    lineHeight: { unit: "PIXELS", value: 20 },
    letterSpacing: { unit: "PIXELS", value: 0 },
    textCase: "ORIGINAL",
    textDecoration: "NONE",
  } as unknown as TextStyle;
}

describe("line height из REST", () => {
  it("PIXELS берётся как есть", () => {
    expect(normalizeLineHeightFromRest({ lineHeightUnit: "PIXELS", lineHeightPx: 24 }, 16)).toEqual({
      lineHeight: 24,
    });
  });

  it("FONT_SIZE_% считается от размера шрифта", () => {
    expect(
      normalizeLineHeightFromRest(
        { lineHeightUnit: "FONT_SIZE_%", lineHeightPercentFontSize: 150 },
        16
      )
    ).toEqual({ lineHeight: 24 });
  });

  it("INTRINSIC_% помечается приблизительным", () => {
    const result = normalizeLineHeightFromRest({ lineHeightUnit: "INTRINSIC_%" }, 10);

    expect(result.approximate).toBe(true);
    expect(result.lineHeight).toBeCloseTo(12);
  });

  it("без единицы и без значения — приблизительная оценка, а не падение", () => {
    const result = normalizeLineHeightFromRest({}, 10);

    expect(result.approximate).toBe(true);
    expect(Number.isFinite(result.lineHeight)).toBe(true);
  });
});

describe("line height из Plugin API", () => {
  it("PERCENT переводится в пиксели", () => {
    expect(normalizeLineHeightFromPlugin({ unit: "PERCENT", value: 150 }, 16)).toEqual({
      lineHeight: 24,
    });
  });

  it("AUTO помечается приблизительным", () => {
    expect(normalizeLineHeightFromPlugin({ unit: "AUTO" }, 10).approximate).toBe(true);
  });
});

describe("нормализация перечислений", () => {
  it("неизвестный textCase схлопывается в ORIGINAL", () => {
    expect(normalizeTextCase("ЧТО-ТО")).toBe("ORIGINAL");
    expect(normalizeTextCase(undefined)).toBe("ORIGINAL");
    expect(normalizeTextCase("upper")).toBe("UPPER");
  });

  it("неизвестный textDecoration схлопывается в NONE", () => {
    expect(normalizeTextDecoration("wavy")).toBe("NONE");
    expect(normalizeTextDecoration("underline")).toBe("UNDERLINE");
  });

  it("имя стиля сравнивается без учёта регистра и пробелов по краям", () => {
    expect(normalizeStyleName("  Body/M  ")).toBe(normalizeStyleName("body/m"));
  });
});

describe("сравнение значений", () => {
  it("критичными считаются размер и межстрочный интервал", () => {
    const base = typographyValue();

    expect(criticalTypographyMatches(base, typographyValue({ letterSpacing: 2 }))).toBe(true);
    expect(criticalTypographyMatches(base, typographyValue({ fontSize: 18 }))).toBe(false);
    expect(criticalTypographyMatches(base, typographyValue({ lineHeight: 28 }))).toBe(false);
  });

  it("полное совпадение требует всех свойств", () => {
    const base = typographyValue();

    expect(allTypographyPropertiesMatch(base, typographyValue())).toBe(true);
    expect(allTypographyPropertiesMatch(base, typographyValue({ textCase: "UPPER" }))).toBe(false);
    expect(allTypographyPropertiesMatch(base, typographyValue({ fontFamily: "Roboto" }))).toBe(false);
  });

  it("семейство шрифта сравнивается без учёта регистра", () => {
    expect(
      allTypographyPropertiesMatch(typographyValue({ fontFamily: "inter" }), typographyValue())
    ).toBe(true);
  });

  it("диф перечисляет все расхождения, размер шрифта первым", () => {
    const diff = diffTypographyProperties(
      typographyValue(),
      typographyValue({ fontSize: 18, textCase: "UPPER" })
    );

    expect(diff[0]).toBe("fontSize");
    expect(diff).toContain("textCase");
  });

  it("мелкая погрешность в числах не считается расхождением", () => {
    expect(diffTypographyProperties(typographyValue(), typographyValue({ fontSize: 14.005 }))).toHaveLength(
      0
    );
  });

  it("ключ значения одинаков для эквивалентных значений", () => {
    expect(typographyValuesEqual(typographyValue(), typographyValue())).toBe(true);
    expect(typographyValueKey(typographyValue())).toContain("inter");
  });

  it("приблизительный line height делает значения неравными", () => {
    expect(
      typographyValuesEqual(typographyValue(), typographyValue({ lineHeightApproximate: true }))
    ).toBe(false);
  });
});

describe("чтение значения из произвольного объекта", () => {
  it("возвращает null, если нет критичных полей", () => {
    expect(readTypographyComparisonValue({})).toBeNull();
    expect(readTypographyComparisonValue({ fontFamily: "Inter", fontSize: 14 })).toBeNull();
  });

  it("недостающие некритичные поля заполняются значениями по умолчанию", () => {
    const value = readTypographyComparisonValue({
      fontFamily: "Inter",
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 20,
    });

    expect(value?.letterSpacing).toBe(0);
    expect(value?.textCase).toBe("ORIGINAL");
    expect(value?.textDecoration).toBe("NONE");
  });
});

describe("чтение стиля из REST", () => {
  it("вес берётся из ответа API как число, без угадывания", () => {
    const value = readTypographyFromRestTypeStyle({
      fontFamily: "Inter",
      fontWeight: 600,
      fontSize: 14,
      lineHeightUnit: "PIXELS",
      lineHeightPx: 20,
    });

    expect(value?.fontWeight).toBe(600);
    expect(value?.fontWeightApproximate).toBeUndefined();
  });

  it("без обязательных полей возвращается null", () => {
    expect(readTypographyFromRestTypeStyle({ fontFamily: "Inter" })).toBeNull();
  });
});

describe("чтение стиля через Plugin API", () => {
  it("вес помечается приблизительным — он выведен из имени начертания", () => {
    expect(readTypographyFromTextStyle(textStyle("Regular")).fontWeightApproximate).toBe(true);
  });

  it("стандартные имена начертаний распознаются верно", () => {
    expect(readTypographyFromTextStyle(textStyle("Regular")).fontWeight).toBe(400);
    expect(readTypographyFromTextStyle(textStyle("Medium")).fontWeight).toBe(500);
    expect(readTypographyFromTextStyle(textStyle("SemiBold")).fontWeight).toBe(600);
    expect(readTypographyFromTextStyle(textStyle("Bold")).fontWeight).toBe(700);
  });

  // Находка №5 аудита, первая половина: нестандартные имена начертаний
  // распознавались неверно — «Demi Bold» попадал под проверку на «bold».
  it("№5: нестандартные имена начертаний распознаются верно", () => {
    const weight = (styleName: string) => readTypographyFromTextStyle(textStyle(styleName)).fontWeight;

    expect(weight("Demi Bold")).toBe(600);
    expect(weight("DemiBold")).toBe(600);
    expect(weight("Heavy")).toBe(900);
    expect(weight("Black")).toBe(900);
    expect(weight("Ultra Light")).toBe(200);
    expect(weight("ExtraBold")).toBe(800);
    expect(weight("Thin")).toBe(100);
    expect(weight("Book")).toBe(400);
  });

  it("№5: курсив не меняет распознанный вес", () => {
    const weight = (styleName: string) => readTypographyFromTextStyle(textStyle(styleName)).fontWeight;

    expect(weight("Italic")).toBe(400);
    expect(weight("Bold Italic")).toBe(700);
    expect(weight("SemiBold Italic")).toBe(600);
  });
});

describe("сравнение с приблизительным весом", () => {
  // Находка №5 аудита, вторая половина: флаг fontWeightApproximate ставился,
  // но при сравнении не учитывался — выведенный из имени вес сравнивался
  // строго, и любое несовпадение давало ложное «переопределение».
  it("№5: приблизительный вес не создаёт расхождения", () => {
    const fromNode = typographyValue({ fontWeight: 600 });
    const fromStyle = typographyValue({ fontWeight: 700, fontWeightApproximate: true });

    expect(typographyValuesEqual(fromNode, fromStyle)).toBe(true);
  });

  it("точные веса по-прежнему сравниваются строго", () => {
    expect(
      typographyValuesEqual(typographyValue({ fontWeight: 600 }), typographyValue({ fontWeight: 700 }))
    ).toBe(false);
  });

  it("приблизительный вес не маскирует расхождение в других свойствах", () => {
    const fromNode = typographyValue({ fontWeight: 600, fontSize: 18 });
    const fromStyle = typographyValue({ fontWeight: 700, fontWeightApproximate: true });

    expect(typographyValuesEqual(fromNode, fromStyle)).toBe(false);
  });
});
