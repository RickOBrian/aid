/**
 * Согласованные решения из реестра — в таблице у всех.
 *
 * Реестр в main хранит только одобренные решения: запись попадает туда после
 * мержа запроса на согласование. До этой правки плагин реестр только
 * показывал, и согласованное коллегой решение у остальных не появлялось —
 * каждый заново разбирал ту же строку.
 */

import { beforeEach, describe, expect, it } from "vitest";

import {
  countResolvedByTeam,
  mergeRegistryDecisions,
  registryEntryToStoredDecision,
} from "../src/lib/registryDecisions";
import { persistDecisionAfterApply } from "../src/lib/decisionPersistence";
import {
  countPendingProposalsByCategory,
  getMappingHistory,
  setMappingHistoryEntry,
} from "../src/lib/storage";
import { computeColorComparisonResults, requiresUserAction } from "../src/comparators/colorComparator";
import type { StoredDecision } from "../src/comparators/types";
import type { RegistryEntry } from "../src/lib/githubTypes";
import { colorRecord, libraryToken, mode } from "./fixtures";
import { resetFigmaStub } from "./figmaStub";

const MAPPED: RegistryEntry = {
  signature: "rec-1",
  decision: "mapped",
  targetVariableId: "var-1",
  targetVariableName: "text-primary",
  proposedBy: "Коллега",
  proposedAt: "2026-09-07T13:43:06.501Z",
  status: "approved",
};

beforeEach(() => {
  resetFigmaStub();
});

describe("registryEntryToStoredDecision", () => {
  it("переносит решение, цель и комментарий и помечает источник", () => {
    const stored = registryEntryToStoredDecision({ ...MAPPED, comment: "так договорились" });
    expect(stored).toMatchObject({
      decision: "mapped",
      category: "colors",
      targetVariableId: "var-1",
      targetName: "text-primary",
      comment: "так договорились",
      source: "registry",
      timestamp: "2026-09-07T13:43:06.501Z",
    });
  });

  it("типографика: стиль-цель и категория", () => {
    const stored = registryEntryToStoredDecision({
      signature: "t-1",
      decision: "mapped",
      category: "typography",
      targetStyleId: "10:1",
      targetStyleName: "body-m",
      status: "approved",
    });
    expect(stored).toMatchObject({
      category: "typography",
      targetStyleId: "10:1",
      targetStyleName: "body-m",
    });
  });

  it("устаревший тип решения hardcoded, которому нет пары в плагине, пропускается", () => {
    expect(registryEntryToStoredDecision({ ...MAPPED, decision: "hardcoded" })).toBeNull();
  });
});

describe("mergeRegistryDecisions", () => {
  it("решение из реестра появляется там, где своего нет", () => {
    const merged = mergeRegistryDecisions({}, [MAPPED]);
    expect(merged["rec-1"]?.source).toBe("registry");
  });

  it("своё решение важнее реестра — его, возможно, и хотят предложить взамен", () => {
    const local: StoredDecision = {
      decision: "ignored",
      comment: "у нас исключение",
      timestamp: "2026-09-18T00:00:00.000Z",
    };
    const merged = mergeRegistryDecisions({ "rec-1": local }, [MAPPED]);
    expect(merged["rec-1"]).toEqual(local);
  });

  it("локальную историю не мутирует", () => {
    const local: Record<string, StoredDecision> = {};
    mergeRegistryDecisions(local, [MAPPED]);
    expect(local).toEqual({});
  });
});

describe("очередь на согласование", () => {
  it("решение из реестра не считается ожидающим отправки", async () => {
    await setMappingHistoryEntry("rec-1", { ...registryEntryToStoredDecision(MAPPED)!, applyPartial: true });
    await setMappingHistoryEntry("rec-2", { decision: "candidate", timestamp: "2026-09-18T00:00:00.000Z" });
    const counts = await countPendingProposalsByCategory(await getMappingHistory());
    expect(counts.colors).toBe(1);
  });
});

describe("«Применить в макет» по решению из реестра", () => {
  it("полный успех не оставляет следа в локальной истории", async () => {
    await persistDecisionAfterApply({
      recordId: "rec-1",
      base: registryEntryToStoredDecision(MAPPED)!,
      appliedCount: 3,
      totalCount: 3,
      applySkips: [],
    });
    expect((await getMappingHistory())["rec-1"]).toBeUndefined();
  });

  it("частичный — сохраняет пропуски, но остаётся решением реестра, а не новым", async () => {
    await persistDecisionAfterApply({
      recordId: "rec-1",
      base: registryEntryToStoredDecision(MAPPED)!,
      appliedCount: 1,
      totalCount: 3,
      applySkips: [{ nodeId: "1:1", reason: "слой изменён" }],
    });
    const stored = (await getMappingHistory())["rec-1"];
    expect(stored?.source).toBe("registry");
    expect(stored?.applyPartial).toBe(true);
    const counts = await countPendingProposalsByCategory(await getMappingHistory());
    expect(counts.colors).toBe(0);
  });
});

describe("строка таблицы", () => {
  const library = [
    libraryToken({
      name: "text-primary",
      variableId: "var-1",
      modes: [mode("Day", "#111111")],
    }),
  ];

  it("согласованный маппинг закрывает строку и помечает источник", () => {
    const record = colorRecord({ id: "rec-1", hex: "#121212" });
    const [result] = computeColorComparisonResults([record], library, mergeRegistryDecisions({}, [MAPPED]));
    expect(result.status).toBe("mapped");
    expect(result.decisionSource).toBe("registry");
    expect(requiresUserAction(result, library)).toBe(false);
  });

  it("своё решение не помечается как решение реестра", () => {
    const record = colorRecord({ id: "rec-1", hex: "#121212" });
    const local: StoredDecision = { decision: "candidate", timestamp: "2026-09-18T00:00:00.000Z" };
    const [result] = computeColorComparisonResults([record], library, { "rec-1": local });
    expect(result.decisionSource).toBeUndefined();
  });
});

describe("countResolvedByTeam", () => {
  it("считает только группы, скрытые решением реестра", () => {
    const history = mergeRegistryDecisions(
      { "rec-local": { decision: "ignored", comment: "x", timestamp: "2026-09-18T00:00:00.000Z" } },
      [MAPPED, { ...MAPPED, signature: "rec-shown" }]
    );
    const records = [{ id: "rec-1" }, { id: "rec-shown" }, { id: "rec-local" }, { id: "rec-new" }];
    const results = [{ id: "rec-shown" }, { id: "rec-new" }];
    expect(countResolvedByTeam(records, results, history)).toBe(1);
  });
});
