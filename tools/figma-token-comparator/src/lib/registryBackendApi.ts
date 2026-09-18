/**
 * Клиент aid-registry-api — отправка решений на согласование и их статусы.
 *
 * Чтение реестра сюда больше не ходит: файл лежит в публичном репозитории и
 * читается напрямую, без ключа (см. githubApi.fetchPublicRegistry). Ключ
 * защищает то, что действительно требует защиты, — создание pull request
 * серверным токеном GitHub.
 *
 * Используется только из code.ts (главный поток). Ключ не логировать.
 */

import type { RegistryDecision, TokenCategory } from "./githubTypes";
import { REGISTRY_PROPOSAL_STATUS_URL, REGISTRY_PROPOSE_URL } from "./registryApiConfig";
import type { ProposalStatusInfo } from "./proposalLifecycle";

export interface ProposeDecisionEntryPayload {
  signature: string;
  decision: RegistryDecision;
  category?: TokenCategory;
  targetVariableId?: string;
  targetVariableName?: string;
  targetStyleId?: string;
  targetStyleName?: string;
  mismatchedProperties?: string[];
  comment?: string;
  /** fileKey библиотеки, в которой выбран токен. Пишется в реестр. */
  targetLibraryFileKey?: string;
  // Transient review-projection metadata — used ONLY by backend to render the
  // human-readable GitHub PR body. MUST NOT be persisted into
  // decisions-registry.json (backend whitelists machine fields when writing
  // the registry file — see buildProposedEntries in server/api/_lib/proposeDecision.ts).
  sourceProperty?: string;
  sourceBindingType?: string;
  sourceName?: string;
  sourceDisplayValue?: string;
  nodePath?: string;
  nodeName?: string;
  occurrenceCount?: number;
  targetCollectionName?: string;
  targetModeName?: string;
  targetDisplayValue?: string;
  proposedModeName?: string;
  currentLibraryValue?: string;
  proposedValue?: string;
  /** Название библиотеки — только для описания запроса на согласование. */
  targetLibraryName?: string;
}

export interface ProposeDecisionsPayload {
  proposedBy: string;
  entries: ProposeDecisionEntryPayload[];
}

/** Internal failure marker — map to neutral UI copy in code.ts. */
export class RegistryBackendError extends Error {
  constructor(readonly code: "registry_unavailable" | "submit_failed") {
    super(code);
    this.name = "RegistryBackendError";
  }
}

/** Почему pull request не создавался, хотя отправка прошла успешно. */
export type ProposeUnchangedReason = "already_in_registry" | "already_proposed";

export interface ProposeDecisionsResult {
  /** true — pull request не создавался: предлагать было нечего. */
  unchanged: boolean;
  /**
   * `already_in_registry` — решения уже лежат в реестре на main.
   * `already_proposed` — уже ждут согласования в открытом pull request'е.
   */
  reason?: ProposeUnchangedReason;
}

export async function proposeDecisionsOnBackend(
  payload: ProposeDecisionsPayload,
  sharedSecret: string
): Promise<ProposeDecisionsResult> {
  if (!sharedSecret) {
    throw new RegistryBackendError("submit_failed");
  }

  let response: Response;
  try {
    response = await fetch(REGISTRY_PROPOSE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sharedSecret,
        proposedBy: payload.proposedBy,
        entries: payload.entries,
      }),
    });
  } catch {
    throw new RegistryBackendError("submit_failed");
  }

  if (response.status === 401) {
    throw new RegistryBackendError("submit_failed");
  }

  let body: { success?: boolean; unchanged?: boolean; reason?: string } | null = null;
  try {
    body = (await response.json()) as { success?: boolean; unchanged?: boolean; reason?: string };
  } catch {
    body = null;
  }

  if (!response.ok || body?.success !== true) {
    throw new RegistryBackendError("submit_failed");
  }

  const reason =
    body.reason === "already_in_registry" || body.reason === "already_proposed"
      ? body.reason
      : undefined;
  return { unchanged: body.unchanged === true, reason };
}

function isProposalStatus(value: unknown): value is ProposalStatusInfo {
  if (!value || typeof value !== "object") return false;
  const status = value as Record<string, unknown>;
  return (
    (status.state === "open" || status.state === "rejected") &&
    typeof status.number === "number" &&
    typeof status.url === "string" &&
    status.url.startsWith("https://github.com/")
  );
}

/**
 * Статусы отправленных решений (жизненный цикл, lib/proposalLifecycle.ts).
 * Ключ — тот же, что для отправки. Любой сбой — RegistryBackendError: статусы
 * вспомогательные, плагин работает и без них.
 */
export async function fetchProposalStatuses(
  sharedSecret: string,
  signatures: string[]
): Promise<Record<string, ProposalStatusInfo>> {
  let response: Response;
  try {
    response = await fetch(REGISTRY_PROPOSAL_STATUS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sharedSecret, signatures }),
    });
  } catch {
    throw new RegistryBackendError("registry_unavailable");
  }
  if (!response.ok) throw new RegistryBackendError("registry_unavailable");

  let body: { statuses?: Record<string, unknown> } | null = null;
  try {
    body = (await response.json()) as { statuses?: Record<string, unknown> };
  } catch {
    throw new RegistryBackendError("registry_unavailable");
  }

  const statuses: Record<string, ProposalStatusInfo> = {};
  for (const [signature, status] of Object.entries(body?.statuses ?? {})) {
    if (isProposalStatus(status)) statuses[signature] = status;
  }
  return statuses;
}
