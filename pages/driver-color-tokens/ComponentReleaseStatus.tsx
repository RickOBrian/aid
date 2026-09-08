import type { ComponentChangelog } from './loadComponentChangelog';
import type { ComponentPendingItem } from './loadComponentPending';
import { formatReleasedVersionLabel } from './loadComponentPending';

interface ComponentReleaseStatusProps {
  changelog: ComponentChangelog | null;
  pendingItems: ComponentPendingItem[];
  reviewRoute: string;
}

function formatPendingImpactLabel(item: ComponentPendingItem): string {
  if (item.proposedSemVerImpact === 'initial' && item.proposedVersion) {
    return `INITIAL → v${item.proposedVersion}`;
  }
  return item.proposedSemVerImpact.toUpperCase();
}

export function ComponentReleaseStatus({
  changelog,
  pendingItems,
  reviewRoute,
}: ComponentReleaseStatusProps) {
  const releasedVersion = changelog?.currentVersion ?? null;
  const releasedVersionLabel = formatReleasedVersionLabel(releasedVersion);
  const hasPending = pendingItems.length > 0;
  const isInitialPending = hasPending && releasedVersion === null;

  return (
    <section className="dsw-release" aria-labelledby="dsw-release-heading">
      <div className="dsw-release-head">
        <h2 id="dsw-release-heading" className="dsw-release-title">
          Release
        </h2>
        <div className="dsw-release-badges">
          <span className="dsw-version-badge">{releasedVersionLabel}</span>
          {isInitialPending ? (
            <span className="dsw-pending-badge">Pending initial release</span>
          ) : hasPending ? (
            <span className="dsw-pending-badge">Pending release</span>
          ) : releasedVersion ? (
            <span className="dsw-released-badge">Released</span>
          ) : null}
        </div>
      </div>

      <dl className="dsw-release-meta">
        <dt>Review route</dt>
        <dd>
          <code>{reviewRoute}</code>
        </dd>
        <dt>Release status</dt>
        <dd>
          {isInitialPending
            ? 'No released version yet — initial release v1.0.0 proposed at Release Gate only'
            : hasPending
              ? 'Pending — version/changelog finalize on Release Gate only'
              : releasedVersion
                ? 'No pending component changes'
                : 'Not released'}
        </dd>
      </dl>

      {hasPending && (
        <div className="dsw-pending-panel" role="status">
          <p className="dsw-pending-panel-title">Pending changes (not released)</p>
          <ul className="dsw-pending-list">
            {pendingItems.map((item) => (
              <li key={item.id} className="dsw-pending-item">
                <span className="dsw-pending-impact">{formatPendingImpactLabel(item)}</span>
                <span>{item.changeSummary}</span>
                {item.proposedChangelogEntry ? (
                  <span className="dsw-pending-draft">
                    Proposed entry: {item.proposedChangelogEntry.kind}
                    {item.proposedVersion ? ` · v${item.proposedVersion}` : ''}
                    {item.proposedChangelogEntry.impact ? ` · impact ${item.proposedChangelogEntry.impact}` : ''}
                    {' — '}
                    {item.proposedChangelogEntry.description}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}

    </section>
  );
}

export const COMPONENT_RELEASE_STATUS_STYLE = `
.dsw-release {
  margin-top: 16px;
  padding-top: 48px;
  border-top: 1px solid #ebedf0;
}
.dsw-release-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}
.dsw-release-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
}
.dsw-release-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.dsw-version-badge,
.dsw-pending-badge,
.dsw-released-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.02em;
}
.dsw-version-badge {
  background: #f5f5f5;
  border: 1px solid #ebedf0;
  color: rgba(0, 0, 0, 0.54);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
.dsw-pending-badge {
  background: #fff8e6;
  border: 1px solid #f0d48a;
  color: #8a6a00;
}
.dsw-released-badge {
  background: #eef8f1;
  border: 1px solid #b9e6c9;
  color: #1f7a3f;
}
.dsw-release-meta {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 8px 16px;
  font-size: 13px;
  line-height: 20px;
  margin: 0 0 20px;
  padding: 16px 20px;
  border: 1px solid #ebedf0;
  border-radius: 12px;
}
.dsw-release-meta dt {
  color: rgba(0, 0, 0, 0.54);
}
.dsw-release-meta dd {
  margin: 0;
}
.dsw-pending-panel {
  margin-bottom: 24px;
  padding: 16px 20px;
  border: 1px solid #f0d48a;
  border-radius: 12px;
  background: #fffdf5;
}
.dsw-pending-panel-title {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
  color: #8a6a00;
}
.dsw-pending-list {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.dsw-pending-item {
  font-size: 13px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.7);
}
.dsw-pending-impact {
  display: inline-block;
  margin-right: 8px;
  padding: 0 6px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.06);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
}
.dsw-pending-draft {
  display: block;
  margin-top: 4px;
  color: rgba(0, 0, 0, 0.54);
  font-size: 12px;
  line-height: 18px;
}
`;
