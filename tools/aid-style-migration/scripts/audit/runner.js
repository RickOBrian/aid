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
  const f=Array.isArray(n.fills)?n.fills.find(p=>p.type==="SOLID"&&p.visible!==false):null;
  if (f&&!dark){ let c=f.color; if(f.boundVariables&&f.boundVariables.color){ const v=await figma.variables.getVariableByIdAsync(f.boundVariables.color.id); const r=v&&v.resolveForConsumer(n).value; if(r&&r.r!==undefined)c=r; } dark = lum(c)<0.2; }
  screens.push({n,dark});
}
const reader = new A.FigmaReader(); const learner = new A.LanguageLearner();
for (const {n,dark} of screens) { const tree = await reader.read(n); if (tree) learner.add(tree,{screenId:n.id,screenName:n.name,dark}); }
const lang = A.mergeSources({id:"p",name:"P"},[learner.source("f","t",screens.length)],"t");
const st={}; for(const r of lang.rules){ const k=r.status+(r.byComponent?"+byComp":"")+(r.byState?"+byState":""); st[k]=(st[k]||0)+1; }
const lines=[`screens=${screens.length} dark=${screens.filter(s=>s.dark).length} statuses=${JSON.stringify(st)} findings=${lang.findings.length}`];
for (const r of lang.rules.filter(r=>r.status==="disputed")) lines.push(`D ${r.role}|${r.layer}|${r.total}|`+r.values.slice(0,3).map(v=>`${clean(v.token?v.token.name:v.hex,24)}x${v.count}`).join(", "));
return lines.join("\n");
