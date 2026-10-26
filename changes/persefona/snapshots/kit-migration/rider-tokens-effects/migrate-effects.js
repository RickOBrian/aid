// persefona-6 (AID-64): перевод витрин Shadows 1:3, Glass 66:278, Space 1:4, Radius 1:5 (Rider Tokens yrfG6u9osujKX8e1B14lpT) на Kit Persefona.
// Запуск через use_figma, по прогону на страницу: RUN = {page, frame, title, version, cl, section}.
//   ['1:3','17:20','Shadows',null,'21:15','effects · Shadows'], ['66:278','70:12','Glass',null,'71:17','effects · Glass'],
//   ['1:4','62:34','Space','1.0.2','208:54','space'], ['1:5','63:14','Radius','1.0.0','204:50','radius'] (version — только если в шапке её нет: из последней строки чейнжлога).
// Меняется только вид оболочки. Шапка — по решению приёмки #465 §5.2 «б» (Title = имя страницы, прежние заголовок и подпись — в Subtitle,
// метки «Принято», «Rider», версия со слоем {version}). Образцы Rider (прямоугольник с тенью, стекло, полосы отступов, рамки скруглений) не трогаются.
// Витрина и её чейнжлог ложатся в секцию (§6.3): поля 80, чейнжлог справа верхом по верху, отступ 120; узлы перемещаются, id прежние.
const [PAGE, FRAME, TITLE, VERSION, CL, SECTION] = __RUN__;
const K = {
  st: { 'heading-s':'3e24e1f1618f2159a35c55d1087a40eee8354e12','label-s':'b179157f175048e57d194430763321f566d2cb43','body-m':'3a3b69e506572164e7cd8b0cb0585615dd88ed12',
        'body-s':'dede2b7c132add99b21cc5f0c90880b535b4ad26','code-s':'dc6f78fc82ce91d3a06a28b1dabb01d17df35cca' },
  c: { 'text-primary':'f1ae466778bfebc4323580287007c99393922fea','text-secondary':'4b2825ef9a779f55c1332634032ad0b4faa64e20',
       'surface-main':'125448d6c36643d97f23500c7b74b1874738c645','surface-muted':'749515ebb1ca2d075277f4baeac3c54c65ef96aa','surface-zebra':'864a9210e3ef4604f9c2fc6a99d445b9314a0982',
       'line-default':'2a52e5ad5a83039e73014691e06c54e3d1b1cbfb' },
  sp: { 0:'5f1a475f1579646ebf9725210b19cd3d246132fa',10:'b51d6aa356e3fa35bd7a10bf88f20ae2d7099902',16:'b459ff37547b414ea6f4f6fea3fc2e1d76f3dd96',24:'b287ebd1044990477d532e55da91e824f099a34b',
        32:'44c2a65a76db8fadb04e5b739ad0754af0249973',48:'e0272ce24e25e0dc663e2ccf3adac07ae09cc35b' },
  r: { m:'430a007fc643ff90984da87658024a3f2a7dde8f', l:'ca07e9e0afde0bd5cb5c952a9daf371b3bd68d4c' },
  comp: { headerPage:'21df81e076e13e27d067cc374c63bc38bdbea9e3', badgeNeutral:'969d7acc320e983331f6a43ae3ae1d5016679e7c', badgeSuccess:'4f40df859f56f629da61b2bda40ea423072c50dc',
          cellHeader:'5ebdfe8d3a9adbccc8594e851b6f794f8c19834a' },
};
await figma.setCurrentPageAsync(await figma.getNodeByIdAsync(PAGE));
const S={},C={},SP={},R={};
for(const k in K.st) S[k]=await figma.importStyleByKeyAsync(K.st[k]);
for(const k in K.c) C[k]=await figma.variables.importVariableByKeyAsync(K.c[k]);
for(const k in K.sp) SP[k]=await figma.variables.importVariableByKeyAsync(K.sp[k]);
for(const k in K.r) R[k]=await figma.variables.importVariableByKeyAsync(K.r[k]);
const HP=await figma.importComponentByKeyAsync(K.comp.headerPage), BN=await figma.importComponentByKeyAsync(K.comp.badgeNeutral), BS=await figma.importComponentByKeyAsync(K.comp.badgeSuccess);
const TH=await figma.importComponentByKeyAsync(K.comp.cellHeader);
for(const f of [['Google Sans','Regular'],['Google Sans','Medium'],['Google Sans','Bold'],['Google Sans Code','Regular']]) await figma.loadFontAsync({family:f[0],style:f[1]});
// запасной цвет краски = значение переменной
async function resolved(v){ let cur=v; for(let i=0;i<5;i++){ const val=cur.valuesByMode[Object.keys(cur.valuesByMode)[0]]; if(val&&val.type==='VARIABLE_ALIAS') cur=await figma.variables.getVariableByIdAsync(val.id); else return val; } }
const FB=new Map(); for(const k in C) FB.set(C[k].id, await resolved(C[k]));
const paint=v=>{ const c=FB.get(v.id)||{r:0,g:0,b:0,a:1}; return figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:c.r,g:c.g,b:c.b},opacity:c.a??1},'color',v); };
const pad=(n,t,r,b,l)=>{ for(const [k,v] of [['paddingTop',t],['paddingRight',r],['paddingBottom',b],['paddingLeft',l]]){ n[k]=v; n.setBoundVariable(k,SP[v]); } };
const gap=(n,v)=>{ n.itemSpacing=v; n.setBoundVariable('itemSpacing',SP[v]); };
const rad=(n,key)=>{ for(const k of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) n.setBoundVariable(k,R[key]); };
const line=n=>{ n.strokes=[paint(C['line-default'])]; };
const txt=async(t,style,color)=>{ await t.setTextStyleIdAsync(S[style].id); t.fills=[paint(C[color])]; log.texts++; };
const hex=c=>'#'+[c.r,c.g,c.b].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('').toUpperCase();
const badge=(Cmp,t,layer)=>{ const b=Cmp.createInstance(); b.name='Badge'; const k=Object.keys(b.componentProperties).find(x=>x.startsWith('Text')); b.setProperties({[k]:t}); if(layer){ const bt=b.findOne(n=>n.type==='TEXT'); if(bt) bt.name=layer; } return b; };
const log={texts:0,headers:0,groups:0,subgroups:0,styles:0,cells:0,rows:0,left:[]};
const isText=n=>n.type==='TEXT';

// строка таблицы токенов: шапка (все тексты Medium 14) → TableCell Header; подгруппа (один жирный текст) → полоса; остальное — строка
async function tableRow(r){
  r.layoutSizingHorizontal='FILL';
  const ts=r.children.filter(isText);
  if(ts.length>=3&&ts.length===r.children.length&&ts.every(t=>t.fontName.style==='Medium'&&t.fontSize===14)){
    r.fills=[paint(C['surface-muted'])]; pad(r,0,0,0,0); gap(r,0);
    ts.forEach((t,i)=>{ const inst=TH.createInstance(); inst.name='TableCell'; const k=Object.keys(inst.componentProperties).find(x=>x.startsWith('Text')); inst.setProperties({[k]:t.characters});
      r.insertChild(r.children.indexOf(t),inst); if(i<ts.length-1){ inst.layoutSizingHorizontal='FIXED'; inst.resize((VALW&&i>0?VALW:t.width)+16,inst.height); } else inst.layoutSizingHorizontal='FILL'; // +16 — отступ ячейки = шаг строки
      t.remove(); log.cells++; });
    return; }
  if(ts.length===1&&r.children.length===1&&ts[0].fontName.style==='Bold'){
    r.fills=[paint(C['surface-muted'])]; pad(r,10,16,10,16); await txt(ts[0],'label-s','text-primary'); log.subgroups++; return; }
  const f=r.fills[0]; r.fills=[paint(C[f&&f.type==='SOLID'&&hex(f.color)!=='#FFFFFF'?'surface-zebra':'surface-main'])];
  pad(r,10,16,10,16); gap(r,16); r.counterAxisAlignItems='CENTER'; log.rows++;
  const kids=r.children;
  if(kids.some(n=>n.name==='Example')){ // Space / Radius: имя | Example (образец Rider + число) | значение
    const [name,ex,val]=kids; await txt(name,'label-s','text-primary');
    gap(ex,16); ex.counterAxisAlignItems='CENTER'; for(const t of ex.children.filter(isText)) await txt(t,'code-s','text-primary'); // образец (не текст) — контент Rider
    if(val&&isText(val)) await txt(val,'code-s','text-primary');
    for(const n of kids.slice(3)) log.left.push('узел '+n.id);
    return; }
  // Shadows / Glass: параметр | Day | Night | токен
  for(let i=0;i<ts.length;i++){ const last=i===ts.length-1;
    await txt(ts[i], i===0?'body-m':'code-s', last?'text-secondary':'text-primary');
    if(i>0&&!last){ if(VALW) ts[i].resize(VALW,ts[i].height); ts[i].textAutoResize='HEIGHT'; } } // значения rgba(…) в code-s шире прежних 130
  const last=ts[ts.length-1]; if(last&&ts.length>1){ last.layoutSizingHorizontal='FILL'; last.textAutoResize='HEIGHT'; } // имя токена в code-s длиннее — перенос
  for(const n of kids.filter(n=>!isText(n))) log.left.push('узел '+n.type+' '+n.id);
}
async function tokenTable(tt){ tt.fills=[paint(C['surface-main'])]; line(tt); rad(tt,'m'); tt.clipsContent=true; for(const r of tt.children) await tableRow(r); }

const F=await figma.getNodeByIdAsync(FRAME);
const D0=F.children.find(n=>n.name==='Data'); const VALW=D0?170:0; // Shadows, Glass: столбцы Day / Night — 170 (rgba(133,38,255,0.12) в code-s)
// витрина — вид IslandBlock
F.fills=[paint(C['surface-main'])]; line(F); F.strokeAlign='INSIDE'; rad(F,'l'); pad(F,48,48,48,48); gap(F,24);
// шапка → HeaderPage
const old=F.children.find(n=>n.name==='Header');
if(old){ const tEl=old.findOne(n=>n.name==='Title'); const title=tEl.findOne(n=>isText(n)&&n.name!=='{version}').characters;
  const vEl=old.findOne(n=>n.name==='{version}'); const ver=vEl?vEl.characters:VERSION; const sub=old.children.find(isText).characters;
  const hp=HP.createInstance(); const key=s=>Object.keys(hp.componentProperties).find(k=>k.split('#')[0]===s);
  hp.setProperties({[key('Title')]:TITLE,[key('Subtitle')]:title+'\n'+sub,[key('Show How to Read')]:false,[key('Show Cover Link')]:false});
  F.insertChild(F.children.indexOf(old),hp); hp.layoutSizingHorizontal='FILL';
  const contents=hp.findOne(n=>n.name==='Contents'); if(contents) contents.visible=false;
  const slot=hp.findOne(n=>n.type==='SLOT'); for(const c of [...slot.children]) c.remove();
  slot.appendChild(badge(BS,'Принято')); slot.appendChild(badge(BN,'Rider')); if(ver) slot.appendChild(badge(BN,ver,'{version}'));
  old.remove(); log.headers++; log.hp=hp.id; log.version=(vEl?'из шапки ':'из чейнжлога ')+ver; }
// содержимое витрины
for(const ch of F.children){
  if(ch.type==='INSTANCE') continue;
  if(ch.name==='Token Table'){ await tokenTable(ch); continue; } // Space, Radius; ширина таблицы прежняя
  if(ch.name==='Data'){ line(ch); rad(ch,'m'); ch.clipsContent=true;
    for(const row of ch.children){
      if(row.name.startsWith('Group · ')){ row.fills=[paint(C['surface-muted'])]; line(row); pad(row,16,32,16,32); for(const t of row.findAll(isText)) await txt(t,'heading-s','text-primary'); log.groups++; continue; }
      row.fills=[paint(C['surface-main'])]; line(row); pad(row,32,32,32,32); gap(row,48); log.styles++;
      const sample=row.children.find(n=>n.name==='Sample');
      if(sample){ gap(sample,16); sample.resize(280,sample.height); const ts=sample.children.filter(isText); // столбец образца 400 → 280: место таблице токенов
        for(const t of ts) t.textAutoResize='WIDTH_AND_HEIGHT'; // подпись «Стиль: Bottom Sheet» в body-s не переносится
        if(ts[0]) await txt(ts[0],'label-s','text-secondary'); // имя стиля
        if(ts[1]) await txt(ts[1],'body-s','text-secondary'); // «Стиль: …»
        for(const t of ts.slice(2)) log.left.push('текст '+t.id); } // образец (прямоугольник с тенью, стекло) — контент Rider
      const tt=row.children.find(n=>n.name==='Token Table');
      if(tt) await tokenTable(tt);
    }
    continue; }
  log.left.push('блок '+ch.id+' '+ch.name);
}
// Shadows, Glass: витрина 1400 (как Typography), строки и таблицы токенов — FILL: моноширинные значения и имена токенов не помещались в 710
if(D0){ F.counterAxisSizingMode='FIXED'; F.resize(1400,F.height); D0.layoutSizingHorizontal='FILL';
  for(const row of D0.children){ row.layoutSizingHorizontal='FILL'; const tt=row.children.find(n=>n.name==='Token Table'); if(tt) tt.layoutSizingHorizontal='FILL'; } }
F.primaryAxisSizingMode='AUTO'; // у Radius высота витрины была фиксированной
// секция: витрина + чейнжлог справа (отступ 120), поля 80
const CLN=await figma.getNodeByIdAsync(CL);
let sec=F.parent.type==='SECTION'?F.parent:null;
if(!sec){ const x0=F.x-80, y0=F.y-80; sec=figma.createSection(); sec.name=SECTION; figma.currentPage.appendChild(sec); sec.x=x0; sec.y=y0; sec.appendChild(F); sec.appendChild(CLN); }
F.x=80; F.y=80; CLN.x=80+F.width+120; CLN.y=80;
sec.resizeWithoutConstraints(80+F.width+120+CLN.width+80, 80+Math.max(F.height,CLN.height)+80);
sec.fills=[paint(C['surface-main'])]; sec.strokes=[paint(C['line-default'])];
log.section=sec.id+' '+Math.round(sec.width)+'x'+Math.round(sec.height); log.frame=Math.round(F.width)+'x'+Math.round(F.height);
return log;
