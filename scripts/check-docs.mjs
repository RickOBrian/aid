#!/usr/bin/env node
/**
 * check-docs — механическая проверка корпуса документов.
 *
 * Проверяет то, что раньше проверял человек по инструкции скилла guide-lint
 * и поэтому не проверял никогда (ADR-010).
 *
 * Запуск:
 *   node scripts/check-docs.mjs            отчёт, код возврата 1 при ошибках
 *   node scripts/check-docs.mjs --warnings показать и предупреждения
 *   node scripts/check-docs.mjs --json     машинный вывод
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, basename, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS_ROOT = 'skills/_shared';
const REGISTRY = 'standards-registry.json';

const VALID_KINDS = ['standard', 'protocol', 'architecture', 'notes'];
const VALID_STATUSES = ['draft', 'alpha', 'beta', 'stable', 'deprecated'];

const showWarnings = process.argv.includes('--warnings');
const asJson = process.argv.includes('--json');

const errors = [];
const warnings = [];
const err = (file, rule, msg) => errors.push({ file, rule, msg });
const warn = (file, rule, msg) => warnings.push({ file, rule, msg });

/* ---------- обход файлов ---------- */

function walk(dir, out = []) {
  for (const entry of readdirSync(join(repoRoot, dir))) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const rel = join(dir, entry);
    const st = statSync(join(repoRoot, rel));
    if (st.isDirectory()) walk(rel, out);
    else if (entry.endsWith('.md')) out.push(rel);
  }
  return out;
}

/* ---------- индекс всех файлов репозитория ---------- */

function buildIndex(dir, index = new Map(), depth = 0) {
  if (depth > 8) return index;
  let entries;
  try { entries = readdirSync(join(repoRoot, dir)); } catch { return index; }
  for (const entry of entries) {
    if (['node_modules', '.git', 'dist', 'storybook-static', 'storybook-legacy'].includes(entry)) continue;
    const rel = dir === '.' ? entry : join(dir, entry);
    let st;
    try { st = statSync(join(repoRoot, rel)); } catch { continue; }
    if (st.isDirectory()) buildIndex(rel, index, depth + 1);
    else {
      if (!index.has(entry)) index.set(entry, []);
      index.get(entry).push(rel);
    }
  }
  return index;
}

/* ---------- разбор frontmatter ---------- */

function parseFrontmatter(src) {
  if (!src.startsWith('---')) return null;
  const end = src.indexOf('\n---', 3);
  if (end === -1) return null;
  const block = src.slice(4, end);
  const get = (key, scoped) => {
    const re = scoped
      ? new RegExp(`^\\s+${key}:\\s*"?([^"\\n]+)"?\\s*$`, 'm')
      : new RegExp(`^${key}:\\s*"?([^"\\n]+)"?\\s*$`, 'm');
    const m = block.match(re);
    return m ? m[1].trim() : null;
  };
  return {
    raw: block,
    name: get('name'),
    destination: get('destination'),
    version: get('version', true),
    status: get('status', true),
    kind: get('kind', true),
    machineFile: get('machineFile', true),
  };
}

/* ---------- проверки ---------- */

const files = walk(DOCS_ROOT);
const index = buildIndex('.');
const namesSeen = new Map();
const docs = [];

for (const file of files) {
  const src = readFileSync(join(repoRoot, file), 'utf-8');
  const stem = basename(file, '.md');
  const fm = parseFrontmatter(src);

  if (!fm) { err(file, 'frontmatter', 'нет frontmatter'); continue; }

  if (!fm.name) err(file, 'name', 'нет поля name');
  else if (fm.name !== stem) err(file, 'name', `name="${fm.name}" не совпадает с именем файла`);

  if (!fm.version) err(file, 'version', 'нет metadata.version');
  else if (!/^\d+\.\d+\.\d+$/.test(fm.version)) err(file, 'version', `версия "${fm.version}" не semver`);

  if (!fm.kind) err(file, 'kind', 'нет metadata.kind');
  else if (!VALID_KINDS.includes(fm.kind)) err(file, 'kind', `kind="${fm.kind}" вне списка ${VALID_KINDS.join('|')}`);

  if (fm.status && !VALID_STATUSES.includes(fm.status))
    err(file, 'status', `status="${fm.status}" вне списка ${VALID_STATUSES.join('|')}`);

  if (fm.destination) {
    const expected = dirname(file) + '/';
    if (fm.destination !== expected)
      err(file, 'destination', `destination="${fm.destination}", фактически файл в "${expected}"`);
  }

  if (fm.name) {
    if (!namesSeen.has(fm.name)) namesSeen.set(fm.name, []);
    namesSeen.get(fm.name).push(file);
  }

  /* форма — пока предупреждения, ужесточается по мере нормализации гайдов */
  const statusLine = src.match(/^> Статус:\s*(\S+)\s*·\s*v(\d+\.\d+\.\d+)/m);
  if (!statusLine) warn(file, 'status-line', 'нет строки статуса под заголовком');
  else {
    if (fm.version && statusLine[2] !== fm.version)
      err(file, 'version-sync', `строка статуса v${statusLine[2]} ≠ frontmatter ${fm.version}`);
    if (fm.status && statusLine[1].toLowerCase() !== fm.status.toLowerCase())
      err(file, 'status-sync', `строка статуса "${statusLine[1]}" ≠ frontmatter "${fm.status}"`);
  }

  const sections = [...src.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  if (sections.length && !sections.some((s) => /Changelog/i.test(s)))
    warn(file, 'changelog', 'нет раздела Changelog');
  const numbered = sections.filter((s) => /^\d+\./.test(s)).length;
  if (sections.length && numbered !== sections.length)
    warn(file, 'numbering', `разделы пронумерованы частично (${numbered}/${sections.length})`);

  /* машинный слой */
  if (fm.machineFile && fm.machineFile !== 'null') {
    const mf = join(dirname(file), fm.machineFile);
    if (!existsSync(join(repoRoot, mf))) err(file, 'machine-file', `machineFile "${fm.machineFile}" не найден`);
    else {
      const mj = JSON.parse(readFileSync(join(repoRoot, mf), 'utf-8'));
      if (mj.version !== fm.version)
        err(file, 'machine-sync', `версия машинного слоя ${mj.version} ≠ ${fm.version}`);
    }
  }

  /* ссылки на файлы */
  const refs = new Set([...src.matchAll(/`([A-Za-z0-9_./-]+\.(?:md|mdc|json|ts|tsx|mjs|js))`/g)].map((m) => m[1]));
  for (const ref of refs) {
    if (existsSync(join(repoRoot, ref))) continue;
    const hits = index.get(basename(ref));
    if (!hits) err(file, 'dead-ref', `ссылка в никуда: ${ref}`);
    else if (ref.includes('/') && !hits.some((h) => h.endsWith(ref)))
      err(file, 'wrong-path', `неверный путь: ${ref} (файл есть: ${hits[0]})`);
  }

  docs.push({ file, ...fm });
}

/* дубли по name */
for (const [name, list] of namesSeen)
  if (list.length > 1) err(list[1], 'duplicate-name', `name="${name}" уже занят: ${list.join(', ')}`);

/* сверка с реестром */
if (existsSync(join(repoRoot, REGISTRY))) {
  const reg = JSON.parse(readFileSync(join(repoRoot, REGISTRY), 'utf-8'));
  const byId = new Map(reg.standards.map((s) => [s.id, s]));
  for (const doc of docs) {
    const entry = byId.get(doc.name);
    if (!entry) {
      if (doc.kind === 'standard') warn(doc.file, 'registry', 'стандарт не записан в standards-registry.json');
      continue;
    }
    if (entry.humanFile !== doc.file)
      err(doc.file, 'registry-path', `реестр указывает "${entry.humanFile}"`);
    if (entry.version !== doc.version)
      err(doc.file, 'registry-version', `реестр: ${entry.version}, файл: ${doc.version}`);
  }
  for (const s of reg.standards)
    if (!existsSync(join(repoRoot, s.humanFile)))
      err(REGISTRY, 'registry-dead', `запись "${s.id}" указывает на несуществующий ${s.humanFile}`);
}

/* ---------- вывод ---------- */

if (asJson) {
  console.log(JSON.stringify({ errors, warnings, checked: files.length }, null, 2));
} else {
  const group = (list) => {
    const byFile = new Map();
    for (const e of list) {
      if (!byFile.has(e.file)) byFile.set(e.file, []);
      byFile.get(e.file).push(e);
    }
    for (const [file, items] of [...byFile].sort()) {
      console.log(`\n  ${file}`);
      for (const i of items) console.log(`    [${i.rule}] ${i.msg}`);
    }
  };
  if (errors.length) { console.log(`\n=== ОШИБКИ (${errors.length}) ===`); group(errors); }
  if (warnings.length) {
    console.log(`\n=== ПРЕДУПРЕЖДЕНИЯ (${warnings.length}) ===`);
    if (showWarnings) group(warnings);
    else {
      const byRule = {};
      for (const w of warnings) byRule[w.rule] = (byRule[w.rule] || 0) + 1;
      for (const [rule, n] of Object.entries(byRule)) console.log(`  ${rule}: ${n} — подробности: --warnings`);
    }
  }
  console.log(`\nПроверено файлов: ${files.length} · ошибок: ${errors.length} · предупреждений: ${warnings.length}\n`);
}

process.exit(errors.length ? 1 : 0);
