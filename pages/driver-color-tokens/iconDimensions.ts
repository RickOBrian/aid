import dimensionsJson from './iconDimensions.json';
import { ICON_DEFAULT_SIZE } from './iconsData';
import type { IconDimensions } from './parseSvgDimensions';

export { formatIconSize, parseSvgDimensions } from './parseSvgDimensions';
export type { IconDimensions } from './parseSvgDimensions';

const dimensionsMap = dimensionsJson as Record<string, IconDimensions>;

export function iconDimensionsKey(
  sectionId: string,
  iconId: string,
  productId?: string,
): string {
  if (productId === 'rider') {
    return `rider/${sectionId}/${iconId}`;
  }
  return `${sectionId}/${iconId}`;
}

export function getIconDimensions(
  sectionId: string,
  iconId: string,
  productId?: string,
): IconDimensions {
  return (
    dimensionsMap[iconDimensionsKey(sectionId, iconId, productId)] ?? {
      width: ICON_DEFAULT_SIZE,
      height: ICON_DEFAULT_SIZE,
    }
  );
}
