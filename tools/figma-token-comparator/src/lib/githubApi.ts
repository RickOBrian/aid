/**
 * Чтение decisions-registry.json с GitHub без авторизации — запасной путь
 * (основной — сервер реестра, lib/registryRead.ts), и разбор файла реестра.
 *
 * До 1.7.0 здесь же было чтение через GitHub REST API с личным токеном для
 * админ-панели; панель убрана вместе с ним.
 */
import type {
  FetchRegistryResult,
  RegistryEntry,
  RegistryFile,
  RegistryFileContent,
} from "./githubTypes";
import { fetchWithTimeout } from "./fetchWithTimeout";

const RAW_BASE = "https://raw.githubusercontent.com";

/** Ошибка запроса к GitHub REST API с понятным для пользователя сообщением. */
export class GitHubRestApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "GitHubRestApiError";
  }
}

function encodeContentPath(path: string): string {
  return path
    .split("/")
    .filter((segment) => segment.length > 0)
    .map(encodeURIComponent)
    .join("/");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseRegistryEntry(raw: unknown, index: number): RegistryEntry {
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
  const entry: RegistryEntry = {
    signature,
    decision: decision as RegistryEntry["decision"],
  };
  // Сервер status не пишет: согласовано то, что лежит в main. Обязательным
  // он был только в парсере — и с 2026-09-07 ронял чтение всего реестра.
  if (status === "approved" || status === "stale") entry.status = status;

  if (typeof raw.targetVariableId === "string") entry.targetVariableId = raw.targetVariableId;
  if (typeof raw.targetVariableName === "string") entry.targetVariableName = raw.targetVariableName;
  // Находка №25: до v1.4.0 эти поля при чтении терялись, и согласованные
  // решения по типографике подтягивались без стиля-цели.
  if (raw.category === "colors" || raw.category === "typography" || raw.category === "icons") {
    entry.category = raw.category;
  }
  if (typeof raw.targetStyleId === "string") entry.targetStyleId = raw.targetStyleId;
  if (typeof raw.targetStyleName === "string") entry.targetStyleName = raw.targetStyleName;
  if (Array.isArray(raw.mismatchedProperties) && raw.mismatchedProperties.every((item) => typeof item === "string")) {
    entry.mismatchedProperties = raw.mismatchedProperties as string[];
  }
  if (typeof raw.targetComponentKey === "string") entry.targetComponentKey = raw.targetComponentKey;
  if (typeof raw.targetComponentName === "string") entry.targetComponentName = raw.targetComponentName;
  if (typeof raw.targetLibraryFileKey === "string") entry.targetLibraryFileKey = raw.targetLibraryFileKey;
  if (typeof raw.comment === "string") entry.comment = raw.comment;
  if (typeof raw.proposedBy === "string") entry.proposedBy = raw.proposedBy;
  if (typeof raw.proposedAt === "string") entry.proposedAt = raw.proposedAt;
  if (typeof raw.approvedBy === "string") entry.approvedBy = raw.approvedBy;
  if (typeof raw.approvedAt === "string") entry.approvedAt = raw.approvedAt;

  return entry;
}

export function parseRegistryJson(text: string, sha: string): RegistryFile {
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

/**
 * Чтение реестра решений из ПУБЛИЧНОГО репозитория, без авторизации.
 *
 * Реестр лежит в открытом репозитории и читается кем угодно — держать его за
 * общим ключом плагина смысла не было: ключ не защищал ничего, но требовал
 * от каждого дизайнера получить его прежде, чем увидеть уже принятые решения.
 * Ключ остался только на отправке, где бэкенд создаёт pull request серверным
 * токеном GitHub.
 *
 * Берём raw.githubusercontent.com, а НЕ api.github.com: у неавторизованных
 * запросов к API лимит 60 в час на IP, общий для всех за одним NAT. Команда
 * в офисе выжигает его незаметно, и плагин начинает показывать «реестр
 * недоступен» без объяснения причины. raw раздаётся через CDN и такого
 * лимита не имеет; цена — кэш до 5 минут, что для реестра решений неважно.
 */
export async function fetchPublicRegistry(
  owner: string,
  repo: string,
  path: string
): Promise<FetchRegistryResult> {
  const url = `${RAW_BASE}/${encodeURIComponent(owner.trim())}/${encodeURIComponent(repo.trim())}/main/${encodeContentPath(path.trim())}`;

  let response: Response;
  try {
    response = await fetchWithTimeout(url, { method: "GET" });
  } catch {
    throw new GitHubRestApiError(
      "Не удалось связаться с raw.githubusercontent.com. Проверьте подключение к сети."
    );
  }

  if (response.status === 404) {
    return { notFound: true };
  }

  if (!response.ok) {
    throw new GitHubRestApiError(
      `Не удалось прочитать реестр решений (${response.status}).`,
      response.status
    );
  }

  let text: string;
  try {
    text = await response.text();
  } catch {
    throw new GitHubRestApiError("Не удалось прочитать ответ с реестром решений.");
  }

  // У raw нет sha файла; ETag играет ту же роль — непрозрачная метка версии,
  // по наличию которой отличают настоящий реестр от локального пустого.
  const version = response.headers?.get("etag") ?? `fetched-${Date.now()}`;
  return parseRegistryJson(text, version);
}
