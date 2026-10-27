// persefona-6 (AID-64): правки приёмки #465 (Standards · Persefona), Rider Tokens yrfG6u9osujKX8e1B14lpT. Запуск через use_figma после migrate-*.js.
// 1) __Changelog Badge: переопределённая заливка корня → как у мастера (след Swap в #436); 2) шапки по §5.2 «б», ширина 1216;
// 3) строки 0:1 — по центру; 4) секции и чейнжлоги — по новым размерам.
for(const pg of figma.root.children){ await pg.loadAsync();
  for(const b of pg.findAll(n=>n.type==='INSTANCE'&&n.name==='__Changelog Badge')){ const mc=await b.getMainComponentAsync();
    if(mc&&JSON.stringify(b.fills)!==JSON.stringify(mc.fills)) b.fills=JSON.parse(JSON.stringify(mc.fills)); } }
const BS=await figma.importComponentByKeyAsync('4f40df859f56f629da61b2bda40ea423072c50dc'), BN=await figma.importComponentByKeyAsync('969d7acc320e983331f6a43ae3ae1d5016679e7c');
const mk=(C,t)=>{ const b=C.createInstance(); b.name='Badge'; const k=Object.keys(b.componentProperties).find(x=>x.startsWith('Text')); b.setProperties({[k]:t}); return b; };
for(const [hid,pageTitle,secId,contentId,clId,gap] of [['1619:143','Colors','28:2282','28:2','31:66',182],['1622:196','Gradients','316:35','316:42','316:142',120]]){
  const hp=await figma.getNodeByIdAsync(hid); const key=s=>Object.keys(hp.componentProperties).find(k=>k.split('#')[0]===s);
  const oldTitle=hp.componentProperties[key('Title')].value, oldSub=hp.componentProperties[key('Subtitle')].value;
  if(oldTitle!==pageTitle) hp.setProperties({[key('Title')]:pageTitle,[key('Subtitle')]:oldTitle+'\n'+oldSub});
  const slot=hp.findOne(n=>n.type==='SLOT');
  if(slot.children.length===1){ slot.insertChild(0,mk(BS,'Принято')); slot.insertChild(1,mk(BN,'Rider')); } // метка версии ({version}) остаётся последней
  hp.resize(1216,hp.height); hp.primaryAxisSizingMode='AUTO';
  const c=await figma.getNodeByIdAsync(contentId), sec=await figma.getNodeByIdAsync(secId), cl=await figma.getNodeByIdAsync(clId);
  c.y=hp.y+hp.height+80;
  sec.resizeWithoutConstraints(c.x*2+Math.max(hp.width,c.width), c.y+c.height+c.x);
  cl.x=sec.x+sec.width+gap; cl.y=sec.y;
}
for(const r of (await figma.getNodeByIdAsync('28:2282')).findAll(n=>n.parent?.name==='Rows'&&n.name!=='Separator'&&n.type==='FRAME')) r.counterAxisAlignItems='CENTER';
return 'ok';
