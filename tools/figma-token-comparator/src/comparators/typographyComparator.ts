/**
 * Comparator для категории Typography.
 *
 * Приоритет статуса:
 * 1. mapped — подтверждённый маппинг из mappingHistory
 * 2. mixed-unresolved — typographyUnresolved / figma.mixed
 * 3. exact — textStyleId/styleKey совпал с библиотечным Text Style
 * 4. name-match / conflict — имя совпало; критичные (fontSize/lineHeight) vs некритичные свойства
 * 5. name-mismatch — стиль применён, свойства совпали с другим semantic-токеном по имени
 * 6. value — все свойства совпали с semantic-токеном без прямой привязки стиля
 * 7. layout-only — UI: Hardcoded (no analog) для hardcoded; Ghost style для ghost
 */

import { filterSemanticTypographyStyles } from "../lib/semanticTypographyLibrary";
import {
  allTypographyPropertiesMatch,
  criticalTypographyMatches,
  diffTypographyProperties,
  normalizeStyleName,
  readTypographyComparisonValue,
} from "../lib/typographyUtils";
import type {
  ComparisonResult,
  ComparisonTarget,
  ITokenComparator,
  LayoutRecord,
  LibraryTextStyle,
  ScanScope,
  StoredDecision,
  TypographyComparisonValue,
} from "./types";
import { scanTypography } from "../lib/scanner";

export function isUsingLibraryTextStyle(record: LayoutRecord, library: LibraryTextStyle[]): boolean {
  if (record.bindingType !== "style") return false;

  const libraryIds = new Set(library.map((style) => style.styleId));
  const libraryKeys = new Set(library.map((style) => style.key));

  if (record.styleId && libraryIds.has(record.styleId)) return true;
  if (record.styleKey && libraryKeys.has(record.styleKey)) return true;
  return false;
}

export function requiresTypographyUserAction(
  result: ComparisonResult,
  library: LibraryTextStyle[]
): boolean {
  if (result.decision === "ignored" || result.decision === "mapped" || result.decision === "mapped_suggested") {
    return false;
  }

  switch (result.bindingType) {
    case "hardcoded":
      return true;
    case "style":
    case "ghost":
      return !isUsingLibraryTextStyle(result, library);
    default:
      return true;
  }
}

function toTypographyTarget(style: LibraryTextStyle): ComparisonTarget {
  return {
    variableId: "",
    collectionName: "",
    modeId: "",
    modeName: "",
    styleId: style.styleId,
    styleKey: style.key,
    name: style.name,
    displayValue: style.displayValue,
  };
}

function readLayoutTypography(record: LayoutRecord): TypographyComparisonValue | null {
  return readTypographyComparisonValue(record.comparisonValue);
}

function findExactLibraryStyle(
  record: LayoutRecord,
  library: LibraryTextStyle[]
): LibraryTextStyle | undefined {
  if (record.styleId) {
    const byId = library.find((style) => style.styleId === record.styleId);
    if (byId) return byId;
  }
  if (record.styleKey) {
    const byKey = library.find((style) => style.key === record.styleKey);
    if (byKey) return byKey;
  }
  return undefined;
}

function findByNormalizedName(
  sourceName: string,
  library: LibraryTextStyle[]
): LibraryTextStyle | undefined {
  const normalized = normalizeStyleName(sourceName);
  return library.find((style) => normalizeStyleName(style.name) === normalized);
}

function findValueMatch(
  layout: TypographyComparisonValue,
  library: LibraryTextStyle[]
): LibraryTextStyle | undefined {
  return library.find((style) => allTypographyPropertiesMatch(layout, style.comparisonValue));
}

/** Ближайший semantic-токен по fontSize (точное совпадение px); иначе undefined. */
function findFontSizeFallbackTarget(
  layout: TypographyComparisonValue,
  library: LibraryTextStyle[]
): LibraryTextStyle | undefined {
  const candidates = library.filter(
    (style) => Math.abs(style.comparisonValue.fontSize - layout.fontSize) < 0.01
  );
  if (candidates.length === 0) return undefined;
  if (candidates.length === 1) return candidates[0];

  return candidates
    .slice()
    .sort(
      (a, b) =>
        Math.abs(a.comparisonValue.lineHeight - layout.lineHeight) -
        Math.abs(b.comparisonValue.lineHeight - layout.lineHeight)
    )[0];
}

function findRecordStatus(
  record: LayoutRecord,
  library: LibraryTextStyle[]
): {
  status: ComparisonResult["status"];
  target?: ComparisonTarget;
  mismatchedProperties?: string[];
} {
  const suggestionLibrary = filterSemanticTypographyStyles(library);

  if (record.typographyUnresolved) {
    return { status: "mixed-unresolved" };
  }

  const layoutValue = readLayoutTypography(record);
  if (!layoutValue) {
    return { status: "mixed-unresolved" };
  }

  // 3. Exact — textStyleId/styleKey из библиотеки.
  const exactStyle = findExactLibraryStyle(record, library);
  if (exactStyle && record.bindingType === "style") {
    return { status: "exact", target: toTypographyTarget(exactStyle) };
  }

  // 4. Name match / conflict / name-mismatch — по имени применённого стиля.
  if (record.sourceName && (record.bindingType === "style" || record.bindingType === "ghost")) {
    const nameMatch = findByNormalizedName(record.sourceName, suggestionLibrary);
    if (nameMatch) {
      const mismatched = diffTypographyProperties(layoutValue, nameMatch.comparisonValue);
      if (mismatched.length === 0) {
        return { status: "exact", target: toTypographyTarget(nameMatch) };
      }
      const status = criticalTypographyMatches(layoutValue, nameMatch.comparisonValue)
        ? "name-match"
        : "conflict";
      return {
        status,
        target: toTypographyTarget(nameMatch),
        mismatchedProperties: mismatched,
      };
    }

    const valueMatch = findValueMatch(layoutValue, suggestionLibrary);
    if (valueMatch && normalizeStyleName(valueMatch.name) !== normalizeStyleName(record.sourceName)) {
      return {
        status: "name-mismatch",
        target: toTypographyTarget(valueMatch),
        mismatchedProperties: diffTypographyProperties(layoutValue, valueMatch.comparisonValue),
      };
    }

    const fontSizeFallback = findFontSizeFallbackTarget(layoutValue, suggestionLibrary);
    return {
      status: "name-mismatch",
      target: fontSizeFallback ? toTypographyTarget(fontSizeFallback) : undefined,
      mismatchedProperties: fontSizeFallback
        ? diffTypographyProperties(layoutValue, fontSizeFallback.comparisonValue)
        : undefined,
    };
  }

  // 5. Value match — все свойства совпали, прямой привязки нет.
  const valueMatch = findValueMatch(layoutValue, suggestionLibrary);
  if (valueMatch) {
    return { status: "value", target: toTypographyTarget(valueMatch) };
  }

  // 6. Нет совпадений.
  return { status: "layout-only" };
}

function applyHistory(
  record: LayoutRecord,
  result: Omit<ComparisonResult, keyof LayoutRecord>,
  history: Record<string, StoredDecision>,
  library: LibraryTextStyle[]
): ComparisonResult {
  const stored = history[record.id];
  const fontWeightApproximate = readLayoutTypography(record)?.fontWeightApproximate === true;

  if (!stored) {
    return {
      ...record,
      ...result,
      fontWeightApproximate: fontWeightApproximate || undefined,
    };
  }

  const withDecision: ComparisonResult = {
    ...record,
    ...result,
    decision: stored.decision,
    decisionComment: stored.comment,
    decisionTargetVariableId: stored.targetVariableId,
    decisionTargetStyleId: stored.targetStyleId,
    decisionTimestamp: stored.timestamp,
    fontWeightApproximate: fontWeightApproximate || undefined,
  };

  const mappedStyleId = stored.targetStyleId ?? stored.targetVariableId;
  if ((stored.decision === "mapped" || stored.decision === "mapped_suggested") && mappedStyleId) {
    const targetStyle = library.find((style) => style.styleId === mappedStyleId);
    if (targetStyle) {
      withDecision.status = "mapped";
      withDecision.target = toTypographyTarget(targetStyle);
      withDecision.mismatchedProperties = undefined;
    }
  }

  if (stored.applyPartial) {
    withDecision.applyPartial = true;
    withDecision.applySkips = stored.applySkips;
  }

  return withDecision;
}

export function computeTypographyComparisonResults(
  records: LayoutRecord[],
  library: LibraryTextStyle[],
  history: Record<string, StoredDecision>
): ComparisonResult[] {
  return records.map((record) => {
    const computed = findRecordStatus(record, library);
    return applyHistory(record, computed, history, library);
  });
}

export function compareTypographyWithLibrary(
  records: LayoutRecord[],
  library: LibraryTextStyle[],
  history: Record<string, StoredDecision>
): ComparisonResult[] {
  return computeTypographyComparisonResults(records, library, history).filter((result) =>
    requiresTypographyUserAction(result, library)
  );
}

export const typographyComparator: ITokenComparator<ScanScope, LibraryTextStyle> = {
  category: "typography",
  async scanLayout(scope: ScanScope): Promise<LayoutRecord[]> {
    return scanTypography(scope);
  },
  compareWithLibrary(
    records: LayoutRecord[],
    library: LibraryTextStyle[],
    history: Record<string, StoredDecision>
  ): ComparisonResult[] {
    return compareTypographyWithLibrary(records, library, history);
  },
};
