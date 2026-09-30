/**
 * Язык продукта на реальных экранах образцов Driver (шаг 4): из трёх
 * экранов должны выйти правила, которые Principal Designer назвал в
 * спайке, а пробелы — стать `missing`.
 */

import { describe, expect, it } from "vitest";
import { LanguageLearner, mergeSources, upsertSource, type LanguageRule, type StyleLanguage } from "../src/core/language";
import type { NNode } from "../src/core/node";
import { loadFixture } from "./fixtureNode";

const SCREENS: Array<[string, boolean]> = [
  ["driver-cancel-modal", false],
  ["driver-error-sheet", true],
  ["driver-order-offer", true],
];

function learn(screens = SCREENS, fileName = "образцы") {
  const learner = new LanguageLearner();
  for (const [name, dark] of screens) learner.add(loadFixture(name), { screenId: name, screenName: name, dark });
  return learner.source(fileName, "2026-09-30", screens.length);
}

function language(): StyleLanguage {
  return mergeSources({ id: "p", name: "Продукт" }, [learn()], "2026-09-30");
}

function rule(lang: StyleLanguage, role: string): LanguageRule {
  const r = lang.rules.find((x) => x.role === role);
  if (!r) throw new Error(`нет правила ${role}`);
  return r;
}

describe("язык продукта из образцов", () => {
  it("главное действие → Buttons/Positive, подпись → Texts/Primary Light Ind, одинаково в тёмной теме", () => {
    const lang = language();
    const main = rule(lang, "action-main");
    expect(main.status).toBe("proposed");
    expect(main.values[0].token?.name).toBe("Buttons/Positive");
    expect(main.values[0].dark).toBe(2);
    expect(rule(lang, "action-main/label").values[0].token?.name).toBe("Texts/Primary Light Ind");
    expect(main.height[0].value).toBe(64);
  });

  it("обычная кнопка → Buttons/Primary, подпись → Texts/Primary Inverted, радиус 12", () => {
    const lang = language();
    const primary = rule(lang, "action-primary");
    expect(primary.values[0].token?.name).toBe("Buttons/Primary");
    expect(primary.radius[0].value).toBe(12);
    expect(rule(lang, "action-primary/label").values[0].token?.name).toBe("Texts/Primary Inverted");
  });

  it("пробелы образцов — missing: ссылки, поля, табы", () => {
    const lang = language();
    for (const role of ["link", "input", "tab/indicator"]) expect(rule(lang, role).status).toBe("missing");
    // чип в образцах только с обводкой — не пробел
    expect(lang.rules.some((r) => r.role === "chip" && r.status === "missing")).toBe(false);
  });

  it("примеры ведут к экранам", () => {
    const ex = rule(language(), "action-main").values[0].examples;
    expect(ex.map((e) => e.screenId).sort()).toEqual(["driver-error-sheet", "driver-order-offer"]);
  });

  it("повторное изучение файла заменяет его вклад, другие файлы складываются", () => {
    let sources = upsertSource([], learn());
    sources = upsertSource(sources, learn());
    expect(sources).toHaveLength(1);
    sources = upsertSource(sources, learn([["driver-error-sheet", true]], "ещё образцы"));
    const lang = mergeSources({ id: "p", name: "Продукт" }, sources, "2026-09-30");
    expect(rule(lang, "action-main").total).toBe(3);
    expect(lang.sources.map((s) => s.fileName)).toEqual(["образцы", "ещё образцы"]);
  });

  it("роль с разными значениями без явного большинства — disputed", () => {
    const lang = language();
    const disputed = lang.rules.filter((r) => r.status === "disputed");
    for (const r of disputed) expect(r.values.length).toBeGreaterThan(1);
  });
});

describe("иконка на цветном круге", () => {
  it("своя роль icon/on-color — Icons/Primary Inverted в обеих темах, без спора во вторичных иконках", () => {
    const lang = language();
    const r = rule(lang, "icon/on-color");
    expect(r.status).toBe("proposed");
    expect(r.values[0].token?.name).toBe("Icons/Primary Inverted");
    expect(r.values[0].light).toBe(1);
    expect(r.values[0].dark).toBe(1);
    expect(rule(lang, "icon/secondary").status).toBe("proposed");
  });
});

describe("цвет темы — самый частый, а не первый встреченный", () => {
  const variable = { id: "T", key: "T", name: "Texts/Primary", collection: "c", remote: true };
  const text = (id: string, color: { r: number; g: number; b: number }, x = 20, y = 100) => ({
    id, name: id, type: "TEXT", x, y, width: 100, height: 20,
    fills: [{ kind: "solid" as const, color: { ...color, a: 1 }, variable }],
    strokes: [], strokeWeight: 0, radius: null,
    text: { characters: "Текст", fontFamily: "Roboto", fontStyle: "Regular", fontSize: 16, textCase: "ORIGINAL", textDecoration: "NONE", align: "LEFT" },
    children: [],
  });
  const screen = (id: string, children: NNode[]): NNode => ({
    id, name: id, type: "FRAME", x: 0, y: 0, width: 360, height: 720,
    fills: [{ kind: "solid", color: { r: 0.12, g: 0.12, b: 0.14, a: 1 } }],
    strokes: [], strokeWeight: 0, radius: null, children,
  });
  it("на тёмных экранах белый дважды и серый один раз — показываем белый", () => {
    const learner = new LanguageLearner();
    learner.add(screen("s1", [text("w1", { r: 1, g: 1, b: 1 })]), { screenId: "s1", screenName: "s1", dark: true });
    learner.add(screen("s2", [text("w2", { r: 1, g: 1, b: 1 })]), { screenId: "s2", screenName: "s2", dark: true });
    // Третий случай — тот же токен, но другой цвет (например, экран в другом режиме).
    // Чёрный на тёмном не подходит: нечитаемое откладывается как ошибка образца.
    learner.add(screen("s3", [text("gray", { r: 0.7, g: 0.7, b: 0.7 })]), { screenId: "s3", screenName: "s3", dark: true });
    const lang = mergeSources({ id: "p", name: "П" }, [learner.source("f", "t", 3)], "t");
    const v = lang.rules.find((r) => r.role === "text/primary")?.values[0];
    expect(v?.count).toBe(3);
    expect(v?.hexDark).toBe("#FFFFFF");
    expect(v?.surfaceDark).toBe("#1F1F24");
  });
});

describe("текст на цветной плитке — своя роль", () => {
  it("белая надпись на насыщенном круге — text/on-color, не основной текст", () => {
    const screen = loadFixture("driver-cancel-modal");
    const circle = screen.children[2].children[0].children[0].children[0].children[0];
    circle.children.push({
      id: "on", name: "on", type: "TEXT", x: 150, y: 270, width: 60, height: 20,
      fills: [{ kind: "solid", color: { r: 1, g: 1, b: 1, a: 1 } }], strokes: [], strokeWeight: 0, radius: null,
      text: { characters: "Меню", fontFamily: "Roboto", fontStyle: "Regular", fontSize: 14, textCase: "ORIGINAL", textDecoration: "NONE", align: "CENTER" },
      children: [],
    });
    const learner = new LanguageLearner();
    learner.add(screen, { screenId: "s", screenName: "s", dark: false });
    const lang = mergeSources({ id: "p", name: "П" }, [learner.source("f", "t", 1)], "t");
    expect(lang.rules.find((r) => r.role === "text/on-color")?.total).toBe(1);
  });
});
