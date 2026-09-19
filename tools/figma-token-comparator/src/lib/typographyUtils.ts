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
  partiallyMixed?: boolean;
  partiallyMixedFields?: Array<"letterSpacing" | "textCase" | "textDecoration">;
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
    ...(fields.partiallyMixed ? { partiallyMixed: true } : {}),
    ...(fields.partiallyMixedFields && fields.partiallyMixedFields.length > 0
      ? { partiallyMixedFields: fields.partiallyMixedFields }
      : {}),
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

/** Кусок текста с одинаковой типографикой — поля `getStyledTextSegments`. */
export interface TextSegmentTypography {
  fontName: FontName;
  fontSize: number;
  fontWeight: number;
  lineHeight: LineHeight;
}

/** Сколько вариантов показывать; остальные — «ещё N». */
const MAX_SEGMENT_VARIANTS = 4;

/**
 * Разные типографики внутри одного текстового слоя — для строки «Смешанные
 * значения»: без них непонятно, что именно смешано. По одному на вариант,
 * в порядке появления в тексте; сколько символов у каждого — в скобках.
 */
export function summarizeTextSegments(
  segments: ReadonlyArray<TextSegmentTypography & { characters?: string; start?: number; end?: number }>
): string[] {
  const variants = new Map<string, number>();
  for (const segment of segments) {
    const { lineHeight, approximate } = normalizeLineHeightFromPlugin(segment.lineHeight, segment.fontSize);
    const label = formatTypographyDisplayValue(
      buildTypographyComparisonValue({
        fontFamily: segment.fontName.family,
        fontWeight: segment.fontWeight,
        fontSize: segment.fontSize,
        lineHeight: Math.round(lineHeight * 100) / 100,
        letterSpacing: 0,
        textCase: "ORIGINAL",
        textDecoration: "NONE",
        lineHeightApproximate: approximate,
      })
    );
    const length =
      segment.start !== undefined && segment.end !== undefined
        ? segment.end - segment.start
        : segment.characters?.length ?? 0;
    variants.set(label, (variants.get(label) ?? 0) + length);
  }
  const lines = [...variants].map(([label, length]) => `${label} (${length} симв.)`);
  if (lines.length <= MAX_SEGMENT_VARIANTS) return lines;
  return [...lines.slice(0, MAX_SEGMENT_VARIANTS), `ещё ${lines.length - MAX_SEGMENT_VARIANTS}`];
}

export interface ReadTypographyFromNodeResult {
  comparisonValue: TypographyComparisonValue | null;
  typographyUnresolved: boolean;
}

type NonCriticalTypographyField = "letterSpacing" | "textCase" | "textDecoration";

/**
 * Читает resolved типографику с TEXT-ноды (Plugin API).
 * figma.mixed на критичных полях → typographyUnresolved, без throw.
 *
 * Критичные: fontFamily, fontSize, fontWeight, lineHeight.
 * Некритичные (только для подписи): letterSpacing, textCase, textDecoration.
 */
export function readTypographyFromTextNode(node: TextNode): ReadTypographyFromNodeResult {
  if (isPluginMixed(node.fontName) || isPluginMixed(node.fontSize) || isPluginMixed(node.fontWeight)) {
    return { comparisonValue: null, typographyUnresolved: true };
  }

  const fontName = node.fontName as FontName;
  const fontSize = node.fontSize as number;
  const fontWeight = node.fontWeight as number;

  const lineHeightMixed = isPluginMixed(node.lineHeight);
  const letterSpacingMixed = isPluginMixed(node.letterSpacing);
  const textCaseMixed = isPluginMixed(node.textCase);
  const textDecorationMixed = isPluginMixed(node.textDecoration);

  const typographyUnresolved = lineHeightMixed;

  const lineHeightRaw = lineHeightMixed
    ? ({ unit: "AUTO", value: 0 } as LineHeight)
    : (node.lineHeight as LineHeight);
  const { lineHeight, approximate: lineHeightApproximate } = normalizeLineHeightFromPlugin(lineHeightRaw, fontSize);

  const letterSpacing = letterSpacingMixed
    ? 0
    : normalizeLetterSpacingFromPlugin(node.letterSpacing as LetterSpacing, fontSize);

  const textCase = textCaseMixed ? "ORIGINAL" : mapPluginTextCase(node.textCase as TextCase);
  const textDecoration = textDecorationMixed
    ? "NONE"
    : mapPluginTextDecoration(node.textDecoration as TextDecoration);

  const partiallyMixedFields: NonCriticalTypographyField[] = [];
  if (letterSpacingMixed) partiallyMixedFields.push("letterSpacing");
  if (textCaseMixed) partiallyMixedFields.push("textCase");
  if (textDecorationMixed) partiallyMixedFields.push("textDecoration");

  const comparisonValue = buildTypographyComparisonValue({
    fontFamily: fontName.family,
    fontWeight,
    fontSize,
    lineHeight,
    letterSpacing,
    textCase,
    textDecoration,
    lineHeightApproximate,
    ...(partiallyMixedFields.length > 0
      ? { partiallyMixed: true, partiallyMixedFields }
      : {}),
  });

  return { comparisonValue, typographyUnresolved };
}

/**
 * Best-effort fontWeight для TextStyle: у TextStyle нет числового веса, есть
 * только имя начертания.
 *
 * Порядок проверок — от более специфичного к менее специфичному, иначе
 * составные имена попадают не в свою строку: «Demi Bold» и «Ultra Bold»
 * содержат «bold», «Ultra Light» содержит «light». Результат всегда
 * помечается как приблизительный (см. readTypographyFromTextStyle) — точным
 * этот вывод быть не может, шрифты называют начертания как хотят.
 */
const FONT_WEIGHT_BY_STYLE_NAME: Array<[readonly string[], number]> = [
  [["hairline", "thin"], 100],
  [["extralight", "extra light", "ultralight", "ultra light"], 200],
  [["semilight", "semi light", "demilight", "demi light", "light"], 300],
  [["semibold", "semi bold", "demibold", "demi bold"], 600],
  [["extrabold", "extra bold", "ultrabold", "ultra bold"], 800],
  [["black", "heavy", "fat", "poster"], 900],
  [["medium"], 500],
  [["bold"], 700],
  [["book", "roman", "normal", "regular"], 400],
];

function inferFontWeightFromFontName(fontName: FontName): number {
  const styleName = fontName.style.toLowerCase();
  for (const [needles, weight] of FONT_WEIGHT_BY_STYLE_NAME) {
    if (needles.some((needle) => styleName.includes(needle))) return weight;
  }
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

/**
 * Эквивалентность двух значений типографики.
 *
 * Если хотя бы одна сторона несёт вес, выведенный из имени начертания
 * (`fontWeightApproximate`), вес из сравнения исключается: строгое сравнение
 * угаданного числа с настоящим давало ложные расхождения на любом шрифте с
 * нестандартным именем начертания. Расхождение веса при этом не теряется —
 * его ловит основное сравнение с библиотекой, где вес приходит из REST API
 * настоящим числом.
 *
 * ВАЖНО: `typographyValueKey` при этом не меняется — он определяет ключ
 * группировки записей макета, то есть идентификаторы, к которым привязаны
 * сохранённые решения.
 */
export function typographyValuesEqual(
  a: TypographyComparisonValue,
  b: TypographyComparisonValue
): boolean {
  if (typographyValueKey(a) === typographyValueKey(b)) return true;
  if (!a.fontWeightApproximate && !b.fontWeightApproximate) return false;

  const withoutWeight = (value: TypographyComparisonValue) =>
    typographyValueKey({ ...value, fontWeight: 0 });
  return withoutWeight(a) === withoutWeight(b);
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
    partiallyMixed: value.partiallyMixed === true,
    ...(Array.isArray(value.partiallyMixedFields) && value.partiallyMixedFields.length > 0
      ? {
          partiallyMixedFields: value.partiallyMixedFields.filter(
            (field): field is NonCriticalTypographyField =>
              field === "letterSpacing" || field === "textCase" || field === "textDecoration"
          ),
        }
      : {}),
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
