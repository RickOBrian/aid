/**
 * Задачи команды для раздела «Управление → Задачи» (`/manage/tasks`,
 * AID-16, ADR-046).
 *
 * Источник — сервис задач Team (`team.aidteam.pro`), контракт чтения v1:
 * `GET /v1/tasks?include=history`, `Authorization: Bearer <ключ>`. Ключ
 * сервисный, только на чтение, лежит в Lockbox (`presentbook-team-read`);
 * функция читает его при запросе, клиент ключа не видит.
 */

export const TASK_STATUSES = ['new', 'in_progress', 'waiting', 'review', 'done', 'cancelled'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface TaskLink {
  type: 'pr' | 'issue' | 'other';
  url: string;
  title?: string;
}

export interface TaskHistoryEntry {
  /** UTC, ISO 8601. */
  at: string;
  by: string;
  /** Имя изменённого поля: `status`, `assignees`, `waitingOn`… */
  field: string;
  from: unknown;
  to: unknown;
  note?: string;
}

export interface Task {
  /** `bot-request-13` */
  id: string;
  product: string;
  number: number;
  title: string;
  /** Markdown. */
  description: string;
  author: string;
  assignees: string[];
  relatedProducts: string[];
  status: TaskStatus;
  /** Логин, `pd` — решение Principal Designer, или `null`. */
  waitingOn: string | null;
  /** Живой куратор задачи — логин (team-2, сервис #223). Без «да» куратора задача не мержится. */
  curator?: string | null;
  links: TaskLink[];
  history?: TaskHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskBoard {
  tasks: Task[];
  /** Логин → отображаемое имя; нет имени — показываем логин. */
  people: Record<string, { displayName?: string }>;
  /** Примерные задачи (превью и локальная разработка), не настоящие. */
  example?: boolean;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === 'string';
const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString);
const STATUS_SET = new Set<string>(TASK_STATUSES);

/**
 * Только `https:`. Ссылка уходит в `href` на aidteam.pro, а `javascript:`,
 * `data:` и прочие схемы из сервиса задач дали бы XSS (Security, #224).
 */
export function isSafeLinkUrl(url: unknown): url is string {
  if (!isString(url)) {
    return false;
  }
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

function isLink(value: unknown): value is TaskLink {
  return isRecord(value) && ['pr', 'issue', 'other'].includes(value.type as string) && isSafeLinkUrl(value.url) && (value.title === undefined || isString(value.title));
}

function isHistoryEntry(value: unknown): value is TaskHistoryEntry {
  return isRecord(value) && isString(value.at) && isString(value.by) && isString(value.field) && (value.note === undefined || isString(value.note));
}

export function isTask(value: unknown): value is Task {
  return (
    isRecord(value) &&
    ['id', 'product', 'title', 'description', 'author', 'createdAt', 'updatedAt'].every((key) => isString(value[key])) &&
    typeof value.number === 'number' &&
    isStringArray(value.assignees) &&
    isStringArray(value.relatedProducts) &&
    STATUS_SET.has(value.status as string) &&
    (value.waitingOn === null || isString(value.waitingOn)) &&
    (value.curator === undefined || value.curator === null || isString(value.curator)) &&
    Array.isArray(value.links) &&
    value.links.every(isLink) &&
    (value.history === undefined || (Array.isArray(value.history) && value.history.every(isHistoryEntry)))
  );
}

function isPeople(value: unknown): value is TaskBoard['people'] {
  return (
    isRecord(value) &&
    Object.values(value).every((person) => isRecord(person) && (person.displayName === undefined || isString(person.displayName)))
  );
}

export function isTaskBoard(value: unknown): value is TaskBoard {
  return isRecord(value) && Array.isArray(value.tasks) && value.tasks.every(isTask) && isPeople(value.people) && (value.example === undefined || typeof value.example === 'boolean');
}

/** Ключ в секрете Lockbox `presentbook-team-read`. */
export const TEAM_KEY_ENTRY = 'TEAM_READ_KEY';

/** Значение ключа из Lockbox Payload API, с IAM-токеном функции. Ключ не пишется в журнал. */
export async function readTeamKey(secretId: string, token: string, fetchImpl: typeof fetch = fetch): Promise<string | null> {
  const response = await fetchImpl(`https://payload.lockbox.api.cloud.yandex.net/lockbox/v1/secrets/${encodeURIComponent(secretId)}/payload`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) {
    console.error(`tasks: Lockbox ответил ${response.status}`);
    return null;
  }
  const body = (await response.json()) as { entries?: { key?: string; textValue?: string }[] };
  const value = body.entries?.find((entry) => entry.key === TEAM_KEY_ENTRY)?.textValue;
  if (!value) {
    console.error(`tasks: в секрете нет ключа ${TEAM_KEY_ENTRY}`);
  }
  return value || null;
}

/**
 * Небезопасные ссылки выбрасываются из задачи, сама задача остаётся: одна
 * кривая ссылка не должна гасить весь канбан. В журнал — только число.
 */
function dropUnsafeLinks(task: unknown): unknown {
  if (!isRecord(task) || !Array.isArray(task.links)) {
    return task;
  }
  const links = task.links.filter((link) => isRecord(link) && isSafeLinkUrl(link.url));
  if (links.length !== task.links.length) {
    console.error(`tasks: отброшено небезопасных ссылок: ${task.links.length - links.length}`);
  }
  return { ...task, links };
}

interface TeamPage {
  tasks?: unknown;
  people?: unknown;
  nextCursor?: string | null;
}

/**
 * Все задачи с историей: страницы по `cursor`, пока `nextCursor` не `null`.
 * Ошибка сервиса — `null` и статус в журнале, без тела ответа.
 */
export async function loadTeamBoard(baseUrl: string, key: string, fetchImpl: typeof fetch = fetch): Promise<TaskBoard | null> {
  const tasks: unknown[] = [];
  const people: Record<string, unknown> = {};
  let cursor: string | null = null;
  for (let page = 0; page < 20; page += 1) {
    const url = new URL('/v1/tasks', baseUrl);
    url.searchParams.set('include', 'history');
    url.searchParams.set('limit', '500');
    if (cursor) {
      url.searchParams.set('cursor', cursor);
    }
    const response = await fetchImpl(url, {
      headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      console.error(`tasks: сервис задач ответил ${response.status}`);
      return null;
    }
    const body = (await response.json()) as TeamPage;
    if (Array.isArray(body.tasks)) {
      tasks.push(...body.tasks);
    }
    if (isRecord(body.people)) {
      Object.assign(people, body.people);
    }
    cursor = body.nextCursor ?? null;
    if (!cursor) {
      const board = { tasks: tasks.map(dropUnsafeLinks), people };
      if (!isTaskBoard(board)) {
        console.error('tasks: ответ сервиса задач не прошёл проверку формы');
        return null;
      }
      return board;
    }
  }
  console.error('tasks: больше 20 страниц задач — остановились');
  return null;
}
