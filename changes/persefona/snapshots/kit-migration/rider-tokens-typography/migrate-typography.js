// persefona-6 (AID-64): перевод витрин типографики на странице 1:2 «✅ Typography» (Rider Tokens yrfG6u9osujKX8e1B14lpT) на Kit Persefona.
// Запуск через use_figma; FRAMES — витрины для прогона: ['184:91'], затем ['11:8'].
// Меняется только вид оболочки. Шапка — по решению приёмки #465 §5.2 «б» (Title = имя страницы, прежние заголовок и подпись — в Subtitle,
// метки «Принято», «Rider», версия со слоем {version}). Сэмплы «Съешь ещё…» (стили и цвет Rider) не трогаются.
const FRAMES = __FRAMES__;
const PAGE_TITLE = 'Typography';
const K = {
  st: { 'heading-s':'3e24e1f1618f2159a35c55d1087a40eee8354e12','label-s':'b179157f175048e57d194430763321f566d2cb43','body-m':'3a3b69e506572164e7cd8b0cb0585615dd88ed12',
        'body-s':'dede2b7c132add99b21cc5f0c90880b535b4ad26','code-s':'dc6f78fc82ce91d3a06a28b1dabb01d17df35cca' },
  c: { 'text-primary':'f1ae466778bfebc4323580287007c99393922fea','text-secondary':'4b2825ef9a779f55c1332634032ad0b4faa64e20',
       'surface-main':'125448d6c36643d97f23500c7b74b1874738c645','surface-muted':'749515ebb1ca2d075277f4baeac3c54c65ef96aa','surface-zebra':'864a9210e3ef4604f9c2fc6a99d445b9314a0982',
       'line-default':'2a52e5ad5a83039e73014691e06c54e3d1b1cbfb' },
  sp: { 0:'5f1a475f1579646ebf9725210b19cd3d246132fa',10:'b51d6aa356e3fa35bd7a10bf88f20ae2d7099902',16:'b459ff37547b414ea6f4f6fea3fc2e1d76f3dd96',24:'b287ebd1044990477d532e55da91e824f099a34b',
        32:'44c2a65a76db8fadb04e5b739ad0754af0249973',48:'e0272ce24e25e0dc663e2ccf3adac07ae09cc35b' },
  r: { m:'430a007fc643ff90984da87658024a3f2a7dde8f', l:'ca07e9e0afde0bd5cb5c952a9daf371b3bd68d4c' },
  comp: { headerPage:'21df81e076e13e27d067cc374c63bc38bdbea9e3', badgeNeutral:'969d7acc320e983331f6a43ae3ae1d5016679e7c', badgeSuccess:'4f40df859f56f629da61b2bda40ea423072c50dc',
          cellHeader:'5ebdfe8d3a9adbccc8594e851b6f794f8c19834a' },
};
const S={},C={},SP={},R={};
for(const k in K.st) S[k]=await figma.importStyleByKeyAsync(K.st[k]);
for(const k in K.c) C[k]=await figma.variables.importVariableByKeyAsync(K.c[k]);
for(const k in K.sp) SP[k]=await figma.variables.importVariableByKeyAsync(K.sp[k]);
for(const k in K.r) R[k]=await figma.variables.importVariableByKeyAsync(K.r[k]);
const HP=await figma.importComponentByKeyAsync(K.comp.headerPage), BN=await figma.importComponentByKeyAsync(K.comp.badgeNeutral), BS=await figma.importComponentByKeyAsync(K.comp.badgeSuccess);
const TH=await figma.importComponentByKeyAsync(K.comp.cellHeader);
for(const f of [['Google Sans','Regular'],['Google Sans','Medium'],['Google Sans','Bold'],['Google Sans Code','Regular']]) await figma.loadFontAsync({family:f[0],style:f[1]});
// запасной цвет краски = значение переменной
async function resolved(v){ let cur=v; for(let i=0;i<5;i++){ const val=cur.valuesByMode[Object.keys(cur.valuesByMode)[0]]; if(val&&val.type==='VARIABLE_ALIAS') cur=await figma.variables.getVariableByIdAsync(val.id); else return val; } }
const FB=new Map(); for(const k in C) FB.set(C[k].id, await resolved(C[k]));
const paint=v=>{ const c=FB.get(v.id)||{r:0,g:0,b:0,a:1}; return figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:c.r,g:c.g,b:c.b},opacity:c.a??1},'color',v); };
const pad=(n,t,r,b,l)=>{ for(const [k,v] of [['paddingTop',t],['paddingRight',r],['paddingBottom',b],['paddingLeft',l]]){ n[k]=v; n.setBoundVariable(k,SP[v]); } };
const gap=(n,v)=>{ n.itemSpacing=v; n.setBoundVariable('itemSpacing',SP[v]); };
const rad=(n,key)=>{ for(const k of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) n.setBoundVariable(k,R[key]); };
const line=n=>{ n.strokes=[paint(C['line-default'])]; };
const txt=async(t,style,color)=>{ await t.setTextStyleIdAsync(S[style].id); t.fills=[paint(C[color])]; log.texts++; };
const hex=c=>'#'+[c.r,c.g,c.b].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('').toUpperCase();
const badge=(Cmp,t,layer)=>{ const b=Cmp.createInstance(); b.name='Badge'; const k=Object.keys(b.componentProperties).find(x=>x.startsWith('Text')); b.setProperties({[k]:t}); if(layer){ const bt=b.findOne(n=>n.type==='TEXT'); if(bt) bt.name=layer; } return b; };
const log={texts:0,headers:0,groups:0,styles:0,cells:0,rows:0,left:[]};

for(const fid of FRAMES){
  const F=await figma.getNodeByIdAsync(fid);
  // витрина — вид IslandBlock
  F.fills=[paint(C['surface-main'])]; line(F); F.strokeAlign='INSIDE'; rad(F,'l'); pad(F,48,48,48,48); gap(F,24);
  // шапка → HeaderPage
  const old=F.children.find(n=>n.name==='Header');
  if(old){ const tEl=old.findOne(n=>n.name==='Title'); const title=tEl.findOne(n=>n.type==='TEXT'&&n.name!=='{version}').characters;
    const ver=old.findOne(n=>n.name==='{version}').characters; const sub=old.children.find(n=>n.type==='TEXT').characters;
    const hp=HP.createInstance(); const key=s=>Object.keys(hp.componentProperties).find(k=>k.split('#')[0]===s);
    hp.setProperties({[key('Title')]:PAGE_TITLE,[key('Subtitle')]:title+'\n'+sub,[key('Show How to Read')]:false,[key('Show Cover Link')]:false});
    F.insertChild(F.children.indexOf(old),hp); hp.layoutSizingHorizontal='FILL';
    const contents=hp.findOne(n=>n.name==='Contents'); if(contents) contents.visible=false;
    const slot=hp.findOne(n=>n.type==='SLOT'); for(const c of [...slot.children]) c.remove();
    slot.appendChild(badge(BS,'Принято')); slot.appendChild(badge(BN,'Rider')); slot.appendChild(badge(BN,ver,'{version}'));
    old.remove(); log.headers++; log['hp '+fid]=hp.id; }
  // таблица витрины
  const data=F.children.find(n=>n.name==='Data'); line(data); rad(data,'m'); data.clipsContent=true;
  for(const row of data.children){
    if(row.name.startsWith('Group · ')){ row.fills=[paint(C['surface-muted'])]; line(row); pad(row,16,32,16,32); for(const t of row.findAll(n=>n.type==='TEXT')) await txt(t,'heading-s','text-primary'); log.groups++; continue; }
    row.fills=[paint(C['surface-main'])]; line(row); pad(row,32,32,32,32); gap(row,48); log.styles++;
    const sample=row.children.find(n=>n.name==='Sample');
    if(sample){ gap(sample,16); const ts=sample.children.filter(n=>n.type==='TEXT');
      if(ts[0]) await txt(ts[0],'label-s','text-secondary'); // имя стиля
      // ts[1] — сэмпл в стиле Rider: контент, не трогается
      if(ts[2]) await txt(ts[2],'body-s','text-secondary'); // размер / интерлиньяж / вес
      for(const t of ts.slice(3)) log.left.push('текст '+t.id); }
    const tt=row.children.find(n=>n.name==='Token Table');
    if(tt){ tt.fills=[paint(C['surface-main'])]; line(tt); rad(tt,'m'); tt.clipsContent=true; tt.layoutSizingHorizontal='FILL';
      for(const r of tt.children){ r.layoutSizingHorizontal='FILL';
        if(r.name==='TH'){ r.fills=[paint(C['surface-muted'])]; pad(r,0,0,0,0); gap(r,0);
          const ts=r.children.filter(n=>n.type==='TEXT');
          ts.forEach((t,i)=>{ const inst=TH.createInstance(); inst.name='TableCell'; const k=Object.keys(inst.componentProperties).find(x=>x.startsWith('Text')); inst.setProperties({[k]:t.characters});
            r.insertChild(r.children.indexOf(t),inst); if(i<ts.length-1){ inst.layoutSizingHorizontal='FIXED'; inst.resize(t.width+16,inst.height); } // +16 — отступ ячейки; у строк столько же шаг else inst.layoutSizingHorizontal='FILL';
            t.remove(); log.cells++; });
          continue; }
        const f=r.fills[0]; r.fills=[paint(C[f&&f.type==='SOLID'&&hex(f.color)==='#F6F7F9'?'surface-zebra':'surface-main'])];
        pad(r,10,16,10,16); gap(r,16); log.rows++; // текст столбцов — по тексту ячеек шапки
        const ts=r.children.filter(n=>n.type==='TEXT');
        for(let i=0;i<ts.length;i++) await txt(ts[i], i===ts.length-1?'code-s':'body-m', i===ts.length-1?'text-secondary':'text-primary');
        // имя токена в code-s длиннее прежнего — переносится по ширине таблицы; строка — по центру
        const last=ts[ts.length-1]; if(last){ last.layoutSizingHorizontal='FILL'; last.textAutoResize='HEIGHT'; } r.counterAxisAlignItems='CENTER';
      } }
  }
}
return log;
