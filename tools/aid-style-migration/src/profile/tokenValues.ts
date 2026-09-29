/**
 * Значения переменных — общее для индекса из открытого файла и по ссылке
 * (REST): один формат, одно разрешение ссылок. Чистая логика.
 */

import type { VariableValue } from "./types";

type RawValue = number | string | boolean | { type?: string; id?: string; r?: number; g?: number; b?: number; a?: number };

/** Сырое значение переменной (Plugin API или REST — формат одинаковый) → наш формат. */
export function convertValue(value: unknown, byId: (id: string) => { name: string; key: string } | undefined): VariableValue {
  const v = value as RawValue;
  if (typeof v === "number") return { kind: "number", value: v };
  if (typeof v === "string") return { kind: "string", value: v };
  if (typeof v === "boolean") return { kind: "boolean", value: v };
  if (v.type === "VARIABLE_ALIAS" && v.id) {
    const target = byId(v.id);
    return { kind: "alias", name: target?.name ?? v.id, key: target?.key ?? null };
  }
  return { kind: "color", r: v.r ?? 0, g: v.g ?? 0, b: v.b ?? 0, a: v.a ?? 1 };
}

export interface ResolveEntry {
  valuesByMode: Record<string, VariableValue>;
  defaultModeId: string;
}

/**
 * Пройти ссылки до конкретного значения. Режим ищем по id в коллекции
 * цели; если там его нет (примитивы обычно в одном режиме) — режим по
 * умолчанию коллекции цели.
 */
export function resolveValue(value: VariableValue, modeId: string, byKey: Map<string, ResolveEntry>, depth = 0): VariableValue | null {
  if (value.kind !== "alias") return value;
  if (depth > 16 || !value.key) return null;
  const target = byKey.get(value.key);
  if (!target) return null;
  const next = target.valuesByMode[modeId] ?? target.valuesByMode[target.defaultModeId];
  return next ? resolveValue(next, modeId, byKey, depth + 1) : null;
}
