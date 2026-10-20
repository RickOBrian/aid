import { randomBytes } from 'node:crypto';

import { jsonResponse } from './cors.js';
import { getRegistryConfig } from './registryConfig.js';
import {
  decodeBase64Content,
  encodeBase64Content,
  encodeRepoPath,
  githubRequest,
  openPullRequest,
  createBranch,
  getMainHeadSha,
  parseJsonBody,
  requestPullRequestReviewer,
  RegistryGitHubError,
  type FetchLike,
} from './registryGithub.js';
import type { RegistryConfig } from './registryTypes.js';
import { secretsEqual } from './security.js';

/**
 * Чейнжлоги библиотек (changelog-guide §5–6): плагин «Записать изменения»
 * читает их и присылает запись «Не опубликовано», сервер открывает PR.
 *
 * На каждый файл чейнжлога — не больше одного открытого PR этого флоу:
 * повторная запись обновляет его ветку, а не заводит новый. Версию и дату
 * сервер не ставит никогда — это граница релиза.
 */

export const CHANGELOG_BRANCH_PREFIX = 'changelog/';
const CHANGELOG_DIRS = ['tokens', 'components'] as const;
export const CHANGELOG_PATH_PATTERN = /^(tokens|components)\/[a-z0-9][a-z0-9-]*-changelog\.json$/;

const CHANGE_KINDS = ['added', 'changed', 'removed', 'fixed', 'deprecated'] as const;
const BUMP_TYPES = ['major', 'minor', 'patch'] as const;
const MAX_CHANGES = 200;
const MAX_DESCRIPTION = 500;
const MAX_DETAILS = 50_000;
const MAX_AUTHOR = 100;

export interface ChangelogChange {
  kind: (typeof CHANGE_KINDS)[number];
  description: string;
  details?: string;
}

export interface UnpublishedEntry {
  version: null;
  date: null;
  author: string;
  type: (typeof BUMP_TYPES)[number];
  changes: ChangelogChange[];
}

interface ChangelogFile {
  artifact?: unknown;
  currentVersion?: unknown;
  figmaTable?: unknown;
  entries?: unknown;
  [key: string]: unknown;
}

export interface ChangelogSummary {
  path: string;
  artifact: string;
  currentVersion: string | null;
  figmaTable: { fileKey: string; nodeId: string } | null;
  pullRequest: { number: number; url: string } | null;
  unpublished: UnpublishedEntry | null;
}

export interface ChangelogDeps {
  fetchImpl: FetchLike;
  now?: () => Date;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** `tokens/rider-colors-semantic-changelog.json` → `rider-colors-semantic`. */
export function changelogStem(path: string): string {
  return path.replace(/^.*\//, '').replace(/-changelog\.json$/, '');
}

function repoBase(config: RegistryConfig): string {
  return `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}`;
}

function readFigmaTable(value: unknown): ChangelogSummary['figmaTable'] {
  if (!isRecord(value)) return null;
  return typeof value.fileKey === 'string' && typeof value.nodeId === 'string'
    ? { fileKey: value.fileKey, nodeId: value.nodeId }
    : null;
}

function readUnpublished(file: ChangelogFile): UnpublishedEntry | null {
  if (!Array.isArray(file.entries) || file.entries.length === 0) return null;
  const first: unknown = file.entries[0];
  return validateUnpublishedEntry(first);
}

export function validateUnpublishedEntry(value: unknown): UnpublishedEntry | null {
  if (!isRecord(value)) return null;
  if (value.version !== null || value.date !== null) return null;
  if (typeof value.author !== 'string') return null;
  const author = value.author.trim();
  if (!author || author.length > MAX_AUTHOR) return null;
  if (!(BUMP_TYPES as readonly unknown[]).includes(value.type)) return null;
  if (!Array.isArray(value.changes) || value.changes.length === 0 || value.changes.length > MAX_CHANGES) return null;

  const changes: ChangelogChange[] = [];
  for (const raw of value.changes) {
    if (!isRecord(raw)) return null;
    if (!(CHANGE_KINDS as readonly unknown[]).includes(raw.kind)) return null;
    if (typeof raw.description !== 'string') return null;
    const description = raw.description.trim();
    if (!description || description.length > MAX_DESCRIPTION) return null;
    if (raw.details !== undefined && (typeof raw.details !== 'string' || raw.details.length > MAX_DETAILS)) return null;
    changes.push({
      kind: raw.kind as ChangelogChange['kind'],
      description,
      ...(typeof raw.details === 'string' && raw.details ? { details: raw.details } : {}),
    });
  }

  return { version: null, date: null, author, type: value.type as UnpublishedEntry['type'], changes };
}

/**
 * Запись «Не опубликовано» встаёт первой; если такая уже есть — заменяется
 * целиком: плагин присылает полную картину от последней опубликованной версии.
 */
export function upsertUnpublishedEntry(file: ChangelogFile, entry: UnpublishedEntry): ChangelogFile {
  const entries = Array.isArray(file.entries) ? [...file.entries] : [];
  const first: unknown = entries[0];
  if (isRecord(first) && first.version === null) entries[0] = entry;
  else entries.unshift(entry);
  return { ...file, entries };
}

export function serializeChangelog(file: ChangelogFile): string {
  return `${JSON.stringify(file, null, 2)}\n`;
}

interface FetchedFile {
  file: ChangelogFile;
  sha: string;
}

async function fetchChangelogFile(
  deps: ChangelogDeps,
  token: string,
  config: RegistryConfig,
  path: string,
  ref: string,
): Promise<FetchedFile | null> {
  const response = await githubRequest(
    deps.fetchImpl,
    token,
    `${repoBase(config)}/contents/${encodeRepoPath(path)}?ref=${encodeURIComponent(ref)}`,
    { method: 'GET' },
  );
  if (response.status === 404) return null;
  if (!response.ok) {
    const body = await parseJsonBody<{ message?: string }>(response);
    throw new RegistryGitHubError(body.message || 'Failed to fetch changelog file.', response.status);
  }
  const body = await parseJsonBody<{ message?: string; content?: string; encoding?: string; sha?: string }>(response);
  if (!body.content || body.encoding !== 'base64' || !body.sha) {
    throw new RegistryGitHubError('GitHub returned changelog file without content.');
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(decodeBase64Content(body.content));
  } catch {
    throw new RegistryGitHubError(`${path} is not valid JSON.`);
  }
  if (!isRecord(parsed)) throw new RegistryGitHubError(`${path} must be a JSON object.`);
  return { file: parsed, sha: body.sha };
}

async function listChangelogPaths(deps: ChangelogDeps, token: string, config: RegistryConfig): Promise<string[]> {
  const paths: string[] = [];
  for (const dir of CHANGELOG_DIRS) {
    const response = await githubRequest(deps.fetchImpl, token, `${repoBase(config)}/contents/${dir}?ref=main`, {
      method: 'GET',
    });
    if (response.status === 404) continue;
    if (!response.ok) {
      const body = await parseJsonBody<{ message?: string }>(response);
      throw new RegistryGitHubError(body.message || 'Failed to list changelogs.', response.status);
    }
    const items: unknown = await response.json();
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      if (isRecord(item) && item.type === 'file' && typeof item.path === 'string' && CHANGELOG_PATH_PATTERN.test(item.path)) {
        paths.push(item.path);
      }
    }
  }
  return paths.sort();
}

interface OpenChangelogPull {
  number: number;
  url: string;
  branch: string;
}

/** Открытые PR этого флоу: stem → PR. */
async function listOpenChangelogPulls(
  deps: ChangelogDeps,
  token: string,
  config: RegistryConfig,
): Promise<Map<string, OpenChangelogPull>> {
  const response = await githubRequest(deps.fetchImpl, token, `${repoBase(config)}/pulls?state=open&per_page=100`, {
    method: 'GET',
  });
  if (!response.ok) {
    const body = await parseJsonBody<{ message?: string }>(response);
    throw new RegistryGitHubError(body.message || 'Failed to list pull requests.', response.status);
  }
  const pulls: unknown = await response.json();
  const result = new Map<string, OpenChangelogPull>();
  if (!Array.isArray(pulls)) return result;
  for (const pull of pulls) {
    if (!isRecord(pull) || !isRecord(pull.head)) continue;
    const ref = pull.head.ref;
    if (typeof ref !== 'string' || !ref.startsWith(CHANGELOG_BRANCH_PREFIX)) continue;
    if (typeof pull.number !== 'number' || typeof pull.html_url !== 'string') continue;
    // Ветка: changelog/<stem>-<время>-<id>
    const match = /^changelog\/(.+)-\d+-[0-9a-f]+$/.exec(ref);
    if (!match || result.has(match[1])) continue;
    result.set(match[1], { number: pull.number, url: pull.html_url, branch: ref });
  }
  return result;
}

async function commitChangelogFile(
  deps: ChangelogDeps,
  token: string,
  config: RegistryConfig,
  path: string,
  branch: string,
  content: string,
  sha: string,
  message: string,
): Promise<void> {
  const response = await githubRequest(deps.fetchImpl, token, `${repoBase(config)}/contents/${encodeRepoPath(path)}`, {
    method: 'PUT',
    body: JSON.stringify({ message, content: encodeBase64Content(content), branch, sha }),
  });
  if (!response.ok) {
    const body = await parseJsonBody<{ message?: string }>(response);
    throw new RegistryGitHubError(body.message || 'Failed to commit changelog file.', response.status);
  }
}

function requireGithubToken(): string | null {
  const token = process.env.GITHUB_TOKEN;
  if (!token) console.error('[changelog] GITHUB_TOKEN is not configured');
  return token || null;
}

/** GET /api/registry/changelogs — чейнжлоги из main и их записи «Не опубликовано» из открытых PR. Без ключа: файлы и PR публичные. */
export async function handleListChangelogs(request: Request, deps: ChangelogDeps): Promise<Response> {
  if (request.method !== 'GET') return jsonResponse({ error: 'method_not_allowed' }, 405);
  const token = requireGithubToken();
  if (!token) return jsonResponse({ error: 'internal_error' }, 500);
  const config = getRegistryConfig();

  try {
    const [paths, pulls] = await Promise.all([
      listChangelogPaths(deps, token, config),
      listOpenChangelogPulls(deps, token, config),
    ]);
    const changelogs = await Promise.all(
      paths.map(async (path): Promise<ChangelogSummary | null> => {
        const main = await fetchChangelogFile(deps, token, config, path, 'main');
        if (!main) return null;
        const pull = pulls.get(changelogStem(path)) ?? null;
        const onBranch = pull ? await fetchChangelogFile(deps, token, config, path, pull.branch) : null;
        return {
          path,
          artifact: typeof main.file.artifact === 'string' ? main.file.artifact : changelogStem(path),
          currentVersion: typeof main.file.currentVersion === 'string' ? main.file.currentVersion : null,
          figmaTable: readFigmaTable(main.file.figmaTable),
          pullRequest: pull ? { number: pull.number, url: pull.url } : null,
          unpublished: readUnpublished(onBranch?.file ?? main.file),
        };
      }),
    );
    return jsonResponse({ changelogs: changelogs.filter((item): item is ChangelogSummary => item !== null) }, 200);
  } catch (error) {
    console.error('[changelog] Failed to list changelogs', error);
    return jsonResponse({ error: 'github_unavailable' }, 502);
  }
}

export interface RecordChangelogBody {
  sharedSecret: string;
  recordedBy: string;
  path: string;
  entry: UnpublishedEntry;
}

export function validateRecordChangelogBody(body: unknown): RecordChangelogBody | null {
  if (!isRecord(body)) return null;
  if (typeof body.sharedSecret !== 'string' || !body.sharedSecret.trim()) return null;
  if (typeof body.recordedBy !== 'string' || !body.recordedBy.trim() || body.recordedBy.length > MAX_AUTHOR) return null;
  if (typeof body.path !== 'string' || !CHANGELOG_PATH_PATTERN.test(body.path)) return null;
  const entry = validateUnpublishedEntry(body.entry);
  if (!entry) return null;
  return { sharedSecret: body.sharedSecret, recordedBy: body.recordedBy.trim(), path: body.path, entry };
}

const KIND_TITLES: Record<ChangelogChange['kind'], string> = {
  added: 'Добавлено',
  changed: 'Изменено',
  removed: 'Удалено',
  fixed: 'Исправлено',
  deprecated: 'Устарело',
};

export function buildChangelogPullRequestBody(body: RecordChangelogBody, artifact: string): string {
  const lines = [
    `Запись «Не опубликовано» в \`${body.path}\` (${artifact}) — из Token Comparator, кнопка «Записать изменения».`,
    '',
    `Записал: ${body.recordedBy} · автор: ${body.entry.author} · предлагаемая цифра: **${body.entry.type}**`,
    '',
  ];
  for (const change of body.entry.changes) {
    lines.push(`- **${KIND_TITLES[change.kind]}** — ${change.description}`);
    if (change.details) {
      for (const detail of change.details.split('\n')) lines.push(`  - ${detail}`);
    }
  }
  lines.push(
    '',
    'Версию и дату ставит граница релиза (changelog-guide §6). Повторная запись из плагина обновляет этот PR.',
  );
  return lines.join('\n');
}

/** POST /api/registry/changelog-record — записать «Не опубликовано» и открыть или обновить PR. */
export async function handleRecordChangelog(request: Request, deps: ChangelogDeps): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'method_not_allowed' }, 405);

  const configuredSecret = process.env.PLUGIN_SHARED_SECRET;
  if (!configuredSecret) {
    console.error('[changelog] PLUGIN_SHARED_SECRET is not configured');
    return jsonResponse({ error: 'internal_error' }, 500);
  }
  const token = requireGithubToken();
  if (!token) return jsonResponse({ error: 'internal_error' }, 500);

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return jsonResponse({ error: 'invalid_request' }, 400);
  }
  const body = validateRecordChangelogBody(raw);
  if (!body) return jsonResponse({ error: 'invalid_request' }, 400);
  if (!secretsEqual(body.sharedSecret, configuredSecret)) return jsonResponse({ error: 'unauthorized' }, 401);

  const config = getRegistryConfig();
  const stem = changelogStem(body.path);
  const now = deps.now?.() ?? new Date();
  const commitMessage = `changelog(${stem}): «Не опубликовано» от ${body.recordedBy}`;

  try {
    const pull = (await listOpenChangelogPulls(deps, token, config)).get(stem);

    if (pull) {
      const current = await fetchChangelogFile(deps, token, config, body.path, pull.branch);
      if (!current) return jsonResponse({ success: false, error: 'changelog_not_found' }, 404);
      const next = serializeChangelog(upsertUnpublishedEntry(current.file, body.entry));
      if (next === serializeChangelog(current.file)) {
        return jsonResponse({ success: true, unchanged: true, pullRequest: { number: pull.number, url: pull.url } }, 200);
      }
      await commitChangelogFile(deps, token, config, body.path, pull.branch, next, current.sha, commitMessage);
      return jsonResponse({ success: true, updated: true, pullRequest: { number: pull.number, url: pull.url } }, 200);
    }

    const main = await fetchChangelogFile(deps, token, config, body.path, 'main');
    if (!main) return jsonResponse({ success: false, error: 'changelog_not_found' }, 404);
    const next = serializeChangelog(upsertUnpublishedEntry(main.file, body.entry));
    if (next === serializeChangelog(main.file)) {
      return jsonResponse({ success: true, unchanged: true, pullRequest: null }, 200);
    }

    const branch = `${CHANGELOG_BRANCH_PREFIX}${stem}-${now.getTime()}-${randomBytes(4).toString('hex')}`;
    await createBranch(deps.fetchImpl, token, config, branch, await getMainHeadSha(deps.fetchImpl, token, config));
    await commitChangelogFile(deps, token, config, body.path, branch, next, main.sha, commitMessage);
    const artifact = typeof main.file.artifact === 'string' ? main.file.artifact : stem;
    const number = await openPullRequest(
      deps.fetchImpl,
      token,
      config,
      branch,
      `changelog(${stem}): «Не опубликовано» — ${artifact}`,
      buildChangelogPullRequestBody(body, artifact),
    );
    await requestPullRequestReviewer(deps.fetchImpl, token, config, number);
    const url = `https://github.com/${config.owner}/${config.repo}/pull/${number}`;
    return jsonResponse({ success: true, created: true, pullRequest: { number, url } }, 200);
  } catch (error) {
    console.error('[changelog] Failed to record changelog entry', error);
    const status = error instanceof RegistryGitHubError && error.status === 409 ? 409 : 502;
    return jsonResponse({ success: false, error: 'github_unavailable' }, status);
  }
}
