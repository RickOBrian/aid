import {
  riderShadowCollection,
  riderShadowStyles,
  resolveRiderShadowSections,
  type ShadowColorMode,
} from './products/rider/shadowData';
import {
  shadowsCollection as driverShadowCollection,
  shadowSections as driverShadowSections,
} from './shadowsData';

export type { ShadowColorMode };

export const DEFAULT_SHADOW_MODE: ShadowColorMode = 'day';

export interface ProductShadowContent {
  sections: ReturnType<typeof resolveRiderShadowSections>;
  riderStyles: typeof riderShadowStyles | null;
  collection: typeof driverShadowCollection | typeof riderShadowCollection;
  modes: readonly ShadowColorMode[] | null;
}

export function getProductShadowContent(
  productId: string,
  mode: ShadowColorMode = DEFAULT_SHADOW_MODE,
): ProductShadowContent {
  if (productId === 'rider') {
    return {
      sections: resolveRiderShadowSections(mode),
      riderStyles: riderShadowStyles,
      collection: riderShadowCollection,
      modes: ['day', 'night'] as const,
    };
  }

  return {
    sections: driverShadowSections,
    riderStyles: null,
    collection: driverShadowCollection,
    modes: null,
  };
}
