// persefona-6 (AID-64): перевод таблицы чейнжлога на Kit Persefona НА МЕСТЕ (#362 §6.5 «Уже сделанные таблицы»).
// Запуск: use_figma, подставить ROOT_ID (figmaTable.nodeId) и TITLE (artifact из JSON).
// Корень, Changelog Table Body, Changes Row и ячейка изменений остаются теми же узлами.
// Версия/дата/автор → TableCell Default, заголовки колонок → TableCell Header, шапка → HeaderSection,
// бейдж → BadgeChangelog (Swap, имя слоя __Changelog Badge, вариант прежний).
const ROOT_ID = '__ROOT_ID__';
const TITLE = '__TITLE__';
const DRY = false;

const VK = {
  surface: '125448d6c36643d97f23500c7b74b1874738c645', muted: '749515ebb1ca2d075277f4baeac3c54c65ef96aa',
  line: '2a52e5ad5a83039e73014691e06c54e3d1b1cbfb', textPrimary: 'f1ae466778bfebc4323580287007c99393922fea',
  textSecondary: '4b2825ef9a779f55c1332634032ad0b4faa64e20', s8: 'c23139ed5f4bb3fb428410f43810433093c19f91',
  s12: '59b1fdb0d63c50cbdbdd4659319e948378e3e11d', s16: 'b459ff37547b414ea6f4f6fea3fc2e1d76f3dd96',
  s24: 'b287ebd1044990477d532e55da91e824f099a34b', s48: 'e0272ce24e25e0dc663e2ccf3adac07ae09cc35b',
  rM: '430a007fc643ff90984da87658024a3f2a7dde8f', rL: 'ca07e9e0afde0bd5cb5c952a9daf371b3bd68d4c',
};
const COLS = [['Версия', 120], ['Список изменений', null], ['Дата', 112], ['Автор', 140]];
const BADGE_SET = 'c2a13105246262ae9048b14410554bd847c0efa8';
const CELL_SET = 'abb512e23a30329bf6c9c9ee990cc64ff66f05d4';
const HEADER_SECTION = '09e45bfbda7bdf79a6a47b1c969ade6e913b0467';
const STYLE_BODY_S = 'dede2b7c132add99b21cc5f0c90880b535b4ad26';
const STYLE_CODE_S = 'dc6f78fc82ce91d3a06a28b1dabb01d17df35cca';
const BODY = 'Changelog Table Body', ROW = 'Changes Row', BADGE = '__Changelog Badge', SEP = '{separator}';

const root = await figma.getNodeByIdAsync(ROOT_ID);
if (!root || root.type !== 'FRAME') return { error: 'root not FRAME', ROOT_ID };
let pg = root; while (pg.type !== 'PAGE') pg = pg.parent;
await figma.setCurrentPageAsync(pg);

// --- проверка устройства до правок ---
const problems = [];
if (root.children.length !== 2) problems.push('root children ' + root.children.map(c => c.name).join(','));
const [hdr, table] = root.children;
if (!hdr || hdr.type !== 'INSTANCE') problems.push('header not instance');
if (!table || table.type !== 'FRAME' || table.children.length !== 2) problems.push('table frame shape');
const thead = table && table.children[0], body = table && table.children[1];
if (!body || body.name !== BODY) problems.push('no body as table.children[1]');
if (!thead || thead.children.length !== 4) problems.push('header cells != 4');
const rows = body ? body.children : [];
for (const r of rows) {
  if (r.type !== 'FRAME' || r.name !== ROW) problems.push('row ' + r.id + ' ' + r.type + ' ' + r.name);
  else if (r.children.length !== 4 || r.children[1].type !== 'FRAME') problems.push('row cells ' + r.id);
}
const isSep = n => n.name === SEP || /^separator$/i.test(n.name);
const isBadge = n => n.type === 'INSTANCE' && (n.name === BADGE || n.name === 'Badge');
function badgeOf(n) { const p = Object.entries(n.componentProperties).find(([, v]) => v.type === 'VARIANT'); return p ? p[1].value : null; }
function fp() {
  return {
    root: root.id, body: body.id,
    rows: body.children.map(r => {
      const cell = r.children[1];
      const items = cell.children.map(n => isBadge(n) || n.name === BADGE ? 'B:' + badgeOf(n) : n.type === 'TEXT' ? 'T:' + n.characters : isSep(n) ? 'SEP' : '?' + n.type + ':' + n.name);
      const other = [0, 2, 3].map(i => { const c = r.children[i]; const t = c.type === 'TEXT' ? c : c.findOne(x => x.type === 'TEXT'); return t ? t.characters : null; });
      return { id: r.id, cell: cell.id, other, items };
    }),
  };
}
for (const r of rows) for (const n of r.children[1].children) {
  if (!(isBadge(n) || n.type === 'TEXT' || isSep(n))) problems.push('unknown in cell ' + n.id + ' ' + n.type + ' ' + n.name);
}
if (problems.length) return { stop: true, problems };
const before = fp();
const oldHeaderTexts = thead.children.map(c => { const t = c.findOne(x => x.type === 'TEXT'); return t ? t.characters : null; });
const oldBadgeLabels = [];
const sepFixed = [];
if (DRY) return { dry: true, before, oldHeaderTexts };

// --- импорт Kit ---
const V = {};
for (const [k, key] of Object.entries(VK)) V[k] = await figma.variables.importVariableByKeyAsync(key);
const badgeSet = await figma.importComponentSetByKeyAsync(BADGE_SET);
const cellSet = await figma.importComponentSetByKeyAsync(CELL_SET);
const headerSection = await figma.importComponentByKeyAsync(HEADER_SECTION);
const stBody = await figma.importStyleByKeyAsync(STYLE_BODY_S);
const stCode = await figma.importStyleByKeyAsync(STYLE_CODE_S);
await figma.loadFontAsync(stBody.fontName); await figma.loadFontAsync(stCode.fontName);
const cellHeader = cellSet.children.find(c => c.name === 'Variant=Header');
const cellDefault = cellSet.children.find(c => c.name === 'Variant=Default');

const solid = v => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', v);
const fill = (n, v) => { n.fills = v ? [solid(v)] : []; };
function stroke(n, v, w) {
  if (!v) { n.strokes = []; return; }
  n.strokes = [solid(v)]; n.strokeAlign = 'INSIDE';
  const [t, r, b, l] = w || [1, 1, 1, 1];
  n.strokeTopWeight = t; n.strokeRightWeight = r; n.strokeBottomWeight = b; n.strokeLeftWeight = l;
}
function pad(n, vy, vx) {
  for (const k of ['paddingTop', 'paddingBottom']) vy ? n.setBoundVariable(k, vy) : (n.setBoundVariable(k, null), n[k] = 0);
  for (const k of ['paddingLeft', 'paddingRight']) vx ? n.setBoundVariable(k, vx) : (n.setBoundVariable(k, null), n[k] = 0);
}
function gap(n, v) { if (v) n.setBoundVariable('itemSpacing', v); else { n.setBoundVariable('itemSpacing', null); n.itemSpacing = 0; } }
function radius(n, v) {
  for (const k of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) {
    if (v) n.setBoundVariable(k, v); else { n.setBoundVariable(k, null); n[k] = 0; }
  }
}
const propKey = (inst, prefix) => Object.keys(inst.componentProperties).find(k => k.startsWith(prefix));
function makeCell(variant, text, width) {
  const inst = variant.createInstance();
  inst.setProperties({ [propKey(inst, 'Text')]: text || '' });
  return { inst, width };
}
function place(parent, index, inst, width) {
  parent.insertChild(index, inst);
  if (width) { inst.resize(width, inst.height); inst.layoutSizingHorizontal = 'FIXED'; } else inst.layoutSizingHorizontal = 'FILL';
  inst.layoutSizingVertical = 'FILL';
}
async function styleText(t, style, color) {
  const fonts = t.characters.length ? t.getRangeAllFontNames(0, t.characters.length) : [t.fontName];
  for (const f of fonts) await figma.loadFontAsync(f);
  await t.setTextStyleIdAsync(style.id);
  fill(t, color);
  t.layoutSizingHorizontal = 'FILL';
  t.textAutoResize = 'HEIGHT';
}

// корень — карточка Kit (как Changelog · TabBar): имя CHANGELOG не меняем (§6.5)
root.layoutMode = 'VERTICAL';
fill(root, V.surface); stroke(root, V.line); radius(root, V.rL); pad(root, V.s48, V.s48); gap(root, V.s24);
root.counterAxisSizingMode = 'FIXED'; root.resize(920 + 96, root.height); root.primaryAxisSizingMode = 'AUTO';
root.clipsContent = false;

// шапка → HeaderSection, заголовок = artifact
hdr.swapComponent(headerSection);
hdr.name = 'HeaderSection';
hdr.setProperties({ [propKey(hdr, 'Title')]: TITLE, [propKey(hdr, 'Show Subtitle')]: false });
hdr.layoutSizingHorizontal = 'FILL';

// таблица
table.name = 'Table';
table.layoutMode = 'VERTICAL'; gap(table, null); pad(table, null, null);
fill(table, V.surface); stroke(table, V.line); radius(table, V.rM); table.clipsContent = true;
table.layoutSizingHorizontal = 'FILL'; table.layoutSizingVertical = 'HUG';

thead.name = 'Table Header';
thead.layoutMode = 'HORIZONTAL'; gap(thead, null); pad(thead, null, null); fill(thead, null); stroke(thead, null); radius(thead, null);
thead.clipsContent = true; thead.layoutSizingHorizontal = 'FILL'; thead.layoutSizingVertical = 'HUG';
for (const old of [...thead.children]) old.remove();
COLS.forEach(([text, w], i) => { const { inst } = makeCell(cellHeader, text, w); place(thead, i, inst, w); });

body.layoutMode = 'VERTICAL'; gap(body, null); pad(body, null, null); fill(body, null); stroke(body, null); radius(body, null);
body.clipsContent = true; body.layoutSizingHorizontal = 'FILL'; body.layoutSizingVertical = 'HUG';

for (const r of [...body.children]) {
  r.layoutMode = 'HORIZONTAL'; gap(r, null); pad(r, null, null); fill(r, null); stroke(r, null); radius(r, null);
  r.clipsContent = true; r.layoutSizingHorizontal = 'FILL'; r.layoutSizingVertical = 'HUG';
  for (const i of [0, 2, 3]) {
    const old = r.children[i];
    if (old.type === 'INSTANCE') { const mc = await old.getMainComponentAsync(); if (mc && mc.parent && mc.parent.key === CELL_SET) continue; }
    const t = old.type === 'TEXT' ? old : old.findOne(x => x.type === 'TEXT');
    const { inst } = makeCell(cellDefault, t ? t.characters : '', COLS[i][1]);
    old.remove();
    place(r, i, inst, COLS[i][1]);
  }
  const cell = r.children[1];
  cell.name = 'Changes Cell';
  cell.layoutMode = 'VERTICAL'; gap(cell, V.s8); pad(cell, V.s12, V.s16);
  fill(cell, V.surface); stroke(cell, V.line, [0, 0, 1, 0]); radius(cell, null);
  cell.clipsContent = true; cell.layoutSizingHorizontal = 'FILL'; cell.layoutSizingVertical = 'HUG';
  let prevBadge = false;
  for (const n of [...cell.children]) {
    if (isBadge(n)) {
      const value = badgeOf(n);
      const lbl = n.findOne(x => x.type === 'TEXT'); const oldLabel = lbl ? lbl.characters : null;
      const variant = badgeSet.children.find(c => c.name === 'Change=' + value);
      if (!variant) throw new Error('no BadgeChangelog variant ' + value + ' at ' + n.id);
      n.swapComponent(variant);
      n.name = 'tmp'; n.name = BADGE; // имя, совпавшее со старым компонентом, иначе «следует» за новым
      n.layoutSizingHorizontal = 'HUG'; n.layoutSizingVertical = 'HUG';
      const nl = n.findOne(x => x.type === 'TEXT');
      if (nl && oldLabel && ['Исправлено', 'Устарело'].includes(oldLabel) && nl.characters !== oldLabel) {
        await figma.loadFontAsync(nl.fontName); nl.characters = oldLabel;
      }
      oldBadgeLabels.push([n.id, value, oldLabel, nl ? nl.characters : null]);
      prevBadge = true;
    } else if (n.type === 'TEXT') {
      if (prevBadge) { await styleText(n, stBody, V.textPrimary); n.name = 'Description'; }
      else { await styleText(n, stCode, V.textSecondary); n.name = 'Details'; }
      prevBadge = false;
    } else if (isSep(n)) {
      let s = n;
      if (n.type !== 'FRAME' || n.name !== SEP) { // контракт: FRAME «{separator}»
        s = figma.createFrame(); s.name = SEP; cell.insertChild(cell.children.indexOf(n), s); n.remove(); sepFixed.push(s.id);
      }
      fill(s, V.line); stroke(s, null); radius(s, null);
      if ('layoutMode' in s) s.layoutMode = 'NONE';
      s.layoutSizingHorizontal = 'FILL'; s.resize(s.width, 1); s.layoutSizingVertical = 'FIXED';
      prevBadge = false;
    }
  }
}

const after = fp();
const strip = f => JSON.stringify(f.rows.map(r => ({ id: r.id, cell: r.cell, other: r.other, items: r.items })));
const same = before.root === after.root && before.body === after.body && strip(before) === strip(after);
return { ok: true, same, before: same ? undefined : before, after: same ? { rows: after.rows.length } : after, oldHeaderTexts, oldBadgeLabels: oldBadgeLabels.filter(b => b[2] !== b[3]), badges: oldBadgeLabels.length, sepFixed, size: [root.width, root.height] };
