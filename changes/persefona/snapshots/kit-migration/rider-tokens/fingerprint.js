// persefona-6 (AID-64): отпечаток текстов витрины color-sem (Rider Tokens yrfG6u9osujKX8e1B14lpT, страница 0:1). Только чтение.
// Шапку витрины передавать id экземпляра HeaderPage (после перевода) или 32:2349 (до).
const BLOCKS = ['1619:143','28:784','28:3','28:393','28:1446','28:1700','28:2034','28:1252','28:2128','28:1403','28:1579','28:1867','31:66'];
const fnv=s=>{let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return h.toString(16).padStart(8,'0');};
const visIn=(n,root)=>{let p=n;while(p&&p.id!==root.id){if(p.visible===false)return false;p=p.parent;}return true;};
const inInstance=(n,root)=>{let p=n.parent;while(p&&p.id!==root.id){if(p.type==='INSTANCE')return true;p=p.parent;}return false;};
const out={};
for(const id of BLOCKS){
  const B=await figma.getNodeByIdAsync(id); const s=[];
  if(B.type==='INSTANCE'){ s.push(...B.findAll(t=>t.type==='TEXT'&&visIn(t,B)).map(t=>t.characters)); }
  else for(const n of B.findAll(()=>true)){
    if(n.type==='TEXT'&&!inInstance(n,B)) s.push(n.characters);
    if(n.type==='INSTANCE'&&!inInstance(n,B)){
      if(id==='31:66'){ const tp=Object.values(n.componentProperties).filter(v=>v.type==='TEXT').map(v=>v.value); if(tp.length){ s.push(...tp); continue; } }
      s.push(...n.findAll(t=>t.type==='TEXT'&&visIn(t,n)).map(t=>t.characters));
    }
  }
  s.sort(); out[id]={count:s.length,fnv:fnv(s.join('\n')),lines:s};
}
return out;
