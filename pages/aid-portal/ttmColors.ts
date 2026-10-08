import { semanticColorSections } from './data';

/**
 * Цвета инфографики страницы `/ttm`. «С инструментом» — акцент портала
 * (`--ds-accent`, синий), «вручную» — семантический токен Driver
 * Bg · Attention (рыжий), не литерал. Решение PD 2026-10-08: «до» рыжий
 * вместо серого, «после» остаётся синим.
 *
 * Пара проверена на различимость при нарушениях цветового зрения (ΔE после
 * симуляции Machado): дейтеранопия 162, протанопия 148, тританопия 77.
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
  /** «Вручную» — Bg · Attention. */
  before: token('Bg', 'Attention'),
} as const;
