// Сверка оригинала Drafts с копией «— Switched Styles» (только чтение). Подставить __O__ (страница-оригинал) и __C__ (копия). Отчёт 23.11: mappings/drafts-run/originals-vs-copies-2026-11-23.md
const O = await figma.getNodeByIdAsync('__O__'), C = await figma.getNodeByIdAsync('__C__');
await O.loadAsync(); await C.loadAsync();
const CONT = new Set(['SECTION', 'GROUP']);
const T = t => t === 'COMPONENT' || t === 'COMPONENT_SET' ? 'INSTANCE' : t;
const N = s => s.replace(/^❌\s*/, '');
function items(page) {
  const out = [];
  const walk = (n, path, d) => {
    for (const k of n.children) {
      const isCont = CONT.has(k.type) && d < 3;
      const cnt = ('children' in k) ? k.findAllWithCriteria({ types: ['TEXT', 'FRAME'] }).length : 0;
      out.push({ id: k.id, name: N(k.name), type: T(k.type), x: Math.round(k.absoluteTransform[0][2]), y: Math.round(k.absoluteTransform[1][2]), w: Math.round(k.width), h: Math.round(k.height), path, cont: isCont, cnt, vis: k.visible });
      if (isCont) walk(k, path + '/' + N(k.name), d + 1);
    }
  };
  walk(page, '', 0);
  return out;
}
const o = items(O), c = items(C);
const idx = f => { const m = new Map(); for (const b of c) { const k = f(b); if (!m.has(k)) m.set(k, []); m.get(k).push(b); } return m; };
const K = [
  b => `${b.name}|${b.type}|${b.x}|${b.y}|${b.w}|${b.h}`,
  b => `${b.name}|${b.type}|${b.x}|${b.y}`,
  b => `${b.name}|${b.type}|${b.w}|${b.h}`,
  b => `${b.path}|${b.name}|${b.type}`,
];
const M = K.map(idx);
const used = new Set(), match = new Map();
for (let s = 0; s < K.length; s++) for (const a of o) {
  if (match.has(a.id)) continue;
  const b = (M[s].get(K[s](a)) || []).find(b => !used.has(b.id) && (s < 2 || a.cont || Math.abs(b.cnt - a.cnt) < 3 || a.type === 'TEXT'));
  if (b) { used.add(b.id); match.set(a.id, b); }
}
const added = o.filter(a => !match.has(a.id));
const addedSet = new Set(added.map(a => a.id));
// контейнер: сколько потомков-новых
const res = [];
for (const a of added) {
  const parentAdded = added.some(p => p.cont && (a.path + '/').startsWith(p.path + '/' + p.name + '/') && p.id !== a.id);
  if (parentAdded) continue;
  let extra = '';
  if (a.cont) { const pre = a.path + '/' + a.name + '/'; const kids = o.filter(k => (k.path + '/').startsWith(pre)); extra = `${kids.filter(k => addedSet.has(k.id)).length}/${kids.length}`; }
  res.push({ id: a.id, n: a.name.slice(0, 70), t: a.type, p: a.path, xy: [a.x, a.y], wh: [a.w, a.h], cnt: a.cnt, vis: a.vis, newKids: extra || undefined });
}
const changed = [];
for (const a of o) { const b = match.get(a.id); if (b && !a.cont && Math.abs(b.cnt - a.cnt) >= 5) changed.push({ o: a.id, c: b.id, n: a.name.slice(0, 40), p: a.path, oc: a.cnt, cc: b.cnt }); }
const onlyCopy = c.filter(b => !used.has(b.id)).map(b => ({ id: b.id, n: b.name.slice(0, 50), t: b.type, p: b.path }));
return { page: O.name, oItems: o.length, cItems: c.length, added: res, addedAll: added.length, changed: changed.slice(0, 30), changedCount: changed.length, onlyCopyCount: onlyCopy.length, onlyCopy: onlyCopy.slice(0, 20) };
