// Раскладка страницы аудита в Figma: ряды и колонки — автолэйаут (Hug),
// секции подгоняются под содержимое и встают столбиком.
// Запуск — тело для use_figma (файл копии). Идемпотентно: уже собранное
// не пересобирает, только подгоняет секции.
// Порядок см. README «Раскладка страницы».

const PAGE = '5011:3071';
const COL_X = [60, 530, 1000, 1470]; // было · стало+сдвиги · натянутость · находки (для ещё не собранных рядов)
const GAP_COL = 80, GAP_LABEL = 12, GAP_TITLE = 15, GAP_ROWS = 80, PAD = 60, GAP_SECTIONS = 100;

const isOverlay = n => /^[⚠◐]/.test(n.name);
const al = (f, mode, gap) => {
  f.layoutMode = mode; f.itemSpacing = gap;
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO';
  f.counterAxisAlignItems = 'MIN'; f.fills = []; f.clipsContent = false;
};
const frame = (name, mode, gap) => { const f = figma.createFrame(); f.name = name; al(f, mode, gap); return f; };

// ряд без автолэйаута → заголовок + тело из четырёх колонок
function buildRow(row, items, title) {
  const cols = COL_X.map(() => []);
  for (const n of items) {
    const i = COL_X.reduce((b, x, k) => Math.abs(n.x - x) < Math.abs(n.x - COL_X[b]) ? k : b, 0);
    cols[i].push(n);
  }
  const body = frame('тело', 'HORIZONTAL', GAP_COL);
  cols.forEach((list, i) => {
    if (!list.length) return;
    list.sort((a, b) => (a.type === 'TEXT' ? 0 : isOverlay(a) ? 2 : 1) - (b.type === 'TEXT' ? 0 : isOverlay(b) ? 2 : 1) || a.y - b.y);
    if (list.length === 1 && list[0].type === 'FRAME' && list[0].layoutMode === 'VERTICAL') { // колонка находок без подписи
      body.appendChild(list[0]);
      return;
    }
    const col = frame('колонка · ' + (list[0].type === 'TEXT' ? list[0].characters : list[0].name).slice(0, 30), 'VERTICAL', GAP_LABEL);
    body.appendChild(col);
    let screen = null;
    for (const n of list) {
      col.appendChild(n);
      if (isOverlay(n)) { n.layoutPositioning = 'ABSOLUTE'; n.x = screen ? screen.x : 0; n.y = screen ? screen.y : 0; }
      else if (n.type !== 'TEXT') screen = n;
    }
  });
  const kids = [...row.children];
  al(row, 'VERTICAL', GAP_TITLE);
  row.paddingLeft = row.paddingRight = row.paddingTop = row.paddingBottom = 0;
  if (title) row.insertChild(0, title);
  row.appendChild(body);
  for (const k of kids) if (!k.removed && k.parent === row && k !== title && k !== body) k.remove();
}

// колонки находок — Hug по высоте
function hugFindings(root) {
  for (const f of root.findAll(n => n.type === 'FRAME' && ['Находки', 'На аудите', 'Согласовано'].includes(n.name) && n.layoutMode === 'VERTICAL')) {
    f.layoutSizingVertical = 'HUG';
  }
  // шапка карточки: бейдж переносится, а не вылезает за карточку
  for (const h of root.findAll(n => n.type === 'FRAME' && n.name === 'head' && n.layoutMode === 'HORIZONTAL')) {
    h.layoutSizingHorizontal = 'FILL'; h.layoutWrap = 'WRAP'; h.counterAxisSpacing = 6;
  }
}

const page = await figma.getNodeByIdAsync(PAGE);
const report = [];
for (const sec of page.children.filter(n => n.type === 'SECTION' && n.name.startsWith('Аудит'))) { // прототипы и прочее — не трогаем
  let canvas = sec.children.find(n => n.name === 'Полотно');
  if (!canvas) {
    const head = sec.children.find(n => n.name === 'Шапка');
    const rows = sec.children.filter(n => n.type === 'FRAME' && /^Ряд /.test(n.name));
    const loose = sec.children.filter(n => n !== head && !rows.includes(n));
    if (loose.length) { // проба: экраны лежат прямо в секции → собрать ряд
      const r = frame('Ряд · проба', 'VERTICAL', GAP_TITLE);
      sec.appendChild(r);
      buildRow(r, loose, null); // колонки — по координатам в секции, до переноса
      rows.unshift(r);
    }
    for (const r of rows) if (r.layoutMode === 'NONE') {
      const kids = [...r.children];
      const title = kids.find(n => n.type === 'TEXT' && Math.round(n.y) === 0);
      buildRow(r, kids.filter(n => n !== title), title);
    }
    canvas = frame('Полотно', 'VERTICAL', GAP_ROWS);
    canvas.paddingLeft = canvas.paddingRight = canvas.paddingTop = canvas.paddingBottom = PAD;
    sec.appendChild(canvas);
    if (head) canvas.appendChild(head);
    for (const r of rows) canvas.appendChild(r);
  }
  hugFindings(canvas);
  canvas.x = 0; canvas.y = 0;
  report.push(sec);
}
// секции — по размеру полотна, столбиком
let y = report.length ? report[0].y : 0;
for (const sec of report.sort((a, b) => a.y - b.y)) {
  const c = sec.children.find(n => n.name === 'Полотно');
  sec.resizeWithoutConstraints(c.width, c.height);
  sec.y = y; y += c.height + GAP_SECTIONS;
}
return report.map(s => `${s.name} ${s.id} ${Math.round(s.width)}×${Math.round(s.height)} y${Math.round(s.y)}`);
