/**
 * Client for aid-registry-api — GET registry and POST propose-decision.
 * Used from code.ts only (main thread). Never log or expose the shared secret.
 */

import type { RegistryDecision, TokenCategory } from "./githubTypes";
import type { RegistryFileContent } from "./githubTypes";
import { REGISTRY_GET_URL, REGISTRY_PROPOSE_URL } from "./registryApiConfig";

export interface BackendRegistryResponse {
  exists: boolean;
  registry: RegistryFileContent;
  sha?: string;
}

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

export async function fetchRegistryFromBackend(
  sharedSecret: string
): Promise<BackendRegistryResponse> {
  if (!sharedSecret) {
    throw new RegistryBackendError("registry_unavailable");
  }

  let response: Response;
  try {
    response = await fetch(REGISTRY_GET_URL, {
      method: "GET",
      headers: { "X-Plugin-Secret": sharedSecret },
    });
  } catch {
    throw new RegistryBackendError("registry_unavailable");
  }

  if (response.status === 401 || !response.ok) {
    throw new RegistryBackendError("registry_unavailable");
  }

  try {
    return (await response.json()) as BackendRegistryResponse;
  } catch {
    throw new RegistryBackendError("registry_unavailable");
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
