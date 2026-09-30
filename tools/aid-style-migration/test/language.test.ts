/**
 * Язык продукта на реальных экранах образцов Driver (шаг 4): из трёх
 * экранов должны выйти правила, которые Principal Designer назвал в
 * спайке, а пробелы — стать `missing`.
 */

import { describe, expect, it } from "vitest";
import { LanguageLearner, mergeSources, upsertSource, type LanguageRule, type StyleLanguage } from "../src/core/language";
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
