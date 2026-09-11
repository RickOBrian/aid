/**
 * Нормализация и форматирование типографики для сравнения (REST + Plugin API).
 */

import type {
  TypographyComparisonValue,
  TypographyTextCase,
  TypographyTextDecoration,
} from "../comparators/types";

/** Единица line height в ответе Figma REST API (TypeStyle.lineHeightUnit). */
export type RestLineHeightUnit = "PIXELS" | "FONT_SIZE_%" | "INTRINSIC_%";

export interface RestTypeStyleLike {
  fontFamily?: string;
  fontWeight?: number;
  fontSize?: number;
  letterSpacing?: number;
  textCase?: string;
  textDecoration?: string;
  lineHeightPx?: number;
  lineHeightPercent?: number;
  lineHeightPercentFontSize?: number;
  lineHeightUnit?: RestLineHeightUnit | string;
}

const TEXT_CASES: TypographyTextCase[] = [
  "ORIGINAL",
  "UPPER",
  "LOWER",
  "TITLE",
  "SMALL_CAPS",
  "SMALL_CAPS_FORCED",
];

const TEXT_DECORATIONS: TypographyTextDecoration[] = ["NONE", "STRIKETHROUGH", "UNDERLINE"];

/** Best-effort множитель line height для INTRINSIC_% / AUTO (Plugin API) без font metrics. */
const INTRINSIC_LINE_HEIGHT_FACTOR = 1.2;

export function normalizeTextCase(value: string | undefined): TypographyTextCase {
  const upper = (value ?? "ORIGINAL").toUpperCase();
  if (TEXT_CASES.includes(upper as TypographyTextCase)) {
    return upper as TypographyTextCase;
  }
  return "ORIGINAL";
}

export function normalizeTextDecoration(value: string | undefined): TypographyTextDecoration {
  const upper = (value ?? "NONE").toUpperCase();
  if (TEXT_DECORATIONS.includes(upper as TypographyTextDecoration)) {
    return upper as TypographyTextDecoration;
  }
  return "NONE";
}

export interface NormalizedLineHeight {
  lineHeight: number;
  /** true — значение вычислено приближённо (AUTO / INTRINSIC_% без метрик шрифта). */
  approximate?: boolean;
}

/**
 * Нормализует line height из REST TypeStyle в px.
 * - PIXELS → lineHeightPx
 * - FONT_SIZE_% → fontSize * lineHeightPercentFontSize / 100 (fallback: lineHeightPercent)
 * - INTRINSIC_% → fontSize * 1.2 (approximate)
 */
export function normalizeLineHeightFromRest(
  style: RestTypeStyleLike,
  fontSize: number
): NormalizedLineHeight {
  const unit = (style.lineHeightUnit ?? "PIXELS").toUpperCase();

  if (unit === "PIXELS" && typeof style.lineHeightPx === "number" && Number.isFinite(style.lineHeightPx)) {
    return { lineHeight: style.lineHeightPx };
  }

  if (unit === "FONT_SIZE_%") {
    const percent =
      typeof style.lineHeightPercentFontSize === "number"
        ? style.lineHeightPercentFontSize
        : typeof style.lineHeightPercent === "number"
          ? style.lineHeightPercent
          : 100;
    return { lineHeight: (fontSize * percent) / 100 };
  }

  if (unit === "INTRINSIC_%") {
    if (typeof style.lineHeightPx === "number" && Number.isFinite(style.lineHeightPx)) {
      return { lineHeight: style.lineHeightPx, approximate: true };
    }
    return { lineHeight: fontSize * INTRINSIC_LINE_HEIGHT_FACTOR, approximate: true };
  }

  if (typeof style.lineHeightPx === "number" && Number.isFinite(style.lineHeightPx)) {
    return { lineHeight: style.lineHeightPx };
  }

  return { lineHeight: fontSize * INTRINSIC_LINE_HEIGHT_FACTOR, approximate: true };
}

/** Нормализует line height из Plugin API LineHeight в px. */
export function normalizeLineHeightFromPlugin(
  lineHeight: LineHeight,
  fontSize: number
): NormalizedLineHeight {
  if (lineHeight.unit === "PIXELS") {
    return { lineHeight: lineHeight.value };
  }
  if (lineHeight.unit === "PERCENT") {
    return { lineHeight: (fontSize * lineHeight.value) / 100 };
  }
  // AUTO — Plugin API; best-effort без font metrics
  return { lineHeight: fontSize * INTRINSIC_LINE_HEIGHT_FACTOR, approximate: true };
}

export function buildTypographyComparisonValue(fields: {
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  textCase: TypographyTextCase;
  textDecoration: TypographyTextDecoration;
  lineHeightApproximate?: boolean;
}): TypographyComparisonValue {
  return {
    fontFamily: fields.fontFamily.trim(),
    fontWeight: fields.fontWeight,
    fontSize: fields.fontSize,
    lineHeight: fields.lineHeight,
    letterSpacing: fields.letterSpacing,
    textCase: fields.textCase,
    textDecoration: fields.textDecoration,
    ...(fields.lineHeightApproximate ? { lineHeightApproximate: true } : {}),
  };
}

/** Стабильный ключ для группировки записей типографики. */
export function typographyValueKey(value: TypographyComparisonValue): string {
  return [
    value.fontFamily.toLowerCase(),
    value.fontWeight,
    value.fontSize,
    value.lineHeight,
    value.letterSpacing,
    value.textCase,
    value.textDecoration,
    value.lineHeightApproximate ? "approx-lh" : "exact-lh",
  ].join("|");
}

export function formatTypographyDisplayValue(value: TypographyComparisonValue): string {
  const lhSuffix = value.lineHeightApproximate ? " lh≈" : "";
  return `${value.fontFamily} ${value.fontSize}/${value.lineHeight}${lhSuffix} w${value.fontWeight}`;
}

function isPluginMixed(value: unknown): boolean {
  return value === figma.mixed;
}

function normalizeLetterSpacingFromPlugin(letterSpacing: LetterSpacing, fontSize: number): number {
  if (letterSpacing.unit === "PIXELS") return letterSpacing.value;
  return (fontSize * letterSpacing.value) / 100;
}

function mapPluginTextCase(value: TextCase): TypographyTextCase {
  return normalizeTextCase(value);
}

function mapPluginTextDecoration(value: TextDecoration): TypographyTextDecoration {
  return normalizeTextDecoration(value);
}

export interface ReadTypographyFromNodeResult {
  comparisonValue: TypographyComparisonValue | null;
  typographyUnresolved: boolean;
}

/**
 * Читает resolved типографику с TEXT-ноды (Plugin API).
 * figma.mixed на fontName/fontSize → typographyUnresolved, без throw.
 */
export function readTypographyFromTextNode(node: TextNode): ReadTypographyFromNodeResult {
  let typographyUnresolved = false;

  if (isPluginMixed(node.fontName) || isPluginMixed(node.fontSize) || isPluginMixed(node.fontWeight)) {
    return { comparisonValue: null, typographyUnresolved: true };
  }

  const fontName = node.fontName as FontName;
  const fontSize = node.fontSize as number;
  const fontWeight = node.fontWeight as number;

  if (isPluginMixed(node.lineHeight) || isPluginMixed(node.letterSpacing)) {
    typographyUnresolved = true;
  }

  const lineHeightRaw = isPluginMixed(node.lineHeight)
    ? ({ unit: "AUTO", value: 0 } as LineHeight)
    : (node.lineHeight as LineHeight);
  const { lineHeight, approximate: lineHeightApproximate } = normalizeLineHeightFromPlugin(lineHeightRaw, fontSize);

  const letterSpacing = isPluginMixed(node.letterSpacing)
    ? 0
    : normalizeLetterSpacingFromPlugin(node.letterSpacing as LetterSpacing, fontSize);

  const textCase = isPluginMixed(node.textCase)
    ? "ORIGINAL"
    : mapPluginTextCase(node.textCase as TextCase);
  const textDecoration = isPluginMixed(node.textDecoration)
    ? "NONE"
    : mapPluginTextDecoration(node.textDecoration as TextDecoration);

  if (isPluginMixed(node.textCase) || isPluginMixed(node.textDecoration)) {
    typographyUnresolved = true;
  }

  const comparisonValue = buildTypographyComparisonValue({
    fontFamily: fontName.family,
    fontWeight,
    fontSize,
    lineHeight,
    letterSpacing,
    textCase,
    textDecoration,
    lineHeightApproximate,
  });

  return { comparisonValue, typographyUnresolved };
}

/** Best-effort fontWeight для TextStyle (у TextStyle нет fontWeight — только fontName). */
function inferFontWeightFromFontName(fontName: FontName): number {
  const styleName = fontName.style.toLowerCase();
  if (styleName.includes("thin")) return 100;
  if (styleName.includes("extralight") || styleName.includes("extra light")) return 200;
  if (styleName.includes("light")) return 300;
  if (styleName.includes("medium")) return 500;
  if (styleName.includes("semibold") || styleName.includes("semi bold")) return 600;
  if (styleName.includes("extrabold") || styleName.includes("extra bold")) return 800;
  if (styleName.includes("black")) return 900;
  if (styleName.includes("bold")) return 700;
  return 400;
}

export function readTypographyFromTextStyle(style: TextStyle): TypographyComparisonValue {
  const fontSize = style.fontSize;
  const { lineHeight, approximate } = normalizeLineHeightFromPlugin(style.lineHeight, fontSize);

  const value = buildTypographyComparisonValue({
    fontFamily: style.fontName.family,
    fontWeight: inferFontWeightFromFontName(style.fontName),
    fontSize,
    lineHeight,
    letterSpacing:
      style.letterSpacing.unit === "PIXELS"
        ? style.letterSpacing.value
        : (fontSize * style.letterSpacing.value) / 100,
    textCase: mapPluginTextCase(style.textCase),
    textDecoration: mapPluginTextDecoration(style.textDecoration),
    lineHeightApproximate: approximate,
  });
  return { ...value, fontWeightApproximate: true };
}

export function typographyValuesEqual(
  a: TypographyComparisonValue,
  b: TypographyComparisonValue
): boolean {
  return typographyValueKey(a) === typographyValueKey(b);
}

const PROPERTY_LABELS = {
  fontSize: "fontSize",
  lineHeight: "lineHeight",
  fontFamily: "fontFamily",
  fontWeight: "fontWeight",
  letterSpacing: "letterSpacing",
  textCase: "textCase",
  textDecoration: "textDecoration",
} as const;

function numbersMatch(a: number, b: number, tolerance = 0.01): boolean {
  return Math.abs(a - b) <= tolerance;
}

function fontFamiliesMatch(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function readTypographyComparisonValue(
  value: Record<string, unknown>
): TypographyComparisonValue | null {
  const fontFamily = value.fontFamily;
  const fontSize = value.fontSize;
  const fontWeight = value.fontWeight;
  const lineHeight = value.lineHeight;
  if (
    typeof fontFamily !== "string" ||
    typeof fontSize !== "number" ||
    typeof fontWeight !== "number" ||
    typeof lineHeight !== "number"
  ) {
    return null;
  }
  return {
    fontFamily,
    fontWeight,
    fontSize,
    lineHeight,
    letterSpacing: typeof value.letterSpacing === "number" ? value.letterSpacing : 0,
    textCase: normalizeTextCase(typeof value.textCase === "string" ? value.textCase : undefined),
    textDecoration: normalizeTextDecoration(
      typeof value.textDecoration === "string" ? value.textDecoration : undefined
    ),
    lineHeightApproximate: value.lineHeightApproximate === true,
    fontWeightApproximate: value.fontWeightApproximate === true,
  };
}

/** Критичные свойства для conflict vs name-match. */
export function criticalTypographyMatches(
  layout: TypographyComparisonValue,
  library: TypographyComparisonValue
): boolean {
  return (
    numbersMatch(layout.fontSize, library.fontSize) &&
    numbersMatch(layout.lineHeight, library.lineHeight)
  );
}

export function allTypographyPropertiesMatch(
  layout: TypographyComparisonValue,
  library: TypographyComparisonValue
): boolean {
  return (
    criticalTypographyMatches(layout, library) &&
    fontFamiliesMatch(layout.fontFamily, library.fontFamily) &&
    layout.fontWeight === library.fontWeight &&
    numbersMatch(layout.letterSpacing, library.letterSpacing) &&
    layout.textCase === library.textCase &&
    layout.textDecoration === library.textDecoration
  );
}

/**
 * Список несовпадающих свойств; fontSize всегда первый, если входит в диф.
 */
export function diffTypographyProperties(
  layout: TypographyComparisonValue,
  library: TypographyComparisonValue
): string[] {
  const mismatched: string[] = [];
  if (!numbersMatch(layout.fontSize, library.fontSize)) {
    mismatched.push(PROPERTY_LABELS.fontSize);
  }
  if (!numbersMatch(layout.lineHeight, library.lineHeight)) {
    mismatched.push(PROPERTY_LABELS.lineHeight);
  }
  if (!fontFamiliesMatch(layout.fontFamily, library.fontFamily)) {
    mismatched.push(PROPERTY_LABELS.fontFamily);
  }
  if (layout.fontWeight !== library.fontWeight) {
    mismatched.push(PROPERTY_LABELS.fontWeight);
  }
  if (!numbersMatch(layout.letterSpacing, library.letterSpacing)) {
    mismatched.push(PROPERTY_LABELS.letterSpacing);
  }
  if (layout.textCase !== library.textCase) {
    mismatched.push(PROPERTY_LABELS.textCase);
  }
  if (layout.textDecoration !== library.textDecoration) {
    mismatched.push(PROPERTY_LABELS.textDecoration);
  }
  return mismatched;
}

export function normalizeStyleName(name: string): string {
  return name.trim().toLowerCase();
}

export function readTypographyFromRestTypeStyle(style: RestTypeStyleLike): TypographyComparisonValue | null {
  const fontFamily = style.fontFamily?.trim();
  const fontSize = style.fontSize;
  const fontWeight = style.fontWeight;
  if (!fontFamily || fontSize === undefined || fontWeight === undefined) return null;

  const { lineHeight, approximate } = normalizeLineHeightFromRest(style, fontSize);

  return buildTypographyComparisonValue({
    fontFamily,
    fontWeight,
    fontSize,
    lineHeight,
    letterSpacing: typeof style.letterSpacing === "number" ? style.letterSpacing : 0,
    textCase: normalizeTextCase(style.textCase),
    textDecoration: normalizeTextDecoration(style.textDecoration),
    lineHeightApproximate: approximate,
  });
}
