import { randomBytes } from 'node:crypto';

import { jsonResponse } from './cors.js';
import { getRegistryConfig } from './registryConfig.js';
import {
  commitRegistryFile,
  createBranch,
  fetchRegistryFileOnMain,
  getMainHeadSha,
  openPullRequest,
  RegistryGitHubError,
  requestPullRequestReviewer,
  type FetchLike,
} from './registryGithub.js';
import {
  REGISTRY_DECISIONS,
  type ProposeDecisionRequestBody,
  type ProposedEntryInput,
  type RegistryFileContent,
  type RegistryFileEntry,
} from './registryTypes.js';
import { secretsEqual } from './security.js';

export interface ProposeDecisionDeps {
  fetchImpl: FetchLike;
  now?: () => Date;
}

function isRegistryDecision(value: unknown): value is ProposedEntryInput['decision'] {
  return typeof value === 'string' && (REGISTRY_DECISIONS as readonly string[]).includes(value);
}

export function validateProposeDecisionBody(body: unknown): ProposeDecisionRequestBody | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const candidate = body as Partial<ProposeDecisionRequestBody>;
  if (typeof candidate.sharedSecret !== 'string' || !candidate.sharedSecret.trim()) {
    return null;
  }
  if (typeof candidate.proposedBy !== 'string' || !candidate.proposedBy.trim()) {
    return null;
  }
  if (!Array.isArray(candidate.entries) || candidate.entries.length === 0) {
    return null;
  }

  const entries: ProposedEntryInput[] = [];
  for (const entry of candidate.entries) {
    if (!entry || typeof entry !== 'object') {
      return null;
    }
    const record = entry as Partial<ProposedEntryInput>;
    if (typeof record.signature !== 'string' || !record.signature.trim()) {
      return null;
    }
    if (!isRegistryDecision(record.decision)) {
      return null;
    }
    if (record.targetVariableId !== undefined && typeof record.targetVariableId !== 'string') {
      return null;
    }
    if (record.targetVariableName !== undefined && typeof record.targetVariableName !== 'string') {
      return null;
    }
    if (record.comment !== undefined && typeof record.comment !== 'string') {
      return null;
    }

    entries.push({
      signature: record.signature.trim(),
      decision: record.decision,
      targetVariableId: record.targetVariableId,
      targetVariableName: record.targetVariableName,
      comment: record.comment,
    });
  }

  return {
    sharedSecret: candidate.sharedSecret,
    proposedBy: candidate.proposedBy.trim(),
    entries,
  };
}

function buildProposedEntries(
  entries: ProposedEntryInput[],
  proposedBy: string,
  proposedAt: string,
): RegistryFileEntry[] {
  return entries.map((entry) => ({
    signature: entry.signature,
    decision: entry.decision,
    ...(entry.targetVariableId ? { targetVariableId: entry.targetVariableId } : {}),
    ...(entry.targetVariableName ? { targetVariableName: entry.targetVariableName } : {}),
    ...(entry.comment ? { comment: entry.comment } : {}),
    proposedBy,
    proposedAt,
  }));
}

function buildPullRequestBody(entries: ProposedEntryInput[]): string {
  const lines = entries.map(
    (entry) => `- \`${entry.signature}\` → ${entry.decision}`,
  );
  return ['## Proposed decisions', '', ...lines].join('\n');
}

function createBranchName(now: Date): string {
  const shortId = randomBytes(4).toString('hex');
  return `registry/propose-${now.getTime()}-${shortId}`;
}

function failureResponse(status: number): Response {
  return jsonResponse({ success: false }, status);
}

export async function handleProposeDecision(
  request: Request,
  deps: ProposeDecisionDeps,
): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  const configuredSecret = process.env.PLUGIN_SHARED_SECRET;
  if (!configuredSecret) {
    console.error('[propose-decision] PLUGIN_SHARED_SECRET is not configured');
    return jsonResponse({ error: 'internal_error' }, 500);
  }

  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.error('[propose-decision] GITHUB_TOKEN is not configured');
    return jsonResponse({ error: 'internal_error' }, 500);
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch (error) {
    console.error('[propose-decision] Invalid JSON body', error);
    return jsonResponse({ error: 'invalid_request' }, 400);
  }

  const body = validateProposeDecisionBody(rawBody);
  if (!body) {
    return jsonResponse({ error: 'invalid_request' }, 400);
  }

  if (!secretsEqual(body.sharedSecret, configuredSecret)) {
    return jsonResponse({ error: 'unauthorized' }, 401);
  }

  const now = deps.now?.() ?? new Date();
  const proposedAt = now.toISOString();
  const config = getRegistryConfig();
  const newEntries = buildProposedEntries(body.entries, body.proposedBy, proposedAt);

  try {
    const current = await fetchRegistryFileOnMain(deps.fetchImpl, githubToken, config);
    const merged: RegistryFileContent = {
      schemaVersion: current.file.schemaVersion || '1.0',
      registryVersion: current.file.registryVersion + 1,
      updatedAt: proposedAt,
      entries: [...current.file.entries, ...newEntries],
    };

    const mainSha = await getMainHeadSha(deps.fetchImpl, githubToken, config);
    const branchName = createBranchName(now);
    await createBranch(deps.fetchImpl, githubToken, config, branchName, mainSha);

    const commitMessage = `chore(registry): propose ${body.entries.length} decisions from ${body.proposedBy}`;
    await commitRegistryFile(
      deps.fetchImpl,
      githubToken,
      config,
      branchName,
      merged,
      commitMessage,
      current.exists ? current.file.sha : undefined,
    );

    const prTitle = `chore(registry): propose ${body.entries.length} decisions from ${body.proposedBy}`;
    const prBody = buildPullRequestBody(body.entries);
    const pullNumber = await openPullRequest(
      deps.fetchImpl,
      githubToken,
      config,
      branchName,
      prTitle,
      prBody,
    );

    await requestPullRequestReviewer(deps.fetchImpl, githubToken, config, pullNumber);

    return jsonResponse({ success: true }, 200);
  } catch (error) {
    if (error instanceof RegistryGitHubError) {
      const status = error.status === 409 ? 409 : 200;
      return failureResponse(status);
    }
    console.error('[propose-decision] Unexpected error', error);
    return failureResponse(200);
  }
}
