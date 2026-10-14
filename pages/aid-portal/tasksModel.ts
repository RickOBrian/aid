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

/** Колонки канбана; отменённые — только при включённом переключателе. */
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

export interface TaskFilters {
  product: string;
  person: string;
  showCancelled: boolean;
}

export const ALL = 'all';

export const DEFAULT_FILTERS: TaskFilters = { product: ALL, person: ALL, showCancelled: false };

/** Все люди задачи: исполнители, на ком висит, куратор, автор. */
export function taskPeople(task: Task): string[] {
  return [...new Set([...task.assignees, task.waitingOn, task.curator, task.author].filter((login): login is string => Boolean(login) && login !== 'pd'))];
}

export function matchesFilters(task: Task, filters: TaskFilters): boolean {
  if (!filters.showCancelled && task.status === 'cancelled') {
    return false;
  }
  if (filters.product !== ALL && task.product !== filters.product && !task.relatedProducts.includes(filters.product)) {
    return false;
  }
  if (filters.person !== ALL && !taskPeople(task).includes(filters.person)) {
    return false;
  }
  return true;
}

/** Колонки с задачами: свежие изменения — выше. */
export function groupByStatus(tasks: Task[], filters: TaskFilters): { status: TaskStatus; tasks: Task[] }[] {
  const columns = filters.showCancelled ? [...BOARD_COLUMNS, 'cancelled' as const] : BOARD_COLUMNS;
  const visible = tasks.filter((task) => matchesFilters(task, filters));
  return columns.map((status) => ({
    status,
    tasks: visible.filter((task) => task.status === status).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  }));
}

/** Варианты фильтров — из самих задач. */
export function filterOptions(board: TaskBoard): { products: string[]; people: string[] } {
  const products = new Set<string>();
  const people = new Set<string>();
  for (const task of board.tasks) {
    products.add(task.product);
    task.relatedProducts.forEach((product) => products.add(product));
    taskPeople(task).forEach((login) => people.add(login));
  }
  return {
    products: [...products].sort((a, b) => productLabel(a).localeCompare(productLabel(b), 'ru')),
    people: [...people].sort((a, b) => personName(a, board.people).localeCompare(personName(b, board.people), 'ru')),
  };
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
