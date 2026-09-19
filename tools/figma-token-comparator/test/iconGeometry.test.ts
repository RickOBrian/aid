/**
 * Геометрия иконки из дерева узлов Figma (REST geometry=paths).
 */

import { describe, expect, it } from "vitest";

import { extractIconGeometry, type FigmaGeometryNode } from "../src/lib/iconGeometry";
import {
  fingerprint,
  packFingerprint,
  shapeSimilarity,
  unpackFingerprint,
} from "../src/lib/iconShape";

const SQUARE_2 = [{ path: "M0 0H2V2H0Z", windingRule: "NONZERO" }];
const VISIBLE = [{ type: "SOLID" }];

/** Компонент 24×24: фрейм без заливки, группа со сдвигом, вектор внутри. */
function icon(children: FigmaGeometryNode[]): FigmaGeometryNode {
  return {
    type: "COMPONENT",
    fills: [],
    fillGeometry: [{ path: "M0 0H24V24H0Z" }],
    relativeTransform: [
      [1, 0, 500],
      [0, 1, 700],
    ],
    children,
  };
}

describe("extractIconGeometry", () => {
  it("складывает трансформации по дереву, а свою у корня не применяет", () => {
    const geometry = extractIconGeometry(
      icon([
        {
          type: "GROUP",
          relativeTransform: [
            [1, 0, 4],
            [0, 1, 6],
          ],
          children: [
            {
              type: "VECTOR",
              fills: VISIBLE,
              fillGeometry: SQUARE_2,
              relativeTransform: [
                [2, 0, 1],
                [0, 2, 1],
              ],
            },
          ],
        },
      ])
    );
    expect(geometry.paths).toHaveLength(1);
    expect(geometry.glyph).toEqual({ x: 5, y: 7, width: 4, height: 4 });
  });

  it("контейнер без заливки свой прямоугольник не добавляет", () => {
    const geometry = extractIconGeometry(icon([{ type: "VECTOR", fills: VISIBLE, fillGeometry: SQUARE_2 }]));
    expect(geometry.glyph).toEqual({ x: 0, y: 0, width: 2, height: 2 });
  });

  it("скрытые слои, маски и невидимые заливки пропускаются", () => {
    const geometry = extractIconGeometry(
      icon([
        { type: "VECTOR", visible: false, fills: VISIBLE, fillGeometry: SQUARE_2 },
        { type: "VECTOR", isMask: true, fills: VISIBLE, fillGeometry: SQUARE_2 },
        { type: "VECTOR", fills: [{ visible: false }], fillGeometry: SQUARE_2 },
        { type: "VECTOR", fills: [{ opacity: 0 }], fillGeometry: SQUARE_2 },
      ])
    );
    expect(geometry.paths).toHaveLength(0);
    expect(geometry.glyph).toBeNull();
  });

  it("обводка учитывается контуром из strokeGeometry", () => {
    const geometry = extractIconGeometry(
      icon([{ type: "VECTOR", strokes: VISIBLE, strokeGeometry: [{ path: "M0 0H3V1H0Z" }] }])
    );
    expect(geometry.paths).toHaveLength(1);
    expect(geometry.paths[0].fillRule).toBe("nonzero");
  });

  it("булева операция — готовая фигура, дети не добавляются", () => {
    const geometry = extractIconGeometry(
      icon([
        {
          type: "BOOLEAN_OPERATION",
          fills: VISIBLE,
          fillGeometry: SQUARE_2,
          children: [{ type: "VECTOR", fills: VISIBLE, fillGeometry: [{ path: "M10 10H20V20H10Z" }] }],
        },
      ])
    );
    expect(geometry.paths).toHaveLength(1);
    expect(geometry.glyph).toEqual({ x: 0, y: 0, width: 2, height: 2 });
  });

  it("правило заливки evenodd сохраняется", () => {
    const geometry = extractIconGeometry(
      icon([{ type: "VECTOR", fills: VISIBLE, fillGeometry: [{ path: "M0 0H2V2H0Z", windingRule: "EVENODD" }] }])
    );
    expect(geometry.paths[0].fillRule).toBe("evenodd");
  });

  it("прозрачности слоёв: слой × заливка, по возрастанию, без повторов", () => {
    const geometry = extractIconGeometry(
      icon([
        { type: "VECTOR", opacity: 0.5, fills: VISIBLE, fillGeometry: SQUARE_2 },
        { type: "VECTOR", fills: [{ opacity: 0.5 }], fillGeometry: SQUARE_2 },
        { type: "VECTOR", fills: VISIBLE, fillGeometry: SQUARE_2 },
      ])
    );
    expect(geometry.opacities).toEqual([0.5, 1]);
  });
});

describe("упаковка отпечатка", () => {
  it("упаковка и распаковка дают тот же отпечаток; 32×32 — 172 символа", () => {
    const print = fingerprint([{ d: "M2 11H16V9L22 12L16 15V13H2Z" }]);
    const packed = packFingerprint(print);
    expect(packed).toHaveLength(172);
    const restored = unpackFingerprint(packed, 32);
    expect(restored.count).toBe(print.count);
    expect(shapeSimilarity(print, restored)).toBe(1);
  });
});
