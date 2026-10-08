import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, resetTtmCache } from '../api/ttm';
import { isTtmData, loadTtmFromLockbox, type TtmData } from '../api/_lib/ttm';
import { createSessionPayload, signSessionCookie, SESSION_COOKIE_NAME } from '../api/_lib/session';
import { handler } from '../deploy/yc/handler';
import { TTM_COLORS } from '../ttmColors';
import { calcTotals, chainHours, leversFromData, platformShare } from '../ttmModel';

/**
 * Страница «КПД команды AID» (`/ttm`, AID-13). Данные закрытые — в тестах
 * только выдуманный набор, не настоящий.
 */

const SAMPLE: TtmData = {
  eyebrow: 'e',
  title: 't',
  intro: 'i',
  owners: [
    { id: 'a', name: 'Владелец A' },
    { id: 'b', name: 'Владелец B' },
  ],
  defaults: { designers: 2, developers: 3, engineers: 1, products: 2, rate: 1000, load: 100 },
  pilotsLabel: 'p',
  tools: [
    { id: 'x', owner: 'a', name: 'X', type: 'Plugin', status: 'прод', job: 'j', was: 'w', now: 'n', ops: [{ label: 'o', role: 'designer', before: 60, after: 6, perMonth: 5 }] },
    { id: 'y', owner: 'b', name: 'Y', type: 'Bot', status: 'пилот', pilot: true, job: 'j', was: 'w', now: 'n', ops: [{ label: 'o', role: 'product', before: 120, after: 30, perMonth: 1 }] },
    { id: 'z', owner: 'a', name: 'Z', type: 'Hub', status: 'прод', job: 'j', was: 'w', now: 'n', ops: [{ label: 'o', role: 'team', before: 30, after: 0, perMonth: 4 }] },
  ],
  chain: { intro: 'c', before: [{ label: 's', hours: 8 }, { label: 'w', hours: 16, wait: true }], after: [{ label: 's', hours: 0.5 }] },
  facts: { eyebrow: 'f', items: [{ value: '10', label: 'l' }] },
  method: [{ title: 'm', text: 't' }],
};

describe('формулы КПД', () => {
  it('часы = минуты × раз в месяц × люди роли × загрузка ÷ 60', () => {
    const levers = leversFromData(SAMPLE);
    const totals = calcTotals(SAMPLE, levers);
    // X: 2 дизайнера × 5 раз: 600 → 60 мин; Y: 2 продукта × 1: 240 → 60; Z: команда × 4: 120 → 0.
    expect(totals.before).toBeCloseTo((600 + 240 + 120) / 60);
    expect(totals.after).toBeCloseTo((60 + 60) / 60);
    expect(totals.saved).toBeCloseTo(14);
    expect(totals.factor).toBeCloseTo(16 / 2);
    expect(totals.rubPerMonth).toBeCloseTo(14_000);
  });

  it('загрузка и число людей масштабируют часы, пилоты выключаются', () => {
    const levers = { ...leversFromData(SAMPLE), load: 1.5, designers: 4, pilots: false };
    const totals = calcTotals(SAMPLE, levers);
    expect(totals.rows.map((row) => row.tool.id)).toEqual(['x', 'z']);
    expect(totals.before).toBeCloseTo(((60 * 5 * 4 + 30 * 4) * 1.5) / 60);
  });

  it('ноль часов «стало» — КПД 0, а не бесконечность', () => {
    const only: TtmData = { ...SAMPLE, tools: [SAMPLE.tools[2]] };
    expect(calcTotals(only, leversFromData(only)).factor).toBe(0);
  });

  it('платформа: по умолчанию iOS и Android поровну — часы делятся, КПД тот же', () => {
    const all = calcTotals(SAMPLE, leversFromData(SAMPLE));
    const ios = calcTotals(SAMPLE, { ...leversFromData(SAMPLE), platform: 'ios' });
    const android = calcTotals(SAMPLE, { ...leversFromData(SAMPLE), platform: 'android' });
    expect(ios.before).toBeCloseTo(all.before / 2);
    expect(ios.saved + android.saved).toBeCloseTo(all.saved);
    expect(ios.factor).toBeCloseTo(all.factor);
    // Бот (Y) не отдельная платформа: его часы есть и в iOS, и в Android.
    expect(ios.rows.map((row) => row.tool.id)).toEqual(['x', 'y', 'z']);
  });

  it('платформа: доли из данных нормируются, нет доли — ноль', () => {
    const tool = { ...SAMPLE.tools[0], platforms: { ios: 3, android: 1 } };
    expect(platformShare(tool, 'ios')).toBeCloseTo(0.75);
    expect(platformShare(tool, 'android')).toBeCloseTo(0.25);
    expect(platformShare({ ...tool, platforms: { ios: 1 } }, 'android')).toBe(0);
    expect(platformShare(SAMPLE.tools[0], 'all')).toBe(1);
    expect(isTtmData({ ...SAMPLE, tools: [tool] })).toBe(true);
    expect(isTtmData({ ...SAMPLE, tools: [{ ...tool, platforms: { telegram: 1 } }] })).toBe(false);
  });

  it('путь изменения — сумма часов шагов', () => {
    expect(chainHours(SAMPLE.chain.before)).toBe(24);
  });
});

describe('цвета страницы', () => {
  it('«вручную» — семантический токен Driver, не литерал в коде', () => {
    expect(TTM_COLORS.before).toMatch(/^#[0-9A-F]{6}$/i);
  });
});

describe('проверка формы данных', () => {
  it('принимает полный набор и отклоняет сломанный', () => {
    expect(isTtmData(SAMPLE)).toBe(true);
    expect(isTtmData({ ...SAMPLE, owners: 'a' })).toBe(false);
    expect(isTtmData({ ...SAMPLE, tools: [{ ...SAMPLE.tools[0], was: undefined }] })).toBe(false);
    expect(isTtmData({ ...SAMPLE, tools: [{ ...SAMPLE.tools[0], ops: [] }] })).toBe(false);
    expect(isTtmData({ ...SAMPLE, tools: [{ ...SAMPLE.tools[0], ops: [{ ...SAMPLE.tools[0].ops[0], role: 'boss' }] }] })).toBe(false);
    expect(isTtmData({ ...SAMPLE, defaults: { ...SAMPLE.defaults, rate: -1 } })).toBe(false);
  });
});

describe('loadTtmFromLockbox', () => {
  const lockbox = (body: unknown, status = 200) => vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

  it('берёт ключ TTM_DATA из ответа Payload API, с токеном функции', async () => {
    const fetchImpl = lockbox({ entries: [{ key: 'TTM_DATA', textValue: JSON.stringify(SAMPLE) }] });
    expect(await loadTtmFromLockbox('sec1', 'iam', fetchImpl)).toEqual(SAMPLE);
    const [url, init] = (fetchImpl as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls[0];
    expect(url).toBe('https://payload.lockbox.api.cloud.yandex.net/lockbox/v1/secrets/sec1/payload');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer iam');
  });

  it('ошибка Lockbox, нет ключа, не JSON, не та форма — null, данные в журнал не пишутся', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await loadTtmFromLockbox('s', 't', lockbox({}, 403))).toBeNull();
    expect(await loadTtmFromLockbox('s', 't', lockbox({ entries: [] }))).toBeNull();
    expect(await loadTtmFromLockbox('s', 't', lockbox({ entries: [{ key: 'TTM_DATA', textValue: '{' }] }))).toBeNull();
    expect(await loadTtmFromLockbox('s', 't', lockbox({ entries: [{ key: 'TTM_DATA', textValue: '{"secret":"Владелец A"}' }] }))).toBeNull();
    expect(log.mock.calls.flat().join(' ')).not.toContain('Владелец');
    log.mockRestore();
  });
});

const SECRET = 'test-secret-only-for-unit-tests';

function request(cookie?: string, path = '/api/ttm'): Request {
  return new Request(`https://example.test${path}`, { headers: cookie ? { cookie } : {} });
}

describe('GET /api/ttm', () => {
  beforeEach(() => {
    process.env.AUTH_COOKIE_SECRET = SECRET;
    process.env.TTM_SECRET_ID = 'sec1';
    resetTtmCache();
  });
  afterEach(() => {
    delete process.env.AUTH_COOKIE_SECRET;
    delete process.env.TTM_SECRET_ID;
  });

  it('без сессии — 401, в Lockbox не ходит', async () => {
    const load = vi.fn(async () => SAMPLE);
    const response = await GET(request(), { token: 't', load });
    expect(response.status).toBe(401);
    expect(await response.text()).not.toContain('Владелец');
    const forged = await signSessionCookie(createSessionPayload(), 'other');
    expect((await GET(request(`${SESSION_COOKIE_NAME}=${forged}`), { token: 't', load })).status).toBe(401);
    expect(load).not.toHaveBeenCalled();
  });

  it('с сессией — 200, no-store, и ответ держится в кэше экземпляра', async () => {
    const cookie = `${SESSION_COOKIE_NAME}=${await signSessionCookie(createSessionPayload(), SECRET)}`;
    const load = vi.fn(async () => SAMPLE);
    const response = await GET(request(cookie), { token: 't', load });
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.json()).toEqual(SAMPLE);
    await GET(request(cookie), { token: 't', load });
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('не настроено или Lockbox не ответил — 503', async () => {
    const cookie = `${SESSION_COOKIE_NAME}=${await signSessionCookie(createSessionPayload(), SECRET)}`;
    process.env.TTM_SECRET_ID = 'none';
    expect((await GET(request(cookie), { token: 't', load: async () => SAMPLE })).status).toBe(503);
    process.env.TTM_SECRET_ID = 'sec1';
    expect((await GET(request(cookie), { load: async () => SAMPLE })).status).toBe(503);
    expect((await GET(request(cookie), { token: 't', load: async () => null })).status).toBe(503);
  });
});

describe('функция: /api/ttm на превью', () => {
  beforeEach(() => {
    Object.assign(process.env, { BASIC_AUTH_USER: 'u', BASIC_AUTH_PASSWORD: 'p', AUTH_COOKIE_SECRET: SECRET });
  });
  afterEach(() => {
    for (const name of ['BASIC_AUTH_USER', 'BASIC_AUTH_PASSWORD', 'AUTH_COOKIE_SECRET']) {
      delete process.env[name];
    }
  });

  const event = (path: string, cookie?: string) => ({
    httpMethod: 'GET',
    url: path,
    path,
    headers: cookie ? { Cookie: cookie } : {},
    multiValueHeaders: {},
    queryStringParameters: {},
    multiValueQueryStringParameters: {},
    requestContext: {},
    body: '',
    isBase64Encoded: false,
  });

  it('/pr-N/api/ttm — 404 даже с сессией: данные только на основном сайте', async () => {
    const cookie = `${SESSION_COOKIE_NAME}=${await signSessionCookie(createSessionPayload(), SECRET)}`;
    const result = await handler(event('/pr-7/api/ttm', cookie) as never, undefined);
    expect(result.statusCode).toBe(404);
  });

  it('версия pr-N: переадресованное событие с /api/ttm — 404 даже с сессией', async () => {
    const cookie = `${SESSION_COOKIE_NAME}=${await signSessionCookie(createSessionPayload(), SECRET)}`;
    const proxied = { ...event('/api/ttm', cookie), __presentbookPreviewProxied: true };
    expect((await handler(proxied as never, { token: 't' })).statusCode).toBe(404);
    expect((await handler(JSON.stringify(proxied), { token: 't' })).statusCode).toBe(404);
  });

  it('/api/ttm на сайте без сессии — 401', async () => {
    const result = await handler(event('/api/ttm') as never, { token: 't' });
    expect(result.statusCode).toBe(401);
  });
});

describe('страж: закрытые данные не лежат в репозитории портала', () => {
  const appRoot = join(__dirname, '..');

  it('файл локальных данных в .gitignore', () => {
    expect(readFileSync(join(appRoot, '.gitignore'), 'utf8')).toMatch(/^ttm-data\.local\.json$/m);
  });

  it('в коде страницы нет данных: ни владельцев, ни ставки по умолчанию', () => {
    const sources = ['TtmPage.tsx', 'ttmModel.ts', 'api/ttm.ts', 'api/_lib/ttm.ts']
      .filter((name) => existsSync(join(appRoot, name)))
      .map((name) => readFileSync(join(appRoot, name), 'utf8'))
      .join('\n');
    expect(sources).not.toMatch(/2[\s ]?500/);
    expect(readdirSync(appRoot).filter((name) => /^ttm.*\.json$/.test(name) && name !== 'ttm-data.local.json')).toEqual([]);
  });
});
