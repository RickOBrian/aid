/**
 * Геометрия иконки из дерева узлов Figma — в пути в координатах самой иконки.
 *
 * Одинаково для REST (`/nodes?geometry=paths`, библиотека) и узлов макета
 * (Plugin API): у каждого узла — `fillGeometry` / `strokeGeometry` в его
 * локальных координатах.
 *
 * Положение узла в иконке:
 * - в макете — из `absoluteTransform` (положение на холсте) относительно
 *   корня: так верно всегда, с группами и без;
 * - в REST абсолютного положения нет, только `relativeTransform`. В Plugin
 *   API он отсчитывается от ближайшего контейнера — группы и булевы операции
 *   пропускаются (документация `relativeTransform`). REST-документация
 *   пишет «относительно родителя», не уточняя, поэтому правило определяется по
 *   рамкам (`absoluteBoundingBox`) — `detectGroupChildTransforms`.
 *
 * Правила:
 * - скрытые узлы (`visible: false`) и маски не рисуются;
 * - заливка узла учитывается, только если у него есть видимая заливка;
 *   иначе контейнер (фрейм компонента) дал бы свой прямоугольник;
 * - обводка — только при видимой обводке; её `strokeGeometry` — уже контур;
 * - булева операция — готовая фигура: в её детей не спускаемся, иначе
 *   вычитаемая часть добавилась бы к форме.
 */

import { geometryBounds, invertMatrix, multiplyMatrix, type Box, type Matrix, type ShapePath } from "./iconShape";

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
  /** Plugin API: положение на холсте, тот же формат. */
  absoluteTransform?: readonly (readonly number[])[];
  /** REST и Plugin API: рамка на холсте (с учётом поворота). */
  absoluteBoundingBox?: { x: number; y: number; width: number; height: number } | null;
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

/** Группа и булева операция не задают своей системы координат для детей (Plugin API). */
function isGroupLike(node: FigmaGeometryNode): boolean {
  return node.type === "GROUP" || node.type === "BOOLEAN_OPERATION";
}

/**
 * От чего отсчитывается `relativeTransform` детей группы:
 * - `container` — от ближайшего предка, который не группа (так в Plugin API);
 * - `parent` — от самой группы.
 */
export type GroupChildTransforms = "container" | "parent";

export interface IconGeometryOptions {
  /** Для узлов без `absoluteTransform` (REST). По умолчанию — `container`. */
  groupChildTransforms?: GroupChildTransforms;
}

const isAxisAligned = (m: Matrix) => Math.abs(m[0] - 1) < 1e-6 && Math.abs(m[3] - 1) < 1e-6 && Math.abs(m[1]) < 1e-6 && Math.abs(m[2]) < 1e-6;
const POSITION_TOLERANCE = 0.5;

/**
 * Правило отсчёта для дерева REST — по рамкам на холсте. Ребёнок группы без
 * поворота: его сдвиг равен разнице с рамкой группы (`parent`) или с рамкой
 * ближайшего контейнера (`container`). Голосуют пары, где варианты
 * различимы; нет таких — undefined.
 */
export function detectGroupChildTransforms(root: FigmaGeometryNode): GroupChildTransforms | undefined {
  let parentVotes = 0;
  let containerVotes = 0;
  const visit = (node: FigmaGeometryNode, container: FigmaGeometryNode): void => {
    const nextContainer = isGroupLike(node) ? container : node;
    for (const child of node.children ?? []) {
      const box = child.absoluteBoundingBox;
      const groupBox = node.absoluteBoundingBox;
      const containerBox = container.absoluteBoundingBox;
      const transform = toMatrix(child.relativeTransform);
      if (isGroupLike(node) && box && groupBox && containerBox && child.relativeTransform && isAxisAligned(transform)) {
        const [, , , , e, f] = transform;
        const fromGroup = Math.abs(box.x - groupBox.x - e) + Math.abs(box.y - groupBox.y - f);
        const fromContainer = Math.abs(box.x - containerBox.x - e) + Math.abs(box.y - containerBox.y - f);
        if (Math.abs(fromGroup - fromContainer) > POSITION_TOLERANCE) {
          if (fromGroup < fromContainer) parentVotes += 1;
          else containerVotes += 1;
        }
      }
      visit(child, nextContainer);
    }
  };
  visit(root, root);
  if (parentVotes === containerVotes) return undefined;
  return parentVotes > containerVotes ? "parent" : "container";
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
export function extractIconGeometry(root: FigmaGeometryNode, options: IconGeometryOptions = {}): IconGeometry {
  const paths: ShapePath[] = [];
  const opacities = new Set<number>();
  let layers = 0;
  const semantics = options.groupChildTransforms ?? "container";
  const rootAbsoluteInverse = root.absoluteTransform ? invertMatrix(toMatrix(root.absoluteTransform)) : null;

  /**
   * `matrix` — узел в координатах иконки, `container` — ближайший его предок,
   * не группа (в координатах иконки): от него отсчитываются дети групп.
   */
  const childMatrix = (child: FigmaGeometryNode, parent: Matrix, container: Matrix, parentIsGroup: boolean): Matrix => {
    if (rootAbsoluteInverse && child.absoluteTransform) {
      return multiplyMatrix(rootAbsoluteInverse, toMatrix(child.absoluteTransform));
    }
    const base = parentIsGroup && semantics === "container" ? container : parent;
    return multiplyMatrix(base, toMatrix(child.relativeTransform));
  };

  const visit = (node: FigmaGeometryNode, matrix: Matrix, container: Matrix, opacity: number): void => {
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
    const group = isGroupLike(node);
    const nextContainer = group ? container : matrix;
    for (const child of node.children ?? []) {
      visit(child, childMatrix(child, matrix, container, group), nextContainer, nodeOpacity);
    }
  };

  // Корень-группа: её дети отсчитываются от её контейнера, а корень — начало
  // координат иконки; контейнер в них — обратное положение группы.
  const rootContainer = isGroupLike(root) && semantics === "container" ? invertMatrix(toMatrix(root.relativeTransform)) : IDENTITY;
  visit(root, IDENTITY, rootContainer, 1);
  return {
    paths,
    glyph: geometryBounds(paths),
    opacities: [...opacities].sort((a, b) => a - b),
    layers,
  };
}
