import {
  riderSpacingCollection,
  riderSpacingTokens,
} from './products/rider/spacingData';
import {
  spacingCollection as driverSpacingCollection,
  spacingTokens as driverSpacingTokens,
  type SpacingToken,
} from './spacingData';

export interface ProductSpacingContent {
  tokens: SpacingToken[];
  collection: typeof driverSpacingCollection | typeof riderSpacingCollection;
  /** CSS color for preview bar lines — Figma accent per product. */
  previewLineColor: string;
  /** CSS color for preview bar fill between lines. */
  previewFillColor: string;
}

const DRIVER_PREVIEW = {
  previewLineColor: '#2c64e3',
  previewFillColor: 'rgba(141, 185, 253, 0.24)',
} as const;

const RIDER_PREVIEW = {
  previewLineColor: '#8526ff',
  previewFillColor: 'rgba(133, 38, 255, 0.2)',
} as const;

export function getProductSpacingContent(productId: string): ProductSpacingContent {
  if (productId === 'rider') {
    return {
      tokens: riderSpacingTokens,
      collection: riderSpacingCollection,
      ...RIDER_PREVIEW,
    };
  }

  return {
    tokens: driverSpacingTokens,
    collection: driverSpacingCollection,
    ...DRIVER_PREVIEW,
  };
}
