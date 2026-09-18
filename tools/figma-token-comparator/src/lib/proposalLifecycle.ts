/**
 * Жизненный цикл отправленного решения:
 * отправлено → на согласовании → согласовано или отклонено.
 *
 * - «Согласовано» плагин узнаёт сам — решение лежит в реестре main
 *   (lib/registryDecisions.ts).
 * - «На согласовании» и «Отклонено» — от бэкенда (`proposal-status`): запрос
 *   открыт или закрыт без мержа.
 *
 * Отклонённое решение возвращается в очередь на отправку, чтобы его можно
 * было пересмотреть и отправить снова.
 */

import type { Decision, StoredDecision } from "../comparators/types";
import type { RegistryEntry } from "./githubTypes";

export interface ProposalStatusInfo {
  state: "open" | "rejected";
  number: number;
  url: string;
  closedAt?: string;
  /** Последний комментарий в отклонённом запросе — обычно причина. */
  comment?: string;
}

/** «Использовать предложенный» в реестре записывается как `mapped`. */
function registryDecisionOf(decision: Decision): string {
  return decision === "mapped_suggested" ? "mapped" : decision;
}

/** Локальное решение уже лежит в реестре main — то же решение с той же целью. */
export function isApprovedInRegistry(local: StoredDecision, entry: RegistryEntry | undefined): boolean {
  if (!entry) return false;
  if (registryDecisionOf(local.decision) !== entry.decision) return false;
  if ((local.targetVariableId ?? null) !== (entry.targetVariableId ?? null)) return false;
  if ((local.targetStyleId ?? null) !== (entry.targetStyleId ?? null)) return false;
  return true;
}

/** Подписи, статус которых стоит спросить: отправлены и ещё не согласованы. */
export function signaturesToCheck(
  history: Record<string, StoredDecision>,
  submitted: Set<string>,
  registryEntries: RegistryEntry[]
): string[] {
  const registry = new Map(registryEntries.map((entry) => [entry.signature, entry]));
  return [...submitted].filter((signature) => {
    const local = history[signature];
    return Boolean(local) && !isApprovedInRegistry(local, registry.get(signature));
  });
}

/**
 * Ответ бэкенда → статусы по проверенным подписям и список отклонённых.
 * Подпись, которой нет в ответе, статуса не получает: запрос мог уйти за
 * пределы последних 100 или реестр плагина ещё не увидел мерж.
 */
export function reconcileProposalStatuses(
  checked: string[],
  response: Record<string, ProposalStatusInfo>
): { statuses: Record<string, ProposalStatusInfo>; rejected: string[] } {
  const statuses: Record<string, ProposalStatusInfo> = {};
  const rejected: string[] = [];
  for (const signature of checked) {
    const status = response[signature];
    if (!status) continue;
    statuses[signature] = status;
    if (status.state === "rejected") rejected.push(signature);
  }
  return { statuses, rejected };
}
