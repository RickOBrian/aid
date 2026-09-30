/**
 * Строение элемента (разбор спорных правил 2026-09-30, Principal Designer:
 * «это два разных компонента, которые и покрашены по-разному»): разница
 * по компоненту, месту внутри компонента или паре с соседними частями —
 * не спор; частично объяснённое снимается, спрашиваем про остаток.
 */

import { describe, expect, it } from "vitest";
import { checkExemplars } from "../src/core/exemplarQuality";
import { LanguageLearner, mergeSources } from "../src/core/language";
import type { NNode, NPaint } from "../src/core/node";
import { buildQuestions } from "../src/core/questions";
import { detectRoles } from "../src/core/roles";

const tok = (name: string, r: number, g: number, b: number): NPaint => ({
  kind: "solid",
  color: { r, g, b, a: 1 },
  variable: { id: name, key: name, name, collection: "c", remote: true },
});

let seq = 0;
function node(over: Partial<NNode>): NNode {
  return { id: `s${seq++}`, name: "n", type: "FRAME", x: 0, y: 0, width: 10, height: 10, fills: [], strokes: [], strokeWeight: 0, radius: null, children: [], ...over };
}

const text = (chars: string, paint: NPaint, x: number, y: number, w = 20): NNode =>
  node({ name: chars, type: "TEXT", x, y, width: w, height: 16, fills: [paint], text: { characters: chars, fontFamily: "Roboto", fontStyle: "Regular", fontSize: 14, textCase: "ORIGINAL", textDecoration: "NONE", align: "LEFT" } });

/** Чип-компонент с обводкой, иконкой-компонентом (≤ 32, не свой компонент) и подписью. */
function chip(name: string, stroke: NPaint, icon: NPaint, x: number, y: number): NNode {
  return node({
    name,
    type: "INSTANCE",
    x,
    y,
    width: 56,
    height: 32,
    radius: 8,
    strokes: [stroke],
    strokeWeight: 1,
    component: { key: name, name, setName: "" },
    children: [
      node({ name: "door", type: "INSTANCE", x: x + 4, y: y + 4, width: 24, height: 24, component: { key: "door", name: "door", setName: "" }, children: [node({ name: "🎨 Color", type: "VECTOR", x: x + 8, y: y + 6, width: 16, height: 20, fills: [icon] })] }),
      text("6", tok("Texts/Tertiary", 0.5, 0.5, 0.5), x + 32, y + 8),
    ],
  });
}

const screen = (children: NNode[]): NNode => node({ name: "screen", width: 360, height: 720, fills: [tok("Bg/Primary", 1, 1, 1)], children });

const accent = tok("Icons/Accent", 0.5, 0.2, 0.9);
const secondary = tok("Icons/Secondary", 0.45, 0.45, 0.5);
const informative = tok("Icons/Informative", 0.2, 0.5, 0.95);
const strokeP = tok("Strokes/Primary", 0.8, 0.8, 0.8);
const strokeS = tok("Strokes/Secondary", 0.85, 0.85, 0.85);
const strokeT = tok("Strokes/Tertiary", 0.9, 0.9, 0.9);

function learn(list: NNode[][]) {
  const l = new LanguageLearner();
  list.forEach((c, i) => l.add(screen(c), { screenId: `x${i}`, screenName: `Экран ${i}`, dark: false }));
  return mergeSources({ id: "p", name: "П" }, [l.source("f", "t", list.length)], "t");
}

describe("строение элемента", () => {
  it("иконка части знает место внутри компонента и пару с обводкой владельца", () => {
    const hit = detectRoles(screen([chip("small", strokeS, secondary, 16, 100)])).hits.find((h) => h.key === "chip/icon");
    expect(hit?.component).toBe("small");
    expect(hit?.slot).toBe("door/Color");
    expect(hit?.pair).toBe("— + Strokes/Secondary");
  });

  it("иконка чипа меняется вместе с его обводкой — два вида элемента, не спор", () => {
    const lang = learn([
      ...Array.from({ length: 6 }, () => [chip("reward", strokeP, accent, 16, 100)]),
      ...Array.from({ length: 5 }, () => [chip("small", strokeS, secondary, 16, 100)]),
      ...Array.from({ length: 4 }, () => [chip("small", strokeT, informative, 16, 100)]),
    ]);
    const rule = lang.rules.find((r) => r.role === "chip/icon")!;
    expect(rule.status).toBe("proposed");
    expect(rule.byPart?.feature).toBe("pair");
    expect(rule.byPart?.partial).toBe(false);
    expect(buildQuestions(lang).some((q) => q.role === "chip/icon")).toBe(false);
  });

  it("один компонент объясняет свою часть — вопрос только про остаток", () => {
    const lang = learn([
      ...Array.from({ length: 8 }, () => [chip("reward", strokeP, accent, 16, 100)]),
      ...Array.from({ length: 4 }, () => [chip("small", strokeS, secondary, 16, 100)]),
      ...Array.from({ length: 4 }, () => [chip("small", strokeS, informative, 16, 100)]),
    ]);
    const rule = lang.rules.find((r) => r.role === "chip/icon")!;
    expect(rule.status).toBe("disputed");
    expect(rule.byPart).toMatchObject({ feature: "component", partial: true });
    expect(rule.restTotal).toBe(8);
    const q = buildQuestions(lang).find((x) => x.role === "chip/icon")!;
    expect(q.values.map((v) => v.token?.name).sort()).toEqual(["Icons/Informative", "Icons/Secondary"]);
    expect(q.lines.some((l) => l.startsWith("Уже понятно (по признаку компонента): в «reward» — всегда Icons/Accent"))).toBe(true);
  });
});

describe("семейство токена — намерение автора", () => {
  it("пастельная иконка без слова статуса — декор, а не «ошибка»", () => {
    const hits = detectRoles(screen([node({ name: "baby_chair", type: "VECTOR", x: 20, y: 100, width: 24, height: 26, fills: [tok("Pastels/Rose", 0.95, 0.6, 0.65)] })])).hits;
    expect(hits.find((h) => h.nodeName === "baby_chair")?.key).toBe("icon/decor");
  });

  it("красная иконка токеном со словом статуса — статус", () => {
    const hits = detectRoles(screen([node({ name: "alert", type: "VECTOR", x: 20, y: 100, width: 24, height: 24, fills: [tok("Icons/Warning", 0.84, 0.14, 0.28)] })])).hits;
    expect(hits.find((h) => h.nodeName === "alert")?.key).toBe("icon/status-negative");
  });

  it("карточка, залитая токеном кнопки, — нажимаемая плитка", () => {
    const tile = node({ name: "info", x: 16, y: 100, width: 165, height: 96, radius: 12, fills: [tok("Buttons/Secondary", 0.95, 0.95, 0.96)], children: [text("Рейтинг", tok("Texts/Primary", 0, 0, 0), 28, 120, 80)] });
    const hits = detectRoles(screen([tile])).hits;
    expect(hits.find((h) => h.nodeName === "info")?.key).toBe("action-tile");
  });
});

describe("цвет из компонента — решение библиотеки", () => {
  it("бледная подпись, заданная в компоненте, остаётся в правиле; в ошибках — с пометкой «в компоненте»", () => {
    const card = () =>
      node({
        name: "info",
        type: "INSTANCE",
        x: 16,
        y: 100,
        width: 200,
        height: 80,
        radius: 12,
        fills: [tok("Bg/Primary", 1, 1, 1)],
        component: { key: "info", name: "info", setName: "" },
        // Единственная подпись — «основной текст», бледность не задумана.
        children: [text("Мотивация", tok("Texts/Faint", 0.9, 0.9, 0.9), 28, 120, 80)],
      });
    const lang = learn([[card()], [card()], [card()]]);
    expect(lang.rules.some((r) => r.values.some((v) => v.token?.name === "Texts/Faint"))).toBe(true);
    expect(lang.rules.some((r) => r.setAside?.some((v) => v.token?.name === "Texts/Faint"))).toBe(false);
    const issue = checkExemplars(lang.quality, []).find((i) => i.kind === "low-contrast");
    expect(issue?.library).toBe(true);
    expect(issue?.title.endsWith("(задано в компоненте)")).toBe(true);
  });
});

describe("фон экрана — слоем во весь экран", () => {
  it("у тёмного экрана без своей заливки текст — обычный, а не «на контрастном фоне»", () => {
    const dark = tok("Bg/Primary", 0.12, 0.12, 0.14);
    const s = node({ name: "screen", width: 360, height: 720, children: [
      node({ name: "bg", x: 0, y: 0, width: 360, height: 720, fills: [dark] }),
      text("Заказ", tok("Texts/Primary", 1, 1, 1), 16, 100, 80),
    ] });
    const hits = detectRoles(s).hits;
    expect(hits.find((h) => h.nodeName === "bg")?.key).toBe("screen-bg");
    expect(hits.find((h) => h.nodeName === "Заказ")?.key).toBe("text/primary");
  });
});

describe("на чём лежит", () => {
  it("белая подпись на голубой плашке и инверсная на тёмной кнопке — разные случаи, не спор", () => {
    const plate = (paint: NPaint, label: NPaint, y: number) =>
      node({ name: "plate", x: 16, y, width: 200, height: 100, radius: 12, fills: [paint], children: [text("Подпись", label, 28, y + 20, 80)] });
    const azure = tok("Pastels/Azure", 0.39, 0.53, 0.64);
    const darkBtn = tok("Buttons/Primary", 0.18, 0.17, 0.18);
    const lang = learn([
      ...Array.from({ length: 5 }, () => [plate(azure, tok("Texts/widget white", 1, 1, 1), 100)]),
      ...Array.from({ length: 5 }, () => [plate(darkBtn, tok("Texts/Primary Inverted", 1, 1, 1), 100)]),
    ]);
    const rule = lang.rules.find((r) => r.role === "text/on-color")!;
    expect(rule.status).toBe("proposed");
    expect(rule.byPart?.feature).toBe("under");
  });
});
