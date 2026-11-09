// persefona-9 flow-ui: доска сравнения «а | б» для PD по С10, С11, С13–С16. Persefona Tokens 141:19, справа от макета 204:600.
// Фрагменты условные (экраны — заглушки 240 × 420), элементы — клоны из макета 204:600 и переменные/стили Tokens.
const page = await figma.getNodeByIdAsync('141:19'); await figma.setCurrentPageAsync(page);
const V = {}; for (const v of await figma.variables.getLocalVariablesAsync('COLOR')) V[v.name.split('/').pop()] = v;
const F = {}; for (const v of await figma.variables.getLocalVariablesAsync('FLOAT')) F[v.name.split('/').pop()] = v;
const ST = {}; for (const s of await figma.getLocalTextStylesAsync()) ST[s.name.split('/').pop()] = s;
for (const st of ['Regular', 'Medium']) await figma.loadFontAsync({ family:'Google Sans', style:st });
async function resolve(v) { let val = Object.values(v.valuesByMode)[0];
  while (val && val.type === 'VARIABLE_ALIAS') { const a = await figma.variables.getVariableByIdAsync(val.id); val = Object.values(a.valuesByMode)[0]; } return val; }
const RC = {}; for (const n of ['line-annotation-flow','bg-surface-main','bg-surface-muted','line-default','text-primary','text-secondary',
  'line-annotation-idea','bg-annotation-idea-fade']) RC[n] = await resolve(V[n]);
const P = n => { const c = RC[n]; return figma.variables.setBoundVariableForPaint({ type:'SOLID', color:{ r:c.r, g:c.g, b:c.b }, opacity:c.a ?? 1 }, 'color', V[n]); };
const bindR = (n, r) => { for (const k of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) n.setBoundVariable(k, F[r]); };
async function T(p, chars, style, color, x, y, w) { const t = figma.createText(); p.appendChild(t); await t.setTextStyleIdAsync(ST[style].id);
  t.characters = chars; t.fills = [P(color)]; if (w) { t.textAutoResize = 'HEIGHT'; t.resize(w, t.height); } else t.textAutoResize = 'WIDTH_AND_HEIGHT'; t.x = x; t.y = y; return t; }
const mock = await figma.getNodeByIdAsync('204:600');
const SRC = { plate: mock.findOne(n => n.name === 'TagFlow'), Start: mock.findOne(n => n.name === 'TagTerminal · Start'),
  End: mock.findOne(n => n.name === 'TagTerminal · End'), Exit: mock.findOne(n => n.name === 'TagTerminal · Exit') };
const TAG = await figma.importComponentByKeyAsync('ef004f976a258f3654937d9320a7c7915793f884');
const fr = (p, name, x, y, w, h) => { const f = figma.createFrame(); p.appendChild(f); f.name = name; f.fills = []; f.clipsContent = false; f.resize(w, h); f.x = x; f.y = y; return f; };
async function stub(p, x, y, n) { const f = figma.createFrame(); p.appendChild(f); f.name = `Экран ${n} · заглушка`; f.resize(240, 420); f.x = x; f.y = y;
  f.fills = [P('bg-surface-muted')]; f.strokes = [P('line-default')]; f.strokeWeight = 1; await T(f, `Экран ${n}`, 'body-s', 'text-secondary', 90, 200); return f; }
async function arrow(p, pts, dash) { const minX = Math.min(...pts.map(q => q[0])), minY = Math.min(...pts.map(q => q[1]));
  const v = figma.createVector(); p.appendChild(v); v.name = 'стрелка';
  await v.setVectorNetworkAsync({ vertices: pts.map((q, i) => ({ x:q[0] - minX, y:q[1] - minY, strokeCap: i === pts.length - 1 ? 'ARROW_EQUILATERAL' : 'NONE' })),
    segments: pts.slice(1).map((_, i) => ({ start:i, end:i + 1 })), regions: [] });
  v.x = minX; v.y = minY; v.strokes = [P('line-annotation-flow')]; v.strokeWeight = 2; v.dashPattern = dash || []; v.fills = []; v.setBoundVariable('cornerRadius', F['radius-s']); return v; }
async function plate(p, text, style, x, yc) { const c = SRC.plate.clone(); p.appendChild(c); const t = c.findOne(n => n.type === 'TEXT');
  await t.setTextStyleIdAsync(ST[style].id); t.characters = text; c.x = x; c.y = yc - c.height / 2; return c; }
async function cap(p, type, text, x, yc, right) { const c = SRC[type].clone(); p.appendChild(c); const t = c.findOne(n => n.type === 'TEXT'); t.characters = text;
  c.x = right ? x - c.width : x; c.y = yc - c.height / 2; return c; }
function pin(p, label, x, y) { const i = TAG.createInstance(); p.appendChild(i); i.name = 'вопрос';
  i.setProperties({ [Object.keys(i.componentProperties).find(k => k.startsWith('Number'))]: label }); i.x = x; i.y = y; return i; }
async function mini(p, frag, x, y, s, label) { const c = frag.clone(); p.appendChild(c); c.rescale(s); c.x = x; c.y = y; c.name = `фрагмент · ${Math.round(s * 100)} %`;
  await T(p, label || `${Math.round(s * 100)} %`, 'label-s', 'text-secondary', x, y - 24); return c; }
const D = [12, 8], D_OLD = [8, 6];

const board = figma.createSection(); page.appendChild(board); board.name = 'Flow · ideas · сравнение для PD';
board.fills = [P('bg-surface-main')]; board.strokes = [P('line-default')]; board.x = mock.x + mock.width + 80; board.y = 0;
const log = { board: board.id, rows: {} };
try {
const head = await T(board, 'Сравнение для PD · #534 Б: на каждый вопрос — «а» (рекомендация Standards · Persefona) и «б» на одном фрагменте', 'heading-l', 'text-primary', 80, 80, 2900);
let Y = head.y + head.height + 64;
async function row(code, title, A, B) {
  const r = fr(board, `${code} · ${title}`, 80, Y, 3000, 100); log.rows[code] = r.id;
  await T(r, `${code} · ${title}`, 'heading-m', 'text-primary', 0, 0);
  let h = 0;
  for (const [i, v] of [A, B].entries()) {
    const pnl = fr(r, `${code} · ${'аб'[i]}`, i * 1520, 48, 1440, 100);
    await T(pnl, `${'аб'[i]} · ${v.name}`, 'heading-s', 'text-primary', 0, 0);
    await T(pnl, v.what, 'body-m', 'text-secondary', 0, 28, 1400);
    const ch = await v.make(pnl, 96); pnl.resize(1440, ch + 96); h = Math.max(h, pnl.height);
  }
  r.resize(3000, h + 48); Y += r.height + 120; }

// С10 — стиль подписи
const c10 = style => async (p, y0) => { const f = fr(p, 'фрагмент · 100 %', 0, y0 + 24, 1040, 420);
  await stub(f, 0, 0, 1); await stub(f, 400, 0, 2); await stub(f, 800, 0, 3);
  await arrow(f, [[240, 140], [400, 140]]); await plate(f, 'отпустил пин', style, 256, 140);
  await arrow(f, [[640, 140], [800, 140]], D); await plate(f, 'в зоне подачи', style, 656, 140);
  await T(p, '100 %', 'label-s', 'text-secondary', 0, y0); await mini(p, f, 1120, y0 + 24, 0.25); return 24 + 420; };
await row('С10', 'Подпись перехода: размер текста в плашке TagFlow',
  { name:'body-m, 14 px — предлагаю', what:'Подпись на линии текстом 14 px: читается на обзоре схемы.', make:c10('body-m') },
  { name:'body-s, 13 px — как в §6.8 сейчас', what:'Та же плашка, текст 13 px — как у подписей сейчас.', make:c10('body-s') });

// С11 — терминалы
await row('С11', 'Начало, конец и выход схемы: капсулы TagTerminal',
  { name:'капсулы Start / End / Exit — предлагаю', what:'У схемы видно начало и конец; переход со схемы — ссылка «→ …», а не линия в пустоту.',
    make: async (p, y0) => { const f = fr(p, 'фрагмент', 0, y0, 1100, 680);
      await stub(f, 200, 80, 1); await stub(f, 600, 80, 2);
      const s = await cap(f, 'Start', 'Начало', 160, 220, true); await arrow(f, [[160, 220], [200, 220]]);
      await arrow(f, [[440, 220], [600, 220]]); await plate(f, 'отпустил пин', 'body-m', 456, 220);
      await arrow(f, [[840, 220], [920, 220]], D); await cap(f, 'Exit', '→ Where 2257-30368', 920, 220);
      await arrow(f, [[720, 500], [720, 600]]); const e = await cap(f, 'End', 'Конец', 720, 620); e.x = 720 - e.width / 2; e.y = 600; return 680; } },
  { name:'без капсул — как сейчас', what:'Переход «уходит» в пустое место (как 4302:11600); начала у схемы нет.',
    make: async (p, y0) => { const f = fr(p, 'фрагмент', 0, y0, 1100, 680);
      await stub(f, 200, 80, 1); await stub(f, 600, 80, 2);
      await arrow(f, [[440, 220], [600, 220]]); await T(f, 'отпустил пин', 'body-s', 'text-secondary', 456, 196);
      await arrow(f, [[720, 80], [720, 0]], D_OLD); await T(f, 'Доступная зона → как сейчас: пин «загрузка» → время подачи', 'body-s', 'text-secondary', 740, 0, 300); return 680; } });

// С13 — пунктир
const c13 = (dash, name) => async (p, y0) => { const f = fr(p, 'фрагмент · 100 %', 0, y0 + 24, 1040, 420);
  await stub(f, 0, 0, 1); await stub(f, 400, 0, 2); const c = await stub(f, 800, 0, 3);
  await arrow(f, [[240, 140], [400, 140]]); await plate(f, 'сплошная', 'body-m', 256, 140);
  await arrow(f, [[640, 140], [800, 140]], dash); await plate(f, name, 'body-m', 656, 140);
  const z = figma.createRectangle(); c.appendChild(z); z.name = 'набросок · зона'; z.resize(160, 120); z.x = 40; z.y = 240;
  z.fills = [P('bg-annotation-idea-fade')]; z.strokes = [P('line-annotation-idea')]; z.strokeWeight = 2; z.dashPattern = D_OLD; bindR(z, 'radius-xl');
  await T(p, '100 % · справа на экране 3 — набросок, пунктир 8/6', 'label-s', 'text-secondary', 0, y0); await mini(p, f, 1120, y0 + 24, 0.25); return 24 + 420; };
await row('С13', 'Пунктир перехода (событие системы)',
  { name:'12/8 — предлагаю', what:'Переход 12/8, набросок 8/6: при 25 % пунктир не сливается в сплошную и не похож на набросок.', make:c13(D, 'пунктир 12/8') },
  { name:'8/6 — как в §6.8 сейчас', what:'Переход и набросок одним шагом 8/6; при 25 % пунктир читается почти как сплошная.', make:c13(D_OLD, 'пунктир 8/6') });

// С14 — маршрутизация
await row('С14', 'Маршрутизация: возврат и вход в экран',
  { name:'канал над рядом и капсула — предлагаю', what:'Возврат в своём ряду — каналом над рядом, вход сверху на 2/3; возврат в другой ряд — капсула «→ экран 1». Пересечений нет.',
    make: async (p, y0) => { const f = fr(p, 'фрагмент', 0, y0, 1100, 1200);
      await stub(f, 0, 120, 1); await stub(f, 400, 120, 2); await stub(f, 800, 120, 3); await stub(f, 400, 760, 4);
      await arrow(f, [[240, 260], [400, 260]]); await arrow(f, [[640, 260], [800, 260]]);
      await arrow(f, [[960, 120], [960, 40], [160, 40], [160, 120]]); await plate(f, 'сменить точку', 'body-m', 784, 40); f.children.at(-1).x = 960 - 16 - f.children.at(-1).width;
      await arrow(f, [[520, 540], [520, 760]], D); await plate(f, 'вне зоны', 'body-m', 0, 0); const pl = f.children.at(-1); pl.x = 520 - pl.width / 2; pl.y = 556;
      await arrow(f, [[640, 900], [800, 900]]); await plate(f, 'передвинул пин', 'body-m', 656, 900); await cap(f, 'Exit', '→ экран 1', 800, 900); return 1200; } },
  { name:'линии через ряд — как было', what:'Возврат идёт через экран 2 и пересекает переходы; вход в экран снизу, через подписи.',
    make: async (p, y0) => { const f = fr(p, 'фрагмент', 0, y0, 1100, 1200);
      await stub(f, 0, 120, 1); await stub(f, 400, 120, 2); await stub(f, 800, 120, 3); await stub(f, 400, 760, 4);
      await arrow(f, [[240, 260], [400, 260]]); await arrow(f, [[640, 260], [800, 260]]);
      await arrow(f, [[800, 420], [240, 420]]); await T(f, 'сменить точку', 'body-s', 'text-secondary', 560, 392);
      await arrow(f, [[520, 540], [520, 760]], D_OLD); await T(f, 'вне зоны', 'body-s', 'text-secondary', 532, 600);
      await arrow(f, [[400, 900], [320, 900], [320, 340], [240, 340]], D_OLD); await T(f, 'передвинул пин', 'body-s', 'text-secondary', 330, 860); return 1200; } });

// С15 — вопросы
await row('С15', 'Вопросы дизайнеру: номера и список',
  { name:'«?1…?n» и список в шапке — предлагаю', what:'Пин с номером снаружи угла экрана, тексты — списком в блоке «Вопросы дизайнеру». Ниже — случай больше 9 вопросов.',
    make: async (p, y0) => { const f = fr(p, 'фрагмент', 0, y0, 1400, 760);
      const a = await stub(f, 0, 40, 1), b = await stub(f, 400, 40, 2); await arrow(f, [[240, 180], [400, 180]]);
      pin(f, '?1', 248, 12); pin(f, '?2', 648, 12); pin(f, '?3', 648, 300);
      const q = fr(f, 'Вопросы дизайнеру', 760, 40, 600, 300); await T(q, 'Вопросы дизайнеру', 'heading-s', 'text-primary', 0, 0);
      const qs = ['Экран 1 · Время подачи считаем от пина или от точки?', 'Экран 2 · Как пин примагничивается — в PRD нет.', 'Экран 2 · Нужен ли отдельный информационный вид плашки?'];
      for (let i = 0; i < qs.length; i++) { pin(q, '?' + (i + 1), 0, 44 + i * 40); await T(q, qs[i], 'body-m', 'text-primary', 32, 44 + i * 40, 540); }
      await T(f, 'Больше 9 вопросов: круг TagMarker 20 px — «?10» и «?12» в него не входят. Решение — правка TagMarker, когда понадобится.', 'body-m', 'text-secondary', 0, 560, 1300);
      pin(f, '?9', 0, 620); pin(f, '?10', 60, 620); pin(f, '?12', 120, 620); return 760; } },
  { name:'безномерные «?» у экрана — как в §6.8 сейчас', what:'Знак «?» и текст справа от экрана; при сетке 390 + 160 текст в промежуток не входит, номера нет.',
    make: async (p, y0) => { const f = fr(p, 'фрагмент', 0, y0, 1400, 760);
      await stub(f, 0, 40, 1); await stub(f, 760, 40, 2);
      pin(f, '?', 252, 40); await T(f, 'Время подачи считаем от пина или от точки?', 'body-m', 'text-primary', 280, 38, 320);
      pin(f, '?', 252, 140); await T(f, 'Как пин примагничивается — в PRD нет.', 'body-m', 'text-primary', 280, 138, 320);
      await arrow(f, [[240, 380], [760, 380]]); pin(f, '?', 1012, 40); await T(f, 'Нужен ли информационный вид плашки?', 'body-m', 'text-primary', 1040, 38, 320); return 760; } });

// С16 — легенда и секции (уменьшенные копии макета 204:600)
const kids = id => figma.getNodeByIdAsync(id);
const hsec = await kids('204:764'), sec1 = await kids('204:601'), sec2 = await kids('204:612');
await row('С16', 'Схема больше 12 экранов: легенда и секции по подсценариям',
  { name:'легенда в шапке и секции — предлагаю', what:'Шапка с легендой и вопросами, оглавление ведёт на секции «1 · Точка подачи» и «2 · Заказ». Макет 204:600, 13 экранов, 15 %.',
    make: async (p, y0) => { const m = fr(p, 'мини · а', 0, y0 + 24, mock.width, mock.height); m.fills = [P('bg-surface-main')];
      for (const s of [hsec, sec1, sec2]) { const box = fr(m, s.name, s.x, s.y, s.width, s.height); box.strokes = [P('line-default')]; box.strokeWeight = 4;
        for (const c of s.children) { const k = c.clone(); box.appendChild(k); k.x = c.x; k.y = c.y; } }
      m.rescale(0.15); await T(p, '15 %', 'label-s', 'text-secondary', 0, y0); return 24 + m.height; } },
  { name:'без легенды, одной схемой', what:'Те же 13 экранов одной полосой: шапка без легенды, без секций и оглавления.',
    make: async (p, y0) => { const s1 = sec1.findChild(n => n.name === 'Схема'), s2 = sec2.findChild(n => n.name === 'Схема');
      const hp = hsec.findChild(n => n.name === 'HeaderPage');
      const m = fr(p, 'мини · б', 0, y0 + 24, 80 + s1.width + 160 + s2.width + 80, 80 + hp.height + 80 + Math.max(s1.height, s2.height) + 80); m.fills = [P('bg-surface-main')];
      m.strokes = [P('line-default')]; m.strokeWeight = 4;
      const h = hp.clone(); m.appendChild(h); h.x = 80; h.y = 80;
      const a = s1.clone(); m.appendChild(a); a.x = 80; a.y = h.y + h.height + 80;
      const b = s2.clone(); m.appendChild(b); b.x = a.x + a.width + 160; b.y = a.y;
      m.rescale(0.15); await T(p, '15 %', 'label-s', 'text-secondary', 0, y0); return 24 + m.height; } });

board.resizeWithoutConstraints(3240, Y + 40);
} catch (e) { board.remove(); return { error: String(e), stack: e.stack }; }
return log;
