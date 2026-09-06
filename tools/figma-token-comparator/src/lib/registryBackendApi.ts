/**
 * Client for aid-registry-api — GET registry and POST propose-decision.
 * Used from code.ts only (main thread). Never log or expose the shared secret.
 */

import type { RegistryDecision } from "./githubTypes";
import type { RegistryFileContent } from "./githubTypes";
import { getPluginSharedSecret, REGISTRY_GET_URL, REGISTRY_PROPOSE_URL } from "./registryApiConfig";

export interface BackendRegistryResponse {
  exists: boolean;
  registry: RegistryFileContent;
  sha?: string;
}

export interface ProposeDecisionEntryPayload {
  signature: string;
  decision: RegistryDecision;
  targetVariableId?: string;
  targetVariableName?: string;
  comment?: string;
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

function pluginSecretHeader(): Record<string, string> {
  return { "X-Plugin-Secret": getPluginSharedSecret() };
}

export async function fetchRegistryFromBackend(): Promise<BackendRegistryResponse> {
  if (!getPluginSharedSecret()) {
    throw new RegistryBackendError("registry_unavailable");
  }

  let response: Response;
  try {
    response = await fetch(REGISTRY_GET_URL, {
      method: "GET",
      headers: pluginSecretHeader(),
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

export async function proposeDecisionsOnBackend(payload: ProposeDecisionsPayload): Promise<void> {
  const sharedSecret = getPluginSharedSecret();
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

  let body: { success?: boolean } | null = null;
  try {
    body = (await response.json()) as { success?: boolean };
  } catch {
    body = null;
  }

  if (!response.ok || body?.success !== true) {
    throw new RegistryBackendError("submit_failed");
  }
}
