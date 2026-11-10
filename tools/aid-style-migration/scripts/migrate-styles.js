// Перенос стилей и переменных на New Rider DEV (5mg6h0oB8yRDoUfTruogca) через use_figma.
// Маппинг — mappings/new-rider-dev.final.md; прогон 2026-11-02 — mappings/new-rider-dev.run-taxi.md.
// Тело для use_figma: в начало вставить
//   const DRY = true|false;      // true — только счётчики, узлы не меняются
//   const SHOT = true|false;     // скриншот каждого корня
//   const PAGE_ID = '<id>';      // страница-копия (scripts/clone-page.js)
//   const ROOTS = ['<id>', ...]; // экраны на странице-копии; [] — все дети страницы
//   const MAXIDS = 200;          // сколько ID узлов отдавать на каждую причину пропуска
//   const SHALLOW = true;        // необязательно: только сами корни, без детей (добивка контейнеров, разбитых на детей)
// Прогон Taxi for friends в DEV: PAGE_ID = '4770:4437'.
const page = await figma.getNodeByIdAsync(PAGE_ID);
await figma.setCurrentPageAsync(page);
const RIDER = 'Rider';
// кэш импорта на весь вызов use_figma (globalThis живёт между порциями run-page): импорт стиля ~0,4 с, переменной ~0,9 с (RUNBOOK, 06.11)
const MC = globalThis.__migCache || (globalThis.__migCache = { lib: null, v: {}, st: {} });
if (!MC.lib) {
  const cols = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
  const lib = {};
  for (const c of cols.filter(c => c.libraryName.includes(RIDER) && ['color-sem','space','radius'].includes(c.name))) {
    for (const v of await figma.teamLibrary.getVariablesInLibraryCollectionAsync(c.key)) lib[v.name] = v.key;
  }
  MC.lib = lib;
}
const libVars = MC.lib;
const getVar = name => MC.v[name] || (MC.v[name] = libVars[name] ? figma.variables.importVariableByKeyAsync(libVars[name]) : Promise.resolve(null));
const NEWTS = {'Bodies/Body 1':'efedd6ccce9601aed048863321ec05f65e587b30','Bodies/Body 2':'879e5c53e856e0bc15d54d02ad28ba88c8661808','Bodies/Body 3':'ec7ba478b0d45f0e20fb5528ffaa75dcff5aef72','Subtitles/Subtitle 1':'1449afde1d818486460f295669af22fd99a3a6cf','Subtitles/Subtitle 2':'746b9479314cb405d3340bd358049e486ae0f6d6','Subtitles/Subtitle 3':'a033bddf111be09f0149088dcb5c1eaa529ebd04','Titles/Title 4':'9395aad5c31672c7a765e20f36e1b39e00ccbc43','Titles/Title 3':'9a6c623ccfe842d1d9e8d0e428d12e6cf1d0d810','Captions/Caption 1':'97bf66024e167e387564b809893c702b464ddd42','Captions/Caption 1 CAP':'297879960c9a9a1feda979b1b9070563b06d858b','Captions/Caption 2':'0c2e5ea7ad30281d26df7c68b67043c3fa2286e8','Outstanding/Title-title2 (NRD)':'99bb5b186e90da50ee7e4b10fc0f3c13bb11acc0','Outstanding/NRD - Body':'3274cd72b8250998e9c07a468850a85e91046616','Outstanding/iOS - Subtitle':'41b59fcc0bdb4acd56c581073e5cd1d1693eca78','Titles/Title 1':'a0002690326ec64b856a97c9d41fe5f6df1b0cbb','Outstanding/iOS - Subtitle L':'c6696a50a2857a9359cc8da399263396c46a95ba','Outstanding/NRD - Action Bold':'c590f2c56eab32713a2871abe0a60c727a29ef2b',
  // анкета norule п.9 (10.11): создан в библиотеке, ключ работает после публикации; до неё importStyle падает, узел идёт в пропуск
  'Captions/Caption 1 Semibold':'5ef7e054f947aab99fce088cee9e2ed25465f776',
  // arturuxui 10.11: SF Pro Text 10/16 вместо ALS Hauss; ключи работают после публикации библиотеки
  'Captions/Caption 3':'0ef7069b3e53687e26689565e2596e45d8312cfe','Captions/Caption 3 Medium':'1e8270a4e9882df354b5d44debaa19452abc2029'};
const GRAD_TOP = '60768af36ab7413fa8e0b2bdb8f5c47a01d4893f'; // Gradients/Top, библиотека Rider (п.11)
const NEWFX = {'Shadows/Medium':'24e56e6c62ec393588115cc830067695312b5f3f','Shadows/Large':'2a1e49f9eeaff377e4ae4c15604af5c70adca4f5','Shadows/Bottom Sheet':'4f1d0ff4979eced4e144c149ac11c18267dba137','Shadows/Small':'647aa3864c4c1801f9363745ef570bc175e98384','Shadows/FAB':'0dfac2ccdab87fdc913dc307e0b92ab682665cae','Shadows/Knob':'bb489e915a6510dd8c254da1671190b6528eb40a','Glass/Navbar':'5fed574145af7feb54f3d0e5d8df295cbafe4905'};
const NEWKEYS = new Set([...Object.values(NEWTS), ...Object.values(NEWFX), '5b2d5ab81c5badb00c28c93153a3479d73444229']); // + Shadows/Large Air (новый)
const TS_MAP = {'Caption/caption':'Captions/Caption 2','Title/title2':'Outstanding/Title-title2 (NRD)',
  // final.md §5: draft, п.29а–31а
  'Bodies/Body 3 Reg':'Bodies/Body 3','iOS / Subtitle':'Outstanding/iOS - Subtitle','iOS / Caption':'Bodies/Body 3','iOS / H3':'Titles/Title 3',
  // Drafts, сверка п.5 (new-rider-drafts.sverka.md, 03.11): полное совпадение
  'Captions/Caption':'Captions/Caption 1','iOS / Subtitle L':'Outstanding/iOS - Subtitle L',
  // анкета повторного прогона (new-rider-drafts.rerun-questions.md) п.5–8
  'iOS / H4':'Outstanding/NRD - Action Bold','iOS / H2':'Titles/Title 3',
  'Title/title2 — pig':'Outstanding/Title-title2 (NRD)','Body/body — horse':'Bodies/Body 2',
  // анкета norule п.3а (arturuxui 2026-11-10): ALS Hauss Medium 17/20 → NRD - Body (SF Pro Semibold 17/20)
  'Action/actionAccent — miniPig':'Outstanding/NRD - Body',
  // п.9: Caption 3 = SF Pro Semibold 12/16, трекинг 0. Caption 3/Regular и /Medium (ALS Hauss 10/16) — не маппить
  'Captions/Caption 3':'Captions/Caption 1 Semibold',
  // старые Caption 3/Regular и /Medium (ALS Hauss VF 10/16) → наши SF Pro Text 10/16
  'Caption 3/Regular':'Captions/Caption 3','Caption 3/Medium':'Captions/Caption 3 Medium'};
const FX_MAP = {'Shadows/[day] Medium':'Shadows/Medium','Shadows/[day] Large':'Shadows/Large','Shadow 6':'Shadows/Bottom Sheet','Shadows / Brand button':null,
  // Drafts, анкета п.25, 28
  'Shadows / [day] Small':'Shadows/Small','Shadows/[day] Small':'Shadows/Small','[day] Small':'Shadows/Small','Shadows / Bottom-sheet':'Shadows/Small','Shadows/[day] Mini':'Shadows/Small',
  'Shadows / [day] Brand button':null,'Shadows/Brand button':null,'Shadows/Brand Button':null,
  // анкета покрытия (new-rider-drafts.coverage-questions.md) п.7
  'shadow/diffuse/m':'Shadows/Small','shadow/diffuse/s':'Shadows/Small'};
NEWFX['Shadows/Large Air'] = '5b2d5ab81c5badb00c28c93153a3479d73444229';
// сырые тени, совпадающие с новыми стилями (анкета п.26)
const RAWFX = {'drop 0,6 r20 s0 #000000@0.08':'Shadows/Medium','drop 0,8 r36 s0 #000000@0.16':'Shadows/Large Air','drop 0,3 r5 s0 #000000@0.20 + drop 0,1 r18 s0 #000000@0.08 + drop 0,6 r10 s0 #000000@0.14':'Shadows/Bottom Sheet',
  // анкета покрытия п.1, 2
  'drop 0,4 r12 s0 #000000@0.10':'Shadows/FAB','drop 0,3 r1 s0 #000000@0.06 + drop 0,3 r8 s0 #000000@0.15':'Shadows/Knob'};
// анкета покрытия п.3: Glass/Navbar только при полном совпадении, включая inner shadow (fxSig их параметры не показывает)
const GLASS = 'GLASS 50 + I 0,8 r30 s-40 #e6e6e6 + I 0,-8 r10 s-40 #282828@0.25 + I 0,8 r10 s-40 #282828@0.25 + D 0,8 r15 s0 #000000@0.02 + D 0,0 r0 s0.5 #e8e8e8 + D -1.25,0 r0 s-0.75 #d0d0d0 + D 1.25,0 r0 s-0.75 #d0d0d0';
const fxFull = n => n.effects.filter(e => e.visible !== false).map(e => e.offset ? `${e.type[0]} ${e.offset.x},${e.offset.y} r${e.radius} s${e.spread || 0} #${hex(e.color)}${e.color.a < 1 ? '@' + e.color.a.toFixed(2) : ''}` : `${e.type} ${e.radius}`).join(' + ');
const fxSig = n => n.effects.filter(e => e.visible !== false).map(e => e.type === 'DROP_SHADOW' ? `drop ${e.offset.x},${e.offset.y} r${e.radius} s${e.spread || 0} #${hex(e.color)}${e.color.a < 1 ? '@' + e.color.a.toFixed(2) : ''}` : e.type.toLowerCase()).join(' + ');
// цвет: имя стиля/переменной → {text, frame, shape, stroke}
const C = {
 'Background [day]/Primary': {frame:'Background/Primary', shape:'Icon/Primary Inverted', stroke:'Stroke/Secondary'},
 'Bg day/primary': {frame:'Background/Primary', shape:'Icon/Primary Inverted'},
 'Background [day]/Secondary': {frame:'Background/Secondary'},
 'Background [day]/Quaternary': {frame:'Background/Quaternary'},
 'Background [day]/Attention': {frame:'Background/Attention'},
 'Background [day]/Constant Dark Secondary': {frame:'Background/Constant Dark Secondary'},
 'Text [day]/Primary': {text:'Text/Primary', shape:'Icon/Primary'},
 'Text [day]/Secondary': {text:'Text/Secondary', stroke:'Stroke/Separator'},
 'Text [day]/Tertiary': {text:'Text/Tertiary'}, 'Texts day/Tertiary': {text:'Text/Tertiary'},
 'Text [day]/Accent': {text:'Text/Accent'},
 // анкета norule п.4 (arturuxui 2026-11-10): на фрейме → Background/Warning
 'Text [day]/Warning': {frame:'Background/Warning'},
 // анкета norule п.10а, 12а (arturuxui 2026-11-10)
 'Button [day]/Warning': {frame:'Background/Warning'},
 'theme:bg/accentSecondary': {frame:'Tint/Accent'}, 'Theme:controls/bg/accentSecondaryLight/pressed': {frame:'Tint/Accent'},
 'Text [day]/Constant White': {text:'Text/Constant White', shape:'Icon/Constant White'},
 'Text [day]/Constant White Secondary': {text:'Text/Constant White Secondary'},
 'Texts night/Primary': {shape:'Icon/Constant White'},
 // анкета повторного прогона п.2, 3 (имя « Night / White» — с ведущим пробелом)
 ' Night / White': {text:'Text/Constant White', shape:'Icon/Constant White', iconOnly:true},
 'Gray / 40%': {text:'Text/Tertiary'},
 'Icon [day]/Primary': {shape:'Icon/Primary'}, 'Icon [day]/Accent': {shape:'Icon/Accent'},
 'Icon [day]/Secondary': {shape:'Icon/Secondary'}, 'Icon [day]/Tertiary': {shape:'Icon/Tertiary'},
 'Icon [day]/Constant White': {shape:'Icon/Constant White'},
 'Icons day/Secondary Pressed': {shape:'Icon/Secondary', stroke:'Icon/Secondary'},
 'Icon [day]/Secondary Opposite': {shape:'Icon/Disabled'},
 'Icons day/primary 2': {shape:'Icon/Primary Inverted'},
 'White': {shape:'Icon/Constant White'},
 'Field [day]/Primary': {frame:'Field/Primary'}, 'Button [day]/Primary': {frame:'Button/Primary'}, 'Button [day]/Secondary': {frame:'Button/Secondary'},
 'Route [day]/Primary': {stroke:'Route/Primary'},
 'Day / Black': {text:'Text/Primary', shape:'Icon/Primary'},
 'Day / Gray 40': {text:'Text/Tertiary'}, 'Day / Gray 60': {text:'Text/Secondary'}, 'Day / Gray 80': {frame:'Pastel/Apu', shape:'Pastel/Apu'},
 'Day / White': {frame:'Background/Constant White', shape:'Icon/Constant White', stroke:'Stroke/Inverted'},
 'Theme:text icon/primary': {text:'Text/Primary', shape:'Icon/Primary'},
 'Theme:text icon/secondary': {text:'Text/Secondary'},
 'Theme:loader/whiteConst': {shape:'Icon/Constant White'},
 'Theme:separator/default': {shape:'Stroke/Separator'},
 'Color:tx-bg/level 1 base': {frame:'Background/Primary'}, 'Theme:bg/level 1 base': {frame:'Background/Primary'},
 'Color:tx-bg/level −1 muted': {frame:'Background/Secondary'},
 'Color:tx-bg/banner': {frame:'Background/Pill Secondary'},
 'Color:tx-accent/grey/primary': {text:'Text/Primary', shape:'Icon/Primary'},
 'Color:tx-accent/grey/light strong': {shape:'Icon/Constant White'},
 'Color:tx-accent/red/fg': {shape:'Icon/Warning'},
 'Variable collection:BG Dark': {frame:'Background/Constant Dark Secondary'}, // #393944, сверено 09.11
 'Variable collection:Accent Purple': {text:'Text/Accent', shape:'Icon/Accent'},
 'Variable collection:Neon Green': {text:'Text/Neon', stroke:'Stroke/Neon'},
};
// New Rider Drafts — анкета new-rider-drafts.questions.md, ответ arturuxui 02.11 «все ★»
const setAll = (labels, rule) => { for (const l of labels) C[l] = { ...(C[l] || {}), ...rule }; };
setAll(['Theme TX:tx-accent/grey/primary','theme:text/primary','Theme:controls/text icon/primary/default','GEO Theme:content/primary'], {text:'Text/Primary', shape:'Icon/Primary'}); // п.1
setAll(['Color:tx-accent/grey/secondary','theme:text/secondary','Theme:text icon/secondary'], {text:'Text/Secondary', shape:'Icon/Secondary'}); // п.2
setAll(['Color:tx-accent/grey/tertiary','theme:icon/secondary','Theme:text icon/tertiary','theme:text/tertiary','theme:pageIndicator/standart/noActive','Theme:pageIndicator/accent/noActive'], {text:'Text/Tertiary', shape:'Icon/Tertiary'}); // п.3
setAll(['Color:tx-accent/grey/quaternary','theme:switch/bg/defaultOff'], {shape:'Icon/Secondary Inverted', stroke:'Stroke/Primary', frame:'Pastel/Hans'}); // п.4
setAll(['Color:tx-accent/grey/light const','theme:icon/whiteConst','Theme:text icon/whitePrimaryConst','theme:text/whitePrimaryConst','Theme:button/primary/content/primary/default','theme:button/primary/content/defaultPrimary','Theme:additional/buttonBuy/content/defaultPrimary'], {text:'Text/Constant White', shape:'Icon/Constant White'}); // п.5
setAll(['Theme:bg/whiteConst','theme:switch/circle/default'], {frame:'Background/Constant White', shape:'Icon/Constant White'}); // п.5
setAll(['Color:tx-accent/grey/dark const','theme:icon/blackConst','Theme:bg/blackConst','theme:bg/blackConst'], {shape:'Icon/Constant Black', frame:'Background/Constant Dark'}); // п.7
setAll(['Color:tx-accent/grey/dark strong'], {text:'Text/Primary', shape:'Icon/Primary'}); // п.9
setAll(['Color:tx-accent/grey/light strong','theme:BG/airToCoal','Theme:stroke/forLevel1','theme:stroke/contrasteInverted'], {stroke:'Stroke/Contrast', shape:'Icon/Primary Inverted', frame:'Background/Primary'}); // п.9
setAll(['Theme:text icon/primaryInverted'], {text:'Text/Primary Inverted', shape:'Icon/Primary Inverted'}); // п.9
setAll(['Color:tx-accent/grey/primary-Inverted'], {shape:'Icon/Secondary Inverted'}); // п.9
// сверка 03.11 (new-rider-drafts.sverka.md), ответ arturuxui «все ★»
setAll(['Color:tx-accent/grey/primary'], {stroke:'Stroke/Inverted'}); // п.4
setAll(['Texts day/primary 1'], {text:'Text/Primary'}); // п.7
setAll(['Color:tx-bg/level 1 base','Theme:bg/level 1 base','Theme TX:tx-bg/level 1 base','theme:bg/level 1 base','Theme:bg/level 2 alternative'], {frame:'Background/Primary', shape:'Icon/Primary Inverted'}); // п.11, §8.2
setAll(['Theme:bg/level 2','theme:bg/level 2','theme:bg/ashToSmoke','Theme:skeleton/forLevel1','Theme:bg/level -1','theme:bg/level -1','theme:tx-bg/level −1 muted','Theme TX:tx-bg/level −1 muted'], {frame:'Background/Secondary'}); // п.10, 12
setAll(['Color:tx-control/neutral/bg/idle'], {frame:'Field/Primary'}); // п.13
setAll(['theme:promo/secondary/bg/red','Color:tx-control/red/tint/idle'], {frame:'Pastel/Tony'}); // п.14
setAll(['Variable collection:Accent Purple','Color:tx-accent/purple/fg','Theme TX:tx-accent/purple/fg','Theme:bg/accent','theme:bg/accent','Theme:text icon/accent','theme:text/link','theme:icon/primary','theme:stroke/primary','Theme:pageIndicator/accent/active','theme:pageIndicator/standart/active','theme:notification/brandPrimary','Theme:chips/primary/counter/bg/on/default','Theme TX:tx-control/purple/bg/idle','Color:tx-accent/purple/alt','Color:tx-accent/purple/bg','Theme TX:tx-accent/purple/bg','theme:promo/secondary/content/blackberry'], {text:'Text/Accent', shape:'Icon/Accent', stroke:'Stroke/Accent', frame:'Background/Accent'}); // п.17
setAll(['theme:button/primary/bg/default','Theme:button/primary/bg/default'], {frame:'Button/Primary'}); // п.17
setAll(['Color:tx-accent/red/bg','Color:tx-accent/red/fg','Theme TX:tx-accent/red/fg','theme:promo/secondary/content/red','theme:text/danger','theme:icon/danger'], {text:'Text/Warning', shape:'Icon/Warning', stroke:'Stroke/Warning'}); // п.18
setAll(['Color:tx-control/red/bg/idle'], {frame:'Background/Warning'}); // п.18
setAll(['Color:tx-control/orange/bg/idle','Theme TX:tx-accent/orange/bg','Navigator Color:Jam/High'], {shape:'Icon/Attention Deep', frame:'Background/Attention Deep'}); // п.19
setAll(['Color:tx-control/yellow/bg/idle','Navigator Color:Jam/Middle'], {shape:'Icon/Attention'}); // п.20 — временно: #ffc700 вместо #ffe400, пробел токена (final.md §9)
setAll(['Color:tx-accent/green/bg','Color:tx-accent/green/alt','theme:promo/secondary/content/green','Theme TX:tx-accent/green/bg'], {text:'Text/Success', shape:'Icon/Success', frame:'Background/Success'}); // п.21
const PASTEL = {Midway:'Pastel/Lenny',Mantle:'Pastel/Ralph',Ralph:'Pastel/Ralph',Liberty:'Pastel/Lisa',Asphalt:'Pastel/Apu',Graylord:'Pastel/Barney',Barney:'Pastel/Barney',Peach:'Pastel/Bart',Jasper:'Pastel/Jasper',Nelson:'Stories/Nelson'};
for (const [k,v] of Object.entries(PASTEL)) C[`Pastel [day]/${k}`] = {frame:v, shape:v};
const SPACE = {'Gaps:SPx2':'space-8','Gaps:SPx3':'space-12','Отступы:SPx3':'space-12','Corner radius:BRx6':null};
const SCOPE_NEED = {text:['TEXT_FILL','ALL_FILLS'], frame:['FRAME_FILL','ALL_FILLS'], shape:['SHAPE_FILL','ALL_FILLS'], stroke:['STROKE_COLOR']};
const EX = /^(status bar|home indicator( ios)?|map|dark map|light map|car class|car|car icon)$|keyboard/i;
const done = {}, skipped = {}, skipByRoot = {};
const inc = (o,k) => o[k] = (o[k]||0)+1;
// пропуск: причина → счётчик и ID узлов (cur — узел в обходе, curRoot — экран)
let cur = null, curRoot = null;
const skip = k => { const e = skipped[k] || (skipped[k] = { count: 0, ids: [] }); e.count++; if (e.ids.length < MAXIDS && cur) e.ids.push(cur.id); if (curRoot) inc(skipByRoot, curRoot); };
const scache = {};
const getStyle = async id => { if (!id || typeof id !== 'string') return null; if (!(id in scache)) scache[id] = await figma.getStyleByIdAsync(id); return scache[id]; };
const vncache = {};
const varLabel = async id => { if (!(id in vncache)) { const v = await figma.variables.getVariableByIdAsync(id); let cn = '?'; if (v) { const c = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId); cn = c ? c.name : '?'; } vncache[id] = v ? { label: `${cn}:${v.name}`, coll: cn, val: await resolveNum(Object.values(v.valuesByMode)[0], 0) } : { label: '?', coll: '?', val: null }; } return vncache[id]; };
// значение переменной по первому режиму, алиасы раскрываются
async function resolveNum(x, d) { if (x && x.type === 'VARIABLE_ALIAS' && d < 5) { const a = await figma.variables.getVariableByIdAsync(x.id); return a ? resolveNum(Object.values(a.valuesByMode)[0], d + 1) : null; } return x; }
const hex = c => [c.r,c.g,c.b].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('');
const kindOf = n => n.type === 'TEXT' ? 'text' : ['FRAME','COMPONENT','INSTANCE','SECTION'].includes(n.type) ? 'frame' : 'shape';
const okScope = (v, slot) => v.scopes.includes('ALL_SCOPES') || SCOPE_NEED[slot].some(s => v.scopes.includes(s));
// возвращает переменную или null, записывая причину пропуска
const resolveTarget = async (target, slot, kind, from) => {
  if (!target) { skip(`${from} [${slot}${slot==='stroke'?'':'/'+kind}] — нет правила`); return null; }
  if (target.startsWith('Background/') && target !== 'Background/Overlay' && kind !== 'frame') { skip(`${from} → ${target} [${kind}] — правило 1`); return null; }
  const v = await getVar(target);
  if (!v) { skip(`${from} → ${target} — нет в библиотеке`); return null; }
  if (!okScope(v, slot)) { skip(`${from} → ${target} [${slot}] — скоуп ${v.scopes.join(',')}`); return null; }
  return v;
};
const bindPaint = (p, v, opacity = 1) => { const base = { type: 'SOLID', color: p.color || {r:0,g:0,b:0}, opacity, visible: p.visible !== false, blendMode: p.blendMode || 'NORMAL' }; return figma.variables.setBoundVariableForPaint(base, 'color', v); };
// узел внутри иконки (не iOS Status Bar)
const isIcon = chain => chain.some(c => /^(icons?\b|ic(_|$)|\d+\/(stroke|fill)\/)/i.test(c)) && !chain.some(c => /status bar/i.test(c));
const rawTarget = (h, kind, prop, n, chain) => {
  if (prop === 'fills') {
    if (kind === 'frame' && h === 'ffffff') return 'Background/Primary';
    if (kind === 'frame' && (h === 'ffffff@0.90' || h === 'f5f5f5@0.60')) return 'Background/Navbar';
    if (kind === 'frame' && h === 'ededed' && n.name === 'Tab') return 'Background/Tab Selected';
    if (kind === 'shape' && h === '8526ff') return 'Icon/Accent';
    if (kind === 'shape' && h === '8526ff@0.12' && n.name === 'Radius') return 'RADIUS';
    if (kind === 'shape' && h === '000000' && n.name === 'Shadow' && chain.some(c => /pin/i.test(c))) return 'Technical/Visible Deep';
    // сверка п.8: #232326 — только в иконке (не Status Bar); #242429 на тексте
    if (kind === 'shape' && h === '232326' && isIcon(chain)) return 'Icon/Primary';
    if (kind === 'text' && h === '242429') return 'Text/Primary';
    // анкета повторного прогона (new-rider-drafts.rerun-questions.md) п.9, 10
    if (kind === 'text' && h === '262626') return 'Text/Primary';
    if (kind === 'shape' && h === '979797' && isIcon(chain) && n.parent.type !== 'BOOLEAN_OPERATION') return 'Icon/Tertiary';
    // final §1.4: утверждено, в скрипт не попало (анкета покрытия, раздел А)
    if (kind === 'text' && (h === '0f0f1f@0.90' || h === '000000@0.87')) return 'Text/Primary';
    if (kind === 'shape' && (h === '0f0f1f@0.90' || h === '000000@0.87')) return 'Icon/Primary';
    if (kind === 'shape' && (h === '100f25' || h === '2f2e43') && chain.some(c => /status multiple/i.test(c))) return 'Icon/Primary';
    if (kind === 'shape' && h === '7e00e6') return 'Icon/Accent';
    if (kind !== 'text' && h === 'ededff') return 'Pastel/Milhouse';
    if (kind !== 'text' && h === 'ffefeb') return 'Pastel/Tony';
    // анкета покрытия п.4, 5, 6
    if (kind === 'shape' && h === '000000' && isIcon(chain) && !n.isMask && n.parent.type !== 'BOOLEAN_OPERATION' && !chain.some(c => /pin/i.test(c))) return 'Icon/Primary';
    if (kind === 'text' && h === '0f0f1f@0.87') return 'Text/Primary';
    if (h === '000000@0.30' && (kind === 'frame' || (n.type === 'RECTANGLE' && n.width >= 300))) return 'Background/Overlay';
    if (kind === 'text' && h === 'ffffff' && chain.includes('ETA') && chain.some(c => /Map Pin/.test(c))) return 'Text/Constant White';
  } else {
    if (h === 'ffffff' && n.name === 'Divider') return 'Stroke/Secondary';
    if (h === '8f69ff' || h === '734edf') return 'Stroke/Zone Availability'; // final §1.4
    if (h === 'aaff00') return 'Stroke/Neon'; // final §1.4
  }
  return undefined;
};
const processPaints = async (n, prop, chain) => {
  if (!(prop in n)) return;
  const kind = kindOf(n);
  const slot = prop === 'strokes' ? 'stroke' : kind;
  const paints = n[prop];
  if (paints === figma.mixed) { skip(`${n.type} смешанные заливки — оставлено`); return; }
  if (!Array.isArray(paints) || !paints.length) return;
  const styleId = prop === 'fills' ? n.fillStyleId : n.strokeStyleId;
  const st = await getStyle(styleId);
  if (st) {
    if (prop === 'fills' && st.name === 'Gradients/Top') { // п.11: вернуть библиотечный стиль
      if (st.key === GRAD_TOP) return;
      const s = await importStyle(GRAD_TOP);
      if (!DRY) await n.setFillStyleIdAsync(s.id);
      inc(done, '[Gradients/Top] → [Gradients/Top] (библиотечный)');
      return;
    }
    const rule = C[st.name];
    if (!rule) { if (!/^\.keyboard/.test(st.name)) skip(`[${st.name}] [${slot}] — нет в маппинге`); return; }
    if (n.name === 'Shadow' && rule.shape) { skip(`[${st.name}] «Shadow» — пробел`); return; }
    if (slot === 'shape' && rule.iconOnly && !isIcon(chain)) { skip(`[${st.name}] [shape] — не иконка`); return; }
    const v = await resolveTarget(rule[slot], slot, kind, `[${st.name}]`);
    if (!v) return;
    if (!DRY) { const np = paints.map(p => p.type === 'SOLID' ? bindPaint(p, v) : p); if (prop === 'fills') n.fills = np; else n.strokes = np; }
    inc(done, `[${st.name}] → ${v.name} (${slot})`);
    return;
  }
  let changed = false;
  const np = [];
  for (const p of paints) {
    // анкета покрытия п.8: стопы Shimmer в файле чуть отличаются от библиотечных, поэтому правило по имени
    if (prop === 'fills' && paints.length === 1 && p.type === 'GRADIENT_LINEAR' && n.name === 'Gradient' && chain.some(c => /TX Loading Fade/.test(c))) {
      const s = await importStyle('d1fa46fc37e02c5a34fdd2c57f13312a083eb2b3');
      if (!DRY) await n.setFillStyleIdAsync(s.id);
      inc(done, 'градиент TX Loading Fade → [Gradients/Shimmer]');
      return;
    }
    if (p.type.startsWith('GRADIENT') && p.visible !== false) skip(`градиент [${slot}]`);
    if (p.type !== 'SOLID' || p.visible === false) { np.push(p); continue; }
    if (p.boundVariables && p.boundVariables.color) {
      const { label, coll } = await varLabel(p.boundVariables.color.id);
      if (['color-sem'].includes(coll)) { np.push(p); continue; }
      const rule = C[label];
      if (!rule) { skip(`{${label}} [${slot}] — нет в маппинге`); np.push(p); continue; }
      if (n.name === 'Shadow') { skip(`{${label}} «Shadow» — пробел`); np.push(p); continue; }
      const v = await resolveTarget(rule[slot], slot, kind, `{${label}}`);
      if (!v) { np.push(p); continue; }
      np.push(bindPaint(p, v)); changed = true; inc(done, `{${label}} → ${v.name} (${slot})`);
      continue;
    }
    const h = hex(p.color) + (p.opacity < 1 ? '@' + p.opacity.toFixed(2) : '');
    const t = rawTarget(h, kind, prop, n, chain);
    if (t === undefined) { skip(`сырой #${h} [${slot}]`); np.push(p); continue; }
    if (t === 'RADIUS') {
      const v = await resolveTarget('Icon/Accent', slot, kind, `#${h}`);
      if (!v) { np.push(p); continue; }
      np.push(bindPaint(p, v)); changed = true; if (!DRY) n.opacity = 0.12; inc(done, `#${h} → Icon/Accent + слой 12 %`);
      continue;
    }
    const v = await resolveTarget(t, slot, kind, `#${h}`);
    if (!v) { np.push(p); continue; }
    np.push(bindPaint(p, v)); changed = true; inc(done, `#${h} → ${v.name} (${slot})`);
  }
  if (changed && !DRY) { if (prop === 'fills') n.fills = np; else n.strokes = np; }
};
const importStyle = key => MC.st[key] || (MC.st[key] = figma.importStyleByKeyAsync(key));
const importTS = name => importStyle(NEWTS[name]);
const applyTS = async (n, name, from) => {
  let s;
  try { s = await importTS(name); } catch (e) { skip(`${from} → [${name}] — стиль не импортируется (не опубликован)`); return; }
  if (!DRY) {
    const fonts = n.getStyledTextSegments(['fontName']).map(x => x.fontName);
    for (const f of [...fonts, s.fontName]) await figma.loadFontAsync(f);
    await n.setTextStyleIdAsync(s.id);
  }
  inc(done, `${from} → [${name}]`);
};
const processText = async n => {
  const tsId = n.textStyleId;
  if (tsId === figma.mixed) { skip('текст со смешанными стилями — оставлено'); return; }
  const st = await getStyle(tsId);
  if (st) {
    if (NEWKEYS.has(st.key)) return;
    const target = TS_MAP[st.name] || (NEWTS[st.name] ? st.name : null);
    if (target) await applyTS(n, target, `[${st.name}] (стар.)`);
    else if (!/^\.Status bar/.test(st.name)) skip(`[${st.name}] — нет в маппинге`);
    return;
  }
  const segs = n.getStyledTextSegments(['fontName','fontSize','lineHeight','textCase']);
  const sig = [...new Set(segs.map(s => `${s.fontName.family} ${s.fontName.style} ${s.fontSize}/${s.lineHeight.value||'auto'}${s.textCase!=='ORIGINAL'?' '+s.textCase:''}`))].join(' + ');
  const RAW = {'SF Pro Text Semibold 17/20':'Outstanding/NRD - Body','SF Pro Text Semibold 12/16 SMALL_CAPS_FORCED':'Captions/Caption 1 CAP','SF Pro Text Regular 14/16':'Bodies/Body 3','SF Pro Display Semibold 22/22':'Titles/Title 4',
    // сверка п.6: Body 2 — полное совпадение; Subtitle 2 — трекинг −0.23 → −0.26
    'SF Pro Text Regular 15/20':'Bodies/Body 2','SF Pro Text Semibold 15/20':'Subtitles/Subtitle 2'};
  if (RAW[sig]) await applyTS(n, RAW[sig], sig); else skip(`шрифт без стиля: ${sig}`);
};
const processEffect = async n => {
  if (!('effectStyleId' in n)) return;
  const st = await getStyle(n.effectStyleId);
  if (!st) {
    const t = n.effects.length ? (fxFull(n) === GLASS ? 'Glass/Navbar' : RAWFX[fxSig(n)]) : undefined;
    if (!t) { if (n.effects.some(e => e.visible !== false)) skip(`сырой эффект: ${fxSig(n)}`); return; }
    const s = await importStyle(NEWFX[t]);
    if (!DRY) await n.setEffectStyleIdAsync(s.id);
    inc(done, `сырая тень → [${t}]`);
    return;
  }
  if (NEWKEYS.has(st.key)) return;
  if (st.name in FX_MAP) {
    const t = FX_MAP[st.name];
    if (t === null) { if (!DRY) { await n.setEffectStyleIdAsync(''); n.effects = []; } inc(done, `[${st.name}] → снята`); return; }
    if (!NEWFX[t]) { skip(`[${st.name}] → [${t}] — нет ключа стиля`); return; }
    const s = await importStyle(NEWFX[t]);
    if (!DRY) await n.setEffectStyleIdAsync(s.id);
    inc(done, `[${st.name}] → [${t}]`);
  } else if (NEWFX[st.name]) {
    const s = await importStyle(NEWFX[st.name]);
    if (!DRY) await n.setEffectStyleIdAsync(s.id);
    inc(done, `[${st.name}] (стар.) → [${st.name}]`);
  } else skip(`эффект [${st.name}] — нет в маппинге`);
};
// значения без токена с тем же числом (arturuxui 2026-11-03): 0 → flat, 100 (full) → pill, 18 → 16
const BYVAL = { r: { 0: 'radius-flat', 100: 'radius-pill', 18: 'radius-16' }, s: { 18: 'space-16' } };
const NUMPROPS = ['itemSpacing','counterAxisSpacing','paddingLeft','paddingRight','paddingTop','paddingBottom','topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius'];
const processNum = async n => {
  const bv = n.boundVariables || {};
  for (const prop of NUMPROPS) {
    const b = bv[prop]; if (!b || !b.id) continue;
    const { label, coll, val } = await varLabel(b.id);
    if (coll === 'space' || coll === 'radius') continue;
    // явная строка маппинга, иначе правило «то же значение» (final.md §4)
    const isR = /Radius$/.test(prop);
    // радиусы на текст не ставим: у TEXT нет такого поля, привязка остаётся от старого макета
    if (isR && n.type === 'TEXT') { skip(`{${label}}=${val} ${prop} на TEXT — не ставим`); continue; }
    const t = SPACE[label] || (typeof val === 'number' ? (BYVAL[isR ? 'r' : 's'][val] || (isR ? 'radius-' : 'space-') + val) : null);
    const v = t ? await getVar(t) : null;
    if (!v) { skip(`{${label}}=${val} ${prop} — нет цели`); continue; }
    if (!DRY) n.setBoundVariable(prop, v);
    inc(done, `{${label}} → ${v.name}`);
  }
};
let nodes = 0;
const walk = async (n, chain) => {
  if (n.name.startsWith('❌')) return; // референс, помеченный «❌ » (arturuxui 10.11)
  if (n.type !== 'TEXT' && EX.test(n.name)) return;
  nodes++;
  cur = n;
  // ошибка на узле (шрифт не грузится, свойство заблокировано в экземпляре) не роняет весь вызов
  try {
    await processPaints(n, 'fills', chain);
    await processPaints(n, 'strokes', chain);
    if (n.type === 'TEXT') await processText(n);
    await processEffect(n);
    await processNum(n);
  } catch (e) { skip(`ошибка: ${String(e.message || e).split('\n')[0].slice(0, 120)}`); }
  if (typeof SHALLOW !== 'undefined' && SHALLOW && !chain.length) return;
  // узел экземпляра может исчезнуть посреди обхода — пропуск, а не падение всего вызова
  const errWalk = e => skip(`ошибка обхода: ${String(e.message || e).split('\n')[0].slice(0, 120)}`);
  let kids = [];
  try { if ('children' in n) kids = n.children; } catch (e) { errWalk(e); }
  for (const c of kids) {
    try { await walk(c, chain.concat(n.name)); } catch (e) { cur = c; errWalk(e); }
  }
};
const shots = [];
const rootIds = ROOTS.length ? ROOTS : page.children.map(c => c.id);
const rootNames = {};
for (const id of rootIds) { const r = await figma.getNodeByIdAsync(id); curRoot = `${r.name} ${r.id}`; rootNames[id] = r.name; await walk(r, []); if (SHOT) shots.push(await r.screenshot({ scale: 0.5 })); }
const fmt = o => Object.entries(o).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${v}× ${k}`);
const fmtSkip = Object.entries(skipped).sort((a,b)=>b[1].count-a[1].count).map(([k,e])=>({ reason: k, count: e.count, ids: e.ids }));
return { DRY, page: page.name, roots: rootNames, nodes, done: fmt(done), skipped: fmtSkip, skipByRoot: fmt(skipByRoot), mutatedRootIds: DRY ? [] : rootIds };
