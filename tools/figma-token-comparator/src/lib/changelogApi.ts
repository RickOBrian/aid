/**
 * Клиент сервера для «Записать изменения»: список чейнжлогов и отправка
 * записи «Не опубликовано». Используется только из code.ts. Ключ не логировать.
 */

import { REGISTRY_PROPOSE_TIMEOUT_MS, fetchWithTimeout } from "./fetchWithTimeout";
import { CHANGELOG_RECORD_URL, CHANGELOGS_URL } from "./registryApiConfig";
import { RegistryBackendError } from "./registryBackendApi";
import type { UnpublishedEntry } from "./changelogRecord";

export interface ChangelogSummary {
  path: string;
  artifact: string;
  currentVersion: string | null;
  figmaTable: { fileKey: string; nodeId: string } | null;
  pullRequest: { number: number; url: string } | null;
  unpublished: UnpublishedEntry | null;
}

export interface RecordChangelogResult {
  pullRequestUrl: string | null;
  outcome: "created" | "updated" | "unchanged";
}

interface RecordResponseBody {
  success?: boolean;
  created?: boolean;
  updated?: boolean;
  pullRequest?: { url?: unknown } | null;
}

function isGithubPullUrl(value: unknown): value is string {
  return typeof value === "string" && /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+$/.test(value);
}

export async function fetchChangelogs(): Promise<ChangelogSummary[]> {
  let response: Response;
  try {
    response = await fetchWithTimeout(CHANGELOGS_URL, { method: "GET" }, REGISTRY_PROPOSE_TIMEOUT_MS);
  } catch {
    throw new RegistryBackendError("network");
  }
  if (!response.ok) throw new RegistryBackendError("registry_unavailable");
  let body: { changelogs?: unknown } | null = null;
  try {
    body = (await response.json()) as { changelogs?: unknown };
  } catch {
    throw new RegistryBackendError("registry_unavailable");
  }
  if (!Array.isArray(body?.changelogs)) throw new RegistryBackendError("registry_unavailable");
  return (body.changelogs as ChangelogSummary[]).filter(
    (item) => item && typeof item.path === "string" && typeof item.artifact === "string"
  );
}

export async function recordChangelogOnBackend(
  payload: { path: string; entry: UnpublishedEntry },
  sharedSecret: string
): Promise<RecordChangelogResult> {
  if (!sharedSecret) throw new RegistryBackendError("invalid_key");
  let response: Response;
  try {
    response = await fetchWithTimeout(
      CHANGELOG_RECORD_URL,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sharedSecret, ...payload }),
      },
      REGISTRY_PROPOSE_TIMEOUT_MS
    );
  } catch {
    throw new RegistryBackendError("network");
  }
  if (response.status === 401) throw new RegistryBackendError("invalid_key");

  let body: RecordResponseBody | null = null;
  try {
    body = (await response.json()) as RecordResponseBody;
  } catch {
    body = null;
  }
  if (!response.ok || body?.success !== true) throw new RegistryBackendError("submit_failed");

  const url = body.pullRequest?.url;
  return {
    pullRequestUrl: isGithubPullUrl(url) ? url : null,
    outcome: body.created ? "created" : body.updated ? "updated" : "unchanged",
  };
}
