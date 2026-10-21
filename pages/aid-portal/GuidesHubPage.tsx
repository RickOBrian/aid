import { useMemo, useState } from 'react';
import { DsPageHeader } from './DsPageHeader';
import { DS_INTERACTIVE_CARD_CLASS, DS_INTERACTIVE_CARD_STYLE } from './dsInteractiveCard';
import guideRegistry from './guide-registry.json';
import { currentAppPath, withBase } from './base';
import { productPath, resolveProductId } from './productRegistry';
import { DS_PORTAL_LAYOUT_TOKENS as T } from './dsChangelogTable';
import { GUIDE_PUBLICATION_STYLE, GuidePublicationBadge, isPendingApproval } from './GuidePublicationBadge';

/**
 * Guides showcase — catalog of DS governance/standards documents, mirroring
 * the Components vitrina (`ComponentsHubPage.tsx`) structure: search, groups,
 * a card per guide. Cards show a document icon + version badge instead of a
 * live component preview — guides are text documents, not renderable UI.
 *
 * Гайды на согласовании (`publication: "pending-approval"`) показываются
 * отдельным разделом «На согласовании» с пометкой вместо версии и в общие
 * группы не попадают, пока PD их не примет.
 */

const PAGE_STYLE = `
${DS_INTERACTIVE_CARD_STYLE}
${GUIDE_PUBLICATION_STYLE}
.dsgh,
.dsgh *,
.dsgh *::before,
.dsgh *::after {
  box-sizing: border-box;
}
.dsgh {
  font-family: 'Google Sans', system-ui, sans-serif;
  color: #2d2c2e;
  background: #ffffff;
  min-height: 100vh;
  padding: 48px 48px 64px;
}
.dsgh-shell {
  max-width: 960px;
  margin: 0 auto;
}
.dsgh-intro {
  margin: 0 0 32px;
  font-size: 14px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.54);
}
.dsgh-groups {
  display: flex;
  flex-direction: column;
  gap: 40px;
}
.dsgh-group-title {
  margin: 0 0 16px;
  font-size: 11px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.32);
}
.dsgh-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.dsgh-item {
  display: block;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  transition: background-color 0.15s ease;
}
.dsgh-item:hover {
  background: rgba(245, 245, 245, 0.48);
}
.dsgh-item:focus-visible {
  outline: 2px solid rgba(45, 44, 46, 0.32);
  outline-offset: 2px;
}
.dsgh-item-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 128px;
  padding: 24px;
  background: #f5f5f5;
  border-bottom: 1px solid #ebedf0;
  pointer-events: none;
  user-select: none;
}
.dsgh-item-icon {
  font-size: 40px;
  line-height: 1;
  color: rgba(0, 0, 0, 0.32);
}
.dsgh-item-body {
  padding: 16px;
}
.dsgh-item-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.dsgh-item-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
  color: rgba(0, 0, 0, 0.87);
}
.dsgh-item-version {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: #f5f5f5;
  border: 1px solid #ebedf0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.54);
}
.dsgh-item-description {
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.54);
}
.dsgh-empty {
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.54);
}
.dsgh-preview {
  margin: 0 0 40px;
  padding: 20px;
  border: 1px dashed ${T.statusPendingBorder};
  border-radius: ${T.cardRadius};
  background: ${T.statusPendingSurfaceSubtle};
}
.dsgh-preview .dsgh-group-title { color: ${T.statusPendingText}; }
.dsgh-preview-intro {
  margin: -8px 0 16px;
  font-size: 13px;
  line-height: 20px;
  color: ${T.textSecondary};
}
.dsgh-item-author {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 18px;
  color: ${T.textSecondary};
}
@media (max-width: 768px) {
  .dsgh {
    padding: 24px 16px 48px;
  }
}
`;

interface RegistryGuide {
  guideId: string;
  canonicalName: string;
  version?: string;
  reviewRoute: string;
  guidesGroup: string;
  description?: string;
  publication?: string;
  author?: string;
}

function GuideCard({ guide }: { guide: RegistryGuide }) {
  const pending = isPendingApproval(guide.publication);
  return (
    <a
      className={`dsgh-item ${DS_INTERACTIVE_CARD_CLASS}`}
      href={withBase(productPath(resolveProductId(currentAppPath()), guide.reviewRoute))}
    >
      <div className="dsgh-item-preview" aria-hidden="true">
        <span className="dsgh-item-icon">▤</span>
      </div>
      <div className="dsgh-item-body">
        <div className="dsgh-item-title-row">
          <p className="dsgh-item-title">{guide.canonicalName}</p>
          {pending ? (
            <GuidePublicationBadge />
          ) : guide.version ? (
            <span className="dsgh-item-version">v{guide.version}</span>
          ) : null}
        </div>
        {guide.description && <p className="dsgh-item-description">{guide.description}</p>}
        {guide.author && <p className="dsgh-item-author">Автор: {guide.author}</p>}
      </div>
    </a>
  );
}

function groupGuides(items: RegistryGuide[]): Array<{ group: string; items: RegistryGuide[] }> {
  const groups = new Map<string, RegistryGuide[]>();

  for (const item of items) {
    const group = item.guidesGroup || 'Other';
    const existing = groups.get(group);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(group, [item]);
    }
  }

  return Array.from(groups.entries())
    .sort(([left], [right]) => left.localeCompare(right, 'ru'))
    .map(([group, groupItems]) => ({
      group,
      items: groupItems.sort((left, right) => left.canonicalName.localeCompare(right.canonicalName, 'ru')),
    }));
}

export function GuidesHubPage() {
  const [search, setSearch] = useState('');
  const guides = guideRegistry.guides as RegistryGuide[];

  const { pending, groups: filteredGroups } = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? guides.filter((guide) => {
          const haystack = [guide.canonicalName, guide.guidesGroup, guide.description ?? '', guide.guideId, guide.author ?? '']
            .join(' ')
            .toLowerCase();
          return haystack.includes(query);
        })
      : guides;

    return {
      pending: filtered.filter((guide) => isPendingApproval(guide.publication)),
      groups: groupGuides(filtered.filter((guide) => !isPendingApproval(guide.publication))),
    };
  }, [guides, search]);

  return (
    <div className="dsgh">
      <style>{PAGE_STYLE}</style>
      <main className="dsgh-shell">
        <DsPageHeader
          title="Guides"
          backAriaLabel="Назад к Hub"
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Поиск гайдов"
          searchAriaLabel="Поиск гайдов"
        />
        <p className="dsgh-intro">
          Гайды дизайн-системы: правила версионирования, архитектура компонентов, спеки и другие
          стандарты. Выберите гайд, чтобы открыть его.
        </p>

        {pending.length > 0 ? (
          <section className="dsgh-preview" aria-labelledby="dsgh-group-preview">
            <h2 className="dsgh-group-title" id="dsgh-group-preview">
              На согласовании
            </h2>
            <p className="dsgh-preview-intro">
              Черновики гайдов, которые ещё не приняты в Presentbook. После согласования гайд переходит в общий
              список без пометки.
            </p>
            <div className="dsgh-items">
              {pending.map((guide) => (
                <GuideCard key={guide.guideId} guide={guide} />
              ))}
            </div>
          </section>
        ) : null}

        {filteredGroups.length === 0 && pending.length === 0 ? (
          <p className="dsgh-empty">Гайды не найдены.</p>
        ) : (
          <div className="dsgh-groups">
            {filteredGroups.map(({ group, items }) => (
              <section key={group} aria-labelledby={`dsgh-group-${group}`}>
                <h2 className="dsgh-group-title" id={`dsgh-group-${group}`}>
                  {group}
                </h2>
                <div className="dsgh-items">
                  {items.map((guide) => (
                    <GuideCard key={guide.guideId} guide={guide} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
