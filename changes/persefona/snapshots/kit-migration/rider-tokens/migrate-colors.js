// persefona-6 (AID-64): перевод витрины color-sem на странице 0:1 «✅ Colors» (Rider Tokens yrfG6u9osujKX8e1B14lpT) на Kit Persefona.
// Запуск через use_figma. COLS — id колонок-групп для этого прогона; HEADER=true — ещё и шапка витрины и секция.
// Меняется только вид оболочки: тексты переносятся 1:1. Образцы цвета Rider (Swatch: Color Overlay, шахматка) и режимы Mode Cell не трогаются.
const COLS = __COLS__;
const HEADER = __HEADER__;

const K = {
  st: { 'label-s':'b179157f175048e57d194430763321f566d2cb43','code-s':'dc6f78fc82ce91d3a06a28b1dabb01d17df35cca','body-s':'dede2b7c132add99b21cc5f0c90880b535b4ad26' },
  c: { 'text-primary':'f1ae466778bfebc4323580287007c99393922fea','text-secondary':'4b2825ef9a779f55c1332634032ad0b4faa64e20',
       'surface-main':'125448d6c36643d97f23500c7b74b1874738c645','surface-muted':'749515ebb1ca2d075277f4baeac3c54c65ef96aa',
       'line-default':'2a52e5ad5a83039e73014691e06c54e3d1b1cbfb' },
  sp: { 0:'5f1a475f1579646ebf9725210b19cd3d246132fa',2:'ced4852c090b1f2a216c6507ef73c99c6733ace5',6:'111d127b45acbfbe6610e4f8787e2a5d3fd776ba',8:'c23139ed5f4bb3fb428410f43810433093c19f91',
        16:'b459ff37547b414ea6f4f6fea3fc2e1d76f3dd96',24:'b287ebd1044990477d532e55da91e824f099a34b',32:'44c2a65a76db8fadb04e5b739ad0754af0249973',40:'a9d24156af271d475a3648700a3d79d13de50735',
        48:'e0272ce24e25e0dc663e2ccf3adac07ae09cc35b' },
  r: { s:'27bf75a5ed353cbb4ee74302db91e3702b7dc359', m:'430a007fc643ff90984da87658024a3f2a7dde8f', l:'ca07e9e0afde0bd5cb5c952a9daf371b3bd68d4c' },
  comp: { headerPage:'21df81e076e13e27d067cc374c63bc38bdbea9e3', headerSection:'09e45bfbda7bdf79a6a47b1c969ade6e913b0467',
          badgeNeutral:'969d7acc320e983331f6a43ae3ae1d5016679e7c', cellHeader:'5ebdfe8d3a9adbccc8594e851b6f794f8c19834a' },
};
const S={},C={},SP={},R={};
for(const k in K.st) S[k]=await figma.importStyleByKeyAsync(K.st[k]);
for(const k in K.c) C[k]=await figma.variables.importVariableByKeyAsync(K.c[k]);
for(const k in K.sp) SP[k]=await figma.variables.importVariableByKeyAsync(K.sp[k]);
for(const k in K.r) R[k]=await figma.variables.importVariableByKeyAsync(K.r[k]);
const HP=await figma.importComponentByKeyAsync(K.comp.headerPage), HS=await figma.importComponentByKeyAsync(K.comp.headerSection);
const BN=await figma.importComponentByKeyAsync(K.comp.badgeNeutral), TH=await figma.importComponentByKeyAsync(K.comp.cellHeader);
for(const f of [['Google Sans','Regular'],['Google Sans','Medium'],['Google Sans','Bold'],['Google Sans Code','Regular'],['Montserrat','Medium'],['Inter','Bold']]) await figma.loadFontAsync({family:f[0],style:f[1]});

// запасной цвет краски = значение переменной (иначе рендер без библиотеки рисует чёрный)
async function resolved(v){ let cur=v; for(let i=0;i<5;i++){ const val=cur.valuesByMode[Object.keys(cur.valuesByMode)[0]]; if(val&&val.type==='VARIABLE_ALIAS') cur=await figma.variables.getVariableByIdAsync(val.id); else return val; } }
const FB=new Map(); for(const k in C) FB.set(C[k].id, await resolved(C[k]));
const paint=v=>{ const c=FB.get(v.id)||{r:0,g:0,b:0,a:1}; return figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:c.r,g:c.g,b:c.b},opacity:c.a??1},'color',v); };
const pad=(n,t,r,b,l)=>{ for(const [k,v] of [['paddingTop',t],['paddingRight',r],['paddingBottom',b],['paddingLeft',l]]){ n[k]=v; n.setBoundVariable(k,SP[v]); } };
const gap=(n,v)=>{ n.itemSpacing=v; n.setBoundVariable('itemSpacing',SP[v]); };
const rad=(n,key)=>{ for(const k of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) n.setBoundVariable(k,R[key]); };
const txt=async(t,style,color)=>{ await t.setTextStyleIdAsync(S[style].id); t.fills=[paint(C[color])]; log.texts++; };
const log={texts:0,headerSections:0,cells:0,rows:0,swatches:0,separators:0,left:[]};

const sec=await figma.getNodeByIdAsync('28:2282'), vars=await figma.getNodeByIdAsync('28:2');

for(const cid of COLS){
  const col=await figma.getNodeByIdAsync(cid);
  // карточка группы — вид IslandBlock
  col.fills=[paint(C['surface-main'])]; col.strokes=[paint(C['line-default'])]; col.strokeWeight=1; col.strokeAlign='INSIDE';
  rad(col,'l'); pad(col,48,48,48,48); gap(col,24);
  // заголовок группы → HeaderSection
  const md=col.children.find(n=>n.name==='_MD-Display');
  if(md){ const t=md.findOne(n=>n.type==='TEXT'); const hs=HS.createInstance(); const p=hs.componentProperties; const key=s=>Object.keys(p).find(k=>k.startsWith(s));
    hs.setProperties({[key('Title')]:t.characters,[key('Show Subtitle')]:false}); col.insertChild(col.children.indexOf(md),hs); hs.layoutSizingHorizontal='FILL'; md.remove(); log.headerSections++; }
  const grp=col.children.find(n=>n.name.startsWith('Group: ')); gap(grp,16);
  const tc=grp.children.find(n=>n.name==='Table Container');
  tc.fills=[paint(C['surface-main'])]; tc.strokes=[paint(C['line-default'])]; tc.strokeWeight=1; tc.strokeAlign='INSIDE'; rad(tc,'m'); tc.clipsContent=true;
  // шапка таблицы → TableCell Header; отступ шапки 16 + отступ ячейки 16 = 32, как у строк
  const th=tc.children.find(n=>n.name==='Table Header');
  th.fills=[paint(C['surface-muted'])]; pad(th,0,16,0,16); gap(th,40); th.layoutSizingHorizontal='FILL';
  th.strokes=[paint(C['line-default'])]; th.strokeAlign='INSIDE'; th.strokeTopWeight=0; th.strokeLeftWeight=0; th.strokeRightWeight=0; th.strokeBottomWeight=1;
  for(const cell of th.children.filter(n=>n.type==='FRAME')){ const t=cell.findOne(n=>n.type==='TEXT'); const inst=TH.createInstance(); inst.name='TableCell';
    const tk=Object.keys(inst.componentProperties).find(k=>k.startsWith('Text')); inst.setProperties({[tk]:t?t.characters:''});
    th.insertChild(th.children.indexOf(cell),inst); inst.layoutSizingHorizontal='FIXED'; inst.resize(cell.width,inst.height); cell.remove(); log.cells++; }
  // строки — фреймы на переменных и стилях Kit (вид TokenRow: имя label-s, значение code-s, описание body-s)
  const rows=tc.children.find(n=>n.name==='Rows');
  for(const row of rows.children){
    if(row.name==='Separator'){ row.fills=[paint(C['line-default'])]; log.separators++; continue; }
    if(row.type!=='FRAME') { log.left.push('строка '+row.type+' '+row.id); continue; }
    pad(row,row.paddingTop===6?6:row.paddingTop,32,row.paddingBottom===6?6:row.paddingBottom,32); gap(row,40); log.rows++;
    for(const ch of row.children){
      if(ch.type==='TEXT'){ await txt(ch,'body-s','text-secondary'); continue; }
      if(ch.name==='Name'){ pad(ch,0,0,0,0); const chip=ch.children.find(n=>n.name==='Name Chip');
        if(chip){ chip.fills=[]; pad(chip,0,0,0,0); chip.cornerRadius=0; const t=chip.findOne(n=>n.type==='TEXT'); if(t) await txt(t,'label-s','text-primary'); } continue; }
      if(ch.name==='Mode Cell'){ pad(ch,6,0,6,0); gap(ch,8);
        const sw=ch.children.find(n=>n.name==='Swatch'); if(sw){ sw.strokes=[paint(C['line-default'])]; rad(sw,'s'); log.swatches++; }
        const ti=ch.children.find(n=>n.name==='Text Info'); if(ti){ gap(ti,2); for(const t of ti.children.filter(n=>n.type==='TEXT')) await txt(t, 'code-s', t.fontSize<=10?'text-secondary':'text-primary'); }
        continue; }
      log.left.push('узел '+ch.type+' '+ch.name+' '+ch.id);
    }
  }
}

if(HEADER){
  // секция витрины
  sec.fills=[paint(C['surface-main'])]; sec.strokes=[paint(C['line-default'])];
  gap(vars,40);
  // шапка витрины → HeaderPage (тексты 1:1: заголовок, подзаголовок, версия в метке; слой метки сохраняет имя {version})
  const old=await figma.getNodeByIdAsync('32:2349');
  const g0=Math.round(vars.y-(old.y+old.height)); // отступ шапка → таблицы, как был
  const title=old.findOne(n=>n.name==='Семантические цвета'&&n.type==='TEXT').characters;
  const ver=old.findOne(n=>n.name==='{version}').characters;
  const sub=old.children.find(n=>n.type==='TEXT').characters;
  const hp=HP.createInstance(); const p=hp.componentProperties; const key=s=>Object.keys(p).find(k=>k.split('#')[0]===s);
  hp.setProperties({[key('Title')]:title,[key('Subtitle')]:sub,[key('Show How to Read')]:false,[key('Show Cover Link')]:false});
  sec.appendChild(hp); hp.x=old.x; hp.y=old.y;
  const contents=hp.findOne(n=>n.name==='Contents'); if(contents) contents.visible=false;
  const slot=hp.findOne(n=>n.type==='SLOT');
  const b=BN.createInstance(); b.name='Badge'; const bk=Object.keys(b.componentProperties).find(k=>k.startsWith('Text')); b.setProperties({[bk]:ver});
  const bt=b.findOne(n=>n.type==='TEXT'); if(bt) bt.name='{version}';
  let slotMode='';
  try{ for(const c of [...slot.children]) c.remove(); slot.appendChild(b); slotMode='заменены'; }
  catch(e){ b.remove(); const bs=slot.children; const t0=bs[0]; const k0=Object.keys(t0.componentProperties).find(k=>k.startsWith('Text')); t0.setProperties({[k0]:ver}); for(const x of bs.slice(1)) x.visible=false; slotMode='первая переписана, остальные скрыты: '+e.message; }
  log.slot=slotMode;
  old.remove();
  hp.resize(vars.width, hp.height);
  vars.y=hp.y+hp.height+g0;
  log.hp=hp.id;
}
// размеры секции и место чейнжлога (отступ справа как был — 182)
sec.resizeWithoutConstraints(vars.x*2+vars.width, vars.y+vars.height+vars.x);
const hpN=sec.children.find(n=>n.type==='INSTANCE'); if(hpN) hpN.resize(vars.width,hpN.height);
const cl=await figma.getNodeByIdAsync('31:66'); cl.x=sec.x+sec.width+182; cl.y=sec.y;
log.sec=[Math.round(sec.width),Math.round(sec.height)];
return log;
