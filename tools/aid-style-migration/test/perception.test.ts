/**
 * Восприятие элементов (замечание Principal Designer, 2026-09-30): элемент —
 * это компонент и его вариант; разные варианты окрашены по-разному законно,
 * куски компонента — не роли, цвет внутри библиотечного компонента без
 * токена — находка для библиотеки, а не вопрос дизайнеру.
 */

import { describe, expect, it } from "vitest";
import { LanguageLearner, mergeSources } from "../src/core/language";
import type { NNode, NPaint } from "../src/core/node";
import { buildQuestions } from "../src/core/questions";
import { detectRoles } from "../src/core/roles";

const tok = (name: string, r: number, g: number, b: number): NPaint => ({
  kind: "solid",
  color: { r, g, b, a: 1 },
  variable: { id: name, key: name, name, collection: "c", remote: true },
});
const raw = (r: number, g: number, b: number): NPaint => ({ kind: "solid", color: { r, g, b, a: 1 } });

let seq = 0;
function node(over: Partial<NNode>): NNode {
  return { id: `n${seq++}`, name: "n", type: "FRAME", x: 0, y: 0, width: 10, height: 10, fills: [], strokes: [], strokeWeight: 0, radius: null, children: [], ...over };
}

/** Плавающая кнопка из трёх кусков — как fab/secondary в образцах. */
function fab(set: string, variant: string, paint: NPaint, x: number, y: number): NNode {
  const piece = (dx: number, w: number) => node({ name: "piece", type: "VECTOR", x: x + dx, y, width: w, height: 56, fills: [paint] });
  return node({
    name: set,
    type: "INSTANCE",
    x,
    y,
    width: 56,
    height: 56,
    component: { key: `${set}:${variant}`, name: variant, setName: set },
    children: [piece(0, 28), node({ name: "Content", x: x + 15, y, width: 26, height: 56, fills: [paint], radius: 12, children: [node({ name: "icon", type: "VECTOR", x: x + 20, y: y + 20, width: 16, height: 16, fills: [tok("Icons/Primary", 0, 0, 0)] })] }), piece(28, 28)],
  });
}

function screen(children: NNode[]): NNode {
  return node({ name: "screen", width: 360, height: 720, fills: [tok("Bg/Primary", 1, 1, 1)], children });
}

describe("восприятие элементов", () => {
  it("кнопка из кусков — одна роль с цветом куска, без «деталей»", () => {
    const hits = detectRoles(screen([fab("fab/secondary", "Text=No", tok("Buttons/Floating", 1, 1, 1), 16, 40)])).hits;
    expect(hits.filter((h) => h.key === "action-floating").map((h) => h.paint.variable?.name)).toEqual(["Buttons/Floating"]);
    expect(hits.some((h) => h.key.endsWith("/part"))).toBe(false);
    expect(hits.find((h) => h.key === "action-floating")?.component).toBe("fab/secondary · Text=No");
  });

  it("два варианта компонента разного цвета — правило по компонентам, не вопрос", () => {
    const learner = new LanguageLearner();
    for (let i = 0; i < 6; i++) {
      learner.add(screen([fab("fab/secondary", "Text=No", tok("Buttons/Floating", 1, 1, 1), 16, 40)]), { screenId: `a${i}`, screenName: "a", dark: false });
    }
    for (let i = 0; i < 4; i++) {
      learner.add(screen([fab("fab/primary", "Text=No", tok("Buttons/Primary", 0.18, 0.17, 0.18), 16, 40)]), { screenId: `b${i}`, screenName: "b", dark: false });
    }
    const lang = mergeSources({ id: "p", name: "П" }, [learner.source("f", "t", 10)], "t");
    const rule = lang.rules.find((r) => r.role === "action-floating");
    expect(rule?.status).toBe("proposed");
    expect(rule?.byComponent?.map((x) => x.component).sort()).toEqual(["fab/primary · Text=No", "fab/secondary · Text=No"]);
    expect(buildQuestions(lang).some((q) => q.role === "action-floating")).toBe(false);
  });

  it("цвет без токена внутри компонента — находка для библиотеки, не правило", () => {
    const zoom = node({
      name: "fab/zoom",
      type: "INSTANCE",
      x: 288,
      y: 220,
      width: 56,
      height: 112,
      component: { key: "zoom", name: "fab/zoom", setName: "" },
      children: [node({ name: "bg", type: "VECTOR", x: 288, y: 220, width: 56, height: 112, fills: [raw(1, 1, 1)] })],
    });
    const learner = new LanguageLearner();
    learner.add(screen([zoom]), { screenId: "s", screenName: "s", dark: false });
    const src = learner.source("f", "t", 1);
    expect(src.findings.map((f) => [f.component, f.hex])).toEqual([["fab/zoom", "#FFFFFF"]]);
    expect(src.rules.flatMap((r) => r.values).some((v) => !v.token && v.hex === "#FFFFFF")).toBe(false);
  });

  it("цвет без токена внутри компонента — находка и при переопределении (аудит: «переопределён» не признак автора)", () => {
    const overridden = node({ name: "bg", type: "VECTOR", x: 288, y: 220, width: 56, height: 112, fills: [raw(1, 0, 0)], colorOverride: true });
    const inst = node({ name: "card", type: "INSTANCE", x: 288, y: 220, width: 56, height: 112, component: { key: "k", name: "card", setName: "" }, children: [overridden] });
    const learner = new LanguageLearner();
    learner.add(screen([inst]), { screenId: "s", screenName: "s", dark: false });
    expect(learner.source("f", "t", 1).findings.map((f) => f.component)).toEqual(["card"]);
  });
});
