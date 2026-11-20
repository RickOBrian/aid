// Сборка секции «Не заменено · <тип>» по данным unreplaced-scan.js (pluginData 'pfa' на figma.root).
// Параметры: KIND (font|fill|grad|stroke|effect), IDX (порядок секции справа от корня), ROOT_ID (скан), PAGE_ID (страница корня).
// Оформление — клоны из секции «Шрифты вне стилей» (Switch Audit 6954:4772, Kit Persefona). Повторять, пока не вернётся {done:true}.
// Скриншот — экспорт макета PNG (кэш хэшей в 'img'), обрезка CROP около места, красная плашка 30 % поверх (пометка ревью, не токен).
const NS = 'pfa', BUDGET = 22000, R = figma.root;
const getS = k => { const n = +(R.getSharedPluginData(NS, k + '#') || 0); let s = ''; for (let i = 0; i < n; i++) s += R.getSharedPluginData(NS, k + '#' + i); return s; };
const putS = (k, s) => { const old = +(R.getSharedPluginData(NS, k + '#') || 0); for (let i = 0; i < old; i++) R.setSharedPluginData(NS, k + '#' + i, ''); const parts = s.match(/[\s\S]{1,90000}/g) || []; parts.forEach((p, i) => R.setSharedPluginData(NS, k + '#' + i, p)); R.setSharedPluginData(NS, k + '#', String(parts.length)); };
const TITLE = { font: 'Типографика', fill: 'Заливки', grad: 'Градиенты', stroke: 'Обводки', effect: 'Эффекты' };
const UNIT = { font: 'слоёв', fill: 'заливок', grad: 'градиентов', stroke: 'обводок', effect: 'слоёв с эффектами' };
const agg = JSON.parse(getS('agg'));
const groups = Object.values(agg.g).filter(g => g.k === KIND).sort((a, b) => b.n - a.n);
const total = groups.reduce((s, g) => s + g.n, 0);
const sa = await figma.getNodeByIdAsync('6058:94733'); await sa.loadAsync();
const page = await figma.getNodeByIdAsync(PAGE_ID); await figma.setCurrentPageAsync(page);
const root = await figma.getNodeByIdAsync(ROOT_ID);
const tSec = await figma.getNodeByIdAsync('6954:4772'), tHeader = await figma.getNodeByIdAsync('6954:4774'), tHead = await figma.getNodeByIdAsync('6954:5041'), tRow = await figma.getNodeByIdAsync('6954:5061');
const loaded = new Set();
const loadFonts = async n => { for (const t of n.findAll(x => x.type === 'TEXT')) for (const s of t.getStyledTextSegments(['fontName'])) { const k = s.fontName.family + '|' + s.fontName.style; if (!loaded.has(k)) { await figma.loadFontAsync(s.fontName); loaded.add(k); } } };
const setText = (t, s) => { t.characters = s; };
await loadFonts(tHeader); await loadFonts(tHead); await loadFonts(tRow);
const st = JSON.parse(getS('bst') || '{}');
let S = st[KIND];
const created = [];
if (!S) {
  const sec = figma.createSection();
  page.appendChild(sec);
  sec.name = 'Не заменено · ' + TITLE[KIND];
  sec.x = root.x + root.width + 400 + IDX * 1544; sec.y = root.y;
  sec.fills = JSON.parse(JSON.stringify(tSec.fills)); sec.strokes = JSON.parse(JSON.stringify(tSec.strokes));
  const list = figma.createAutoLayout('VERTICAL', { name: 'List', itemSpacing: 24 });
  sec.appendChild(list); list.fills = []; list.x = 64; list.y = 64;
  list.counterAxisSizingMode = 'FIXED'; list.resize(1216, 100); list.primaryAxisSizingMode = 'AUTO';
  const hp = tHeader.clone(); list.appendChild(hp); hp.layoutSizingHorizontal = 'FILL';
  await loadFonts(hp);
  const T = n => hp.findOne(x => x.type === 'TEXT' && x.name === n);
  setText(T('Title'), 'Не заменено · ' + TITLE[KIND]);
  setText(T('Subtitle'), 'Секция «Pre-final for Style Switch» (стр. «Order Flow »), замер 2026-11-19 после прогонов 18–19.11: что осталось не на токенах и стилях библиотеки Rider. ' + total + ' ' + UNIT[KIND] + ', ' + groups.length + ' видов. Критерии — как в замере покрытия (89,8 %): скрытые слои, status bar, клавиатура, карта, логотипы и иллюстрации не считаются.');
  setText(T('Contents Title'), 'Как читать');
  setText(T('Contents Items'), 'Строка — один вид значения. Скриншот — один пример, красная плашка — где лежит значение.\nСправа — ссылки на слои-примеры (до 12 макетов), счёт по подсекциям Pre-final.\nБейдж — откуда значение: без токена, старая переменная или старый стиль.');
  const badges = hp.findAll(x => x.type === 'TEXT' && x.name === 'Text');
  if (badges[1]) setText(badges[1], 'Rider · Pre-final');
  const th = tHead.clone(); list.appendChild(th); th.layoutSizingHorizontal = 'FILL';
  await loadFonts(th);
  const ths = th.findAll(x => x.type === 'TEXT');
  setText(ths[1], KIND === 'font' ? 'ШРИФТ' : KIND === 'effect' ? 'ЭФФЕКТ' : 'ЗНАЧЕНИЕ');
  S = st[KIND] = { sec: sec.id, list: list.id, i: 0 };
  putS('bst', JSON.stringify(st));
  created.push(sec.id);
}
const sec = await figma.getNodeByIdAsync(S.sec), list = await figma.getNodeByIdAsync(S.list);
const img = JSON.parse(getS('img') || '{}');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const cut = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s;
// подпись доски: текст прямо в секции или фрейм «Подпись · …», «Переход · …», «Условие …»
const notes = {};
const isNote = async sid => { if (!(sid in notes)) { const n = await figma.getNodeByIdAsync(sid); notes[sid] = !n || n.type === 'TEXT' || /^(Подпись|Переход|Условие)/.test(n.name); } return notes[sid]; };
const linkTarget = async id => { let t = await figma.getNodeByIdAsync(id); while (t && t.parent && t.parent.type !== 'PAGE' && (t.type === 'TEXT' || t.id.startsWith('I'))) t = t.parent; return t; };
const t0 = Date.now(); let errs = [];
while (S.i < groups.length && Date.now() - t0 < BUDGET) {
  const g = groups[S.i];
  let row = null;
  try {
    const parts = g.s.split(' · ');
    let code, desc, badge;
    const vars = Object.entries(g.v).sort((a, b) => b[1] - a[1]).map(e => e[0] + ' (×' + e[1] + ')').join(', ');
    if (KIND === 'font') {
      code = parts[0];
      const sty = parts.slice(1).join(' · ');
      badge = /стиль /.test(sty) ? 'старый стиль' : /смешанн/.test(g.s) ? 'смешанный' : 'без стиля';
      desc = (sty ? sty.replace(/^стиль /, 'Стиль: ') + '. ' : 'Стиля нет. ') + 'Межстрочный / трекинг: ' + vars + '.';
    } else if (KIND === 'effect') {
      const m = g.s.match(/^стиль (.+?) · (.*)$/);
      code = m ? m[2] : g.s; badge = m ? 'старый стиль' : 'без стиля';
      desc = m ? 'Стиль: ' + m[1] + '.' : 'Стиля нет — эффект задан вручную.';
    } else {
      const src = parts[parts.length - 1];
      code = parts.length > 2 ? parts.slice(0, -1).join(' · ') : g.s;
      badge = /^переменная/.test(src) ? 'старая переменная' : /^стиль/.test(src) ? 'старый стиль' : /смешанн/.test(g.s) ? 'смешанная' : 'без токена';
      desc = (parts.length > 2 ? src.replace(/^переменная /, 'Переменная: ').replace(/^стиль /, 'Стиль: ').replace(/^без токена$/, 'Без токена — значение задано вручную') + '.' : '') + (vars ? ' ' + vars.replace(/толщина /g, 'толщина ') + '.' : '');
    }
    // пример для скриншота: макет не шире 520, место внутри кадра
    const ok = e => { const s = agg.scr[e[1]]; return s && s[1] <= 520 && e[2] >= 0 && e[3] >= 0 && e[2] + e[4] <= s[1] + 1 && e[3] + e[5] <= s[2] + 1; };
    let ex = null;
    for (const e of g.ex) if (ok(e) && !(await isNote(e[1]))) { ex = e; break; }
    if (!ex) ex = g.ex.find(ok) || g.ex[0];
    let nNote = 0; for (const [s, c] of Object.entries(g.sc)) if (await isNote(s)) nNote += c;
    if (nNote === g.n) badge = 'подпись доски';
    if (nNote && nNote < g.n) desc += ' Из них в подписях доски: ' + nNote + '.';
    const [nid, sid, x, y, w, h] = ex; const [sname, sw, sh, ssec] = agg.scr[sid];
    row = tRow.clone(); list.appendChild(row); row.layoutSizingHorizontal = 'FILL';
    await loadFonts(row);
    row.name = code.slice(0, 80);
    const [shot, cell, where] = row.children;
    const [pic, mark] = shot.children;
    // скриншот
    const scr = await figma.getNodeByIdAsync(sid);
    const scale = Math.min(2, 3000 / Math.max(sw, sh, 1));
    const key = sid + '@' + scale.toFixed(3);
    if (!img[key]) { const bytes = await scr.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: scale } }); img[key] = figma.createImage(bytes).hash; putS('img', JSON.stringify(img)); }
    const ww = sw <= 520 ? sw : Math.min(sw, Math.max(390, w * 1.6));
    const k = 380 / ww; const wh = Math.min(sh, 480 / k);
    const wx = clamp(x + w / 2 - ww / 2, 0, Math.max(0, sw - ww)), wy = clamp(y + h / 2 - wh / 2, 0, Math.max(0, sh - wh));
    const H = Math.max(40, Math.round(wh * k));
    shot.resizeWithoutConstraints(380, H); pic.resizeWithoutConstraints(380, H); pic.x = 0; pic.y = 0;
    pic.name = 'Макет «' + cut(sname, 60) + '»';
    pic.fills = [{ type: 'IMAGE', imageHash: img[key], scaleMode: 'CROP', imageTransform: [[ww / sw, 0, wx / sw], [0, wh / sh, wy / sh]] }];
    const mw = Math.max(8, w * k), mh = Math.max(8, h * k);
    mark.resizeWithoutConstraints(mw, mh); mark.x = (x - wx) * k + (w * k - mw) / 2; mark.y = (y - wy) * k + (h * k - mh) / 2;
    mark.name = 'Где значение';
    // значение
    const ct = cell.findAll(t => t.type === 'TEXT');
    setText(ct[0], badge);
    setText(ct[1], '×' + g.n + ' · макетов ' + Object.keys(g.sc).length);
    setText(ct[2], code);
    setText(ct[3], desc.trim());
    // где используется: по подсекциям Pre-final, ссылки на слои-примеры
    const bySec = {};
    for (const [s, c] of Object.entries(g.sc)) { const info = agg.scr[s]; const sn = info && info[3] ? info[3] : 'вне подсекций'; const b = bySec[sn] || (bySec[sn] = { n: 0, m: 0, ex: [] }); b.n += c; b.m++; }
    for (const e of g.ex) { const info = agg.scr[e[1]]; const sn = info && info[3] ? info[3] : 'вне подсекций'; bySec[sn].ex.push(e); }
    let txt = 'Скриншот: «' + cut(sname, 60) + '»' + (ssec ? ' (' + ssec + ')' : '');
    const links = [];
    for (const [sn, b] of Object.entries(bySec).sort((a, c) => c[1].n - a[1].n)) {
      txt += '\n' + sn + ' · ×' + b.n + ', макетов ' + b.m;
      for (const e of b.ex) { const t = await linkTarget(e[0]); const label = '→ «' + cut(agg.scr[e[1]][0], 60) + '»' + (t && t.id !== e[1] && t.type !== 'SECTION' ? ' · ' + cut(t.name, 40) : ''); txt += '\n'; links.push([txt.length, txt.length + label.length, t ? t.id : e[1]]); txt += label; }
    }
    const extra = Object.keys(g.sc).length - g.ex.length;
    if (extra > 0) txt += '\n… ещё ' + extra + ' макетов без ссылки';
    const wt = where.findOne(t => t.type === 'TEXT');
    setText(wt, txt);
    for (const [a, b, id] of links) { try { wt.setRangeHyperlink(a, b, { type: 'NODE', value: id }); } catch (e) { errs.push('link ' + id + ': ' + e.message); } }
    created.push(row.id);
  } catch (e) { errs.push(g.s.slice(0, 60) + ': ' + e.message); if (row) row.remove(); }
  S.i++;
  putS('bst', JSON.stringify(st));
}
sec.resizeWithoutConstraints(1344, Math.round(list.height + 128));
if (S.i < groups.length) return { kind: KIND, sec: S.sec, done: false, i: S.i, of: groups.length, errs, created };
return { kind: KIND, sec: S.sec, done: true, rows: groups.length, total, h: Math.round(sec.height), errs, created };
