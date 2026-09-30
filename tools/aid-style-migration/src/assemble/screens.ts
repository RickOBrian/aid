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
  /** Внутри есть инстанс компонента (или нода сама инстанс). */
  hasInstance: boolean;
  /** Своя видимая заливка или ребёнок с заливкой на ≥ 90 % площади. */
  hasBackground: boolean;
}

export type ScreenKind = "screen" | "image" | "skip";

export interface Classified {
  kind: ScreenKind;
  reason: string;
}

/**
 * Ширины устройств и минимальная высота: телефон, планшет, десктоп. У
 * телефона низко — модалки 390×209 проходят; у широких выше — заголовки
 * сценариев 1560×126 в образцах не экраны.
 */
const DEVICE_BANDS: Array<[number, number, number]> = [
  [280, 480, 120],
  [560, 1100, 320],
  [1180, 2000, 320],
];

const CONTAINER_TYPES = new Set(["FRAME", "INSTANCE", "COMPONENT", "GROUP"]);
const IMAGE_TYPES = new Set(["RECTANGLE", "FRAME"]);

export function isDeviceSized(width: number, height: number): boolean {
  return DEVICE_BANDS.some(([min, max, minHeight]) => width >= min && width <= max && height >= minHeight);
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
  // Стрелка с подписью, ромб условия, подпись сценария размером с экран:
  // ни фона, ни компонентов. У экрана есть хотя бы одно из двух
  // (проверено на образцах 2026-09-30: 190 экранов проходят, 32 элемента обвязки — нет).
  if (!node.hasInstance && !node.hasBackground) return { kind: "skip", reason: "обвязка флоу: ни фона, ни компонентов" };
  return { kind: "screen", reason: "экран" };
}

/** Структурная подпись для поиска пар: размер и типы детей по порядку. */
export function signature(node: NodeFacts): string {
  return `${Math.round(node.width)}x${Math.round(node.height)}|${node.childTypes.join(",")}`;
}
