/**
 * Driver product content index — thin re-export layer for automatic
 * per-product hub section availability (see `productContent.ts`).
 *
 * No token/component values are duplicated or moved here: every export
 * points back at the existing canonical Driver data files. This file exists
 * only so `productContent.ts` can discover, via `import.meta.glob`, which
 * collections exist for which product — the same pattern applies to any
 * future product (e.g. `products/rider/index.ts`) without touching hub or
 * page logic.
 */
export { semanticColorSections as colorSections } from '../../data';
export { typographySections } from '../../typographyData';
export { spacingTokens } from '../../spacingData';
export { radiusTokens } from '../../radiusData';
export { shadowSections } from '../../shadowsData';
export { iconSections } from '../../iconsData';

import componentRegistryJson from '../../component-registry.json';

export const components = componentRegistryJson.components;
