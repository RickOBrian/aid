/**
 * Обёртка над GitHub REST API для чтения decisions-registry.json.
 *
 * GET https://api.github.com/repos/{owner}/{repo}/contents/{path}
 *
 * Выполняется из главного потока плагина (code.ts) — manifest.json должен
 * разрешать api.github.com в networkAccess.allowedDomains.
 *
 * Этап 1: только чтение (GET). Запись, ветки и PR — следующие этапы.
 */

import type {
  FetchRegistryResult,
  RegistryEntry,
  RegistryFile,
  RegistryFileContent,
} from "./githubTypes";

const API_BASE = "https://api.github.com";

/** Ошибка запроса к GitHub REST API с понятным для пользователя сообщением. */
export class GitHubRestApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "GitHubRestApiError";
  }
}

interface GitHubContentsResponse {
  name?: string;
  path?: string;
  sha?: string;
  content?: string;
  encoding?: string;
  message?: string;
}

function encodeContentPath(path: string): string {
  return path
    .split("/")
    .filter((segment) => segment.length > 0)
    .map(encodeURIComponent)
    .join("/");
}

function decodeBase64Content(content: string): string {
  const normalized = content.replace(/\s/g, "");
  if (typeof atob === "function") {
    return atob(normalized);
  }
  throw new GitHubRestApiError("Декодирование base64 недоступно в этой среде.");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseRegistryEntry(raw: unknown, index: number): RegistryEntry {
  if (!isRecord(raw)) {
    throw new GitHubRestApiError(`Некорректная запись реестра (#${index + 1}): ожидался объект.`);
  }

  const signature = raw.signature;
  const decision = raw.decision;
  const status = raw.status;

  if (typeof signature !== "string" || !signature.trim()) {
    throw new GitHubRestApiError(`Некорректная запись реестра (#${index + 1}): отсутствует signature.`);
  }
  if (typeof decision !== "string") {
    throw new GitHubRestApiError(`Некорректная запись реестра (#${index + 1}): отсутствует decision.`);
  }
  if (typeof status !== "string") {
    throw new GitHubRestApiError(`Некорректная запись реестра (#${index + 1}): отсутствует status.`);
  }

  const entry: RegistryEntry = {
    signature,
    decision: decision as RegistryEntry["decision"],
    status: status as RegistryEntry["status"],
  };

  if (typeof raw.targetVariableId === "string") entry.targetVariableId = raw.targetVariableId;
  if (typeof raw.targetVariableName === "string") entry.targetVariableName = raw.targetVariableName;
  if (typeof raw.comment === "string") entry.comment = raw.comment;
  if (typeof raw.proposedBy === "string") entry.proposedBy = raw.proposedBy;
  if (typeof raw.proposedAt === "string") entry.proposedAt = raw.proposedAt;
  if (typeof raw.approvedBy === "string") entry.approvedBy = raw.approvedBy;
  if (typeof raw.approvedAt === "string") entry.approvedAt = raw.approvedAt;

  return entry;
}

function parseRegistryJson(text: string, sha: string): RegistryFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new GitHubRestApiError("decisions-registry.json не является валидным JSON.");
  }

  if (!isRecord(parsed)) {
    throw new GitHubRestApiError("decisions-registry.json должен быть JSON-объектом.");
  }

  const schemaVersion = parsed.schemaVersion;
  const registryVersion = parsed.registryVersion;
  const updatedAt = parsed.updatedAt;
  const entriesRaw = parsed.entries;

  if (typeof schemaVersion !== "string") {
    throw new GitHubRestApiError("decisions-registry.json: отсутствует schemaVersion.");
  }
  if (typeof registryVersion !== "number" || !Number.isFinite(registryVersion)) {
    throw new GitHubRestApiError("decisions-registry.json: отсутствует или некорректен registryVersion.");
  }
  if (typeof updatedAt !== "string") {
    throw new GitHubRestApiError("decisions-registry.json: отсутствует updatedAt.");
  }
  if (!Array.isArray(entriesRaw)) {
    throw new GitHubRestApiError("decisions-registry.json: entries должен быть массивом.");
  }

  const content: RegistryFileContent = {
    schemaVersion,
    registryVersion,
    updatedAt,
    entries: entriesRaw.map((entry, index) => parseRegistryEntry(entry, index)),
  };

  return { ...content, sha };
}

function buildErrorMessage(status: number, body: GitHubContentsResponse, rateLimitRemaining: string | null): string {
  if (status === 401) {
    return "Неверный GitHub-токен.";
  }
  if (status === 403) {
    if (rateLimitRemaining === "0") {
      return "Превышен лимит запросов GitHub API, попробуйте позже.";
    }
    return "Токен не имеет прав на этот репозиторий.";
  }
  if (status === 404) {
    return "Репозиторий или файл реестра не найдены.";
  }
  const detail = body.message?.trim();
  return detail
    ? `Ошибка запроса к GitHub REST API (${status}): ${detail}`
    : `Ошибка запроса к GitHub REST API (${status}).`;
}

/**
 * Загружает decisions-registry.json из репозитория GitHub.
 *
 * 404 — не исключение: возвращает `{ notFound: true }`, чтобы UI мог
 * предложить локальную инициализацию пустого реестра.
 */
export async function fetchRegistry(
  token: string,
  owner: string,
  repo: string,
  path: string
): Promise<FetchRegistryResult> {
  if (!token.trim()) {
    throw new GitHubRestApiError("Не указан GitHub Personal Access Token.");
  }
  if (!owner.trim() || !repo.trim()) {
    throw new GitHubRestApiError("Укажите репозиторий в формате owner/repo.");
  }
  if (!path.trim()) {
    throw new GitHubRestApiError("Укажите путь к файлу реестра.");
  }

  const encodedPath = encodeContentPath(path.trim());
  const url = `${API_BASE}/repos/${encodeURIComponent(owner.trim())}/${encodeURIComponent(repo.trim())}/contents/${encodedPath}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
  } catch {
    throw new GitHubRestApiError("Не удалось связаться с api.github.com. Проверьте подключение к сети.");
  }

  const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");

  let body: GitHubContentsResponse = {};
  try {
    body = (await response.json()) as GitHubContentsResponse;
  } catch {
    if (!response.ok) {
      throw new GitHubRestApiError(buildErrorMessage(response.status, {}, rateLimitRemaining), response.status);
    }
    throw new GitHubRestApiError("Ответ GitHub REST API не является валидным JSON.");
  }

  if (response.status === 404) {
    return { notFound: true };
  }

  if (!response.ok) {
    throw new GitHubRestApiError(buildErrorMessage(response.status, body, rateLimitRemaining), response.status);
  }

  if (!body.content || body.encoding !== "base64") {
    throw new GitHubRestApiError("GitHub вернул файл без base64-содержимого.");
  }
  if (!body.sha) {
    throw new GitHubRestApiError("GitHub не вернул sha файла реестра.");
  }

  const decoded = decodeBase64Content(body.content);
  return parseRegistryJson(decoded, body.sha);
}
