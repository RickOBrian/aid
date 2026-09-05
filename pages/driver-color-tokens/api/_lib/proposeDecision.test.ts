import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { handleProposeDecision, validateProposeDecisionBody } from './proposeDecision.js';

const VALID_SECRET = 'test-shared-secret';
const GITHUB_TOKEN = 'github-token-test';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function encodeRegistry(content: Record<string, unknown>, sha = 'file-sha-1'): Response {
  return jsonResponse(200, {
    content: Buffer.from(JSON.stringify(content), 'utf8').toString('base64'),
    encoding: 'base64',
    sha,
  });
}

describe('validateProposeDecisionBody', () => {
  it('accepts a valid payload', () => {
    const result = validateProposeDecisionBody({
      sharedSecret: 'secret',
      proposedBy: 'designer@example.com',
      entries: [{ signature: 'sig-1', decision: 'mapped' }],
    });
    expect(result).not.toBeNull();
    expect(result?.entries).toHaveLength(1);
  });

  it('rejects empty entries', () => {
    expect(
      validateProposeDecisionBody({
        sharedSecret: 'secret',
        proposedBy: 'designer@example.com',
        entries: [],
      }),
    ).toBeNull();
  });
});

describe('handleProposeDecision', () => {
  const fetchMock = vi.fn<typeof fetch>();
  const fixedNow = new Date('2026-09-04T12:00:00.000Z');

  beforeEach(() => {
    vi.stubEnv('PLUGIN_SHARED_SECRET', VALID_SECRET);
    vi.stubEnv('GITHUB_TOKEN', GITHUB_TOKEN);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns 401 for invalid shared secret', async () => {
    const response = await handleProposeDecision(
      new Request('https://example.com/api/registry/propose-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sharedSecret: 'wrong-secret',
          proposedBy: 'designer@example.com',
          entries: [{ signature: 'sig-1', decision: 'mapped' }],
        }),
      }),
      { fetchImpl: fetchMock, now: () => fixedNow },
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'unauthorized' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid request body', async () => {
    const response = await handleProposeDecision(
      new Request('https://example.com/api/registry/propose-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sharedSecret: VALID_SECRET,
          proposedBy: 'designer@example.com',
          entries: [{ signature: '', decision: 'mapped' }],
        }),
      }),
      { fetchImpl: fetchMock, now: () => fixedNow },
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'invalid_request' });
  });

  it('creates PR from empty registry when file is missing (404)', async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);
      const method = init?.method ?? 'GET';

      if (url.includes('/contents/decisions-registry.json?ref=main') && method === 'GET') {
        return jsonResponse(404, { message: 'Not Found' });
      }
      if (url.endsWith('/git/ref/heads/main') && method === 'GET') {
        return jsonResponse(200, { object: { sha: 'main-sha' } });
      }
      if (url.endsWith('/git/refs') && method === 'POST') {
        return jsonResponse(201, {});
      }
      if (url.includes('/contents/decisions-registry.json') && method === 'PUT') {
        return jsonResponse(200, { content: { sha: 'new-file-sha' } });
      }
      if (url.endsWith('/pulls') && method === 'POST') {
        return jsonResponse(201, { number: 42 });
      }
      if (url.includes('/requested_reviewers') && method === 'POST') {
        return jsonResponse(201, {});
      }

      throw new Error(`Unexpected fetch call: ${method} ${url}`);
    });

    const response = await handleProposeDecision(
      new Request('https://example.com/api/registry/propose-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sharedSecret: VALID_SECRET,
          proposedBy: 'designer@example.com',
          entries: [{ signature: 'sig-1', decision: 'ignored', comment: 'test' }],
        }),
      }),
      { fetchImpl: fetchMock, now: () => fixedNow },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });

    const putCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'PUT');
    expect(putCall).toBeDefined();
    const putBody = JSON.parse(String(putCall?.[1]?.body));
    expect(putBody.branch).toMatch(/^registry\/propose-/);
    expect(putBody.sha).toBeUndefined();

    const decoded = JSON.parse(Buffer.from(putBody.content, 'base64').toString('utf8'));
    expect(decoded.registryVersion).toBe(1);
    expect(decoded.entries).toHaveLength(1);
    expect(decoded.entries[0]).toMatchObject({
      signature: 'sig-1',
      decision: 'ignored',
      proposedBy: 'designer@example.com',
      proposedAt: fixedNow.toISOString(),
    });
    expect(decoded.entries[0].status).toBeUndefined();
  });

  it('returns success for existing registry happy path', async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);
      const method = init?.method ?? 'GET';

      if (url.includes('/contents/decisions-registry.json?ref=main') && method === 'GET') {
        return encodeRegistry({
          schemaVersion: '1.0',
          registryVersion: 2,
          updatedAt: '2026-09-01T00:00:00.000Z',
          entries: [{ signature: 'existing', decision: 'mapped', status: 'approved' }],
        });
      }
      if (url.endsWith('/git/ref/heads/main') && method === 'GET') {
        return jsonResponse(200, { object: { sha: 'main-sha' } });
      }
      if (url.endsWith('/git/refs') && method === 'POST') {
        return jsonResponse(201, {});
      }
      if (url.includes('/contents/decisions-registry.json') && method === 'PUT') {
        return jsonResponse(200, { content: { sha: 'new-file-sha' } });
      }
      if (url.endsWith('/pulls') && method === 'POST') {
        return jsonResponse(201, { number: 7 });
      }
      if (url.includes('/requested_reviewers') && method === 'POST') {
        return jsonResponse(201, {});
      }

      throw new Error(`Unexpected fetch call: ${method} ${url}`);
    });

    const response = await handleProposeDecision(
      new Request('https://example.com/api/registry/propose-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sharedSecret: VALID_SECRET,
          proposedBy: 'designer@example.com',
          entries: [{ signature: 'sig-2', decision: 'mapped', targetVariableName: 'color/test' }],
        }),
      }),
      { fetchImpl: fetchMock, now: () => fixedNow },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });

    const putCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'PUT');
    const putBody = JSON.parse(String(putCall?.[1]?.body));
    expect(putBody.sha).toBe('file-sha-1');

    const decoded = JSON.parse(Buffer.from(putBody.content, 'base64').toString('utf8'));
    expect(decoded.registryVersion).toBe(3);
    expect(decoded.entries).toHaveLength(2);
  });
});
