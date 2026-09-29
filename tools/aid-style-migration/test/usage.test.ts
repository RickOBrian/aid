import { describe, expect, it } from "vitest";
import { fieldUse, fillUse, sample, visibleCase } from "../src/profile/usage";

const screen = { screenWidth: 390, screenHeight: 844 };

describe("место токена в образце", () => {
  it("текст, иконка, фон экрана, поверхность", () => {
    expect(fillUse({ ...screen, nodeType: "TEXT", width: 100, height: 20, insideSmallInstance: false })).toBe("text");
    expect(fillUse({ ...screen, nodeType: "VECTOR", width: 18, height: 18, insideSmallInstance: false })).toBe("icon");
    expect(fillUse({ ...screen, nodeType: "FRAME", width: 20, height: 20, insideSmallInstance: true })).toBe("icon");
    expect(fillUse({ ...screen, nodeType: "FRAME", width: 390, height: 844, insideSmallInstance: false })).toBe("background");
    expect(fillUse({ ...screen, nodeType: "FRAME", width: 358, height: 120, insideSmallInstance: false })).toBe("surface");
  });

  it("поля boundVariables", () => {
    expect(fieldUse("strokes")).toBe("stroke");
    expect(fieldUse("topLeftRadius")).toBe("radius");
    expect(fieldUse("paddingLeft")).toBe("padding");
    expect(fieldUse("itemSpacing")).toBe("gap");
    expect(fieldUse("width")).toBe("size");
    expect(fieldUse("opacity")).toBe("other");
  });
});

describe("регистр текста — как видит пользователь", () => {
  it("капс от стиля при строчной строке — это капс", () => {
    expect(visibleCase("продолжить", "UPPER")).toBe("upper");
  });
  it("по буквам", () => {
    expect(visibleCase("ПРОДОЛЖИТЬ", "ORIGINAL")).toBe("upper");
    expect(visibleCase("Продолжить заказ", "ORIGINAL")).toBe("sentence");
    expect(visibleCase("продолжить", "ORIGINAL")).toBe("lower");
    expect(visibleCase("Гарантия Выручки", "ORIGINAL")).toBe("title");
    expect(visibleCase("12:30", "ORIGINAL")).toBe("mixed");
  });
});

describe("выборка экранов", () => {
  it("равномерно по всему списку", () => {
    expect(sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)).toEqual([1, 3, 5, 7, 9]);
    expect(sample([1, 2], 5)).toEqual([1, 2]);
  });
});
