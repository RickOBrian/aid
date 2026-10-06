/**
 * Версия плагина на кнопке «Скачать»: из какого релиза и как её достать.
 *
 * Кнопка ведёт на `releases/latest/download/<файл>` — GitHub сам отдаёт файл
 * из последнего релиза. Версия берётся у того же релиза.
 *
 * Ссылка кнопки — стык Token Comparator (`tools-registry.json`). Здесь она
 * повторена константой, чтобы функции не пришлось импортировать JSON;
 * `components/pluginRelease.test.ts` проверяет, что константа совпадает со
 * ссылкой в реестре, так что разойтись им молча нельзя.
 */

export interface LatestDownload {
  owner: string;
  repo: string;
  asset: string;
}

export const PLUGIN_RELEASE: LatestDownload = {
  owner: 'RickOBrian',
  repo: 'aid',
  asset: 'token-comparator.zip',
};

const LATEST_DOWNLOAD_PATH = /^\/([^/]+)\/([^/]+)\/releases\/latest\/download\/([^/]+)$/;

export function parseLatestDownloadUrl(url: string): LatestDownload | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'github.com') {
      return null;
    }
    const match = LATEST_DOWNLOAD_PATH.exec(parsed.pathname);
    if (!match) {
      return null;
    }
    const [, owner, repo, asset] = match.map(decodeURIComponent);
    return { owner, repo, asset };
  } catch {
    return null;
  }
}

export interface PluginReleaseInfo {
  /** `v1.6.0` */
  version: string;
  /** ISO-дата публикации релиза. */
  publishedAt: string | null;
  /** Описание релиза как есть (Markdown), обрезанное до `NOTES_LIMIT`. */
  notes: string;
  /** Страница этого релиза на GitHub. */
  releaseUrl: string | null;
  /** Список всех релизов. */
  releasesUrl: string;
}

const NOTES_LIMIT = 20_000;

function httpsGithubUrl(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'github.com' ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Один релиз плагина для changelog на странице. */
export interface PluginReleaseSummary {
  /** `1.6.0` — без `v`, как версии в changelog портала. */
  version: string;
  /** `YYYY-MM-DD` */
  date: string;
  /** Логин автора релиза на GitHub. */
  author: string;
  /** Описание релиза как есть (Markdown), обрезанное до `NOTES_LIMIT`. */
  notes: string;
}

/**
 * Релизы плагина из ответа `releases` — для changelog на странице.
 *
 * Берутся только теги `vX.Y.Z` (или `X.Y.Z`): релизы других продуктов
 * публикуются со своим префиксом тега (корневой `CLAUDE.md`, стык
 * «GitHub Releases»). Черновики и пререлизы пропускаются. Новые сверху.
 */
export function releaseHistory(releases: unknown): PluginReleaseSummary[] {
  if (!Array.isArray(releases)) {
    return [];
  }
  const history: PluginReleaseSummary[] = [];
  for (const item of releases) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const record = item as Record<string, unknown>;
    const tag = typeof record.tag_name === 'string' ? record.tag_name.trim() : '';
    const version = /^v?(\d+\.\d+\.\d+)$/.exec(tag)?.[1];
    const published = typeof record.published_at === 'string' ? record.published_at : '';
    if (!version || record.draft === true || record.prerelease === true || Number.isNaN(Date.parse(published))) {
      continue;
    }
    const author = (record.author as { login?: unknown } | null)?.login;
    history.push({
      version,
      date: published.slice(0, 10),
      author: typeof author === 'string' ? author : '',
      notes: typeof record.body === 'string' ? record.body.slice(0, NOTES_LIMIT) : '',
    });
  }
  return history;
}

/** Всё, что нужно странице плагина, из ответа `releases/latest`. */
export function releaseInfo(release: unknown, target: LatestDownload): PluginReleaseInfo | null {
  const version = releaseVersion(release, target.asset);
  if (!version) {
    return null;
  }
  const { published_at: publishedAt, body, html_url: htmlUrl } = release as {
    published_at?: unknown;
    body?: unknown;
    html_url?: unknown;
  };
  return {
    version,
    publishedAt: typeof publishedAt === 'string' && !Number.isNaN(Date.parse(publishedAt)) ? publishedAt : null,
    notes: typeof body === 'string' ? body.slice(0, NOTES_LIMIT) : '',
    releaseUrl: httpsGithubUrl(htmlUrl),
    releasesUrl: `https://github.com/${target.owner}/${target.repo}/releases`,
  };
}

/** `v1.6.0` из ответа `releases/latest`, если в релизе есть нужный файл. */
export function releaseVersion(release: unknown, asset: string): string | null {
  if (!release || typeof release !== 'object') {
    return null;
  }
  const { tag_name: tag, assets } = release as { tag_name?: unknown; assets?: unknown };
  if (typeof tag !== 'string' || !Array.isArray(assets)) {
    return null;
  }
  const hasAsset = assets.some((item) => (item as { name?: unknown } | null)?.name === asset);
  const version = /^v?(\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?)$/.exec(tag.trim())?.[1];
  return hasAsset && version ? `v${version}` : null;
}
