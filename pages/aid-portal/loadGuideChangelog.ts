import type { TokenChangelog } from './ChangelogTable';

export interface GuideChangelog extends TokenChangelog {
  guideId?: string;
}

const repoChangelogModules = import.meta.glob('../../guides/*-changelog.json', {
  eager: true,
  import: 'default',
}) as Record<string, GuideChangelog>;

export function loadGuideChangelog(guideId: string): GuideChangelog | null {
  const suffix = `/${guideId}-changelog.json`;
  const key = Object.keys(repoChangelogModules).find((path) => path.endsWith(suffix));
  return key ? repoChangelogModules[key] : null;
}
