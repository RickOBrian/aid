// persefona-9: «Основание» в шапке идеи по §6.8 (#537, persefona-figma-pages 0.14.0). New Rider DEV 5mg6h0oB8yRDoUfTruogca, секция v2 4388:5966.
// Тексты Product Logic не меняются: Subtitle делится на абзацы по границам предложений, слова те же (проверка — сборка обратно = исходный Subtitle).
const K = { st: { 'heading-s':'3e24e1f1618f2159a35c55d1087a40eee8354e12', 'body-m':'3a3b69e506572164e7cd8b0cb0585615dd88ed12', 'code-s':'dc6f78fc82ce91d3a06a28b1dabb01d17df35cca', 'body-s':'dede2b7c132add99b21cc5f0c90880b535b4ad26' },
  c: { 'text-primary':['f1ae466778bfebc4323580287007c99393922fea','#2C2C2F'], 'text-secondary':['4b2825ef9a779f55c1332634032ad0b4faa64e20','#6D6C72'],
       'text-accent-vivid':['949da370ec78b97f0149318b2cbaad9c292e8da7','#6A1FD0'] }, island:'0e644cfd615be781c53fa8bcb1f15195cda36b01' };
const S = {}; for (const k in K.st) S[k] = await figma.importStyleByKeyAsync(K.st[k]);
const C = {}; for (const k in K.c) C[k] = await figma.variables.importVariableByKeyAsync(K.c[k][0]);
const hex = h => ({ r: parseInt(h.slice(1, 3), 16) / 255, g: parseInt(h.slice(3, 5), 16) / 255, b: parseInt(h.slice(5, 7), 16) / 255 });
const P = k => figma.variables.setBoundVariableForPaint({ type:'SOLID', color: hex(K.c[k][1]) }, 'color', C[k]);
for (const s of Object.values(S)) await figma.loadFontAsync(s.fontName);
const sec = await figma.getNodeByIdAsync('4388:5966'), hp = await figma.getNodeByIdAsync('4388:5967'), schema = await figma.getNodeByIdAsync('4388:5968');
const pk = s => Object.keys(hp.componentProperties).find(k => k.startsWith(s));
const SUB = hp.componentProperties[pk('Subtitle')].value, HTR = hp.componentProperties[pk('How to Read')].value;
const [p1, p2, p3, p4] = SUB.split('\n');
const cut = p2.indexOf(' PRD «Pickup Points»'); const a = p2.slice(0, cut), b = p2.slice(cut + 1);
if ([p1, a + ' ' + b, p3, p4].join('\n') !== SUB) return { error:'разбиение Subtitle не сходится' };
const links = ['4395:6324', '4395:6325', '4389:7852']; const L = []; for (const id of links) { const t = await figma.getNodeByIdAsync(id); L.push({ id, txt:t.characters, h:t.getRangeHyperlink(0, t.characters.length) }); }
const htrNode = hp.findOne(n => n.type === 'TEXT' && n.name === 'How to Read'); const htrLink = htrNode.getRangeHyperlink(0, htrNode.characters.length);
const log = { new:[], removed:[] };
// карточка
const ib = (await figma.importComponentByKeyAsync(K.island)).createInstance(); sec.appendChild(ib); ib.name = 'Основание'; ib.x = hp.x; ib.y = hp.y + hp.height + 48;
ib.resize(hp.width, ib.height);
const ipk = s => Object.keys(ib.componentProperties).find(k => k.startsWith(s));
ib.setProperties({ [ipk('Show Footer')]: false }); // подвал «Для инженера» — не про основу макетов; абзац p4 — последней строкой body-s
const hs = ib.findOne(n => n.type === 'INSTANCE' && n.name === 'HeaderSection'); const hk = s => Object.keys(hs.componentProperties).find(k => k.startsWith(s));
hs.setProperties({ [hk('Title')]: 'Основание', [hk('Show Subtitle')]: false });
const slot = ib.findOne(n => n.type === 'SLOT'); for (const d of slot.children.slice()) d.remove();
async function T(chars, style, color, link) { const t = figma.createText(); slot.appendChild(t); await t.setTextStyleIdAsync(S[style].id); t.characters = chars; t.fills = [P(color)];
  t.textAutoResize = 'HEIGHT'; t.layoutSizingHorizontal = 'FILL'; if (link) t.setRangeHyperlink(0, chars.length, link); log.new.push(t.id); return t; }
async function norms(t) { // название PRD — heading-s, номер нормы R-… — code-s text-secondary
  for (const m of t.characters.matchAll(/PRD «[^»]+»/g)) await t.setRangeTextStyleIdAsync(m.index, m.index + m[0].length, S['heading-s'].id);
  for (const m of t.characters.matchAll(/R-[A-Z]+-[0-9]+(?:…[0-9]+)?(?:, [0-9]+)?/g)) { await t.setRangeTextStyleIdAsync(m.index, m.index + m[0].length, S['code-s'].id);
    t.setRangeFills(m.index, m.index + m[0].length, [P('text-secondary')]); } }
await T('Откуда идея', 'heading-s', 'text-primary');
await T(HTR, 'body-m', 'text-accent-vivid', htrLink);
for (const l of L) await T(l.txt, 'body-m', 'text-accent-vivid', l.h);
await T('Что требует PRD', 'heading-s', 'text-primary');
for (const p of [a, b, p3]) await norms(await T(p, 'body-m', 'text-primary'));
await T(p4, 'body-s', 'text-secondary'); // нужен стиль body-s: импорт по ключу dede2b7c…
// временное основание снимается
hp.setProperties({ [pk('Subtitle')]: p1, [pk('Show How to Read')]: false });
for (const id of links) { (await figma.getNodeByIdAsync(id)).remove(); log.removed.push(id); }
// схема ниже карточки
const dy = ib.y + ib.height + 80 - schema.y; schema.y += dy; sec.resizeWithoutConstraints(sec.width, sec.height + dy);
log.island = ib.id; log.dy = dy; log.check = { subtitle: p1, rebuilt: [p1, a + ' ' + b, p3, p4].join('\n') === SUB };
return log;
