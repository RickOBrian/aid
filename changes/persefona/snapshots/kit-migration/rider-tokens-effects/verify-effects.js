// persefona-6 (AID-64): сверка оболочки Shadows 1:3, Glass 66:278, Space 1:4, Radius 1:5 после перевода. Только чтение.
// Оболочка — все узлы секции вне экземпляров Kit и вне контента Rider. Контент — образцы: не текстовые дети Sample (тени, стекло)
// и не текстовые дети Example (полосы отступов, рамки скруглений) со всем содержимым. Чейнжлоги проверяются отдельно (#436).
const PAGES=[['1:3','17:20','21:15'],['66:278','70:12','71:17'],['1:4','62:34','208:54'],['1:5','63:14','204:50']];
const out={};
const isContent=n=>{ let p=n; while(p){ if(p.parent&&(p.parent.name==='Sample'||p.parent.name==='Example')&&p.type!=='TEXT') return true; p=p.parent; if(p&&p.type==='SECTION') break; } return false; };
const inInst=n=>{ let p=n.parent; while(p&&p.type!=='SECTION'){ if(p.type==='INSTANCE') return true; p=p.parent; } return false; };
const varCache=new Map();
async function varInfo(id){ if(!varCache.has(id)){ const v=await figma.variables.getVariableByIdAsync(id); let col=null; try{ col=v?await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId):null; }catch(e){} varCache.set(id,{name:v?.name,col:col?.name,remote:v?.remote}); } return varCache.get(id); }
const styleCache=new Map();
async function styleName(id){ if(!styleCache.has(id)){ const s=await figma.getStyleByIdAsync(id); styleCache.set(id,s?s.name:null); } return styleCache.get(id); }
for(const [pid,fid,clid] of PAGES){
  await figma.setCurrentPageAsync(await figma.getNodeByIdAsync(pid));
  const F=await figma.getNodeByIdAsync(fid), sec=F.parent, CL=await figma.getNodeByIdAsync(clid);
  const o=out[pid]={section:sec.type+' '+sec.id+' «'+sec.name+'»', changelogInSection:CL.parent.id===sec.id, rawPaints:[], unstyledTexts:[], foreignVars:[], content:0, contentBound:0, headerPages:0, instances:0, cols:new Set()};
  const clIds=new Set([CL.id,...CL.findAll(()=>true).map(x=>x.id)]); const nodes=[sec,...sec.findAll(()=>true)].filter(n=>!clIds.has(n.id));
  for(const n of nodes){
    if(n.type==='INSTANCE'&&!inInst(n)){ o.instances++; if(n.name==='HeaderPage'||(await n.getMainComponentAsync())?.parent?.name==='HeaderPage') o.headerPages++; }
    if(inInst(n)) continue;
    if(isContent(n)){ o.content++; if(n.boundVariables&&Object.keys(n.boundVariables).length) o.contentBound++; if(n.effectStyleId) o.contentBound++; continue; }
    if(n.type==='INSTANCE') continue;
    for(const prop of ['fills','strokes']){ const ps=n[prop]; if(!Array.isArray(ps)) continue;
      for(const p of ps){ if(p.visible===false) continue; if(p.type!=='SOLID'||!p.boundVariables?.color) o.rawPaints.push(n.id+' '+prop+' '+p.type); else { const vi=await varInfo(p.boundVariables.color.id); o.cols.add(vi.col); } } }
    if(n.type==='TEXT'){ const sn=n.textStyleId&&typeof n.textStyleId==='string'?await styleName(n.textStyleId):null; if(!sn||!sn.startsWith('persefona/')) o.unstyledTexts.push(n.id+' '+sn); }
    if(n.boundVariables) for(const [k,v] of Object.entries(n.boundVariables)){ for(const a of (Array.isArray(v)?v:[v])){ if(!a?.id) continue; const vi=await varInfo(a.id); o.cols.add(vi.col); if(!/^persefona/i.test(vi.col||'')) o.foreignVars.push(n.id+' '+k+' '+vi.col+'/'+vi.name); } }
  }
  o.cols=[...o.cols];
  o.rawPaints=o.rawPaints.length+(o.rawPaints.length?' '+o.rawPaints.slice(0,5).join('; '):''); o.unstyledTexts=o.unstyledTexts.length+(o.unstyledTexts.length?' '+o.unstyledTexts.slice(0,5).join('; '):''); o.foreignVars=o.foreignVars.length+(o.foreignVars.length?' '+o.foreignVars.slice(0,5).join('; '):'');
  // бейджи чейнжлога: заливка корня = мастер
  const bs=CL.findAll(n=>n.type==='INSTANCE'&&n.name==='__Changelog Badge'); let diff=0; for(const b of bs){ const mc=await b.getMainComponentAsync(); if(JSON.stringify(b.fills)!==JSON.stringify(mc.fills)) diff++; }
  o.changelogBadges=bs.length+' / переопределённых заливок '+diff;
  o.pageTop=figma.currentPage.children.map(n=>n.type+' '+n.id);
}
return out;
