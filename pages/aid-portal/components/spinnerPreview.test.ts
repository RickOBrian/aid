import { describe, expect, it } from 'vitest';
import { canonicalAppPath } from '../productRegistry';
import { BUTTON_LOADING_VARIANTS, riderColor, riderRadius, riderShadow, riderSpace, riderType } from '../spinnerPreviewData';

describe('Spinner preview — токены Rider', () => {
  it('все цвета страницы есть в данных Rider для дня и ночи', () => {
    const tokens = [
      'Background/Primary',
      'Background/Secondary',
      'Background/Accent',
      'Icon/Primary',
      'Icon/Tertiary',
      'Icon/Constant White',
      'Text/Primary',
      'Text/Secondary',
      ...BUTTON_LOADING_VARIANTS.flatMap((b) => [b.bg, b.spinner]),
    ];
    for (const token of tokens) {
      expect(() => riderColor(token, 'day')).not.toThrow();
      expect(() => riderColor(token, 'night')).not.toThrow();
    }
  });

  it('значения совпадают с Figma аудита', () => {
    expect(riderColor('Button/Primary', 'day')).toBe('rgb(133, 38, 255)');
    expect(riderColor('Button/Primary', 'night')).toBe('rgb(136, 77, 255)');
    expect(riderColor('Button/Constant White Secondary', 'day')).toBe('rgba(255, 255, 255, 0.5)');
    expect(riderSpace('space-14')).toBe('14px');
    expect(riderRadius('radius-16')).toBe('16px');
    expect(riderShadow('Small', 'day')).toContain('20px');
    expect(riderType('Subtitle 1').font).toContain('17px/24px');
  });

  it('прямой адрес не переписывается', () => {
    expect(canonicalAppPath('/rider/preview/spinner')).toBeNull();
  });
});
