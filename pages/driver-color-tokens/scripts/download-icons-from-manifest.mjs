/**
 * Скачивает SVG-иконки из Figma MCP asset URLs.
 * Запуск: node scripts/download-icons-from-manifest.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sanitizeIconSvg } from '../sanitizeIconSvg.ts';

const rootDir = dirname(fileURLToPath(import.meta.url));
const publicRoot = join(rootDir, '../public/icons');

async function downloadIcon(sectionId, iconId, url) {
  const dir = join(publicRoot, sectionId);
  await mkdir(dir, { recursive: true });
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed ${sectionId}/${iconId}: ${response.status}`);
  }
  const svg = sanitizeIconSvg(await response.text(), iconId);
  await writeFile(join(dir, `${iconId}.svg`), svg, 'utf8');
}

export async function downloadManifest(manifest) {
  let ok = 0;
  const errors = [];

  for (const entry of manifest) {
    try {
      await downloadIcon(entry.sectionId, entry.iconId, entry.url);
      ok += 1;
    } catch (error) {
      errors.push({ ...entry, error: String(error) });
    }
  }

  return { ok, errors };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const manifestPath = process.argv[2];
  if (!manifestPath) {
    console.error('Usage: node download-icons-from-manifest.mjs <manifest.json>');
    process.exit(1);
  }
  const manifest = JSON.parse(await import('node:fs/promises').then((fs) => fs.readFile(manifestPath, 'utf8')));
  const result = await downloadManifest(manifest);
  console.log(JSON.stringify(result, null, 2));
}
