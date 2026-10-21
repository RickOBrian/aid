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

const DEF_REFERENCE = /url\(#([^)]+)\)|href="#([^"]+)"/g;

function findElementEnd(svg: string, tagName: string, start: number): number {
  const openTag = svg.indexOf('>', start);
  if (openTag === -1) {
    return -1;
  }
  if (svg[openTag - 1] === '/') {
    return openTag + 1;
  }

  const tagPattern = new RegExp(`<(/?)${tagName}\\b[^>]*?(/?)>`, 'g');
  tagPattern.lastIndex = openTag + 1;
  let depth = 1;
  for (let match = tagPattern.exec(svg); match; match = tagPattern.exec(svg)) {
    if (match[2]) {
      continue;
    }
    depth += match[1] ? -1 : 1;
    if (depth === 0) {
      return match.index + match[0].length;
    }
  }
  return -1;
}

function collectReferencedDefs(svg: string, content: string): string[] {
  const defs = svg.match(/<defs>([\s\S]*?)<\/defs>/i)?.[1] ?? '';
  const byId = new Map<string, string>();
  const elementStart = /<([a-zA-Z][\w:-]*)\b[^>]*\bid="([^"]+)"/g;
  for (let match = elementStart.exec(defs); match; match = elementStart.exec(defs)) {
    const end = findElementEnd(defs, match[1], match.index);
    if (end === -1) {
      continue;
    }
    byId.set(match[2], defs.slice(match.index, end));
    elementStart.lastIndex = end;
  }

  const kept: string[] = [];
  const seen = new Set<string>();
  const queue = [content];
  while (queue.length > 0) {
    const chunk = queue.shift() ?? '';
    for (const match of chunk.matchAll(DEF_REFERENCE)) {
      const id = match[1] ?? match[2];
      const element = byId.get(id);
      if (!element || seen.has(id)) {
        continue;
      }
      seen.add(id);
      kept.push(element);
      queue.push(element);
    }
  }
  return kept;
}

/**
 * Cuts one icon symbol (`<g id="ic_…">`) out of a Figma export that still
 * carries its parent frames, and keeps only the defs the symbol references.
 * Returns null when the export has no such group.
 */
export function extractIconSymbolSvg(svgText: string, symbolName: string): string | null {
  const start = svgText.indexOf(`<g id="${symbolName}"`);
  if (start === -1) {
    return null;
  }
  const end = findElementEnd(svgText, 'g', start);
  if (end === -1) {
    return null;
  }

  const group = svgText.slice(start, end);
  const defs = collectReferencedDefs(svgText, group);
  const { width, height, viewBox } = readRootSvgAttributes(svgText);

  return [
    `<svg width="${width}" height="${height}" viewBox="${viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg">`,
    group,
    ...(defs.length > 0 ? ['<defs>', ...defs, '</defs>'] : []),
    '</svg>',
  ].join('\n');
}
