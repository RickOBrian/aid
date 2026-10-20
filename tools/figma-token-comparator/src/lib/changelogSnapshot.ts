/**
 * Снимок библиотеки для «Записать изменения» и его хранение в самом файле
 * библиотеки (решение PD 2026-10-20).
 *
 * Снимок лежит в sharedPluginData узла таблицы чейнжлога (`figmaTable` в
 * JSON): таблица и снимок одной коллекции живут вместе и видны всем, кто
 * открывает файл, — не только на компьютере одного дизайнера. Figma не отдаёт
 * значений опубликованной версии, поэтому опубликованное состояние плагин
 * помнит сам.
 *
 * Работает только в главном потоке (code.ts).
 */

import { rgbToHex } from "./colorUtils";
import {
  splitIntoChunks,
  type ChangelogBaseline,
  type ComponentSnapshotItem,
  type ComponentsSnapshot,
  type LibrarySnapshot,
  type VariableSnapshotItem,
  type VariablesSnapshot,
} from "./changelogRecord";

export const CHANGELOG_NAMESPACE = "aid_changelog";
const META_KEY = "meta";
/** Предел записи sharedPluginData — 100 kB; кириллица в UTF-8 вдвое длиннее, отсюда запас. */
const CHUNK_SIZE = 40_000;

/** Что записывает эта таблица: коллекцию переменных или компоненты файла. */
export type ChangelogSource = { kind: "variables"; collectionId: string } | { kind: "components" };

export interface StoredChangelogState extends ChangelogBaseline {
  path: string;
  source: ChangelogSource;
  /** Фразы дизайнера по группам изменений. */
  descriptions: Record<string, string>;
  author: string;
}

interface StoredMeta {
  v: 1;
  path: string;
  source: ChangelogSource;
  baseVersion: string | null;
  descriptions: Record<string, string>;
  author: string;
  chunks: { published: number; recorded: number };
}

function formatColor(value: RGBA): string {
  const hex = rgbToHex(value.r, value.g, value.b);
  const alpha = Math.round(value.a * 100);
  return alpha >= 100 ? hex : `${hex} ${alpha}%`;
}

function formatNumber(value: number): string {
  return String(Math.round(value * 10000) / 10000);
}

async function formatVariableValue(value: VariableValue, names: Map<string, string>): Promise<string> {
  if (typeof value === "object" && value !== null && "type" in value && value.type === "VARIABLE_ALIAS") {
    let name = names.get(value.id);
    if (name === undefined) {
      const target = await figma.variables.getVariableByIdAsync(value.id);
      name = target?.name ?? value.id;
      names.set(value.id, name);
    }
    return `{${name}}`;
  }
  if (typeof value === "object" && value !== null && "r" in value) {
    return formatColor({ a: 1, ...(value as RGB | RGBA) } as RGBA);
  }
  if (typeof value === "number") return formatNumber(value);
  return String(value);
}

export async function snapshotVariables(collectionId: string): Promise<VariablesSnapshot> {
  const collection = await figma.variables.getVariableCollectionByIdAsync(collectionId);
  if (!collection) throw new Error("Коллекция переменных не найдена в этом файле.");

  const variables = (await Promise.all(collection.variableIds.map((id) => figma.variables.getVariableByIdAsync(id))))
    .filter((variable): variable is Variable => Boolean(variable))
    // Скрытые от публикации переменные потребители не видят — в чейнжлог их не пишем.
    .filter((variable) => !variable.hiddenFromPublishing);

  const names = new Map<string, string>(variables.map((variable) => [variable.id, variable.name]));
  const items: VariableSnapshotItem[] = [];
  for (const variable of variables) {
    const values: Record<string, string> = {};
    for (const mode of collection.modes) {
      const value = variable.valuesByMode[mode.modeId];
      if (value !== undefined) values[mode.modeId] = await formatVariableValue(value, names);
    }
    items.push({
      id: variable.id,
      name: variable.name,
      values,
      scopes: [...variable.scopes],
      description: variable.description ?? "",
    });
  }

  return {
    kind: "variables",
    collectionId: collection.id,
    collectionName: collection.name,
    modes: collection.modes.map((mode) => ({ id: mode.modeId, name: mode.name })),
    items,
  };
}

/** Имена на `_` и `.` Figma не публикует — это служебные компоненты файла. */
function isPublishable(name: string): boolean {
  return !name.startsWith("_") && !name.startsWith(".");
}

function describeProperties(definitions: ComponentPropertyDefinitions): Record<string, string> {
  const properties: Record<string, string> = {};
  for (const [rawName, definition] of Object.entries(definitions)) {
    // Варианты набора сравниваются отдельно, по именам вариантов.
    if (definition.type === "VARIANT") continue;
    const name = rawName.replace(/#[^#]*$/, "");
    properties[name] = `${definition.type} = ${String(definition.defaultValue)}`;
  }
  return properties;
}

export async function snapshotComponents(): Promise<ComponentsSnapshot> {
  await figma.loadAllPagesAsync();
  const nodes = figma.root.findAllWithCriteria({ types: ["COMPONENT_SET", "COMPONENT"] });
  const items: ComponentSnapshotItem[] = [];
  for (const node of nodes) {
    if (node.type === "COMPONENT" && node.parent?.type === "COMPONENT_SET") continue;
    if (!isPublishable(node.name)) continue;
    let properties: Record<string, string> = {};
    try {
      properties = describeProperties(node.componentPropertyDefinitions);
    } catch {
      // Свойства недоступны у компонента с ошибкой в наборе — сравниваем без них.
    }
    items.push({
      id: node.id,
      name: node.name,
      variants: node.type === "COMPONENT_SET" ? node.children.map((child) => child.name).sort() : [],
      properties,
      description: node.description ?? "",
    });
  }
  return { kind: "components", items };
}

export async function takeSnapshot(source: ChangelogSource): Promise<LibrarySnapshot> {
  return source.kind === "variables" ? snapshotVariables(source.collectionId) : snapshotComponents();
}

function writeChunks(node: BaseNode, prefix: string, value: LibrarySnapshot | null, previous: number): number {
  const chunks = value ? splitIntoChunks(JSON.stringify(value), CHUNK_SIZE) : [];
  chunks.forEach((chunk, index) => node.setSharedPluginData(CHANGELOG_NAMESPACE, `${prefix}.${index}`, chunk));
  for (let index = chunks.length; index < previous; index += 1) {
    node.setSharedPluginData(CHANGELOG_NAMESPACE, `${prefix}.${index}`, "");
  }
  return chunks.length;
}

function readChunks(node: BaseNode, prefix: string, count: number): LibrarySnapshot | null {
  if (count === 0) return null;
  let text = "";
  for (let index = 0; index < count; index += 1) {
    text += node.getSharedPluginData(CHANGELOG_NAMESPACE, `${prefix}.${index}`);
  }
  return JSON.parse(text) as LibrarySnapshot;
}

function readMeta(node: BaseNode): StoredMeta | null {
  const raw = node.getSharedPluginData(CHANGELOG_NAMESPACE, META_KEY);
  if (!raw) return null;
  try {
    const meta = JSON.parse(raw) as StoredMeta;
    return meta.v === 1 ? meta : null;
  } catch {
    return null;
  }
}

export function readChangelogState(node: BaseNode): StoredChangelogState | null {
  const meta = readMeta(node);
  if (!meta) return null;
  const published = readChunks(node, "published", meta.chunks.published);
  if (!published) return null;
  return {
    path: meta.path,
    source: meta.source,
    baseVersion: meta.baseVersion,
    descriptions: meta.descriptions ?? {},
    author: meta.author ?? "",
    published,
    recorded: readChunks(node, "recorded", meta.chunks.recorded),
  };
}

export function writeChangelogState(node: BaseNode, state: StoredChangelogState): void {
  const previous = readMeta(node)?.chunks ?? { published: 0, recorded: 0 };
  const chunks = {
    published: writeChunks(node, "published", state.published, previous.published),
    recorded: writeChunks(node, "recorded", state.recorded, previous.recorded),
  };
  const meta: StoredMeta = {
    v: 1,
    path: state.path,
    source: state.source,
    baseVersion: state.baseVersion,
    descriptions: state.descriptions,
    author: state.author,
    chunks,
  };
  node.setSharedPluginData(CHANGELOG_NAMESPACE, META_KEY, JSON.stringify(meta));
}
