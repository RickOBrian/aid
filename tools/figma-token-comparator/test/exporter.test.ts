/**
 * Экспорт отчёта: состав строк и сериализация в CSV / JSON / MD.
 *
 * Экспорт — это то, что уезжает из плагина наружу и живёт дальше своей
 * жизнью (таблицы, PR, трекеры), поэтому формат важнее внутренних деталей:
 * менять его молча нельзя.
 */

import { describe, expect, it } from "vitest";

import {
  buildExportRows,
  EXPORT_COLUMNS,
  toCSV,
  toJSON,
  toMarkdown,
} from "../src/lib/exporter";
import type { ComparisonResult } from "../src/comparators/types";
import { colorRecord, layoutMode } from "./fixtures";

function result(overrides: Partial<ComparisonResult> = {}): ComparisonResult {
  return {
    ...colorRecord({ hex: "#3D6AFE" }),
    status: "value",
    ...overrides,
  };
}

const TARGET = {
  variableId: "var-1",
  name: "bg/accent",
  collectionName: "color-sem",
  modeId: "m1",
  modeName: "Day",
  displayValue: "#3D6AFE",
  allModes: [
    { modeId: "m1", modeName: "Day", displayValue: "#3D6AFE", comparisonValue: {} },
    { modeId: "m2", modeName: "Night", displayValue: "#1E1E1E", comparisonValue: {} },
  ],
};

describe("состав строки экспорта", () => {
  it("ручной цвет: одно значение в обеих колонках режимов", () => {
    const [row] = buildExportRows([result({ bindingType: "hardcoded", displayValue: "#3D6AFE" })]);

    expect(row.binding).toBe("Hardcoded");
    expect(row.beforeDay).toBe("#3D6AFE");
    expect(row.beforeNight).toBe("#3D6AFE");
  });

  it("переменная макета: значения разносятся по режимам", () => {
    const [row] = buildExportRows([
      result({
        bindingType: "variable",
        sourceName: "bg/base",
        modeValues: [layoutMode("Day", "#FFFFFF"), layoutMode("Night", "#1E1E1E")],
      }),
    ]);

    expect(row.before).toBe("bg/base");
    expect(row.beforeDay).toBe("#FFFFFF");
    expect(row.beforeNight).toBe("#1E1E1E");
  });

  it("режимы находятся по имени, а не по порядку", () => {
    const [row] = buildExportRows([
      result({
        bindingType: "variable",
        modeValues: [layoutMode("Night", "#1E1E1E"), layoutMode("Day", "#FFFFFF")],
      }),
    ]);

    expect(row.beforeDay).toBe("#FFFFFF");
    expect(row.beforeNight).toBe("#1E1E1E");
  });

  it("Light и Dark считаются синонимами Day и Night", () => {
    const [row] = buildExportRows([
      result({
        bindingType: "variable",
        modeValues: [layoutMode("Light", "#FFFFFF"), layoutMode("Dark", "#1E1E1E")],
      }),
    ]);

    expect(row.beforeDay).toBe("#FFFFFF");
    expect(row.beforeNight).toBe("#1E1E1E");
  });

  it("предложенный токен пишется вместе с коллекцией", () => {
    const [row] = buildExportRows([result({ target: TARGET })]);

    expect(row.target).toBe("bg/accent (color-sem)");
    expect(row.targetDay).toBe("#3D6AFE");
    expect(row.targetNight).toBe("#1E1E1E");
  });

  it("без совпадения колонки предложения пустые", () => {
    const [row] = buildExportRows([result({ target: undefined })]);

    expect(row.target).toBe("");
    expect(row.targetDay).toBe("");
    expect(row.targetNight).toBe("");
  });

  it("нерезолвленное значение подписывается словами, а не пустотой", () => {
    const [row] = buildExportRows([
      result({
        target: {
          ...TARGET,
          allModes: undefined,
          valueUnresolved: true,
          displayValue: "значение недоступно",
        },
      }),
    ]);

    expect(row.targetDay).toBe("значение не получено");
  });

  it("решение выводится человекочитаемой меткой", () => {
    const [row] = buildExportRows([
      result({ decision: "mapped", decisionComment: "согласовано", decisionTimestamp: "2026-09-18" }),
    ]);

    expect(row.decision).toBe("Mapped (custom)");
    expect(row.comment).toBe("согласовано");
    expect(row.timestamp).toBe("2026-09-18");
  });

  it("поля правки значения заполняются только для соответствующего решения", () => {
    const fields = { decisionProposedModeName: "Night", decisionProposedValue: "#363636" };
    const [fix] = buildExportRows([result({ decision: "value_fix_proposed", ...fields })]);
    const [other] = buildExportRows([result({ decision: "candidate", ...fields })]);

    expect(fix.proposedMode).toBe("Night");
    expect(fix.proposedValueForMode).toBe("#363636");
    expect(other.proposedMode).toBe("");
    expect(other.proposedValueForMode).toBe("");
  });
});

describe("сериализация", () => {
  const rows = buildExportRows([result({ target: TARGET, decision: "ignored" })]);

  it("CSV: заголовок совпадает с описанием колонок и разделяет строки CRLF", () => {
    const csv = toCSV(rows);
    const [header] = csv.split("\r\n");

    expect(header).toBe(EXPORT_COLUMNS.map(([, label]) => label).join(","));
    expect(csv.split("\r\n")).toHaveLength(2);
  });

  it("CSV: запятые и кавычки внутри значения экранируются", () => {
    const csv = toCSV(buildExportRows([result({ decision: "ignored", decisionComment: 'а, "б"' })]));

    expect(csv).toContain('"а, ""б"""');
  });

  it("JSON: массив объектов с теми же полями", () => {
    const parsed = JSON.parse(toJSON(rows)) as Array<Record<string, string>>;

    expect(parsed).toHaveLength(1);
    for (const [key] of EXPORT_COLUMNS) {
      expect(parsed[0]).toHaveProperty(key);
    }
  });

  it("MD: таблица с заголовком и разделителем", () => {
    const md = toMarkdown(rows);
    const lines = md.split("\n");

    expect(lines[0]).toBe("# Token Comparator — mapping");
    expect(lines[2].startsWith("| Layer |")).toBe(true);
    expect(lines[3]).toContain("---");
  });

  it("MD: вертикальная черта внутри значения не ломает таблицу", () => {
    const md = toMarkdown(buildExportRows([result({ decisionComment: "а | б" })]));

    expect(md).toContain("а \\| б");
  });

  it("все три формата описывают одни и те же колонки", () => {
    const csvHeader = toCSV(rows).split("\r\n")[0].split(",");
    const mdHeader = toMarkdown(rows)
      .split("\n")[2]
      .split("|")
      .map((cell) => cell.trim())
      .filter(Boolean);

    expect(csvHeader).toEqual(mdHeader);
    expect(csvHeader).toHaveLength(EXPORT_COLUMNS.length);
  });
});
