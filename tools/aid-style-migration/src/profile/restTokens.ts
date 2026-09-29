/**
 * Чтение библиотеки токенов по ссылке через Figma REST API (решение №8,
 * способ «по ссылке»; этап 2c). Запросы — из главного потока: manifest
 * разрешает api.figma.com. Как в Token Comparator.
 *
 * Scopes Personal Access Token:
 * - GET /files/:key/variables/local → file_variables:read (только Enterprise);
 * - GET /files/:key/styles          → library_content:read;
 * - GET /files/:key/nodes           → file_content:read;
 * - GET /files/:key?depth=1         → file_content:read (имя файла).
 */

import { parseFigmaFileKey } from "../lib/figmaUrl";
import { tokensIndexFromRest, type RestStyleEntry, type RestStyleNode, type RestVariablesMeta } from "./restParse";
import type { TokensIndex } from "./types";

const API = "https://api.figma.com/v1";
const NODES_BATCH = 40;

export class RestError extends Error {}

function explain(status: number, what: string, scope: string, raw?: string): string {
  if (status === 401) return "Personal Access Token недействителен. Проверьте токен в «Доступ по ссылке».";
  if (status === 403) return `Нет доступа к ${what} (403). Нужен scope ${scope} у токена и доступ к файлу у его владельца.${raw ? ` Ответ: ${raw}` : ""}`;
  if (status === 404) return `Файл не найден (404): проверьте ссылку и что у владельца токена есть доступ.${raw ? ` Ответ: ${raw}` : ""}`;
  if (status === 429) return "Превышен лимит запросов Figma REST API — подождите минуту и повторите.";
  return `Ошибка Figma REST API (${status}) при чтении: ${what}.${raw ? ` ${raw}` : ""}`;
}

async function get<T>(path: string, token: string, what: string, scope: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API}${path}`, { headers: { "X-Figma-Token": token } });
  } catch {
    throw new RestError("Не удалось связаться с api.figma.com — проверьте сеть.");
  }
  if (!response.ok) {
    let raw: string | undefined;
    try {
      const body = (await response.json()) as { message?: string; err?: string };
      raw = body.message ?? body.err;
    } catch {
      // не JSON
    }
    throw new RestError(explain(response.status, what, scope, raw));
  }
  return (await response.json()) as T;
}

export interface RestTokensResult {
  fileName: string;
  index: TokensIndex;
}

export async function fetchTokens(url: string, token: string, report: (title: string) => void): Promise<RestTokensResult> {
  const key = parseFigmaFileKey(url);
  if (!key) throw new RestError("Не получилось взять ключ файла из ссылки — вставьте ссылку на файл Figma целиком.");
  if (!token) throw new RestError("Нужен Personal Access Token — задайте его в «Доступ по ссылке».");
  const file = encodeURIComponent(key);

  report("имя файла");
  const { name } = await get<{ name: string }>(`/files/${file}?depth=1`, token, "файлу", "file_content:read");

  report("переменные");
  const vars = await get<{ meta?: RestVariablesMeta }>(`/files/${file}/variables/local`, token, "переменным", "file_variables:read");
  if (!vars.meta) throw new RestError("Figma REST API не вернул переменные файла.");

  report("стили");
  const styles = await get<{ meta?: { styles: RestStyleEntry[] } }>(`/files/${file}/styles`, token, "стилям", "library_content:read");
  const wanted = (styles.meta?.styles ?? []).filter((s) => s.style_type === "TEXT" || s.style_type === "EFFECT");

  const nodes = new Map<string, RestStyleNode | undefined>();
  for (let i = 0; i < wanted.length; i += NODES_BATCH) {
    report(`свойства стилей ${Math.min(i + NODES_BATCH, wanted.length)} из ${wanted.length}`);
    const ids = wanted.slice(i, i + NODES_BATCH).map((s) => encodeURIComponent(s.node_id)).join(",");
    const body = await get<{ nodes?: Record<string, { document?: RestStyleNode } | null> }>(
      `/files/${file}/nodes?ids=${ids}`,
      token,
      "свойствам стилей",
      "file_content:read",
    );
    for (const s of wanted.slice(i, i + NODES_BATCH)) nodes.set(s.node_id, body.nodes?.[s.node_id]?.document);
  }

  return { fileName: name, index: tokensIndexFromRest(vars.meta, wanted, nodes) };
}
