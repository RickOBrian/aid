/**
 * Ошибки в образцах (2026-09-30): значения токенов — как в библиотеке
 * Driver (day / night), прочитаны через Figma MCP.
 */

import { describe, expect, it } from "vitest";
import { checkExemplars } from "../src/core/exemplarQuality";
import { LanguageLearner, mergeSources } from "../src/core/language";
import { buildQuestions } from "../src/core/questions";
import type { NNode, NPaint } from "../src/core/node";

const tokens = [
  { key: "Bg/Primary", name: "Bg/Primary", hexLight: "#ffffff", hexDark: "#1f1f23" },
  { key: "Buttons/Positive", name: "Buttons/Positive", hexLight: "#23ad58", hexDark: "#23ad58" },
  { key: "Texts/Primary", name: "Texts/Primary", hexLight: "#000000de", hexDark: "#ffffff" },
  { key: "Texts/Primary Inverted", name: "Texts/Primary Inverted", hexLight: "#ffffff", hexDark: "#000000de" },
  { key: "Texts/Primary Light Ind", name: "Texts/Primary Light Ind", hexLight: "#ffffff", hexDark: "#ffffff" },
  { key: "Texts/Primary Dark Ind", name: "Texts/Primary Dark Ind", hexLight: "#000000de", hexDark: "#000000de" },
  { key: "Icons/Warning", name: "Icons/Warning", hexLight: "#d62347", hexDark: "#d62347" },
];

const tok = (name: string, r: number, g: number, b: number, a = 1): NPaint => ({
  kind: "solid",
  color: { r, g, b, a },
  variable: { id: name, key: name, name, collection: "c", remote: true },
});
let seq = 0;
const node = (over: Partial<NNode>): NNode => ({ id: `q${seq++}`, name: "n", type: "FRAME", x: 0, y: 0, width: 10, height: 10, fills: [], strokes: [], strokeWeight: 0, radius: null, children: [], ...over });
const text = (chars: string, paint: NPaint, x: number, y: number): NNode =>
  node({ name: chars, type: "TEXT", x, y, width: 120, height: 24, fills: [paint], text: { characters: chars, fontFamily: "Roboto", fontStyle: "Medium", fontSize: 18, textCase: "ORIGINAL", textDecoration: "NONE", align: "CENTER" } });

function screen(label: NPaint, extra: NNode[] = []): NNode {
  const button = node({ name: "button", type: "INSTANCE", x: 16, y: 640, width: 328, height: 56, radius: 12, fills: [tok("Buttons/Positive", 0.14, 0.68, 0.35)], children: [text("Принять", label, 120, 656)] });
  return node({ name: "s", width: 360, height: 720, fills: [tok("Bg/Primary", 1, 1, 1)], children: [...extra, button] });
}

function learn(screens: NNode[], withTokens = false) {
  const l = new LanguageLearner(withTokens ? tokens : []);
  screens.forEach((s, i) => l.add(s, { screenId: `s${i}`, screenName: `Экран ${i}`, dark: false }));
  return mergeSources({ id: "p", name: "П" }, [l.source("f", "t", screens.length)], "t");
}

describe("ошибки в образцах", () => {
  it("подпись Inverted на зелёной кнопке: в тёмной теме подпись поменяет цвет, а плашка — нет", () => {
    const lang = learn([screen(tok("Texts/Primary Inverted", 1, 1, 1))]);
    const issues = checkExemplars(lang.quality, tokens);
    const other = issues.find((i) => i.kind === "other-theme");
    expect(other?.title).toBe("Texts/Primary Inverted на Buttons/Positive: в тёмной теме подпись поменяет цвет, а плашка — нет");
    expect(other?.examples[0].screenName).toBe("Экран 0");
  });

  it("подпись Light Ind (не меняется с темой) на той же кнопке — не ошибка", () => {
    const lang = learn([screen(tok("Texts/Primary Light Ind", 1, 1, 1))]);
    expect(checkExemplars(lang.quality, tokens).some((i) => i.kind === "other-theme")).toBe(false);
  });

  it("статичный тёмный текст на фоне экрана, который меняется с темой, — в тёмной теме не читается", () => {
    const t = text("Заголовок", tok("Texts/Primary Dark Ind", 0, 0, 0, 0.87), 16, 100);
    const lang = learn([screen(tok("Texts/Primary Light Ind", 1, 1, 1), [t])]);
    const other = checkExemplars(lang.quality, tokens).find((i) => i.title.startsWith("Texts/Primary Dark Ind"));
    expect(other?.title).toBe("Texts/Primary Dark Ind на Bg/Primary: в тёмной теме не читается");
    expect(other?.level).toBe("risk");
  });

  it("текст, покрашенный токеном иконок, среди обычного текста — чужое семейство", () => {
    const body = Array.from({ length: 25 }, (_, i) => text(`Строка ${i}`, tok("Texts/Primary", 0, 0, 0, 0.87), 16, 60 + i * 20));
    const odd = text("Отменить", tok("Icons/Warning", 0.84, 0.14, 0.28), 16, 600);
    const lang = learn([screen(tok("Texts/Primary Light Ind", 1, 1, 1), [...body, odd])]);
    const fam = checkExemplars(lang.quality, tokens).find((i) => i.kind === "family");
    expect(fam?.title).toBe("Текст покрасили Icons/Warning");
  });

  it("цвет без токена, нарисованный вручную, — сомнение", () => {
    const raw = text("Сырой", { kind: "solid", color: { r: 0.1, g: 0.1, b: 0.1, a: 1 } }, 16, 100);
    const lang = learn([screen(tok("Texts/Primary Light Ind", 1, 1, 1), [raw])]);
    expect(checkExemplars(lang.quality, tokens).some((i) => i.kind === "raw" && i.title === "Цвет без токена: #1A1A1A")).toBe(true);
  });
});

describe("шум проверки", () => {
  it("бледный плейсхолдер (≤ 40 %) и цвет, совпадающий с плашкой, — не ошибки", () => {
    const faint = text("Сообщение", tok("Texts/Tertiary", 0, 0, 0, 0.14), 16, 100);
    const same = text("Невидимка", tok("Bg/Primary", 1, 1, 1), 16, 140);
    const lang = learn([screen(tok("Texts/Primary Light Ind", 1, 1, 1), [faint, same])]);
    expect(checkExemplars(lang.quality, tokens).filter((i) => i.kind === "low-contrast")).toEqual([]);
  });
});

describe("тёмное на тёмном", () => {
  it("статичная тёмная иконка на тёмном экране образца — плохо читается (разные токены, контраст ~1,1)", () => {
    const dark = node({ name: "s", width: 360, height: 720, fills: [tok("Bg/Primary", 0.12, 0.12, 0.14)], children: [
      node({ name: "chevron", type: "VECTOR", x: 300, y: 100, width: 12, height: 12, fills: [tok("Icons/Secondary Dark Ind", 0, 0, 0, 0.54)] }),
    ] });
    const l = new LanguageLearner();
    l.add(dark, { screenId: "d", screenName: "Тёмный", dark: true });
    const lang = mergeSources({ id: "p", name: "П" }, [l.source("f", "t", 1)], "t");
    expect(checkExemplars(lang.quality, tokens).some((i) => i.kind === "low-contrast" && i.title.startsWith("Плохо читается: Icons/Secondary Dark Ind"))).toBe(true);
  });
});

describe("похожее на ошибку — не в правило", () => {
  const inverted = () => screen(tok("Texts/Primary Inverted", 1, 1, 1));
  const lightInd = () => screen(tok("Texts/Primary Light Ind", 1, 1, 1));

  it("Inverted на зелёной кнопке в меньшинстве — отложено, правило по остальным, спора нет", () => {
    const lang = learn([lightInd(), lightInd(), lightInd(), lightInd(), inverted()], true);
    const rule = lang.rules.find((r) => r.setAside?.length);
    expect(rule?.values.map((v) => v.token?.name)).toEqual(["Texts/Primary Light Ind"]);
    expect(rule?.total).toBe(4);
    expect(rule?.setAside?.[0]).toMatchObject({ reason: "other-theme", count: 1 });
    expect(rule?.status).toBe("proposed");
    // Проверка ошибок по-прежнему показывает это место.
    expect(checkExemplars(lang.quality, tokens).some((i) => i.kind === "other-theme")).toBe(true);
  });

  it("без токенов библиотеки тему не проверить — случай остаётся в правиле", () => {
    const lang = learn([lightInd(), lightInd(), lightInd(), lightInd(), inverted()]);
    expect(lang.rules.some((r) => r.setAside?.length)).toBe(false);
  });

  it("похожих на ошибку большинство — это вариант продукта: в правиле, анкета просит проверить", () => {
    const lang = learn([inverted(), inverted(), inverted(), lightInd()], true);
    const rule = lang.rules.find((r) => r.suspectKept);
    expect(rule?.suspectKept).toBe(3);
    expect(rule?.values[0].token?.name).toBe("Texts/Primary Inverted");
    expect(rule?.setAside).toBeUndefined();
  });

  it("анкета называет отложенное", () => {
    // 2 варианта подписи поровну — спор; плюс 1 Inverted — отложен.
    const darkInd = () => screen(tok("Texts/Primary Dark Ind", 0, 0, 0, 0.87));
    const lang = learn([lightInd(), lightInd(), lightInd(), darkInd(), darkInd(), darkInd(), inverted()], true);
    const q = buildQuestions(lang).find((x) => x.kind === "contradiction" && x.role.endsWith("/label"));
    expect(q?.lines.some((l) => l.startsWith("Не учтено 1 раз — похоже на ошибку сборки образца: Texts/Primary Inverted"))).toBe(true);
  });

  it("чужое семейство среди обычного текста той же роли — в сторону", () => {
    const body = Array.from({ length: 25 }, (_, i) => text(`Строка ${i}`, tok("Texts/Primary", 0, 0, 0, 0.87), 16, 60 + i * 20));
    const odd = text("Строка", tok("Icons/Primary", 0, 0, 0, 0.87), 16, 600);
    const lang = learn([screen(tok("Texts/Primary Light Ind", 1, 1, 1), [...body, odd])]);
    const rule = lang.rules.find((r) => r.role === "text/primary")!;
    expect(rule.values.map((v) => v.token?.name)).toEqual(["Texts/Primary"]);
    expect(rule.setAside?.[0]).toMatchObject({ reason: "family", count: 1 });
  });

  it("чужое семейство — единственный способ в своей роли: остаётся, но помечено", () => {
    const body = Array.from({ length: 25 }, (_, i) => text(`Строка ${i}`, tok("Texts/Primary", 0, 0, 0, 0.87), 16, 60 + i * 20));
    const odd = text("Отменить", tok("Icons/Warning", 0.84, 0.14, 0.28), 16, 600);
    const lang = learn([screen(tok("Texts/Primary Light Ind", 1, 1, 1), [...body, odd])]);
    const rule = lang.rules.find((r) => r.values.some((v) => v.token?.name === "Icons/Warning"));
    expect(rule?.suspectKept).toBe(1);
  });
});
