/**
 * Поиск иконок в макете (v1.5.0, этап 2).
 *
 * Иконка в макете — одно из трёх:
 * 1. экземпляр компонента размером с иконку, внутри которого только
 *    векторы; в такой экземпляр не спускаемся, а в экземпляры покрупнее
 *    (кнопки) — спускаемся: в них бывают вложенные иконки;
 * 2. фрейм или группа размером с иконку из одних векторов, среди которых
 *    есть хотя бы один настоящий вектор, — иконка без компонента, сколько
 *    бы в ней ни было слоёв;
 * 3. разбросанные векторы одного родителя, которые касаются или
 *    перекрываются и вместе укладываются в размер иконки, — одна иконка
 *    (стрелка: хвостик и указатель — разные слои).
 *
 * Модуль работает с абстрактным узлом: узлы Plugin API подходят к нему по
 * форме, а тесты обходятся без Figma. Главный компонент экземпляра и путь
 * узла приходят зависимостями.
 */

import { stableHash } from "./colorUtils";
import { extractIconGeometry, type FigmaGeometryNode } from "./iconGeometry";
import { fingerprint, packFingerprint } from "./iconShape";

/** Иконка не больше этого по большей стороне, px. */
export const ICON_MAX_SIZE = 64;
/** Разбросанные векторы склеиваются, если между рамками не больше, px. */
const CLUSTER_GAP = 1;
const MAX_OCCURRENCES_PER_GROUP = 500;

/** Типы, из которых состоит иконка. */
const GEOMETRY_TYPES = new Set(["VECTOR", "BOOLEAN_OPERATION", "STAR", "LINE", "POLYGON", "RECTANGLE", "ELLIPSE"]);
/** «Настоящий» вектор: одних прямоугольников и кругов для иконки мало. */
const DRAWN_TYPES = new Set(["VECTOR", "BOOLEAN_OPERATION", "STAR", "LINE", "POLYGON"]);
const GROUPING_TYPES = new Set(["GROUP", "FRAME"]);

export interface IconScanNode extends FigmaGeometryNode {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  /** [[a, c, e], [b, d, f]] — положение на холсте. */
  absoluteTransform?: readonly (readonly number[])[];
  children?: readonly IconScanNode[];
}

export interface IconComponentInfo {
  key: string;
  name: string;
  setName?: string;
  /** Компонент из подключённой к файлу библиотеки, а не локальный. */
  remote: boolean;
  width: number;
  height: number;
}

export interface IconScanDeps {
  mainComponent(node: IconScanNode): Promise<IconComponentInfo | null>;
  nodePath(node: IconScanNode): string;
}

export interface IconCandidate {
  kind: "instance" | "detached";
  /** Слои, из которых собрана иконка: у экземпляра и фрейма — один узел. */
  nodeIds: string[];
  name: string;
  path: string;
  component?: IconComponentInfo;
  /** Размер иконки на холсте, px. */
  width: number;
  height: number;
  /** Экземпляр растянут: размер не совпадает с компонентом. */
  scaled: boolean;
  fingerprint: string;
  glyph: { width: number; height: number } | null;
  opacities: number[];
  layers: number;
}

export interface IconRecord {
  /** Стабильный ключ группы — как `LayoutRecord.id`. */
  id: string;
  kind: IconCandidate["kind"];
  component?: IconComponentInfo;
  representativeName: string;
  representativePath: string;
  width: number;
  height: number;
  scaled: boolean;
  fingerprint: string;
  glyph: IconCandidate["glyph"];
  opacities: number[];
  layers: number;
  count: number;
  /** Слои каждого вхождения — для выделения и «Применить в макет». */
  occurrences: string[][];
  occurrencesTruncated?: boolean;
}

// ---------------------------------------------------------------------------

function isIconSized(width: number, height: number): boolean {
  return Math.max(width, height) <= ICON_MAX_SIZE && width > 0 && height > 0;
}

/** Внутри только геометрия (и группы), есть хотя бы один настоящий вектор. */
function hasIconContent(node: IconScanNode): boolean {
  let drawn = false;
  const ok = (current: IconScanNode): boolean => {
    for (const child of current.children ?? []) {
      if (child.visible === false) continue;
      if (DRAWN_TYPES.has(child.type)) drawn = true;
      else if (GEOMETRY_TYPES.has(child.type)) continue;
      else if (GROUPING_TYPES.has(child.type)) {
        if (!ok(child)) return false;
      } else return false;
    }
    return true;
  };
  return ok(node) && drawn;
}

function candidateFrom(
  kind: IconCandidate["kind"],
  root: FigmaGeometryNode,
  nodes: IconScanNode[],
  size: { width: number; height: number },
  deps: IconScanDeps,
  component?: IconComponentInfo
): IconCandidate | null {
  const geometry = extractIconGeometry(root);
  if (geometry.paths.length === 0) return null;
  const scaled =
    Boolean(component) &&
    (Math.abs(size.width - (component?.width ?? size.width)) > 0.5 ||
      Math.abs(size.height - (component?.height ?? size.height)) > 0.5);
  return {
    kind,
    nodeIds: nodes.map((node) => node.id),
    name: nodes[0].name,
    path: deps.nodePath(nodes[0]),
    ...(component ? { component } : {}),
    width: size.width,
    height: size.height,
    scaled,
    fingerprint: packFingerprint(fingerprint(geometry.paths)),
    glyph: geometry.glyph ? { width: geometry.glyph.width, height: geometry.glyph.height } : null,
    opacities: geometry.opacities,
    layers: geometry.layers,
  };
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function rectOf(node: IconScanNode): Rect {
  const t = node.absoluteTransform;
  return { x: t ? t[0][2] : 0, y: t ? t[1][2] : 0, width: node.width, height: node.height };
}

function touches(a: Rect, b: Rect): boolean {
  return (
    a.x <= b.x + b.width + CLUSTER_GAP &&
    b.x <= a.x + a.width + CLUSTER_GAP &&
    a.y <= b.y + b.height + CLUSTER_GAP &&
    b.y <= a.y + a.height + CLUSTER_GAP
  );
}

function unionRect(rects: Rect[]): Rect {
  const x = Math.min(...rects.map((r) => r.x));
  const y = Math.min(...rects.map((r) => r.y));
  const right = Math.max(...rects.map((r) => r.x + r.width));
  const bottom = Math.max(...rects.map((r) => r.y + r.height));
  return { x, y, width: right - x, height: bottom - y };
}

/** Разбросанные векторы одного родителя → группы касающихся (union-find). */
function clusterLooseGeometry(nodes: IconScanNode[]): IconScanNode[][] {
  const rects = nodes.map(rectOf);
  const parent = nodes.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      if (touches(rects[i], rects[j])) parent[find(i)] = find(j);
    }
  }
  const clusters = new Map<number, IconScanNode[]>();
  nodes.forEach((node, i) => {
    const root = find(i);
    clusters.set(root, [...(clusters.get(root) ?? []), node]);
  });
  return [...clusters.values()];
}

/**
 * Геометрия склеенной иконки: слои переносятся в координаты общей рамки —
 * их `absoluteTransform` со сдвигом к её левому верхнему углу.
 */
function clusterRoot(nodes: IconScanNode[], frame: Rect): FigmaGeometryNode {
  return {
    type: "GROUP",
    children: nodes.map((node) => {
      const t = node.absoluteTransform ?? [
        [1, 0, 0],
        [0, 1, 0],
      ];
      return {
        type: node.type,
        visible: node.visible,
        opacity: node.opacity,
        isMask: node.isMask,
        fills: node.fills,
        strokes: node.strokes,
        fillGeometry: node.fillGeometry,
        strokeGeometry: node.strokeGeometry,
        children: node.children,
        relativeTransform: [
          [t[0][0], t[0][1], t[0][2] - frame.x],
          [t[1][0], t[1][1], t[1][2] - frame.y],
        ],
      };
    }),
  };
}

export async function collectIconCandidates(
  roots: readonly IconScanNode[],
  deps: IconScanDeps
): Promise<IconCandidate[]> {
  const candidates: IconCandidate[] = [];

  const collectLoose = (children: readonly IconScanNode[]): void => {
    const loose = children.filter(
      (child) => child.visible !== false && !child.isMask && GEOMETRY_TYPES.has(child.type) && isIconSized(child.width, child.height)
    );
    for (const cluster of clusterLooseGeometry(loose)) {
      if (!cluster.some((node) => DRAWN_TYPES.has(node.type))) continue;
      const frame = unionRect(cluster.map(rectOf));
      if (!isIconSized(frame.width, frame.height)) continue;
      const candidate = candidateFrom("detached", clusterRoot(cluster, frame), cluster, frame, deps);
      if (candidate) candidates.push(candidate);
    }
  };

  /**
   * `insideInstance` — узел внутри экземпляра. Там ищем только вложенные
   * экземпляры-иконки: остальное содержимое задано компонентом, а не автором
   * макета, и найдётся при сканировании самого компонента.
   */
  const visit = async (node: IconScanNode, insideInstance: boolean): Promise<void> => {
    if (node.visible === false || node.isMask) return;
    const iconShaped = isIconSized(node.width, node.height) && hasIconContent(node);

    if (node.type === "INSTANCE") {
      const component = await deps.mainComponent(node);
      if (component && iconShaped) {
        const candidate = candidateFrom("instance", node, [node], node, deps, component);
        if (candidate) candidates.push(candidate);
        return;
      }
      for (const child of node.children ?? []) await visit(child, true);
      return;
    }

    // Определение компонента-иконки — источник, а не находка: ошибкой будут
    // его экземпляры, если он не из библиотеки.
    if (node.type === "COMPONENT" && iconShaped) return;

    if (!insideInstance && GROUPING_TYPES.has(node.type) && iconShaped) {
      const candidate = candidateFrom("detached", node, [node], node, deps);
      if (candidate) candidates.push(candidate);
      return;
    }

    const children = node.children ?? [];
    for (const child of children) await visit(child, insideInstance);
    if (!insideInstance) collectLoose(children);
  };

  for (const root of roots) await visit(root, false);
  collectLoose(roots);
  return candidates;
}

const round = (value: number) => Math.round(value);

/**
 * Группировка вхождений: экземпляры — по компоненту и размеру, иконки без
 * компонента — по отпечатку формы, размеру рисунка и прозрачностям.
 */
export function groupIconCandidates(candidates: readonly IconCandidate[]): IconRecord[] {
  const groups = new Map<string, IconRecord>();
  for (const candidate of candidates) {
    const signature =
      candidate.kind === "instance" && candidate.component
        ? `icons|instance|${candidate.component.key}|${round(candidate.width)}x${round(candidate.height)}`
        : `icons|detached|${candidate.fingerprint}|${round(candidate.glyph?.width ?? 0)}x${round(
            candidate.glyph?.height ?? 0
          )}|${candidate.opacities.join(",")}`;
    const id = stableHash(signature);
    const existing = groups.get(id);
    if (existing) {
      existing.count += 1;
      if (existing.occurrences.length < MAX_OCCURRENCES_PER_GROUP) existing.occurrences.push(candidate.nodeIds);
      else existing.occurrencesTruncated = true;
      continue;
    }
    groups.set(id, {
      id,
      kind: candidate.kind,
      ...(candidate.component ? { component: candidate.component } : {}),
      representativeName: candidate.name,
      representativePath: candidate.path,
      width: candidate.width,
      height: candidate.height,
      scaled: candidate.scaled,
      fingerprint: candidate.fingerprint,
      glyph: candidate.glyph,
      opacities: candidate.opacities,
      layers: candidate.layers,
      count: 1,
      occurrences: [candidate.nodeIds],
    });
  }
  return [...groups.values()];
}
