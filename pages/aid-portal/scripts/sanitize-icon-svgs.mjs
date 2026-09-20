/**
 * Batch-sanitize SVG icons exported with Figma frame wrappers.
 *
 * Usage: node scripts/sanitize-icon-svgs.mjs
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { iconSections } from '../iconsData.ts';
import { iconSvgNeedsSanitize, sanitizeIconSvg } from '../sanitizeIconSvg.ts';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const iconsRoot = join(rootDir, '../public/icons');

const iconIdByPath = new Map(
  iconSections.flatMap((section) =>
    section.items.map((item) => [`${section.id}/${item.id}`, item.id]),
  ),
);

async function walkSvgFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        return walkSvgFiles(fullPath);
      }
      if (entry.isFile() && entry.name.endsWith('.svg')) {
        return [fullPath];
      }
      return [];
    }),
  );

  return files.flat();
}

const svgFiles = await walkSvgFiles(iconsRoot);
let updated = 0;
let alreadyClean = 0;

for (const filePath of svgFiles) {
  const relativePath = filePath.replace(`${iconsRoot}/`, '');
  const iconId = iconIdByPath.get(relativePath.replace(/\.svg$/, ''));
  const original = await readFile(filePath, 'utf8');

  if (!iconSvgNeedsSanitize(original)) {
    alreadyClean += 1;
    continue;
  }

  const sanitized = sanitizeIconSvg(original, iconId);
  if (sanitized !== original) {
    await writeFile(filePath, `${sanitized.trim()}\n`, 'utf8');
    updated += 1;
  } else {
    alreadyClean += 1;
  }
}

console.log(
  JSON.stringify(
    {
      total: svgFiles.length,
      updated,
      alreadyClean,
    },
    null,
    2,
  ),
);
