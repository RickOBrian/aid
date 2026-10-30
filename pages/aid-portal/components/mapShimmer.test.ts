import { describe, expect, it } from 'vitest';
import {
  SHIMMER_DEFAULTS,
  cloneDefaults,
  parseStoredState,
  rgba,
  shimmerBackground,
  shimmerExport,
  shimmerGeometry,
} from '../mapShimmerModel';

describe('настройщик блика карты (presentbook-8)', () => {
  it('rgba из хекса и процента', () => {
    expect(rgba('#21252C', 100)).toBe('rgba(33,37,44,1)');
    expect(rgba('#FFFFFF', 70)).toBe('rgba(255,255,255,0.7)');
  });

  it('при вертикальной полосе путь — ширина экрана', () => {
    const { L, P } = shimmerGeometry({ angle: 0, width: 100, count: 1 });
    expect(L).toBeCloseTo(390);
    expect(P).toBeCloseTo(490);
  });

  it('период не уже полосы', () => {
    const { P } = shimmerGeometry({ angle: 0, width: 400, count: 8 });
    expect(P).toBe(400);
  });

  it('фон: полоса посередине периода', () => {
    const bg = shimmerBackground({ ...SHIMMER_DEFAULTS.night, angle: 0, width: 100, count: 1 });
    expect(bg.size).toBe('490px 100%');
    expect(bg.image).toContain('rgba(33,37,44,1) 245px');
  });

  it('JSON в формате прототипа', () => {
    const out = shimmerExport(SHIMMER_DEFAULTS);
    expect(out.day).toMatchObject({ bands: 4, bandWidthPt: 120, angleDeg: 45, cycleMs: 1200, bandOpacity: '100%', dimOpacity: '70%' });
    expect(typeof out.night.speedPtPerSec).toBe('number');
  });

  it('сохранённое: битое — null, лишнее обрезается до границ ползунков', () => {
    expect(parseStoredState(null)).toBeNull();
    expect(parseStoredState('{')).toBeNull();
    expect(parseStoredState('{"day":{}}')).toBeNull();
    const parsed = parseStoredState(JSON.stringify({ day: { count: 99, band: 'red', dimAlpha: -5 }, night: { angle: 10, band: '#abcdef' } }));
    expect(parsed?.day.count).toBe(8);
    expect(parsed?.day.band).toBe('#FFFFFF');
    expect(parsed?.day.dimAlpha).toBe(0);
    expect(parsed?.night.angle).toBe(10);
    expect(parsed?.night.band).toBe('#ABCDEF');
  });

  it('исходные значения не меняются копией', () => {
    const copy = cloneDefaults();
    copy.day.count = 2;
    expect(SHIMMER_DEFAULTS.day.count).toBe(4);
  });
});
