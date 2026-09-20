export interface IconDimensions {
  width: number;
  height: number;
}

export function parseSvgDimensions(svgText: string): IconDimensions {
  const rootMatch = svgText.match(/<svg\b([^>]*)>/i);
  const attributes = rootMatch?.[1] ?? '';

  const widthRaw = attributes.match(/\bwidth="([^"]+)"/i)?.[1];
  const heightRaw = attributes.match(/\bheight="([^"]+)"/i)?.[1];
  const viewBox = attributes.match(/\bviewBox="([^"]+)"/i)?.[1];

  if (widthRaw && heightRaw) {
    const width = parseFloat(widthRaw);
    const height = parseFloat(heightRaw);
    if (!Number.isNaN(width) && !Number.isNaN(height) && width > 0 && height > 0) {
      return { width, height };
    }
  }

  if (viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts.every((value) => !Number.isNaN(value) && value >= 0)) {
      return { width: parts[2], height: parts[3] };
    }
  }

  return { width: 24, height: 24 };
}

export function formatIconSize({ width, height }: IconDimensions): string {
  return `${width}×${height}`;
}
