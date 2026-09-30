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
import { isSystemName } from "../lib/system";
import { hueFamily, isNeutral, type Rgba } from "../map/color";
import { solidFill, solidStroke, texts, type NNode, type NPaint } from "./node";

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
}

export type Place = "screen" | "sheet" | "modal" | "card";

export interface ScreenRoles {
  hits: RoleHit[];
  /** Что не читали: системное, аннотации, картинки. */
  skipped: { system: number; annotation: number; media: number };
}

const SHAPES = new Set(["VECTOR", "BOOLEAN_OPERATION", "ELLIPSE", "STAR", "POLYGON", "LINE", "RECTANGLE"]);
const CONTAINERS = new Set(["FRAME", "INSTANCE", "COMPONENT", "GROUP", "RECTANGLE"]);
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

interface Ctx {
  screen: NNode;
  surface: Rgba;
  /** Нижний край ближайшего контейнера-основы (шторка, модалка, экран) — для «главного действия». */
  baseBottom: number;
  /** Роль, внутри которой находимся: текст и иконки внутри кнопки — её подпись и иконка. */
  owner: string | null;
  place: Place;
}

function labelTexts(n: NNode): NNode[] {
  return texts(n).filter((t) => (t.text?.characters.trim().length ?? 0) > 0);
}

/** Подпись по центру: сначала выравнивание текста (рамка поля ввода часто во всю ширину), потом геометрия. */
function isCentered(n: NNode, label: NNode): boolean {
  const align = label.text?.align;
  if (align === "C" || align === "CENTER") return true;
  if (align === "L" || align === "LEFT" || align === "R" || align === "RIGHT") {
    // Текст «по левому краю» в рамке по ширине содержимого — всё равно по центру кнопки.
    const mid = label.x + label.width / 2;
    return label.width < n.width * 0.8 && Math.abs(mid - (n.x + n.width / 2)) <= n.width * 0.08;
  }
  const mid = label.x + label.width / 2;
  return Math.abs(mid - (n.x + n.width / 2)) <= n.width * 0.08;
}

export function isButtonLike(n: NNode): boolean {
  if (!CONTAINERS.has(n.type) || n.children.length === 0) return false;
  if (n.height < 32 || n.height > 72 || n.width < 64) return false;
  if (!solidFill(n) && !solidStroke(n)) return false;
  const labels = labelTexts(n);
  if (labels.length < 1 || labels.length > 2) return false;
  if (labels.reduce((s, t) => s + (t.text?.characters.length ?? 0), 0) > 40) return false;
  return isCentered(n, labels[0]);
}

function isFab(n: NNode): boolean {
  if (/(^|\/)fab/i.test(n.component?.setName || n.name)) return true;
  const square = Math.abs(n.width - n.height) <= 8 && n.width >= 40 && n.width <= 64;
  return square && labelTexts(n).length === 0 && (n.radius ?? 0) >= 12 && Boolean(solidFill(n));
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
  if ((n.radius ?? 0) < 6 || (!solidFill(n) && !solidStroke(n))) return false;
  const labels = labelTexts(n);
  return labels.length >= 1 && labels.length <= 2 && labels.every((t) => (t.text?.characters.length ?? 0) <= 24);
}

function actionRole(n: NNode, ctx: Ctx, W: number): ActionRole {
  if (isFab(n)) return "action-floating";
  const id = `${n.name} ${n.component?.name ?? ""} ${n.component?.setName ?? ""}`;
  if (/disabled|inactive|неактив/i.test(id)) return "action-disabled";
  const fill = solidFill(n)?.color;
  const label = labelTexts(n)[0];
  const labelColor = label ? solidFill(label)?.color : undefined;
  const reddish = (c?: Rgba) => Boolean(c && !isNeutral(c) && meaningOf(c) === "negative");
  if (reddish(fill) || reddish(labelColor)) return "action-destructive";
  const strong = fill ? contrast(fill, ctx.surface) >= 1.8 : false;
  if (!strong) return "action-secondary";
  const bottomAnchored = Math.abs(n.y + n.height - ctx.baseBottom) <= 8;
  if (n.width >= W * 0.9 && bottomAnchored) return "action-main";
  return "action-primary";
}

// ---------------------------------------------------------------------------
// Обход
// ---------------------------------------------------------------------------

export function detectRoles(screen: NNode): ScreenRoles {
  const W = screen.width;
  const H = screen.height;
  const hits: RoleHit[] = [];
  const skipped = { system: 0, annotation: 0, media: 0 };
  const claimed = new Set<string>();
  /** Нарисованное в порядке отрисовки: поверхность под элементом — последнее, что его накрывает. */
  const painted: Array<{ x: number; y: number; w: number; h: number; color: Rgba }> = [];
  let overlaySeen = false;
  let screenBg: Rgba = WHITE;
  /** Нейтральный текст и иконки: уровень считается после обхода — относительно самого контрастного на экране. */
  const neutral: Array<{ hit: RoleHit; kind: "text" | "icon"; k: number }> = [];

  let place: Place = "screen";
  const hit = (n: NNode, key: string, layer: Layer, paint: NPaint | undefined, surface: Rgba) => {
    if (!paint?.color) return undefined;
    const h: RoleHit = { nodeId: n.id, nodeName: n.name, key, layer, paint, surface, place };
    hits.push(h);
    return h;
  };

  const surfaceAt = (n: NNode, fallback: Rgba): Rgba => {
    const cx = n.x + n.width / 2;
    const cy = n.y + n.height / 2;
    for (let i = painted.length - 1; i >= 0; i--) {
      const p = painted[i];
      if (cx >= p.x && cx <= p.x + p.w && cy >= p.y && cy <= p.y + p.h) return p.color;
    }
    return fallback;
  };

  const paint = (n: NNode, color: Rgba | undefined, under: Rgba) => {
    if (color) painted.push({ x: n.x, y: n.y, w: n.width, h: n.height, color: composite(color, under) });
  };

  const visit = (n: NNode, ctx: Ctx, root: boolean) => {
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
    if (n.fills.some((p) => p.kind === "image")) skipped.media++;

    const fill = solidFill(n);
    const stroke = solidStroke(n);
    ctx = { ...ctx, surface: root ? WHITE : surfaceAt(n, ctx.surface) };
    place = ctx.place;
    let next: Ctx = ctx;

    if (root) {
      hit(n, "screen-bg", "fill", fill, WHITE);
      if (fill?.color && fill.color.a > 0.5) {
        screenBg = composite(fill.color, WHITE);
        next = { ...ctx, surface: screenBg };
      }
    } else if (ctx.owner) {
      // Внутри кнопки, поля, чипа: текст — подпись, мелкая форма — иконка,
      // прочие заливки — детали (таймер в кнопке), чтобы не путать с её заливкой.
      if (n.text) hit(n, `${ctx.owner}/label`, "text", fill, ctx.surface);
      else if (SHAPES.has(n.type) && Math.max(n.width, n.height) <= 32) hit(n, `${ctx.owner}/icon`, "icon", fill, ctx.surface);
      else if (fill && n.type !== "TEXT" && !claimed.has(n.id)) hit(n, `${ctx.owner}/part`, "fill", fill, ctx.surface);
    } else if (n.text) {
      const c = fill?.color;
      if (c) {
        const chars = n.text.characters.trim();
        if (!isNeutral(c)) {
          const m = meaningOf(c);
          const statusLike = /^[+\-−–\d]/.test(chars) || m === "negative" || m === "positive" || m === "warning";
          hit(n, statusLike ? `text/status-${m}` : "link", "text", fill, ctx.surface);
        } else if (!isNeutral(ctx.surface) && contrast(ctx.surface, screenBg) >= 1.8) {
          // Текст на насыщенной цветной плитке («Меню», «Инфо») — своя роль:
          // его цвет задаёт плитка, а не иерархия текста экрана.
          hit(n, "text/on-color", "text", fill, ctx.surface);
        } else {
          const h = hit(n, "text/primary", "text", fill, ctx.surface);
          if (h) neutral.push({ hit: h, kind: "text", k: contrast(c, ctx.surface) });
        }
      }
    } else if (isInput(n, W)) {
      hit(n, "input", "fill", fill, ctx.surface);
      hit(n, "input/stroke", "stroke", stroke, ctx.surface);
      next = { ...ctx, surface: fill?.color ? composite(fill.color, ctx.surface) : ctx.surface, owner: "input" };
    } else if (CONTAINERS.has(n.type) && isButtonLike(n)) {
      const role = actionRole(n, ctx, W);
      hit(n, role, "fill", fill, ctx.surface);
      if (stroke) hit(n, `${role}/stroke`, "stroke", stroke, ctx.surface);
      claimed.add(n.id);
      const surface = fill?.color ? composite(fill.color, ctx.surface) : ctx.surface;
      paint(n, fill?.color, ctx.surface);
      next = { ...ctx, surface, owner: role };
    } else if (CONTAINERS.has(n.type) && isFab(n)) {
      hit(n, "action-floating", "fill", fill, ctx.surface);
      next = { ...ctx, surface: fill?.color ? composite(fill.color, ctx.surface) : ctx.surface, owner: "action-floating" };
    } else if (isChip(n, W)) {
      hit(n, "chip", "fill", fill, ctx.surface);
      if (stroke) hit(n, "chip/stroke", "stroke", stroke, ctx.surface);
      next = { ...ctx, surface: fill?.color ? composite(fill.color, ctx.surface) : ctx.surface, owner: "chip" };
    } else if (SHAPES.has(n.type) && n.height <= 6 && n.width >= 16 && n.width <= 48 && (n.radius ?? 0) >= 1) {
      hit(n, "handle", "fill", fill, ctx.surface);
    } else if (SHAPES.has(n.type) && ((n.height <= 2 && n.width >= W * 0.3) || (n.width <= 2 && n.height >= 24))) {
      hit(n, "divider", fill ? "fill" : "stroke", fill ?? stroke, ctx.surface);
    } else if (SHAPES.has(n.type) && n.height <= 4 && n.width >= 24) {
      hit(n, "tab/indicator", "fill", fill, ctx.surface);
    } else if (SHAPES.has(n.type) && Math.max(n.width, n.height) <= 32 && n.children.length === 0) {
      const c = fill?.color;
      const onColor = !isNeutral(ctx.surface) && contrast(ctx.surface, screenBg) >= 1.8;
      if (c && isNeutral(c) && onColor) {
        // Иконка на насыщенном цветном круге — своя роль: её цвет задаёт
        // круг, а не иерархия иконок экрана.
        hit(n, "icon/on-color", "icon", fill, ctx.surface);
      } else if (c && isNeutral(c)) {
        const h = hit(n, "icon/primary", "icon", fill, ctx.surface);
        if (h) neutral.push({ hit: h, kind: "icon", k: contrast(c, ctx.surface) });
      } else if (c) {
        hit(n, `icon/${meaningOf(c) === "accent" ? "accent" : `status-${meaningOf(c)}`}`, "icon", fill, ctx.surface);
      }
      if (stroke) hit(n, "icon/stroke", "stroke", stroke, ctx.surface);
    } else if (SHAPES.has(n.type) && n.children.length === 0 && fill?.color && !(n.width >= W * 0.9 && n.height >= H * 0.8)) {
      // Бесформенная крупная фигура — декор: круг под иконкой, стрелка на карте.
      hit(n, `decor/${isNeutral(fill.color) ? "neutral" : meaningOf(fill.color)}`, "fill", fill, ctx.surface);
      paint(n, fill.color, ctx.surface);
    } else if (fill?.color) {
      const c = fill.color;
      const full = n.width >= W * 0.9 && n.height >= H * 0.8;
      let key: string;
      const named = /modal|dialog|alert|модал|диалог/i.test(`${n.name} ${n.component?.setName ?? ""}`);
      if (full && c.a < 0.85) key = "overlay";
      else if (n.width >= W * 0.95 && n.y + n.height >= H - 4 && n.height < H * 0.9) key = "sheet";
      else if ((overlaySeen || named) && (n.radius ?? 0) >= 12 && n.width >= W * 0.6 && n.width < W * 0.95 && n.children.length > 0) key = "modal";
      else if (!isNeutral(c)) key = `card-tint/${meaningOf(c)}`;
      else if (n.children.length > 0 && (n.radius ?? 0) >= 8) key = "card";
      else key = "surface";
      if (key === "overlay") overlaySeen = true;
      paint(n, c, ctx.surface);
      hit(n, key, "fill", fill, ctx.surface);
      if (stroke) hit(n, `${key}/stroke`, "stroke", stroke, ctx.surface);
      const opaque = c.a > 0.85;
      next = {
        ...ctx,
        surface: opaque ? composite(c, ctx.surface) : ctx.surface,
        baseBottom: key === "sheet" || key === "modal" ? n.y + n.height : ctx.baseBottom,
        place: key === "sheet" || key === "modal" || key === "card" ? key : key.startsWith("card-tint") ? "card" : ctx.place,
      };
    } else if (stroke) {
      hit(n, "surface/stroke", "stroke", stroke, ctx.surface);
    }

    for (const c of n.children) visit(c, next, false);
  };

  visit(screen, { screen, surface: WHITE, baseBottom: screen.y + screen.height, owner: null, place: "screen" }, true);

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
