import type { TokenChangelog } from './ChangelogTable';

const changelogModules = import.meta.glob('../../tokens/*-changelog.json', {
  eager: true,
  import: 'default',
}) as Record<string, TokenChangelog>;

export function loadTokenChangelog(collectionName: string): TokenChangelog | null {
  const suffix = `/${collectionName}-changelog.json`;
  const key = Object.keys(changelogModules).find((path) => path.endsWith(suffix));
  return key ? changelogModules[key] : null;
}
