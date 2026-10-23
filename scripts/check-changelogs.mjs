#!/usr/bin/env node
/**
 * check-changelogs — форма чейнжлогов библиотек продуктов (release-gate §9.1).
 *
 * Канон записи — JSON `tokens/<продукт>-<коллекция>-changelog.json`, таблица
 * CHANGELOG в Figma — его копия. Совпадение с таблицей Figma этот скрипт не
 * проверяет (нужен доступ к Figma): это делает инструмент, который пишет в
 * таблицу. Здесь — то, что видно из репозитория.
 *
 * Для каждого продукта с непустым `changelogFiles`:
 *   - файл есть и читается как JSON;
 *   - `figmaTable.fileKey` — один из файлов `figmaFiles` продукта;
 *   - запись «Не опубликовано» (`version: null`) не больше одной и первая;
 *   - `currentVersion` равна последней опубликованной версии;
 *   - копия в `changelogMirrorRoot` совпадает с каноном;
 *   - в `changelogRoot` нет файлов продукта, которых нет в `changelogFiles`.
 *
 * Запуск:
 *   node scripts/check-changelogs.mjs         отчёт, код возврата 1 при ошибках
 *   node scripts/check-changelogs.mjs --json  машинный вывод
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const asJson = process.argv.includes('--json');
const errors = [];
const err = (file, msg) => errors.push({ file, msg });

const readJson = (rel) => JSON.parse(readFileSync(join(repoRoot, rel), 'utf8'));

const productsDir = join(repoRoot, 'products');
const productIds = readdirSync(productsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(productsDir, d.name, 'product.json')))
  .map((d) => d.name);

let checked = 0;

for (const id of productIds) {
  const productRel = `products/${id}/product.json`;
  const product = readJson(productRel);
  const files = product.changelogFiles ?? [];
  if (files.length === 0) continue;

  const figmaKeys = new Set(
    Object.entries(product.figmaFiles ?? {})
      .filter(([k]) => !k.startsWith('_'))
      .map(([, v]) => v?.fileKey)
      .filter(Boolean),
  );

  for (const rel of files) {
    checked += 1;
    if (!existsSync(join(repoRoot, rel))) {
      err(rel, `файла нет, хотя он в changelogFiles ${productRel}`);
      continue;
    }
    let log;
    try {
      log = readJson(rel);
    } catch (e) {
      err(rel, `не читается как JSON: ${e.message}`);
      continue;
    }

    const table = log.figmaTable;
    if (!table?.fileKey || !table?.nodeId) {
      err(rel, 'нет figmaTable.fileKey и figmaTable.nodeId — неизвестно, какая таблица Figma — копия');
    } else if (figmaKeys.size > 0 && !figmaKeys.has(table.fileKey)) {
      err(rel, `figmaTable.fileKey ${table.fileKey} не из figmaFiles ${productRel}`);
    }

    const entries = Array.isArray(log.entries) ? log.entries : [];
    const unpublished = entries.map((e, i) => (e.version == null ? i : -1)).filter((i) => i >= 0);
    if (unpublished.length > 1) err(rel, `записей «Не опубликовано» ${unpublished.length}, допустима одна`);
    if (unpublished.length === 1 && unpublished[0] !== 0) err(rel, 'запись «Не опубликовано» должна быть первой');

    const lastPublished = entries.find((e) => e.version != null);
    if (lastPublished && log.currentVersion !== lastPublished.version) {
      err(rel, `currentVersion ${log.currentVersion} ≠ последней опубликованной ${lastPublished.version}`);
    }

    if (product.changelogMirrorRoot) {
      const mirrorRel = `${product.changelogMirrorRoot}/${basename(rel)}`;
      if (!existsSync(join(repoRoot, mirrorRel))) {
        err(mirrorRel, `нет копии канона ${rel}`);
      } else if (readFileSync(join(repoRoot, mirrorRel), 'utf8') !== readFileSync(join(repoRoot, rel), 'utf8')) {
        err(mirrorRel, `копия расходится с каноном ${rel}`);
      }
    }
  }

  if (product.changelogRoot) {
    const listed = new Set(files.map((f) => basename(f)));
    const rootAbs = join(repoRoot, product.changelogRoot);
    if (existsSync(rootAbs)) {
      for (const name of readdirSync(rootAbs)) {
        if (name.startsWith(`${id}-`) && name.endsWith('-changelog.json') && !listed.has(name)) {
          err(`${product.changelogRoot}/${name}`, `чейнжлог продукта ${id} не внесён в changelogFiles ${productRel}`);
        }
      }
    }
  }
}

if (asJson) {
  console.log(JSON.stringify({ checked, errors }, null, 2));
} else {
  for (const e of errors) console.log(`✗ ${e.file}: ${e.msg}`);
  console.log(`check-changelogs: файлов ${checked}, ошибок ${errors.length}`);
}
process.exit(errors.length > 0 ? 1 : 0);
