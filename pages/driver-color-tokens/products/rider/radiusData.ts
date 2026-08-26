/**
 * Rider radius tokens from Figma «🙋🏻‍♀️ WB AID Rider Tokens — Styles»,
 * «Переменные скруглений в Rider» (node 63:14).
 * Source: https://www.figma.com/design/yrfG6u9osujKX8e1B14lpT/…?node-id=63-14
 *
 * Collection `radius` — px values match token suffix (radius-N → N px).
 */

import type { RadiusToken } from '../../radiusData';

export const riderRadiusCollection = {
  collectionName: 'rider-radius',
  artifact: 'Rider Radius',
} as const;

function radiusToken(
  name: string,
  valuePx: number,
  options?: { valueLabel?: string; borderTopRightRadius?: string },
): RadiusToken {
  const valueLabel = options?.valueLabel ?? String(valuePx);
  const borderTopRightRadius =
    options?.borderTopRightRadius ?? (valuePx === 0 ? '0' : `${valuePx}px`);
  return {
    id: name,
    name,
    valueLabel,
    borderTopRightRadius,
  };
}

/** Rider radius scale — 14 tokens from Figma node 63:14. */
export const riderRadiusTokens: RadiusToken[] = [
  radiusToken('radius-flat', 0),
  radiusToken('radius-2', 2),
  radiusToken('radius-4', 4),
  radiusToken('radius-6', 6),
  radiusToken('radius-8', 8),
  radiusToken('radius-10', 10),
  radiusToken('radius-12', 12),
  radiusToken('radius-14', 14),
  radiusToken('radius-16', 16),
  radiusToken('radius-20', 20),
  radiusToken('radius-24', 24),
  radiusToken('radius-28', 28),
  radiusToken('radius-32', 32),
  radiusToken('radius-pill', 9999, {
    valueLabel: '50%',
    borderTopRightRadius: '9999px',
  }),
];
