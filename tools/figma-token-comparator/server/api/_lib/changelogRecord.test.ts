import { beforeEach, describe, expect, it } from 'vitest';

import {
  buildChangelogPullRequestBody,
  changelogStem,
  handleListChangelogs,
  handleRecordChangelog,
  upsertUnpublishedEntry,
  validateRecordChangelogBody,
  validateUnpublishedEntry,
} from './changelogRecord.js';

const SECRET = 'test-shared-secret';
const PATH = 'tokens/rider-colors-semantic-changelog.json';

const ENTRY = {
  version: null,
  date: null,
  author: 'Артур',
  type: 'minor',
  changes: [{ kind: 'added', description: 'Добавлена переменная Button/Warning Pressed', details: 'Button/Warning Pressed: Day #BF0020, Night #FF4747' }],
};

const MAIN_FILE = {
  artifact: 'Rider Colors/Semantic',
  currentVersion: '1.10.0',
  figmaTable: { fileKey: 'yrfG6u9osujKX8e1B14lpT', nodeId: '31:66' },
  entries: [{ version: '1.10.0', date: '2026-10-15', author: 'Sergey AI', type: 'minor', changes: [] }],
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function contents(file: unknown, sha = 'sha-main'): Response {
  return json(200, { content: Buffer.from(JSON.stringify(file), 'utf8').toString('base64'), encoding: 'base64', sha });
}

interface Call {
  method: string;
  url: string;
  body?: Record<string, unknown>;
}

/** GitHub в памяти: ответы по «МЕТОД путь», журнал вызовов. */
function fakeGithub(routes: Record<string, () => Response>) {
  const calls: Call[] = [];
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input).replace('https://api.github.com', '');
    const method = init?.method ?? 'GET';
    calls.push({ method, url, body: init?.body ? JSON.parse(String(init.body)) : undefined });
    const key = `${method} ${url}`;
    const route = routes[key];
    if (!route) return json(404, { message: `no route ${key}` });
    return route();
  }) as typeof fetch;
  return { fetchImpl, calls };
}

function recordRequest(body: unknown): Request {
  return new Request('https://api.aidteam.pro/api/registry/changelog-record', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const REPO = '/repos/RickOBrian/aid';
const PULLS = `GET ${REPO}/pulls?state=open&per_page=100`;
const MAIN_CONTENTS = `GET ${REPO}/contents/tokens/rider-colors-semantic-changelog.json?ref=main`;

beforeEach(() => {
  process.env.PLUGIN_SHARED_SECRET = SECRET;
  process.env.GITHUB_TOKEN = 'github-token-test';
});

describe('validateUnpublishedEntry', () => {
  it('принимает запись «Не опубликовано»', () => {
    expect(validateUnpublishedEntry(ENTRY)).toEqual(ENTRY);
  });

  it('не принимает запись с версией или датой — их ставит граница релиза', () => {
    expect(validateUnpublishedEntry({ ...ENTRY, version: '1.11.0' })).toBeNull();
    expect(validateUnpublishedEntry({ ...ENTRY, date: '2026-10-20' })).toBeNull();
  });

  it('не принимает неизвестный kind, пустую фразу и пустой список', () => {
    expect(validateUnpublishedEntry({ ...ENTRY, changes: [{ kind: 'renamed', description: 'x' }] })).toBeNull();
    expect(validateUnpublishedEntry({ ...ENTRY, changes: [{ kind: 'added', description: '  ' }] })).toBeNull();
    expect(validateUnpublishedEntry({ ...ENTRY, changes: [] })).toBeNull();
    expect(validateUnpublishedEntry({ ...ENTRY, type: 'initial' })).toBeNull();
  });
});

describe('validateRecordChangelogBody', () => {
  it('пускает только чейнжлоги из tokens/ и components/', () => {
    const base = { sharedSecret: 's', recordedBy: 'Артур', entry: ENTRY };
    expect(validateRecordChangelogBody({ ...base, path: PATH })).not.toBeNull();
    expect(validateRecordChangelogBody({ ...base, path: 'components/switch-changelog.json' })).not.toBeNull();
    expect(validateRecordChangelogBody({ ...base, path: 'decisions-registry.json' })).toBeNull();
    expect(validateRecordChangelogBody({ ...base, path: 'tokens/../CLAUDE-changelog.json' })).toBeNull();
    expect(validateRecordChangelogBody({ ...base, path: '.github/workflows/x-changelog.json' })).toBeNull();
  });
});

describe('upsertUnpublishedEntry', () => {
  it('ставит запись первой, если «Не опубликовано» ещё нет', () => {
    const next = upsertUnpublishedEntry(MAIN_FILE, validateUnpublishedEntry(ENTRY)!);
    expect((next.entries as unknown[]).length).toBe(2);
    expect((next.entries as Array<{ version: unknown }>)[0].version).toBeNull();
    expect(next.currentVersion).toBe('1.10.0');
  });

  it('заменяет уже существующую «Не опубликовано», не дублирует', () => {
    const once = upsertUnpublishedEntry(MAIN_FILE, validateUnpublishedEntry(ENTRY)!);
    const twice = upsertUnpublishedEntry(once, { ...validateUnpublishedEntry(ENTRY)!, author: 'Аня' });
    expect((twice.entries as unknown[]).length).toBe(2);
    expect((twice.entries as Array<{ author: string }>)[0].author).toBe('Аня');
  });
});

describe('changelogStem', () => {
  it('отрезает папку и суффикс', () => {
    expect(changelogStem(PATH)).toBe('rider-colors-semantic');
  });
});

describe('handleRecordChangelog', () => {
  it('без PR: создаёт ветку от main, коммитит файл и открывает PR', async () => {
    const { fetchImpl, calls } = fakeGithub({
      [PULLS]: () => json(200, []),
      [MAIN_CONTENTS]: () => contents(MAIN_FILE),
      [`GET ${REPO}/git/ref/heads/main`]: () => json(200, { object: { sha: 'main-sha' } }),
      [`POST ${REPO}/git/refs`]: () => json(201, {}),
      [`PUT ${REPO}/contents/tokens/rider-colors-semantic-changelog.json`]: () => json(200, {}),
      [`POST ${REPO}/pulls`]: () => json(201, { number: 301 }),
      [`GET ${REPO}/pulls/301`]: () => json(200, { user: { login: 'aid-bot' } }),
      [`POST ${REPO}/pulls/301/requested_reviewers`]: () => json(201, {}),
    });

    const response = await handleRecordChangelog(
      recordRequest({ sharedSecret: SECRET, recordedBy: 'Артур', path: PATH, entry: ENTRY }),
      { fetchImpl, now: () => new Date(1_700_000_000_000) },
    );
    const body = await response.json();
    expect(body).toMatchObject({ success: true, created: true, pullRequest: { number: 301 } });

    const branch = calls.find((call) => call.url.endsWith('/git/refs'))?.body?.ref as string;
    expect(branch).toMatch(/^refs\/heads\/changelog\/rider-colors-semantic-1700000000000-[0-9a-f]{8}$/);

    const put = calls.find((call) => call.method === 'PUT');
    const written = JSON.parse(Buffer.from(String(put?.body?.content), 'base64').toString('utf8'));
    expect(written.entries[0]).toEqual(ENTRY);
    expect(written.currentVersion).toBe('1.10.0');
    expect(put?.body?.sha).toBe('sha-main');
  });

  it('с открытым PR: обновляет его ветку, второй PR не заводит', async () => {
    const branch = 'changelog/rider-colors-semantic-1700000000000-abcd1234';
    const onBranch = upsertUnpublishedEntry(MAIN_FILE, { ...validateUnpublishedEntry(ENTRY)!, author: 'Старое' });
    const { fetchImpl, calls } = fakeGithub({
      [PULLS]: () =>
        json(200, [{ number: 300, html_url: 'https://github.com/RickOBrian/aid/pull/300', head: { ref: branch } }]),
      [`GET ${REPO}/contents/tokens/rider-colors-semantic-changelog.json?ref=${encodeURIComponent(branch)}`]: () =>
        contents(onBranch, 'sha-branch'),
      [`PUT ${REPO}/contents/tokens/rider-colors-semantic-changelog.json`]: () => json(200, {}),
    });

    const response = await handleRecordChangelog(
      recordRequest({ sharedSecret: SECRET, recordedBy: 'Артур', path: PATH, entry: ENTRY }),
      { fetchImpl },
    );
    expect(await response.json()).toMatchObject({ success: true, updated: true, pullRequest: { number: 300 } });
    expect(calls.some((call) => call.method === 'POST')).toBe(false);
    const put = calls.find((call) => call.method === 'PUT');
    expect(put?.body?.branch).toBe(branch);
    expect(put?.body?.sha).toBe('sha-branch');
  });

  it('та же запись повторно — без коммита', async () => {
    const branch = 'changelog/rider-colors-semantic-1700000000000-abcd1234';
    const onBranch = upsertUnpublishedEntry(MAIN_FILE, validateUnpublishedEntry(ENTRY)!);
    const { fetchImpl, calls } = fakeGithub({
      [PULLS]: () =>
        json(200, [{ number: 300, html_url: 'https://github.com/RickOBrian/aid/pull/300', head: { ref: branch } }]),
      [`GET ${REPO}/contents/tokens/rider-colors-semantic-changelog.json?ref=${encodeURIComponent(branch)}`]: () =>
        contents(onBranch, 'sha-branch'),
    });
    const response = await handleRecordChangelog(
      recordRequest({ sharedSecret: SECRET, recordedBy: 'Артур', path: PATH, entry: ENTRY }),
      { fetchImpl },
    );
    expect(await response.json()).toMatchObject({ success: true, unchanged: true });
    expect(calls.some((call) => call.method === 'PUT')).toBe(false);
  });

  it('без ключа — 401, GitHub не трогает', async () => {
    const { fetchImpl, calls } = fakeGithub({});
    const response = await handleRecordChangelog(
      recordRequest({ sharedSecret: 'wrong', recordedBy: 'Артур', path: PATH, entry: ENTRY }),
      { fetchImpl },
    );
    expect(response.status).toBe(401);
    expect(calls).toHaveLength(0);
  });

  it('файла чейнжлога нет в main — 404', async () => {
    const { fetchImpl } = fakeGithub({ [PULLS]: () => json(200, []) });
    const response = await handleRecordChangelog(
      recordRequest({ sharedSecret: SECRET, recordedBy: 'Артур', path: PATH, entry: ENTRY }),
      { fetchImpl },
    );
    expect(response.status).toBe(404);
  });
});

describe('handleListChangelogs', () => {
  it('отдаёт чейнжлоги main и «Не опубликовано» из открытого PR', async () => {
    const branch = 'changelog/rider-colors-semantic-1700000000000-abcd1234';
    const onBranch = upsertUnpublishedEntry(MAIN_FILE, validateUnpublishedEntry(ENTRY)!);
    const { fetchImpl } = fakeGithub({
      [`GET ${REPO}/contents/tokens?ref=main`]: () =>
        json(200, [
          { type: 'file', path: PATH },
          { type: 'file', path: 'tokens/README.md' },
        ]),
      [PULLS]: () =>
        json(200, [{ number: 300, html_url: 'https://github.com/RickOBrian/aid/pull/300', head: { ref: branch } }]),
      [MAIN_CONTENTS]: () => contents(MAIN_FILE),
      [`GET ${REPO}/contents/tokens/rider-colors-semantic-changelog.json?ref=${encodeURIComponent(branch)}`]: () =>
        contents(onBranch),
    });
    const response = await handleListChangelogs(new Request('https://api.aidteam.pro/api/registry/changelogs'), {
      fetchImpl,
    });
    const body = await response.json();
    expect(body.changelogs).toEqual([
      {
        path: PATH,
        artifact: 'Rider Colors/Semantic',
        currentVersion: '1.10.0',
        figmaTable: { fileKey: 'yrfG6u9osujKX8e1B14lpT', nodeId: '31:66' },
        pullRequest: { number: 300, url: 'https://github.com/RickOBrian/aid/pull/300' },
        unpublished: ENTRY,
      },
    ]);
  });
});

describe('buildChangelogPullRequestBody', () => {
  it('перечисляет изменения с бейджами и значениями', () => {
    const text = buildChangelogPullRequestBody(
      { sharedSecret: SECRET, recordedBy: 'Артур', path: PATH, entry: validateUnpublishedEntry(ENTRY)! },
      'Rider Colors/Semantic',
    );
    expect(text).toContain('**Добавлено** — Добавлена переменная Button/Warning Pressed');
    expect(text).toContain('  - Button/Warning Pressed: Day #BF0020, Night #FF4747');
    expect(text).not.toContain(SECRET);
  });
});
