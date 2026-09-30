;// Разбор спорных правил: для каждого варианта — компоненты, где задан цвет,
// соседние части того же элемента. Вставляется после движка вместо runner.js
// (`node scripts/audit/build.cjs <pageId> analyze`). Только чтение.
const A = globalThis.AUDIT;
const PAGE_ID = "__PAGE__";
const page = await figma.getNodeByIdAsync(PAGE_ID);
await figma.setCurrentPageAsync(page);
figma.skipInvisibleInstanceChildren = true;
const clean=(s,n)=>String(s).replace(/[\uD800-\uDFFF]/g,"").replace(/[|;\n]/g," ").slice(0,n);
const roots=[]; const expand=(n)=>{ if(n.type==="SECTION") for(const c of n.children) expand(c); else roots.push(n); };
for (const c of page.children) expand(c);
const STEMS=["annotat","note","comment","spec","redline","measure","callout","sticky","legend","guideline","description","аннотац","заметк","коммент","примечан","пояснен","специфик","разметк","выноск","легенд","описани","техническ"];
const words=(s)=>s.toLowerCase().split(/[^a-zа-яё0-9]+/i).filter(Boolean);
const isAnn=(s)=>s.startsWith("_description")||words(s).some(w=>STEMS.some(x=>w.startsWith(x)));
const DARK=["dark","night","тёмн","темн","ночь","ночн"];
const bands=[[280,480,120],[560,1100,320],[1180,2000,320]];
const lin=(c)=>c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4);
const lum=(c)=>0.2126*lin(c.r)+0.7152*lin(c.g)+0.0722*lin(c.b);
const painted=(n)=>"fills" in n&&Array.isArray(n.fills)&&n.fills.some(p=>p.visible!==false&&(p.opacity??1)>0.5);
const screens=[];
for (const n of roots) {
  if (!n.visible||isAnn(n.name)||!["FRAME","INSTANCE","COMPONENT","GROUP"].includes(n.type)||!("children" in n)||!n.children.length) continue;
  if (!bands.some(([a,b,m])=>n.width>=a&&n.width<=b&&n.height>=m)) continue;
  const inst = n.type==="INSTANCE"||n.findOne(x=>x.type==="INSTANCE")!==null;
  const bg = painted(n)||n.children.some(c=>c.visible&&painted(c)&&c.width*c.height>=n.width*n.height*0.9);
  if (!inst&&!bg) continue;
  let dark = words(n.name).some(w=>DARK.some(x=>w.startsWith(x)));
  const f=Array.isArray(n.fills)?n.fills.find(p=>p.type==="SOLID"&&p.visible!==false):null;
  if (f&&!dark){ let c=f.color; if(f.boundVariables&&f.boundVariables.color){ const v=await figma.variables.getVariableByIdAsync(f.boundVariables.color.id); const r=v&&v.resolveForConsumer(n).value; if(r&&r.r!==undefined)c=r; } dark = lum(c)<0.2; }
  screens.push({n,dark});
}
const reader = new A.FigmaReader();
const trees=[]; for (const {n,dark} of screens) { const tree = await reader.read(n); if (tree) trees.push({n,dark,tree}); }
const ids=new Set(); const walkT=(x)=>{ for (const p of [...(x.fills||[]),...(x.strokes||[])]) if (p.variable) ids.add(p.variable.id); (x.children||[]).forEach(walkT); };
trees.forEach(t=>walkT(t.tree));
const hex=(c)=>"#"+[c.r,c.g,c.b].map(x=>Math.round(x*255).toString(16).padStart(2,"0")).join("")+(c.a!==undefined&&c.a<1?Math.round(c.a*255).toString(16).padStart(2,"0"):"");
async function valueIn(v, re, depth=0) {
  const col = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId);
  const mode = (col&&col.modes.find(m=>re.test(m.name)))||(col&&col.modes[0]);
  const val = mode&&v.valuesByMode[mode.modeId];
  if (val&&val.type==="VARIABLE_ALIAS"&&depth<5) { const t=await figma.variables.getVariableByIdAsync(val.id); return t?valueIn(t,re,depth+1):null; }
  return val&&val.r!==undefined?hex(val):null;
}
const tokens=[];
for (const id of ids) { const v=await figma.variables.getVariableByIdAsync(id); if(!v||v.resolvedType!=="COLOR") continue;
  tokens.push({key:v.key,name:v.name,hexLight:await valueIn(v,/day|light|свет|дн/i),hexDark:await valueIn(v,/night|dark|тём|темн|ноч/i)}); }
const learner = new A.LanguageLearner(tokens);
for (const {n,dark,tree} of trees) learner.add(tree,{screenId:n.id,screenName:n.name,dark});
const lang = A.mergeSources({id:"p",name:"P"},[learner.source("f","t",screens.length)],"t");

// Какие правила разбираем: спорные и с отступлениями среди тех, о которых спрашивает анкета.
const askable=(role)=>!(/\/(part|meta)$/.test(role)||role.endsWith("/stroke")&&role!=="input/stroke"&&!role.startsWith("action-"))&&!/^(decor|card-tint|surface|handle|tab\/|bubble|badge|row|header)/.test(role);
const target=lang.rules.filter(r=>askable(r.role)&&r.total>=3&&(r.status==="disputed"||(r.status==="proposed"&&!r.byComponent&&!r.byState&&r.values.length>1&&r.values[0].count/r.total<0.97)));
const want=new Set(target.map(r=>r.role+"|"+r.layer));

// Второй проход по экранам: для каждой находки нужной роли — компонент, откуда цвет, соседи по элементу.
const tokName=(p)=>p&&p.variable?p.variable.name:(p&&p.color?hex(p.color):"-");
const stats={};
for (const {tree} of trees) {
  const parent=new Map(); const walkP=(x)=>{ for(const c of x.children){ parent.set(c.id,x); walkP(c);} }; walkP(tree);
  const hits=A.detectRoles(tree).hits; const byNode=new Map();
  for (const h of hits) { const l=byNode.get(h.nodeId)||[]; l.push(h); byNode.set(h.nodeId,l); }
  for (const h of hits) {
    const k=h.key+"|"+h.layer; if(!want.has(k)||!h.paint.color) continue;
    // Соседи: владелец — ближайший предок с находкой, чей ключ — префикс ключа этой.
    let partner="—"; let a=parent.get(h.nodeId);
    while(a){ const own=(byNode.get(a.id)||[]).filter(o=>h.key.startsWith(o.key+"/")); if(own.length){ partner=own.map(o=>(o.layer==="stroke"?"обв ":"фон ")+tokName(o.paint)).join("+"); break; } a=parent.get(a.id); }
    const s=(stats[k]=stats[k]||{}); const v=tokName(h.paint); const e=(s[v]=s[v]||{n:0,comp:{},origin:{},partner:{}});
    e.n++; const c=h.component||"—"; e.comp[c]=(e.comp[c]||0)+1; e.origin[h.origin]=(e.origin[h.origin]||0)+1; e.partner[partner]=(e.partner[partner]||0)+1;
  }
}
const top=(m,n)=>Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,n).map(([k,c])=>`${clean(k,34)}×${c}`).join(", ");
const out=[`screens=${trees.length} rules=${target.length}`];
for (const r of target) {
  const s=stats[r.role+"|"+r.layer]||{};
  out.push(`## ${r.role}|${r.layer} ${r.status} total=${r.total}`);
  for (const [v,e] of Object.entries(s).sort((a,b)=>b[1].n-a[1].n).slice(0,4)) out.push(`- ${clean(v,30)} ×${e.n} | comp: ${top(e.comp,3)} | from: ${top(e.origin,3)} | pair: ${top(e.partner,2)}`);
}
return out.join("\n");
