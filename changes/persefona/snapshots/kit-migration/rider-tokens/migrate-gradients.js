// persefona-6 (AID-64): перевод витрины gradient-styles на странице 302:53 «✅ Gradients» (Rider Tokens yrfG6u9osujKX8e1B14lpT) на Kit Persefona.
// Запуск через use_figma, один прогон. Меняется только вид оболочки, тексты 1:1.
// Сцена Rider не трогается: Preview (шахматка, заливка градиента, линии, маркеры) и заливки образцов Day/Night (слой Color).
const K = {
  st: { 'label-s':'b179157f175048e57d194430763321f566d2cb43','code-s':'dc6f78fc82ce91d3a06a28b1dabb01d17df35cca' },
  c: { 'text-primary':'f1ae466778bfebc4323580287007c99393922fea','text-secondary':'4b2825ef9a779f55c1332634032ad0b4faa64e20',
       'surface-main':'125448d6c36643d97f23500c7b74b1874738c645','line-default':'2a52e5ad5a83039e73014691e06c54e3d1b1cbfb' },
  sp: { 0:'5f1a475f1579646ebf9725210b19cd3d246132fa',2:'ced4852c090b1f2a216c6507ef73c99c6733ace5',4:'ca03624ead4c2c2462c2624003e3395daf2be12f',8:'c23139ed5f4bb3fb428410f43810433093c19f91',
        12:'59b1fdb0d63c50cbdbdd4659319e948378e3e11d',16:'b459ff37547b414ea6f4f6fea3fc2e1d76f3dd96',32:'44c2a65a76db8fadb04e5b739ad0754af0249973',48:'e0272ce24e25e0dc663e2ccf3adac07ae09cc35b' },
  r: { s:'27bf75a5ed353cbb4ee74302db91e3702b7dc359', l:'ca07e9e0afde0bd5cb5c952a9daf371b3bd68d4c' },
  comp: { headerPage:'21df81e076e13e27d067cc374c63bc38bdbea9e3', badgeNeutral:'969d7acc320e983331f6a43ae3ae1d5016679e7c' },
};
const S={},C={},SP={},R={};
for(const k in K.st) S[k]=await figma.importStyleByKeyAsync(K.st[k]);
for(const k in K.c) C[k]=await figma.variables.importVariableByKeyAsync(K.c[k]);
for(const k in K.sp) SP[k]=await figma.variables.importVariableByKeyAsync(K.sp[k]);
for(const k in K.r) R[k]=await figma.variables.importVariableByKeyAsync(K.r[k]);
const HP=await figma.importComponentByKeyAsync(K.comp.headerPage), BN=await figma.importComponentByKeyAsync(K.comp.badgeNeutral);
for(const f of [['Google Sans','Regular'],['Google Sans','Medium'],['Google Sans','Bold'],['Google Sans Code','Regular'],['Montserrat','Medium'],['Montserrat','Regular']]) await figma.loadFontAsync({family:f[0],style:f[1]});
// запасной цвет краски = значение переменной
async function resolved(v){ let cur=v; for(let i=0;i<5;i++){ const val=cur.valuesByMode[Object.keys(cur.valuesByMode)[0]]; if(val&&val.type==='VARIABLE_ALIAS') cur=await figma.variables.getVariableByIdAsync(val.id); else return val; } }
const FB=new Map(); for(const k in C) FB.set(C[k].id, await resolved(C[k]));
const paint=v=>{ const c=FB.get(v.id)||{r:0,g:0,b:0,a:1}; return figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:c.r,g:c.g,b:c.b},opacity:c.a??1},'color',v); };
const pad=(n,t,r,b,l)=>{ for(const [k,v] of [['paddingTop',t],['paddingRight',r],['paddingBottom',b],['paddingLeft',l]]){ n[k]=v; n.setBoundVariable(k,SP[v]); } };
const gap=(n,v)=>{ n.itemSpacing=v; n.setBoundVariable('itemSpacing',SP[v]); };
const rad=(n,key)=>{ for(const k of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) n.setBoundVariable(k,R[key]); };
const txt=async(t,style,color)=>{ await t.setTextStyleIdAsync(S[style].id); t.fills=[paint(C[color])]; log.texts++; };
const log={texts:0,swatches:0,cards:0,left:[]};

const sec=await figma.getNodeByIdAsync('316:35'), content=await figma.getNodeByIdAsync('316:42');
// секция
sec.fills=[paint(C['surface-main'])]; sec.strokes=[paint(C['line-default'])];
// карточка — вид IslandBlock
content.fills=[paint(C['surface-main'])]; content.strokes=[paint(C['line-default'])]; content.strokeWeight=1; content.strokeAlign='INSIDE';
rad(content,'l'); pad(content,48,48,48,48); gap(content,32);
for(const grid of content.children.filter(n=>n.type==='FRAME')){ gap(grid,32);
  for(const w of grid.children.filter(n=>n.type==='FRAME')){ gap(w,16); log.cards++;
    for(const ch of w.children){
      if(ch.name==='Meta'){ gap(ch,4); const chip=ch.children.find(n=>n.name==='Name');
        if(chip){ chip.fills=[]; pad(chip,0,0,0,0); chip.cornerRadius=0; const t=chip.findOne(n=>n.type==='TEXT'); if(t) await txt(t,'label-s','text-primary'); } continue; }
      if(ch.name==='Preview') continue; // сцена Rider
      if(ch.name==='Point Coords'){ gap(ch,12);
        for(const st of ch.children){ gap(st,8);
          for(const x of st.children){
            if(/Swatch$/.test(x.name)){ x.strokes=[paint(C['line-default'])]; rad(x,'s'); log.swatches++; continue; }
            if(x.name==='Text Info'){ gap(x,2); const ts=x.children.filter(n=>n.type==='TEXT'); if(ts[0]) await txt(ts[0],'label-s','text-primary'); for(const t of ts.slice(1)) await txt(t,'code-s','text-secondary'); continue; }
            log.left.push(x.id+' '+x.name);
          } }
        continue; }
      log.left.push(ch.id+' '+ch.name);
    } } }
// шапка → HeaderPage (тексты 1:1, метка версии в слоте, слой {version})
const old=await figma.getNodeByIdAsync('316:36');
const g0=Math.round(content.y-(old.y+old.height));
const title=old.findOne(n=>n.name==='Title').findOne(n=>n.type==='TEXT'&&n.name!=='{version}').characters;
const ver=old.findOne(n=>n.name==='{version}').characters;
const sub=old.children.find(n=>n.type==='TEXT').characters;
const hp=HP.createInstance(); const key=s=>Object.keys(hp.componentProperties).find(k=>k.split('#')[0]===s);
hp.setProperties({[key('Title')]:title,[key('Subtitle')]:sub,[key('Show How to Read')]:false,[key('Show Cover Link')]:false});
sec.appendChild(hp); hp.x=old.x; hp.y=old.y;
const contents=hp.findOne(n=>n.name==='Contents'); if(contents) contents.visible=false;
const slot=hp.findOne(n=>n.type==='SLOT');
const b=BN.createInstance(); b.name='Badge'; const bk=Object.keys(b.componentProperties).find(k=>k.startsWith('Text')); b.setProperties({[bk]:ver});
const bt=b.findOne(n=>n.type==='TEXT'); if(bt) bt.name='{version}';
for(const c of [...slot.children]) c.remove(); slot.appendChild(b);
old.remove();
hp.resize(content.width, hp.height);
content.y=hp.y+hp.height+g0;
sec.resizeWithoutConstraints(content.x*2+content.width, content.y+content.height+content.x);
// чейнжлог 316:142 — вслед за секцией, отступ прежний (120)
const cl=await figma.getNodeByIdAsync('316:142'); cl.x=sec.x+sec.width+120; cl.y=sec.y;
log.hp=hp.id; log.g0=g0; log.sec=[Math.round(sec.width),Math.round(sec.height)];
return log;
