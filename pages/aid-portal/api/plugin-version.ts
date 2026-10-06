import {
  PLUGIN_RELEASE,
  releaseHistory,
  releaseInfo,
  type PluginReleaseInfo,
  type PluginReleaseSummary,
} from './_lib/pluginRelease.js';

/**
 * GET /api/plugin-version → `{ "release": { version, publishedAt, notes,
 * releaseUrl, releasesUrl } | null, "history": [{ version, date, author,
 * notes }] }`. `release` — для кнопки и «Что нового», `history` — все релизы
 * плагина для changelog внизу страницы.
 *
 * Зачем прослойка, а не запрос к GitHub из браузера: без авторизации GitHub
 * даёт 60 запросов в час на IP, и офис за одним IP выбирает их быстро —
 * версия на кнопке то появлялась бы, то пропадала. Ответ 10 минут держит
 * экземпляр функции (`cachedPluginVersion` в `deploy/yc/handler.ts`).
 *
 * `GITHUB_RELEASES_TOKEN` — read-only токен (Lockbox `presentbook-github`):
 * исходящие IP общие, и без токена лимит на них может выбрать кто-то чужой.
 * Токен не читается, не печатается и не коммитится.
 */

const FRESH = 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400';
const RETRY_SOON = 'public, max-age=0, s-maxage=60';

function json(release: PluginReleaseInfo | null, history: PluginReleaseSummary[], cacheControl: string): Response {
  return new Response(JSON.stringify({ release, history }), {
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

  const get = async (path: string): Promise<unknown> => {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/${path}`, {
      headers,
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      // Только путь и статус: причину (лимит, токен) видно в журнале функции.
      console.warn(`[plugin-version] GitHub ${path}: ${response.status}`);
      return null;
    }
    return response.json();
  };

  try {
    const [latest, all] = await Promise.all([get('releases/latest'), get('releases?per_page=100').catch(() => null)]);
    const release = latest ? releaseInfo(latest, PLUGIN_RELEASE) : null;
    return json(release, releaseHistory(all), release ? FRESH : RETRY_SOON);
  } catch {
    return json(null, [], RETRY_SOON);
  }
}
