/**
 * Обход нод текущего файла и сбор цветовых свойств (fills, strokes,
 * text fills). Работает в главном потоке плагина (code.ts) — имеет доступ
 * к figma.currentPage / figma.root и Variables API.
 *
 * Дедупликация: записи группируются по
 * (property + resolvedValue(hex+alpha) + bindingType + sourceName),
 * для группы хранится count и представитель (path + node ids).
 */

import type { BindingType, LayoutRecord, LayoutRecordModeValue, ScanScope } from "../comparators/types";
import { colorValueKey, formatColorValue, rgbToHex, stableHash } from "./colorUtils";

type ColorProperty = "fill" | "stroke" | "text-fill";

interface RawColorHit {
  property: ColorProperty;
  bindingType: BindingType;
  hex: string;
  alpha: number;
  sourceName: string;
  variableId?: string;
  variableKey?: string;
  styleId?: string;
  collectionId?: string;
  modeValues?: LayoutRecordModeValue[];
  node: SceneNode;
  nodePath: string;
}

const MAX_NODE_IDS_PER_GROUP = 500;

function isSolidPaint(paint: Paint): paint is SolidPaint {
  return paint.type === "SOLID";
}

/** Строит breadcrumb от страницы до ноды, например "Page 1 / Frame / Group / Rect". */
function buildNodePath(node: SceneNode): string {
  const segments: string[] = [];
  let current: BaseNode | null = node;
  while (current && current.type !== "PAGE" && current.type !== "DOCUMENT") {
    segments.unshift(current.name);
    current = current.parent;
  }
  const page = current && current.type === "PAGE" ? current.name : "";
  return page ? [page, ...segments].join(" / ") : segments.join(" / ");
}

/**
 * Решает, нужно ли пропустить ноду целиком при обходе (но не обязательно
 * её потомков — за это отвечает вызывающий код рекурсии).
 */
function isNodeHidden(node: SceneNode): boolean {
  return node.visible === false;
}

/** true, если сама нода — маска (её собственный цвет не несёт смысловой нагрузки). */
function isMaskNode(node: SceneNode): boolean {
  return "isMask" in node && (node as { isMask?: boolean }).isMask === true;
}

async function resolveVariableBinding(
  variableId: string
): Promise<{ sourceName: string; collectionId?: string; variableKey?: string }> {
  try {
    const variable = await figma.variables.getVariableByIdAsync(variableId);
    if (!variable) return { sourceName: "(переменная удалена)" };
    return {
      sourceName: variable.name,
      collectionId: variable.variableCollectionId,
      variableKey: variable.key,
    };
  } catch {
    return { sourceName: "(переменная недоступна)" };
  }
}

function isRgbaVariableValue(value: VariableValue): value is RGBA {
  return typeof value === "object" && value !== null && "r" in value && "g" in value && "b" in value && "a" in value;
}

function isVariableAliasValue(value: VariableValue): value is VariableAlias {
  return typeof value === "object" && value !== null && (value as VariableAlias).type === "VARIABLE_ALIAS";
}

/**
 * Резолвит цвет переменной в конкретном режиме, следуя по цепочке
 * VARIABLE_ALIAS через Plugin API (в отличие от REST API, здесь доступны
 * и локальные, и импортированные из библиотек переменные текущего файла —
 * ограничение "внешний алиас не резолвится" здесь не действует).
 */
async function resolveVariableColorInMode(
  variable: Variable,
  modeId: string,
  visited: Set<string> = new Set()
): Promise<RGBA | null> {
  if (visited.has(variable.id)) return null; // защита от циклической ссылки
  visited.add(variable.id);

  const raw = variable.valuesByMode[modeId];
  if (raw === undefined) return null;

  if (isRgbaVariableValue(raw)) return raw;

  if (isVariableAliasValue(raw)) {
    const target = await figma.variables.getVariableByIdAsync(raw.id);
    if (!target) return null;
    if (target.valuesByMode[modeId] !== undefined) {
      return resolveVariableColorInMode(target, modeId, visited);
    }
    // Алиас может указывать на переменную из коллекции с другим набором
    // modeId — используем дефолтный режим целевой коллекции.
    try {
      const targetCollection = await figma.variables.getVariableCollectionByIdAsync(target.variableCollectionId);
      const fallbackModeId = targetCollection?.defaultModeId ?? Object.keys(target.valuesByMode)[0];
      if (!fallbackModeId) return null;
      return resolveVariableColorInMode(target, fallbackModeId, visited);
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Резолвит значения переменной по ВСЕМ режимам её коллекции (Day/Night и
 * т.п.) — используется, чтобы показать в таблице оба значения макета для
 * наглядного сравнения с библиотекой по режимам.
 */
async function resolveVariableModeValues(variableId: string): Promise<LayoutRecordModeValue[]> {
  try {
    const variable = await figma.variables.getVariableByIdAsync(variableId);
    if (!variable) return [];
    const collection = await figma.variables.getVariableCollectionByIdAsync(variable.variableCollectionId);
    if (!collection) return [];

    const modeValues: LayoutRecordModeValue[] = [];
    for (const mode of collection.modes) {
      const resolved = await resolveVariableColorInMode(variable, mode.modeId);
      if (!resolved) continue;
      const hex = rgbToHex(resolved.r, resolved.g, resolved.b);
      modeValues.push({
        modeId: mode.modeId,
        modeName: mode.name,
        displayValue: formatColorValue(hex, resolved.a),
        comparisonValue: { hex, alpha: resolved.a },
      });
    }
    return modeValues;
  } catch {
    return [];
  }
}

/**
 * Кэш результатов resolveVariableModeValues на время одного сканирования —
 * одна и та же переменная обычно встречается на множестве нод, повторный
 * REST/Plugin API резолв каждый раз был бы избыточен.
 */
let variableModeValuesCache = new Map<string, Promise<LayoutRecordModeValue[]>>();

function getCachedVariableModeValues(variableId: string): Promise<LayoutRecordModeValue[]> {
  const cached = variableModeValuesCache.get(variableId);
  if (cached) return cached;
  const promise = resolveVariableModeValues(variableId);
  variableModeValuesCache.set(variableId, promise);
  return promise;
}

async function resolveStyleBinding(styleId: string): Promise<{ sourceName: string; isGhost: boolean }> {
  try {
    const style = await figma.getStyleByIdAsync(styleId);
    if (!style) return { sourceName: "(стиль удалён)", isGhost: true };
    return { sourceName: style.name, isGhost: false };
  } catch {
    return { sourceName: "(стиль недоступен)", isGhost: true };
  }
}

/**
 * Определяет binding и resolved-значение для одного paint внутри
 * fills/strokes указанной ноды.
 */
async function inspectPaint(
  paints: readonly Paint[],
  paintIndex: number,
  boundVariableAliases: readonly (VariableAlias | undefined)[] | undefined,
  styleId: string | undefined
): Promise<Omit<RawColorHit, "node" | "nodePath" | "property"> | null> {
  const paint = paints[paintIndex];
  if (!isSolidPaint(paint) || paint.visible === false) return null;

  const hex = rgbToHex(paint.color.r, paint.color.g, paint.color.b);
  const alpha = paint.opacity ?? 1;

  const boundAlias = boundVariableAliases?.[paintIndex];
  if (boundAlias) {
    const { sourceName, collectionId, variableKey } = await resolveVariableBinding(boundAlias.id);
    const modeValues = await getCachedVariableModeValues(boundAlias.id);
    return {
      bindingType: "variable",
      hex,
      alpha,
      sourceName,
      variableId: boundAlias.id,
      variableKey,
      collectionId,
      modeValues,
    };
  }

  if (styleId) {
    const { sourceName, isGhost } = await resolveStyleBinding(styleId);
    return {
      bindingType: isGhost ? "ghost" : "style",
      hex,
      alpha,
      sourceName,
      styleId,
    };
  }

  return { bindingType: "hardcoded", hex, alpha, sourceName: "" };
}

async function collectNodeColorHits(node: SceneNode, nodePath: string): Promise<RawColorHit[]> {
  const hits: RawColorHit[] = [];

  const fillsMixin = node as unknown as MinimalFillsMixin & SceneNode;
  const strokesMixin = node as unknown as MinimalStrokesMixin & SceneNode;

  if ("fills" in node && Array.isArray(fillsMixin.fills)) {
    const property: ColorProperty = node.type === "TEXT" ? "text-fill" : "fill";
    const styleId =
      typeof fillsMixin.fillStyleId === "string" && fillsMixin.fillStyleId ? fillsMixin.fillStyleId : undefined;
    const boundAliases = node.boundVariables?.fills;
    for (let i = 0; i < fillsMixin.fills.length; i++) {
      const inspected = await inspectPaint(fillsMixin.fills, i, boundAliases, styleId);
      if (inspected) hits.push({ ...inspected, node, nodePath, property });
    }
  }

  if ("strokes" in node && Array.isArray(strokesMixin.strokes)) {
    const styleId =
      typeof strokesMixin.strokeStyleId === "string" && strokesMixin.strokeStyleId
        ? strokesMixin.strokeStyleId
        : undefined;
    const boundAliases = node.boundVariables?.strokes;
    for (let i = 0; i < strokesMixin.strokes.length; i++) {
      const inspected = await inspectPaint(strokesMixin.strokes, i, boundAliases, styleId);
      if (inspected) hits.push({ ...inspected, node, nodePath, property: "stroke" });
    }
  }

  return hits;
}

/**
 * Рекурсивно обходит поддерево, пропуская скрытые ноды и не заходя внутрь
 * boolean-операций (их считаем листом — собственные fills/strokes самой
 * BooleanOperationNode обрабатываются, но её внутренние vector-компоненты
 * пропускаются как несамостоятельные детали реализации).
 */
async function walk(node: SceneNode, hits: RawColorHit[]): Promise<void> {
  if (isNodeHidden(node)) return;
  if (isMaskNode(node)) return;

  const nodePath = buildNodePath(node);
  hits.push(...(await collectNodeColorHits(node, nodePath)));

  if (node.type === "BOOLEAN_OPERATION") return; // не спускаемся во внутренние vector-ноды

  if ("children" in node) {
    for (const child of (node as ChildrenMixin).children as SceneNode[]) {
      await walk(child, hits);
    }
  }
}

async function collectRootsForScope(scope: ScanScope): Promise<SceneNode[]> {
  if (scope === "selection") {
    return [...figma.currentPage.selection];
  }
  if (scope === "page") {
    return [...figma.currentPage.children];
  }
  // scope === "file": обходим все страницы документа
  await figma.loadAllPagesAsync();
  const roots: SceneNode[] = [];
  for (const page of figma.root.children) {
    roots.push(...page.children);
  }
  return roots;
}

function groupHits(hits: RawColorHit[]): LayoutRecord[] {
  const groups = new Map<string, LayoutRecord>();

  for (const hit of hits) {
    const displayValue = formatColorValue(hit.hex, hit.alpha);
    const groupKey = stableHash(
      `${hit.property}|${colorValueKey(hit.hex, hit.alpha)}|${hit.bindingType}|${hit.sourceName}`
    );

    const existing = groups.get(groupKey);
    if (existing) {
      existing.count += 1;
      if (existing.nodeIds.length < MAX_NODE_IDS_PER_GROUP) {
        existing.nodeIds.push(hit.node.id);
      }
      continue;
    }

    groups.set(groupKey, {
      id: groupKey,
      category: "colors",
      property: hit.property,
      bindingType: hit.bindingType,
      displayValue,
      comparisonValue: { hex: hit.hex, alpha: hit.alpha },
      sourceName: hit.sourceName,
      count: 1,
      representativeNodePath: hit.nodePath,
      representativeNodeName: hit.node.name,
      nodeIds: [hit.node.id],
      variableId: hit.variableId,
      variableKey: hit.variableKey,
      styleId: hit.styleId,
      modeValues: hit.modeValues && hit.modeValues.length > 0 ? hit.modeValues : undefined,
    });
  }

  return [...groups.values()];
}

export async function scanColors(scope: ScanScope): Promise<LayoutRecord[]> {
  variableModeValuesCache = new Map(); // сбрасываем кэш между независимыми запусками сканирования
  const roots = await collectRootsForScope(scope);
  const hits: RawColorHit[] = [];
  for (const root of roots) {
    await walk(root, hits);
  }
  return groupHits(hits);
}
