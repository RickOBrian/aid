/**
 * Сборка: секция «ДО · <страница>» на «AID Migration» — копии экранов
 * аккуратными рядами в порядке чтения исходника (flow.ts). Секции «ПОСЛЕ»
 * и «ПОСЛЕ · тёмная тема» строит применение (map/apply.ts) зеркально ей.
 * Исходники не трогаются — на них можно откатиться и с ними сравнить
 * (решение Principal Designer).
 */

import { findOrCreateWorkPage, WORK_PAGE_NAME } from "../lib/workPage";
import { DEFAULT_FLOW, layoutFlow, type Placed } from "./flow";
import type { AssemblePage, AssembleRequest } from "./types";

/** Метки pluginData. Префикс — чтобы не спутать с чужими ключами. */
export const KEY_SECTION = "sm:section";
export const KEY_ROLE = "sm:role";
export const KEY_SOURCE = "sm:source";
/** У настоящей тёмной пары — id исходного светлого экрана: так карта стиля и «ПОСЛЕ» находят двойника. */
export const KEY_PAIR = "sm:pair";
/** Копия — картинка-скриншот: не переводится. */
export const KEY_IMAGE = "sm:image";
/** Секция «ПОСЛЕ» или «ПОСЛЕ · тёмная тема»: значение — id её секции «ДО». */
export const KEY_AFTER = "sm:after";
/** Вид секции «ПОСЛЕ»: светлая или тёмная тема продукта. */
export const KEY_AFTER_KIND = "sm:after-kind";

export type Role = "before-light" | "before-dark";

const FONT_REGULAR: FontName = { family: "Inter", style: "Regular" };
/** Промежуток между секциями на рабочей странице. */
export const SECTION_GAP = 400;

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

export function sectionsOnWorkPage(page: PageNode): SectionNode[] {
  return page.children.filter((n): n is SectionNode => n.type === "SECTION" && n.getPluginData(KEY_SECTION) !== "");
}

/** Секции «ПОСЛЕ» — все или одной секции «ДО». */
export function afterSections(page: PageNode, beforeSectionId?: string): SectionNode[] {
  return page.children.filter(
    (n): n is SectionNode =>
      n.type === "SECTION" && n.getPluginData(KEY_AFTER) !== "" && (!beforeSectionId || n.getPluginData(KEY_AFTER) === beforeSectionId),
  );
}

/** Секции, которые уже собраны из этих страниц, — для вопроса «заменить или добавить». */
export async function existingSections(pages: AssemblePage[]): Promise<string[]> {
  const work = figma.root.children.find((p) => p.name === WORK_PAGE_NAME);
  if (!work) return [];
  await work.loadAsync();
  const ids = new Set(pages.map((p) => p.pageId));
  return sectionsOnWorkPage(work)
    .filter((s) => ids.has(s.getPluginData(KEY_SECTION)))
    .map((s) => s.name);
}

function bottom(page: PageNode): number {
  return page.children.reduce((max, n) => Math.max(max, n.y + n.height), 0);
}

interface Cell {
  source: SceneNode;
  role: Role;
  /** id светлого исходника, если ячейка — его настоящая тёмная пара. */
  pairOf?: string;
  image?: boolean;
}

/** Все экраны строки плана: светлый, его тёмная пара, одиночный тёмный, картинка — каждый на своём месте. */
async function pageCells(page: AssemblePage): Promise<Cell[]> {
  const cells: Cell[] = [];
  for (const row of page.rows) {
    const image = await node(row.imageId);
    const light = await node(row.lightId);
    const dark = await node(row.darkId);
    if (image) cells.push({ source: image, role: "before-light", image: true });
    if (light) cells.push({ source: light, role: "before-light" });
    if (dark) cells.push({ source: dark, role: "before-dark", pairOf: light?.id });
  }
  return cells;
}

function placed(cell: Cell): Placed {
  const box = cell.source.absoluteBoundingBox;
  return { id: cell.source.id, x: box?.x ?? cell.source.x, y: box?.y ?? cell.source.y, width: cell.source.width, height: cell.source.height };
}

function label(section: SectionNode, source: SceneNode, x: number, y: number): void {
  const t = figma.createText();
  t.fontName = FONT_REGULAR;
  t.characters = source.name;
  t.fontSize = 20;
  t.hyperlink = { type: "NODE", value: source.id };
  section.appendChild(t);
  t.x = x;
  t.y = y - DEFAULT_FLOW.labelHeight;
}

async function buildSection(
  work: PageNode,
  page: AssemblePage,
  origin: { x: number; y: number },
  suffix: string,
  progress: () => void,
): Promise<SectionNode> {
  const cells = await pageCells(page);
  const layout = layoutFlow(cells.map(placed));

  const section = figma.createSection();
  section.name = `ДО · ${page.pageName}${suffix}`;
  work.appendChild(section);
  section.x = origin.x;
  section.y = origin.y;
  section.resizeWithoutConstraints(layout.width, layout.height);
  section.setPluginData(KEY_SECTION, page.pageId);

  for (const cell of cells) {
    const pos = layout.positions.get(cell.source.id)!;
    const copy = cell.source.clone();
    section.appendChild(copy);
    copy.x = pos.x;
    copy.y = pos.y;
    clearOwnData(copy);
    copy.setPluginData(KEY_ROLE, cell.role);
    copy.setPluginData(KEY_SOURCE, cell.source.id);
    if (cell.pairOf) copy.setPluginData(KEY_PAIR, cell.pairOf);
    if (cell.image) copy.setPluginData(KEY_IMAGE, "1");
    label(section, cell.source, pos.x, pos.y);
    progress();
    // Отдаём управление Figma, чтобы интерфейс не замирал на больших страницах.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return section;
}

export async function assemble(request: AssembleRequest, report: BuildProgress): Promise<BuildResult> {
  const t0 = Date.now();
  await figma.loadFontAsync(FONT_REGULAR);
  const { page: work } = await findOrCreateWorkPage();
  const existing = sectionsOnWorkPage(work);

  const total = request.pages.reduce((n, p) => n + p.rows.length, 0);
  let done = 0;
  const built: SectionNode[] = [];

  for (const page of request.pages) {
    if (page.rows.length === 0) continue;
    // Секции прошлых страниц этого прогона уже удалены — у удалённой ноды
    // getPluginData бросает («node does not exist»), поэтому их пропускаем.
    const old = existing.filter((s) => !s.removed && s.getPluginData(KEY_SECTION) === page.pageId);
    let origin = { x: 0, y: bottom(work) + (work.children.length ? SECTION_GAP : 0) };
    let suffix = "";
    if (old.length && request.onConflict === "replace") {
      origin = { x: old[0].x, y: old[0].y };
      // «ПОСЛЕ» старой сборки больше не соответствует «ДО» — убираем вместе.
      for (const s of old) {
        for (const a of afterSections(work, s.id)) a.remove();
        s.remove();
      }
    } else if (old.length && request.onConflict === "add") {
      const related = old.flatMap((s) => [s, ...afterSections(work, s.id)]);
      const right = related.reduce((a, b) => (a.x + a.width > b.x + b.width ? a : b));
      origin = { x: right.x + right.width + SECTION_GAP, y: right.y };
      suffix = ` · версия ${old.length + 1}`;
    }
    built.push(
      await buildSection(work, page, origin, suffix, () => {
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
  const ours = [...sectionsOnWorkPage(work), ...afterSections(work)];
  for (const s of ours) s.remove();
  return ours.length;
}
