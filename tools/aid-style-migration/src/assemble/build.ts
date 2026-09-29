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
/** Ячейка — картинка-скриншот: «Стало» для неё не строится. */
export const KEY_IMAGE = "sm:image";
/** Ячейка «Стало · тёмная» — копия «Стало · светлая», её место в плитке. */
export const KEY_SLOT = "sm:slot";

export type Role = "before-light" | "before-dark" | "after-light" | "after-dark";

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
  image?: boolean;
  /** Только место и подпись: копию положит применение (этап 3b). */
  slot?: boolean;
}

type Theme = Awaited<ReturnType<typeof findThemeCollection>>;

/**
 * Ячейки плитки. На этапе 1 — только «было»: копии «стало» появятся, когда
 * будет перевод (замечание Principal Designer: одинаковые «было» и
 * «стало» и пустая колонка вводят в заблуждение и удваивают объём).
 */
async function rowCells(row: AssembleRow, theme: Theme, withAfter: boolean): Promise<Cell[]> {
  const cells: Cell[] = [];
  const image = await node(row.imageId);
  const light = await node(row.lightId);
  const dark = await node(row.darkId);
  if (image) cells.push({ source: image, role: "before-light", caption: "Было · картинка", image: true });
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
  const base = light ?? dark;
  if (withAfter && base && !image) {
    cells.push({ source: base, role: "after-light", caption: "Стало · светлая" });
    cells.push({ source: base, role: "after-dark", caption: "Стало · тёмная", slot: true });
  }
  return cells;
}

function place(section: SectionNode, cell: Cell, x: number, y: number): SceneNode | null {
  if (cell.slot) return null;
  const copy = cell.source.clone();
  section.appendChild(copy);
  copy.x = x;
  copy.y = y;
  clearOwnData(copy);
  copy.setPluginData(KEY_ROLE, cell.role);
  copy.setPluginData(KEY_SOURCE, cell.source.id);
  if (cell.mode) copy.setExplicitVariableModeForCollection(cell.mode.collection, cell.mode.modeId);
  if (cell.pairOf) copy.setPluginData(KEY_PAIR, cell.pairOf);
  if (cell.image) copy.setPluginData(KEY_IMAGE, "1");
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
  const rows = await Promise.all(page.rows.map((r) => rowCells(r, theme, Boolean(request.withAfter))));
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

/**
 * План строк из уже собранной страницы — чтобы пересобрать с «Стало», не
 * повторяя поиск экранов. Исходники берутся по меткам копий.
 */
export async function plannedFromWorkPage(): Promise<{ pages: AssemblePage[]; darkFromTheme: boolean }> {
  const work = figma.root.children.find((p) => p.name === WORK_PAGE_NAME);
  if (!work) return { pages: [], darkFromTheme: false };
  await work.loadAsync();
  let darkFromTheme = false;
  const pages: AssemblePage[] = [];
  const seen = new Set<string>();
  for (const section of await sectionsOnWorkPage(work)) {
    // Несколько версий одной страницы — берём первую: пересборка заменит все.
    if (seen.has(section.getPluginData(KEY_SECTION))) continue;
    seen.add(section.getPluginData(KEY_SECTION));
    const cells = section.children.filter((n) => n.getPluginData(KEY_ROLE));
    const lights = cells.filter((n) => n.getPluginData(KEY_ROLE) === "before-light");
    const lightSources = new Set(lights.map((n) => n.getPluginData(KEY_SOURCE)));
    const pairs = new Map(cells.filter((n) => n.getPluginData(KEY_PAIR)).map((n) => [n.getPluginData(KEY_PAIR), n.getPluginData(KEY_SOURCE)]));
    const rows: AssembleRow[] = lights.map((n) => {
      const id = n.getPluginData(KEY_SOURCE);
      return n.getPluginData(KEY_IMAGE) ? { imageId: id } : { lightId: id, darkId: pairs.get(id) };
    });
    for (const n of cells.filter((c) => c.getPluginData(KEY_ROLE) === "before-dark")) {
      const source = n.getPluginData(KEY_SOURCE);
      if (lightSources.has(source)) darkFromTheme = true; // копия светлого в тёмном режиме темы исходника
      else if (!n.getPluginData(KEY_PAIR)) rows.push({ darkId: source }); // тёмный без пары
    }
    // Порядок — как на странице: сверху вниз, слева направо.
    const pos = new Map(cells.map((n) => [n.getPluginData(KEY_SOURCE), n]));
    rows.sort((a, b) => {
      const na = pos.get(a.lightId ?? a.imageId ?? a.darkId ?? "");
      const nb = pos.get(b.lightId ?? b.imageId ?? b.darkId ?? "");
      if (!na || !nb) return 0;
      return Math.abs(na.y - nb.y) > 40 ? na.y - nb.y : na.x - nb.x;
    });
    pages.push({ pageId: section.getPluginData(KEY_SECTION), pageName: section.name.replace(/^Сборка · /, "").replace(/ · версия \d+$/, ""), rows });
  }
  return { pages, darkFromTheme };
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
