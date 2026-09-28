/**
 * Версия плагина на кнопке «Скачать»: из какого релиза и как её достать.
 *
 * Кнопка ведёт на `releases/latest/download/<файл>` — GitHub сам отдаёт файл
 * из последнего релиза. Версия берётся у того же релиза.
 *
 * Ссылка кнопки — стык Token Comparator (`tools-registry.json`). Здесь она
 * повторена константой, чтобы функции Vercel не пришлось импортировать JSON;
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
