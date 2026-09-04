/**
 * Обёртка над figma.clientStorage.
 *
 * ВАЖНО: используем именно figma.clientStorage (лимит ~5MB на плагин),
 * а не figma.root.setPluginData (лимит 100kb НА ФАЙЛ и данные привязаны
 * к конкретному документу, что не подходит для кэша библиотеки и истории
 * решений, которые должны переживать разные файлы макетов).
 */

import type { LibraryToken, StoredDecision } from "../comparators/types";
import type { RegistryFileContent } from "./githubTypes";
import { clampWindowSize, type WindowSize } from "./windowSize";

export type { WindowSize } from "./windowSize";
export { DEFAULT_WINDOW_SIZE, MIN_WINDOW_SIZE, clampWindowSize } from "./windowSize";

const KEYS = {
  PAT_TOKEN: "tc_pat_token",
  LIBRARY_FILE_KEY: "tc_library_file_key",
  LIBRARY_FILE_NAME: "tc_library_file_name",
  LIBRARY_CACHE: "tc_library_cache",
  MAPPING_HISTORY: "tc_mapping_history",
  WINDOW_SIZE: "tc_window_size",
  GITHUB_TOKEN: "tc_github_token",
  GITHUB_REPO: "tc_github_repo",
  GITHUB_REGISTRY_PATH: "tc_github_registry_path",
  REGISTRY_CACHE: "tc_registry_cache",
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

export async function setMappingHistoryEntry(
  recordId: string,
  entry: StoredDecision
): Promise<Record<string, StoredDecision>> {
  const history = await getMappingHistory();
  history[recordId] = entry;
  await figma.clientStorage.setAsync(KEYS.MAPPING_HISTORY, history);
  return history;
}

export async function clearMappingHistoryEntry(
  recordId: string
): Promise<Record<string, StoredDecision>> {
  const history = await getMappingHistory();
  delete history[recordId];
  await figma.clientStorage.setAsync(KEYS.MAPPING_HISTORY, history);
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
