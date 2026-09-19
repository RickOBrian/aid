/**
 * Поиск иконок в макете (v1.5.0, этап 2).
 *
 * Иконка в макете — экземпляр компонента размером с иконку, фрейм или группа
 * из одних векторов, или разбросанные векторы, которые вместе образуют одну
 * иконку (стрелка: хвостик и указатель — разные слои).
 */

import { describe, expect, it } from "vitest";

import {
  collectIconCandidates,
  groupIconCandidates,
  type IconComponentInfo,
  type IconScanNode,
} from "../src/lib/iconScanner";

let nextId = 0;
const SOLID = [{ type: "SOLID" }];

function vector(x: number, y: number, w: number, h: number, extra: Partial<IconScanNode> = {}): IconScanNode {
  return {
    id: `v${nextId++}`,
    name: "Vector",
    type: "VECTOR",
    width: w,
    height: h,
    absoluteTransform: [
      [1, 0, x],
      [0, 1, y],
    ],
    relativeTransform: [
      [1, 0, x],
      [0, 1, y],
    ],
    fills: SOLID,
    fillGeometry: [{ data: `M0 0H${w}V${h}H0Z`, windingRule: "NONZERO" }],
    ...extra,
  };
}

function container(
  type: string,
  x: number,
  y: number,
  w: number,
  h: number,
  children: IconScanNode[],
  extra: Partial<IconScanNode> = {}
): IconScanNode {
  return {
    id: `c${nextId++}`,
    name: type,
    type,
    width: w,
    height: h,
    absoluteTransform: [
      [1, 0, x],
      [0, 1, y],
    ],
    relativeTransform: [
      [1, 0, x],
      [0, 1, y],
    ],
    fills: [],
    children,
    ...extra,
  };
}

const LIB_CLOSE: IconComponentInfo = { key: "k-close", name: "close", remote: true, width: 24, height: 24 };

function deps(components: Record<string, IconComponentInfo> = {}) {
  return {
    mainComponent: async (node: IconScanNode) => components[node.id] ?? null,
    nodePath: (node: IconScanNode) => `Page / ${node.name}`,
  };
}

describe("collectIconCandidates", () => {
  it("экземпляр компонента размером с иконку — иконка; внутрь не спускаемся", async () => {
    const icon = container("INSTANCE", 0, 0, 24, 24, [vector(4, 4, 16, 16)]);
    const [candidate, ...rest] = await collectIconCandidates([icon], deps({ [icon.id]: LIB_CLOSE }));
    expect(rest).toHaveLength(0);
    expect(candidate).toMatchObject({ kind: "instance", component: { key: "k-close" }, width: 24, height: 24 });
  });

  it("крупный экземпляр (кнопка) — не иконка, но вложенная иконка внутри находится", async () => {
    const nested = container("INSTANCE", 12, 12, 24, 24, [vector(16, 16, 16, 16)]);
    const button = container("INSTANCE", 0, 0, 120, 48, [nested]);
    const candidates = await collectIconCandidates(
      [button],
      deps({ [button.id]: { key: "k-button", name: "button", remote: true, width: 120, height: 48 }, [nested.id]: LIB_CLOSE })
    );
    expect(candidates.map((c) => c.nodeIds[0])).toEqual([nested.id]);
  });

  it("экземпляр с текстом внутри — не иконка (бейдж, счётчик)", async () => {
    const badge = container("INSTANCE", 0, 0, 20, 20, [
      vector(0, 0, 20, 20),
      { id: `t${nextId++}`, name: "3", type: "TEXT", width: 8, height: 12, fills: SOLID },
    ]);
    expect(await collectIconCandidates([badge], deps({ [badge.id]: LIB_CLOSE }))).toEqual([]);
  });

  it("фрейм из нескольких векторов — одна иконка без компонента, помечена как многослойная", async () => {
    const frame = container("FRAME", 0, 0, 24, 24, [vector(2, 11, 14, 2), vector(16, 9, 6, 6)]);
    const [candidate] = await collectIconCandidates([frame], deps());
    expect(candidate).toMatchObject({ kind: "detached", layers: 2, nodeIds: [frame.id] });
  });

  it("группа из одних прямоугольников и кругов — не иконка", async () => {
    const shapes = container("GROUP", 0, 0, 24, 24, [
      vector(0, 0, 10, 10, { type: "RECTANGLE" }),
      vector(12, 0, 10, 10, { type: "ELLIPSE" }),
    ]);
    expect(await collectIconCandidates([shapes], deps())).toEqual([]);
  });

  it("разбросанные векторы, которые касаются, — одна иконка (стрелка из двух слоёв)", async () => {
    const shaft = vector(102, 111, 14, 2);
    const head = vector(116, 109, 6, 6);
    const screen = container("FRAME", 0, 0, 375, 812, [shaft, head], { fills: SOLID });
    const [candidate, ...rest] = await collectIconCandidates([screen], deps());
    expect(rest).toHaveLength(0);
    expect(candidate).toMatchObject({ kind: "detached", layers: 2 });
    expect(candidate.nodeIds.sort()).toEqual([shaft.id, head.id].sort());
    expect(candidate.width).toBe(20);
  });

  it("далеко разнесённые векторы — разные иконки", async () => {
    const screen = container("FRAME", 0, 0, 375, 812, [vector(10, 10, 16, 16), vector(300, 700, 16, 16)], {
      fills: SOLID,
    });
    expect(await collectIconCandidates([screen], deps())).toHaveLength(2);
  });

  it("крупный вектор (иллюстрация) — не иконка", async () => {
    const screen = container("FRAME", 0, 0, 375, 812, [vector(0, 0, 200, 120)], { fills: SOLID });
    expect(await collectIconCandidates([screen], deps())).toEqual([]);
  });

  it("скрытые слои не сканируются", async () => {
    const hidden = container("FRAME", 0, 0, 24, 24, [vector(4, 4, 16, 16)], { visible: false });
    expect(await collectIconCandidates([hidden], deps())).toEqual([]);
  });

  it("растянутый экземпляр помечается: размер не совпадает с компонентом", async () => {
    const icon = container("INSTANCE", 0, 0, 32, 32, [vector(4, 4, 24, 24)]);
    const [candidate] = await collectIconCandidates([icon], deps({ [icon.id]: LIB_CLOSE }));
    expect(candidate.scaled).toBe(true);
  });

  it("определение компонента в макете само иконкой не считается", async () => {
    const definition = container("COMPONENT", 0, 0, 24, 24, [vector(4, 4, 16, 16)]);
    expect(await collectIconCandidates([definition], deps())).toEqual([]);
  });
});

describe("groupIconCandidates", () => {
  it("одинаковые иконки без компонента — одна группа; экземпляры — по компоненту и размеру", async () => {
    const a = container("FRAME", 0, 0, 24, 24, [vector(4, 4, 16, 16)]);
    const b = container("FRAME", 100, 0, 24, 24, [vector(104, 4, 16, 16)]);
    const i1 = container("INSTANCE", 0, 100, 24, 24, [vector(4, 104, 16, 16)]);
    const i2 = container("INSTANCE", 50, 100, 24, 24, [vector(54, 104, 16, 16)]);
    const i3 = container("INSTANCE", 90, 100, 32, 32, [vector(94, 104, 24, 24)]);
    const components = { [i1.id]: LIB_CLOSE, [i2.id]: LIB_CLOSE, [i3.id]: LIB_CLOSE };
    const records = groupIconCandidates(await collectIconCandidates([a, b, i1, i2, i3], deps(components)));
    expect(records.map((r) => [r.kind, r.count]).sort()).toEqual([
      ["detached", 2],
      ["instance", 1],
      ["instance", 2],
    ]);
    const detached = records.find((r) => r.kind === "detached");
    expect(detached?.occurrences).toHaveLength(2);
    expect(detached?.id).toMatch(/\S/);
  });
});

describe("библиотека и макет дают один отпечаток", () => {
  it("отвязанная копия библиотечной иконки в другом месте холста совпадает по форме", async () => {
    const { extractIconGeometry } = await import("../src/lib/iconGeometry");
    const { fingerprint, packFingerprint, shapeSimilarity, unpackFingerprint } = await import("../src/lib/iconShape");
    const ARROW = "M2 11H16V9L22 12L16 15V13H2Z";

    // Библиотека: REST, путь в поле `path`, компонент с холстом 24×24.
    const libraryGeometry = extractIconGeometry({
      type: "COMPONENT",
      fills: [],
      children: [{ type: "VECTOR", fills: SOLID, fillGeometry: [{ path: ARROW, windingRule: "NONZERO" }] }],
    });
    const libraryPrint = packFingerprint(fingerprint(libraryGeometry.paths));

    // Макет: Plugin API, путь в поле `data`, фрейм где-то на экране.
    const frame = container("FRAME", 240, 612, 24, 24, [
      { ...vector(240, 612, 24, 24), fillGeometry: [{ data: ARROW, windingRule: "NONZERO" }], relativeTransform: [[1, 0, 0], [0, 1, 0]] },
    ]);
    const [candidate] = await collectIconCandidates([frame], deps());

    expect(shapeSimilarity(unpackFingerprint(candidate.fingerprint, 32), unpackFingerprint(libraryPrint, 32))).toBe(1);
  });
});
