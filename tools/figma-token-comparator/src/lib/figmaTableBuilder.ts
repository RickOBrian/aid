/**
 * Построение визуальной Figma-таблицы по спецификации "Aid Table Style"
 * (Root Table / Header Block / Data Container / Table Header Row / Data Row).
 *
 * Строится вручную через FrameNode + auto-layout — НЕ используется
 * figma.createTable() (нативная table-нода из FigJam, доступность вне
 * FigJam не гарантирована).
 *
 * Один источник данных: buildExportRows() из exporter.ts — та же функция,
 * что готовит строки для CSV/JSON/MD. Эта таблица не хардкодит и не
 * дублирует подготовку строк.
 *
 * Значения геометрии/цвета ниже — точная копия того, что зафиксировано в
 * задаче на построение "Aid Table Style" (Root Table/Header Block/Data
 * Container/Table Header Row/Data Row); импровизаций сверх этого набора нет.
 */

import { EXPORT_COLUMNS, type ExportRow } from "./exporter";

/** Одна строка Figma-таблицы — те же поля, что в CSV/JSON/MD экспорте. */
export type MappingRow = ExportRow;

export interface MappingTableOptions {
  /** Имя/идентификатор библиотеки — если неизвестно, передайте осмысленный плейсхолдер, не хардкодить внутри модуля. */
  libraryName: string;
  /** Человекочитаемый скоуп сканирования ("Весь файл" / "Текущая страница" / "Выделение" и т.п.). */
  scope: string;
  /** Человекочитаемая дата/время печати; по умолчанию — текущий момент. */
  printedAt?: string;
}

/**
 * Очень большие выборки дают нечитаемо высокую таблицу и заметно нагружают
 * документ Figma. Выше этого лимита "Напечатать" рисует только первые N
 * строк и сообщает пользователю, что для полного набора нужно "Скачать".
 * CSV/JSON/MD экспорт этим лимитом не ограничен.
 */
export const MAX_PRINTABLE_ROWS = 300;

// ---------------------------------------------------------------------------
// Цвета — точные значения из спеки
// ---------------------------------------------------------------------------

const COLOR_WHITE: RGB = { r: 1, g: 1, b: 1 };
const COLOR_HEADER_BG: RGB = { r: 246 / 255, g: 246 / 255, b: 249 / 255 }; // #F6F6F9
const COLOR_BORDER: RGB = { r: 224 / 255, g: 224 / 255, b: 224 / 255 }; // #E0E0E0
const COLOR_TITLE_TEXT: RGB = { r: 25 / 255, g: 36 / 255, b: 51 / 255 }; // #192433
const COLOR_HEADER_CELL_TEXT: RGB = { r: 0, g: 0, b: 0 }; // #000000
const COLOR_BODY_TEXT: RGB = { r: 0, g: 0, b: 0 };

// ---------------------------------------------------------------------------
// Геометрия — точные значения из спеки
// ---------------------------------------------------------------------------

const ROOT_MIN_WIDTH = 1184;
const ROOT_PADDING = 40;
const ROOT_CORNER_RADIUS = 40;
const ROOT_ITEM_SPACING = 24;

const HEADER_BLOCK_PADDING = 36;
const HEADER_BLOCK_CORNER_RADIUS = 20;
const HEADER_BLOCK_ITEM_SPACING = 8;

const DATA_CONTAINER_CORNER_RADIUS = 20;

const HEADER_ROW_HEIGHT = 52;
const HEADER_ROW_PADDING_V = 12;
const HEADER_ROW_PADDING_H = 16;

const DATA_ROW_MIN_HEIGHT = 40;
const DATA_ROW_PADDING_V = 10;
const DATA_ROW_PADDING_H = 16;

/**
 * Gap между колонками. Явно задан в спеке только для Data Row ("gap 12") —
 * для Table Header Row используем то же значение, иначе заголовки не будут
 * совпадать по X с ячейками данных (колонки должны быть "согласованы по
 * всем строкам той же колонки", а это невозможно при разных gap).
 */
const ROW_GAP = 12;

/** Ширина колонок (px) — читаемая раскладка полей ExportRow. Таблица шире 1184px допустима по спеке. */
const COLUMN_WIDTHS: Record<keyof ExportRow, number> = {
  layer: 160,
  nodePath: 220,
  before: 160,
  beforeDay: 130,
  beforeNight: 130,
  binding: 90,
  target: 180,
  targetDay: 130,
  targetNight: 130,
  decision: 140,
  proposedMode: 100,
  proposedValueForMode: 150,
  comment: 220,
  timestamp: 160,
};

function computeRowContentWidth(): number {
  const columnsWidth = EXPORT_COLUMNS.reduce((sum, [key]) => sum + COLUMN_WIDTHS[key], 0);
  const gaps = ROW_GAP * (EXPORT_COLUMNS.length - 1);
  return columnsWidth + gaps + DATA_ROW_PADDING_H * 2;
}

// ---------------------------------------------------------------------------
// Шрифты — Google Sans с fallback на Inter/Roboto, без исключений наружу
// ---------------------------------------------------------------------------

type FontWeight = "bold" | "medium" | "regular";

const FONT_FALLBACKS: Record<FontWeight, FontName[]> = {
  bold: [
    { family: "Google Sans", style: "Bold" },
    { family: "Inter", style: "Bold" },
    { family: "Roboto", style: "Bold" },
  ],
  medium: [
    { family: "Google Sans", style: "Medium" },
    { family: "Inter", style: "Medium" },
    { family: "Roboto", style: "Medium" },
  ],
  regular: [
    { family: "Google Sans", style: "Regular" },
    { family: "Inter", style: "Regular" },
    { family: "Roboto", style: "Regular" },
  ],
};

const resolvedFontCache = new Map<FontWeight, FontName>();

/** Пробует шрифты по приоритету, логирует предупреждение при fallback. Никогда не бросает исключение. */
async function resolveFont(weight: FontWeight): Promise<FontName> {
  const cached = resolvedFontCache.get(weight);
  if (cached) return cached;

  const candidates = FONT_FALLBACKS[weight];
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    try {
      await figma.loadFontAsync(candidate);
      if (i > 0) {
        console.warn(
          `[figmaTableBuilder] Шрифт "${candidates[0].family} ${candidates[0].style}" недоступен, использован fallback "${candidate.family} ${candidate.style}".`
        );
      }
      resolvedFontCache.set(weight, candidate);
      return candidate;
    } catch {
      // пробуем следующий кандидат
    }
  }

  // Последний рубеж — Inter Regular почти всегда доступен в Figma.
  const last: FontName = { family: "Inter", style: "Regular" };
  console.warn(
    `[figmaTableBuilder] Не удалось загрузить ни один шрифт для веса "${weight}" — использован "${last.family} ${last.style}".`
  );
  resolvedFontCache.set(weight, last);
  return last;
}

// ---------------------------------------------------------------------------
// Форматирование значений ячеек
// ---------------------------------------------------------------------------

const HEX_IN_TEXT = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;

/** Uppercase для hex-подстрок (#RRGGBB), как требует формат значений из спеки. Пустая ячейка — em dash для читаемости (не влияет на CSV/JSON/MD). */
function formatCellText(value: string): string {
  if (!value) return "—";
  return value.replace(HEX_IN_TEXT, (match) => match.toUpperCase());
}

// ---------------------------------------------------------------------------
// Auto-layout sizing helpers
// ---------------------------------------------------------------------------

/**
 * VERTICAL auto-layout фрейм вне родителя: FIXED ширина + HUG высота.
 * layoutSizing* здесь не трогаем — они только для дочерних auto-layout.
 * resize() сбрасывает HUG → пере-применяем primaryAxisSizingMode после.
 */
function applyStandaloneVerticalHugFixedWidth(frame: FrameNode, width: number): void {
  frame.layoutMode = "VERTICAL";
  frame.counterAxisSizingMode = "FIXED";
  frame.primaryAxisSizingMode = "AUTO";
  frame.resize(Math.max(width, 1), frame.height);
  frame.primaryAxisSizingMode = "AUTO";
}

/** Дочерний элемент vertical auto-layout родителя: FILL × HUG. Вызывать только после appendChild. */
function applyChildFillHug(node: FrameNode | TextNode): void {
  if (!node.parent || !("layoutMode" in node.parent) || node.parent.layoutMode === "NONE") {
    return;
  }
  node.layoutSizingHorizontal = "FILL";
  node.layoutSizingVertical = "HUG";
}

// ---------------------------------------------------------------------------
// Низкоуровневые builder-функции нод
// ---------------------------------------------------------------------------

async function createCellText(
  text: string,
  font: FontName,
  fontSize: number,
  color: RGB,
  width: number
): Promise<TextNode> {
  await figma.loadFontAsync(font);
  const node = figma.createText();
  node.name = "Cell";
  node.fontName = font;
  node.fontSize = fontSize;
  node.fills = [{ type: "SOLID", color }];
  node.textAlignHorizontal = "LEFT";
  node.textAutoResize = "HEIGHT";
  node.characters = text;
  node.resize(Math.max(width, 1), node.height);
  return node;
}

/** Title/Subtitle в Header Block — фиксированная ширина до append, иначе FILL даёт 0px. */
async function createHeaderText(
  name: string,
  text: string,
  font: FontName,
  fontSize: number,
  color: RGB,
  width: number,
  lineHeight?: { value: number; unit: "PIXELS" | "PERCENT" }
): Promise<TextNode> {
  await figma.loadFontAsync(font);
  const node = figma.createText();
  node.name = name;
  node.fontName = font;
  node.fontSize = fontSize;
  node.fills = [{ type: "SOLID", color }];
  node.textAlignHorizontal = "LEFT";
  node.textAutoResize = "HEIGHT";
  if (lineHeight) node.lineHeight = lineHeight;
  node.characters = text;
  node.resize(Math.max(width, 1), node.height);
  return node;
}

async function buildHeaderBlock(
  options: MappingTableOptions,
  rowCount: number,
  boldFont: FontName,
  mediumFont: FontName,
  innerWidth: number
): Promise<FrameNode> {
  const block = figma.createFrame();
  block.name = "Header Block";
  block.layoutMode = "VERTICAL";
  block.itemSpacing = HEADER_BLOCK_ITEM_SPACING;
  block.paddingTop = HEADER_BLOCK_PADDING;
  block.paddingBottom = HEADER_BLOCK_PADDING;
  block.paddingLeft = HEADER_BLOCK_PADDING;
  block.paddingRight = HEADER_BLOCK_PADDING;
  block.cornerRadius = HEADER_BLOCK_CORNER_RADIUS;
  block.fills = [{ type: "SOLID", color: COLOR_HEADER_BG }];

  const textWidth = Math.max(innerWidth - HEADER_BLOCK_PADDING * 2, 1);
  const printedAt = options.printedAt ?? new Date().toLocaleString("ru-RU");

  const title = await createHeaderText(
    "Title",
    `🎨 Colors comparison — ${options.scope}`,
    boldFont,
    40,
    COLOR_TITLE_TEXT,
    textWidth,
    { value: 48, unit: "PIXELS" }
  );
  block.appendChild(title);
  applyChildFillHug(title);

  const subtitle = await createHeaderText(
    "Subtitle",
    `Library: ${options.libraryName} · Scope: ${options.scope} · ${printedAt} · Rows: ${rowCount}`,
    mediumFont,
    20,
    COLOR_TITLE_TEXT,
    textWidth
  );
  block.appendChild(subtitle);
  applyChildFillHug(subtitle);

  applyStandaloneVerticalHugFixedWidth(block, innerWidth);
  return block;
}

async function buildTableHeaderRow(font: FontName): Promise<FrameNode> {
  const row = figma.createFrame();
  row.name = "Table Header Row";
  row.layoutMode = "HORIZONTAL";
  row.itemSpacing = ROW_GAP;
  row.paddingTop = HEADER_ROW_PADDING_V;
  row.paddingBottom = HEADER_ROW_PADDING_V;
  row.paddingLeft = HEADER_ROW_PADDING_H;
  row.paddingRight = HEADER_ROW_PADDING_H;
  row.counterAxisAlignItems = "CENTER";
  row.fills = [{ type: "SOLID", color: COLOR_HEADER_BG }];
  row.strokes = [{ type: "SOLID", color: COLOR_BORDER }];
  row.strokeAlign = "INSIDE";
  row.strokeTopWeight = 0;
  row.strokeLeftWeight = 0;
  row.strokeRightWeight = 0;
  row.strokeBottomWeight = 1;

  for (const [key, label] of EXPORT_COLUMNS) {
    const cell = await createCellText(label, font, 14, COLOR_HEADER_CELL_TEXT, COLUMN_WIDTHS[key]);
    row.appendChild(cell);
    cell.layoutSizingHorizontal = "FIXED";
    cell.layoutSizingVertical = "HUG";
  }

  row.primaryAxisSizingMode = "FIXED";
  row.counterAxisSizingMode = "FIXED";
  row.resize(computeRowContentWidth(), HEADER_ROW_HEIGHT);
  return row;
}

async function buildDataRow(row: MappingRow, font: FontName): Promise<FrameNode> {
  const rowFrame = figma.createFrame();
  rowFrame.name = "Data Row";
  rowFrame.layoutMode = "HORIZONTAL";
  rowFrame.itemSpacing = ROW_GAP;
  rowFrame.paddingTop = DATA_ROW_PADDING_V;
  rowFrame.paddingBottom = DATA_ROW_PADDING_V;
  rowFrame.paddingLeft = DATA_ROW_PADDING_H;
  rowFrame.paddingRight = DATA_ROW_PADDING_H;
  rowFrame.counterAxisAlignItems = "MIN";
  rowFrame.fills = [{ type: "SOLID", color: COLOR_WHITE }];
  rowFrame.strokes = [{ type: "SOLID", color: COLOR_BORDER }];
  rowFrame.strokeAlign = "INSIDE";
  rowFrame.strokeTopWeight = 0;
  rowFrame.strokeLeftWeight = 0;
  rowFrame.strokeRightWeight = 0;
  rowFrame.strokeBottomWeight = 1;
  rowFrame.minHeight = DATA_ROW_MIN_HEIGHT;

  for (const [key] of EXPORT_COLUMNS) {
    const cell = await createCellText(formatCellText(row[key]), font, 14, COLOR_BODY_TEXT, COLUMN_WIDTHS[key]);
    rowFrame.appendChild(cell);
    cell.layoutSizingHorizontal = "FIXED";
    cell.layoutSizingVertical = "HUG";
  }

  rowFrame.primaryAxisSizingMode = "FIXED";
  rowFrame.counterAxisSizingMode = "AUTO";
  rowFrame.resize(computeRowContentWidth(), Math.max(rowFrame.height, DATA_ROW_MIN_HEIGHT));
  return rowFrame;
}

async function buildDataContainer(
  rows: MappingRow[],
  regularFont: FontName,
  mediumFont: FontName,
  innerWidth: number,
  onProgress?: (completed: number, total: number) => void
): Promise<FrameNode> {
  const container = figma.createFrame();
  container.name = "Data Container";
  container.layoutMode = "VERTICAL";
  container.itemSpacing = 0;
  container.paddingTop = 0;
  container.paddingBottom = 0;
  container.paddingLeft = 0;
  container.paddingRight = 0;
  container.cornerRadius = DATA_CONTAINER_CORNER_RADIUS;
  container.fills = [];
  container.strokes = [{ type: "SOLID", color: COLOR_BORDER }];
  container.strokeAlign = "INSIDE";
  container.strokeTopWeight = 1;
  container.strokeRightWeight = 1;
  container.strokeBottomWeight = 1;
  container.strokeLeftWeight = 1;
  container.clipsContent = true;

  const headerRow = await buildTableHeaderRow(mediumFont);
  container.appendChild(headerRow);
  headerRow.layoutSizingHorizontal = "FILL";
  headerRow.layoutSizingVertical = "FIXED";

  for (let i = 0; i < rows.length; i++) {
    const dataRow = await buildDataRow(rows[i], regularFont);
    container.appendChild(dataRow);
    dataRow.layoutSizingHorizontal = "FILL";
    dataRow.layoutSizingVertical = "HUG";
    onProgress?.(i + 1, rows.length);
  }

  applyStandaloneVerticalHugFixedWidth(container, innerWidth);
  return container;
}

// ---------------------------------------------------------------------------
// Публичный API
// ---------------------------------------------------------------------------

/**
 * Строит Root Table (со вложенными Header Block + Data Container) на
 * переданной странице и возвращает готовый FrameNode. Позиционирование
 * (x/y относительно других таблиц на странице) — на вызывающей стороне
 * (code.ts), этот модуль отвечает только за структуру и стили.
 */
export async function buildMappingTable(
  page: PageNode,
  rows: MappingRow[],
  options: MappingTableOptions,
  /** Вызывается после каждой построенной Data Row — (сколько готово, всего). Позволяет вызывающей стороне показать процент в UI. */
  onProgress?: (completed: number, total: number) => void
): Promise<FrameNode> {
  const [boldFont, mediumFont, regularFont] = await Promise.all([
    resolveFont("bold"),
    resolveFont("medium"),
    resolveFont("regular"),
  ]);

  const rowContentWidth = computeRowContentWidth();
  const rootWidth = Math.max(ROOT_MIN_WIDTH, rowContentWidth + ROOT_PADDING * 2);
  const innerWidth = rootWidth - ROOT_PADDING * 2;

  const root = figma.createFrame();
  root.name = `Colors comparison — ${options.scope}`;
  root.layoutMode = "VERTICAL";
  root.itemSpacing = ROOT_ITEM_SPACING;
  root.paddingTop = ROOT_PADDING;
  root.paddingBottom = ROOT_PADDING;
  root.paddingLeft = ROOT_PADDING;
  root.paddingRight = ROOT_PADDING;
  root.cornerRadius = ROOT_CORNER_RADIUS;
  root.fills = [{ type: "SOLID", color: COLOR_WHITE }];
  root.clipsContent = true;

  const headerBlock = await buildHeaderBlock(options, rows.length, boldFont, mediumFont, innerWidth);
  const dataContainer = await buildDataContainer(rows, regularFont, mediumFont, innerWidth, onProgress);

  root.appendChild(headerBlock);
  applyChildFillHug(headerBlock);

  root.appendChild(dataContainer);
  applyChildFillHug(dataContainer);

  applyStandaloneVerticalHugFixedWidth(root, rootWidth);

  page.appendChild(root);

  return root;
}
