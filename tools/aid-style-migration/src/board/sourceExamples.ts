/**
 * Элементы переводимого файла по ролям — для «было / стало» на доске
 * вопроса: берём светлые экраны секций «ДО» на странице «AID Migration»,
 * распознаём роли тем же движком, что образцы, и держим по паре примеров
 * на роль с разных экранов.
 */

import { FigmaReader } from "../adapters/figmaNode";
import { KEY_AFTER, KEY_ROLE, KEY_SECTION } from "../assemble/build";
import { walk, type NNode } from "../core/node";
import { detectRoles, type Layer, type Place } from "../core/roles";
import { WORK_PAGE_NAME } from "../lib/workPage";

/** Примеров на роль — два экрана хватает, чтобы увидеть, и не раздувает доску. */
const PER_ROLE = 2;
/** Экранов «ДО» читаем не больше — доска собирается за разумное время. */
const SCREEN_LIMIT = 60;

export interface SourceHit {
  nodeId: string;
  screenId: string;
  screenName: string;
  role: string;
  layer: Layer;
  place: Place;
  /** Во всю ширину экрана — для правил «зависит от ширины». */
  full: boolean;
}

export interface SourceIndex {
  file: string;
  /** `role|layer` → примеры. */
  byRole: Map<string, SourceHit[]>;
}

export async function sourceIndex(report: (title: string) => void): Promise<SourceIndex | null> {
  const work = figma.root.children.find((p) => p.name === WORK_PAGE_NAME);
  if (!work) return null;
  await work.loadAsync();
  const sections = work.children.filter((n): n is SectionNode => n.type === "SECTION" && n.getPluginData(KEY_SECTION) !== "" && n.getPluginData(KEY_AFTER) === "");
  const cells = sections.flatMap((s) => s.children).filter((n) => n.getPluginData(KEY_ROLE) === "before-light").slice(0, SCREEN_LIMIT);
  if (!cells.length) return null;

  const reader = new FigmaReader();
  const byRole = new Map<string, SourceHit[]>();
  const prevSkip = figma.skipInvisibleInstanceChildren;
  figma.skipInvisibleInstanceChildren = true;
  try {
    for (const [i, cell] of cells.entries()) {
      report(`ваш файл: экран ${i + 1} из ${cells.length}`);
      const tree = await reader.read(cell);
      if (!tree) continue;
      const byId = new Map<string, NNode>();
      walk(tree, (n) => {
        byId.set(n.id, n);
      });
      for (const hit of detectRoles(tree).hits) {
        const id = `${hit.key}|${hit.layer}`;
        const list = byRole.get(id) ?? [];
        if (list.length >= PER_ROLE || list.some((x) => x.screenId === cell.id)) continue;
        const n = byId.get(hit.nodeId);
        list.push({
          nodeId: hit.nodeId,
          screenId: cell.id,
          screenName: cell.name,
          role: hit.key,
          layer: hit.layer,
          place: hit.place,
          full: n ? n.width >= tree.width * 0.9 : false,
        });
        byRole.set(id, list);
      }
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  } finally {
    figma.skipInvisibleInstanceChildren = prevSkip;
  }
  return { file: figma.root.name, byRole };
}
