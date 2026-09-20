import type { ReactNode } from 'react';
import { productAccentCssVars } from './dsProductAccent';

interface ProductAccentScopeProps {
  productId: string;
  children: ReactNode;
}

/** Sets product-scoped accent CSS variables for portal chrome. */
export function ProductAccentScope({ productId, children }: ProductAccentScopeProps) {
  return (
    <div
      className="ds-product-accent-scope"
      style={{ display: 'contents', ...productAccentCssVars(productId) }}
    >
      {children}
    </div>
  );
}
