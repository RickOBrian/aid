/**
 * Перевод цветов по роли (этап 3a). Чистая логика.
 *
 * Принцип «отношения, а не числа» (трекер, «Перевод стиля, а не
 * значений»): исходник может выглядеть совсем не как продукт, поэтому
 * ближайший HEX почти ничего не значит.
 *
 * 1. Место в макете (текст, фон, поверхность, иконка, обводка) отбирает
 *    токены: scopes переменной — жёстко, имя и образцы — как вес.
 * 2. Нейтральные (серые, белый, чёрный) — по рангу светлоты внутри места:
 *    самый тёмный текст исходника → самый тёмный текстовый токен.
 * 3. Хроматические — по смыслу: самый частый хроматический цвет исходника
 *    — бренд, он становится акцентом продукта; остальные по оттенку:
 *    красный — ошибка, зелёный — успех, жёлтый и оранжевый —
 *    предупреждение, синий — инфо.
 * 4. Улика тёмной темы: если известно значение исходника в тёмной теме,
 *    токен, похожий на него в своём тёмном режиме, получает прибавку.
 */

import type { UseKind } from "../profile/usage";
import { distance, hueFamily, isNeutral, lightness, type HueFamily, type Rgba } from "./color";
import { meaningFromName, scopeAllows, usesFromName, type ColorMeaning } from "./roles";
import type { Candidate, Confidence, Proposal, SourceColor, TargetColor } from "./types";

/** Веса — в одном месте: их подбираем на реальных файлах (этап 3a для этого). */
export const WEIGHTS = {
  roleFit: 0.45,
  rank: 0.3,
  meaning: 0.3,
  darkEvidence: 0.15,
  closeness: 0.1,
  /** Штраф токену, который не меняется с темой, там, где исходник меняется или неизвестно. */
  independent: 0.6,
};

/** Токен не меняется с темой: одинаков в светлом и тёмном режиме. */
export function isThemeIndependent(t: TargetColor): boolean {
  return t.dark !== null && distance(t.light, t.dark) < 3;
}

/** Места с цветом, которые переводим на этапе 3; эффекты — стилями, отдельно. */
export const COLOR_USES: UseKind[] = ["background", "surface", "text", "icon", "stroke"];

/** Насколько токен подходит месту: образцы (если есть) и имя. 0 — не подходит. */
export function roleFit(target: TargetColor, use: UseKind): number {
  if (!scopeAllows(target.scopes, use)) return 0;
  const byName = usesFromName(target.name);
  const name = byName.length === 0 ? 0.5 : byName.includes(use) ? 1 : 0.1;
  const usage = target.usage;
  const total = usage ? Object.values(usage).reduce((a, b) => a + (b ?? 0), 0) : 0;
  if (!usage || total === 0) return name;
  const share = (usage[use] ?? 0) / total;
  return 0.6 * share + 0.4 * name;
}

/** Смысл хроматического цвета исходника: бренд — акцент, остальное — по оттенку. */
export function sourceMeaning(color: Rgba, brand: HueFamily | null): ColorMeaning {
  if (isNeutral(color)) return "neutral";
  const family = hueFamily(color);
  if (brand && family === brand) return "accent";
  if (family === "red" || family === "pink") return "negative";
  if (family === "green") return "positive";
  if (family === "orange" || family === "yellow") return "warning";
  if (family === "blue") return "info";
  return "accent";
}

function targetMeaning(t: TargetColor): ColorMeaning {
  const byName = meaningFromName(t.name);
  if (byName !== "neutral") return byName;
  return isNeutral(t.light) ? "neutral" : "accent";
}

/** Бренд исходника — самое частое хроматическое семейство оттенков. */
export function brandFamily(sources: SourceColor[]): HueFamily | null {
  const counts = new Map<HueFamily, number>();
  for (const s of sources) {
    if (isNeutral(s.light)) continue;
    const f = hueFamily(s.light);
    counts.set(f, (counts.get(f) ?? 0) + s.count);
  }
  let best: HueFamily | null = null;
  let max = 0;
  for (const [f, n] of counts) {
    if (n > max) {
      max = n;
      best = f;
    }
  }
  return best;
}

/** Позиция 0…1 в списке, отсортированном по светлоте (одиночка — середина). */
function rankOf<T>(item: T, sorted: T[]): number {
  if (sorted.length <= 1) return 0.5;
  return sorted.indexOf(item) / (sorted.length - 1);
}

/** Где светлота цвета на шкале светлоты токенов: 0 — как самый тёмный, 1 — как самый светлый. */
function positionIn(color: Rgba, targets: TargetColor[]): number {
  if (targets.length === 0) return 0.5;
  const ls = targets.map((t) => lightness(t.light));
  const min = Math.min(...ls);
  const max = Math.max(...ls);
  if (max - min < 1) return 0.5;
  return Math.min(1, Math.max(0, (lightness(color) - min) / (max - min)));
}

function confidence(best: number, second: number): Confidence {
  if (best >= 0.6 && best - second >= 0.12) return "high";
  if (best >= 0.4) return "medium";
  return "low";
}

const MEANING_LABEL: Record<ColorMeaning, string> = {
  accent: "акцент",
  positive: "успех",
  negative: "ошибка",
  warning: "предупреждение",
  info: "инфо",
  neutral: "нейтральный",
};

const USE_LABEL: Record<string, string> = {
  background: "фон экрана",
  surface: "поверхность",
  text: "текст",
  icon: "иконка",
  stroke: "обводка",
};

export function mapColors(sources: SourceColor[], targets: TargetColor[]): Proposal[] {
  const brand = brandFamily(sources);
  const proposals: Proposal[] = [];

  for (const use of COLOR_USES) {
    const here = sources.filter((s) => s.use === use);
    if (here.length === 0) continue;
    const eligible = targets.map((t) => ({ t, fit: roleFit(t, use), meaning: targetMeaning(t) })).filter((x) => x.fit > 0);

    // Ранги светлоты — отдельно для каждого смысла: нейтральные с нейтральными, акценты с акцентами.
    const srcByMeaning = new Map<ColorMeaning, SourceColor[]>();
    for (const s of here) {
      const m = sourceMeaning(s.light, brand);
      srcByMeaning.set(m, [...(srcByMeaning.get(m) ?? []), s]);
    }
    for (const list of srcByMeaning.values()) list.sort((a, b) => lightness(a.light) - lightness(b.light));
    // Ранжируем только среди токенов, которые подходят месту по роли, — иначе
    // фоновые серые сдвигают ранги текстовых. Нет таких — среди всех допустимых.
    const strong = eligible.filter((e) => e.fit >= 0.5);
    const ranked = strong.length ? strong : eligible;
    const tgtByMeaning = new Map<ColorMeaning, TargetColor[]>();
    for (const e of ranked) tgtByMeaning.set(e.meaning, [...(tgtByMeaning.get(e.meaning) ?? []), e.t]);
    for (const list of tgtByMeaning.values()) list.sort((a, b) => lightness(a.light) - lightness(b.light));

    for (const s of here) {
      const meaning = sourceMeaning(s.light, brand);
      const peers = srcByMeaning.get(meaning) ?? [s];
      const targetsHere = tgtByMeaning.get(meaning) ?? [];
      // Ранг внутри исходника держит порядок; положение на шкале продукта
      // решает, когда сравнивать не с кем (один цвет фона).
      const absolute = positionIn(s.light, targetsHere);
      const srcRank = peers.length > 1 ? (rankOf(s, peers) + absolute) / 2 : absolute;
      const scored: Candidate[] = eligible.map(({ t, fit, meaning: tm }) => {
        const sameMeaning = tm === meaning;
        const inRanked = tgtByMeaning.get(tm)?.includes(t) ?? false;
        const rank = sameMeaning && inRanked ? 1 - Math.abs(srcRank - rankOf(t, tgtByMeaning.get(tm)!)) : 0;
        const dark = s.dark && t.dark ? Math.exp(-distance(s.dark, t.dark) / 40) : 0;
        const close = Math.exp(-distance(s.light, t.light) / 60);
        // Токен вне темы (у продукта из спайка — «…Ind») годится, только если исходник в
        // этом месте сам не меняется с темой. Иначе в тёмной теме текст
        // останется чёрным на тёмном (Flot Tasks: Texts/Primary Dark Ind).
        const sourceFixed = s.dark !== null && distance(s.light, s.dark) < 3;
        const penalty = isThemeIndependent(t) && !sourceFixed ? WEIGHTS.independent : 0;
        const score =
          WEIGHTS.roleFit * fit +
          WEIGHTS.meaning * (sameMeaning ? 1 : 0) +
          WEIGHTS.rank * rank +
          WEIGHTS.darkEvidence * dark +
          WEIGHTS.closeness * close -
          penalty;
        return { key: t.key, name: t.name, score: Math.round(score * 100) / 100 };
      });
      scored.sort((a, b) => b.score - a.score);
      // Нормируем на сумму весов — уверенность 0…1.
      const max = WEIGHTS.roleFit + WEIGHTS.meaning + WEIGHTS.rank + WEIGHTS.darkEvidence + WEIGHTS.closeness;
      const best = scored[0] ? scored[0].score / max : 0;
      const second = scored[1] ? scored[1].score / max : 0;

      const reasons = [`${USE_LABEL[use] ?? use}, ${MEANING_LABEL[meaning]}`];
      if (meaning === "accent" && brand) reasons.push("самый частый хроматический цвет исходника — бренд → акцент продукта");
      if (meaning === "info" && brand !== "blue") reasons.push("синий не бренд исходника → инфо; если это второй акцент — поправьте");
      if (s.dark) reasons.push("есть значение в тёмной теме — учтено");
      const chosen = scored[0] ? targets.find((t) => t.key === scored[0].key) : undefined;
      if (chosen && isThemeIndependent(chosen)) reasons.push("выбран токен, который не меняется с темой — исходник здесь тоже не меняется");
      if (!scored.length) reasons.push("в продукте нет токена для этого места — кандидат в предложения");
      const conf = scored.length ? confidence(best, second) : "low";
      proposals.push({
        sourceId: s.id,
        target: scored[0] ?? null,
        alternatives: scored.slice(1, 5),
        confidence: meaning === "info" && brand !== "blue" && conf === "high" ? "medium" : conf,
        reasons,
      });
    }
  }
  return proposals;
}
