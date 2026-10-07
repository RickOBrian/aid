/**
 * История релизов плагина для changelog на странице Token Comparator.
 *
 * Пишет JSON (`PluginReleaseSummary[]`, новые сверху) в stdout. Запускает
 * CI на раннере GitHub (`.github/workflows/presentbook-yc.yml`), результат
 * ложится в бакет сайта: `data/plugin-history.json`. Из Яндекс Облака список
 * релизов GitHub тянется дольше 9 секунд (2026-10-06), из CI — за секунду;
 * функция читает готовый файл из бакета.
 *
 *   GITHUB_TOKEN=… node deploy/yc/plugin-history.ts > plugin-history.json
 */
import { PLUGIN_RELEASE, releaseHistory } from '../../api/_lib/pluginRelease.ts';

const { owner, repo } = PLUGIN_RELEASE;
const headers: Record<string, string> = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'aid-ds-portal-ci',
};
if (process.env.GITHUB_TOKEN) {
  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases?per_page=100`, { headers });
if (!response.ok) {
  console.error(`[plugin-history] GitHub releases: ${response.status}`);
  process.exit(1);
}
const history = releaseHistory(await response.json());
if (history.length === 0) {
  // Пустой файл стёр бы таблицу на сайте — лучше упасть и оставить прежний.
  console.error('[plugin-history] no releases found');
  process.exit(1);
}
process.stdout.write(`${JSON.stringify(history)}\n`);
console.error(`[plugin-history] ${history.length} releases, latest ${history[0].version}`);
