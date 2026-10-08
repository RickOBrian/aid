import { semanticColorSections } from './data';

/**
 * Цвета инфографики страницы `/ttm` — семантические токены Driver, не
 * литералы (решение PD 2026-10-08: «вместо синего зелёный, вместо серого
 * рыжий»).
 *
 * Пара проверена на различимость при нарушениях цветового зрения (ΔE после
 * симуляции Machado): дейтеранопия 52, протанопия 33, тританопия 84 — лучше
 * ориентира из образца. Pastels · Shame ближе по оттенку к образцу, но при
 * дейтеранопии сливается с зелёным (ΔE 3).
 */

function token(section: string, name: string): string {
  const row = semanticColorSections.find((item) => item.title === section)?.rows.find((item) => item.name === name);
  if (!row) {
    throw new Error(`ttm: нет токена ${section} · ${name}`);
  }
  const { hex, opacity } = row.day;
  return opacity === 100 ? hex : `color-mix(in srgb, ${hex} ${opacity}%, transparent)`;
}

export const TTM_COLORS = {
  /** «С инструментом» — Bg · Positive. */
  after: token('Bg', 'Positive'),
  /** «Вручную» — Bg · Attention. */
  before: token('Bg', 'Attention'),
  /** Текст на зелёной плитке КПД — Texts · Primary (контраст 5,5:1). */
  onAfter: token('Texts', 'Primary'),
} as const;
