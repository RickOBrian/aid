/**
 * Настройщик блика карты Rider в состоянии Loading (presentbook-8, AID-86).
 *
 * Модель без DOM: параметры полос, геометрия узора и JSON для передачи.
 * Прототип и исходные значения — чат Designer · Map (AID-71). Значения блика —
 * то, что дизайнер подбирает здесь, а не токены: итог уходит в анкету Map.
 */

export type MapTheme = 'day' | 'night';

export const MAP_THEMES: MapTheme[] = ['day', 'night'];

export interface ShimmerSettings {
  /** Кол-во полос на путь через экран. */
  count: number;
  /** Ширина полосы поперёк, pt экрана 390 × 844. */
  width: number;
  /** Наклон полосы от вертикали, градусы (+ — верх вправо). */
  angle: number;
  /** Время сдвига узора на один период, мс. */
  cycle: number;
  band: string;
  bandAlpha: number;
  dim: string;
  dimAlpha: number;
}

export type ShimmerState = Record<MapTheme, ShimmerSettings>;

/** Экран Rider, на котором подбирается блик. */
export const SCREEN = { width: 390, height: 844 } as const;

export const SHIMMER_DEFAULTS: ShimmerState = {
  day: { count: 4, width: 120, angle: 45, cycle: 1200, band: '#FFFFFF', bandAlpha: 100, dim: '#FFFFFF', dimAlpha: 70 },
  night: { count: 1, width: 220, angle: 17, cycle: 1200, band: '#21252C', bandAlpha: 100, dim: '#1C1D22', dimAlpha: 65 },
};

export interface ShimmerKnob {
  key: 'count' | 'width' | 'angle' | 'cycle';
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

export const SHIMMER_KNOBS: ShimmerKnob[] = [
  { key: 'count', label: 'Кол-во полос', min: 1, max: 8, step: 1, unit: '' },
  { key: 'width', label: 'Ширина полосы', min: 20, max: 500, step: 2, unit: ' pt' },
  { key: 'angle', label: 'Угол наклона', min: -60, max: 60, step: 1, unit: '°' },
  { key: 'cycle', label: 'Цикл', min: 300, max: 4000, step: 50, unit: ' мс' },
];

export const HEX_RE = /^#[0-9a-f]{6}$/i;

export function cloneDefaults(): ShimmerState {
  return JSON.parse(JSON.stringify(SHIMMER_DEFAULTS)) as ShimmerState;
}

export function rgba(hex: string, alphaPercent: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alphaPercent / 100})`;
}

/**
 * Путь через экран поперёк полос (L) и период узора (P).
 * При одной полосе период — весь путь плюс ширина полосы: полоса уходит за край
 * целиком, прежде чем появится снова.
 */
export function shimmerGeometry(s: Pick<ShimmerSettings, 'angle' | 'width' | 'count'>) {
  const a = (s.angle * Math.PI) / 180;
  const L = SCREEN.width * Math.abs(Math.cos(a)) + SCREEN.height * Math.abs(Math.sin(a));
  const P = (L + s.width) / s.count;
  return { L, P: Math.max(P, s.width) };
}

export function speedPtPerSec(s: ShimmerSettings): number {
  return Math.round((shimmerGeometry(s).P / s.cycle) * 1000);
}

/** Фон слоя блика: одна полоса на период, края — в прозрачность того же цвета. */
export function shimmerBackground(s: ShimmerSettings): { image: string; size: string; period: number } {
  const { P } = shimmerGeometry(s);
  const c = rgba(s.band, s.bandAlpha);
  const t = rgba(s.band, 0);
  const mid = P / 2;
  const hw = Math.min(s.width, P) / 2;
  return {
    image: `linear-gradient(90deg, ${t} 0px, ${t} ${mid - hw}px, ${c} ${mid}px, ${t} ${mid + hw}px, ${t} ${P}px)`,
    size: `${P}px 100%`,
    period: P,
  };
}

/** Значения для передачи в чат Map — тот же формат, что у прототипа. */
export function shimmerExport(state: ShimmerState) {
  const out = {} as Record<MapTheme, Record<string, number | string>>;
  for (const theme of MAP_THEMES) {
    const s = state[theme];
    out[theme] = {
      bands: s.count,
      bandWidthPt: s.width,
      angleDeg: s.angle,
      cycleMs: s.cycle,
      speedPtPerSec: speedPtPerSec(s),
      bandColor: s.band,
      bandOpacity: `${s.bandAlpha}%`,
      dimColor: s.dim,
      dimOpacity: `${s.dimAlpha}%`,
    };
  }
  return out;
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

/** Сохранённое в браузере — только если форма цела; иначе исходные значения. */
export function parseStoredState(raw: string | null): ShimmerState | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<Record<MapTheme, Partial<ShimmerSettings>>>;
    if (!value || typeof value !== 'object' || !value.day || !value.night) return null;
    const result = cloneDefaults();
    for (const theme of MAP_THEMES) {
      const src = value[theme] ?? {};
      const dst = result[theme];
      for (const knob of SHIMMER_KNOBS) {
        dst[knob.key] = clamp(src[knob.key], knob.min, knob.max, dst[knob.key]);
      }
      for (const key of ['band', 'dim'] as const) {
        const hex = src[key];
        if (typeof hex === 'string' && HEX_RE.test(hex)) dst[key] = hex.toUpperCase();
        dst[`${key}Alpha`] = clamp(src[`${key}Alpha`], 0, 100, dst[`${key}Alpha`]);
      }
    }
    return result;
  } catch {
    return null;
  }
}
