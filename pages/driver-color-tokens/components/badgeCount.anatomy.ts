import type { AnatomySchema } from './anatomyTypes';

/**
 * Visual anatomy schema for BadgeCount — 2 zones (Container, Number).
 * Simplified vs Switch baseline per `component-page-baseline.mdc` diff
 * protocol: no interactive geometry (no touch target, no focus ring, no
 * motion) since the component is a non-interactive display element.
 * Geometry targets map to class selectors in `components/BadgeCount.tsx`.
 */
export const badgeCountAnatomySchema: AnatomySchema = {
  componentId: 'badge-count',
  zones: [
    {
      id: 'container',
      order: 1,
      label: 'Container',
      targetSelector: '.ds-badge-count-root',
      summary: 'Pill container — background, radius, shadow, padding.',
      properties: [
        {
          property: 'Background',
          kind: 'semantic-token',
          tokenRef: 'Fields · Warning',
          source: 'components/badgeCountTokens.ts → --ds-badge-count-bg',
        },
        {
          property: 'Border radius',
          kind: 'semantic-token',
          tokenRef: 'radius-12',
          staticValue: '12px',
          source: 'radiusData.ts · radius-12',
        },
        {
          property: 'Padding (vertical)',
          kind: 'semantic-token',
          tokenRef: 'space-2',
          staticValue: '2px',
          source: 'spacingData.ts · space-2',
        },
        {
          property: 'Padding (horizontal)',
          kind: 'semantic-token',
          tokenRef: 'space-6',
          staticValue: '6px',
          source: 'spacingData.ts · space-6',
        },
        {
          property: 'Shadow',
          kind: 'semantic-token',
          tokenRef: 'shadow-1',
          staticValue: '0px 0px 1px rgba(0,0,0,.15), 0px 1px 2px rgba(0,0,0,.12)',
          source: 'shadowsData.ts · shadow-1',
        },
        {
          property: 'Overflow behaviour',
          kind: 'raw-value',
          staticValue: 'value > max (default 99) → "{max}+"',
          source: 'components/BadgeCount.tsx · formatBadgeCountValue',
          note: 'Implementation decision, not a Figma variant — confirm max with product before reuse.',
        },
      ],
    },
    {
      id: 'number',
      order: 2,
      label: 'Number',
      targetSelector: '.ds-badge-count__value',
      summary: 'Formatted count text.',
      properties: [
        {
          property: 'Color',
          kind: 'semantic-token',
          tokenRef: 'Texts · Primary light ind',
          source: 'components/badgeCountTokens.ts → --ds-badge-count-text',
          note: 'Theme-independent token — same value in Day and Night.',
        },
        {
          property: 'Typography',
          kind: 'semantic-token',
          tokenRef: 'subtitle-2',
          staticValue: 'Roboto Medium 14/16, tracking 0.1px',
          source: 'typographyData.ts · subtitle-2',
        },
        {
          property: 'Text align',
          kind: 'raw-value',
          staticValue: 'center',
          source: 'components/BadgeCount.tsx · .ds-badge-count__value',
        },
      ],
    },
  ],
};
