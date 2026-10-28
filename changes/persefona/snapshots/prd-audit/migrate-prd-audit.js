// persefona-7 (AID-82): перевод страницы «🔍 Аудит · Главная vs PRD» 4280:4433 (New Rider DEV 5mg6h0oB8yRDoUfTruogca)
// на Kit Persefona по persefona-figma-pages §6.7 (#521). Запуск через use_figma; PART = 'A' | 'B' | 'C' | 'D'.
//   A — секции, шапка HeaderPage, легенда, заголовки блоков 1–2 → HeaderSection;
//   B — карточки пунктов 1.x и 2.x (вид IslandBlock, Badge метки и статуса, поля, ссылки «→»);
//   C — блок 3 «Есть в PRD, нет в макетах» из заметки: пункты 3.1…3.5;
//   D — раскладка секций, имя страницы.
// Меняется только вид. Тексты пунктов переносятся 1:1; клоны («Копия · …») и всё внутри них не трогаются.
const PART = __PART__;

const K = {
  st: { 'heading-s':'3e24e1f1618f2159a35c55d1087a40eee8354e12','body-m':'3a3b69e506572164e7cd8b0cb0585615dd88ed12','body-s':'dede2b7c132add99b21cc5f0c90880b535b4ad26' },
  c: { 'text-primary':'f1ae466778bfebc4323580287007c99393922fea','text-secondary':'4b2825ef9a779f55c1332634032ad0b4faa64e20',
       'text-accent-vivid':'949da370ec78b97f0149318b2cbaad9c292e8da7',
       'surface-main':'125448d6c36643d97f23500c7b74b1874738c645','surface-muted':'749515ebb1ca2d075277f4baeac3c54c65ef96aa',
       'line-default':'2a52e5ad5a83039e73014691e06c54e3d1b1cbfb' },
  sp: { 4:'ca03624ead4c2c2462c2624003e3395daf2be12f',8:'c23139ed5f4bb3fb428410f43810433093c19f91',12:'59b1fdb0d63c50cbdbdd4659319e948378e3e11d',
        16:'b459ff37547b414ea6f4f6fea3fc2e1d76f3dd96',24:'b287ebd1044990477d532e55da91e824f099a34b',32:'44c2a65a76db8fadb04e5b739ad0754af0249973',
        48:'e0272ce24e25e0dc663e2ccf3adac07ae09cc35b' },
  r: { 12:'ca07e9e0afde0bd5cb5c952a9daf371b3bd68d4c' },
  comp: { headerPage:'21df81e076e13e27d067cc374c63bc38bdbea9e3', headerSection:'09e45bfbda7bdf79a6a47b1c969ade6e913b0467',
          badge:{ Neutral:'969d7acc320e983331f6a43ae3ae1d5016679e7c', Warning:'a679c1cc835c93628943d8c31f15308f81b383e1', Info:'6c30f1b66003f2a7dc492447a16a6413962dcd55' } },
};
const S={},C={},SP={},R={},B={};
for(const k in K.st) S[k]=await figma.importStyleByKeyAsync(K.st[k]);
for(const k in K.c) C[k]=await figma.variables.importVariableByKeyAsync(K.c[k]);
for(const k in K.sp) SP[k]=await figma.variables.importVariableByKeyAsync(K.sp[k]);
for(const k in K.r) R[k]=await figma.variables.importVariableByKeyAsync(K.r[k]);
const HS=await figma.importComponentByKeyAsync(K.comp.headerSection);
for(const k in K.comp.badge) B[k]=await figma.importComponentByKeyAsync(K.comp.badge[k]);
for(const f of [['Google Sans','Regular'],['Google Sans','Medium'],['Inter','Regular'],['Inter','Medium'],['Inter','Semi Bold'],['Inter','Bold']]) await figma.loadFontAsync({family:f[0],style:f[1]});

// запасной цвет краски = значение переменной (иначе рендер без библиотеки рисует чёрный)
async function resolved(v){ let cur=v; for(let i=0;i<6;i++){ const val=cur.valuesByMode[Object.keys(cur.valuesByMode)[0]]; if(val&&val.type==='VARIABLE_ALIAS') cur=await figma.variables.getVariableByIdAsync(val.id); else return val; } }
const FB=new Map(); for(const k in C) FB.set(C[k].id, await resolved(C[k]));
const paint=v=>{ const c=FB.get(v.id); return figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:c.r,g:c.g,b:c.b},opacity:c.a??1},'color',v); };
const bind=(n,k,px)=>{ n[k]=px; n.setBoundVariable(k,SP[px]); };
const pad=(n,px)=>{ for(const k of ['paddingTop','paddingRight','paddingBottom','paddingLeft']) bind(n,k,px); };
const unpad=n=>{ for(const k of ['paddingTop','paddingRight','paddingBottom','paddingLeft']){ n.setBoundVariable(k,null); n[k]=0; } };
const radius=(n,px)=>{ for(const k of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']){ n[k]=px; n.setBoundVariable(k,R[px]); } };
async function styleText(t,style,color){ await t.setTextStyleIdAsync(S[style].id); t.fills=[paint(C[color])]; }
function badge(tone,text){ const b=B[tone].createInstance(); b.name='Badge'; const tk=Object.keys(b.componentProperties).find(k=>k.startsWith('Text')); b.setProperties({[tk]:text}); return b; }
function headerSection(title){ const i=HS.createInstance(); i.name='HeaderSection'; const p=i.componentProperties; const key=s=>Object.keys(p).find(k=>k.startsWith(s));
  i.setProperties({[key('Title')]:title,[key('Show Subtitle')]:false}); return i; }
// карточка — вид IslandBlock: bg-surface-main, line-default, radius-l, отступы spacing-48
function island(f,gap){ f.fills=[paint(C['surface-main'])]; f.strokes=[paint(C['line-default'])]; f.strokeWeight=1; f.strokeAlign='INSIDE'; radius(f,12); pad(f,48); bind(f,'itemSpacing',gap); }
// ссылка: «→ » в начале, гиперссылка прежняя, body-m / body-s text-accent-vivid
async function linkText(t,style){ const link=t.hyperlink; await styleText(t,style,'text-accent-vivid'); if(!t.characters.startsWith('→ ')) t.insertCharacters(0,'→ ','AFTER'); if(link&&link!==figma.mixed) t.hyperlink=link; }
const log={part:PART,badges:0,headers:0,texts:0,cards:0,fields:0,links:0,new:[]};

const page=await figma.getNodeByIdAsync('4280:4433'); await figma.setCurrentPageAsync(page);
const root=await figma.getNodeByIdAsync('4280:4434');
const BLOCK={1:'4280:4450',2:'4280:4558',3:'4280:4693'};
const TONE={1:['Warning','Расхождение'],2:['Info','Нет в PRD'],3:['Neutral','Нет в макетах']};

if(PART==='A'){
  // 1. секции: шапка и легенда (корень 4280:4434) + по секции на блок; фон bg-surface-muted
  const names=['PRD audit · Главная','1. Figma расходится с PRD','2. Есть в Figma, нет в PRD','3. Есть в PRD, нет в макетах'];
  const nodes=[root, await figma.getNodeByIdAsync(BLOCK[1]), await figma.getNodeByIdAsync(BLOCK[2]), await figma.getNodeByIdAsync(BLOCK[3])];
  let y=0;
  for(let i=0;i<4;i++){ const s=figma.createSection(); s.name=names[i]; s.fills=[paint(C['surface-main'])]; page.appendChild(s); s.x=0; s.y=y;
    s.appendChild(nodes[i]); nodes[i].x=80; nodes[i].y=80; s.resizeWithoutConstraints(nodes[i].width+160,nodes[i].height+160); y+=s.height+80; log.new.push(s.id+' '+s.name); }
  // 2. корень → «Шапка и легенда»
  root.name='Шапка и легенда'; root.fills=[]; unpad(root); bind(root,'itemSpacing',48);
  // 3. шапка: HeaderPage внутри фрейма «Шапка» 4280:4435
  const head=await figma.getNodeByIdAsync('4280:4435');
  const [tTitle,tSub,tLink]=head.children;
  const HP=await figma.importComponentByKeyAsync(K.comp.headerPage); const hp=HP.createInstance(); hp.name='HeaderPage';
  const p=hp.componentProperties; const key=s=>Object.keys(p).find(k=>k.startsWith(s));
  hp.setProperties({[key('Title')]:'PRD audit · Главная',[key('Subtitle')]:tSub.characters,[key('How to Read')]:'→ '+tLink.characters,[key('Show How to Read')]:true,[key('Show Cover Link')]:false,
    [key('Contents')]:names.slice(1).join('\n')});
  const link=tLink.hyperlink;
  head.appendChild(hp); tTitle.remove(); tSub.remove(); tLink.remove(); bind(head,'itemSpacing',12);
  const htr=hp.findOne(n=>n.type==='TEXT'&&n.name==='How to Read'); if(htr&&link){ await figma.loadFontAsync(htr.fontName); htr.hyperlink=link; }
  // метки шапки: «Смотреть и решать», номер задачи, кого ждут
  const slot=hp.findOne(n=>n.type==='SLOT'); const def=slot.children.slice();
  const want=[['Warning','Смотреть и решать'],['Neutral','AID-82 · Product Logic'],['Neutral','Ждёт дизайнера Where']];
  for(const [tone,text] of want){ slot.appendChild(badge(tone,text)); log.badges++; }
  for(const d of def) d.remove();
  log.new.push('HeaderPage '+hp.id);
  // 4. легенда — вид IslandBlock: HeaderSection «Легенда», Content: строки Badge + body-m, последняя — про клоны
  const L=await figma.getNodeByIdAsync('4280:4439');
  island(L,24); L.layoutSizingHorizontal='FILL';
  const lt=L.children.find(n=>n.type==='TEXT'&&n.characters==='Легенда'); const lhs=headerSection('Легенда'); L.insertChild(L.children.indexOf(lt),lhs); lhs.layoutSizingHorizontal='FILL'; lt.remove(); log.headers++;
  const ct=figma.createFrame(); ct.name='Content'; ct.fills=[]; ct.layoutMode='VERTICAL'; ct.primaryAxisSizingMode='AUTO'; bind(ct,'itemSpacing',16); ct.clipsContent=false;
  L.appendChild(ct); ct.layoutSizingHorizontal='FILL';
  const rows=L.children.filter(n=>n.name==='Строка легенды'); const note=L.children.find(n=>n.type==='TEXT'&&n.characters.startsWith('Справа в каждом пункте'));
  for(const r of rows){ ct.appendChild(r); bind(r,'itemSpacing',12); r.counterAxisAlignItems='CENTER';
    const m=r.children.find(n=>n.name==='Метка'); const mt=m.findOne(n=>n.type==='TEXT').characters; const tone=mt==='Расхождение'?'Warning':mt==='Нет в PRD'?'Info':'Neutral';
    const b=badge(tone,mt); r.insertChild(r.children.indexOf(m),b); m.remove(); log.badges++;
    for(const t of r.children.filter(n=>n.type==='TEXT')){ await styleText(t,'body-m','text-primary'); log.texts++; } }
  // третья строка — блок 3 появился по решению PD (§6.7: строка на каждую метку блока)
  const r3=rows[1].clone(); ct.appendChild(r3); r3.name='Строка легенды';
  const b3=r3.children.find(n=>n.type==='INSTANCE'); const nb=badge('Neutral','Нет в макетах'); r3.insertChild(0,nb); b3.remove();
  const t3=r3.children.find(n=>n.type==='TEXT'); t3.characters='Есть в PRD, нет в макетах: норма PRD, для которой макета нет.'; log.new.push('легенда, строка 3 '+r3.id);
  ct.appendChild(note); await styleText(note,'body-m','text-secondary'); note.layoutSizingHorizontal='FILL'; log.texts++;
  // 5. заголовки блоков 1 и 2 → HeaderSection; фреймы блоков прозрачные, шаг spacing-32
  for(const b of [1,2]){ const F=await figma.getNodeByIdAsync(BLOCK[b]); F.fills=[]; unpad(F); bind(F,'itemSpacing',32);
    const t=F.children[0]; const hs=headerSection(t.characters); F.insertChild(0,hs); hs.layoutSizingHorizontal='FILL'; t.remove(); log.headers++; }
}

if(PART==='B'||PART==='C'){
  const LABELS=new Set(['PRD:','Макет:','Комментарий AID:','Ссылки:']);
  async function styleNumberRow(row,blockNo){ row.fills=[]; bind(row,'itemSpacing',8); row.counterAxisAlignItems='CENTER';
    const nt=row.children.find(n=>n.type==='TEXT'); await styleText(nt,'heading-s','text-secondary'); log.texts++;
    const m=row.children.find(n=>n.name==='Метка'); const [tone,text]=TONE[blockNo];
    if(m){ const b=badge(tone,m.findOne(n=>n.type==='TEXT').characters); row.insertChild(row.children.indexOf(m),b); m.remove(); log.badges++; }
    else { row.appendChild(badge(tone,text)); log.badges++; }
    if(!row.children.some(n=>n.type==='INSTANCE'&&n.componentProperties&&Object.values(n.componentProperties).some(v=>v.value==='Ждёт дизайнера'))){ row.appendChild(badge('Warning','Ждёт дизайнера')); log.badges++; } }

  if(PART==='B'){
    for(const b of [1,2]){ const F=await figma.getNodeByIdAsync(BLOCK[b]);
      for(const card of F.children.filter(n=>n.type==='FRAME'&&/^Пункт /.test(n.name))){
        island(card,48); card.counterAxisAlignItems='MIN'; log.cards++;
        const D=card.children.find(n=>n.name==='Описание'); D.fills=[]; bind(D,'itemSpacing',24);
        await styleNumberRow(D.children.find(n=>n.name==='Номер'),b);
        const kids=D.children.filter(n=>n.type==='TEXT');
        await styleText(kids[0],'heading-s','text-primary'); log.texts++;   // заголовок пункта
        let field=null;
        for(const t of kids.slice(1)){
          if(LABELS.has(t.characters)){ field=figma.createFrame(); field.name='Поле · '+t.characters.slice(0,-1); field.fills=[]; field.layoutMode='VERTICAL'; field.primaryAxisSizingMode='AUTO'; field.clipsContent=false;
            bind(field,'itemSpacing', t.characters==='Ссылки:'?8:4); D.insertChild(D.children.indexOf(t),field); field.layoutSizingHorizontal='FILL'; field.appendChild(t);
            await styleText(t,'body-s','text-secondary'); log.fields++; log.texts++; continue; }
          field.appendChild(t); t.layoutSizingHorizontal='FILL';
          if(t.hyperlink&&t.hyperlink!==figma.mixed){ await linkText(t,'body-m'); log.links++; } else await styleText(t,'body-m','text-primary');
          log.texts++; }
        // клоны: подпись-ссылка над каждым — body-s text-accent-vivid «→»; сами клоны не трогаются
        const M=card.children.find(n=>n.name==='Макеты');
        if(M){ M.fills=[]; bind(M,'itemSpacing',32);
          for(const cm of M.children.filter(n=>n.name==='Копия макета')){ cm.fills=[]; bind(cm,'itemSpacing',8);
            const lt=cm.children.find(n=>n.type==='TEXT'); if(lt){ await linkText(lt,'body-s'); log.links++; log.texts++; } } }
      } }
  }

  if(PART==='C'){
    // блок 3: заметка → HeaderSection и пункты 3.1…3.5 в прежнем порядке; без клонов и без поля «Ссылки»
    const F=await figma.getNodeByIdAsync(BLOCK[3]); F.name='3. Есть в PRD, нет в макетах';
    F.fills=[]; F.strokes=[]; unpad(F); bind(F,'itemSpacing',32); for(const k of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']){ F.setBoundVariable(k,null); F[k]=0; }
    const title=F.children[0]; const hs=headerSection('3. Есть в PRD, нет в макетах'); F.insertChild(0,hs); hs.layoutSizingHorizontal='FILL'; title.remove(); log.headers++;
    const bullets=F.children.filter(n=>n.type==='TEXT'&&n.characters.startsWith('• '));
    let i=0;
    for(const t of bullets){ i++;
      const card=figma.createFrame(); card.name='Пункт 3.'+i; card.layoutMode='HORIZONTAL'; card.primaryAxisSizingMode='AUTO'; card.counterAxisSizingMode='AUTO'; card.clipsContent=false;
      F.insertChild(F.children.indexOf(t),card); island(card,48); log.cards++;
      const D=figma.createFrame(); D.name='Описание'; D.fills=[]; D.layoutMode='VERTICAL'; D.primaryAxisSizingMode='AUTO'; D.counterAxisSizingMode='FIXED'; D.clipsContent=false; D.resize(480,D.height); bind(D,'itemSpacing',24);
      card.appendChild(D);
      const row=figma.createFrame(); row.name='Номер'; row.layoutMode='HORIZONTAL'; row.primaryAxisSizingMode='AUTO'; row.counterAxisSizingMode='AUTO'; row.clipsContent=false; D.appendChild(row);
      const nt=figma.createText(); nt.fontName={family:'Google Sans',style:'Medium'}; nt.characters='3.'+i; nt.name='3.'+i; row.appendChild(nt);
      await styleNumberRow(row,3);
      D.appendChild(t); t.deleteCharacters(0,2); t.name=t.characters.slice(0,80); await styleText(t,'heading-s','text-primary'); t.textAutoResize='HEIGHT'; t.layoutSizingHorizontal='FILL'; log.texts++;
      log.new.push(card.id+' '+card.name);
    }
  }
}

if(PART==='D'){
  // раскладка секций по высоте после перевода; имя страницы — решение PD «9. 🔍 PRD audit · <Раздел>»
  const secs=page.children.filter(n=>n.type==='SECTION'); let y=0;
  for(const s of secs){ s.strokes=[paint(C['line-default'])]; const c=s.children[0]; c.x=80; c.y=80; s.resizeWithoutConstraints(c.width+160,c.height+160); s.x=0; s.y=y; y+=s.height+80; }
  // содержание шапки: гиперссылки на секции блоков
  const hp=page.findOne(n=>n.type==='INSTANCE'&&n.name==='HeaderPage'); const items=hp.findOne(n=>n.type==='TEXT'&&n.name==='Contents Items');
  const fonts=items.getRangeAllFontNames(0,items.characters.length); for(const f of fonts) await figma.loadFontAsync(f);
  let off=0; for(const line of items.characters.split('\n')){ const s=secs.find(x=>x.name===line); if(s) items.setRangeHyperlink(off,off+line.length,{type:'NODE',value:s.id}); off+=line.length+1; }
  page.name='🔍 PRD audit · Главная';
  log.new=secs.map(s=>s.id+' '+s.name+' '+Math.round(s.width)+'×'+Math.round(s.height));
}
return log;
