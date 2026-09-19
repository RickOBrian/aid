/**
 * Замена иконки: цвет из макета, перекраска библиотечной, место и масштаб.
 */

import { describe, expect, it } from "vitest";

import { iconPlacement, pickIconPaint, recolorPaint, recolorPlan, unionBox } from "../src/lib/iconSwap";

const token = { type: "SOLID", color: "accent", boundVariables: { color: { id: "VariableID:1" } } };

describe("pickIconPaint — цвет иконки в макете", () => {
  it("заливка фигуры, а не фон фрейма", () => {
    const frame = {
      type: "FRAME",
      fills: [{ type: "SOLID", color: "white" }],
      children: [{ type: "VECTOR", fills: [token] }],
    };
    expect(pickIconPaint([frame])).toBe(token);
  });

  it("скрытые слои, маски и невидимые заливки пропускаются", () => {
    const nodes = [
      { type: "VECTOR", visible: false, fills: [{ type: "SOLID", color: "hidden" }] },
      { type: "VECTOR", isMask: true, fills: [{ type: "SOLID", color: "mask" }] },
      { type: "VECTOR", fills: [{ type: "SOLID", visible: false }, token] },
    ];
    expect(pickIconPaint(nodes)).toBe(token);
  });

  it("контурная иконка — цвет обводки; заливка любой фигуры важнее", () => {
    const stroke = { type: "SOLID", color: "stroke" };
    expect(pickIconPaint([{ type: "VECTOR", fills: [], strokes: [stroke] }])).toBe(stroke);
    expect(pickIconPaint([{ type: "VECTOR", strokes: [stroke] }, { type: "VECTOR", fills: [token] }])).toBe(token);
  });

  it("нет цвета — null", () => {
    expect(pickIconPaint([{ type: "FRAME", fills: [{ type: "SOLID" }], children: [] }])).toBeNull();
  });
});

describe("recolorPlan — иконка библиотеки в цвете макета", () => {
  it("красит фигуры, привязка к токену сохраняется, прозрачность библиотеки — множителем", () => {
    const shaft = { type: "VECTOR", fills: [{ type: "SOLID", color: "gray" }] };
    const head = { type: "VECTOR", fills: [{ type: "SOLID", color: "gray", opacity: 0.5 }] };
    const root = { type: "INSTANCE", fills: [{ type: "SOLID", color: "bg" }], children: [shaft, head] };
    const plan = recolorPlan(root, token);
    expect(plan.map((step) => step.node)).toEqual([shaft, head]);
    expect(plan[0].fills).toEqual([{ ...token, opacity: 1 }]);
    expect(plan[1].fills).toEqual([{ ...token, opacity: 0.5 }]);
  });

  it("обводка перекрашивается, скрытая заливка остаётся как была", () => {
    const hidden = { type: "SOLID", visible: false };
    const line = { type: "VECTOR", fills: [hidden], strokes: [{ type: "SOLID" }] };
    const [step] = recolorPlan({ type: "INSTANCE", children: [line] }, token);
    expect(step.fills).toBeUndefined();
    expect(step.strokes).toEqual([{ ...token, opacity: 1 }]);
  });

  it("в детей булевой операции не спускается — красится она сама", () => {
    const part = { type: "VECTOR", fills: [{ type: "SOLID" }] };
    const bool = { type: "BOOLEAN_OPERATION", fills: [{ type: "SOLID" }], children: [part] };
    const plan = recolorPlan({ type: "INSTANCE", children: [bool] }, token);
    expect(plan.map((step) => step.node)).toEqual([bool]);
  });

  it("recolorPaint не трогает исходный paint макета", () => {
    const layout = { type: "SOLID", opacity: 0.8 };
    expect(recolorPaint({ opacity: 0.5 }, layout)).toEqual({ type: "SOLID", opacity: 0.4 });
    expect(layout.opacity).toBe(0.8);
  });
});

describe("iconPlacement — куда встаёт экземпляр", () => {
  const component = { width: 24, height: 24 };
  const glyph = { x: 4, y: 4, width: 16, height: 16 };

  it("фрейм того же размера — на его место, без масштаба", () => {
    expect(iconPlacement("frame", { x: 10, y: 20, width: 24, height: 24 }, component, glyph)).toEqual({
      x: 10,
      y: 20,
      scale: 1,
    });
  });

  it("фрейм 32×32 — экземпляр увеличен до 32", () => {
    expect(iconPlacement("frame", { x: 0, y: 0, width: 32, height: 32 }, component, glyph)).toEqual({
      x: 0,
      y: 0,
      scale: 32 / 24,
    });
  });

  it("векторы 16×16 — рисунки совмещаются, вокруг поля компонента", () => {
    expect(iconPlacement("glyph", { x: 104, y: 54, width: 16, height: 16 }, component, glyph)).toEqual({
      x: 100,
      y: 50,
      scale: 1,
    });
  });

  it("векторы чуть другого размера — без масштаба, по центру", () => {
    const place = iconPlacement("glyph", { x: 0, y: 0, width: 17, height: 17 }, component, glyph);
    expect(place.scale).toBe(1);
    expect(place.x).toBeCloseTo(-3.5);
  });

  it("векторы вдвое крупнее — экземпляр вдвое крупнее", () => {
    expect(iconPlacement("glyph", { x: 8, y: 8, width: 32, height: 32 }, component, glyph)).toEqual({
      x: 0,
      y: 0,
      scale: 2,
    });
  });

  it("unionBox — общая рамка слоёв стрелки", () => {
    expect(unionBox([{ x: 4, y: 11, width: 12, height: 2 }, { x: 14, y: 7, width: 6, height: 10 }])).toEqual({
      x: 4,
      y: 7,
      width: 16,
      height: 10,
    });
  });
});
