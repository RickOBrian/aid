/**
 * Automatic per-product hub section availability.
 *
 * Discovers all `products/<id>/index.ts` content indexes via
 * `import.meta.glob` (no per-product wiring required here — adding a third
 * product only means adding its `products/<id>/index.ts`, this file already
 * picks it up). A hub section is "available" for a product iff that
 * product's index exports a non-empty collection for it — never a manual
 * boolean flag.
 */

export type HubSectionKey =
  | 'colors'
  | 'typography'
  | 'spacing'
  | 'radius'
  | 'shadows'
  | 'glass'
  | 'icons'
  | 'components';

interface ProductContentModule {
  colorSections?: unknown[];
  typographySections?: unknown[];
  spacingTokens?: unknown[];
  radiusTokens?: unknown[];
  shadowSections?: unknown[];
  glassSections?: unknown[];
  iconSections?: unknown[];
  components?: unknown[];
}

const KEY_TO_EXPORT: Record<HubSectionKey, keyof ProductContentModule> = {
  colors: 'colorSections',
  typography: 'typographySections',
  spacing: 'spacingTokens',
  radius: 'radiusTokens',
  shadows: 'shadowSections',
  glass: 'glassSections',
  icons: 'iconSections',
  components: 'components',
};

const productModules = import.meta.glob('./products/*/index.ts', {
  eager: true,
}) as Record<string, ProductContentModule>;

function extractProductId(modulePath: string): string | null {
  const match = modulePath.match(/\.\/products\/([^/]+)\/index\.ts$/);
  return match ? match[1] : null;
}

const contentByProduct = new Map<string, ProductContentModule>();
for (const [modulePath, module_] of Object.entries(productModules)) {
  const productId = extractProductId(modulePath);
  if (productId) {
    contentByProduct.set(productId, module_);
  }
}

/** True iff `productId` has a non-empty collection for `sectionKey` (auto-derived, not a manual flag). */
export function hasProductContent(productId: string, sectionKey: string): boolean {
  const module_ = contentByProduct.get(productId);
  if (!module_) {
    return false;
  }
  const exportName = KEY_TO_EXPORT[sectionKey as HubSectionKey];
  if (!exportName) {
    return false;
  }
  const collection = module_[exportName];
  return Array.isArray(collection) && collection.length > 0;
}

/** Product ids that have a content index registered under `products/`. */
export function listIndexedProductIds(): string[] {
  return [...contentByProduct.keys()];
}
