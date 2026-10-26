// persefona-6 (AID-64): отпечаток текстов витрин Shadows 1:3, Glass 66:278, Space 1:4, Radius 1:5 (Rider Tokens yrfG6u9osujKX8e1B14lpT). Только чтение.
// BLOCKS — [страница, id блока]; шапки до перевода — фреймы Header, после — экземпляры HeaderPage. У таблиц чейнжлога — текстовые свойства экземпляров (#436).
const BLOCKS = __BLOCKS__;
const CHANGELOGS = ['21:15','71:17','208:54','204:50'];
const fnv=s=>{let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return h.toString(16).padStart(8,'0');};
const visIn=(n,root)=>{let p=n;while(p&&p.id!==root.id){if(p.visible===false)return false;p=p.parent;}return true;};
const inInstance=(n,root)=>{let p=n.parent;while(p&&p.id!==root.id){if(p.type==='INSTANCE')return true;p=p.parent;}return false;};
const out={};
for(const [pid,id] of BLOCKS){
  await figma.setCurrentPageAsync(await figma.getNodeByIdAsync(pid));
  const B=await figma.getNodeByIdAsync(id); const s=[];
  if(B.type==='INSTANCE'){ s.push(...B.findAll(t=>t.type==='TEXT'&&visIn(t,B)).map(t=>t.characters)); }
  else for(const n of B.findAll(()=>true)){
    if(n.type==='TEXT'&&!inInstance(n,B)&&visIn(n,B)) s.push(n.characters);
    if(n.type==='INSTANCE'&&!inInstance(n,B)){
      if(CHANGELOGS.includes(id)){ const tp=Object.values(n.componentProperties).filter(v=>v.type==='TEXT').map(v=>v.value); if(tp.length){ s.push(...tp); continue; } }
      s.push(...n.findAll(t=>t.type==='TEXT'&&visIn(t,n)).map(t=>t.characters));
    }
  }
  s.sort(); out[id]={count:s.length,fnv:fnv(s.join("\n"))}; if(s.length<=12) out[id].lines=s;
}
return out;
