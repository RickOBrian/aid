/**
 * Цвет для перевода по роли: светлота, оттенок, нейтральный или нет,
 * расстояние. Чистая логика.
 */

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function toHex(c: Rgba): string {
  const to = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0");
  return `#${to(c.r)}${to(c.g)}${to(c.b)}${c.a < 0.999 ? to(c.a) : ""}`.toUpperCase();
}

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** CIE Lab (D65). L — светлота 0…100, по ней держим порядок «темнее — светлее». */
export function toLab(c: Rgba): { L: number; a: number; b: number } {
  const r = srgbToLinear(c.r);
  const g = srgbToLinear(c.g);
  const b = srgbToLinear(c.b);
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

/** Светлота с учётом прозрачности — поверх белого (светлая тема) или чёрного (тёмная). */
export function lightness(c: Rgba, over: "white" | "black" = "white"): number {
  const bg = over === "white" ? 1 : 0;
  const mix = (v: number) => v * c.a + bg * (1 - c.a);
  return toLab({ r: mix(c.r), g: mix(c.g), b: mix(c.b), a: 1 }).L;
}

/** Расстояние в Lab (ΔE76) — насколько цвета различимы глазом; прозрачность — отдельной добавкой. */
export function distance(x: Rgba, y: Rgba): number {
  const p = toLab(x);
  const q = toLab(y);
  return Math.hypot(p.L - q.L, p.a - q.a, p.b - q.b) + Math.abs(x.a - y.a) * 100;
}

export function chroma(c: Rgba): number {
  const { a, b } = toLab(c);
  return Math.hypot(a, b);
}

/** Насыщенность HSL 0…1: у пастели при низкой «цветности» Lab она высокая. */
export function saturation(c: Rgba): number {
  const max = Math.max(c.r, c.g, c.b);
  const min = Math.min(c.r, c.g, c.b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return 0;
  return d / (1 - Math.abs(2 * l - 1));
}

/**
 * Нейтральный — серые, белый, чёрный: у них роль задаёт светлота, а не
 * оттенок. Пастельная подложка (#F9EDFC) по «цветности» Lab почти серая,
 * но насыщенность у неё высокая — это тинт, а не серый (Flot Tasks:
 * цветные кружки опций стали серыми).
 */
export function isNeutral(c: Rgba): boolean {
  const ch = chroma(c);
  if (ch < 3) return true;
  return ch < 12 && saturation(c) < 0.35;
}

export type HueFamily = "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink";

export function hue(c: Rgba): number {
  const max = Math.max(c.r, c.g, c.b);
  const min = Math.min(c.r, c.g, c.b);
  const d = max - min;
  if (d === 0) return 0;
  let h: number;
  if (max === c.r) h = ((c.g - c.b) / d) % 6;
  else if (max === c.g) h = (c.b - c.r) / d + 2;
  else h = (c.r - c.g) / d + 4;
  return (h * 60 + 360) % 360;
}

export function hueFamily(c: Rgba): HueFamily {
  const h = hue(c);
  if (h < 15 || h >= 345) return "red";
  if (h < 40) return "orange";
  if (h < 70) return "yellow";
  if (h < 170) return "green";
  if (h < 255) return "blue";
  if (h < 300) return "purple";
  return "pink";
}
