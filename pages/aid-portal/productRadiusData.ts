import {
  riderRadiusCollection,
  riderRadiusTokens,
} from './products/rider/radiusData';
import {
  radiusCollection as driverRadiusCollection,
  radiusTokens as driverRadiusTokens,
  radiusPreviewStyle,
  type RadiusToken,
} from './radiusData';

export interface ProductRadiusContent {
  tokens: RadiusToken[];
  collection: typeof driverRadiusCollection | typeof riderRadiusCollection;
}

export function getProductRadiusContent(productId: string): ProductRadiusContent {
  if (productId === 'rider') {
    return {
      tokens: riderRadiusTokens,
      collection: riderRadiusCollection,
    };
  }

  return {
    tokens: driverRadiusTokens,
    collection: driverRadiusCollection,
  };
}

export { radiusPreviewStyle };
