// Дубликат большой страницы по частям — когда clone-page.js роняет соединение (страницы ~20 000+ узлов).
// В начало вставить:
//   const SRC = '<id оригинала>';
//   const FROM = 0, TO = 20; // индексы детей оригинала [FROM, TO) — порция ~3 000 узлов
// Первый вызов создаёт пустую страницу « — Switched Styles» сразу за оригиналом, следующие — дописывают в неё.
// Дубли исключены сверкой по счётчику: FROM должен равняться числу детей на копии, иначе вызов ничего
// не делает и возвращает error; copied — сколько детей уже на копии, следующая порция — с FROM = copied.
// Упавший вызов откатывается целиком, его можно повторить или разбить мельче.
const src = await figma.getNodeByIdAsync(SRC);
const name = `${src.name.trim()} — Switched Styles`;
let copy = figma.root.children.find(p => p.name === name);
const created = !copy;
if (!copy) { copy = figma.createPage(); copy.name = name; figma.root.insertChild(figma.root.children.indexOf(src) + 1, copy); }
if (copy.children.length !== FROM) return { pageId: copy.id, error: `на копии ${copy.children.length} детей, а FROM = ${FROM}`, copied: copy.children.length, total: src.children.length };
await figma.setCurrentPageAsync(src);
const part = src.children.slice(FROM, TO);
const fonts = new Map();
for (const r of part) {
  const texts = r.type === 'TEXT' ? [r] : 'findAllWithCriteria' in r ? r.findAllWithCriteria({ types: ['TEXT'] }) : [];
  for (const t of texts) for (const f of t.getRangeAllFontNames(0, t.characters.length)) fonts.set(`${f.family}|${f.style}`, f);
}
const badFonts = [];
for (const [k, f] of fonts) { try { await figma.loadFontAsync(f); } catch (e) { badFonts.push(k); } }
const ids = [];
for (const r of part) { const c = r.clone(); copy.appendChild(c); c.x = r.x; c.y = r.y; ids.push(c.id); }
return { pageId: copy.id, name, created, copied: copy.children.length, total: src.children.length, badFonts, createdNodeIds: ids };
