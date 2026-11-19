// Сводит mappings/drafts-run/results/*.tsv в results/LEDGER.md: таблица страниц и общий список незаменённого.
// Блок прогона начинается строкой «#»; замены складываются по блокам (кроме DRY), пропуски берутся из последнего блока.
// node scripts/report.mjs
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '../mappings/drafts-run/results');
// решения: skip — страница пропущена, rows — решено по строкам; обе вне «в работе».
// decidedBy — кто закрыл (по умолчанию дизайнер); extra — страницы не из 17 копий Drafts
const decPath = join(dir, '../designer-decisions.json');
const dec = existsSync(decPath) ? JSON.parse(readFileSync(decPath, 'utf8')) : { skip: {}, rows: {} };
const status = slug => dec.skip?.[slug] ? 'skip' : dec.rows?.[slug] ? 'rows' : 'work';
const by = slug => status(slug) === 'work' ? 'open' : dec.decidedBy?.[slug] === 'arturuxui' ? 'art' : 'des';
const isExtra = slug => Boolean(dec.extra?.[slug]);
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
  pages.push({ slug, name: last.head.page, id: last.head.id, replaced, skipped: Number(last.head.skipped), date: last.head.date, st: status(slug), by: by(slug), extra: isExtra(slug) });
  if (status(slug) !== 'work') continue;
  for (const s of last.s) {
    const e = reasons.get(s.reason) || { count: 0, pages: [], ids: [] };
    e.count += s.count; e.pages.push(slug); if (e.ids.length < 3) e.ids.push(...s.ids.slice(0, 3 - e.ids.length));
    reasons.set(s.reason, e);
  }
}
const n = x => x.toLocaleString('ru-RU');
const sum = (k, ps = pages) => ps.reduce((a, p) => a + p[k], 0);
const copies = pages.filter(p => !p.extra), work = pages.filter(p => p.st === 'work');
const pageById = Object.fromEntries(pages.map(p => [p.id, p]));
const ST = { work: 'в работе', rows: 'по строкам (дизайнер)', skip: 'пропущена' };
const BY = { des: 'дизайнер', art: 'arturuxui', open: '—' };
// покрытие: results/coverage.txt, строки M от scripts/measure-page.js; ячейка — покрыто/не покрыто/вне счёта
const SLOTS = ['fill', 'stroke', 'font', 'effect'], covPath = join(dir, 'coverage.txt');
const cov = existsSync(covPath) ? readFileSync(covPath, 'utf8').split(/\r?\n/).filter(l => l.startsWith('M\t')).map(l => {
  const c = l.split('\t'), kv = Object.fromEntries(c.slice(3).map(x => x.split('=')));
  const p = pageById[c[2]];
  return { name: c[1], id: c[2], by: p ? p.by : 'open', st: p?.st, extra: Boolean(p?.extra), nodes: Number(kv.nodes), ...Object.fromEntries(SLOTS.map(s => [s, kv[s].split('/').map(Number)])) };
}) : [];
const pct = (ok, no) => (ok + no ? `${Math.round(ok / (ok + no) * 100)} %` : '—');
const tot = r => [0, 1, 2].map(i => SLOTS.reduce((a, s) => a + r[s][i], 0));
const covRow = (name, r) => {
  const t = tot(r);
  return `| ${name} | ${SLOTS.map(s => pct(r[s][0], r[s][1])).join(' | ')} | **${pct(t[0], t[1])}** | ${n(t[0])} | ${n(t[1])} | ${n(t[2])} |`;
};
const covSum = rs => Object.fromEntries(SLOTS.map(s => [s, [0, 1, 2].map(i => rs.reduce((a, r) => a + r[s][i], 0))]));
// страницы не из 17 копий (extra) — отдельными строками, в итоги и «кто закрыл» не входят
const cov17 = cov.filter(r => !r.extra), covExtra = cov.filter(r => r.extra);
const covAll = covSum(cov17), covWork = covSum(cov17.filter(r => r.by === 'open'));
// «не покрыто» по тому, кто его закрыл
const closed = k => cov17.filter(r => r.by === k).reduce((a, r) => a + tot(r)[1], 0);
const [cOk, cNo] = tot(covAll), cDes = closed('des'), cArt = closed('art'), cOpen = closed('open');
const closedSection = cov.length ? ['### Не покрыто: кто закрыл', '',
  '«Закрыто» — не покрыто на странице, которую пропустили или решили по строкам: менять её не будем, хотя подбор мог бы найтись.',
  'Сюда же входит то, у чего нет токена: на закрытых страницах пробел в анкету не идёт.', '',
  '| | значений | доля от «всё» |', '|---|---:|---:|',
  `| покрыто | ${n(cOk)} | ${pct(cOk, cNo)} |`,
  `| закрыто решением дизайнера | ${n(cDes)} | ${pct(cDes, cOk + cNo - cDes)} |`,
  `| закрыто решением arturuxui | ${n(cArt)} | ${pct(cArt, cOk + cNo - cArt)} |`,
  `| **открыто** (страницы в работе) | **${n(cOpen)}** | **${pct(cOpen, cOk + cNo - cOpen)}** |`,
  `| итого | ${n(cOk + cNo)} | 100 % |`, '',
  `Покрыто или закрыто решением: **${pct(cOk + cDes + cArt, cOpen)}**.`, ''] : [];
const covSection = cov.length ? ['## Покрытие: состояние копий', '',
  'Считается всё состояние копии, не замены прогона. Единица — заливка, обводка, шрифт, эффект на видимом узле.',
  'Процент — покрыто / (покрыто + не покрыто). Вне счёта — логотипы, иллюстрации, пины, вставки маркетплейса, определены по именам приближённо.', '',
  '| страница | заливки | обводки | шрифты | эффекты | всё | покрыто | не покрыто | вне счёта |', '|---|---:|---:|---:|---:|---:|---:|---:|---:|',
  ...cov17.map(r => covRow(r.name + (r.st && r.st !== 'work' ? ` · ${ST[r.st]}, ${BY[r.by]}` : ''), r)),
  covRow('**Итого, в работе**', covWork), covRow('Итого, все 17', covAll),
  ...covExtra.map(r => covRow(`${r.name} · не из 17`, r)), '', ...closedSection] : [];
const decSection = ['## Решения дизайнера', '',
  `Источник — \`mappings/drafts-run/designer-decisions.json\`. ${dec.source || ''}`,
  'Пропущенные и решённые по строкам страницы в «Незаменённое» и итог «в работе» не входят; сделанные на них замены остаются.', '',
  '| страница | статус | кто | решение |', '|---|---|---|---|',
  ...pages.filter(p => p.st !== 'work').map(p => `| ${p.name} | ${ST[p.st]} | ${BY[p.by]} | ${(dec.skip?.[p.slug] || dec.rows?.[p.slug]).replace(/\|/g, '\|')} |`), '',
  ...(dec.extra ? ['Не из 17 копий Drafts (в итог «17 копий» не входят):', '',
    ...pages.filter(p => p.extra).map(p => `- ${p.name} — ${dec.extra[p.slug]}`), ''] : [])];
const skipBy = k => sum('skipped', copies.filter(p => p.by === k));
const out = ['# Сводка прогонов (собрано scripts/report.mjs, руками не править)', '', ...decSection, ...covSection,
  '## Замены и пропуски по прогонам', '',
  '| страница | статус | копия | заменено | не заменено | последний прогон |', '|---|---|---|---:|---:|---|',
  ...pages.map(p => `| ${p.name} | ${ST[p.st]}${p.extra ? ' · не из 17' : ''} | \`${p.id}\` | ${n(p.replaced)} | ${n(p.skipped)} | ${p.date} |`),
  `| **Итого, в работе** | | | **${n(sum('replaced', work))}** | **${n(sum('skipped', work))}** | |`,
  `| Итого, 17 копий | | | ${n(sum('replaced', copies))} | ${n(sum('skipped', copies))} | |`,
  `| — из них не заменено, закрыто решением дизайнера | | | | ${n(skipBy('des'))} | |`,
  `| — из них не заменено, закрыто решением arturuxui | | | | ${n(skipBy('art'))} | |`,
  `| — из них не заменено, открыто | | | | ${n(skipBy('open'))} | |`, '',
  '## Незаменённое по страницам в работе', '',
  '| причина | кол-во | страниц | где | ID |', '|---|---:|---:|---|---|',
  ...[...reasons.entries()].sort((a, b) => b[1].count - a[1].count).map(([k, e]) =>
    `| ${k.replace(/\|/g, '\\|')} | ${n(e.count)} | ${e.pages.length} | ${e.pages.slice(0, 3).join(', ')}${e.pages.length > 3 ? ' …' : ''} | ${e.ids.join(' ')} |`)];
writeFileSync(join(dir, 'LEDGER.md'), out.join('\n') + '\n');
console.log(`страниц ${pages.length} (копий ${copies.length}, в работе ${work.length}), причин ${reasons.size}, заменено в копиях ${sum('replaced', copies)}; не заменено в копиях ${sum('skipped', copies)}: дизайнер ${skipBy('des')}, arturuxui ${skipBy('art')}, открыто ${skipBy('open')}; покрытие: покрыто ${cOk}, дизайнер ${cDes}, arturuxui ${cArt}, открыто ${cOpen}`);
