import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
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

const sourceFiles = readdirSync(sourceDir).filter((file) => file.endsWith('-changelog.json'));

for (const file of sourceFiles) {
  cpSync(join(sourceDir, file), join(targetDir, file));
  console.log(`[sync-token-changelogs] synced ${file}`);
}

/**
 * Удаление отставших копий.
 *
 * Скрипт только копировал и никогда не убирал. Переименуешь changelog в
 * репозитории — в зеркале останется файл под старым именем, и дальше его
 * подхватит glob в loadTokenChangelog. Зеркало обязано повторять источник,
 * а не накапливать его историю: копирование без удаления не отличает
 * «файла ещё нет» от «файл переименовали».
 */
const expected = new Set(sourceFiles);
for (const file of readdirSync(targetDir)) {
  if (file.endsWith('-changelog.json') && !expected.has(file)) {
    rmSync(join(targetDir, file));
    console.log(`[sync-token-changelogs] удалена отставшая копия ${file}`);
  }
}
