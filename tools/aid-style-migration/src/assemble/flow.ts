/**
 * Раскладка потока для зеркальных секций ДО / ПОСЛЕ / ПОСЛЕ · тёмная тема
 * (решение Principal Designer, 2026-09-30; эталон — Test-2).
 *
 * Экраны исходника раскиданы как попало; здесь они встают аккуратными
 * рядами в порядке чтения: что было на одной высоте — в одном ряду, слева
 * направо. Одна и та же раскладка используется во всех трёх секциях —
 * глаз сравнивает одинаковые места. Чистая логика.
 */

export interface Placed {
  id: string;
  /** Положение в исходнике — только для порядка чтения. */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FlowOptions {
  padding: number;
  /** Над экраном — место под подпись (в ДО) — одинаковое во всех секциях. */
  labelHeight: number;
  gapX: number;
  gapY: number;
  /** Не шире стольких экранов в ряд: длинные ряды исходника переносятся. */
  maxPerRow: number;
}

export const DEFAULT_FLOW: FlowOptions = { padding: 160, labelHeight: 48, gapX: 80, gapY: 160, maxPerRow: 10 };

export interface FlowLayout {
  /** Положение экрана внутри секции (левый верх самого экрана, под подписью). */
  positions: Map<string, { x: number; y: number }>;
  width: number;
  height: number;
}

/** Ряды в порядке чтения: экран в ряду, если по вертикали он перекрывает ряд больше чем наполовину. */
export function readingRows(items: Placed[]): Placed[][] {
  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
  const rows: Array<{ top: number; bottom: number; items: Placed[] }> = [];
  for (const item of sorted) {
    const row = rows.find((r) => {
      const overlap = Math.min(r.bottom, item.y + item.height) - Math.max(r.top, item.y);
      return overlap > Math.min(item.height, r.bottom - r.top) / 2;
    });
    if (row) {
      row.items.push(item);
      row.top = Math.min(row.top, item.y);
      row.bottom = Math.max(row.bottom, item.y + item.height);
    } else {
      rows.push({ top: item.y, bottom: item.y + item.height, items: [item] });
    }
  }
  rows.sort((a, b) => a.top - b.top);
  return rows.map((r) => r.items.sort((a, b) => a.x - b.x));
}

export function layoutFlow(items: Placed[], o: FlowOptions = DEFAULT_FLOW): FlowLayout {
  const positions = new Map<string, { x: number; y: number }>();
  // Длинные ряды переносятся, чтобы секция не уезжала вправо на десятки экранов.
  const rows = readingRows(items).flatMap((row) => {
    const out: Placed[][] = [];
    for (let i = 0; i < row.length; i += o.maxPerRow) out.push(row.slice(i, i + o.maxPerRow));
    return out;
  });
  let y = o.padding;
  let width = 0;
  for (const row of rows) {
    let x = o.padding;
    let rowHeight = 0;
    for (const item of row) {
      positions.set(item.id, { x, y: y + o.labelHeight });
      x += item.width + o.gapX;
      rowHeight = Math.max(rowHeight, item.height);
    }
    width = Math.max(width, x - o.gapX + o.padding);
    y += o.labelHeight + rowHeight + o.gapY;
  }
  const height = (rows.length ? y - o.gapY : y) + o.padding;
  return { positions, width: Math.max(width, o.padding * 2), height };
}
