import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { canonicalAppPath } from '../productRegistry';
import {
  DEFAULT_MOTION,
  DEMO_TABS,
  GUIDE_MOTION,
  caption2,
  ease,
  motionExport,
  cssBlend,
  navbarGlassLayers,
  parseStoredMotion,
  pillFrame,
  restRect,
  riderColor,
  riderRadius,
  springProgress,
  stretchedRect,
  tabWidth,
  totalMs,
} from '../tabBarPreviewModel';

describe('превью TabBar Rider (presentbook-10)', () => {
  it('цвета из данных портала совпадают с гайдом', () => {
    expect(riderColor('Background/Navbar', 'day')).toBe('rgba(245, 245, 245, 0.6)');
    expect(riderColor('Background/Navbar', 'night')).toBe('rgba(42, 42, 49, 0.6)');
    expect(riderColor('Text/Primary', 'day')).toBe('rgba(15, 15, 31, 0.87)');
    expect(riderColor('Icon/Primary', 'night')).toBe('rgb(248, 250, 255)');
    expect(riderRadius('radius-pill')).toBe('9999px');
    expect(caption2().font).toContain('500 11px/14px');
  });

  it('стекло: семь эффектов, кант — Linear Burn, блики — Linear Dodge, ночью так же', () => {
    for (const theme of ['day', 'night'] as const) {
      const layers = navbarGlassLayers(theme);
      expect(layers).toHaveLength(7);
      const byId = Object.fromEntries(layers.map((l) => [l.id, l]));
      expect(byId['drop-shadow-1']).toMatchObject({ blend: 'normal', shadow: '0px 8px 15px 0px rgba(0,0,0,0.02)' });
      expect(byId['drop-shadow-2']).toMatchObject({ blend: 'linear-burn', shadow: '0px 0px 0px 0.5px rgba(232,232,232,1)' });
      expect(byId['drop-shadow-3'].shadow).toBe('-1.25px 0px 0px -0.75px rgba(208,208,208,1)');
      expect(byId['inner-shadow-1']).toMatchObject({ inner: true, blend: 'linear-burn' });
      expect(byId['inner-shadow-2']).toMatchObject({ inner: true, blend: 'linear-dodge', shadow: 'inset 0px -8px 10px -40px rgba(40,40,40,0.25)' });
      // светлый кант ни в одном слое не ложится обычным наложением
      expect(layers.filter((l) => l.blend === 'normal').map((l) => l.id)).toEqual(['drop-shadow-1']);
    }
    expect(cssBlend('linear-burn', { plusDarker: false, plusLighter: false })).toBe('multiply');
    expect(cssBlend('linear-burn', { plusDarker: true, plusLighter: false })).toBe('plus-darker');
    expect(cssBlend('linear-dodge', { plusDarker: false, plusLighter: true })).toBe('plus-lighter');
    expect(cssBlend('linear-dodge', { plusDarker: false, plusLighter: false })).toBe('screen');
  });

  it('геометрия: капсула 358, отступ 4, gap 4, подложка 56 в покое', () => {
    expect(tabWidth(4)).toBeCloseTo(84.5);
    expect(restRect(0, 4)).toEqual({ x: 4, y: 4, w: 84.5, h: 56 });
    expect(restRect(3, 4).x + restRect(3, 4).w).toBeCloseTo(354);
    expect(restRect(2, 3).x + restRect(2, 3).w).toBeCloseTo(354);
  });

  it('растяжение охватывает оба таба и растёт на +2 сверху и снизу', () => {
    const s = stretchedRect(restRect(0, 4), restRect(2, 4), 2);
    expect(s).toMatchObject({ x: 4, y: 2, h: 60 });
    expect(s.x + s.w).toBeCloseTo(restRect(2, 4).x + restRect(2, 4).w);
    expect(stretchedRect(restRect(3, 4), restRect(1, 4), 0)).toMatchObject({ x: restRect(1, 4).x, y: 4, h: 56 });
  });

  it('кривые и пружина', () => {
    expect(ease('linear', 0.3)).toBeCloseTo(0.3);
    expect(ease('ease-in-out', 0.5)).toBeCloseTo(0.5, 3);
    expect(ease('ease-out', 0.5)).toBeGreaterThan(0.5);
    expect(springProgress(0, GUIDE_MOTION)).toBe(0);
    expect(springProgress(2000, GUIDE_MOTION)).toBeCloseTo(1, 3);
    // перелёт есть: пружина 1/420/24 недодемпфирована
    expect(Math.max(...Array.from({ length: 300 }, (_, t) => springProgress(t, GUIDE_MOTION)))).toBeGreaterThan(1);
    // передемпфированная тоже доходит
    expect(springProgress(3000, { mass: 1, stiffness: 200, damping: 80 })).toBeCloseTo(1, 2);
  });

  it('кадры: фаза 1 → растяжение, фаза 2 → пружина, затем покой на новом табе', () => {
    const from = restRect(0, 4);
    const mid = pillFrame(GUIDE_MOTION.stretchMs - 1, from, 2, GUIDE_MOTION);
    expect(mid.phase).toBe('stretch');
    const peak = pillFrame(GUIDE_MOTION.stretchMs, from, 2, GUIDE_MOTION);
    expect(peak.phase).toBe('spring');
    expect(peak.rect.h).toBeCloseTo(60);
    const end = pillFrame(5000, from, 2, GUIDE_MOTION);
    expect(end).toEqual({ rect: restRect(2, 4), phase: 'rest' });
  });

  it('умолчания быстрее гайда и укладываются в 400 мс', () => {
    expect(totalMs(DEFAULT_MOTION)).toBeLessThan(totalMs(GUIDE_MOTION));
    expect(totalMs(DEFAULT_MOTION)).toBeLessThan(400);
    expect(GUIDE_MOTION).toMatchObject({ stretchMs: 140, stretchEasing: 'ease-in-out', mass: 1, stiffness: 420, damping: 24, growPx: 2 });
    expect(DEFAULT_MOTION.growPx).toBe(2);
  });

  it('JSON для передачи несёт и значения гайда', () => {
    const out = motionExport(DEFAULT_MOTION);
    expect(out.stretch).toMatchObject({ durationMs: 100, heightGrowPx: 2, cssEasing: 'cubic-bezier(0.42, 0, 0.58, 1)' });
    expect(out.guide.spring).toEqual({ mass: 1, stiffness: 420, damping: 24 });
  });

  it('сохранённое: битое — null, числа обрезаются до границ бегунков', () => {
    expect(parseStoredMotion(null)).toBeNull();
    expect(parseStoredMotion('{')).toBeNull();
    expect(parseStoredMotion('[]')).toBeNull();
    const parsed = parseStoredMotion(JSON.stringify({ stretchMs: 9999, growPx: -3, stretchEasing: 'bounce', tabs: 3, damping: 'x' }));
    expect(parsed).toMatchObject({ stretchMs: 400, growPx: 0, stretchEasing: 'ease-in-out', tabs: 3, damping: DEFAULT_MOTION.damping });
  });

  it('иконки — файлы Rider Icons в Presentbook', () => {
    for (const tab of DEMO_TABS) {
      expect(existsSync(resolve(__dirname, '../public', `.${tab.file}`))).toBe(true);
    }
  });

  it('прямой адрес не переписывается', () => {
    expect(canonicalAppPath('/rider/preview/tab-bar')).toBeNull();
  });
});
