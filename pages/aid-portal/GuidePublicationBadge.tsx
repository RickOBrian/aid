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
  border: none;
  background: ${T.statusPendingSurface};
  color: ${T.statusPendingText};
  font: var(--pf-font-label-s);
  white-space: nowrap;
}
.ds-publication-note {
  margin: 0 0 var(--pf-spacing-24);
  padding: var(--pf-spacing-16) var(--pf-spacing-20);
  border: none;
  border-radius: var(--pf-radius-m);
  background: ${T.statusPendingSurfaceSubtle};
  font: var(--pf-font-body-s);
  color: ${T.statusPendingText};
}
.ds-publication-note-title {
  margin: 0 0 var(--pf-spacing-4);
  font-weight: var(--pf-type-weight-500);
  color: ${T.statusPendingText};
}
.ds-publication-note p { margin: 0; }
`;

export function GuidePublicationBadge() {
  return <span className="ds-publication-badge">{PUBLICATION_PENDING_LABEL}</span>;
}
