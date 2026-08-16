import type { TokenChangelog } from './ChangelogTable';

export interface ComponentChangelog extends Omit<TokenChangelog, 'currentVersion'> {
  componentId?: string;
  product?: string;
  releaseStatus?: 'pending' | 'released';
  reviewRoute?: string;
  currentVersion: string | null;
}

const repoChangelogModules = import.meta.glob('../../components/*-changelog.json', {
  eager: true,
  import: 'default',
}) as Record<string, ComponentChangelog>;

export function loadComponentChangelog(componentId: string): ComponentChangelog | null {
  const suffix = `/${componentId}-changelog.json`;
  const key = Object.keys(repoChangelogModules).find((path) => path.endsWith(suffix));
  return key ? repoChangelogModules[key] : null;
}
