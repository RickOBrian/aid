/**
 * Анкета (шаг 5): язык продукта → вопросы дизайнеру. Без AI — текст
 * собирается из фактов: сколько раз какой вариант, где, с какими
 * подписями, и какой признак лучше всего разделяет варианты.
 *
 * Виды: противоречие (роль оформлена по-разному), пробел (роли нет в
 * образцах), отступление (правило есть, но в образцах попадаются другие
 * значения). Ответ превращается в решение по правилу (`applyAnswers`).
 */

import { THEME_ROLES } from "../lib/vocabulary";
import { EXPECTED_ROLES, type Feature, findSplit, FREE_DRAWN, type LanguageRule, type RuleValue, type StyleLanguage, type TokenRef } from "./language";
import { roleGroup, roleLabel } from "./roleLabels";
import { slotFor } from "../standards/standards";

/** Строка-подсказка стандарта: ориентир, не решение. */
function standardLine(role: string): string {
  const slot = slotFor(role);
  return slot
    ? `По стандарту ДС: ${slot.slot} — «${slot.use}» (${slot.basis}). Это ориентир: решение — по продукту.`
    : "Стандарт ДС эту роль отдельно не описывает.";
}

export type QuestionKind = "contradiction" | "gap" | "outlier" | "thin";

/** Меньше стольких случаев — «мало образцов»: правило из одного примера не надёжнее догадки (аудит 2026-09-30). */
export const MIN_SUPPORT = 3;

/**
 * О чём спрашивать: роли, важные для перевода. Остальное (декор, куски
 * компонентов, обводки иконок, объекты вроде пузырей и бейджей) копится
 * молча — аудит 2026-09-30: из 25 вопросов осмысленных было ~7.
 */
export function isAskable(role: string): boolean {
  if (/\/(part|meta)$/.test(role) || role.endsWith("/stroke") && role !== "input/stroke" && !role.startsWith("action-")) return false;
  if (/^(decor|card-tint|surface|handle|tab\/|bubble|badge|row|header)/.test(role)) return false;
  return true;
}

export type OptionKind = "value" | "split" | "not-used" | "new-token";

export interface QuestionOption {
  /** Стабильный id: переживает повторное изучение, пока варианты те же. */
  id: string;
  kind: OptionKind;
  label: string;
  /** Для `value` — какое значение станет правилом. */
  value?: Pick<RuleValue, "token" | "hex" | "hexLight" | "hexDark">;
  /** Для `split` — правило с условием: значение признака → значение правила. */
  split?: { feature: Feature; map: Record<string, Pick<RuleValue, "token" | "hex">> };
}

export interface Question {
  id: string;
  kind: QuestionKind;
  role: string;
  layer: LanguageRule["layer"];
  title: string;
  /** Объяснение по строкам — человеческим текстом. */
  lines: string[];
  /** Сколько элементов в образцах затрагивает ответ — для порядка. */
  impact: number;
  /** Варианты из образцов — для доски на канвасе. */
  values: RuleValue[];
  options: QuestionOption[];
}

export interface Answer {
  questionId: string;
  optionId: string;
  /** «Свой вариант» — заметка; без AI не формализуется. */
  note?: string;
  answeredAt: string;
}

/** Кандидат для пробела: токен библиотеки продукта. */
export interface TokenCandidate extends TokenRef {
  hexLight?: string;
  hexDark?: string;
}

/** Доля второстепенных значений, ниже которой это «отступление», а не спор. */
const OUTLIER_SHARE = 0.2;
/** Отступления спрашиваем только у правил с достаточной опорой. */
const OUTLIER_MIN_TOTAL = 5;
/** В споре показываем варианты не реже этой доли. */
const MIN_VARIANT_SHARE = 0.05;

// ---------------------------------------------------------------------------
// Слова
// ---------------------------------------------------------------------------

const PLACE_WORDS: Record<string, string> = {
  screen: "на экране",
  sheet: "в шторке",
  modal: "в модалке",
  card: "в карточке",
};

const WIDTH_WORDS: Record<string, string> = { full: "во всю ширину", part: "не во всю ширину" };

const FEATURE_NAMES: Record<Feature, string> = { component: "компонента", place: "места", width: "ширины", theme: "темы" };

function featureWord(f: Feature, v: string): string {
  if (f === "component") return v === FREE_DRAWN ? "нарисовано вручную" : `в «${v}»`;
  if (f === "place") return PLACE_WORDS[v] ?? v;
  if (f === "width") return WIDTH_WORDS[v] ?? v;
  return v === THEME_ROLES.dark ? "в тёмной теме" : "в светлой теме";
}

function valueName(v: Pick<RuleValue, "token" | "hex">): string {
  return v.token ? v.token.name : `${v.hex} без токена`;
}

function times(n: number): string {
  const d = n % 10;
  const dd = n % 100;
  const word = d === 1 && dd !== 11 ? "раз" : d >= 2 && d <= 4 && (dd < 12 || dd > 14) ? "раза" : "раз";
  return `${n} ${word}`;
}

function valueId(v: Pick<RuleValue, "token" | "hex">): string {
  return v.token ? `t:${v.token.key}` : `h:${v.hex}`;
}

/** Признаки, которые у значения почти всегда одни и те же: «в шторке, во всю ширину». */
function typical(v: RuleValue): string[] {
  const out: string[] = [];
  for (const f of ["component", "place", "width"] as Feature[]) {
    const m = v.features?.[f];
    if (!m) continue;
    const [top, n] = Object.entries(m).sort((a, b) => b[1] - a[1])[0] ?? [];
    if (top && n / v.count >= 0.8) out.push(featureWord(f, top));
  }
  return out;
}

function quoteLabels(v: RuleValue, max = 3): string {
  const labels = (v.labels ?? []).slice(0, max);
  return labels.length ? labels.map((l) => `«${l}»`).join(", ") : "";
}

function variantLine(v: RuleValue, total: number): string {
  const share = Math.round((v.count / total) * 100);
  const where = typical(v);
  const labels = quoteLabels(v);
  const head = `${valueName(v)} — ${times(v.count)} (${share} %)`;
  const tail = [where.join(", "), labels].filter(Boolean).join("; ");
  return tail ? `${head}: ${tail}` : head;
}

// ---------------------------------------------------------------------------
// Разделяющий признак
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Вопросы
// ---------------------------------------------------------------------------

function contradiction(rule: LanguageRule): Question {
  const values = rule.values.filter((v) => v.count / rule.total >= MIN_VARIANT_SHARE).slice(0, 4);
  const label = roleLabel(rule.role);
  const split = findSplit(values);
  const lines = [
    `В образцах «${label}» оформлено по-разному, и ни один вариант не встречается хотя бы в 80 % случаев. Плагин не знает, какой правильный.`,
    ...values.map((v) => variantLine(v, rule.total)),
  ];
  if (split) {
    const parts = Object.entries(split.map).map(([k, i]) => `${featureWord(split.feature, k)} — ${valueName(values[i])}`);
    lines.push(`Похоже, зависит от ${FEATURE_NAMES[split.feature]}: ${parts.join("; ")}.`);
  } else {
    lines.push("Ни место, ни ширина, ни тема не объясняют разницу — возможно, дело в смысле действия или в ошибках образцов.");
  }
  lines.push(standardLine(rule.role));
  lines.push(`От ответа зависит, как плагин оформит «${label}» при переводе макетов.`);

  const options: QuestionOption[] = [];
  if (split) {
    const map: Record<string, Pick<RuleValue, "token" | "hex">> = {};
    for (const [k, i] of Object.entries(split.map)) map[k] = { token: values[i].token, hex: values[i].hex };
    options.push({
      id: `split:${split.feature}`,
      kind: "split",
      label: `Зависит от ${FEATURE_NAMES[split.feature]}: ${Object.entries(split.map)
        .map(([k, i]) => `${featureWord(split.feature, k)} — ${valueName(values[i])}`)
        .join("; ")}`,
      split: { feature: split.feature, map },
    });
  }
  for (const v of values) {
    options.push({
      id: `value:${valueId(v)}`,
      kind: "value",
      label: `Всегда ${valueName(v)} — остальное в образцах ошибки`,
      value: { token: v.token, hex: v.hex, hexLight: v.hexLight, hexDark: v.hexDark },
    });
  }
  return {
    id: `contradiction:${rule.role}|${rule.layer}`,
    kind: "contradiction",
    role: rule.role,
    layer: rule.layer,
    title: `«${label}» в образцах выглядит по-разному`,
    lines,
    impact: rule.total,
    values,
    options,
  };
}

function outlier(rule: LanguageRule): Question | null {
  if (rule.total < OUTLIER_MIN_TOTAL || rule.values.length < 2) return null;
  const [main, ...all] = rule.values;
  // Другое значение в другом компоненте — вариант компонента, не отступление.
  const top = (v: RuleValue) => Object.entries(v.features?.component ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0];
  const rest = all.filter((v) => top(v) === top(main));
  const restCount = rest.reduce((s, v) => s + v.count, 0);
  if (restCount === 0 || restCount / rule.total >= OUTLIER_SHARE) return null;
  const label = roleLabel(rule.role);
  const shown = rest.slice(0, 3);
  return {
    id: `outlier:${rule.role}|${rule.layer}`,
    kind: "outlier",
    role: rule.role,
    layer: rule.layer,
    title: `«${label}»: правило есть, но есть отступления`,
    lines: [
      `Почти всегда «${label}» — ${valueName(main)}: ${times(main.count)} из ${rule.total}.`,
      `Иначе — ${times(restCount)}:`,
      ...shown.map((v) => variantLine(v, rule.total)),
      "Это ошибки в образцах или отдельный случай, который продукту нужен?",
    ],
    impact: restCount,
    values: [main, ...shown],
    options: [
      {
        id: `value:${valueId(main)}`,
        kind: "value",
        label: `Ошибки — всегда ${valueName(main)}`,
        value: { token: main.token, hex: main.hex, hexLight: main.hexLight, hexDark: main.hexDark },
      },
      { id: "new-token", kind: "new-token", label: "Отдельный случай — нужен свой вариант (в предложения библиотеке)" },
    ],
  };
}

/** Кандидаты для пробела — по семейству имени токена. Без имён продуктов: только слова ролей. */
function candidatesFor(role: string, tokens: TokenCandidate[]): TokenCandidate[] {
  const group = roleGroup(role);
  const family =
    role === "link" || group === "text"
      ? /^text/i
      : group === "icons"
        ? /^icon/i
        : group === "actions"
          ? /^button|^control/i
          : role === "divider" || role.endsWith("/stroke")
            ? /stroke|border|divider|separator/i
            : /^(bg|background|surface)/i;
  const words: Record<string, RegExp> = {
    link: /link|accent|info/i,
    input: /input|field|stroke|border/i,
    chip: /chip|tag/i,
    "tab/indicator": /tab|accent|primary/i,
    divider: /divider|separator|stroke/i,
    "action-destructive": /warning|negative|danger|error|destruct/i,
    "action-disabled": /disabled|inactive|secondary/i,
  };
  const inFamily = tokens.filter((t) => family.test(t.name.split("/").pop() ?? "") || family.test(t.name));
  // Слова слота стандарта (text-accent → accent) — тоже подсказка: имя у продукта своё, но смысл часто тот же.
  const slot = slotFor(role);
  const slotWords = slot ? slot.slot.replace(/\*$/, "").split("-").filter((w) => w.length > 3 && !["main", "text", "icon", "line"].includes(w)) : [];
  const hints = [words[role], ...slotWords.map((w) => new RegExp(w, "i"))].filter((x): x is RegExp => Boolean(x));
  const score = (t: TokenCandidate) => hints.filter((h) => h.test(t.name)).length;
  const ranked = [...inFamily].sort((a, b) => score(b) - score(a));
  return ranked.slice(0, 4);
}

function gap(rule: LanguageRule, tokens: TokenCandidate[]): Question {
  const label = roleLabel(rule.role);
  const candidates = candidatesFor(rule.role, tokens);
  return {
    id: `gap:${rule.role}|${rule.layer}`,
    kind: "gap",
    role: rule.role,
    layer: rule.layer,
    title: `«${label}»: в образцах нет`,
    lines: [
      `В изученных образцах нет ни одного элемента «${label}».`,
      "Если такой элемент встретится в переводимых макетах, плагину не на что опереться — ответ станет правилом.",
      standardLine(rule.role),
      candidates.length ? "Подходящие по имени токены библиотеки — ниже." : "Подходящих по имени токенов в библиотеке не нашлось.",
    ],
    impact: 0,
    values: [],
    options: [
      ...candidates.map((t): QuestionOption => ({
        id: `value:t:${t.key}`,
        kind: "value",
        label: t.name,
        value: { token: { key: t.key, name: t.name, collection: t.collection }, hex: t.hexLight ?? "", hexLight: t.hexLight, hexDark: t.hexDark },
      })),
      { id: "not-used", kind: "not-used", label: "В продукте не используется — не переводить в эту роль" },
      { id: "new-token", kind: "new-token", label: "Нужен новый токен — в предложения библиотеке" },
    ],
  };
}

/** Все вопросы по языку: сначала споры (по числу элементов), потом отступления, потом пробелы. */
function thin(rule: LanguageRule): Question {
  const label = roleLabel(rule.role);
  const v = rule.values[0];
  const ex = v.examples[0];
  return {
    id: `thin:${rule.role}|${rule.layer}`,
    kind: "thin",
    role: rule.role,
    layer: rule.layer,
    title: `«${label}»: мало образцов`,
    lines: [
      `В образцах «${label}» встречается всего ${times(rule.total)}: ${valueName(v)}${ex ? ` на экране «${ex.screenName}»` : ""}${quoteLabels(v) ? `, ${quoteLabels(v)}` : ""}.`,
      "Правило из одного-двух случаев может оказаться случайностью. Подтвердите его или оставьте вопрос открытым, пока не появятся ещё образцы.",
      standardLine(rule.role),
    ],
    impact: rule.total,
    values: rule.values.slice(0, 2),
    options: [
      {
        id: `value:${valueId(v)}`,
        kind: "value",
        label: `Да, «${label}» — ${valueName(v)}`,
        value: { token: v.token, hex: v.hex, hexLight: v.hexLight, hexDark: v.hexDark },
      },
      { id: "new-token", kind: "new-token", label: "Нет — это частный случай; нужен свой вариант (в предложения библиотеке)" },
    ],
  };
}

/** Все вопросы по языку: сначала споры (по числу элементов), потом отступления, «мало образцов», пробелы. */
export function buildQuestions(lang: StyleLanguage, tokens: TokenCandidate[] = []): Question[] {
  const expected = new Set(EXPECTED_ROLES.map(([r, l]) => `${r}|${l}`));
  const askable = lang.rules.filter((r) => isAskable(r.role));
  const contradictions = askable.filter((r) => r.status === "disputed").map(contradiction);
  const outliers = askable.filter((r) => r.status === "proposed" && r.total >= MIN_SUPPORT).map(outlier).filter((q): q is Question => q !== null);
  const thins = askable.filter((r) => r.status === "proposed" && r.total > 0 && r.total < MIN_SUPPORT && !r.byComponent).map(thin);
  const gaps = lang.rules.filter((r) => r.status === "missing" && expected.has(`${r.role}|${r.layer}`)).map((r) => gap(r, tokens));
  const byImpact = (a: Question, b: Question) => b.impact - a.impact;
  return [...contradictions.sort(byImpact), ...outliers.sort(byImpact), ...thins, ...gaps];
}

// ---------------------------------------------------------------------------
// Ответы → правила
// ---------------------------------------------------------------------------

export interface Decision {
  questionId: string;
  kind: OptionKind | "note";
  label: string;
  value?: QuestionOption["value"];
  split?: QuestionOption["split"];
  note?: string;
  answeredAt: string;
}

/**
 * Ответы → решения по правилам. Ответ на вариант, которого больше нет
 * (образцы изменились), не применяется: вопрос снова открыт.
 */
export function applyAnswers(lang: StyleLanguage, questions: Question[], answers: Record<string, Answer>): StyleLanguage {
  const rules = lang.rules.map((r) => {
    const q = questions.find((x) => x.role === r.role && x.layer === r.layer);
    const a = q ? answers[q.id] : undefined;
    if (!q || !a) return r;
    const option = q.options.find((o) => o.id === a.optionId);
    if (!option && !(a.optionId === "note" && a.note)) return r;
    const decision: Decision = option
      ? { questionId: q.id, kind: option.kind, label: option.label, value: option.value, split: option.split, note: a.note, answeredAt: a.answeredAt }
      : { questionId: q.id, kind: "note", label: a.note ?? "", note: a.note, answeredAt: a.answeredAt };
    return { ...r, status: "confirmed" as const, decision };
  });
  return { ...lang, rules };
}

/** Открыт ли вопрос: нет ответа или ответ на вариант, которого больше нет. */
export function isOpen(q: Question, answers: Record<string, Answer>): boolean {
  const a = answers[q.id];
  if (!a) return true;
  if (a.optionId === "note") return !a.note;
  return !q.options.some((o) => o.id === a.optionId);
}
