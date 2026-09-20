import { DEFAULT_PRODUCT_ID } from './productRegistry';
import {
  colorTokenCollection as driverColorTokenCollection,
  semanticColorSections as driverSemanticColorSections,
} from './data';
import {
  colorTokenCollection as riderColorTokenCollection,
  semanticColorSections as riderSemanticColorSections,
  type SemanticColorSection,
} from './products/rider/colorData';

export interface ProductColorContent {
  sections: SemanticColorSection[];
  collection: typeof driverColorTokenCollection | typeof riderColorTokenCollection;
}

export function getProductColorContent(productId: string): ProductColorContent {
  if (productId === 'rider') {
    return {
      sections: riderSemanticColorSections,
      collection: riderColorTokenCollection,
    };
  }

  return {
    sections: driverSemanticColorSections,
    collection: driverColorTokenCollection,
  };
}

export function isDefaultProductColorPage(productId: string): boolean {
  return productId === DEFAULT_PRODUCT_ID;
}
