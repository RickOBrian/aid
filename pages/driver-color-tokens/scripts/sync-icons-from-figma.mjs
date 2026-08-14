/**
 * Синхронизирует SVG из manifest JSON (результат Figma MCP download_assets).
 *
 * node scripts/sync-icons-from-figma.mjs scripts/icons-manifest.json
 */
import { readFile } from 'node:fs/promises';
import { downloadManifest } from './download-icons-from-manifest.mjs';

const manifestPath = process.argv[2];
if (!manifestPath) {
  console.error('Usage: node sync-icons-from-figma.mjs <manifest.json>');
  process.exit(1);
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const result = await downloadManifest(manifest);
console.log(JSON.stringify(result, null, 2));
