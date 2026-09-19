/**
 * Замена иконки макета на иконку библиотеки — расчёты без Figma (v1.5.0).
 *
 * Используются примеркой («Было / Будет») и дальше — «Применить в макет».
 * Здесь только решения: какой цвет взять из макета, как перекрасить
 * библиотечную иконку и куда её поставить. Сами операции с узлами — в code.ts.
 *
 * Цвет — из макета, не из библиотеки (решение Principal Designer): иконка
 * библиотеки обычно нарисована нейтральным цветом, а в макете покрашена
 * нужным токеном. Paint переносится целиком, вместе с привязкой к переменной.
 */

export interface PaintLike {
  type?: string;
  visible?: boolean;
  opacity?: number;
  /** SOLID: 0–1 по каналу. */
  color?: { r: number; g: number; b: number };
}

export interface PaintNodeLike {
  type?: string;
  visible?: boolean;
  isMask?: boolean;
  fills?: readonly PaintLike[] | symbol;
  strokes?: readonly PaintLike[] | symbol;
  children?: readonly PaintNodeLike[];
}

export interface IconBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Контейнеры: их заливка — фон, а не цвет иконки. Булева операция — фигура. */
const CONTAINER_TYPES = new Set(["FRAME", "GROUP", "COMPONENT", "COMPONENT_SET", "INSTANCE", "SECTION"]);

function paintsOf(value: readonly PaintLike[] | symbol | undefined): readonly PaintLike[] {
  return Array.isArray(value) ? (value as readonly PaintLike[]) : [];
}

function isVisiblePaint(paint: PaintLike): boolean {
  return paint.visible !== false && (paint.opacity ?? 1) > 0;
}

function isShape(node: PaintNodeLike): boolean {
  return !CONTAINER_TYPES.has(node.type ?? "");
}

/**
 * Цвет иконки в макете: первая видимая заливка фигуры, а если заливок нет
 * (контурная иконка) — первая видимая обводка. Скрытые слои и маски не
 * смотрим. null — у иконки нет цвета, перекрашивать нечем.
 */
export function pickIconPaint<P extends PaintLike>(nodes: readonly PaintNodeLike[]): P | null {
  let stroke: P | null = null;
  const visit = (node: PaintNodeLike): P | null => {
    if (node.visible === false || node.isMask) return null;
    if (isShape(node)) {
      const fill = paintsOf(node.fills).find(isVisiblePaint);
      if (fill) return fill as P;
      if (!stroke) stroke = (paintsOf(node.strokes).find(isVisiblePaint) as P | undefined) ?? null;
      if (node.type === "BOOLEAN_OPERATION") return null;
    }
    for (const child of node.children ?? []) {
      const found = visit(child);
      if (found) return found;
    }
    return null;
  };
  for (const node of nodes) {
    const found = visit(node);
    if (found) return found;
  }
  return stroke;
}

/**
 * Paint макета на месте paint библиотеки. Прозрачность библиотечного слоя
 * сохраняется (множителем): у иконок бывают полупрозрачные части и состояния.
 */
export function recolorPaint<P extends PaintLike>(libraryPaint: PaintLike, layoutPaint: P): P {
  return { ...layoutPaint, opacity: (layoutPaint.opacity ?? 1) * (libraryPaint.opacity ?? 1) };
}

/**
 * Иконка одного цвета: все видимые заливки и обводки фигур — сплошные одного
 * цвета (прозрачность не в счёт — это части одной иконки). Только такие
 * красятся в цвет макета. Многоцветная (логотип в фирменных цветах, знак на
 * цветном круге) и с градиентом — остаётся в цветах библиотеки: эти цвета —
 * часть рисунка, а не токен (решение Principal Designer).
 */
export function isMonochromeIcon(root: PaintNodeLike): boolean {
  const colors = new Set<string>();
  let monochrome = true;
  const channel = (value: number) => Math.round(value * 255);
  const visit = (node: PaintNodeLike, isRoot: boolean): void => {
    if (!monochrome || node.visible === false || node.isMask) return;
    if (!isRoot && isShape(node)) {
      for (const paint of [...paintsOf(node.fills), ...paintsOf(node.strokes)]) {
        if (!isVisiblePaint(paint)) continue;
        if (paint.type !== "SOLID" || !paint.color) {
          monochrome = false;
          return;
        }
        colors.add(`${channel(paint.color.r)},${channel(paint.color.g)},${channel(paint.color.b)}`);
      }
      if (node.type === "BOOLEAN_OPERATION") return;
    }
    for (const child of node.children ?? []) visit(child, false);
  };
  visit(root, true);
  return monochrome && colors.size <= 1;
}

/**
 * Новые списки заливок и обводок для каждой фигуры иконки. Возвращает пары
 * «узел → что записать», сам ничего не меняет. Корень (фрейм компонента) не
 * красим: его заливка — фон.
 */
export function recolorPlan<N extends PaintNodeLike, P extends PaintLike>(
  root: N,
  layoutPaint: P
): Array<{ node: N; fills?: P[]; strokes?: P[] }> {
  const plan: Array<{ node: N; fills?: P[]; strokes?: P[] }> = [];
  const recolor = (paints: readonly PaintLike[]): P[] | undefined => {
    if (!paints.some(isVisiblePaint)) return undefined;
    return paints.map((paint) => (isVisiblePaint(paint) ? recolorPaint(paint, layoutPaint) : (paint as P)));
  };
  const visit = (node: N, isRoot: boolean): void => {
    if (node.visible === false || node.isMask) return;
    if (!isRoot && isShape(node)) {
      const fills = recolor(paintsOf(node.fills));
      const strokes = recolor(paintsOf(node.strokes));
      if (fills || strokes) plan.push({ node, ...(fills ? { fills } : {}), ...(strokes ? { strokes } : {}) });
      if (node.type === "BOOLEAN_OPERATION") return;
    }
    for (const child of (node.children ?? []) as readonly N[]) visit(child, false);
  };
  visit(root, true);
  return plan;
}

export function unionBox(boxes: readonly IconBox[]): IconBox | null {
  if (boxes.length === 0) return null;
  const minX = Math.min(...boxes.map((box) => box.x));
  const minY = Math.min(...boxes.map((box) => box.y));
  const maxX = Math.max(...boxes.map((box) => box.x + box.width));
  const maxY = Math.max(...boxes.map((box) => box.y + box.height));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** Разница в масштабе, которую считаем тем же размером. */
const SCALE_TOLERANCE = 0.1;

/**
 * Куда поставить экземпляр библиотечной иконки и во сколько раз его
 * увеличить, если заменяется не экземпляр.
 *
 * - `frame` — заменяется фрейм или группа размером с иконку: экземпляр
 *   вписывается в её рамку по центру;
 * - `glyph` — заменяются сами векторы: совмещаются рисунки (рамка рисунка
 *   библиотечной иконки — с рамкой векторов), вокруг остаются поля
 *   компонента. Рисунок почти того же размера не масштабируется, чтобы иконка
 *   осталась стандартного размера.
 */
export function iconPlacement(
  mode: "frame" | "glyph",
  target: IconBox,
  component: { width: number; height: number },
  libraryGlyph: IconBox | null
): { x: number; y: number; scale: number } {
  if (mode === "glyph" && libraryGlyph && libraryGlyph.width > 0 && libraryGlyph.height > 0) {
    let scale = Math.min(target.width / libraryGlyph.width, target.height / libraryGlyph.height);
    if (!Number.isFinite(scale) || Math.abs(scale - 1) <= SCALE_TOLERANCE) scale = 1;
    return {
      x: target.x + target.width / 2 - (libraryGlyph.x + libraryGlyph.width / 2) * scale,
      y: target.y + target.height / 2 - (libraryGlyph.y + libraryGlyph.height / 2) * scale,
      scale,
    };
  }
  let scale = Math.min(target.width / component.width, target.height / component.height);
  if (!Number.isFinite(scale) || scale <= 0 || Math.abs(scale - 1) < 0.01) scale = 1;
  return {
    x: target.x + (target.width - component.width * scale) / 2,
    y: target.y + (target.height - component.height * scale) / 2,
    scale,
  };
}
