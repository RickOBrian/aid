/**
 * Parses Figma metadata XML for Rider Icons frame 3691:4.
 * Usage: node scripts/parse-rider-icons-metadata.mjs <metadata.xml>
 */
import { readFileSync } from 'node:fs';

const SECTION_FRAMES = new Map([
  ['Brands', 'brands'],
  ['Controls', 'controls'],
  ['informative', 'informative'],
  ['Actions', 'actions'],
  ['Addresses', 'addresses'],
]);

function symbolToId(symbolName) {
  if (symbolName.startsWith('Property 1=')) {
    const active = symbolName.includes('Active=On') ? 'on' : 'off';
    return `radiobutton_${active}`;
  }
  return symbolName
    .replace(/^ic_/, '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_/-]/gi, '_')
    .toLowerCase();
}

function parseMetadata(xml) {
  const sections = [];
  let currentSection = null;
  const usedIds = new Map();

  for (const line of xml.split('\n')) {
    const sectionMatch = line.match(/<frame id="[^"]+" name="(Brands|Controls|informative|Actions|Addresses)"/);
    if (sectionMatch) {
      const title = sectionMatch[1];
      const id = SECTION_FRAMES.get(title) ?? title.toLowerCase();
      currentSection = { id, title: title === 'informative' ? 'Informative' : title, items: [] };
      sections.push(currentSection);
      usedIds.set(id, new Set());
      continue;
    }

    const symbolMatch = line.match(/<symbol id="([^"]+)" name="([^"]+)"/);
    if (!symbolMatch || !currentSection) {
      continue;
    }

    const figmaNodeId = symbolMatch[1];
    const symbolName = symbolMatch[2];
    let id = symbolToId(symbolName);
    const sectionUsed = usedIds.get(currentSection.id);

    if (sectionUsed.has(id)) {
      let suffix = 2;
      while (sectionUsed.has(`${id}_${suffix}`)) {
        suffix += 1;
      }
      id = `${id}_${suffix}`;
    }
    sectionUsed.add(id);

    const name = id.replace(/\//g, '/');
    currentSection.items.push({ id, name, figmaNodeId, symbolName });
  }

  return sections;
}

const xmlPath = process.argv[2];
if (!xmlPath) {
  console.error('Usage: node parse-rider-icons-metadata.mjs <metadata.xml>');
  process.exit(1);
}

const xml = readFileSync(xmlPath, 'utf8');
const sections = parseMetadata(xml);
console.log(JSON.stringify(sections, null, 2));
console.error(`Total icons: ${sections.reduce((n, s) => n + s.items.length, 0)}`);
