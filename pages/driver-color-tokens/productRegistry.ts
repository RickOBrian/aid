/**
 * Product list + URL-prefix routing for the multi-product DS portal.
 *
 * Source of truth for which products exist and are switchable is
 * `products/registry.json` (repo root) — not a hardcoded list here. Adding a
 * third product means adding it to that registry (status `active` or
 * `onboarding`); this file and `ProductSwitcher` pick it up automatically.
 *
 * URL scheme: `/[product]/...` (e.g. `/rider/tokens/colors`). Paths without
 * a recognized product prefix (`/tokens/colors`, `/design-system`, `/`) fall
 * back to `DEFAULT_PRODUCT_ID` (`driver`) — this is the back-compat path so
 * existing Driver links keep working without a redirect.
 */

export interface ProductRegistryEntry {
  id: string;
  label: string;
  status: string;
}

interface ProductsRegistryFile {
  products: ProductRegistryEntry[];
}

const registryModules = import.meta.glob('../../products/registry.json', {
  eager: true,
  import: 'default',
}) as Record<string, ProductsRegistryFile>;

const registryFile = Object.values(registryModules)[0];
const ALL_PRODUCTS: ProductRegistryEntry[] = registryFile?.products ?? [];

/** Statuses eligible for the product switcher, per `product-context.mdc`. */
const SWITCHABLE_STATUSES = new Set(['active', 'onboarding']);

/** Products shown in the switcher and eligible for URL-prefix routing — excludes legacy/reference products (ui-kit-a, ui-kit-b, sutochno, design-system). */
export const SWITCHABLE_PRODUCTS: ProductRegistryEntry[] = ALL_PRODUCTS.filter((product) =>
  SWITCHABLE_STATUSES.has(product.status),
);

const SWITCHABLE_IDS = new Set(SWITCHABLE_PRODUCTS.map((product) => product.id));

export const DEFAULT_PRODUCT_ID = 'driver';

export function isSwitchableProductId(id: string): boolean {
  return SWITCHABLE_IDS.has(id);
}

export function getProductLabel(id: string): string {
  return SWITCHABLE_PRODUCTS.find((product) => product.id === id)?.label ?? id;
}

/** Short name for the product switcher menu — strips the `aid: ` prefix from registry labels. */
export function getProductSwitcherLabel(id: string): string {
  return getProductLabel(id).replace(/^aid:\s*/i, '');
}

/** Splits registry label into non-clickable prefix and clickable product name. */
export function getProductLabelParts(id: string): { prefix: string; name: string } {
  const label = getProductLabel(id);
  const match = label.match(/^(aid:\s*)(.*)$/i);
  if (match) {
    return { prefix: match[1], name: match[2] };
  }
  return { prefix: '', name: label };
}

/** Every product's presentbook hub lives at this fixed suffix. */
export function productHubPath(id: string): string {
  return `/${id}/design-system`;
}

export function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export interface ResolvedProductRoute {
  productId: string;
  /** Path with the product prefix stripped — empty string means the product's hub root. */
  remainder: string;
}

export function resolveProductRoute(pathname: string): ResolvedProductRoute {
  const normalized = normalizePathname(pathname);
  const segments = normalized.split('/').filter(Boolean);
  const [first, ...rest] = segments;

  if (first && isSwitchableProductId(first)) {
    return { productId: first, remainder: rest.length > 0 ? `/${rest.join('/')}` : '' };
  }

  return { productId: DEFAULT_PRODUCT_ID, remainder: normalized };
}

export function resolveProductId(pathname: string): string {
  return resolveProductRoute(pathname).productId;
}
