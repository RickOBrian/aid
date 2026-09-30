/**
 * Анкета (шаг 5): вопросы из языка продукта объясняют спор текстом и
 * находят признак, от которого он зависит; ответы становятся решениями.
 */

import { describe, expect, it } from "vitest";
import { LANGUAGE_SCHEMA, type LanguageRule, type RuleValue, type StyleLanguage } from "../src/core/language";
import { applyAnswers, buildQuestions, findSplit, isOpen } from "../src/core/questions";
import { THEME_ROLES } from "../src/lib/vocabulary";

function value(name: string, count: number, place: Record<string, number>, labels: string[], extra: Partial<RuleValue> = {}): RuleValue {
  return {
    token: { key: name, name, collection: "c" },
    hex: "#000000",
    count,
    light: count,
    dark: 0,
    examples: [],
    features: { place, theme: { [THEME_ROLES.light]: count } },
    labels,
    ...extra,
  };
}

function rule(role: string, status: LanguageRule["status"], values: RuleValue[]): LanguageRule {
  return {
    role,
    layer: "fill",
    status,
    total: values.reduce((s, v) => s + v.count, 0),
    values,
    textStyles: [],
    textCases: [],
    radius: [],
    height: [],
  };
}

function lang(rules: LanguageRule[]): StyleLanguage {
  return { $schema: LANGUAGE_SCHEMA, product: { id: "p", name: "П" }, updatedAt: "t", sources: [], rules };
}

const green = value("Buttons/Positive", 82, { sheet: 80, modal: 2 }, ["Принять заказ", "Повторить попытку"]);
const dark = value("Buttons/Primary", 25, { modal: 24, sheet: 1 }, ["Понятно"]);

describe("спор", () => {
  it("находит признак: зависит от места", () => {
    const split = findSplit([green, dark]);
    expect(split?.feature).toBe("place");
    expect(split?.map).toEqual({ sheet: 0, modal: 1 });
  });

  it("объясняет текстом и предлагает «зависит от места» первым вариантом", () => {
    const [q] = buildQuestions(lang([rule("action-main", "disputed", [green, dark])]));
    expect(q.kind).toBe("contradiction");
    expect(q.title).toContain("Главное действие");
    const text = q.lines.join("\n");
    expect(text).toContain("Buttons/Positive — 82 раза (77 %): в шторке; «Принять заказ», «Повторить попытку»");
    expect(text).toContain("Похоже, зависит от места: в шторке — Buttons/Positive; в модалке — Buttons/Primary.");
    expect(q.options[0].kind).toBe("split");
    expect(q.options.filter((o) => o.kind === "value")).toHaveLength(2);
  });

  it("если признак не разделяет — так и говорит", () => {
    const a = value("A", 10, { sheet: 5, modal: 5 }, []);
    const b = value("B", 8, { sheet: 4, modal: 4 }, []);
    const [q] = buildQuestions(lang([rule("action-primary", "disputed", [a, b])]));
    expect(q.options[0].kind).toBe("value");
    expect(q.lines.join(" ")).toContain("не объясняют разницу");
  });
});

describe("пробел и отступление", () => {
  it("пробел: кандидаты по семейству имени и подсказке роли", () => {
    const tokens = [
      { key: "1", name: "Texts/Primary", collection: "c" },
      { key: "2", name: "Texts/Link", collection: "c" },
      { key: "3", name: "Bg/Primary", collection: "c" },
    ];
    const qs = buildQuestions(lang([{ ...rule("link", "missing", []), layer: "text" }]), tokens);
    expect(qs[0].kind).toBe("gap");
    expect(qs[0].options.map((o) => o.label)).toEqual([
      "Texts/Link",
      "Texts/Primary",
      "В продукте не используется — не переводить в эту роль",
      "Нужен новый токен — в предложения библиотеке",
    ]);
  });

  it("отступление: редкое значение рядом с правилом", () => {
    const main = value("Bg/Primary", 40, { screen: 40 }, []);
    const raw = { ...value("x", 2, { screen: 2 }, []), token: null, hex: "#18181b" };
    const [q] = buildQuestions(lang([rule("screen-bg", "proposed", [main, raw])]));
    expect(q.kind).toBe("outlier");
    expect(q.lines.join("\n")).toContain("#18181b без токена — 2 раза");
  });
});

describe("ответы", () => {
  it("ответ → правило подтверждено с решением; вопрос закрыт", () => {
    const l = lang([rule("action-main", "disputed", [green, dark])]);
    const qs = buildQuestions(l);
    const answers = { [qs[0].id]: { questionId: qs[0].id, optionId: "split:place", answeredAt: "t" } };
    const r = applyAnswers(l, qs, answers).rules[0];
    expect(r.status).toBe("confirmed");
    expect(r.decision?.split?.map.sheet.token?.name).toBe("Buttons/Positive");
    expect(isOpen(qs[0], answers)).toBe(false);
  });

  it("ответ на исчезнувший вариант не применяется — вопрос снова открыт", () => {
    const l = lang([rule("action-main", "disputed", [green, dark])]);
    const qs = buildQuestions(l);
    const answers = { [qs[0].id]: { questionId: qs[0].id, optionId: "value:t:нет-такого", answeredAt: "t" } };
    expect(applyAnswers(l, qs, answers).rules[0].status).toBe("disputed");
    expect(isOpen(qs[0], answers)).toBe(true);
  });
});
