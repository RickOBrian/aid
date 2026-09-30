;// Раннер аудита: вставляется после собранного движка (build.mjs). Только чтение.
const A = globalThis.AUDIT;
const PAGE_ID = "__PAGE__";
const page = await figma.getNodeByIdAsync(PAGE_ID);
await figma.setCurrentPageAsync(page);
figma.skipInvisibleInstanceChildren = true;
const clean=(s,n)=>String(s).replace(/[\uD800-\uDFFF]/g,"").replace(/[|;\n]/g," ").slice(0,n);
const roots=[]; const expand=(n)=>{ if(n.type==="SECTION") for(const c of n.children) expand(c); else roots.push(n); };
for (const c of page.children) expand(c);
// Отбор экранов — как в плагине (assemble/screens.ts): не аннотация, размер устройства, компонент или фон.
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
  // Фон — своя заливка или нижний слой во весь экран (как collect.ts).
  const solidOf=(x)=>Array.isArray(x.fills)?x.fills.find(p=>p.type==="SOLID"&&p.visible!==false):null;
  const layer=solidOf(n)?n:n.children.find(c=>c.visible&&c.width*c.height>=n.width*n.height*0.9&&solidOf(c));
  const f=layer?solidOf(layer):null;
  if (f&&!dark){ let c=f.color; if(f.boundVariables&&f.boundVariables.color){ const v=await figma.variables.getVariableByIdAsync(f.boundVariables.color.id); const r=v&&v.resolveForConsumer(layer).value; if(r&&r.r!==undefined)c=r; } dark = lum(c)<0.2; }
  screens.push({n,dark});
}
const reader = new A.FigmaReader();
const trees=[]; for (const {n,dark} of screens) { const tree = await reader.read(n); if (tree) trees.push({n,dark,tree}); }
// Токены с цветами обеих тем — как tokenCandidates в плагине, но по переменным, которые встретились в образцах.
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
const st={}; for(const r of lang.rules){ const k=r.status+(r.byComponent?"+byComp":"")+(r.byState?"+byState":""); st[k]=(st[k]||0)+1; }
const issues=A.checkExemplars(lang.quality,tokens);
const lines=[`screens=${screens.length} dark=${screens.filter(s=>s.dark).length} tokens=${tokens.length} statuses=${JSON.stringify(st)} findings=${lang.findings.length} issues=${issues.length}`];
// Спрашиваемые роли — как isAskable в questions.ts.
const askable=(role)=>!(/\/(part|meta)$/.test(role)||role.endsWith("/stroke")&&role!=="input/stroke"&&!role.startsWith("action-"))&&!/^(decor|card-tint|surface|handle|tab\/|bubble|badge|row|header)/.test(role)&&!role.endsWith("/decor");
for (const r of lang.rules.filter(r=>r.status==="disputed")) lines.push(`D${askable(r.role)?"?":" "} ${r.role}|${r.layer}|${r.restTotal??r.total}|`+(r.rest??r.values).slice(0,3).map(v=>`${clean(v.token?v.token.name:v.hex,24)}x${v.count}`).join(", "));
// Объяснено строением: место внутри компонента, пара, частично по компоненту.
for (const r of lang.rules.filter(r=>r.byPart)) lines.push(`P ${r.role}|${r.layer}|${r.status}|${r.byPart.feature}${r.byPart.partial?" partial":""}|`+r.byPart.entries.slice(0,3).map(e=>`${clean(e.key,30)}→${clean(r.values[e.value].token?r.values[e.value].token.name:r.values[e.value].hex,20)}`).join("; "));
// Отложено как похожее на ошибку образца и оставлено, потому что таких большинство.
for (const r of lang.rules.filter(r=>r.setAside||r.suspectKept)) lines.push(`A ${r.role}|${r.layer}|${r.status}|kept=${r.total}|susp=${r.suspectKept||0}|`+(r.setAside||[]).slice(0,3).map(v=>`${v.reason}:${clean(v.token?v.token.name:v.hex,24)}x${v.count}`).join(", "));
return lines.join("\n");
