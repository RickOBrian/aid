import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, resetTasksCache } from '../api/tasks';
import { isSafeLinkUrl, isTask, isTaskBoard, loadTeamBoard, readTeamKey, type Task, type TaskBoard } from '../api/_lib/tasks';
import { EXAMPLE_BOARD } from '../api/_lib/tasksExample';
import { createSessionPayload, signSessionCookie, SESSION_COOKIE_NAME } from '../api/_lib/session';
import { handler } from '../deploy/yc/handler';
import { canonicalAppPath } from '../productRegistry';
import {
  DEFAULT_FILTERS,
  assigneeOptions,
  filtersFromSearch,
  groupByStatus,
  historyText,
  matchesFilters,
  personName,
  productLabel,
  productOptions,
  taskIdFromPath,
  taskPeople,
} from '../tasksModel';

/**
 * «Управление → Задачи» (team-2, ADR-046): контракт чтения сервиса задач,
 * `/api/tasks`, логика канбана. Задачи и люди в тестах — вымышленные.
 */

const TASK: Task = {
  id: 'bot-request-13',
  product: 'bot-request',
  number: 13,
  title: 't',
  description: 'd',
  author: 'a',
  assignees: ['b', 'c'],
  relatedProducts: ['team'],
  status: 'waiting',
  waitingOn: 'pd',
  curator: 'k',
  links: [{ type: 'pr', url: 'https://example.test/pr/1' }],
  history: [{ at: '2026-10-14T10:00:00Z', by: 'a', field: 'status', from: 'new', to: 'waiting', note: 'n' }],
  createdAt: '2026-10-13T10:00:00Z',
  updatedAt: '2026-10-14T10:00:00Z',
};

const board = (tasks: Task[]): TaskBoard => ({ tasks, people: { b: { displayName: 'Бэ Б.' } } });

describe('контракт сервиса задач v1', () => {
  it('задача с куратором и без него проходит проверку', () => {
    expect(isTask(TASK)).toBe(true);
    const withoutCurator: Partial<Task> = { ...TASK };
    delete withoutCurator.curator;
    expect(isTask(withoutCurator)).toBe(true);
    expect(isTask({ ...TASK, curator: null })).toBe(true);
  });

  it('ссылки — только https: javascript:, data:, http: и относительные — отказ всей задачи (XSS, Security #224)', () => {
    for (const url of ['javascript:alert(1)', 'JavaScript:alert(1)', ' javascript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'http://example.test/pr/1', '/manage', '//evil.test/x', 'vbscript:x', '']) {
      expect(isSafeLinkUrl(url)).toBe(false);
      expect(isTask({ ...TASK, links: [{ type: 'pr', url }] })).toBe(false);
    }
    expect(isSafeLinkUrl('https://github.com/RickOBrian/aid/pull/1')).toBe(true);
    expect(isTaskBoard({ tasks: [{ ...TASK, links: [{ type: 'other', url: 'javascript:alert(1)' }] }], people: {} })).toBe(false);
  });

  it('неизвестный статус, кривая ссылка или куратор-число — отказ', () => {
    expect(isTask({ ...TASK, status: 'archived' })).toBe(false);
    expect(isTask({ ...TASK, links: [{ type: 'mail', url: 'x' }] })).toBe(false);
    expect(isTask({ ...TASK, curator: 1 })).toBe(false);
  });

  it('пример для превью — по контракту и помечен как пример', () => {
    expect(isTaskBoard(EXAMPLE_BOARD)).toBe(true);
    expect(EXAMPLE_BOARD.example).toBe(true);
    expect(EXAMPLE_BOARD.tasks.every((task) => task.title.startsWith('Пример'))).toBe(true);
  });

  it('список собирается по страницам cursor → nextCursor, с ключом в Bearer', async () => {
    const pages = [
      { tasks: [TASK], people: { b: { displayName: 'Бэ Б.' } }, nextCursor: 'p2' },
      { tasks: [{ ...TASK, id: 'team-1', product: 'team', number: 1 }], people: {}, nextCursor: null },
    ];
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(pages.shift()))) as unknown as typeof fetch;
    const result = await loadTeamBoard('https://team.example.test', 'key', fetchImpl);
    expect(result?.tasks.map((task) => task.id)).toEqual(['bot-request-13', 'team-1']);
    expect(result?.people.b?.displayName).toBe('Бэ Б.');
    const calls = (fetchImpl as unknown as { mock: { calls: [URL, RequestInit][] } }).mock.calls;
    expect(String(calls[0][0])).toBe('https://team.example.test/v1/tasks?include=history&limit=500');
    expect(String(calls[1][0])).toContain('cursor=p2');
    expect((calls[0][1].headers as Record<string, string>).Authorization).toBe('Bearer key');
  });

  it('ошибка сервиса или чужая форма — null; ключ и тело в журнал не попадают', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fail = vi.fn(async () => new Response('{"error":"x","message":"secret-key"}', { status: 401 })) as unknown as typeof fetch;
    expect(await loadTeamBoard('https://team.example.test', 'secret-key', fail)).toBeNull();
    const bad = vi.fn(async () => new Response('{"tasks":[{"id":1}],"people":{}}')) as unknown as typeof fetch;
    expect(await loadTeamBoard('https://team.example.test', 'secret-key', bad)).toBeNull();
    expect(log.mock.calls.flat().join(' ')).not.toContain('secret-key');
    log.mockRestore();
  });

  it('загрузчик выбрасывает небезопасные ссылки, задача остаётся, адрес в журнал не пишется', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const page = { tasks: [{ ...TASK, links: [{ type: 'pr', url: 'javascript:alert(document.cookie)' }, TASK.links[0]] }], people: {}, nextCursor: null };
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(page))) as unknown as typeof fetch;
    const result = await loadTeamBoard('https://team.example.test', 'key', fetchImpl);
    expect(result?.tasks[0].links).toEqual(TASK.links);
    expect(log.mock.calls.flat().join(' ')).not.toContain('javascript');
    log.mockRestore();
  });

  it('ключ из Lockbox — по записи TEAM_READ_KEY', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ entries: [{ key: 'TEAM_READ_KEY', textValue: 'k1' }] }))) as unknown as typeof fetch;
    expect(await readTeamKey('sec', 'iam', fetchImpl)).toBe('k1');
  });
});

const SECRET = 'test-secret-only-for-unit-tests';
const request = (cookie?: string) => new Request('https://example.test/api/tasks', { headers: cookie ? { cookie } : {} });
const sessionCookie = async () => `${SESSION_COOKIE_NAME}=${await signSessionCookie(createSessionPayload(), SECRET)}`;

describe('GET /api/tasks', () => {
  beforeEach(() => {
    process.env.AUTH_COOKIE_SECRET = SECRET;
    process.env.TEAM_SECRET_ID = 'sec';
    process.env.TEAM_API_URL = 'https://team.example.test';
    resetTasksCache();
  });
  afterEach(() => {
    for (const name of ['AUTH_COOKIE_SECRET', 'TEAM_SECRET_ID', 'TEAM_API_URL']) {
      delete process.env[name];
    }
  });

  it('без сессии — 401, сервис не спрашивается', async () => {
    const load = vi.fn(async () => board([TASK]));
    expect((await GET(request(), { token: 't', load, readKey: async () => 'k' })).status).toBe(401);
    expect(load).not.toHaveBeenCalled();
  });

  it('превью — пример, без ключа и сервиса', async () => {
    const load = vi.fn(async () => board([TASK]));
    const response = await GET(request(await sessionCookie()), { preview: true, load });
    expect(await response.json()).toMatchObject({ example: true });
    expect(load).not.toHaveBeenCalled();
  });

  it('не настроено — 503 not configured, выдуманных задач нет', async () => {
    process.env.TEAM_API_URL = 'none';
    const response = await GET(request(await sessionCookie()), { token: 't', readKey: async () => 'k', load: async () => board([TASK]) });
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'not configured' });
  });

  it('с сессией — задачи сервиса, no-store, кэш 30 секунд', async () => {
    let now = 0;
    const load = vi.fn(async () => board([TASK]));
    const options = { token: 't', readKey: async () => 'k', load, now: () => now };
    const cookie = await sessionCookie();
    const response = await GET(request(cookie), options);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect((await response.json()).tasks[0].id).toBe('bot-request-13');
    await GET(request(cookie), options);
    expect(load).toHaveBeenCalledTimes(1);
    now = 31_000;
    await GET(request(cookie), options);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('функция: /pr-N/api/tasks — пример даже без Team', async () => {
    Object.assign(process.env, { BASIC_AUTH_USER: 'u', BASIC_AUTH_PASSWORD: 'p' });
    const event = {
      httpMethod: 'GET',
      url: '/pr-9/api/tasks',
      path: '/pr-9/api/tasks',
      headers: { Cookie: await sessionCookie() },
      multiValueHeaders: {},
      queryStringParameters: {},
      multiValueQueryStringParameters: {},
      requestContext: {},
      body: '',
      isBase64Encoded: false,
    };
    const result = await handler(event as never, undefined);
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).example).toBe(true);
    delete process.env.BASIC_AUTH_USER;
    delete process.env.BASIC_AUTH_PASSWORD;
  });
});

describe('логика канбана', () => {
  const cancelled: Task = { ...TASK, id: 'hub-2', product: 'hub', status: 'cancelled', relatedProducts: [], waitingOn: null, curator: null };

  it('отменённые на доске не показываются', () => {
    expect(matchesFilters(cancelled, DEFAULT_FILTERS)).toBe(false);
    const columns = groupByStatus([TASK, cancelled], DEFAULT_FILTERS);
    expect(columns.map((column) => column.status)).toEqual(['new', 'in_progress', 'waiting', 'review', 'done']);
    expect(columns.flatMap((column) => column.tasks)).toEqual([TASK]);
    expect(productOptions(board([TASK, cancelled]))).not.toContain('hub');
  });

  it('продукты — несколько сразу, главный и связанные; исполнители — только assignees', () => {
    expect(matchesFilters(TASK, { ...DEFAULT_FILTERS, products: ['team'] })).toBe(true);
    expect(matchesFilters(TASK, { ...DEFAULT_FILTERS, products: ['hub'] })).toBe(false);
    expect(matchesFilters(TASK, { ...DEFAULT_FILTERS, products: ['hub', 'bot-request'] })).toBe(true);
    expect(taskPeople(TASK).sort()).toEqual(['a', 'b', 'c', 'k']);
    expect(matchesFilters(TASK, { ...DEFAULT_FILTERS, assignees: TASK.assignees.slice(0, 1) })).toBe(true);
    expect(matchesFilters(TASK, { ...DEFAULT_FILTERS, assignees: ['z'] })).toBe(false);
    expect(matchesFilters(TASK, { ...DEFAULT_FILTERS, assignees: ['z', ...TASK.assignees] })).toBe(true);
  });

  it('теги исполнителей: логин и число неотменённых задач выбранных продуктов', () => {
    const other: Task = { ...TASK, id: 'hub-3', product: 'hub', relatedProducts: [], assignees: ['z'] };
    const all = assigneeOptions(board([TASK, other, cancelled]), []);
    expect(all.find((option) => option.login === 'z')?.count).toBe(1);
    expect(all.reduce((sum, option) => sum + option.count, 0)).toBe(TASK.assignees.length + 1);
    expect(assigneeOptions(board([TASK, other]), ['hub'])).toEqual([{ login: 'z', count: 1 }]);
  });

  it('фильтры из адреса: ?person= и ?product=, можно несколько', () => {
    expect(filtersFromSearch('')).toEqual(DEFAULT_FILTERS);
    expect(filtersFromSearch('?person=ai-developer&product=team,hub')).toEqual({ assignees: ['ai-developer'], products: ['team', 'hub'] });
  });

  it('имена: «Имя Ф.» из сервиса, иначе логин; pd — «решение PD»', () => {
    const people = board([]).people;
    expect(personName('b', people)).toBe('Бэ Б.');
    expect(personName('c', people)).toBe('c');
    expect(personName('pd', people)).toBe('решение PD');
    expect(productLabel('bot-request')).toBe('Bot · Request');
    expect(productLabel('новый-продукт')).toBe('новый-продукт');
    expect(productOptions(board([TASK]))).toEqual(['bot-request', 'team']);
  });

  it('история: статусы и люди подписями', () => {
    const people = board([]).people;
    expect(historyText({ field: 'status', from: 'new', to: 'waiting' }, people)).toBe('статус: Новая → Ждёт');
    expect(historyText({ field: 'curator', from: null, to: 'b' }, people)).toBe('куратор: Бэ Б.');
    expect(historyText({ field: 'assignees', from: ['b'], to: ['b', 'c'] }, people)).toBe('исполнители: Бэ Б. → Бэ Б., c');
  });

  it('адреса: задача в адресе, раздел без продукта', () => {
    expect(taskIdFromPath('/manage/tasks/bot-request-13')).toBe('bot-request-13');
    expect(taskIdFromPath('/manage/tasks')).toBeNull();
    expect(canonicalAppPath('/manage')).toBeNull();
    expect(canonicalAppPath('/manage/tasks/bot-request-13')).toBeNull();
    expect(canonicalAppPath('/managers')).not.toBeNull();
  });
});
