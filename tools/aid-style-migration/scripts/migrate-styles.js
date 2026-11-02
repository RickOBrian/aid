// Перенос стилей и переменных на New Rider DEV (5mg6h0oB8yRDoUfTruogca) через use_figma.
// Маппинг — mappings/new-rider-dev.final.md; прогон 2026-11-02 — mappings/new-rider-dev.run-taxi.md.
// Тело для use_figma: в начало вставить
//   const DRY = true|false;      // true — только счётчики, узлы не меняются
//   const SHOT = true|false;     // скриншот каждого корня
//   const ROOTS = ['<id>', ...]; // экраны на странице-копии
// ID страницы ниже — копия «✅ Taxi for friends — Switched Styles»; для другой страницы заменить.
const page = await figma.getNodeByIdAsync('4770:4437');
await figma.setCurrentPageAsync(page);
const RIDER = 'Rider';
const cols = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
const libVars = {};
for (const c of cols.filter(c => c.libraryName.includes(RIDER) && ['color-sem','space','radius'].includes(c.name))) {
  for (const v of await figma.teamLibrary.getVariablesInLibraryCollectionAsync(c.key)) libVars[v.name] = v.key;
}
const vcache = {};
const getVar = async name => { if (!(name in vcache)) vcache[name] = libVars[name] ? await figma.variables.importVariableByKeyAsync(libVars[name]) : null; return vcache[name]; };
const NEWTS = {'Bodies/Body 1':'efedd6ccce9601aed048863321ec05f65e587b30','Bodies/Body 2':'879e5c53e856e0bc15d54d02ad28ba88c8661808','Bodies/Body 3':'ec7ba478b0d45f0e20fb5528ffaa75dcff5aef72','Subtitles/Subtitle 1':'1449afde1d818486460f295669af22fd99a3a6cf','Subtitles/Subtitle 2':'746b9479314cb405d3340bd358049e486ae0f6d6','Subtitles/Subtitle 3':'a033bddf111be09f0149088dcb5c1eaa529ebd04','Titles/Title 4':'9395aad5c31672c7a765e20f36e1b39e00ccbc43','Titles/Title 3':'9a6c623ccfe842d1d9e8d0e428d12e6cf1d0d810','Captions/Caption 1':'97bf66024e167e387564b809893c702b464ddd42','Captions/Caption 1 CAP':'297879960c9a9a1feda979b1b9070563b06d858b','Captions/Caption 2':'0c2e5ea7ad30281d26df7c68b67043c3fa2286e8','Outstanding/Title-title2 (NRD)':'99bb5b186e90da50ee7e4b10fc0f3c13bb11acc0','Outstanding/NRD - Body':'3274cd72b8250998e9c07a468850a85e91046616'};
const NEWFX = {'Shadows/Medium':'24e56e6c62ec393588115cc830067695312b5f3f','Shadows/Large':'2a1e49f9eeaff377e4ae4c15604af5c70adca4f5','Shadows/Bottom Sheet':'4f1d0ff4979eced4e144c149ac11c18267dba137'};
const NEWKEYS = new Set([...Object.values(NEWTS), ...Object.values(NEWFX), '5b2d5ab81c5badb00c28c93153a3479d73444229']); // + Shadows/Large Air (новый)
const TS_MAP = {'Caption/caption':'Captions/Caption 2','Title/title2':'Outstanding/Title-title2 (NRD)'};
const FX_MAP = {'Shadows/[day] Medium':'Shadows/Medium','Shadows/[day] Large':'Shadows/Large','Shadow 6':'Shadows/Bottom Sheet','Shadows / Brand button':null};
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
 'Text [day]/Constant White': {text:'Text/Constant White', shape:'Icon/Constant White'},
 'Text [day]/Constant White Secondary': {text:'Text/Constant White Secondary'},
 'Texts night/Primary': {shape:'Icon/Constant White'},
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
 'Variable collection:BG Dark': {frame:'Background/Constant Dark'},
 'Variable collection:Accent Purple': {text:'Text/Accent', shape:'Icon/Accent'},
 'Variable collection:Neon Green': {text:'Text/Neon', stroke:'Stroke/Neon'},
};
const PASTEL = {Midway:'Pastel/Lenny',Mantle:'Pastel/Ralph',Ralph:'Pastel/Ralph',Liberty:'Pastel/Lisa',Asphalt:'Pastel/Apu',Graylord:'Pastel/Barney',Barney:'Pastel/Barney',Peach:'Pastel/Bart',Jasper:'Pastel/Jasper',Nelson:'Stories/Nelson'};
for (const [k,v] of Object.entries(PASTEL)) C[`Pastel [day]/${k}`] = {frame:v, shape:v};
const SPACE = {'Gaps:SPx2':'space-8','Gaps:SPx3':'space-12','Отступы:SPx3':'space-12','Corner radius:BRx6':null};
const SCOPE_NEED = {text:['TEXT_FILL','ALL_FILLS'], frame:['FRAME_FILL','ALL_FILLS'], shape:['SHAPE_FILL','ALL_FILLS'], stroke:['STROKE_COLOR']};
const EX = /^(status bar|home indicator( ios)?|map|dark map|light map|car class|car|car icon)$|keyboard/i;
const done = {}, skipped = {};
const inc = (o,k) => o[k] = (o[k]||0)+1;
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
  if (!target) { inc(skipped, `${from} [${slot}${slot==='stroke'?'':'/'+kind}] — нет правила`); return null; }
  if (target.startsWith('Background/') && kind !== 'frame') { inc(skipped, `${from} → ${target} [${kind}] — правило 1`); return null; }
  const v = await getVar(target);
  if (!v) { inc(skipped, `${from} → ${target} — нет в библиотеке`); return null; }
  if (!okScope(v, slot)) { inc(skipped, `${from} → ${target} [${slot}] — скоуп ${v.scopes.join(',')}`); return null; }
  return v;
};
const bindPaint = (p, v, opacity = 1) => { const base = { type: 'SOLID', color: p.color || {r:0,g:0,b:0}, opacity, visible: p.visible !== false, blendMode: p.blendMode || 'NORMAL' }; return figma.variables.setBoundVariableForPaint(base, 'color', v); };
const rawTarget = (h, kind, prop, n, chain) => {
  if (prop === 'fills') {
    if (kind === 'frame' && h === 'ffffff') return 'Background/Primary';
    if (kind === 'frame' && (h === 'ffffff@0.90' || h === 'f5f5f5@0.60')) return 'Background/Navbar';
    if (kind === 'frame' && h === 'ededed' && n.name === 'Tab') return 'Background/Tab Selected';
    if (kind === 'shape' && h === '8526ff') return 'Icon/Accent';
    if (kind === 'shape' && h === '8526ff@0.12' && n.name === 'Radius') return 'RADIUS';
    if (kind === 'shape' && h === '000000' && n.name === 'Shadow' && chain.some(c => /pin/i.test(c))) return 'Technical/Visible Deep';
    if (kind === 'text' && h === 'ffffff' && chain.includes('ETA') && chain.some(c => /Map Pin/.test(c))) return 'Text/Constant White';
  } else {
    if (h === 'ffffff' && n.name === 'Divider') return 'Stroke/Secondary';
  }
  return undefined;
};
const processPaints = async (n, prop, chain) => {
  if (!(prop in n)) return;
  const kind = kindOf(n);
  const slot = prop === 'strokes' ? 'stroke' : kind;
  const paints = n[prop];
  if (paints === figma.mixed) { inc(skipped, `${n.type} смешанные заливки — оставлено`); return; }
  if (!Array.isArray(paints) || !paints.length) return;
  const styleId = prop === 'fills' ? n.fillStyleId : n.strokeStyleId;
  const st = await getStyle(styleId);
  if (st) {
    const rule = C[st.name];
    if (!rule) { if (!/^\.keyboard/.test(st.name)) inc(skipped, `[${st.name}] [${slot}] — нет в маппинге`); return; }
    if (n.name === 'Shadow' && rule.shape) { inc(skipped, `[${st.name}] «Shadow» — пробел`); return; }
    const v = await resolveTarget(rule[slot], slot, kind, `[${st.name}]`);
    if (!v) return;
    if (!DRY) { const np = paints.map(p => p.type === 'SOLID' ? bindPaint(p, v) : p); if (prop === 'fills') n.fills = np; else n.strokes = np; }
    inc(done, `[${st.name}] → ${v.name} (${slot})`);
    return;
  }
  let changed = false;
  const np = [];
  for (const p of paints) {
    if (p.type !== 'SOLID' || p.visible === false) { np.push(p); continue; }
    if (p.boundVariables && p.boundVariables.color) {
      const { label, coll } = await varLabel(p.boundVariables.color.id);
      if (['color-sem'].includes(coll)) { np.push(p); continue; }
      const rule = C[label];
      if (!rule) { inc(skipped, `{${label}} [${slot}] — нет в маппинге`); np.push(p); continue; }
      if (n.name === 'Shadow') { inc(skipped, `{${label}} «Shadow» — пробел`); np.push(p); continue; }
      const v = await resolveTarget(rule[slot], slot, kind, `{${label}}`);
      if (!v) { np.push(p); continue; }
      np.push(bindPaint(p, v)); changed = true; inc(done, `{${label}} → ${v.name} (${slot})`);
      continue;
    }
    const h = hex(p.color) + (p.opacity < 1 ? '@' + p.opacity.toFixed(2) : '');
    const t = rawTarget(h, kind, prop, n, chain);
    if (t === undefined) { np.push(p); continue; }
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
const tsCache = {};
const importTS = async name => { if (!(name in tsCache)) tsCache[name] = await figma.importStyleByKeyAsync(NEWTS[name]); return tsCache[name]; };
const applyTS = async (n, name, from) => {
  const s = await importTS(name);
  if (!DRY) {
    const fonts = n.getStyledTextSegments(['fontName']).map(x => x.fontName);
    for (const f of [...fonts, s.fontName]) await figma.loadFontAsync(f);
    await n.setTextStyleIdAsync(s.id);
  }
  inc(done, `${from} → [${name}]`);
};
const processText = async n => {
  const tsId = n.textStyleId;
  if (tsId === figma.mixed) { inc(skipped, 'текст со смешанными стилями — оставлено'); return; }
  const st = await getStyle(tsId);
  if (st) {
    if (NEWKEYS.has(st.key)) return;
    const target = TS_MAP[st.name] || (NEWTS[st.name] ? st.name : null);
    if (target) await applyTS(n, target, `[${st.name}] (стар.)`);
    else if (!/^\.Status bar/.test(st.name)) inc(skipped, `[${st.name}] — нет в маппинге`);
    return;
  }
  const segs = n.getStyledTextSegments(['fontName','fontSize','lineHeight','textCase']);
  const sig = [...new Set(segs.map(s => `${s.fontName.family} ${s.fontName.style} ${s.fontSize}/${s.lineHeight.value||'auto'}${s.textCase!=='ORIGINAL'?' '+s.textCase:''}`))].join(' + ');
  const RAW = {'SF Pro Text Semibold 17/20':'Outstanding/NRD - Body','SF Pro Text Semibold 12/16 SMALL_CAPS_FORCED':'Captions/Caption 1 CAP','SF Pro Text Regular 14/16':'Bodies/Body 3','SF Pro Display Semibold 22/22':'Titles/Title 4'};
  if (RAW[sig]) await applyTS(n, RAW[sig], sig); else inc(skipped, `шрифт без стиля: ${sig}`);
};
const processEffect = async n => {
  if (!('effectStyleId' in n)) return;
  const st = await getStyle(n.effectStyleId);
  if (!st || NEWKEYS.has(st.key)) return;
  if (st.name in FX_MAP) {
    const t = FX_MAP[st.name];
    if (t === null) { if (!DRY) { await n.setEffectStyleIdAsync(''); n.effects = []; } inc(done, `[${st.name}] → снята`); return; }
    const s = await figma.importStyleByKeyAsync(NEWFX[t]);
    if (!DRY) await n.setEffectStyleIdAsync(s.id);
    inc(done, `[${st.name}] → [${t}]`);
  } else if (NEWFX[st.name]) {
    const s = await figma.importStyleByKeyAsync(NEWFX[st.name]);
    if (!DRY) await n.setEffectStyleIdAsync(s.id);
    inc(done, `[${st.name}] (стар.) → [${st.name}]`);
  } else inc(skipped, `эффект [${st.name}] — нет в маппинге`);
};
const NUMPROPS = ['itemSpacing','counterAxisSpacing','paddingLeft','paddingRight','paddingTop','paddingBottom','topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius'];
const processNum = async n => {
  const bv = n.boundVariables || {};
  for (const prop of NUMPROPS) {
    const b = bv[prop]; if (!b || !b.id) continue;
    const { label, coll, val } = await varLabel(b.id);
    if (coll === 'space' || coll === 'radius') continue;
    // явная строка маппинга, иначе правило «то же значение» (final.md §4)
    const isR = /Radius$/.test(prop);
    const t = SPACE[label] || (typeof val === 'number' ? (isR ? 'radius-' : 'space-') + val : null);
    const v = t ? await getVar(t) : null;
    if (!v) { inc(skipped, `{${label}}=${val} ${prop} — нет цели`); continue; }
    if (!DRY) n.setBoundVariable(prop, v);
    inc(done, `{${label}} → ${v.name}`);
  }
};
let nodes = 0;
const walk = async (n, chain) => {
  if (n.type !== 'TEXT' && EX.test(n.name)) return;
  nodes++;
  await processPaints(n, 'fills', chain);
  await processPaints(n, 'strokes', chain);
  if (n.type === 'TEXT') await processText(n);
  await processEffect(n);
  await processNum(n);
  if ('children' in n) for (const c of n.children) await walk(c, chain.concat(n.name));
};
const shots = [];
for (const id of ROOTS) { const r = await figma.getNodeByIdAsync(id); await walk(r, []); if (SHOT) shots.push(await r.screenshot({ scale: 0.5 })); }
const fmt = o => Object.entries(o).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${v}× ${k}`);
return { DRY, roots: ROOTS, nodes, done: fmt(done), skipped: fmt(skipped), mutatedRootIds: ROOTS };
