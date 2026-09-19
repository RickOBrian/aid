/**
 * Геометрия иконки из дерева узлов Figma — в пути в координатах самой иконки.
 *
 * Одинаково для REST (`/nodes?geometry=paths`, библиотека) и, дальше, для
 * узлов макета: у каждого узла — `fillGeometry` / `strokeGeometry` в его
 * локальных координатах и `relativeTransform` относительно родителя.
 *
 * Правила:
 * - скрытые узлы (`visible: false`) и маски не рисуются;
 * - заливка узла учитывается, только если у него есть видимая заливка;
 *   иначе контейнер (фрейм компонента) дал бы свой прямоугольник;
 * - обводка — только при видимой обводке; её `strokeGeometry` — уже контур;
 * - булева операция — готовая фигура: в её детей не спускаемся, иначе
 *   вычитаемая часть добавилась бы к форме.
 */

import { geometryBounds, multiplyMatrix, type Box, type Matrix, type ShapePath } from "./iconShape";

/** REST отдаёт путь в `path`, Plugin API — в `data`. */
export interface FigmaGeometryPath {
  path?: string;
  data?: string;
  windingRule?: string;
}

interface FigmaPaintLike {
  type?: string;
  visible?: boolean;
  opacity?: number;
}

/** Узел дерева в той форме, в какой его отдаёт REST (и совместимой с Plugin API). */
export interface FigmaGeometryNode {
  type?: string;
  name?: string;
  visible?: boolean;
  opacity?: number;
  isMask?: boolean;
  /** У текста в Plugin API может быть figma.mixed — иконкой такой узел не бывает. */
  fills?: readonly FigmaPaintLike[] | symbol;
  strokes?: readonly FigmaPaintLike[] | symbol;
  fillGeometry?: readonly FigmaGeometryPath[];
  strokeGeometry?: readonly FigmaGeometryPath[];
  /** REST и Plugin API: [[a, c, e], [b, d, f]]. */
  relativeTransform?: readonly (readonly number[])[];
  children?: readonly FigmaGeometryNode[];
}

export interface IconGeometry {
  paths: ShapePath[];
  /** Плотная рамка рисунка в px — признак для выбора среди равных по форме. */
  glyph: Box | null;
  /**
   * Прозрачности видимых слоёв (слой × заливка), по возрастанию, без
   * повторов. Отличают состояния одной формы (lane_*_0 с 0.5 от lane_*_1).
   */
  opacities: number[];
  /** Сколько слоёв дали геометрию — «Из нескольких слоёв», если больше, чем у библиотечной. */
  layers: number;
}

const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];

function toMatrix(transform: readonly (readonly number[])[] | undefined): Matrix {
  if (!transform || transform.length < 2) return IDENTITY;
  const [[a, c, e], [b, d, f]] = transform;
  return [a, b, c, d, e, f];
}

function visiblePaints(paints: readonly FigmaPaintLike[] | symbol | undefined): FigmaPaintLike[] {
  if (!Array.isArray(paints)) return [];
  return (paints as readonly FigmaPaintLike[]).filter((paint) => paint.visible !== false && (paint.opacity ?? 1) > 0);
}

function fillRuleOf(windingRule: string | undefined): "nonzero" | "evenodd" {
  return windingRule?.toLowerCase() === "evenodd" ? "evenodd" : "nonzero";
}

const round2 = (value: number) => Math.round(value * 100) / 100;

/**
 * `root` — сама иконка (компонент, экземпляр, фрейм или вектор). Её
 * собственный transform не применяется: координаты — от её левого верхнего угла.
 */
export function extractIconGeometry(root: FigmaGeometryNode): IconGeometry {
  const paths: ShapePath[] = [];
  const opacities = new Set<number>();
  let layers = 0;

  const visit = (node: FigmaGeometryNode, matrix: Matrix, opacity: number): void => {
    if (node.visible === false || node.isMask) return;
    const nodeOpacity = opacity * (node.opacity ?? 1);
    if (nodeOpacity <= 0) return;

    const before = paths.length;
    const fills = visiblePaints(node.fills);
    if (fills.length > 0) {
      for (const geometry of node.fillGeometry ?? []) {
        const d = geometry.path ?? geometry.data;
        if (d) paths.push({ d, fillRule: fillRuleOf(geometry.windingRule), transform: matrix });
      }
      for (const fill of fills) opacities.add(round2(nodeOpacity * (fill.opacity ?? 1)));
    }

    const strokes = visiblePaints(node.strokes);
    if (strokes.length > 0) {
      for (const geometry of node.strokeGeometry ?? []) {
        const d = geometry.path ?? geometry.data;
        if (d) paths.push({ d, fillRule: "nonzero", transform: matrix });
      }
      for (const stroke of strokes) opacities.add(round2(nodeOpacity * (stroke.opacity ?? 1)));
    }
    if (paths.length > before) layers += 1;

    if (node.type === "BOOLEAN_OPERATION") return;
    for (const child of node.children ?? []) {
      visit(child, multiplyMatrix(matrix, toMatrix(child.relativeTransform)), nodeOpacity);
    }
  };

  visit(root, IDENTITY, 1);
  return {
    paths,
    glyph: geometryBounds(paths),
    opacities: [...opacities].sort((a, b) => a - b),
    layers,
  };
}
