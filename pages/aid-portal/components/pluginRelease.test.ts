import { afterEach, describe, expect, it, vi } from 'vitest';
import { PLUGIN_RELEASE, parseLatestDownloadUrl, releaseHistory, releaseInfo, releaseVersion } from '../api/_lib/pluginRelease';
import { GET } from '../api/plugin-version';
import toolsRegistry from '../tools-registry.json';

/**
 * Версия на кнопке «Скачать плагин» — из того же релиза, который отдаёт кнопка.
 */

describe('PLUGIN_RELEASE', () => {
  it('совпадает со ссылкой кнопки в tools-registry.json — иначе версия будет от другого файла', () => {
    const plugin = toolsRegistry.plugins.find((item) => item.pluginId === 'token-comparator');
    expect(plugin).toBeDefined();
    expect(parseLatestDownloadUrl(plugin!.downloadUrl)).toEqual(PLUGIN_RELEASE);
  });
});

describe('parseLatestDownloadUrl', () => {
  it('не выдумывает релиз для ссылки на конкретный тег или чужой хост', () => {
    expect(
      parseLatestDownloadUrl('https://github.com/RickOBrian/aid/releases/download/v1.6.0/token-comparator.zip'),
    ).toBeNull();
    expect(parseLatestDownloadUrl('https://example.com/RickOBrian/aid/releases/latest/download/x.zip')).toBeNull();
    expect(parseLatestDownloadUrl('не ссылка')).toBeNull();
  });
});

describe('releaseVersion', () => {
  const release = {
    tag_name: 'v1.6.0',
    assets: [{ name: 'token-comparator-v1.6.0.zip' }, { name: 'token-comparator.zip' }],
  };

  it('берёт версию из тега релиза', () => {
    expect(releaseVersion(release, 'token-comparator.zip')).toBe('v1.6.0');
    expect(releaseVersion({ ...release, tag_name: '1.7.0' }, 'token-comparator.zip')).toBe('v1.7.0');
  });

  it('молчит, если в релизе нет файла, который отдаёт кнопка', () => {
    expect(releaseVersion(release, 'other.zip')).toBeNull();
  });

  it('молчит на тег не по semver и на ответ-ошибку', () => {
    expect(releaseVersion({ ...release, tag_name: 'latest' }, 'token-comparator.zip')).toBeNull();
    expect(releaseVersion({ message: 'API rate limit exceeded' }, 'token-comparator.zip')).toBeNull();
    expect(releaseVersion(null, 'token-comparator.zip')).toBeNull();
  });
});

describe('releaseInfo', () => {
  const release = {
    tag_name: 'v1.6.0',
    published_at: '2026-09-26T17:20:23Z',
    html_url: 'https://github.com/RickOBrian/aid/releases/tag/v1.6.0',
    body: '### Новое\n\n- Пункт',
    assets: [{ name: 'token-comparator.zip' }],
  };

  it('собирает дату, описание и ссылки', () => {
    expect(releaseInfo(release, PLUGIN_RELEASE)).toEqual({
      version: 'v1.6.0',
      publishedAt: '2026-09-26T17:20:23Z',
      notes: '### Новое\n\n- Пункт',
      releaseUrl: 'https://github.com/RickOBrian/aid/releases/tag/v1.6.0',
      releasesUrl: 'https://github.com/RickOBrian/aid/releases',
    });
  });

  it('не пропускает ссылку не на github.com и битую дату', () => {
    const info = releaseInfo(
      { ...release, html_url: 'javascript:alert(1)', published_at: 'вчера' },
      PLUGIN_RELEASE,
    );
    expect(info?.releaseUrl).toBeNull();
    expect(info?.publishedAt).toBeNull();
  });
});

describe('GET /api/plugin-version', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('отдаёт версию и кэшируется на CDN', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ tag_name: 'v1.6.0', assets: [{ name: 'token-comparator.zip' }] })),
      ),
    );
    const response = await GET();
    expect((await response.json()).release.version).toBe('v1.6.0');
    expect(response.headers.get('Cache-Control')).toContain('s-maxage=600');
  });

  it('на лимите GitHub отвечает без версии и ненадолго', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 403 })));
    const response = await GET();
    expect(await response.json()).toEqual({ release: null, history: [] });
    expect(response.headers.get('Cache-Control')).toContain('s-maxage=60');
  });

  it('отдаёт историю релизов для changelog', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL | Request) =>
        String(url).endsWith('/releases/latest')
          ? new Response(JSON.stringify({ tag_name: 'v1.6.0', assets: [{ name: 'token-comparator.zip' }] }))
          : new Response(JSON.stringify([{ tag_name: 'v1.6.0', published_at: '2026-09-26T17:20:23Z', author: { login: 'RickOBrian' }, body: '### Новое' }])),
      ),
    );
    const body = await (await GET()).json();
    expect(body.history).toEqual([{ version: '1.6.0', date: '2026-09-26', author: 'RickOBrian', notes: '### Новое' }]);
  });

  it('в Облаке историю берёт из файла бакета, а не из GitHub', async () => {
    process.env.PLUGIN_HISTORY_URL = 'https://storage.test/presentbook-site/data/plugin-history.json';
    const fakeFetch = vi.fn(async (url: string | URL | Request) =>
      String(url).startsWith('https://storage.test/')
        ? new Response(JSON.stringify([{ version: '1.6.0', date: '2026-09-26', author: 'RickOBrian', notes: '' }, { bad: true }]))
        : new Response(JSON.stringify({ tag_name: 'v1.6.0', assets: [{ name: 'token-comparator.zip' }] })),
    );
    vi.stubGlobal('fetch', fakeFetch);
    const body = await (await GET()).json();
    expect(body.history).toEqual([{ version: '1.6.0', date: '2026-09-26', author: 'RickOBrian', notes: '' }]);
    expect(fakeFetch.mock.calls.map(([url]) => String(url)).some((url) => url.includes('/releases?'))).toBe(false);
    delete process.env.PLUGIN_HISTORY_URL;
  });

  it('на обрыве сети не падает', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new Error('offline'))));
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ release: null, history: [] });
  });
});

describe('releaseHistory', () => {
  const base = { published_at: '2026-09-26T17:20:23Z', author: { login: 'RickOBrian' }, body: 'x' };

  it('берёт только теги vX.Y.Z — у других продуктов свой префикс', () => {
    const history = releaseHistory([
      { ...base, tag_name: 'v1.6.0' },
      { ...base, tag_name: '1.5.0' },
      { ...base, tag_name: 'style-migration-v0.1.0' },
    ]);
    expect(history.map((item) => item.version)).toEqual(['1.6.0', '1.5.0']);
  });

  it('пропускает черновики, пререлизы и битые даты', () => {
    expect(
      releaseHistory([
        { ...base, tag_name: 'v2.0.0', draft: true },
        { ...base, tag_name: 'v2.0.0', prerelease: true },
        { ...base, tag_name: 'v2.0.0', published_at: null },
      ]),
    ).toEqual([]);
    expect(releaseHistory({ message: 'API rate limit exceeded' })).toEqual([]);
  });
});
