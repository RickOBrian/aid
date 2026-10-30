// Проверка §6.3 persefona-figma-pages (0.13.0): фон секций и карточек. Только чтение.
// Запуск — use_figma в нужном файле. PAGES = null → все страницы, кроме `---` и `Thumbnail`.
// Вывод: по каждой секции — фон и обводка; внутри секции — карточки (рамка с радиусом 8…99)
// не `bg-surface-main` + `line-default` и области вне карточек не `bg-surface-main`.
// Сцена (заливка на переменной продукта, картинка, имя Stage/Scene/Clone) и мастера компонентов
// не читаются; экземпляры читаются только как IslandBlock (их корень).
const PAGES = null;
const varCache = {};
async function vname(id) {
  if (!(id in varCache)) {
    try { const v = await figma.variables.getVariableByIdAsync(id); varCache[id] = v ? v.name : '?'; }
    catch (e) { varCache[id] = '?'; }
  }
  return varCache[id];
}
const isPf = n => /(^|\/)(bg|line|text|icon)-[a-z0-9-]+$/.test(n)
  || /(^|\/)(graphite|iolite|malachite|amber|garnet|lapis|turquoise)-\d+/.test(n);
const hex = c => '#' + [c.r, c.g, c.b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
async function pd(p) {
  if (p.type !== 'SOLID') return p.type;
  const b = p.boundVariables && p.boundVariables.color;
  const op = (p.opacity !== undefined && p.opacity < 1) ? ` a${Math.round(p.opacity * 100)}` : '';
  if (b) { const n = await vname(b.id); return (isPf(n) ? '' : 'PRODUCT:') + n.split('/').pop() + op; }
  return 'raw ' + hex(p.color) + op;
}
async function fd(n, k) {
  if (!(k in n) || n[k] === figma.mixed) return 'mixed';
  const v = n[k].filter(f => f.visible !== false);
  if (!v.length) return 'none';
  return (await Promise.all(v.map(pd))).join('+');
}
async function cn(n) {
  try {
    const m = await n.getMainComponentAsync();
    if (!m) return '?';
    return (m.parent && m.parent.type === 'COMPONENT_SET') ? m.parent.name : m.name;
  } catch (e) { return '?'; }
}
let issues = [];
async function walk(n, ctx, d) {
  if (d > 9) return;
  if (n.type === 'INSTANCE') {
    if (await cn(n) === 'IslandBlock' && !ctx.inCard) {
      const f = await fd(n, 'fills'), s = await fd(n, 'strokes');
      if (!(f === 'bg-surface-main' && /line-default/.test(s))) issues.push(`IslandBlock ${n.id} ${f}/${s}`);
    }
    return;
  }
  if (n.type === 'COMPONENT' || n.type === 'COMPONENT_SET') return;
  if (n.type === 'FRAME') {
    const f = await fd(n, 'fills');
    if (/PRODUCT:|IMAGE/.test(f)) return;
    if (/^(Stage|Scene|Сцена|Clone|Клон)/i.test(n.name)) return;
    if (f !== 'none' && !ctx.inCard) {
      const r = typeof n.cornerRadius === 'number' ? n.cornerRadius : (n.topLeftRadius || 0);
      const s = await fd(n, 'strokes');
      if (r >= 8 && r < 100) {
        if (!(f === 'bg-surface-main' && /line-default/.test(s))) issues.push(`card ${n.id} «${n.name.slice(0, 30)}» ${f}/${s} r${r}`);
        ctx = { ...ctx, inCard: true };
      } else if (r < 8 && f !== 'bg-surface-main') {
        issues.push(`area ${n.id} «${n.name.slice(0, 30)}» ${f}/${s}`);
        if (!/raw/.test(f)) ctx = { ...ctx, inCard: true };
      }
    }
  }
  if ('children' in n) for (const c of n.children) await walk(c, ctx, d + 1);
}
const out = [];
for (const p of figma.root.children) {
  if (/^(---|Thumbnail)$/.test(p.name.trim()) || (PAGES && !PAGES.includes(p.id))) continue;
  await p.loadAsync();
  for (const t of p.children) {
    issues = [];
    const f = ('fills' in t) ? await fd(t, 'fills') : '-';
    const s = ('strokes' in t) ? await fd(t, 'strokes') : '-';
    if (t.type === 'SECTION' || t.type === 'FRAME') await walk(t, { inCard: false }, 0);
    out.push(`${p.id} ${p.name} :: ${t.type} ${t.id} «${t.name.slice(0, 40)}» fill=${f} stroke=${s}` + (issues.length ? '\n    ' + issues.join('\n    ') : ''));
  }
}
return out.join('\n');
