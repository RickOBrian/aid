// persefona-6 (AID-64): страница 0:88 «Icons» файла Driver Icons (AwRpEGfyeNjRbZP8KGG1wy) — оболочка на Kit Persefona.
// Запуск через use_figma. Только вид: тексты 1:1. Мастера иконок, черновики стрелок полос (17 фреймов вне блоков) и таблица 5503:18 не меняются (у таблицы — только позиция).
const CARDS=['4:186','732:917','653:1418','732:919','732:920','2641:4'], RULES='3465:68', CHANGELOG='5503:18', GAP=80;
const HIGHLIGHTS=['3475:31','3475:33','3475:34','3475:36','3475:37','3475:38']; // серые плашки под словами — уходят (вопрос 2)
const SUBTITLE='Иконки Driver по категориям и правила, по которым их рисуют и называют.'; // новый текст оболочки (вопрос 3)
const K={ st:{'heading-s':'3e24e1f1618f2159a35c55d1087a40eee8354e12','body-m':'3a3b69e506572164e7cd8b0cb0585615dd88ed12','code-m':'78f4e2bf0494b1e09fe81b9c17ae652c5be8ca74'},
  c:{'text-primary':'f1ae466778bfebc4323580287007c99393922fea','text-secondary':'4b2825ef9a779f55c1332634032ad0b4faa64e20','text-accent-vivid':'949da370ec78b97f0149318b2cbaad9c292e8da7',
     'text-error':'b35f422500178aed070c2a1a5cea524ec3b8cf86','surface-main':'125448d6c36643d97f23500c7b74b1874738c645','line-default':'2a52e5ad5a83039e73014691e06c54e3d1b1cbfb'},
  r:{l:'ca07e9e0afde0bd5cb5c952a9daf371b3bd68d4c'},
  comp:{headerPage:'21df81e076e13e27d067cc374c63bc38bdbea9e3',headerSection:'09e45bfbda7bdf79a6a47b1c969ade6e913b0467'} };
const S={},C={},R={};
for(const k in K.st) S[k]=await figma.importStyleByKeyAsync(K.st[k]);
for(const k in K.c) C[k]=await figma.variables.importVariableByKeyAsync(K.c[k]);
for(const k in K.r) R[k]=await figma.variables.importVariableByKeyAsync(K.r[k]);
const HP=await figma.importComponentByKeyAsync(K.comp.headerPage), HS=await figma.importComponentByKeyAsync(K.comp.headerSection);
for(const f of [['Google Sans','Regular'],['Google Sans','Medium'],['Google Sans Code','Regular']]) await figma.loadFontAsync({family:f[0],style:f[1]});
async function resolved(v){ let cur=v; for(let i=0;i<5;i++){ const val=cur.valuesByMode[Object.keys(cur.valuesByMode)[0]]; if(val&&val.type==='VARIABLE_ALIAS') cur=await figma.variables.getVariableByIdAsync(val.id); else return val; } }
const FB=new Map(); for(const k in C) FB.set(C[k].id, await resolved(C[k]));
const paint=v=>{ const c=FB.get(v.id)||{r:0,g:0,b:0,a:1}; return figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:c.r,g:c.g,b:c.b},opacity:c.a??1},'color',v); };
const hex=c=>'#'+[c.r,c.g,c.b].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('').toUpperCase();
const tkey=(i,s)=>Object.keys(i.componentProperties).find(k=>k.startsWith(s));
const island=n=>{ n.fills=[paint(C['surface-main'])]; n.strokes=[paint(C['line-default'])]; n.strokeWeight=1; n.strokeAlign='INSIDE'; if(n.layoutMode&&n.layoutMode!=='NONE') n.strokesIncludedInLayout=false; n.effects=[];
  for(const k of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) n.setBoundVariable(k,R.l); };
const header=(title,w)=>{ const hs=HS.createInstance(); hs.name='HeaderSection'; hs.setProperties({[tkey(hs,'Title')]:title,[tkey(hs,'Show Subtitle')]:false}); return hs; };
const log={cards:[],segments:0,left:[]};
const P=await figma.getNodeByIdAsync('0:88'); await figma.setCurrentPageAsync(P);

// 1. карточки категорий: вид IslandBlock, шапка — HeaderSection на 48, иконки под шапку (свободная раскладка)
const titles={};
for(const id of CARDS){ const card=await figma.getNodeByIdAsync(id);
  if(card.layoutMode&&card.layoutMode!=='NONE'){ log.left.push('автолейаут '+id); continue; }
  const head=card.children.find(n=>n.name==='_description/frame_head'); if(!head){ log.left.push('нет шапки '+id); continue; }
  const title=head.findOne(n=>n.type==='TEXT').characters; titles[id]=title;
  island(card);
  const rest=card.children.filter(n=>n!==head); for(const n of rest) n.constraints={horizontal:'MIN',vertical:'MIN'};
  const hs=header(title); card.appendChild(hs); hs.x=48; hs.y=48; hs.resize(card.width-96,hs.height);
  const dy=48+hs.height+24-Math.min(...rest.map(n=>n.y)); for(const n of rest) n.y+=dy;
  head.remove(); card.resizeWithoutConstraints(card.width, Math.max(...rest.map(n=>n.y+n.height))+48);
  log.cards.push(id+' '+title); }

// 2. «Правила иконок»: вид IslandBlock, шапка — HeaderSection, тексты по кускам на стили Kit, плашки под словами убраны
const RB=await figma.getNodeByIdAsync(RULES); if(RB.layoutMode&&RB.layoutMode!=='NONE') throw 'Правила: автолейаут';
const side=RB.children.find(n=>n.name==='Side'), main=RB.children.find(n=>n.name==='Main');
const rhead=side.children.find(n=>n.name==='_description/frame_head'); const rtitle=rhead.findOne(n=>n.type==='TEXT').characters; titles[RULES]=rtitle;
island(RB); RB.clipsContent=false; for(const n of [side,main]){ n.fills=[]; n.effects=[]; }
for(const id of HIGHLIGHTS){ const r=await figma.getNodeByIdAsync(id); if(r) r.remove(); }
for(const t of RB.findAll(n=>n.type==='TEXT'&&n!==rhead.findOne(x=>x.type==='TEXT'))){
  for(const f of t.getRangeAllFontNames(0,t.characters.length)) await figma.loadFontAsync(f);
  const segs=t.getStyledTextSegments(['fontName','fills']);
  for(const s of segs){ const fam=s.fontName.family, bold=/Bold|Medium/.test(s.fontName.style), f=s.fills[0]; const h=f?hex(f.color):''; const op=f?(f.opacity??1):1;
    let st,c;
    if(/Mono/.test(fam)){ st='code-m'; c= h==='#8526FF'?'text-accent-vivid': h==='#D62347'?'text-error': (op>=0.8||/Bold/.test(s.fontName.style))?'text-primary':'text-secondary'; }
    else if(/Bold/.test(s.fontName.style)){ if(op>=0.8){ st='heading-s'; c='text-primary'; } else { st='body-m'; c='text-primary'; } } // полужирное внутри абзаца → body-m text-primary (вопрос 1)
    else { st='body-m'; c='text-secondary'; }
    await t.setRangeTextStyleIdAsync(s.start,s.end,S[st].id); t.setRangeFills(s.start,s.end,[paint(C[c])]); log.segments++; } }
const top=48; const hs=header(rtitle); RB.appendChild(hs); hs.x=48; hs.y=top; hs.resize(RB.width-96,hs.height);
rhead.remove();
const ctop=top+hs.height+32;
side.y=ctop; side.paddingBottom=0; side.primaryAxisSizingMode='AUTO';
const f7=side.children.find(n=>n.name==='Frame 7'); const t7=f7.findOne(n=>n.type==='TEXT'); f7.layoutSizingVertical='FIXED'; f7.resize(f7.width,t7.y+t7.height);
const mk=main.children; const my=Math.min(...mk.map(n=>n.y)); for(const n of mk) n.y-=my; main.y=ctop;
const tOp=await figma.getNodeByIdAsync('3465:128'), tColor=await figma.getNodeByIdAsync('3478:25'), gLayers=await figma.getNodeByIdAsync('3478:24'), gShots=await figma.getNodeByIdAsync('3475:30'), shot=await figma.getNodeByIdAsync('3478:26');
const shotDy=shot.y-gShots.y;
tColor.y=tOp.y+tOp.height+40; gShots.y=gLayers.y+gLayers.height+40; shot.y=gShots.y+shotDy;
main.resizeWithoutConstraints(main.width, Math.max(...mk.map(n=>n.y+n.height)));
{ const rb=RB.absoluteBoundingBox; let mb=0; for(const n of RB.findAll(n=>n.type!=='FRAME')){ const b=n.absoluteRenderBounds||n.absoluteBoundingBox; if(b) mb=Math.max(mb,b.y+b.height-rb.y); }
  RB.resizeWithoutConstraints(RB.width, Math.round(mb)+48); } // высота — по нижнему краю содержимого

// 3. секция Icons: шапка страницы, правила, карточки в ряд
const sec=figma.createSection(); sec.name='Icons'; P.appendChild(sec); sec.x=0; sec.y=RB.y-GAP; sec.fills=[paint(C['surface-main'])]; sec.strokes=[]; // у новой секции по умолчанию обводка #000000
const hp=HP.createInstance(); hp.name='HeaderPage'; sec.appendChild(hp); hp.x=GAP; hp.y=GAP; hp.resize(1216,hp.height);
const order=[RULES,...CARDS]; const contents=order.map((id,i)=>(i+1)+'. '+titles[id]).join('\n');
hp.setProperties({[tkey(hp,'Title')]:P.name,[tkey(hp,'Subtitle')]:SUBTITLE,[tkey(hp,'Contents')]:contents,[tkey(hp,'Show How to Read')]:false,[tkey(hp,'Show Cover Link')]:false});
const badges=hp.findOne(n=>n.type==='SLOT').children.filter(n=>n.type==='INSTANCE');
if(badges[0]) badges[0].setProperties({[tkey(badges[0],'Text')]:'Принято'}); if(badges[1]) badges[1].setProperties({[tkey(badges[1],'Text')]:'Driver'});
log.badges=badges.map(b=>b.componentProperties[tkey(b,'Text')].value+'·'+b.componentProperties.Tone.value);
sec.appendChild(RB); RB.x=GAP; RB.y=GAP+hp.height+GAP;
let x=GAP; const rowY=RB.y+RB.height+GAP;
for(const id of CARDS){ const c=await figma.getNodeByIdAsync(id); sec.appendChild(c); c.x=x; c.y=rowY; x+=c.width+GAP; }
let maxB=0; for(const id of CARDS){ const c=await figma.getNodeByIdAsync(id); maxB=Math.max(maxB,c.y+c.height); }
sec.resizeWithoutConstraints(Math.max(x,GAP+RB.width+GAP), maxB+GAP);
const items=hp.findOne(n=>n.type==='TEXT'&&n.name==='Contents Items'); let pos=0;
items.characters.split('\n').forEach((l,i)=>{ items.setRangeHyperlink(pos,pos+l.length,{type:'NODE',value:order[i]}); pos+=l.length+1; });
// 4. чейнжлог — справа от секции, верх по верху, отступ 80 (таблица не перестраивается)
const CL=await figma.getNodeByIdAsync(CHANGELOG); CL.x=sec.x+sec.width+GAP; CL.y=sec.y;
log.hp=hp.id; log.section=[sec.id,sec.x,sec.y,sec.width,sec.height];
return log;
