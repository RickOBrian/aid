// persefona-7 (AID-82): снимок «до» (только чтение), выполнен 2026-10-28 до migrate-prd-audit.js. Итог — before.json.
const P=await figma.getNodeByIdAsync('4280:4433'); await figma.setCurrentPageAsync(P);
const isClone=n=>n.type==='FRAME'&&/^Копия · /.test(n.name);
function inClone(n){ let p=n; while(p&&p.type!=='PAGE'){ if(isClone(p)) return true; p=p.parent;} return false; }
function h(s){ let x=5381; for(let i=0;i<s.length;i++) x=((x*33)^s.charCodeAt(i))>>>0; return x.toString(16); }
const norm=s=>s.replace(/^→ /,'').replace(/^• /,'');
function shellTexts(root){ const a=[]; for(const n of root.findAll(n=>!inClone(n))){ if(n.type==='TEXT') a.push(norm(n.characters)); if(n.type==='INSTANCE'&&!inClone(n)){ for(const [k,v] of Object.entries(n.componentProperties)) if(v.type==='TEXT') a.push(norm(v.value)); } } return a; }
const blocks={head:['4280:4435','4280:4439'],b1:['4280:4450'],b2:['4280:4558'],b3:['4280:4693']};
const fp={};
for(const [k,ids] of Object.entries(blocks)){ let a=[]; for(const id of ids) a=a.concat(shellTexts(await figma.getNodeByIdAsync(id))); a.sort(); fp[k]={n:a.length,hash:h(a.join('\n'))}; }
const root=await figma.getNodeByIdAsync('4280:4434');
const cl=[]; for(const c of root.findAll(isClone)){ const all=[c].concat(c.findAll(()=>true)); cl.push(c.id+':'+all.length+':'+h(all.map(n=>n.id+(n.type==='TEXT'?n.characters:'')).join('|'))); }
const L=root.findAll(n=>n.type==='TEXT'&&!inClone(n)&&n.hyperlink&&n.hyperlink!==figma.mixed).map(n=>n.hyperlink.value.split('node-id=')[1]+'|'+n.characters.replace(/^→ /,'')).sort();
let raw={fills:0,strokes:0,nostyle:0};
for(const n of root.findAll(n=>!inClone(n)).concat([root])){ if(Array.isArray(n.fills)) for(const f of n.fills) if(f.type==='SOLID'&&!f.boundVariables?.color&&f.visible!==false) raw.fills++; if(Array.isArray(n.strokes)) for(const f of n.strokes) if(f.type==='SOLID'&&!f.boundVariables?.color) raw.strokes++; if(n.type==='TEXT'&&!n.textStyleId) raw.nostyle++; }
return {fp,clones:cl.length,cloneHash:h(cl.join('\n')),links:{n:L.length,hash:h(L.join('\n'))},raw};
