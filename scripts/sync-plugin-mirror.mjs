#!/usr/bin/env node
/**
 * Зеркало репозитория в плагине aid-standards — копиями, не симлинками.
 * Git-симлинки на Windows без их поддержки сохраняются текстом, и пути
 * плагина не открываются (#348). Список копий — plugins/aid-standards/mirror.json.
 *
 *   node scripts/sync-plugin-mirror.mjs          пересобрать копии
 *   node scripts/sync-plugin-mirror.mjs --check  проверить, что копии совпадают с источником
 */
import { copyFileSync, existsSync, lstatSync, readFileSync, readdirSync, rmSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, isAbsolute, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pluginRoot = join(root, 'plugins/aid-standards');
const { items } = JSON.parse(readFileSync(join(pluginRoot, 'mirror.json'), 'utf8'));
const check = process.argv.includes('--check');

// Файлы источника — только те, что в git: локальный мусор (.DS_Store и т.п.) в зеркало не попадает.
function sourceFiles(source) {
  const out = execFileSync('git', ['ls-files', '-z', '--', source], { cwd: root, encoding: 'utf8' });
  const files = new Map();
  for (const f of out.split('\0').filter(Boolean)) {
    const rel = f === source ? '.' : relative(source, f);
    files.set(rel, readFileSync(join(root, f)).toString('base64'));
  }
  return files;
}

// Файлы копии на диске.
function copyFiles(base) {
  const files = new Map();
  if (!lstatSync(base, { throwIfNoEntry: false })) return files;
  const walk = (p) => {
    const st = lstatSync(p);
    if (st.isSymbolicLink()) files.set(relative(base, p) || '.', 'SYMLINK');
    else if (st.isDirectory()) for (const n of readdirSync(p).sort()) walk(join(p, n));
    else files.set(relative(base, p) || '.', readFileSync(p).toString('base64'));
  };
  walk(base);
  return files;
}

// Путь из mirror.json должен оставаться внутри своей папки: иначе rmSync удалит чужое.
function inside(base, p) {
  const rel = relative(base, p);
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
}

const problems = [];
for (const { path, source } of items) {
  const src = join(root, source);
  const dst = join(pluginRoot, path);
  if (typeof path !== 'string' || typeof source !== 'string' || !inside(pluginRoot, dst) || !inside(root, src)) {
    console.error(`mirror.json: недопустимый путь ${JSON.stringify({ path, source })} — копия только внутри plugins/aid-standards, источник только внутри репозитория`);
    process.exit(1);
  }
  if (!existsSync(src)) { problems.push(`${path}: источника ${source} нет`); continue; }

  const a = sourceFiles(source);
  if (check) {
    const b = copyFiles(dst);
    for (const k of new Set([...a.keys(), ...b.keys()])) {
      if (b.get(k) === 'SYMLINK') problems.push(`${join(path, k)}: симлинк вместо копии`);
      else if (a.get(k) !== b.get(k)) problems.push(`${join(path, k)}: расходится с ${join(source, k)}`);
    }
  } else {
    rmSync(dst, { recursive: true, force: true });
    for (const k of a.keys()) {
      const to = k === '.' ? dst : join(dst, k);
      mkdirSync(dirname(to), { recursive: true });
      copyFileSync(join(root, k === '.' ? source : join(source, k)), to);
    }
  }
}

if (problems.length) {
  console.error(`Зеркало плагина aid-standards: ${problems.length} расхождений`);
  for (const p of problems.slice(0, 50)) console.error('  ' + p);
  console.error('Пересобрать: node scripts/sync-plugin-mirror.mjs');
  process.exit(1);
}
console.log(check ? `Зеркало плагина совпадает с источником (${items.length} путей).` : `Зеркало плагина пересобрано (${items.length} путей).`);
