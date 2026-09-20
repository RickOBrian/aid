import {
  riderIconCollection,
  riderIconSections,
} from './products/rider/iconsData';
import {
  iconCollection as driverIconCollection,
  iconSections as driverIconSections,
  type IconItem,
  type IconSection,
} from './iconsData';

export interface ProductIconContent {
  sections: IconSection[];
  collection: typeof driverIconCollection | typeof riderIconCollection;
}

export function getProductIconContent(productId: string): ProductIconContent {
  if (productId === 'rider') {
    return {
      sections: riderIconSections,
      collection: riderIconCollection,
    };
  }

  return {
    sections: driverIconSections,
    collection: driverIconCollection,
  };
}

export function productIconAssetPath(
  productId: string,
  sectionId: string,
  iconId: string,
): string {
  if (productId === 'rider') {
    return `/icons/rider/${sectionId}/${iconId}.svg`;
  }
  return `/icons/${sectionId}/${iconId}.svg`;
}

export function productIconDimensionsKey(
  productId: string,
  sectionId: string,
  iconId: string,
): string {
  if (productId === 'rider') {
    return `rider/${sectionId}/${iconId}`;
  }
  return `${sectionId}/${iconId}`;
}

export type { IconItem, IconSection };
