/**
 * Адаптер Cloud Functions: событие шлюза → Request → тот же обработчик, что
 * у Vercel → объект ответа. Логику обработчиков проверяют их собственные
 * тесты; здесь — только то, что событие доходит до них без потерь.
 */

import { beforeEach, describe, expect, it } from 'vitest';

import { eventToRequest, responseToResult, type YcHttpEvent } from './adapter.js';
import { handler } from './handler.js';

const SECRET = 'test-shared-secret';

function event(overrides: Partial<YcHttpEvent>): YcHttpEvent {
  return {
    httpMethod: 'POST',
    path: '/api/registry/proposal-status',
    headers: { Host: 'api.aidteam.pro', 'Content-Type': 'application/json' },
    ...overrides,
  };
}

beforeEach(() => {
  process.env.PLUGIN_SHARED_SECRET = SECRET;
  process.env.GITHUB_TOKEN = 'github-token-test';
});

describe('eventToRequest', () => {
  it('собирает абсолютный URL из Host и пути с query', () => {
    const request = eventToRequest(
      event({ httpMethod: 'GET', path: '/api/registry', queryStringParameters: { a: '1' } }),
    );
    expect(request.url).toBe('https://api.aidteam.pro/api/registry?a=1');
    expect(request.method).toBe('GET');
  });

  it('берёт url целиком, если шлюз его прислал', () => {
    const request = eventToRequest(event({ url: '/api/registry?x=y', path: '/api/registry' }));
    expect(request.url).toBe('https://api.aidteam.pro/api/registry?x=y');
  });

  it('декодирует тело в base64', async () => {
    const body = JSON.stringify({ привет: 'мир' });
    const request = eventToRequest(event({ body: Buffer.from(body).toString('base64'), isBase64Encoded: true }));
    expect(await request.text()).toBe(body);
  });

  it('не задваивает заголовок из headers и multiValueHeaders', () => {
    const request = eventToRequest(
      event({
        headers: { Host: 'api.aidteam.pro', 'X-Plugin-Secret': 'k' },
        multiValueHeaders: { 'X-Plugin-Secret': ['k'] },
      }),
    );
    expect(request.headers.get('x-plugin-secret')).toBe('k');
  });

  it('у GET тело не передаётся', async () => {
    const request = eventToRequest(event({ httpMethod: 'GET', body: 'ignored' }));
    expect(request.body).toBeNull();
  });
});

describe('responseToResult', () => {
  it('переносит статус, заголовки и тело', async () => {
    const result = await responseToResult(
      new Response('{"ok":true}', { status: 201, headers: { 'Content-Type': 'application/json' } }),
    );
    expect(result).toEqual({
      statusCode: 201,
      headers: { 'content-type': 'application/json' },
      multiValueHeaders: { 'content-type': ['application/json'] },
      body: '{"ok":true}',
      isBase64Encoded: false,
    });
  });
});

describe('handler', () => {
  it('OPTIONS — 204 с заголовками CORS для preflight из Figma', async () => {
    const result = await handler(event({ httpMethod: 'OPTIONS' }));
    expect(result.statusCode).toBe(204);
    expect(result.headers['access-control-allow-origin']).toBe('*');
    expect(result.headers['access-control-allow-headers']).toContain('X-Plugin-Secret');
  });

  it('доводит запрос до обработчика: неверный ключ — 401 с CORS', async () => {
    const result = await handler(event({ body: JSON.stringify({ sharedSecret: 'wrong', signatures: ['s'] }) }));
    expect(result.statusCode).toBe(401);
    expect(JSON.parse(result.body)).toEqual({ error: 'unauthorized' });
    expect(result.headers['access-control-allow-origin']).toBe('*');
  });

  it('путь с косой чертой в конце — тот же маршрут', async () => {
    const result = await handler(event({ httpMethod: 'OPTIONS', path: '/api/registry/proposal-status/' }));
    expect(result.statusCode).toBe(204);
  });

  it('неизвестный путь — 404', async () => {
    const result = await handler(event({ path: '/api/unknown' }));
    expect(result.statusCode).toBe(404);
  });

  it('метод, которого у маршрута нет, — 405', async () => {
    const result = await handler(event({ httpMethod: 'GET', path: '/api/registry/propose-decision' }));
    expect(result.statusCode).toBe(405);
  });
});
