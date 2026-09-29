import { describe, expect, it } from "vitest";
import { buildPlan, rowCount } from "../src/assemble/plan";
import type { ScanItem, ScanPage } from "../src/assemble/types";

function item(id: string, over: Partial<ScanItem> = {}): ScanItem {
  return { id, name: id, width: 390, height: 844, kind: "screen", dark: false, ...over };
}

const page: ScanPage = {
  pageId: "p",
  pageName: "✅ FAQ",
  items: [item("a"), item("a-dark", { dark: true }), item("b"), item("img", { kind: "image" }), item("lonely-dark", { dark: true })],
};

describe("план сборки", () => {
  it("пара — одна строка; одиночный тёмный — своя строка; картинка — своя", () => {
    const plan = buildPlan([page], new Set(["a", "a-dark", "b", "img", "lonely-dark"]), new Map([["a-dark", "a"]]));
    expect(plan[0].rows).toEqual([
      { lightId: "a", darkId: "a-dark" },
      { lightId: "b" },
      { imageId: "img" },
      { darkId: "lonely-dark" },
    ]);
    expect(rowCount(plan)).toBe(4);
  });

  it("разъединённая пара — две строки", () => {
    const plan = buildPlan([page], new Set(["a", "a-dark"]), new Map());
    expect(plan[0].rows).toEqual([{ lightId: "a" }, { darkId: "a-dark" }]);
  });

  it("снятый экран не попадает; пустая страница выпадает", () => {
    expect(buildPlan([page], new Set(), new Map())).toEqual([]);
  });

  it("ручная пара главнее эвристики «тёмный»", () => {
    const plan = buildPlan([page], new Set(["b", "lonely-dark"]), new Map([["b", "lonely-dark"]]));
    expect(plan[0].rows).toEqual([{ lightId: "lonely-dark", darkId: "b" }]);
  });
});
