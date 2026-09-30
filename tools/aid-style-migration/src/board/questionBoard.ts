/**
 * Доски вопросов на странице «AID · Язык продукта» (решение Б): канвас
 * показывает подробно, плагин принимает решения. На доску — вопрос,
 * объяснение, по каждому варианту — цвет в светлой и тёмной теме, доля,
 * подписи и примеры из образцов крупно.
 *
 * Страница пересобирается целиком: доски плагина помечены pluginData и
 * заменяются; всё остальное на странице (комментарии, заметки людей) не
 * трогаем.
 */

import { type Answer, isOpen, type Question } from "../core/questions";
import type { RuleValue } from "../core/language";
import { roleLabel } from "../core/roleLabels";
import { LANGUAGE_PAGE_NAME } from "../lib/workPage";

const KEY_BOARD = "sm:board";
const BOARD_WIDTH = 1280;
const PAD = 40;
const GAP = 120;
const CARD_WIDTH = 300;
const IMAGE_WIDTH = CARD_WIDTH - 32;

const INK = { r: 0.11, g: 0.11, b: 0.12 };
const MUTED = { r: 0.42, g: 0.42, b: 0.45 };
const CARD = { r: 0.96, g: 0.96, b: 0.97 };
const OPEN = { r: 1, g: 0.95, b: 0.8 };
const DONE = { r: 0.88, g: 0.96, b: 0.9 };

interface Fonts {
  regular: FontName;
  bold: FontName;
}

async function loadFonts(): Promise<Fonts> {
  const pairs: Array<[FontName, FontName]> = [
    [
      { family: "Inter", style: "Regular" },
      { family: "Inter", style: "Semi Bold" },
    ],
    [
      { family: "Roboto", style: "Regular" },
      { family: "Roboto", style: "Medium" },
    ],
  ];
  for (const [regular, bold] of pairs) {
    try {
      await figma.loadFontAsync(regular);
      await figma.loadFontAsync(bold);
      return { regular, bold };
    } catch {
      // нет шрифта — следующий
    }
  }
  throw new Error("Нет шрифта Inter или Roboto для доски вопросов");
}

function rgb(hex: string): RGB | null {
  const m = /^#?([0-9a-f]{6})/i.exec(hex);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

function stack(mode: "VERTICAL" | "HORIZONTAL", name: string, gap: number, fill?: RGB): FrameNode {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = mode;
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.itemSpacing = gap;
  f.fills = fill ? [{ type: "SOLID", color: fill }] : [];
  f.clipsContent = false;
  return f;
}

function column(name: string, gap: number, fill?: RGB): FrameNode {
  return stack("VERTICAL", name, gap, fill);
}

function row(name: string, gap: number): FrameNode {
  return stack("HORIZONTAL", name, gap);
}

function text(parent: FrameNode, characters: string, fonts: Fonts, opts: { size?: number; bold?: boolean; color?: RGB; width?: number } = {}): TextNode {
  const t = figma.createText();
  t.fontName = opts.bold ? fonts.bold : fonts.regular;
  t.fontSize = opts.size ?? 14;
  t.characters = characters;
  t.fills = [{ type: "SOLID", color: opts.color ?? INK }];
  parent.appendChild(t);
  if (opts.width) {
    t.resize(opts.width, t.height);
    t.textAutoResize = "HEIGHT";
  }
  return t;
}

function swatch(parent: FrameNode, hex: string | undefined, caption: string, fonts: Fonts): void {
  const box = column(caption, 6);
  const r = figma.createRectangle();
  r.resize(128, 56);
  r.cornerRadius = 8;
  const color = hex ? rgb(hex) : null;
  if (color) {
    r.fills = [{ type: "SOLID", color }];
    r.strokes = [{ type: "SOLID", color: MUTED, opacity: 0.25 }];
  } else {
    r.fills = [];
    r.strokes = [{ type: "SOLID", color: MUTED }];
    r.dashPattern = [4, 4];
  }
  r.strokeWeight = 1;
  box.appendChild(r);
  text(box, `${caption} · ${hex ?? "нет в образцах"}`, fonts, { size: 12, color: MUTED });
  parent.appendChild(box);
}

async function image(parent: FrameNode, png: Uint8Array): Promise<void> {
  const img = figma.createImage(png);
  const { width, height } = await img.getSizeAsync();
  const scale = Math.min(1, IMAGE_WIDTH / width);
  const r = figma.createRectangle();
  r.name = "Пример из образцов";
  r.resize(Math.max(1, Math.round(width * scale)), Math.max(1, Math.round(height * scale)));
  r.cornerRadius = 6;
  r.fills = [{ type: "IMAGE", imageHash: img.hash, scaleMode: "FIT" }];
  parent.appendChild(r);
}

async function valueCard(v: RuleValue, total: number, fonts: Fonts, thumb: (nodeId: string) => Promise<Uint8Array | null>): Promise<FrameNode> {
  const card = column(v.token?.name ?? v.hex, 12, CARD);
  card.paddingTop = card.paddingBottom = card.paddingLeft = card.paddingRight = 16;
  card.cornerRadius = 12;
  card.resize(CARD_WIDTH, card.height);
  card.primaryAxisSizingMode = "AUTO";
  card.counterAxisSizingMode = "FIXED";
  text(card, v.token ? v.token.name : `${v.hex} · без токена`, fonts, { size: 16, bold: true, width: IMAGE_WIDTH });
  if (total > 0) {
    const where = Object.entries(v.features?.place ?? {})
      .sort((a, b) => b[1] - a[1])
      .map(([k, n]) => `${PLACE[k] ?? k} ${n}`)
      .join(", ");
    text(card, `${v.count} из ${total} · ${Math.round((v.count / total) * 100)} %${where ? ` · ${where}` : ""}`, fonts, { size: 13, color: MUTED, width: IMAGE_WIDTH });
  }
  const swatches = row("Светлая и тёмная", 12);
  swatch(swatches, v.hexLight, "Светлая", fonts);
  swatch(swatches, v.hexDark, "Тёмная", fonts);
  card.appendChild(swatches);
  if (v.labels?.length) text(card, v.labels.map((l) => `«${l}»`).join(", "), fonts, { size: 13, width: IMAGE_WIDTH });
  for (const ex of v.examples ?? []) {
    const png = await thumb(ex.nodeId);
    if (png) await image(card, png);
  }
  return card;
}

const PLACE: Record<string, string> = { screen: "на экране", sheet: "в шторке", modal: "в модалке", card: "в карточке" };

async function questionFrame(
  q: Question,
  n: number,
  total: number,
  answer: Answer | undefined,
  open: boolean,
  fonts: Fonts,
  thumb: (nodeId: string) => Promise<Uint8Array | null>,
): Promise<FrameNode> {
  const f = column(`Вопрос ${n} · ${roleLabel(q.role)}`, 16, { r: 1, g: 1, b: 1 });
  f.paddingTop = f.paddingBottom = f.paddingLeft = f.paddingRight = PAD;
  f.cornerRadius = 16;
  f.resize(BOARD_WIDTH, f.height);
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "FIXED";
  f.setPluginData(KEY_BOARD, q.id);

  const status = row("Статус", 8);
  status.fills = [{ type: "SOLID", color: open ? OPEN : DONE }];
  status.cornerRadius = 6;
  status.paddingTop = status.paddingBottom = 4;
  status.paddingLeft = status.paddingRight = 10;
  const chosen = answer ? q.options.find((o) => o.id === answer.optionId)?.label ?? answer.note : undefined;
  text(status, open ? `Нужно ваше решение · вопрос ${n} из ${total}` : `Решено: ${chosen ?? ""}`, fonts, { size: 13, bold: true });
  f.appendChild(status);

  const inner = BOARD_WIDTH - PAD * 2;
  text(f, q.title, fonts, { size: 28, bold: true, width: inner });
  for (const line of q.lines) text(f, line, fonts, { size: 16, width: inner });

  const values: RuleValue[] = q.values.length
    ? q.values
    : q.options
        .filter((o) => o.kind === "value" && o.value)
        .map((o) => ({ ...o.value!, count: 0, light: 0, dark: 0, examples: [], features: {}, labels: [] }) as RuleValue);
  if (values.length) {
    text(f, q.values.length ? "Как это в образцах" : "Подходящие токены библиотеки", fonts, { size: 18, bold: true, width: inner });
    const cards = row("Варианты", 24);
    const totalCount = q.values.reduce((s, v) => s + v.count, 0);
    for (const v of values) cards.appendChild(await valueCard(v, totalCount, fonts, thumb));
    f.appendChild(cards);
    cards.layoutSizingHorizontal = "FILL";
    cards.layoutWrap = "WRAP";
    cards.counterAxisSpacing = 24;
  }

  text(f, "Варианты ответа", fonts, { size: 18, bold: true, width: inner });
  q.options.forEach((o, i) => text(f, `${i + 1}. ${o.label}`, fonts, { size: 15, width: inner }));
  text(f, "Свой вариант — заметкой. Отвечать — в окне плагина: «⚙ Продукт» → «Язык продукта».", fonts, { size: 13, color: MUTED, width: inner });
  return f;
}

async function languagePage(): Promise<PageNode> {
  const existing = figma.root.children.find((p) => p.name === LANGUAGE_PAGE_NAME);
  if (existing) {
    await existing.loadAsync();
    return existing;
  }
  const page = figma.createPage();
  page.name = LANGUAGE_PAGE_NAME;
  return page;
}

/**
 * Собрать доски: открытые вопросы — первыми, решённые — ниже. Вернуть
 * к просмотру доску `focusId` или первую открытую.
 */
export async function buildBoard(
  productName: string,
  questions: Question[],
  answers: Record<string, Answer>,
  thumb: (nodeId: string) => Promise<Uint8Array | null>,
  focusId: string | null,
  report: (title: string) => void,
): Promise<void> {
  const fonts = await loadFonts();
  const page = await languagePage();
  for (const n of [...page.children]) if (n.getPluginData(KEY_BOARD)) n.remove();

  const header = column(`Язык продукта · ${productName}`, 8);
  header.setPluginData(KEY_BOARD, "header");
  text(header, `Язык продукта · ${productName}`, fonts, { size: 40, bold: true });
  const open = questions.filter((q) => isOpen(q, answers)).length;
  text(header, `Вопросов: ${questions.length}, нужно решение: ${open}. Доски пересобираются из плагина — правки здесь не сохранятся, комментарии оставляйте рядом.`, fonts, {
    size: 16,
    color: MUTED,
    width: BOARD_WIDTH,
  });
  page.appendChild(header);

  let y = header.height + GAP / 2;
  let focus: FrameNode | null = null;
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    report(`доска ${i + 1} из ${questions.length}`);
    const isOpenQ = isOpen(q, answers);
    const f = await questionFrame(q, i + 1, questions.length, answers[q.id], isOpenQ, fonts, thumb);
    page.appendChild(f);
    f.x = 0;
    f.y = y;
    y += f.height + GAP;
    if (q.id === focusId || (!focusId && !focus && isOpenQ)) focus = focus ?? f;
    if (q.id === focusId) focus = f;
  }
  await figma.setCurrentPageAsync(page);
  const target = focus ?? header;
  figma.viewport.scrollAndZoomIntoView([target]);
}
