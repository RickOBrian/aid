/**
 * Отпечаток формы иконки — для подбора библиотечной иконки по форме (v1.5.0).
 *
 * Геометрия иконки (все её слои) растеризуется в маску N×N: форма вписывается
 * в квадрат с сохранением пропорций и центрируется. Похожесть двух иконок —
 * доля совпадения масок (IoU). Цвет, положение и размер на отпечаток не
 * влияют.
 *
 * Растеризация своя, без canvas: в песочнице плагина Figma его нет, а код
 * должен одинаково работать там и в тестах. Путь — синтаксис SVG `d`;
 * Figma отдаёт геометрию (`fillGeometry`, `strokeGeometry`, REST
 * `geometry=paths`) в том же синтаксисе.
 */

export type Point = [number, number];

/** Аффинная матрица SVG: x' = a·x + c·y + e, y' = b·x + d·y + f. */
export type Matrix = [number, number, number, number, number, number];

export interface ShapePath {
  d: string;
  fillRule?: "nonzero" | "evenodd";
  transform?: Matrix;
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Fingerprint {
  size: number;
  /** size × size, 1 — пиксель закрашен. */
  bits: Uint8Array;
  /** Сколько пикселей закрашено — для быстрого IoU. */
  count: number;
}

export interface FingerprintOptions {
  /** Сторона маски в пикселях. */
  size?: number;
  /**
   * Рамка нормализации. Нет — плотная рамка самой геометрии: так иконка без
   * компонента (у неё нет «холста» с полями) сравнима с библиотечной.
   */
  frame?: Box;
  /** Допуск аппроксимации кривых в единицах пути. */
  tolerance?: number;
}

const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];

function applyMatrix(m: Matrix, [x, y]: Point): Point {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

// ---------------------------------------------------------------------------
// Разбор пути
// ---------------------------------------------------------------------------

const TOKEN_RE = /[MmLlHhVvCcSsQqTtZz]|-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g;

function flattenCubic(p0: Point, p1: Point, p2: Point, p3: Point, tolerance: number, out: Point[]): void {
  const length =
    Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) +
    Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) +
    Math.hypot(p3[0] - p2[0], p3[1] - p2[1]);
  const steps = Math.max(2, Math.min(64, Math.ceil(length / Math.max(tolerance, 1e-3))));
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const u = 1 - t;
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
}

function flattenQuadratic(p0: Point, p1: Point, p2: Point, tolerance: number, out: Point[]): void {
  // Квадратичная кривая — частный случай кубической.
  const c1: Point = [p0[0] + (2 / 3) * (p1[0] - p0[0]), p0[1] + (2 / 3) * (p1[1] - p0[1])];
  const c2: Point = [p2[0] + (2 / 3) * (p1[0] - p2[0]), p2[1] + (2 / 3) * (p1[1] - p2[1])];
  flattenCubic(p0, c1, c2, p2, tolerance, out);
}

/**
 * Путь → замкнутые ломаные (по одной на подпуть). Поддерживаются команды
 * M L H V C S Q T Z в абсолютной и относительной форме; дуг (A) в геометрии
 * Figma нет.
 */
export function pathToPolylines(d: string, tolerance = 0.25): Point[][] {
  const tokens = d.match(TOKEN_RE) ?? [];
  const polylines: Point[][] = [];
  let current: Point[] = [];
  let pos: Point = [0, 0];
  let start: Point = [0, 0];
  let lastControl: Point | null = null;
  let lastQuadControl: Point | null = null;
  let command = "";
  let i = 0;

  const num = (): number => Number(tokens[i++]);
  const flush = (): void => {
    if (current.length > 1) polylines.push(current);
    current = [];
  };

  while (i < tokens.length) {
    if (/^[A-Za-z]$/.test(tokens[i])) command = tokens[i++];
    const rel = command === command.toLowerCase();
    const off = (p: Point): Point => (rel ? [pos[0] + p[0], pos[1] + p[1]] : p);

    switch (command.toUpperCase()) {
      case "M": {
        flush();
        pos = off([num(), num()]);
        start = pos;
        current = [pos];
        // Координаты после M без новой команды — это L.
        command = rel ? "l" : "L";
        lastControl = lastQuadControl = null;
        break;
      }
      case "L": {
        pos = off([num(), num()]);
        current.push(pos);
        lastControl = lastQuadControl = null;
        break;
      }
      case "H": {
        const x = num();
        pos = [rel ? pos[0] + x : x, pos[1]];
        current.push(pos);
        lastControl = lastQuadControl = null;
        break;
      }
      case "V": {
        const y = num();
        pos = [pos[0], rel ? pos[1] + y : y];
        current.push(pos);
        lastControl = lastQuadControl = null;
        break;
      }
      case "C": {
        const c1 = off([num(), num()]);
        const c2 = off([num(), num()]);
        const end = off([num(), num()]);
        flattenCubic(pos, c1, c2, end, tolerance, current);
        lastControl = c2;
        lastQuadControl = null;
        pos = end;
        break;
      }
      case "S": {
        const c1: Point = lastControl ? [2 * pos[0] - lastControl[0], 2 * pos[1] - lastControl[1]] : pos;
        const c2 = off([num(), num()]);
        const end = off([num(), num()]);
        flattenCubic(pos, c1, c2, end, tolerance, current);
        lastControl = c2;
        lastQuadControl = null;
        pos = end;
        break;
      }
      case "Q": {
        const c = off([num(), num()]);
        const end = off([num(), num()]);
        flattenQuadratic(pos, c, end, tolerance, current);
        lastQuadControl = c;
        lastControl = null;
        pos = end;
        break;
      }
      case "T": {
        const c: Point = lastQuadControl
          ? [2 * pos[0] - lastQuadControl[0], 2 * pos[1] - lastQuadControl[1]]
          : pos;
        const end = off([num(), num()]);
        flattenQuadratic(pos, c, end, tolerance, current);
        lastQuadControl = c;
        lastControl = null;
        pos = end;
        break;
      }
      case "Z": {
        pos = start;
        flush();
        current = [pos];
        lastControl = lastQuadControl = null;
        break;
      }
      default:
        // Неизвестная команда — пропускаем токен, чтобы не зациклиться.
        i += 1;
    }
  }
  flush();
  return polylines;
}

// ---------------------------------------------------------------------------
// Растеризация
// ---------------------------------------------------------------------------

interface PreparedPath {
  polylines: Point[][];
  evenOdd: boolean;
}

function boundsOf(paths: PreparedPath[]): Box | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const path of paths) {
    for (const polyline of path.polylines) {
      for (const [x, y] of polyline) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (!Number.isFinite(minX)) return null;
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** Внутри ли точка области пути: по правилу заливки, по пересечениям горизонтального луча. */
function insideAt(path: PreparedPath, x: number, y: number): boolean {
  let winding = 0;
  for (const polyline of path.polylines) {
    const n = polyline.length;
    for (let k = 0; k < n; k += 1) {
      const [x0, y0] = polyline[k];
      const [x1, y1] = polyline[(k + 1) % n];
      if (y0 <= y ? y1 > y : y1 <= y) {
        const xCross = x0 + ((y - y0) / (y1 - y0)) * (x1 - x0);
        if (xCross > x) winding += y1 > y0 ? 1 : -1;
      }
    }
  }
  return path.evenOdd ? winding % 2 !== 0 : winding !== 0;
}

/**
 * Отпечаток формы. Каждый пиксель проверяется в 4 точках (2×2) и
 * закрашивается, если внутри хотя бы 2 из них — так тонкие линии не
 * пропадают, а сглаживание краёв не зависит от сдвига на полпикселя.
 */
export function fingerprint(paths: ShapePath[], options: FingerprintOptions = {}): Fingerprint {
  const size = options.size ?? 32;
  const tolerance = options.tolerance ?? 0.25;
  const prepared: PreparedPath[] = paths.map((path) => {
    const matrix = path.transform ?? IDENTITY;
    return {
      polylines: pathToPolylines(path.d, tolerance).map((polyline) => polyline.map((p) => applyMatrix(matrix, p))),
      evenOdd: path.fillRule === "evenodd",
    };
  });

  const bits = new Uint8Array(size * size);
  const frame = options.frame ?? boundsOf(prepared);
  if (!frame || (frame.width <= 0 && frame.height <= 0)) return { size, bits, count: 0 };

  // Вписываем рамку в квадрат с сохранением пропорций, по центру.
  const side = Math.max(frame.width, frame.height);
  const scale = side / size;
  const originX = frame.x - (side - frame.width) / 2;
  const originY = frame.y - (side - frame.height) / 2;
  const offsets = [0.25, 0.75];

  let count = 0;
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      let hits = 0;
      for (const dy of offsets) {
        for (const dx of offsets) {
          const x = originX + (col + dx) * scale;
          const y = originY + (row + dy) * scale;
          if (prepared.some((path) => insideAt(path, x, y))) hits += 1;
        }
      }
      if (hits >= 2) {
        bits[row * size + col] = 1;
        count += 1;
      }
    }
  }
  return { size, bits, count };
}

/** Похожесть формы: доля совпадения масок (IoU), от 0 до 1. */
export function shapeSimilarity(a: Fingerprint, b: Fingerprint): number {
  if (a.size !== b.size) throw new Error("Отпечатки разного размера сравнивать нельзя.");
  let intersection = 0;
  let union = 0;
  for (let k = 0; k < a.bits.length; k += 1) {
    const x = a.bits[k];
    const y = b.bits[k];
    if (x & y) intersection += 1;
    if (x | y) union += 1;
  }
  return union === 0 ? 1 : intersection / union;
}

// ---------------------------------------------------------------------------
// Рамка геометрии и хранение отпечатка
// ---------------------------------------------------------------------------

/** Плотная рамка геометрии — размер рисунка иконки в единицах пути (px). */
export function geometryBounds(paths: ShapePath[], tolerance = 0.25): Box | null {
  return boundsOf(
    paths.map((path) => {
      const matrix = path.transform ?? IDENTITY;
      return {
        polylines: pathToPolylines(path.d, tolerance).map((polyline) => polyline.map((p) => applyMatrix(matrix, p))),
        evenOdd: false,
      };
    })
  );
}

/** Произведение матриц: сначала `inner`, потом `outer`. */
export function multiplyMatrix(outer: Matrix, inner: Matrix): Matrix {
  const [a, b, c, d, e, f] = outer;
  const [a2, b2, c2, d2, e2, f2] = inner;
  return [
    a * a2 + c * b2,
    b * a2 + d * b2,
    a * c2 + c * d2,
    b * c2 + d * d2,
    a * e2 + c * f2 + e,
    b * e2 + d * f2 + f,
  ];
}

const BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * Отпечаток → строка base64 (биты упакованы по 8): 32×32 — 172 символа.
 * Своя реализация: в песочнице плагина нет btoa.
 */
export function packFingerprint(print: Fingerprint): string {
  const bytes = new Uint8Array(Math.ceil(print.bits.length / 8));
  for (let k = 0; k < print.bits.length; k += 1) {
    if (print.bits[k]) bytes[k >> 3] |= 1 << (k & 7);
  }
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const triplet = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    out += BASE64[(triplet >> 18) & 63] + BASE64[(triplet >> 12) & 63];
    out += i + 1 < bytes.length ? BASE64[(triplet >> 6) & 63] : "=";
    out += i + 2 < bytes.length ? BASE64[triplet & 63] : "=";
  }
  return out;
}

export function unpackFingerprint(packed: string, size: number): Fingerprint {
  const clean = packed.replace(/=+$/, "");
  const bytes: number[] = [];
  let buffer = 0;
  let bitsInBuffer = 0;
  for (const char of clean) {
    buffer = (buffer << 6) | BASE64.indexOf(char);
    bitsInBuffer += 6;
    if (bitsInBuffer >= 8) {
      bitsInBuffer -= 8;
      bytes.push((buffer >> bitsInBuffer) & 0xff);
    }
  }
  const bits = new Uint8Array(size * size);
  let count = 0;
  for (let k = 0; k < bits.length; k += 1) {
    if ((bytes[k >> 3] ?? 0) & (1 << (k & 7))) {
      bits[k] = 1;
      count += 1;
    }
  }
  return { size, bits, count };
}
