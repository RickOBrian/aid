/**
 * Применение типографики в макет (apply-to-layout для категории Typography).
 */

import type { LayoutRecord, TypographyComparisonValue } from "../comparators/types";
import { readTypographyComparisonValue } from "./typographyUtils";

function weightToFigmaStyle(fontWeight: number): string {
  if (fontWeight >= 700) return "Bold";
  if (fontWeight >= 600) return "SemiBold";
  if (fontWeight >= 500) return "Medium";
  if (fontWeight <= 300) return "Light";
  return "Regular";
}

export function fontNameFromTypographyValue(value: TypographyComparisonValue): FontName {
  return { family: value.fontFamily, style: weightToFigmaStyle(value.fontWeight) };
}

export interface TypographyApplySkip {
  nodeId: string;
  reason: string;
}

export interface TypographyApplyBatchResult {
  applied: number;
  skipped: TypographyApplySkip[];
  appliedNodeIds: string[];
}

function isMixedSymbol(value: unknown): boolean {
  return value === figma.mixed;
}

export function isTextNodeMixedUnresolved(node: TextNode): boolean {
  return isMixedSymbol(node.fontSize) || isMixedSymbol(node.fontName);
}

function lineHeightFromComparisonValue(value: TypographyComparisonValue): LineHeight {
  return { unit: "PIXELS", value: value.lineHeight };
}

function letterSpacingFromComparisonValue(value: TypographyComparisonValue): LetterSpacing {
  if (Math.abs(value.letterSpacing) < 0.0001) {
    return { unit: "PIXELS", value: 0 };
  }
  return { unit: "PIXELS", value: value.letterSpacing };
}

function mapTextCase(value: TypographyComparisonValue): TextCase {
  switch (value.textCase) {
    case "UPPER":
      return "UPPER";
    case "LOWER":
      return "LOWER";
    case "TITLE":
      return "TITLE";
    case "SMALL_CAPS":
      return "SMALL_CAPS";
    case "SMALL_CAPS_FORCED":
      return "SMALL_CAPS_FORCED";
    default:
      return "ORIGINAL";
  }
}

function mapTextDecoration(value: TypographyComparisonValue): TextDecoration {
  switch (value.textDecoration) {
    case "UNDERLINE":
      return "UNDERLINE";
    case "STRIKETHROUGH":
      return "STRIKETHROUGH";
    default:
      return "NONE";
  }
}

/** Применяет свойства типографики без привязки к Text Style (value_fix_proposed). */
export async function applyTypographyPropertiesToNode(
  node: TextNode,
  value: TypographyComparisonValue,
  fontName: FontName
): Promise<void> {
  await figma.loadFontAsync(fontName);
  node.fontName = fontName;
  node.fontSize = value.fontSize;
  node.lineHeight = lineHeightFromComparisonValue(value);
  node.letterSpacing = letterSpacingFromComparisonValue(value);
  node.textCase = mapTextCase(value);
  node.textDecoration = mapTextDecoration(value);
}

/** Привязывает опубликованный Text Style к TEXT-ноде. */
export async function applyImportedTextStyleToNode(
  node: TextNode,
  importedStyle: TextStyle
): Promise<void> {
  await figma.loadFontAsync(importedStyle.fontName);
  node.textStyleId = importedStyle.id;
}

export async function applyTypographyToNodeIds(options: {
  record: LayoutRecord;
  nodeIds: string[];
  skipNodeIds: Set<string>;
  mode: "style" | "properties";
  importedStyle?: TextStyle;
  propertyValue?: TypographyComparisonValue;
  propertyFontName?: FontName;
  resolveNode: (nodeId: string) => Promise<SceneNode | null>;
}): Promise<TypographyApplyBatchResult> {
  const skipped: TypographyApplySkip[] = [];
  const appliedNodeIds: string[] = [];
  let applied = 0;

  if (options.record.typographyUnresolved) {
    for (const nodeId of options.nodeIds) {
      if (options.skipNodeIds.has(nodeId)) continue;
      skipped.push({
        nodeId,
        reason:
          "Не может быть применено автоматически, требует ручной правки (mixed typography в группе).",
      });
    }
    return { applied, skipped, appliedNodeIds };
  }

  for (const nodeId of options.nodeIds) {
    if (options.skipNodeIds.has(nodeId)) continue;

    try {
      let node = await options.resolveNode(nodeId);
      if (!node) {
        await figma.loadAllPagesAsync();
        node = await options.resolveNode(nodeId);
      }
      if (!node || node.type !== "TEXT") {
        skipped.push({
          nodeId,
          reason: "Слой не найден или не является TEXT — возможно, удалён с момента скана.",
        });
        continue;
      }

      const textNode = node as TextNode;
      if (isTextNodeMixedUnresolved(textNode)) {
        skipped.push({
          nodeId,
          reason:
            "Не может быть применено автоматически, требует ручной правки (figma.mixed для fontSize/fontName).",
        });
        continue;
      }

      if (options.mode === "style") {
        if (!options.importedStyle) {
          skipped.push({ nodeId, reason: "Целевой Text Style не импортирован." });
          continue;
        }
        await applyImportedTextStyleToNode(textNode, options.importedStyle);
      } else {
        if (!options.propertyValue || !options.propertyFontName) {
          skipped.push({ nodeId, reason: "Нет целевых свойств типографики для применения." });
          continue;
        }
        await applyTypographyPropertiesToNode(
          textNode,
          options.propertyValue,
          options.propertyFontName
        );
      }

      applied += 1;
      appliedNodeIds.push(nodeId);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Неизвестная ошибка при применении типографики.";
      skipped.push({ nodeId, reason });
    }
  }

  return { applied, skipped, appliedNodeIds };
}

export function readRecordTypographyValue(record: LayoutRecord): TypographyComparisonValue | null {
  return readTypographyComparisonValue(record.comparisonValue);
}
