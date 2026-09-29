/**
 * Что считать экраном. Чистая логика: на вход — факты о ноде, на выход —
 * решение и причина, которую увидит пользователь.
 */

import { isAnnotationName } from "../lib/annotations";

export interface NodeFacts {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  visible: boolean;
  /** Типы прямых детей по порядку. */
  childTypes: string[];
  /** Нода без детей, залитая только картинкой. */
  imageOnly: boolean;
}

export type ScreenKind = "screen" | "image" | "skip";

export interface Classified {
  kind: ScreenKind;
  reason: string;
}

/** Ширины устройств: телефон, планшет, десктоп. */
const DEVICE_WIDTHS: Array<[number, number]> = [
  [280, 480],
  [560, 1100],
  [1180, 2000],
];
/** Ниже — это уже не экран, а полоска или подпись. Модалки 390×209 проходят. */
const MIN_SCREEN_HEIGHT = 120;

const CONTAINER_TYPES = new Set(["FRAME", "INSTANCE", "COMPONENT", "GROUP"]);
const IMAGE_TYPES = new Set(["RECTANGLE", "FRAME"]);

export function isDeviceSized(width: number, height: number): boolean {
  return height >= MIN_SCREEN_HEIGHT && DEVICE_WIDTHS.some(([min, max]) => width >= min && width <= max);
}

export function classify(node: NodeFacts): Classified {
  if (!node.visible) return { kind: "skip", reason: "скрыт" };
  if (isAnnotationName(node.name)) return { kind: "skip", reason: "аннотация или пояснение" };
  const sized = isDeviceSized(node.width, node.height);
  if (node.imageOnly && IMAGE_TYPES.has(node.type)) {
    return sized
      ? { kind: "image", reason: "картинка размером с экран" }
      : { kind: "skip", reason: "картинка" };
  }
  if (!CONTAINER_TYPES.has(node.type)) return { kind: "skip", reason: "подпись или графика" };
  if (node.childTypes.length === 0) return { kind: "skip", reason: "пустой" };
  if (!sized) return { kind: "skip", reason: `размер ${Math.round(node.width)}×${Math.round(node.height)} не похож на экран` };
  return { kind: "screen", reason: "экран" };
}

/** Структурная подпись для поиска пар: размер и типы детей по порядку. */
export function signature(node: NodeFacts): string {
  return `${Math.round(node.width)}x${Math.round(node.height)}|${node.childTypes.join(",")}`;
}
