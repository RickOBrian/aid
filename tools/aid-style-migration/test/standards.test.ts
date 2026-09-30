/**
 * Стандарты ДС как ориентир (решение Principal Designer, 2026-09-30):
 * роль → слот стандарта только там, где гайд говорит прямо; сверка находит
 * статичный токен в роли, которая меняется с темой, и имена не по нотации.
 */

import { describe, expect, it } from "vitest";
import { LANGUAGE_SCHEMA, type LanguageRule, type StyleLanguage } from "../src/core/language";
import { buildQuestions } from "../src/core/questions";
import { compareWithStandards, slotFor, STANDARDS } from "../src/standards/standards";

function rule(role: string, token: string, layer: LanguageRule["layer"] = "text"): LanguageRule {
  return {
    role,
    layer,
    status: "proposed",
    total: 10,
    values: [{ token: { key: token, name: token, collection: "c" }, hex: "#000000", count: 10, light: 5, dark: 5, examples: [], features: {}, labels: [] }],
    textStyles: [],
    textCases: [],
    radius: [],
    height: [],
  };
}

function lang(rules: LanguageRule[]): StyleLanguage {
  return { $schema: LANGUAGE_SCHEMA, product: { id: "p", name: "П" }, updatedAt: "t", sources: [], rules, findings: [] };
}

describe("стандарты как ориентир", () => {
  it("читает машинный слой с версиями", () => {
    expect(STANDARDS.map((s) => s.id)).toContain("semantic-color-tokens-guide");
    expect(STANDARDS.every((s) => /^\d+\.\d+\.\d+$/.test(s.version))).toBe(true);
  });

  it("ссылка → text-accent по прямой строке гайда; третичный текст стандарт не описывает", () => {
    expect(slotFor("link")?.slot).toBe("text-accent");
    expect(slotFor("link")?.use).toBe("Акцентный текст и ссылки");
    expect(slotFor("text/on-color")?.slot).toBe("text-inverse");
    expect(slotFor("text/tertiary")).toBeNull();
  });

  it("пробел «ссылка» получает подсказку стандарта и кандидата с «accent» выше", () => {
    const tokens = [
      { key: "1", name: "Texts/Primary", collection: "c" },
      { key: "2", name: "Texts/Accent", collection: "c" },
    ];
    const [q] = buildQuestions(lang([{ ...rule("link", "x"), status: "missing", total: 0, values: [] }]), tokens);
    expect(q.lines.join(" ")).toContain("По стандарту ДС: text-accent");
    expect(q.options[0].label).toBe("Texts/Accent");
  });

  it("статичный токен в основном тексте — риск; в тексте на цвете — нет", () => {
    const tokens = [
      { key: "Texts/Primary Light Ind", name: "Texts/Primary Light Ind", hexLight: "#FFFFFF", hexDark: "#FFFFFF" },
      { key: "Texts/Primary", name: "Texts/Primary", hexLight: "#000000", hexDark: "#FFFFFF" },
    ];
    const risky = compareWithStandards(lang([rule("text/primary", "Texts/Primary Light Ind")]), tokens);
    expect(risky.filter((f) => f.kind === "static-in-themed-role")).toHaveLength(1);
    const fine = compareWithStandards(lang([rule("text/on-color", "Texts/Primary Light Ind"), rule("text/secondary", "Texts/Primary")]), tokens);
    expect(fine.filter((f) => f.kind === "static-in-themed-role")).toHaveLength(0);
  });

  it("имена не по нотации — одно сводное отличие", () => {
    const tokens = [{ key: "Texts/Primary", name: "Texts/Primary" }, { key: "t2", name: "text-primary" }];
    const f = compareWithStandards(lang([rule("text/primary", "Texts/Primary"), rule("text/secondary", "t2")]), tokens);
    const n = f.find((x) => x.kind === "naming");
    expect(n?.title).toBe("Имена токенов не по нотации стандарта: 1");
  });
});
