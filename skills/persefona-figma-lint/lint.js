// persefona-figma-lint 0.1.0 · skills/persefona-figma-lint/lint.js — только чтение.
// Вставлять ПОСЛЕ skills/figma-prelude/prelude.js (нужны byId, toPage, pageOf, walk, box,
// overlaps, paints, sget, ret). Перед вызовом заменить CONFIG. Справка и коды — SKILL.md.
// Вывод — JSON { meta, findings[{code, level, page, pageId, node, name, msg, fix}], pages? }.

const CONFIG = {
  MODE: '__MODE__',           // 'file' — список страниц и Cover; 'page' — одна страница
  PAGE_ID: '__PAGE_ID__',     // для 'page'
  PRODUCT: '__PRODUCT__',     // 'rider' | 'driver' | 'persefona'
  KIND: '__KIND__',           // 'components' | 'tokens' | 'icons' | 'mockups'
  LIBRARY_FOLDER: true,       // файл из папки библиотек 638447836: латиница в именах (§1, §4.1)
  MAPPING_MERGED: false,      // PR #365 слит: страница `Mapping`; до него `Маппинг` (§4.3)
  LINE_SCENE: false,          // PR #524 слит: у клона на холсте — рамка line-scene (§6.3)
  SECTION_GAP: 80,            // зазор между секциями (§6.3)
  RAW_OK: [],                 // имена узлов, у которых сырой цвет принят записью (regex-строки)
  CAP: 20,                    // примеров на код в выводе; счёт — полный
};

if (!['file', 'page'].includes(CONFIG.MODE) || CONFIG.PRODUCT.startsWith('__') || CONFIG.KIND.startsWith('__') || (CONFIG.MODE === 'page' && CONFIG.PAGE_ID.startsWith('__')))
  throw new Error('persefona-figma-lint: CONFIG не заменён (MODE, PRODUCT, KIND, PAGE_ID)');
const L_out = { meta: { mode: CONFIG.MODE, product: CONFIG.PRODUCT, kind: CONFIG.KIND }, findings: [] };
const L_cnt = {};
const L_add = (code, level, pg, node, msg, fix) => {
  L_cnt[code] = (L_cnt[code] || 0) + 1;
  if (L_cnt[code] > CONFIG.CAP) return;
  L_out.findings.push({ code, level, page: pg ? pg.name : null, pageId: pg ? pg.id : null,
    node: node ? node.id : null, name: node ? String(node.name).slice(0, 60) : null, msg, fix });
};
const L_CYR = /[А-Яа-яЁё]/;
const L_SERVICE = ['Cover', 'Mapping', 'Маппинг', 'Doc blocks', 'Drafts', 'Archive', 'Thumbnail'];
const L_OLD = { 'Обложка': 'Cover', 'Оформление': 'Doc blocks', 'Черновики': 'Drafts', 'Draft': 'Drafts',
  'Идеи': 'Drafts', 'Архив': 'Archive', '_archive': 'Archive' };
const L_KINDS = ['audit', 'construction', 'update', 'readyfordev', 'proposals', 'правка', 'предложения'];
const L_STATUS = ['✅', '🚧', '👀', '⚠️'];
const L_WORD = { '': 'Принято', '⚠️': 'Устарело', '🚧': 'В работе', '👀': 'Смотреть и решать', '✅': 'Готово к разработке' };

// Разбор имени страницы по §4.1: 💬 снимается (§5), PRD-страницы — §6.7, §6.8.
const L_parse = name => {
  const raw = name.replace(/💬/g, '').replace(/\s+/g, ' ').trim();
  const r = { raw, status: '', object: raw, kind: null, prd: null, service: null, old: null };
  let m = raw.match(/^(🔍 PRD audit|💡 PRD idea) · (.+)$/);
  if (m) { r.prd = m[1].startsWith('🔍') ? 'audit' : 'idea'; r.object = m[2]; return r; }
  if (L_SERVICE.includes(raw)) { r.service = raw; return r; }
  if (L_OLD[raw]) { r.old = L_OLD[raw]; return r; }
  let rest = raw;
  const st = L_STATUS.find(s => rest.startsWith(s + ' '));
  if (st) { r.status = st; rest = rest.slice(st.length + 1); }
  m = rest.match(/^(.+) · ([^·]+)$/);
  if (m) { r.object = m[1]; r.kind = m[2]; } else r.object = rest;
  return r;
};
// Зона страницы по её имени (§3): 0 готово, 1 служебное, 2 библиотека, 3 в работе, 4 архив, 5 миниатюра.
const L_zone = p => {
  if (p.prd) return 'prd';
  if (['Cover', 'Mapping', 'Маппинг', 'Doc blocks'].includes(p.service || p.old)) return 1;
  if ((p.service || p.old) === 'Archive') return 4;
  if (p.service === 'Thumbnail') return 5;
  if ((p.service || p.old) === 'Drafts') return 3;
  if (p.kind === 'readyfordev') return 0;
  if (p.kind || p.status === '🚧' || p.status === '👀' || p.status === '✅') return 3;
  return 2;
};
const L_key = s => s.toLowerCase();
const L_sorted = arr => arr.every((x, i) => i === 0 || L_key(arr[i - 1]).localeCompare(L_key(x)) <= 0);

// ══ MODE file — список страниц, зоны, порядок, имена, Cover ═════════════════
if (CONFIG.MODE === 'file') {
  const all = figma.root.children;
  const pages = all.map((pg, i) => ({ pg, i, div: !!pg.isPageDivider || /^-{3,}$/.test(pg.name.trim()) }));
  for (const x of pages) if (!x.div) { x.p = L_parse(x.pg.name); x.z = L_zone(x.p); }
  L_out.pages = pages.map(x => ({ id: x.pg.id, name: x.pg.name, zone: x.div ? '---' : x.z }));

  // L1 грамматика имени и словарь
  const L_icons = {};
  for (const x of pages.filter(x => !x.div)) {
    const { p, pg } = x;
    if (p.old) { L_add('L1', 'error', pg, null, `старое служебное имя «${p.raw}»`, `переименовать в \`${p.old}\` (§4.3)`); continue; }
    if (p.service === 'Mapping' && !CONFIG.MAPPING_MERGED) L_add('L1', 'error', pg, null, '`Mapping` до мержа #365 — плагин создаст вторую страницу', 'вернуть `Маппинг` (§4.3)');
    if (p.service === 'Маппинг' && CONFIG.MAPPING_MERGED) L_add('L1', 'warn', pg, null, '`Маппинг` после мержа #365', 'переименовать в `Mapping` (§4.3)');
    if (p.service || p.prd) continue;
    const icons = [...pg.name.replace(/💬/g, '').matchAll(/\p{Extended_Pictographic}/gu)].map(m => m[0]);
    if (icons.length > 1 || (icons.length === 1 && !p.status)) for (const ic of icons.filter(ic => !L_STATUS.includes(ic) && ic !== '⚠')) (L_icons[ic] = L_icons[ic] || []).push(pg.name);
    if (p.kind && !L_KINDS.includes(p.kind)) {
      const to = { 'аудит': 'audit', 'сборка': 'construction', build: 'construction' }[p.kind];
      L_add('L1', 'error', pg, null, `вид «${p.kind}» не из словаря`, to ? `переименовать вид в \`${to}\` (§4.2)` : 'вид — из §4.2 или ` · ` убрать из имени объекта (§4.1)');
    }
    if (CONFIG.LIBRARY_FOLDER && L_CYR.test(p.object)) L_add('L1', 'error', pg, null, `кириллица в имени объекта «${p.object}»`, 'латиница, как в библиотеке (§4.1)');
    if (/[:/()]/.test(p.object) || /\d+\.\d+/.test(p.object)) L_add('L1', 'error', pg, null, 'в имени двоеточие, слэш, скобки или версия', 'только `[статус ]Объект[ · вид]` (§4.1)');
    if (L_SERVICE.includes(p.object)) L_add('L1', 'error', pg, null, `объект совпадает со служебным именем «${p.object}»`, 'переименовать объект (§4.1)');
  }

  for (const [ic, names] of Object.entries(L_icons)) L_add('L1', 'error', null, null, `значок ${ic} не из §5 — страниц ${names.length}: ${names.slice(0, 5).join(' | ')}${names.length > 5 ? ' …' : ''}`, 'снять значок или заменить значком §5; файл не по правилу — перевод по §10');
  // L2 значок ↔ вид ↔ тип файла (§5)
  for (const x of pages.filter(x => !x.div && !x.p.service && !x.p.old && !x.p.prd)) {
    const { p, pg } = x;
    const fix = s => `${s} (§5)`;
    if (p.kind === 'audit' && p.status !== '👀') L_add('L2', 'error', pg, null, `у аудита значок «${p.status || 'нет'}»`, fix('👀'));
    if (p.kind === 'construction' && !['🚧', '✅'].includes(p.status)) L_add('L2', 'error', pg, null, `у сборки значок «${p.status || 'нет'}»`, fix('🚧, после приёмки ✅'));
    if (p.kind === 'readyfordev' && p.status !== '✅') L_add('L2', 'error', pg, null, `у readyfordev значок «${p.status || 'нет'}»`, fix('✅'));
    if (['update', 'proposals', 'правка', 'предложения'].includes(p.kind) && p.status !== '🚧') L_add('L2', 'error', pg, null, `у ${p.kind} значок «${p.status || 'нет'}»`, fix('🚧'));
    if (p.status === '✅' && !['construction', 'readyfordev'].includes(p.kind)) L_add('L2', 'error', pg, null, '✅ не у construction и не у readyfordev', fix('✅ только у принятой сборки'));
    if (p.status === '✅' && CONFIG.KIND !== 'components') L_add('L2', 'error', pg, null, '✅ и readyfordev вне файла компонентов', fix('только в файлах компонентов (PD 2026-10-30)'));
    if (!p.kind && ['🚧', '👀'].includes(p.status)) L_add('L2', 'error', pg, null, `${p.status} без вида`, 'добавить вид из §4.2 или снять значок (§4.1)');
  }

  // L3 зоны: порядок, разделители, пустые зоны, смешанные группы (§3)
  const groups = [[]];
  for (const x of pages) { if (x.div) groups.push([]); else groups[groups.length - 1].push(x); }
  if (groups.some(g => !g.length)) L_add('L3', 'error', null, null, 'пустая группа между разделителями `---` (или разделитель первым/последним)', 'убрать лишний `---` (§3)');
  let last = -1;
  for (const g of groups.filter(g => g.length)) {
    const zs = [...new Set(g.map(x => x.z).filter(z => z !== 'prd'))];
    if (zs.length > 1) L_add('L3', 'error', g[0].pg, null, `в одной группе страницы зон ${zs.join(', ')}: ${g.map(x => x.pg.name).join(' | ')}`, 'между зонами — `---` (§3)');
    const z = Math.min(...zs);
    if (zs.length && z <= last) L_add('L3', 'error', g[0].pg, null, `зона ${z} после зоны ${last}`, 'порядок зон 0–5 (§3)');
    if (zs.length) last = Math.max(last, ...zs);
  }
  const named = pages.filter(x => !x.div);
  const lib = CONFIG.KIND !== 'mockups';
  if (lib) {
    const first = named.find(x => x.z !== 0);
    if (!first || first.p.service !== 'Cover') L_add('L3', 'error', first?.pg, null, 'первая после зоны 0 страница — не `Cover`', '`Cover` сразу после зоны 0 (§3, §4.3)');
    const lastP = all[all.length - 1];
    if (!named.length || named[named.length - 1].p.service !== 'Thumbnail' || named[named.length - 1].pg !== lastP) L_add('L3', 'error', lastP, null, 'последняя страница — не `Thumbnail`', '`Thumbnail` последней, перед ней `---` (§3)');
    else if (!pages[pages.length - 2]?.div) L_add('L3', 'error', lastP, null, 'перед `Thumbnail` нет `---`', 'Add divider перед `Thumbnail` (§3)');
    if (named.filter(x => x.p.service === 'Cover').length > 1) L_add('L3', 'error', null, null, 'две страницы `Cover`', 'одна обложка (§6.1)');
    if (named.some(x => x.z === 0) && CONFIG.KIND !== 'components') L_add('L3', 'error', null, null, 'зона 0 вне файла компонентов', 'readyfordev — только в компонентах (§5)');
  }
  // L4 порядок внутри зон (§3, §6.4, §6.4.1)
  const z0 = named.filter(x => x.z === 0).map(x => x.p.object);
  if (!L_sorted(z0)) L_add('L4', 'error', null, null, `зона 0 не по алфавиту: ${z0.join(', ')}`, 'по алфавиту имени компонента (§3)');
  if (named.length && named[0].z !== 0 && z0.length) L_add('L4', 'error', named[0].pg, null, 'зона 0 не на самом верху', 'readyfordev — первыми (§3)');
  const z2 = named.filter(x => x.z === 2);
  if (CONFIG.KIND === 'components' || CONFIG.KIND === 'icons') {
    const objs = z2.map(x => x.p.object);
    if (!L_sorted(objs)) L_add('L4', 'error', null, null, `зона 2 не по алфавиту: ${objs.join(', ')}`, 'по алфавиту, ⚠️ не учитывается (§6.4)');
  } else if (CONFIG.KIND === 'tokens') {
    const ORDER = CONFIG.PRODUCT === 'persefona' ? ['Colors', 'Space and Radius', 'Typography', 'Shadows']
      : ['Colors', 'Gradients', 'Typography', 'Shadows', 'Glass', 'Space', 'Radius'];
    const idx = z2.map(x => ORDER.indexOf(x.p.object)).filter(i => i >= 0);
    if (idx.some((v, i) => i && idx[i - 1] > v)) L_add('L4', 'error', null, null, `зона 2 токенов не по порядку: ${z2.map(x => x.p.object).join(', ')}`, `порядок ${ORDER.join(', ')} (§6.4)`);
    for (const x of z2) if (!ORDER.includes(x.p.object)) L_add('L4', 'warn', x.pg, null, `страница «${x.p.object}» не из списка токенов ${CONFIG.PRODUCT}`, 'имя — из §6.4 или страница не в зоне 2');
  }
  const rank = q => q.service === 'Drafts' || q.old === 'Drafts' ? [4, 0] : q.kind === 'construction' ? [1, 0] : q.kind === 'audit' ? [2, 0]
    : [3, ['proposals', 'предложения'].includes(q.kind) ? 1 : 0];
  const z3 = named.filter(x => x.z === 3);
  for (let i = 1; i < z3.length; i++) {
    const a = z3[i - 1].p, b = z3[i].p, ra = rank(a), rb = rank(b);
    const bad = ra[0] > rb[0] || (ra[0] === rb[0] && (ra[1] > rb[1] || (ra[1] === rb[1] && L_key(a.object).localeCompare(L_key(b.object)) > 0)));
    if (bad) L_add('L4', 'error', z3[i].pg, null, `«${z3[i - 1].pg.name}» перед «${z3[i].pg.name}»`, 'сборки → аудиты → update → proposals → Drafts, внутри по алфавиту компонента (§6.4.1)');
  }
  // L5 пары страниц: сборка и аудит одного компонента (§7.1)
  const cons = new Set(named.filter(x => ['construction', 'readyfordev'].includes(x.p.kind)).map(x => L_key(x.p.object)));
  for (const x of named.filter(x => x.p.kind === 'audit' && cons.has(L_key(x.p.object))))
    L_add('L5', 'error', x.pg, null, 'отдельная страница аудита у компонента со сборкой', 'аудит — секцией `<Компонент> · audit` на странице сборки, узлы с прежними id (§7.1)');
  // L6 PRD-страницы в конце файла (§6.7, §6.8)
  const firstPrd = named.findIndex(x => x.z === 'prd');
  if (firstPrd >= 0 && named.slice(firstPrd).some(x => x.z !== 'prd')) L_add('L6', 'error', named[firstPrd].pg, null, 'после страниц PRD есть другие', 'PRD audit и PRD idea — в конце файла (§6.7, §6.8)');
  if (lib && firstPrd >= 0) L_add('L6', 'warn', named[firstPrd].pg, null, 'страница PRD в файле библиотеки', 'PRD-страницы — в файле макетов (§1)');

  // L7 Thumbnail: обложка файла стоит на странице Thumbnail (§4.3)
  try {
    const th = await figma.getFileThumbnailNodeAsync();
    if (th && pageOf(th)?.name !== 'Thumbnail') L_add('L7', 'warn', pageOf(th), th, 'миниатюра файла не на странице `Thumbnail`', 'фрейм на `Thumbnail`, Set as thumbnail (§4.3)');
  } catch (e) {}

  // L8 Persefona: в Components нет своих переменных и стилей (§9, §10.4)
  if (CONFIG.PRODUCT === 'persefona' && CONFIG.KIND === 'components') {
    const nv = (await figma.variables.getLocalVariablesAsync()).length;
    const ns = (await figma.getLocalPaintStylesAsync()).length + (await figma.getLocalTextStylesAsync()).length + (await figma.getLocalEffectStylesAsync()).length;
    if (nv || ns) L_add('L8', 'error', null, null, `в Components свои переменные (${nv}) или стили (${ns})`, 'переменные и стили — только в Tokens (§10.4)');
  }

  // L9 содержание Cover: все страницы зон 0, 2, 3 по порядку файла, гиперссылками (§6.1)
  const cover = named.find(x => x.p.service === 'Cover');
  if (cover) {
    await figma.setCurrentPageAsync(cover.pg);
    const linked = [];
    const ctexts = cover.pg.findAllWithCriteria({ types: ['TEXT'] }).filter(t => box(t)).sort((a, b) => box(a).y - box(b).y || box(a).x - box(b).x);
    for (const t of ctexts) {
      let segs = []; try { segs = t.getStyledTextSegments(['hyperlink']); } catch (e) { continue; }
      for (const sg of segs) {
        if (sg.hyperlink?.type !== 'NODE') continue;
        const tg = await figma.getNodeByIdAsync(sg.hyperlink.value);
        if (!tg) { L_add('L9', 'error', cover.pg, t, `ссылка «${sg.characters.slice(0, 30)}» на удалённый узел ${sg.hyperlink.value}`, 'поставить ссылку заново (§6.1, §6.2)'); continue; }
        const tp = pageOf(tg);
        if (tp && tp.id !== cover.pg.id) linked.push(tp.id);
      }
    }
    const want = named.filter(x => [0, 2, 3].includes(x.z)).map(x => x.pg);
    const seq = linked.filter((id, i) => linked.indexOf(id) === i);
    if (!seq.length && want.length) L_add('L9', 'error', cover.pg, null, `в содержании нет ни одной гиперссылки на страницу (ждём ${want.length})`, 'у каждой строки — гиперссылка на страницу (§6.1)');
    else for (const pg of want) if (!seq.includes(pg.id)) L_add('L9', 'error', cover.pg, null, `в содержании нет гиперссылки на «${pg.name}»`, 'строка со статусом и ссылкой на страницу (§6.1)');
    const extra = seq.filter(id => !want.some(pg => pg.id === id));
    for (const id of extra) { const pg = all.find(p => p.id === id); L_add('L9', 'warn', cover.pg, null, `содержание ссылается на «${pg?.name}» вне зон 0, 2, 3`, 'в содержании — только зоны 0, 2, 3 (§6.1)'); }
    const inWant = seq.filter(id => want.some(pg => pg.id === id));
    const order = want.filter(pg => inWant.includes(pg.id)).map(pg => pg.id);
    if (inWant.join() !== order.join()) L_add('L9', 'error', cover.pg, null, 'порядок содержания не совпадает с порядком страниц', 'обновить содержание по списку страниц (§6.1)');
  }
  L_out.next = named.filter(x => [0, 2, 3].includes(x.z) || x.z === 'prd' || ['Cover', 'Archive'].includes(x.p.service)).map(x => x.pg.id);
}

// ══ MODE page — содержимое одной страницы ═══════════════════════════════════
if (CONFIG.MODE === 'page') {
  const pg = await toPage(CONFIG.PAGE_ID);
  const p = L_parse(pg.name), z = L_zone(p);
  const canvas = !!p.prd || /^(🔧 Tech audit|💡 Tech idea) · |^(Flow|Where)\b/.test(p.raw);
  L_out.meta.page = pg.name; L_out.meta.zone = z; L_out.meta.type = canvas ? 'canvas' : 'document';
  const rawOk = CONFIG.RAW_OK.map(s => new RegExp(s));
  const lum = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };

  // L10 вне секций ничего нет; секции не пересекаются; зазор 80 (§6.3)
  const secs = pg.children.filter(n => n.type === 'SECTION');
  for (const n of pg.children) if (n.type !== 'SECTION') L_add('L10', 'error', pg, n, `узел ${n.type} вне секции`, 'перенести в секцию (§6.3)');
  for (let i = 0; i < secs.length; i++) for (let j = i + 1; j < secs.length; j++) {
    const a = box(secs[i]), b = box(secs[j]);
    if (!a || !b) continue;
    if (overlaps(a, b)) L_add('L10', 'error', pg, secs[j], `секция пересекается с «${secs[i].name}»`, 'раздвинуть, зазор 80 (§6.3)');
    else if (overlaps(a, b, CONFIG.SECTION_GAP - 0.5)) L_add('L10', 'error', pg, secs[j], `зазор до «${secs[i].name}» меньше ${CONFIG.SECTION_GAP}`, 'сдвинуть секции справа и ниже (§6.3, PD 2026-11-09)');
  }
  // L11 узлы не выходят за рамку своей секции, вложенные секции тоже (§6.3)
  const inside = (c, s) => c.x >= s.x - 0.5 && c.y >= s.y - 0.5 && c.x + c.width <= s.x + s.width + 0.5 && c.y + c.height <= s.y + s.height + 0.5;
  walk(pg, n => {
    if (n.type !== 'SECTION') return n.type === 'PAGE';
    const sb = box(n); if (!sb) return false;
    for (const c of n.children) { const cb = c.absoluteRenderBounds || box(c); if (cb && !inside(cb, sb)) L_add('L11', 'error', pg, c, `выходит за секцию «${n.name}»`, 'увеличить секцию и сдвинуть соседние (§6.3)'); }
    const inner = n.children.filter(c => c.type === 'SECTION');
    for (let i = 0; i < inner.length; i++) for (let j = i + 1; j < inner.length; j++) if (overlaps(box(inner[i]), box(inner[j]))) L_add('L11', 'error', pg, inner[j], `вложенная секция пересекается с «${inner[i].name}»`, 'раздвинуть (§6.3)');
  });

  // L12 фон секции по типу страницы (§6.3)
  const wantBg = canvas ? 'bg-surface-muted' : 'bg-surface-main';
  for (const s of secs) {
    const ps = await paints(s);
    const v = ps === 'mixed' ? null : ps.find(x => x.type === 'SOLID');
    if (!v) L_add('L12', 'error', pg, s, 'у секции нет заливки', `\`${wantBg}\` (§6.3)`);
    else if (!v.var) L_add('L12', 'error', pg, s, `фон секции — голый цвет ${v.hex}`, `\`${wantBg}\` (§6.3)`);
    else if (v.var.startsWith('?')) L_add('L12', 'info', pg, s, `фон на переменной без имени ${v.var} (библиотека не подключена)`, `проверить глазами: \`${wantBg}\``);
    else if (!v.var.endsWith(wantBg)) L_add('L12', 'error', pg, s, `фон секции ${v.var}, страница — ${canvas ? 'холст экранов' : 'документ'}`, `\`${wantBg}\` (§6.3)`);
  }

  // Клоны экранов на холсте: прямые дети секции, не экземпляры Kit и не тексты.
  const clones = new Set();
  if (canvas) for (const s of secs) for (const c of s.children) if (['FRAME', 'GROUP', 'COMPONENT', 'COMPONENT_SET'].includes(c.type)) clones.add(c.id);
  // L13 рамка line-scene позади клона (§6.3, после #524)
  if (canvas && CONFIG.LINE_SCENE) for (const s of secs) for (let i = 0; i < s.children.length; i++) {
    const c = s.children[i]; if (!clones.has(c.id)) continue;
    const cb = box(c); if (!cb) continue; let ok = false;
    for (const r of s.children.slice(0, i)) { if (r.type !== 'RECTANGLE') continue; const rb = box(r); if (!rb) continue;
      if (Math.abs(rb.x - cb.x + 1) < 0.6 && Math.abs(rb.width - cb.width - 2) < 0.6 && Math.abs(rb.y - cb.y + 1) < 0.6 && Math.abs(rb.height - cb.height - 2) < 0.6) {
        const st = await paints(r, 'strokes'); ok = st !== 'mixed' && st.some(x => x.var?.endsWith('line-scene')) && r.strokeWeight === 1; } }
    if (!ok) L_add('L13', 'error', pg, c, 'у клона нет рамки `line-scene` позади', 'прямоугольник 1 px `line-scene`, на 1 px шире клона с каждой стороны, слоем ниже (§6.3)');
  }

  // L14–L18 обход содержимого: голые цвета, тексты без стиля, белый текст, экземпляры, ссылки
  const nodes = [];
  walk(pg, n => { if (n.type === 'PAGE') return; if (clones.has(n.id)) return false; nodes.push(n); if (n.type === 'INSTANCE') return false; });
  const instInClones = [];
  for (const id of clones) { const c = await figma.getNodeByIdAsync(id); for (const n of c.findAllWithCriteria({ types: ['INSTANCE'] })) instInClones.push(n); }
  const bgOf = async n => { // ближайший предок с видимой сплошной заливкой
    for (let a = n.parent; a && a.type !== 'PAGE'; a = a.parent) {
      const ps = await paints(a); if (ps === 'mixed' || !ps.length) continue;
      if (ps.some(x => x.type !== 'SOLID')) return null; return ps[ps.length - 1].hex;
    }
    return null;
  };
  const HP = { header: 0, list: [] };
  for (const n of [...nodes, ...instInClones]) {
    if (n.type === 'INSTANCE') {
      const mc = await n.getMainComponentAsync();
      if (!mc) { L_add('L17', 'error', pg, n, 'экземпляр без главного компонента', 'заменить экземпляром Kit или отвязать по решению (§9, §10.4)'); continue; }
      const mname = mc.parent?.type === 'COMPONENT_SET' ? mc.parent.name : mc.name;
      if (mname === 'HeaderPage') { HP.header++; HP.list.push(n); }
      continue;
    }
    if (instInClones.includes(n)) continue;
    if (rawOk.some(r => r.test(n.name))) continue;
    if (n.type !== 'SECTION' && n.type !== 'TEXT' && 'fills' in n) for (const key of ['fills', 'strokes']) {
      const ps = await paints(n, key); if (ps === 'mixed') continue;
      for (const x of ps) if (x.type === 'SOLID' && !x.var) L_add('L14', 'error', pg, n, `голый цвет ${x.hex} в ${key}`, 'переменная Kit (§6.6) или экземпляр Kit');
    }
    if (n.type === 'TEXT') {
      const ps = await paints(n);
      if (ps !== 'mixed') for (const x of ps) if (x.type === 'SOLID' && !x.var) L_add('L14', 'error', pg, n, `голый цвет текста ${x.hex}`, 'переменная `text-*` Kit (§6.6)');
      if (!n.textStyleId || typeof n.textStyleId === 'symbol') L_add('L15', 'error', pg, n, typeof n.textStyleId === 'symbol' ? 'смешанные стили в тексте' : 'текст без стиля типографики', 'стиль `persefona/*` (§6.6)');
      const white = ps !== 'mixed' && ps.find(x => x.hex && lum(x.hex) > 0.85);
      if (white) { const bg = await bgOf(n); if (bg && lum(bg) > 0.5) L_add('L16', 'error', pg, n, `светлый текст ${white.hex} на светлом фоне ${bg}`, 'белый текст — только на тёмной сцене (§6.3, Ф2а)'); }
    }
  }
  // L18 ссылки: на удалённый узел; «см. страницу» текстом (§6.3)
  for (const t of nodes.filter(n => n.type === 'TEXT')) {
    if (/см\.?\s+(страниц|пейдж)/i.test(t.characters)) L_add('L18', 'warn', pg, t, 'ссылка текстом «см. страницу…»', 'гиперссылка на узел (§6.3)');
    let segs = []; try { segs = t.getStyledTextSegments(['hyperlink']); } catch (e) { continue; }
    for (const sg of segs) if (sg.hyperlink?.type === 'NODE' && !(await figma.getNodeByIdAsync(sg.hyperlink.value)))
      L_add('L18', 'error', pg, t, `ссылка «${sg.characters.slice(0, 30)}» на удалённый узел ${sg.hyperlink.value}`, 'поставить заново; после замены мастера — проверить все (§6.2)');
  }

  // L19 шапка: есть на страницах зон 0, 2, 3; метка статуса совпадает со значком (§6.2)
  if (([0, 2, 3].includes(z) || p.service === 'Cover') && !HP.header) L_add('L19', 'error', pg, null, 'нет шапки `HeaderPage`', 'экземпляр `HeaderPage` в левом верхнем углу первой секции (§6.2)');
  const words = Object.values(L_WORD);
  for (const h of HP.list) {
    const found = h.findAllWithCriteria({ types: ['TEXT'] }).map(t => t.characters.trim()).filter(s => words.includes(s));
    if (p.kind === 'readyfordev' || (z === 2 && CONFIG.KIND === 'components')) {
      if (found.length) L_add('L19', 'error', pg, h, `в шапке компонента после сборки метка «${found[0]}»`, 'меток над заголовком нет, рядом — бейдж версии (§6.2)');
    } else if (found.length && !p.service && !p.prd && !found.includes(L_WORD[p.status])) {
      L_add('L19', 'error', pg, h, `метка «${found[0]}», значок «${p.status || 'нет'}»`, `метка «${L_WORD[p.status]}» (§5, §6.2)`);
    }
  }
  // L20 секция Changelog · <Артефакт>: где нужна, где запрещена, место справа (§6.5)
  const chl = secs.filter(s => /^Changelog · /.test(s.name));
  const need = (z === 2 && CONFIG.KIND !== 'mockups') || ['construction', 'readyfordev'].includes(p.kind);
  if (need && !chl.length) L_add('L20', z === 2 ? 'error' : 'warn', pg, null, 'нет секции `Changelog · <Артефакт>`', 'отдельная секция справа от артефакта (§6.5)');
  if (!need && chl.length) L_add('L20', 'error', pg, chl[0], 'таблица чейнжлога на странице без артефакта', 'в зонах 1, 3 (кроме сборки) и 4 таблиц нет (§6.5)');
  for (const c of chl) {
    const art = secs.find(s => s.name === c.name.replace(/^Changelog · /, ''));
    if (!art) { L_add('L20', 'warn', pg, c, `нет секции «${c.name.replace(/^Changelog · /, '')}» для чейнжлога`, 'имя секции = `Changelog · ` + имя секции артефакта (§6.5)'); continue; }
    const a = box(art), b = box(c);
    if (!a || !b) continue;
    if (Math.abs(b.y - a.y) > 0.5 || Math.abs(b.x - a.x - a.width - CONFIG.SECTION_GAP) > 0.5) L_add('L20', 'error', pg, c, `не справа от «${art.name}» верх к верху с отступом ${CONFIG.SECTION_GAP}`, 'справа, верхним краем по верху, отступ 80 (§6.5)');
  }
  // L21 аудит при сборке — в Archive секцией с датой (§7.1, решение PD 2026-11-26)
  if (['construction', 'readyfordev'].includes(p.kind)) for (const s of secs.filter(s => / · audit\b/.test(s.name)))
    L_add('L21', 'warn', pg, s, 'секция аудита на странице сборки', 'переместить в `Archive` как `<Компонент> · audit · ГГГГ-ММ-ДД`, id те же (§7.1)');
  if (p.service === 'Archive') for (const s of secs.filter(s => / · audit$/.test(s.name)))
    L_add('L21', 'error', pg, s, 'секция аудита в Archive без даты', 'имя `<Компонент> · audit · ГГГГ-ММ-ДД` (§7.1, §7.3)');
  L_out.meta.headerPage = HP.header; L_out.meta.sections = secs.length; L_out.meta.clones = clones.size;
}

L_out.meta.counts = L_cnt;
L_out.meta.total = Object.values(L_cnt).reduce((a, b) => a + b, 0);
return ret(L_out);
