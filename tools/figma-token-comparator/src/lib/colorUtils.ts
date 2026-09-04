/**
 * Чистые функции работы с цветом: конверсия RGB<->HEX, форматирование
 * значения для отображения и перцептивное расстояние Delta E (CIE76,
 * упрощённая формула через Lab-пространство — достаточно для порогового
 * "approximate match", не претендует на точность CIE2000).
 */

export interface Rgba {
  r: number; // 0..1
  g: number; // 0..1
  b: number; // 0..1
  a: number; // 0..1
}

/** Порог Delta E, ниже которого совпадение считается "approximate match". */
export const APPROX_MATCH_DELTA_E_THRESHOLD = 5;

function channelToHex(channel: number): string {
  const clamped = Math.max(0, Math.min(1, channel));
  const value = Math.round(clamped * 255);
  return value.toString(16).padStart(2, "0").toUpperCase();
}

/** RGB (0..1 каждый канал) -> "#RRGGBB". */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`;
}

/** "#RRGGBB" -> {r,g,b} в диапазоне 0..1. */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return { r, g, b };
}

/** true, если строка — валидный 6-значный hex (# опционален). */
export function isValidHex(value: string): boolean {
  const trimmed = value.trim();
  return /^#?[0-9A-Fa-f]{6}$/.test(trimmed);
}

/** Нормализует hex к виду #RRGGBB (uppercase). */
export function normalizeHex(value: string): string {
  const trimmed = value.trim();
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return withHash.toUpperCase();
}

/**
 * Форматирует значение цвета для отображения в таблице:
 * "#RRGGBB", либо "#RRGGBB @ 80%" если alpha < 100%.
 */
export function formatColorValue(hex: string, alpha: number): string {
  const roundedAlphaPercent = Math.round(alpha * 100);
  if (roundedAlphaPercent >= 100) {
    return hex;
  }
  return `${hex} @ ${roundedAlphaPercent}%`;
}

/** Ключ для дедупликации/сравнения значения с учётом альфы. */
export function colorValueKey(hex: string, alpha: number): string {
  return `${hex}|${Math.round(alpha * 100)}`;
}

function srgbChannelToLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
}

/** sRGB (0..1) -> CIE Lab (D65 white point). */
function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const lr = srgbChannelToLinear(r);
  const lg = srgbChannelToLinear(g);
  const lb = srgbChannelToLinear(b);

  // sRGB -> XYZ (D65)
  const x = lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375;
  const y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.072175;
  const z = lr * 0.0193339 + lg * 0.119192 + lb * 0.9503041;

  // Нормализация к белой точке D65 и XYZ -> Lab
  const xn = x / 0.95047;
  const yn = y / 1.0;
  const zn = z / 1.08883;

  const f = (t: number) => (t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116);

  const fx = f(xn);
  const fy = f(yn);
  const fz = f(zn);

  const l = yn > 0.008856 ? 116 * fy - 16 : 903.3 * yn;
  const a = 500 * (fx - fy);
  const bLab = 200 * (fy - fz);

  return [l, a, bLab];
}

/**
 * Delta E (CIE76): евклидово расстояние между двумя цветами в Lab.
 * Не учитывает alpha — вызывающий код решает, сравнивать ли alpha отдельно.
 */
export function deltaE(hexA: string, hexB: string): number {
  const rgbA = hexToRgb(hexA);
  const rgbB = hexToRgb(hexB);
  const [l1, a1, b1] = rgbToLab(rgbA.r, rgbA.g, rgbA.b);
  const [l2, a2, b2] = rgbToLab(rgbB.r, rgbB.g, rgbB.b);
  return Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
}

/** Простой, стабильный (не криптографический) хэш строки для ключей группы. */
export function stableHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}
