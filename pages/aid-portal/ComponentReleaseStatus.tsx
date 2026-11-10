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
  margin-top: var(--pf-spacing-16);
  padding-top: var(--pf-spacing-48);
  border-top: 1px solid var(--pf-line-default);
}
.dsw-release-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--pf-spacing-12);
  margin-bottom: var(--pf-spacing-16);
}
.dsw-release-title {
  margin: 0;
  font: var(--pf-font-heading-m);
  color: var(--pf-text-primary);
}
.dsw-release-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--pf-spacing-8);
}
/* Badge: версия — Neutral, «ждёт» — Warning, «выпущено» — Success (мягкие, без рамки) */
.dsw-version-badge,
.dsw-pending-badge,
.dsw-released-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--pf-spacing-4) var(--pf-spacing-8);
  border-radius: var(--pf-radius-pill);
  font: var(--pf-font-label-s);
  white-space: nowrap;
}
.dsw-version-badge {
  background: var(--pf-bg-accent-status-neutral-main);
  color: var(--pf-text-neutral);
}
.dsw-pending-badge {
  background: var(--pf-bg-accent-status-warning-main);
  color: var(--pf-text-warning);
}
.dsw-released-badge {
  background: var(--pf-bg-accent-status-success-main);
  color: var(--pf-text-success);
}
.dsw-release-meta {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: var(--pf-spacing-8) var(--pf-spacing-16);
  font: var(--pf-font-body-s);
  color: var(--pf-text-primary);
  margin: 0 0 var(--pf-spacing-20);
  padding: var(--pf-spacing-16) var(--pf-spacing-20);
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-l);
}
.dsw-release-meta dt {
  color: var(--pf-text-secondary);
}
.dsw-release-meta dd {
  margin: 0;
}
.dsw-release-meta code {
  font: var(--pf-font-code-s);
}
/* Banner Warning (без рамки) */
.dsw-pending-panel {
  margin-bottom: var(--pf-spacing-24);
  padding: var(--pf-spacing-16) var(--pf-spacing-20);
  border: none;
  border-radius: var(--pf-radius-l);
  background: var(--pf-bg-accent-status-warning-main);
}
.dsw-pending-panel-title {
  margin: 0 0 var(--pf-spacing-12);
  font: var(--pf-font-body-s);
  font-weight: var(--pf-type-weight-500);
  color: var(--pf-text-warning);
}
.dsw-pending-list {
  margin: 0;
  padding-left: var(--pf-spacing-20);
  display: flex;
  flex-direction: column;
  gap: var(--pf-spacing-12);
}
.dsw-pending-item {
  font: var(--pf-font-body-s);
  color: var(--pf-text-primary);
}
/* Импакт — Badge Neutral */
.dsw-pending-impact {
  display: inline-block;
  margin-right: var(--pf-spacing-8);
  padding: 0 var(--pf-spacing-8);
  border-radius: var(--pf-radius-pill);
  background: var(--pf-bg-accent-status-neutral-main);
  color: var(--pf-text-neutral);
  font: var(--pf-font-label-s);
}
.dsw-pending-draft {
  display: block;
  margin-top: var(--pf-spacing-4);
  color: var(--pf-text-secondary);
  font-size: 12px; /* pf-gap: body-xs 12/16·400 */
  line-height: 18px; /* pf-gap: body-xs */
}
`;
