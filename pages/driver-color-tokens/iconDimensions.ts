import dimensionsJson from './iconDimensions.json';
import { ICON_DEFAULT_SIZE } from './iconsData';
import type { IconDimensions } from './parseSvgDimensions';

export { formatIconSize, parseSvgDimensions } from './parseSvgDimensions';
export type { IconDimensions } from './parseSvgDimensions';

const dimensionsMap = dimensionsJson as Record<string, IconDimensions>;

export function iconDimensionsKey(sectionId: string, iconId: string): string {
  return `${sectionId}/${iconId}`;
}

export function getIconDimensions(sectionId: string, iconId: string): IconDimensions {
  return (
    dimensionsMap[iconDimensionsKey(sectionId, iconId)] ?? {
      width: ICON_DEFAULT_SIZE,
      height: ICON_DEFAULT_SIZE,
    }
  );
}
