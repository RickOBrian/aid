/**
 * Судьба решения после «Применить в макет» — находки №3 и №17 аудита.
 *
 * До правки цветовая ветка удаляла решение при любом `applied > 0`, включая
 * частичное применение: вместе с решением терялся список пропущенных слоёв,
 * а сами слои возвращались в таблицу без следа, что по ним что-то решали.
 */

import { beforeEach, describe, expect, it } from "vitest";

import { persistDecisionAfterApply } from "../src/lib/decisionPersistence";
import {
  getMappingHistory,
  getSubmittedSignatures,
  markSignaturesSubmitted,
  setMappingHistoryEntry,
} from "../src/lib/storage";
import type { StoredDecision } from "../src/comparators/types";
import { resetFigmaStub } from "./figmaStub";

const BASE: StoredDecision = {
  decision: "mapped",
  category: "colors",
  targetVariableId: "var-1",
  timestamp: "2026-09-18T00:00:00.000Z",
};

beforeEach(async () => {
  resetFigmaStub();
  await setMappingHistoryEntry("rec-1", BASE);
});

async function entry() {
  return (await getMappingHistory())["rec-1"];
}

describe("частичное применение", () => {
  it("решение сохраняется вместе со списком пропущенных слоёв", async () => {
    await persistDecisionAfterApply({
      recordId: "rec-1",
      base: BASE,
      appliedCount: 7,
      totalCount: 10,
      applySkips: [{ nodeId: "3:3", reason: "слой удалён" }],
    });

    const stored = await entry();
    expect(stored).toBeDefined();
    expect(stored.decision).toBe("mapped");
    expect(stored.applyPartial).toBe(true);
    expect(stored.applySkips).toHaveLength(1);
  });

  it("решение остаётся в очереди на согласование", async () => {
    await persistDecisionAfterApply({
      recordId: "rec-1",
      base: BASE,
      appliedCount: 7,
      totalCount: 10,
      applySkips: [{ nodeId: "3:3", reason: "слой удалён" }],
    });

    expect(await getSubmittedSignatures()).toEqual(new Set());
  });

  it("ничего не применилось — решение всё равно на месте, но без пометки «частично»", async () => {
    await persistDecisionAfterApply({
      recordId: "rec-1",
      base: BASE,
      appliedCount: 0,
      totalCount: 10,
      applySkips: [{ nodeId: "3:3", reason: "слой удалён" }],
    });

    const stored = await entry();
    expect(stored).toBeDefined();
    expect(stored.applyPartial).toBe(false);
  });
});

describe("полное применение", () => {
  it("неотправленное решение сохраняется — иначе оно не попадёт в реестр", async () => {
    await persistDecisionAfterApply({
      recordId: "rec-1",
      base: BASE,
      appliedCount: 10,
      totalCount: 10,
      applySkips: [],
    });

    const stored = await entry();
    expect(stored).toBeDefined();
    expect(stored.applyPartial).toBeUndefined();
    expect(stored.applySkips).toBeUndefined();
  });

  it("уже отправленное решение удаляется — реестр его получил", async () => {
    await markSignaturesSubmitted(["rec-1"]);

    await persistDecisionAfterApply({
      recordId: "rec-1",
      base: BASE,
      appliedCount: 10,
      totalCount: 10,
      applySkips: [],
    });

    expect(await entry()).toBeUndefined();
  });

  it("служебная перезапись не возвращает отправленное решение в очередь", async () => {
    await markSignaturesSubmitted(["rec-1"]);

    await persistDecisionAfterApply({
      recordId: "rec-1",
      base: BASE,
      appliedCount: 7,
      totalCount: 10,
      applySkips: [{ nodeId: "3:3", reason: "слой удалён" }],
    });

    expect(await getSubmittedSignatures()).toEqual(new Set(["rec-1"]));
  });
});

describe("повторная попытка после частичного применения", () => {
  it("успешный повтор снимает пометку «частично» и старые пропуски", async () => {
    const partial: StoredDecision = {
      ...BASE,
      applyPartial: true,
      applySkips: [{ nodeId: "3:3", reason: "слой удалён" }],
      appliedNodeIds: ["1:1"],
    };
    await setMappingHistoryEntry("rec-1", partial);

    await persistDecisionAfterApply({
      recordId: "rec-1",
      base: partial,
      appliedCount: 10,
      totalCount: 10,
      applySkips: [],
      appliedNodeIds: ["1:1", "2:2"],
    });

    const stored = await entry();
    expect(stored.applyPartial).toBeUndefined();
    expect(stored.applySkips).toBeUndefined();
    expect(stored.appliedNodeIds).toEqual(["1:1", "2:2"]);
  });

  it("поля самого решения при этом не теряются", async () => {
    const partial: StoredDecision = { ...BASE, comment: "согласовано с продуктом", applyPartial: true };
    await setMappingHistoryEntry("rec-1", partial);

    await persistDecisionAfterApply({
      recordId: "rec-1",
      base: partial,
      appliedCount: 10,
      totalCount: 10,
      applySkips: [],
    });

    const stored = await entry();
    expect(stored.decision).toBe("mapped");
    expect(stored.targetVariableId).toBe("var-1");
    expect(stored.comment).toBe("согласовано с продуктом");
  });
});
