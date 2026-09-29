/**
 * Ответы Figma REST API → наш индекс токенов. Чистая логика: запросы — в
 * restTokens.ts. Формат ответов — как в Token Comparator
 * (figmaRestApi.ts, figmaStylesRestApi.ts).
 */

import { convertValue, resolveValue, type ResolveEntry } from "./tokenValues";
import type { IndexedCollection, IndexedEffectStyle, IndexedTextStyle, TokensIndex } from "./types";

export interface RestVariable {
  id: string;
  name: string;
  key: string;
  variableCollectionId: string;
  resolvedType: string;
  valuesByMode: Record<string, unknown>;
  remote: boolean;
  hiddenFromPublishing?: boolean;
  description?: string;
  scopes?: string[];
}

export interface RestCollection {
  id: string;
  name: string;
  key: string;
  modes: Array<{ modeId: string; name: string }>;
  defaultModeId: string;
  remote: boolean;
  hiddenFromPublishing?: boolean;
  variableIds?: string[];
}

export interface RestVariablesMeta {
  variables: Record<string, RestVariable>;
  variableCollections: Record<string, RestCollection>;
}

/** Переменные библиотеки: только свои (не remote), со значениями и итоговыми значениями по режимам. */
export function collectionsFromRest(meta: RestVariablesMeta): IndexedCollection[] {
  const variables = Object.values(meta.variables).filter((v) => !v.remote);
  const byId = new Map(variables.map((v) => [v.id, v]));
  const collections = Object.values(meta.variableCollections).filter((c) => !c.remote);

  const indexed: IndexedCollection[] = collections.map((c) => {
    const own = c.variableIds ? c.variableIds.map((id) => byId.get(id)).filter((v): v is RestVariable => Boolean(v)) : variables.filter((v) => v.variableCollectionId === c.id);
    return {
      key: c.key,
      name: c.name,
      published: !c.hiddenFromPublishing,
      modes: c.modes.map((m) => ({ modeId: m.modeId, name: m.name })),
      variables: own.map((v) => ({
        key: v.key,
        name: v.name,
        published: !c.hiddenFromPublishing && !v.hiddenFromPublishing,
        resolvedType: v.resolvedType as VariableResolvedDataType,
        description: v.description ?? "",
        scopes: v.scopes ?? [],
        valuesByMode: Object.fromEntries(Object.entries(v.valuesByMode).map(([mode, value]) => [mode, convertValue(value, (id) => byId.get(id))])),
        resolvedByMode: {},
      })),
    };
  });

  const byKey = new Map<string, ResolveEntry>();
  indexed.forEach((c, i) => {
    for (const v of c.variables) byKey.set(v.key, { valuesByMode: v.valuesByMode, defaultModeId: collections[i].defaultModeId });
  });
  for (const c of indexed) {
    for (const v of c.variables) {
      v.resolvedByMode = Object.fromEntries(Object.entries(v.valuesByMode).map(([mode, value]) => [mode, resolveValue(value, mode, byKey)]));
    }
  }
  return indexed;
}

export interface RestStyleEntry {
  key: string;
  node_id: string;
  style_type: string;
  name: string;
  description?: string;
}

export interface RestTypeStyle {
  fontFamily?: string;
  fontStyle?: string;
  fontWeight?: number;
  fontSize?: number;
  letterSpacing?: number;
  lineHeightPx?: number;
  lineHeightUnit?: string;
  textCase?: string;
  textDecoration?: string;
}

export interface RestEffect {
  type: string;
  visible?: boolean;
  radius?: number;
  spread?: number;
  offset?: { x: number; y: number };
  color?: { r: number; g: number; b: number; a: number };
}

export interface RestStyleNode {
  style?: RestTypeStyle;
  effects?: RestEffect[];
}

/** Начертания по весу. «Light» — начертание шрифта, не режим темы (страж: слова режимов здесь не режимы). */
const WEIGHT_NAMES: Record<number, string> = {
  100: "Thin",
  200: "ExtraLight",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "SemiBold",
  700: "Bold",
  800: "ExtraBold",
  900: "Black",
};

export function textStyleFromRest(entry: RestStyleEntry, node: RestStyleNode | undefined): IndexedTextStyle | null {
  const s = node?.style;
  if (!s || !s.fontFamily || !s.fontSize) return null;
  return {
    key: entry.key,
    name: entry.name,
    published: true,
    description: entry.description ?? "",
    fontFamily: s.fontFamily,
    fontStyle: s.fontStyle ?? WEIGHT_NAMES[s.fontWeight ?? 400] ?? "Regular",
    fontSize: s.fontSize,
    // «Авто» у REST — INTRINSIC_%; px тогда не наш — считаем авто.
    lineHeight: s.lineHeightUnit === "INTRINSIC_%" ? null : (s.lineHeightPx ?? null),
    letterSpacing: s.letterSpacing ?? 0,
    textCase: s.textCase ?? "ORIGINAL",
    textDecoration: s.textDecoration ?? "NONE",
  };
}

function hex(c: { r: number; g: number; b: number; a: number }): string {
  const to = (v: number) => Math.round(v * 255).toString(16).padStart(2, "0");
  return `#${to(c.r)}${to(c.g)}${to(c.b)}${c.a < 1 ? to(c.a) : ""}`.toUpperCase();
}

export function effectStyleFromRest(entry: RestStyleEntry, node: RestStyleNode | undefined): IndexedEffectStyle {
  const effects = (node?.effects ?? []).filter((e) => e.visible !== false);
  return {
    key: entry.key,
    name: entry.name,
    published: true,
    description: entry.description ?? "",
    effects: effects.map((e) =>
      e.type === "DROP_SHADOW" || e.type === "INNER_SHADOW"
        ? `${e.type} ${e.offset?.x ?? 0},${e.offset?.y ?? 0} r${e.radius ?? 0} s${e.spread ?? 0} ${e.color ? hex(e.color) : ""}`.trim()
        : `${e.type} r${e.radius ?? 0}`,
    ),
  };
}

export function tokensIndexFromRest(
  meta: RestVariablesMeta,
  styles: RestStyleEntry[],
  nodes: Map<string, RestStyleNode | undefined>,
): TokensIndex {
  const textStyles = styles
    .filter((s) => s.style_type === "TEXT")
    .map((s) => textStyleFromRest(s, nodes.get(s.node_id)))
    .filter((s): s is IndexedTextStyle => s !== null);
  const effectStyles = styles.filter((s) => s.style_type === "EFFECT").map((s) => effectStyleFromRest(s, nodes.get(s.node_id)));
  return { collections: collectionsFromRest(meta), textStyles, effectStyles, paintStyles: [] };
}
