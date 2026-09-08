import type { AnatomySchema } from './anatomyTypes';

/**
 * Visual anatomy schema for BadgeDot — single zone (Dot).
 * Simplified vs Switch baseline: no text layer, no shadow, no padding —
 * 8×8px filled circle only.
 */
export const badgeDotAnatomySchema: AnatomySchema = {
  componentId: 'badge-dot',
  zones: [
    {
      id: 'dot',
      order: 1,
      label: 'Dot',
      targetSelector: '.ds-badge-dot-root',
      summary: '8×8px notification indicator — fill color only.',
      properties: [
        {
          property: 'Fill',
          kind: 'semantic-token',
          tokenRef: 'Icons · Warning',
          source: 'components/badgeDotTokens.ts → --ds-badge-dot-bg',
          note: 'Theme-independent — same value in Day and Night.',
        },
        {
          property: 'Size',
          kind: 'semantic-token',
          tokenRef: 'space-8',
          staticValue: '8×8px',
          source: 'spacingData.ts · space-8',
        },
        {
          property: 'Border radius',
          kind: 'raw-value',
          staticValue: '50% (circle)',
          source: 'components/BadgeDot.tsx · .ds-badge-dot-root',
          note: 'Equivalent to radius-4 on an 8px square — full circle by geometry.',
        },
      ],
    },
  ],
};
