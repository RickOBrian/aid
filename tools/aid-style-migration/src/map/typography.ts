/**
 * Иерархия текста (этап 3a): уровни исходника → стили продукта по рангу, а
 * не по ближайшему кеглю. У агента Title 1 34pt и Title 2 30pt слились в
 * один стиль, Subtitle SemiBold стал Body Regular (спайк, п. 3) — здесь
 * порядок сохраняется, а близкие уровни сливаются, только если в продукте
 * ступеней меньше. Чистая логика.
 */

import { monotoneAssign, ratioCost } from "./scale";
import type { Candidate, Confidence, Proposal, SourceText, TargetText } from "./types";

const WEIGHT_BY_STYLE: Array<[RegExp, number]> = [
  [/thin|hairline/i, 100],
  [/extra\s*light|ultra\s*light/i, 200],
  [/light/i, 300],
  [/medium/i, 500],
  [/semi\s*bold|demi\s*bold/i, 600],
  [/extra\s*bold|ultra\s*bold/i, 800],
  [/black|heavy/i, 900],
  [/bold/i, 700],
];

/** Вес по начертанию: «SemiBold» → 600. Порядок проверки важен: «ExtraBold» раньше «Bold». */
export function weightOf(style: string): number {
  for (const [re, w] of WEIGHT_BY_STYLE) if (re.test(style)) return w;
  return 400;
}

/** Меньше этого — стиль продукта в образцах почти не встречается и в выбор не идёт. */
const MIN_POOL = 4;

/** Уровень, который встречается не чаще — возможная случайность. */
const RARE = 2;

function cost(s: SourceText, t: TargetText): number {
  const weight = Math.abs(s.weight - t.weight) / 300;
  return Math.log(s.count + 1) * (ratioCost(s.size, t.size) + 0.35 * weight);
}

function confidence(s: SourceText, t: TargetText): Confidence {
  const size = ratioCost(s.size, t.size);
  const sameWeight = Math.abs(s.weight - t.weight) <= 100;
  if (size < 0.15 && sameWeight) return "high";
  if (size < 0.3) return "medium";
  return "low";
}

const CASE_LABEL: Record<string, string> = { upper: "капсом", title: "С Заглавных", sentence: "с заглавной", lower: "строчными", mixed: "смешанно" };

export function mapTexts(sources: SourceText[], targets: TargetText[]): Proposal[] {
  const used = targets.filter((t) => t.uses > 0);
  const pool = (used.length >= MIN_POOL ? used : targets).slice().sort((a, b) => b.size - a.size || b.weight - a.weight);
  const src = sources.slice().sort((a, b) => b.size - a.size || b.weight - a.weight);
  // Слить два разных уровня исходника — потеря иерархии; чем сильнее они
  // различались, тем дороже. Так Title 34 и Title 30 не схлопнутся, пока в
  // продукте есть куда их развести.
  // Редкий уровень (≤ 2 раз) — скорее случайность, его слияние не штрафуем:
  // иначе он раздвигает шкалу и тянет соседей вверх (48 → 62 на Flot Tasks).
  const merge = (i: number) => {
    const a = src[i - 1];
    const b = src[i];
    if (Math.min(a.count, b.count) <= RARE) return 0;
    const distinct = ratioCost(a.size, b.size) + (0.3 * Math.abs(a.weight - b.weight)) / 300;
    return 4 * distinct * Math.log(Math.min(a.count, b.count) + 1);
  };
  const assigned = monotoneAssign(src.length, pool.length, (i, j) => cost(src[i], pool[j]), merge);

  return src.map((s, i) => {
    const t = assigned[i] >= 0 ? pool[assigned[i]] : null;
    const reasons: string[] = [];
    if (!t) {
      return { sourceId: s.id, target: null, alternatives: [], confidence: "low" as Confidence, reasons: ["в продукте нет стилей текста"] };
    }
    reasons.push(`уровень ${i + 1} из ${src.length} в исходнике → ${t.name} (${t.size}/${t.weight})`);
    if (used.length >= MIN_POOL) reasons.push("выбор из стилей, которые продукт использует в образцах");
    if (s.count <= RARE) reasons.push(`встречается ${s.count} раз — возможно, случайность; можно свести к соседнему уровню`);
    if (s.visibleCase === "upper" && t.textCase !== "UPPER") {
      reasons.push(`в исходнике текст ${CASE_LABEL.upper}, у стиля продукта капса нет — решить при применении`);
    }
    if (s.fontFamily !== t.fontFamily) reasons.push(`шрифт сменится: ${s.fontFamily} → ${t.fontFamily} — проверим переполнение`);
    // Альтернативы — соседние по шкале, чтобы было из чего выбрать руками.
    const j = assigned[i];
    const alternatives: Candidate[] = [pool[j - 1], pool[j + 1]]
      .filter((x): x is TargetText => Boolean(x))
      .map((x) => ({ key: x.key, name: x.name, score: 0 }));
    return { sourceId: s.id, target: { key: t.key, name: t.name, score: 1 }, alternatives, confidence: confidence(s, t), reasons };
  });
}
