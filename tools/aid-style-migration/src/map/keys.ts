/**
 * Ключи атомов стиля — общие для карты (collect.ts) и применения
 * (apply.ts): оба должны узнавать один и тот же цвет, текст, радиус
 * одинаково, иначе решение из карты не найдёт свой узел.
 */

import type { UseKind } from "../profile/usage";
import { toHex, type Rgba } from "./color";

/** Ключ цвета: переменная исходника (ключ или id) или значение с прозрачностью. */
export function colorKey(paint: SolidPaint, variable: Variable | null): string {
  if (variable) return variable.key || variable.id;
  const value: Rgba = { ...paint.color, a: paint.opacity ?? 1 };
  return toHex(value);
}

export function colorAtomId(key: string, use: UseKind): string {
  return `${key}|${use}`;
}

export function textAtomId(font: FontName, size: number): string {
  return `${font.family}|${font.style}|${size}`;
}

export function valueAtomId(value: number): string {
  return String(Math.round(value * 10) / 10);
}
