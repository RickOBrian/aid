/**
 * Роли элементов (Я2): что это за элемент — по форме и контексту, а не по
 * цвету исходника. Одинаково работает на образцах продукта (чтобы узнать,
 * как продукт оформляет роль) и на исходнике (чтобы перевести по роли).
 *
 * Поводом стали образцы продукта (спайк, «Как продукт раскрашивает
 * элементы»): главное действие — зелёное, обычные кнопки — тёмные,
 * фиолетовый — только декор. Цвет исходника этого не подскажет, форма и
 * место элемента — да.
 *
 * Ключ роли — то, по чему язык продукта хранит правило:
 * `action-primary` (заливка кнопки), `action-primary/label` (текст на
 * ней), `text/secondary`, `icon/accent`, `link`…
 */

import { relativeLuminance } from "../assemble/darkPairs";
import { isHelperLayerName } from "../lib/annotations";
import { controlByName, controlState, type ControlKind } from "../lib/controls";
import { isSystemName } from "../lib/system";
import { hueFamily, isNeutral, toHex, type Rgba } from "../map/color";
import { solidFill, solidStroke, texts, walk, type NNode, type NPaint } from "./node";

export type ActionRole = "action-main" | "action-primary" | "action-secondary" | "action-disabled" | "action-destructive" | "action-floating";

export type Meaning = "accent" | "positive" | "negative" | "warning" | "info";

export type Layer = "fill" | "stroke" | "text" | "icon";

export interface RoleHit {
  nodeId: string;
  nodeName: string;
  /** Ключ правила языка продукта. */
  key: string;
  layer: Layer;
  paint: NPaint;
  /** Поверхность под элементом (с учётом прозрачности) — для контраста и контекста. */
  surface: Rgba;
  /** Где лежит: `screen`, `sheet`, `modal`, `card` — признак для объяснения споров. */
  place: Place;
  /**
   * Компонент элемента — ближайший инстанс крупнее иконки: «fab/primary ·
   * Text=Yes». Разные варианты одного компонента по-разному окрашены
   * законно — это не спор (замечание Principal Designer, 2026-09-30).
   */
  component: string | null;
  /** Откуда цвет: из компонента, переопределён автором в инстансе, нарисован вручную. */
  origin: ColorOrigin;
  /** Заливка поверхности под элементом (с токеном, если есть) — для проверки контраста в другой теме. */
  under?: NPaint;
  /** Состояние элемента управления: отмечен / включён или нет — разные цвета законны. */
  state?: "on" | "off";
  /**
   * Место внутри компонента — путь слоёв от корня компонента: «Left icon
   * box/arrow_right». Разные места — разные части (точка и стрелка
   * слайдера), сравнивать цвета можно только в одном месте. Нет — вне компонента.
   */
  slot?: string;
  /**
   * Чем окрашен элемент-владелец (фон + обводка) — для частей: иконка чипа
   * меняется вместе с его обводкой, это два вида элемента, а не разнобой.
   */
  pair?: string;
}

/**
 * Слова статуса в имени токена. Статус по-прежнему угадываем по оттенку
 * (у продуктов бывают палитры «accent/orange» для предупреждений), но
 * иконка, покрашенная токеном чужого семейства без слова статуса
 * (двухцветная пастельная иконка опции), — декор, а не «ошибка».
 */
const STATUS_WORDS = /warn|error|negative|danger|alert|attention|caution|critical|success|positive|info/i;
/** Семейство токена иконок или текста — по первой части имени. */
const FG_FAMILY = /^(icon|ic[-_/ ]|text|tx[-_/ ]|typo|label|content|foreground|fg)/i;
/** Токен кнопки или действия: заливка карточки таким токеном — нажимаемая плитка. */
const ACTION_WORDS = /button|btn|action|cta/i;

/** Имя токена краски, если есть. */
const tokenName = (p: NPaint | undefined): string | undefined => p?.variable?.name;

/** Как подписать краску для признака «пара»: токен или hex. */
function paintLabel(p: NPaint | undefined): string {
  if (!p?.color) return "—";
  return p.variable?.name ?? toHex(p.color);
}

/** Имя слоя для пути места: без эмодзи и лишних пробелов. */
const slotName = (n: NNode) => n.name.replace(/[^\p{L}\p{N} _\-=,]/gu, "").trim() || n.type.toLowerCase();

export type Place = "screen" | "sheet" | "modal" | "card";

export type ColorOrigin = "component" | "override" | "free";

/** «fab/primary · Text=Yes» — набор и вариант; одиночный компонент — его имя. */
export function componentIdentity(n: NNode): string | null {
  if (!n.component) return null;
  return n.component.setName ? `${n.component.setName} · ${n.component.name}` : n.component.name;
}

/**
 * Фон элемента: своя заливка или крупный кусок внутри — кнопки в образцах
 * собирают из «левого куска», «середины», «правого куска». Кусок ≥ 40 %
 * площади, не глубже двух уровней.
 */
export function body(n: NNode): { node: NNode; paint: NPaint } | undefined {
  const own = solidFill(n);
  if (own) return { node: n, paint: own };
  const area = n.width * n.height;
  let best: { node: NNode; paint: NPaint } | undefined;
  walk(n, (x, _p, depth) => {
    if (depth === 0) return;
    if (depth > 2) return "skip";
    const f = solidFill(x);
    if (f && !x.text && x.width * x.height >= area * 0.4 && (!best || x.width * x.height > best.node.width * best.node.height)) best = { node: x, paint: f };
    return undefined;
  });
  return best;
}

/** Обёртка без своей заливки вокруг единственного элемента того же размера — роль у элемента, не у обёртки. */
function isWrapper(n: NNode): boolean {
  if (solidFill(n)) return false;
  return n.children.some((c) => CONTAINERS.has(c.type) && c.width >= n.width * 0.95 && c.height >= n.height * 0.95);
}

function samePaint(a: NPaint | undefined, b: NPaint | undefined): boolean {
  if (!a?.color || !b?.color) return false;
  if (a.variable || b.variable) return a.variable?.key === b.variable?.key;
  return a.color.r === b.color.r && a.color.g === b.color.g && a.color.b === b.color.b && a.color.a === b.color.a;
}

export interface ScreenRoles {
  hits: RoleHit[];
  /** Что не читали: системное, аннотации, картинки, перекрытое. */
  skipped: { system: number; annotation: number; media: number; hidden: number };
}

const SHAPES = new Set(["VECTOR", "BOOLEAN_OPERATION", "ELLIPSE", "STAR", "POLYGON", "LINE", "RECTANGLE"]);
const CONTAINERS = new Set(["FRAME", "INSTANCE", "COMPONENT", "GROUP", "RECTANGLE", "SLOT"]);
const WHITE: Rgba = { r: 1, g: 1, b: 1, a: 1 };

// ---------------------------------------------------------------------------
// Цвет
// ---------------------------------------------------------------------------

export function composite(fg: Rgba, bg: Rgba): Rgba {
  const a = fg.a;
  return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
}

/** Контраст WCAG 1…21 — цвет с прозрачностью сначала кладётся на поверхность. */
export function contrast(fg: Rgba, bg: Rgba): number {
  const f = composite(fg, bg);
  const l1 = relativeLuminance(f.r, f.g, f.b);
  const l2 = relativeLuminance(bg.r, bg.g, bg.b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function meaningOf(c: Rgba): Meaning {
  const f = hueFamily(c);
  if (f === "red" || f === "pink") return "negative";
  if (f === "green") return "positive";
  if (f === "orange" || f === "yellow") return "warning";
  if (f === "blue") return "info";
  return "accent";
}

// ---------------------------------------------------------------------------
// Формы
// ---------------------------------------------------------------------------

interface Base {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Ctx {
  screen: NNode;
  surface: Rgba;
  /** Заливка, давшая `surface`, — чтобы знать её токен. */
  surfacePaint?: NPaint;
  /** Ближайший контейнер-основа (шторка, модалка, экран) — для «главного действия», заголовка и ручки. */
  base: Base;
  /** Роль, внутри которой находимся: текст и иконки внутри кнопки — её подпись и иконка. */
  owner: string | null;
  /** Заливка элемента-владельца: куски того же цвета — его фон, а не детали. */
  ownerPaint?: NPaint;
  place: Place;
  /** Компонент, внутри которого находимся (ближайший крупнее иконки). */
  component: string | null;
  /** Состояние элемента управления, внутри которого находимся. */
  state?: "on" | "off";
  /** Путь слоёв от корня текущего компонента. */
  slotPath?: string[];
  /** Обводка владельца — вместе с `ownerPaint` даёт признак «пара». */
  ownerStroke?: NPaint;
}

function labelTexts(n: NNode): NNode[] {
  return texts(n).filter((t) => (t.text?.characters.trim().length ?? 0) > 0);
}

/** Время «23:58» — метка сообщения, не подпись. */
function isTimeText(t: NNode): boolean {
  return /^\d{1,2}:\d{2}$/.test(t.text?.characters.trim() ?? "");
}

/** Подпись по центру: сначала выравнивание текста (рамка поля ввода часто во всю ширину), потом геометрия. */
function isCentered(n: NNode, label: NNode): boolean {
  const align = label.text?.align;
  if (align === "C" || align === "CENTER") return true;
  if (align === "L" || align === "LEFT" || align === "R" || align === "RIGHT") {
    // Текст «по левому краю» в рамке по ширине содержимого — всё равно по
    // центру кнопки. Прижатый к левому краю — строка списка, не кнопка.
    const mid = label.x + label.width / 2;
    const hugsLeft = label.x - n.x <= n.width * 0.15;
    return !hugsLeft && label.width < n.width * 0.8 && Math.abs(mid - (n.x + n.width / 2)) <= n.width * 0.08;
  }
  const mid = label.x + label.width / 2;
  return Math.abs(mid - (n.x + n.width / 2)) <= n.width * 0.08;
}

export function isButtonLike(n: NNode): boolean {
  if (!CONTAINERS.has(n.type) || n.children.length === 0) return false;
  // Кнопка с подписью шире, чем высока; квадрат с надписью — значок, не кнопка.
  if (n.height < 32 || n.height > 72 || n.width < 64 || n.width < n.height * 1.3) return false;
  if (isWrapper(n) || (!body(n) && !solidStroke(n))) return false;
  const labels = labelTexts(n);
  if (labels.length < 1 || labels.length > 2) return false;
  if (labels.reduce((s, t) => s + (t.text?.characters.length ?? 0), 0) > 40) return false;
  // Две подписи — в одну строку («Отказаться без штрафа»); текст над текстом — не кнопка.
  if (labels.length === 2 && Math.abs(labels[0].y + labels[0].height / 2 - (labels[1].y + labels[1].height / 2)) > 6) return false;
  return isCentered(n, labels[0]);
}

/**
 * Пузырь сообщения: плашка с текстом и временем «23:58» (аудит
 * 2026-09-30: пузыри чата считались кнопками).
 */
function isBubble(n: NNode, W: number): boolean {
  // Пузырь не бывает во всю ширину — карточки со временем заказа не пузыри.
  if (!CONTAINERS.has(n.type) || n.height < 32 || n.height > 240 || n.width >= W * 0.85 || !body(n)) return false;
  const labels = labelTexts(n);
  return labels.length >= 2 && labels.some(isTimeText) && labels.some((t) => !isTimeText(t));
}

function isFab(n: NNode): boolean {
  if (isWrapper(n)) return false;
  if (/(^|\/)fab/i.test(n.component?.setName || n.name)) return true;
  const square = Math.abs(n.width - n.height) <= 8 && n.width >= 40 && n.width <= 64;
  return square && labelTexts(n).length === 0 && (n.radius ?? 0) >= 12 && Boolean(body(n));
}

/** Бейдж-счётчик: кружок ≤ 24 px с короткой надписью (аудит: счётчик «2» считался чипом). */
function isBadge(n: NNode): boolean {
  if (!CONTAINERS.has(n.type) || n.width > 28 || n.height > 24 || n.height < 12 || !body(n)) return false;
  const round = (n.radius ?? 0) >= n.height / 2 - 1 || Math.abs(n.width - n.height) <= 4;
  const labels = labelTexts(n);
  return round && labels.length === 1 && (labels[0].text?.characters.trim().length ?? 0) <= 3;
}

/**
 * Строка списка: одна из нескольких одинаковых соседних плашек во всю
 * ширину (аудит: варианты маршрута считались полями ввода).
 */
function isRow(n: NNode, parent: NNode | null, W: number): boolean {
  if (!parent || !CONTAINERS.has(n.type) || n.width < W * 0.8 || n.height < 40 || n.height > 120) return false;
  if ((!solidFill(n) && !solidStroke(n)) || labelTexts(n).length === 0) return false;
  const same = parent.children.filter((c) => c.type === n.type && Math.abs(c.width - n.width) <= 2 && Math.abs(c.height - n.height) <= 2);
  return same.length >= 2;
}

function isInput(n: NNode, W: number): boolean {
  if (!CONTAINERS.has(n.type) || n.height < 36 || n.height > 64 || n.width < W * 0.5) return false;
  const labels = labelTexts(n);
  if (labels.length === 0) return false;
  const leftAligned = labels.every((t) => t.text?.align === "L" || t.text?.align === "LEFT");
  return Boolean(solidStroke(n)) && leftAligned;
}

function isChip(n: NNode, W: number): boolean {
  if (!CONTAINERS.has(n.type) || n.height < 20 || n.height > 48 || n.width >= W * 0.6) return false;
  if (isWrapper(n) || (n.radius ?? 0) < 6 || (!body(n) && !solidStroke(n))) return false;
  const labels = labelTexts(n);
  return labels.length >= 1 && labels.length <= 2 && labels.every((t) => (t.text?.characters.length ?? 0) <= 24);
}

/**
 * Заголовок: во всю ширину у верха основы (экрана, шторки, модалки), с
 * надписью и без своей видимой плашки (аудит: заголовки «Чат с клиентом»
 * считались второстепенными кнопками).
 */
function isHeader(n: NNode, ctx: Ctx, W: number): boolean {
  if (!CONTAINERS.has(n.type) || n.width < W * 0.95 || n.height < 40 || n.height > 80) return false;
  if (n.y - ctx.base.y > (ctx.base.y === ctx.screen.y ? 100 : 30)) return false;
  const labels = labelTexts(n);
  if (labels.length < 1 || labels.length > 3) return false;
  const fill = body(n)?.paint.color;
  return !fill || contrast(fill, ctx.surface) < 1.1;
}

function actionRole(n: NNode, ctx: Ctx, W: number): ActionRole {
  if (isFab(n)) return "action-floating";
  const id = `${n.name} ${n.component?.name ?? ""} ${n.component?.setName ?? ""}`;
  if (/disabled|inactive|неактив/i.test(id)) return "action-disabled";
  const fill = body(n)?.paint.color;
  const label = labelTexts(n)[0];
  const labelColor = label ? solidFill(label)?.color : undefined;
  const reddish = (c?: Rgba) => Boolean(c && !isNeutral(c) && meaningOf(c) === "negative");
  if (reddish(fill) || reddish(labelColor)) return "action-destructive";
  const strong = fill ? contrast(fill, ctx.surface) >= 1.8 : false;
  if (!strong) return "action-secondary";
  const bottomAnchored = Math.abs(n.y + n.height - (ctx.base.y + ctx.base.height)) <= 8;
  if (n.width >= W * 0.9 && bottomAnchored) return "action-main";
  return "action-primary";
}

/** Кнопку видно: фон отличается от поверхности, есть обводка или она лежит на картинке. */
function hasBoundary(n: NNode, surface: Rgba, onMedia: boolean): boolean {
  if (onMedia || solidStroke(n)) return true;
  const fill = body(n)?.paint.color;
  return Boolean(fill && contrast(fill, surface) >= 1.1);
}

// ---------------------------------------------------------------------------
// Элементы управления
// ---------------------------------------------------------------------------

const CONTROL_KEYS: Record<Exclude<ControlKind, "avatar">, string> = {
  check: "control/check",
  switch: "control/switch",
  "icon-button": "action-icon",
  tab: "tab",
  progress: "progress",
};

/** Переключатель по форме: капсула 16–40 px высотой, шире в 1,4–2,6 раза, с круглым бегунком внутри. */
function isSwitchShape(n: NNode): boolean {
  if (!CONTAINERS.has(n.type) || n.height < 16 || n.height > 40) return false;
  const ratio = n.width / n.height;
  if (ratio < 1.4 || ratio > 2.6 || labelTexts(n).length > 0) return false;
  let thumb = false;
  walk(n, (x, _p, depth) => {
    if (depth > 0 && (x.type === "ELLIPSE" || (Math.abs(x.width - x.height) <= 2 && (x.radius ?? 0) >= x.width / 2 - 1)) && x.height >= n.height * 0.5 && x.height <= n.height) thumb = true;
    return undefined;
  });
  return thumb && Boolean(body(n));
}

/** Что за элемент управления: по имени (с разумным размером) или по форме. */
function controlOf(n: NNode): ControlKind | null {
  const byName = controlByName(n.name, n.component?.setName ?? "", n.component?.name ?? "");
  const small = Math.max(n.width, n.height);
  if (byName === "check" && small <= 40) return "check";
  if (byName === "switch" && n.height <= 48 && n.width <= 96) return "switch";
  if (byName === "icon-button" && small <= 48) return "icon-button";
  if (byName === "avatar" && small <= 96) return "avatar";
  if ((byName === "tab" || byName === "progress") && CONTAINERS.has(n.type)) return byName;
  return isSwitchShape(n) ? "switch" : null;
}

// ---------------------------------------------------------------------------
// Видимость: перекрытое не читаем
// ---------------------------------------------------------------------------

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Узлы, целиком закрытые непрозрачным слоем, нарисованным позже (аудит:
 * нижняя панель под шторкой, первая шторка чата под второй). Порядок
 * отрисовки — обход в глубину; «позже» — после всего поддерева узла.
 */
function hiddenNodes(screen: NNode): Set<string> {
  const order = new Map<string, { i: number; end: number }>();
  const covers: Array<{ i: number; box: Box }> = [];
  let i = 0;
  const visit = (n: NNode, root: boolean) => {
    const start = i++;
    const f = n.fills.find((p) => (p.kind === "solid" && (p.color?.a ?? 0) >= 0.95) || p.kind === "image");
    if (!root && f && n.width * n.height >= screen.width * screen.height * 0.02) covers.push({ i: start, box: { x: n.x, y: n.y, w: n.width, h: n.height } });
    for (const c of n.children) visit(c, false);
    order.set(n.id, { i: start, end: i - 1 });
  };
  visit(screen, true);
  const hidden = new Set<string>();
  walk(screen, (n, _p, depth) => {
    if (depth === 0) return undefined;
    const o = order.get(n.id)!;
    const inside = (b: Box) => n.x >= b.x - 1 && n.y >= b.y - 1 && n.x + n.width <= b.x + b.w + 1 && n.y + n.height <= b.y + b.h + 1;
    if (covers.some((c) => c.i > o.end && inside(c.box))) {
      hidden.add(n.id);
      return "skip";
    }
    return undefined;
  });
  return hidden;
}

// ---------------------------------------------------------------------------
// Обход
// ---------------------------------------------------------------------------

/** Картинка крупнее этой доли экрана — медиа (карта, фото): поверх неё в язык идут только кнопки. */
const MEDIA_SHARE = 0.3;
/** Цвет «под картинкой» для контраста: средний серый — видна и белая, и тёмная кнопка. */
const MEDIA_GRAY: Rgba = { r: 0.5, g: 0.5, b: 0.5, a: 1 };

export function detectRoles(screen: NNode): ScreenRoles {
  const W = screen.width;
  const H = screen.height;
  const hits: RoleHit[] = [];
  const skipped = { system: 0, annotation: 0, media: 0, hidden: 0 };
  const claimed = new Set<string>();
  const hidden = hiddenNodes(screen);
  /** Нарисованное в порядке отрисовки: поверхность под элементом — последнее, что его накрывает. */
  const painted: Array<{ x: number; y: number; w: number; h: number; color: Rgba; media: boolean; paint?: NPaint }> = [];
  let overlaySeen = false;
  let screenBg: Rgba = WHITE;
  /** Фон экрана найден: своя заливка экрана или нижний слой во весь экран. */
  let bgFound = false;
  /** Нейтральный текст и иконки: уровень считается после обхода — относительно самого контрастного на экране. */
  const neutral: Array<{ hit: RoleHit; kind: "text" | "icon"; k: number }> = [];

  let place: Place = "screen";
  let component: string | null = null;
  let underPaint: NPaint | undefined;
  let curState: "on" | "off" | undefined;
  let curSlot: string | undefined;
  let curPair: string | undefined;
  /** Над картинкой (карта): не-кнопки не учим. */
  let quiet = false;
  const hit = (n: NNode, key: string, layer: Layer, paint: NPaint | undefined, surface: Rgba, from: NNode = n) => {
    if (!paint?.color || quiet) return undefined;
    const origin: ColorOrigin = from.colorOverride ? "override" : component ? "component" : "free";
    const h: RoleHit = {
      nodeId: n.id,
      nodeName: n.name,
      key,
      layer,
      paint,
      surface,
      place,
      component,
      origin,
      ...(underPaint ? { under: underPaint } : {}),
      ...(curState ? { state: curState } : {}),
      ...(curSlot !== undefined ? { slot: curSlot } : {}),
      ...(curPair ? { pair: curPair } : {}),
    };
    hits.push(h);
    return h;
  };

  const topAt = (n: NNode) => {
    const cx = n.x + n.width / 2;
    const cy = n.y + n.height / 2;
    for (let i = painted.length - 1; i >= 0; i--) {
      const p = painted[i];
      if (cx >= p.x && cx <= p.x + p.w && cy >= p.y && cy <= p.y + p.h) return p;
    }
    return undefined;
  };

  const paint = (n: NNode, p: NPaint | undefined, under: Rgba) => {
    if (p?.color) painted.push({ x: n.x, y: n.y, w: n.width, h: n.height, color: composite(p.color, under), media: false, paint: p });
  };

  /**
   * Текст и иконка на контрастной плашке (цветной или тёмной на светлом) —
   * «на контрастном фоне». Порог 3: серые кнопки тёмной темы чуть светлее
   * фона (≈ 1,9) — это не контрастная плашка (повторный аудит 2026-09-30).
   */
  const onContrast = (surface: Rgba) => contrast(surface, screenBg) >= 3;

  const visit = (n: NNode, parent: NNode | null, ctx: Ctx, root: boolean) => {
    const id = `${n.name} ${n.component?.setName ?? ""} ${n.component?.name ?? ""}`;
    if (!root && isSystemName(id)) {
      skipped.system++;
      return;
    }
    const off = n.x + n.width <= screen.x || n.y + n.height <= screen.y || n.x >= screen.x + W || n.y >= screen.y + H;
    if (!root && (isHelperLayerName(`${n.name} ${n.component?.setName ?? ""}`.trim()) || isHelperLayerName(n.component?.setName ?? "") || off)) {
      // Служебный слой библиотеки или то, что целиком за границей экрана
      // (выноска, прокрученный за край список): на экране этого не видно.
      skipped.annotation++;
      return;
    }
    if (hidden.has(n.id)) {
      skipped.hidden++;
      return;
    }
    const image = n.fills.some((p) => p.kind === "image");
    if (image) {
      skipped.media++;
      if (!root && n.width * n.height >= W * H * MEDIA_SHARE) painted.push({ x: n.x, y: n.y, w: n.width, h: n.height, color: MEDIA_GRAY, media: true });
    }

    const fill = solidFill(n);
    const stroke = solidStroke(n);
    const top = root ? undefined : topAt(n);
    const onMedia = Boolean(top?.media);
    ctx = { ...ctx, surface: root ? WHITE : (top?.color ?? ctx.surface), surfacePaint: root ? undefined : top ? top.paint : ctx.surfacePaint };
    // Экран-инстанс — не компонент элемента; иконки — тоже (их цвет — переопределение).
    const own = !root && Math.max(n.width, n.height) > 32 ? componentIdentity(n) : null;
    if (own) ctx = { ...ctx, component: own, slotPath: [] };
    else if (ctx.component && !root) ctx = { ...ctx, slotPath: [...(ctx.slotPath ?? []), slotName(n)] };
    place = ctx.place;
    component = ctx.component;
    underPaint = ctx.surfacePaint;
    curState = ctx.state;
    curSlot = ctx.component ? (ctx.slotPath ?? []).join("/") : undefined;
    curPair = ctx.owner ? `${paintLabel(ctx.ownerPaint)} + ${paintLabel(ctx.ownerStroke)}` : undefined;
    const wasQuiet = quiet;
    // Над картой учим только кнопки и то, что в них; остальное небольшое —
    // объекты карты (метки, знаки, машина). Крупные панели (шторка) — нет.
    const action = CONTAINERS.has(n.type) && ((isButtonLike(n) && hasBoundary(n, ctx.surface, onMedia)) || isFab(n));
    if (onMedia && !ctx.owner && !action && n.width * n.height < W * H * 0.25) quiet = true;
    let next: Ctx = ctx;
    const control = root || ctx.owner ? null : controlOf(n);
    if (control === "avatar") {
      // Аватар — фото или заглушка, не цвет продукта.
      skipped.media++;
      quiet = wasQuiet;
      return;
    }

    if (root) {
      hit(n, "screen-bg", "fill", fill, WHITE);
      if (fill?.color && fill.color.a > 0.5) {
        screenBg = composite(fill.color, WHITE);
        bgFound = true;
        next = { ...ctx, surface: screenBg, surfacePaint: fill };
      }
    } else if (!bgFound && !ctx.owner && fill?.color && fill.color.a > 0.85 && n.width >= W * 0.9 && n.height >= H * 0.9) {
      // У экрана нет своей заливки — фон нарисован слоем во весь экран. Без
      // этого фоном считался белый, и весь текст тёмного экрана попадал в
      // «на контрастном фоне» (аудит 2026-09-30).
      hit(n, "screen-bg", "fill", fill, WHITE);
      screenBg = composite(fill.color, WHITE);
      bgFound = true;
      paint(n, fill, WHITE);
      next = { ...ctx, surface: screenBg, surfacePaint: fill };
    } else if (ctx.owner) {
      // Внутри кнопки, поля, чипа: текст — подпись (время — метка), мелкая
      // форма — иконка, прочие заливки — детали (таймер в кнопке).
      // Узел, давший фон владельцу (круг чекбокса, кусок кнопки), уже учтён как его заливка.
      if (!claimed.has(n.id)) {
        if (n.text) hit(n, `${ctx.owner}/${isTimeText(n) ? "meta" : "label"}`, "text", fill, ctx.surface);
        else if (n.type === "ELLIPSE" && ctx.owner === "control/switch") hit(n, `${ctx.owner}/thumb`, "fill", fill, ctx.surface);
        else if (SHAPES.has(n.type) && Math.max(n.width, n.height) <= 32) hit(n, `${ctx.owner}/icon`, "icon", fill, ctx.surface);
        else if (fill && n.type !== "TEXT" && !samePaint(fill, ctx.ownerPaint)) hit(n, `${ctx.owner}/part`, "fill", fill, ctx.surface);
      }
    } else if (n.text) {
      const c = fill?.color;
      if (c) {
        const chars = n.text.characters.trim();
        if (!isNeutral(c)) {
          const m = meaningOf(c);
          const statusLike = /^[+\-−–\d]/.test(chars) || m === "negative" || m === "positive" || m === "warning";
          hit(n, statusLike ? `text/status-${m}` : "link", "text", fill, ctx.surface);
        } else if (onContrast(ctx.surface)) {
          // Текст на плашке, контрастной экрану («Меню» на тёмной, белое на
          // цветной), — своя роль: его цвет задаёт плашка, а не иерархия текста.
          hit(n, "text/on-color", "text", fill, ctx.surface);
        } else {
          const h = hit(n, "text/primary", "text", fill, ctx.surface);
          if (h) neutral.push({ hit: h, kind: "text", k: contrast(c, ctx.surface) });
        }
      }
    } else if (control) {
      // Элемент управления — по имени и форме (чекбокс, переключатель,
      // кнопка-иконка, таб, прогресс). Его состояние — из варианта или имени.
      const b = body(n);
      // Состояние из варианта или имени; чекбокс без них (отвязанный фрейм) —
      // по виду: плотная заливка — отмечен, бледная — нет.
      const named = controlState(n.name, n.component?.setName ?? "", n.component?.name ?? "") ?? undefined;
      const seen = control === "check" && b?.paint.color ? (contrast(b.paint.color, ctx.surface) >= 3 ? "on" : "off") : undefined;
      const st = named ?? seen;
      curState = st ?? ctx.state;
      const key = CONTROL_KEYS[control];
      if (b) {
        hit(n, key, "fill", b.paint, ctx.surface, b.node);
        claimed.add(b.node.id);
      }
      if (stroke) hit(n, `${key}/stroke`, "stroke", stroke, ctx.surface);
      const c = b?.paint.color;
      next = { ...ctx, surface: c ? composite(c, ctx.surface) : ctx.surface, surfacePaint: b?.paint ?? ctx.surfacePaint, owner: key, ownerPaint: b?.paint, ownerStroke: stroke, state: curState };
    } else if (isHeader(n, ctx, W)) {
      hit(n, "header", "fill", fill, ctx.surface);
    } else if (isBubble(n, W)) {
      const b = body(n);
      hit(n, "bubble", "fill", b?.paint, ctx.surface, b?.node);
      if (b) claimed.add(b.node.id);
      const c = b?.paint.color;
      next = { ...ctx, surface: c ? composite(c, ctx.surface) : ctx.surface, surfacePaint: b?.paint ?? ctx.surfacePaint, owner: "bubble", ownerPaint: b?.paint };
    } else if (isBadge(n)) {
      const b = body(n);
      hit(n, "badge", "fill", b?.paint, ctx.surface, b?.node);
      const c = b?.paint.color;
      next = { ...ctx, surface: c ? composite(c, ctx.surface) : ctx.surface, surfacePaint: b?.paint ?? ctx.surfacePaint, owner: "badge", ownerPaint: b?.paint };
    } else if (CONTAINERS.has(n.type) && isButtonLike(n) && hasBoundary(n, ctx.surface, onMedia)) {
      // Кнопка над картой — плавающая, какой бы формы ни была.
      const role = onMedia ? "action-floating" : actionRole(n, ctx, W);
      const b = body(n);
      hit(n, role, "fill", b?.paint, ctx.surface, b?.node);
      if (stroke) hit(n, `${role}/stroke`, "stroke", stroke, ctx.surface);
      claimed.add(n.id);
      if (b) claimed.add(b.node.id);
      const c = b?.paint.color;
      const surface = c ? composite(c, ctx.surface) : ctx.surface;
      paint(n, b?.paint, ctx.surface);
      next = { ...ctx, surface, surfacePaint: b?.paint ?? ctx.surfacePaint, owner: role, ownerPaint: b?.paint, ownerStroke: stroke };
    } else if (isRow(n, parent, W)) {
      // Строка списка — роль у плашки; тексты внутри — обычная иерархия.
      const b = body(n);
      hit(n, "row", "fill", b?.paint, ctx.surface, b?.node);
      if (stroke) hit(n, "row/stroke", "stroke", stroke, ctx.surface);
      if (b) claimed.add(b.node.id);
      const c = b?.paint.color;
      paint(n, b?.paint, ctx.surface);
      next = { ...ctx, surface: c ? composite(c, ctx.surface) : ctx.surface, surfacePaint: b?.paint ?? ctx.surfacePaint };
    } else if (isInput(n, W)) {
      hit(n, "input", "fill", fill, ctx.surface);
      hit(n, "input/stroke", "stroke", stroke, ctx.surface);
      next = { ...ctx, surface: fill?.color ? composite(fill.color, ctx.surface) : ctx.surface, surfacePaint: fill ?? ctx.surfacePaint, owner: "input", ownerPaint: fill, ownerStroke: stroke };
    } else if (CONTAINERS.has(n.type) && isFab(n)) {
      const b = body(n);
      hit(n, "action-floating", "fill", b?.paint, ctx.surface, b?.node);
      if (b) claimed.add(b.node.id);
      const c = b?.paint.color;
      next = { ...ctx, surface: c ? composite(c, ctx.surface) : ctx.surface, surfacePaint: b?.paint ?? ctx.surfacePaint, owner: "action-floating", ownerPaint: b?.paint };
    } else if (isChip(n, W)) {
      const b = body(n);
      hit(n, "chip", "fill", b?.paint, ctx.surface, b?.node);
      if (stroke) hit(n, "chip/stroke", "stroke", stroke, ctx.surface);
      if (b) claimed.add(b.node.id);
      const c = b?.paint.color;
      next = { ...ctx, surface: c ? composite(c, ctx.surface) : ctx.surface, surfacePaint: b?.paint ?? ctx.surfacePaint, owner: "chip", ownerPaint: b?.paint, ownerStroke: stroke };
    } else if (SHAPES.has(n.type) && n.height <= 6 && n.width >= 16 && n.width <= 120 && (n.radius ?? 0) >= 1 && isHandle(n, ctx)) {
      hit(n, "handle", "fill", fill, ctx.surface);
    } else if (SHAPES.has(n.type) && ((n.height <= 2 && n.width >= W * 0.3) || (n.width <= 2 && n.height >= 24))) {
      hit(n, "divider", fill ? "fill" : "stroke", fill ?? stroke, ctx.surface);
    } else if (SHAPES.has(n.type) && n.height <= 4 && n.width >= 24) {
      hit(n, "tab/indicator", "fill", fill, ctx.surface);
    } else if (SHAPES.has(n.type) && Math.max(n.width, n.height) <= 32 && n.children.length === 0) {
      const c = fill?.color;
      if (c && isNeutral(c) && onContrast(ctx.surface)) {
        // Иконка на контрастной плашке — своя роль: её цвет задаёт плашка.
        hit(n, "icon/on-color", "icon", fill, ctx.surface);
      } else if (c && isNeutral(c)) {
        const h = hit(n, "icon/primary", "icon", fill, ctx.surface);
        if (h) neutral.push({ hit: h, kind: "icon", k: contrast(c, ctx.surface) });
      } else if (c) {
        const m = meaningOf(c);
        const name = tokenName(fill);
        const decor = name !== undefined && !FG_FAMILY.test(name) && !STATUS_WORDS.test(name);
        const key = decor ? "decor" : m === "accent" ? "accent" : `status-${m}`;
        hit(n, `icon/${key}`, "icon", fill, ctx.surface);
      }
      if (stroke) hit(n, "icon/stroke", "stroke", stroke, ctx.surface);
    } else if (SHAPES.has(n.type) && n.children.length === 0 && fill?.color && !(n.width >= W * 0.9 && n.height >= H * 0.8)) {
      // Бесформенная крупная фигура — декор: круг под иконкой, стрелка на карте.
      hit(n, `decor/${isNeutral(fill.color) ? "neutral" : meaningOf(fill.color)}`, "fill", fill, ctx.surface);
      paint(n, fill, ctx.surface);
    } else if (fill?.color) {
      const c = fill.color;
      const full = n.width >= W * 0.9 && n.height >= H * 0.8;
      let key: string;
      const named = /modal|dialog|alert|модал|диалог/i.test(`${n.name} ${n.component?.setName ?? ""}`);
      if (full && c.a < 0.85) key = "overlay";
      else if (n.width >= W * 0.95 && n.y + n.height >= H - 4 && n.height < H * 0.97 && n.y >= 24) key = "sheet";
      else if ((overlaySeen || named) && (n.radius ?? 0) >= 12 && n.width >= W * 0.6 && n.width < W * 0.95 && n.children.length > 0) key = "modal";
      // Карточка, залитая токеном кнопки, — нажимаемая плитка: так решил автор.
      else if (n.children.length > 0 && (n.radius ?? 0) >= 8 && ACTION_WORDS.test(tokenName(fill) ?? "")) key = "action-tile";
      else if (!isNeutral(c)) key = `card-tint/${meaningOf(c)}`;
      else if (n.children.length > 0 && (n.radius ?? 0) >= 8) key = "card";
      else key = "surface";
      if (key === "overlay") overlaySeen = true;
      paint(n, fill, ctx.surface);
      hit(n, key, "fill", fill, ctx.surface);
      if (stroke) hit(n, `${key}/stroke`, "stroke", stroke, ctx.surface);
      const opaque = c.a > 0.85;
      const isBase = key === "sheet" || key === "modal";
      next = {
        ...ctx,
        surface: opaque ? composite(c, ctx.surface) : ctx.surface,
        surfacePaint: opaque ? fill : ctx.surfacePaint,
        base: isBase ? { x: n.x, y: n.y, width: n.width, height: n.height } : ctx.base,
        place: isBase || key === "card" ? (key as Place) : key.startsWith("card-tint") || key === "action-tile" ? "card" : ctx.place,
      };
    } else if (stroke) {
      hit(n, "surface/stroke", "stroke", stroke, ctx.surface);
    }

    for (const c of n.children) visit(c, n, next, false);
    quiet = wasQuiet;
  };

  /** Ручка шторки: короткая полоска по центру у верха основы — при любой ширине до 120. */
  const isHandle = (n: NNode, ctx: Ctx) => {
    if (n.width <= 48) return true;
    const centered = Math.abs(n.x + n.width / 2 - (ctx.base.x + ctx.base.width / 2)) <= 8;
    return centered && n.y - ctx.base.y <= 24;
  };

  visit(screen, null, { screen, surface: WHITE, base: { x: screen.x, y: screen.y, width: W, height: H }, owner: null, place: "screen", component: null }, true);

  // Уровни нейтрального текста и иконок — относительно самого контрастного
  // на экране (в логарифмах): абсолютные пороги у продуктов разные — у
  // одного вторичный текст — чёрный 29 %, у другого — серый 60 %.
  // Точка отсчёта общая для текста и иконок: единственная серая иконка
  // экрана не должна стать «основной» только потому, что сравнить не с чем.
  const max = Math.max(1.0001, ...neutral.map((x) => x.k));
  for (const kind of ["text", "icon"] as const) {
    const list = neutral.filter((x) => x.kind === kind);
    for (const x of list) {
      const r = Math.log(Math.max(1, x.k)) / Math.log(max);
      x.hit.key = `${kind}/${r >= 0.75 ? "primary" : r >= 0.25 ? "secondary" : "tertiary"}`;
    }
  }
  return { hits, skipped };
}

/** Удобство для тестов и отладки: ключ роли по имени узла (первое совпадение). */
export function keysByName(roles: ScreenRoles): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const h of roles.hits) out.set(h.nodeName, [...(out.get(h.nodeName) ?? []), h.key]);
  return out;
}
