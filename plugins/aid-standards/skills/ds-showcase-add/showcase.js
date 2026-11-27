// ds-showcase-add 0.1.0 · skills/ds-showcase-add/showcase.js — меняет страницу Showcase.
// Вставлять ПОСЛЕ skills/figma-prelude/prelude.js (нужны byId, toPage, setText, ret).
// Перед вызовом заменить CONFIG. Правило — persefona-figma-pages §6.10, справка — SKILL.md.
// Вывод — JSON { mode, done[], warn[], missing[], orphans[] }.

const CONFIG = {
  MODE: '__MODE__',          // 'add' — карточка и строка одного компонента; 'sync' — значки и имена всех, отчёт
  PAGE_ID: '__PAGE_ID__',    // для 'add': id страницы компонента (сборка, readyfordev или зона 2)
  CATEGORY: '__CATEGORY__',  // для 'add': категория из component-categories-guide §2, как в таблице
  SECTION_GAP: 80,           // зазор между секциями (§6.3)
};

// component-categories-guide §2, порядок таблицы = порядок на витрине
const S_CATS = ['Controls', 'Inputs', 'Indicators', 'Media', 'Surfaces', 'Data display: metrics',
  'Data display: tabular', 'Navigation', 'Overlays', 'Layout', 'Feedback', 'Documentation utilities'];
const S_SERVICE = ['Cover', 'Showcase', 'Mapping', 'Маппинг', 'Doc blocks', 'Drafts', 'Archive', 'Thumbnail',
  'Обложка', 'Оформление', 'Черновики', 'Draft', 'Идеи', 'Архив', '_archive'];
if (!['add', 'sync'].includes(CONFIG.MODE) || (CONFIG.MODE === 'add' && (CONFIG.PAGE_ID.startsWith('__') || CONFIG.CATEGORY.startsWith('__'))))
  throw new Error('ds-showcase-add: CONFIG не заменён (MODE, PAGE_ID, CATEGORY)');
if (CONFIG.MODE === 'add' && !S_CATS.includes(CONFIG.CATEGORY))
  throw new Error(`ds-showcase-add: категория «${CONFIG.CATEGORY}» не из component-categories-guide §2: ${S_CATS.join(', ')}`);
const out = { mode: CONFIG.MODE, done: [], warn: [], missing: [], orphans: [] };

// Страница компонента → { object, status } или null, если ей нет места на витрине (§6.10).
const S_entry = name => {
  const raw = name.replace(/💬/g, '').replace(/\s+/g, ' ').trim();
  if (/^-{3,}$/.test(raw) || S_SERVICE.includes(raw) || /^(🔍 PRD audit|💡 PRD idea) · /.test(raw)) return null;
  let rest = raw, st = '';
  for (const s of ['✅', '🚧', '👀', '⚠️']) if (rest.startsWith(s + ' ')) { st = s; rest = rest.slice(s.length + 1); }
  const m = rest.match(/^(.+) · ([^·]+)$/);
  const object = m ? m[1] : rest, kind = m ? m[2] : null;
  if (kind === 'construction' && st === '🚧') return { object, status: '🚧' };
  if ((kind === 'construction' && st === '✅') || (kind === 'readyfordev' && st === '✅')) return { object, status: '✅' };
  if (!kind && (st === '' || st === '⚠️')) return { object, status: '✅', zone2: true, outdated: st === '⚠️' };
  return null; // аудит, update, proposals, Drafts, значок не по §5
};
const S_key = s => s.toLowerCase();
const S_letter = s => { const c = s.trim()[0]?.toUpperCase() || '#'; return /\p{L}/u.test(c) ? c : '#'; };

// ── разметка страницы Showcase ───────────────────────────────────────────────
const S_page = figma.root.children.find(p => p.name.trim() === 'Showcase');
if (!S_page) throw new Error('нет страницы `Showcase` — сначала Designer · Persefona собирает её по §6.10');
await figma.setCurrentPageAsync(S_page);
const S_one = (root, name, type) => {
  const r = root.findAll(n => n.name === name && (!type || n.type === type));
  if (r.length !== 1) throw new Error(`Showcase: «${name}» — ${r.length} узлов, ждём 1 (§6.10)`);
  return r[0];
};
const S_sec = name => { const r = S_page.findChildren(n => n.type === 'SECTION' && n.name === name); if (r.length !== 1) throw new Error(`Showcase: секция «${name}» — ${r.length}, ждём 1 (§6.10)`); return r[0]; };
const secBC = S_sec('By category');
const secAZ = S_sec('A–Z');
const boxCats = S_one(secBC, 'Categories');
const boxIdx = S_one(secAZ, 'Index');
const tpls = S_one(secBC, '_templates');
const T = { cat: S_one(tpls, 'Category · _template'), card: S_one(tpls, 'Card · _template'),
  letter: S_one(tpls, 'Letter · _template'), row: S_one(tpls, 'Row · _template') };
// Поиск внутри своей разметки, не заходя в экземпляры (в Preview — мастер компонента со своими слоями).
const own = (root, pred) => { let r = null; walk(root, n => { if (r) return false; if (n !== root && pred(n)) { r = n; return false; } if (n !== root && n.type === 'INSTANCE') return false; }); return r; };
const txt = (n, name) => n.type === 'TEXT' ? n : own(n, c => c.type === 'TEXT' && (!name || c.name === name));
const linkOf = n => { // id страницы из гиперссылки текста
  const t = n && txt(n, n.type === 'TEXT' ? null : 'Name');
  if (!t) return null;
  try { return t.getStyledTextSegments(['hyperlink']).find(s => s.hyperlink?.type === 'NODE')?.hyperlink.value ?? null; } catch (e) { return null; }
};
const cards = () => boxCats.findAll(n => /^Card · /.test(n.name) && n.parent?.name === 'Cards');
const rows = () => boxIdx.findAll(n => /^Row · /.test(n.name) && /^Letter · /.test(n.parent?.name || ''));

// Текст «<значок> <Компонент>», ссылка — только на имени (§6.10).
const label = async (t, e, pageId) => {
  const s = `${e.status} ${e.object}`;
  await setText(t, s);
  t.setRangeHyperlink(0, s.length, null);
  t.setRangeHyperlink(e.status.length + 1, s.length, { type: 'NODE', value: pageId });
};
const sortedInsert = (parent, node, key, skip = () => false) => {
  parent.appendChild(node); // сначала в конец: индекс after ниже не зависит от прежнего места node
  const after = parent.children.find(c => c !== node && !skip(c) && S_key(key(c)).localeCompare(S_key(key(node))) > 0);
  if (after) parent.insertChild(parent.children.indexOf(after), node);
};
const objOf = n => n.name.replace(/^(Card|Row|Letter|Category) · /, '');

// Превью: экземпляр мастера (вариант по умолчанию), уменьшенный до поля Preview.
const mainOf = async (pg, object) => {
  await pg.loadAsync();
  const hits = pg.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] })
    .filter(n => n.name === object && !(n.type === 'COMPONENT' && n.parent?.type === 'COMPONENT_SET'));
  return hits.length === 1 ? hits[0] : null;
};
const preview = async (card, pg, object) => {
  const pv = own(card, n => n.name === 'Preview');
  if (!pv) throw new Error(`${card.name}: нет рамки Preview (шаблон §6.10)`);
  if (pv.children.length) return false;
  const W = pv.width, H = pv.height; // размер поля до вставки: Preview фиксированного размера (§6.10)
  const m = await mainOf(pg, object);
  if (!m) { out.warn.push(`${object}: мастера «${object}» на странице нет — превью пустое, поставит sync`); return false; }
  const inst = (m.type === 'COMPONENT_SET' ? m.defaultVariant : m).createInstance();
  pv.appendChild(inst);
  const pad = pv.layoutMode !== 'NONE' ? Math.max(pv.paddingLeft + pv.paddingRight, pv.paddingTop + pv.paddingBottom) : 0;
  const k = Math.min((W - pad) / inst.width, (H - pad) / inst.height, 1);
  if (k < 1) inst.rescale(k);
  if (pv.layoutMode === 'NONE') { inst.x = (W - inst.width) / 2; inst.y = (H - inst.height) / 2; }
  return true;
};

// Категория: рамка Category · <Категория> по порядку S_CATS.
const catBox = async cat => {
  let c = boxCats.children.find(n => n.name === 'Category · ' + cat);
  if (c) return c;
  c = T.cat.clone(); c.name = 'Category · ' + cat; c.visible = true;
  await setText(txt(c, 'Title'), cat);
  for (const k of [...(own(c, n => n.name === 'Cards')?.children || [])]) k.remove(); // образцы шаблона
  boxCats.appendChild(c);
  const after = boxCats.children.find(n => n !== c && S_CATS.indexOf(objOf(n)) > S_CATS.indexOf(cat));
  if (after) boxCats.insertChild(boxCats.children.indexOf(after), c);
  return c;
};
const letterBox = async L => {
  let b = boxIdx.children.find(n => n.name === 'Letter · ' + L);
  if (b) return b;
  b = T.letter.clone(); b.name = 'Letter · ' + L; b.visible = true;
  await setText(txt(b, 'Letter'), L);
  for (const r of b.children.filter(n => /^Row · /.test(n.name))) r.remove(); // строки-образцы шаблона
  sortedInsert(boxIdx, b, objOf);
  return b;
};
const dropEmpty = () => {
  for (const c of boxCats.children.filter(n => /^Category · /.test(n.name))) if (!(own(c, n => n.name === 'Cards')?.children || []).some(k => /^Card · /.test(k.name))) c.remove();
  for (const b of boxIdx.children.filter(n => /^Letter · /.test(n.name))) if (!b.children.some(n => /^Row · /.test(n.name))) b.remove();
};

// Карточка и строка одного компонента: создать или обновить, поставить по алфавиту.
const place = async (pg, e, cat) => {
  let row = rows().find(n => linkOf(n) === pg.id);
  if (row || cat) { // строка — отдельно от карточки: в sync обновляется и без карточки
    if (!row) { row = T.row.clone(); row.visible = true; }
    row.name = 'Row · ' + e.object;
    await label(txt(row, 'Name'), e, pg.id);
    sortedInsert(await letterBox(S_letter(e.object)), row, objOf, c => !/^Row · /.test(c.name));
  }
  let card = cards().find(n => linkOf(n) === pg.id);
  const isNew = !card;
  if (isNew) { if (!cat) return 'missing'; card = T.card.clone(); card.visible = true; }
  card.name = 'Card · ' + e.object;
  await label(txt(card, 'Name'), e, pg.id);
  if (cat || isNew) {
    const cb = await catBox(cat);
    const cs = own(cb, n => n.name === 'Cards');
    if (card.parent !== cs) sortedInsert(cs, card, objOf);
  }
  sortedInsert(card.parent, card, objOf);
  await preview(card, pg, e.object);

  if (e.outdated) out.warn.push(`${e.object}: страница ⚠️ — на витрине ✅ до ответа PD (§8, вопрос 13)`);
  return isNew ? 'added' : 'updated';
};

// Секции под содержимое (§6.3): By category слева, A–Z справа верх к верху, зазор 80.
const fit = s => {
  const kids = s.children.filter(n => n.visible !== false);
  if (!kids.length) return;
  const pad = Math.min(...kids.map(n => Math.min(n.x, n.y)));
  const w = Math.max(...kids.map(n => n.x + n.width)) + pad, h = Math.max(...kids.map(n => n.y + n.height)) + pad;
  s.resizeWithoutConstraints(w, h);
};
const layout = () => { fit(secBC); fit(secAZ); secAZ.x = secBC.x + secBC.width + CONFIG.SECTION_GAP; secAZ.y = secBC.y; };

// ══ add ═════════════════════════════════════════════════════════════════════
if (CONFIG.MODE === 'add') {
  const pg = await byId(CONFIG.PAGE_ID, 'PAGE');
  const e = S_entry(pg.name);
  if (!e) throw new Error(`страница «${pg.name}» — не сборка, не readyfordev и не зона 2: на витрину не идёт (§6.10)`);
  const r = await place(pg, e, CONFIG.CATEGORY);
  dropEmpty(); layout();
  out.done.push({ page: pg.name, pageId: pg.id, result: r, category: CONFIG.CATEGORY, status: e.status });
}

// ══ sync — значки, имена, превью и порядок всех; missing — без карточки ═════
if (CONFIG.MODE === 'sync') {
  const pages = figma.root.children;
  const seen = new Set();
  for (const pg of pages) {
    const e = S_entry(pg.name);
    if (!e) continue;
    seen.add(pg.id);
    const hasRow = rows().some(n => linkOf(n) === pg.id);
    const r = await place(pg, e, null);
    if (r === 'missing') out.missing.push({ page: pg.name, pageId: pg.id, zone2: !!e.zone2, row: hasRow });
    else out.done.push({ page: pg.name, pageId: pg.id, result: r, status: e.status });
  }
  for (const n of [...cards(), ...rows()]) {
    const id = linkOf(n);
    if (!id || !seen.has(id)) {
      const tg = id && await figma.getNodeByIdAsync(id);
      out.orphans.push({ node: n.id, name: n.name, target: id, why: !id ? 'нет ссылки' : !tg ? 'страница удалена' : `«${tg.name}» не для витрины` });
    }
  }
  dropEmpty(); layout();
}
return ret(out);
