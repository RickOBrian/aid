export interface ComponentPendingItem {
  id: string;
  type: 'component';
  changeType?: 'added' | 'changed' | 'fixed' | 'deprecated' | 'removed';
  artifact: string;
  componentId: string;
  product: string;
  changeSummary: string;
  proposedSemVerImpact: 'initial' | 'major' | 'minor' | 'patch';
  proposedVersion?: string;
  proposedChangelogEntry?: {
    kind: 'added' | 'changed' | 'fixed' | 'deprecated' | 'removed';
    impact?: 'initial' | 'major' | 'minor' | 'patch';
    description: string;
  };
  relatedTokenChanges?: string[];
  reviewRoute?: string;
  sourcePath?: string;
  status: 'pending';
  created: string;
  author: string;
}

const pendingModules = import.meta.glob('../../changes/driver/pending/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, ComponentPendingItem>;

export function loadComponentPendingItems(componentId: string): ComponentPendingItem[] {
  return Object.values(pendingModules).filter(
    (item) => item.type === 'component' && item.componentId === componentId && item.status === 'pending',
  );
}

export function formatReleasedVersionLabel(currentVersion: string | null | undefined): string {
  return currentVersion ? `v${currentVersion}` : 'Not released';
}
