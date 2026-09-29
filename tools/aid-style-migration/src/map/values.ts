/**
 * Радиусы и отступы (этап 3a): значения исходника → токены продукта с
 * сохранением порядка. Чистая логика.
 */

import { mapScale, ratioCost } from "./scale";
import type { Confidence, Proposal, SourceValue, TargetValue } from "./types";

export function mapValues(sources: SourceValue[], targets: TargetValue[], what: string): Proposal[] {
  const tgt = targets.slice().sort((a, b) => a.value - b.value);
  const idx = mapScale(
    sources.map((s) => ({ value: s.value, weight: Math.log(s.count + 1) })),
    tgt.map((t) => t.value),
  );
  return sources.map((s, i) => {
    const t = idx[i] >= 0 ? tgt[idx[i]] : null;
    if (!t) return { sourceId: s.id, target: null, alternatives: [], confidence: "low" as Confidence, reasons: [`в продукте нет токенов: ${what}`] };
    const diff = ratioCost(s.value, t.value);
    const confidence: Confidence = s.value === t.value ? "high" : diff < 0.2 ? "medium" : "low";
    const reasons =
      s.value === t.value ? ["точное совпадение"] : [`${s.value} → ${t.value}: ближайшая ступень продукта с сохранением порядка`];
    const alternatives = [tgt[idx[i] - 1], tgt[idx[i] + 1]].filter((x): x is TargetValue => Boolean(x)).map((x) => ({ key: x.key, name: x.name, score: 0 }));
    return { sourceId: s.id, target: { key: t.key, name: t.name, score: 1 }, alternatives, confidence, reasons };
  });
}
