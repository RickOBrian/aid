/**
 * Статусы отправленных решений — жизненный цикл предложения.
 *
 * Плагин помнит, какие решения отправил, но не знает, что с ними стало.
 * Согласованное он узнаёт сам — по реестру main. Этот эндпоинт отвечает на
 * остальное: решение лежит в открытом запросе (`open`) или в запросе,
 * закрытом без мержа (`rejected`).
 *
 * На ветке `registry/propose-*` лежит весь реестр, а не только новые решения,
 * поэтому «что предложено в запросе» — это записи, которых нет в main или
 * которые отличаются от main по содержанию.
 *
 * Читается через бэкенд, а не с GitHub напрямую: у неавторизованных запросов
 * к api.github.com лимит 60 в час на IP (находка №22). Доступ — по тому же
 * ключу, что и отправка: статусы нужны только тем, кто отправляет.
 */

import { jsonResponse } from './cors.js';
import { entryContentKey } from './mergeRegistryEntries.js';
import { getRegistryConfig } from './registryConfig.js';
import {
  fetchLatestIssueComment,
  fetchRegistryFileOnBranch,
  fetchRegistryFileOnMain,
  listProposalPullRequests,
  type FetchLike,
} from './registryGithub.js';
import type { RegistryConfig } from './registryTypes.js';
import { secretsEqual } from './security.js';

/** Сколько подписей можно спросить за раз. */
const MAX_SIGNATURES = 500;

/** Длина комментария отклонения в ответе — подсказка в плагине, не переписка. */
const MAX_COMMENT_LENGTH = 500;

export type ProposalState = 'open' | 'rejected';

export interface ProposalStatus {
  state: ProposalState;
  number: number;
  url: string;
  closedAt?: string;
  /** Последний комментарий в отклонённом запросе — обычно причина. */
  comment?: string;
}

export interface ProposalStatusRequestBody {
  sharedSecret: string;
  signatures: string[];
}

export interface ProposalStatusDeps {
  fetchImpl: FetchLike;
}

export function validateProposalStatusBody(raw: unknown): ProposalStatusRequestBody | null {
  if (!raw || typeof raw !== 'object') return null;
  const body = raw as Record<string, unknown>;
  if (typeof body.sharedSecret !== 'string' || !body.sharedSecret) return null;
  if (!Array.isArray(body.signatures) || body.signatures.length > MAX_SIGNATURES) return null;
  if (!body.signatures.every((item) => typeof item === 'string' && item.trim())) return null;
  return { sharedSecret: body.sharedSecret, signatures: body.signatures as string[] };
}

/**
 * Статусы по запрошенным подписям. Запросы — от новых к старым: у подписи,
 * которую отправляли несколько раз, действует последний запрос. Смёрженные
 * запросы пропускаются — их решения уже в main.
 */
export async function resolveProposalStatuses(
  fetchImpl: FetchLike,
  token: string,
  config: RegistryConfig,
  signatures: string[],
): Promise<Record<string, ProposalStatus>> {
  const wanted = new Set(signatures);
  const statuses: Record<string, ProposalStatus> = {};
  if (wanted.size === 0) return statuses;

  const pulls = (await listProposalPullRequests(fetchImpl, token, config)).filter((pull) => !pull.mergedAt);
  if (pulls.length === 0) return statuses;

  const main = await fetchRegistryFileOnMain(fetchImpl, token, config);
  const mainKeys = new Map(main.file.entries.map((entry) => [entry.signature, entryContentKey(entry)]));

  for (const pull of pulls) {
    if (Object.keys(statuses).length === wanted.size) break;

    const onBranch = await fetchRegistryFileOnBranch(fetchImpl, token, config, pull.headSha);
    if (!onBranch) continue;

    const proposedHere = onBranch.entries.filter(
      (entry) =>
        wanted.has(entry.signature) &&
        !statuses[entry.signature] &&
        mainKeys.get(entry.signature) !== entryContentKey(entry),
    );
    if (proposedHere.length === 0) continue;

    const state: ProposalState = pull.state === 'open' ? 'open' : 'rejected';
    let comment: string | undefined;
    if (state === 'rejected') {
      comment = (await fetchLatestIssueComment(fetchImpl, token, config, pull.number))
        ?.trim()
        .slice(0, MAX_COMMENT_LENGTH);
    }

    for (const entry of proposedHere) {
      statuses[entry.signature] = {
        state,
        number: pull.number,
        url: pull.url,
        ...(state === 'rejected' && pull.closedAt ? { closedAt: pull.closedAt } : {}),
        ...(comment ? { comment } : {}),
      };
    }
  }

  return statuses;
}

export async function handleProposalStatus(request: Request, deps: ProposalStatusDeps): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  const configuredSecret = process.env.PLUGIN_SHARED_SECRET;
  const githubToken = process.env.GITHUB_TOKEN;
  if (!configuredSecret || !githubToken) {
    console.error('[proposal-status] PLUGIN_SHARED_SECRET or GITHUB_TOKEN is not configured');
    return jsonResponse({ error: 'internal_error' }, 500);
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return jsonResponse({ error: 'invalid_request' }, 400);
  }

  const body = validateProposalStatusBody(rawBody);
  if (!body) return jsonResponse({ error: 'invalid_request' }, 400);
  if (!secretsEqual(body.sharedSecret, configuredSecret)) {
    return jsonResponse({ error: 'unauthorized' }, 401);
  }

  try {
    const statuses = await resolveProposalStatuses(
      deps.fetchImpl,
      githubToken,
      getRegistryConfig(),
      body.signatures,
    );
    return jsonResponse({ statuses }, 200);
  } catch (error) {
    console.error('[proposal-status] Failed to resolve statuses', error);
    return jsonResponse({ error: 'github_error' }, 502);
  }
}
