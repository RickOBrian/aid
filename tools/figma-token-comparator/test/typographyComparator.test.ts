/**
 * Компаратор типографики: статусы, фильтр строк, история решений.
 *
 * Фиксирует правильное поведение на сегодня. Известные дефекты помечены
 * it.todo с номером находки из docs/audit-2026-09-17.md.
 */

import { describe, expect, it } from "vitest";

import {
  compareTypographyWithLibrary,
  computeTypographyComparisonResults,
  isUsingLibraryTextStyle,
  requiresTypographyUserAction,
} from "../src/comparators/typographyComparator";
import type { ComparisonResult, StoredDecision } from "../src/comparators/types";
import { libraryTextStyle, typographyRecord, typographyValue } from "./fixtures";

const NO_HISTORY: Record<string, StoredDecision> = {};

function statusOf(result: ComparisonResult | undefined): string {
  return result?.status ?? "(нет результата)";
}

describe("статусы типографики", () => {
  it("exact — стиль макета найден в библиотеке по styleId", () => {
    const style = libraryTextStyle({ name: "body/m", styleId: "S:1" });
    const record = typographyRecord({ styleId: "S:1", sourceName: "body/m" });

    const [result] = computeTypographyComparisonResults([record], [style], NO_HISTORY);

    expect(statusOf(result)).toBe("exact");
    expect(result.target?.name).toBe("body/m");
  });

  it("exact — стиль найден по стабильному key, когда id разошлись", () => {
    const style = libraryTextStyle({ name: "body/m", styleId: "lib-node-id", key: "stable" });
    const record = typographyRecord({ styleId: "S:local", styleKey: "stable", sourceName: "body/m" });

    const [result] = computeTypographyComparisonResults([record], [style], NO_HISTORY);

    expect(statusOf(result)).toBe("exact");
  });

  it("exact — имя совпало и все свойства тоже", () => {
    const style = libraryTextStyle({ name: "body/m", comparisonValue: typographyValue() });
    const record = typographyRecord({ sourceName: "body/m", value: typographyValue() });

    const [result] = computeTypographyComparisonResults([record], [style], NO_HISTORY);

    expect(statusOf(result)).toBe("exact");
  });

  it("name-match — имя совпало, расходится некритичное свойство", () => {
    const style = libraryTextStyle({ name: "body/m", comparisonValue: typographyValue() });
    const record = typographyRecord({
      sourceName: "body/m",
      value: typographyValue({ letterSpacing: 0.5 }),
    });

    const [result] = computeTypographyComparisonResults([record], [style], NO_HISTORY);

    expect(statusOf(result)).toBe("name-match");
    expect(result.mismatchedProperties).toContain("letterSpacing");
  });

  it("conflict — имя совпало, расходится критичное свойство", () => {
    const style = libraryTextStyle({ name: "body/m", comparisonValue: typographyValue() });
    const record = typographyRecord({
      sourceName: "body/m",
      value: typographyValue({ fontSize: 18 }),
    });

    const [result] = computeTypographyComparisonResults([record], [style], NO_HISTORY);

    expect(statusOf(result)).toBe("conflict");
    expect(result.mismatchedProperties?.[0]).toBe("fontSize");
  });

  it("name-mismatch — свойства совпали с токеном, у которого другое имя", () => {
    const style = libraryTextStyle({ name: "heading/s", comparisonValue: typographyValue() });
    const record = typographyRecord({ sourceName: "Legacy/Body", value: typographyValue() });

    const [result] = computeTypographyComparisonResults([record], [style], NO_HISTORY);

    expect(statusOf(result)).toBe("name-mismatch");
    expect(result.target?.name).toBe("heading/s");
  });

  it("mixed-unresolved — типографика ноды не читается", () => {
    const record = typographyRecord({ typographyUnresolved: true, comparisonValue: {} });

    const [result] = computeTypographyComparisonResults([record], [], NO_HISTORY);

    expect(statusOf(result)).toBe("mixed-unresolved");
    expect(result.target).toBeUndefined();
  });

  it("value — стиль не применён, но свойства совпали с токеном", () => {
    const style = libraryTextStyle({ name: "body/m", comparisonValue: typographyValue() });
    const record = typographyRecord({
      bindingType: "hardcoded",
      sourceName: "",
      value: typographyValue(),
    });

    const [result] = computeTypographyComparisonResults([record], [style], NO_HISTORY);

    expect(statusOf(result)).toBe("value");
  });

  it("layout-only — ручная типографика без совпадений", () => {
    const style = libraryTextStyle({ name: "body/m", comparisonValue: typographyValue() });
    const record = typographyRecord({
      bindingType: "hardcoded",
      sourceName: "",
      value: typographyValue({ fontSize: 37, lineHeight: 41 }),
    });

    const [result] = computeTypographyComparisonResults([record], [style], NO_HISTORY);

    expect(statusOf(result)).toBe("layout-only");
  });
});

describe("какие строки попадают в таблицу", () => {
  it("ручная типографика показывается всегда", () => {
    const record = typographyRecord({ bindingType: "hardcoded", sourceName: "" });

    expect(compareTypographyWithLibrary([record], [], NO_HISTORY)).toHaveLength(1);
  });

  it("битая ссылка на стиль показывается", () => {
    const record = typographyRecord({ bindingType: "ghost", sourceName: "(стиль удалён)" });

    expect(compareTypographyWithLibrary([record], [], NO_HISTORY)).toHaveLength(1);
  });

  it("«игнорировать» скрывает строку", () => {
    const base = typographyRecord({});

    expect(
      requiresTypographyUserAction({ ...base, status: "layout-only", decision: "ignored" }, [])
    ).toBe(false);
  });

  // Та же находка №18, что и в компараторе цветов: строку закрывает не сам
  // факт решения, а существование его цели в загруженной библиотеке.
  it("№18: маппинг скрывает строку только когда стиль решения найден", () => {
    const base = typographyRecord({});
    const mappings: Array<ComparisonResult["decision"]> = ["mapped", "mapped_suggested"];

    for (const decision of mappings) {
      expect(requiresTypographyUserAction({ ...base, status: "mapped", decision }, [])).toBe(false);
      expect(requiresTypographyUserAction({ ...base, status: "layout-only", decision }, [])).toBe(true);
    }
  });

  it("стиль из библиотеки считается применённым корректно", () => {
    const style = libraryTextStyle({ name: "body/m", key: "stable" });
    const record = typographyRecord({ styleKey: "stable" });

    expect(isUsingLibraryTextStyle(record, [style])).toBe(true);
  });

  // Находка №4 аудита — самая дорогая. Слой с библиотечным стилем и локально
  // переопределённой типографикой отфильтровывался по факту наличия
  // библиотечного ключа, поэтому до таблицы не доходил вовсе — хотя это
  // ровно тот случай, ради которого написана детекция переопределений:
  // слой выглядит правильно затокенизированным, а рендерится иначе.
  it("№4: переопределение библиотечного стиля остаётся в таблице", () => {
    const style = libraryTextStyle({
      name: "body/m",
      key: "stable",
      comparisonValue: typographyValue({ fontSize: 14 }),
    });
    const record = typographyRecord({
      styleKey: "stable",
      sourceName: "body/m",
      isOverride: true,
      value: typographyValue({ fontSize: 18 }),
    });

    const rows = compareTypographyWithLibrary([record], [style], NO_HISTORY);

    expect(rows).toHaveLength(1);
    expect(rows[0].isOverride).toBe(true);
  });

  it("№4: переопределение получает статус по тяжести расхождения", () => {
    const style = libraryTextStyle({
      name: "body/m",
      key: "stable",
      comparisonValue: typographyValue(),
    });
    const critical = typographyRecord({
      id: "critical",
      styleKey: "stable",
      sourceName: "body/m",
      value: typographyValue({ fontSize: 18 }),
    });
    const cosmetic = typographyRecord({
      id: "cosmetic",
      styleKey: "stable",
      sourceName: "body/m",
      value: typographyValue({ textCase: "UPPER" }),
    });

    const [criticalResult] = computeTypographyComparisonResults([critical], [style], NO_HISTORY);
    const [cosmeticResult] = computeTypographyComparisonResults([cosmetic], [style], NO_HISTORY);

    expect(statusOf(criticalResult)).toBe("conflict");
    expect(criticalResult.mismatchedProperties).toContain("fontSize");
    expect(statusOf(cosmeticResult)).toBe("name-match");
    expect(cosmeticResult.mismatchedProperties).toContain("textCase");
  });

  it("№4: слой без расхождений со своим библиотечным стилем по-прежнему скрыт", () => {
    const style = libraryTextStyle({
      name: "body/m",
      key: "stable",
      comparisonValue: typographyValue(),
    });
    const record = typographyRecord({
      styleKey: "stable",
      sourceName: "body/m",
      value: typographyValue(),
    });

    expect(compareTypographyWithLibrary([record], [style], NO_HISTORY)).toHaveLength(0);
  });
});

describe("применение истории решений", () => {
  it("подтверждённый маппинг переписывает статус на mapped", () => {
    const style = libraryTextStyle({ name: "body/m", styleId: "S:1" });
    const record = typographyRecord({ id: "rec-1", value: typographyValue({ fontSize: 18 }) });
    const history: Record<string, StoredDecision> = {
      "rec-1": {
        decision: "mapped",
        category: "typography",
        targetStyleId: "S:1",
        timestamp: "2026-09-18T00:00:00.000Z",
      },
    };

    const [result] = computeTypographyComparisonResults([record], [style], history);

    expect(statusOf(result)).toBe("mapped");
    expect(result.mismatchedProperties).toBeUndefined();
  });

  it("частичное применение переносится в результат", () => {
    const record = typographyRecord({ id: "rec-1" });
    const history: Record<string, StoredDecision> = {
      "rec-1": {
        decision: "mapped_suggested",
        category: "typography",
        timestamp: "2026-09-18T00:00:00.000Z",
        applyPartial: true,
        applySkips: [{ nodeId: "3:3", reason: "слой удалён" }],
      },
    };

    const [result] = computeTypographyComparisonResults([record], [], history);

    expect(result.applyPartial).toBe(true);
    expect(result.applySkips).toHaveLength(1);
  });
});
