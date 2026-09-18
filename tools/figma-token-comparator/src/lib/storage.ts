/**
 * Обёртка над figma.clientStorage.
 *
 * ВАЖНО: используем именно figma.clientStorage (лимит ~5MB на плагин),
 * а не figma.root.setPluginData (лимит 100kb НА ФАЙЛ и данные привязаны
 * к конкретному документу, что не подходит для кэша библиотеки и истории
 * решений, которые должны переживать разные файлы макетов).
 */

import type { LibraryTextStyle, LibraryToken, StoredDecision, TokenCategory } from "../comparators/types";
import type { RegistryFileContent } from "./githubTypes";
import { clampWindowSize, type WindowSize } from "./windowSize";

export type { WindowSize } from "./windowSize";
export { DEFAULT_WINDOW_SIZE, MIN_WINDOW_SIZE, clampWindowSize } from "./windowSize";

const KEYS = {
  PAT_TOKEN: "tc_pat_token",
  LIBRARY_FILE_KEY: "tc_library_file_key",
  LIBRARY_FILE_NAME: "tc_library_file_name",
  LIBRARY_CACHE: "tc_library_cache",
  LIBRARY_TEXT_STYLES_CACHE: "tc_library_text_styles_cache",
  MAPPING_HISTORY: "tc_mapping_history",
  WINDOW_SIZE: "tc_window_size",
  GITHUB_TOKEN: "tc_github_token",
  GITHUB_REPO: "tc_github_repo",
  GITHUB_REGISTRY_PATH: "tc_github_registry_path",
  REGISTRY_CACHE: "tc_registry_cache",
  ADMIN_MODE: "tc_admin_mode",
  REGISTRY_SECRET: "tc_registry_secret",
  SUBMITTED_SIGNATURES: "tc_submitted_signatures",
} as const;

export async function getWindowSize(): Promise<WindowSize | null> {
  const value = await figma.clientStorage.getAsync(KEYS.WINDOW_SIZE);
  if (!value || typeof value !== "object") return null;
  const candidate = value as { width?: unknown; height?: unknown };
  if (typeof candidate.width !== "number" || typeof candidate.height !== "number") return null;
  if (!Number.isFinite(candidate.width) || !Number.isFinite(candidate.height)) return null;
  return clampWindowSize({ width: candidate.width, height: candidate.height });
}

export async function setWindowSize(size: WindowSize): Promise<void> {
  await figma.clientStorage.setAsync(KEYS.WINDOW_SIZE, clampWindowSize(size));
}

export interface LibraryCache {
  tokens: LibraryToken[];
  fetchedAt: string;
  fileKey: string;
  /** Человекочитаемое имя Figma-файла библиотеки (из REST API). */
  fileName?: string;
}

export async function getPersonalAccessToken(): Promise<string | null> {
  const value = await figma.clientStorage.getAsync(KEYS.PAT_TOKEN);
  return typeof value === "string" && value.length > 0 ? value : null;
}

export async function setPersonalAccessToken(token: string): Promise<void> {
  await figma.clientStorage.setAsync(KEYS.PAT_TOKEN, token);
}

export async function getLibraryFileKey(): Promise<string | null> {
  const value = await figma.clientStorage.getAsync(KEYS.LIBRARY_FILE_KEY);
  return typeof value === "string" && value.length > 0 ? value : null;
}

export async function setLibraryFileKey(fileKey: string): Promise<void> {
  await figma.clientStorage.setAsync(KEYS.LIBRARY_FILE_KEY, fileKey);
}

export async function getLibraryFileName(): Promise<string | null> {
  const value = await figma.clientStorage.getAsync(KEYS.LIBRARY_FILE_NAME);
  return typeof value === "string" && value.length > 0 ? value : null;
}

export async function setLibraryFileName(fileName: string): Promise<void> {
  await figma.clientStorage.setAsync(KEYS.LIBRARY_FILE_NAME, fileName);
}

export async function getLibraryCache(): Promise<LibraryCache | null> {
  const value = await figma.clientStorage.getAsync(KEYS.LIBRARY_CACHE);
  if (!value || typeof value !== "object") return null;
  return value as LibraryCache;
}

export async function setLibraryCache(cache: LibraryCache): Promise<void> {
  await figma.clientStorage.setAsync(KEYS.LIBRARY_CACHE, cache);
}

export interface LibraryTextStylesCache {
  styles: LibraryTextStyle[];
  fetchedAt: string;
  fileKey: string;
  fileName?: string;
}

/**
 * Кэш, записанный до переименования поля, содержит `styleId` вместо `nodeId`.
 *
 * Без этого стили из старого кэша загрузились бы с `nodeId: undefined`, и
 * плагин молча перестал бы находить целевой стиль сохранённого решения — до
 * тех пор, пока пользователь не перезагрузит библиотеку вручную.
 */
function normalizeTextStylesCache(cache: LibraryTextStylesCache): LibraryTextStylesCache {
  if (!Array.isArray(cache.styles)) return cache;
  const needsMigration = cache.styles.some(
    (style) => !style.nodeId && typeof (style as { styleId?: unknown }).styleId === "string"
  );
  if (!needsMigration) return cache;

  return {
    ...cache,
    styles: cache.styles.map((style) =>
      style.nodeId ? style : { ...style, nodeId: (style as { styleId?: string }).styleId ?? "" }
    ),
  };
}

export async function getLibraryTextStylesCache(): Promise<LibraryTextStylesCache | null> {
  const value = await figma.clientStorage.getAsync(KEYS.LIBRARY_TEXT_STYLES_CACHE);
  if (!value || typeof value !== "object") return null;
  return normalizeTextStylesCache(value as LibraryTextStylesCache);
}

export async function setLibraryTextStylesCache(cache: LibraryTextStylesCache): Promise<void> {
  await figma.clientStorage.setAsync(KEYS.LIBRARY_TEXT_STYLES_CACHE, cache);
}

/**
 * История подтверждённых решений по группам записей макета.
 * Ключ записи — LayoutRecord.id (hash property+value+binding+sourceName),
 * поэтому решение переживает повторные сканирования, если сигнатура группы
 * не изменилась.
 */
export async function getMappingHistory(): Promise<Record<string, StoredDecision>> {
  const value = await figma.clientStorage.getAsync(KEYS.MAPPING_HISTORY);
  if (!value || typeof value !== "object") return {};
  return value as Record<string, StoredDecision>;
}

export interface SetMappingHistoryOptions {
  /**
   * true — не возвращать запись в очередь на согласование.
   *
   * Нужно для служебных перезаписей, которые решением пользователя не
   * являются: учёт применённых слоёв после «Применить в макет». Без этого
   * уже отправленное решение уехало бы в реестр повторно.
   */
  keepSubmitted?: boolean;
}

export async function setMappingHistoryEntry(
  recordId: string,
  entry: StoredDecision,
  options: SetMappingHistoryOptions = {}
): Promise<Record<string, StoredDecision>> {
  const history = await getMappingHistory();
  history[recordId] = entry;
  await figma.clientStorage.setAsync(KEYS.MAPPING_HISTORY, history);
  if (!options.keepSubmitted) {
    await clearSubmittedSignature(recordId);
  }
  return history;
}

export async function clearMappingHistoryEntry(
  recordId: string
): Promise<Record<string, StoredDecision>> {
  const history = await getMappingHistory();
  delete history[recordId];
  await figma.clientStorage.setAsync(KEYS.MAPPING_HISTORY, history);
  await clearSubmittedSignature(recordId);
  return history;
}

export interface RegistryCache {
  registry: RegistryFileContent;
  /** sha файла в GitHub — отсутствует для локально инициализированного пустого реестра. */
  sha?: string;
  fetchedAt: string;
  owner: string;
  repo: string;
  path: string;
}

export async function getGitHubToken(): Promise<string | null> {
  const value = await figma.clientStorage.getAsync(KEYS.GITHUB_TOKEN);
  return typeof value === "string" && value.length > 0 ? value : null;
}

export async function setGitHubToken(token: string): Promise<void> {
  await figma.clientStorage.setAsync(KEYS.GITHUB_TOKEN, token);
}

export async function getGitHubRepo(): Promise<string | null> {
  const value = await figma.clientStorage.getAsync(KEYS.GITHUB_REPO);
  return typeof value === "string" && value.length > 0 ? value : null;
}

export async function setGitHubRepo(repo: string): Promise<void> {
  await figma.clientStorage.setAsync(KEYS.GITHUB_REPO, repo);
}

export async function getGitHubRegistryPath(): Promise<string | null> {
  const value = await figma.clientStorage.getAsync(KEYS.GITHUB_REGISTRY_PATH);
  return typeof value === "string" && value.length > 0 ? value : null;
}

export async function setGitHubRegistryPath(path: string): Promise<void> {
  await figma.clientStorage.setAsync(KEYS.GITHUB_REGISTRY_PATH, path);
}

export async function getRegistryCache(): Promise<RegistryCache | null> {
  const value = await figma.clientStorage.getAsync(KEYS.REGISTRY_CACHE);
  if (!value || typeof value !== "object") return null;
  return value as RegistryCache;
}

export async function setRegistryCache(cache: RegistryCache): Promise<void> {
  await figma.clientStorage.setAsync(KEYS.REGISTRY_CACHE, cache);
}

/**
 * Ключ доступа к бэкенду реестра.
 *
 * Хранится у конкретного пользователя, а не в сборке плагина: собранный
 * dist/code.js раздаётся публичным релизом, и вшитый в него ключ читается
 * любым, кто скачал архив.
 */
export async function getRegistrySecret(): Promise<string | null> {
  const value = await figma.clientStorage.getAsync(KEYS.REGISTRY_SECRET);
  return typeof value === "string" && value.length > 0 ? value : null;
}

export async function setRegistrySecret(secret: string): Promise<void> {
  await figma.clientStorage.setAsync(KEYS.REGISTRY_SECRET, secret);
}

export async function getAdminMode(): Promise<boolean> {
  const value = await figma.clientStorage.getAsync(KEYS.ADMIN_MODE);
  return value === true;
}

export async function setAdminMode(enabled: boolean): Promise<void> {
  await figma.clientStorage.setAsync(KEYS.ADMIN_MODE, enabled);
}

export async function getSubmittedSignatures(): Promise<Set<string>> {
  const value = await figma.clientStorage.getAsync(KEYS.SUBMITTED_SIGNATURES);
  if (!Array.isArray(value)) return new Set();
  return new Set(value.filter((item): item is string => typeof item === "string"));
}

export async function markSignaturesSubmitted(signatures: string[]): Promise<void> {
  const submitted = await getSubmittedSignatures();
  for (const signature of signatures) {
    submitted.add(signature);
  }
  await figma.clientStorage.setAsync(KEYS.SUBMITTED_SIGNATURES, Array.from(submitted));
}

/**
 * Снимает отметку «отправлено» — решение по этой группе снова считается
 * ожидающим отправки.
 *
 * Вызывается, когда пользователь изменил или отменил решение: иначе
 * изменённое решение навсегда оставалось бы вне очереди и отправить его
 * повторно было бы нельзя (например, после отклонённого ревью).
 */
export async function clearSubmittedSignature(recordId: string): Promise<void> {
  const submitted = await getSubmittedSignatures();
  if (!submitted.delete(recordId)) return;
  await figma.clientStorage.setAsync(KEYS.SUBMITTED_SIGNATURES, Array.from(submitted));
}

function storedDecisionCategory(entry: StoredDecision): TokenCategory {
  return entry.category ?? "colors";
}

/**
 * Ждёт ли решение отправки на согласование. Решения из реестра
 * (`source: "registry"`) уже согласованы — повторно их не отправляем.
 */
export function isPendingProposalRecord(
  recordId: string,
  submitted: Set<string>,
  entry?: StoredDecision
): boolean {
  if (entry?.source === "registry") return false;
  return !submitted.has(recordId);
}

export async function countPendingProposals(
  history: Record<string, StoredDecision>,
  category?: TokenCategory
): Promise<number> {
  const submitted = await getSubmittedSignatures();
  return Object.entries(history).filter(
    ([recordId, entry]) =>
      isPendingProposalRecord(recordId, submitted, entry) &&
      (category === undefined || storedDecisionCategory(entry) === category)
  ).length;
}

export async function countPendingProposalsByCategory(
  history: Record<string, StoredDecision>
): Promise<Record<TokenCategory, number>> {
  const submitted = await getSubmittedSignatures();
  const counts: Record<TokenCategory, number> = { colors: 0, typography: 0 };
  for (const [recordId, entry] of Object.entries(history)) {
    if (!isPendingProposalRecord(recordId, submitted, entry)) continue;
    counts[storedDecisionCategory(entry)] += 1;
  }
  return counts;
}

/** Удаляет только pending (не submitted) записи mappingHistory для категории. */
export async function clearPendingProposalsForCategory(category: TokenCategory): Promise<void> {
  const [history, submitted] = await Promise.all([getMappingHistory(), getSubmittedSignatures()]);
  let changed = false;
  for (const [recordId, entry] of Object.entries(history)) {
    if (storedDecisionCategory(entry) !== category) continue;
    if (!isPendingProposalRecord(recordId, submitted, entry)) continue;
    delete history[recordId];
    changed = true;
  }
  if (changed) {
    await figma.clientStorage.setAsync(KEYS.MAPPING_HISTORY, history);
  }
}
