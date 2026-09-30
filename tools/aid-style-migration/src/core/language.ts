/**
 * Язык продукта (шаг 4 сквозного плана, Я3): как продукт оформляет каждую
 * роль элемента — по образцовым макетам. Чистая логика: на входе экраны
 * образцов в нормализованном виде, на выходе правила с доказательствами.
 *
 * Изучение копится по источникам: у каждого файла образцов свои
 * наблюдения, повторное изучение файла заменяет только его вклад. Язык —
 * сумма источников. Спорное не решается здесь: правило с несколькими
 * значениями получает статус `disputed` и становится вопросом анкеты
 * (шаг 5).
 */

import { THEME_ROLES } from "../lib/vocabulary";
import { toHex } from "../map/color";
import { texts, walk, type NNode } from "./node";
import type { Decision } from "./questions";
import { detectRoles, type Layer } from "./roles";

export const LANGUAGE_SCHEMA = "aid-style-language/1";

/** proposed — найдено в образцах; confirmed — подтверждено; disputed — оформлено по-разному; missing — роли нет в образцах. */
export type RuleStatus = "proposed" | "confirmed" | "disputed" | "missing";

/** Правило считается однозначным, если главное значение — не меньше этой доли. */
export const DOMINANT_SHARE = 0.8;
/** Примеров на значение — столько, чтобы показать 📍, не раздувая хранилище. */
const EXAMPLES_PER_VALUE = 3;
/** Разных подписей на значение — для объяснения споров: «Принять заказ», «Понятно». */
const LABELS_PER_VALUE = 6;

/**
 * Признаки случая — по ним анкета объясняет спор: «зелёная — в шторке,
 * тёмная — в модалке». Место — контейнер элемента; ширина — у заливок
 * (во всю ширину экрана или нет); тема — светлый или тёмный экран.
 */
export type Feature = "place" | "width" | "theme";
export const FEATURES: Feature[] = ["place", "width", "theme"];

export interface Example {
  screenId: string;
  screenName: string;
  nodeId: string;
  nodeName: string;
}

export interface TokenRef {
  key: string;
  name: string;
  collection: string;
}

export interface RuleValue {
  /** Токен; null — цвет без токена (тогда значение различается по hex). */
  token: TokenRef | null;
  /** Первый встреченный цвет — различает значения без токена. */
  hex: string;
  /** Цвет, как он чаще всего выглядит в светлых и в тёмных экранах образцов. */
  hexLight?: string;
  hexDark?: string;
  /** Поверхность под элементом — чаще всего, по теме: для образца текста на настоящем фоне. */
  surfaceLight?: string;
  surfaceDark?: string;
  /** Счётчики цветов и поверхностей по теме — из них выбирается самое частое. */
  tally?: Partial<Record<"hexLight" | "hexDark" | "surfaceLight" | "surfaceDark", Record<string, number>>>;
  count: number;
  /** Сколько раз в светлых и в тёмных экранах. */
  light: number;
  dark: number;
  examples: Example[];
  /** Признак → значение признака → сколько раз. */
  features: Partial<Record<Feature, Record<string, number>>>;
  /** Подписи на элементе (у кнопок, чипов) или сам текст (у подписей). */
  labels: string[];
}

export interface Counted<T> {
  value: T;
  count: number;
}

export interface LanguageRule {
  /** Ключ роли из распознавания: `action-main`, `action-main/label`, `text/secondary`… */
  role: string;
  layer: Layer;
  status: RuleStatus;
  total: number;
  /** По убыванию частоты. */
  values: RuleValue[];
  /** Стиль текста — у текстовых ролей. */
  textStyles: Array<Counted<{ key: string; name: string }>>;
  /** Регистр подписи: капс кнопок агент терял на этапе 0. */
  textCases: Array<Counted<string>>;
  /** Форма — у заливок: радиус и высота. */
  radius: Array<Counted<number>>;
  height: Array<Counted<number>>;
  /** Решение дизайнера по анкете — есть у `confirmed`. */
  decision?: Decision;
}

export interface LanguageSource {
  fileName: string;
  learnedAt: string;
  screens: number;
  darkScreens: number;
  /** Сколько экранов нашлось всего (читаем выборку). */
  screensFound: number;
  rules: LanguageRule[];
}

export interface StyleLanguage {
  $schema: typeof LANGUAGE_SCHEMA;
  product: { id: string; name: string };
  updatedAt: string;
  sources: Array<Omit<LanguageSource, "rules">>;
  rules: LanguageRule[];
}

/**
 * Роли, которые ждём у любого мобильного продукта. Роли нет в образцах
 * совсем (ни заливки, ни подписи, ни обводки) — правило `missing`: пробел
 * в образцах или в библиотеке, вопрос анкеты. Чип только с обводкой —
 * не пробел: у него есть `chip/stroke`.
 */
export const EXPECTED_ROLES: Array<[string, Layer]> = [
  ["screen-bg", "fill"],
  ["sheet", "fill"],
  ["modal", "fill"],
  ["overlay", "fill"],
  ["card", "fill"],
  ["action-main", "fill"],
  ["action-primary", "fill"],
  ["action-secondary", "fill"],
  ["action-destructive", "fill"],
  ["action-disabled", "fill"],
  ["link", "text"],
  ["input", "fill"],
  ["chip", "fill"],
  ["tab/indicator", "fill"],
  ["divider", "fill"],
  ["text/primary", "text"],
  ["text/secondary", "text"],
  ["text/tertiary", "text"],
  ["icon/primary", "icon"],
  ["icon/secondary", "icon"],
];

// ---------------------------------------------------------------------------
// Накопление
// ---------------------------------------------------------------------------

function bumpCounted<T>(list: Array<Counted<T>>, value: T, same: (a: T, b: T) => boolean, by = 1): void {
  const found = list.find((x) => same(x.value, value));
  if (found) found.count += by;
  else list.push({ value, count: by });
}

const eq = <T>(a: T, b: T) => a === b;
const eqStyle = (a: { key: string }, b: { key: string }) => a.key === b.key;

function valueId(v: Pick<RuleValue, "token" | "hex">): string {
  return v.token ? `t:${v.token.key}` : `h:${v.hex}`;
}

function emptyRule(role: string, layer: Layer): LanguageRule {
  return { role, layer, status: "missing", total: 0, values: [], textStyles: [], textCases: [], radius: [], height: [] };
}

function ruleId(role: string, layer: Layer): string {
  return `${role}|${layer}`;
}

/** Регистр, как его видит читатель: учитываем и textCase, и сами буквы. */
function visibleCase(characters: string, textCase: string): string {
  if (textCase === "UPPER") return "upper";
  if (textCase === "LOWER") return "lower";
  if (textCase === "TITLE") return "title";
  const letters = characters.replace(/[^a-zа-яё]/gi, "");
  if (letters.length < 2) return "mixed";
  if (letters === letters.toUpperCase()) return "upper";
  if (letters === letters.toLowerCase()) return "lower";
  return "sentence";
}

export interface ScreenMeta {
  screenId: string;
  screenName: string;
  dark: boolean;
}

/** Собирает наблюдения по экранам одного источника. */
export class LanguageLearner {
  private rules = new Map<string, LanguageRule>();
  screens = 0;
  darkScreens = 0;

  add(screen: NNode, meta: ScreenMeta): void {
    this.screens++;
    if (meta.dark) this.darkScreens++;
    const byId = new Map<string, NNode>();
    walk(screen, (n) => {
      byId.set(n.id, n);
    });
    for (const hit of detectRoles(screen).hits) {
      const color = hit.paint.color;
      if (!color) continue;
      const id = ruleId(hit.key, hit.layer);
      const rule = this.rules.get(id) ?? emptyRule(hit.key, hit.layer);
      this.rules.set(id, rule);
      rule.total++;

      const v = hit.paint.variable;
      const token = v ? { key: v.key, name: v.name, collection: v.collection } : null;
      const hex = toHex(color);
      const vid = valueId({ token, hex });
      let value = rule.values.find((x) => valueId(x) === vid);
      if (!value) {
        value = { token, hex, count: 0, light: 0, dark: 0, examples: [], features: {}, labels: [] };
        rule.values.push(value);
      }
      value.count++;
      if (meta.dark) value.dark++;
      else value.light++;
      countTally(value, meta.dark ? "hexDark" : "hexLight", hex);
      countTally(value, meta.dark ? "surfaceDark" : "surfaceLight", toHex(hit.surface));
      if (value.examples.length < EXAMPLES_PER_VALUE && !value.examples.some((e) => e.screenId === meta.screenId)) {
        value.examples.push({ screenId: meta.screenId, screenName: meta.screenName, nodeId: hit.nodeId, nodeName: hit.nodeName });
      }

      const node = byId.get(hit.nodeId);
      if (!node) continue;
      const feature = (f: Feature, v: string) => {
        const m = (value.features[f] ??= {});
        m[v] = (m[v] ?? 0) + 1;
      };
      feature("place", hit.place);
      feature("theme", meta.dark ? THEME_ROLES.dark : THEME_ROLES.light);
      if (hit.layer === "fill") feature("width", node.width >= screen.width * 0.9 ? "full" : "part");
      const words = (node.text ? [node.text.characters] : texts(node).map((t) => t.text?.characters ?? ""))
        .map((x) => x.trim().replace(/\s+/g, " "))
        .filter((x) => x.length > 0 && x.length <= 40);
      for (const w of words) if (value.labels.length < LABELS_PER_VALUE && !value.labels.includes(w)) value.labels.push(w);
      if (node.text) {
        if (node.text.styleKey) bumpCounted(rule.textStyles, { key: node.text.styleKey, name: node.text.styleName ?? "" }, eqStyle);
        bumpCounted(rule.textCases, visibleCase(node.text.characters, node.text.textCase), eq);
      } else if (hit.layer === "fill") {
        if (node.radius !== null) bumpCounted(rule.radius, node.radius, eq);
        bumpCounted(rule.height, node.height, eq);
      }
    }
  }

  source(fileName: string, learnedAt: string, screensFound: number): LanguageSource {
    return {
      fileName,
      learnedAt,
      screens: this.screens,
      darkScreens: this.darkScreens,
      screensFound,
      rules: finish([...this.rules.values()]),
    };
  }
}

type TallyKey = "hexLight" | "hexDark" | "surfaceLight" | "surfaceDark";

/**
 * Считаем цвет по теме и держим самое частое в поле. Первый встреченный
 * врёт: на тёмных экранах `Texts/Primary` белый 361 раз и чёрный 14 (на
 * светлых вставках) — показать надо белый.
 */
function countTally(value: RuleValue, key: TallyKey, hex: string, by = 1): void {
  const tally = (value.tally ??= {});
  const m = (tally[key] ??= {});
  m[hex] = (m[hex] ?? 0) + by;
  value[key] = Object.entries(m).sort((a, b) => b[1] - a[1])[0][0];
}

// ---------------------------------------------------------------------------
// Итог
// ---------------------------------------------------------------------------

function byCount<T extends { count: number }>(list: T[]): T[] {
  return [...list].sort((a, b) => b.count - a.count);
}

/** Сортировка, статус и пустые ожидаемые роли. */
function finish(rules: LanguageRule[]): LanguageRule[] {
  const out = rules.map((r): LanguageRule => {
    const values = byCount(r.values);
    const share = r.total ? values[0].count / r.total : 0;
    const status: RuleStatus = r.total === 0 ? "missing" : share >= DOMINANT_SHARE ? "proposed" : "disputed";
    return {
      ...r,
      status,
      values,
      textStyles: byCount(r.textStyles),
      textCases: byCount(r.textCases),
      radius: byCount(r.radius),
      height: byCount(r.height),
    };
  });
  const seen = out.filter((r) => r.total > 0).map((r) => r.role);
  for (const [role, layer] of EXPECTED_ROLES) {
    if (!seen.some((x) => x === role || x.startsWith(`${role}/`))) out.push(emptyRule(role, layer));
  }
  return out.sort((a, b) => a.role.localeCompare(b.role) || a.layer.localeCompare(b.layer));
}

function mergeCounted<T>(into: Array<Counted<T>>, from: Array<Counted<T>>, same: (a: T, b: T) => boolean): void {
  for (const x of from) bumpCounted(into, x.value, same, x.count);
}

/** Язык продукта — сумма источников. Источник с тем же именем файла заменяется целиком. */
export function mergeSources(product: { id: string; name: string }, sources: LanguageSource[], updatedAt: string): StyleLanguage {
  const rules = new Map<string, LanguageRule>();
  for (const s of sources) {
    for (const r of s.rules) {
      if (r.total === 0) continue;
      const id = ruleId(r.role, r.layer);
      const into = rules.get(id) ?? emptyRule(r.role, r.layer);
      rules.set(id, into);
      into.total += r.total;
      for (const v of r.values) {
        const found = into.values.find((x) => valueId(x) === valueId(v));
        if (found) {
          found.count += v.count;
          found.light += v.light;
          found.dark += v.dark;
          for (const [k, m] of Object.entries(v.tally ?? {}) as Array<[TallyKey, Record<string, number>]>) {
            for (const [hex, n] of Object.entries(m)) countTally(found, k, hex, n);
          }
          for (const [f, m] of Object.entries(v.features ?? {}) as Array<[Feature, Record<string, number>]>) {
            const into2 = (found.features[f] ??= {});
            for (const [k, n] of Object.entries(m)) into2[k] = (into2[k] ?? 0) + n;
          }
          for (const w of v.labels ?? []) if (found.labels.length < LABELS_PER_VALUE && !found.labels.includes(w)) found.labels.push(w);
          found.examples = [...found.examples, ...v.examples].slice(0, EXAMPLES_PER_VALUE);
        } else {
          into.values.push({
            ...v,
            examples: [...v.examples],
            features: Object.fromEntries(Object.entries(v.features ?? {}).map(([f, m]) => [f, { ...m }])),
            tally: Object.fromEntries(Object.entries(v.tally ?? {}).map(([k, m]) => [k, { ...m }])),
            labels: [...(v.labels ?? [])],
          });
        }
      }
      mergeCounted(into.textStyles, r.textStyles, eqStyle);
      mergeCounted(into.textCases, r.textCases, eq);
      mergeCounted(into.radius, r.radius, eq);
      mergeCounted(into.height, r.height, eq);
    }
  }
  return {
    $schema: LANGUAGE_SCHEMA,
    product,
    updatedAt,
    sources: sources.map(({ rules: _rules, ...meta }) => meta),
    rules: finish([...rules.values()]),
  };
}

export function upsertSource(sources: LanguageSource[], source: LanguageSource): LanguageSource[] {
  return [...sources.filter((s) => s.fileName !== source.fileName), source];
}

/** Главное значение правила — то, что уйдёт в перевод, если спора нет. */
export function mainValue(rule: LanguageRule): RuleValue | undefined {
  return rule.values[0];
}

export function languageStats(lang: StyleLanguage): Record<RuleStatus, number> {
  const out: Record<RuleStatus, number> = { proposed: 0, confirmed: 0, disputed: 0, missing: 0 };
  for (const r of lang.rules) out[r.status]++;
  return out;
}
