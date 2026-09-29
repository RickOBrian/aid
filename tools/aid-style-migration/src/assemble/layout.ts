/**
 * Раскладка секции сборки: строка — экран, колонка — вариант.
 * Колонки: было · светлая, было · тёмная, стало · светлая, стало · тёмная.
 */

export const COLUMNS = ["Было", "Было · тёмная", "Стало", "Стало · тёмная"] as const;

export interface Size {
  width: number;
  height: number;
}

export interface LayoutOptions {
  padding: number;
  /** Место над первой строкой под заголовки колонок. */
  headerHeight: number;
  /** Место над каждой строкой под её подпись. */
  labelHeight: number;
  columnGap: number;
  rowGap: number;
}

export const DEFAULT_LAYOUT: LayoutOptions = {
  padding: 120,
  headerHeight: 120,
  labelHeight: 56,
  columnGap: 80,
  rowGap: 160,
};

export interface Layout {
  columnX: number[];
  /** y подписи строки и y экранов строки. */
  rows: Array<{ labelY: number; y: number; height: number }>;
  width: number;
  height: number;
}

/**
 * Ширина колонки — самый широкий экран в ней; пустая колонка берёт ширину
 * первой, чтобы «Стало · тёмная» заранее имела место.
 */
export function layoutRows(rows: Array<Array<Size | null>>, options: LayoutOptions = DEFAULT_LAYOUT): Layout {
  const columnCount = COLUMNS.length;
  const widths = Array.from({ length: columnCount }, (_, c) =>
    Math.max(0, ...rows.map((r) => r[c]?.width ?? 0)),
  );
  const fallback = widths[0] || 390;
  const columnWidths = widths.map((w) => w || fallback);

  const columnX: number[] = [];
  let x = options.padding;
  for (const w of columnWidths) {
    columnX.push(x);
    x += w + options.columnGap;
  }
  const width = x - options.columnGap + options.padding;

  let y = options.padding + options.headerHeight;
  const out: Layout["rows"] = [];
  for (const r of rows) {
    const height = Math.max(0, ...r.map((cell) => cell?.height ?? 0));
    out.push({ labelY: y, y: y + options.labelHeight, height });
    y += options.labelHeight + height + options.rowGap;
  }
  const height = (rows.length ? y - options.rowGap : y) + options.padding;
  return { columnX, rows: out, width, height };
}
