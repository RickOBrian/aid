import type { CSSProperties } from 'react';
import { DEFAULT_PRODUCT_ID } from './productRegistry';

/** Portal chrome accent — Driver blue / Rider purple (not DS semantic tokens). */
export const PRODUCT_ACCENT = {
  driver: {
    text: '#3D6AFE',
    bg: '#EBF0FF',
    textRgb: '61, 106, 254',
  },
  rider: {
    text: '#9747FF',
    bg: '#F5EDFF',
    textRgb: '151, 71, 255',
  },
} as const;

export type ProductAccentId = keyof typeof PRODUCT_ACCENT;

export function resolveProductAccent(productId: string) {
  return PRODUCT_ACCENT[productId as ProductAccentId] ?? PRODUCT_ACCENT[DEFAULT_PRODUCT_ID as ProductAccentId];
}

export function productAccentCssVars(productId: string): CSSProperties {
  const accent = resolveProductAccent(productId);
  return {
    ['--ds-accent' as string]: accent.text,
    ['--ds-accent-bg' as string]: accent.bg,
    ['--ds-accent-rgb' as string]: accent.textRgb,
  };
}

/** Shared accent patterns — parent must set `--ds-accent*` via `ProductAccentScope`. */
export const DS_PRODUCT_ACCENT_STYLE = `
.ds-accent-segment button[aria-pressed="true"] {
  background: var(--ds-accent-bg);
  color: var(--ds-accent);
  font-weight: 500;
}
.ds-accent-segment button:focus-visible {
  outline: 2px solid var(--ds-accent);
  outline-offset: -2px;
}
.ds-accent-tab[aria-selected="true"] {
  color: var(--ds-accent);
  border-bottom-color: var(--ds-accent);
}
.ds-accent-link {
  color: var(--ds-accent);
  text-decoration: none;
}
.ds-accent-link:hover {
  text-decoration: underline;
}
.ds-accent-link:focus-visible {
  outline: 2px solid var(--ds-accent);
  outline-offset: 2px;
  border-radius: 4px;
}
`;
