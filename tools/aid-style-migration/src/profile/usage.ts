/**
 * Как образец использует токен — по месту в макете. Это сырьё для
 * определения ролей на этапе 3: «этот токен в образцах — фон экрана»,
 * «этот — текст», «этот — иконка». Чистая логика.
 */

/** Больше экранов образцов не читаем: файл образцов большой (спайк), выборка равномерная. */
export const EXEMPLAR_LIMIT = 80;

/** Откуда брать экраны образцов в открытом файле. */
export type ExemplarScope = "page" | "selection";

/** Где встретилась привязка переменной. */
export type UseKind =
  | "background"
  | "surface"
  | "text"
  | "icon"
  | "stroke"
  | "effect"
  | "radius"
  | "padding"
  | "gap"
  | "size"
  | "other";

export const USE_KINDS: UseKind[] = ["background", "surface", "text", "icon", "stroke", "effect", "radius", "padding", "gap", "size", "other"];

export interface FillContext {
  nodeType: string;
  width: number;
  height: number;
  screenWidth: number;
  screenHeight: number;
  /** Нода внутри инстанса не больше 48×48 — это иконка. */
  insideSmallInstance: boolean;
}

const SHAPE_TYPES = new Set(["VECTOR", "BOOLEAN_OPERATION", "STAR", "LINE", "ELLIPSE", "POLYGON"]);

/** Заливка: текст, иконка, фон экрана или поверхность. */
export function fillUse(c: FillContext): UseKind {
  if (c.nodeType === "TEXT") return "text";
  if (c.insideSmallInstance || (SHAPE_TYPES.has(c.nodeType) && c.width <= 48 && c.height <= 48)) return "icon";
  if (c.width >= c.screenWidth * 0.9 && c.height >= c.screenHeight * 0.5) return "background";
  return "surface";
}

/** Поле boundVariables → вид использования (для всего, кроме заливки). */
export function fieldUse(field: string): UseKind {
  if (field === "strokes") return "stroke";
  if (field === "effects") return "effect";
  if (/radius/i.test(field)) return "radius";
  if (/^padding/.test(field)) return "padding";
  if (field === "itemSpacing" || field === "counterAxisSpacing") return "gap";
  if (/^(width|height|minWidth|maxWidth|minHeight|maxHeight)$/.test(field)) return "size";
  return "other";
}

export type TextCaseKind = "upper" | "title" | "sentence" | "lower" | "mixed";

/**
 * Как на деле выглядит текст: учитываем и textCase ноды, и сами буквы.
 * На этапе 0 агент потерял капс кнопок именно потому, что смотрел только
 * на строку, а капс давал стиль.
 */
export function visibleCase(characters: string, textCase: string): TextCaseKind {
  if (textCase === "UPPER") return "upper";
  if (textCase === "LOWER") return "lower";
  if (textCase === "TITLE") return "title";
  const letters = characters.replace(/[^a-zа-яё]/gi, "");
  if (letters.length < 2) return "mixed";
  if (letters === letters.toUpperCase()) return "upper";
  if (letters === letters.toLowerCase()) return "lower";
  const words = characters.split(/\s+/).filter((w) => /[a-zа-яё]/i.test(w));
  if (words.length > 1 && words.every((w) => w[0] === w[0].toUpperCase())) return "title";
  if (characters.trim()[0] === characters.trim()[0].toUpperCase()) return "sentence";
  return "mixed";
}

/** Счётчик с безопасным ростом. */
export function bump<K extends string>(map: Partial<Record<K, number>>, key: K, by = 1): void {
  map[key] = (map[key] ?? 0) + by;
}

/** Равномерная выборка: не больше `limit` элементов, от начала до конца. */
export function sample<T>(items: T[], limit: number): T[] {
  if (items.length <= limit) return items;
  const step = items.length / limit;
  return Array.from({ length: limit }, (_, i) => items[Math.floor(i * step)]);
}
