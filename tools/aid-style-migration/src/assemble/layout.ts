/**
 * Раскладка секции сборки — плитки по сетке с переносом.
 *
 * Плитка — один экран: подпись и варианты рядом (было, было · тёмная; на
 * этапе перевода добавятся «стало»). Плитки идут слева направо и
 * переносятся так, чтобы секция была примерно в пропорции экрана, а не
 * уходила одной колонкой вниз (замечание Principal Designer, 2026-09-29:
 * 36 экранов подряд уходили за скролл).
 */

export interface Size {
  width: number;
  height: number;
}

export interface LayoutOptions {
  padding: number;
  /** Над ячейками плитки: имя экрана и подписи вариантов. */
  labelHeight: number;
  cellGap: number;
  tileGapX: number;
  tileGapY: number;
  /** Целевое отношение ширины секции к высоте. */
  aspect: number;
}

export const DEFAULT_LAYOUT: LayoutOptions = {
  padding: 160,
  labelHeight: 96,
  cellGap: 40,
  tileGapX: 200,
  tileGapY: 240,
  aspect: 1.6,
};

export interface TileLayout {
  x: number;
  y: number;
  /** x ячеек плитки; y у всех ячеек общий. */
  cellX: number[];
  cellY: number;
}

export interface Layout {
  tiles: TileLayout[];
  perLine: number;
  width: number;
  height: number;
}

function tileSize(cells: Size[], o: LayoutOptions): Size {
  const width = cells.reduce((w, c) => w + c.width, 0) + o.cellGap * Math.max(0, cells.length - 1);
  const height = o.labelHeight + Math.max(0, ...cells.map((c) => c.height));
  return { width, height };
}

/** Сколько плиток в ряд, чтобы секция была близка к `aspect`. */
export function tilesPerLine(count: number, tile: Size, o: LayoutOptions): number {
  if (count <= 1) return 1;
  const w = tile.width + o.tileGapX;
  const h = tile.height + o.tileGapY;
  return Math.max(1, Math.min(count, Math.ceil(Math.sqrt((o.aspect * count * h) / w))));
}

/**
 * Сетка ровная: ширина колонки — самая широкая плитка, высота ряда — самая
 * высокая плитка ряда. Порядок плиток — порядок чтения исходника.
 */
export function layoutTiles(tiles: Size[][], o: LayoutOptions = DEFAULT_LAYOUT): Layout {
  const sizes = tiles.map((cells) => tileSize(cells, o));
  const columnWidth = Math.max(0, ...sizes.map((s) => s.width));
  const typical: Size = {
    width: columnWidth,
    height: sizes.length ? sizes.reduce((h, s) => h + s.height, 0) / sizes.length : 0,
  };
  const perLine = tilesPerLine(tiles.length, typical, o);

  const out: TileLayout[] = [];
  let y = o.padding;
  for (let start = 0; start < tiles.length; start += perLine) {
    const line = tiles.slice(start, start + perLine);
    const lineHeight = Math.max(...line.map((_, i) => sizes[start + i].height));
    line.forEach((cells, i) => {
      const x = o.padding + i * (columnWidth + o.tileGapX);
      const cellX: number[] = [];
      let cx = x;
      for (const c of cells) {
        cellX.push(cx);
        cx += c.width + o.cellGap;
      }
      out.push({ x, y, cellX, cellY: y + o.labelHeight });
    });
    y += lineHeight + o.tileGapY;
  }

  const lines = Math.ceil(tiles.length / perLine);
  const width = o.padding * 2 + Math.min(perLine, tiles.length) * columnWidth + Math.max(0, Math.min(perLine, tiles.length) - 1) * o.tileGapX;
  const height = (lines ? y - o.tileGapY : y) + o.padding;
  return { tiles: out, perLine, width, height };
}
