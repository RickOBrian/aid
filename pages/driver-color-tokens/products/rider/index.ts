/**
 * Rider product content index — infrastructure only, no real content yet.
 *
 * Empty collections make every hub section resolve as automatically
 * unavailable (see `productContent.ts` → `hasProductContent`) — there is no
 * manual `available: false` flag anywhere. Once real Rider token or
 * component data exists, populate these exports (or replace them with
 * re-exports from real Rider data files, mirroring
 * `products/driver/index.ts`) and every affected hub section activates
 * itself — no changes to hub/page logic required.
 */
export const colorSections: unknown[] = [];
export const typographySections: unknown[] = [];
export const spacingTokens: unknown[] = [];
export const radiusTokens: unknown[] = [];
export const shadowSections: unknown[] = [];
export const iconSections: unknown[] = [];
export const components: unknown[] = [];
