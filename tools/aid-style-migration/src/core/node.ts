/**
 * Нормализованный узел — модель экрана для движка (Я1, трекер «Язык
 * продукта»). Движок не знает Figma API: один и тот же код распознаёт
 * роли в плагине (адаптер Plugin API), вне Figma (адаптер REST) и в
 * тестах (фикстуры реальных экранов).
 */

import type { Rgba } from "../map/color";

/** Переменная, к которой привязан цвет или число. */
export interface NVariable {
  id: string;
  key: string;
  name: string;
  collection: string;
  remote: boolean;
}

export interface NPaint {
  kind: "solid" | "image" | "gradient" | "other";
  /** Цвет с прозрачностью заливки (для solid). */
  color?: Rgba;
  variable?: NVariable;
}

export interface NText {
  characters: string;
  fontFamily: string;
  fontStyle: string;
  fontSize: number;
  textCase: string;
  textDecoration: string;
  /** Горизонтальное выравнивание текста в его рамке. */
  align: string;
  styleKey?: string;
  styleName?: string;
}

export interface NLayout {
  mode: "HORIZONTAL" | "VERTICAL";
  padding: [number, number, number, number];
  gap: number;
  primaryAlign: string;
  counterAlign: string;
}

export interface NComponent {
  key: string;
  name: string;
  /** Имя набора вариантов; пусто — одиночный компонент. */
  setName: string;
}

export interface NNode {
  id: string;
  name: string;
  type: string;
  /** Положение относительно корня экрана. */
  x: number;
  y: number;
  width: number;
  height: number;
  fills: NPaint[];
  strokes: NPaint[];
  strokeWeight: number;
  /** Радиус скругления; null — разный по углам или нет. */
  radius: number | null;
  layout?: NLayout;
  text?: NText;
  component?: NComponent;
  children: NNode[];
}

/** Обход в глубину с родителем. */
export function walk(node: NNode, visit: (n: NNode, parent: NNode | null, depth: number) => void | "skip", parent: NNode | null = null, depth = 0): void {
  if (visit(node, parent, depth) === "skip") return;
  for (const c of node.children) walk(c, visit, node, depth + 1);
}

/** Первая видимая сплошная заливка. */
export function solidFill(n: NNode): NPaint | undefined {
  return n.fills.find((p) => p.kind === "solid" && p.color);
}

export function solidStroke(n: NNode): NPaint | undefined {
  return n.strokeWeight > 0 ? n.strokes.find((p) => p.kind === "solid" && p.color) : undefined;
}

/** Все тексты поддерева. */
export function texts(n: NNode): NNode[] {
  const out: NNode[] = [];
  walk(n, (x) => {
    if (x.text) out.push(x);
  });
  return out;
}
