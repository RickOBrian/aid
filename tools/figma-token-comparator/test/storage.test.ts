/**
 * История решений и очередь на согласование.
 *
 * Ключевая инварианта: решение, которое пользователь изменил или отменил,
 * снова должно попадать в очередь на отправку. Иначе изменённое решение
 * невозможно отправить повторно — находка №2 аудита.
 */

import { beforeEach, describe, expect, it } from "vitest";

import {
  clearMappingHistoryEntry,
  countPendingProposals,
  countPendingProposalsByCategory,
  getMappingHistory,
  getSubmittedSignatures,
  markSignaturesSubmitted,
  setMappingHistoryEntry,
} from "../src/lib/storage";
import type { StoredDecision } from "../src/comparators/types";
import { resetFigmaStub } from "./figmaStub";

function decision(overrides: Partial<StoredDecision> = {}): StoredDecision {
  return {
    decision: "mapped",
    category: "colors",
    targetVariableId: "var-1",
    timestamp: "2026-09-18T00:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  resetFigmaStub();
});

describe("история решений", () => {
  it("записывается и читается", async () => {
    await setMappingHistoryEntry("rec-1", decision());

    const history = await getMappingHistory();

    expect(history["rec-1"].decision).toBe("mapped");
  });

  it("очищается по одной записи", async () => {
    await setMappingHistoryEntry("rec-1", decision());
    await setMappingHistoryEntry("rec-2", decision());

    await clearMappingHistoryEntry("rec-1");

    expect(Object.keys(await getMappingHistory())).toEqual(["rec-2"]);
  });

  it("пустое хранилище отдаёт пустую историю, а не падает", async () => {
    expect(await getMappingHistory()).toEqual({});
    expect(await getSubmittedSignatures()).toEqual(new Set());
  });
});

describe("очередь на согласование", () => {
  it("новое решение считается неотправленным", async () => {
    await setMappingHistoryEntry("rec-1", decision());

    expect(await countPendingProposals(await getMappingHistory())).toBe(1);
  });

  it("отправленное решение выходит из очереди", async () => {
    await setMappingHistoryEntry("rec-1", decision());
    await markSignaturesSubmitted(["rec-1"]);

    expect(await countPendingProposals(await getMappingHistory())).toBe(0);
  });

  it("считает по категориям раздельно", async () => {
    await setMappingHistoryEntry("color-1", decision({ category: "colors" }));
    await setMappingHistoryEntry("typo-1", decision({ category: "typography" }));
    await setMappingHistoryEntry("typo-2", decision({ category: "typography" }));

    const counts = await countPendingProposalsByCategory(await getMappingHistory());

    expect(counts).toEqual({ colors: 1, typography: 2 });
  });

  it("запись без категории считается цветовой — совместимость со старой историей", async () => {
    await setMappingHistoryEntry("legacy", { decision: "mapped", timestamp: "2026-01-01T00:00:00.000Z" });

    const counts = await countPendingProposalsByCategory(await getMappingHistory());

    expect(counts.colors).toBe(1);
  });

  // Находка №2 аудита.
  it("изменённое решение снова попадает в очередь", async () => {
    await setMappingHistoryEntry("rec-1", decision({ decision: "mapped" }));
    await markSignaturesSubmitted(["rec-1"]);
    expect(await countPendingProposals(await getMappingHistory())).toBe(0);

    await setMappingHistoryEntry("rec-1", decision({ decision: "ignored", comment: "передумали" }));

    expect(await countPendingProposals(await getMappingHistory())).toBe(1);
  });

  // Находка №2 аудита, вторая половина: решение отменили и приняли заново.
  it("отменённое и принятое заново решение снова попадает в очередь", async () => {
    await setMappingHistoryEntry("rec-1", decision());
    await markSignaturesSubmitted(["rec-1"]);

    await clearMappingHistoryEntry("rec-1");
    await setMappingHistoryEntry("rec-1", decision({ decision: "candidate" }));

    expect(await countPendingProposals(await getMappingHistory())).toBe(1);
  });

  // Служебная перезапись (учёт применённых слоёв после «Применить в макет»)
  // решением пользователя не является и очередь трогать не должна — иначе
  // уже отправленное решение уедет в реестр повторно.
  it("служебная пометка о применении не возвращает решение в очередь", async () => {
    const entry = decision();
    await setMappingHistoryEntry("rec-1", entry);
    await markSignaturesSubmitted(["rec-1"]);

    await setMappingHistoryEntry(
      "rec-1",
      { ...entry, appliedNodeIds: ["1:1"], applyPartial: true },
      { keepSubmitted: true }
    );

    expect(await countPendingProposals(await getMappingHistory())).toBe(0);
  });
});
