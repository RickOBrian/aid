/**
 * Чтение реестра решений из main — без ключа.
 *
 * Сначала сервер реестра (api.aidteam.pro): он читает GitHub своим токеном.
 * Напрямую с raw.githubusercontent.com — только запасной путь: 2026-10-08 в
 * Figma у Principal Designer запрос туда сначала завис, потом упал, а сервер
 * из той же сети отвечал. Оба пути — с пределом ожидания.
 */

import { fetchWithTimeout } from "./fetchWithTimeout";
import { fetchPublicRegistry, parseRegistryJson } from "./githubApi";
import type { FetchRegistryResult } from "./githubTypes";
import {
  DEFAULT_REGISTRY_OWNER,
  DEFAULT_REGISTRY_PATH,
  DEFAULT_REGISTRY_REPO,
  REGISTRY_READ_URL,
} from "./registryApiConfig";

interface BackendRegistryBody {
  exists?: boolean;
  registry?: unknown;
  sha?: unknown;
}

async function readFromBackend(): Promise<FetchRegistryResult> {
  const response = await fetchWithTimeout(REGISTRY_READ_URL, { method: "GET" });
  if (!response.ok) throw new Error(`Registry backend responded ${response.status}`);
  const body = (await response.json()) as BackendRegistryBody;
  if (body.exists === false) return { notFound: true };
  // Та же проверка формы, что у файла с GitHub: сервер отдаёт его как есть.
  const version = typeof body.sha === "string" && body.sha ? body.sha : `fetched-${Date.now()}`;
  return parseRegistryJson(JSON.stringify(body.registry), version);
}

export async function readRegistry(): Promise<FetchRegistryResult> {
  try {
    return await readFromBackend();
  } catch (error) {
    console.warn("[registry] Сервер реестра недоступен, читаю с GitHub", error);
  }
  return fetchPublicRegistry(DEFAULT_REGISTRY_OWNER, DEFAULT_REGISTRY_REPO, DEFAULT_REGISTRY_PATH);
}
