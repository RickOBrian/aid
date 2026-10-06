import { describe, expect, it, vi } from 'vitest';
import { fromResponse, toRequest } from '../deploy/yc/adapter';
import { authConfigured, cachedPluginVersion, handler, invokePreviewVersion, previewStatic, resetPluginVersionCache, route } from '../deploy/yc/handler';

/**
 * Функция presentbook-api в Яндекс Облаке (ADR-038): адаптер событие ↔ Web API
 * и раздача превью. Прототип 2026-10-02 подтвердил формат на настоящем шлюзе.
 */

describe('toRequest', () => {
  it('собирает адрес, заголовки и тело POST', async () => {
    const request = toRequest({
      httpMethod: 'POST',
      url: '/api/login',
      headers: { Host: 'aidteam.pro', 'Content-Type': 'application/json', Cookie: 'a=1' },
      body: Buffer.from('{"u":1}').toString('base64'),
      isBase64Encoded: true,
    });
    expect(request.url).toBe('https://aidteam.pro/api/login');
    expect(request.headers.get('cookie')).toBe('a=1');
    expect(await request.text()).toBe('{"u":1}');
  });

  it('у GET тела нет, параметры запроса сохраняются', () => {
    const request = toRequest({ httpMethod: 'GET', path: '/api/plugin-version', headers: { Host: 'x' }, queryStringParameters: { a: '1' }, body: '' });
    expect(request.url).toBe('https://x/api/plugin-version?a=1');
  });
});

describe('fromResponse', () => {
  it('несколько Set-Cookie — отдельными значениями в multiValueHeaders', async () => {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    headers.append('Set-Cookie', 'a=1; Path=/');
    headers.append('Set-Cookie', 'b=2; Path=/');
    const result = await fromResponse(new Response('{}', { status: 200, headers }));
    expect(result.multiValueHeaders['Set-Cookie']).toEqual(['a=1; Path=/', 'b=2; Path=/']);
    expect(result.headers['set-cookie']).toBeUndefined();
    expect(result.isBase64Encoded).toBe(false);
  });

  it('двоичное тело — base64', async () => {
    const result = await fromResponse(new Response(new Uint8Array([0, 255]), { headers: { 'Content-Type': 'image/png' } }));
    expect(result).toMatchObject({ isBase64Encoded: true, body: 'AP8=' });
  });
});

describe('previewStatic', () => {
  const STORAGE = 'https://storage.test/bucket';
  const files: Record<string, [string, string]> = {
    'pr-3/index.html': ['<html>', 'text/html; charset=utf-8'],
    'pr-3/assets/app.js': ['js', 'text/javascript'],
  };
  const fakeFetch = vi.fn(async (url: string | URL | Request) => {
    const key = String(url).replace(`${STORAGE}/`, '');
    const file = files[key];
    return file ? new Response(file[0], { headers: { 'Content-Type': file[1] } }) : new Response('', { status: 404 });
  }) as unknown as typeof fetch;

  it('файл — с его типом', async () => {
    const response = await previewStatic('/pr-3/assets/app.js', STORAGE, fakeFetch);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/javascript');
  });

  it('маршрут SPA — index.html превью со статусом 200', async () => {
    const response = await previewStatic('/pr-3/driver/tokens/colors', STORAGE, fakeFetch);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('<html>');
  });

  it('отсутствующий файл с расширением — 404, не HTML', async () => {
    expect((await previewStatic('/pr-3/assets/missing.js', STORAGE, fakeFetch)).status).toBe(404);
  });

  it('не pr-N — 404, в бакет не ходит', async () => {
    const before = (fakeFetch as unknown as { mock: { calls: unknown[] } }).mock.calls.length;
    expect((await previewStatic('/secrets/x', STORAGE, fakeFetch)).status).toBe(404);
    expect((fakeFetch as unknown as { mock: { calls: unknown[] } }).mock.calls.length).toBe(before);
  });
});

describe('route', () => {
  it('GET на /api/login — 404, вход только POST', async () => {
    expect((await route(new Request('https://x/api/login'))).status).toBe(404);
  });
});

describe('authConfigured', () => {
  it('заглушка CHANGE_ME в любом секрете входа — вход закрыт', () => {
    const real = { BASIC_AUTH_USER: 'u', BASIC_AUTH_PASSWORD: 'p', AUTH_COOKIE_SECRET: 's' };
    expect(authConfigured(real)).toBe(true);
    expect(authConfigured({ ...real, AUTH_COOKIE_SECRET: 'CHANGE_ME' })).toBe(false);
    expect(authConfigured({ ...real, BASIC_AUTH_PASSWORD: '' })).toBe(false);
  });
});

describe('cachedPluginVersion', () => {
  const ok = () => new Response('{"release":{"version":"v1.6.0"}}', { headers: { 'Content-Type': 'application/json' } });
  const empty = () => new Response('{"release":null}', { headers: { 'Content-Type': 'application/json' } });

  it('удачный ответ держит 10 минут — GitHub не дёргается на каждый заход', async () => {
    resetPluginVersionCache();
    const load = vi.fn(async () => ok());
    let t = 0;
    await cachedPluginVersion(load, () => t);
    t = 9 * 60_000;
    expect(await (await cachedPluginVersion(load, () => t)).text()).toContain('v1.6.0');
    expect(load).toHaveBeenCalledTimes(1);
    t = 11 * 60_000;
    await cachedPluginVersion(load, () => t);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('пустой ответ держит только минуту', async () => {
    resetPluginVersionCache();
    const load = vi.fn(async () => empty());
    let t = 0;
    await cachedPluginVersion(load, () => t);
    t = 61_000;
    await cachedPluginVersion(load, () => t);
    expect(load).toHaveBeenCalledTimes(2);
  });
});

describe('превью API: /pr-N/api/... в версию функции этого PR', () => {
  const event = (url: string, extra: Record<string, unknown> = {}) => ({ httpMethod: 'GET', url, headers: { Host: 'preview.aidteam.pro' }, ...extra });

  it('вызывает версию с меткой pr-N по API функций, событие — без префикса', async () => {
    process.env.FUNCTION_ID = 'fn-test';
    const fakeFetch = vi.fn(async () => new Response(JSON.stringify({ statusCode: 200, headers: {}, multiValueHeaders: {}, body: '{"from":"pr-7"}', isBase64Encoded: false })));
    const result = await invokePreviewVersion('pr-7', event('/api/plugin-version'), { token: { access_token: 'iam' } }, fakeFetch as unknown as typeof fetch);
    expect(result?.body).toBe('{"from":"pr-7"}');
    const [url, init] = fakeFetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://functions.yandexcloud.net/fn-test?tag=pr-7&integration=raw');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer iam');
    expect(JSON.parse(String(init.body))).toMatchObject({ url: '/api/plugin-version', __presentbookPreviewProxied: true });
    delete process.env.FUNCTION_ID;
  });

  it('нет версии pr-N (404) или токена — null, отвечает prod', async () => {
    process.env.FUNCTION_ID = 'fn-test';
    const notFound = vi.fn(async () => new Response('', { status: 404 }));
    expect(await invokePreviewVersion('pr-7', event('/api/x'), { token: 'iam' }, notFound as unknown as typeof fetch)).toBeNull();
    expect(await invokePreviewVersion('pr-7', event('/api/x'), undefined, notFound as unknown as typeof fetch)).toBeNull();
    delete process.env.FUNCTION_ID;
  });

  it('без версии PR /pr-N/api/... обрабатывает сам, как /api/...', async () => {
    const result = await handler(event('/pr-7/api/login'));
    expect(result.statusCode).toBe(404); // GET на /api/login — 404, то есть маршрут API, а не раздача превью
  });

  it('переадресованное событие (строкой, с меткой) не уходит дальше по кругу', async () => {
    const fakeFetch = vi.fn();
    vi.stubGlobal('fetch', fakeFetch);
    process.env.FUNCTION_ID = 'fn-test';
    const result = await handler(JSON.stringify(event('/pr-7/api/login', { __presentbookPreviewProxied: true })), { token: 'iam' });
    expect(result.statusCode).toBe(404);
    expect(fakeFetch).not.toHaveBeenCalled();
    delete process.env.FUNCTION_ID;
    vi.unstubAllGlobals();
  });
});
