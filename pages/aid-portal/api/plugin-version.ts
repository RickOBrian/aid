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

  const get = async (path: string, timeoutMs: number): Promise<unknown> => {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/${path}`, {
      headers,
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) {
      // Только путь и статус: причину (лимит, токен) видно в журнале функции.
      console.warn(`[plugin-version] GitHub ${path}: ${response.status}`);
      return null;
    }
    return response.json();
  };

  try {
    const [latest, history] = await Promise.all([get('releases/latest', 5000), loadHistory(get)]);
    const release = latest ? releaseInfo(latest, PLUGIN_RELEASE) : null;
    return json(release, history, release ? FRESH : RETRY_SOON);
  } catch {
    return json(null, [], RETRY_SOON);
  }
}

function isSummary(value: unknown): value is PluginReleaseSummary {
  const record = value as Record<string, unknown> | null;
  return Boolean(record) && ['version', 'date', 'author', 'notes'].every((key) => typeof record![key] === 'string');
}

/**
 * История релизов для changelog. В Облаке — готовый файл из бакета сайта
 * (`PLUGIN_HISTORY_URL`): его собирает CI (`deploy/yc/plugin-history.ts`),
 * потому что список релизов GitHub тянется в Облако дольше 9 секунд
 * (2026-10-06). Без переменной — прямо из GitHub, как локально.
 */
async function loadHistory(get: (path: string, timeoutMs: number) => Promise<unknown>): Promise<PluginReleaseSummary[]> {
  const historyUrl = process.env.PLUGIN_HISTORY_URL;
  try {
    if (historyUrl) {
      const response = await fetch(historyUrl, { signal: AbortSignal.timeout(3000) });
      if (!response.ok) {
        console.warn(`[plugin-version] history file: ${response.status}`);
        return [];
      }
      const data: unknown = await response.json();
      return Array.isArray(data) ? data.filter(isSummary) : [];
    }
    return releaseHistory(await get('releases?per_page=100', 9000));
  } catch (error) {
    console.warn(`[plugin-version] history: ${error instanceof Error ? error.name : 'error'}`);
    return [];
  }
}
