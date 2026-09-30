/**
 * Ошибки в образцах (решение Principal Designer, 2026-09-30: «образцовые
 * макеты тоже могут быть собраны неправильно — аналитик должен это
 * учитывать и подсвечивать»). Чистая логика, без имён продуктов.
 *
 * При изучении копим наблюдения; проверяем, когда известны значения
 * токенов библиотеки в обеих темах:
 * - другая тема: пара «текст или иконка + поверхность под ней» читается в
 *   теме образца, но не читается в другой (inverse на плашке, которая не
 *   меняется с темой, и наоборот);
 * - чужое семейство: слой покрашен токеном семейства, которым этот слой в
 *   образцах почти не красят (текст — токеном иконок);
 * - низкий контраст прямо в образце;
 * - цвет без токена, нарисованный вручную.
 */

import { hexToRgba, toHex } from "../map/color";
import type { Example, TokenRef } from "./language";
import { contrast, type Layer, type RoleHit } from "./roles";

/**
 * Ниже — явно не читается. Норма WCAG для крупного текста — 3, но белый на
 * фирменном зелёном у главных кнопок продукта бывает 2,9: строгая проверка
 * WCAG — шаг «Проверить», здесь ищем явные ошибки сборки образца.
 */
export const MIN_CONTRAST = 2;
/** Примеров на наблюдение — чтобы подсветить места, не раздувая хранилище. */
const EXAMPLES = 3;
/** Роли, где низкий контраст задуман: третичное, метки, декор, неактивное. */
const QUIET_ROLES = /tertiary|\/meta$|\/part$|^decor|disabled|^handle|^divider|stroke$/;

export interface PairObservation {
  fg: TokenRef;
  bg: TokenRef;
  layer: Layer;
  role: string;
  light: number;
  dark: number;
  examples: Example[];
}

export interface TokenUse {
  layer: Layer;
  token: TokenRef;
  count: number;
  examples: Example[];
}

export interface LowContrast {
  role: string;
  fg: string;
  bg: string;
  ratio: number;
  count: number;
  examples: Example[];
}

export interface RawColor {
  role: string;
  hex: string;
  count: number;
  examples: Example[];
}

export interface QualityObservations {
  pairs: PairObservation[];
  uses: TokenUse[];
  low: LowContrast[];
  raw: RawColor[];
}

function push(list: Example[], e: Example): void {
  if (list.length < EXAMPLES && !list.some((x) => x.screenId === e.screenId)) list.push(e);
}

const tokenOf = (h: RoleHit["paint"]): TokenRef | null => (h.variable ? { key: h.variable.key, name: h.variable.name, collection: h.variable.collection } : null);

/**
 * Текст или иконка, чью читаемость проверяем: не тихая роль, не бледная
 * задуманно, и плагин уверен в плашке под ней. null — не проверяем.
 */
function readingCase(hit: RoleHit): { ratio: number; fg: TokenRef | null; bg: TokenRef | null } | null {
  if ((hit.layer !== "text" && hit.layer !== "icon") || QUIET_ROLES.test(hit.key) || !hit.paint.color) return null;
  // Полупрозрачный текст и иконки (≤ 40 %) бледные задуманно — плейсхолдеры, третичное.
  if (hit.paint.color.a <= 0.4) return null;
  const ratio = contrast(hit.paint.color, hit.surface);
  const fg = tokenOf(hit.paint);
  const bg = hit.under ? tokenOf(hit.under) : null;
  // Цвет буквально совпадает с поверхностью (или тот же токен) — плагин не
  // угадал плашку под элементом (кружок слайдера, аватар): это предел
  // распознавания, а не ошибка образца. Тёмная иконка на тёмном фоне
  // (контраст 1,1, разные токены) — ошибка, её оставляем.
  if (ratio < 1.02 || (fg && bg && fg.key === bg.key)) return null;
  return { ratio, fg, bg };
}

export class QualityCollector {
  private pairs = new Map<string, PairObservation>();
  private uses = new Map<string, TokenUse>();
  private low = new Map<string, LowContrast>();
  private raw = new Map<string, RawColor>();

  observe(hit: RoleHit, example: Example, dark: boolean): void {
    const fg = tokenOf(hit.paint);
    if (fg) {
      const k = `${hit.layer}|${fg.key}`;
      const u = this.uses.get(k) ?? { layer: hit.layer, token: fg, count: 0, examples: [] };
      u.count++;
      push(u.examples, example);
      this.uses.set(k, u);
    } else if (hit.origin === "free" && hit.paint.color) {
      const hex = toHex(hit.paint.color);
      const k = `${hit.key}|${hex}`;
      const r = this.raw.get(k) ?? { role: hit.key, hex, count: 0, examples: [] };
      r.count++;
      push(r.examples, example);
      this.raw.set(k, r);
    }
    const c = readingCase(hit);
    if (!c) return;
    const { ratio, bg } = c;
    // Пару проверяем в другой теме, только если в образце элемент читается.
    if (fg && bg && ratio >= MIN_CONTRAST) {
      const k = `${hit.layer}|${fg.key}|${bg.key}`;
      const p = this.pairs.get(k) ?? { fg, bg, layer: hit.layer, role: hit.key, light: 0, dark: 0, examples: [] };
      if (dark) p.dark++;
      else p.light++;
      push(p.examples, example);
      this.pairs.set(k, p);
    }
    if (ratio < MIN_CONTRAST) {
      const fgName = fg?.name ?? toHex(hit.paint.color!);
      const bgHex = toHex(hit.surface);
      const k = `${hit.key}|${fgName}|${bgHex}`;
      const l = this.low.get(k) ?? { role: hit.key, fg: fgName, bg: bgHex, ratio, count: 0, examples: [] };
      l.count++;
      l.ratio = Math.min(l.ratio, ratio);
      push(l.examples, example);
      this.low.set(k, l);
    }
  }

  result(): QualityObservations {
    return { pairs: [...this.pairs.values()], uses: [...this.uses.values()], low: [...this.low.values()], raw: [...this.raw.values()] };
  }
}

/** Сумма наблюдений нескольких файлов образцов. */
export function mergeQuality(list: Array<QualityObservations | undefined>): QualityObservations {
  const pairs = new Map<string, PairObservation>();
  const uses = new Map<string, TokenUse>();
  const low = new Map<string, LowContrast>();
  const raw = new Map<string, RawColor>();
  const ex = (a: Example[], b: Example[]) => [...a, ...b].slice(0, EXAMPLES);
  for (const q of list) {
    if (!q) continue;
    for (const p of q.pairs) {
      const k = `${p.layer}|${p.fg.key}|${p.bg.key}`;
      const into = pairs.get(k);
      pairs.set(k, into ? { ...into, light: into.light + p.light, dark: into.dark + p.dark, examples: ex(into.examples, p.examples) } : { ...p, examples: [...p.examples] });
    }
    for (const u of q.uses) {
      const k = `${u.layer}|${u.token.key}`;
      const into = uses.get(k);
      uses.set(k, into ? { ...into, count: into.count + u.count, examples: ex(into.examples, u.examples) } : { ...u, examples: [...u.examples] });
    }
    for (const l of q.low) {
      const k = `${l.role}|${l.fg}|${l.bg}`;
      const into = low.get(k);
      low.set(k, into ? { ...into, count: into.count + l.count, ratio: Math.min(into.ratio, l.ratio), examples: ex(into.examples, l.examples) } : { ...l, examples: [...l.examples] });
    }
    for (const r of q.raw) {
      const k = `${r.role}|${r.hex}`;
      const into = raw.get(k);
      raw.set(k, into ? { ...into, count: into.count + r.count, examples: ex(into.examples, r.examples) } : { ...r, examples: [...r.examples] });
    }
  }
  return { pairs: [...pairs.values()], uses: [...uses.values()], low: [...low.values()], raw: [...raw.values()] };
}

// ---------------------------------------------------------------------------
// Проверки
// ---------------------------------------------------------------------------

export type IssueKind = "other-theme" | "family" | "low-contrast" | "raw";

export interface QualityIssue {
  kind: IssueKind;
  level: "risk" | "doubt";
  title: string;
  lines: string[];
  count: number;
  examples: Example[];
}

export interface ThemedToken {
  key: string;
  name: string;
  hexLight?: string;
  hexDark?: string;
}

/** Контраст по hex: цвет с прозрачностью — поверх поверхности, поверхность с прозрачностью — поверх белого / чёрного по теме. */
function hexContrast(fg: string, bg: string, dark: boolean): number | null {
  const f = hexToRgba(fg);
  const b = hexToRgba(bg);
  if (!f || !b) return null;
  const base = dark ? { r: 0, g: 0, b: 0, a: 1 } : { r: 1, g: 1, b: 1, a: 1 };
  const solidBg = { r: b.r * b.a + base.r * (1 - b.a), g: b.g * b.a + base.g * (1 - b.a), b: b.b * b.a + base.b * (1 - b.a), a: 1 };
  return contrast(f, solidBg);
}

/** Семейство токена — первая часть имени до «/» (или до «-»): «Texts», «Icons», «text». */
export function familyOf(name: string): string {
  return name.includes("/") ? name.split("/")[0] : name.split("-")[0];
}

const LAYER_WORD: Record<Layer, string> = { text: "Текст", icon: "Иконку", fill: "Заливку", stroke: "Обводку" };

export interface PairVerdict {
  light: number;
  dark: number;
  fgStatic: boolean;
  bgStatic: boolean;
  /** В одной теме читается, в другой — нет. */
  unreadable: boolean;
  /** Плашка не меняется с темой, а цвет на ней меняется. */
  drifts: boolean;
}

const sameHex = (a?: string, b?: string) => (a ?? "").toLowerCase().slice(0, 7) === (b ?? "").toLowerCase().slice(0, 7);

/** Как пара «цвет на плашке» ведёт себя в двух темах; null — значений тем нет. */
export function pairVerdict(f: ThemedToken | undefined, b: ThemedToken | undefined): PairVerdict | null {
  if (!f?.hexLight || !f.hexDark || !b?.hexLight || !b.hexDark) return null;
  const light = hexContrast(f.hexLight, b.hexLight, false);
  const dark = hexContrast(f.hexDark, b.hexDark, true);
  if (light === null || dark === null) return null;
  const fgStatic = sameHex(f.hexLight, f.hexDark);
  const bgStatic = sameHex(b.hexLight, b.hexDark);
  return { light, dark, fgStatic, bgStatic, unreadable: Math.min(light, dark) < MIN_CONTRAST && Math.max(light, dark) >= MIN_CONTRAST, drifts: bgStatic && !fgStatic };
}

/** Почему случай не берём в правило (решение Principal Designer, 2026-09-30). */
export type SetAsideReason = "other-theme" | "low-contrast" | "family";

/**
 * Похож ли этот случай на ошибку сборки образца — по нему одному, без
 * статистики: не читается прямо в образце или разъедется в другой теме.
 * Чужое семейство видно только по всем образцам — `alienTokens`.
 */
export function suspectOf(hit: RoleHit, tokens: Map<string, ThemedToken>): SetAsideReason | null {
  const c = readingCase(hit);
  if (!c) return null;
  if (c.ratio < MIN_CONTRAST) return "low-contrast";
  if (c.fg && c.bg) {
    const v = pairVerdict(tokens.get(c.fg.key), tokens.get(c.bg.key));
    if (v && (v.drifts || v.unreadable)) return "other-theme";
  }
  return null;
}

/** Доля семейства, при которой слой «красят им»; меньше этой — чужое. */
const FAMILY_TOP = 0.7;
const FAMILY_ALIEN = 0.1;
const FAMILY_MIN = 20;

/**
 * Чужое семейство: текст или иконку почти всегда красят одним семейством
 * токенов, а этот токен — из другого, редкого. Ключ — `layer|имя токена`.
 */
export function alienTokens(uses: Array<{ layer: Layer; name: string; count: number }>): Map<string, { top: string; share: number; family: string }> {
  const out = new Map<string, { top: string; share: number; family: string }>();
  for (const layer of ["text", "icon"] as Layer[]) {
    const list = uses.filter((u) => u.layer === layer);
    const total = list.reduce((s, u) => s + u.count, 0);
    if (total < FAMILY_MIN) continue;
    const fam = new Map<string, number>();
    for (const u of list) fam.set(familyOf(u.name), (fam.get(familyOf(u.name)) ?? 0) + u.count);
    const [top, n] = [...fam.entries()].sort((a, b) => b[1] - a[1])[0];
    if (n / total < FAMILY_TOP) continue;
    for (const u of list) {
      const f = familyOf(u.name);
      if (f === top || (fam.get(f) ?? 0) / total > FAMILY_ALIEN) continue;
      out.set(`${layer}|${u.name}`, { top, share: n / total, family: f });
    }
  }
  return out;
}

export function checkExemplars(q: QualityObservations | undefined, tokens: ThemedToken[]): QualityIssue[] {
  if (!q) return [];
  const out: QualityIssue[] = [];
  const byKey = new Map(tokens.map((t) => [t.key, t]));

  // 1. Другая тема: цвет и плашка под ним по-разному ведут себя с темой.
  for (const p of q.pairs) {
    const f = byKey.get(p.fg.key);
    const b = byKey.get(p.bg.key);
    const v = pairVerdict(f, b);
    if (!f || !b || !v) continue;
    const { light, dark, fgStatic, bgStatic, unreadable, drifts } = v;
    if (!drifts && !unreadable) continue;
    const seenDark = p.dark > p.light;
    const other = seenDark ? "светлой" : "тёмной";
    out.push({
      kind: "other-theme",
      level: unreadable ? "risk" : "doubt",
      title: unreadable
        ? `${p.fg.name} на ${p.bg.name}: в ${Math.min(light, dark) === dark ? "тёмной" : "светлой"} теме не читается`
        : `${p.fg.name} на ${p.bg.name}: в ${other} теме подпись поменяет цвет, а плашка — нет`,
      lines: [
        `${f.name}: светлая ${f.hexLight}, тёмная ${f.hexDark}${fgStatic ? " — не меняется" : ""}. ${b.name}: светлая ${b.hexLight}, тёмная ${b.hexDark}${bgStatic ? " — не меняется" : ""}.`,
        `Контраст в светлой теме ${light.toFixed(1)}, в тёмной — ${dark.toFixed(1)}.`,
        drifts
          ? "На плашке, которая не меняется с темой, цвет тоже должен не меняться (static). Похоже на ошибку сборки образца — в правило не берём, если это не основной вариант."
          : "Цвет и плашка меняются с темой несогласованно. Похоже на ошибку сборки образца — в правило не берём, если это не основной вариант.",
      ],
      count: p.light + p.dark,
      examples: p.examples,
    });
  }

  // 2. Чужое семейство: слой почти всегда красят одним семейством, а тут — другим.
  const alien = alienTokens(q.uses.map((u) => ({ layer: u.layer, name: u.token.name, count: u.count })));
  for (const u of q.uses) {
    const a = alien.get(`${u.layer}|${u.token.name}`);
    if (!a) continue;
    out.push({
      kind: "family",
      level: "doubt",
      title: `${LAYER_WORD[u.layer]} покрасили ${u.token.name}`,
      lines: [
        `${LAYER_WORD[u.layer]} в образцах красят токенами «${a.top}/…» (${Math.round(a.share * 100)} %), а тут — «${a.family}/…», ${u.count} раз.`,
        "Токен другого семейства может выглядеть так же сейчас, но разойтись при правке библиотеки или в другой теме.",
      ],
      count: u.count,
      examples: u.examples,
    });
  }

  // 3. Низкий контраст прямо в образце.
  for (const l of q.low.sort((a, b) => b.count - a.count).slice(0, 15)) {
    out.push({
      kind: "low-contrast",
      level: "risk",
      title: `Плохо читается: ${l.fg} на ${l.bg}`,
      lines: [`Контраст ${l.ratio.toFixed(1)} — ${l.count} раз. Ниже ${MIN_CONTRAST} текст и иконки явно не читаются.`],
      count: l.count,
      examples: l.examples,
    });
  }

  // 4. Цвет без токена, нарисованный вручную.
  for (const r of q.raw.sort((a, b) => b.count - a.count).slice(0, 15)) {
    out.push({
      kind: "raw",
      level: "doubt",
      title: `Цвет без токена: ${r.hex}`,
      lines: [`Нарисован вручную ${r.count} раз, роль — ${r.role}. В образце цвет должен идти токеном — иначе он не поменяется с темой.`],
      count: r.count,
      examples: r.examples,
    });
  }
  return out.sort((a, b) => (a.level === b.level ? b.count - a.count : a.level === "risk" ? -1 : 1));
}
