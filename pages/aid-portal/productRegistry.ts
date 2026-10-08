/**
 * Product list + URL-prefix routing for the multi-product DS portal.
 *
 * Source of truth for which products exist and are switchable is
 * `products/registry.json` (repo root) — not a hardcoded list here. Adding a
 * third product means adding it to that registry (status `active` or
 * `onboarding`); this file and `ProductSwitcher` pick it up automatically.
 *
 * URL scheme: `/[product]/...` (e.g. `/rider/tokens/colors`); the product hub
 * is the bare `/[product]` (`aidteam.pro/driver`). Old addresses — without a
 * product (`/tokens/colors`, `/`) or with the former hub segment
 * (`/driver/design-system`, `/design-system`) — are rewritten to the
 * canonical one on load (`canonicalAppPath`), with `driver` as the default
 * product. The gateway serves `index.html` for any path, so the redirect is
 * client-side (`history.replaceState`), without a reload.
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

/** Statuses eligible for the product switcher, per
 * `skills/_shared/protocols/gates/product-context.md`. */
const SWITCHABLE_STATUSES = new Set(['active', 'onboarding']);

/** Products shown in the switcher and eligible for URL-prefix routing — excludes reference products such as design-system. */
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
/** Former hub segment: `/driver/design-system` → `/driver`. */
const LEGACY_HUB_SEGMENT = 'design-system';

/** Paths outside product routing — kept as they are. */
const PRODUCT_AGNOSTIC_PATHS = new Set(['/login', '/ttm']);

export function productHubPath(id: string): string {
  return `/${id}`;
}

/**
 * A route of the app (`/tokens/colors`, `/`, `/design-system`, or already
 * prefixed `/rider/tokens/colors`) as a link inside product `id`.
 */
export function productPath(id: string, route: string): string {
  const normalized = normalizePathname(route);
  const [first, ...rest] = normalized.split('/').filter(Boolean);
  if (first && isSwitchableProductId(first)) {
    return canonicalAppPath(normalized) ?? normalized;
  }
  if (!first || (first === LEGACY_HUB_SEGMENT && rest.length === 0)) {
    return productHubPath(id);
  }
  return `/${id}${normalized}`;
}

/**
 * Canonical address for `pathname`, or `null` if it is already canonical.
 * `/` and `/design-system` → `/driver`; `/tokens/colors` →
 * `/driver/tokens/colors`; `/rider/design-system` → `/rider`; trailing slash
 * dropped.
 */
export function canonicalAppPath(pathname: string): string | null {
  const normalized = normalizePathname(pathname);
  if (PRODUCT_AGNOSTIC_PATHS.has(normalized)) {
    return null;
  }
  const [first, ...rest] = normalized.split('/').filter(Boolean);
  let canonical: string;
  if (first && isSwitchableProductId(first)) {
    canonical = rest.length === 1 && rest[0] === LEGACY_HUB_SEGMENT ? productHubPath(first) : normalized;
  } else {
    canonical = productPath(DEFAULT_PRODUCT_ID, normalized);
  }
  return canonical === pathname ? null : canonical;
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
