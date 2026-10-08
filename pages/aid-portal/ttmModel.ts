import type { TtmChainStep, TtmData, TtmOperation, TtmPlatform, TtmRole, TtmTool } from './api/_lib/ttm';

/**
 * Формулы страницы «КПД команды AID» (`/ttm`). Данные — закрытые, из
 * `/api/ttm`; здесь только расчёт.
 *
 * Для каждой операции: минуты вручную и с инструментом × сколько раз в месяц
 * её делают × сколько людей × загрузка. Сумма по операциям — часы
 * инструмента. КПД = часы без решений ÷ часы с решениями.
 *
 * Фильтр платформы берёт долю каждого инструмента на iOS или Android
 * (`platformShare`); по умолчанию поровну, поэтому КПД («во сколько раз»)
 * от фильтра не меняется, а часы и рубли — делятся.
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
  /** `all` — обе платформы. */
  platform: TtmPlatform | 'all';
}

export const TTM_PLATFORMS: { id: TtmPlatform; label: string }[] = [
  { id: 'ios', label: 'iOS' },
  { id: 'android', label: 'Android' },
];

/** Доля инструмента на платформе: из данных или поровну между iOS и Android. */
export function platformShare(tool: TtmTool, platform: TtmLevers['platform']): number {
  if (platform === 'all') {
    return 1;
  }
  const shares = TTM_PLATFORMS.map(({ id }) => tool.platforms?.[id] ?? (tool.platforms ? 0 : 1));
  const total = shares.reduce((sum, share) => sum + share, 0);
  const index = TTM_PLATFORMS.findIndex(({ id }) => id === platform);
  return total > 0 ? shares[index] / total : 0;
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
  return { designers, developers, engineers, products, rate, load: load / 100, pilots: true, platform: 'all' };
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
  const share = platformShare(tool, levers.platform);
  const ops = tool.ops.map((op) => {
    const timesPerMonth = op.perMonth * levers.load * share;
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
