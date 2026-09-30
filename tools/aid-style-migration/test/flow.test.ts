import { describe, expect, it } from "vitest";
import { DEFAULT_FLOW, layoutFlow, readingRows } from "../src/assemble/flow";

const screen = (id: string, x: number, y: number, height = 844) => ({ id, x, y, width: 390, height });

describe("порядок чтения", () => {
  it("на одной высоте — один ряд, слева направо; ниже — следующий", () => {
    const rows = readingRows([screen("c", 900, 10), screen("a", 0, 0), screen("b", 450, 30), screen("d", 0, 2000)]);
    expect(rows.map((r) => r.map((s) => s.id))).toEqual([["a", "b", "c"], ["d"]]);
  });

  it("модалка короче экрана рядом с ним — в том же ряду", () => {
    const rows = readingRows([screen("full", 0, 0), screen("modal", 450, 600, 209)]);
    expect(rows).toHaveLength(1);
  });
});

describe("раскладка потока", () => {
  it("аккуратная сетка: одинаковые промежутки, место под подпись", () => {
    const layout = layoutFlow([screen("a", 0, 0), screen("b", 5000, 40), screen("c", 100, 3000)]);
    const a = layout.positions.get("a")!;
    const b = layout.positions.get("b")!;
    const c = layout.positions.get("c")!;
    expect(a).toEqual({ x: DEFAULT_FLOW.padding, y: DEFAULT_FLOW.padding + DEFAULT_FLOW.labelHeight });
    expect(b.x - a.x).toBe(390 + DEFAULT_FLOW.gapX);
    expect(c.y).toBeGreaterThan(a.y + 844);
  });

  it("длинный ряд переносится", () => {
    const layout = layoutFlow(Array.from({ length: 25 }, (_, i) => screen(`s${i}`, i * 400, 0)), { ...DEFAULT_FLOW, maxPerRow: 10 });
    const ys = new Set([...layout.positions.values()].map((p) => p.y));
    expect(ys.size).toBe(3);
  });

  it("раскладка одинакова при каждом вызове — секции зеркальны", () => {
    const items = [screen("a", 0, 0), screen("b", 450, 0), screen("c", 0, 1000)];
    expect([...layoutFlow(items).positions]).toEqual([...layoutFlow(items).positions]);
  });
});
