// Дубликат страницы для прогона migrate-styles.js (только Drafts / DEV, по «да» arturuxui).
// В начало вставить: const SRC = '<id страницы-оригинала>';
// Копия встаёт сразу за оригиналом с суффиксом « — Switched Styles» (перенос страницы требует
// загруженных шрифтов; если какой-то не грузится — копия остаётся в конце списка страниц).
// Повторный вызов не плодит копии: если страница с таким именем есть — возвращает её.
// Мастера компонентов в копии становятся экземплярами мастеров оригинала (поведение page.clone()).
const src = await figma.getNodeByIdAsync(SRC);
const name = `${src.name.trim()} — Switched Styles`;
const exist = figma.root.children.find(p => p.name === name);
if (exist) return { pageId: exist.id, name, created: false, roots: exist.children.length };
await figma.setCurrentPageAsync(src);
const fonts = new Map();
for (const t of src.findAllWithCriteria({ types: ['TEXT'] })) for (const f of t.getRangeAllFontNames(0, t.characters.length)) fonts.set(`${f.family}|${f.style}`, f);
const badFonts = [];
for (const [k, f] of fonts) { try { await figma.loadFontAsync(f); } catch (e) { badFonts.push(k); } }
const copy = src.clone();
copy.name = name;
let placed = false;
if (!badFonts.length) { try { figma.root.insertChild(figma.root.children.indexOf(src) + 1, copy); placed = true; } catch (e) {} }
return { pageId: copy.id, name, created: true, placed, badFonts, roots: copy.children.length, createdNodeIds: [copy.id] };
