import { describe, expect, it } from 'vitest';
import { canonicalAppPath } from '../productRegistry';
import {
  SWITCH_KNOB_COLOR,
  SWITCH_SPINNER_COLOR,
  SWITCH_STATES,
  SWITCH_TOKENS,
  SWITCH_TRACK,
  riderColor,
  riderRadius,
  riderShadow,
  riderSpace,
  riderType,
} from '../switchPreviewData';

describe('Switch preview — токены Rider', () => {
  it('все цвета Switch есть для дня и ночи', () => {
    const tokens = [
      ...SWITCH_STATES.flatMap((s) => [SWITCH_TRACK[s].on, SWITCH_TRACK[s].off]),
      SWITCH_KNOB_COLOR,
      SWITCH_SPINNER_COLOR,
      'Background/Primary',
      'Text/Primary',
      'Text/Secondary',
    ];
    for (const token of tokens) {
      expect(() => riderColor(token, 'day')).not.toThrow();
      expect(() => riderColor(token, 'night')).not.toThrow();
    }
  });

  it('значения совпадают с Figma аудита', () => {
    expect(riderColor('Background/Accent', 'day')).toBe('rgb(133, 38, 255)');
    expect(riderColor('Background/Tertiary', 'day')).toBe('rgba(15, 15, 31, 0.12)');
    expect(riderColor('Background/Accent Pressed', 'night')).toBe('rgb(117, 63, 224)');
    expect(riderSpace(SWITCH_TOKENS.paddingNear)).toBe('2px');
    expect(riderSpace(SWITCH_TOKENS.paddingFar)).toBe('20px');
    expect(riderRadius(SWITCH_TOKENS.radius)).toBe('9999px');
    expect(riderShadow('Knob', 'day')).toContain('3px 8px');
    expect(riderType('Body 1').font).toContain('px/');
  });

  it('прямой адрес не переписывается', () => {
    expect(canonicalAppPath('/rider/preview/switch')).toBeNull();
  });
});
