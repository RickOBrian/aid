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

  it('accepts transient review-projection metadata and preserves it on the validated entry', () => {
    const result = validateProposeDecisionBody({
      sharedSecret: 'secret',
      proposedBy: 'designer@example.com',
      entries: [
        {
          signature: 'sig-1',
          decision: 'mapped',
          sourceProperty: 'fill',
          sourceDisplayValue: '#0057FF',
          nodePath: 'Page 1 / Frame',
          nodeName: 'Frame',
          occurrenceCount: 3,
          targetCollectionName: 'Colors',
          targetModeName: 'Light',
          targetDisplayValue: '#0052E0',
        },
      ],
    });
    expect(result).not.toBeNull();
    expect(result?.entries[0]).toMatchObject({
      sourceProperty: 'fill',
      sourceDisplayValue: '#0057FF',
      nodePath: 'Page 1 / Frame',
      nodeName: 'Frame',
      occurrenceCount: 3,
      targetCollectionName: 'Colors',
      targetModeName: 'Light',
      targetDisplayValue: '#0052E0',
    });
  });

  describe('occurrenceCount validation', () => {
    function withOccurrenceCount(occurrenceCount: unknown) {
      return validateProposeDecisionBody({
        sharedSecret: 'secret',
        proposedBy: 'designer@example.com',
        entries: [{ signature: 'sig-1', decision: 'mapped', occurrenceCount }],
      });
    }

    it('accepts a positive integer', () => {
      expect(withOccurrenceCount(3)).not.toBeNull();
      expect(withOccurrenceCount(1)).not.toBeNull();
    });

    it('rejects zero', () => {
      expect(withOccurrenceCount(0)).toBeNull();
    });

    it('rejects negative numbers', () => {
      expect(withOccurrenceCount(-1)).toBeNull();
    });

    it('rejects decimal values', () => {
      expect(withOccurrenceCount(1.5)).toBeNull();
    });

    it('rejects NaN', () => {
      expect(withOccurrenceCount(NaN)).toBeNull();
    });

    it('rejects string values', () => {
      expect(withOccurrenceCount('3')).toBeNull();
    });
  });

  it('rejects non-string transient metadata fields', () => {
    expect(
      validateProposeDecisionBody({
        sharedSecret: 'secret',
        proposedBy: 'designer@example.com',
        entries: [{ signature: 'sig-1', decision: 'mapped', sourceDisplayValue: 12345 }],
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
      if (url.endsWith('/pulls/42') && method === 'GET') {
        return jsonResponse(200, { user: { login: 'RickOBrian' } });
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
    expect(
      fetchMock.mock.calls.some(
        ([input, init]) =>
          String(input).includes('/requested_reviewers') && init?.method === 'POST',
      ),
    ).toBe(false);

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
      if (url.endsWith('/pulls/7') && method === 'GET') {
        return jsonResponse(200, { user: { login: 'RickOBrian' } });
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
    expect(
      fetchMock.mock.calls.some(
        ([input, init]) =>
          String(input).includes('/requested_reviewers') && init?.method === 'POST',
      ),
    ).toBe(false);

    const putCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'PUT');
    const putBody = JSON.parse(String(putCall?.[1]?.body));
    expect(putBody.sha).toBe('file-sha-1');

    const decoded = JSON.parse(Buffer.from(putBody.content, 'base64').toString('utf8'));
    expect(decoded.registryVersion).toBe(3);
    expect(decoded.entries).toHaveLength(2);
  });

  it('requests reviewer when PR author differs from configured reviewer', async () => {
    vi.stubEnv('REGISTRY_REVIEWER', 'other-reviewer');

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
        return jsonResponse(201, { number: 99 });
      }
      if (url.endsWith('/pulls/99') && method === 'GET') {
        return jsonResponse(200, { user: { login: 'registry-bot' } });
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
          entries: [{ signature: 'sig-bot', decision: 'mapped' }],
        }),
      }),
      { fetchImpl: fetchMock, now: () => fixedNow },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(
      fetchMock.mock.calls.some(
        ([input, init]) =>
          String(input).includes('/requested_reviewers') && init?.method === 'POST',
      ),
    ).toBe(true);
  });

  it('renders transient review metadata into the PR body but never persists it into decisions-registry.json', async () => {
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
        return jsonResponse(201, { number: 55 });
      }
      if (url.endsWith('/pulls/55') && method === 'GET') {
        return jsonResponse(200, { user: { login: 'RickOBrian' } });
      }

      throw new Error(`Unexpected fetch call: ${method} ${url}`);
    });

    const response = await handleProposeDecision(
      new Request('https://example.com/api/registry/propose-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sharedSecret: VALID_SECRET,
          proposedBy: 'Sergey AI',
          entries: [
            {
              signature: '1yjw2j2',
              decision: 'mapped',
              targetVariableId: 'VariableID:23:37',
              targetVariableName: 'bg-accent-main',
              sourceProperty: 'fill',
              sourceBindingType: 'hardcoded',
              sourceDisplayValue: '#0057FF',
              nodePath: 'Page 1 / Button / Background',
              nodeName: 'Background',
              occurrenceCount: 12,
              targetCollectionName: 'Colors',
              targetModeName: 'Light',
              targetDisplayValue: '#0052E0',
            },
          ],
        }),
      }),
      { fetchImpl: fetchMock, now: () => fixedNow },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });

    // Transient metadata must reach the PR body.
    const pullsCall = fetchMock.mock.calls.find(
      ([input, init]) => String(input).endsWith('/pulls') && init?.method === 'POST',
    );
    expect(pullsCall).toBeDefined();
    const pullsBody = JSON.parse(String(pullsCall?.[1]?.body));
    expect(pullsBody.body).toContain('Background');
    expect(pullsBody.body).toContain('#0057FF');
    expect(pullsBody.body).toContain('#0052E0');
    expect(pullsBody.body).toContain('Colors / Light');
    expect(pullsBody.body).toContain('Page 1 / Button / Background');

    // Transient metadata must NOT reach decisions-registry.json.
    const putCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'PUT');
    const putBody = JSON.parse(String(putCall?.[1]?.body));
    const decoded = JSON.parse(Buffer.from(putBody.content, 'base64').toString('utf8'));
    expect(decoded.entries).toHaveLength(1);
    const registryEntry = decoded.entries[0];
    expect(registryEntry).toEqual({
      signature: '1yjw2j2',
      decision: 'mapped',
      targetVariableId: 'VariableID:23:37',
      targetVariableName: 'bg-accent-main',
      proposedBy: 'Sergey AI',
      proposedAt: fixedNow.toISOString(),
    });
    expect(registryEntry).not.toHaveProperty('sourceProperty');
    expect(registryEntry).not.toHaveProperty('sourceBindingType');
    expect(registryEntry).not.toHaveProperty('sourceDisplayValue');
    expect(registryEntry).not.toHaveProperty('nodePath');
    expect(registryEntry).not.toHaveProperty('nodeName');
    expect(registryEntry).not.toHaveProperty('occurrenceCount');
    expect(registryEntry).not.toHaveProperty('targetCollectionName');
    expect(registryEntry).not.toHaveProperty('targetModeName');
    expect(registryEntry).not.toHaveProperty('targetDisplayValue');
  });
});
