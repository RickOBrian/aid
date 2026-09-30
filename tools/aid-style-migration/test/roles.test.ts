/**
 * Роли на реальных экранах (фикстуры выгружены через Figma MCP):
 * вход Flot — исходник; три экрана образцов Driver — светлый и тёмные.
 */

import { describe, expect, it } from "vitest";
import { contrast, detectRoles } from "../src/core/roles";
import { loadFixture } from "./fixtureNode";

function keys(fixture: string): Array<[string, string, string]> {
  return detectRoles(loadFixture(fixture)).hits.map((h) => [h.nodeName, h.key, h.paint.variable?.name ?? "raw"]);
}

function roleOf(fixture: string, token: string): string[] {
  return keys(fixture)
    .filter(([, , v]) => v === token)
    .map(([, k]) => k);
}

describe("образцы Driver: роли дают правила продукта", () => {
  it("главное действие шторки — во всю ширину снизу — Buttons/Positive, подпись — Texts/Primary Light Ind", () => {
    for (const f of ["driver-error-sheet", "driver-order-offer"]) {
      expect(roleOf(f, "Buttons/Positive")).toEqual(["action-main"]);
      expect(roleOf(f, "Texts/Primary Light Ind")).toEqual(["action-main/label"]);
    }
  });

  it("кнопка в модалке — обычная, Buttons/Primary; подпись — Texts/Primary Inverted", () => {
    expect(roleOf("driver-cancel-modal", "Buttons/Primary")).toEqual(["action-primary"]);
    expect(roleOf("driver-cancel-modal", "Texts/Primary Inverted")).toEqual(["action-primary/label"]);
  });

  it("таймер внутри главной кнопки — деталь, а не её заливка", () => {
    expect(roleOf("driver-order-offer", "Buttons/Positive Deep")).toEqual(["action-main/part"]);
  });

  it("оверлей, модалка, шторка, ручка шторки", () => {
    expect(roleOf("driver-cancel-modal", "Bg/Overlay")).toEqual(["overlay"]);
    expect(keys("driver-cancel-modal").find(([n]) => n === "Modal")?.[1]).toBe("modal");
    expect(keys("driver-error-sheet").find(([n]) => n === "BS-order")?.[1]).toBe("sheet");
    expect(roleOf("driver-error-sheet", "Buttons/Secondary")).toEqual(["handle"]);
  });

  it("вторичный текст — secondary и в светлой (чёрный 29 %), и в тёмной теме", () => {
    expect(roleOf("driver-cancel-modal", "Texts/Secondary")).toEqual(["text/secondary"]);
    expect(roleOf("driver-error-sheet", "Texts/Secondary")).toEqual(["text/secondary"]);
    expect(roleOf("driver-cancel-modal", "Texts/Primary")).toContain("text/primary");
  });

  it("фиолетовый — иконки-акценты в чипах, не кнопки", () => {
    expect(new Set(roleOf("driver-order-offer", "Icons/Accent"))).toEqual(new Set(["chip/icon"]));
  });

  it("системное (статус-бар) и картинки карты не читаются", () => {
    const r = detectRoles(loadFixture("driver-order-offer"));
    expect(r.skipped.system).toBe(1);
    expect(r.skipped.media).toBe(1);
  });
});

describe("исходник Flot: те же роли", () => {
  const k = keys("flot-login");
  const find = (name: string, token: string) => k.find(([n, , v]) => n === name && v === token)?.[1];

  it("«Войти» — обычная кнопка, «Вход по позывному» — неактивная", () => {
    expect(find("Button", "tx-control/purple/bg/idle")).toBe("action-primary");
    expect(k.filter(([, key]) => key === "action-disabled")).toHaveLength(1);
  });

  it("поле ввода — не кнопка", () => {
    expect(k.find(([n, key]) => n === "Input" && key.startsWith("input"))?.[1]).toBe("input/stroke");
    expect(k.some(([, key]) => key.startsWith("action-secondary"))).toBe(false);
  });

  it("«Регистрация» — ссылка; «Заполнить» в оранжевой карточке — статус-предупреждение; карточка — тинт", () => {
    expect(find("Регистрация", "tx-accent/purple/bg")).toBe("link");
    expect(find("Commission Text", "tx-accent/orange/bg")).toBe("text/status-warning");
    expect(find("Commission Section", "tx-accent/orange/tint")).toBe("card-tint/warning");
  });

  it("серая иконка чата — вторичная, не основная", () => {
    expect(find("Union", "tx-accent/grey/secondary")).toBe("icon/secondary");
  });

  it("заголовок «Вход» — основной текст; клавиатура и статус-бар — системные", () => {
    expect(find("Вход", "tx-accent/grey/primary")).toBe("text/primary");
    expect(detectRoles(loadFixture("flot-login")).skipped.system).toBe(2);
  });
});

describe("контраст", () => {
  it("прозрачный передний план сначала ложится на поверхность", () => {
    const white = { r: 1, g: 1, b: 1, a: 1 };
    expect(contrast({ r: 0, g: 0, b: 0, a: 1 }, white)).toBeCloseTo(21, 0);
    expect(contrast({ r: 0, g: 0, b: 0, a: 0 }, white)).toBeCloseTo(1, 5);
  });
});

describe("что внутри экрана не читается", () => {
  it("целиком за границей экрана — не читается; слой «comment» внутри — читается", () => {
    const screen = loadFixture("driver-cancel-modal");
    const text = (id: string, name: string, x: number) => ({
      id, name, type: "TEXT", x, y: 100, width: 100, height: 20,
      fills: [{ kind: "solid" as const, color: { r: 0, g: 0, b: 0, a: 1 } }],
      strokes: [], strokeWeight: 0, radius: null,
      text: { characters: name, fontFamily: "Roboto", fontStyle: "Regular", fontSize: 14, textCase: "ORIGINAL", textDecoration: "NONE", align: "LEFT" },
      children: [],
    });
    screen.children.push(text("out", "Выноска", 400), text("in", "comment", 20));
    const ids = detectRoles(screen).hits.map((h) => h.nodeId);
    expect(ids).not.toContain("out");
    expect(ids).toContain("in");
  });
});
