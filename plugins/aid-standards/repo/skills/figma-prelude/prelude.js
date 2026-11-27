// figma-prelude 0.1.0 · skills/figma-prelude/prelude.js — вставлять первым блоком кода use_figma.
// Узлы не меняет: объявляет функции и включает skipInvisibleInstanceChildren. Справка — SKILL.md §2.
// Занятые имена (свой const с таким именем — SyntaxError): SKILL.md §1.
figma.skipInvisibleInstanceChildren = true;

// узлы и пейджи
const byId = async (id, type) => {
  const n = await figma.getNodeByIdAsync(id);
  if (!n) throw new Error(`node ${id}: not found`);
  if (type && n.type !== type) throw new Error(`node ${id}: ${n.type}, expected ${type}`);
  return n;
};
const toPage = async id => { const p = await byId(id, 'PAGE'); await figma.setCurrentPageAsync(p); return p; };
const pageOf = n => { while (n && n.type !== 'PAGE') n = n.parent; return n; };
const one = (root, sel) => {
  const r = root.query(sel);
  if (r.length !== 1) throw new Error(`${sel}: ${r.length} matches, expected 1`);
  return r.first();
};
const walk = (root, fn) => { // fn синхронная; fn(n, depth) === false — не заходить в детей
  const st = [[root, 0]];
  while (st.length) {
    const [n, d] = st.pop();
    if (fn(n, d) === false || !('children' in n)) continue;
    for (let i = n.children.length - 1; i >= 0; i--) st.push([n.children[i], d + 1]);
  }
};
const box = n => n.absoluteBoundingBox; // null у невидимых
const overlaps = (a, b, gap = 0) => !!(a && b) &&
  a.x < b.x + b.width + gap && b.x < a.x + a.width + gap &&
  a.y < b.y + b.height + gap && b.y < a.y + a.height + gap;

// цвет и переменные
const h2 = v => Math.round(v * 255).toString(16).padStart(2, '0').toUpperCase();
const hex = (c, a = c.a ?? 1) => '#' + h2(c.r) + h2(c.g) + h2(c.b) + (h2(a) !== 'FF' ? h2(a) : '');
const _v = new Map();
const vget = async id => { if (!_v.has(id)) _v.set(id, await figma.variables.getVariableByIdAsync(id)); return _v.get(id); };
const vname = async id => (await vget(id))?.name ?? null;
const paints = async (n, key = 'fills') => { // [{type, hex, var}] | 'mixed' | []; var '?<id>' — привязка есть, имя не читается
  const ps = n[key];
  if (typeof ps === 'symbol') return 'mixed';
  const r = [];
  for (const p of ps || []) {
    if (p.visible === false) continue;
    const id = p.boundVariables?.color?.id;
    r.push({ type: p.type, hex: p.type === 'SOLID' ? hex(p.color, p.opacity ?? 1) : null, var: id ? (await vname(id)) ?? '?' + id : null });
  }
  return r;
};
const vhex = (v, n) => { // значение переменной глазами узла n (его режимы)
  const { value, resolvedType } = v.resolveForConsumer(n);
  return resolvedType === 'COLOR' ? hex(value) : value;
};
let _lib = null;
const _lv = new Map();
const vis = (v, name) => v.name === name || v.name.endsWith('/' + name); // полное имя или последний сегмент
const varByName = async (name, collection) => { // в файле, иначе в подключённых библиотеках (импорт)
  const loc = [];
  for (const v of await figma.variables.getLocalVariablesAsync()) {
    if (!vis(v, name)) continue;
    if (collection && (await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId))?.name !== collection) continue;
    loc.push(v);
  }
  if (loc.length === 1) return loc[0];
  if (loc.length > 1) throw new Error(`variable ${name}: ${loc.length} local matches, pass collection`);
  if (!_lib) _lib = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
  const hits = [];
  for (const c of _lib) {
    if (collection && c.name !== collection) continue;
    if (!_lv.has(c.key)) _lv.set(c.key, await figma.teamLibrary.getVariablesInLibraryCollectionAsync(c.key));
    for (const lv of _lv.get(c.key)) if (vis(lv, name)) hits.push(lv);
  }
  if (hits.length !== 1) throw new Error(`variable ${name}: ${hits.length} library matches${hits.length ? ', pass collection' : ''}`);
  return figma.variables.importVariableByKeyAsync(hits[0].key);
};
const bindPaint = (n, v, key = 'fills') => {
  n[key] = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', v)];
  return n.id;
};

// стили
const _s = new Map();
const sget = async id => { if (!id || typeof id === 'symbol') return null; if (!_s.has(id)) _s.set(id, await figma.getStyleByIdAsync(id)); return _s.get(id); };
const textStyle = async (name, root = figma.currentPage) => { // локальный, иначе уже применённый на root
  const loc = (await figma.getLocalTextStylesAsync()).find(s => s.name === name);
  if (loc) return loc;
  for (const t of root.findAllWithCriteria({ types: ['TEXT'] })) {
    const s = await sget(t.textStyleId);
    if (s && s.name === name) return s;
  }
  throw new Error(`text style ${name}: not found`);
};

// текст и шрифты
const _f = new Set();
const font = async f => { const k = f.family + '|' + f.style; if (!_f.has(k)) { await figma.loadFontAsync(f); _f.add(k); } };
const fonts = async root => { // грузит все шрифты текстов под root; вернёт число текстов и пропуски
  const ts = root.type === 'TEXT' ? [root] : root.findAllWithCriteria({ types: ['TEXT'] });
  const missing = [];
  for (const t of ts) {
    if (t.hasMissingFont) { missing.push(t.id); continue; }
    const fs = t.characters.length ? t.getRangeAllFontNames(0, t.characters.length) : [t.fontName];
    for (const f of fs) if (typeof f !== 'symbol') await font(f);
  }
  return { texts: ts.length, missing };
};
const setText = async (t, s) => {
  if (t.type !== 'TEXT') throw new Error(`setText ${t.id}: ${t.type}`);
  const { missing } = await fonts(t);
  if (missing.length) throw new Error(`setText ${t.id}: missing font`);
  t.characters = String(s);
  return t.id;
};

// создание: сначала в родителя, потом свойства (FILL/HUG требуют родителя)
const MK = ['Frame', 'AutoLayout', 'Text', 'Rectangle', 'Ellipse', 'Line'];
const mk = async (kind, props = {}, parent) => { // заливка Frame/AutoLayout по умолчанию снята (не сырой #FFFFFF)
  if (!MK.includes(kind)) throw new Error(`mk: kind ${kind}, expected ${MK.join('|')}`);
  const { dir, style, characters, ...rest } = props;
  const n = kind === 'AutoLayout' ? figma.createAutoLayout(dir || 'VERTICAL') : figma['create' + kind]();
  if (kind === 'Frame' || kind === 'AutoLayout') n.fills = [];
  if (parent) parent.appendChild(n);
  if (kind === 'Text') {
    await font(style ? style.fontName : n.fontName);
    if (rest.fontName) await font(rest.fontName);
    if (style) await n.setTextStyleIdAsync(style.id);
    if (characters != null) n.characters = String(characters);
  }
  if (Object.keys(rest).length) n.set(rest);
  return n;
};

// чтение
const dump = async (n, depth = 1, d = 0) => {
  const o = { id: n.id, name: n.name, type: n.type };
  if (n.type !== 'PAGE' && n.type !== 'DOCUMENT') {
    Object.assign(o, { x: Math.round(n.x), y: Math.round(n.y), w: Math.round(n.width), h: Math.round(n.height) });
    if (n.visible === false) o.hidden = true;
    if ('fills' in n) { const f = await paints(n); if (f === 'mixed' || f.length) o.fills = f === 'mixed' ? f : f.map(p => p.var || p.hex || p.type); }
    if ('strokes' in n && n.strokes.length) { const k = await paints(n, 'strokes'); o.strokes = k === 'mixed' ? k : k.map(p => p.var || p.hex || p.type); }
  }
  if (n.type === 'TEXT') { o.text = n.characters.slice(0, 80); o.style = (await sget(n.textStyleId))?.name ?? null; }
  if (n.type === 'INSTANCE') { const m = await n.getMainComponentAsync(); o.main = m ? (m.parent?.type === 'COMPONENT_SET' ? m.parent.name + ' / ' : '') + m.name : null; }
  if ('children' in n) {
    if (d < depth) { o.children = []; for (const c of n.children) o.children.push(await dump(c, depth, d + 1)); }
    else o.kids = n.children.length;
  }
  return o;
};
const ret = (o, max = 60000) => { // возврат с проверкой размера: больше max — ошибка, не обрезка
  const b = JSON.stringify(o).length;
  if (b > max) throw new Error(`return ${b} chars > ${max}: narrow the query`);
  return o;
};
// ── конец figma-prelude ──
