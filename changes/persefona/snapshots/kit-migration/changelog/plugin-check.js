// persefona-6: проверка контракта Token Comparator после перевода (логика writeUnpublishedRow из
// tools/figma-token-comparator/src/lib/changelogTable.ts, перенесена 1:1). Прогон на КОПИИ таблицы,
// копия удаляется; findChangelogTable — на оригинале по figmaTable.nodeId.
const ROOT_ID = '__ROOT_ID__';
const BODY_NAME = 'Changelog Table Body', ROW_NAME = 'Changes Row', BADGE_NAME = '__Changelog Badge', SEPARATOR_NAME = '{separator}';
const KIND_LABELS = { added: 'Добавлено', removed: 'Удалено', changed: 'Изменено', fixed: 'Исправлено', deprecated: 'Устарело' };
const BADGE_VARIANT = { added: 'Added', removed: 'Removed', changed: 'Edited', fixed: 'Edited', deprecated: 'Edited' };
const pageOf = n => { let c = n; while (c && c.type !== 'PAGE') c = c.parent; return c; };
const orig = await figma.getNodeByIdAsync(ROOT_ID);
await figma.setCurrentPageAsync(pageOf(orig));
const found = orig && orig.type === 'FRAME' && !!orig.findOne(c => c.name === BODY_NAME);
const firstText = n => n.type === 'TEXT' ? n : ('findOne' in n ? n.findOne(c => c.type === 'TEXT') : null);
async function setText(node, text) {
  const fonts = node.characters.length > 0 ? node.getRangeAllFontNames(0, node.characters.length) : [node.fontName];
  for (const f of fonts) await figma.loadFontAsync(f);
  node.characters = text;
}
function findTemplates(rows) {
  let separator = null, base = null, details = null;
  for (const row of rows) {
    const cell = row.children[1]; if (!cell || !('children' in cell)) continue;
    const ch = cell.children;
    if (!separator) { const f = ch.find(c => c.name === SEPARATOR_NAME); if (f && f.type === 'FRAME') separator = f; }
    for (const [i, c] of ch.entries()) {
      if (c.name !== BADGE_NAME || c.type !== 'INSTANCE') continue;
      const d = ch[i + 1]; if (!d || d.type !== 'TEXT') continue;
      if (!base) base = { badge: c, description: d };
      const nx = ch[i + 2]; if (!details && nx && nx.type === 'TEXT') details = nx;
    }
    if (base && details && separator) break;
  }
  if (!base) throw new Error('нет строки-образца с бейджем и фразой');
  return { ...base, details, separator };
}
async function setBadge(badge, kind) {
  const p = Object.entries(badge.componentProperties).find(([, v]) => v.type === 'VARIANT');
  if (p) badge.setProperties({ [p[0]]: BADGE_VARIANT[kind] });
  const l = badge.findOne(c => c.type === 'TEXT'); if (l && l.characters !== KIND_LABELS[kind]) await setText(l, KIND_LABELS[kind]);
}
// Пробе нужны шрифты таблицы заранее (в живом плагине их подгружает открытый документ — проверить отдельно).
const fontSet = new Map();
for (const t of orig.findAll(n => n.type === 'TEXT')) for (const f of (t.characters.length ? t.getRangeAllFontNames(0, t.characters.length) : [t.fontName])) fontSet.set(f.family + '|' + f.style, f);
for (const f of fontSet.values()) await figma.loadFontAsync(f);
const copy = orig.clone(); copy.x = orig.x + orig.width + 400; copy.name = 'persefona-6 · проба плагина (удалить)';
const result = { found, copy: copy.id };
try {
  const entry = { author: 'проба', changes: [
    { kind: 'added', description: 'Проба: добавлено', details: 'token-a, token-b' },
    { kind: 'fixed', description: 'Проба: исправлено' } ] };
  const body = copy.findOne(c => c.name === BODY_NAME);
  const rows = body.children.filter(c => c.type === 'FRAME' && c.name === ROW_NAME);
  const t = findTemplates(rows);
  const first = rows[0];
  const fv = firstText(first.children[0]);
  let row; if (fv && fv.characters.trim() === 'Не опубликовано') row = first; else { row = first.clone(); body.insertChild(body.children.indexOf(first), row); }
  const [vc, cc, dc, ac] = row.children;
  if (!vc || !cc || cc.type !== 'FRAME' || !dc || !ac) throw new Error('нужны четыре ячейки');
  const vt = firstText(vc), dt = firstText(dc), at = firstText(ac);
  if (vt) await setText(vt, 'Не опубликовано'); if (dt) await setText(dt, ''); if (at) await setText(at, entry.author);
  const holder = pageOf(cc);
  const det = n => { holder.appendChild(n); return n; };
  const badge = det(t.badge.clone()), desc = det(t.description.clone()), details = t.details ? det(t.details.clone()) : null, sep = t.separator ? det(t.separator.clone()) : null;
  for (const c of [...cc.children]) c.remove();
  for (const [i, ch] of entry.changes.entries()) {
    if (i > 0 && sep) cc.appendChild(sep.clone());
    const b = badge.clone(); cc.appendChild(b); await setBadge(b, ch.kind);
    const d = desc.clone(); cc.appendChild(d); await setText(d, ch.description);
    if (ch.details && details) { const x = details.clone(); cc.appendChild(x); await setText(x, ch.details); }
  }
  for (const n of [badge, desc, details, sep]) n && n.remove();
  result.row = cc.children.map(c => c.type + ':' + c.name + (c.type === 'TEXT' ? '=' + c.characters : c.type === 'INSTANCE' ? '=' + Object.values(c.componentProperties).find(v => v.type === 'VARIANT').value + '/' + c.findOne(x => x.type === 'TEXT').characters : ''));
  result.cells = [vt && vt.characters, dt && dt.characters, at && at.characters];
  result.hadSeparatorTemplate = !!t.separator; result.hadDetailsTemplate = !!t.details;
  await row.screenshot();
} catch (e) { result.error = String(e); }
copy.remove();
result.copyRemoved = true;
return result;
