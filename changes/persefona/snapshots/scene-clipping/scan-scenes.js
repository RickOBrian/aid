// Проверка сцен гайдов: вылет содержимого за обрезающие рамки оболочки. Только чтение.
// Запуск: Figma Plugin API (use_figma) в файле компонентов. Итог — строки
// [страница, сцена, рамка с обрезкой, узел, геом|тень, вылет л/п/в/н px, число узлов].
// «геом» — вылезает сам узел (bounding box); «тень» — только тень/размытие (оценка: radius + spread + сдвиг).
// Не проверяются (намеренная обрезка, правило С2 дока persefona-7-scene-clipping):
//  - рамка-экран: имя начинается с «Экран», «Вьюпорт», «Карта», «Taxi ·» — обрезка изображает край экрана;
//  - прокрутка внутри экрана продукта: «Container [Suggests]», «Bottom sheet Taxi»; подложки-карты; маски текста;
//  - содержимое экземпляров продукта (их обрезка — дизайн продукта).
// Важно: absoluteRenderBounds уже обрезан родителем — для вылета нужен absoluteBoundingBox без обрезки.
const SCENE_RE=/^(Пример|Эталон|Сцена|Example|Stage)/i;
const VIEW=/^(Экран|Вьюпорт|Карта|Taxi ·)|^Container \[Suggests\]|^Bottom sheet Taxi|Text$|маской/i; const MAPN=/^(Карта|Map$|Карта нью)/;
const res=[]; let sceneCount=0;
function ieCheck(n){ if(n.type!=='INSTANCE')return false; if(/IslandExample/.test(n.name))return true;
  return !!(n.children && n.children.some(c=>c.name==="Stage")); }
function fxPad(n){ let l=0,r=0,t=0,b=0; for(const e of (n.effects||[])){ if(e.visible===false)continue;
  if(e.type==='DROP_SHADOW'){ const s=(e.radius||0)+(e.spread||0); l=Math.max(l,s-e.offset.x); r=Math.max(r,s+e.offset.x); t=Math.max(t,s-e.offset.y); b=Math.max(b,s+e.offset.y);}
  else if(e.type==='LAYER_BLUR'){ const s=e.radius||0; l=Math.max(l,s);r=Math.max(r,s);t=Math.max(t,s);b=Math.max(b,s);} }
  let sw=0; if(n.strokes&&n.strokes.length&&n.strokeAlign==='OUTSIDE') sw=n.strokeWeight||0; if(n.strokes&&n.strokes.length&&n.strokeAlign==='CENTER') sw=(n.strokeWeight||0)/2;
  if(typeof sw!=='number') sw=0; return {l:l+sw,r:r+sw,t:t+sw,b:b+sw}; }
function ext(n,geo){ const a=n.absoluteBoundingBox; if(!a)return null; const p=geo?{l:0,r:0,t:0,b:0}:fxPad(n);
  let e={x0:a.x-p.l,y0:a.y-p.t,x1:a.x+a.width+p.r,y1:a.y+a.height+p.b};
  if('children' in n && !n.clipsContent){ for(const c of n.children){ if(c.visible===false)continue; const ce=ext(c,geo); if(!ce)continue;
    e={x0:Math.min(e.x0,ce.x0),y0:Math.min(e.y0,ce.y0),x1:Math.max(e.x1,ce.x1),y1:Math.max(e.y1,ce.y1)}; } }
  return e; }
function ov(a,e){ return [Math.round(a.x-e.x0),Math.round(e.x1-(a.x+a.width)),Math.round(a.y-e.y0),Math.round(e.y1-(a.y+a.height))].map(v=>Math.max(0,v)); }
function walk(c, scene, page){
  for(const d of ('children' in c?c.children:[])){ if(d.visible===false)continue;
    if(!(VIEW.test(c.name)||MAPN.test(d.name))){ const a=c.absoluteBoundingBox; const e=ext(d,false), g=ext(d,true);
      if(a&&e){ const o=ov(a,e), og=ov(a,g); if(Math.max(...o)>=1) res.push([page.name,scene.id,scene.name,c.id+' '+c.name,d.name,Math.max(...og)>=1?'геом':'тень',o.join('/')]); } }
    if(d.type!=='INSTANCE' && 'children' in d){ if(d.clipsContent) walk(d,scene,page); else walkThrough(d,c,scene,page); } } }
function walkThrough(x,c,scene,page){ for(const d of x.children){ if(d.visible===false)continue; if(d.type!=='INSTANCE'&&'children' in d&&d.clipsContent) walk(d,scene,page); else if(d.type!=='INSTANCE'&&'children' in d) walkThrough(d,c,scene,page);} }
function isAnc(a,b){ let p=b.parent; while(p){ if(p===a)return true; p=p.parent;} return false; }
function scan(n,page){ sceneCount++; if(n.clipsContent) walk(n,n,page); else if('children' in n){ for(const d of n.children){ if(d.visible===false)continue; if(d.type!=='INSTANCE'&&'children' in d && d.clipsContent) walk(d,n,page); else if(d.type!=='INSTANCE'&&'children' in d) walkThrough(d,n,n,page);} } }
for(const page of figma.root.children){ await page.loadAsync();
  const ies=page.findAllWithCriteria({types:['INSTANCE']}).filter(ieCheck);
  const iesTop=ies.filter(i=>!ies.some(o=>o!==i&&isAnc(o,i)));
  for(const i of iesTop) scan(i,page);
  const fr=page.findAll(n=>n.type==='FRAME'&&SCENE_RE.test(n.name)&&!ies.some(i=>isAnc(i,n)));
  const frTop=fr.filter(f=>!fr.some(o=>o!==f&&isAnc(o,f)));
  for(const f of frTop) scan(f,page);
}
const g={}; for(const r of res){ const k=r[1]+'|'+r[3]; if(!g[k]) g[k]=[...r,1]; else { g[k][7]++; const a=g[k][6].split('/').map(Number), b=r[6].split('/').map(Number); g[k][6]=a.map((v,i)=>Math.max(v,b[i])).join('/'); if(r[5]==='геом') g[k][5]='геом'; } }
const rowsAll=Object.values(g);
const rows=rowsAll;
const byPage={}; for(const r of rows){ (byPage[r[0]]=byPage[r[0]]||new Set()).add(r[1]); }
return {scenes:sceneCount,scenesWithOverflow:new Set(rows.map(r=>r[1])).size,
  pagesWithOverflow:Object.fromEntries(Object.entries(byPage).map(([k,v])=>[k,v.size])),rows};
