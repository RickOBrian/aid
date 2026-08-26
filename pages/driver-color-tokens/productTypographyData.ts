import {
  typographyCollection as driverTypographyCollection,
  typographySections as driverTypographySections,
  type TypographySection,
} from './typographyData';
import {
  RIDER_TYPOGRAPHY_PLATFORMS,
  resolveRiderTypographySections,
  typographyCollection as riderTypographyCollection,
  type TypographyPlatform,
} from './products/rider/typographyData';
import {
  resolveRiderOutstandingTypographySections,
  typographyOutstandingCollection as riderTypographyOutstandingCollection,
} from './products/rider/typographyOutstandingData';

export type { TypographyPlatform };

export type TypographySetId = 'default' | 'outstanding';

export interface TypographySetOption {
  id: TypographySetId;
  label: string;
}

const RIDER_TYPOGRAPHY_SETS: readonly TypographySetOption[] = [
  { id: 'default', label: 'Default' },
  { id: 'outstanding', label: 'Outstanding' },
] as const;

export const DEFAULT_TYPOGRAPHY_PLATFORM: TypographyPlatform = 'ios';
export const DEFAULT_TYPOGRAPHY_SET: TypographySetId = 'default';

export interface ProductTypographyContent {
  sections: TypographySection[];
  collection:
    | typeof driverTypographyCollection
    | typeof riderTypographyCollection
    | typeof riderTypographyOutstandingCollection;
  /** `null` — product has one style set, no page-level platform switch. */
  platforms: readonly TypographyPlatform[] | null;
  /** `null` — product has a single typography set, no Default/Outstanding switch. */
  sets: readonly TypographySetOption[] | null;
}

export function getProductTypographyContent(
  productId: string,
  setId: TypographySetId,
  platform: TypographyPlatform,
): ProductTypographyContent {
  if (productId === 'rider') {
    if (setId === 'outstanding') {
      return {
        sections: resolveRiderOutstandingTypographySections(platform),
        collection: riderTypographyOutstandingCollection,
        platforms: RIDER_TYPOGRAPHY_PLATFORMS,
        sets: RIDER_TYPOGRAPHY_SETS,
      };
    }

    return {
      sections: resolveRiderTypographySections(platform),
      collection: riderTypographyCollection,
      platforms: RIDER_TYPOGRAPHY_PLATFORMS,
      sets: RIDER_TYPOGRAPHY_SETS,
    };
  }

  return {
    sections: driverTypographySections,
    collection: driverTypographyCollection,
    platforms: null,
    sets: null,
  };
}
