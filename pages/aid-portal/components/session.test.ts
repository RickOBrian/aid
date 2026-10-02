import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GET } from '../api/session';
import { createSessionPayload, signSessionCookie, SESSION_COOKIE_NAME } from '../api/_lib/session';

/**
 * /api/session — проверка входа для клиентского AuthGate (ADR-038).
 */

const SECRET = 'test-secret-only-for-unit-tests';

function request(cookie?: string): Request {
  return new Request('https://example.test/api/session', { headers: cookie ? { cookie } : {} });
}

describe('GET /api/session', () => {
  beforeEach(() => {
    process.env.AUTH_COOKIE_SECRET = SECRET;
  });
  afterEach(() => {
    delete process.env.AUTH_COOKIE_SECRET;
  });

  it('с подписанной cookie — 200', async () => {
    const cookie = await signSessionCookie(createSessionPayload(), SECRET);
    const response = await GET(request(`${SESSION_COOKIE_NAME}=${cookie}`));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ authenticated: true });
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('без cookie и с чужой подписью — 401', async () => {
    expect((await GET(request())).status).toBe(401);
    const forged = await signSessionCookie(createSessionPayload(), 'other-secret');
    expect((await GET(request(`${SESSION_COOKIE_NAME}=${forged}`))).status).toBe(401);
  });

  it('без настроенного секрета — 401, а не открытый доступ', async () => {
    const cookie = await signSessionCookie(createSessionPayload(), SECRET);
    delete process.env.AUTH_COOKIE_SECRET;
    expect((await GET(request(`${SESSION_COOKIE_NAME}=${cookie}`))).status).toBe(401);
  });
});
