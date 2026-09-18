/**
 * Конструкторы тестовых данных для юнит-тестов компараторов.
 *
 * Цель — чтобы в самом тесте оставалось видно только то, что он проверяет:
 * статус, имя, значение. Всё обязательное, но неинтересное для конкретной
 * проверки (пути нод, счётчики, id) заполняется значениями по умолчанию.
 */

import type {
  BindingType,
  LayoutRecord,
  LayoutRecordModeValue,
  LibraryTextStyle,
  LibraryToken,
  LibraryTokenModeValue,
  TypographyComparisonValue,
} from "../src/comparators/types";

/** Коллекция, из которой компаратор берёт кандидатов для «Предлагаем». */
export const SEMANTIC_COLLECTION = "color-sem";

export function colorRecord(overrides: Partial<LayoutRecord> & { hex: string }): LayoutRecord {
  const { hex, ...rest } = overrides;
  const alpha = (rest.comparisonValue?.alpha as number) ?? 1;
  return {
    id: rest.id ?? `record-${hex}`,
    category: "colors",
    property: "fill",
    bindingType: "hardcoded",
    displayValue: hex,
    comparisonValue: { hex, alpha },
    sourceName: "",
    count: 1,
    representativeNodePath: "Page / Frame",
    representativeNodeName: "Layer",
    nodeIds: ["1:1"],
    ...rest,
  };
}

export function mode(
  modeName: string,
  hex: string,
  extra?: { alpha?: number; unresolved?: boolean }
): LibraryTokenModeValue {
  return {
    modeId: `mode-${modeName.toLowerCase()}`,
    modeName,
    displayValue: hex,
    comparisonValue: { hex, alpha: extra?.alpha ?? 1 },
    ...(extra?.unresolved ? { unresolved: true } : {}),
  };
}

export function layoutMode(modeName: string, hex: string, alpha = 1): LayoutRecordModeValue {
  return {
    modeId: `mode-${modeName.toLowerCase()}`,
    modeName,
    displayValue: hex,
    comparisonValue: { hex, alpha },
  };
}

export function libraryToken(overrides: Partial<LibraryToken> & { name: string }): LibraryToken {
  return {
    variableId: overrides.variableId ?? `var-${overrides.name}`,
    key: overrides.key ?? `key-${overrides.name}`,
    collectionId: "collection-1",
    collectionName: SEMANTIC_COLLECTION,
    resolvedType: "COLOR",
    modes: [mode("Day", "#FFFFFF")],
    scopes: ["ALL_SCOPES"],
    ...overrides,
  };
}

export function typographyValue(
  overrides: Partial<TypographyComparisonValue> = {}
): TypographyComparisonValue {
  return {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    textCase: "ORIGINAL",
    textDecoration: "NONE",
    ...overrides,
  };
}

export function typographyRecord(
  overrides: Partial<LayoutRecord> & { value?: TypographyComparisonValue } = {}
): LayoutRecord {
  const { value, ...rest } = overrides;
  const comparisonValue = (value ?? typographyValue()) as unknown as Record<string, unknown>;
  return {
    id: rest.id ?? "typo-record",
    category: "typography",
    property: "text-style",
    bindingType: "style" as BindingType,
    displayValue: "Inter 14/20 w400",
    comparisonValue,
    sourceName: "body/m",
    count: 1,
    representativeNodePath: "Page / Frame",
    representativeNodeName: "Text",
    nodeIds: ["2:2"],
    ...rest,
  };
}

export function libraryTextStyle(
  overrides: Partial<LibraryTextStyle> & { name: string }
): LibraryTextStyle {
  return {
    nodeId: overrides.nodeId ?? `node-${overrides.name}`,
    key: overrides.key ?? `key-${overrides.name}`,
    displayValue: overrides.displayValue ?? "Inter 14/20 w400",
    comparisonValue: overrides.comparisonValue ?? typographyValue(),
    ...overrides,
  };
}
