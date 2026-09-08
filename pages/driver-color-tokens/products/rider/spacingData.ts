/**
 * Rider spacing tokens from Figma «🙋🏻‍♀️ WB AID Rider Tokens — Styles»,
 * «Переменные отступов в Rider» (node 62:34).
 * Source: https://www.figma.com/design/yrfG6u9osujKX8e1B14lpT/…?node-id=62-34
 *
 * Collection `space` — px values match token suffix (space-N → N px).
 */

import type { SpacingToken } from '../../spacingData';

export const riderSpacingCollection = {
  collectionName: 'rider-space',
  artifact: 'Rider Space',
} as const;

function formatRem(valuePx: number): string {
  if (valuePx === 0) {
    return '0';
  }
  return (valuePx / 16)
    .toFixed(4)
    .replace(/(\.\d*?)0+$/, '$1')
    .replace(/\.$/, '');
}

function spacingToken(name: string, valuePx: number): SpacingToken {
  const valuePxLabel = String(valuePx);
  return {
    id: name,
    name,
    valuePx,
    valuePxLabel,
    valueRemLabel: formatRem(valuePx),
  };
}

/** Rider space scale — 22 tokens from Figma node 62:34. */
export const riderSpacingTokens: SpacingToken[] = [
  spacingToken('space-0', 0),
  spacingToken('space-1', 1),
  spacingToken('space-2', 2),
  spacingToken('space-4', 4),
  spacingToken('space-6', 6),
  spacingToken('space-8', 8),
  spacingToken('space-10', 10),
  spacingToken('space-12', 12),
  spacingToken('space-14', 14),
  spacingToken('space-16', 16),
  spacingToken('space-20', 20),
  spacingToken('space-24', 24),
  spacingToken('space-28', 28),
  spacingToken('space-32', 32),
  spacingToken('space-36', 36),
  spacingToken('space-40', 40),
  spacingToken('space-48', 48),
  spacingToken('space-52', 52),
  spacingToken('space-60', 60),
  spacingToken('space-64', 64),
  spacingToken('space-72', 72),
  spacingToken('space-80', 80),
];
