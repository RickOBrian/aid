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
    // generated/ и public/guides/sources/ — производные от канона; если они
    // попадут в индекс, ссылка на удалённый исходник «найдётся» в копии и
    // проверка промолчит.
    if (['node_modules', '.git', 'dist', 'storybook-static', 'storybook-legacy', 'generated'].includes(entry)) continue;
    if (dir.endsWith('public/guides') && entry === 'sources') continue;
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

/* правила Cursor и скиллы — проверяются только на живость ссылок:
   у них своя форма, но битая ссылка ломает их так же */
const REF_ONLY = ['.cursor/rules', 'skills'];
for (const scope of REF_ONLY) {
  const found = [];
  const collect = (dir) => {
    for (const entry of readdirSync(join(repoRoot, dir))) {
      if (entry === 'node_modules' || entry === '_shared') continue;
      const rel = join(dir, entry);
      if (statSync(join(repoRoot, rel)).isDirectory()) collect(rel);
      else if (entry.endsWith('.md') || entry.endsWith('.mdc')) found.push(rel);
    }
  };
  collect(scope);
  for (const file of found) {
    const src = readFileSync(join(repoRoot, file), 'utf-8');
    const refs = new Set([...src.matchAll(/`([A-Za-z0-9_./-]+\.(?:md|mdc|json|ts|tsx|mjs|js))`/g)].map((m) => m[1]));
    for (const ref of refs) {
      if (existsSync(join(repoRoot, ref))) continue;
      const hits = index.get(basename(ref));
      if (!hits) err(file, 'dead-ref', `ссылка в никуда: ${ref}`);
      else if (ref.includes('/') && !hits.some((h) => h.endsWith(ref)))
        err(file, 'wrong-path', `неверный путь: ${ref} (файл есть: ${hits[0]})`);
    }
  }
}
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
  if (!statusLine) {
    if (fm.kind !== 'notes') warn(file, 'status-line', 'нет строки статуса под заголовком');
  } else {
    // Строка статуса есть — значит, она обязана сходиться с frontmatter,
    // независимо от жанра: расхождение версий это ошибка, а не оформление.
    if (fm.version && statusLine[2] !== fm.version)
      err(file, 'version-sync', `строка статуса v${statusLine[2]} ≠ frontmatter ${fm.version}`);
    if (fm.status && statusLine[1].toLowerCase() !== fm.status.toLowerCase())
      err(file, 'status-sync', `строка статуса "${statusLine[1]}" ≠ frontmatter "${fm.status}"`);
  }

  /* Черновики (kind: notes) не обязаны нести форму: нумерацию, changelog и
     строку статуса. Требовать её от заметки — плодить церемонию там, где
     документ по определению не дописан. Frontmatter проверяется у всех. */
  const ceremonial = fm.kind !== 'notes';
  /* Заголовки внутри блоков кода — пример, а не раздел: так в semver-guide
     пример changelog получил номера 10 и 11 (AID-20). */
  const prose = src.replace(/^```[\s\S]*?^```/gm, (m) => m.replace(/[^\n]/g, ''));
  const sections = [...prose.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  if (ceremonial && sections.length && !sections.some((s) => /Changelog/i.test(s)))
    warn(file, 'changelog', 'нет раздела Changelog');
  const numbered = sections.filter((s) => /^\d+\./.test(s)).length;
  if (ceremonial && sections.length && numbered !== sections.length)
    warn(file, 'numbering', `разделы пронумерованы частично (${numbered}/${sections.length})`);

  /* Подразделы и ссылки на разделы. В 3.0.0 component-standards разделы
     перенумеровали, а подразделы и ссылки внутри — нет: под «## 7» лежали
     «### 6.1…6.7». Нумерация ### должна идти от своего ##, а ссылка
     «раздел N» / «§N» без имени другого файла в строке — вести на
     существующий раздел этого документа. */
  if (ceremonial) {
    const body = src.replace(/^```[\s\S]*?^```/gm, (m) => m.replace(/[^\n]/g, ''));
    const lines = body.split('\n');
    const known = new Set();
    let parent = null;
    let expected = 1;
    for (const line of lines) {
      const h2 = line.match(/^## (\d+)\./);
      if (h2) { parent = h2[1]; expected = 1; known.add(parent); continue; }
      if (/^## /.test(line)) { parent = null; continue; }
      const h3 = line.match(/^### (\d+)\.(\d+)\.?\s/);
      if (!h3) continue;
      known.add(`${h3[1]}.${h3[2]}`);
      if (parent === null) continue;
      if (h3[1] !== parent)
        err(file, 'subsection-numbering', `«### ${h3[1]}.${h3[2]}» под «## ${parent}.»`);
      else if (Number(h3[2]) !== expected)
        err(file, 'subsection-numbering', `«### ${h3[1]}.${h3[2]}» — ожидался ${parent}.${expected}`);
      expected = Number(h3[2]) + 1;
    }
    if (known.size) {
      const refRe = /(?:раздел[а-я]*|§)\s*(\d+(?:\.\d+)?)/gi;
      for (const line of lines) {
        if (/^#/.test(line)) continue;
        if (/\.md\b|\.json\b|-guide\b|-standard\b|ADR-\d|\bQ-\d/.test(line)) continue;
        for (const m of line.matchAll(refRe)) {
          const n = m[1];
          if (!known.has(n))
            warn(file, 'section-ref', `ссылка «${m[0].trim()}» — такого раздела в документе нет`);
        }
      }
    }
  }

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

  /* легаси-пути: Cursor объявлен легаси 2026-09-20 (ADR-018) */
  const legacy = [...src.matchAll(/`(\.cursor\/[A-Za-z0-9_./-]+)`/g)].map((m) => m[1]);
  for (const ref of new Set(legacy))
    err(file, 'legacy-ref', `ссылка на легаси-путь Cursor: ${ref} — правило переехало, см. GATES-MIGRATION.md`);

  /* ссылки на файлы. Changelog — история и вправе называть удалённое;
     устаревший документ (status: deprecated) описывает то, чего уже нет. */
  const live = src.split(/^## (?:\d+\. )?Changelog\s*$/m)[0];
  const refs = fm.status === 'deprecated'
    ? new Set()
    : new Set([...live.matchAll(/`([A-Za-z0-9_./-]+\.(?:md|mdc|json|ts|tsx|mjs|js))`/g)].map((m) => m[1]));
  for (const ref of refs) {
    if (existsSync(join(repoRoot, ref))) continue;
    const hits = index.get(basename(ref));
    if (!hits) err(file, 'dead-ref', `ссылка в никуда: ${ref}`);
    else if (ref.includes('/') && !hits.some((h) => h.endsWith(ref)))
      err(file, 'wrong-path', `неверный путь: ${ref} (файл есть: ${hits[0]})`);
  }

  docs.push({ file, ...fm });
}

/* согласованность машинных слоёв между собой:
   один и тот же факт не должен расходиться между JSON-файлами */
const machine = {};
for (const doc of docs)
  if (doc.machineFile && doc.machineFile !== 'null') {
    const mf = join(dirname(doc.file), doc.machineFile);
    if (existsSync(join(repoRoot, mf))) machine[doc.name] = { path: mf, json: JSON.parse(readFileSync(join(repoRoot, mf), 'utf-8')) };
  }

const same = (a, b) => JSON.stringify([...new Set(a)].sort()) === JSON.stringify([...new Set(b)].sort());
const pairs = (list) => list.map((x) => (Array.isArray(x) ? x : x.pair).slice().sort().join('+'));
const cross = [];
const cs = machine['component-standards']?.json;
const st = machine['component-states-guide']?.json;
const ar = machine['ds-component-architecture-guide']?.json;
const nm = machine['naming-conventions']?.json;

if (cs && st) {
  if (!same(cs.states.list, st.states.map((x) => x.figma)))
    cross.push(['состояния', 'component-standards.json ↔ component-states.json']);
  if (!same(pairs(cs.states.invalidCombinations), pairs(st.invalidCombinations)))
    cross.push(['недопустимые комбинации состояний', 'component-standards.json ↔ component-states.json']);
}
if (cs && ar) {
  if (!same(cs.architectureLevels, ar.levels.map((l) => l.id)))
    cross.push(['уровни архитектуры', 'component-standards.json ↔ component-architecture.json']);
  if (!same(cs.slots.canonical, ar.slots.canonical))
    cross.push(['канон слотов', 'component-standards.json ↔ component-architecture.json']);
}
if (nm && ar && !same(nm.slots.canonical, ar.slots.canonical))
  cross.push(['канон слотов', 'naming-conventions.json ↔ component-architecture.json']);
if (cs && nm && !same(cs.variants.canonical, nm.variants.canonical))
  cross.push(['канон вариантов', 'component-standards.json ↔ naming-conventions.json']);

for (const [what, where] of cross)
  err('машинные слои', 'machine-cross', `${what} разошлись: ${where}`);

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

/* ---------- pending-записи: changes/<product>/pending/*.json ----------
   Схема — skills/_shared/schemas/pending-item.schema.json (AID-98, #615).
   Свой минимальный валидатор вместо Ajv: в репо нет зависимостей для
   скриптов проверки, а схема использует узкий набор ключевых слов.
   Ключевое слово вне набора — ошибка самой схемы, чтобы расширение схемы
   не проходило молча непроверенным. */

const PENDING_SCHEMA = 'skills/_shared/schemas/pending-item.schema.json';
const SCHEMA_KEYWORDS = new Set([
  '$schema', '$id', '$defs', '$ref', 'title', 'description',
  'type', 'enum', 'const', 'pattern', 'minLength', 'minimum',
  'required', 'properties', 'additionalProperties', 'items',
  'anyOf', 'allOf', 'if', 'then', 'else',
]);

function typeOf(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (typeof v === 'number') return Number.isInteger(v) ? 'integer' : 'number';
  return typeof v;
}
const typeMatches = (v, t) => typeOf(v) === t || (t === 'number' && typeOf(v) === 'integer');
const show = (v) => (typeof v === 'string' ? `"${v.length > 60 ? v.slice(0, 57) + '…' : v}"` : JSON.stringify(v));

/* Возвращает список нарушений [{path, msg}]; пустой — значение проходит. */
function validate(schema, value, root, path = '') {
  if (schema === true || schema === undefined) return [];
  if (schema === false) return [{ path, msg: 'значение запрещено схемой' }];
  const out = [];
  const at = path || '(корень)';

  if (schema.$ref) {
    const m = /^#\/\$defs\/(.+)$/.exec(schema.$ref);
    const target = m && root.$defs?.[m[1]];
    if (!target) out.push({ path: at, msg: `схема: $ref ${schema.$ref} не найден` });
    else out.push(...validate(target, value, root, path));
  }
  if (schema.type !== undefined) {
    const types = [].concat(schema.type);
    if (!types.some((t) => typeMatches(value, t)))
      return [...out, { path: at, msg: `ожидается ${types.join(' | ')}, а не ${typeOf(value)}` }];
  }
  if (schema.enum && !schema.enum.some((e) => JSON.stringify(e) === JSON.stringify(value)))
    out.push({ path: at, msg: `${show(value)} не из [${schema.enum.map(show).join(', ')}]` });
  if ('const' in schema && JSON.stringify(schema.const) !== JSON.stringify(value))
    out.push({ path: at, msg: `${show(value)} ≠ ${show(schema.const)}` });
  if (typeof value === 'string') {
    if (schema.pattern && !new RegExp(schema.pattern, 'u').test(value))
      out.push({ path: at, msg: `${show(value)} не по шаблону ${schema.pattern}` });
    if (schema.minLength !== undefined && [...value].length < schema.minLength)
      out.push({ path: at, msg: `строка короче ${schema.minLength}` });
  }
  if (typeof value === 'number' && schema.minimum !== undefined && value < schema.minimum)
    out.push({ path: at, msg: `${value} < ${schema.minimum}` });
  if (typeOf(value) === 'object') {
    for (const r of schema.required || [])
      if (!Object.hasOwn(value, r)) out.push({ path: at, msg: `нет обязательного поля «${r}»` });
    for (const [k, v] of Object.entries(value)) {
      const sub = `${path}${path ? '.' : ''}${k}`;
      if (schema.properties && Object.hasOwn(schema.properties, k)) out.push(...validate(schema.properties[k], v, root, sub));
      else if (schema.additionalProperties !== undefined) out.push(...validate(schema.additionalProperties, v, root, sub));
    }
  }
  if (Array.isArray(value) && schema.items !== undefined)
    value.forEach((v, i) => out.push(...validate(schema.items, v, root, `${path}[${i}]`)));
  if (schema.allOf) for (const s of schema.allOf) out.push(...validate(s, value, root, path));
  if (schema.anyOf) {
    const runs = schema.anyOf.map((s) => validate(s, value, root, path));
    if (!runs.some((r) => r.length === 0))
      out.push({ path: at, msg: `не подходит ни один вариант anyOf: ${runs.map((r) => r[0]?.msg).join(' / ')}` });
  }
  if (schema.if !== undefined) {
    const branch = validate(schema.if, value, root, path).length === 0 ? schema.then : schema.else;
    if (branch !== undefined) out.push(...validate(branch, value, root, path));
  }
  return out;
}

if (existsSync(join(repoRoot, PENDING_SCHEMA))) {
  const schema = JSON.parse(readFileSync(join(repoRoot, PENDING_SCHEMA), 'utf-8'));
  const RULE = 'pending-schema';
  /* словарь схемы — один обход до проверки данных: внутри if и anyOf
     ошибка ключевого слова иначе выглядела бы как «ветка не подошла» */
  const unknownKeywords = (s, path) => {
    if (typeOf(s) !== 'object') return;
    for (const [k, v] of Object.entries(s)) {
      if (!SCHEMA_KEYWORDS.has(k)) err(PENDING_SCHEMA, RULE, `${path}: ключевое слово «${k}» валидатор не поддерживает`);
      if (k === 'properties' || k === '$defs') for (const [n, sub] of Object.entries(v)) unknownKeywords(sub, `${path}/${k}/${n}`);
      else if (k === 'allOf' || k === 'anyOf') v.forEach((sub, i) => unknownKeywords(sub, `${path}/${k}/${i}`));
      else if (['items', 'additionalProperties', 'if', 'then', 'else'].includes(k)) unknownKeywords(v, `${path}/${k}`);
    }
  };
  unknownKeywords(schema, '#');
  for (const product of readdirSync(join(repoRoot, 'changes'))) {
    const dir = join('changes', product, 'pending');
    if (!existsSync(join(repoRoot, dir)) || !statSync(join(repoRoot, dir)).isDirectory()) continue;
    for (const name of readdirSync(join(repoRoot, dir)).filter((n) => n.endsWith('.json')).sort()) {
      const file = join(dir, name);
      let data;
      try {
        data = JSON.parse(readFileSync(join(repoRoot, file), 'utf-8'));
      } catch (e) {
        err(file, RULE, `не JSON: ${e.message}`);
        continue;
      }
      for (const v of validate(schema, data, schema)) err(file, RULE, `${v.path}: ${v.msg}`);
      if (typeOf(data) !== 'object') continue;
      const id = basename(name, '.json');
      if (data.id !== undefined && data.id !== id) err(file, RULE, `id ${show(data.id)} ≠ имени файла "${id}"`);
      if (data.product !== undefined && data.product !== product)
        err(file, RULE, `product ${show(data.product)} ≠ папке changes/${product}/`);
      if (typeof data.pendingRef === 'string' && !existsSync(join(repoRoot, data.pendingRef)))
        err(file, RULE, `pendingRef ведёт на несуществующий файл: ${data.pendingRef}`);
    }
  }
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
