import { cpSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const registryPath = join(appRoot, 'guide-registry.json');
const targetDir = join(appRoot, 'public/guides/sources');

const registry = JSON.parse(readFileSync(registryPath, 'utf-8'));

mkdirSync(targetDir, { recursive: true });

for (const guide of registry.guides ?? []) {
  const sourcePath = guide.sourcePath;
  const downloadFileName = guide.sourceDownloadFileName;

  if (!sourcePath || !downloadFileName) {
    console.warn(`[sync-guide-sources] skip ${guide.guideId}: missing sourcePath or sourceDownloadFileName`);
    continue;
  }

  const sourceFile = join(appRoot, '../../', sourcePath);
  const targetFile = join(targetDir, downloadFileName);

  if (!existsSync(sourceFile)) {
    console.warn(`[sync-guide-sources] skip ${guide.guideId}: source not found at ${sourcePath}`);
    continue;
  }

  cpSync(sourceFile, targetFile);
  console.log(`[sync-guide-sources] synced ${sourcePath} → public/guides/sources/${downloadFileName}`);
}
