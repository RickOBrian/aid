import type { AnatomySchema } from './anatomyTypes';

/**
 * Visual anatomy schema for Switch (review sandbox pilot).
 * Geometry targets map to class selectors in `components/Switch.tsx`.
 */
export const switchAnatomySchema: AnatomySchema = {
  componentId: 'switch',
  zones: [
    {
      id: 'interactive-area',
      order: 1,
      label: 'Interactive area',
      targetSelector: '.ds-switch-root',
      summary: 'Touch target — native button hit area.',
      properties: [
        {
          property: 'Minimum size',
          kind: 'platform-convention',
          staticValue: '44×44px',
          source: 'components/Switch.tsx · .ds-switch-root',
          note: 'Repo touch-target rule (.cursorrules); visual track is smaller.',
        },
        {
          property: 'Padding',
          kind: 'raw-value',
          staticValue: '0',
          source: 'components/Switch.tsx · .ds-switch-root',
        },
        {
          property: 'Background',
          kind: 'raw-value',
          staticValue: 'transparent',
          source: 'components/Switch.tsx · .ds-switch-root',
        },
        {
          property: 'Role',
          kind: 'platform-convention',
          staticValue: 'switch (native <button>)',
          source: 'components/Switch.tsx',
        },
      ],
    },
    {
      id: 'track',
      order: 2,
      label: 'Track',
      targetSelector: '.ds-switch__track',
      summary: 'Pill track — background reflects off/on (and loading override).',
      properties: [
        {
          property: 'Width × height',
          kind: 'raw-value',
          staticValue: '32×20px',
          source: 'components/Switch.tsx · .ds-switch__track',
        },
        {
          property: 'Background (off)',
          kind: 'semantic-token',
          tokenRef: 'Controls · Unchecked',
          source: 'components/switchTokens.ts → --ds-switch-unchecked',
        },
        {
          property: 'Background (on)',
          kind: 'semantic-token',
          tokenRef: 'Controls · Checked',
          source: 'components/switchTokens.ts → --ds-switch-checked',
        },
        {
          property: 'Background (loading)',
          kind: 'semantic-token',
          tokenRef: 'Controls · Unchecked',
          source: 'components/Switch.tsx · [aria-busy="true"] forces unchecked track',
          note: 'Loading keeps unchecked track color while knob shows spinner.',
        },
        {
          property: 'Transition',
          kind: 'raw-value',
          staticValue: 'background-color 0.15s ease',
          source: 'components/Switch.tsx · .ds-switch__track',
        },
      ],
    },
    {
      id: 'thumb',
      order: 3,
      label: 'Thumb',
      targetSelector: '.ds-switch__knob',
      summary: 'Knob (key) — translates on checked.',
      properties: [
        {
          property: 'Size',
          kind: 'raw-value',
          staticValue: '16×16px',
          source: 'components/Switch.tsx · .ds-switch__knob',
        },
        {
          property: 'Background',
          kind: 'semantic-token',
          tokenRef: 'Controls · Key',
          source: 'components/switchTokens.ts → --ds-switch-key',
        },
        {
          property: 'Motion path (off → on)',
          kind: 'raw-value',
          staticValue: 'translateX(0) → translateX(12px)',
          source: 'components/Switch.tsx · .ds-switch__knob',
        },
        {
          property: 'Border radius',
          kind: 'raw-value',
          staticValue: '50% (circle)',
          source: 'components/Switch.tsx · .ds-switch__knob',
        },
      ],
    },
    {
      id: 'track-radius',
      order: 4,
      label: 'Track radius',
      targetSelector: '.ds-switch__track',
      summary: 'Pill geometry of the track.',
      properties: [
        {
          property: 'Border radius',
          kind: 'raw-value',
          staticValue: '999px (pill)',
          source: 'components/Switch.tsx · .ds-switch__track',
          note: 'Not mapped to radius-sem token in current implementation.',
        },
      ],
    },
    {
      id: 'internal-inset',
      order: 5,
      label: 'Internal inset',
      targetSelector: '.ds-switch__visual',
      summary: 'Visual frame vs track/knob offsets inside 40×24.',
      properties: [
        {
          property: 'Visual frame',
          kind: 'raw-value',
          staticValue: '40×24px',
          source: 'components/Switch.tsx · .ds-switch__visual',
        },
        {
          property: 'Track inset (top, left)',
          kind: 'raw-value',
          staticValue: '2px, 4px',
          source: 'components/Switch.tsx · .ds-switch__track',
        },
        {
          property: 'Thumb inset (top, left)',
          kind: 'raw-value',
          staticValue: '4px, 6px',
          source: 'components/Switch.tsx · .ds-switch__knob',
        },
      ],
    },
    {
      id: 'focus-ring',
      order: 6,
      label: 'Focus ring',
      targetSelector: '.ds-switch__track',
      summary: 'Focus-visible and hover (Web) ring on track.',
      properties: [
        {
          property: 'Focus ring',
          kind: 'semantic-token',
          tokenRef: 'Strokes · Primary',
          staticValue: 'box-shadow: 0 0 0 2px',
          source: 'components/Switch.tsx · :focus-visible .ds-switch__track',
        },
        {
          property: 'Hover ring (Web)',
          kind: 'semantic-token',
          tokenRef: 'Strokes · Primary',
          staticValue: 'box-shadow: 0 0 0 2px',
          source: 'components/Switch.tsx · @media (hover: hover)',
        },
        {
          property: 'Outline',
          kind: 'raw-value',
          staticValue: 'none (ring via box-shadow)',
          source: 'components/Switch.tsx',
        },
      ],
    },
    {
      id: 'disabled-treatment',
      order: 7,
      label: 'Disabled treatment',
      targetSelector: '.ds-switch-root',
      summary: 'Disabled root — opacity + non-interactive.',
      properties: [
        {
          property: 'Opacity',
          kind: 'platform-convention',
          staticValue: '40%',
          source: 'components/Switch.tsx · .ds-switch-root:disabled',
          note: 'Governance rule (.cursorrules); Figma mockup shows 50% — documented exception.',
        },
        {
          property: 'Interaction',
          kind: 'platform-convention',
          staticValue: 'disabled attribute, cursor default',
          source: 'components/Switch.tsx',
        },
      ],
    },
    {
      id: 'motion',
      order: 8,
      label: 'Motion',
      targetSelector: '.ds-switch__knob',
      summary: 'Thumb translate + track color transition.',
      properties: [
        {
          property: 'Thumb transition',
          kind: 'raw-value',
          staticValue: 'transform 0.15s ease',
          source: 'components/Switch.tsx · .ds-switch__knob',
        },
        {
          property: 'Track transition',
          kind: 'raw-value',
          staticValue: 'background-color 0.15s ease',
          source: 'components/Switch.tsx · .ds-switch__track',
        },
        {
          property: 'Reduced motion',
          kind: 'platform-convention',
          staticValue: 'transition-duration 0.01ms; loader animation slowed',
          source: 'components/Switch.tsx · @media (prefers-reduced-motion: reduce)',
        },
      ],
    },
  ],
};
