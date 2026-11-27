// persefona-6 (AID-64): правки приёмки #466 (Standards · Persefona) на странице 1:2 Rider Tokens. Запуск через use_figma после migrate-typography.js.
// 1) Один HeaderPage на странице: шапка второй витрины 1631:173 → HeaderSection (прежние заголовок и подпись); её версия — меткой в слот первой шапки.
// 2) Витрины и чейнжлоги — в секции Figma (§6.3), чейнжлог справа от своей витрины; узлы перемещаются, id прежние. Картинка 142:34 остаётся на холсте.
const HS=await figma.importComponentByKeyAsync('09e45bfbda7bdf79a6a47b1c969ade6e913b0467');
const BN=await figma.importComponentByKeyAsync('969d7acc320e983331f6a43ae3ae1d5016679e7c');
const C={main:await figma.variables.importVariableByKeyAsync('125448d6c36643d97f23500c7b74b1874738c645'), line:await figma.variables.importVariableByKeyAsync('2a52e5ad5a83039e73014691e06c54e3d1b1cbfb')};
async function resolved(v){ let cur=v; for(let i=0;i<5;i++){ const val=cur.valuesByMode[Object.keys(cur.valuesByMode)[0]]; if(val&&val.type==='VARIABLE_ALIAS') cur=await figma.variables.getVariableByIdAsync(val.id); else return val; } }
const paint=async v=>{ const c=await resolved(v); return figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:c.r,g:c.g,b:c.b},opacity:c.a??1},'color',v); };
await figma.loadFontAsync({family:'Google Sans',style:'Regular'}); await figma.loadFontAsync({family:'Google Sans',style:'Medium'});
const log={};
// 1. вторая шапка → HeaderSection
const hp1=await figma.getNodeByIdAsync('1632:170'), hp2=await figma.getNodeByIdAsync('1631:173');
if(hp2){
  const key=(n,s)=>Object.keys(n.componentProperties).find(k=>k.split('#')[0]===s);
  const [title,...rest]=hp2.componentProperties[key(hp2,'Subtitle')].value.split('\n'); const sub=rest.join('\n');
  const ver2=hp2.findOne(n=>n.name==='{version}').characters, ver1=hp1.findOne(n=>n.name==='{version}').characters;
  const F=hp2.parent; const hs=HS.createInstance(); hs.setProperties({[key(hs,'Title')]:title,[key(hs,'Subtitle')]:sub,[key(hs,'Show Subtitle')]:true});
  F.insertChild(F.children.indexOf(hp2),hs); hs.layoutSizingHorizontal='FILL'; hp2.remove(); log.hs=hs.id;
  if(ver2!==ver1){ const b=BN.createInstance(); b.name='Badge'; const k=Object.keys(b.componentProperties).find(x=>x.startsWith('Text')); b.setProperties({[k]:'Outstanding '+ver2});
    const bt=b.findOne(n=>n.type==='TEXT'); if(bt) bt.name='{version} Outstanding'; hp1.findOne(n=>n.type==='SLOT').appendChild(b); log.badge='Outstanding '+ver2; }
}
// 2. секции: витрина + её чейнжлог справа (отступ 120), поля секции 80, между секциями 120
const pairs=[['typography-sem','11:8','11:502'],['typography-sem-out','184:91','184:971']];
let x=(await figma.getNodeByIdAsync('11:8')).x-80; const y0=(await figma.getNodeByIdAsync('11:8')).y-80; log.sections=[];
for(const [name,fid,cid] of pairs){
  const F=await figma.getNodeByIdAsync(fid), CL=await figma.getNodeByIdAsync(cid);
  let sec=F.parent.type==='SECTION'?F.parent:null;
  if(!sec){ sec=figma.createSection(); sec.name=name; figma.currentPage.appendChild(sec); sec.x=x; sec.y=y0; sec.appendChild(F); sec.appendChild(CL); }
  F.x=80; F.y=80; CL.x=80+F.width+120; CL.y=80;
  sec.resizeWithoutConstraints(80+F.width+120+CL.width+80, 80+Math.max(F.height,CL.height)+80);
  sec.fills=[await paint(C.main)]; sec.strokes=[await paint(C.line)];
  log.sections.push(sec.id+' '+name+' '+Math.round(sec.width)+'x'+Math.round(sec.height)); x=sec.x+sec.width+120;
}
return log;
