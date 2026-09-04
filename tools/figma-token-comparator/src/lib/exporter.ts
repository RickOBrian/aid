/**
 * Экспорт таблицы маппинга в CSV и JSON.
 *
 * Чистые функции без побочных эффектов — вызываются из ui.ts, где есть
 * доступ к DOM/Blob (iframe UI плагина). Сам code.ts (главный поток) не
 * имеет DOM, поэтому здесь нет ничего, что предполагает браузерное окружение.
 */

import type { ComparisonResult, Decision } from "../comparators/types";

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
      target: result.target ? `${result.target.name} (${result.target.collectionName})` : "",
      targetDay: target.day,
      targetNight: target.night,
      decision: result.decision ? DECISION_LABELS[result.decision] : "",
      comment: result.decisionComment ?? "",
      timestamp: result.decisionTimestamp ?? "",
      proposedValueForMode:
        result.decision === "value_fix_proposed" ? (result.decisionProposedValue ?? "") : "",
      proposedMode:
        result.decision === "value_fix_proposed" ? (result.decisionProposedModeName ?? "") : "",
    };
  });
}

/**
 * Единый источник состава и порядка колонок — используется CSV/MD экспортом
 * ниже, а также визуальной Figma-таблицей (см. src/lib/figmaTableBuilder.ts),
 * чтобы не дублировать список полей в нескольких местах.
 */
export const EXPORT_COLUMNS: Array<[keyof ExportRow, string]> = [
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

function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCSV(rows: ExportRow[]): string {
  const header = EXPORT_COLUMNS.map(([, label]) => escapeCsvCell(label)).join(",");
  const lines = rows.map((row) => EXPORT_COLUMNS.map(([key]) => escapeCsvCell(row[key])).join(","));
  return [header, ...lines].join("\r\n");
}

export function toJSON(rows: ExportRow[]): string {
  return JSON.stringify(rows, null, 2);
}

function escapeMdCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ").replace(/\r/g, "");
}

export function toMarkdown(rows: ExportRow[]): string {
  const header = EXPORT_COLUMNS.map(([, label]) => escapeMdCell(label)).join(" | ");
  const separator = EXPORT_COLUMNS.map(() => "---").join(" | ");
  const body = rows.map((row) =>
    EXPORT_COLUMNS.map(([key]) => escapeMdCell(row[key])).join(" | ")
  );
  return [
    "# Token Comparator — mapping",
    "",
    `| ${header} |`,
    `| ${separator} |`,
    ...body.map((line) => `| ${line} |`),
    "",
  ].join("\n");
}
