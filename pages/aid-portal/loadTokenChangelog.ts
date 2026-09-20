import type { TokenChangelog } from './ChangelogTable';

const repoChangelogModules = import.meta.glob('../../tokens/*-changelog.json', {
  eager: true,
  import: 'default',
}) as Record<string, TokenChangelog>;

const appChangelogModules = import.meta.glob('./tokens/*-changelog.json', {
  eager: true,
  import: 'default',
}) as Record<string, TokenChangelog>;

const changelogModules = { ...repoChangelogModules, ...appChangelogModules };

export function loadTokenChangelog(collectionName: string): TokenChangelog | null {
  const suffix = `/${collectionName}-changelog.json`;
  const key = Object.keys(changelogModules).find((path) => path.endsWith(suffix));
  return key ? changelogModules[key] : null;
}
