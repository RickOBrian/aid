import { DS_PORTAL_LAYOUT_TOKENS as T } from './dsChangelogTable';

/**
 * Пометка «Ждёт согласования» у гайда, который ещё не принят в боевой
 * Presentbook (`publication: "pending-approval"` в `guide-registry.json`).
 * Одна и та же пометка — на карточке в списке гайдов и в шапке самого гайда.
 */

export type GuidePublication = 'published' | 'pending-approval';

export const PUBLICATION_PENDING_LABEL = 'Ждёт согласования';

export function isPendingApproval(publication: string | null | undefined): boolean {
  return publication === 'pending-approval';
}

export const GUIDE_PUBLICATION_STYLE = `
.ds-publication-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: ${T.badgePadding};
  border-radius: ${T.badgeRadius};
  border: 1px solid ${T.statusPendingBorder};
  background: ${T.statusPendingSurface};
  color: ${T.statusPendingText};
  font-size: ${T.badgeFontSize};
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
.ds-publication-note {
  margin: 0 0 24px;
  padding: 16px 20px;
  border: 1px solid ${T.statusPendingBorder};
  border-radius: ${T.cardRadius};
  background: ${T.statusPendingSurfaceSubtle};
  font-size: 13px;
  line-height: 20px;
  color: ${T.textPrimary};
}
.ds-publication-note-title {
  margin: 0 0 4px;
  font-weight: 500;
  color: ${T.statusPendingText};
}
.ds-publication-note p { margin: 0; }
`;

export function GuidePublicationBadge() {
  return <span className="ds-publication-badge">{PUBLICATION_PENDING_LABEL}</span>;
}
