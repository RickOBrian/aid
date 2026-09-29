import { describe, expect, it } from "vitest";
import { hueFamily, isNeutral, lightness, toHex, type Rgba } from "../src/map/color";
import { brandFamily, mapColors, roleFit, sourceMeaning } from "../src/map/palette";
import { meaningFromName, scopeAllows, usesFromName } from "../src/map/roles";
import { mapScale, monotoneAssign } from "../src/map/scale";
import type { SourceColor, TargetColor } from "../src/map/types";

const hex = (h: string, a = 1): Rgba => ({
  r: parseInt(h.slice(1, 3), 16) / 255,
  g: parseInt(h.slice(3, 5), 16) / 255,
  b: parseInt(h.slice(5, 7), 16) / 255,
  a,
});

function src(id: string, use: SourceColor["use"], color: string, count = 10, dark: string | null = null): SourceColor {
  return { id, key: id, label: color, origin: "", use, light: hex(color), dark: dark ? hex(dark) : null, count, inInstances: 0, examples: [] };
}

function tgt(name: string, light: string, dark: string, scopes: string[] = []): TargetColor {
  return { key: name, name, scopes, light: hex(light), dark: hex(dark), usage: null };
}

describe("цвет", () => {
  it("hex, нейтральность, оттенок, светлота", () => {
    expect(toHex(hex("#7B4DFF"))).toBe("#7B4DFF");
    expect(isNeutral(hex("#8A8F99"))).toBe(true);
    expect(isNeutral(hex("#7B4DFF"))).toBe(false);
    expect(hueFamily(hex("#7B4DFF"))).toBe("purple");
    expect(hueFamily(hex("#2F80ED"))).toBe("blue");
    expect(hueFamily(hex("#27AE60"))).toBe("green");
    expect(lightness(hex("#000000"))).toBeLessThan(lightness(hex("#8A8F99")));
  });
});

describe("роль токена", () => {
  it("по имени: смысл и место", () => {
    expect(meaningFromName("Buttons/Accent")).toBe("accent");
    expect(meaningFromName("Texts/Negative")).toBe("negative");
    expect(meaningFromName("Bg/Primary")).toBe("neutral");
    expect(usesFromName("Texts/Secondary")).toEqual(["text"]);
    expect(usesFromName("Strokes/Primary")).toEqual(["stroke"]);
    expect(usesFromName("Pastels/Slate")).toEqual([]);
  });
  it("scopes — жёсткое правило", () => {
    expect(scopeAllows(["TEXT_FILL"], "surface")).toBe(false);
    expect(scopeAllows(["TEXT_FILL"], "text")).toBe(true);
    expect(scopeAllows([], "stroke")).toBe(true);
    expect(roleFit(tgt("Texts/Primary", "#000000", "#FFFFFF", ["TEXT_FILL"]), "background")).toBe(0);
  });
  it("образцы весят больше имени", () => {
    const t = { ...tgt("Pastels/Slate", "#DFE7F5", "#4C525C"), usage: { surface: 9, text: 1 } };
    expect(roleFit(t, "surface")).toBeGreaterThan(roleFit(t, "text"));
  });
});

describe("смысл цветов исходника", () => {
  const sources = [src("p", "surface", "#A73AFD", 300), src("r", "text", "#E53935", 5), src("b", "text", "#2F80ED", 8)];
  it("бренд — самое частое хроматическое", () => {
    expect(brandFamily(sources)).toBe("purple");
  });
  it("бренд → акцент, красный → ошибка, синий не бренд → инфо", () => {
    expect(sourceMeaning(hex("#A73AFD"), "purple")).toBe("accent");
    expect(sourceMeaning(hex("#E53935"), "purple")).toBe("negative");
    expect(sourceMeaning(hex("#2F80ED"), "purple")).toBe("info");
    expect(sourceMeaning(hex("#2F80ED"), "blue")).toBe("accent");
  });
});

describe("перевод цветов по роли, а не по значению", () => {
  const targets = [
    tgt("Texts/Primary", "#1C1B1F", "#F2F2F2"),
    tgt("Texts/Secondary", "#6B6B6B", "#A0A0A0"),
    tgt("Texts/Tertiary", "#9E9E9E", "#707070"),
    tgt("Bg/Primary", "#FFFFFF", "#121212"),
    tgt("Bg/Secondary", "#F5F5F5", "#1E1E1E"),
    tgt("Buttons/Accent", "#21A038", "#2DBE4E"),
    tgt("Texts/Negative", "#D62347", "#F85973"),
  ];

  it("иерархия серых текста сохраняется, даже если серые другие", () => {
    const proposals = mapColors(
      [src("t1", "text", "#303030", 100), src("t2", "text", "#8A8F99", 60), src("t3", "text", "#C4C4C4", 20)],
      targets,
    );
    const pick = (id: string) => proposals.find((p) => p.sourceId === id)?.target?.name;
    expect(pick("t1")).toBe("Texts/Primary");
    expect(pick("t2")).toBe("Texts/Secondary");
    expect(pick("t3")).toBe("Texts/Tertiary");
  });

  it("фиолетовый бренд исходника → зелёный акцент продукта: роль важнее значения", () => {
    const proposals = mapColors([src("cta", "surface", "#A73AFD", 200), src("page", "background", "#FFFFFF", 50)], targets);
    expect(proposals.find((p) => p.sourceId === "cta")?.target?.name).toBe("Buttons/Accent");
    expect(proposals.find((p) => p.sourceId === "page")?.target?.name).toBe("Bg/Primary");
  });

  it("красный текст → негативный текст", () => {
    const proposals = mapColors([src("brand", "surface", "#A73AFD", 200), src("err", "text", "#FF3B30", 4)], targets);
    expect(proposals.find((p) => p.sourceId === "err")?.target?.name).toBe("Texts/Negative");
  });

  it("нет токенов для места — предложение пустое и неуверенное", () => {
    const proposals = mapColors([src("x", "stroke", "#E0E0E0")], [tgt("Texts/Primary", "#000000", "#FFFFFF", ["TEXT_FILL"])]);
    expect(proposals[0].target).toBeNull();
    expect(proposals[0].confidence).toBe("low");
  });
});

describe("шкалы с сохранением порядка", () => {
  it("монотонно: больше не становится меньше", () => {
    const out = monotoneAssign(3, 3, (i, j) => (i === 0 && j === 2 ? 0 : 1));
    expect(out).toEqual([...out].sort((a, b) => a - b));
  });

  it("радиусы исходника на шкалу продукта: 8/14/24 → 8/12/16 или близко, порядок цел", () => {
    const tokens = [2, 4, 6, 8, 10, 12, 14, 16, 20, 24];
    const out = mapScale(
      [
        { value: 8, weight: 10 },
        { value: 14, weight: 5 },
        { value: 24, weight: 3 },
      ],
      tokens,
    ).map((i) => tokens[i]);
    expect(out).toEqual([8, 14, 24]);
  });

  it("ступеней у исходника больше — соседние сливаются, порядок сохраняется", () => {
    const tokens = [4, 8, 16];
    const out = mapScale(
      [3, 5, 7, 9, 15, 17].map((value) => ({ value, weight: 1 })),
      tokens,
    ).map((i) => tokens[i]);
    expect(out).toEqual([...out].sort((a, b) => a - b));
    expect(out[0]).toBe(4);
    expect(out[5]).toBe(16);
  });
});

import { mapTexts, weightOf } from "../src/map/typography";
import { mapValues } from "../src/map/values";
import type { SourceText, TargetText } from "../src/map/types";

function st(id: string, size: number, style: string, count = 10, visibleCase: SourceText["visibleCase"] = "sentence"): SourceText {
  return { id, label: id, fontFamily: "SF Pro", fontStyle: style, weight: weightOf(style), size, lineHeight: null, visibleCase, count, examples: [] };
}
function tt(name: string, size: number, style: string, uses = 5, textCase = "ORIGINAL"): TargetText {
  return { key: name, name, fontFamily: "Roboto", weight: weightOf(style), size, lineHeight: null, textCase, uses };
}

describe("иерархия текста", () => {
  it("вес по начертанию", () => {
    expect(weightOf("SemiBold")).toBe(600);
    expect(weightOf("ExtraBold")).toBe(800);
    expect(weightOf("Bold")).toBe(700);
    expect(weightOf("Regular")).toBe(400);
  });

  const product = [tt("Headline 1", 44, "Medium"), tt("Headline 3", 30, "Bold"), tt("Title 1", 20, "SemiBold"), tt("Body 1", 18, "Regular"), tt("Body 2", 16, "Regular"), tt("Caption 1", 12, "SemiBold")];

  it("Title 34 и Title 30 не сливаются, если в продукте есть ступени", () => {
    const out = mapTexts([st("t1", 34, "Bold"), st("t2", 30, "Bold"), st("b", 17, "Regular")], product);
    const pick = (id: string) => out.find((p) => p.sourceId === id)!.target!.name;
    expect(pick("t1")).not.toBe(pick("t2"));
    expect(pick("b")).toBe("Body 1");
  });

  it("порядок уровней сохраняется", () => {
    const sizes = [44, 34, 30, 24, 17, 15, 12];
    const out = mapTexts(sizes.map((s, i) => st(`s${i}`, s, "Regular")), product);
    const targetSizes = sizes.map((_, i) => product.find((p) => p.key === out.find((o) => o.sourceId === `s${i}`)!.target!.key)!.size);
    expect(targetSizes).toEqual([...targetSizes].sort((a, b) => b - a));
  });

  it("капс исходника без капса у стиля продукта — сигнал, а не молчание", () => {
    const out = mapTexts([st("btn", 15, "SemiBold", 40, "upper")], product);
    expect(out[0].reasons.join(" ")).toContain("капс");
  });

  it("редкий уровень помечен как возможная случайность", () => {
    const out = mapTexts([st("rare", 13, "Regular", 1)], product);
    expect(out[0].reasons.join(" ")).toContain("случайность");
  });
});

describe("радиусы и отступы", () => {
  it("точное — уверенно, неточное — с пояснением, порядок цел", () => {
    const tokens = [
      { key: "r8", name: "radius-8", value: 8 },
      { key: "r12", name: "radius-12", value: 12 },
      { key: "r16", name: "radius-16", value: 16 },
    ];
    const out = mapValues(
      [
        { id: "a", value: 8, count: 30, examples: [] },
        { id: "b", value: 14, count: 5, examples: [] },
      ],
      tokens,
      "радиусы",
    );
    expect(out[0]).toMatchObject({ confidence: "high", target: { name: "radius-8" } });
    expect(out[1].reasons[0]).toContain("14 →");
  });
});

describe("иерархия текста на данных Flot Tasks", () => {
  const product = [tt("Title Price", 62, "Medium"), tt("Headline 1", 44, "Medium"), tt("Headline 3", 30, "Bold"), tt("Title Large", 24, "Medium"), tt("Body 1", 18, "Regular")];
  it("крупный кегль не растёт из-за единичного соседа", () => {
    const out = mapTexts([st("black48", 48, "Black", 7), st("bold34", 34, "Bold", 1), st("sb24", 24, "SemiBold", 107)], product);
    const pick = (id: string) => out.find((p) => p.sourceId === id)!.target!.name;
    expect(pick("black48")).toBe("Headline 1");
    expect(pick("sb24")).toBe("Title Large");
  });
});
