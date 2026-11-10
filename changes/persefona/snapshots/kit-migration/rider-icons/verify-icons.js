// persefona-6: проверка страницы 0:1 Rider Icons после перевода (только чтение). Запуск через use_figma, файл n6LppQbTv85yI29h6u30DI.
// Считает: отпечаток текстов по блокам, сырые краски/эффекты/тексты без persefona/* в оболочке, переполнение подписей, ссылки содержания, контракт чейнжлога.
const hex=c=>'#'+[c.r,c.g,c.b].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('').toUpperCase();
function inComp(n,root){ let p=n.parent; while(p&&p!==root){ if(['INSTANCE','COMPONENT','COMPONENT_SET'].includes(p.type)) return true; p=p.parent;} return false; }
function instTexts(n){ const pr=n.componentProperties; const a=[]; const sub=Object.entries(pr).find(([k])=>k.startsWith('Show Subtitle')); const how=Object.entries(pr).find(([k])=>k.startsWith('Show How'));
 for(const [k,v] of Object.entries(pr)){ if(v.type!=='TEXT') continue; if(k.startsWith('Subtitle')&&sub&&sub[1].value===false) continue; if(k.startsWith('How to Read')&&how&&how[1].value===false) continue; a.push(v.value);} return a; }
function texts(root,filter=true){ const a=[]; for(const n of root.findAll(()=>true)){ if(inComp(n,root)) continue; if(n.type==='TEXT') a.push(n.characters);
  if(n.type==='INSTANCE') a.push(...(filter?instTexts(n):Object.values(n.componentProperties).filter(v=>v.type==='TEXT').map(v=>v.value))); } return a.sort(); }
function h(s){ let x=5381; for(let i=0;i<s.length;i++) x=((x*33)^s.charCodeAt(i))>>>0; return x.toString(16); }
const S=await figma.getNodeByIdAsync('3698:316'); const fp={};
for(const c of S.children){ if(c.type==='INSTANCE') continue; const t=texts(c); fp[c.id+' '+c.name]={n:t.length,hash:h(t.join('\u0001'))}; }
const hp=S.children.find(c=>c.name==='HeaderPage'); const g=s=>Object.entries(hp.componentProperties).find(([k])=>k.startsWith(s))[1].value;
fp.descr={n:2,hash:h([g('Title'),g('Subtitle')].sort().join('\u0001'))};
const CL=await figma.getNodeByIdAsync('3703:4'); const tc=texts(CL,false); fp['3703:4']={n:tc.length,hash:h(tc.join('\u0001'))}; // методом «до», пересчёт после сдвига
const raw=[],unstyled=[],nonPf=[]; const vc={};
async function isPf(id){ if(id in vc) return vc[id]; const v=await figma.variables.getVariableByIdAsync(id); const c=v&&await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId); return vc[id]=!!c&&c.name.startsWith('persefona'); }
for(const n of [S,...S.findAll(()=>true)]){ if(n!==S&&inComp(n,S)) continue; if(['COMPONENT','INSTANCE','COMPONENT_SET'].includes(n.type)) continue;
 for(const arr of [n.fills,n.strokes]) if(Array.isArray(arr)) for(const p of arr){ if(p.visible===false) continue; if(p.type!=='SOLID'){raw.push(n.id);continue;} if(!p.boundVariables?.color) raw.push(n.id+' '+hex(p.color)); else if(!(await isPf(p.boundVariables.color.id))) nonPf.push(n.id); }
 if(n.effects?.length) raw.push(n.id+' effect');
 if(n.type==='TEXT'){ const sid=n.textStyleId; const st=sid&&sid!==figma.mixed?await figma.getStyleByIdAsync(sid):null; if(!st||!st.name.startsWith('persefona')) unstyled.push(n.id); } }
const over=S.findAll(n=>n.type==='TEXT'&&n.name==='title').filter(t=>t.y+t.height>t.parent.height+0.5).map(t=>t.id);
const items=hp.findOne(n=>n.name==='Contents Items'); const links=items.getStyledTextSegments(['hyperlink']).filter(s=>s.hyperlink).map(s=>s.hyperlink.value);
const slot=hp.findOne(n=>n.type==='SLOT'); const badges=slot.children.map(b=>{const k=Object.keys(b.componentProperties).find(x=>x.startsWith('Text')); return b.componentProperties[k].value+'·'+b.componentProperties.Tone.value;});
const masters=S.findAll(n=>n.type==='COMPONENT').length;
return {fp,raw,unstyled,nonPf,over,links,badges,masters,changelog:{body:!!CL.findOne(n=>n.name==='Changelog Table Body'),rows:CL.findAll(n=>n.name==='Changes Row').length,badges:CL.findAll(n=>n.name==='__Changelog Badge').length,pos:[CL.x,CL.y]}};
