/**
 * Согласованные решения из реестра — в сравнении у всех.
 *
 * Реестр в main хранит только одобренные решения: запись появляется там после
 * мержа запроса на согласование. Здесь они превращаются в StoredDecision и
 * подмешиваются к локальной истории перед сравнением — так согласованное
 * одним дизайнером решение видят все, и строку не разбирают заново.
 *
 * Правила:
 * - локальное решение важнее реестра: если дизайнер решил иначе, он, скорее
 *   всего, хочет предложить замену — и отправит её обычным путём;
 * - решения реестра помечаются `source: "registry"` и не попадают в очередь
 *   на согласование (storage.isPendingProposalRecord) — они уже согласованы;
 * - в clientStorage они не пишутся: реестр перечитывается при каждом запуске,
 *   и локальная копия устаревала бы.
 */

import type { Decision, StoredDecision } from "../comparators/types";
import type { RegistryDecision, RegistryEntry } from "./githubTypes";

const DECISION_BY_REGISTRY: Partial<Record<RegistryDecision, Decision>> = {
  mapped: "mapped",
  ignored: "ignored",
  candidate: "candidate",
  value_fix_proposed: "value_fix_proposed",
  // "hardcoded" — тип из первой схемы реестра, в плагине ему нет пары.
};

export function registryEntryToStoredDecision(entry: RegistryEntry): StoredDecision | null {
  const decision = DECISION_BY_REGISTRY[entry.decision];
  if (!decision) return null;

  return {
    decision,
    category: entry.category ?? "colors",
    ...(entry.targetVariableId ? { targetVariableId: entry.targetVariableId } : {}),
    ...(entry.targetVariableName ? { targetName: entry.targetVariableName } : {}),
    ...(entry.targetStyleId ? { targetStyleId: entry.targetStyleId } : {}),
    ...(entry.targetStyleName ? { targetStyleName: entry.targetStyleName } : {}),
    ...(entry.mismatchedProperties ? { mismatchedProperties: entry.mismatchedProperties } : {}),
    ...(entry.comment ? { comment: entry.comment } : {}),
    timestamp: entry.approvedAt ?? entry.proposedAt ?? "",
    source: "registry",
  };
}

/** История для сравнения: локальные решения поверх решений реестра. Входные данные не мутируются. */
export function mergeRegistryDecisions(
  local: Record<string, StoredDecision>,
  entries: RegistryEntry[]
): Record<string, StoredDecision> {
  const merged: Record<string, StoredDecision> = {};
  for (const entry of entries) {
    const stored = registryEntryToStoredDecision(entry);
    if (stored) merged[entry.signature] = stored;
  }
  return { ...merged, ...local };
}

/**
 * Сколько групп макета не попало в таблицу, потому что их закрыло
 * согласованное решение из реестра. Показывается в статусе сканирования,
 * чтобы исчезнувшие строки не выглядели потерей.
 */
export function countResolvedByTeam(
  records: Array<{ id: string }>,
  results: Array<{ id: string }>,
  history: Record<string, StoredDecision>
): number {
  const shown = new Set(results.map((result) => result.id));
  return records.filter((record) => history[record.id]?.source === "registry" && !shown.has(record.id)).length;
}
