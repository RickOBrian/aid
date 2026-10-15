import type { Task, TaskBoard, TaskStatus } from './api/_lib/tasks';

/**
 * Логика страницы «Управление → Задачи» (`/manage/tasks`, team-2): подписи,
 * фильтры и раскладка по колонкам. Без React — чтобы проверять тестами.
 */

export const STATUS_LABEL: Record<TaskStatus, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  waiting: 'Ждёт',
  review: 'На проверке',
  done: 'Готово',
  cancelled: 'Отменена',
};

/** Колонки канбана; отменённые на доске не показываются. */
export const BOARD_COLUMNS: TaskStatus[] = ['new', 'in_progress', 'waiting', 'review', 'done'];

/** Коды продуктов сервиса задач (ORCHESTRATION.md §10) → названия на сайте. */
export const PRODUCT_LABEL: Record<string, string> = {
  hub: 'Штаб',
  standards: 'Стандарты',
  presentbook: 'Presentbook',
  'token-comparator': 'Token Comparator',
  'style-migration': 'Style Migration',
  mcp: 'MCP',
  'bot-request': 'Bot · Request',
  team: 'Team',
  'library-updater': 'Library Updater',
  'components-swapper': 'Components Swapper',
};

export function productLabel(code: string): string {
  return PRODUCT_LABEL[code] ?? code;
}

/** «Имя Ф.» из сервиса задач, без него — логин; `pd` — «решение PD». */
export function personName(login: string, people: TaskBoard['people']): string {
  if (login === 'pd') {
    return 'решение PD';
  }
  return people[login]?.displayName ?? login;
}

/** Пустой список — «все». */
export interface TaskFilters {
  products: string[];
  assignees: string[];
}

export const DEFAULT_FILTERS: TaskFilters = { products: [], assignees: [] };

/** Фильтры из адреса: `/manage/tasks?person=<логин>&product=<код>` — ссылки со страницы «Команда». */
export function filtersFromSearch(search: string): TaskFilters {
  const params = new URLSearchParams(search);
  const list = (key: string) => params.getAll(key).flatMap((value) => value.split(',')).filter(Boolean);
  return { products: list('product'), assignees: list('person') };
}

/** Все люди задачи: исполнители, на ком висит, куратор, автор. */
export function taskPeople(task: Task): string[] {
  return [...new Set([...task.assignees, task.waitingOn, task.curator, task.author].filter((login): login is string => Boolean(login) && login !== 'pd'))];
}

function matchesProducts(task: Task, products: string[]): boolean {
  return products.length === 0 || products.includes(task.product) || task.relatedProducts.some((product) => products.includes(product));
}

export function matchesFilters(task: Task, filters: TaskFilters): boolean {
  if (task.status === 'cancelled') {
    return false;
  }
  if (!matchesProducts(task, filters.products)) {
    return false;
  }
  if (filters.assignees.length > 0 && !task.assignees.some((login) => filters.assignees.includes(login))) {
    return false;
  }
  return true;
}

/** Колонки с задачами: свежие изменения — выше. */
export function groupByStatus(tasks: Task[], filters: TaskFilters): { status: TaskStatus; tasks: Task[] }[] {
  const visible = tasks.filter((task) => matchesFilters(task, filters));
  return BOARD_COLUMNS.map((status) => ({
    status,
    tasks: visible.filter((task) => task.status === status).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  }));
}

/** Продукты для фильтра — из самих задач (без отменённых). */
export function productOptions(board: TaskBoard): string[] {
  const products = new Set<string>();
  for (const task of board.tasks) {
    if (task.status === 'cancelled') {
      continue;
    }
    products.add(task.product);
    task.relatedProducts.forEach((product) => products.add(product));
  }
  return [...products].sort((a, b) => productLabel(a).localeCompare(productLabel(b), 'ru'));
}

/**
 * Исполнители для тегов фильтра: логин и число задач на нём — среди
 * неотменённых задач выбранных продуктов. Больше задач — левее.
 */
export function assigneeOptions(board: TaskBoard, products: string[]): { login: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const task of board.tasks) {
    if (task.status === 'cancelled' || !matchesProducts(task, products)) {
      continue;
    }
    task.assignees.forEach((login) => counts.set(login, (counts.get(login) ?? 0) + 1));
  }
  return [...counts]
    .map(([login, count]) => ({ login, count }))
    .sort((a, b) => b.count - a.count || a.login.localeCompare(b.login));
}

/** Строка истории: смена статуса — подписями, остальное — как есть. */
export function historyText(entry: { field: string; from: unknown; to: unknown }, people: TaskBoard['people']): string {
  const show = (value: unknown): string => {
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    if (entry.field === 'status' && typeof value === 'string' && value in STATUS_LABEL) {
      return STATUS_LABEL[value as TaskStatus];
    }
    if (['waitingOn', 'curator', 'author'].includes(entry.field) && typeof value === 'string') {
      return personName(value, people);
    }
    if (entry.field === 'assignees' && Array.isArray(value)) {
      return value.map((login) => personName(String(login), people)).join(', ') || '—';
    }
    if (Array.isArray(value)) {
      return value.join(', ') || '—';
    }
    return String(value);
  };
  const FIELD_LABEL: Record<string, string> = {
    status: 'статус',
    assignees: 'исполнители',
    waitingOn: 'висит на',
    curator: 'куратор',
    title: 'название',
    description: 'описание',
    relatedProducts: 'связанные продукты',
    links: 'ссылки',
  };
  const field = FIELD_LABEL[entry.field] ?? entry.field;
  if (entry.from === null || entry.from === undefined) {
    return `${field}: ${show(entry.to)}`;
  }
  return `${field}: ${show(entry.from)} → ${show(entry.to)}`;
}

/** «14 окт., 16:05» по Москве: команда работает в МСК, время в данных — UTC. */
export function formatTaskTime(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Moscow',
  });
}

/** `/manage/tasks/bot-request-13` → `bot-request-13`. */
export function taskIdFromPath(path: string): string | null {
  const match = /^\/manage\/tasks\/([a-z0-9-]+-\d+)\/?$/.exec(path);
  return match ? match[1] : null;
}
