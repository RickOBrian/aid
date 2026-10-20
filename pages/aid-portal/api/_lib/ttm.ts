/**
 * Данные страницы «КПД команды AID» (`/ttm`, AID-13).
 *
 * Репозиторий публичный, поэтому в коде — только форма данных и проверка.
 * Сами данные — владельцы, ставка, продукты и операции с минутами, путь
 * изменения токена, факты — лежат в Lockbox (`presentbook-ttm`, ключ
 * `TTM_DATA`) и отдаются `api/ttm.ts` только с валидной сессией.
 */

export type TtmRole = 'designer' | 'developer' | 'pm' | 'engineer' | 'team' | 'product';

/** Чьё время считаем: дизайнеры, разработчики, продакты, инженеры AID. */
export type TtmSpecialist = 'designer' | 'developer' | 'pm' | 'engineer';

export interface TtmOperation {
  label: string;
  role: TtmRole;
  /** Минут на одну операцию вручную. */
  before: number;
  /** Минут с инструментом AID. */
  after: number;
  /** Раз в месяц на одного человека роли (`team` — на всю команду, `product` — на продукт). */
  perMonth: number;
  /**
   * Чьё время экономит операция, доли: `{ designer: 0.5, developer: 0.3, pm: 0.2 }`.
   * Нет поля — по роли (`product` — дизайнеры, ведущие библиотеку; `team` —
   * поровну дизайнеры, разработчики и продакты).
   */
  split?: Partial<Record<TtmSpecialist, number>>;
}

/** Продукт с объёмом макетов: часы операций делятся между продуктами по экранам. */
export interface TtmProduct {
  id: string;
  name: string;
  /** Мобильных экранов в макетах. */
  screens: number;
}

export interface TtmTool {
  id: string;
  owner: string;
  name: string;
  type: string;
  status: string;
  pilot?: boolean;
  /** Для чего инструмент и кого ускоряет — человеческим языком. */
  job: string;
  /** Как было до инструмента. */
  was: string;
  /** Как стало с ним. */
  now: string;
  ops: TtmOperation[];
}

export interface TtmChainStep {
  label: string;
  hours: number;
  /** Ожидание ответа другого человека — штриховка. */
  wait?: boolean;
  /** Часы даны для продукта среднего размера и растут с числом экранов (аудит макетов). */
  perScreen?: boolean;
}

/** Уровень сложности задачи (AID-14). */
export interface TtmComplexityTier {
  label: string;
  /** Доля задач этого уровня в месяце. */
  share: number;
  /** Множитель времени вручную и с инструментом относительно обычной задачи. */
  before: number;
  after: number;
}

export interface TtmComplexity {
  /** Плашка у графика: откуда цифры. */
  badge: string;
  tiers: TtmComplexityTier[];
  /** Разброс: быстрый и долгий случай, множители `[lo, hi]`. */
  spread: { before: [number, number]; after: [number, number] };
  /** Операция графика по умолчанию. */
  defaultOp?: { tool: string; op: number };
}

export interface TtmDefaults {
  designers: number;
  developers: number;
  engineers: number;
  /** Продактов. */
  pms: number;
  rate: number;
  /** Загрузка операциями, проценты. */
  load: number;
}

export interface TtmData {
  eyebrow: string;
  title: string;
  intro: string;
  owners: { id: string; name: string }[];
  defaults: TtmDefaults;
  products: TtmProduct[];
  pilotsLabel: string;
  tools: TtmTool[];
  chain: { intro: string; before: TtmChainStep[]; after: TtmChainStep[] };
  facts: { eyebrow: string; items: { value: string; label: string }[] };
  method: { title: string; text: string }[];
  /** Сложность и разброс (AID-14). Нет блока — без графика и диапазонов. */
  complexity?: TtmComplexity;
}

const ROLES = new Set<TtmRole>(['designer', 'developer', 'pm', 'engineer', 'team', 'product']);
const SPECIALISTS = new Set<string>(['designer', 'developer', 'pm', 'engineer']);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === 'string';
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const isArrayOf = <T>(value: unknown, check: (item: unknown) => item is T): value is T[] =>
  Array.isArray(value) && value.every(check);

function isOperation(value: unknown): value is TtmOperation {
  return (
    isRecord(value) &&
    isString(value.label) &&
    ROLES.has(value.role as TtmRole) &&
    isNumber(value.before) &&
    isNumber(value.after) &&
    isNumber(value.perMonth) &&
    (value.split === undefined ||
      (isRecord(value.split) && Object.entries(value.split).every(([key, share]) => SPECIALISTS.has(key) && isNumber(share))))
  );
}

function isTool(value: unknown): value is TtmTool {
  return (
    isRecord(value) &&
    ['id', 'owner', 'name', 'type', 'status', 'job', 'was', 'now'].every((key) => isString(value[key])) &&
    (value.pilot === undefined || typeof value.pilot === 'boolean') &&
    isArrayOf(value.ops, isOperation) &&
    value.ops.length > 0
  );
}

function isChainStep(value: unknown): value is TtmChainStep {
  return (
    isRecord(value) &&
    isString(value.label) &&
    isNumber(value.hours) &&
    (value.wait === undefined || typeof value.wait === 'boolean') &&
    (value.perScreen === undefined || typeof value.perScreen === 'boolean')
  );
}

const isPair = (value: unknown): value is [number, number] =>
  Array.isArray(value) && value.length === 2 && value.every(isNumber) && value[0] <= value[1];

function isTier(value: unknown): value is TtmComplexityTier {
  return isRecord(value) && isString(value.label) && isNumber(value.share) && isNumber(value.before) && isNumber(value.after);
}

function isComplexity(value: unknown): value is TtmComplexity {
  if (!isRecord(value)) {
    return false;
  }
  const { spread, defaultOp } = value;
  return (
    isString(value.badge) &&
    isArrayOf(value.tiers, isTier) &&
    value.tiers.length >= 2 &&
    isRecord(spread) &&
    isPair(spread.before) &&
    isPair(spread.after) &&
    (defaultOp === undefined || (isRecord(defaultOp) && isString(defaultOp.tool) && isNumber(defaultOp.op)))
  );
}

function isProduct(value: unknown): value is TtmProduct {
  return isRecord(value) && isString(value.id) && isString(value.name) && isNumber(value.screens) && value.screens > 0;
}

function isTitled(value: unknown): value is { title: string; text: string } {
  return isRecord(value) && isString(value.title) && isString(value.text);
}

function isFact(value: unknown): value is { value: string; label: string } {
  return isRecord(value) && isString(value.value) && isString(value.label);
}

function isOwner(value: unknown): value is { id: string; name: string } {
  return isRecord(value) && isString(value.id) && isString(value.name);
}

/** Проверка формы: ошибка в JSON из Lockbox не должна ронять страницу на полпути. */
export function isTtmData(value: unknown): value is TtmData {
  if (!isRecord(value)) {
    return false;
  }
  const { defaults, chain, facts } = value;
  return (
    ['eyebrow', 'title', 'intro', 'pilotsLabel'].every((key) => isString(value[key])) &&
    isArrayOf(value.owners, isOwner) &&
    isRecord(defaults) &&
    ['designers', 'developers', 'engineers', 'pms', 'rate', 'load'].every((key) => isNumber(defaults[key])) &&
    isArrayOf(value.products, isProduct) &&
    value.products.length > 0 &&
    isArrayOf(value.tools, isTool) &&
    isRecord(chain) &&
    isString(chain.intro) &&
    isArrayOf(chain.before, isChainStep) &&
    isArrayOf(chain.after, isChainStep) &&
    isRecord(facts) &&
    isString(facts.eyebrow) &&
    isArrayOf(facts.items, isFact) &&
    isArrayOf(value.method, isTitled) &&
    (value.complexity === undefined || isComplexity(value.complexity))
  );
}

/** Ключ в секрете Lockbox, под которым лежит JSON страницы. */
export const TTM_SECRET_KEY = 'TTM_DATA';

/**
 * Читает секрет через Lockbox Payload API с IAM-токеном сервисного аккаунта
 * функции (`context.token`). Не через переменную окружения: у функции на все
 * переменные 4 КБ, а данные страницы больше; и правка данных не требует
 * новой версии функции.
 */
export async function loadTtmFromLockbox(
  secretId: string,
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<TtmData | null> {
  const response = await fetchImpl(`https://payload.lockbox.api.cloud.yandex.net/lockbox/v1/secrets/${encodeURIComponent(secretId)}/payload`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) {
    // Только статус: тело ответа и данные в журнал не попадают.
    console.error(`ttm: Lockbox ответил ${response.status}`);
    return null;
  }
  const body = (await response.json()) as { entries?: { key?: string; textValue?: string }[] };
  const entry = body.entries?.find((item) => item.key === TTM_SECRET_KEY);
  if (!entry?.textValue) {
    console.error(`ttm: в секрете нет ключа ${TTM_SECRET_KEY}`);
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(entry.textValue);
  } catch {
    console.error('ttm: значение секрета — не JSON');
    return null;
  }
  if (!isTtmData(parsed)) {
    console.error('ttm: JSON в секрете не прошёл проверку формы');
    return null;
  }
  return parsed;
}
