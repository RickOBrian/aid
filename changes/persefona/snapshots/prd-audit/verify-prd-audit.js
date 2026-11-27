// persefona-7 (AID-82): сверка страницы «🔍 PRD audit · Главная» 4280:4433 после перевода на Kit (только чтение).
// Отпечаток текстов: тексты оболочки (вне «Копия · …») + текстовые свойства экземпляров Kit (и меток в слоте HeaderPage),
// без начальных «→ » и «• », сортировка, хэш — тот же, что в before.json. Ожидаемые правки (решения PD, части Kit) снимаются
// списком EXPECTED перед хэшем: после этого хэш блока должен совпасть с «до».
const isClone=n=>n.type==='FRAME'&&/^Копия · /.test(n.name);
function inClone(n){ let p=n; while(p&&p.type!=='PAGE'){ if(isClone(p)) return true; p=p.parent;} return false; }
function h(s){ let x=5381; for(let i=0;i<s.length;i++) x=((x*33)^s.charCodeAt(i))>>>0; return x.toString(16); }
const norm=s=>s.replace(/^→ /,'').replace(/^• /,'');
function texts(root){ const a=[];
  (function w(n){ if(isClone(n)) return;
    if(n.type==='TEXT'){ a.push(norm(n.characters)); return; }
    // скрытый подзаголовок HeaderSection (Show Subtitle = false) не показывается и в отпечаток не входит
    if(n.type==='INSTANCE'){ const P=n.componentProperties; const show=Object.entries(P).find(([k])=>k.startsWith('Show Subtitle'));
      for(const [k,v] of Object.entries(P)) if(v.type==='TEXT'&&!(k.startsWith('Subtitle')&&show&&show[1].value===false)) a.push(norm(v.value));
      for(const s of n.findAll(x=>x.type==='SLOT')) for(const c of s.children) w(c); return; }
    if('children' in n) for(const c of n.children) w(c); })(root);
  return a; }
const BEFORE={head:'df9b3833',b1:'29524e76',b2:'615c091f',b3:'350e7a78'};
const W='Ждёт дизайнера';
const EXPECTED={ // [добавлено, убрано]
  head:[['PRD audit · Главная','1. Figma расходится с PRD\n2. Есть в Figma, нет в PRD\n3. Есть в PRD, нет в макетах',
         'Смотреть и решать','AID-82 · Product Logic','Ждёт дизайнера Where','Нет в макетах','Есть в PRD, нет в макетах: норма PRD, для которой макета нет.'],
        ['Аудит · Главная vs PRD']],
  b1:[Array(6).fill(W),[]], b2:[Array(8).fill(W),[]],
  b3:[['3. Есть в PRD, нет в макетах',...[1,2,3,4,5].flatMap(i=>['3.'+i,'Нет в макетах',W])],['Заметка: есть в PRD, нет в макетах']],
};
const page=await figma.getNodeByIdAsync('4280:4433');
const NODES={head:'4280:4434',b1:'4280:4450',b2:'4280:4558',b3:'4280:4693'};
const fp={};
for(const [k,id] of Object.entries(NODES)){ const a=texts(await figma.getNodeByIdAsync(id)); const [add,rem]=EXPECTED[k];
  const left=a.slice(); const missing=[];
  for(const s of add){ const i=left.indexOf(s); if(i<0) missing.push(s); else left.splice(i,1); }
  for(const s of rem) left.push(s);
  left.sort(); fp[k]={n:a.length,adjusted:left.length,hash:h(left.join('\n')),before:BEFORE[k],ok:h(left.join('\n'))===BEFORE[k],missingExpected:missing}; }
// клоны: id всех узлов + тексты
const clones=page.findAll(isClone); const cl=[];
for(const c of clones){ const all=[c].concat(c.findAll(()=>true)); cl.push(c.id+':'+all.length+':'+h(all.map(n=>n.id+(n.type==='TEXT'?n.characters:'')).join('|'))); }
cl.sort();
// ссылки: цель node-id + текст без «→»
const L=page.findAll(n=>n.type==='TEXT'&&!inClone(n)&&n.name!=='Contents Items'&&n.hyperlink&&n.hyperlink!==figma.mixed).map(n=>n.hyperlink.value.split('node-id=')[1]+'|'+norm(n.characters)).sort();
const arrows=page.findAll(n=>n.type==='TEXT'&&!inClone(n)&&n.name!=='Contents Items'&&n.hyperlink&&n.hyperlink!==figma.mixed&&!n.characters.startsWith('→ ')).length;
// сырые значения вне клонов и вне экземпляров Kit
const raw={fills:[],strokes:[],noStyle:[],spacing:[],radius:[]};
(function w(n){ if(isClone(n)||n.type==='INSTANCE') return;
  if(n.type!=='PAGE'){
    if(Array.isArray(n.fills)) for(const f of n.fills) if(f.type==='SOLID'&&f.visible!==false&&!f.boundVariables?.color) raw.fills.push(n.id+' '+n.name);
    if(Array.isArray(n.strokes)) for(const f of n.strokes) if(f.type==='SOLID'&&f.visible!==false&&!f.boundVariables?.color) raw.strokes.push(n.id+' '+n.name);
    if(n.type==='TEXT'&&(!n.textStyleId||n.textStyleId===figma.mixed)) raw.noStyle.push(n.id+' '+n.name);
    if(n.type==='FRAME'&&n.layoutMode&&n.layoutMode!=='NONE') for(const k of ['paddingTop','paddingRight','paddingBottom','paddingLeft','itemSpacing']) if(n[k]>0&&!n.boundVariables?.[k]) raw.spacing.push(n.id+' '+k+' '+n[k]);
    if(n.type==='FRAME'&&n.cornerRadius!==figma.mixed&&n.cornerRadius>0&&!n.boundVariables?.topLeftRadius) raw.radius.push(n.id+' '+n.cornerRadius);
  }
  if('children' in n) for(const c of n.children) w(c); })(page);
const items=page.findAll(n=>n.type==='FRAME'&&/^Пункт /.test(n.name)).map(n=>n.id+' '+n.name);
const fonts={}; for(const t of page.findAll(n=>n.type==='TEXT'&&!inClone(n))){ const f=t.fontName===figma.mixed?'mixed':t.fontName.family; fonts[f]=(fonts[f]||0)+1; }
return {page:page.name,fp,clones:{n:cl.length,hash:h(cl.join('\n')),list:cl},links:{n:L.length,hash:h(L.join('\n')),withoutArrow:arrows},
  raw:Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,{n:v.length,sample:v.slice(0,8)}])),items,fonts,
  sections:page.children.map(n=>n.type+' '+n.id+' '+n.name)};
