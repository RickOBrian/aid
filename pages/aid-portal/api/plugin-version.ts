import { PLUGIN_RELEASE, releaseInfo, type PluginReleaseInfo } from './_lib/pluginRelease.js';

/**
 * GET /api/plugin-version → `{ "release": { version, publishedAt, notes,
 * releaseUrl, releasesUrl } }` или `{ "release": null }`.
 *
 * Зачем прослойка, а не запрос к GitHub из браузера: без авторизации GitHub
 * даёт 60 запросов в час на IP, и офис за одним IP выбирает их быстро —
 * версия на кнопке то появлялась бы, то пропадала. В Яндекс Облаке ответ
 * 10 минут держит экземпляр функции (`deploy/yc/handler.ts`), на запасном
 * Vercel — CDN по `s-maxage`.
 *
 * `GITHUB_RELEASES_TOKEN` — read-only токен (Lockbox `presentbook-github`):
 * исходящие IP общие, и без токена лимит на них может выбрать кто-то чужой.
 * Токен не читается, не печатается и не коммитится.
 */

const FRESH = 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400';
const RETRY_SOON = 'public, max-age=0, s-maxage=60';

function json(release: PluginReleaseInfo | null, cacheControl: string): Response {
  return new Response(JSON.stringify({ release }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': cacheControl },
  });
}

export async function GET(): Promise<Response> {
  const { owner, repo } = PLUGIN_RELEASE;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'aid-ds-portal',
  };
  const token = process.env.GITHUB_RELEASES_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
      headers,
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      return json(null, RETRY_SOON);
    }
    const release = releaseInfo(await response.json(), PLUGIN_RELEASE);
    return json(release, release ? FRESH : RETRY_SOON);
  } catch {
    return json(null, RETRY_SOON);
  }
}
