/**
 * Жизненный цикл отправленного решения: отправлено → на согласовании →
 * согласовано (в реестре main) или отклонено (запрос закрыт без мержа).
 *
 * Отклонённое решение возвращается в очередь на отправку: его можно
 * пересмотреть и отправить снова.
 */

import { beforeEach, describe, expect, it } from "vitest";

import {
  isApprovedInRegistry,
  reconcileProposalStatuses,
  signaturesToCheck,
  type ProposalStatusInfo,
} from "../src/lib/proposalLifecycle";
import { mergeRegistryDecisions } from "../src/lib/registryDecisions";
import {
  getProposalStatuses,
  getSubmittedSignatures,
  markSignaturesSubmitted,
  setMappingHistoryEntry,
  setProposalStatuses,
} from "../src/lib/storage";
import type { StoredDecision } from "../src/comparators/types";
import type { RegistryEntry } from "../src/lib/githubTypes";
import { resetFigmaStub } from "./figmaStub";

const T = "2026-09-18T00:00:00.000Z";
const mapped: StoredDecision = { decision: "mapped", targetVariableId: "V:1", timestamp: T };
const suggested: StoredDecision = { decision: "mapped_suggested", targetVariableId: "V:1", timestamp: T };
const ignored: StoredDecision = { decision: "ignored", comment: "x", timestamp: T };

function registryEntry(overrides: Partial<RegistryEntry>): RegistryEntry {
  return { signature: "s", decision: "mapped", targetVariableId: "V:1", status: "approved", ...overrides };
}

const OPEN: ProposalStatusInfo = { state: "open", number: 7, url: "https://github.com/RickOBrian/aid/pull/7" };
const REJECTED: ProposalStatusInfo = {
  state: "rejected",
  number: 6,
  url: "https://github.com/RickOBrian/aid/pull/6",
  comment: "Есть text-primary",
};

beforeEach(() => {
  resetFigmaStub();
});

describe("isApprovedInRegistry", () => {
  it("то же решение с той же целью — согласовано; «использовать предложенный» равен mapped", () => {
    expect(isApprovedInRegistry(mapped, registryEntry({}))).toBe(true);
    expect(isApprovedInRegistry(suggested, registryEntry({}))).toBe(true);
  });

  it("другая цель или другое решение — не согласовано", () => {
    expect(isApprovedInRegistry(mapped, registryEntry({ targetVariableId: "V:2" }))).toBe(false);
    expect(isApprovedInRegistry(ignored, registryEntry({}))).toBe(false);
    expect(isApprovedInRegistry(mapped, undefined)).toBe(false);
  });
});

describe("signaturesToCheck", () => {
  it("проверяются только отправленные и ещё не согласованные", () => {
    const history = { sent: mapped, approved: mapped, draft: ignored };
    const submitted = new Set(["sent", "approved", "gone"]);
    const registry = [registryEntry({ signature: "approved" })];
    expect(signaturesToCheck(history, submitted, registry)).toEqual(["sent"]);
  });
});

describe("reconcileProposalStatuses", () => {
  it("отклонённые — отдельным списком: их надо вернуть в очередь", () => {
    const result = reconcileProposalStatuses(["a", "b", "c"], { a: OPEN, b: REJECTED, x: OPEN });
    expect(result.statuses).toEqual({ a: OPEN, b: REJECTED });
    expect(result.rejected).toEqual(["b"]);
  });
});

describe("mergeRegistryDecisions — своё согласованное решение", () => {
  it("совпавшее с реестром локальное решение помечается как согласованное", () => {
    const merged = mergeRegistryDecisions({ s: mapped }, [registryEntry({})]);
    expect(merged.s.source).toBe("registry");
    expect(merged.s.targetVariableId).toBe("V:1");
  });

  it("отличающееся локальное решение остаётся своим", () => {
    const merged = mergeRegistryDecisions({ s: ignored }, [registryEntry({})]);
    expect(merged.s).toBe(ignored);
  });
});

describe("хранение статусов", () => {
  it("новое решение по строке снимает старый статус: он относился к прежнему", async () => {
    await setProposalStatuses({ s: REJECTED, other: OPEN });
    await setMappingHistoryEntry("s", ignored);
    expect(await getProposalStatuses()).toEqual({ other: OPEN });
  });

  it("повторная отправка снимает статус «Отклонено» до следующей проверки", async () => {
    await setProposalStatuses({ s: REJECTED });
    await markSignaturesSubmitted(["s"]);
    expect(await getProposalStatuses()).toEqual({});
    expect((await getSubmittedSignatures()).has("s")).toBe(true);
  });
});
