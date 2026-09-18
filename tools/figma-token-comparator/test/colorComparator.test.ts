/**
 * Компаратор цветов: лестница приоритетов статусов и фильтр строк.
 *
 * Эти тесты фиксируют ПРАВИЛЬНОЕ поведение на сегодня — они страхуют от
 * регрессий при правках по аудиту (docs/audit-2026-09-17.md). Известные
 * дефекты помечены it.todo с номером находки: их включают в том батче,
 * который эту находку чинит.
 */

import { describe, expect, it } from "vitest";

import {
  compareColorsWithLibrary,
  computeColorComparisonResults,
  isUsingLibraryVariable,
  requiresUserAction,
} from "../src/comparators/colorComparator";
import type { ComparisonResult, StoredDecision } from "../src/comparators/types";
import { colorRecord, layoutMode, libraryToken, mode } from "./fixtures";

const NO_HISTORY: Record<string, StoredDecision> = {};

/** Единственный результат для одной записи — компаратор всегда возвращает массив. */
function statusOf(result: ComparisonResult | undefined): string {
  return result?.status ?? "(нет результата)";
}

describe("лестница приоритетов статусов", () => {
  it("exact — переменная макета найдена в библиотеке по variableId", () => {
    const token = libraryToken({ name: "bg/accent", variableId: "var-1", modes: [mode("Day", "#3D6AFE")] });
    const record = colorRecord({
      hex: "#3D6AFE",
      bindingType: "variable",
      variableId: "var-1",
      sourceName: "bg/accent",
    });

    const [result] = computeColorComparisonResults([record], [token], NO_HISTORY);

    expect(statusOf(result)).toBe("exact");
    expect(result.target?.name).toBe("bg/accent");
  });

  it("exact — переменная найдена по стабильному key, когда variableId разошлись", () => {
    const token = libraryToken({ name: "bg/accent", variableId: "lib-var", key: "stable-key" });
    const record = colorRecord({
      hex: "#FFFFFF",
      bindingType: "variable",
      variableId: "local-var",
      variableKey: "stable-key",
      sourceName: "bg/accent",
    });

    const [result] = computeColorComparisonResults([record], [token], NO_HISTORY);

    expect(statusOf(result)).toBe("exact");
  });

  it("value — hex и alpha точно совпали, но привязки нет", () => {
    const token = libraryToken({ name: "bg/accent", modes: [mode("Day", "#3D6AFE")] });
    const record = colorRecord({ hex: "#3D6AFE" });

    const [result] = computeColorComparisonResults([record], [token], NO_HISTORY);

    expect(statusOf(result)).toBe("value");
    expect(result.target?.modeName).toBe("Day");
  });

  it("value — совпадение ищется по всем режимам, не только по первому", () => {
    const token = libraryToken({
      name: "bg/accent",
      modes: [mode("Day", "#FFFFFF"), mode("Night", "#1E1E1E")],
    });
    const record = colorRecord({ hex: "#1E1E1E" });

    const [result] = computeColorComparisonResults([record], [token], NO_HISTORY);

    expect(statusOf(result)).toBe("value");
    expect(result.target?.modeName).toBe("Night");
  });

  it("value не срабатывает при расхождении alpha", () => {
    const token = libraryToken({ name: "bg/accent", modes: [mode("Day", "#3D6AFE", { alpha: 1 })] });
    const record = colorRecord({ hex: "#3D6AFE", comparisonValue: { hex: "#3D6AFE", alpha: 0.5 } });

    const [result] = computeColorComparisonResults([record], [token], NO_HISTORY);

    expect(statusOf(result)).not.toBe("value");
  });

  it("name-match — имя совпало, цвет отличается умеренно", () => {
    const token = libraryToken({ name: "bg/accent", modes: [mode("Day", "#3D6AFE")] });
    const record = colorRecord({
      hex: "#3F6CFE",
      bindingType: "variable",
      variableId: "foreign",
      sourceName: "bg/accent",
    });

    const [result] = computeColorComparisonResults([record], [token], NO_HISTORY);

    expect(statusOf(result)).toBe("name-match");
    expect(result.deltaE).toBeLessThanOrEqual(20);
  });

  it("conflict — имя совпало, цвет отличается существенно", () => {
    const token = libraryToken({ name: "bg/accent", modes: [mode("Day", "#3D6AFE")] });
    const record = colorRecord({
      hex: "#D62347",
      bindingType: "variable",
      variableId: "foreign",
      sourceName: "bg/accent",
    });

    const [result] = computeColorComparisonResults([record], [token], NO_HISTORY);

    expect(statusOf(result)).toBe("conflict");
    expect(result.deltaE).toBeGreaterThan(20);
  });

  it("name-match-unresolved — имя совпало, но ни один режим не резолвится", () => {
    const token = libraryToken({
      name: "bg/accent",
      modes: [mode("Day", "значение недоступно", { unresolved: true })],
    });
    const record = colorRecord({
      hex: "#3D6AFE",
      bindingType: "variable",
      variableId: "foreign",
      sourceName: "bg/accent",
    });

    const [result] = computeColorComparisonResults([record], [token], NO_HISTORY);

    expect(statusOf(result)).toBe("name-match-unresolved");
    expect(result.target?.valueUnresolved).toBe(true);
  });

  it("approximate — точного совпадения нет, но есть близкий цвет", () => {
    const token = libraryToken({ name: "bg/accent", modes: [mode("Day", "#3D6AFE")] });
    const record = colorRecord({ hex: "#3E6BFE" });

    const [result] = computeColorComparisonResults([record], [token], NO_HISTORY);

    expect(statusOf(result)).toBe("approximate");
    expect(result.deltaE).toBeGreaterThan(0);
    expect(result.deltaE).toBeLessThanOrEqual(5);
  });

  it("layout-only — в библиотеке нет ничего похожего", () => {
    const token = libraryToken({ name: "bg/accent", modes: [mode("Day", "#3D6AFE")] });
    const record = colorRecord({ hex: "#12FF00" });

    const [result] = computeColorComparisonResults([record], [token], NO_HISTORY);

    expect(statusOf(result)).toBe("layout-only");
    expect(result.target).toBeUndefined();
  });

  it("value важнее name-match: точное значение бьёт совпадение имени", () => {
    const byName = libraryToken({
      name: "bg/accent",
      variableId: "by-name",
      modes: [mode("Day", "#D62347")],
    });
    const byValue = libraryToken({
      name: "другое/имя",
      variableId: "by-value",
      modes: [mode("Day", "#3D6AFE")],
    });
    const record = colorRecord({
      hex: "#3D6AFE",
      bindingType: "variable",
      variableId: "foreign",
      sourceName: "bg/accent",
    });

    const [result] = computeColorComparisonResults([record], [byName, byValue], NO_HISTORY);

    expect(statusOf(result)).toBe("value");
    expect(result.target?.variableId).toBe("by-value");
  });
});

describe("кандидаты берутся только из semantic-коллекции", () => {
  it("токен из чужой коллекции не предлагается", () => {
    const token = libraryToken({
      name: "bg/accent",
      collectionName: "color-core",
      modes: [mode("Day", "#3D6AFE")],
    });
    const record = colorRecord({ hex: "#3D6AFE" });

    const [result] = computeColorComparisonResults([record], [token], NO_HISTORY);

    expect(statusOf(result)).toBe("layout-only");
  });

  it("но exact match по чужой коллекции всё равно засчитывается", () => {
    const token = libraryToken({
      name: "bg/accent",
      collectionName: "color-core",
      variableId: "var-1",
      modes: [mode("Day", "#3D6AFE")],
    });
    const record = colorRecord({ hex: "#3D6AFE", bindingType: "variable", variableId: "var-1" });

    const [result] = computeColorComparisonResults([record], [token], NO_HISTORY);

    expect(statusOf(result)).toBe("exact");
  });
});

describe("scope как tie-break внутри одного уровня", () => {
  it("при равном совпадении выигрывает токен с подходящим scope", () => {
    const wrongScope = libraryToken({
      name: "a/fill",
      variableId: "fill-token",
      modes: [mode("Day", "#3D6AFE")],
      scopes: ["FRAME_FILL"],
    });
    const rightScope = libraryToken({
      name: "b/stroke",
      variableId: "stroke-token",
      modes: [mode("Day", "#3D6AFE")],
      scopes: ["STROKE_COLOR"],
    });
    const record = colorRecord({ hex: "#3D6AFE", property: "stroke" });

    const [result] = computeColorComparisonResults([record], [wrongScope, rightScope], NO_HISTORY);

    expect(result.target?.variableId).toBe("stroke-token");
  });

  it("scope не поднимает менее точное совпадение выше более точного", () => {
    const exactValueWrongScope = libraryToken({
      name: "чужое/имя",
      variableId: "value-token",
      modes: [mode("Day", "#3D6AFE")],
      scopes: ["EFFECT_COLOR"],
    });
    const nameMatchRightScope = libraryToken({
      name: "bg/accent",
      variableId: "name-token",
      modes: [mode("Day", "#D62347")],
      scopes: ["STROKE_COLOR"],
    });
    const record = colorRecord({
      hex: "#3D6AFE",
      property: "stroke",
      bindingType: "variable",
      variableId: "foreign",
      sourceName: "bg/accent",
    });

    const [result] = computeColorComparisonResults(
      [record],
      [exactValueWrongScope, nameMatchRightScope],
      NO_HISTORY
    );

    expect(statusOf(result)).toBe("value");
    expect(result.target?.variableId).toBe("value-token");
  });
});

describe("какие строки попадают в таблицу", () => {
  const token = libraryToken({ name: "bg/accent", variableId: "var-1", modes: [mode("Day", "#3D6AFE")] });

  it("переменная из библиотеки скрыта — решать нечего", () => {
    const record = colorRecord({ hex: "#3D6AFE", bindingType: "variable", variableId: "var-1" });

    expect(isUsingLibraryVariable(record, [token])).toBe(true);
    expect(compareColorsWithLibrary([record], [token], NO_HISTORY)).toHaveLength(0);
  });

  it("ручной цвет, стиль и битая ссылка показываются всегда", () => {
    const records = [
      colorRecord({ hex: "#12FF00", id: "hardcoded" }),
      colorRecord({ hex: "#12FF00", id: "style", bindingType: "style", sourceName: "Legacy/Green" }),
      colorRecord({ hex: "#12FF00", id: "ghost", bindingType: "ghost", sourceName: "(стиль удалён)" }),
    ];

    expect(compareColorsWithLibrary(records, [token], NO_HISTORY)).toHaveLength(3);
  });

  it("маппинг скрывает строку — но только когда цель решения найдена", () => {
    const base = colorRecord({ hex: "#12FF00" });
    const mappings: Array<ComparisonResult["decision"]> = ["mapped", "mapped_suggested"];

    for (const decision of mappings) {
      // статус "mapped" ставит applyHistory, когда токен решения найден
      expect(requiresUserAction({ ...base, status: "mapped", decision }, [token])).toBe(false);
      // токен не найден — статус остался исходным, расхождение никуда не делось
      expect(requiresUserAction({ ...base, status: "layout-only", decision }, [token])).toBe(true);
    }
  });

  it("«игнорировать» скрывает строку, «кандидат» и правка значения — нет", () => {
    const base = colorRecord({ hex: "#12FF00" });
    const kept: Array<ComparisonResult["decision"]> = ["candidate", "value_fix_proposed"];

    expect(requiresUserAction({ ...base, status: "layout-only", decision: "ignored" }, [token])).toBe(
      false
    );
    for (const decision of kept) {
      expect(requiresUserAction({ ...base, status: "layout-only", decision }, [token])).toBe(true);
    }
  });
});

describe("применение истории решений", () => {
  it("подтверждённый маппинг переписывает статус на mapped", () => {
    const token = libraryToken({ name: "bg/accent", variableId: "var-1", modes: [mode("Day", "#3D6AFE")] });
    const record = colorRecord({ hex: "#12FF00", id: "rec-1" });
    const history: Record<string, StoredDecision> = {
      "rec-1": { decision: "mapped", targetVariableId: "var-1", timestamp: "2026-09-18T00:00:00.000Z" },
    };

    const [result] = computeColorComparisonResults([record], [token], history);

    expect(statusOf(result)).toBe("mapped");
    expect(result.target?.variableId).toBe("var-1");
    expect(result.deltaE).toBeUndefined();
  });

  it("поля решения переносятся в результат как есть", () => {
    const record = colorRecord({ hex: "#12FF00", id: "rec-1" });
    const history: Record<string, StoredDecision> = {
      "rec-1": {
        decision: "value_fix_proposed",
        comment: "ждём правки в библиотеке",
        proposedModeName: "Night",
        proposedValue: "#363636",
        timestamp: "2026-09-18T00:00:00.000Z",
      },
    };

    const [result] = computeColorComparisonResults([record], [], history);

    expect(result.decision).toBe("value_fix_proposed");
    expect(result.decisionComment).toBe("ждём правки в библиотеке");
    expect(result.decisionProposedModeName).toBe("Night");
    expect(result.decisionProposedValue).toBe("#363636");
  });

  // Находка №18 аудита: решение указывает на токен, которого в загруженной
  // библиотеке больше нет. Скрывать такую строку нельзя — расхождение
  // осталось, а цель решения не существует.
  it("№18: решение с исчезнувшим токеном не скрывает строку", () => {
    const record = colorRecord({ hex: "#12FF00", id: "rec-1" });
    const history: Record<string, StoredDecision> = {
      "rec-1": {
        decision: "mapped",
        targetVariableId: "удалённый-токен",
        timestamp: "2026-09-18T00:00:00.000Z",
      },
    };

    const [result] = computeColorComparisonResults([record], [], history);

    expect(statusOf(result)).toBe("layout-only");
    expect(requiresUserAction(result, [])).toBe(true);
    expect(compareColorsWithLibrary([record], [], history)).toHaveLength(1);
  });

  it("решение с существующим токеном по-прежнему скрывает строку", () => {
    const token = libraryToken({ name: "bg/accent", variableId: "var-1" });
    const record = colorRecord({ hex: "#12FF00", id: "rec-1" });
    const history: Record<string, StoredDecision> = {
      "rec-1": {
        decision: "mapped",
        targetVariableId: "var-1",
        timestamp: "2026-09-18T00:00:00.000Z",
      },
    };

    expect(compareColorsWithLibrary([record], [token], history)).toHaveLength(0);
  });

  it("решение «игнорировать» скрывает строку независимо от токенов", () => {
    const record = colorRecord({ hex: "#12FF00", id: "rec-1" });
    const history: Record<string, StoredDecision> = {
      "rec-1": {
        decision: "ignored",
        comment: "осознанное исключение",
        timestamp: "2026-09-18T00:00:00.000Z",
      },
    };

    expect(compareColorsWithLibrary([record], [], history)).toHaveLength(0);
  });

  // Частичное применение в макет (батч 2, находка №3): решение сохраняется
  // вместе со списком пропущенных слоёв, и это должно доезжать до интерфейса.
  it("частичное применение переносится в результат", () => {
    const record = colorRecord({ hex: "#12FF00", id: "rec-1" });
    const history: Record<string, StoredDecision> = {
      "rec-1": {
        decision: "mapped",
        timestamp: "2026-09-18T00:00:00.000Z",
        applyPartial: true,
        applySkips: [{ nodeId: "3:3", reason: "слой удалён" }],
      },
    };

    const [result] = computeColorComparisonResults([record], [], history);

    expect(result.applyPartial).toBe(true);
    expect(result.applySkips).toHaveLength(1);
  });

  // Находка №19 аудита: цветовая ветка не переносит decisionTargetStyleId,
  // в отличие от типографики.
  it.todo("№19: decisionTargetStyleId переносится в результат");
});

describe("несколько режимов в макете", () => {
  it("modeValues переменной макета доезжают до результата", () => {
    const record = colorRecord({
      hex: "#FFFFFF",
      bindingType: "variable",
      variableId: "foreign",
      sourceName: "bg/base",
      modeValues: [layoutMode("Day", "#FFFFFF"), layoutMode("Night", "#1E1E1E")],
    });

    const [result] = computeColorComparisonResults([record], [], NO_HISTORY);

    expect(result.modeValues).toHaveLength(2);
    expect(result.modeValues?.[1].modeName).toBe("Night");
  });
});
