import { randomBytes } from 'node:crypto';

import { jsonResponse } from './cors.js';
import { getRegistryConfig } from './registryConfig.js';
import {
  commitRegistryFile,
  createBranch,
  fetchRegistryFileOnBranch,
  fetchRegistryFileOnMain,
  getMainHeadSha,
  listOpenProposalBranches,
  openPullRequest,
  PROPOSAL_BRANCH_PREFIX,
  RegistryGitHubError,
  requestPullRequestReviewer,
  type FetchLike,
} from './registryGithub.js';
import { buildPullRequestBody } from './pullRequestBody.js';
import {
  allEntriesAlreadyPresent,
  mergeRegistryEntries,
  registryEntriesChanged,
} from './mergeRegistryEntries.js';
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

/**
 * Transient review-projection string fields — accepted (whitelist-validated)
 * from the client, but NEVER passed to buildProposedEntries / RegistryFileEntry
 * / decisions-registry.json. Used only by buildPullRequestBody for the
 * human-readable GitHub PR description.
 */
const TRANSIENT_STRING_FIELDS = [
  'sourceProperty',
  'sourceBindingType',
  'sourceName',
  'sourceDisplayValue',
  'nodePath',
  'nodeName',
  'targetCollectionName',
  'targetModeName',
  'targetDisplayValue',
  'proposedModeName',
  'currentLibraryValue',
  'proposedValue',
  'targetLibraryName',
] as const;

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value) && value > 0;
}

function isRegistryCategory(value: unknown): value is ProposedEntryInput['category'] {
  return value === 'colors' || value === 'typography' || value === 'icons';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
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
    if (record.category !== undefined && !isRegistryCategory(record.category)) {
      return null;
    }
    if (record.targetStyleId !== undefined && typeof record.targetStyleId !== 'string') {
      return null;
    }
    if (record.targetStyleName !== undefined && typeof record.targetStyleName !== 'string') {
      return null;
    }
    if (record.mismatchedProperties !== undefined && !isStringArray(record.mismatchedProperties)) {
      return null;
    }
    if (record.targetComponentKey !== undefined && typeof record.targetComponentKey !== 'string') {
      return null;
    }
    if (record.targetComponentName !== undefined && typeof record.targetComponentName !== 'string') {
      return null;
    }
    if (record.comment !== undefined && typeof record.comment !== 'string') {
      return null;
    }
    if (record.targetLibraryFileKey !== undefined && typeof record.targetLibraryFileKey !== 'string') {
      return null;
    }

    // Transient review-projection metadata — whitelist-validated, but kept
    // out of RegistryFileEntry (see buildProposedEntries below).
    for (const field of TRANSIENT_STRING_FIELDS) {
      const value = record[field];
      if (value !== undefined && typeof value !== 'string') {
        return null;
      }
    }
    if (record.occurrenceCount !== undefined && !isPositiveInteger(record.occurrenceCount)) {
      return null;
    }

    entries.push({
      signature: record.signature.trim(),
      decision: record.decision,
      category: record.category,
      targetVariableId: record.targetVariableId,
      targetVariableName: record.targetVariableName,
      targetStyleId: record.targetStyleId,
      targetStyleName: record.targetStyleName,
      mismatchedProperties: record.mismatchedProperties,
      targetComponentKey: record.targetComponentKey,
      targetComponentName: record.targetComponentName,
      comment: record.comment,
      targetLibraryFileKey: record.targetLibraryFileKey,
      sourceProperty: record.sourceProperty,
      sourceBindingType: record.sourceBindingType,
      sourceName: record.sourceName,
      sourceDisplayValue: record.sourceDisplayValue,
      nodePath: record.nodePath,
      nodeName: record.nodeName,
      occurrenceCount: record.occurrenceCount,
      targetCollectionName: record.targetCollectionName,
      targetModeName: record.targetModeName,
      targetDisplayValue: record.targetDisplayValue,
      proposedModeName: record.proposedModeName,
      currentLibraryValue: record.currentLibraryValue,
      proposedValue: record.proposedValue,
      targetLibraryName: record.targetLibraryName,
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
    ...(entry.category ? { category: entry.category } : {}),
    ...(entry.targetVariableId ? { targetVariableId: entry.targetVariableId } : {}),
    ...(entry.targetVariableName ? { targetVariableName: entry.targetVariableName } : {}),
    ...(entry.targetStyleId ? { targetStyleId: entry.targetStyleId } : {}),
    ...(entry.targetStyleName ? { targetStyleName: entry.targetStyleName } : {}),
    ...(entry.mismatchedProperties && entry.mismatchedProperties.length > 0
      ? { mismatchedProperties: entry.mismatchedProperties }
      : {}),
    ...(entry.targetComponentKey ? { targetComponentKey: entry.targetComponentKey } : {}),
    ...(entry.targetComponentName ? { targetComponentName: entry.targetComponentName } : {}),
    ...(entry.comment ? { comment: entry.comment } : {}),
    ...(entry.targetLibraryFileKey ? { targetLibraryFileKey: entry.targetLibraryFileKey } : {}),
    proposedBy,
    proposedAt,
  }));
}

/**
 * Лежат ли ровно эти решения в каком-нибудь ещё открытом pull request'е.
 *
 * Слияние всегда идёт от `main`, где решений из открытых PR ещё нет, поэтому
 * повторная отправка выглядит как новое изменение и заводила второй PR с тем
 * же содержимым. Типичный сценарий — обрыв сети: клиент не увидел ответа и
 * пользователь нажал «Отправить» ещё раз.
 *
 * Сбой самой проверки не должен мешать работе: если GitHub не ответил,
 * считаем, что дубликата нет, и заводим PR. Лишний pull request — меньшее
 * зло, чем потерянное решение.
 */
async function isAlreadyProposedInOpenPullRequest(
  deps: ProposeDecisionDeps,
  githubToken: string,
  config: ReturnType<typeof getRegistryConfig>,
  newEntries: RegistryFileEntry[],
): Promise<boolean> {
  try {
    const branches = await listOpenProposalBranches(deps.fetchImpl, githubToken, config);
    for (const branch of branches) {
      const file = await fetchRegistryFileOnBranch(deps.fetchImpl, githubToken, config, branch);
      if (file && allEntriesAlreadyPresent(file.entries, newEntries)) {
        return true;
      }
    }
  } catch (error) {
    console.error('[propose-decision] Failed to check open pull requests', error);
  }
  return false;
}

function createBranchName(now: Date): string {
  const shortId = randomBytes(4).toString('hex');
  return `${PROPOSAL_BRANCH_PREFIX}${now.getTime()}-${shortId}`;
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

    // Подпись выводится из свойств группы детерминированно, поэтому одна и та
    // же подпись приходит и от разных людей, и при повторной отправке.
    // Новое решение заменяет старое; реестр хранит текущее решение по каждой
    // подписи, а история правок остаётся в git.
    const mergedEntries = mergeRegistryEntries(current.file.entries, newEntries);

    // Отправили то, что уже записано (типичный случай — повтор после обрыва
    // сети): заводить pull request с пустым по смыслу диффом незачем.
    if (!registryEntriesChanged(current.file.entries, mergedEntries)) {
      return jsonResponse({ success: true, unchanged: true, reason: 'already_in_registry' }, 200);
    }

    // Те же решения уже ждут согласования в открытом pull request'е.
    if (await isAlreadyProposedInOpenPullRequest(deps, githubToken, config, newEntries)) {
      return jsonResponse({ success: true, unchanged: true, reason: 'already_proposed' }, 200);
    }

    const merged: RegistryFileContent = {
      schemaVersion: current.file.schemaVersion || '1.0',
      // Счётчик информационный: два предложения, созданные от одного
      // состояния main, получат одинаковый номер, и при слиянии обоих он
      // окажется занижен. Ни одна ветка логики на нём не завязана.
      registryVersion: current.file.registryVersion + 1,
      updatedAt: proposedAt,
      entries: mergedEntries,
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
    const prBody = buildPullRequestBody(body.entries, body.proposedBy, proposedAt);
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
