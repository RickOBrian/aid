/**
 * Ошибки восприятия из аудита на 190 экранах образцов Driver
 * (`docs/audit-analytics-2026-09-30.md`) — на настоящих экранах,
 * выгруженных через Figma MCP только на чтение.
 */

import { describe, expect, it } from "vitest";
import type { NNode } from "../src/core/node";
import { detectRoles, type RoleHit } from "../src/core/roles";
import { loadFixture } from "./fixtureNode";

function hits(name: string): RoleHit[] {
  return detectRoles(loadFixture(name)).hits;
}

function keysOf(list: RoleHit[], nodeName: string): string[] {
  return list.filter((h) => h.nodeName === nodeName).map((h) => h.key);
}

describe("предложение заказа (4102:3267)", () => {
  const list = hits("driver-offer-basic");

  it("нижняя панель «Меню / Предзаказы» под шторкой не видна — не читается", () => {
    expect(keysOf(list, "bar/button")).toEqual([]);
    expect(list.some((h) => h.key === "card")).toBe(false);
  });

  it("объекты карты (знаки, метки) не учатся, кнопки над картой — учатся", () => {
    expect(keysOf(list, " Color background")).toEqual([]);
    expect(keysOf(list, "pin_order")).toEqual([]);
    expect(list.filter((h) => h.key === "action-floating").length).toBeGreaterThanOrEqual(3);
    expect(keysOf(list, "floating")[0]).toMatch(/^action-/);
  });

  it("главное действие и шторка — как раньше", () => {
    expect(keysOf(list, "full")).toEqual(["action-main"]);
    expect(list.find((h) => h.key === "sheet")?.paint.variable?.name).toBe("Bg/Primary");
  });
});

describe("выбор маршрута (4102:3505)", () => {
  const list = hits("driver-route-overflow");

  it("варианты маршрута — строки списка, не поля ввода", () => {
    expect(list.some((h) => h.key.startsWith("input"))).toBe(false);
    expect(keysOf(list, "Selection Control").filter((k) => k === "row").length).toBeGreaterThanOrEqual(5);
  });

  it("метки на карте под шторкой не читаются и не становятся разрушительной кнопкой", () => {
    expect(list.some((h) => h.key.startsWith("action-destructive"))).toBe(false);
    expect(keysOf(list, "pin_long_tail")).toEqual([]);
  });

  it("ручка шторки — ручка", () => {
    expect(keysOf(list, "hand")).toEqual(["handle"]);
  });
});

describe("чат с ошибкой (4102:5378)", () => {
  const list = hits("driver-chat-error");

  it("заголовок «Чат с клиентом» — заголовок, не кнопка; название — основной текст", () => {
    expect(keysOf(list, "header/center")).toEqual(["header"]);
    expect(keysOf(list, "Чат с клиентом")).toEqual(["text/primary"]);
  });

  it("пузыри сообщений — пузыри, время в них — метка", () => {
    expect(list.filter((h) => h.key === "bubble").length).toBeGreaterThanOrEqual(1);
    expect(list.some((h) => h.key === "bubble/meta")).toBe(true);
    expect(list.some((h) => (h.nodeName === "Right" || h.nodeName === "bubble") && h.key.startsWith("action-"))).toBe(false);
  });

  it("первая шторка, закрытая второй, не читается", () => {
    const shown = list.filter((h) => h.nodeName === "✏️ Text here" && h.key === "bubble/label");
    expect(shown.length).toBe(1);
  });

  it("быстрые ответы — второстепенные кнопки с обводкой", () => {
    expect(keysOf(list, "default").every((k) => k === "action-secondary" || k === "action-secondary/stroke")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Формы, которых в выгруженных экранах нет поверх медиа
// ---------------------------------------------------------------------------

let seq = 0;
function node(over: Partial<NNode>): NNode {
  return { id: `s${seq++}`, name: "n", type: "FRAME", x: 0, y: 0, width: 10, height: 10, fills: [], strokes: [], strokeWeight: 0, radius: null, children: [], ...over };
}
const solid = (r: number, g: number, b: number) => ({ kind: "solid" as const, color: { r, g, b, a: 1 } });
const label = (chars: string, x: number, y: number, w: number, h: number): NNode =>
  node({
    name: chars,
    type: "TEXT",
    x,
    y,
    width: w,
    height: h,
    fills: [solid(1, 1, 1)],
    text: { characters: chars, fontFamily: "Roboto", fontStyle: "Medium", fontSize: 14, textCase: "ORIGINAL", textDecoration: "NONE", align: "CENTER" },
  });

describe("формы", () => {
  it("кружок 20×20 с цифрой — бейдж, не чип", () => {
    const badge = node({ name: "Counter", type: "INSTANCE", x: 100, y: 100, width: 20, height: 20, radius: 9999, fills: [solid(0.84, 0.14, 0.28)], children: [label("2", 106, 102, 8, 16)] });
    const screen = node({ name: "s", width: 360, height: 720, fills: [solid(1, 1, 1)], children: [badge] });
    const keys = detectRoles(screen).hits.map((h) => h.key);
    expect(keys).toContain("badge");
    expect(keys).toContain("badge/label");
    expect(keys.some((k) => k.startsWith("chip"))).toBe(false);
  });

  it("полоска 107×4 по центру у верха шторки — ручка, не индикатор таба", () => {
    const sheet = node({
      name: "sheet",
      x: 0,
      y: 300,
      width: 360,
      height: 420,
      fills: [solid(1, 1, 1)],
      children: [node({ name: "hand", type: "RECTANGLE", x: 126, y: 308, width: 107, height: 4, radius: 2, fills: [solid(0.9, 0.9, 0.9)] })],
    });
    const screen = node({ name: "s", width: 360, height: 720, fills: [solid(0.95, 0.95, 0.95)], children: [sheet] });
    const keys = detectRoles(screen).hits.map((h) => h.key);
    expect(keys).toContain("handle");
    expect(keys).not.toContain("tab/indicator");
  });

  it("белая надпись на тёмной плитке светлого экрана — текст на контрастном фоне", () => {
    const tile = node({ name: "tile", x: 16, y: 600, width: 328, height: 80, radius: 20, fills: [solid(0.18, 0.17, 0.18)], children: [label("Меню", 28, 650, 96, 16)] });
    const screen = node({ name: "s", width: 360, height: 720, fills: [solid(1, 1, 1)], children: [tile] });
    expect(detectRoles(screen).hits.find((h) => h.nodeName === "Меню")?.key).toBe("text/on-color");
  });
});
