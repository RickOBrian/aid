// persefona-6: проверка страницы 0:88 Driver Icons после перевода (только чтение). Запуск через use_figma, файл AwRpEGfyeNjRbZP8KGG1wy.
// Скриншоты интерфейса Figma в «Правилах иконок» (группа 3475:30, картинка 3478:26) — контент, в проверку оболочки не входят.
const SEC='5608:62', CONTENT=['3475:30','3478:26'];
const hex=c=>'#'+[c.r,c.g,c.b].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('').toUpperCase();
function inComp(n,root){ let p=n.parent; while(p&&p!==root){ if(['INSTANCE','COMPONENT','COMPONENT_SET'].includes(p.type)||CONTENT.includes(p.id)) return true; p=p.parent;} return false; }
function instTexts(n){ const pr=n.componentProperties; const a=[]; const g=s=>Object.entries(pr).find(([k])=>k.startsWith(s)); const sub=g('Show Subtitle'), how=g('Show How');
 for(const [k,v] of Object.entries(pr)){ if(v.type!=='TEXT') continue; if(k.startsWith('Subtitle')&&sub&&sub[1].value===false) continue; if(k.startsWith('How to Read')&&how&&how[1].value===false) continue; a.push(v.value);} return a; }
function texts(root,filter=true){ const a=[]; for(const n of root.findAll(()=>true)){ if(inComp(n,root)) continue; if(n.type==='TEXT') a.push(n.characters);
  if(n.type==='INSTANCE') a.push(...(filter?instTexts(n):Object.values(n.componentProperties).filter(v=>v.type==='TEXT').map(v=>v.value))); } return a.sort(); }
function h(s){ let x=5381; for(let i=0;i<s.length;i++) x=((x*33)^s.charCodeAt(i))>>>0; return x.toString(16); }
const S=await figma.getNodeByIdAsync(SEC); const fp={};
for(const c of S.children){ if(c.type==='INSTANCE') continue; const t=texts(c); fp[c.id+' '+c.name]={n:t.length,hash:h(t.join('\u0001'))}; }
const CL=await figma.getNodeByIdAsync('5503:18'); const tc=texts(CL,false); fp['5503:18']={n:tc.length,hash:h(tc.join('\u0001'))};
const raw=[],unstyled=[],nonPf=[]; const vc={};
async function isPf(id){ if(id in vc) return vc[id]; const v=await figma.variables.getVariableByIdAsync(id); const c=v&&await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId); return vc[id]=!!c&&c.name.startsWith('persefona'); }
for(const n of [S,...S.findAll(()=>true)]){ if(n!==S&&inComp(n,S)) continue; if(['COMPONENT','INSTANCE','COMPONENT_SET'].includes(n.type)||CONTENT.includes(n.id)) continue;
 for(const arr of [n.fills,n.strokes]) if(Array.isArray(arr)) for(const p of arr){ if(p.visible===false) continue; if(p.type!=='SOLID'){raw.push(n.id+' '+p.type);continue;} if(!p.boundVariables?.color) raw.push(n.id+' '+hex(p.color)); else if(!(await isPf(p.boundVariables.color.id))) nonPf.push(n.id); }
 if(n.effects?.length) raw.push(n.id+' effect');
 if(n.type==='TEXT'){ for(const s of n.getStyledTextSegments(['textStyleId','fills'])){ const st=s.textStyleId?await figma.getStyleByIdAsync(s.textStyleId):null; if(!st||!st.name.startsWith('persefona')) unstyled.push(n.id+' '+s.characters.slice(0,12));
   const f=s.fills[0]; if(f&&!f.boundVariables?.color) raw.push(n.id+' text '+hex(f.color)); } } }
const hp=S.children.find(c=>c.name==='HeaderPage'); const items=hp.findOne(n=>n.name==='Contents Items'); const links=items.getStyledTextSegments(['hyperlink']).filter(s=>s.hyperlink).map(s=>s.hyperlink.value);
const slot=hp.findOne(n=>n.type==='SLOT'); const badges=slot.children.map(b=>{const k=Object.keys(b.componentProperties).find(x=>x.startsWith('Text')); return b.componentProperties[k].value+'·'+b.componentProperties.Tone.value;});
const P=await figma.getNodeByIdAsync('0:88'); const masters=P.findAll(n=>n.type==='COMPONENT').length;
const hsY=S.findAll(n=>n.type==='INSTANCE'&&n.name==='HeaderSection').map(n=>Math.round(n.y));
return {fp,raw,unstyled,nonPf,links,badges,masters,hsY,outside:P.children.filter(n=>n.type!=='SECTION').length,
  changelog:{body:!!CL.findOne(n=>n.name==='Changelog Table Body'),rows:CL.findAll(n=>n.name==='Changes Row').length,badges:CL.findAll(n=>n.name==='__Changelog Badge').length,pos:[CL.x,CL.y]}};
