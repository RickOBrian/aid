// persefona-6 (AID-64): перевод секции аудита TabBar 599:2797 (Rider Components) на Kit Persefona.
// Запуск через use_figma, файл 79UryRdexwKAv8vDIV5v4v. BLOCKS — id карточек блоков для этого прогона.
// Меняется только вид: тексты переносятся 1:1 (в свойства HeaderSection, Badge, TableCell или остаются на месте).
// Сцены продукта (экземпляры, мастера, рамки на переменных Rider, копии экранов) не трогаются.
const BLOCKS = __BLOCKS__;

const K = {
  st: { 'heading-l':'9b8af470cb8e56ab407b35c08cf9877f4abbe5c8','heading-m':'d32fb5988525a89ba76beb164f50ceb280893fbf','heading-s':'3e24e1f1618f2159a35c55d1087a40eee8354e12',
        'body-m':'3a3b69e506572164e7cd8b0cb0585615dd88ed12','body-s':'dede2b7c132add99b21cc5f0c90880b535b4ad26','label-s':'b179157f175048e57d194430763321f566d2cb43',
        'label-xs-caps':'81044ab0d7538e9ba1c7125281c495baf3ace216' },
  c: { 'text-primary':'f1ae466778bfebc4323580287007c99393922fea','text-secondary':'4b2825ef9a779f55c1332634032ad0b4faa64e20','text-inverse':'43ff1e8419dcaf73af8d0399431961f21735baaf',
       'text-accent':'3a68c9412c63bd545751fabdc724e62afc9c5ff8','text-accent-vivid':'949da370ec78b97f0149318b2cbaad9c292e8da7',
       'surface-main':'125448d6c36643d97f23500c7b74b1874738c645','surface-muted':'749515ebb1ca2d075277f4baeac3c54c65ef96aa','surface-zebra':'864a9210e3ef4604f9c2fc6a99d445b9314a0982',
       'vivid-fade':'2e6e5b047bd9b83ac8f764bff70987ded3585db2','status-neutral':'e8cb03615eacb1c6e866ebe2fb1cdd71d1ece1c0',
       'line-default':'2a52e5ad5a83039e73014691e06c54e3d1b1cbfb','marker':'2092c9e2402f7f562aaba5d73399c3be6eaced67','marker-neutral':'565c4ff0df8aa39211ead836a4873dd64711b9f3' },
  sp: { 4:'ca03624ead4c2c2462c2624003e3395daf2be12f',6:'111d127b45acbfbe6610e4f8787e2a5d3fd776ba',8:'c23139ed5f4bb3fb428410f43810433093c19f91',10:'b51d6aa356e3fa35bd7a10bf88f20ae2d7099902',
        12:'59b1fdb0d63c50cbdbdd4659319e948378e3e11d',16:'b459ff37547b414ea6f4f6fea3fc2e1d76f3dd96',20:'cb77c1fdf48c52bd0541025baa51272a8baadd5c',24:'b287ebd1044990477d532e55da91e824f099a34b',
        32:'44c2a65a76db8fadb04e5b739ad0754af0249973',48:'e0272ce24e25e0dc663e2ccf3adac07ae09cc35b' },
  r: { 4:'27bf75a5ed353cbb4ee74302db91e3702b7dc359',8:'430a007fc643ff90984da87658024a3f2a7dde8f',12:'ca07e9e0afde0bd5cb5c952a9daf371b3bd68d4c',16:'c0fef2998af49f2638481b5cf3968e5d2b0bb727',9999:'cb5e59b0479acab18ff3f0c08e2f57760ee35aa2' },
  comp: { headerSection:'09e45bfbda7bdf79a6a47b1c969ade6e913b0467',
          badge:{ Neutral:'969d7acc320e983331f6a43ae3ae1d5016679e7c',Warning:'a679c1cc835c93628943d8c31f15308f81b383e1',Success:'4f40df859f56f629da61b2bda40ea423072c50dc','Vivid Soft':'50bd7ab04e1686439bfc29e7599069ae13bc9c1a',Vivid:'28b405ad92bb3922d14e4cf5e8efacbd402971ff' },
          cell:{ Header:'5ebdfe8d3a9adbccc8594e851b6f794f8c19834a',Default:'d0da40b257f962c950d53f525a40d08dc22f092e',Before:'6c31b01fbaef69985f4cadbc42984bf311495677',After:'6bb2c4cd169dca392a0bc2182d32f0a3af21e371' } },
};
const S={},C={},SP={},R={},CMP={badge:{},cell:{}};
for(const k in K.st) S[k]=await figma.importStyleByKeyAsync(K.st[k]);
for(const k in K.c) C[k]=await figma.variables.importVariableByKeyAsync(K.c[k]);
for(const k in K.sp) SP[k]=await figma.variables.importVariableByKeyAsync(K.sp[k]);
for(const k in K.r) R[k]=await figma.variables.importVariableByKeyAsync(K.r[k]);
CMP.hs=await figma.importComponentByKeyAsync(K.comp.headerSection);
for(const k in K.comp.badge) CMP.badge[k]=await figma.importComponentByKeyAsync(K.comp.badge[k]);
for(const k in K.comp.cell) CMP.cell[k]=await figma.importComponentByKeyAsync(K.comp.cell[k]);
for(const f of [['Google Sans','Regular'],['Google Sans','Medium'],['SF Pro Text','Regular'],['SF Pro Text','Medium'],['SF Pro Text','Semibold']]) await figma.loadFontAsync({family:f[0],style:f[1]});

// переменные Rider для сцен: фон сцены и подпись на сцене (День/Ночь — явный режим)
const RB=await figma.variables.getVariableByIdAsync((await figma.getNodeByIdAsync('389:71')).fills[0].boundVariables.color.id);
const RT=await figma.variables.getVariableByIdAsync((await figma.getNodeByIdAsync('557:4250')).fills[0].boundVariables.color.id);
const RCOL=await figma.variables.getVariableCollectionByIdAsync(RB.variableCollectionId);
const RMODE={'День':RCOL.modes.find(m=>/day/i.test(m.name)).modeId,'Ночь':RCOL.modes.find(m=>/night/i.test(m.name)).modeId};
const hex=c=>'#'+[c.r,c.g,c.b].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('').toUpperCase();
// запасной цвет краски = значение переменной (иначе рендер без библиотеки рисует чёрный)
async function resolved(v){ let cur=v; for(let i=0;i<5;i++){ const val=cur.valuesByMode[Object.keys(cur.valuesByMode)[0]]; if(val&&val.type==='VARIABLE_ALIAS') cur=await figma.variables.getVariableByIdAsync(val.id); else return val; } }
const FB=new Map(); for(const k in C) FB.set(C[k].id, await resolved(C[k]));
const paint=(v)=>{ const c=FB.get(v.id)||{r:0,g:0,b:0,a:1}; return figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:c.r,g:c.g,b:c.b},opacity:c.a??1},'color',v); };
const log={texts:0,badges:0,cells:0,headers:0,frames:0,left:[]};
const near=(map,val)=>{const ks=Object.keys(map).map(Number);let b=ks[0];for(const k of ks) if(Math.abs(k-val)<Math.abs(b-val)) b=k;return map[b];};
const isPf=async(id)=>{const v=await figma.variables.getVariableByIdAsync(id);if(!v)return false;const c=await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId);return !!c&&c.name.startsWith('persefona');};
async function riderBound(n){ const f=Array.isArray(n.fills)?n.fills:[]; for(const p of f) if(p.boundVariables?.color && !(await isPf(p.boundVariables.color.id))) return true; return false; }
const SCENE_NAME=/^(Taxi|Bottom sheet|TabBar крупно|Нижняя панель)/;
async function inScene(n,root){ let p=n.parent; while(p&&p.id!==root.id){ if(['INSTANCE','COMPONENT','COMPONENT_SET'].includes(p.type)) return true; if(SCENE_NAME.test(p.name)) return true; if(p.type==='FRAME'&&await riderBound(p)) return 'rider'; p=p.parent;} return false; }
function bindSpacing(n){ if(!n.layoutMode||n.layoutMode==='NONE') return; for(const k of ['paddingTop','paddingRight','paddingBottom','paddingLeft','itemSpacing']){ const v=n[k]; if(v>0) n.setBoundVariable(k, near(SP,v)); } if(n.counterAxisSpacing>0) n.setBoundVariable('counterAxisSpacing',near(SP,n.counterAxisSpacing)); }
function bindRadius(n,val){ const v= val!=null?R[val]:near(R,n.cornerRadius); for(const k of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) n.setBoundVariable(k,v); }
async function styleText(t,style,color){ await t.setTextStyleIdAsync(S[style].id); if(color) t.fills=[paint(C[color])]; log.texts++; }

function textRole(t){
  const fs=t.fontSize, st=t.fontName.style, pn=t.parent?.name||'', gp=t.parent?.parent?.name||'';
  const col=(t.fills[0]&&t.fills[0].type==='SOLID')?hex(t.fills[0].color):'';
  const colorOf=(def)=>({'#1A1A1F':'text-primary','#4A4A55':'text-secondary','#6B6B76':'text-secondary','#9A9AA5':'text-secondary','#6A1FD0':'text-accent','#8526FF':'text-accent-vivid','#FFFFFF':'text-inverse'}[col]||def);
  if(pn==='Номер') return ['label-s','text-accent-vivid'];
  if(pn==='Ответ') return ['body-s','text-accent-vivid'];
  if(fs>=22) return ['heading-l',colorOf('text-primary')];
  if(fs>=18) return ['heading-m',colorOf('text-primary')];
  if(fs===15) return [/^(Панель|Коротко)/.test(pn)?'heading-m':'heading-s',colorOf('text-primary')];
  if(fs===14&&st!=='Regular') return ['heading-s',colorOf('text-primary')];
  if(st==='Medium'&&fs===13) return ['body-m','text-accent-vivid'];
  if(fs>=13&&st==='Regular') return ['body-m',colorOf('text-secondary')];
  if(fs>=13) return ['label-s',colorOf('text-primary')];
  if(st==='Regular') return ['body-s',colorOf('text-secondary')];
  return ['label-s',colorOf('text-primary')];
}
function tone(txt,fillHex){ if(/^Согласовано/.test(txt)) return 'Success'; if(/на согласовании|^Открыто/.test(txt)) return 'Warning';
  if(fillHex==='#F1E9FF') return 'Vivid Soft'; if(fillHex==='#8526FF') return 'Vivid'; return 'Neutral'; }
function place(newN,old){ const p=old.parent; const i=p.children.indexOf(old); p.insertChild(i,newN); if(!p.layoutMode||p.layoutMode==='NONE'||old.layoutPositioning==='ABSOLUTE'){ if(p.layoutMode&&p.layoutMode!=='NONE') newN.layoutPositioning='ABSOLUTE'; newN.x=old.x; newN.y=old.y; } }

for(const bid of BLOCKS){
  const B=await figma.getNodeByIdAsync(bid); if(!B) { log.left.push('нет '+bid); continue; }
  const isProto=B.name.startsWith('▶');
  // 1. метки → Badge
  for(const m of B.findAll(n=>n.type==='FRAME'&&/^Метка · /.test(n.name))){
    if(await inScene(m,B)===true) continue;
    const t=m.findOne(n=>n.type==='TEXT'); if(!t) continue; const fh=m.fills[0]?.type==='SOLID'?hex(m.fills[0].color):'';
    const b=CMP.badge[tone(t.characters,fh)].createInstance(); b.name='Badge';
    const tk=Object.keys(b.componentProperties).find(k=>k.startsWith('Text')); b.setProperties({[tk]:t.characters});
    place(b,m); m.remove(); log.badges++;
  }
  // 2. шапка блока → метки + HeaderSection
  const head=B.children.find(n=>n.name==='Шапка');
  if(head){ const ts=head.children.filter(n=>n.type==='TEXT');
    if(ts.length){ const hs=CMP.hs.createInstance(); const p=hs.componentProperties; const key=s=>Object.keys(p).find(k=>k.startsWith(s));
      const props={[key('Title')]:ts[0].characters}; if(ts[1]) props[key('Subtitle')]=ts[1].characters; else props[key('Show Subtitle')]=false; hs.setProperties(props);
      head.insertChild(head.children.indexOf(ts[0]),hs); hs.layoutSizingHorizontal='FILL'; for(const t of ts) t.remove(); log.headers++; }
    head.layoutSizingHorizontal='FILL'; bindSpacing(head); head.itemSpacing=12; head.setBoundVariable('itemSpacing',SP[12]);
    for(const m of head.children) if(m.type==='FRAME') bindSpacing(m);
  }
  // 3. подвал «Для инженера» / «Источники»
  for(const f of B.children.filter(n=>n.type==='FRAME'&&/^(Для инженера|Источники)$/.test(n.name))){
    f.paddingTop=16; f.setBoundVariable('paddingTop',SP[16]); f.itemSpacing=4; f.setBoundVariable('itemSpacing',SP[4]);
    f.strokes=[paint(C['line-default'])]; f.strokeAlign='INSIDE'; f.strokeTopWeight=1; f.strokeBottomWeight=0; f.strokeLeftWeight=0; f.strokeRightWeight=0; f.fills=[];
    const ts=f.children.filter(n=>n.type==='TEXT'); if(ts[0]) await styleText(ts[0],'label-xs-caps','text-secondary'); for(const t of ts.slice(1)) await styleText(t,'body-s','text-secondary');
  }
  // 4. таблицы → TableCell
  for(const T of B.findAll(n=>n.type==='FRAME'&&n.name==='Таблица')){
    const beforeAfter=!!T.parent&&T.parent.name==='Что именно поменялось';
    T.fills=[paint(C['surface-main'])]; T.strokes=[paint(C['line-default'])]; T.strokeWeight=1; T.strokeAlign='INSIDE'; bindRadius(T,8); T.clipsContent=true; bindSpacing(T);
    for(const row of T.children.filter(n=>n.type==='FRAME')){
      row.fills=[]; row.strokes=[]; const header=row.name==='Заголовок таблицы'; let ci=0;
      for(const cell of row.children.filter(n=>n.type==='FRAME')){
        const t=cell.findOne(n=>n.type==='TEXT'); const v=header?'Header':(beforeAfter&&ci===1?'Before':beforeAfter&&ci===2?'After':'Default');
        const inst=CMP.cell[v].createInstance(); inst.name='TableCell'; const tk=Object.keys(inst.componentProperties).find(k=>k.startsWith('Text'));
        inst.setProperties({[tk]:t?t.characters:''}); row.insertChild(row.children.indexOf(cell),inst);
        inst.layoutSizingHorizontal='FIXED'; inst.resize(cell.width,inst.height); inst.layoutSizingVertical='FILL'; cell.remove(); ci++; log.cells++;
      }
      row.layoutSizingVertical='HUG'; row.counterAxisAlignItems='MIN';
    }
  }
  // 4б. сцены «День»/«Ночь» с сырым фоном → фон Rider и явный режим
  for(const st of B.findAll(n=>n.type==='FRAME'&&(n.name==='День'||n.name==='Ночь'))){
    const f=st.fills[0]; if(!f||f.type!=='SOLID'||f.boundVariables?.color) continue;
    st.fills=[figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',RB)];
    if(!st.explicitVariableModes[RCOL.id]) st.setExplicitVariableModeForCollection(RCOL,RMODE[st.name]);
    bindSpacing(st); if(st.cornerRadius>0) bindRadius(st);
  }
  // 5. остальная оболочка: тексты, заливки, обводки, отступы, радиусы
  for(const n of B.findAll(()=>true).concat([B])){
    if(n.removed) continue;
    const sc=n===B?false:await inScene(n,B);
    if(sc===true) continue;
    if(n.type==='TEXT'){
      if(n.parent&&/^(Для инженера|Источники)$/.test(n.parent.name)&&n.parent.parent===B) continue;
      if(sc==='rider'||isProto){ if(n.textStyleId) continue; const f=n.fills[0]; const keep=f&&f.boundVariables?.color?f:figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',RT);
        await n.setTextStyleIdAsync(S['body-s'].id); n.fills=[keep]; log.texts++; continue; }
      if(n.textStyleId && typeof n.textStyleId==='string'){ const st=await figma.getStyleByIdAsync(n.textStyleId); if(st&&st.name.startsWith('persefona')) continue; }
      const [s,c]=textRole(n); await styleText(n,s,c); continue;
    }
    if(sc==='rider') continue;
    if(n.type==='INSTANCE'||n.type==='COMPONENT'||n.type==='COMPONENT_SET') continue;
    if(SCENE_NAME.test(n.name)) continue;
    if(n.type==='FRAME'&&await riderBound(n)) { if(isProto&&n===B){ bindRadius(n); bindSpacing(n);} continue; }
    // заливки
    if(Array.isArray(n.fills)&&n.fills.length){ const nf=[]; let ch=false;
      for(const f of n.fills){ if(f.type!=='SOLID'||f.boundVariables?.color){nf.push(f);continue;} if((f.opacity??1)===0||f.visible===false){ch=true;continue;}
        const h=hex(f.color); let v=null;
        if(n===B||n.name==='Панель · '||/^(Панель|Коротко)/.test(n.name)) v= n===B?'surface-main':'surface-muted';
        else if(h==='#FFFFFF') v='surface-main'; else if(h==='#F6F6F8') v='surface-muted'; else if(h==='#F8F8FA') v='surface-zebra'; else if(h==='#F1E9FF') v='vivid-fade'; else if(h==='#ECECF0') v='status-neutral';
        else if(h==='#F6F6F8'||h==='#202024') v=null;
        if(v){nf.push(paint(C[v]));ch=true;} else { nf.push(f); log.left.push('заливка '+h+' '+n.id+' '+n.name); } }
      if(ch) n.fills=nf; }
    if(Array.isArray(n.strokes)&&n.strokes.length){ const ns=[]; let ch=false;
      for(const f of n.strokes){ if(f.type!=='SOLID'||f.boundVariables?.color){ns.push(f);continue;} const h=hex(f.color); let v=null;
        if(n.name==='Рамка · навигация') v= h==='#8526FF'?'marker':'marker-neutral'; else if(h==='#E4E4EA'||h==='#9647FF') v='line-default';
        if(v){ns.push(paint(C[v]));ch=true;} else { ns.push(f); log.left.push('обводка '+h+' '+n.id+' '+n.name); } }
      if(ch) n.strokes=ns; }
    if(n.type==='FRAME'){ bindSpacing(n); log.frames++; }
    if((n.type==='FRAME'||n.type==='RECTANGLE')&&'cornerRadius' in n&&n.cornerRadius!==figma.mixed&&n.cornerRadius>0&&!Object.keys(n.boundVariables||{}).some(k=>k.endsWith('Radius'))){
      bindRadius(n, n===B?12:n.name==='Номер'?9999:/^(Панель|Коротко)/.test(n.name)?8:null); }
    if(n.name==='|'&&n.type==='RECTANGLE'){ n.fills=[paint(C['line-default'])]; }
  }
  // 6. карточка блока — как IslandBlock: шапка, Content, подвал
  if(!isProto){
    B.strokes=[paint(C['line-default'])]; B.strokeWeight=1; B.strokeAlign='INSIDE';
    for(const k of ['paddingTop','paddingRight','paddingBottom','paddingLeft']){ B[k]=48; B.setBoundVariable(k,SP[48]); } B.itemSpacing=24; B.setBoundVariable('itemSpacing',SP[24]);
    const mid=B.children.filter(n=>n.name!=='Шапка'&&!/^(Для инженера|Источники)$/.test(n.name)&&n.name!=='Content');
    if(mid.length){ const ct=figma.createFrame(); ct.name='Content'; ct.fills=[]; ct.layoutMode='VERTICAL'; ct.itemSpacing=32; ct.setBoundVariable('itemSpacing',SP[32]);
      ct.primaryAxisSizingMode='AUTO'; ct.counterAxisSizingMode='AUTO'; ct.clipsContent=false;
      B.insertChild(B.children.indexOf(mid[0]),ct); for(const n of mid) ct.appendChild(n);
      if(B.counterAxisSizingMode==='FIXED') ct.layoutSizingHorizontal='FILL'; }
  }
}
return log;
