import { afterEach, describe, expect, it, vi } from 'vitest';
import { PLUGIN_RELEASE, parseLatestDownloadUrl, releaseVersion } from '../api/_lib/pluginRelease';
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
    expect(await response.json()).toEqual({ version: 'v1.6.0' });
    expect(response.headers.get('Cache-Control')).toContain('s-maxage=600');
  });

  it('на лимите GitHub отвечает без версии и ненадолго', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 403 })));
    const response = await GET();
    expect(await response.json()).toEqual({ version: null });
    expect(response.headers.get('Cache-Control')).toContain('s-maxage=60');
  });

  it('на обрыве сети не падает', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new Error('offline'))));
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ version: null });
  });
});
