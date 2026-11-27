// ds-component-check · автопроверка пейджа аудита или сборки — только чтение.
// Запуск: use_figma, fileKey — файл библиотеки; перед вызовом заменить CONFIG.
// Скрипт ничего не меняет в файле. Вывод — JSON { meta, findings[], inventory }.
// Правила — skills/ds-component-check/SKILL.md §3 (коды D1…D14).

const CONFIG = {
  FILE_KEY: '__FILE_KEY__',       // для отчёта: figma.root.name в use_figma имени файла не даёт
  PAGE_ID: '__PAGE_ID__',          // id пейджа: 👀 X · audit или 🚧 X · construction
  MODE: '__MODE__',                // 'audit' | 'construction' | 'auto' (по имени пейджа)
  // Тон, у которого хекс допустим (правило sergej 2026-10-30, IconSurface Custom).
  HEX_ALLOWED_VALUES: ['Custom'],
  // Устаревшие имена в действующих текстах. Дополнять по changelog токенов.
  DEPRECATED: [
    { re: 'Pastel/', why: 'Pastel/* сняты, нужен действующий токен' },
    { re: '(^|[^A-Za-z ])Tint/', why: 'Tint/* переименованы в Background/* Tint (Rider Colors 2.0.0)' },
    { re: 'neutral-[xy]', why: 'старая служебная палитра (persefona-figma-pages §6.6)' },
    { re: 'text icon/', why: 'старые токены text icon/*' },
    { re: '(^|[^A-Za-z ])Line/', why: 'Line/* к устареванию, Stroke/Separator*' },
  ],
  // Фразы, которых нет на пейдже аудита и сборки (протокол §3.1 п.1, §3.8 п.3).
  FORBIDDEN_PHRASES: [
    { re: '[Рр]ешени[ея] PD', why: 'история решений не входит в аудит и сборку (§3.1 п.1)' },
    // пометки решений — только в блоке 8; подагент смотрит, в каком блоке строка
    { re: '\\((sergej|PD)[ ,]', why: 'пометка решения вне блока 8? (поздние решения PD)' },
  ],
  CAP: 15,                         // примеров на правило в выводе
};

const out = { meta: {}, findings: [], inventory: {} };
const counts = {};
function add(code, block, node, msg, norm, level) {
  counts[code] = (counts[code] || 0) + 1;
  if (counts[code] > CONFIG.CAP) return;
  out.findings.push({ code, level: level || 'error', block, node: node ? node.id : null,
    name: node ? String(node.name).slice(0, 60) : null, msg, norm });
}
const CYR = /[А-Яа-яЁё]/;
const ENT = /&(quot|gt|lt|amp|apos|#\d+);/;

const page = await figma.getNodeByIdAsync(CONFIG.PAGE_ID);
if (!page || page.type !== 'PAGE') return { error: 'pageNotFound', id: CONFIG.PAGE_ID };
await figma.setCurrentPageAsync(page);

let mode = CONFIG.MODE;
if (mode === 'auto' || mode.startsWith('__')) mode = / · (construction|readyfordev)$/.test(page.name) ? 'construction' : 'audit';
// readyfordev: проверки сборки; аудит ушёл в Archive ещё на этапе сборки (PD 2026-11-26)
const rfd = / · readyfordev$/.test(page.name);
out.meta = { page: page.name, pageId: page.id, mode, file: CONFIG.FILE_KEY };

// ── D1 имя пейджа ─────────────────────────────────────────────────────
{
  const m = page.name.match(/^(\S+) (.+) · (audit|construction|readyfordev)$/);
  if (!m) add('D1', 'пейдж', page, 'имя пейджа не по форме «<значок> <Компонент> · audit|construction»', '§3.1 п.1, §3.8 п.1; persefona-figma-pages §4.1');
  else {
    if (CYR.test(m[2])) add('D1', 'пейдж', page, 'кириллица в имени компонента пейджа', 'латиница (#452, persefona-figma-pages §4.1)');
    if (m[3] === 'audit' && m[1] !== '👀') add('D1', 'пейдж', page, `значок ${m[1]} у аудита`, '👀 (§3.1 п.1)');
    if (m[3] === 'construction' && m[1] !== '🚧' && m[1] !== '✅') add('D1', 'пейдж', page, `значок ${m[1]} у сборки`, '🚧 до публикации (§3.8 п.1, #532)');
  }
}

// ── D2 структура: секция аудита, мастера ──────────────────────────────
const top = page.children;
out.inventory.top = top.slice(0, 40).map(n => ({ id: n.id, type: n.type, name: n.name.slice(0, 60), children: 'children' in n ? n.children.length : 0 }));
const auditSections = top.filter(n => / · audit( · \d{4}-\d{2}-\d{2})?$/.test(n.name));
if (mode === 'construction') {
  // PD 2026-11-26 (#649): с созданием пейджа сборки аудит — сразу в Archive, на пейдже сборки его нет
  if (auditSections.length) add('D2', 'пейдж', auditSections[0], `секция аудита на пейдже ${rfd ? 'readyfordev' : 'сборки'}`, 'аудит — в Archive секцией «<Компонент> · audit · ГГГГ-ММ-ДД», id те же (§3.1 п.6, PD 2026-11-26)');
  const comp = page.name.replace(/^\S+ /, '').replace(/ · (construction|readyfordev)$/, '');
  const arch = figma.root.children.find(p => /Archive/i.test(p.name));
  if (!arch) add('D2', 'пейдж', page, 'в файле нет пейджа Archive — аудит некуда было перенести', '§3.1 п.6; persefona-figma-pages §7.1, §7.3', 'warn');
  else {
    await arch.loadAsync();
    const esc = comp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const inArch = arch.findAll(n => n.type === 'SECTION' && new RegExp('^' + esc + ' · audit( · \\d{4}-\\d{2}-\\d{2})?$').test(n.name));
    out.inventory.archiveAudit = inArch.slice(0, 5).map(n => ({ id: n.id, name: n.name }));
    if (!inArch.length && !auditSections.length) add('D2', 'пейдж', arch, `нет секции «${comp} · audit · ГГГГ-ММ-ДД» в Archive`, 'аудит при сборке — в Archive (§3.1 п.6, PD 2026-11-26)', 'warn');
    else if (inArch.length && !inArch.some(n => / · \d{4}-\d{2}-\d{2}$/.test(n.name))) add('D2', 'пейдж', inArch[0], 'секция аудита в Archive без даты переноса', '«<Компонент> · audit · ГГГГ-ММ-ДД» (persefona-figma-pages §7.3)', 'warn');
  }
  const sameAudit = figma.root.children.find(p => p.id !== page.id && / · audit$/.test(p.name) &&
    p.name.replace(/^\S+ /, '').replace(/ · audit$/, '') === page.name.replace(/^\S+ /, '').replace(/ · construction$/, ''));
  if (sameAudit) add('D2', 'пейдж', sameAudit, 'отдельный пейдж аудита остался рядом с пейджем сборки', 'аудит — в Archive, пустой пейдж · audit удалить после сверки (§3.1 п.6)');
}
function topOf(n) { let p = n; while (p.parent && p.parent.type !== 'PAGE') p = p.parent; return p; }
// ближайший блок по имени фрейма «4. Сборка», иначе секция
function blockOf(n) { let p = n.parent; while (p && p.type !== 'PAGE') { if (/^\d{1,2}\. /.test(p.name)) return (topOf(p).name.slice(0, 24) + ' › ' + p.name).slice(0, 50); p = p.parent; } return topOf(n).name.slice(0, 30); }
function inAudit(n) { return auditSections.includes(topOf(n)); }

const masters = page.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] })
  .filter(n => !(n.type === 'COMPONENT' && n.parent && n.parent.type === 'COMPONENT_SET'));
out.inventory.masters = masters.slice(0, 30).map(n => ({ id: n.id, type: n.type, name: n.name, top: topOf(n).name.slice(0, 40) }));
for (const mm of masters) {
  if (mode === 'construction' && inAudit(mm) && !mm.name.startsWith('.'))
    add('D2', 'аудит', mm, 'мастер в секции аудита без точки — опубликуется', 'мастера аудита — с точкой в начале (§3.1 п.6)');
  if (mode === 'audit' && !mm.name.startsWith('.'))
    add('D2', 'аудит', mm, 'мастер на пейдже аудита без точки', 'прототипы аудита не публикуются — точка в начале (§3.1 п.6)', 'warn');
}

// ── D3 варианты и свойства ────────────────────────────────────────────
function relPath(node, root) { const a = []; let p = node; while (p && p !== root) { const i = p.parent ? p.parent.children.indexOf(p) : 0; a.unshift(`${p.name}[${i}]`); p = p.parent; } return a.join(' / '); }
function bindSig(n) {
  const r = n.componentPropertyReferences ? Object.entries(n.componentPropertyReferences).map(([k, v]) => `${k}=${v}`).sort() : [];
  const bv = n.boundVariables ? Object.keys(n.boundVariables).sort() : [];
  const pv = [];
  for (const key of ['fills', 'strokes']) {
    const arr = n[key];
    if (Array.isArray(arr)) arr.forEach((p, i) => { if (p.boundVariables && p.boundVariables.color) pv.push(`${key}[${i}].color`); });
  }
  return { refs: r, vars: [...new Set([...bv, ...pv])].sort() };
}
const sets = masters.filter(n => n.type === 'COMPONENT_SET');
out.inventory.sets = [];
for (const set of sets) {
  const defs = set.componentPropertyDefinitions;
  const variantProps = Object.entries(defs).filter(([, d]) => d.type === 'VARIANT');
  const expected = variantProps.reduce((a, [, d]) => a * d.variantOptions.length, 1);
  const variants = set.children.filter(c => c.type === 'COMPONENT');
  out.inventory.sets.push({ id: set.id, name: set.name, variants: variants.length, expected,
    props: Object.entries(defs).map(([k, d]) => `${k}:${d.type}${d.type === 'VARIANT' ? '[' + d.variantOptions.join('|') + ']' : ''}`) });
  if (variants.length !== expected) {
    const key = o => JSON.stringify(Object.entries(o || {}).sort());
    const have = new Set(variants.map(v => key(v.variantProperties)));
    const missing = [];
    const combos = variantProps.reduce((acc, [k, d]) => acc.flatMap(c => d.variantOptions.map(o => ({ ...c, [k]: o }))), [{}]);
    for (const c of combos) if (!have.has(key(c))) missing.push(Object.values(c).join('/'));
    add('D3', 'набор', set, `вариантов ${variants.length} из ${expected}; нет: ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? '…' : ''}`, 'полная матрица вариантов или объяснение в описании', 'warn');
  }
  // имена свойств и значений
  for (const [k, d] of Object.entries(defs)) {
    const nm = k.replace(/#\d+:\d+$/, '');
    if (CYR.test(nm)) add('D3', 'набор', set, `свойство «${nm}» кириллицей`, 'имена свойств — латиницей, как в коде (naming-conventions)');
    if (!/^[A-Z]/.test(nm)) add('D3', 'набор', set, `свойство «${nm}» не с заглавной`, 'Title Case (naming-conventions «Variants, states, slots»)', 'warn');
    if (d.type === 'VARIANT') for (const o of d.variantOptions) {
      if (CYR.test(o)) add('D3', 'набор', set, `значение «${o}» кириллицей`, 'латиница');
      if (o === 'true' || o === 'false') add('D3', 'набор', set, `значение «${o}» строчными`, 'True/False (Search Field 2026-10-29)', 'warn');
    }
    if (d.type !== 'VARIANT') {
      // свойство заведено, но ни к чему не привязано
      const used = set.findAll(n => n.componentPropertyReferences && Object.values(n.componentPropertyReferences).includes(k));
      if (!used.length) add('D3', 'набор', set, `свойство «${nm}» ни к одному слою не привязано`, 'каждое свойство управляет слоем');
    }
  }
  // одинаковые привязки свойств и переменных во всех вариантах (урок Button 2026-11-09)
  const maps = variants.map(v => {
    const m = new Map();
    v.findAll(() => true).forEach(n => m.set(relPath(n, v), bindSig(n)));
    m.set('(корень)', bindSig(v));
    return { v, m };
  });
  const paths = new Set(maps.flatMap(x => [...x.m.keys()]));
  for (const path of paths) {
    const present = maps.filter(x => x.m.has(path));
    if (present.length < 2) continue;
    for (const kind of ['refs', 'vars']) {
      const groups = new Map();
      for (const x of present) { const s = x.m.get(path)[kind].join(','); if (!groups.has(s)) groups.set(s, []); groups.get(s).push(x.v); }
      if (groups.size < 2) continue;
      const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
      const norm = sorted[0][0];
      for (const [sig, vs] of sorted.slice(1)) {
        // разная раскраска по смыслу (разные токены) не ловится: сравниваются только ключи
        add(kind === 'refs' ? 'D4' : 'D5', 'набор', vs[0],
          `«${path}»: ${kind === 'refs' ? 'привязки свойств' : 'привязки переменных'} [${sig || 'нет'}] у ${vs.length} вар. (${vs.slice(0, 3).map(v => v.name).join('; ')}), у большинства [${norm || 'нет'}]`,
          'у всех вариантов набора одинаковые привязки — клонирование сбрасывает их (§3.1 п.5, §3.8 п.5)');
      }
    }
  }
}

// ── D6 токены в мастерах: хексы, литералы, стили текста ─────────────────
function hexOf(c) { return '#' + [c.r, c.g, c.b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('').toUpperCase(); }
function allowedHex(n) {
  let p = n;
  while (p && p.type !== 'PAGE') {
    if (p.type === 'COMPONENT' && p.variantProperties && Object.values(p.variantProperties).some(v => CONFIG.HEX_ALLOWED_VALUES.includes(v))) return true;
    if (CONFIG.HEX_ALLOWED_VALUES.some(v => new RegExp(`(^|[ =])${v}($|[ ,/])`).test(p.name))) return true;
    p = p.parent;
  }
  return false;
}
const NUM = ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'itemSpacing', 'counterAxisSpacing',
  'topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];
function checkTokens(scopeNodes, block, strict) {
  for (const n of scopeNodes) {
    if (!n.visible) continue;
    // рамка набора вариантов (заливка, пунктир, отступ 24, радиус 5) — служебная, Figma ставит сама
    if (n.type === 'COMPONENT_SET') continue;
    for (const key of ['fills', 'strokes']) {
      const arr = n[key];
      if (!Array.isArray(arr)) continue;
      const styleId = key === 'fills' ? n.fillStyleId : n.strokeStyleId;
      if (styleId && styleId !== figma.mixed && styleId !== '') continue;
      arr.forEach(p => {
        if (p.type === 'SOLID' && p.visible !== false && !(p.boundVariables && p.boundVariables.color)) {
          if (allowedHex(n)) return;
          add('D6', block, n, `${key} ${hexOf(p.color)}${p.opacity !== undefined && p.opacity < 1 ? ' ' + Math.round(p.opacity * 100) + '%' : ''} без токена`,
            strict ? 'все значения — токены (§3.8 п.3); исключение — Custom-тон' : 'хекс на аудите — только допущением с пометкой (§3.5)', strict ? 'error' : 'warn');
        }
        if ((p.type || '').startsWith('GRADIENT') && !(p.gradientStops || []).every(s => s.boundVariables && s.boundVariables.color) && !allowedHex(n))
          add('D6', block, n, `${key} градиент без токенов`, 'градиент — стилем или переменными', 'warn');
      });
    }
    // в аудите литералы допустимы как пробел с пометкой — предупреждение, в сборке — ошибка
    const lvl = strict ? 'error' : 'warn';
    {
      if ('layoutMode' in n && n.layoutMode && n.layoutMode !== 'NONE') {
        for (const k of NUM) {
          const v = n[k];
          if (typeof v === 'number' && v !== 0 && !(n.boundVariables && n.boundVariables[k])) {
            if (k.endsWith('Radius')) continue;
            if (k === 'counterAxisSpacing' && n.layoutWrap !== 'WRAP') continue;
            add('D7', block, n, `${k} = ${v} литералом`, 'отступы — space-токены (§3.8 п.5); литерал — только с записью в описании', lvl);
          }
        }
      }
      for (const k of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) {
        if (typeof n[k] === 'number' && n[k] !== 0 && !(n.boundVariables && n.boundVariables[k])) {
          add('D7', block, n, `радиус ${n[k]} литералом`, 'radius-токены', lvl); break;
        }
      }
      if (n.type === 'TEXT') {
        if (!n.textStyleId || n.textStyleId === figma.mixed) add('D8', block, n, 'текст без стиля типографики (или смешанный)', 'стиль типографики продукта', lvl);
      }
      if (Array.isArray(n.effects) && n.effects.length && !n.effectStyleId) add('D8', block, n, 'эффект без стиля', 'стиль эффекта', lvl);
    }
  }
}
for (const mm of masters) {
  // внутри экземпляров значения приходят из их мастеров — не проверяем повторно
  const own = [mm, ...mm.findAll(n => true)].filter(n => { let p = n.parent; while (p && p !== mm) { if (p.type === 'INSTANCE') return false; p = p.parent; } return true; });
  checkTokens(own, mode === 'construction' && !inAudit(mm) ? 'мастер' : 'прототип аудита', mode === 'construction' && !inAudit(mm));
}

// ── D9 описания: оба поля, экранирование, первая строка ────────────────
for (const mm of masters) {
  const d = mm.description || '', dm = mm.descriptionMarkdown || '';
  const cyr = mm.findAll(n => CYR.test(n.name) && n.type !== 'TEXT').slice(0, 3);
  for (const n of cyr) add('D10', 'мастер', n, `слой «${n.name}» кириллицей`, 'имена слоёв — латиницей, как в коде (§3.8 п.3)', 'warn');
  if (!d.trim() && !dm.trim()) { add('D9', 'описание', mm, 'описания нет', 'описание у мастера (§3.8 блок 1)', mm.name.startsWith('.') ? 'warn' : 'error'); continue; }
  if (ENT.test(d)) add('D9', 'описание', mm, `description: HTML-сущность «${d.match(ENT)[0]}»`, 'символы как есть: " > < (урок BannerStatus 2026-11-10)');
  if (ENT.test(dm)) add('D9', 'описание', mm, `descriptionMarkdown: HTML-сущность «${dm.match(ENT)[0]}»`, 'символы как есть — проверять оба поля');
  if (mode === 'construction' && !inAudit(mm) && !mm.name.startsWith('.')) {
    const first = (d || dm).split('\n')[0].replace(/[*_#]/g, '').trim();
    if (!/ · \d+\.\d+\.\d+/.test(first)) add('D9', 'описание', mm, `первая строка «${first.slice(0, 50)}» без версии`, '«<Компонент> · <версия>», до релиза «· не опубликовано» (§3.8 блок 1)');
  }
  // слои мастера — латиницей
}

// ── D11 тексты пейджа: устаревшие имена, сущности, запрещённые фразы ───
const texts = page.findAllWithCriteria({ types: ['TEXT'] });
out.inventory.texts = texts.length;
for (const t of texts) {
  if (!t.visible) continue;
  const s = t.characters;
  for (const d of CONFIG.DEPRECATED) if (new RegExp(d.re).test(s)) add('D11', blockOf(t), t, `«${s.slice(0, 70)}»: ${d.why}`, 'действующее имя токена');
  for (const d of CONFIG.FORBIDDEN_PHRASES) if (new RegExp(d.re).test(s) && !/› 8\. /.test(blockOf(t))) add('D12', blockOf(t), t, `«${s.slice(0, 70)}»: ${d.why}`, 'только факт', 'warn');
  if (ENT.test(s)) add('D11', blockOf(t), t, `HTML-сущность в тексте «${s.slice(0, 50)}»`, 'символы как есть');
}

// ── D13 экземпляры: потерянный мастер, TagMarker, тексты примеров ──────
// Все экземпляры, включая вложенные: TagMarker и примеры часто лежат в слотах IslandExample.
const allInsts = page.findAllWithCriteria({ types: ['INSTANCE'] });
const isTop = n => { let p = n.parent; while (p && p.type !== 'PAGE') { if (p.type === 'INSTANCE') return false; p = p.parent; } return true; };
let tagMarkers = 0; const exampleTexts = new Map(); const usage = new Map();
const localMasterIds = new Set(masters.flatMap(m => m.type === 'COMPONENT_SET' ? [m.id, ...m.children.map(c => c.id)] : [m.id]));
for (const i of allInsts) {
  const mc = await i.getMainComponentAsync();
  if (!mc) { if (isTop(i)) add('D13', topOf(i).name.slice(0, 30), i, 'экземпляр без мастера', 'примеры — живые экземпляры мастеров (§3.8 п.3)'); continue; }
  const owner = mc.parent && mc.parent.type === 'COMPONENT_SET' ? mc.parent : mc;
  usage.set(owner.name, (usage.get(owner.name) || 0) + 1);
  if (/TagMarker/.test(owner.name)) tagMarkers++;
  if (localMasterIds.has(owner.id) || /IslandExample/.test(owner.name)) {
    for (const t of i.findAllWithCriteria({ types: ['TEXT'] })) if (t.visible && t.characters.trim()) {
      const k = t.characters.trim().slice(0, 60); exampleTexts.set(k, (exampleTexts.get(k) || 0) + 1);
    }
  }
}
out.inventory.instances = allInsts.length;
out.inventory.usage = [...usage.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => `${k} ×${v}`);
out.inventory.tagMarkers = tagMarkers;
if (!tagMarkers) add('D13', 'анатомия', page, 'нет ни одного TagMarker', 'схема анатомии — номера TagMarker (Kit, Set=Main) поверх компонента (persefona-figma-pages §6.6)', mode === 'audit' ? 'warn' : 'error');
out.inventory.exampleTexts = [...exampleTexts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30).map(([k, v]) => `${v}× ${k}`);

// ── D15 состав и нумерация блоков против таблицы протокола ─────────────
{
  const want = mode === 'audit' ? [0, 1, 2, 3, 4, 5, 6, 7, 8] : [1, 2, 3, 4, 5, 6, 7, 8, 10, 11];
  const scope = mode === 'audit' ? top : top.filter(n => !auditSections.includes(n));
  const nums = [];
  // блок — фрейм «N. Имя» с HeaderSection внутри (Kit §6.6); пронумерованные пункты внутри блоков не считаются
  const isBlock = f => (f.type === 'FRAME' || f.type === 'SECTION') && /^\d{1,2}\. /.test(f.name) &&
    f.children.some(c => c.type === 'INSTANCE' && /^HeaderSection/.test(c.name));
  const names = {};
  for (const sec of scope) for (const f of sec.findAll(isBlock)) { const k = parseInt(f.name, 10); nums.push(k); names[k] = f.name; }
  out.inventory.blockNames = Object.values(names);
  if (mode === 'audit' && names[1] && !/Дерево/i.test(names[1]))
    add('D15', 'блоки', page, `блок 1 — «${names[1]}», а не дерево компонентов; номера сдвинуты`, '§3.1 п.4: 1 — Дерево компонентов, обязателен');
  const have = [...new Set(nums)].sort((a, b) => a - b);
  out.inventory.blocks = have;
  if (have.length) {
    const miss = want.filter(x => !have.includes(x)), extra = have.filter(x => !want.includes(x));
    if (miss.length || extra.length) add('D15', 'блоки', page, `блоки ${have.join(',')}; нет ${miss.join(',') || '—'}, лишние ${extra.join(',') || '—'}`,
      mode === 'audit' ? 'аудит — блоки 0–8 по §3.1 п.4 (1 — дерево компонентов)' : 'сборка — 1–8, 10, 11 по §3.8 п.4; 9 — секция Changelog');
  } else add('D15', 'блоки', page, 'не найдено фреймов блоков «N. Имя»', 'блоки по таблице протокола', 'warn');
}

// ── D16 якоря: ссылка на узел другого пейджа или пропавший узел ──────────
for (const t of texts) {
  if (!t.visible) continue;
  let segs = [];
  try { segs = t.getStyledTextSegments(['hyperlink']); } catch (e) { continue; }
  for (const sg of segs) {
    const h = sg.hyperlink;
    if (!h || h.type !== 'NODE') continue;
    const target = await figma.getNodeByIdAsync(h.value);
    let pg = target; while (pg && pg.type !== 'PAGE') pg = pg.parent;
    if (!target) add('D16', blockOf(t), t, `якорь «${sg.characters.slice(0, 30)}» на несуществующий узел ${h.value}`, 'якорь — на слайд этого пейджа (§3.1 блок 8)');
    // ссылка «Аудит — для истории →» на секцию аудита в Archive — норма (§3.1 п.6, §3.8 п.3)
    else if (pg && pg.id !== page.id && !(/Archive/i.test(pg.name) && / · audit( · \d{4}-\d{2}-\d{2})?$/.test(target.name))) add('D16', blockOf(t), t, `якорь «${sg.characters.slice(0, 30)}» ведёт на пейдж «${pg.name}» (${h.value})`, 'якорь — на слайд этого пейджа (§3.1 блок 8)');
  }
}

// ── D14 темы: режимы переменных на пейдже ─────────────────────────────
const modeUse = new Map();
for (const n of page.findAll(n => n.explicitVariableModes && Object.keys(n.explicitVariableModes).length)) {
  for (const [cid, mid] of Object.entries(n.explicitVariableModes)) modeUse.set(cid + '|' + mid, (modeUse.get(cid + '|' + mid) || 0) + 1);
}
const modesOut = [];
for (const [key, cnt] of modeUse) {
  const [cid, mid] = key.split('|');
  let cname = cid, mname = mid;
  try { const c = await figma.variables.getVariableCollectionByIdAsync(cid); if (c) { cname = c.name; const m = c.modes.find(m => m.modeId === mid); if (m) mname = m.name; } } catch (e) {}
  modesOut.push(`${cname}: ${mname} ×${cnt}`);
}
out.inventory.modes = modesOut;
const darkish = modesOut.some(s => /dark|night|ноч|тёмн/i.test(s));
if (!darkish) add('D14', 'темы', page, 'на пейдже не найдено ни одного узла с ночным режимом', 'две темы режимами переменных (§3.1 п.3, §3.8 п.3)');

// ── тексты мастеров: как держат длинный текст (для суждения) ────────────
out.inventory.masterTexts = [];
for (const mm of masters.filter(m => !inAudit(m) || mode === 'audit').slice(0, 4)) {
  const first = mm.type === 'COMPONENT_SET' ? mm.children[0] : mm;
  for (const t of first.findAllWithCriteria({ types: ['TEXT'] }).slice(0, 6))
    out.inventory.masterTexts.push(`${mm.name} › ${t.name}: autoResize=${t.textAutoResize} trunc=${t.textTruncation} maxLines=${t.maxLines} sizingH=${t.layoutSizingHorizontal}`);
}

out.meta.counts = counts;
out.meta.total = Object.values(counts).reduce((a, b) => a + b, 0);
return out;
