// Сводит mappings/drafts-run/results/*.tsv в results/LEDGER.md: таблица страниц и общий список незаменённого.
// Блок прогона начинается строкой «#»; замены складываются по блокам (кроме DRY), пропуски берутся из последнего блока.
// node scripts/report.mjs
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '../mappings/drafts-run/results');
// решения дизайнера: skip — страница пропущена, rows — решено по строкам; обе вне «в работе»
const decPath = join(dir, '../designer-decisions.json');
const dec = existsSync(decPath) ? JSON.parse(readFileSync(decPath, 'utf8')) : { skip: {}, rows: {} };
const status = slug => dec.skip?.[slug] ? 'skip' : dec.rows?.[slug] ? 'rows' : 'work';
const pages = [], reasons = new Map();
for (const f of readdirSync(dir).filter(x => x.endsWith('.tsv')).sort()) {
  const blocks = [];
  for (const line of readFileSync(join(dir, f), 'utf8').split(/\r?\n/)) {
    const c = line.split('\t');
    if (c[0] === '#') blocks.push({ head: Object.fromEntries(c.slice(1).map(x => { const i = x.indexOf('='); return [x.slice(0, i), x.slice(i + 1)]; })), s: [] });
    else if (c[0] === 'S') blocks.at(-1).s.push({ count: Number(c[1]), reason: c[2], ids: (c[3] || '').split(' ').filter(Boolean) });
  }
  const last = blocks.at(-1), slug = f.replace(/\.tsv$/, '');
  const replaced = blocks.filter(b => b.head.dry !== '1').reduce((a, b) => a + Number(b.head.replaced), 0);
  pages.push({ slug, name: last.head.page, id: last.head.id, replaced, skipped: Number(last.head.skipped), date: last.head.date, st: status(slug) });
  if (status(slug) !== 'work') continue;
  for (const s of last.s) {
    const e = reasons.get(s.reason) || { count: 0, pages: [], ids: [] };
    e.count += s.count; e.pages.push(slug); if (e.ids.length < 3) e.ids.push(...s.ids.slice(0, 3 - e.ids.length));
    reasons.set(s.reason, e);
  }
}
const n = x => x.toLocaleString('ru-RU');
const sum = (k, ps = pages) => ps.reduce((a, p) => a + p[k], 0);
const work = pages.filter(p => p.st === 'work'), stById = Object.fromEntries(pages.map(p => [p.id, p.st]));
const ST = { work: 'в работе', rows: 'по строкам (дизайнер)', skip: 'пропущена' };
// покрытие: results/coverage.txt, строки M от scripts/measure-page.js; ячейка — покрыто/не покрыто/вне счёта
const SLOTS = ['fill', 'stroke', 'font', 'effect'], covPath = join(dir, 'coverage.txt');
const cov = existsSync(covPath) ? readFileSync(covPath, 'utf8').split(/\r?\n/).filter(l => l.startsWith('M\t')).map(l => {
  const c = l.split('\t'), kv = Object.fromEntries(c.slice(3).map(x => x.split('=')));
  return { name: c[1], id: c[2], nodes: Number(kv.nodes), ...Object.fromEntries(SLOTS.map(s => [s, kv[s].split('/').map(Number)])) };
}) : [];
const pct = (ok, no) => (ok + no ? `${Math.round(ok / (ok + no) * 100)} %` : '—');
const covRow = (name, r) => {
  const t = [0, 1, 2].map(i => SLOTS.reduce((a, s) => a + r[s][i], 0));
  return `| ${name} | ${SLOTS.map(s => pct(r[s][0], r[s][1])).join(' | ')} | **${pct(t[0], t[1])}** | ${n(t[0])} | ${n(t[1])} | ${n(t[2])} |`;
};
const covSum = rs => Object.fromEntries(SLOTS.map(s => [s, [0, 1, 2].map(i => rs.reduce((a, r) => a + r[s][i], 0))]));
const covAll = covSum(cov), covWork = covSum(cov.filter(r => stById[r.id] === 'work'));
const covSection = cov.length ? ['## Покрытие: состояние копий', '',
  'Считается всё состояние копии, не замены прогона. Единица — заливка, обводка, шрифт, эффект на видимом узле.',
  'Процент — покрыто / (покрыто + не покрыто). Вне счёта — логотипы, иллюстрации, пины, вставки маркетплейса, определены по именам приближённо.', '',
  '| страница | заливки | обводки | шрифты | эффекты | всё | покрыто | не покрыто | вне счёта |', '|---|---:|---:|---:|---:|---:|---:|---:|---:|',
  ...cov.map(r => covRow(r.name + (stById[r.id] && stById[r.id] !== 'work' ? ` · ${ST[stById[r.id]]}` : ''), r)),
  covRow('**Итого, в работе**', covWork), covRow('Итого, все 17', covAll), ''] : [];
const decSection = ['## Решения дизайнера', '',
  `Источник — \`mappings/drafts-run/designer-decisions.json\`. ${dec.source || ''}`,
  'Пропущенные и решённые по строкам страницы в «Незаменённое» и итог «в работе» не входят; сделанные на них замены остаются.', '',
  '| страница | статус | решение |', '|---|---|---|',
  ...pages.filter(p => p.st !== 'work').map(p => `| ${p.name} | ${ST[p.st]} | ${(dec.skip?.[p.slug] || dec.rows?.[p.slug]).replace(/\|/g, '\|')} |`), ''];
const out = ['# Сводка прогонов (собрано scripts/report.mjs, руками не править)', '', ...decSection, ...covSection,
  '## Замены и пропуски по прогонам', '',
  '| страница | статус | копия | заменено | не заменено | последний прогон |', '|---|---|---|---:|---:|---|',
  ...pages.map(p => `| ${p.name} | ${ST[p.st]} | \`${p.id}\` | ${n(p.replaced)} | ${n(p.skipped)} | ${p.date} |`),
  `| **Итого, в работе** | | | **${n(sum('replaced', work))}** | **${n(sum('skipped', work))}** | |`,
  `| Итого, все 17 | | | ${n(sum('replaced'))} | ${n(sum('skipped'))} | |`, '',
  '## Незаменённое по страницам в работе', '',
  '| причина | кол-во | страниц | где | ID |', '|---|---:|---:|---|---|',
  ...[...reasons.entries()].sort((a, b) => b[1].count - a[1].count).map(([k, e]) =>
    `| ${k.replace(/\|/g, '\\|')} | ${n(e.count)} | ${e.pages.length} | ${e.pages.slice(0, 3).join(', ')}${e.pages.length > 3 ? ' …' : ''} | ${e.ids.join(' ')} |`)];
writeFileSync(join(dir, 'LEDGER.md'), out.join('\n') + '\n');
console.log(`страниц ${pages.length} (в работе ${work.length}), причин ${reasons.size}, заменено ${sum('replaced')}, не заменено в работе ${sum('skipped', work)} из ${sum('skipped')}`);
