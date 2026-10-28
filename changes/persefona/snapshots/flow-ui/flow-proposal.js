// persefona-9 flow-ui (AID-84), часть Б: макет большой схемы идеи на странице предложений Persefona Tokens 141:19.
// Файл Tokens YDjPxFrW1yXqm9RzBGQXuc. Всё на локальных переменных и стилях Tokens, компоненты — импорт по ключу из Components.
// Экраны — заглушки клонов (в Tokens нет экранов Rider), данные условные. Сырые числа — только константы сетки (§2 документа).
const KEY = { headerPage:'21df81e076e13e27d067cc374c63bc38bdbea9e3', headerSection:'09e45bfbda7bdf79a6a47b1c969ade6e913b0467',
  badgeNeutral:'969d7acc320e983331f6a43ae3ae1d5016679e7c', tagIdea:'ef004f976a258f3654937d9320a7c7915793f884',
  islandBlock:'0e644cfd615be781c53fa8bcb1f15195cda36b01' };
// Сетка (Б1): колонка 390 (ширина клона), промежуток 160, шаг 550; ряд: ссылка 40 + экран 844 + подписи 200 + промежуток 160.
const COL = 390, GUT = 160, STEP = COL + GUT, SH = 844, LEAD = 160, CH = 160, RS = 40 + SH + 200 + GUT;
const page = await figma.getNodeByIdAsync('141:19'); await figma.setCurrentPageAsync(page);
const V = {}; for (const v of await figma.variables.getLocalVariablesAsync('COLOR')) V[v.name.split('/').pop()] = v;
const F = {}; for (const v of await figma.variables.getLocalVariablesAsync('FLOAT')) F[v.name.split('/').pop()] = v;
const ST = {}; for (const s of await figma.getLocalTextStylesAsync()) ST[s.name.split('/').pop()] = s;
for (const st of ['Regular', 'Medium']) await figma.loadFontAsync({ family:'Google Sans', style:st });
async function resolve(v) { let val = Object.values(v.valuesByMode)[0];
  while (val && val.type === 'VARIABLE_ALIAS') { const a = await figma.variables.getVariableByIdAsync(val.id); val = Object.values(a.valuesByMode)[0]; } return val; }
const RC = {}; for (const n of ['line-annotation-flow','bg-surface-main','bg-surface-muted','line-default','text-primary','text-secondary',
  'text-accent-vivid','line-annotation-idea','bg-annotation-idea-main','bg-annotation-idea-fade','line-annotation-marker-outline']) RC[n] = await resolve(V[n]);
const P = n => { const c = RC[n]; return figma.variables.setBoundVariableForPaint({ type:'SOLID', color:{ r:c.r, g:c.g, b:c.b }, opacity:c.a ?? 1 }, 'color', V[n]); };
const bindR = (n, r) => { for (const k of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) n.setBoundVariable(k, F[r]); };
const bindPad = (n, v, h) => { n.setBoundVariable('paddingTop', F[v]); n.setBoundVariable('paddingBottom', F[v]); n.setBoundVariable('paddingLeft', F[h]); n.setBoundVariable('paddingRight', F[h]); };
async function T(parent, chars, style, color, x, y, w, align) {
  const t = figma.createText(); parent.appendChild(t); await t.setTextStyleIdAsync(ST[style].id); t.characters = chars; t.fills = [P(color)];
  if (w) { t.textAutoResize = 'HEIGHT'; t.resize(w, t.height); } else t.textAutoResize = 'WIDTH_AND_HEIGHT';
  if (align) t.textAlignHorizontal = align; t.x = x; t.y = y; return t; }
const C = {}; for (const k in KEY) C[k] = await figma.importComponentByKeyAsync(KEY[k]);
const prop = (i, s) => Object.keys(i.componentProperties).find(k => k.startsWith(s));
const log = { sections:[], screens:{}, flows:[], terminals:[], labels:[] };

// ---------- элементы ----------
function screen(sch, id, c, r, title, desc, link) {
  const x = LEAD + c * STEP, y = CH + 40 + r * RS;
  const f = figma.createFrame(); sch.appendChild(f); f.name = `Экран ${id} · заглушка клона`; f.resize(COL, SH); f.x = x; f.y = y;
  f.fills = [P('bg-surface-muted')]; f.strokes = [P('line-default')]; f.strokeWeight = 1;
  return { f, x, y, c, r, id, title, desc, link, kind:'screen' }; }
function diamond(sch, c, r, q) {
  const cx = LEAD + c * STEP + COL / 2, cy = CH + 40 + r * RS + SH / 3;
  return { cx, cy, c, r, q, kind:'diamond', sch }; }
const port = (n, side) => {
  if (n.kind === 'screen') { const fy = n.y + SH / 3;
    return { L:[n.x, fy], R:[n.x + COL, fy], T:[n.x + (n.link ? COL * 2 / 3 : COL / 2), n.y] }[side]; }
  if (n.kind === 'diamond') return { L:[n.cx - 100, n.cy], R:[n.cx + 100, n.cy], T:[n.cx, n.cy - 100], B:[n.cx, n.cy + 100] }[side];
  if (n.kind === 'term') return { L:[n.node.x, n.cy], R:[n.node.x + n.node.width, n.cy] }[side]; };
async function screenDeco(sch, s) {
  await T(s.f, `Клон экрана ${s.id}`, 'body-s', 'text-secondary', 0, SH / 2 - 10, COL, 'CENTER');
  if (s.link) { const l = await T(sch, '→ ' + s.link, 'body-s', 'text-accent-vivid', s.x, s.y - 32, COL); l.name = 'Ссылка на оригинал'; }
  const t = await T(sch, `${s.id}. ${s.title}`, 'heading-m', 'text-primary', s.x, s.y + SH + 24, COL); t.name = `${s.id}. ${s.title}`;
  const d = await T(sch, s.desc, 'body-m', 'text-secondary', s.x, t.y + t.height + 8, COL); d.name = 'описание'; }
async function drawDiamond(sch, d) {
  const p = figma.createPolygon(); sch.appendChild(p); p.pointCount = 4; p.resize(200, 200); p.x = d.cx - 100; p.y = d.cy - 100; p.name = 'развилка';
  p.fills = [P('bg-surface-main')]; p.strokes = [P('line-annotation-flow')]; p.strokeWeight = 2;
  const t = await T(sch, d.q, 'heading-s', 'text-primary', d.cx - 60, 0, 120, 'CENTER'); t.y = d.cy - t.height / 2; t.name = d.q; d.node = p; }
// FlowTerminal (Б3): капсула radius-pill, контур line-annotation-flow 2 px; Exit/Start-ссылка — text-accent-vivid с гиперссылкой.
async function terminal(sch, type, text, x, cy, alignRight) {
  const f = figma.createFrame(); sch.appendChild(f); f.name = `FlowTerminal · ${type}`; f.layoutMode = 'HORIZONTAL';
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO'; bindPad(f, 'spacing-8', 'spacing-16'); bindR(f, 'radius-pill');
  f.fills = [P('bg-surface-main')]; f.strokes = [P('line-annotation-flow')]; f.strokeWeight = 2; f.strokeAlign = 'INSIDE';
  const t = await T(f, text, 'body-m', type === 'Exit' || text.startsWith('←') ? 'text-accent-vivid' : 'text-primary', 0, 0); t.name = 'Text';
  f.x = alignRight ? x - f.width : x; f.y = cy - f.height / 2;
  const n = { node:f, text:t, cy, kind:'term', type }; log.terminals.push(f.id); return n; }
// Переход: сплошная — действие пользователя, пунктир 12/8 (Б4) — событие системы и выходы развилки; углы radius-s (Б5).
async function flow(sch, pts, dashed, label, li = 0) {
  const minX = Math.min(...pts.map(p => p[0])), minY = Math.min(...pts.map(p => p[1]));
  const v = figma.createVector(); sch.appendChild(v); v.name = 'стрелка';
  await v.setVectorNetworkAsync({ vertices: pts.map((p, i) => ({ x:p[0] - minX, y:p[1] - minY, strokeCap: i === pts.length - 1 ? 'ARROW_EQUILATERAL' : 'NONE', cornerRadius: 4 })),
    segments: pts.slice(1).map((_, i) => ({ start:i, end:i + 1 })), regions: [] });
  v.x = minX; v.y = minY; v.strokes = [P('line-annotation-flow')]; v.strokeWeight = 2; v.strokeJoin = 'ROUND'; v.dashPattern = dashed ? [12, 8] : [];
  v.fills = []; v.setBoundVariable('cornerRadius', F['radius-s']); log.flows.push(v.id);
  if (label) await flowLabel(sch, label, pts[li], pts[li + 1]); return v; }
// FlowLabel (Б2): плашка bg-surface-main на линии, 16 px от начала сегмента, разрывает линию; body-m text-secondary.
async function flowLabel(sch, text, a, b) {
  const f = figma.createFrame(); sch.appendChild(f); f.name = 'FlowLabel'; f.layoutMode = 'HORIZONTAL';
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO'; bindPad(f, 'spacing-4', 'spacing-8'); bindR(f, 'radius-s');
  f.fills = [P('bg-surface-main')]; const t = await T(f, text, 'body-m', 'text-secondary', 0, 0); t.name = 'Text';
  const dx = Math.sign(b[0] - a[0]), dy = Math.sign(b[1] - a[1]);
  if (dx > 0) { f.x = a[0] + 16; f.y = a[1] - f.height / 2; } else if (dx < 0) { f.x = a[0] - 16 - f.width; f.y = a[1] - f.height / 2; }
  else if (dy > 0) { f.x = a[0] - f.width / 2; f.y = a[1] + 16; } else { f.x = a[0] - f.width / 2; f.y = a[1] - 16 - f.height; }
  log.labels.push(f.id); }
async function pin(sch, s, n) {
  const i = C.tagIdea.createInstance(); sch.appendChild(i); i.name = 'вопрос'; i.setProperties({ [prop(i, 'Number')]: '?' + n });
  i.x = s.x + COL - i.width / 2; i.y = s.y - i.height / 2; return i; }
async function sketch(s) {
  const z = figma.createRectangle(); s.f.appendChild(z); z.name = 'набросок · зона'; z.resize(240, 200); z.x = 75; z.y = 180;
  z.fills = [P('bg-annotation-idea-fade')]; z.strokes = [P('line-annotation-idea')]; z.strokeWeight = 2; z.dashPattern = [8, 6]; bindR(z, 'radius-xl');
  const e = figma.createEllipse(); s.f.appendChild(e); e.name = 'набросок · точка'; e.resize(12, 12); e.x = 240; e.y = 220;
  e.fills = [P('bg-annotation-idea-main')]; e.strokes = [P('line-annotation-marker-outline')]; e.strokeWeight = 2; e.strokeAlign = 'OUTSIDE'; }
function newSection(parent, name, w, h, y) {
  const s = figma.createSection(); parent.appendChild(s); s.name = name; s.fills = [P('bg-surface-main')]; s.resizeWithoutConstraints(w, h);
  s.x = 80; s.y = y; log.sections.push(s.id); return s; }
async function headerSection(sec, title, sub) {
  const h = C.headerSection.createInstance(); sec.appendChild(h); h.x = 80; h.y = 80;
  h.setProperties({ [prop(h, 'Title')]: title, [prop(h, 'Subtitle')]: sub, [prop(h, 'Show Subtitle')]: true }); return h; }
function schemaFrame(sec, y, w, h) { const f = figma.createFrame(); sec.appendChild(f); f.name = 'Схема'; f.fills = []; f.clipsContent = false;
  f.resize(w, h); f.x = 80; f.y = y; return f; }

// ---------- обёртка ----------
const wrap = figma.createSection(); page.appendChild(wrap); wrap.name = 'Flow · ideas'; wrap.fills = [P('bg-surface-main')];
wrap.strokes = [P('line-default')]; wrap.x = 1456 + 1376 + 80; wrap.y = 0;
try {

// Подсценарий 1 — 6 экранов, развилки D1, D2, возврат каналом над рядом, три выхода
const W1 = LEAD + 5 * STEP + COL, W2 = LEAD + 6 * STEP + COL;
const sec1 = newSection(wrap, '1 · Точка подачи', W1 + 160, 0, 0);
const hs1 = await headerSection(sec1, '1 · Точка подачи', 'Экраны 1–6: выбор точки на карте, две развилки, возврат каналом над рядом.');
const sch1 = schemaFrame(sec1, hs1.y + hs1.height + 48, W1, CH + 40 + 2 * RS + SH + 200);
const S = {};
S[1] = screen(sch1, 1, 0, 0, 'Главная', 'Пин показывает время подачи. Клон экрана Where.', 'Where › Главная › Taxi');
S[2] = screen(sch1, 2, 1, 0, 'Двигает карту', 'Шторка и таббар прячутся, пин «Dragged».', 'Where › Главная › Taxi');
S[3] = screen(sch1, 3, 3, 0, 'Время подачи', 'Пин в зоне подачи, время подачи на пине.');
S[4] = screen(sch1, 4, 4, 0, 'Выбор тарифа', 'Шторка с тарифами, кнопка «Заказать».');
S[5] = screen(sch1, 5, 3, 1, 'Примагнитился', 'Пин переезжает к ближайшей точке подачи.');
S[6] = screen(sch1, 6, 2, 2, 'Сервис недоступен', 'Плашка «Здесь пока не работаем», карта работает.');
const D1 = diamond(sch1, 2, 0, 'Где отпустил пин?'), D2 = diamond(sch1, 2, 1, 'Точка подачи рядом есть?');

// Подсценарий 2 — 7 экранов, развилка D3, выходы-ссылки вместо длинных возвратов
const sec2 = newSection(wrap, '2 · Заказ', W2 + 160, 0, 0);
const hs2 = await headerSection(sec2, '2 · Заказ', 'Экраны 7–13: поиск машины, одна развилка, выходы «→ экран N» вместо линий через ряд.');
const sch2 = schemaFrame(sec2, hs2.y + hs2.height + 48, W2, CH + 40 + RS + SH + 200);
S[7] = screen(sch2, 7, 0, 0, 'Подтверждение', 'Адрес, тариф и цена перед заказом.');
S[8] = screen(sch2, 8, 1, 0, 'Поиск машины', 'Анимация поиска, кнопка «Отменить».');
S[9] = screen(sch2, 9, 3, 0, 'Машина едет', 'Машина на карте, время до подачи.');
S[10] = screen(sch2, 10, 4, 0, 'Машина на месте', 'Номер машины и время ожидания.');
S[11] = screen(sch2, 11, 5, 0, 'В поездке', 'Маршрут и время до места.');
S[12] = screen(sch2, 12, 2, 1, 'Не нашли машину', 'Повторить поиск или отменить заказ.');
S[13] = screen(sch2, 13, 3, 1, 'Заказ отменён', 'Подтверждение отмены.');
const D3 = diamond(sch2, 2, 0, 'Машина найдена?');

for (const k in S) { const s = S[k]; await screenDeco(s.id <= 6 ? sch1 : sch2, s); log.screens[k] = s.f.id; }
await drawDiamond(sch1, D1); await drawDiamond(sch1, D2); await drawDiamond(sch2, D3);
await sketch(S[5]);

// ---------- переходы подсценария 1 ----------
const fy0 = S[1].y + SH / 3;
const st1 = await terminal(sch1, 'Start', 'Начало', S[1].x - 40, fy0, true);
const ex1 = await terminal(sch1, 'Exit', '→ 2 · Заказ, экран 7', LEAD + 5 * STEP, fy0);
const ex2 = await terminal(sch1, 'Exit', '→ экран 4', LEAD + 4 * STEP, S[5].y + SH / 3);
const ex3 = await terminal(sch1, 'Exit', '→ экран 2', LEAD + 3 * STEP, S[6].y + SH / 3);
await flow(sch1, [port(st1, 'R'), port(S[1], 'L')], false);
await flow(sch1, [port(S[1], 'R'), port(S[2], 'L')], false, 'тянет карту');
await flow(sch1, [port(S[2], 'R'), port(D1, 'L')], false, 'отпустил пин');
await flow(sch1, [port(D1, 'R'), port(S[3], 'L')], true, 'в зоне подачи');
await flow(sch1, [port(D1, 'B'), port(D2, 'T')], true, 'вне точки подачи');
await flow(sch1, [port(S[3], 'R'), port(S[4], 'L')], false, 'дальше');
await flow(sch1, [port(S[4], 'R'), port(ex1, 'L')], false, 'заказать');
// возврат: выходит сверху, идёт каналом над рядом (y = CH/2), входит сверху; углы radius-s
const a = port(S[4], 'T'), b = port(S[2], 'T');
await flow(sch1, [a, [a[0], CH / 2], [b[0], CH / 2], b], false, 'сменить точку', 1);
await flow(sch1, [port(D2, 'R'), port(S[5], 'L')], true, 'точка есть');
await flow(sch1, [port(D2, 'B'), port(S[6], 'T')], true, 'точек нет');
await flow(sch1, [port(S[5], 'R'), port(ex2, 'L')], false, 'подтвердил');
await flow(sch1, [port(S[6], 'R'), port(ex3, 'L')], false, 'передвинул пин');

// ---------- переходы подсценария 2 ----------
const fy2 = S[7].y + SH / 3;
const st2 = await terminal(sch2, 'Start', '← 1 · экран 4', S[7].x - 40, fy2, true);
const end2 = await terminal(sch2, 'End', 'Конец', LEAD + 6 * STEP, fy2);
const ex4 = await terminal(sch2, 'Exit', '→ экран 8', LEAD + 1 * STEP + COL, S[12].y + SH / 3, true);
const ex5 = await terminal(sch2, 'Exit', '→ экран 1', LEAD + 4 * STEP, S[13].y + SH / 3);
await flow(sch2, [port(st2, 'R'), port(S[7], 'L')], false);
await flow(sch2, [port(S[7], 'R'), port(S[8], 'L')], false, 'заказал');
await flow(sch2, [port(S[8], 'R'), port(D3, 'L')], true);
await flow(sch2, [port(D3, 'R'), port(S[9], 'L')], true, 'нашлась');
await flow(sch2, [port(D3, 'B'), port(S[12], 'T')], true, 'не нашлась за 3 мин');
await flow(sch2, [port(S[9], 'R'), port(S[10], 'L')], true, 'подъехала');
await flow(sch2, [port(S[10], 'R'), port(S[11], 'L')], false, 'сел в машину');
await flow(sch2, [port(S[11], 'R'), port(end2, 'L')], true, 'приехали');
await flow(sch2, [port(S[12], 'L'), port(ex4, 'R')], false, 'повторить');
await flow(sch2, [port(S[12], 'R'), port(S[13], 'L')], false, 'отменил');
await flow(sch2, [port(S[13], 'R'), port(ex5, 'L')], true, 'заказ отменён');
// ссылки терминалов
const link = (t, id) => t.text.setRangeHyperlink(0, t.text.characters.length, { type:'NODE', value:id });
link(ex1, S[7].f.id); link(ex2, S[4].f.id); link(ex3, S[2].f.id); link(ex4, S[8].f.id); link(ex5, S[1].f.id); link(st2, S[4].f.id);

// вопросы ?1…?4 (Б6): пин на правом верхнем углу экрана, тексты — списком в шапке
const Q = [[3, 'Время подачи считаем от пина или от точки подачи?'], [5, 'Как пин примагничивается: анимация, радиус, подпись — в PRD нет.'],
  [6, 'Плашка — Warning, как ошибка, или нужен информационный вид?'], [12, 'Через сколько минут поиска показывать экран 12?']];
for (let i = 0; i < Q.length; i++) await pin(Q[i][0] <= 6 ? sch1 : sch2, S[Q[i][0]], i + 1);

// ---------- шапка: HeaderPage + легенда + вопросы (Б6, Б7) ----------
const hsec = newSection(wrap, 'Пример · Выбор точки подачи и заказ', 0, 0, 0);
const hp = C.headerPage.createInstance(); hsec.appendChild(hp); hp.x = 80; hp.y = 80; hp.name = 'HeaderPage';
hp.setProperties({ [prop(hp, 'Title')]: 'Пример · Выбор точки подачи и заказ',
  [prop(hp, 'Subtitle')]: 'Макет предложения persefona-9 · flow-ui: схема на 13 экранов, три развилки, возврат. Экраны — заглушки клонов, данные условные.',
  [prop(hp, 'Contents')]: '1 · Точка подачи — экраны 1–6\n2 · Заказ — экраны 7–13',
  [prop(hp, 'Show How to Read')]: false, [prop(hp, 'Show Cover Link')]: false });
const slot = hp.findOne(n => n.type === 'SLOT'); const def = slot.children.slice();
const bd = C.badgeNeutral.createInstance(); bd.setProperties({ [prop(bd, 'Text')]: 'Идея, не макет' }); slot.appendChild(bd); for (const d of def) d.remove();
const ct = hp.findOne(n => n.type === 'TEXT' && n.name === 'Contents');
if (ct) { await figma.loadFontAsync(ct.fontName); const lines = ct.characters.split('\n'); let pos = 0;
  [sec1.id, sec2.id].forEach((id, i) => { ct.setRangeHyperlink(pos, pos + lines[i].length, { type:'NODE', value:id }); pos += lines[i].length + 1; }); }
async function island(name, x, y, w) {
  const ib = C.islandBlock.createInstance(); hsec.appendChild(ib); ib.name = name; ib.x = x; ib.y = y; ib.resize(w, ib.height);
  ib.setProperties({ [prop(ib, 'Show Footer')]: false });
  const h = ib.findOne(n => n.type === 'INSTANCE' && n.name === 'HeaderSection'); h.setProperties({ [prop(h, 'Title')]: name, [prop(h, 'Show Subtitle')]: false });
  const s = ib.findOne(n => n.type === 'SLOT'); for (const d of s.children.slice()) d.remove(); return s; }
function row(parent) { const r = figma.createFrame(); parent.appendChild(r); r.name = 'строка'; r.layoutMode = 'HORIZONTAL'; r.fills = [];
  r.primaryAxisSizingMode = 'AUTO'; r.counterAxisSizingMode = 'AUTO'; r.counterAxisAlignItems = 'CENTER'; r.setBoundVariable('itemSpacing', F['spacing-16']); return r; }
function sampleBox(r) { const b = figma.createFrame(); r.appendChild(b); b.name = 'образец'; b.resize(96, 32); b.fills = []; b.clipsContent = false; return b; }
const lg = await island('Легенда', 80, 0, 600);
const legend = [['solid', 'Действие пользователя'], ['dash', 'Событие системы, выход развилки · пунктир 12/8'], ['diamond', 'Развилка: вопрос, выходы подписаны условием'],
  ['label', 'Подпись перехода — у начала, на линии'], ['term', 'Начало, конец, выход «→ экран N»'], ['pin', 'Вопрос дизайнеру — список справа'], ['idea', 'Набросок: того, для чего нет компонента']];
for (const [k, txt] of legend) { const r = row(lg); const b = sampleBox(r);
  if (k === 'solid' || k === 'dash') { const v = figma.createVector(); b.appendChild(v); await v.setVectorNetworkAsync({ vertices:[{ x:0, y:0 }, { x:96, y:0, strokeCap:'ARROW_EQUILATERAL' }], segments:[{ start:0, end:1 }], regions:[] });
    v.y = 16; v.strokes = [P('line-annotation-flow')]; v.strokeWeight = 2; v.dashPattern = k === 'dash' ? [12, 8] : []; }
  if (k === 'diamond') { const p = figma.createPolygon(); b.appendChild(p); p.pointCount = 4; p.resize(32, 32); p.x = 32; p.fills = [P('bg-surface-main')]; p.strokes = [P('line-annotation-flow')]; p.strokeWeight = 2; }
  if (k === 'label') { const t = await T(b, 'условие', 'body-m', 'text-secondary', 16, 6); }
  if (k === 'term') { const t = await terminal(b, 'Start', 'Начало', 0, 16); }
  if (k === 'pin') { const i = C.tagIdea.createInstance(); b.appendChild(i); i.setProperties({ [prop(i, 'Number')]: '?1' }); i.x = 38; i.y = 6; }
  if (k === 'idea') { const z = figma.createRectangle(); b.appendChild(z); z.resize(64, 32); z.x = 16; z.fills = [P('bg-annotation-idea-fade')]; z.strokes = [P('line-annotation-idea')]; z.strokeWeight = 2; z.dashPattern = [8, 6]; bindR(z, 'radius-s'); }
  await T(r, txt, 'body-m', 'text-primary', 0, 0); }
const qs = await island('Вопросы дизайнеру', 720, 0, 600);
for (let i = 0; i < Q.length; i++) { const r = row(qs); r.counterAxisAlignItems = 'MIN';
  const pi = C.tagIdea.createInstance(); r.appendChild(pi); pi.setProperties({ [prop(pi, 'Number')]: '?' + (i + 1) });
  const t = await T(r, `Экран ${Q[i][0]} · ${Q[i][1]}`, 'body-m', 'text-primary', 0, 0); t.textAutoResize = 'HEIGHT'; t.resize(480, t.height); }
for (const n of hsec.children) if (n.type === 'INSTANCE' && n.name !== 'HeaderPage') n.y = hp.y + hp.height + 48;
const hH = Math.max(...hsec.children.map(n => n.y + n.height)) + 80;
hsec.resizeWithoutConstraints(Math.max(1376, ...hsec.children.map(n => n.x + n.width + 80)), hH);

// ---------- раскладка секций ----------
sec1.resizeWithoutConstraints(W1 + 160, sch1.y + sch1.height + 80);
sec2.resizeWithoutConstraints(W2 + 160, sch2.y + sch2.height + 80);
hsec.y = 80; sec1.y = hsec.y + hsec.height + 80; sec2.y = sec1.y + sec1.height + 80;
wrap.resizeWithoutConstraints(Math.max(hsec.width, sec1.width, sec2.width) + 160, sec2.y + sec2.height + 80);
log.wrap = wrap.id; log.header = hsec.id; log.hp = hp.id;
} catch (e) { wrap.remove(); return { error: String(e), stack: e.stack }; }
return log;
