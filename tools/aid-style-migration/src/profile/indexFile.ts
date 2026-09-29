/**
 * Индексация открытого файла как материала продукта (способ «открыть файл»
 * из решения №8; REST — этап 2b). Документ не меняет.
 *
 * Plugin API не перечисляет стили и компоненты подключённых библиотек
 * (проверено на этапе 0), зато в самом файле библиотеки всё это локальное:
 * переменные со значениями, стили, компоненты со свойствами.
 */

import type {
  ComponentsIndex,
  IndexedCollection,
  IndexedComponent,
  IndexedComponentSet,
  IndexedEffectStyle,
  IndexedPaintStyle,
  IndexedProperty,
  IndexedTextStyle,
  MaterialKind,
  TokensIndex,
  VariableValue,
} from "./types";

export interface FileSurvey {
  fileName: string;
  variables: number;
  collections: number;
  textStyles: number;
  effectStyles: number;
  componentSets: number;
  components: number;
  /** Доля компонентов не больше 48×48 — признак библиотеки иконок. */
  smallShare: number;
  suggested: MaterialKind[];
}

/** Компоненты с «_» или «.» в начале имени Figma не публикует — их пропускаем. */
function isPrivate(name: string): boolean {
  return name.startsWith("_") || name.startsWith(".");
}

async function publishableComponents(): Promise<{ sets: ComponentSetNode[]; standalone: ComponentNode[] }> {
  await figma.loadAllPagesAsync();
  const nodes = figma.root.findAllWithCriteria({ types: ["COMPONENT_SET", "COMPONENT"] });
  const sets = nodes.filter((n): n is ComponentSetNode => n.type === "COMPONENT_SET" && !isPrivate(n.name));
  const standalone = nodes.filter(
    (n): n is ComponentNode => n.type === "COMPONENT" && n.parent?.type !== "COMPONENT_SET" && !isPrivate(n.name),
  );
  return { sets, standalone };
}

export async function surveyFile(): Promise<FileSurvey> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const variables = collections.reduce((n, c) => n + c.variableIds.length, 0);
  const textStyles = (await figma.getLocalTextStylesAsync()).length;
  const effectStyles = (await figma.getLocalEffectStylesAsync()).length;
  const { sets, standalone } = await publishableComponents();
  const all = [...sets, ...standalone];
  const small = all.filter((c) => c.width <= 48 && c.height <= 48).length;
  const smallShare = all.length ? small / all.length : 0;

  const suggested: MaterialKind[] = [];
  if (variables + textStyles + effectStyles > 0) suggested.push("tokens");
  if (all.length > 0) suggested.push(smallShare >= 0.7 ? "icons" : "components");

  return {
    fileName: figma.root.name,
    variables,
    collections: collections.length,
    textStyles,
    effectStyles,
    componentSets: sets.length,
    components: standalone.length + sets.reduce((n, s) => n + s.children.length, 0),
    smallShare,
    suggested,
  };
}

// ---------------------------------------------------------------------------
// Токены и стили
// ---------------------------------------------------------------------------

function hex(c: RGB | RGBA): string {
  const to = (v: number) => Math.round(v * 255).toString(16).padStart(2, "0");
  const alpha = "a" in c && c.a < 1 ? to(c.a) : "";
  return `#${to(c.r)}${to(c.g)}${to(c.b)}${alpha}`.toUpperCase();
}

function convertValue(value: VariableValue | unknown, byId: Map<string, Variable>): VariableValue {
  if (typeof value === "number") return { kind: "number", value };
  if (typeof value === "string") return { kind: "string", value };
  if (typeof value === "boolean") return { kind: "boolean", value };
  const v = value as { type?: string; id?: string; r?: number; g?: number; b?: number; a?: number };
  if (v.type === "VARIABLE_ALIAS" && v.id) {
    const target = byId.get(v.id);
    return { kind: "alias", name: target?.name ?? v.id, key: target?.key ?? null };
  }
  return { kind: "color", r: v.r ?? 0, g: v.g ?? 0, b: v.b ?? 0, a: v.a ?? 1 };
}

function px(value: LineHeight | LetterSpacing, fontSize: number): number | null {
  if (value.unit === "AUTO") return null;
  return value.unit === "PIXELS" ? value.value : (fontSize * value.value) / 100;
}

function describeEffect(e: Effect): string {
  if (e.type === "DROP_SHADOW" || e.type === "INNER_SHADOW") {
    return `${e.type} ${e.offset.x},${e.offset.y} r${e.radius} s${e.spread ?? 0} ${hex(e.color)}`;
  }
  return `${e.type} r${"radius" in e ? e.radius : 0}`;
}

function describePaint(p: Paint): string {
  if (p.type === "SOLID") return `${hex(p.color)}${p.opacity !== undefined && p.opacity < 1 ? ` ${Math.round(p.opacity * 100)}%` : ""}`;
  return p.type;
}

export async function indexTokens(): Promise<TokensIndex> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const variables = await figma.variables.getLocalVariablesAsync();
  const byId = new Map(variables.map((v) => [v.id, v]));

  const indexed: IndexedCollection[] = collections.map((c) => ({
    key: c.key,
    name: c.name,
    modes: c.modes.map((m) => ({ modeId: m.modeId, name: m.name })),
    variables: c.variableIds
      .map((id) => byId.get(id))
      .filter((v): v is Variable => Boolean(v))
      .map((v) => ({
        key: v.key,
        name: v.name,
        resolvedType: v.resolvedType,
        description: v.description,
        scopes: [...v.scopes],
        valuesByMode: Object.fromEntries(
          Object.entries(v.valuesByMode).map(([mode, value]) => [mode, convertValue(value, byId)]),
        ),
      })),
  }));

  const textStyles: IndexedTextStyle[] = (await figma.getLocalTextStylesAsync()).map((s) => ({
    key: s.key,
    name: s.name,
    description: s.description,
    fontFamily: s.fontName.family,
    fontStyle: s.fontName.style,
    fontSize: s.fontSize,
    lineHeight: px(s.lineHeight, s.fontSize),
    letterSpacing: px(s.letterSpacing, s.fontSize) ?? 0,
    textCase: s.textCase,
    textDecoration: s.textDecoration,
  }));

  const effectStyles: IndexedEffectStyle[] = (await figma.getLocalEffectStylesAsync()).map((s) => ({
    key: s.key,
    name: s.name,
    description: s.description,
    effects: s.effects.map(describeEffect),
  }));

  const paintStyles: IndexedPaintStyle[] = (await figma.getLocalPaintStylesAsync()).map((s) => ({
    key: s.key,
    name: s.name,
    description: s.description,
    paints: s.paints.map(describePaint),
  }));

  return { collections: indexed, textStyles, effectStyles, paintStyles };
}

// ---------------------------------------------------------------------------
// Компоненты и иконки
// ---------------------------------------------------------------------------

function where(node: BaseNode): { group: string; page: string } {
  let group = "";
  let current = node.parent;
  while (current && current.type !== "PAGE") {
    if ((current.type === "FRAME" || current.type === "SECTION") && current.parent?.type === "PAGE") group = current.name;
    else if (!group && (current.type === "FRAME" || current.type === "SECTION")) group = current.name;
    current = current.parent;
  }
  return { group, page: current?.name ?? "" };
}

function properties(node: ComponentNode | ComponentSetNode): IndexedProperty[] {
  // У варианта внутри набора свойств нет — они у набора; у одиночного — свои.
  let defs: ComponentPropertyDefinitions;
  try {
    defs = node.componentPropertyDefinitions;
  } catch {
    return [];
  }
  return Object.entries(defs).map(([name, d]) => ({
    name,
    type: d.type,
    defaultValue: d.defaultValue,
    ...(d.variantOptions ? { variantOptions: [...d.variantOptions] } : {}),
  }));
}

function component(node: ComponentNode | ComponentSetNode): IndexedComponent {
  return {
    key: node.key,
    name: node.name,
    description: node.description,
    width: Math.round(node.width),
    height: Math.round(node.height),
    ...where(node),
    properties: properties(node),
  };
}

export async function indexComponents(): Promise<ComponentsIndex> {
  const { sets, standalone } = await publishableComponents();
  const indexedSets: IndexedComponentSet[] = sets.map((s) => ({
    ...component(s),
    variants: s.children
      .filter((c): c is ComponentNode => c.type === "COMPONENT")
      .map((v) => ({ key: v.key, name: v.name, width: Math.round(v.width), height: Math.round(v.height) })),
  }));
  return { sets: indexedSets, components: standalone.map(component) };
}

export function tokensStats(index: TokensIndex): Record<string, number> {
  return {
    collections: index.collections.length,
    variables: index.collections.reduce((n, c) => n + c.variables.length, 0),
    textStyles: index.textStyles.length,
    effectStyles: index.effectStyles.length,
  };
}

export function componentsStats(index: ComponentsIndex): Record<string, number> {
  return {
    sets: index.sets.length,
    variants: index.sets.reduce((n, s) => n + s.variants.length, 0),
    components: index.components.length,
  };
}
