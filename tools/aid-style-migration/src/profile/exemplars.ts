/**
 * Индекс образцовых макетов: как продукт на деле использует свои токены,
 * стили текста и компоненты. Документ не меняет.
 *
 * Образцы — флоу со стрелками и заметками, а не чистые экраны (спайк), и
 * файл большой: читаем только экраны (тот же распознаватель, что в
 * сборке) и не больше EXEMPLAR_LIMIT, равномерной выборкой.
 */

import { expand, facts, type Root } from "../assemble/collect";
import { isAnnotationName, outside } from "../lib/annotations";
import { isDark } from "../assemble/darkPairs";
import { classify } from "../assemble/screens";
import type { ExemplarIndex, UsageCounts } from "./types";
import { bump, EXEMPLAR_LIMIT, fieldUse, fillUse, sample, visibleCase, type ExemplarScope } from "./usage";

export { EXEMPLAR_LIMIT, type ExemplarScope };


function roots(scope: ExemplarScope): Root[] {
  const page = figma.currentPage;
  const out: Root[] = [];
  const nodes = scope === "selection" ? page.selection : page.children;
  for (const n of nodes) expand(n, page, out);
  return out;
}

/** Сколько экранов на текущей странице — для подсказки в «Изучить файл». */
export async function countScreens(): Promise<number> {
  let n = 0;
  for (const { node, page } of roots("page")) if (classify(await facts(node, page)).kind === "screen") n++;
  return n;
}

function emptyIndex(): ExemplarIndex {
  return {
    screens: 0,
    darkScreens: 0,
    screensFound: 0,
    nodes: 0,
    annotationsSkipped: 0,
    variables: {},
    textStyles: {},
    components: {},
    unbound: { fills: 0, strokes: 0, texts: 0 },
    textCases: {},
  };
}

interface VariableInfo {
  key: string;
  name: string;
  collection: string;
  remote: boolean;
}

interface Lookup {
  variables: Map<string, VariableInfo | null>;
  collections: Map<string, string>;
  styles: Map<string, { key: string; name: string } | null>;
}

async function collectionName(id: string, lookup: Lookup): Promise<string> {
  if (!lookup.collections.has(id)) {
    let name = "";
    try {
      name = (await figma.variables.getVariableCollectionByIdAsync(id))?.name ?? "";
    } catch {
      // Коллекция чужой библиотеки может быть недоступна — имя останется пустым.
    }
    lookup.collections.set(id, name);
  }
  return lookup.collections.get(id) ?? "";
}

async function variable(id: string, lookup: Lookup): Promise<VariableInfo | null> {
  if (!lookup.variables.has(id)) {
    const v = await figma.variables.getVariableByIdAsync(id);
    lookup.variables.set(
      id,
      v ? { key: v.key, name: v.name, collection: await collectionName(v.variableCollectionId, lookup), remote: v.remote } : null,
    );
  }
  return lookup.variables.get(id) ?? null;
}

async function style(id: string, lookup: Lookup): Promise<{ key: string; name: string } | null> {
  if (!lookup.styles.has(id)) {
    const s = await figma.getStyleByIdAsync(id);
    lookup.styles.set(id, s ? { key: s.key, name: s.name } : null);
  }
  return lookup.styles.get(id) ?? null;
}

function solidPaints(value: unknown): SolidPaint[] {
  return Array.isArray(value) ? (value as Paint[]).filter((p): p is SolidPaint => p.type === "SOLID" && p.visible !== false) : [];
}

type Aliases = Record<string, VariableAlias | VariableAlias[] | undefined>;

interface ScreenInfo {
  width: number;
  height: number;
  dark: boolean;
  box: Rect | null;
}

async function visit(node: SceneNode, screen: ScreenInfo, index: ExemplarIndex, lookup: Lookup, root = false): Promise<void> {
  if (!node.visible) return;
  // Только макет: аннотации, пояснения и то, что целиком вне экрана, не считаем.
  if (!root && (isAnnotationName(node.name) || outside(node.absoluteBoundingBox, screen.box))) {
    index.annotationsSkipped++;
    return;
  }
  // Инстанс из кита аннотаций — тоже не макет; проверяем до подсчёта привязок.
  const main = node.type === "INSTANCE" ? await node.getMainComponentAsync() : null;
  const setName = main?.parent?.type === "COMPONENT_SET" ? main.parent.name : "";
  if (main && (isAnnotationName(main.name) || isAnnotationName(setName))) {
    index.annotationsSkipped++;
    return;
  }
  index.nodes++;

  // Привязки переменных.
  const bound = (("boundVariables" in node ? node.boundVariables : undefined) ?? {}) as Aliases;
  for (const [field, value] of Object.entries(bound)) {
    const aliases = Array.isArray(value) ? value : value ? [value] : [];
    const use =
      field === "fills"
        ? fillUse({
            nodeType: node.type,
            width: node.width,
            height: node.height,
            screenWidth: screen.width,
            screenHeight: screen.height,
            insideSmallInstance: false,
          })
        : fieldUse(field);
    for (const alias of aliases) {
      const v = await variable(alias.id, lookup);
      if (!v) continue;
      const entry = (index.variables[v.key] ??= { name: v.name, collection: v.collection, remote: v.remote, light: {}, dark: {} });
      bump<keyof UsageCounts & string>(screen.dark ? entry.dark : entry.light, use);
    }
  }

  // Заливки и обводки без токена и без стиля.
  if ("fills" in node && !("fillStyleId" in node && typeof node.fillStyleId === "string" && node.fillStyleId)) {
    index.unbound.fills += solidPaints(node.fills).filter((p) => !p.boundVariables?.color).length;
  }
  if ("strokes" in node && !("strokeStyleId" in node && node.strokeStyleId)) {
    index.unbound.strokes += solidPaints(node.strokes).filter((p) => !p.boundVariables?.color).length;
  }

  if (node.type === "TEXT") {
    const kase = visibleCase(node.characters, typeof node.textCase === "string" ? node.textCase : "ORIGINAL");
    bump(index.textCases, kase);
    const id = node.textStyleId;
    const s = typeof id === "string" && id ? await style(id, lookup) : null;
    if (s) {
      const entry = (index.textStyles[s.key] ??= {
        name: s.name,
        uses: 0,
        fontSize: typeof node.fontSize === "number" ? node.fontSize : 0,
        cases: {},
      });
      entry.uses++;
      bump(entry.cases, kase);
    } else {
      index.unbound.texts++;
    }
    return;
  }

  if (node.type === "INSTANCE") {
    // Внутрь инстанса не идём: там устройство компонента, а не решения
    // автора образца. Считаем, какой компонент и сколько раз.
    if (main) {
      const set = main.parent?.type === "COMPONENT_SET" ? main.parent : null;
      const key = set ? set.key : main.key;
      const entry = (index.components[key] ??= { name: set ? set.name : main.name, setName: set ? set.name : "", uses: 0, cases: {} });
      entry.uses++;
      // Регистр подписей внутри компонента — то, что агент потерял у кнопок.
      for (const t of node.findAllWithCriteria({ types: ["TEXT"] })) {
        if (t.visible) bump(entry.cases, visibleCase(t.characters, typeof t.textCase === "string" ? t.textCase : "ORIGINAL"));
      }
    }
    return;
  }

  if ("children" in node) for (const child of node.children) await visit(child, screen, index, lookup);
}

export async function indexExemplars(scope: ExemplarScope, report: (done: number, total: number) => void): Promise<ExemplarIndex> {
  const index = emptyIndex();
  const screens = [];
  for (const { node, page } of roots(scope)) {
    const f = await facts(node, page);
    if (classify(f).kind === "screen") screens.push({ node, dark: isDark(f) });
  }
  index.screensFound = screens.length;
  const chosen = sample(screens, EXEMPLAR_LIMIT);
  const lookup: Lookup = { variables: new Map(), collections: new Map(), styles: new Map() };

  const prevSkip = figma.skipInvisibleInstanceChildren;
  figma.skipInvisibleInstanceChildren = true;
  try {
    for (let i = 0; i < chosen.length; i++) {
      const { node, dark } = chosen[i];
      index.screens++;
      if (dark) index.darkScreens++;
      await visit(node, { width: node.width, height: node.height, dark, box: node.absoluteBoundingBox }, index, lookup, true);
      report(i + 1, chosen.length);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  } finally {
    figma.skipInvisibleInstanceChildren = prevSkip;
  }
  return index;
}

export function exemplarStats(index: ExemplarIndex): Record<string, number> {
  return {
    screens: index.screens,
    darkScreens: index.darkScreens,
    usedVariables: Object.keys(index.variables).length,
    usedTextStyles: Object.keys(index.textStyles).length,
    usedComponents: Object.keys(index.components).length,
    annotationsSkipped: index.annotationsSkipped,
  };
}
