/**
 * Fetches SVG export URLs for icons missing from manifest via Figma REST API.
 * Usage: node scripts/fetch-remaining-icons.mjs scripts/icons-manifest.json
 */
import { readFile, writeFile } from 'node:fs/promises';
import { iconSections } from '../iconsData.ts';

const FILE_KEY = 'pJTI5z3d7T2lrWkRCecFcR';
const TOKEN = process.env.FIGMA_API_KEY || process.env.FIGMA_API_TOKEN;

if (!TOKEN) {
  console.error('Set FIGMA_API_KEY or FIGMA_API_TOKEN to use Figma REST API.');
  process.exit(1);
}

const manifestPath = process.argv[2] ?? 'scripts/icons-manifest.json';
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

const existing = new Set(manifest.map((e) => `${e.sectionId}/${e.iconId}`));

const pending = iconSections
  .filter((s) => s.id !== 'alternative')
  .flatMap((section) =>
    section.items
      .filter((item) => !existing.has(`${section.id}/${item.id}`))
      .map((item) => ({
        sectionId: section.id,
        iconId: item.id,
        figmaNodeId: item.figmaNodeId,
      })),
  );

if (pending.length === 0) {
  console.log(JSON.stringify({ fetched: 0, total: manifest.length }, null, 2));
  process.exit(0);
}

const BATCH = 50;
const errors = [];

for (let i = 0; i < pending.length; i += BATCH) {
  const batch = pending.slice(i, i + BATCH);
  const ids = batch.map((b) => b.figmaNodeId).join(',');
  const url = `https://api.figma.com/v1/images/${FILE_KEY}?ids=${encodeURIComponent(ids)}&format=svg`;

  const res = await fetch(url, { headers: { 'X-Figma-Token': TOKEN } });
  if (!res.ok) {
    throw new Error(`Figma API ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  if (data.err) throw new Error(data.err);

  for (const item of batch) {
    const assetUrl = data.images[item.figmaNodeId];
    if (!assetUrl) {
      errors.push({ ...item, error: 'No URL in response' });
      continue;
    }
    manifest.push({ sectionId: item.sectionId, iconId: item.iconId, url: assetUrl });
  }
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(
  JSON.stringify(
    { fetched: pending.length - errors.length, errors, total: manifest.length },
    null,
    2,
  ),
);
