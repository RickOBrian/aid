#!/usr/bin/env node
/**
 * sync-registry — подтягивает в standards-registry.json фактические
 * version / status / kind / путь / наличие changelog из самих файлов.
 *
 * Запускается осознанно, после правки гайдов. Проверку это не отменяет:
 * check-docs по-прежнему ругается, если реестр и файлы разошлись, — просто
 * приводить их в соответствие больше не нужно руками.
 *
 *   node scripts/sync-registry.mjs           применить
 *   node scripts/sync-registry.mjs --dry-run показать, что изменится
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dry = process.argv.includes('--dry-run');
const registryPath = join(repoRoot, 'standards-registry.json');
const registry = JSON.parse(readFileSync(registryPath, 'utf-8'));

const GENRES = ['standards', 'protocols', 'protocols/gates', 'architecture', 'notes'];
const field = (block, key) => {
  const m = block.match(new RegExp(`^\\s*${key}:\\s*"?([^"\\n]+)"?\\s*$`, 'm'));
  return m ? m[1].trim() : null;
};

const onDisk = new Map();
for (const genre of GENRES) {
  const dir = join(repoRoot, 'skills/_shared', genre);
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    const rel = `skills/_shared/${genre}/${file}`;
    const src = readFileSync(join(repoRoot, rel), 'utf-8');
    const fm = src.slice(0, src.indexOf('\n---', 3));
    onDisk.set(file.slice(0, -3), {
      humanFile: rel,
      version: field(fm, 'version'),
      // поля status ещё нет у части гайдов — оно появляется, когда гайд
      // проходит свою волну; до этого статус считается draft
      status: field(fm, 'status') ?? 'draft',
      kind: field(fm, 'kind'),
      machineFile: field(fm, 'machineFile') === 'null' ? null : field(fm, 'machineFile'),
      hasChangelogSection: /^## (?:\d+\.\s*)?Changelog/mi.test(src),
    });
  }
}

const changes = [];
for (const entry of registry.standards) {
  const actual = onDisk.get(entry.id);
  if (!actual) { changes.push(`${entry.id}: файла нет на диске — запись оставлена, разберись вручную`); continue; }
  for (const key of ['humanFile', 'version', 'status', 'kind', 'machineFile', 'hasChangelogSection']) {
    if (actual[key] === null && entry[key] == null) continue;
    if (entry[key] !== actual[key]) {
      changes.push(`${entry.id}: ${key} ${JSON.stringify(entry[key])} → ${JSON.stringify(actual[key])}`);
      entry[key] = actual[key];
    }
  }
}
for (const [id, actual] of onDisk)
  if (!registry.standards.some((s) => s.id === id))
    changes.push(`${id}: нет записи в реестре — добавь вручную, нужны wave/core/publish`);

if (!changes.length) { console.log('реестр уже совпадает с файлами'); process.exit(0); }
console.log(changes.map((c) => '  ' + c).join('\n'));
if (dry) { console.log('\n--dry-run: ничего не записано'); process.exit(0); }
registry.updated = new Date().toISOString().slice(0, 10);
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
console.log(`\nзаписано изменений: ${changes.length}`);
