/**
 * Сканирование области: какие ноды — экраны, какие — картинки, какие
 * пропущены и почему; тёмные пары; коллекция темы исходника.
 * Документ не меняет.
 */

import { hasDarkWord } from "../lib/vocabulary";
import { WORK_PAGE_NAME } from "../lib/workPage";
import { findDarkPairs, isDark, relativeLuminance, type ScreenFacts } from "./darkPairs";
import { classify } from "./screens";
import type { ScanItem, ScanPage, ScanResult, ScanScope, SkippedItem, ThemeCollectionInfo } from "./types";

/** Сколько пропущенных показывать поимённо — остальное числом. */
const SKIPPED_LIMIT = 200;

export interface Root {
  node: SceneNode;
  page: PageNode;
}

export function expand(node: SceneNode, page: PageNode, out: Root[]): void {
  if (node.type === "SECTION") {
    for (const child of node.children) expand(child, page, out);
  } else {
    out.push({ node, page });
  }
}

async function collectRoots(scope: ScanScope): Promise<Root[]> {
  const roots: Root[] = [];
  if (scope.kind === "selection") {
    const page = figma.currentPage;
    for (const node of page.selection) expand(node, page, roots);
    return roots;
  }
  for (const id of scope.pageIds) {
    const page = await figma.getNodeByIdAsync(id);
    if (!page || page.type !== "PAGE" || page.name === WORK_PAGE_NAME) continue;
    await page.loadAsync();
    for (const node of page.children) expand(node, page, roots);
  }
  return roots;
}

function visiblePaints(node: SceneNode): Paint[] {
  if (!("fills" in node) || !Array.isArray(node.fills)) return [];
  return (node.fills as Paint[]).filter((p) => p.visible !== false);
}

async function backgroundLuminance(node: SceneNode): Promise<number | null> {
  const solid = visiblePaints(node).find((p): p is SolidPaint => p.type === "SOLID");
  if (!solid) return null;
  let color: RGB = solid.color;
  const alias = solid.boundVariables?.color;
  if (alias) {
    const variable = await figma.variables.getVariableByIdAsync(alias.id);
    const value = variable?.resolveForConsumer(node).value;
    if (value && typeof value === "object" && "r" in value) color = value as RGB;
  }
  return relativeLuminance(color.r, color.g, color.b);
}

export async function facts(node: SceneNode, page: PageNode): Promise<ScreenFacts> {
  const children = "children" in node ? node.children : [];
  const paints = visiblePaints(node);
  const box = node.absoluteBoundingBox;
  return {
    id: node.id,
    name: node.name,
    type: node.type,
    width: node.width,
    height: node.height,
    visible: node.visible,
    childTypes: children.map((c) => c.type),
    imageOnly: children.length === 0 && paints.length > 0 && paints.every((p) => p.type === "IMAGE"),
    pageId: page.id,
    x: box ? box.x : node.x,
    y: box ? box.y : node.y,
    bgLuminance: await backgroundLuminance(node),
  };
}

type ThemeCollection = { collection: VariableCollection; info: ThemeCollectionInfo; darkModeId: string };

/**
 * Коллекции, переменные которых реально привязаны на экранах, — с числом
 * привязок. Исходник может жить на библиотечных переменных, а не на
 * локальных (Flot Tasks: `tx-*` из библиотеки, «Было · тёмная» из
 * локальной коллекции ничем не отличалась от светлой).
 */
export async function usedCollections(screens: SceneNode[], nodeLimit = 3000): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  const collectionOf = new Map<string, string | null>();
  let seen = 0;
  for (const screen of screens) {
    const nodes = "findAll" in screen ? [screen, ...screen.findAll()] : [screen];
    for (const n of nodes) {
      if (++seen > nodeLimit) return counts;
      const bound = ("boundVariables" in n ? n.boundVariables : undefined) as Record<string, VariableAlias | VariableAlias[] | undefined> | undefined;
      for (const value of Object.values(bound ?? {})) {
        for (const alias of Array.isArray(value) ? value : value ? [value] : []) {
          if (!collectionOf.has(alias.id)) {
            const v = await figma.variables.getVariableByIdAsync(alias.id);
            collectionOf.set(alias.id, v ? v.variableCollectionId : null);
          }
          const c = collectionOf.get(alias.id);
          if (c) counts.set(c, (counts.get(c) ?? 0) + 1);
        }
      }
    }
  }
  return counts;
}

/**
 * Коллекция темы исходника: режимы «светлый / тёмный». Кандидаты —
 * коллекции, реально используемые на экранах (в том числе библиотечные),
 * и локальные; выигрывает самая используемая, при равенстве — самая
 * большая.
 */
export async function findThemeCollection(used: Map<string, number> = new Map()): Promise<ThemeCollection | null> {
  const candidates = new Map<string, VariableCollection>();
  for (const c of await figma.variables.getLocalVariableCollectionsAsync()) candidates.set(c.id, c);
  for (const id of used.keys()) {
    if (candidates.has(id)) continue;
    try {
      const c = await figma.variables.getVariableCollectionByIdAsync(id);
      if (c) candidates.set(id, c);
    } catch {
      // коллекция недоступна — пропускаем
    }
  }
  let best: ThemeCollection | null = null;
  let bestScore = -1;
  for (const collection of candidates.values()) {
    const dark = collection.modes.find((m) => hasDarkWord(m.name));
    const light = collection.modes.find((m) => !hasDarkWord(m.name));
    if (!dark || !light) continue;
    const score = (used.get(collection.id) ?? 0) * 1000 + collection.variableIds.length;
    if (score > bestScore) {
      bestScore = score;
      best = { collection, info: { name: collection.name, lightMode: light.name, darkMode: dark.name }, darkModeId: dark.modeId };
    }
  }
  return best;
}

/** Последний скан: факты по id — для пар и сборки. */
export const lastScan = new Map<string, ScreenFacts>();

export async function scan(scope: ScanScope): Promise<ScanResult> {
  lastScan.clear();
  const roots = await collectRoots(scope);
  const byPage = new Map<string, ScanPage>();
  const skipped: SkippedItem[] = [];
  let skippedTotal = 0;
  const screens: ScreenFacts[] = [];

  for (const { node, page } of roots) {
    const f = await facts(node, page);
    const verdict = classify(f);
    if (verdict.kind === "skip") {
      skippedTotal++;
      if (skipped.length < SKIPPED_LIMIT) skipped.push({ pageName: page.name, name: node.name, reason: verdict.reason });
      continue;
    }
    lastScan.set(f.id, f);
    if (verdict.kind === "screen") screens.push(f);
    let entry = byPage.get(page.id);
    if (!entry) {
      entry = { pageId: page.id, pageName: page.name, items: [] };
      byPage.set(page.id, entry);
    }
    const item: ScanItem = {
      id: f.id,
      name: f.name,
      width: Math.round(f.width),
      height: Math.round(f.height),
      kind: verdict.kind,
      dark: verdict.kind === "screen" && isDark(f),
    };
    entry.items.push(item);
  }

  const pairs = findDarkPairs(screens);
  for (const page of byPage.values()) {
    for (const item of page.items) {
      const pair = pairs.find((p) => p.darkId === item.id);
      if (pair) {
        item.pairedWith = pair.lightId;
        item.pairReason = pair.reason;
      }
    }
    // Порядок чтения макета: сверху вниз, слева направо.
    page.items.sort((a, b) => {
      const fa = lastScan.get(a.id)!;
      const fb = lastScan.get(b.id)!;
      return Math.abs(fa.y - fb.y) > 40 ? fa.y - fb.y : fa.x - fb.x;
    });
  }

  const sampled = await Promise.all(screens.slice(0, 5).map((f) => figma.getNodeByIdAsync(f.id)));
  const used = await usedCollections(sampled.filter((n): n is SceneNode => Boolean(n) && n!.type !== "PAGE" && n!.type !== "DOCUMENT"));
  const theme = await findThemeCollection(used);
  return { pages: [...byPage.values()], skipped, skippedTotal, themeCollection: theme ? theme.info : null };
}

/** Две выделенные на канвасе ноды из скана → пара; тёмная — по признакам или по фону. */
export function pairFromSelection(): { lightId: string; darkId: string } | { error: string } {
  const selected = figma.currentPage.selection.filter((n) => lastScan.has(n.id));
  if (selected.length !== 2) return { error: "Выделите на канвасе ровно два найденных экрана" };
  const [a, b] = selected.map((n) => lastScan.get(n.id)!);
  const aDark = isDark(a);
  const bDark = isDark(b);
  let dark = b;
  if (aDark && !bDark) dark = a;
  else if (aDark === bDark) dark = (a.bgLuminance ?? 1) <= (b.bgLuminance ?? 1) ? a : b;
  const light = dark === a ? b : a;
  return { lightId: light.id, darkId: dark.id };
}

/** Превью экрана для списка в UI. */
export async function thumbnail(id: string): Promise<string | null> {
  const node = await figma.getNodeByIdAsync(id);
  if (!node || !("exportAsync" in node)) return null;
  try {
    const bytes = await node.exportAsync({ format: "PNG", constraint: { type: "WIDTH", value: 72 } });
    return figma.base64Encode(bytes);
  } catch {
    return null;
  }
}
