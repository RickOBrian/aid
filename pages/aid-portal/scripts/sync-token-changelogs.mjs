import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = join(appRoot, '../../tokens');
const targetDir = join(appRoot, 'tokens');

if (!existsSync(sourceDir)) {
  console.log('[sync-token-changelogs] repo tokens/ unavailable, using committed ./tokens/');
  process.exit(0);
}

mkdirSync(targetDir, { recursive: true });

for (const file of readdirSync(sourceDir)) {
  if (file.endsWith('-changelog.json')) {
    cpSync(join(sourceDir, file), join(targetDir, file));
    console.log(`[sync-token-changelogs] synced ${file}`);
  }
}
