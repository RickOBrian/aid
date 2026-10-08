import { loadTtmFromLockbox, type TtmData } from './_lib/ttm.js';
import { readSessionCookie, verifySessionCookie } from './_lib/session.js';

/**
 * GET /api/ttm → 200 с данными страницы «КПД команды AID» (`/ttm`), только с
 * валидной сессией; без неё — 401, как `/api/session`. Данные закрытые
 * (решение PD «1 а», AID-13): в репозитории, превью и журналах их нет.
 *
 * Не настроено (`TTM_SECRET_ID` пуст или `none`), нет токена функции или
 * Lockbox не ответил — 503. Удачный ответ экземпляр функции держит 5 минут.
 */

const TTL_MS = 5 * 60_000;
let cache: { data: TtmData; expiresAt: number } | null = null;

export function resetTtmCache(): void {
  cache = null;
}

export interface TtmOptions {
  /** IAM-токен сервисного аккаунта функции (`context.token`). */
  token?: string;
  load?: (secretId: string, token: string) => Promise<TtmData | null>;
  now?: () => number;
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export async function GET(request: Request, options: TtmOptions = {}): Promise<Response> {
  const cookieSecret = process.env.AUTH_COOKIE_SECRET;
  const cookie = readSessionCookie(request.headers.get('cookie'));
  const session = cookieSecret && cookie ? await verifySessionCookie(cookie, cookieSecret) : null;
  if (!session) {
    return json(401, { error: 'unauthorized' });
  }

  const now = options.now ?? Date.now;
  if (cache && cache.expiresAt > now()) {
    return json(200, cache.data);
  }

  const secretId = process.env.TTM_SECRET_ID;
  if (!secretId || secretId === 'none' || !options.token) {
    return json(503, { error: 'not configured' });
  }

  let data: TtmData | null = null;
  try {
    data = await (options.load ?? loadTtmFromLockbox)(secretId, options.token);
  } catch {
    console.error('ttm: Lockbox недоступен');
  }
  if (!data) {
    return json(503, { error: 'unavailable' });
  }
  cache = { data, expiresAt: now() + TTL_MS };
  return json(200, data);
}
