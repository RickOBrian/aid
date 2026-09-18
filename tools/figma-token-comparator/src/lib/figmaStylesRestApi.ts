/**
 * Figma REST API — загрузка Text Styles эталонной библиотеки.
 *
 * Поток:
 * 1. GET /v1/files/:file_key/styles — опубликованные стили, filter style_type === "TEXT"
 * 2. GET /v1/files/:file_key/nodes?ids=... — свойства TypeStyle для node_id каждого стиля
 *
 * Требуемые PAT scopes (см. Figma REST API docs):
 * - GET .../styles → library_content:read (или устаревший files:read)
 * - GET .../nodes  → file_content:read (или устаревший files:read)
 *
 * Scope file_variables:read (текущий flow цветов) НЕ покрывает эти endpoints.
 *
 * Ограничение: /styles возвращает только опубликованные стили библиотеки.
 */

import { parseFigmaFileKey } from "./figmaUrl";
import { FigmaRestApiError } from "./figmaRestApi";
import type { LibraryTextStyle } from "../comparators/types";
import {
  formatTypographyDisplayValue,
  readTypographyFromRestTypeStyle,
  type RestTypeStyleLike,
} from "./typographyUtils";

const API_BASE = "https://api.figma.com/v1";
const NODES_BATCH_SIZE = 40;

interface PublishedStyleEntry {
  key: string;
  node_id: string;
  style_type: string;
  name: string;
  description?: string;
}

interface FileStylesResponse {
  status: number;
  error: boolean;
  message?: string;
  meta?: {
    styles: PublishedStyleEntry[];
  };
}

interface RestTextNodeDocument {
  type?: string;
  style?: RestTypeStyleLike;
  fontFamily?: string;
  fontWeight?: number;
  fontSize?: number;
  letterSpacing?: number;
  textCase?: string;
  textDecoration?: string;
  lineHeightPx?: number;
  lineHeightPercent?: number;
  lineHeightPercentFontSize?: number;
  lineHeightUnit?: string;
}

interface FileNodesResponse {
  status: number;
  err?: string;
  nodes?: Record<
    string,
    {
      document?: RestTextNodeDocument;
    } | null
  >;
}

function buildStylesScopeErrorMessage(status: number, rawMessage?: string): string {
  if (status === 403) {
    return [
      "Personal Access Token не имеет доступа к списку стилей библиотеки (403).",
      "Для GET /v1/files/:file_key/styles требуется scope library_content:read",
      "(или устаревший files:read). Текущий scope file_variables:read недостаточен.",
      rawMessage ? `Ответ API: ${rawMessage}` : "",
    ]
      .filter(Boolean)
      .join(" ");
  }
  return `Ошибка запроса стилей Figma REST API (${status})${rawMessage ? `: ${rawMessage}` : "."}`;
}

function buildNodesScopeErrorMessage(status: number, rawMessage?: string): string {
  if (status === 403) {
    return [
      "Personal Access Token не имеет доступа к содержимому файла (403).",
      "Для GET /v1/files/:file_key/nodes требуется scope file_content:read",
      "(или устаревший files:read). Текущий scope file_variables:read недостаточен.",
      rawMessage ? `Ответ API: ${rawMessage}` : "",
    ]
      .filter(Boolean)
      .join(" ");
  }
  return `Ошибка запроса nodes Figma REST API (${status})${rawMessage ? `: ${rawMessage}` : "."}`;
}

function extractTypeStyleFromDocument(document: RestTextNodeDocument | undefined): RestTypeStyleLike | null {
  if (!document) return null;
  if (document.style) return document.style;
  if (document.type === "TEXT") return document;
  return null;
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function fetchPublishedTextStyles(
  fileKey: string,
  token: string
): Promise<PublishedStyleEntry[]> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/files/${encodeURIComponent(fileKey)}/styles`, {
      method: "GET",
      headers: { "X-Figma-Token": token },
    });
  } catch {
    throw new FigmaRestApiError("Не удалось связаться с api.figma.com. Проверьте подключение к сети.");
  }

  if (!response.ok) {
    let message: string | undefined;
    try {
      const errorBody = (await response.json()) as { message?: string; err?: string };
      message = errorBody.message ?? errorBody.err;
    } catch {
      // тело ответа не JSON
    }
    throw new FigmaRestApiError(buildStylesScopeErrorMessage(response.status, message), response.status);
  }

  let body: FileStylesResponse;
  try {
    body = (await response.json()) as FileStylesResponse;
  } catch {
    throw new FigmaRestApiError("Ответ Figma REST API (/styles) не является валидным JSON.");
  }

  if (body.error || !body.meta) {
    throw new FigmaRestApiError(buildStylesScopeErrorMessage(body.status ?? response.status, body.message));
  }

  return body.meta.styles.filter((style) => style.style_type === "TEXT");
}

async function fetchStyleNodeDocuments(
  fileKey: string,
  token: string,
  nodeIds: string[]
): Promise<Map<string, RestTextNodeDocument | undefined>> {
  const result = new Map<string, RestTextNodeDocument | undefined>();
  if (nodeIds.length === 0) return result;

  for (const batch of chunkArray(nodeIds, NODES_BATCH_SIZE)) {
    const idsParam = batch.map((id) => encodeURIComponent(id)).join(",");
    let response: Response;
    try {
      response = await fetch(
        `${API_BASE}/files/${encodeURIComponent(fileKey)}/nodes?ids=${idsParam}`,
        {
          method: "GET",
          headers: { "X-Figma-Token": token },
        }
      );
    } catch {
      throw new FigmaRestApiError("Не удалось связаться с api.figma.com. Проверьте подключение к сети.");
    }

    if (!response.ok) {
      let message: string | undefined;
      try {
        const errorBody = (await response.json()) as { message?: string; err?: string };
        message = errorBody.message ?? errorBody.err;
      } catch {
        // тело ответа не JSON
      }
      throw new FigmaRestApiError(buildNodesScopeErrorMessage(response.status, message), response.status);
    }

    let body: FileNodesResponse;
    try {
      body = (await response.json()) as FileNodesResponse;
    } catch {
      throw new FigmaRestApiError("Ответ Figma REST API (/nodes) не является валидным JSON.");
    }

    if (body.err) {
      throw new FigmaRestApiError(`Figma REST API (/nodes): ${body.err}`);
    }

    for (const nodeId of batch) {
      const entry = body.nodes?.[nodeId];
      result.set(nodeId, entry?.document);
    }
  }

  return result;
}

/**
 * Загружает опубликованные TEXT-стили библиотеки и нормализует их свойства
 * для последующего сравнения (Phase 2+).
 */
export async function fetchLibraryTextStyles(
  fileKeyOrUrl: string,
  token: string
): Promise<LibraryTextStyle[]> {
  const fileKey = parseFigmaFileKey(fileKeyOrUrl);
  if (!fileKey.trim()) {
    throw new FigmaRestApiError("Не указан file_key библиотечного файла.");
  }
  if (!token.trim()) {
    throw new FigmaRestApiError("Не указан Personal Access Token.");
  }

  const publishedTextStyles = await fetchPublishedTextStyles(fileKey, token);
  const nodeIds = publishedTextStyles.map((style) => style.node_id);
  const documents = await fetchStyleNodeDocuments(fileKey, token, nodeIds);

  const result: LibraryTextStyle[] = [];

  for (const style of publishedTextStyles) {
    const document = documents.get(style.node_id);
    const typeStyle = extractTypeStyleFromDocument(document);
    if (!typeStyle) continue;

    const comparisonValue = readTypographyFromRestTypeStyle(typeStyle);
    if (!comparisonValue) continue;

    result.push({
      nodeId: style.node_id,
      key: style.key,
      name: style.name,
      displayValue: formatTypographyDisplayValue(comparisonValue),
      comparisonValue,
    });
  }

  return result;
}
