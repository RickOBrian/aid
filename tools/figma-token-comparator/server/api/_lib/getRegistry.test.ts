import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { handleGetRegistry } from './getRegistry.js';

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

describe('handleGetRegistry', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubEnv('PLUGIN_SHARED_SECRET', VALID_SECRET);
    vi.stubEnv('GITHUB_TOKEN', GITHUB_TOKEN);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns 401 when X-Plugin-Secret is missing', async () => {
    const response = await handleGetRegistry(
      new Request('https://example.com/api/registry', { method: 'GET' }),
      { fetchImpl: fetchMock },
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'unauthorized' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 401 for invalid X-Plugin-Secret', async () => {
    const response = await handleGetRegistry(
      new Request('https://example.com/api/registry', {
        method: 'GET',
        headers: { 'X-Plugin-Secret': 'wrong-secret' },
      }),
      { fetchImpl: fetchMock },
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'unauthorized' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns exists:false when registry file is missing on main (404)', async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);
      const method = init?.method ?? 'GET';

      if (url.includes('/contents/decisions-registry.json?ref=main') && method === 'GET') {
        return jsonResponse(404, { message: 'Not Found' });
      }

      throw new Error(`Unexpected fetch call: ${method} ${url}`);
    });

    const response = await handleGetRegistry(
      new Request('https://example.com/api/registry', {
        method: 'GET',
        headers: { 'X-Plugin-Secret': VALID_SECRET },
      }),
      { fetchImpl: fetchMock },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.exists).toBe(false);
    expect(body.registry).toMatchObject({
      schemaVersion: '1.0',
      registryVersion: 0,
      entries: [],
    });
    expect(body.sha).toBeUndefined();
  });

  it('returns exists:true with registry and sha when file exists', async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);
      const method = init?.method ?? 'GET';

      if (url.includes('/contents/decisions-registry.json?ref=main') && method === 'GET') {
        return encodeRegistry(
          {
            schemaVersion: '1.0',
            registryVersion: 5,
            updatedAt: '2026-09-01T00:00:00.000Z',
            entries: [{ signature: 'sig-1', decision: 'mapped', status: 'approved' }],
          },
          'registry-sha-abc',
        );
      }

      throw new Error(`Unexpected fetch call: ${method} ${url}`);
    });

    const response = await handleGetRegistry(
      new Request('https://example.com/api/registry', {
        method: 'GET',
        headers: { 'X-Plugin-Secret': VALID_SECRET },
      }),
      { fetchImpl: fetchMock },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      exists: true,
      registry: {
        schemaVersion: '1.0',
        registryVersion: 5,
        updatedAt: '2026-09-01T00:00:00.000Z',
        entries: [{ signature: 'sig-1', decision: 'mapped', status: 'approved' }],
      },
      sha: 'registry-sha-abc',
    });
  });

  it('returns 502 when GitHub fetch fails', async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);
      const method = init?.method ?? 'GET';

      if (url.includes('/contents/decisions-registry.json?ref=main') && method === 'GET') {
        return jsonResponse(403, { message: 'Forbidden' });
      }

      throw new Error(`Unexpected fetch call: ${method} ${url}`);
    });

    const response = await handleGetRegistry(
      new Request('https://example.com/api/registry', {
        method: 'GET',
        headers: { 'X-Plugin-Secret': VALID_SECRET },
      }),
      { fetchImpl: fetchMock },
    );

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: 'registry_unavailable' });
  });

  it('includes CORS headers on success', async () => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);
      const method = init?.method ?? 'GET';

      if (url.includes('/contents/decisions-registry.json?ref=main') && method === 'GET') {
        return jsonResponse(404, { message: 'Not Found' });
      }

      throw new Error(`Unexpected fetch call: ${method} ${url}`);
    });

    const response = await handleGetRegistry(
      new Request('https://example.com/api/registry', {
        method: 'GET',
        headers: { 'X-Plugin-Secret': VALID_SECRET },
      }),
      { fetchImpl: fetchMock },
    );

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    expect(response.headers.get('Access-Control-Allow-Headers')).toContain('X-Plugin-Secret');
  });
});
