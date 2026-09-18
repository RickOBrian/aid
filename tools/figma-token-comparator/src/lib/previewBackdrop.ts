/**
 * Фон под PNG «Было / Будет»: светлая или тёмная шахматка.
 *
 * Экспорт слоя прозрачен везде, где у слоя нет заливки. Текст без подложки
 * (частый случай в превью типографики) экспортируется одними глифами, и
 * белый текст на светлой шахматке не виден. Фон выбирается по снимку: какая
 * шахматка даёт непрозрачным пикселям достаточный контраст.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export type PreviewBackdrop = "light" | "dark";

/** Две клетки шахматки — пиксель должен читаться на обеих. */
export type CheckerColors = [Rgb, Rgb];

/**
 * 3:1 — порог WCAG для нетекстовой графики. Для превью этого достаточно:
 * задача — различить форму, а не прочитать мелкий текст.
 */
const MIN_CONTRAST = 3;

/** Пиксели с меньшей непрозрачностью — сглаживание краёв, не голосуют. */
const OPAQUE_ALPHA = 128;

/** Если прозрачного меньше этой доли, шахматки почти не видно — фон не важен. */
const MIN_TRANSPARENT_SHARE = 0.05;

/** Тёмная шахматка выбирается, если на светлой плохо читается больше этой доли пикселей. */
const LOW_CONTRAST_SHARE = 0.5;

function channelToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Относительная яркость по WCAG 2. */
export function relativeLuminance({ r, g, b }: Rgb): number {
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function readableOn(pixel: Rgb, checker: CheckerColors): boolean {
  return checker.every((square) => contrastRatio(pixel, square) >= MIN_CONTRAST);
}

/**
 * `pixels` — RGBA без премультипликации, как отдаёт `getImageData`.
 * По умолчанию — светлая шахматка; тёмная только если на светлой снимок
 * по большей части не читается, а на тёмной читается лучше.
 */
export function pickPreviewBackdrop(
  pixels: ArrayLike<number>,
  backdrops: { light: CheckerColors; dark: CheckerColors }
): PreviewBackdrop {
  const total = Math.floor(pixels.length / 4);
  if (total === 0) return "light";

  let transparent = 0;
  let opaque = 0;
  let lowOnLight = 0;
  let lowOnDark = 0;

  for (let i = 0; i < total; i += 1) {
    const offset = i * 4;
    if (pixels[offset + 3] < OPAQUE_ALPHA) {
      transparent += 1;
      continue;
    }
    opaque += 1;
    const pixel = { r: pixels[offset], g: pixels[offset + 1], b: pixels[offset + 2] };
    if (!readableOn(pixel, backdrops.light)) lowOnLight += 1;
    if (!readableOn(pixel, backdrops.dark)) lowOnDark += 1;
  }

  if (opaque === 0 || transparent / total < MIN_TRANSPARENT_SHARE) return "light";
  return lowOnLight / opaque > LOW_CONTRAST_SHARE && lowOnDark < lowOnLight ? "dark" : "light";
}

/**
 * Разбирает вычисленное значение CSS-переменной: `#rgb`, `#rrggbb`,
 * `rgb(...)` / `rgba(...)`. Цвета шахматки берутся из токенов страницы, а не
 * дублируются в коде. Нераспознанное — null.
 */
export function parseCssColor(value: string): Rgb | null {
  const text = value.trim();

  const hex = text.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const digits =
      hex[1].length === 3
        ? hex[1]
            .split("")
            .map((d) => d + d)
            .join("")
        : hex[1];
    return {
      r: parseInt(digits.slice(0, 2), 16),
      g: parseInt(digits.slice(2, 4), 16),
      b: parseInt(digits.slice(4, 6), 16),
    };
  }

  const rgb = text.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)$/i);
  if (rgb) {
    return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]) };
  }

  return null;
}
