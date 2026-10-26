// persefona-6 (AID-64): страница 0:1 «Icons» файла 🙋‍♂️ AID Rider Icons (n6LppQbTv85yI29h6u30DI) — оболочка на Kit Persefona.
// Запуск через use_figma. Меняется только вид: тексты переносятся 1:1 (в свойства HeaderPage / HeaderSection или остаются на месте).
// Не трогаются: мастера иконок (их содержимое и id), таблица чейнжлога 3703:4 (только позиция фрейма).
const SECTION='3698:316', DESCR='18:52', CHANGELOG='3703:4', GAP=80;

const K = {
  st: { 'code-s':'dc6f78fc82ce91d3a06a28b1dabb01d17df35cca' },  // 12/16 — та же метрика, что у подписи Rider Captions/Caption
  c: { 'text-secondary':'4b2825ef9a779f55c1332634032ad0b4faa64e20','surface-main':'125448d6c36643d97f23500c7b74b1874738c645','line-default':'2a52e5ad5a83039e73014691e06c54e3d1b1cbfb' },
  sp: { 24:'b287ebd1044990477d532e55da91e824f099a34b', 48:'e0272ce24e25e0dc663e2ccf3adac07ae09cc35b' },
  r: { 16:'c0fef2998af49f2638481b5cf3968e5d2b0bb727' },
  comp: { headerPage:'21df81e076e13e27d067cc374c63bc38bdbea9e3', headerSection:'09e45bfbda7bdf79a6a47b1c969ade6e913b0467' },
};
const S={},C={},SP={},R={};
for(const k in K.st) S[k]=await figma.importStyleByKeyAsync(K.st[k]);
for(const k in K.c) C[k]=await figma.variables.importVariableByKeyAsync(K.c[k]);
for(const k in K.sp) SP[k]=await figma.variables.importVariableByKeyAsync(K.sp[k]);
for(const k in K.r) R[k]=await figma.variables.importVariableByKeyAsync(K.r[k]);
const HP=await figma.importComponentByKeyAsync(K.comp.headerPage), HS=await figma.importComponentByKeyAsync(K.comp.headerSection);
for(const f of [['Google Sans','Regular'],['Google Sans','Medium'],['Google Sans Code','Regular']]) await figma.loadFontAsync({family:f[0],style:f[1]});

// запасной цвет краски = значение переменной (иначе рендер без библиотеки рисует чёрный)
async function resolved(v){ let cur=v; for(let i=0;i<5;i++){ const val=cur.valuesByMode[Object.keys(cur.valuesByMode)[0]]; if(val&&val.type==='VARIABLE_ALIAS') cur=await figma.variables.getVariableByIdAsync(val.id); else return val; } }
const FB=new Map(); for(const k in C) FB.set(C[k].id, await resolved(C[k]));
const paint=(v)=>{ const c=FB.get(v.id)||{r:0,g:0,b:0,a:1}; return figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:c.r,g:c.g,b:c.b},opacity:c.a??1},'color',v); };
const bindR=(n,v)=>{ for(const k of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) n.setBoundVariable(k,v); };
const bindPad=(n,v)=>{ for(const k of ['paddingTop','paddingRight','paddingBottom','paddingLeft']){ n[k]=48; n.setBoundVariable(k,v); } };
const tkey=(inst,s)=>Object.keys(inst.componentProperties).find(k=>k.startsWith(s));
const log={cards:[],captions:0,left:[]};

const P=await figma.getNodeByIdAsync('0:1'); await figma.setCurrentPageAsync(P);
const SEC=await figma.getNodeByIdAsync(SECTION);
const cards=SEC.children.filter(n=>n.type==='FRAME').sort((a,b)=>a.x-b.x);

for(const card of cards){
  const head=card.children.find(n=>n.name==='Head');
  const titleT=head&&head.findOne(n=>n.type==='TEXT');
  const title=titleT?titleT.characters:card.name;
  // карточка — вид IslandBlock
  card.fills=[paint(C['surface-main'])]; card.strokes=[paint(C['line-default'])]; card.strokeWeight=1; card.strokeAlign='INSIDE';
  card.effects=[]; bindR(card,R[16]); card.clipsContent=false;
  const hs=HS.createInstance(); hs.name='HeaderSection'; hs.setProperties({[tkey(hs,'Title')]:title,[tkey(hs,'Show Subtitle')]:false});
  if(card.layoutMode==='VERTICAL'){
    const rows=card.children.filter(n=>n!==head);
    bindPad(card,SP[48]); card.itemSpacing=24; card.setBoundVariable('itemSpacing',SP[24]);
    card.primaryAxisSizingMode='AUTO'; card.counterAxisSizingMode='AUTO';
    const ct=figma.createFrame(); ct.name='Content'; ct.fills=[]; ct.layoutMode='VERTICAL'; ct.itemSpacing=0; ct.clipsContent=false;
    ct.primaryAxisSizingMode='AUTO'; ct.counterAxisSizingMode='AUTO';
    card.insertChild(0,hs); card.insertChild(1,ct);
    for(const r of rows){ ct.appendChild(r); for(const k of ['paddingTop','paddingRight','paddingBottom','paddingLeft']) r[k]=0; r.layoutSizingHorizontal='HUG'; r.layoutSizingVertical='HUG'; }
    head.remove(); hs.layoutSizingHorizontal='FILL';
  } else {
    // свободная раскладка (Status, Markers, Scooters): шапка — HeaderSection на отступе 48, содержимое поднимается под неё
    const rest=card.children.filter(n=>n!==head);
    for(const n of rest) n.constraints={horizontal:'MIN',vertical:'MIN'}; // у Status было CENTER — иконки уезжали
    card.appendChild(hs); hs.x=48; hs.y=48; hs.resize(card.width-96,hs.height);
    const minY=Math.min(...rest.map(n=>n.y)); const dy=48+hs.height+24-minY;
    for(const n of rest) n.y+=dy;
    head.remove();
    const maxB=Math.max(...rest.map(n=>n.y+n.height), hs.y+hs.height);
    card.resizeWithoutConstraints(card.width, maxB+48);
  }
  // подписи имён иконок — code-s, text-secondary (вне мастеров); поле — ширина ячейки минус 4 с каждой стороны (моно переносит чаще)
  for(const t of card.findAll(n=>n.type==='TEXT'&&n.name==='title')){
    let p=t.parent, inC=false; while(p&&p!==card){ if(['INSTANCE','COMPONENT','COMPONENT_SET'].includes(p.type)) inC=true; p=p.parent; } if(inC) continue;
    await t.setTextStyleIdAsync(S['code-s'].id); t.fills=[paint(C['text-secondary'])];
    t.resize(t.parent.width-8,t.height); t.x=4; t.textAutoResize='HEIGHT'; log.captions++;
  }
  log.cards.push(card.id+' '+title);
}

// секция — фон Kit, шапка страницы в левом верхнем углу
SEC.fills=[paint(C['surface-main'])];
const D=await figma.getNodeByIdAsync(DESCR);
const dTexts=D.children.filter(n=>n.type==='TEXT');
const dTitle=dTexts.find(n=>n.name==='Icons').characters, dSub=dTexts.find(n=>n.name!=='Icons').characters;
const hp=HP.createInstance(); hp.name='HeaderPage'; SEC.appendChild(hp); hp.x=GAP; hp.y=GAP; hp.resize(1216,hp.height);
const contents=cards.map((c,i)=>(i+1)+'. '+(log.cards[i].split(' ').slice(1).join(' '))).join('\n');
hp.setProperties({[tkey(hp,'Title')]:dTitle,[tkey(hp,'Subtitle')]:dSub,[tkey(hp,'Contents')]:contents,[tkey(hp,'Show How to Read')]:false,[tkey(hp,'Show Cover Link')]:false});
const slot=hp.findOne(n=>n.type==='SLOT');
const badges=slot?slot.children.filter(n=>n.type==='INSTANCE'):[];
if(badges[0]) badges[0].setProperties({[tkey(badges[0],'Text')]:'Принято'});
if(badges[1]) badges[1].setProperties({[tkey(badges[1],'Text')]:'Rider'});
log.badges=badges.map(b=>b.componentProperties[tkey(b,'Text')].value+'·'+b.componentProperties.Tone?.value);
// ссылки содержания → карточки
const items=hp.findOne(n=>n.type==='TEXT'&&n.name==='Contents Items');
if(items){ let pos=0; const lines=items.characters.split('\n'); lines.forEach((l,i)=>{ items.setRangeHyperlink(pos,pos+l.length,{type:'NODE',value:cards[i].id}); pos+=l.length+1; }); }
D.remove();

// раскладка: шапка, под ней карточки в ряд с шагом 80
let x=GAP; const top=GAP+hp.height+GAP;
for(const c of cards){ c.x=x; c.y=top; x+=c.width+GAP; }
const bottom=Math.max(...cards.map(c=>c.y+c.height));
SEC.resizeWithoutConstraints(Math.max(x, GAP+1216+GAP), bottom+GAP);
// чейнжлог — справа от секции, верх по верху, отступ 80 (таблица не перестраивается)
const CL=await figma.getNodeByIdAsync(CHANGELOG); CL.x=SEC.x+SEC.width+GAP; CL.y=SEC.y;
log.hp=hp.id; log.section=[SEC.x,SEC.y,SEC.width,SEC.height];
return log;
