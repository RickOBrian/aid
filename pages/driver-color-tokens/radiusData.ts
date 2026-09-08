import type { CSSProperties } from 'react';

export interface RadiusToken {
  id: string;
  name: string;
  valueLabel: string;
  borderTopRightRadius: string;
}

export const radiusCollection = {
  collectionName: 'radius-sem',
  artifact: 'Radius/Semantic',
} as const;

/** Radius tokens — значения из Figma (radius table). */
export const radiusTokens: RadiusToken[] = [
  { id: 'radius-flat', name: 'radius-flat', valueLabel: '0', borderTopRightRadius: '0' },
  { id: 'radius-4', name: 'radius-4', valueLabel: '4', borderTopRightRadius: '4px' },
  { id: 'radius-8', name: 'radius-8', valueLabel: '8', borderTopRightRadius: '8px' },
  { id: 'radius-12', name: 'radius-12', valueLabel: '12', borderTopRightRadius: '12px' },
  { id: 'radius-16', name: 'radius-16', valueLabel: '16', borderTopRightRadius: '16px' },
  { id: 'radius-20', name: 'radius-20', valueLabel: '20', borderTopRightRadius: '20px' },
  { id: 'radius-24', name: 'radius-24', valueLabel: '24', borderTopRightRadius: '24px' },
  { id: 'radius-28', name: 'radius-28', valueLabel: '28', borderTopRightRadius: '28px' },
  { id: 'radius-32', name: 'radius-32', valueLabel: '32', borderTopRightRadius: '32px' },
  {
    id: 'radius-pill',
    name: 'radius-pill',
    valueLabel: '50%',
    borderTopRightRadius: '9999px',
  },
];

export function radiusPreviewStyle(token: RadiusToken): CSSProperties {
  return {
    borderTopRightRadius: token.borderTopRightRadius,
  };
}
