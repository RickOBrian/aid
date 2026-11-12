// Прогон страницы-копии порциями внутри Figma: один короткий вызов идёт по единицам, пока есть время,
// состояние хранит в shared pluginData страницы, следующий такой же вызов продолжает с места остановки.
// Заливается на figma.root вместе с телом migrate-styles.js (scripts/build-kit.mjs), вызов — mappings/drafts-run/RUNBOOK.md.
// Параметры вызова: PAGE_ID, DRY, HASH; необязательно CLEAN = true (снять ключи страницы), TOP (сколько причин отдать).
const NS = 'mig', BUDGET = 25000, LIMIT = 1000, SPLIT = 1500, MAXUNITS = 30, MAXIDS = 3;
const top = typeof TOP === 'undefined' ? 60 : TOP;
const page = await figma.getNodeByIdAsync(PAGE_ID);
const get = k => page.getSharedPluginData(NS, k), put = (k, v) => page.setSharedPluginData(NS, k, v);
if (typeof CLEAN !== 'undefined' && CLEAN) { put('plan', ''); put('agg', ''); return { cleaned: page.getSharedPluginDataKeys(NS).filter(get).length === 0 }; }
if (figma.root.getSharedPluginData(NS, 'hash') !== String(HASH)) return { error: 'на файле другая версия скрипта: залить заново (build-kit)' };
await page.loadAsync();
let plan = JSON.parse(get('plan') || 'null');
if (plan && plan.dry !== DRY) return { error: `на странице план с DRY=${plan.dry}: сначала CLEAN` };
if (!plan) {
  const units = [], shallow = [];
  const add = n => {
    if (n.name.startsWith('❌')) return; // узел с «❌ » в имени — референс, не сканируем (arturuxui 10.11)
    const size = 'findAll' in n ? n.findAll().length + 1 : 1;
    if (size > SPLIT && 'children' in n && n.children.length) { shallow.push(n.id); n.children.forEach(add); } else units.push([n.id, size]);
  };
  page.children.forEach(add);
  const batches = []; let b = null;
  for (const [id, size] of units) {
    if (!b || b.size + size > LIMIT || b.ids.length >= MAXUNITS) batches.push(b = { ids: [], size: 0 });
    b.ids.push(id); b.size += size;
  }
  if (shallow.length) batches.push({ ids: shallow, size: shallow.length, shallow: true });
  plan = { dry: DRY, i: 0, batches: batches.map(x => ({ ids: x.ids, shallow: !!x.shallow })) };
  put('plan', JSON.stringify(plan)); put('agg', '');
}
const agg = JSON.parse(get('agg') || '{"nodes":0,"done":{},"skip":{},"samp":{}}');
const saveAgg = () => {
  let s = JSON.stringify(agg);
  // у записи pluginData предел 100 КБ: при переполнении ID остаются только у частых причин
  if (s.length > 90000) { Object.values(agg.skip).sort((a, b) => b.count - a.count).slice(100).forEach(e => { e.ids = []; }); s = JSON.stringify(agg); }
  put('agg', s);
};
const AF = Object.getPrototypeOf(async function () {}).constructor;
const body = figma.root.getSharedPluginData(NS, 'body');
const t0 = Date.now();
while (plan.i < plan.batches.length && Date.now() - t0 < BUDGET) {
  const b = plan.batches[plan.i];
  const head = `const DRY=${DRY},SHOT=false,PAGE_ID=${JSON.stringify(PAGE_ID)},ROOTS=${JSON.stringify(b.ids)},MAXIDS=${MAXIDS},SHALLOW=${b.shallow};`;
  let r;
  try { r = await new AF(head + body)(); } catch (e) { return { error: String(e.message || e).slice(0, 200), batch: plan.i, of: plan.batches.length }; }
  agg.nodes += r.nodes;
  for (const line of r.done) { const m = /^(\d+)× ([\s\S]*)$/.exec(line); agg.done[m[2]] = (agg.done[m[2]] || 0) + Number(m[1]); }
  for (const s of r.skipped) {
    const e = agg.skip[s.reason] || (agg.skip[s.reason] = { count: 0, ids: [] });
    e.count += s.count; e.ids = e.ids.concat(s.ids).slice(0, MAXIDS);
  }
  agg.samp = agg.samp || {};
  for (const [k, a] of Object.entries(r.samples || {})) agg.samp[k] = (agg.samp[k] || []).concat(a).slice(0, 5); // примеры узлов (анкета А)
  plan.i++;
  saveAgg(); put('plan', JSON.stringify(plan));
}
const sum = o => Object.values(o).reduce((a, x) => a + (x.count === undefined ? x : x.count), 0);
const replaced = sum(agg.done), skipped = sum(agg.skip);
const errs = Object.keys(agg.skip).filter(k => k.startsWith('ошибка'));
if (plan.i < plan.batches.length) return { left: plan.batches.length - plan.i, of: plan.batches.length, replaced, skipped, errs: errs.length, ms: Date.now() - t0 };
// итог — строки для mappings/drafts-run/results/<slug>.tsv, разбирает scripts/report.mjs
const clean = s => s.replace(/\s+/g, ' ');
const skips = Object.entries(agg.skip).sort((a, b) => b[1].count - a[1].count);
const rest = skips.slice(top).filter(([k]) => !errs.includes(k));
const lines = [`#\tpage=${clean(page.name)}\tid=${page.id}\tdry=${DRY ? 1 : 0}\tnodes=${agg.nodes}\treplaced=${replaced}\tskipped=${skipped}\tdate=${new Date().toISOString().slice(0, 10)}`];
for (const [k, v] of Object.entries(agg.done).sort((a, b) => b[1] - a[1])) lines.push(`D\t${v}\t${clean(k)}`);
for (const [k, e] of skips) if (!rest.some(x => x[0] === k)) lines.push(`S\t${e.count}\t${clean(k)}\t${e.ids.join(' ')}`);
for (const [k, a] of Object.entries(agg.samp || {})) lines.push(`X	${k}	${a.join(" ¦ ")}`);
if (rest.length) lines.push(`R\t${rest.reduce((a, x) => a + x[1].count, 0)}\tостальные причины: ${rest.length}`);
return lines.join('\n');
