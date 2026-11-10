import type { CSSProperties } from 'react';
import { DEFAULT_PRODUCT_ID } from './productRegistry';

/**
 * Цвет продукта в хроме разделов Driver и Rider (PD п. 9 #354: «хром портала не
 * меняется»). pf-gap: в Kit это будут `text-accent-product-<продукт>` и
 * `bg-accent-product-<продукт>-fade` (спека presentbook-6 §7.1, п. 1а) — до их
 * заведения значения здесь. Вне разделов продукта — графит Kit (`persefona/tokens.css`).
 */
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
    ['--ds-selected-bg' as string]: accent.bg,
    ['--ds-selected-text' as string]: accent.text,
    ['--ds-link-decoration' as string]: 'none',
  };
}

/** Shared accent patterns — parent must set `--ds-accent*` via `ProductAccentScope`. */
export const DS_PRODUCT_ACCENT_STYLE = `
.ds-accent-segment button[aria-pressed="true"] {
  background: var(--ds-selected-bg);
  color: var(--ds-selected-text);
  font-weight: var(--pf-type-weight-500);
}
.ds-accent-segment button:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
.ds-accent-tab[aria-selected="true"] {
  color: var(--ds-accent);
  border-bottom-color: var(--ds-accent);
}
.ds-accent-link {
  color: var(--ds-accent);
  text-decoration: var(--ds-link-decoration);
}
.ds-accent-link:hover {
  text-decoration: underline;
}
.ds-accent-link:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
  border-radius: var(--pf-radius-s);
}
`;
