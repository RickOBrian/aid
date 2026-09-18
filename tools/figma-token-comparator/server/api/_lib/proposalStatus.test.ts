/**
 * Статусы отправленных решений — жизненный цикл предложения.
 *
 * Плагин знает, что решение отправлено, но не знает, что с ним стало.
 * Согласованные он узнаёт сам — по реестру main. Здесь — остальное: запрос
 * ещё открыт или закрыт без мержа (отклонён).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { handleProposalStatus, validateProposalStatusBody } from './proposalStatus.js';

const VALID_SECRET = 'test-shared-secret';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function registry(entries: Array<Record<string, unknown>>): Response {
  const content = { schemaVersion: '1.0', registryVersion: 1, updatedAt: '2026-09-18T00:00:00.000Z', entries };
  return jsonResponse(200, {
    content: Buffer.from(JSON.stringify(content), 'utf8').toString('base64'),
    encoding: 'base64',
    sha: 'sha',
  });
}

const MAIN_ENTRY = { signature: 'sig-main', decision: 'mapped', targetVariableId: 'V:1', status: 'approved' };

const PULLS = [
  {
    number: 7,
    html_url: 'https://github.com/RickOBrian/aid/pull/7',
    state: 'open',
    merged_at: null,
    closed_at: null,
    head: { ref: 'registry/propose-7', sha: 'sha-open' },
  },
  {
    number: 6,
    html_url: 'https://github.com/RickOBrian/aid/pull/6',
    state: 'closed',
    merged_at: null,
    closed_at: '2026-09-17T10:00:00Z',
    head: { ref: 'registry/propose-6', sha: 'sha-rejected' },
  },
  {
    number: 5,
    html_url: 'https://github.com/RickOBrian/aid/pull/5',
    state: 'closed',
    merged_at: '2026-09-16T10:00:00Z',
    closed_at: '2026-09-16T10:00:00Z',
    head: { ref: 'registry/propose-5', sha: 'sha-merged' },
  },
  {
    number: 4,
    html_url: 'https://github.com/RickOBrian/aid/pull/4',
    state: 'open',
    merged_at: null,
    closed_at: null,
    head: { ref: 'feature/unrelated', sha: 'sha-other' },
  },
];

let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

beforeEach(() => {
  process.env.PLUGIN_SHARED_SECRET = VALID_SECRET;
  process.env.GITHUB_TOKEN = 'github-token-test';
  fetchMock = vi.fn<typeof fetch>(async (input) => {
    const url = String(input);
    if (url.includes('/pulls?state=all')) return jsonResponse(200, PULLS);
    if (url.includes('/contents/decisions-registry.json?ref=main')) return registry([MAIN_ENTRY]);
    if (url.includes('?ref=sha-open')) {
      // На ветке запроса лежит весь реестр: и main, и новое решение.
      return registry([MAIN_ENTRY, { signature: 'sig-open', decision: 'ignored', comment: 'x', status: 'approved' }]);
    }
    if (url.includes('?ref=sha-rejected')) {
      return registry([MAIN_ENTRY, { signature: 'sig-rejected', decision: 'candidate', status: 'approved' }]);
    }
    if (url.endsWith('/issues/6/comments?per_page=100')) {
      return jsonResponse(200, [{ body: 'сначала' }, { body: 'Такой токен уже есть — используйте text-primary.' }]);
    }
    throw new Error(`Unexpected fetch: ${url}`);
  });
});

async function call(body: unknown): Promise<Response> {
  return handleProposalStatus(
    new Request('https://example.com/api/registry/proposal-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { fetchImpl: fetchMock },
  );
}

describe('validateProposalStatusBody', () => {
  it('принимает ключ и список подписей', () => {
    expect(validateProposalStatusBody({ sharedSecret: 's', signatures: ['a', 'b'] })).toEqual({
      sharedSecret: 's',
      signatures: ['a', 'b'],
    });
  });

  it.each([
    [{ signatures: ['a'] }],
    [{ sharedSecret: 's' }],
    [{ sharedSecret: 's', signatures: 'a' }],
    [{ sharedSecret: 's', signatures: [1] }],
    [{ sharedSecret: 's', signatures: Array.from({ length: 501 }, (_, i) => `s${i}`) }],
  ])('отклоняет некорректное тело %#', (body) => {
    expect(validateProposalStatusBody(body)).toBeNull();
  });
});

describe('handleProposalStatus', () => {
  it('без верного ключа — 401', async () => {
    const response = await call({ sharedSecret: 'wrong', signatures: ['sig-open'] });
    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('открытый запрос — open с номером и ссылкой', async () => {
    const body = await (await call({ sharedSecret: VALID_SECRET, signatures: ['sig-open'] })).json();
    expect(body.statuses['sig-open']).toEqual({
      state: 'open',
      number: 7,
      url: 'https://github.com/RickOBrian/aid/pull/7',
    });
  });

  it('закрытый без мержа — rejected с последним комментарием', async () => {
    const body = await (await call({ sharedSecret: VALID_SECRET, signatures: ['sig-rejected'] })).json();
    expect(body.statuses['sig-rejected']).toEqual({
      state: 'rejected',
      number: 6,
      url: 'https://github.com/RickOBrian/aid/pull/6',
      closedAt: '2026-09-17T10:00:00Z',
      comment: 'Такой токен уже есть — используйте text-primary.',
    });
  });

  it('решение, которое и так есть в main, запросу не приписывается', async () => {
    const body = await (await call({ sharedSecret: VALID_SECRET, signatures: ['sig-main', 'sig-unknown'] })).json();
    expect(body.statuses).toEqual({});
  });

  it('смёрженные запросы и чужие ветки не читаются', async () => {
    await call({ sharedSecret: VALID_SECRET, signatures: ['sig-open', 'sig-rejected'] });
    const urls = fetchMock.mock.calls.map(([input]) => String(input));
    expect(urls.some((url) => url.includes('sha-merged'))).toBe(false);
    expect(urls.some((url) => url.includes('sha-other'))).toBe(false);
  });

  it('когда всё найдено, дальше запросы не читаются', async () => {
    await call({ sharedSecret: VALID_SECRET, signatures: ['sig-open'] });
    const urls = fetchMock.mock.calls.map(([input]) => String(input));
    expect(urls.some((url) => url.includes('sha-rejected'))).toBe(false);
  });
});
