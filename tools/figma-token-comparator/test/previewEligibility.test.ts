/**
 * Для каких строк доступна кнопка «Показать превью».
 *
 * Превью показывает, как изменится слой, если привязать к нему цель строки:
 * токен (цвета) или стиль текста (типографика). Кнопка имеет смысл только
 * там, где цель есть и её можно применить.
 */

import { describe, expect, it } from "vitest";

import { canShowPreview } from "../src/lib/previewEligibility";
import type { ComparisonResult, ComparisonTarget } from "../src/comparators/types";
import { colorRecord, typographyRecord } from "./fixtures";

const colorTarget: ComparisonTarget = {
  variableId: "VariableID:1:1",
  collectionName: "Semantic",
  modeId: "1:0",
  modeName: "Day",
  name: "text-primary",
  displayValue: "#1A1A1A",
};

const styleTarget: ComparisonTarget = {
  variableId: "",
  collectionName: "",
  modeId: "",
  modeName: "",
  styleId: "12:34",
  styleKey: "style-key-body-m",
  name: "body-m",
  displayValue: "Inter 16/24",
};

function colorResult(overrides: Partial<ComparisonResult>): ComparisonResult {
  return { ...colorRecord({ hex: "#1A1A1A" }), status: "layout-only", ...overrides };
}

function typographyResult(overrides: Partial<ComparisonResult>): ComparisonResult {
  return { ...typographyRecord({}), status: "layout-only", ...overrides };
}

describe("цвета — поведение до типографики не меняется", () => {
  it.each(["value", "name-match", "conflict", "approximate"] as const)(
    "статус %s с целью — превью есть",
    (status) => {
      expect(canShowPreview(colorResult({ status, target: colorTarget }), "colors")).toBe(true);
    }
  );

  it("цель с нерезолвленным значением — превью нет, красить нечем", () => {
    const target = { ...colorTarget, valueUnresolved: true };
    expect(canShowPreview(colorResult({ status: "name-match", target }), "colors")).toBe(false);
  });

  it.each(["exact", "mapped", "layout-only"] as const)("статус %s — превью нет", (status) => {
    expect(canShowPreview(colorResult({ status, target: colorTarget }), "colors")).toBe(false);
  });
});

describe("типографика", () => {
  it.each(["value", "name-match", "conflict", "name-mismatch"] as const)(
    "статус %s со стилем-целью — превью есть",
    (status) => {
      expect(canShowPreview(typographyResult({ status, target: styleTarget }), "typography")).toBe(
        true
      );
    }
  );

  it("name-mismatch без найденного стиля — превью нет", () => {
    expect(canShowPreview(typographyResult({ status: "name-mismatch" }), "typography")).toBe(false);
  });

  it("стиль без key — превью нет: импортировать его в файл нечем", () => {
    const target = { ...styleTarget, styleKey: undefined };
    expect(canShowPreview(typographyResult({ status: "conflict", target }), "typography")).toBe(false);
  });

  it("exact — превью нет: стиль уже привязан и значения совпадают", () => {
    expect(canShowPreview(typographyResult({ status: "exact", target: styleTarget }), "typography")).toBe(
      false
    );
  });

  it("mixed-unresolved — превью нет: применение такие строки тоже не трогает", () => {
    expect(
      canShowPreview(typographyResult({ status: "mixed-unresolved", target: styleTarget }), "typography")
    ).toBe(false);
  });
});

describe("canShowPreview — иконки («Примерить»)", () => {
  const iconTarget: ComparisonTarget = {
    variableId: "",
    collectionName: "",
    modeId: "",
    modeName: "",
    name: "close / Size=24",
    displayValue: "форма совпадает на 100%",
    componentKey: "k-close",
  };
  const iconResult = (status: ComparisonResult["status"], target?: ComparisonTarget): ComparisonResult => ({
    ...colorRecord({ hex: "#1A1A1A" }),
    category: "icons",
    status,
    ...(target ? { target } : {}),
  });

  it("совпавшая и похожая форма, иконка без компонента, конфликт имени — есть", () => {
    for (const status of ["value", "detached", "approximate", "conflict"] as const) {
      expect(canShowPreview(iconResult(status, iconTarget), "icons")).toBe(true);
    }
  });

  it("нет предложенной иконки или нет её ключа — нет", () => {
    expect(canShowPreview(iconResult("detached"), "icons")).toBe(false);
    expect(canShowPreview(iconResult("detached", { ...iconTarget, componentKey: undefined }), "icons")).toBe(false);
  });

  it("совпадает с библиотекой, нет в библиотеке, решение принято — нет", () => {
    for (const status of ["exact", "layout-only", "mapped"] as const) {
      expect(canShowPreview(iconResult(status, iconTarget), "icons")).toBe(false);
    }
  });
});
