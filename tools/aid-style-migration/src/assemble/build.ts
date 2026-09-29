/**
 * Сборка: копии экранов на странице «AID Migration», секция на исходную
 * страницу, строки «было → стало». Исходники не трогаются — на них можно
 * откатиться и с ними сравнить (решение Principal Designer).
 */

import { findOrCreateWorkPage, WORK_PAGE_NAME } from "../lib/workPage";
import { findThemeCollection } from "./collect";
import { COLUMNS, DEFAULT_LAYOUT, layoutRows, type Size } from "./layout";
import type { AssemblePage, AssembleRequest, AssembleRow } from "./types";

/** Метки pluginData. Префикс — чтобы не спутать с чужими ключами. */
export const KEY_SECTION = "sm:section";
const KEY_ROLE = "sm:role";
const KEY_SOURCE = "sm:source";

type Role = "before-light" | "before-dark" | "after-light";

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

async function rowSizes(row: AssembleRow, darkFromTheme: boolean): Promise<Array<Size | null>> {
  const light = await node(row.lightId ?? row.imageId);
  const dark = await node(row.darkId);
  const size = (n: SceneNode | null) => (n ? { width: n.width, height: n.height } : null);
  const beforeDark = dark ?? (darkFromTheme && row.lightId ? light : null);
  const after = row.imageId ? null : (light ?? dark);
  return [size(light), size(beforeDark), size(after), null];
}

function rowName(light: SceneNode | null, dark: SceneNode | null): string {
  const base = (light ?? dark)?.name ?? "—";
  return dark && light ? `${base}  ·  тёмная пара: ${dark.name}` : base;
}

function place(section: SectionNode, source: SceneNode, x: number, y: number, role: Role): SceneNode {
  const copy = source.clone();
  section.appendChild(copy);
  copy.x = x;
  copy.y = y;
  clearOwnData(copy);
  copy.setPluginData(KEY_ROLE, role);
  copy.setPluginData(KEY_SOURCE, source.id);
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
  const sizes = await Promise.all(page.rows.map((r) => rowSizes(r, Boolean(theme))));
  const layout = layoutRows(sizes, DEFAULT_LAYOUT);

  const section = figma.createSection();
  section.name = `Сборка · ${page.pageName}${suffix}`;
  work.appendChild(section);
  section.x = origin.x;
  section.y = origin.y;
  section.resizeWithoutConstraints(layout.width, layout.height);
  section.setPluginData(KEY_SECTION, page.pageId);

  COLUMNS.forEach((title, c) => {
    const label = c === 3 ? `${title} — после перевода` : title;
    text(section, label, layout.columnX[c], DEFAULT_LAYOUT.padding, 32, FONT_MEDIUM);
  });

  for (let i = 0; i < page.rows.length; i++) {
    const row = page.rows[i];
    const geo = layout.rows[i];
    const light = await node(row.lightId ?? row.imageId);
    const dark = await node(row.darkId);

    const label = text(section, rowName(light, dark), layout.columnX[0], geo.labelY, 20, FONT_REGULAR);
    const target = light ?? dark;
    if (target) label.hyperlink = { type: "NODE", value: target.id };

    if (light) place(section, light, layout.columnX[0], geo.y, "before-light");
    if (dark) {
      place(section, dark, layout.columnX[1], geo.y, "before-dark");
    } else if (theme && row.lightId && light) {
      const copy = place(section, light, layout.columnX[1], geo.y, "before-dark");
      copy.setExplicitVariableModeForCollection(theme.collection, theme.darkModeId);
      text(section, `из темы исходника: ${theme.info.darkMode}`, layout.columnX[1], geo.labelY, 16, FONT_REGULAR);
    }
    if (row.imageId) {
      text(section, "картинка — не переводится", layout.columnX[2], geo.labelY, 16, FONT_REGULAR);
    } else if (light ?? dark) {
      place(section, (light ?? dark)!, layout.columnX[2], geo.y, "after-light");
    }
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
