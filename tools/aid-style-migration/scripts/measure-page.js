// Замер покрытия копии порциями, только чтение узлов: состояние — в shared pluginData страницы (mplan, magg).
// Параметры вызова: PAGE_ID; необязательно CLEAN = true. Повторять, пока не вернётся строка вместо {left, of}.
// Единица счёта — заливка, обводка, шрифт, эффект на видимом узле. Видимое — без скрытых слоёв, масок, детей boolean.
// «Вне счёта» — раздел В анкеты покрытия: логотипы, иллюстрации, пины, вставки маркетплейса, картинки. Определяется по именам, приближённо.
const NS = 'mig', BUDGET = 25000, SPLIT = 3000;
const page = await figma.getNodeByIdAsync(PAGE_ID);
const get = k => page.getSharedPluginData(NS, k), put = (k, v) => page.setSharedPluginData(NS, k, v);
if (typeof CLEAN !== 'undefined' && CLEAN) { put('mplan', ''); put('magg', ''); return { cleaned: true }; }
await page.loadAsync();
let plan = JSON.parse(get('mplan') || 'null');
if (!plan) {
  const units = [];
  const add = n => {
    const size = 'findAll' in n ? n.findAll().length + 1 : 1;
    if (size > SPLIT && 'children' in n && n.children.length) { units.push([n.id, 1]); n.children.forEach(add); } else units.push([n.id, 0]);
  };
  page.children.forEach(add);
  plan = { i: 0, units };
  put('mplan', JSON.stringify(plan)); put('magg', '');
}
const zero = () => ({ ok: 0, no: 0, out: 0 });
const agg = JSON.parse(get('magg') || 'null') || { nodes: 0, hidden: 0, fill: zero(), stroke: zero(), font: zero(), effect: zero() };
const SKIP = /^(status bar|home indicator( ios)?|map|dark map|light map|car class|car|car icon)$|keyboard/i;
const OUTNAME = /logo|illustration|mastercard|visa\b|\bpin\b|map pin|marketplace|маркетплейс/i;
const LOGO = new Set(['ff5f00', 'eb001b', 'f79e1b']);
const OUTFONT = /ALS Hauss|Factor A/;
const hex = c => [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
const vars = {}, styles = {};
const isNewVar = async id => {
  if (!(id in vars)) {
    const v = await figma.variables.getVariableByIdAsync(id);
    const c = v && await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId);
    vars[id] = !!c && c.name === 'color-sem';
  }
  return vars[id];
};
const styleName = async id => {
  if (!id || typeof id !== 'string') return null;
  if (!(id in styles)) { const s = await figma.getStyleByIdAsync(id); styles[id] = s ? s.name : ''; }
  return styles[id];
};
const paints = async (n, prop, slot, out) => {
  const ps = n[prop];
  if (ps === figma.mixed) { agg[slot].no++; return; }
  if (!Array.isArray(ps) || !ps.length) return;
  const sn = await styleName(prop === 'fills' ? n.fillStyleId : n.strokeStyleId);
  for (const p of ps) {
    if (p.visible === false || p.type === 'IMAGE' || p.type === 'VIDEO') continue;
    if (out || (p.type === 'SOLID' && LOGO.has(hex(p.color)))) agg[slot].out++;
    else if (sn && /^Gradients\//.test(sn)) agg[slot].ok++;
    else if (p.boundVariables && p.boundVariables.color && await isNewVar(p.boundVariables.color.id)) agg[slot].ok++;
    else agg[slot].no++;
  }
};
const measure = async (n, out) => {
  agg.nodes++;
  if ('fills' in n) await paints(n, 'fills', 'fill', out);
  if ('strokes' in n) await paints(n, 'strokes', 'stroke', out);
  if (n.type === 'TEXT') {
    const id = n.textStyleId;
    const fam = n.fontName === figma.mixed ? '' : n.fontName.family;
    if (out || OUTFONT.test(fam)) agg.font.out++;
    else if (id !== figma.mixed && /^(Bodies|Subtitles|Titles|Captions|Outstanding)\//.test(await styleName(id) || '')) agg.font.ok++;
    else agg.font.no++;
  }
  if ('effects' in n && n.effects.some(e => e.visible !== false)) {
    if (out) agg.effect.out++;
    else if (/^(Shadows|Glass)\//.test(await styleName(n.effectStyleId) || '')) agg.effect.ok++;
    else agg.effect.no++;
  }
};
const walk = async (n, out, shallow) => {
  if (n.type !== 'TEXT' && SKIP.test(n.name)) return;
  if (n.visible === false || n.isMask === true || n.parent.type === 'BOOLEAN_OPERATION') { agg.hidden++; return; }
  const o = out || OUTNAME.test(n.name);
  await measure(n, o);
  if (!shallow && 'children' in n) for (const c of n.children) await walk(c, o, false);
};
const t0 = Date.now();
while (plan.i < plan.units.length && Date.now() - t0 < BUDGET) {
  const [id, shallow] = plan.units[plan.i];
  const n = await figma.getNodeByIdAsync(id);
  if (n) {
    let up = n.parent, ok = true, out = false;
    while (up && up.type !== 'PAGE') { if (up.visible === false) ok = false; if (OUTNAME.test(up.name)) out = true; if (SKIP.test(up.name)) ok = false; up = up.parent; }
    if (ok) await walk(n, out, !!shallow);
  }
  plan.i++;
  if (plan.i % 20 === 0) { put('magg', JSON.stringify(agg)); put('mplan', JSON.stringify(plan)); }
}
put('magg', JSON.stringify(agg)); put('mplan', JSON.stringify(plan));
if (plan.i < plan.units.length) return { left: plan.units.length - plan.i, of: plan.units.length, nodes: agg.nodes, ms: Date.now() - t0 };
const c = s => `${s.ok}/${s.no}/${s.out}`;
return `M\t${page.name.replace(/\s+/g, ' ')}\t${page.id}\tnodes=${agg.nodes}\thidden=${agg.hidden}\tfill=${c(agg.fill)}\tstroke=${c(agg.stroke)}\tfont=${c(agg.font)}\teffect=${c(agg.effect)}`;
