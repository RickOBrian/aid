#!/usr/bin/env node
/**
 * merge-precheck — проверка PR перед мержем в main одной командой (AID-113,
 * issue #641). Для чата Merge (docs/hub/agents/merge.md).
 *
 *   node scripts/merge-precheck.mjs 640                 отчёт, без мержа
 *   node scripts/merge-precheck.mjs 640 --merge         отчёт и мерж, если чисто
 *   node scripts/merge-precheck.mjs 640 --ack PD4       пункт «Только PD» сверен
 *                                                       вручную (запись в «Решения PD»
 *                                                       или «да» PD) — не стоп
 *   node scripts/merge-precheck.mjs 640 --no-docs       без локального check-docs
 *   node scripts/merge-precheck.mjs 640 --repo owner/name
 *
 * Что сверяет (условия мержа merge.md, «Git-полномочия» корневого CLAUDE.md,
 * ORCHESTRATION.md §4):
 *   - состояние PR: открыт, не черновик, база main, нет конфликтов;
 *   - head SHA с GitHub и с git (refs/pull/N/head) — один и тот же;
 *   - CI на head: проверки GitHub Actions (Vercel не учитывается, §4);
 *   - уровень PR по самому чувствительному файлу (§4 «Проверка PR»);
 *   - уровень 3 — комментарий «ок» с head SHA; 1–2 — строки «Самопроверка: ок»
 *     и «Подагент: ок» в описании;
 *   - совпадения diff с пунктами «Только PD» (эвристика по добавленным строкам
 *     и путям) и правка разделов-предохранителей;
 *   - два контура в одном PR;
 *   - check-docs на дереве head (версия скрипта — из main).
 *
 * Не проверяет и не может: что изменения прочитаны и совпадают с описанием
 * (условие 3), кто автор комментария «ок» (все чаты — одна учётка GitHub),
 * есть ли запись в «Решения PD». Это Merge сверяет сам; отчёт напоминает.
 *
 * Код возврата: 0 — можно мержить (или смержено с --merge), 1 — стоп,
 * 2 — ошибка запуска. Код из PR не исполняется: check-docs берётся из main,
 * дерево head распаковывается во временную папку только как данные.
 * Сеть — через scripts/gh-retry (повтор при TLS-таймауте до отправки запроса).
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, readdirSync, lstatSync, realpathSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const GH_RETRY = join(repoRoot, 'scripts', 'gh-retry');

// ---------- аргументы ----------

const args = process.argv.slice(2);
let prNumber = null;
let repo = 'RickOBrian/aid';
let doMerge = false;
let runDocs = true;
const acked = new Set();

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--merge') doMerge = true;
  else if (a === '--no-docs') runDocs = false;
  else if (a === '--repo') repo = args[++i] ?? '';
  else if (a === '--ack') for (const c of (args[++i] ?? '').split(',')) { if (c.trim()) acked.add(c.trim().toUpperCase()); }
  else if (a === '-h' || a === '--help') { usage(0); }
  else if (/^#?\d+$/.test(a) && prNumber === null) prNumber = Number(a.replace('#', ''));
  else { console.error(`merge-precheck: непонятный аргумент: ${a}`); usage(2); }
}
if (!prNumber) usage(2);
if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) { console.error('merge-precheck: --repo вида owner/name'); process.exit(2); }
if (doMerge && repo !== 'RickOBrian/aid') { console.error('merge-precheck: --merge только для RickOBrian/aid (merge.md)'); process.exit(2); }

function usage(code) {
  console.error('Использование: node scripts/merge-precheck.mjs <номер PR> [--merge] [--ack PD1,PD4] [--no-docs] [--repo owner/name]');
  process.exit(code);
}

// ---------- обёртки ----------

function gh(...a) {
  const r = spawnSync(GH_RETRY, a, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) {
    const err = (r.stderr || '').trim().split('\n').slice(-3).join(' / ');
    throw new Error(`gh ${a[0]} ${a[1] ?? ''}: ${err || 'код ' + r.status}`);
  }
  return r.stdout;
}

function git(...a) {
  return execFileSync('git', ['-C', repoRoot, '-c', 'core.quotepath=false', ...a], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
}

const stops = [];    // не мержить
const warns = [];    // не стоп, но посмотреть
const acks = [];     // «Только PD», снятые --ack
const info = [];     // строки отчёта

function pdHit(code, text) {
  if (acked.has(code)) acks.push(`${code}: ${text}`);
  else stops.push(`«Только PD» ${code}: ${text} — нужна запись в «Решения PD», называющая пункт, или «да» PD; после сверки — --ack ${code}`);
}

// ---------- 1. PR с GitHub ----------

let pr;
try {
  pr = JSON.parse(gh('pr', 'view', String(prNumber), '--repo', repo, '--json',
    'number,title,url,state,isDraft,baseRefName,headRefName,headRefOid,mergeable,mergeStateStatus,mergeCommit,body,comments,reviews,statusCheckRollup'));
} catch (e) {
  console.error(`merge-precheck: не получил PR #${prNumber}: ${e.message}`);
  process.exit(2);
}

const sha = pr.headRefOid;
info.push(`PR #${pr.number} · ${pr.title}`);
info.push(`${pr.url}`);
info.push(`head ${pr.headRefName} → ${pr.baseRefName} · SHA ${sha}`);
info.push(`state ${pr.state}${pr.isDraft ? ' (черновик)' : ''} · mergeable ${pr.mergeable} · mergeStateStatus ${pr.mergeStateStatus}`);

// Смерженный PR — режим разбора задним числом (выборочная проверка Review):
// diff считается от main до мержа, состояние mergeable не проверяется.
const merged = pr.state === 'MERGED' && pr.mergeCommit?.oid;
if (pr.state !== 'OPEN') stops.push(`PR не открыт (${pr.state})${merged ? ' — отчёт задним числом' : ''}`);
if (pr.isDraft) stops.push('PR — черновик');
if (pr.baseRefName !== 'main') stops.push(`база ${pr.baseRefName}, не main`);
if (merged) { /* mergeable у смерженного всегда UNKNOWN */ }
else if (pr.mergeable === 'CONFLICTING' || pr.mergeStateStatus === 'DIRTY') stops.push('конфликты с main — автору свести');
else if (pr.mergeable === 'UNKNOWN' || pr.mergeStateStatus === 'UNKNOWN') stops.push('GitHub ещё считает mergeable — повторить через минуту');
if (pr.mergeStateStatus === 'BEHIND') warns.push('ветка отстаёт от main (BEHIND) — мерж возможен, CI шёл на старой базе');

// ---------- 2. CI ----------

const checks = (pr.statusCheckRollup || []).map((c) => {
  const name = c.name || c.context || '?';
  const workflow = c.workflowName || '';
  let st;
  if (c.__typename === 'StatusContext' || c.state) {
    st = c.state === 'SUCCESS' ? 'pass' : (c.state === 'PENDING' || c.state === 'EXPECTED') ? 'pending' : 'fail';
  } else if (c.status !== 'COMPLETED') st = 'pending';
  else st = ['SUCCESS', 'NEUTRAL', 'SKIPPED'].includes(c.conclusion) ? 'pass' : 'fail';
  return { name, workflow, st, conclusion: c.conclusion || c.state || c.status };
});
// §4: не учитываются только проверки Vercel (имена начинаются с «Vercel»).
const counted = checks.filter((c) => !/^Vercel\b/i.test(c.name));
const failed = counted.filter((c) => c.st === 'fail');
const pending = counted.filter((c) => c.st === 'pending');
const passed = counted.filter((c) => c.st === 'pass');
info.push(`CI: ${passed.length} зелёных, ${pending.length} идут, ${failed.length} красных` +
  (checks.length !== counted.length ? ` (Vercel не учитывается: ${checks.length - counted.length})` : ''));
if (!counted.length) stops.push('на head нет проверок CI');
for (const c of failed) stops.push(`CI красный: ${c.workflow ? c.workflow + ' / ' : ''}${c.name} (${c.conclusion})`);
for (const c of pending) stops.push(`CI не завершён: ${c.workflow ? c.workflow + ' / ' : ''}${c.name}`);
const docsCheck = counted.find((c) => c.name === 'Документы');
if (!docsCheck || docsCheck.conclusion === 'SKIPPED') stops.push('проверка «Документы» не прошла на head (нет или пропущена)');
for (const need of ['Портал', 'Плагин']) {
  if (!counted.some((c) => c.name === need)) warns.push(`нет проверки «${need}» на head`);
}

// ---------- 3. git: head и diff ----------

let base = null;
try {
  git('fetch', '-q', 'origin', '+refs/heads/main:refs/remotes/origin/main');
  git('fetch', '-q', 'origin', `refs/pull/${prNumber}/head`);
  const fetched = git('rev-parse', 'FETCH_HEAD').trim();
  if (fetched !== sha) stops.push(`head сменился: GitHub API ${sha.slice(0, 7)}, git ${fetched.slice(0, 7)} — повторить`);
  const target = merged ? `${pr.mergeCommit.oid}^1` : 'origin/main';
  base = git('merge-base', target, sha).trim();
} catch (e) {
  stops.push(`git fetch / merge-base не прошёл: ${String(e.message).split('\n')[0]}`);
}

let files = [];        // { status, path, old }
const added = new Map(); // path → [добавленные строки]
const removed = new Map();
if (base) {
  // -z: пути без кавычек и экранирования (кириллица, табы) — иначе ^scripts\/ не сработает.
  const parts = git('diff', '--name-status', '-z', '-M', base, sha).split('\0');
  for (let i = 0; i < parts.length && parts[i];) {
    const status = parts[i++];
    if (/^[RC]/.test(status)) { const old = parts[i++]; files.push({ status: status[0], path: parts[i++], old }); }
    else files.push({ status: status[0], path: parts[i++], old: null });
  }
  // Строки — пофайлово: заголовок только до первого @@, дальше любая «+» — содержимое
  // (добавленная строка «++ x.md» в общем diff выглядела бы как заголовок файла).
  for (const f of files) {
    if (f.status === 'D') continue;
    const a = [], r = [];
    let body = false;
    for (const line of git('diff', '-U0', '--no-color', '--no-ext-diff', '--no-textconv', '--no-renames', base, sha, '--', f.path).split('\n')) {
      if (line.startsWith('@@')) { body = true; continue; }
      if (!body) continue;
      if (line.startsWith('+')) a.push(line.slice(1));
      else if (line.startsWith('-')) r.push(line.slice(1));
    }
    added.set(f.path, a); removed.set(f.path, r);
  }
  const del = files.filter((f) => f.status === 'D').length;
  info.push(`файлов: ${files.length}${del ? ` (удалено ${del})` : ''} · база ${base.slice(0, 7)}`);
}

// ---------- 4. уровень (ORCHESTRATION §4 «Проверка PR») ----------

const LEVEL3 = [
  [/^\.github\//, '.github/ (CI)'],
  [/^\.claude\//, '.claude/ (хуки, settings, permissions)'],
  [/^scripts\//, 'scripts/'],
  [/^docs\/hub\/handover\/.*\.sh$/, 'docs/hub/handover/*.sh'],
  [/(^|\/)(package(-lock)?\.json|npm-shrinkwrap\.json|yarn\.lock|pnpm-lock\.yaml|requirements[^/]*\.txt|go\.(mod|sum))$/, 'зависимости'],
  [/(^|\/)Dockerfile[^/]*$|(^|\/)docker-compose[^/]*$|\.tf$|(^|\/)(serverless|deploy|nginx|gateway|api-gateway)[^/]*\.(ya?ml|json|conf)$/i, 'выкладка / шлюзы'],
  [/(^|\/)api\/login[^/]*$|(^|\/)(auth|session|login|keys?)[^/]*\.(m?[jt]sx?|py)$/i, 'вход, сессии, ключи'],
  [/^skills\/_shared\/protocols\/git-workflow\.md$/, 'git-workflow.md'],
  [/^skills\/_shared\/protocols\/gates\/release-gate\.md$/, 'release-gate.md'],
  [/^CLAUDE\.md$/, 'корневой CLAUDE.md'],
  [/^docs\/hub\/ORCHESTRATION\.md$/, 'ORCHESTRATION.md'],
  [/^docs\/hub\/agents\/[^/]+\.md$/, 'docs/hub/agents/*.md'],
];
const CODE = /\.(m?[jt]sx?|cjs|py|sh|bash|css|scss|html?|vue|svelte|swift|kt|go|rs)$/i;

let level = 1;
const level3Why = new Set();
for (const f of files) {
  for (const p of [f.path, f.old].filter(Boolean)) {
    const hit = LEVEL3.find(([re]) => re.test(p));
    if (hit) { level = 3; level3Why.add(hit[1]); }
    else if (CODE.test(p) && level < 2) level = 2;
  }
}
// Строка «Решения PD», разрешающая пункт «Только PD», — уровень 3. Какая строка
// что разрешает, скрипт не понимает: любая правка раздела — уровень 3.
if (base && files.some((f) => f.path === 'docs/hub/BOARD.md') &&
    section(base, 'docs/hub/BOARD.md', /^## Решения PD/, /^## (?!Решения PD)/) !== section(sha, 'docs/hub/BOARD.md', /^## Решения PD/, /^## (?!Решения PD)/)) {
  level = 3; level3Why.add('BOARD.md «Решения PD»');
}
info.push(`уровень ${level}${level3Why.size ? ` — ${[...level3Why].join(', ')}` : ''}`);

// ---------- 5. проверка уровня ----------

const body = pr.body || '';
// Строка «<Имя>: значение» в описании (допускаются ** и маркер списка).
// ok — значение начинается с «ок»; empty — строки нет или значение «—»/«нет»;
// other — строка с находками или пересказом: Merge читает её сам.
function bodyLine(name) {
  const m = body.match(new RegExp(`^[\\s>*_-]*${name}[^:\\n]*:[\\s*_]*(.*)$`, 'mi'));
  if (!m) return { kind: 'empty', text: '' };
  const v = m[1].trim();
  if (/^ок(?![а-яё])/i.test(v)) return { kind: 'ok', text: v };
  if (!v || /^(—|–|-|нет|не\s)/i.test(v)) return { kind: 'empty', text: v };
  return { kind: 'other', text: v };
}
const selfLine = bodyLine('Самопроверка');
const subLine = bodyLine('Подагент');
const show = (l) => (l.kind === 'ok' ? 'ок' : l.kind === 'empty' ? `нет${l.text ? ` («${l.text}»)` : ''}` : `«${l.text.slice(0, 70)}…»`);
info.push(`описание: Самопроверка — ${show(selfLine)}; Подагент — ${show(subLine)}`);

const short = sha.slice(0, 7);
// Вердикт Review — строка, начинающаяся с «Review · …», с «(head <SHA>)», где SHA —
// префикс head от 7 знаков. Решает ПОСЛЕДНИЙ вердикт для этого head: «находки» после
// «ок» на том же head — стоп. «ок» — только строгий формат.
const VERDICT = /^\s*\**Review · (.*)\(head ([0-9a-f]{7,40})\)\**\s*$/;
const OK = /^\s*\**Review · качество: ок · безопасность: ок \(head ([0-9a-f]{7,40})\)\**\s*$/;
const verdicts = [];
for (const c of [...(pr.comments || []), ...(pr.reviews || [])]) {
  for (const l of String(c.body || '').split('\n')) {
    const m = l.match(VERDICT);
    if (m && sha.startsWith(m[2])) verdicts.push({ at: String(c.createdAt || c.submittedAt || ''), line: l.trim(), ok: OK.test(l) && c.state !== 'CHANGES_REQUESTED' });
  }
}
verdicts.sort((a, b) => a.at.localeCompare(b.at));
const last = verdicts[verdicts.length - 1];

if (level === 3) {
  if (last?.ok) info.push(`уровень 3: последний вердикт Review на ${short} — ${last.at.slice(0, 16)} («${last.line.slice(0, 80)}»)`);
  else if (last) stops.push(`уровень 3: последний вердикт Review на ${short} не «ок»: «${last.line.slice(0, 100)}»`);
  else stops.push(`уровень 3: нет вердикта «Review · качество: ок · безопасность: ок (head ${short})»`);
} else {
  for (const [name, l] of [['Самопроверка', selfLine], ['Подагент', subLine]]) {
    if (l.kind === 'empty') stops.push(`уровень ${level}: нет строки «${name}: ок» в описании`);
    else if (l.kind === 'other') warns.push(`уровень ${level}: «${name}» не «ок» — прочитать строку: находки исправлены?`);
  }
}


// ---------- 6. «Только PD» (CLAUDE.md «Git-полномочия») ----------
// Эвристика: добавленные строки вне .md (в документах эти слова — норма) и пути.

const isDoc = (p) => /\.(md|txt)$/i.test(p);
const isWorkflow = (p) => /^\.github\/workflows\//.test(p);
const RULES = [
  { code: 'PD1', what: 'удаление (облако, ветки, worktree, данные)', re: /\byc\b[^\n]*\bdelete\b|git\s+push\b[^\n]*(--delete|\s:\S)|git\s+branch\s+-D\b|worktree\s+remove|\brm\s+-[a-z]*r[a-z]*f|\bDROP\s+(TABLE|DATABASE)\b|\bDELETE\s+FROM\b|gh\s+repo\s+delete|gh\s+api\b[^\n]*-X\s*DELETE/i },
  { code: 'PD2', what: 'секреты, роли, IAM', re: /\bsecrets\.[A-Za-z_]|access-binding|\biam\b|service-account|\broles?\/|role-id|--role\b|gh\s+secret\s+set|CODEOWNERS|rulesets?\b/i },
  { code: 'PD3', what: 'DNS, домены, хостинг', re: /\byc\s+dns\b|dns-zone|certificate-manager/i },
  // «domain»/CNAME в коде приложения — обычное слово; ловим только в инфраструктуре.
  { code: 'PD3', what: 'DNS, домены, хостинг', re: /\bCNAME\b|\bdomains?\b/i, only: (p) => /^\.github\/|\.(tf|ya?ml|sh|conf)$|(^|\/)Dockerfile/i.test(p) },
  { code: 'PD4', what: 'релиз: GitHub Release, Latest', re: /gh\s+release\s+(create|edit|upload)|make_latest|--latest\b|\/releases\b/i },
];
for (const [path, lines] of added) {
  if (isDoc(path)) continue;
  for (const r of RULES) {
    if (r.only && !r.only(path)) continue;
    const hit = lines.find((l) => r.re.test(l));
    if (hit) pdHit(r.code, `${r.what} — ${path}: «${hit.trim().slice(0, 90)}»`);
  }
  if (isWorkflow(path)) {
    const perm = lines.find((l) => /^\s*permissions\s*:/.test(l) || /^\s+(contents|id-token|actions|packages|pull-requests|issues|deployments|pages|statuses|checks)\s*:\s*write/.test(l));
    if (perm) pdHit('PD2', `шире permissions: — ${path}: «${perm.trim()}»`);
  }
}
for (const f of files) {
  if (f.path === '.github/workflows/checks.yml' || f.old === '.github/workflows/checks.yml') pdHit('PD6', 'правка проверок checks.yml');
  if (/(^|\/)CODEOWNERS$/.test(f.path)) pdHit('PD2', `CODEOWNERS (${f.path})`);
  if (isWorkflow(f.path) && f.status === 'D') pdHit('PD1', `удалён workflow ${f.path}`);
  // версия продукта (все продукты репо, кроме Bot · Request, — PD, ORCHESTRATION §9)
  if (/(^|\/)(package\.json|manifest\.json)$/.test(f.path) &&
      (added.get(f.path) || []).some((l) => /^\s{0,4}"version"\s*:/.test(l))) {
    pdHit('PD4', `версия продукта — ${f.path}`);
  }
  if (/^(tools\/[^/]+|pages\/[^/]+)\/CHANGELOG[^/]*$/i.test(f.path)) pdHit('PD4', `changelog продукта — ${f.path}`);
  if (/^tokens\/.*changelog.*\.json$/i.test(f.path)) warns.push(`changelog библиотеки ${f.path} — сверить release-gate («соответствует» Standards; major — только люди)`);
}

// Разделы-предохранители: сравнение текста раздела в базе и в head.
function section(rev, path, startRe, endRe) {
  let text;
  try { text = git('show', `${rev}:${path}`); } catch { return null; }
  const lines = text.split('\n');
  const s = lines.findIndex((l) => startRe.test(l));
  if (s < 0) return null;
  let e = lines.findIndex((l, i) => i > s && endRe.test(l));
  if (e < 0) e = lines.length;
  return lines.slice(s, e).join('\n');
}
const GUARDS = [
  ['CLAUDE.md', /^## Git-полномочия/, /^## (?!Git-полномочия)/, '«Git-полномочия» корневого CLAUDE.md'],
  ['docs/hub/ORCHESTRATION.md', /^## 4\. /, /^## 5\. /, 'ORCHESTRATION §4 (разрешения, «Проверка PR», «Решения PD через Штаб»)'],
];
if (base) {
  for (const [path, s, e, label] of GUARDS) {
    if (!files.some((f) => f.path === path)) continue;
    const a = section(base, path, s, e);
    const b = section(sha, path, s, e);
    if (a !== b) pdHit('PD6', `правило-предохранитель: ${label}`);
  }
}

// ---------- 7. контуры ----------

const CONTOURS = [
  ['Token Comparator', /^tools\/figma-token-comparator\/|^\.github\/workflows\/registry-api-deploy\.yml$/],
  ['Presentbook', /^pages\/aid-portal\/|^\.github\/workflows\/presentbook-yc\.yml$/],
  ['Team', /^tools\/aid-team\/|^\.github\/workflows\/team-service\.yml$/],
];
const touched = CONTOURS.filter(([, re]) => files.some((f) => re.test(f.path) || (f.old && re.test(f.old)))).map(([n]) => n);
info.push(`контуры: ${touched.length ? touched.join(', ') : 'нет'}`);
if (touched.length > 1) stops.push(`PR задевает два контура: ${touched.join(' и ')} — не мержится`);

// ---------- 8. check-docs на дереве head ----------

/* Ссылки из дерева PR: ведущие внутрь дерева остаются (check-docs требует
   симлинки .claude/skills/<имя> → ../../skills/<имя>, правило skill-link,
   AID-114), ведущие наружу и битые удаляются, чтобы чтение не ушло за
   пределы временной папки. Проверка — по realpath.native (физический путь ОС, с учётом
   цепочек и «..» после ссылки на каталог), до неподвижной точки: удалённая
   ссылка может сделать битой другую. В каталоги-ссылки обход не заходит. */
function pruneOutwardLinks(root) {
  const real = realpathSync.native(root);
  const links = [];
  const walk = (d) => {
    for (const e of readdirSync(d)) {
      const p = join(d, e);
      const st = lstatSync(p);
      if (st.isSymbolicLink()) links.push(p);
      else if (st.isDirectory()) walk(p);
    }
  };
  walk(root);
  let left = links;
  for (let removed = true; removed; ) {
    removed = false;
    left = left.filter((p) => {
      let target = null;
      try { target = realpathSync.native(p); } catch { /* битая */ }
      if (target && (target === real || target.startsWith(real + '/'))) return true;
      unlinkSync(p);
      removed = true;
      return false;
    });
  }
}

if (runDocs && base && !stops.some((s) => s.startsWith('head сменился'))) {
  const dir = mkdtempSync(join(tmpdir(), 'merge-precheck-'));
  try {
    // read-tree + checkout-index, не archive: export-ignore из .gitattributes PR не прячет файлы.
    execFileSync('sh', ['-c', 'GIT_INDEX_FILE="$3/.idx" git -C "$1" read-tree "$2" && GIT_INDEX_FILE="$3/.idx" git -C "$1" checkout-index -a -f --prefix="$3/t/" && rm -f "$3/.idx"', 'sh', repoRoot, sha, dir]);
    pruneOutwardLinks(join(dir, 't'));
    // Код из PR не исполняем: check-docs — из main (сейчас импортирует только node:*;
    // если начнёт импортировать соседние скрипты — копировать из main весь scripts/).
    mkdirSync(join(dir, 't', 'scripts'), { recursive: true });
    writeFileSync(join(dir, 't', 'scripts', 'check-docs.mjs'), git('show', 'origin/main:scripts/check-docs.mjs'));
    const changed = files.some((f) => f.path === 'scripts/check-docs.mjs');
    const r = spawnSync(process.execPath, [join(dir, 't', 'scripts', 'check-docs.mjs')], { cwd: join(dir, 't'), encoding: 'utf8' });
    const tail = `${r.stdout}\n${r.stderr}`.trim().split('\n').filter(Boolean).slice(-1)[0] || '';
    if (r.status === 0) info.push(`check-docs (версия main) на head: ок${tail ? ` — ${tail.slice(0, 100)}` : ''}`);
    else if (changed) warns.push(`check-docs из main падает на head, но PR меняет сам check-docs — смотреть CI «Документы»: ${tail.slice(0, 120)}`);
    else stops.push(`check-docs на head: ошибки — ${tail.slice(0, 160)}`);
  } catch (e) {
    warns.push(`check-docs не запустился: ${String(e.message).split('\n')[0]}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
} else if (!runDocs) warns.push('check-docs пропущен (--no-docs)');

// ---------- отчёт ----------

const out = [];
out.push(...info);
if (files.length) {
  out.push('файлы:');
  const show = files.slice(0, 40);
  for (const f of show) out.push(`  ${f.status} ${f.old ? f.old + ' → ' : ''}${f.path}`);
  if (files.length > show.length) out.push(`  … ещё ${files.length - show.length}`);
}
if (acks.length) { out.push('«Только PD», сверено вручную (--ack):'); for (const a of acks) out.push(`  · ${a}`); }
if (warns.length) { out.push('внимание:'); for (const w of warns) out.push(`  · ${w}`); }
out.push('вручную (скрипт не проверяет): diff прочитан целиком и совпадает с описанием (условие 3)' +
  (level === 3 ? '; отправитель запроса — сессия Review' : ''));
out.push('');
if (stops.length) {
  out.push(`СТОП — не мержить (${stops.length}):`);
  for (const s of stops) out.push(`  ✗ ${s}`);
} else {
  out.push(`МОЖНО МЕРЖИТЬ: #${pr.number} @ ${sha}`);
}
console.log(out.join('\n'));

if (stops.length) process.exit(1);
if (!doMerge) process.exit(0);

// ---------- --merge ----------
// Команда — ровно из merge.md: --merge --admin --match-head-commit SHA.
// `pr merge` — несколько запросов: после сбоя смотрим фактическое состояние.

console.log(`\nмерж: gh pr merge ${pr.number} --repo ${repo} --merge --admin --match-head-commit ${sha}`);
let mergeErr = null;
try { gh('pr', 'merge', String(pr.number), '--repo', repo, '--merge', '--admin', '--match-head-commit', sha); }
catch (e) { mergeErr = e.message; }
let after;
try { after = JSON.parse(gh('pr', 'view', String(pr.number), '--repo', repo, '--json', 'state,mergeCommit')); } catch { after = null; }
if (after?.state === 'MERGED') {
  console.log(`смержен: #${pr.number} → main, merge-коммит ${after.mergeCommit?.oid ?? '?'}`);
  process.exit(0);
}
console.log(`НЕ смержен${mergeErr ? `: ${mergeErr}` : ''} (state ${after?.state ?? '?'})`);
process.exit(1);
