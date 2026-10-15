import { loadTeamBoard, readTeamKey, type TaskBoard } from './_lib/tasks.js';
import { EXAMPLE_BOARD } from './_lib/tasksExample.js';
import { readSessionCookie, verifySessionCookie } from './_lib/session.js';

/**
 * GET /api/tasks → задачи команды для «Управление → Задачи» (AID-16,
 * ADR-046). Только с валидной сессией, без неё — 401.
 *
 * - превью PR — примерные задачи (`example: true`): ключа Team на превью нет;
 * - не настроено (`TEAM_SECRET_ID` или `TEAM_API_URL` пусты либо `none`) — 503,
 *   страница пишет «сервис задач не подключён», выдуманных задач на сайте нет;
 * - удачный ответ экземпляр функции держит 30 секунд.
 */

const TTL_MS = 30_000;
let cache: { board: TaskBoard; expiresAt: number } | null = null;

export function resetTasksCache(): void {
  cache = null;
}

export interface TasksOptions {
  /** IAM-токен сервисного аккаунта функции (`context.token`). */
  token?: string;
  preview?: boolean;
  load?: (baseUrl: string, key: string) => Promise<TaskBoard | null>;
  readKey?: (secretId: string, token: string) => Promise<string | null>;
  now?: () => number;
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

const configured = (value: string | undefined): value is string => Boolean(value) && value !== 'none';

export async function GET(request: Request, options: TasksOptions = {}): Promise<Response> {
  const cookieSecret = process.env.AUTH_COOKIE_SECRET;
  const cookie = readSessionCookie(request.headers.get('cookie'));
  const session = cookieSecret && cookie ? await verifySessionCookie(cookie, cookieSecret) : null;
  if (!session) {
    return json(401, { error: 'unauthorized' });
  }
  if (options.preview) {
    return json(200, EXAMPLE_BOARD);
  }

  const now = options.now ?? Date.now;
  if (cache && cache.expiresAt > now()) {
    return json(200, cache.board);
  }

  const secretId = process.env.TEAM_SECRET_ID;
  const baseUrl = process.env.TEAM_API_URL;
  if (!configured(secretId) || !configured(baseUrl) || !options.token) {
    return json(503, { error: 'not configured' });
  }

  let board: TaskBoard | null = null;
  try {
    const key = await (options.readKey ?? readTeamKey)(secretId, options.token);
    board = key ? await (options.load ?? loadTeamBoard)(baseUrl, key) : null;
  } catch {
    console.error('tasks: сервис задач или Lockbox недоступны');
  }
  if (!board) {
    return json(503, { error: 'unavailable' });
  }
  cache = { board, expiresAt: now() + TTL_MS };
  return json(200, board);
}
