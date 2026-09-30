// Анатомия компонентов страницы библиотеки: для каждого набора — части
// (путь слоёв от корня варианта) и токен каждой части по вариантам.
// Только чтение. Вставить в use_figma, заменив __PAGE__ на id страницы.
const page = await figma.getNodeByIdAsync("__PAGE__"); await figma.setCurrentPageAsync(page);
const clean=(s,n=30)=>String(s||"").replace(/[\uD800-\uDFFF]/g,"").replace(/\s+/g," ").trim().slice(0,n);
const hex=(c,o=1)=>"#"+[c.r,c.g,c.b].map(x=>Math.round(x*255).toString(16).padStart(2,"0")).join("")+(o<0.999?Math.round(o*255).toString(16).padStart(2,"0"):"");
const vc=new Map(); const vname=async(id)=>{ if(!vc.has(id)){ const v=await figma.variables.getVariableByIdAsync(id); vc.set(id,v?v.name:"?"); } return vc.get(id); };
const tok=async(ps)=>{ if(!Array.isArray(ps)) return null; const vis=ps.filter(x=>x.visible!==false); const p=vis.find(x=>x.type==="SOLID"); if(!p) return vis.length?vis[0].type.slice(0,4):null; return p.boundVariables&&p.boundVariables.color?await vname(p.boundVariables.color.id):hex(p.color,p.opacity??1); };
const anatomy=async(root)=>{ const m={}; const rec=async(n,p)=>{ if(n.visible===false) return; const k=p||"·";
  if("fills" in n){ const f=await tok(n.fills); if(f) m[k+(n.type==="TEXT"?":t":":f")]=f; }
  if("strokes" in n&&Array.isArray(n.strokes)&&n.strokes.length&&typeof n.strokeWeight==="number"&&n.strokeWeight>0){ const s=await tok(n.strokes); if(s) m[k+":s"]=s; }
  if("children" in n) for(const c of n.children) await rec(c,(p?p+"/":"")+clean(c.name,18)); };
  await rec(root,""); return m; };
const out=[];
for (const set of page.findAllWithCriteria({types:["COMPONENT_SET","COMPONENT"]})) {
  if (set.type==="COMPONENT"&&set.parent&&set.parent.type==="COMPONENT_SET") continue;
  const vs = set.type==="COMPONENT_SET"?set.children.filter(c=>c.type==="COMPONENT"):[set];
  out.push(`## ${clean(set.name,30)}`);
  if (vs.length>1) out.push("  v: "+vs.map((v,i)=>`${i}=${clean(v.name.replace(/[^=,]+=/g,""),30)}`).join("; "));
  const slots={};
  for (let i=0;i<vs.length;i++){ const a=await anatomy(vs[i]); for(const [k,t] of Object.entries(a)){ (slots[k]=slots[k]||{}); (slots[k][t]=slots[k][t]||[]).push(i); } }
  for (const [k,tm] of Object.entries(slots)) { const e=Object.entries(tm); out.push("  "+k+" = "+(e.length===1&&e[0][1].length===vs.length?e[0][0]:e.map(([t,ix])=>`${t}[${ix.join(",")}]`).join(" "))); }
}
return out.join("\n").slice(0,14000);
