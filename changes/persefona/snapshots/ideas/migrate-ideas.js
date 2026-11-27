// persefona-9 (AID-84): перевод страницы «💡 PRD idea · Главная» (New Rider DEV 5mg6h0oB8yRDoUfTruogca, 4302:11524) на Kit.
// По документу changes/persefona-9-ideas-2026-10-28.md §7, §8 и §6.8 правила (#521). Библиотеки не подключаются — импорт по ключу;
// у каждой краски запасной цвет = значение переменной.
const K = {
  st: { 'heading-m':'d32fb5988525a89ba76beb164f50ceb280893fbf','heading-s':'3e24e1f1618f2159a35c55d1087a40eee8354e12',
        'body-m':'3a3b69e506572164e7cd8b0cb0585615dd88ed12','body-s':'dede2b7c132add99b21cc5f0c90880b535b4ad26' },
  c: { 'text-primary':['f1ae466778bfebc4323580287007c99393922fea','#2C2C2F'], 'text-secondary':['4b2825ef9a779f55c1332634032ad0b4faa64e20','#6D6C72'],
       'text-accent-vivid':['949da370ec78b97f0149318b2cbaad9c292e8da7','#6A1FD0'], 'surface-main':['125448d6c36643d97f23500c7b74b1874738c645','#FFFFFF'],
       'flow':['819c2d29c79b3cf223ce5bff6c7e8478cf6a0d8d','#616166'], 'idea-line':['8570eab4d838eaf1505423ad99214cb28672aee8','#B44A00'],
       'idea-main':['62990a2aa67326a45c618c98a97dde97f8a30b54','#B44A00'], 'idea-fade':['e11c70b964d0dec0a33d0bf79e048bd86691b3b3','#B44A00',0.08],
       'outline':['ac2b597dfdd9007710e08715abe36b288b8837f1','#FFFFFF'] },
  r: { 'radius-xl':'c0fef2998af49f2638481b5cf3968e5d2b0bb727' },
  comp: { headerPage:'21df81e076e13e27d067cc374c63bc38bdbea9e3', badgeNeutral:'969d7acc320e983331f6a43ae3ae1d5016679e7c',
          tagIdea:'ef004f976a258f3654937d9320a7c7915793f884' },
};
const ID = {
  page:'4302:11524', root:'4302:11525', title:'4302:11526', sub:'4302:11527',
  clones:['4302:11528','4302:11560','4302:11602','4302:12061'],
  screenTitles:['4302:11558','4302:11593','4302:12048','4302:12449'],
  screenDescs:['4302:11559','4302:11594','4302:12049','4302:12450'],
  flowLabels:['4302:11596','4302:11601','4302:12047','4302:12060','4302:12448','4302:12458'],
  questions:['4302:12052','4302:12055','4302:12058','4302:12453','4302:12456'],
  pins:[['4302:12050','4302:12051'],['4302:12053','4302:12054'],['4302:12056','4302:12057'],['4302:12451','4302:12452'],['4302:12454','4302:12455']],
  diamond:'4302:11597', diamondText:'4302:11598',
  // П1 (Product Logic): пунктир — событие системы и выходы развилки; сплошная — действие пользователя
  dashed:['4302:11600','4302:12046','4302:12447','4303:5942'], solid:['4302:11595','4302:11599','4302:12059'],
  zone:'4302:12441', points:['4302:12442','4302:12443','4302:12444'], released:'4302:12445', path:'4303:5941',
  // С7 / П3: ссылки над клонами 1 и 2
  links:[['4302:11528','2257:30320'],['4302:11560','2257:31004']],
};
const S={}, C={}, log={ changed:0, new:[], removed:[] };
for (const k in K.st) S[k] = await figma.importStyleByKeyAsync(K.st[k]);
for (const k in K.c) C[k] = await figma.variables.importVariableByKeyAsync(K.c[k][0]);
const RXL = await figma.variables.importVariableByKeyAsync(K.r['radius-xl']);
const rgb = h => ({ r:parseInt(h.slice(1,3),16)/255, g:parseInt(h.slice(3,5),16)/255, b:parseInt(h.slice(5,7),16)/255 });
const paint = k => figma.variables.setBoundVariableForPaint({ type:'SOLID', color:rgb(K.c[k][1]), opacity:K.c[k][2] ?? 1 }, 'color', C[k]);
const N = id => figma.getNodeByIdAsync(id);
async function style(id, st, col) { const t = await N(id); await figma.loadFontAsync(t.fontName); await t.setTextStyleIdAsync(S[st].id); t.fills = [paint(col)]; log.changed++; return t; }
const page = await N(ID.page); await figma.setCurrentPageAsync(page);
const root = await N(ID.root);
for (const st of Object.values(S)) await figma.loadFontAsync(st.fontName);

// 1. Подписи экранов, переходов, вопросов, развилки
for (const id of ID.screenTitles) await style(id, 'heading-m', 'text-primary');
for (const id of ID.screenDescs) await style(id, 'body-m', 'text-secondary');
for (const id of ID.flowLabels) await style(id, 'body-s', 'text-secondary');
for (const id of ID.questions) await style(id, 'body-m', 'text-primary');
await style(ID.diamondText, 'heading-s', 'text-primary');

// 2. Стрелки и ромб — геометрия не меняется
for (const id of [...ID.dashed, ...ID.solid]) { const v = await N(id); v.strokes = [paint('flow')]; v.strokeWeight = 2; v.dashPattern = ID.dashed.includes(id) ? [8,6] : []; log.changed++; }
{ const d = await N(ID.diamond); d.fills = [paint('surface-main')]; d.strokes = [paint('flow')]; d.strokeWeight = 2; log.changed++; }

// 3. Пины вопросов → TagMarker Set=Idea, «?», центр прежний
const TAG = await figma.importComponentByKeyAsync(K.comp.tagIdea);
for (const [eId, qId] of ID.pins) {
  const e = await N(eId), q = await N(qId); const cx = e.x + e.width/2, cy = e.y + e.height/2;
  const i = TAG.createInstance(); const par = e.parent; par.insertChild(par.children.indexOf(e), i);
  const nk = Object.keys(i.componentProperties).find(k => k.startsWith('Number')); i.setProperties({ [nk]:'?' });
  i.name = 'вопрос'; i.x = Math.round(cx - i.width/2); i.y = Math.round(cy - i.height/2);
  log.new.push(i.id); log.removed.push(eId, qId); e.remove(); q.remove();
}

// 4. Набросок поверх клона 4: id и геометрия прежние, кроме радиуса зоны (П4)
{ const z = await N(ID.zone); z.fills = [paint('idea-fade')]; z.strokes = [paint('idea-line')]; z.strokeWeight = 2; z.dashPattern = [8,6];
  for (const c of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) z.setBoundVariable(c, RXL); log.changed++; }
for (const id of ID.points) { const p = await N(id); p.fills = [paint('idea-main')]; p.strokes = [paint('outline')]; p.strokeWeight = 2; log.changed++; }
{ const r = await N(ID.released); r.fills = []; r.strokes = [paint('idea-line')]; r.strokeWeight = 2; log.changed++; }
{ const p = await N(ID.path); p.strokes = [paint('idea-line')]; p.strokeWeight = 2; p.dashPattern = [8,6]; log.changed++; }

// 5. Ссылки над клонами 1 и 2: «→ <Страница> › <Фрейм>», body-s text-accent-vivid
for (const [cloneId, origId] of ID.links) {
  const clone = await N(cloneId), orig = await N(origId);
  let pg = orig; while (pg.type !== 'PAGE') pg = pg.parent;
  const t = figma.createText(); root.appendChild(t); await t.setTextStyleIdAsync(S['body-s'].id);
  t.characters = '→ ' + pg.name + ' › ' + orig.name; t.fills = [paint('text-accent-vivid')];
  t.hyperlink = { type:'NODE', value: orig.id }; t.name = 'Ссылка на оригинал';
  t.textAutoResize = 'HEIGHT'; t.resize(cloneId === ID.clones[0] ? 180 : 390, t.height); t.x = clone.x; t.y = clone.y - 12 - t.height;
  log.new.push(t.id + ' ' + t.characters);
}

// 6. Секция идеи: HeaderPage сверху, под ним корень (§6.8, С6 а)
const sec = figma.createSection(); page.appendChild(sec); sec.name = root.name; sec.fills = [paint('surface-main')];
const HP = await figma.importComponentByKeyAsync(K.comp.headerPage); const hp = HP.createInstance(); sec.appendChild(hp); hp.name = 'HeaderPage';
const tTitle = await N(ID.title), tSub = await N(ID.sub);
const p = hp.componentProperties; const key = s => Object.keys(p).find(k => k.startsWith(s));
const titles = []; for (const id of ID.screenTitles) titles.push((await N(id)).characters);
hp.setProperties({ [key('Title')]:tTitle.characters, [key('Subtitle')]:tSub.characters, [key('Show How to Read')]:false,
  [key('Show Cover Link')]:false, [key('Contents')]:titles.join('\n') });
const slot = hp.findOne(n => n.type === 'SLOT'); const def = slot.children.slice();
const BN = await figma.importComponentByKeyAsync(K.comp.badgeNeutral);
for (const text of ['Идея, не макет', 'AID-84 · Product Logic']) { const b = BN.createInstance(); b.name = 'Badge';
  const tk = Object.keys(b.componentProperties).find(k => k.startsWith('Text')); b.setProperties({ [tk]:text }); slot.appendChild(b); }
for (const d of def) d.remove();
// содержание шапки — ссылки на экраны
const ct = hp.findOne(n => n.type === 'TEXT' && n.name === 'Contents');
if (ct) { await figma.loadFontAsync(ct.fontName); let pos = 0; for (let i = 0; i < titles.length; i++) { ct.setRangeHyperlink(pos, pos + titles[i].length, { type:'NODE', value: ID.clones[i] }); pos += titles[i].length + 1; } }
log.removed.push(tTitle.id, tSub.id); tTitle.remove(); tSub.remove();
root.fills = [paint('surface-main')];
hp.x = 80; hp.y = 80; sec.appendChild(root); root.x = 80; root.y = hp.y + hp.height + 48;
sec.resizeWithoutConstraints(Math.max(hp.width, root.width) + 160, root.y + root.height + 80);
log.new.push('section ' + sec.id, 'HeaderPage ' + hp.id);
return log;
