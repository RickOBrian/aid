// Перенос привязок с копии «— Switched Styles» на оригинал: узлы сопоставляются по дереву (имя+тип, порядок,
// при разном числе одноимённых — по позиции/размеру), с копии на оригинал переносится то, что в копии привязано
// к стилю или переменной и отличается от оригинала: заливки, обводки, эффекты, стиль текста (и по участкам),
// привязки узла (радиусы, отступы, толщина обводки…). Правила миграции не применяются — переносится результат.
// Подставить: __O__ (страница/узел оригинала), __C__ (копия), __DRY__ (true|false), __MASTERS__ (true — трогать
// и мастер-компоненты оригинала, у которых в копии инстанс; правка мастера уходит во все его инстансы).
// Бюджет ~45 с, продолжение — повторным вызовом (позиция в sharedPluginData 'mig2' на оригинале). CLEAN — снять.
const O_ID = '__O__', C_ID = '__C__', DRY = __DRY__, MASTERS = __MASTERS__, CLEAN = __CLEAN__, BUDGET = 45000;
const t0 = Date.now();
const O = await figma.getNodeByIdAsync(O_ID), C = await figma.getNodeByIdAsync(C_ID);
if (CLEAN) { O.setSharedPluginData('mig2', 'pos', ''); O.setSharedPluginData('mig2', 'acc', ''); return { clean: true }; }
if (O.type === 'PAGE') await O.loadAsync(); else await O.parent.loadAsync?.();
if (C.type === 'PAGE') await C.loadAsync();
const T = t => (t === 'COMPONENT' ? 'INSTANCE' : t);
const N = s => s.replace(/^❌\s*/, '');
const key = n => N(n.name) + '|' + T(n.type);
const isMaster = n => n.type === 'COMPONENT' || n.type === 'COMPONENT_SET';

// ---------- сопоставление ----------
function pairKids(a, b) {
  const gb = new Map(), ga = new Map();
  for (const k of b) { const kk = key(k); if (!gb.has(kk)) gb.set(kk, []); gb.get(kk).push(k); }
  for (const k of a) { const kk = key(k); if (!ga.has(kk)) ga.set(kk, []); ga.get(kk).push(k); }
  const res = [], miss = [];
  for (const [kk, la] of ga) {
    const lb = gb.get(kk) || [];
    if (la.length === lb.length) { la.forEach((x, i) => res.push([x, lb[i]])); continue; }
    const used = new Set();
    for (const x of la) {
      let best = null, bd = 1e9;
      for (const y of lb) {
        if (used.has(y)) continue;
        const d = Math.abs(x.x - y.x) + Math.abs(x.y - y.y) + Math.abs(x.width - y.width) + Math.abs(x.height - y.height);
        if (d < bd) { bd = d; best = y; }
      }
      if (best && bd < 4) { used.add(best); res.push([x, best]); } else miss.push(x);
    }
  }
  return { res, miss };
}
const st = { pairs: 0, missO: 0, missOex: [], extraC: 0 };
const pairs = [];
function walk(o, c, inM) {
  pairs.push([o, c, inM]);
  if (!('children' in o) || !('children' in c)) return;
  const { res, miss } = pairKids(o.children, c.children);
  st.missO += miss.length;
  for (const m of miss) if (st.missOex.length < 20) st.missOex.push(m.id + ' ' + m.type + ' ' + m.name.slice(0, 40));
  st.extraC += c.children.length - res.length;
  for (const [x, y] of res) walk(x, y, inM || (isMaster(x) && y.type === 'INSTANCE'));
}
{
  const kidsO = O.type === 'PAGE' || O.type === 'SECTION' ? O.children : [O];
  const kidsC = C.type === 'PAGE' || C.type === 'SECTION' ? C.children : [C];
  const { res, miss } = pairKids(kidsO, kidsC);
  st.missO += miss.length;
  for (const m of miss) st.missOex.push(m.id + ' ' + m.type + ' ' + m.name.slice(0, 40));
  for (const [x, y] of res) walk(x, y, isMaster(x) && y.type === 'INSTANCE');
}
st.pairs = pairs.length;

// ---------- подписи ----------
const r = v => Math.round(v * 1000) / 1000;
const bvId = o => (o && o.id) || '';
function pSig(p) {
  const o = { t: p.type, v: p.visible !== false, o: r(p.opacity ?? 1), bm: p.blendMode || '' };
  if (p.type === 'SOLID') { o.c = [r(p.color.r), r(p.color.g), r(p.color.b)]; o.b = bvId(p.boundVariables && p.boundVariables.color); }
  else if (p.gradientStops) { o.s = p.gradientStops.map(s => [r(s.position), r(s.color.r), r(s.color.g), r(s.color.b), r(s.color.a), bvId(s.boundVariables && s.boundVariables.color)]); o.tr = p.gradientTransform.flat().map(r); }
  else if (p.type === 'IMAGE') { o.h = p.imageHash; o.sm = p.scaleMode; }
  return JSON.stringify(o);
}
const pTok = p => !!(p.boundVariables && Object.keys(p.boundVariables).length) || (p.gradientStops || []).some(s => s.boundVariables && s.boundVariables.color);
function eSig(e) {
  const o = { t: e.type, v: e.visible !== false, r: r(e.radius || 0), sp: r(e.spread || 0), bm: e.blendMode || '' };
  if (e.color) o.c = [r(e.color.r), r(e.color.g), r(e.color.b), r(e.color.a)];
  if (e.offset) o.of = [r(e.offset.x), r(e.offset.y)];
  if (e.boundVariables) o.b = Object.keys(e.boundVariables).sort().map(k => k + ':' + bvId(e.boundVariables[k])).join(',');
  return JSON.stringify(o);
}
const eTok = e => !!(e.boundVariables && Object.keys(e.boundVariables).length);
function arrSig(n, prop, sp) {
  const sid = n[sp];
  if (sid === figma.mixed || n[prop] === figma.mixed) return { mixed: true };
  if (typeof sid === 'string' && sid) return { sig: 'S:' + sid, tok: true, style: sid };
  const a = n[prop] || [];
  const f = prop === 'effects' ? eSig : pSig, tk = prop === 'effects' ? eTok : pTok;
  return { sig: a.map(f).join(';'), tok: a.some(tk), style: '' };
}

// ---------- подписи для отчёта ----------
const nameCache = new Map();
async function sName(id) { if (!nameCache.has(id)) { const s = await figma.getStyleByIdAsync(id); nameCache.set(id, s ? s.name : '?' + id.slice(0, 8)); } return nameCache.get(id); }
async function vName(id) { if (!nameCache.has(id)) { const v = await figma.variables.getVariableByIdAsync(id); nameCache.set(id, v ? v.name : '?var'); } return nameCache.get(id); }
const hex = c => '#' + [c.r, c.g, c.b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
async function lab(n, prop, sp) {
  const sid = n[sp];
  if (typeof sid === 'string' && sid) return '[' + await sName(sid) + ']';
  const a = n[prop] || [];
  if (!a.length) return '∅';
  const p = a[a.length - 1];
  if (prop === 'effects') return p.boundVariables && p.boundVariables.color ? '{' + await vName(p.boundVariables.color.id) + '}' : 'сырая ' + p.type;
  if (p.boundVariables && p.boundVariables.color) return '{' + await vName(p.boundVariables.color.id) + '}';
  if (p.type === 'SOLID') return hex(p.color) + (p.opacity < 1 ? ' ' + Math.round(p.opacity * 100) + '%' : '');
  if (p.gradientStops) return 'градиент' + (pTok(p) ? '{…}' : '');
  return p.type;
}

// ---------- применение ----------
const SKIP_BV = new Set(['fills', 'strokes', 'effects', 'textRangeFills', 'componentProperties', 'layoutGrids', 'characters', 'fontFamily', 'fontStyle', 'fontWeight', 'fontSize', 'lineHeight', 'letterSpacing', 'paragraphSpacing', 'paragraphIndent']);
const agg = new Map(), noTok = new Map(), drift = new Map(), errs = [];
let applied = 0, masterHits = 0, textSkip = 0;
const bump = (m, k) => m.set(k, (m.get(k) || 0) + 1);
async function fonts(n) {
  if (n.type !== 'TEXT') return;
  const segs = n.getStyledTextSegments(['fontName']);
  for (const s of segs) await figma.loadFontAsync(s.fontName);
}
async function styleFont(id) { const s = await figma.getStyleByIdAsync(id); if (s && s.fontName) await figma.loadFontAsync(s.fontName); }
const clonePaints = a => JSON.parse(JSON.stringify(a));

async function doPair(o, c, inM) {
  if (o.type === 'PAGE' || o.type === 'SECTION' && false) return;
  if (inM) masterHits++;
  const allow = !inM || MASTERS;
  const todo = [];
  // заливки / обводки / эффекты
  for (const [prop, sp, setS] of [['fills', 'fillStyleId', 'setFillStyleIdAsync'], ['strokes', 'strokeStyleId', 'setStrokeStyleIdAsync'], ['effects', 'effectStyleId', 'setEffectStyleIdAsync']]) {
    if (!(prop in o) || !(prop in c)) continue;
    const a = arrSig(o, prop, sp), b = arrSig(c, prop, sp);
    if (b.mixed) { if (prop === 'fills' && o.type === 'TEXT' && c.type === 'TEXT') todo.push(['tfills']); continue; }
    if (a.sig === b.sig) continue;
    if (!b.tok) { bump(noTok, prop + ': ' + (await lab(o, prop, sp)) + ' → ' + (await lab(c, prop, sp))); continue; }
    const k = prop + ': ' + (a.mixed ? 'mixed' : await lab(o, prop, sp)) + ' → ' + (await lab(c, prop, sp)) + (inM ? ' (мастер)' : '');
    todo.push([prop, k, async () => { if (b.style) await o[setS](b.style); else o[prop] = clonePaints(c[prop]); }]);
  }
  // стиль текста
  if (o.type === 'TEXT' && c.type === 'TEXT') {
    const ts = c.textStyleId;
    if (typeof ts === 'string' && ts && ts !== o.textStyleId) {
      todo.push(['text', 'text: ' + (o.textStyleId === figma.mixed ? 'mixed' : o.textStyleId ? '[' + await sName(o.textStyleId) + ']' : 'без стиля') + ' → [' + await sName(ts) + ']' + (inM ? ' (мастер)' : ''), async () => { await styleFont(ts); await o.setTextStyleIdAsync(ts); }]);
    } else if (ts === figma.mixed || todo.some(t => t[0] === 'tfills')) {
      if (o.characters.length !== c.characters.length) textSkip++;
      else {
        const segs = c.getStyledTextSegments(['textStyleId', 'fillStyleId', 'fills']);
        for (const s of segs) {
          if (ts === figma.mixed && s.textStyleId && o.getRangeTextStyleId(s.start, s.end) !== s.textStyleId) {
            const id = s.textStyleId, a0 = s.start, a1 = s.end;
            todo.push(['trange', 'text(участок): → [' + await sName(id) + ']', async () => { await styleFont(id); await o.setRangeTextStyleIdAsync(a0, a1, id); }]);
          }
          if (c.fills === figma.mixed) {
            const of = o.getRangeFillStyleId(s.start, s.end), ofl = o.getRangeFills(s.start, s.end);
            const a0 = s.start, a1 = s.end;
            if (s.fillStyleId) { if (of !== s.fillStyleId) { const id = s.fillStyleId; todo.push(['trfill', 'text fill(участок): → [' + await sName(id) + ']', async () => o.setRangeFillStyleIdAsync(a0, a1, id)]); } }
            else if (s.fills.some(pTok) && (ofl === figma.mixed || ofl.map(pSig).join(';') !== s.fills.map(pSig).join(';'))) {
              const fl = clonePaints(s.fills), p = s.fills[s.fills.length - 1];
              const nm = p.boundVariables && p.boundVariables.color ? await vName(p.boundVariables.color.id) : '…';
              todo.push(['trfill', 'text fill(участок): → {' + nm + '}', async () => o.setRangeFills(a0, a1, fl)]);
            }
          }
        }
      }
    }
  }
  // привязки узла
  const cb = c.boundVariables || {}, ob = o.boundVariables || {};
  for (const f of Object.keys(cb)) {
    if (SKIP_BV.has(f)) continue;
    const cv = cb[f], ov = ob[f];
    if (Array.isArray(cv) || !cv || !cv.id) continue;
    if (ov && ov.id === cv.id) continue;
    const k = f + ': ' + (ov && ov.id ? '{' + await vName(ov.id) + '}' : r(o[f] ?? 0)) + ' → {' + await vName(cv.id) + '}' + (inM ? ' (мастер)' : '');
    const vv = await figma.variables.getVariableByIdAsync(cv.id);
    const rv = vv ? vv.resolveForConsumer(o).value : null;
    if (typeof rv === 'number' && typeof o[f] === 'number' && Math.abs(rv - o[f]) > 0.5) { bump(drift, o.id + ' ' + k + ' (в оригинале ' + r(o[f]) + ')'); continue; }
    todo.push(['bv', k, async () => { const v = await figma.variables.getVariableByIdAsync(cv.id); o.setBoundVariable(f, v); }]);
  }
  const real = todo.filter(t => t[1]);
  if (!real.length) return;
  for (const t of real) bump(agg, t[1]);
  if (DRY || !allow) return;
  try { await fonts(o); } catch (e) { errs.push(o.id + ' fonts ' + e.message); return; }
  for (const t of real) {
    try { await t[2](); applied++; } catch (e) { if (errs.length < 30) errs.push(o.id + ' ' + t[1].slice(0, 50) + ' — ' + e.message); }
  }
}

let pos = +(O.getSharedPluginData('mig2', 'pos') || 0);
const acc = JSON.parse(O.getSharedPluginData('mig2', 'acc') || '{"agg":{},"noTok":{},"drift":{},"applied":0,"masterHits":0,"textSkip":0,"errs":[]}');
for (; pos < pairs.length; pos++) {
  if (Date.now() - t0 > BUDGET) break;
  const [o, c, inM] = pairs[pos];
  await doPair(o, c, inM);
}
for (const [k, v] of agg) acc.agg[k] = (acc.agg[k] || 0) + v;
for (const [k, v] of drift) acc.drift[k] = (acc.drift[k] || 0) + v;
for (const [k, v] of noTok) acc.noTok[k] = (acc.noTok[k] || 0) + v;
acc.applied += applied; acc.masterHits += masterHits; acc.textSkip += textSkip; acc.errs = acc.errs.concat(errs).slice(0, 40);
if (pos < pairs.length) {
  O.setSharedPluginData('mig2', 'pos', String(pos)); O.setSharedPluginData('mig2', 'acc', JSON.stringify(acc));
  return { left: pairs.length - pos, of: pairs.length };
}
O.setSharedPluginData('mig2', 'pos', ''); O.setSharedPluginData('mig2', 'acc', '');
const top = m => Object.entries(m).sort((a, b) => b[1] - a[1]);
const aggT = top(acc.agg), noT = top(acc.noTok);
return {
  dry: DRY, pairs: st.pairs, missInCopy: st.missO, missEx: st.missOex, extraInCopy: st.extraC,
  diffs: aggT.reduce((s, x) => s + x[1], 0), applied: acc.applied, masterPairs: acc.masterHits, textLenDiff: acc.textSkip,
  errs: acc.errs, kinds: aggT.length, top: aggT.slice(0, 60).map(x => x[1] + '\t' + x[0]),
  drift: Object.keys(acc.drift).slice(0, 30), driftTotal: Object.keys(acc.drift).length,
  noTokTotal: noT.reduce((s, x) => s + x[1], 0), noTok: noT.slice(0, 20).map(x => x[1] + '\t' + x[0]),
};
