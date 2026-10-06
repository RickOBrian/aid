/**
 * Функция `presentbook-api` в Яндекс Облаке (ADR-038).
 *
 * За основным шлюзом: `/api/login`, `/api/session`, `/api/plugin-version` —
 * обработчики `api/*.ts` без правок. За шлюзом превью ещё и раздача файлов
 * `pr-N/...` из бакета: интеграция object_storage отдаёт JS как text/plain,
 * а маршрут «параметр–литерал» (`/{pr}/assets/{path+}`) шлюз разбирает
 * неверно — так показал прототип 2026-10-02.
 *
 * Переменные: AUTH_COOKIE_SECRET, BASIC_AUTH_USER, BASIC_AUTH_PASSWORD,
 * GITHUB_RELEASES_TOKEN (Lockbox), PREVIEW_STORAGE_URL (адрес бакета превью).
 */
import { POST as login } from '../../api/login';
import { GET as pluginVersion } from '../../api/plugin-version';
import { GET as session } from '../../api/session';
import { fromResponse, toRequest, type YcHttpEvent } from './adapter';

const NOT_FOUND = () =>
  new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });

/** `/pr-12/driver/x` → объект `pr-12/driver/x`; нет объекта и путь без расширения → `pr-12/index.html`. */
export async function previewStatic(pathname: string, storageUrl: string, fetchImpl: typeof fetch = fetch): Promise<Response> {
  const [pr, ...rest] = pathname.split('/').filter(Boolean);
  if (!pr || !/^pr-\d+$/.test(pr)) {
    return new Response('not found', { status: 404 });
  }
  const key = rest.join('/');
  if (key) {
    const object = await fetchImpl(`${storageUrl}/${pr}/${key}`);
    if (object.ok) {
      return new Response(object.body, {
        status: 200,
        headers: {
          'Content-Type': object.headers.get('content-type') ?? 'application/octet-stream',
          'Cache-Control': key.startsWith('assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=60',
        },
      });
    }
    if (/\.[a-z0-9]+$/i.test(key)) {
      return new Response('not found', { status: 404 });
    }
  }
  const index = await fetchImpl(`${storageUrl}/${pr}/index.html`);
  if (!index.ok) {
    return new Response('preview not found', { status: 404 });
  }
  return new Response(index.body, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' } });
}

const PLACEHOLDER = 'CHANGE_ME';

/**
 * Перед функцией нет CDN, и без кэша каждый заход на страницу плагина шёл бы
 * в GitHub. Экземпляр функции хранит ответ `/api/plugin-version` сам:
 * удачный — 10 минут, неудачный — минуту, как и `s-maxage` в заголовках.
 */
const PLUGIN_VERSION_TTL_MS = { ok: 10 * 60_000, empty: 60_000 };
let pluginVersionCache: { body: string; headers: [string, string][]; expiresAt: number } | null = null;

export async function cachedPluginVersion(
  load: () => Promise<Response> = pluginVersion,
  now: () => number = Date.now,
): Promise<Response> {
  if (pluginVersionCache && pluginVersionCache.expiresAt > now()) {
    return new Response(pluginVersionCache.body, { status: 200, headers: pluginVersionCache.headers });
  }
  const response = await load();
  const body = await response.text();
  const hasRelease = response.ok && !body.includes('"release":null');
  pluginVersionCache = {
    body,
    headers: [...response.headers.entries()],
    expiresAt: now() + (hasRelease ? PLUGIN_VERSION_TTL_MS.ok : PLUGIN_VERSION_TTL_MS.empty),
  };
  return new Response(body, { status: response.status, headers: response.headers });
}

export function resetPluginVersionCache(): void {
  pluginVersionCache = null;
}

/**
 * Секреты Lockbox заводятся с временным значением, настоящие вносит PD.
 * Пока хоть один секрет входа — заглушка, вход закрыт: иначе логин
 * `CHANGE_ME` пустил бы любого, а cookie можно было бы подделать.
 */
export function authConfigured(env: Record<string, string | undefined> = process.env): boolean {
  return ['BASIC_AUTH_USER', 'BASIC_AUTH_PASSWORD', 'AUTH_COOKIE_SECRET'].every((name) => {
    const value = env[name];
    return Boolean(value) && value !== PLACEHOLDER;
  });
}

export async function route(request: Request): Promise<Response> {
  const { pathname } = new URL(request.url);
  if (pathname === '/api/login' && request.method !== 'POST') {
    return NOT_FOUND();
  }
  if ((pathname === '/api/login' || pathname === '/api/session') && !authConfigured()) {
    return pathname === '/api/login'
      ? new Response(JSON.stringify({ error: 'Auth is not configured' }), { status: 503, headers: { 'Content-Type': 'application/json' } })
      : new Response(JSON.stringify({ authenticated: false }), { status: 401, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  }
  if (pathname === '/api/login') {
    return login(request);
  }
  if (pathname === '/api/session') {
    return session(request);
  }
  if (pathname === '/api/plugin-version') {
    return cachedPluginVersion();
  }
  const storageUrl = process.env.PREVIEW_STORAGE_URL;
  if (storageUrl && request.method === 'GET') {
    return previewStatic(pathname, storageUrl);
  }
  return NOT_FOUND();
}

export async function handler(event: YcHttpEvent) {
  // Заглушка вместо токена хуже, чем его отсутствие: GitHub ответит 401.
  // `delete` переменной окружения в Cloud Functions не срабатывает — пустая строка.
  if (process.env.GITHUB_RELEASES_TOKEN === PLACEHOLDER) {
    process.env.GITHUB_RELEASES_TOKEN = '';
  }
  return fromResponse(await route(toRequest(event)));
}
