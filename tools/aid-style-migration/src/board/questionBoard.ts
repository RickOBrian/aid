/**
 * Доски вопросов на странице «AID · Язык продукта» (решение Б): канвас
 * показывает подробно, плагин принимает решения. На доску — вопрос,
 * объяснение, по каждому варианту — доля, подписи и примеры из образцов:
 * живые копии элемента в окружении в светлой и тёмной теме (тема —
 * режимом коллекции продукта на обёртке) и мини-экран картинкой.
 * Копия — не отвязка: инстансы остаются инстансами.
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
import type { ThemeModes } from "../profile/themeModes";
import type { SourceHit, SourceIndex } from "./sourceExamples";
import { THEME_ROLES } from "../lib/vocabulary";
import type { QuestionOption } from "../core/questions";

const KEY_BOARD = "sm:board";
const BOARD_WIDTH = 1720;
const PAD = 40;
const GAP = 120;
const CARD_WIDTH = 800;
/** Копия примера шире — уменьшаем: две темы рядом в карточке. */
const COPY_MAX = (CARD_WIDTH - 32 - 16) / 2;
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

/** Живой пример: копия окружения и где в ней элемент (в координатах копии). */
interface Live {
  copy: SceneNode;
  /** Путь от копии до элемента — индексы детей: копия повторяет структуру. */
  path: number[];
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

  /**
   * Окружение: ближайший инстанс крупнее иконки — элемент целиком, а не
   * его кусок (кнопки собраны из кусков). Нет такого — поднимаемся, пока
   * элемент мельче строки или карточки, не выше 5 уровней и не до экрана.
   */
  private context(node: SceneNode, screenId: string): SceneNode {
    for (let p: BaseNode | null = node; p && p.id !== screenId && p.type !== "PAGE" && p.type !== "DOCUMENT" && p.type !== "SECTION"; p = p.parent) {
      const sn = p as SceneNode;
      if (sn.type === "INSTANCE" && Math.max(sn.width, sn.height) > 32 && sn.height <= 400) return sn;
    }
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

  private async find(ex: Example): Promise<{ el: SceneNode; scr: SceneNode } | null> {
    if (ex.file && ex.file !== figma.root.name) {
      this.elsewhere.add(ex.file);
      return null;
    }
    const node = await figma.getNodeByIdAsync(ex.nodeId);
    const screen = await figma.getNodeByIdAsync(ex.screenId);
    if (!node || !screen || node.type === "PAGE" || node.type === "DOCUMENT" || screen.type === "PAGE" || screen.type === "DOCUMENT") return null;
    return { el: node as SceneNode, scr: screen as SceneNode };
  }

  /**
   * Копия окружения элемента. Слой внутри инстанса копируется как есть
   * (вложенные инстансы остаются инстансами); не вышло — копируем
   * ближайший целый инстанс, если он не больше экрана-строки.
   */
  async live(ex: Example): Promise<Live | null> {
    const found = await this.find(ex);
    if (!found) return null;
    const { el, scr } = found;
    const candidates: SceneNode[] = [this.context(el, scr.id)];
    for (let p = el.parent; p && p.id !== scr.id && p.type !== "PAGE" && p.type !== "DOCUMENT" && p.type !== "SECTION"; p = p.parent) {
      if (p.type === "INSTANCE" && p.height <= 400) {
        candidates.push(p);
        break;
      }
    }
    const own = el.absoluteBoundingBox;
    const sb = scr.absoluteBoundingBox;
    if (!own || !sb) return null;
    for (const target of candidates) {
      const tb = target.absoluteBoundingBox;
      if (!tb) continue;
      try {
        const copy = target.clone();
        return { copy, path: pathTo(target, el), box: rel(own, tb, 1), screen: await this.screen(scr), screenBox: rel(own, sb, SHOT_WIDTH / sb.width) };
      } catch {
        // этот слой не копируется — пробуем следующий
      }
    }
    return null;
  }

  async take(ex: Example): Promise<Shot | null> {
    const found = await this.find(ex);
    if (!found) return null;
    const { el, scr } = found;
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

/** Индексы детей от предка до узла. */
function pathTo(ancestor: SceneNode, node: SceneNode): number[] {
  const path: number[] = [];
  let n: BaseNode = node;
  while (n.id !== ancestor.id && n.parent && "children" in n.parent) {
    path.unshift((n.parent.children as readonly BaseNode[]).indexOf(n));
    n = n.parent;
  }
  return path;
}

function follow(root: SceneNode, path: number[]): SceneNode | null {
  let n: SceneNode = root;
  for (const i of path) {
    if (!("children" in n) || !n.children[i]) return null;
    n = n.children[i];
  }
  return n;
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

/** Рамка вокруг элемента поверх копии. */
function outline(parent: FrameNode, box: Box): void {
  const r = figma.createRectangle();
  r.name = "Элемент";
  const pad = 3;
  r.x = Math.max(0, box.x - pad);
  r.y = Math.max(0, box.y - pad);
  r.resize(Math.max(4, Math.min(parent.width - r.x, box.w + pad * 2)), Math.max(4, Math.min(parent.height - r.y, box.h + pad * 2)));
  r.fills = [];
  r.strokes = [{ type: "SOLID", color: MARK }];
  r.strokeWeight = 2;
  r.cornerRadius = 4;
  parent.appendChild(r);
}

/**
 * Обёртка темы: копия внутри, режим коллекции темы продукта — на обёртке.
 * Фон — поверхность, на которой значение чаще всего лежит в этой теме.
 */
function themed(copy: SceneNode, box: Box, caption: string, surface: string | undefined, theme: ThemeModes | null, modeId: string | null, fonts: Fonts): FrameNode {
  const col = column(caption, 6);
  const wrap = figma.createFrame();
  wrap.name = caption;
  wrap.clipsContent = true;
  wrap.cornerRadius = 8;
  const bg = surface ? paint(surface) : null;
  wrap.fills = bg ? [bg] : [];
  const before = copy.width;
  const k = Math.min(1, COPY_MAX / copy.width);
  if (k < 1 && "rescale" in copy) {
    try {
      (copy as SceneNode & { rescale(scale: number): void }).rescale(k);
    } catch {
      // не масштабируется — обрежется рамкой обёртки
    }
  }
  wrap.resize(Math.max(1, Math.min(COPY_MAX, copy.width)), Math.max(1, copy.height));
  wrap.appendChild(copy);
  copy.x = 0;
  copy.y = 0;
  const scaled = before > 0 ? copy.width / before : 1;
  outline(wrap, { x: box.x * scaled, y: box.y * scaled, w: box.w * scaled, h: box.h * scaled });
  if (theme && modeId) {
    try {
      wrap.setExplicitVariableModeForCollection(theme.collection, modeId);
    } catch {
      // режим не ставится — останется тема по умолчанию
    }
  }
  col.appendChild(wrap);
  text(col, caption, fonts, { size: 12, color: MUTED });
  return col;
}

async function liveExample(parent: FrameNode, t: Live, v: RuleValue, screenName: string, theme: ThemeModes | null, fonts: Fonts): Promise<void> {
  const block = column("Пример", 8);
  const pair = row("Светлая и тёмная", 16);
  const second = t.copy.clone();
  pair.appendChild(themed(t.copy, t.box, "Светлая", v.surfaceLight, theme, theme?.lightModeId ?? null, fonts));
  if (theme?.darkModeId) pair.appendChild(themed(second, t.box, "Тёмная", v.surfaceDark, theme, theme.darkModeId, fonts));
  else second.remove();
  block.appendChild(pair);
  if (t.screen) {
    const s = await figma.createImage(t.screen).getSizeAsync();
    const side = row("Экран", 8);
    side.appendChild(marked("Экран", t.screen, s.width, s.height, t.screenBox));
    text(side, `Экран: ${screenName}`, fonts, { size: 12, color: MUTED, width: CARD_WIDTH - 32 - s.width - 8 });
    block.appendChild(side);
  }
  parent.appendChild(block);
}

// ---------------------------------------------------------------------------
// Было / стало на элементах переводимого файла
// ---------------------------------------------------------------------------

type Target = Pick<RuleValue, "token" | "hex">;

/** Какое значение даёт вариант ответа этому элементу: у «зависит от …» — по его месту или ширине. */
export function valueFor(o: QuestionOption, hit: SourceHit): Target | null {
  if (o.kind === "value" && o.value) return o.value;
  if (o.kind === "split" && o.split) {
    const f = o.split.feature;
    const key = f === "place" ? hit.place : f === "width" ? (hit.full ? "full" : "part") : THEME_ROLES.light;
    return o.split.map[key] ?? Object.values(o.split.map)[0] ?? null;
  }
  return null;
}

class Recolor {
  private variables = new Map<string, Variable | null>();
  failed = false;

  private async variable(key: string): Promise<Variable | null> {
    if (!this.variables.has(key)) {
      let v: Variable | null = null;
      try {
        v = await figma.variables.importVariableByKeyAsync(key);
      } catch {
        this.failed = true;
      }
      this.variables.set(key, v);
    }
    return this.variables.get(key) ?? null;
  }

  /** Привязать к элементу копии токен варианта (или цвет без токена). Документ — только копия на доске. */
  async apply(copy: SceneNode, path: number[], layer: Layer, target: Target): Promise<boolean> {
    const node = follow(copy, path);
    if (!node) return false;
    const field = layer === "stroke" ? "strokes" : "fills";
    if (!(field in node)) return false;
    const current = (node as GeometryMixin)[field];
    if (current === figma.mixed || !Array.isArray(current)) return false;
    if (node.type === "TEXT") {
      for (const seg of node.getStyledTextSegments(["fontName"])) await figma.loadFontAsync(seg.fontName);
    }
    const paints = [...(current as Paint[])];
    const i = paints.findIndex((p) => p.type === "SOLID" && p.visible !== false);
    let base: SolidPaint = i >= 0 ? (paints[i] as SolidPaint) : { type: "SOLID", color: { r: 0, g: 0, b: 0 } };
    if (target.token) {
      const v = await this.variable(target.token.key);
      if (!v) return false;
      base = figma.variables.setBoundVariableForPaint({ ...base, opacity: 1 }, "color", v);
    } else {
      const c = rgb(target.hex);
      if (!c) return false;
      base = { type: "SOLID", color: c, opacity: alpha(target.hex) };
    }
    if (i >= 0) paints[i] = base;
    else paints.push(base);
    (node as GeometryMixin)[field] = paints;
    return true;
  }
}

async function beforeAfter(
  parent: FrameNode,
  q: Question,
  source: SourceIndex,
  camera: Camera,
  recolor: Recolor,
  theme: ThemeModes | null,
  fonts: Fonts,
): Promise<void> {
  const inner = BOARD_WIDTH - PAD * 2;
  const hits = source.byRole.get(`${q.role}|${q.layer}`) ?? [];
  text(parent, `Было / стало в вашем файле «${source.file}»`, fonts, { size: 18, bold: true, width: inner });
  if (!hits.length) {
    text(parent, `В собранных экранах «ДО» элементов «${roleLabel(q.role)}» не нашлось — ответ сработает, когда они встретятся.`, fonts, { size: 14, color: MUTED, width: inner });
    return;
  }
  const options = q.options.filter((o) => o.kind === "value" || o.kind === "split");
  for (const hit of hits) {
    const ex = { screenId: hit.screenId, screenName: hit.screenName, nodeId: hit.nodeId, nodeName: "", file: source.file };
    const before = await camera.live(ex);
    if (!before) continue;
    text(parent, `Экран «${hit.screenName}»`, fonts, { size: 14, bold: true, width: inner });
    // Нетронутая копия — источник для вариантов: «Было» в обёртке может уменьшиться.
    const pristine = before.copy.clone();
    const line = row("Было и варианты", 24);
    const was = column("Было", 8);
    text(was, "Было", fonts, { size: 13, bold: true });
    was.appendChild(themed(before.copy, before.box, "как в макете", undefined, null, null, fonts));
    line.appendChild(was);
    for (const [n, o] of options.entries()) {
      const target = valueFor(o, hit);
      if (!target) continue;
      const light = pristine.clone();
      if (!(await recolor.apply(light, before.path, q.layer, target))) {
        light.remove();
        continue;
      }
      const dark = light.clone();
      const col = column(`Вариант ${n + 1}`, 8);
      text(col, `Вариант ${n + 1}: ${target.token?.name ?? target.hex}`, fonts, { size: 13, bold: true, width: COPY_MAX * 2 + 16 });
      const pair = row("Светлая и тёмная", 16);
      pair.appendChild(themed(light, before.box, "Стало · светлая", undefined, theme, theme?.lightModeId ?? null, fonts));
      if (theme?.darkModeId) pair.appendChild(themed(dark, before.box, "Стало · тёмная", undefined, theme, theme.darkModeId, fonts));
      else dark.remove();
      col.appendChild(pair);
      line.appendChild(col);
    }
    pristine.remove();
    parent.appendChild(line);
    line.layoutSizingHorizontal = "FILL";
    line.layoutWrap = "WRAP";
    line.counterAxisSpacing = 24;
  }
  const notes = q.options.filter((o) => o.kind === "not-used" || o.kind === "new-token").map((o) => o.label);
  if (notes.length) text(parent, `Без «стало»: ${notes.join("; ")}.`, fonts, { size: 13, color: MUTED, width: inner });
  if (recolor.failed) text(parent, "Часть токенов не импортировалась — подключите библиотеку токенов продукта в этом файле.", fonts, { size: 13, color: MUTED, width: inner });
}

async function valueCard(v: RuleValue, total: number, layer: Layer, fonts: Fonts, camera: Camera, theme: ThemeModes | null): Promise<FrameNode> {
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
    const comps = Object.entries(v.features?.component ?? {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([k, n]) => `${k === "—" ? "нарисовано вручную" : k} ${n}`)
      .join(", ");
    if (comps) text(card, `Компоненты: ${comps}`, fonts, { size: 13, color: MUTED, width: IMAGE_WIDTH });
  }
  if (v.labels?.length) text(card, `Подписи: ${v.labels.map((l) => `«${l}»`).join(", ")}`, fonts, { size: 13, width: IMAGE_WIDTH });
  let shown = 0;
  for (const ex of v.examples ?? []) {
    const live = await camera.live(ex);
    const shot = live ? null : await camera.take(ex);
    if (!live && !shot) continue;
    if (!shown) {
      const how = theme ? "копии из образцов в светлой и тёмной теме" : "копии из образцов (тема продукта не задана — только как в образце)";
      text(card, `Примеры — ${how}; элемент в рамке`, fonts, { size: 13, bold: true, width: IMAGE_WIDTH });
    }
    if (live) await liveExample(card, live, v, ex.screenName, theme, fonts);
    else if (shot) await example(card, shot, ex.screenName, fonts);
    shown++;
  }
  // Нет живых примеров (другой файл, пробел) — хотя бы образец цвета на фоне.
  if (!shown) {
    const sample = v.labels?.[0] ? `«${v.labels[0]}»` : "Пример текста";
    const specimens = row("Светлая и тёмная", 16);
    specimen(specimens, layer, v.hexLight, v.surfaceLight, sample, "Светлая", fonts);
    specimen(specimens, layer, v.hexDark, v.surfaceDark, sample, "Тёмная", fonts);
    card.appendChild(specimens);
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
  theme: ThemeModes | null,
  source: SourceIndex | null,
  recolor: Recolor,
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
    for (const v of values) cards.appendChild(await valueCard(v, totalCount, q.layer, fonts, camera, theme));
    f.appendChild(cards);
    cards.layoutSizingHorizontal = "FILL";
    cards.layoutWrap = "WRAP";
    cards.counterAxisSpacing = 24;
  }

  if (source) await beforeAfter(f, q, source, camera, recolor, theme, fonts);
  else text(f, "Было / стало на ваших макетах появится, если собрать доску в переводимом файле после «1 · Собрать».", fonts, { size: 14, color: MUTED, width: inner });

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
  theme: ThemeModes | null,
  source: SourceIndex | null,
  report: (title: string) => void,
): Promise<void> {
  const fonts = await loadFonts();
  const camera = new Camera();
  const recolor = new Recolor();
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
    const f = await questionFrame(q, i + 1, questions.length, answers[q.id], isOpenQ, fonts, camera, theme, source, recolor);
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
