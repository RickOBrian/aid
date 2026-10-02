import { readSessionCookie, verifySessionCookie } from './_lib/session.js';

/**
 * GET /api/session → 200 `{ "authenticated": true }` или 401.
 *
 * В Яндекс Облаке нет Vercel middleware, а авторизатор API Gateway умеет
 * только отказать, не перенаправить (ADR-038). Поэтому статика открыта, а
 * интерфейс закрывает клиент: `AuthGate` спрашивает этот адрес и без сессии
 * показывает форму входа. Уровень защиты как на Vercel: закрыт интерфейс,
 * бандлы и так были открыты (`middleware.ts` их не проверял).
 */
export async function GET(request: Request): Promise<Response> {
  const cookieSecret = process.env.AUTH_COOKIE_SECRET;
  const cookie = readSessionCookie(request.headers.get('cookie'));
  const payload = cookieSecret && cookie ? await verifySessionCookie(cookie, cookieSecret) : null;

  return new Response(JSON.stringify({ authenticated: payload !== null }), {
    status: payload ? 200 : 401,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
