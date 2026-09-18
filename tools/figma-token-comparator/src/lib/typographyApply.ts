/**
 * Применение типографики в макет (apply-to-layout для категории Typography).
 *
 * Единственная операция — привязать к слоям опубликованный Text Style
 * библиотеки. Режим «применить свойства без стиля» удалён вместе с находкой
 * №20: он существовал только ради решения «предложить правку значения», где
 * применял слоям их же собственные значения.
 */

import type { LayoutRecord, TypographyComparisonValue } from "../comparators/types";
import { readTypographyComparisonValue } from "./typographyUtils";

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

/**
 * Привязывает опубликованный Text Style к TEXT-ноде.
 *
 * Только через `setTextStyleIdAsync`: при `documentAccess: "dynamic-page"`
 * присваивание `textStyleId` бросает исключение (находка №23).
 */
export async function applyImportedTextStyleToNode(
  node: TextNode,
  importedStyle: TextStyle
): Promise<void> {
  await figma.loadFontAsync(importedStyle.fontName);
  await node.setTextStyleIdAsync(importedStyle.id);
}

export async function applyTypographyToNodeIds(options: {
  record: LayoutRecord;
  nodeIds: string[];
  skipNodeIds: Set<string>;
  importedStyle?: TextStyle;
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

      if (!options.importedStyle) {
        skipped.push({ nodeId, reason: "Целевой Text Style не импортирован." });
        continue;
      }
      await applyImportedTextStyleToNode(textNode, options.importedStyle);

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
