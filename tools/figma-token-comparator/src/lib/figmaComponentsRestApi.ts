/**
 * Figma REST API — иконки библиотеки (v1.5.0).
 *
 * Иконки — отдельная библиотека: все её опубликованные компоненты считаются
 * иконками (решение Principal Designer).
 *
 * Поток:
 * 1. GET /v1/files/:file_key/components — опубликованные компоненты;
 *    у варианта `containing_frame.containingComponentSet` — его набор.
 * 2. GET /v1/files/:file_key/nodes?ids=…&geometry=paths — дерево каждого
 *    компонента с геометрией, пачками.
 * 3. Геометрия → отпечаток формы (lib/iconGeometry.ts, lib/iconShape.ts).
 *
 * Scopes токена: /components — library_content:read, /nodes —
 * file_content:read. Те же, что нужны для стилей текста.
 */

import { FigmaRestApiError } from "./figmaRestApi";
import { extractIconGeometry, type FigmaGeometryNode } from "./iconGeometry";
import { fingerprint, iconOutline, packFingerprint } from "./iconShape";
import type { LibraryIcon } from "../comparators/types";

const API_BASE = "https://api.figma.com/v1";
/** Сколько компонентов в одном запросе геометрии: дерево с путями тяжёлое. */
export const ICON_NODES_BATCH_SIZE = 50;
/** Сторона отпечатка — выбрана на этапе 0 (docs/icons-spike-2026-09-19.md). */
export const ICON_FINGERPRINT_SIZE = 32;

interface PublishedComponent {
  key: string;
  node_id: string;
  name: string;
  description?: string;
  containing_frame?: {
    name?: string;
    containingComponentSet?: { name?: string; nodeId?: string } | null;
  };
}

interface ComponentsResponse {
  meta?: { components?: PublishedComponent[] };
}

interface IconNodeDocument extends FigmaGeometryNode {
  size?: { x: number; y: number };
  absoluteBoundingBox?: { width: number; height: number } | null;
}

interface NodesResponse {
  nodes?: Record<string, { document?: IconNodeDocument } | null>;
}

async function requestJson<T>(url: string, token: string, errorFor: (status: number, message?: string) => string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { method: "GET", headers: { "X-Figma-Token": token } });
  } catch {
    throw new FigmaRestApiError("Не удалось связаться с api.figma.com. Проверьте подключение к сети.");
  }
  if (!response.ok) {
    let message: string | undefined;
    try {
      const body = (await response.json()) as { message?: string; err?: string };
      message = body.message ?? body.err;
    } catch {
      // тело ответа не JSON
    }
    throw new FigmaRestApiError(errorFor(response.status, message), response.status);
  }
  try {
    return (await response.json()) as T;
  } catch {
    throw new FigmaRestApiError("Figma REST API вернул некорректный ответ.");
  }
}

function componentsError(status: number, message?: string): string {
  if (status === 403) {
    return "Токену Figma не хватает доступа к компонентам библиотеки (library_content:read).";
  }
  return `Не удалось получить компоненты библиотеки (${status})${message ? `: ${message}` : "."}`;
}

function nodesError(status: number, message?: string): string {
  if (status === 403) {
    return "Токену Figma не хватает доступа к содержимому файла библиотеки (file_content:read).";
  }
  return `Не удалось получить геометрию иконок (${status})${message ? `: ${message}` : "."}`;
}

function toLibraryIcon(component: PublishedComponent, document: IconNodeDocument): LibraryIcon | null {
  const geometry = extractIconGeometry(document);
  if (geometry.paths.length === 0) return null;
  const width = document.size?.x ?? document.absoluteBoundingBox?.width ?? geometry.glyph?.width ?? 0;
  const height = document.size?.y ?? document.absoluteBoundingBox?.height ?? geometry.glyph?.height ?? 0;
  const setName = component.containing_frame?.containingComponentSet?.name;
  return {
    key: component.key,
    nodeId: component.node_id,
    name: component.name,
    ...(setName ? { setName } : {}),
    ...(component.description ? { description: component.description } : {}),
    width,
    height,
    glyph: geometry.glyph,
    opacities: geometry.opacities,
    layers: geometry.layers,
    fingerprint: packFingerprint(fingerprint(geometry.paths, { size: ICON_FINGERPRINT_SIZE })),
    outline: iconOutline(geometry.paths, { x: 0, y: 0, width, height }),
  };
}

/** Иконки библиотеки с отпечатками формы. Компоненты без видимой геометрии пропускаются. */
export async function fetchLibraryIcons(fileKey: string, token: string): Promise<LibraryIcon[]> {
  const file = encodeURIComponent(fileKey);
  const listing = await requestJson<ComponentsResponse>(`${API_BASE}/files/${file}/components`, token, componentsError);
  const components = listing.meta?.components ?? [];
  if (components.length === 0) return [];

  const icons: LibraryIcon[] = [];
  for (let i = 0; i < components.length; i += ICON_NODES_BATCH_SIZE) {
    const batch = components.slice(i, i + ICON_NODES_BATCH_SIZE);
    const ids = batch.map((component) => component.node_id).join(",");
    const nodes = await requestJson<NodesResponse>(
      `${API_BASE}/files/${file}/nodes?ids=${encodeURIComponent(ids)}&geometry=paths`,
      token,
      nodesError
    );
    for (const component of batch) {
      const document = nodes.nodes?.[component.node_id]?.document;
      if (!document) continue;
      const icon = toLibraryIcon(component, document);
      if (icon) icons.push(icon);
    }
  }
  return icons;
}

/** Имя иконки для интерфейса: вариант — вместе с именем набора. */
export function formatLibraryIconName(icon: Pick<LibraryIcon, "name" | "setName">): string {
  return icon.setName ? `${icon.setName} / ${icon.name}` : icon.name;
}
