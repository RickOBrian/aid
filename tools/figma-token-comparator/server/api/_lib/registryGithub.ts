import type { RegistryConfig, RegistryFileContent, RegistryFileOnGitHub } from './registryTypes.js';

const API_BASE = 'https://api.github.com';

/** Префикс веток, которые создаёт флоу предложений. */
export const PROPOSAL_BRANCH_PREFIX = 'registry/propose-';

export class RegistryGitHubError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'RegistryGitHubError';
  }
}

interface GitHubApiBody {
  message?: string;
}

interface GitHubContentsResponse extends GitHubApiBody {
  content?: string;
  encoding?: string;
  sha?: string;
}

interface GitHubRefResponse extends GitHubApiBody {
  object?: { sha?: string };
}

interface GitHubPullResponse extends GitHubApiBody {
  number?: number;
}

interface GitHubPullDetailsResponse extends GitHubApiBody {
  user?: { login?: string };
}

export type FetchLike = typeof fetch;

function getRateLimitRemaining(response: Response): string | null {
  try {
    return response.headers?.get('X-RateLimit-Remaining') ?? null;
  } catch {
    return null;
  }
}

function buildAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token.trim()}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
}

async function parseJsonBody<T extends GitHubApiBody>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch (error) {
    console.error('[registryGithub] Failed to parse GitHub JSON response', {
      status: response.status,
      error,
    });
    throw new RegistryGitHubError(`GitHub API returned invalid JSON (${response.status}).`, response.status);
  }
}

async function githubRequest(
  fetchImpl: FetchLike,
  token: string,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  try {
    return await fetchImpl(url, {
      ...init,
      headers: {
        ...buildAuthHeaders(token),
        ...(init?.headers as Record<string, string> | undefined),
      },
    });
  } catch (error) {
    console.error('[registryGithub] Network error calling GitHub API', { path, error });
    throw new RegistryGitHubError('Network error while calling GitHub API.');
  }
}

function encodeRepoPath(path: string): string {
  return path
    .split('/')
    .filter((segment) => segment.length > 0)
    .map(encodeURIComponent)
    .join('/');
}

function decodeBase64Content(content: string): string {
  return Buffer.from(content.replace(/\s/g, ''), 'base64').toString('utf8');
}

function encodeBase64Content(content: string): string {
  return Buffer.from(content, 'utf8').toString('base64');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function parseRegistryFileContent(text: string): RegistryFileContent {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new RegistryGitHubError('decisions-registry.json is not valid JSON.');
  }

  if (!isRecord(parsed)) {
    throw new RegistryGitHubError('decisions-registry.json must be a JSON object.');
  }

  const schemaVersion = parsed.schemaVersion;
  const registryVersion = parsed.registryVersion;
  const updatedAt = parsed.updatedAt;
  const entries = parsed.entries;

  if (typeof schemaVersion !== 'string') {
    throw new RegistryGitHubError('decisions-registry.json: missing schemaVersion.');
  }
  if (typeof registryVersion !== 'number' || !Number.isFinite(registryVersion)) {
    throw new RegistryGitHubError('decisions-registry.json: invalid registryVersion.');
  }
  if (typeof updatedAt !== 'string') {
    throw new RegistryGitHubError('decisions-registry.json: missing updatedAt.');
  }
  if (!Array.isArray(entries)) {
    throw new RegistryGitHubError('decisions-registry.json: entries must be an array.');
  }

  return {
    schemaVersion,
    registryVersion,
    updatedAt,
    entries: entries as RegistryFileContent['entries'],
  };
}

export type RegistryFileFetchResult =
  | { exists: true; file: RegistryFileOnGitHub }
  | { exists: false; file: RegistryFileContent };

export async function fetchRegistryFileOnMain(
  fetchImpl: FetchLike,
  token: string,
  config: RegistryConfig,
): Promise<RegistryFileFetchResult> {
  const encodedPath = encodeRepoPath(config.path);
  const response = await githubRequest(
    fetchImpl,
    token,
    `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/contents/${encodedPath}?ref=main`,
    { method: 'GET' },
  );

  if (response.status === 404) {
    return {
      exists: false,
      file: {
        schemaVersion: '1.0',
        registryVersion: 0,
        updatedAt: new Date().toISOString(),
        entries: [],
      },
    };
  }

  if (!response.ok) {
    const body = await parseJsonBody<GitHubApiBody>(response);
    console.error('[registryGithub] Failed to fetch registry file', {
      status: response.status,
      rateLimitRemaining: getRateLimitRemaining(response),
      message: body.message,
    });
    throw new RegistryGitHubError(body.message || 'Failed to fetch registry file.', response.status);
  }

  const body = await parseJsonBody<GitHubContentsResponse>(response);
  if (!body.content || body.encoding !== 'base64' || !body.sha) {
    throw new RegistryGitHubError('GitHub returned registry file without base64 content or sha.');
  }

  const decoded = decodeBase64Content(body.content);
  const content = parseRegistryFileContent(decoded);
  return {
    exists: true,
    file: {
      ...content,
      sha: body.sha,
    },
  };
}

/** Ветки открытых pull request'ов, созданных этим флоу. */
export async function listOpenProposalBranches(
  fetchImpl: FetchLike,
  token: string,
  config: RegistryConfig,
): Promise<string[]> {
  const response = await githubRequest(
    fetchImpl,
    token,
    `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/pulls?state=open&per_page=100`,
    { method: 'GET' },
  );

  if (!response.ok) {
    const body = await parseJsonBody<GitHubApiBody>(response);
    throw new RegistryGitHubError(body.message || 'Failed to list pull requests.', response.status);
  }

  // parseJsonBody типизирован под объект ответа GitHub; список PR — массив,
  // поэтому читаем его напрямую.
  let pulls: unknown;
  try {
    pulls = await response.json();
  } catch {
    return [];
  }
  if (!Array.isArray(pulls)) return [];

  return (pulls as Array<{ head?: { ref?: unknown } }>)
    .map((pull) => pull.head?.ref)
    .filter((ref): ref is string => typeof ref === 'string' && ref.startsWith(PROPOSAL_BRANCH_PREFIX));
}

export interface ProposalPullRequest {
  number: number;
  url: string;
  state: 'open' | 'closed';
  mergedAt: string | null;
  closedAt: string | null;
  /** sha вершины — читается и после удаления ветки. */
  headSha: string;
}

/**
 * Последние 100 pull request'ов этого флоу — открытые и закрытые, от новых к
 * старым. Чужие ветки отфильтрованы.
 */
export async function listProposalPullRequests(
  fetchImpl: FetchLike,
  token: string,
  config: RegistryConfig,
): Promise<ProposalPullRequest[]> {
  const response = await githubRequest(
    fetchImpl,
    token,
    `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/pulls?state=all&sort=created&direction=desc&per_page=100`,
    { method: 'GET' },
  );
  if (!response.ok) {
    const body = await parseJsonBody<GitHubApiBody>(response);
    throw new RegistryGitHubError(body.message || 'Failed to list pull requests.', response.status);
  }

  let pulls: unknown;
  try {
    pulls = await response.json();
  } catch {
    return [];
  }
  if (!Array.isArray(pulls)) return [];

  const result: ProposalPullRequest[] = [];
  for (const raw of pulls) {
    if (!isRecord(raw) || !isRecord(raw.head)) continue;
    const { ref, sha } = raw.head;
    if (typeof ref !== 'string' || !ref.startsWith(PROPOSAL_BRANCH_PREFIX) || typeof sha !== 'string') continue;
    if (typeof raw.number !== 'number' || typeof raw.html_url !== 'string') continue;
    result.push({
      number: raw.number,
      url: raw.html_url,
      state: raw.state === 'open' ? 'open' : 'closed',
      mergedAt: typeof raw.merged_at === 'string' ? raw.merged_at : null,
      closedAt: typeof raw.closed_at === 'string' ? raw.closed_at : null,
      headSha: sha,
    });
  }
  return result;
}

/** Текст последнего комментария в обсуждении pull request'а; null — комментариев нет. */
export async function fetchLatestIssueComment(
  fetchImpl: FetchLike,
  token: string,
  config: RegistryConfig,
  number: number,
): Promise<string | null> {
  const response = await githubRequest(
    fetchImpl,
    token,
    `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/issues/${number}/comments?per_page=100`,
    { method: 'GET' },
  );
  if (!response.ok) return null;
  let comments: unknown;
  try {
    comments = await response.json();
  } catch {
    return null;
  }
  if (!Array.isArray(comments) || comments.length === 0) return null;
  const last = comments[comments.length - 1];
  return isRecord(last) && typeof last.body === 'string' ? last.body : null;
}

/** Содержимое реестра на произвольной ветке; null — файла на ней нет. */
export async function fetchRegistryFileOnBranch(
  fetchImpl: FetchLike,
  token: string,
  config: RegistryConfig,
  branch: string,
): Promise<RegistryFileContent | null> {
  const encodedPath = encodeRepoPath(config.path);
  const response = await githubRequest(
    fetchImpl,
    token,
    `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`,
    { method: 'GET' },
  );

  if (!response.ok) return null;

  const body = await parseJsonBody<GitHubContentsResponse>(response);
  if (!body.content || body.encoding !== 'base64') return null;

  try {
    return parseRegistryFileContent(decodeBase64Content(body.content));
  } catch {
    return null;
  }
}

export async function getMainHeadSha(
  fetchImpl: FetchLike,
  token: string,
  config: RegistryConfig,
): Promise<string> {
  const response = await githubRequest(
    fetchImpl,
    token,
    `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/git/ref/heads/main`,
    { method: 'GET' },
  );

  if (!response.ok) {
    const body = await parseJsonBody<GitHubApiBody>(response);
    console.error('[registryGithub] Failed to resolve main ref', {
      status: response.status,
      message: body.message,
    });
    throw new RegistryGitHubError(body.message || 'Failed to resolve main branch.', response.status);
  }

  const body = await parseJsonBody<GitHubRefResponse>(response);
  const sha = body.object?.sha;
  if (!sha) {
    throw new RegistryGitHubError('GitHub did not return main branch commit sha.');
  }
  return sha;
}

export async function createBranch(
  fetchImpl: FetchLike,
  token: string,
  config: RegistryConfig,
  branchName: string,
  baseSha: string,
): Promise<void> {
  const response = await githubRequest(
    fetchImpl,
    token,
    `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/git/refs`,
    {
      method: 'POST',
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: baseSha,
      }),
    },
  );

  if (!response.ok) {
    const body = await parseJsonBody<GitHubApiBody>(response);
    console.error('[registryGithub] Failed to create branch', {
      status: response.status,
      branchName,
      message: body.message,
    });
    throw new RegistryGitHubError(body.message || 'Failed to create branch.', response.status);
  }
}

export async function commitRegistryFile(
  fetchImpl: FetchLike,
  token: string,
  config: RegistryConfig,
  branchName: string,
  content: RegistryFileContent,
  commitMessage: string,
  existingSha?: string,
): Promise<void> {
  const encodedPath = encodeRepoPath(config.path);
  const payload: Record<string, string> = {
    message: commitMessage,
    content: encodeBase64Content(JSON.stringify(content, null, 2)),
    branch: branchName,
  };
  if (existingSha) {
    payload.sha = existingSha;
  }

  const response = await githubRequest(
    fetchImpl,
    token,
    `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/contents/${encodedPath}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const body = await parseJsonBody<GitHubApiBody>(response);
    console.error('[registryGithub] Failed to commit registry file', {
      status: response.status,
      branchName,
      message: body.message,
    });
    throw new RegistryGitHubError(body.message || 'Failed to commit registry file.', response.status);
  }
}

export async function openPullRequest(
  fetchImpl: FetchLike,
  token: string,
  config: RegistryConfig,
  branchName: string,
  title: string,
  body: string,
): Promise<number> {
  const response = await githubRequest(
    fetchImpl,
    token,
    `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/pulls`,
    {
      method: 'POST',
      body: JSON.stringify({
        title,
        head: branchName,
        base: 'main',
        body,
      }),
    },
  );

  if (!response.ok) {
    const payload = await parseJsonBody<GitHubApiBody>(response);
    console.error('[registryGithub] Failed to open pull request', {
      status: response.status,
      branchName,
      message: payload.message,
    });
    throw new RegistryGitHubError(payload.message || 'Failed to open pull request.', response.status);
  }

  const pull = await parseJsonBody<GitHubPullResponse>(response);
  if (!pull.number) {
    throw new RegistryGitHubError('GitHub did not return pull request number.');
  }
  return pull.number;
}

export async function requestPullRequestReviewer(
  fetchImpl: FetchLike,
  token: string,
  config: RegistryConfig,
  pullNumber: number,
): Promise<void> {
  const pullPath = `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/pulls/${pullNumber}`;
  const pullResponse = await githubRequest(fetchImpl, token, pullPath, { method: 'GET' });

  if (!pullResponse.ok) {
    const body = await parseJsonBody<GitHubApiBody>(pullResponse);
    console.error('[registryGithub] Failed to fetch pull request author', {
      status: pullResponse.status,
      pullNumber,
      message: body.message,
    });
    throw new RegistryGitHubError(body.message || 'Failed to fetch pull request.', pullResponse.status);
  }

  const pull = await parseJsonBody<GitHubPullDetailsResponse>(pullResponse);
  const authorLogin = pull.user?.login?.trim();
  if (!authorLogin) {
    throw new RegistryGitHubError('GitHub did not return pull request author login.');
  }

  if (authorLogin.toLowerCase() === config.reviewer.trim().toLowerCase()) {
    console.log(
      `[registryGithub] Skipped reviewer request: author and reviewer are the same account (${config.reviewer})`,
    );
    return;
  }

  const response = await githubRequest(
    fetchImpl,
    token,
    `${pullPath}/requested_reviewers`,
    {
      method: 'POST',
      body: JSON.stringify({
        reviewers: [config.reviewer],
      }),
    },
  );

  if (!response.ok) {
    const body = await parseJsonBody<GitHubApiBody>(response);
    console.error('[registryGithub] Failed to request PR reviewer', {
      status: response.status,
      pullNumber,
      message: body.message,
    });
    throw new RegistryGitHubError(body.message || 'Failed to request PR reviewer.', response.status);
  }
}
