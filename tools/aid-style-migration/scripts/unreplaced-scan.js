// Скан незаменённого для секций «Не заменено · <тип>» (только чтение узлов). Критерии — как в measure-page.js:
// «не заменено» = заливка/обводка не на переменной color-sem и не стиль Gradients/*, текст без стиля Rider, эффект без Shadows/Glass.
// «Вне счёта» measure-page (логотипы, иллюстрации, пины, ALS Hauss/Factor A) сюда не попадает.
// Параметры: ROOT_ID (секция или страница); CLEAN = true — снять служебные ключи. Повторять, пока не вернётся {done:true}.
// Состояние — shared pluginData на figma.root, пространство 'pfa' (снимается CLEAN). Макет = предок, чей родитель — секция или страница.
const NS = 'pfa', BUDGET = 25000, SPLIT = 3000;
const R = figma.root;
const getS = k => { const n = +(R.getSharedPluginData(NS, k + '#') || 0); let s = ''; for (let i = 0; i < n; i++) s += R.getSharedPluginData(NS, k + '#' + i); return s; };
const putS = (k, s) => { const old = +(R.getSharedPluginData(NS, k + '#') || 0); for (let i = 0; i < old; i++) R.setSharedPluginData(NS, k + '#' + i, ''); const parts = s.match(/[\s\S]{1,90000}/g) || []; parts.forEach((p, i) => R.setSharedPluginData(NS, k + '#' + i, p)); R.setSharedPluginData(NS, k + '#', String(parts.length)); };
if (typeof CLEAN !== 'undefined' && CLEAN) { for (const k of R.getSharedPluginDataKeys(NS)) R.setSharedPluginData(NS, k, ''); return { cleaned: true }; }
const root = await figma.getNodeByIdAsync(ROOT_ID);
let page = root; while (page.type !== 'PAGE') page = page.parent;
await page.loadAsync();
let plan = JSON.parse(getS('plan') || 'null');
if (!plan || plan.root !== ROOT_ID) {
  const units = [];
  const add = n => { const size = 'findAll' in n ? n.findAll().length + 1 : 1; if (size > SPLIT && 'children' in n && n.children.length) { units.push([n.id, 1]); n.children.forEach(add); } else units.push([n.id, 0]); };
  root.children.forEach(add);
  plan = { root: ROOT_ID, i: 0, units };
  putS('plan', JSON.stringify(plan)); putS('agg', '');
}
// agg.g[key] = {k: тип, s: значение, n: счёт, v: {вариант: счёт}, sc: {макет: счёт}, ex: [[узел, макет, x, y, w, h]]}; agg.scr[макет] = [имя, w, h, секция]
const agg = JSON.parse(getS('agg') || 'null') || { g: {}, scr: {}, tot: { fill: 0, grad: 0, stroke: 0, font: 0, effect: 0 } };
const SKIP = /^(status bar|home indicator( ios)?|map|dark map|light map|car class|car|car icon)$|keyboard/i;
const OUTNAME = /logo|illustration|mastercard|visa\b|\bpin\b|map pin|marketplace|маркетплейс/i;
const LOGO = new Set(['ff5f00', 'eb001b', 'f79e1b']);
const OUTFONT = /ALS Hauss|Factor A/;
const hex = c => [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
const pct = a => a == null || a >= 0.995 ? '' : ' ' + Math.round(a * 100) + '%';
const vars = {}, styles = {};
const varInfo = async id => {
  if (!(id in vars)) { const v = await figma.variables.getVariableByIdAsync(id); const c = v && await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId); vars[id] = { sem: !!c && c.name === 'color-sem', name: v ? (c ? c.name + ' / ' : '') + v.name : 'переменная недоступна' }; }
  return vars[id];
};
const styleName = async id => { if (!id || typeof id !== 'string') return null; if (!(id in styles)) { const s = await figma.getStyleByIdAsync(id); styles[id] = s ? s.name : ''; } return styles[id]; };
const kindOf = n => n.type === 'TEXT' ? 'текст' : /^(VECTOR|RECTANGLE|ELLIPSE|BOOLEAN_OPERATION|STAR|LINE|POLYGON)$/.test(n.type) ? 'фигура' : 'фрейм';
let screen = null; // [id, absX, absY]
const setScreen = s => { const b = s.absoluteBoundingBox || { x: 0, y: 0 }; screen = [s.id, b.x, b.y]; if (!agg.scr[s.id]) agg.scr[s.id] = [s.name, Math.round(s.width), Math.round(s.height), s.parent.type === 'SECTION' ? s.parent.name : '']; };
const rec = (kind, sig, n, variant) => {
  const key = kind + '|' + sig;
  const g = agg.g[key] || (agg.g[key] = { k: kind, s: sig, n: 0, v: {}, sc: {}, ex: [] });
  g.n++; agg.tot[kind]++;
  if (variant) g.v[variant] = (g.v[variant] || 0) + 1;
  const sid = screen[0];
  g.sc[sid] = (g.sc[sid] || 0) + 1;
  if (g.ex.length < 12 && !g.ex.some(e => e[1] === sid)) {
    const b = n.absoluteBoundingBox || { x: screen[1], y: screen[2], width: 0, height: 0 };
    g.ex.push([n.id, sid, Math.round(b.x - screen[1]), Math.round(b.y - screen[2]), Math.round(b.width), Math.round(b.height)]);
  }
};
const paints = async (n, prop) => {
  const ps = n[prop], slot = prop === 'fills' ? 'fill' : 'stroke';
  if (ps === figma.mixed) { rec(slot, kindOf(n) + ' · смешанная заливка (разные цвета в одном тексте)', n); return; }
  if (!Array.isArray(ps) || !ps.length) return;
  const sn = await styleName(prop === 'fills' ? n.fillStyleId : n.strokeStyleId);
  for (const p of ps) {
    if (p.visible === false || p.type === 'IMAGE' || p.type === 'VIDEO') continue;
    if (p.type === 'SOLID' && LOGO.has(hex(p.color))) continue;
    if (sn && /^Gradients\//.test(sn)) continue;
    let src = sn ? 'стиль ' + sn : '';
    if (p.boundVariables && p.boundVariables.color) { const vi = await varInfo(p.boundVariables.color.id); if (vi.sem) continue; src = 'переменная ' + vi.name; }
    if (!src) src = 'без токена';
    const w = slot === 'stroke' && typeof n.strokeWeight === 'number' ? n.strokeWeight : null;
    if (p.type === 'SOLID') rec(slot, kindOf(n) + ' · #' + hex(p.color) + pct(p.opacity) + ' · ' + src, n, w != null ? 'толщина ' + +w.toFixed(2) : null);
    else if (/^GRADIENT_/.test(p.type)) rec(slot === 'fill' ? 'grad' : 'stroke', kindOf(n) + ' · ' + p.type.replace('GRADIENT_', '').toLowerCase() + ' ' + p.gradientStops.map(s => '#' + hex(s.color) + pct(s.color.a * (p.opacity == null ? 1 : p.opacity))).join(' → ') + ' · ' + src, n);
    else rec(slot, kindOf(n) + ' · ' + p.type + ' · ' + src, n);
  }
};
const effDesc = e => {
  if (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW') return (e.type === 'DROP_SHADOW' ? 'тень' : 'внутр. тень') + ' #' + hex(e.color) + pct(e.color.a) + ' ' + +e.offset.x.toFixed(1) + ',' + +e.offset.y.toFixed(1) + ' r' + +e.radius.toFixed(1) + (e.spread ? ' s' + +e.spread.toFixed(1) : '');
  if (e.type === 'LAYER_BLUR' || e.type === 'BACKGROUND_BLUR') return (e.type === 'LAYER_BLUR' ? 'размытие слоя' : 'размытие фона') + ' ' + +e.radius.toFixed(1);
  return e.type.toLowerCase();
};
const measure = async n => {
  if ('fills' in n) await paints(n, 'fills');
  if ('strokes' in n) await paints(n, 'strokes');
  if (n.type === 'TEXT') {
    const fam = n.fontName === figma.mixed ? '' : n.fontName.family;
    const sn = n.textStyleId === figma.mixed ? null : await styleName(n.textStyleId);
    if (!OUTFONT.test(fam) && !/^(Bodies|Subtitles|Titles|Captions|Outstanding)\//.test(sn || '')) {
      let sig;
      if (n.fontName === figma.mixed || n.fontSize === figma.mixed) sig = 'смешанный шрифт: ' + n.getStyledTextSegments(['fontName', 'fontSize']).map(s => s.fontName.family + ' ' + s.fontName.style + ' ' + +s.fontSize.toFixed(2)).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3).join(' + ');
      else sig = fam + ' ' + n.fontName.style + ' ' + +n.fontSize.toFixed(2);
      if (n.textStyleId === figma.mixed) sig += ' · смешанные стили'; else if (sn) sig += ' · стиль ' + sn;
      const lh = n.lineHeight === figma.mixed ? 'mixed' : n.lineHeight.unit === 'AUTO' ? 'auto' : +n.lineHeight.value.toFixed(2) + (n.lineHeight.unit === 'PERCENT' ? '%' : '');
      const ls = n.letterSpacing === figma.mixed ? 'mixed' : +n.letterSpacing.value.toFixed(2) + (n.letterSpacing.unit === 'PERCENT' ? '%' : '');
      rec('font', sig, n, lh + ' / ' + ls);
    }
  }
  if ('effects' in n && n.effects.some(e => e.visible !== false)) {
    const sn = await styleName(n.effectStyleId);
    if (!/^(Shadows|Glass)\//.test(sn || '')) rec('effect', (sn ? 'стиль ' + sn + ' · ' : '') + n.effects.filter(e => e.visible !== false).map(effDesc).join(' + '), n);
  }
};
const own = n => !n.name.startsWith('❌') && !(n.type !== 'TEXT' && SKIP.test(n.name)) && n.visible !== false && n.isMask !== true && n.parent.type !== 'BOOLEAN_OPERATION' && !OUTNAME.test(n.name);
const walk = async n => {
  if (!own(n)) return;
  await measure(n);
  if ('children' in n) for (const c of n.children) await walk(c);
};
const screenOf = n => { let s = n; while (s.parent && s.parent.type !== 'SECTION' && s.parent.type !== 'PAGE') s = s.parent; return s; };
const proc = async (n, shallow) => {
  if (n.type === 'SECTION') { if (!shallow && n.visible !== false) for (const c of n.children) await proc(c, 0); return; }
  let up = n.parent;
  while (up && up.type !== 'PAGE') { if (up.visible === false || OUTNAME.test(up.name) || SKIP.test(up.name) || up.name.startsWith('❌')) return; up = up.parent; }
  setScreen(screenOf(n));
  if (shallow) { if (own(n)) await measure(n); } else await walk(n);
  screen = null;
};
const t0 = Date.now();
while (plan.i < plan.units.length && Date.now() - t0 < BUDGET) {
  const [id, shallow] = plan.units[plan.i];
  const n = await figma.getNodeByIdAsync(id);
  if (n) await proc(n, shallow);
  plan.i++;
}
putS('agg', JSON.stringify(agg)); putS('plan', JSON.stringify(plan));
if (plan.i < plan.units.length) return { left: plan.units.length - plan.i, of: plan.units.length, ms: Date.now() - t0 };
const by = {}; for (const g of Object.values(agg.g)) by[g.k] = (by[g.k] || 0) + 1;
return { done: true, tot: agg.tot, groups: by, screens: Object.keys(agg.scr).length };
