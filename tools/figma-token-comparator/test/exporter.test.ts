/**
 * Экспорт отчёта: состав строк и сериализация в CSV / JSON / MD.
 *
 * Экспорт — это то, что уезжает из плагина наружу и живёт дальше своей
 * жизнью (таблицы, PR, трекеры), поэтому формат важнее внутренних деталей:
 * менять его молча нельзя.
 */

import { describe, expect, it } from "vitest";

import { buildExportRows, exportColumns, toCSV, toJSON, toMarkdown } from "../src/lib/exporter";
import type { ComparisonResult, LibraryIcon } from "../src/comparators/types";
import { compareIcons } from "../src/lib/iconComparator";
import { iconResultToComparisonResult } from "../src/lib/iconResults";
import type { IconRecord } from "../src/lib/iconScanner";
import { fingerprint, packFingerprint } from "../src/lib/iconShape";
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
    const csv = toCSV(rows, "colors");
    const [header] = csv.split("\r\n");

    expect(header).toBe(exportColumns("colors").map(([, label]) => label).join(","));
    expect(csv.split("\r\n")).toHaveLength(2);
  });

  it("CSV: запятые и кавычки внутри значения экранируются", () => {
    const csv = toCSV(
      buildExportRows([result({ decision: "ignored", decisionComment: 'а, "б"' })]),
      "colors"
    );

    expect(csv).toContain('"а, ""б"""');
  });

  it("JSON: массив объектов с теми же полями", () => {
    const parsed = JSON.parse(toJSON(rows, "colors")) as Array<Record<string, string>>;

    expect(parsed).toHaveLength(1);
    for (const [key] of exportColumns("colors")) {
      expect(parsed[0]).toHaveProperty(key);
    }
  });

  it("MD: таблица с заголовком и разделителем", () => {
    const md = toMarkdown(rows, "colors");
    const lines = md.split("\n");

    expect(lines[0]).toBe("# Token Comparator — mapping");
    expect(lines[2].startsWith("| Layer |")).toBe(true);
    expect(lines[3]).toContain("---");
  });

  it("MD: вертикальная черта внутри значения не ломает таблицу", () => {
    const md = toMarkdown(buildExportRows([result({ decisionComment: "а | б" })]), "colors");

    expect(md).toContain("а \\| б");
  });

  it("все три формата описывают одни и те же колонки", () => {
    const csvHeader = toCSV(rows, "colors").split("\r\n")[0].split(",");
    const mdHeader = toMarkdown(rows, "colors")
      .split("\n")[2]
      .split("|")
      .map((cell) => cell.trim())
      .filter(Boolean);

    expect(csvHeader).toEqual(mdHeader);
    expect(csvHeader).toHaveLength(exportColumns("colors").length);
  });
});

describe("колонки типографики (находка №15)", () => {
  const typographyResult = {
    ...result({
      bindingType: "style",
      sourceName: "body/m",
      displayValue: "Inter 18/20 w400",
      status: "conflict",
      mismatchedProperties: ["fontSize", "lineHeight"],
      target: {
        variableId: "",
        name: "body/m",
        collectionName: "",
        modeId: "",
        modeName: "",
        displayValue: "Inter 14/20 w400",
        styleId: "S:1",
      },
    }),
    category: "typography" as const,
  };

  it("в наборе нет колонок режимов, зато есть «Что расходится»", () => {
    const labels = exportColumns("typography").map(([, label]) => label);

    expect(labels).not.toContain("Сейчас Day");
    expect(labels).not.toContain("Предлагаем Night");
    expect(labels).toContain("Что расходится");
  });

  it("разошедшиеся свойства перечисляются через запятую", () => {
    const [row] = buildExportRows([typographyResult]);

    expect(row.mismatched).toBe("fontSize, lineHeight");
  });

  it("у стиля без коллекции имя не обрастает пустыми скобками", () => {
    const [row] = buildExportRows([typographyResult]);

    expect(row.target).toBe("body/m");
  });

  it("JSON типографики не тащит пустые колонки режимов", () => {
    const rows = buildExportRows([typographyResult]);
    const [parsed] = JSON.parse(toJSON(rows, "typography")) as Array<Record<string, string>>;

    expect(parsed).not.toHaveProperty("beforeDay");
    expect(parsed).not.toHaveProperty("targetNight");
    expect(parsed).toHaveProperty("mismatched");
  });

  it("CSV и MD типографики описывают одни и те же колонки", () => {
    const rows = buildExportRows([typographyResult]);
    const csvHeader = toCSV(rows, "typography").split("\r\n")[0].split(",");
    const mdHeader = toMarkdown(rows, "typography")
      .split("\n")[2]
      .split("|")
      .map((cell) => cell.trim())
      .filter(Boolean);

    expect(csvHeader).toEqual(mdHeader);
    expect(csvHeader).toHaveLength(exportColumns("typography").length);
  });
});

describe("колонки иконок (v1.5.0, этап 5)", () => {
  const CROSS = "M5 4L12 11L19 4L20 5L13 12L20 19L19 20L12 13L5 20L4 19L11 12L4 5Z";
  const LIBRARY: LibraryIcon[] = [
    {
      key: "k-close",
      nodeId: "1:1",
      name: "Size=24",
      setName: "close",
      width: 24,
      height: 24,
      glyph: { x: 4, y: 4, width: 16, height: 16 },
      opacities: [1],
      layers: 1,
      fingerprint: packFingerprint(fingerprint([{ d: CROSS }])),
    },
  ];
  const record: IconRecord = {
    id: "icon-1",
    kind: "detached",
    representativeName: "Vector",
    representativePath: "Page / Card / Vector",
    width: 24,
    height: 24,
    scaled: false,
    fingerprint: packFingerprint(fingerprint([{ d: CROSS }])),
    glyph: { width: 16, height: 16 },
    opacities: [1],
    layers: 2,
    outline: { viewBox: [0, 0, 24, 24], paths: [{ d: CROSS }] },
    count: 3,
    occurrences: [["2:1", "2:2"]],
  };

  it("свои колонки: статус, размер, форма, пометки — без режимов и правки значения", () => {
    const labels = exportColumns("icons").map(([, label]) => label);
    expect(labels).toEqual(expect.arrayContaining(["Статус", "Размер", "Форма", "Пометки", "Предлагаем"]));
    expect(labels).not.toContain("Сейчас Day");
    expect(labels).not.toContain("Для режима");
  });

  it("строка иконки без компонента", () => {
    const [compared] = compareIcons([record], LIBRARY, {});
    const [row] = buildExportRows([iconResultToComparisonResult(compared)]);
    expect(row).toMatchObject({
      status: "Отвязанная иконка",
      before: "Без компонента",
      size: "24×24",
      binding: "Hardcoded",
      target: "close / Size=24",
      similarity: "100%",
      flags: "Из нескольких слоёв",
    });
    expect(toCSV([row], "icons").split("\r\n")[1]).toContain("Отвязанная иконка");
  });
});
