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
export { semanticColorSections as colorSections, colorTokenCollection } from './colorData';
import { resolveRiderTypographySections } from './typographyData';
export { typographyCollection } from './typographyData';
import { riderShadowSections, riderShadowCollection } from './shadowData';
import { riderGlassSections, riderGlassCollection } from './glassData';
import { riderSpacingTokens, riderSpacingCollection } from './spacingData';
import { riderRadiusTokens, riderRadiusCollection } from './radiusData';
import { riderIconSections, riderIconCollection } from './iconsData';
export {
  riderShadowCollection,
  riderGlassCollection,
  riderSpacingCollection,
  riderRadiusCollection,
  riderIconCollection,
};
/** Hub availability + productContent lookup — must be a named const, not a re-export alias (Vite drops unused re-exports). */
export const shadowSections = riderShadowSections;
export const glassSections = riderGlassSections;
export const spacingTokens = riderSpacingTokens;
export const radiusTokens = riderRadiusTokens;
/** Resolved with the default platform (iOS) — used only for hub availability. */
export const typographySections = resolveRiderTypographySections('ios');
export const iconSections = riderIconSections;
export const components: unknown[] = [];
