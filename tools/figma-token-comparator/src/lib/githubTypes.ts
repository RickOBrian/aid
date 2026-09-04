/**
 * Типы реестра решений decisions-registry.json — синхронизация через GitHub.
 * Отдельный модуль по аналогии с figmaRestApi.ts / comparators/types.ts:
 * GitHub REST API не смешивается с типами сравнения токенов.
 */

/** Решение, зафиксированное в реестре (после merge в main — approved). */
export type RegistryDecision =
  | "mapped"
  | "ignored"
  | "hardcoded"
  | "candidate"
  | "value_fix_proposed";

/** Статус записи в файле реестра. `stale` вычисляется плагином в рантайме, в main хранится `approved`. */
export type RegistryEntryStatus = "approved" | "stale";

/** Одна запись реестра — решение по сигнатуре группы макета. */
export interface RegistryEntry {
  signature: string;
  decision: RegistryDecision;
  targetVariableId?: string;
  targetVariableName?: string;
  comment?: string;
  proposedBy?: string;
  proposedAt?: string;
  status: RegistryEntryStatus;
  approvedBy?: string;
  approvedAt?: string;
}

/** Содержимое decisions-registry.json без метаданных GitHub (sha). */
export interface RegistryFileContent {
  schemaVersion: string;
  registryVersion: number;
  updatedAt: string;
  entries: RegistryEntry[];
}

/** Загруженный реестр с sha файла — sha нужен на следующем этапе для коммитов. */
export interface RegistryFile extends RegistryFileContent {
  sha: string;
}

/** GET /contents/{path} вернул 404 — файл ещё не создан или неверный путь. */
export interface RegistryNotFound {
  notFound: true;
}

export type FetchRegistryResult = RegistryFile | RegistryNotFound;

export function isRegistryNotFound(result: FetchRegistryResult): result is RegistryNotFound {
  return "notFound" in result && result.notFound === true;
}

/** Пустой реестр для локальной инициализации (без записи в GitHub). */
export function createEmptyRegistryContent(): RegistryFileContent {
  return {
    schemaVersion: "1.0",
    registryVersion: 0,
    updatedAt: new Date().toISOString(),
    entries: [],
  };
}

/** Парсит поле owner/repo или URL вида https://github.com/owner/repo. */
export function parseGitHubRepo(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const withoutGitSuffix = trimmed.replace(/\.git\/?$/, "");
  const urlMatch = withoutGitSuffix.match(/github\.com[/:]([^/]+)\/([^/?#]+)/i);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] };
  }

  const slashMatch = withoutGitSuffix.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (slashMatch) {
    return { owner: slashMatch[1], repo: slashMatch[2] };
  }

  return null;
}

export const DEFAULT_REGISTRY_PATH = "decisions-registry.json";
