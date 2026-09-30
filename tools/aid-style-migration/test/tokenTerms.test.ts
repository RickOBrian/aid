/**
 * Словарь продукта по поведению значений (2026-09-30): значения токенов
 * Driver в темах day / night — из библиотеки, прочитаны через Figma MCP.
 */

import { describe, expect, it } from "vitest";
import { conceptOf, learnTerms } from "../src/core/tokenTerms";

const driver = [
  ["Texts/Primary", "#00000087", "#ffffff"],
  ["Texts/Primary Inverted", "#ffffff", "#00000087"],
  ["Texts/Primary Light Ind", "#ffffff", "#ffffff"],
  ["Texts/Primary Dark Ind", "#00000087", "#00000087"],
  ["Icons/Primary", "#2d2c2e", "#ffffff"],
  ["Icons/Primary Inverted", "#ffffff", "#2d2c2e"],
  ["Icons/Primary Light Ind", "#ffffff", "#ffffff"],
  ["Icons/Primary Dark Ind", "#2d2c2e", "#2d2c2e"],
  ["Icons/Secondary", "#00000054", "#ffffff50"],
  ["Icons/Secondary Inverted", "#ffffff", "#00000054"],
  ["Icons/Secondary Light Ind", "#ffffff50", "#ffffff50"],
  ["Icons/Secondary Dark Ind", "#00000054", "#00000054"],
  ["Buttons/Positive", "#23ad58", "#23ad58"],
  ["Buttons/Positive Deep", "#0e8a3d", "#0e8a3d"],
].map(([name, hexLight, hexDark]) => ({ key: name, name, collection: "c", hexLight, hexDark }));

describe("словарь продукта", () => {
  const terms = learnTerms(driver);
  const find = (t: string) => terms.find((x) => x.term === t);

  it("Driver: «Inverted» — inverse, «Light Ind» — static-dm, «Dark Ind» — static-lm", () => {
    expect(find("Inverted")?.concept).toBe("inverse");
    expect(find("Light Ind")?.concept).toBe("static-dm");
    expect(find("Dark Ind")?.concept).toBe("static-lm");
    expect(find("Inverted")?.pairs).toHaveLength(3);
  });

  it("токен получает смысл по словарю", () => {
    expect(conceptOf("Texts/Primary Inverted", terms)?.concept).toBe("inverse");
    expect(conceptOf("Texts/Primary", terms)).toBeNull();
  });

  it("другой продукт, другое слово — тот же смысл по поведению", () => {
    const other = learnTerms([
      { key: "a", name: "text-primary", hexLight: "#111111", hexDark: "#eeeeee" },
      { key: "b", name: "text-primary-fixed", hexLight: "#111111", hexDark: "#111111" },
      { key: "c", name: "icon-primary", hexLight: "#222222", hexDark: "#dddddd" },
      { key: "d", name: "icon-primary-fixed", hexLight: "#222222", hexDark: "#222222" },
    ]);
    expect(other.find((x) => x.term === "fixed")?.concept).toBe("static-lm");
  });

  it("пара с основным, который сам не меняется с темой, не говорит о слове («Positive Deep»)", () => {
    expect(find("Deep")).toBeUndefined();
  });
});

describe("словарь в анкете", () => {
  it("вопрос-подтверждение на слово и пометка смысла у токена в объяснении", async () => {
    const { buildQuestions } = await import("../src/core/questions");
    const { LANGUAGE_SCHEMA } = await import("../src/core/language");
    const v = (name: string, count: number) => ({
      token: { key: name, name, collection: "c" }, hex: "#fff", count, light: count, dark: 0, examples: [], features: { place: { screen: count } }, labels: [],
    });
    const rule = { role: "text/on-color", layer: "text" as const, status: "disputed" as const, total: 10, values: [v("Texts/Primary Light Ind", 6), v("Texts/Primary Inverted", 4)], textStyles: [], textCases: [], radius: [], height: [] };
    const qs = buildQuestions({ $schema: LANGUAGE_SCHEMA, product: { id: "p", name: "П" }, updatedAt: "t", sources: [], rules: [rule], findings: [] }, driver);
    expect(qs.slice(0, 3).map((q) => q.id)).toEqual(["term:Inverted", "term:Light Ind", "term:Dark Ind"]);
    expect(qs[0].options[0].concept).toBe("inverse");
    const dispute = qs.find((q) => q.kind === "contradiction")!;
    expect(dispute.lines.join(" ")).toContain("Texts/Primary Light Ind (≈ static-dm)");
    expect(dispute.lines.join(" ")).toContain("Texts/Primary Inverted (≈ inverse)");
  });
});
