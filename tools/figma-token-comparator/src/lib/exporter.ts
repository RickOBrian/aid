/**
 * Экспорт таблицы маппинга в CSV и JSON.
 *
 * Чистые функции без побочных эффектов — вызываются из ui.ts, где есть
 * доступ к DOM/Blob (iframe UI плагина). Сам code.ts (главный поток) не
 * имеет DOM, поэтому здесь нет ничего, что предполагает браузерное окружение.
 */

import type { ComparisonResult, Decision, TokenCategory } from "../comparators/types";

export interface ExportRow {
  layer: string;
  nodePath: string;
  before: string;
  beforeDay: string;
  beforeNight: string;
  binding: string;
  target: string;
  targetDay: string;
  targetNight: string;
  decision: string;
  comment: string;
  timestamp: string;
  proposedValueForMode: string;
  proposedMode: string;
  /** Типографика: какие свойства разошлись с предложенным стилем. */
  mismatched: string;
}

const BINDING_LABELS: Record<string, string> = {
  variable: "Variable",
  style: "Style",
  hardcoded: "Hardcoded",
  ghost: "Ghost",
};

const DECISION_LABELS: Record<Decision, string> = {
  mapped_suggested: "Mapped (suggested)",
  mapped: "Mapped (custom)",
  ignored: "Ignored",
  candidate: "Candidate",
  value_fix_proposed: "Value fix proposed",
};

interface NamedModeValue {
  modeName: string;
  displayValue: string;
  unresolved?: boolean;
}

/** День/ночь по имени режима (Day/Light, Night/Dark), либо позиционный фолбэк. */
function pickModeValue(modes: NamedModeValue[], wantDay: boolean): string {
  if (modes.length === 0) return "";
  const normalized = (name: string) => name.trim().toLowerCase();
  const byName = modes.find((mode) =>
    wantDay
      ? normalized(mode.modeName) === "day" || normalized(mode.modeName) === "light"
      : normalized(mode.modeName) === "night" || normalized(mode.modeName) === "dark"
  );
  const mode = byName ?? (wantDay ? modes[0] : modes[1]);
  if (!mode) return "";
  return mode.unresolved ? "значение не получено" : mode.displayValue;
}

/** Day/Night значения макета — из resolved-режимов переменной, либо одно и то же значение для hardcoded/style/ghost (оно не зависит от режима). */
function extractBeforeModeValues(result: ComparisonResult): { day: string; night: string } {
  if (result.modeValues && result.modeValues.length > 0) {
    return { day: pickModeValue(result.modeValues, true), night: pickModeValue(result.modeValues, false) };
  }
  if (result.bindingType === "hardcoded" || result.bindingType === "style" || result.bindingType === "ghost") {
    return { day: result.displayValue, night: result.displayValue };
  }
  return { day: "", night: "" };
}

/** Day/Night значения предложенного токена библиотеки. */
function extractTargetModeValues(result: ComparisonResult): { day: string; night: string } {
  if (!result.target) return { day: "", night: "" };
  const modes: NamedModeValue[] =
    result.target.allModes && result.target.allModes.length > 0
      ? result.target.allModes
      : [
          {
            modeName: result.target.modeName,
            displayValue: result.target.displayValue,
            unresolved: result.target.valueUnresolved,
          },
        ];
  return { day: pickModeValue(modes, true), night: pickModeValue(modes, false) };
}

/** Имя предложенного токена; коллекция добавляется, только если она есть. */
function formatTargetName(result: ComparisonResult): string {
  if (!result.target) return "";
  const collection = result.target.collectionName?.trim();
  return collection ? `${result.target.name} (${collection})` : result.target.name;
}

export function buildExportRows(results: ComparisonResult[]): ExportRow[] {
  return results.map((result) => {
    const before = extractBeforeModeValues(result);
    const target = extractTargetModeValues(result);
    return {
      layer: result.representativeNodeName,
      nodePath: result.representativeNodePath,
      before: result.sourceName || result.displayValue,
      beforeDay: before.day,
      beforeNight: before.night,
      binding: BINDING_LABELS[result.bindingType] ?? result.bindingType,
      target: formatTargetName(result),
      targetDay: target.day,
      targetNight: target.night,
      decision: result.decision ? DECISION_LABELS[result.decision] : "",
      comment: result.decisionComment ?? "",
      timestamp: result.decisionTimestamp ?? "",
      proposedValueForMode:
        result.decision === "value_fix_proposed" ? (result.decisionProposedValue ?? "") : "",
      proposedMode:
        result.decision === "value_fix_proposed" ? (result.decisionProposedModeName ?? "") : "",
      mismatched: result.mismatchedProperties?.join(", ") ?? "",
    };
  });
}

const COLOR_COLUMNS: Array<[keyof ExportRow, string]> = [
  ["layer", "Layer"],
  ["nodePath", "Node Path"],
  ["before", "Сейчас"],
  ["beforeDay", "Сейчас Day"],
  ["beforeNight", "Сейчас Night"],
  ["binding", "Binding"],
  ["target", "Предлагаем"],
  ["targetDay", "Предлагаем Day"],
  ["targetNight", "Предлагаем Night"],
  ["decision", "Решение"],
  ["proposedMode", "Для режима"],
  ["proposedValueForMode", "Предлагаемое значение"],
  ["comment", "Комментарий"],
  ["timestamp", "Дата решения"],
];

/**
 * У типографики нет режимов библиотеки, зато есть перечень разошедшихся
 * свойств — колонки отличаются, поэтому набор выбирается по категории, а не
 * один на всех с пустыми ячейками.
 */
const TYPOGRAPHY_COLUMNS: Array<[keyof ExportRow, string]> = [
  ["layer", "Layer"],
  ["nodePath", "Node Path"],
  ["before", "Сейчас"],
  ["binding", "Binding"],
  ["target", "Предлагаем"],
  ["mismatched", "Что расходится"],
  ["decision", "Решение"],
  ["proposedValueForMode", "Предлагаемое значение"],
  ["comment", "Комментарий"],
  ["timestamp", "Дата решения"],
];

/**
 * Единый источник состава и порядка колонок — используется CSV/JSON/MD
 * экспортом ниже, а также визуальной Figma-таблицей (см. figmaTableBuilder.ts),
 * чтобы не дублировать список полей в нескольких местах.
 */
export function exportColumns(category: TokenCategory): Array<[keyof ExportRow, string]> {
  return category === "typography" ? TYPOGRAPHY_COLUMNS : COLOR_COLUMNS;
}

function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCSV(rows: ExportRow[], category: TokenCategory): string {
  const columns = exportColumns(category);
  const header = columns.map(([, label]) => escapeCsvCell(label)).join(",");
  const lines = rows.map((row) => columns.map(([key]) => escapeCsvCell(row[key])).join(","));
  return [header, ...lines].join("\r\n");
}

/**
 * JSON отдаёт те же поля, что CSV и MD: иначе в выгрузке типографики лежали
 * бы пустые колонки режимов, которых у неё не бывает.
 */
export function toJSON(rows: ExportRow[], category: TokenCategory): string {
  const columns = exportColumns(category);
  const projected = rows.map((row) =>
    Object.fromEntries(columns.map(([key]) => [key, row[key]]))
  );
  return JSON.stringify(projected, null, 2);
}

function escapeMdCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ").replace(/\r/g, "");
}

export function toMarkdown(rows: ExportRow[], category: TokenCategory): string {
  const columns = exportColumns(category);
  const header = columns.map(([, label]) => escapeMdCell(label)).join(" | ");
  const separator = columns.map(() => "---").join(" | ");
  const body = rows.map((row) => columns.map(([key]) => escapeMdCell(row[key])).join(" | "));
  return [
    "# Token Comparator — mapping",
    "",
    `| ${header} |`,
    `| ${separator} |`,
    ...body.map((line) => `| ${line} |`),
    "",
  ].join("\n");
}
