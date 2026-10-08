import type { TtmChainStep, TtmData, TtmOperation, TtmRole, TtmTool } from './api/_lib/ttm';

/**
 * Формулы страницы «КПД команды AID» (`/ttm`). Данные — закрытые, из
 * `/api/ttm`; здесь только расчёт.
 *
 * Для каждой операции: минуты вручную и с инструментом × сколько раз в месяц
 * её делают × сколько людей × загрузка. Сумма по операциям — часы
 * инструмента. КПД = часы без решений ÷ часы с решениями.
 */

export interface TtmLevers {
  designers: number;
  developers: number;
  engineers: number;
  products: number;
  rate: number;
  /** Доля: 1 = 100 %. */
  load: number;
  pilots: boolean;
}

export interface TtmOperationResult extends TtmOperation {
  hoursBefore: number;
  hoursAfter: number;
  timesPerMonth: number;
}

export interface TtmToolResult {
  tool: TtmTool;
  before: number;
  after: number;
  ops: TtmOperationResult[];
}

export interface TtmTotals {
  rows: TtmToolResult[];
  before: number;
  after: number;
  saved: number;
  /** Во сколько раз быстрее; 0, если «стало» — ноль часов. */
  factor: number;
  rubPerMonth: number;
}

export const ROLE_LABEL: Record<TtmRole, string> = {
  designer: 'на дизайнера',
  developer: 'на разработчика',
  engineer: 'на инженера AID',
  team: 'на команду',
  product: 'на продукт',
};

/** Рабочих часов в месяц на одну ставку и в рабочем дне. */
export const HOURS_PER_FTE = 160;
export const HOURS_PER_DAY = 8;

export function leversFromData(data: TtmData): TtmLevers {
  const { designers, developers, engineers, products, rate, load } = data.defaults;
  return { designers, developers, engineers, products, rate, load: load / 100, pilots: true };
}

export function peopleFor(role: TtmRole, levers: TtmLevers): number {
  switch (role) {
    case 'designer':
      return levers.designers;
    case 'developer':
      return levers.developers;
    case 'engineer':
      return levers.engineers;
    case 'product':
      return levers.products;
    case 'team':
      return 1;
  }
}

export function ratio(before: number, after: number): number {
  return after > 0 ? before / after : 0;
}

export function calcTool(tool: TtmTool, levers: TtmLevers): TtmToolResult {
  let before = 0;
  let after = 0;
  const ops = tool.ops.map((op) => {
    const timesPerMonth = op.perMonth * levers.load;
    const times = peopleFor(op.role, levers) * timesPerMonth;
    const hoursBefore = (op.before * times) / 60;
    const hoursAfter = (op.after * times) / 60;
    before += hoursBefore;
    after += hoursAfter;
    return { ...op, hoursBefore, hoursAfter, timesPerMonth };
  });
  return { tool, before, after, ops };
}

export function calcTotals(data: TtmData, levers: TtmLevers): TtmTotals {
  const rows = data.tools.filter((tool) => levers.pilots || !tool.pilot).map((tool) => calcTool(tool, levers));
  const before = rows.reduce((sum, row) => sum + row.before, 0);
  const after = rows.reduce((sum, row) => sum + row.after, 0);
  const saved = before - after;
  return { rows, before, after, saved, factor: ratio(before, after), rubPerMonth: saved * levers.rate };
}

export function chainHours(steps: TtmChainStep[]): number {
  return steps.reduce((sum, step) => sum + step.hours, 0);
}

const numberFormats = new Map<number, Intl.NumberFormat>();

export function formatNumber(value: number, digits = 0): string {
  let format = numberFormats.get(digits);
  if (!format) {
    format = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: digits, maximumFractionDigits: digits });
    numberFormats.set(digits, format);
  }
  return format.format(value);
}

/** Часы шага: меньше часа — с сотыми, иначе целые. */
export function formatStepHours(hours: number): string {
  return formatNumber(hours, hours < 1 ? 2 : 0);
}
