import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const metadataPath = process.argv[2];
const outputPath = join(scriptDir, '../products/rider/colorData.ts');

if (!metadataPath) {
  console.error('Usage: node parse-rider-color-metadata.mjs <metadata.txt>');
  process.exit(1);
}

const source = readFileSync(metadataPath, 'utf8');

const SECTION_ORDER = [
  'Background',
  'Text',
  'Icon',
  'Stroke',
  'Pastel',
  'Technical',
  'Button',
  'Legacy Button',
  'Field',
  'Route',
  'Stories',
];

function parseModeCell(block, startIndex) {
  const cellStart = block.indexOf('name="Mode Cell"', startIndex);
  if (cellStart === -1) {
    return null;
  }

  const cellEnd = block.indexOf('</frame>', cellStart);
  const cellBlock = block.slice(cellStart, cellEnd);

  const textMatches = [...cellBlock.matchAll(/<text id="[^"]+" name="([^"]+)"[^>]*\/>/g)].map(
    (match) => match[1],
  );

  let opacity = 100;
  let hex = '#000000';

  if (textMatches.length >= 2 && textMatches[0].endsWith('%')) {
    opacity = Number.parseInt(textMatches[0], 10);
    hex = textMatches[1].startsWith('#') ? textMatches[1].toUpperCase() : hex;
  } else if (textMatches.length >= 1 && textMatches[0].startsWith('#')) {
    hex = textMatches[0].toUpperCase();
    opacity = 100;
  }

  return { opacity, hex, nextIndex: cellEnd };
}

function parseRowBlock(block, fullName) {
  const slashIndex = fullName.indexOf('/');
  const tokenName = fullName.slice(slashIndex + 1);

  const day = parseModeCell(block, 0);
  const night = day ? parseModeCell(block, day.nextIndex) : null;

  const descriptionMatch = block.match(
    /<text id="[^"]+" name="([^"#][^"]*)" x="872"[^>]*\/>/,
  );
  const description = descriptionMatch?.[1]?.replace(/\\"/g, '"') ?? '';

  return {
    name: tokenName,
    day: { hex: day?.hex ?? '#000000', opacity: day?.opacity ?? 100 },
    night: { hex: night?.hex ?? day?.hex ?? '#000000', opacity: night?.opacity ?? day?.opacity ?? 100 },
    description,
  };
}

const rowRegex =
  /<frame id="[^"]+" name="((?:Background|Text|Icon|Stroke|Pastel|Technical|Button|Legacy Button|Field|Route|Stories)\/[^"]+)"[^>]*>([\s\S]*?)<\/frame>\s*(?=<frame id="[^"]+" name="(?:Separator|(?:Background|Text|Icon|Stroke|Pastel|Technical|Button|Legacy Button|Field|Route|Stories)\/)|<\/frame>\s*<\/frame>\s*<\/frame>\s*<\/frame>\s*<frame id="28:\d+" name="Column:|$)/g;

const sections = new Map(SECTION_ORDER.map((title) => [title, []]));

for (const match of source.matchAll(rowRegex)) {
  const fullName = match[1];
  const block = match[2];
  const sectionTitle = fullName.slice(0, fullName.indexOf('/'));
  const row = parseRowBlock(block, fullName);

  if (!sections.has(sectionTitle)) {
    sections.set(sectionTitle, []);
  }

  sections.get(sectionTitle).push(row);
}

function formatColorModeValue({ hex, opacity }) {
  return `{ hex: '${hex}', opacity: ${opacity} }`;
}

function formatRow(row) {
  const description = row.description.replace(/'/g, "\\'");
  return `  {
    name: '${row.name.replace(/'/g, "\\'")}',
    day: ${formatColorModeValue(row.day)},
    night: ${formatColorModeValue(row.night)},
    description: '${description}',
  }`;
}

const sectionBlocks = SECTION_ORDER.filter((title) => sections.get(title)?.length)
  .map((title) => {
    const rows = sections.get(title).map(formatRow).join(',\n');
    const varName = `${title.replace(/\s+/g, '')}Rows`;
    return `const ${varName}: SemanticColorRow[] = [\n${rows}\n];`;
  })
  .join('\n\n');

const sectionExports = SECTION_ORDER.filter((title) => sections.get(title)?.length)
  .map((title) => `  { title: '${title}', rows: ${title.replace(/\s+/g, '')}Rows },`)
  .join('\n');

const file = `/**
 * Rider semantic color tokens from Figma «🤑 WB AID Rider Tokens - Styles», section color-sem (node 28:2282).
 * Source: https://www.figma.com/design/yrfG6u9osujKX8e1B14lpT/?node-id=28-2282
 */

export interface ColorModeValue {
  hex: string;
  opacity: number;
}

export interface SemanticColorRow {
  name: string;
  day: ColorModeValue;
  night: ColorModeValue;
  description: string;
}

export interface SemanticColorSection {
  title: string;
  rows: SemanticColorRow[];
}

${sectionBlocks}

export const colorTokenCollection = {
  collectionName: 'rider-colors-semantic',
  artifact: 'Rider Colors/Semantic',
} as const;

export const semanticColorSections: SemanticColorSection[] = [
${sectionExports}
];
`;

writeFileSync(outputPath, file, 'utf8');

const totalRows = [...sections.values()].reduce((sum, rows) => sum + rows.length, 0);
console.log(`[parse-rider-color-metadata] wrote ${totalRows} tokens across ${SECTION_ORDER.filter((t) => sections.get(t)?.length).length} sections to ${outputPath}`);
