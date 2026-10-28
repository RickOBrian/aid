// persefona-9 (AID-84): отпечаток страницы идей «Зона без подачи». Только чтение.
// Запуск: use_figma, файл New Rider DEV 5mg6h0oB8yRDoUfTruogca. Один и тот же код — «до» и «после».
// Что считает:
//  - texts: тексты оболочки (вне клонов) + текстовые свойства экземпляров Kit, без начальных «→ », хэш;
//  - flows: стрелки (VECTOR «стрелка»): координаты вершин относительно корня, сегменты, концы — «связи до = после»;
//  - clones: 4 клона — id, имена и тексты всех узлов внутри, кроме слоёв «набросок · …», хэш;
//  - sketches: слои «набросок · …» — id и геометрия;
//  - raw: сырые заливки/обводки/тексты без стиля вне клонов и вне экземпляров Kit (после перевода должно быть 0).
const ROOT = '4302:11525';
const CLONES = ['4302:11528', '4302:11560', '4302:11602', '4302:12061'];
const h = s => { let x = 0x811c9dc5; for (const c of s) { x ^= c.codePointAt(0); x = Math.imul(x, 0x01000193) >>> 0; } return x.toString(16).padStart(8, '0'); };
const root = await figma.getNodeByIdAsync(ROOT);
const page = root.parent.type === 'PAGE' ? root.parent : root.parent.parent;
await figma.setCurrentPageAsync(page);
const isClone = n => { for (let p = n; p; p = p.parent) if (CLONES.includes(p.id)) return true; return false; };
const isSketch = n => /^набросок · /.test(n.name);
const all = page.findAll(() => true);
const shell = all.filter(n => !isClone(n) || isSketch(n));
const norm = s => s.replace(/^→ /, '');
const texts = [];
for (const n of shell) {
  if (n.type === 'TEXT' && !(n.parent && n.parent.type === 'INSTANCE') && !inInstance(n)) texts.push(norm(n.characters));
  if (n.type === 'INSTANCE' && !inInstance(n)) for (const [k, v] of Object.entries(n.componentProperties)) if (v.type === 'TEXT') texts.push(norm(v.value));
}
function inInstance(n) { for (let p = n.parent; p && p.type !== 'PAGE'; p = p.parent) if (p.type === 'INSTANCE') return true; return false; }
texts.sort();
const flows = all.filter(n => n.type === 'VECTOR' && n.name === 'стрелка').map(n => {
  // координаты — относительно корня 4302:11525: перенос корня в секцию их не меняет
  const t = n.absoluteTransform, r = root.absoluteTransform;
  const vs = n.vectorNetwork.vertices.map(v => [Math.round(t[0][0] * v.x + t[0][1] * v.y + t[0][2] - r[0][2]), Math.round(t[1][0] * v.x + t[1][1] * v.y + t[1][2] - r[1][2]), v.strokeCap || 'NONE']);
  return { id: n.id, v: vs, seg: n.vectorNetwork.segments.map(s => [s.start, s.end]), dashed: (n.dashPattern || []).length > 0 };
}).sort((a, b) => a.id < b.id ? -1 : 1);
const clones = CLONES.map(id => {
  const c = all.find(n => n.id === id);
  const inner = c.findAll(n => !isSketch(n)).map(n => n.id + '|' + n.name + '|' + (n.type === 'TEXT' ? n.characters : ''));
  return { id, w: c.width, h: c.height, n: inner.length, hash: h(inner.join('\n')) };
});
const sketches = all.filter(isSketch).map(n => ({ id: n.id, x: Math.round(n.x), y: Math.round(n.y), w: Math.round(n.width), h: Math.round(n.height), parent: n.parent.id }));
// сырые значения: краска без переменной, текст без стиля — вне клонов (наброски считаются) и вне экземпляров
const raw = [];
for (const n of shell) {
  if (n.type === 'INSTANCE' || inInstance(n)) continue;
  for (const prop of ['fills', 'strokes']) {
    const ps = n[prop]; if (!ps || ps === figma.mixed) continue;
    for (const p of ps) if (p.visible !== false && p.type === 'SOLID' && !(p.boundVariables && p.boundVariables.color)) raw.push(n.id + ' ' + prop);
  }
  if (n.type === 'TEXT' && !n.textStyleId) raw.push(n.id + ' text-style');
}
return {
  page: page.name, rootName: root.name,
  texts: { n: texts.length, hash: h(texts.join('\n')), list: texts },
  flows: { n: flows.length, hash: h(JSON.stringify(flows.map(f => [f.v, f.seg, f.dashed]))), list: flows },
  clones, clonesHash: h(clones.map(c => c.hash).join('')),
  sketches, raw: { n: raw.length, list: raw.slice(0, 80) },
};
