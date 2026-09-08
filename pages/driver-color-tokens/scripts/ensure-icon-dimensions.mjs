import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSvgDimensions } from '../parseSvgDimensions.ts';

const appRoot = join(fileURLToPath(import.meta.url), '..', '..');
const iconsRoot = join(appRoot, 'public/icons');
const outputPath = join(appRoot, 'iconDimensions.json');

function collectSvgFiles(dir, keyPrefix = '') {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const nextPrefix = keyPrefix ? `${keyPrefix}/${entry.name}` : entry.name;
      files.push(...collectSvgFiles(fullPath, nextPrefix));
      continue;
    }

    if (!entry.name.endsWith('.svg')) {
      continue;
    }

    const iconId = entry.name.replace(/\.svg$/, '');
    const sectionId = keyPrefix.includes('/')
      ? keyPrefix
      : keyPrefix;
    files.push({ sectionId: keyPrefix, iconId, fullPath });
  }

  return files;
}

const dimensions = {};

for (const { sectionId, iconId, fullPath } of collectSvgFiles(iconsRoot)) {
  const svgText = readFileSync(fullPath, 'utf8');
  dimensions[`${sectionId}/${iconId}`] = parseSvgDimensions(svgText);
}

writeFileSync(outputPath, `${JSON.stringify(dimensions, null, 2)}\n`, 'utf8');

console.log(`[ensure-icon-dimensions] wrote ${Object.keys(dimensions).length} entries to iconDimensions.json`);
