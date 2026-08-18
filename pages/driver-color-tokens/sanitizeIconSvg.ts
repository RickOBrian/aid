const PREVIEW_BACKGROUND = /fill="#F2F2F2"/i;
const FRAME_WRAPPER = /id="Frame 834"/i;

function extractGroupById(svg: string, groupId: string): string | null {
  const openNeedle = `<g id="${groupId}"`;
  const start = svg.indexOf(openNeedle);
  if (start === -1) {
    return null;
  }

  const contentStart = svg.indexOf('>', start);
  if (contentStart === -1) {
    return null;
  }

  let depth = 1;
  let index = contentStart + 1;

  while (index < svg.length && depth > 0) {
    const nextOpen = svg.indexOf('<g', index);
    const nextClose = svg.indexOf('</g>', index);

    if (nextClose === -1) {
      return null;
    }

    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      index = nextOpen + 2;
      continue;
    }

    depth -= 1;
    if (depth === 0) {
      return svg.slice(contentStart + 1, nextClose).trim();
    }

    index = nextClose + 4;
  }

  return null;
}

function stripBackgroundRects(content: string): string {
  return content
    .replace(/<rect[^>]*fill="#F2F2F2"[^>]*\/?>\s*/gi, '')
    .replace(/<rect[^>]*fill="white"[^>]*\/?>\s*/gi, '')
    .replace(/<rect[^>]*width="5722"[^>]*\/?>\s*/gi, '')
    .replace(/<rect[^>]*width="944"[^>]*\/?>\s*/gi, '');
}

function readRootSvgAttributes(svg: string): { width: string; height: string; viewBox: string } {
  const rootMatch = svg.match(/<svg\b([^>]*)>/i);
  const attributes = rootMatch?.[1] ?? '';

  const width = attributes.match(/\bwidth="([^"]+)"/i)?.[1] ?? '24';
  const height = attributes.match(/\bheight="([^"]+)"/i)?.[1] ?? '24';
  const viewBox = attributes.match(/\bviewBox="([^"]+)"/i)?.[1] ?? '0 0 24 24';

  return { width, height, viewBox };
}

function wrapSvgContent(content: string, svg: string): string {
  const { width, height, viewBox } = readRootSvgAttributes(svg);
  const cleaned = stripBackgroundRects(content);

  return [
    `<svg width="${width}" height="${height}" viewBox="${viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg">`,
    cleaned,
    '</svg>',
  ].join('\n');
}

export function iconSvgNeedsSanitize(svgText: string): boolean {
  return PREVIEW_BACKGROUND.test(svgText) || FRAME_WRAPPER.test(svgText);
}

/**
 * Removes Figma frame/export wrappers (preview background, section frames)
 * and keeps only the icon symbol content.
 */
export function sanitizeIconSvg(svgText: string, iconId?: string): string {
  if (!iconSvgNeedsSanitize(svgText)) {
    return svgText;
  }

  if (iconId) {
    const groupContent = extractGroupById(svgText, iconId);
    if (groupContent) {
      return wrapSvgContent(groupContent, svgText);
    }
  }

  const stripped = stripBackgroundRects(
    svgText
      .replace(/^[\s\S]*?<svg[^>]*>/i, '')
      .replace(/<\/svg>\s*$/i, ''),
  );

  return wrapSvgContent(stripped, svgText);
}
