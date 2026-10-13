import type { TtmChainStep, TtmComplexity, TtmData, TtmOperation, TtmProduct, TtmRole, TtmSpecialist, TtmTool } from './api/_lib/ttm';

/**
 * Формулы страницы «КПД команды AID» (`/ttm`). Данные — закрытые, из
 * `/api/ttm`; здесь только расчёт.
 *
 * Часы. Для каждой операции: минуты вручную и с инструментом × сколько раз в
 * месяц её делают × сколько людей × загрузка. Сумма по операциям — часы
 * инструмента. КПД = часы без инструментов ÷ часы с ними.
 *
 * Продукты. Объём работы продукта пропорционален числу экранов в его
 * макетах: часы операции делятся между продуктами по доле экранов. Правка
 * библиотеки (`product`) — поровну: у каждого продукта своя библиотека.
 *
 * Специалисты. Каждая операция экономит время конкретных людей: по роли или
 * по долям `split` из данных.
 *
 * TTM. Путь одного изменения токена — сумма шагов; шаги `perScreen` (аудит
 * макетов) даны для продукта среднего размера и растут с числом экранов.
 *
 * Разброс (AID-14). Итог — обычный случай; быстрый и долгий — множители
 * `spread`: часы вручную B·[lo, hi], с инструментом A·[lo, hi]. Худший КПД —
 * быстрый «вручную» против долгого «с инструментом», лучший — наоборот.
 */

export type TtmProductFilter = 'all' | string;

export interface TtmLevers {
  designers: number;
  developers: number;
  pms: number;
  engineers: number;
  rate: number;
  /** Доля: 1 = 100 %. */
  load: number;
  pilots: boolean;
  /** `all` — все продукты, иначе id продукта. */
  product: TtmProductFilter;
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

export type TtmSpecialistHours = Record<TtmSpecialist, { before: number; after: number }>;

export interface TtmTotals {
  rows: TtmToolResult[];
  before: number;
  after: number;
  saved: number;
  /** Во сколько раз быстрее; 0, если «стало» — ноль часов. */
  factor: number;
  rubPerMonth: number;
  bySpecialist: TtmSpecialistHours;
}

export const ROLE_LABEL: Record<TtmRole, string> = {
  designer: 'на дизайнера',
  developer: 'на разработчика',
  pm: 'на продакта',
  engineer: 'на инженера AID',
  team: 'на команду',
  product: 'на продукт',
};

export const SPECIALISTS: { id: TtmSpecialist; label: string; lever: 'designers' | 'developers' | 'pms' | 'engineers' }[] = [
  { id: 'designer', label: 'Дизайнеры', lever: 'designers' },
  { id: 'developer', label: 'Разработчики', lever: 'developers' },
  { id: 'pm', label: 'Продакты', lever: 'pms' },
  { id: 'engineer', label: 'Инженеры AID', lever: 'engineers' },
];

/** Рабочих часов в месяц на одну ставку и в рабочем дне. */
export const HOURS_PER_FTE = 160;
export const HOURS_PER_DAY = 8;

export function leversFromData(data: TtmData): TtmLevers {
  const { designers, developers, pms, engineers, rate, load } = data.defaults;
  return { designers, developers, pms, engineers, rate, load: load / 100, pilots: true, product: 'all' };
}

export function peopleFor(role: TtmRole, levers: TtmLevers, productCount: number): number {
  switch (role) {
    case 'designer':
      return levers.designers;
    case 'developer':
      return levers.developers;
    case 'pm':
      return levers.pms;
    case 'engineer':
      return levers.engineers;
    case 'product':
      return productCount;
    case 'team':
      return 1;
  }
}

export function totalScreens(products: TtmProduct[]): number {
  return products.reduce((sum, product) => sum + product.screens, 0);
}

/** Доля операции, приходящаяся на продукт: по экранам, правка библиотеки — поровну. */
export function productShare(op: TtmOperation, products: TtmProduct[], filter: TtmProductFilter): number {
  if (filter === 'all') {
    return 1;
  }
  const product = products.find((item) => item.id === filter);
  if (!product) {
    return 0;
  }
  return op.role === 'product' ? 1 / products.length : product.screens / totalScreens(products);
}

const DEFAULT_SPLIT: Record<TtmRole, Partial<Record<TtmSpecialist, number>>> = {
  designer: { designer: 1 },
  developer: { developer: 1 },
  pm: { pm: 1 },
  engineer: { engineer: 1 },
  product: { designer: 1 },
  team: { designer: 1, developer: 1, pm: 1 },
};

/** Доли специалистов в часах операции, сумма — 1. */
export function specialistSplit(op: TtmOperation): Record<TtmSpecialist, number> {
  const split = op.split ?? DEFAULT_SPLIT[op.role];
  const total = Object.values(split).reduce((sum, share) => sum + (share ?? 0), 0) || 1;
  return {
    designer: (split.designer ?? 0) / total,
    developer: (split.developer ?? 0) / total,
    pm: (split.pm ?? 0) / total,
    engineer: (split.engineer ?? 0) / total,
  };
}

export function ratio(before: number, after: number): number {
  return after > 0 ? before / after : 0;
}

export function calcTool(tool: TtmTool, levers: TtmLevers, products: TtmProduct[]): TtmToolResult {
  let before = 0;
  let after = 0;
  const ops = tool.ops.map((op) => {
    const timesPerMonth = op.perMonth * levers.load * productShare(op, products, levers.product);
    const times = peopleFor(op.role, levers, products.length) * timesPerMonth;
    const hoursBefore = (op.before * times) / 60;
    const hoursAfter = (op.after * times) / 60;
    before += hoursBefore;
    after += hoursAfter;
    return { ...op, hoursBefore, hoursAfter, timesPerMonth };
  });
  return { tool, before, after, ops };
}

function emptySpecialists(): TtmSpecialistHours {
  return {
    designer: { before: 0, after: 0 },
    developer: { before: 0, after: 0 },
    pm: { before: 0, after: 0 },
    engineer: { before: 0, after: 0 },
  };
}

export function calcTotals(data: TtmData, levers: TtmLevers): TtmTotals {
  const rows = data.tools.filter((tool) => levers.pilots || !tool.pilot).map((tool) => calcTool(tool, levers, data.products));
  const bySpecialist = emptySpecialists();
  for (const row of rows) {
    for (const op of row.ops) {
      const split = specialistSplit(op);
      for (const { id } of SPECIALISTS) {
        bySpecialist[id].before += op.hoursBefore * split[id];
        bySpecialist[id].after += op.hoursAfter * split[id];
      }
    }
  }
  const before = rows.reduce((sum, row) => sum + row.before, 0);
  const after = rows.reduce((sum, row) => sum + row.after, 0);
  const saved = before - after;
  return { rows, before, after, saved, factor: ratio(before, after), rubPerMonth: saved * levers.rate, bySpecialist };
}

/** Экранов у выбранного продукта; для «все продукты» — средний продукт. */
export function screensFor(products: TtmProduct[], filter: TtmProductFilter): number {
  const product = products.find((item) => item.id === filter);
  return product ? product.screens : totalScreens(products) / Math.max(1, products.length);
}

/** Шаги пути изменения токена для продукта: шаги `perScreen` масштабируются по экранам. */
export function chainFor(steps: TtmChainStep[], products: TtmProduct[], filter: TtmProductFilter): TtmChainStep[] {
  const average = totalScreens(products) / Math.max(1, products.length);
  const scale = average > 0 ? screensFor(products, filter) / average : 1;
  return steps.map((step) => (step.perScreen ? { ...step, hours: step.hours * scale } : step));
}

export function chainHours(steps: TtmChainStep[]): number {
  return steps.reduce((sum, step) => sum + step.hours, 0);
}

export interface TtmProductResult {
  product: TtmProduct;
  ttmBefore: number;
  ttmAfter: number;
  totals: TtmTotals;
}

/** TTM изменения токена и часы в месяц по каждому продукту. */
export function calcProducts(data: TtmData, levers: TtmLevers): TtmProductResult[] {
  return data.products.map((product) => ({
    product,
    ttmBefore: chainHours(chainFor(data.chain.before, data.products, product.id)),
    ttmAfter: chainHours(chainFor(data.chain.after, data.products, product.id)),
    totals: calcTotals(data, { ...levers, product: product.id }),
  }));
}

export interface TtmRange {
  factorLow: number;
  factorHigh: number;
  savedLow: number;
  savedHigh: number;
}

export function spreadRange(before: number, after: number, spread: TtmComplexity['spread']): TtmRange {
  const [beforeLow, beforeHigh] = spread.before.map((k) => before * k);
  const [afterLow, afterHigh] = spread.after.map((k) => after * k);
  return {
    factorLow: ratio(beforeLow, afterHigh),
    factorHigh: ratio(beforeHigh, afterLow),
    savedLow: beforeLow - afterHigh,
    savedHigh: beforeHigh - afterLow,
  };
}

export interface TtmComplexityPoint {
  label: string;
  share: number;
  /** Минуты на одну операцию: обычный, быстрый и долгий случай. */
  before: number;
  beforeLow: number;
  beforeHigh: number;
  after: number;
  afterLow: number;
  afterHigh: number;
}

/** Время операции по уровням сложности, в минутах. */
export function complexityPoints(op: TtmOperation, complexity: TtmComplexity): TtmComplexityPoint[] {
  const [bl, bh] = complexity.spread.before;
  const [al, ah] = complexity.spread.after;
  return complexity.tiers.map((tier) => {
    const before = op.before * tier.before;
    const after = op.after * tier.after;
    return { label: tier.label, share: tier.share, before, beforeLow: before * bl, beforeHigh: before * bh, after, afterLow: after * al, afterHigh: after * ah };
  });
}

/** «Круглая» верхняя граница оси: 1,5 · 2 · 3 · 5 · 10 × 10ⁿ. */
export function niceMax(value: number): number {
  if (value <= 0) {
    return 1;
  }
  const exponent = 10 ** Math.floor(Math.log10(value));
  const n = value / exponent;
  return (n <= 1.5 ? 1.5 : n <= 2 ? 2 : n <= 3 ? 3 : n <= 5 ? 5 : 10) * exponent;
}

/** Минуты: от 90 — в часах. */
export function formatMinutes(minutes: number): string {
  return minutes >= 90 ? `${formatNumber(minutes / 60, minutes >= 600 ? 0 : 1)} ч` : `${formatNumber(minutes)} мин`;
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

/** TTM: от 8 ч — в рабочих днях, меньше — в часах. */
export function formatDuration(hours: number): { value: string; unit: string } {
  return hours >= HOURS_PER_DAY
    ? { value: formatNumber(hours / HOURS_PER_DAY, 1), unit: 'дн' }
    : { value: formatNumber(hours, 1), unit: 'ч' };
}
