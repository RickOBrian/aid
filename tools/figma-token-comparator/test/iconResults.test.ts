/**
 * Иконки в общем формате таблицы: запись, результат, статус и его текст.
 */

import { describe, expect, it } from "vitest";

import { compareIcons } from "../src/lib/iconComparator";
import { iconRecordToLayoutRecord, iconResultToComparisonResult } from "../src/lib/iconResults";
import type { IconRecord } from "../src/lib/iconScanner";
import { fingerprint, packFingerprint } from "../src/lib/iconShape";
import { getResultStatusFilterKey } from "../src/lib/statusKeys";
import { getStatusMeta } from "../src/lib/statusMeta";
import type { LibraryIcon } from "../src/comparators/types";

const CROSS = "M5 4L12 11L19 4L20 5L13 12L20 19L19 20L12 13L5 20L4 19L11 12L4 5Z";
const SQUARE = "M3 3H21V21H3Z";
const print = (d: string) => packFingerprint(fingerprint([{ d }]));
const outline = (d: string) => ({ viewBox: [0, 0, 24, 24] as [number, number, number, number], paths: [{ d }] });

const LIBRARY: LibraryIcon[] = [
  {
    key: "close",
    nodeId: "1:1",
    name: "Size=24",
    setName: "close",
    width: 24,
    height: 24,
    glyph: { x: 4, y: 4, width: 16, height: 16 },
    opacities: [1],
    layers: 1,
    fingerprint: print(CROSS),
    outline: outline(CROSS),
  },
];

function record(d: string, extra: Partial<IconRecord> = {}): IconRecord {
  return {
    id: "rec-1",
    kind: "detached",
    representativeName: "Vector",
    representativePath: "Page / Card / Vector",
    width: 24,
    height: 24,
    scaled: false,
    fingerprint: print(d),
    glyph: { width: 16, height: 16 },
    opacities: [1],
    layers: 1,
    outline: outline(d),
    count: 2,
    occurrences: [["a", "b"], ["c"]],
    ...extra,
  };
}

describe("iconRecordToLayoutRecord", () => {
  it("иконка без компонента — «hardcoded», все слои всех вхождений — для выделения", () => {
    const layout = iconRecordToLayoutRecord(record(CROSS));
    expect(layout).toMatchObject({
      id: "rec-1",
      category: "icons",
      bindingType: "hardcoded",
      displayValue: "Без компонента · 24×24",
      count: 2,
      nodeIds: ["a", "b", "c"],
    });
  });

  it("экземпляр — «component» с именем компонента", () => {
    const layout = iconRecordToLayoutRecord(
      record(CROSS, { kind: "instance", component: { key: "k", name: "x", setName: "old/close", remote: true, width: 24, height: 24 } })
    );
    expect(layout.bindingType).toBe("component");
    expect(layout.sourceName).toBe("old/close / x");
  });
});

describe("iconResultToComparisonResult", () => {
  it("отвязанная иконка: статус, цель с key и похожестью, превью обеих", () => {
    const [compared] = compareIcons([record(CROSS)], LIBRARY, {});
    const result = iconResultToComparisonResult(compared);
    expect(result.status).toBe("detached");
    expect(result.target).toMatchObject({ name: "close / Size=24", componentKey: "close" });
    expect(result.icon?.similarity).toBe(1);
    expect(result.icon?.outline?.paths[0].d).toBe(CROSS);
    expect(result.icon?.targetOutline?.paths[0].d).toBe(CROSS);
  });

  it("текст статуса — иконочный: «Отвязанная иконка», «Иконка без компонента»", () => {
    const [detached, orphan] = compareIcons([record(CROSS), record(SQUARE, { id: "rec-2" })], LIBRARY, {});
    const labelOf = (compared: typeof detached) => {
      const result = iconResultToComparisonResult(compared);
      return getStatusMeta(getResultStatusFilterKey(result), "icons").label;
    };
    expect(labelOf(detached)).toBe("Отвязанная иконка");
    expect(labelOf(orphan)).toBe("Иконка без компонента");
  });
});
