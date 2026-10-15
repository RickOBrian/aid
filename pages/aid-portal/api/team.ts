import { loadOwners, type Owners } from './_lib/owners.js';
import { readSessionCookie, verifySessionCookie } from './_lib/session.js';

/**
 * GET /api/team → инженеры AID для `/manage/team` (team-3): люди и
 * AI-инженеры из `docs/hub/owners.json` на main. Только с сессией, как весь
 * раздел «Управление»; без неё — 401. Файл публичный, поэтому превью
 * получает те же данные. Ответ экземпляр держит 5 минут; GitHub недоступен —
 * 503.
 */

const TTL_MS = 5 * 60_000;
let cache: { owners: Owners; expiresAt: number } | null = null;

export function resetTeamCache(): void {
  cache = null;
}

export interface TeamOptions {
  load?: () => Promise<Owners | null>;
  now?: () => number;
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export async function GET(request: Request, options: TeamOptions = {}): Promise<Response> {
  const cookieSecret = process.env.AUTH_COOKIE_SECRET;
  const cookie = readSessionCookie(request.headers.get('cookie'));
  const session = cookieSecret && cookie ? await verifySessionCookie(cookie, cookieSecret) : null;
  if (!session) {
    return json(401, { error: 'unauthorized' });
  }
  const now = options.now ?? Date.now;
  if (cache && cache.expiresAt > now()) {
    return json(200, cache.owners);
  }
  let owners: Owners | null = null;
  try {
    owners = await (options.load ?? loadOwners)();
  } catch {
    console.error('team: owners.json недоступен');
  }
  if (!owners) {
    return json(503, { error: 'unavailable' });
  }
  cache = { owners, expiresAt: now() + TTL_MS };
  return json(200, owners);
}
