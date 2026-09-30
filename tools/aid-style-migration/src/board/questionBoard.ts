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
import type { Example, RuleValue } from "../core/language";
import type { Layer } from "../core/roles";
import { roleLabel } from "../core/roleLabels";
import { LANGUAGE_PAGE_NAME } from "../lib/workPage";

const KEY_BOARD = "sm:board";
const BOARD_WIDTH = 1280;
const PAD = 40;
const GAP = 120;
const CARD_WIDTH = 580;
const IMAGE_WIDTH = CARD_WIDTH - 32;
const MARK = { r: 1, g: 0.23, b: 0.19 };

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Пример, снятый с канваса: элемент в окружении и мини-экран, с рамками. */
interface Shot {
  png: Uint8Array;
  box: Box;
  screen: Uint8Array | null;
  screenBox: Box;
}

/** Длинная сторона картинки окружения, px; мельче — текст не читается. */
const CROP_SIZE = 320;
const SHOT_WIDTH = 120;

/**
 * Картинки примеров снимаем при сборке доски, а не храним: 5 МБ
 * clientStorage на плагин не хватило (2026-09-30). Id узлов действуют
 * только в файле образцов — в другом файле пример не снимается.
 */
class Camera {
  private screens = new Map<string, Uint8Array | null>();
  /** Файлы образцов, примеры из которых здесь не снять. */
  readonly elsewhere = new Set<string>();

  /** Окружение: поднимаемся, пока элемент мельче строки или карточки, не выше 5 уровней и не до экрана. */
  private context(node: SceneNode, screenId: string): SceneNode {
    let n: SceneNode = node;
    for (let i = 0; i < 5 && (n.width < 160 || n.height < 48); i++) {
      const p = n.parent;
      if (!p || p.type === "PAGE" || p.type === "DOCUMENT" || p.type === "SECTION" || p.id === screenId) break;
      n = p as SceneNode;
    }
    return n;
  }

  private async screen(node: SceneNode): Promise<Uint8Array | null> {
    if (!this.screens.has(node.id)) {
      let jpg: Uint8Array | null = null;
      try {
        jpg = await node.exportAsync({ format: "JPG", constraint: { type: "WIDTH", value: SHOT_WIDTH } });
      } catch {
        // экран не отрисовался — пример без мини-экрана
      }
      this.screens.set(node.id, jpg);
    }
    return this.screens.get(node.id) ?? null;
  }

  async take(ex: Example): Promise<Shot | null> {
    if (ex.file && ex.file !== figma.root.name) {
      this.elsewhere.add(ex.file);
      return null;
    }
    const node = await figma.getNodeByIdAsync(ex.nodeId);
    const screen = await figma.getNodeByIdAsync(ex.screenId);
    if (!node || !screen || node.type === "PAGE" || node.type === "DOCUMENT" || screen.type === "PAGE" || screen.type === "DOCUMENT") return null;
    const el = node as SceneNode;
    const scr = screen as SceneNode;
    const target = this.context(el, scr.id);
    const bounds = ("absoluteRenderBounds" in target ? target.absoluteRenderBounds : null) ?? target.absoluteBoundingBox;
    const own = el.absoluteBoundingBox;
    const sb = scr.absoluteBoundingBox;
    if (!bounds || !own || !sb) return null;
    const scale = Math.min(1.5, CROP_SIZE / Math.max(bounds.width, bounds.height));
    try {
      const png = await target.exportAsync({ format: "PNG", constraint: { type: "SCALE", value: scale } });
      return { png, box: rel(own, bounds, scale), screen: await this.screen(scr), screenBox: rel(own, sb, SHOT_WIDTH / sb.width) };
    } catch {
      return null;
    }
  }
}

function rel(inner: Rect, outer: Rect, scale: number): Box {
  return { x: (inner.x - outer.x) * scale, y: (inner.y - outer.y) * scale, w: inner.width * scale, h: inner.height * scale };
}

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

/** Прозрачность из #RRGGBBAA; нет — 1. */
function alpha(hex: string): number {
  const m = /^#?[0-9a-f]{6}([0-9a-f]{2})$/i.exec(hex);
  return m ? parseInt(m[1], 16) / 255 : 1;
}

function paint(hex: string): SolidPaint | null {
  const color = rgb(hex);
  return color ? { type: "SOLID", color, opacity: alpha(hex) } : null;
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

/**
 * Как выглядит значение на настоящем фоне, в одной теме: текст — надписью
 * этим цветом, иконка — кружком, заливка — плашкой. Фон — поверхность, на
 * которой значение чаще всего лежит в образцах этой темы.
 */
function specimen(parent: FrameNode, layer: Layer, hex: string | undefined, surface: string | undefined, sample: string, caption: string, fonts: Fonts): void {
  const box = column(caption, 6);
  const bg = figma.createFrame();
  bg.name = `Образец · ${caption}`;
  bg.resize((IMAGE_WIDTH - 16) / 2, 72);
  bg.cornerRadius = 10;
  const surfacePaint = surface ? paint(surface) : null;
  bg.fills = surfacePaint ? [surfacePaint] : [];
  bg.strokes = [{ type: "SOLID", color: MUTED, opacity: 0.25 }];
  bg.layoutMode = "HORIZONTAL";
  bg.primaryAxisAlignItems = "CENTER";
  bg.counterAxisAlignItems = "CENTER";
  bg.primaryAxisSizingMode = "FIXED";
  bg.counterAxisSizingMode = "FIXED";
  const p = hex ? paint(hex) : null;
  if (!p) {
    bg.dashPattern = [4, 4];
    text(bg, "в образцах этой темы нет", fonts, { size: 12, color: MUTED });
  } else if (layer === "text") {
    const t = text(bg, sample, fonts, { size: 18 });
    t.fills = [p];
  } else if (layer === "icon") {
    const dot = figma.createEllipse();
    dot.resize(24, 24);
    dot.fills = [p];
    bg.appendChild(dot);
  } else {
    const plate = figma.createRectangle();
    plate.resize(bg.width - 48, 40);
    plate.cornerRadius = 8;
    plate.fills = [p];
    bg.appendChild(plate);
  }
  box.appendChild(bg);
  text(box, `${caption} · ${hex ?? "—"}${surface ? ` на ${surface}` : ""}`, fonts, { size: 12, color: MUTED });
  parent.appendChild(box);
}

/** Картинка с рамкой вокруг элемента: где он и как выглядит в окружении. */
function marked(name: string, png: Uint8Array, width: number, height: number, box: Box): FrameNode {
  const f = figma.createFrame();
  f.name = name;
  f.resize(Math.max(1, Math.round(width)), Math.max(1, Math.round(height)));
  f.cornerRadius = 6;
  f.clipsContent = true;
  const img = figma.createImage(png);
  f.fills = [{ type: "IMAGE", imageHash: img.hash, scaleMode: "FILL" }];
  const r = figma.createRectangle();
  r.name = "Элемент";
  const pad = 3;
  r.x = Math.max(0, box.x - pad);
  r.y = Math.max(0, box.y - pad);
  r.resize(Math.max(4, Math.min(width - r.x, box.w + pad * 2)), Math.max(4, Math.min(height - r.y, box.h + pad * 2)));
  r.fills = [];
  r.strokes = [{ type: "SOLID", color: MARK }];
  r.strokeWeight = 2;
  r.cornerRadius = 4;
  f.appendChild(r);
  return f;
}

async function example(parent: FrameNode, t: Shot, screenName: string, fonts: Fonts): Promise<void> {
  const line = row("Пример", 16);
  const size = await figma.createImage(t.png).getSizeAsync();
  const maxCrop = IMAGE_WIDTH - SHOT_WIDTH - 16;
  const k = Math.min(1, maxCrop / size.width);
  line.appendChild(marked("Элемент в окружении", t.png, size.width * k, size.height * k, { x: t.box.x * k, y: t.box.y * k, w: t.box.w * k, h: t.box.h * k }));
  if (t.screen) {
    const s = await figma.createImage(t.screen).getSizeAsync();
    const side = column("Экран", 4);
    side.appendChild(marked("Экран", t.screen, s.width, s.height, t.screenBox));
    text(side, screenName, fonts, { size: 11, color: MUTED, width: SHOT_WIDTH });
    line.appendChild(side);
  }
  parent.appendChild(line);
}

async function valueCard(v: RuleValue, total: number, layer: Layer, fonts: Fonts, camera: Camera): Promise<FrameNode> {
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
  const sample = v.labels?.[0] ? `«${v.labels[0]}»` : "Пример текста";
  const specimens = row("Светлая и тёмная", 16);
  specimen(specimens, layer, v.hexLight, v.surfaceLight, sample, "Светлая", fonts);
  specimen(specimens, layer, v.hexDark, v.surfaceDark, sample, "Тёмная", fonts);
  card.appendChild(specimens);
  if (v.labels?.length) text(card, `Подписи: ${v.labels.map((l) => `«${l}»`).join(", ")}`, fonts, { size: 13, width: IMAGE_WIDTH });
  let shown = 0;
  for (const ex of v.examples ?? []) {
    const t = await camera.take(ex);
    if (!t) continue;
    if (!shown) text(card, "Примеры из образцов — элемент в рамке", fonts, { size: 13, bold: true, width: IMAGE_WIDTH });
    await example(card, t, ex.screenName, fonts);
    shown++;
  }
  if (!shown && total > 0) {
    const files = [...new Set((v.examples ?? []).map((e) => e.file).filter((f): f is string => Boolean(f && f !== figma.root.name)))];
    const why = files.length
      ? `Примеры — в файле образцов ${files.map((f) => `«${f}»`).join(", ")}: откройте его и нажмите «Показать подробно» там`
      : "Примеры не найдены — изучите образцы заново";
    text(card, why, fonts, { size: 12, color: MUTED, width: IMAGE_WIDTH });
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
  camera: Camera,
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
    for (const v of values) cards.appendChild(await valueCard(v, totalCount, q.layer, fonts, camera));
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
  focusId: string | null,
  report: (title: string) => void,
): Promise<void> {
  const fonts = await loadFonts();
  const camera = new Camera();
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
    const f = await questionFrame(q, i + 1, questions.length, answers[q.id], isOpenQ, fonts, camera);
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
