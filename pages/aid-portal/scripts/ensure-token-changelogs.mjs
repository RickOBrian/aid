import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const registryPath = join(appRoot, 'token-changelog-registry.json');
const repoTokensDir = join(appRoot, '../../tokens');
const appTokensDir = join(appRoot, 'tokens');

const registry = JSON.parse(readFileSync(registryPath, 'utf8'));

function pageExists(pageFile) {
  return existsSync(join(appRoot, pageFile));
}

function buildChangelog(collection) {
  const bootstrap = collection.bootstrap ?? {
    version: '1.0.0',
    date: new Date().toISOString().slice(0, 10),
    type: 'minor',
    changes: [
      {
        kind: 'added',
        description: `Раздел ${collection.artifact} открыт на портале aid-ds`,
      },
    ],
  };

  return {
    artifact: collection.artifact,
    currentVersion: bootstrap.version,
    entries: [
      {
        version: bootstrap.version,
        date: bootstrap.date,
        author: registry.defaultAuthor,
        type: bootstrap.type,
        changes: bootstrap.changes,
      },
    ],
  };
}

function writeIfMissing(targetDir, fileName, content) {
  mkdirSync(targetDir, { recursive: true });
  const filePath = join(targetDir, fileName);

  if (existsSync(filePath)) {
    return false;
  }

  writeFileSync(filePath, `${JSON.stringify(content, null, 2)}\n`, 'utf8');
  return true;
}

let createdCount = 0;

for (const collection of registry.collections) {
  if (!pageExists(collection.pageFile)) {
    continue;
  }

  const fileName = `${collection.collectionName}-changelog.json`;
  const content = buildChangelog(collection);

  if (writeIfMissing(appTokensDir, fileName, content)) {
    console.log(`[ensure-token-changelogs] created ${fileName} in ./tokens/`);
    createdCount += 1;
  }

  if (existsSync(repoTokensDir)) {
    if (writeIfMissing(repoTokensDir, fileName, content)) {
      console.log(`[ensure-token-changelogs] created ${fileName} in ../../tokens/`);
      createdCount += 1;
    }
  }
}

if (createdCount === 0) {
  console.log('[ensure-token-changelogs] all required changelogs present');
}
