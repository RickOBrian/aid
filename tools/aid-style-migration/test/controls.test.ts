/**
 * Элементы управления (замечание Principal Designer, 2026-09-30): чекбокс
 * выбора тарифа опознавался как «третичная иконка». Устройство — как в
 * образцах Driver (MCP, чтение): фрейм `check_round` 24×24 с кругом
 * внутри, `close_round`, `switch` с `Checked=False`, фрейм «Switch / ON» с
 * бегунком-эллипсом.
 */

import { describe, expect, it } from "vitest";
import { LanguageLearner, mergeSources } from "../src/core/language";
import type { NNode, NPaint } from "../src/core/node";
import { buildQuestions } from "../src/core/questions";
import { detectRoles } from "../src/core/roles";
import { controlByName, controlState } from "../src/lib/controls";

const tok = (name: string, r: number, g: number, b: number, a = 1): NPaint => ({
  kind: "solid",
  color: { r, g, b, a },
  variable: { id: name, key: name, name, collection: "c", remote: true },
});
let seq = 0;
const node = (over: Partial<NNode>): NNode => ({ id: `c${seq++}`, name: "n", type: "FRAME", x: 0, y: 0, width: 10, height: 10, fills: [], strokes: [], strokeWeight: 0, radius: null, children: [], ...over });
const screen = (children: NNode[]) => node({ name: "s", width: 360, height: 720, fills: [tok("Bg/Primary", 1, 1, 1)], children });

/** Чекбокс как в образцах: фрейм check_round, внутри круг с галочкой (отмечен) или светлый круг (не отмечен). */
const check = (x: number, on: boolean): NNode =>
  node({
    name: "check_round",
    x,
    y: 124,
    width: 24,
    height: 24,
    component: { key: "check_round", name: on ? "Checked=True" : "Checked=False", setName: "check_round" },
    type: "INSTANCE",
    children: [node({ name: " Color", type: "VECTOR", x: x + 1, y: 125, width: 22, height: 22, fills: [on ? tok("Texts/Primary Inverted", 0.18, 0.17, 0.18) : tok("Icons/Inactive", 0.92, 0.93, 0.94)] })],
  });

describe("словарь элементов управления", () => {
  it("по именам: чекбокс, переключатель, кнопка-иконка; перекрёсток на карте — не крестик", () => {
    expect(controlByName("check_round")).toBe("check");
    expect(controlByName("Switch / ON")).toBe("switch");
    expect(controlByName("close_round")).toBe("icon-button");
    expect(controlByName("wilhelm_ic_maneuver_crossroad")).toBeNull();
    expect(controlByName("ticket")).toBeNull();
  });
  it("состояние из варианта и из имени", () => {
    expect(controlState("switch", "Checked=False, Active=True, Loading=False")).toBe("off");
    expect(controlState("Switch / ON")).toBe("on");
    expect(controlState("check_round")).toBeNull();
  });
});

describe("распознавание", () => {
  it("чекбокс выбора — не третичная иконка", () => {
    const hits = detectRoles(screen([check(138, true), check(308, false)])).hits;
    expect(hits.filter((h) => h.key === "control/check").map((h) => h.state)).toEqual(["on", "off"]);
    expect(hits.some((h) => h.key.startsWith("icon/"))).toBe(false);
    // круг внутри — фон чекбокса, а не отдельная «иконка чекбокса»
    expect(hits.some((h) => h.key === "control/check/icon")).toBe(false);
  });

  it("переключатель по форме: капсула с бегунком, бегунок — своя часть", () => {
    const sw = node({
      name: "content",
      x: 280,
      y: 540,
      width: 54,
      height: 32,
      radius: 16,
      fills: [tok("Controls/Accent", 0.5, 0.5, 0.52)],
      children: [node({ name: "Thumb", type: "ELLIPSE", x: 286, y: 546, width: 20, height: 20, fills: [tok("Controls/Thumb", 1, 1, 1)] })],
    });
    const keys = detectRoles(screen([sw])).hits.map((h) => h.key);
    expect(keys).toEqual(["screen-bg", "control/switch", "control/switch/thumb"]);
  });

  it("крестик close_round в алерте — кнопка-иконка", () => {
    const close = node({
      name: "close_round",
      type: "INSTANCE",
      x: 320,
      y: 60,
      width: 24,
      height: 24,
      component: { key: "close_round", name: "close_round", setName: "" },
      children: [node({ name: " Color", type: "VECTOR", x: 321, y: 61, width: 22, height: 22, fills: [tok("Icons/Inactive", 0.6, 0.6, 0.62)] })],
    });
    expect(detectRoles(screen([close])).hits.map((h) => h.key)).toContain("action-icon");
  });
});

describe("язык: разные цвета отмеченного и неотмеченного — не спор", () => {
  it("правило «по состоянию», вопроса нет", () => {
    const l = new LanguageLearner();
    for (let i = 0; i < 4; i++) l.add(screen([check(138, true), check(308, false)]), { screenId: `s${i}`, screenName: "Тарифы", dark: false });
    const lang = mergeSources({ id: "p", name: "П" }, [l.source("f", "t", 4)], "t");
    const rule = lang.rules.find((r) => r.role === "control/check");
    expect(rule?.status).toBe("proposed");
    expect(rule?.byState?.map((b) => b.state).sort()).toEqual(["off", "on"]);
    expect(buildQuestions(lang).some((q) => q.role === "control/check")).toBe(false);
  });
});

describe("чекбокс без варианта (отвязанный фрейм, как в выборе тарифа)", () => {
  it("состояние по виду: плотный круг — отмечен, бледный — нет", () => {
    const frame = (x: number, on: boolean) => ({ ...check(x, on), type: "FRAME", component: undefined });
    const hits = detectRoles(screen([frame(138, true), frame(308, false)])).hits.filter((h) => h.key === "control/check");
    expect(hits.map((h) => h.state)).toEqual(["on", "off"]);
  });
});
