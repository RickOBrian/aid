import { describe, expect, it } from 'vitest';
import {
  DETENT_SPEC,
  detentTops,
  draggerTarget,
  isRaised,
  overlayProgress,
  pickDetent,
  sheetColor,
  sheetRadius,
  sheetShadow,
  sheetSpace,
  sheetType,
} from '../bottomSheetPreviewData';

const tops = detentTops(844, 106, 291);

describe('BottomSheet demo · остановки', () => {
  it('совпадают с аудитом на экране 844', () => {
    expect(tops).toEqual({ collapsed: 738, default: 410, expanded: 186, full: 32 });
  });

  it('Expanded по содержимому, если оно выше Default, и не выше предела', () => {
    expect(detentTops(844, 106, 500).expanded).toBe(344);
    expect(detentTops(844, 106, 800).expanded).toBe(DETENT_SPEC.expandedMinTop);
  });

  it('при отпускании без скорости — ближайшая остановка', () => {
    expect(pickDetent(420, 0, tops, 'default')).toBe('default');
    expect(pickDetent(250, 0, tops, 'default')).toBe('expanded');
    expect(pickDetent(700, 0, tops, 'default')).toBe('collapsed');
  });

  it('быстрый взмах уводит в соседнюю остановку', () => {
    expect(pickDetent(400, -1, tops, 'default')).toBe('expanded');
    expect(pickDetent(420, 1, tops, 'default')).toBe('collapsed');
    expect(pickDetent(40, -2, tops, 'full')).toBe('full');
  });

  it('затемнение только выше Default', () => {
    expect(overlayProgress(tops.default, tops)).toBe(0);
    expect(overlayProgress(tops.collapsed, tops)).toBe(0);
    expect(overlayProgress(tops.expanded, tops)).toBe(1);
    expect(overlayProgress(tops.full, tops)).toBe(1);
    expect(isRaised('expanded')).toBe(true);
    expect(isRaised('default')).toBe(false);
  });

  it('полоска: снизу разворачивает, сверху сворачивает в Default', () => {
    expect(draggerTarget('collapsed')).toBe('default');
    expect(draggerTarget('default')).toBe('expanded');
    expect(draggerTarget('expanded')).toBe('default');
    expect(draggerTarget('full')).toBe('default');
  });
});

describe('BottomSheet demo · токены Rider из данных портала', () => {
  it('находит все токены экрана', () => {
    for (const token of [
      'Background/Primary',
      'Background/Overlay',
      'Background/Navbar',
      'Text/Primary',
      'Text/Secondary',
      'Icon/Primary',
      'Stroke/Separator',
    ]) {
      expect(sheetColor(token, 'day')).toMatch(/^rgba?\(/);
      expect(sheetColor(token, 'night')).toMatch(/^rgba?\(/);
    }
    expect(sheetColor('Background/Overlay', 'day')).toBe('rgba(0, 0, 0, 0.3)');
    expect(sheetRadius('radius-28')).toBe('28px');
    expect(sheetSpace('space-16')).toBe(16);
    expect(sheetShadow('Medium', 'day')).toContain('20px');
    expect(sheetType('Subtitle 2').font).toContain('15px/20px');
    expect(sheetType('Body 3').font).toContain('14px/16px');
    expect(sheetType('Caption 2').font).toContain('11px/14px');
  });
});
