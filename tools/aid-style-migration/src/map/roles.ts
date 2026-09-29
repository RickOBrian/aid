/**
 * Роль токена продукта — по имени, области применения (scopes) и тому, как
 * его используют образцы. Имена токенов у продуктов разные, поэтому здесь
 * не имена, а слова-признаки на двух языках (как словарь темы).
 */

import type { UseKind } from "../profile/usage";

/** Смысловой класс цвета — одинаковый для исходника и продукта. */
export type ColorMeaning = "accent" | "positive" | "negative" | "warning" | "info" | "neutral";

const MEANING_STEMS: Record<Exclude<ColorMeaning, "neutral">, string[]> = {
  accent: ["accent", "brand", "акцент", "бренд"],
  positive: ["positive", "success", "green", "успех", "позитив"],
  negative: ["negative", "error", "danger", "critical", "destructive", "red", "ошибк", "негатив"],
  warning: ["warning", "attention", "caution", "orange", "yellow", "предупрежд", "внимани"],
  info: ["info", "informative", "blue", "информ"],
};

/** Для какого места в макете токен по имени: «Texts/…», «Bg/…», «Icons/…»… */
const USE_STEMS: Partial<Record<UseKind, string[]>> = {
  text: ["text", "texts", "label", "fg", "foreground", "content", "текст"],
  background: ["bg", "background", "backgrounds", "page", "screen", "фон"],
  surface: ["surface", "surfaces", "fill", "fills", "card", "container", "button", "buttons", "control", "controls", "field", "fields", "поверхн", "карточк", "кнопк"],
  icon: ["icon", "icons", "glyph", "иконк"],
  stroke: ["stroke", "strokes", "border", "borders", "divider", "separator", "outline", "line", "lines", "обводк", "граница", "разделит"],
};

function words(name: string): string[] {
  return name
    .toLowerCase()
    .split(/[^a-zа-яё0-9-]+/i)
    .flatMap((w) => [w, ...w.split("-")])
    .filter(Boolean);
}

function hasStem(name: string, stems: string[]): boolean {
  const ws = words(name);
  return stems.some((s) => ws.some((w) => w.startsWith(s)));
}

export function meaningFromName(name: string): ColorMeaning {
  for (const [meaning, stems] of Object.entries(MEANING_STEMS) as Array<[Exclude<ColorMeaning, "neutral">, string[]]>) {
    if (hasStem(name, stems)) return meaning;
  }
  return "neutral";
}

/** Какие места подходят токену по имени; пусто — имя ничего не говорит. */
export function usesFromName(name: string): UseKind[] {
  return (Object.entries(USE_STEMS) as Array<[UseKind, string[]]>).filter(([, stems]) => hasStem(name, stems)).map(([use]) => use);
}

/**
 * Разрешает ли область применения (scopes) переменной это место. Scopes —
 * жёсткое правило Figma: токен с TEXT_FILL нельзя ставить на фон.
 */
export function scopeAllows(scopes: string[], use: UseKind): boolean {
  if (scopes.length === 0 || scopes.includes("ALL_SCOPES")) return true;
  switch (use) {
    case "text":
      return scopes.some((s) => s === "TEXT_FILL" || s === "ALL_FILLS");
    case "background":
    case "surface":
      return scopes.some((s) => s === "FRAME_FILL" || s === "SHAPE_FILL" || s === "ALL_FILLS");
    case "icon":
      return scopes.some((s) => s === "SHAPE_FILL" || s === "ALL_FILLS");
    case "stroke":
      return scopes.includes("STROKE_COLOR");
    case "effect":
      return scopes.includes("EFFECT_COLOR");
    case "radius":
      return scopes.includes("CORNER_RADIUS");
    case "padding":
    case "gap":
      return scopes.includes("GAP");
    case "size":
      return scopes.some((s) => s === "WIDTH_HEIGHT");
    default:
      return true;
  }
}
