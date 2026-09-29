/**
 * Сборка: копии экранов на странице «AID Migration», секция на исходную
 * страницу, плитка на экран (было и его тёмная пара рядом). Исходники не трогаются — на них можно
 * откатиться и с ними сравнить (решение Principal Designer).
 */

import { findOrCreateWorkPage, WORK_PAGE_NAME } from "../lib/workPage";
import { findThemeCollection } from "./collect";
import { DEFAULT_LAYOUT, layoutTiles } from "./layout";
import type { AssemblePage, AssembleRequest, AssembleRow } from "./types";

/** Метки pluginData. Префикс — чтобы не спутать с чужими ключами. */
export const KEY_SECTION = "sm:section";
export const KEY_ROLE = "sm:role";
export const KEY_SOURCE = "sm:source";
/** У настоящей тёмной пары — id исходного светлого экрана: так карта стиля находит двойника. */
export const KEY_PAIR = "sm:pair";

type Role = "before-light" | "before-dark";

const FONT_REGULAR: FontName = { family: "Inter", style: "Regular" };
const FONT_MEDIUM: FontName = { family: "Inter", style: "Medium" };
/** Промежуток между секциями на рабочей странице. */
const SECTION_GAP = 400;

export interface BuildProgress {
  (done: number, total: number): void;
}

export interface BuildResult {
  sections: number;
  rows: number;
  ms: number;
}

async function node(id: string | undefined): Promise<SceneNode | null> {
  if (!id) return null;
  const n = await figma.getNodeByIdAsync(id);
  return n && n.type !== "DOCUMENT" && n.type !== "PAGE" ? (n as SceneNode) : null;
}

function clearOwnData(copy: SceneNode): void {
  // pluginData копируется при клонировании (проверено на этапе 0).
  for (const key of copy.getPluginDataKeys()) copy.setPluginData(key, "");
}

function text(parent: SectionNode, characters: string, x: number, y: number, size: number, font: FontName): TextNode {
  const t = figma.createText();
  t.fontName = font;
  t.characters = characters;
  t.fontSize = size;
  parent.appendChild(t);
  t.x = x;
  t.y = y;
  return t;
}

async function sectionsOnWorkPage(page: PageNode): Promise<SectionNode[]> {
  return page.children.filter((n): n is SectionNode => n.type === "SECTION" && n.getPluginData(KEY_SECTION) !== "");
}

/** Секции, которые уже собраны из этих страниц, — для вопроса «заменить или добавить». */
export async function existingSections(pages: AssemblePage[]): Promise<string[]> {
  const work = figma.root.children.find((p) => p.name === WORK_PAGE_NAME);
  if (!work) return [];
  await work.loadAsync();
  const ids = new Set(pages.map((p) => p.pageId));
  return (await sectionsOnWorkPage(work)).filter((s) => ids.has(s.getPluginData(KEY_SECTION))).map((s) => s.name);
}

function bottom(page: PageNode): number {
  return page.children.reduce((max, n) => Math.max(max, n.y + n.height), 0);
}

interface Cell {
  source: SceneNode;
  role: Role;
  caption: string;
  /** Коллекция и режим, если ячейка — копия в тёмном режиме темы исходника. */
  mode?: { collection: VariableCollection; modeId: string };
  /** id светлого исходника, если ячейка — его настоящая тёмная пара. */
  pairOf?: string;
}

type Theme = Awaited<ReturnType<typeof findThemeCollection>>;

/**
 * Ячейки плитки. На этапе 1 — только «было»: копии «стало» появятся, когда
 * будет перевод (замечание Principal Designer: одинаковые «было» и
 * «стало» и пустая колонка вводят в заблуждение и удваивают объём).
 */
async function rowCells(row: AssembleRow, theme: Theme): Promise<Cell[]> {
  const cells: Cell[] = [];
  const image = await node(row.imageId);
  const light = await node(row.lightId);
  const dark = await node(row.darkId);
  if (image) cells.push({ source: image, role: "before-light", caption: "Было · картинка" });
  if (light) cells.push({ source: light, role: "before-light", caption: "Было" });
  if (dark) {
    cells.push({ source: dark, role: "before-dark", caption: "Было · тёмная", pairOf: light?.id });
  } else if (light && theme) {
    cells.push({
      source: light,
      role: "before-dark",
      caption: `Было · тёмная — из темы исходника (${theme.info.darkMode})`,
      mode: { collection: theme.collection, modeId: theme.darkModeId },
    });
  }
  return cells;
}

function place(section: SectionNode, cell: Cell, x: number, y: number): SceneNode {
  const copy = cell.source.clone();
  section.appendChild(copy);
  copy.x = x;
  copy.y = y;
  clearOwnData(copy);
  copy.setPluginData(KEY_ROLE, cell.role);
  copy.setPluginData(KEY_SOURCE, cell.source.id);
  if (cell.mode) copy.setExplicitVariableModeForCollection(cell.mode.collection, cell.mode.modeId);
  if (cell.pairOf) copy.setPluginData(KEY_PAIR, cell.pairOf);
  return copy;
}

async function buildSection(
  work: PageNode,
  page: AssemblePage,
  request: AssembleRequest,
  origin: { x: number; y: number },
  suffix: string,
  progress: () => void,
): Promise<SectionNode> {
  const theme = request.darkFromTheme ? await findThemeCollection() : null;
  const rows = await Promise.all(page.rows.map((r) => rowCells(r, theme)));
  const layout = layoutTiles(
    rows.map((cells) => cells.map((c) => ({ width: c.source.width, height: c.source.height }))),
    DEFAULT_LAYOUT,
  );

  const section = figma.createSection();
  section.name = `Сборка · ${page.pageName}${suffix}`;
  work.appendChild(section);
  section.x = origin.x;
  section.y = origin.y;
  section.resizeWithoutConstraints(layout.width, layout.height);
  section.setPluginData(KEY_SECTION, page.pageId);

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i];
    const tile = layout.tiles[i];
    if (cells.length === 0) continue;

    const main = cells[0].source;
    const name = text(section, main.name, tile.x, tile.y, 24, FONT_MEDIUM);
    name.hyperlink = { type: "NODE", value: main.id };
    cells.forEach((cell, c) => {
      text(section, cell.caption, tile.cellX[c], tile.y + 44, 16, FONT_REGULAR);
      place(section, cell, tile.cellX[c], tile.cellY);
    });

    progress();
    // Отдаём управление Figma, чтобы интерфейс не замирал на больших страницах.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return section;
}

export async function assemble(request: AssembleRequest, report: BuildProgress): Promise<BuildResult> {
  const t0 = Date.now();
  await Promise.all([figma.loadFontAsync(FONT_REGULAR), figma.loadFontAsync(FONT_MEDIUM)]);
  const { page: work } = await findOrCreateWorkPage();
  const existing = await sectionsOnWorkPage(work);

  const total = request.pages.reduce((n, p) => n + p.rows.length, 0);
  let done = 0;
  const built: SectionNode[] = [];

  for (const page of request.pages) {
    if (page.rows.length === 0) continue;
    const old = existing.filter((s) => s.getPluginData(KEY_SECTION) === page.pageId);
    let origin = { x: 0, y: bottom(work) + (work.children.length ? SECTION_GAP : 0) };
    let suffix = "";
    if (old.length && request.onConflict === "replace") {
      origin = { x: old[0].x, y: old[0].y };
      for (const s of old) s.remove();
    } else if (old.length && request.onConflict === "add") {
      const right = old.reduce((a, b) => (a.x + a.width > b.x + b.width ? a : b));
      origin = { x: right.x + right.width + SECTION_GAP, y: right.y };
      suffix = ` · версия ${old.length + 1}`;
    }
    built.push(
      await buildSection(work, page, request, origin, suffix, () => {
        done++;
        report(done, total);
      }),
    );
  }

  if (built.length) {
    await figma.setCurrentPageAsync(work);
    figma.viewport.scrollAndZoomIntoView(built);
  }
  return { sections: built.length, rows: total, ms: Date.now() - t0 };
}

/** Убрать всё, что собрал плагин, со страницы «AID Migration». Исходники не затрагиваются. */
export async function disassemble(): Promise<number> {
  const work = figma.root.children.find((p) => p.name === WORK_PAGE_NAME);
  if (!work) return 0;
  await work.loadAsync();
  const ours = await sectionsOnWorkPage(work);
  for (const s of ours) s.remove();
  return ours.length;
}
