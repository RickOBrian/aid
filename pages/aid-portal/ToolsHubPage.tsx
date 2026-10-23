import { useMemo, useState } from 'react';
import { DsPageHeader } from './DsPageHeader';
import { DS_PORTAL_LAYOUT_TOKENS } from './dsChangelogTable';
import { DS_INTERACTIVE_CARD_CLASS, DS_INTERACTIVE_CARD_STYLE } from './dsInteractiveCard';
import { HUB_ROUTES } from './hubData';
import toolsRegistry from './tools-registry.json';
import { currentAppPath, withBase } from './base';
import { productPath, resolveProductId } from './productRegistry';

const T = DS_PORTAL_LAYOUT_TOKENS;

/**
 * Tools showcase — catalog of Figma plugins and DS utilities, mirroring
 * the Guides vitrina (`GuidesHubPage.tsx`) structure.
 */

const PAGE_STYLE = `
${DS_INTERACTIVE_CARD_STYLE}
.dsth,
.dsth *,
.dsth *::before,
.dsth *::after {
  box-sizing: border-box;
}
.dsth {
  font-family: ${T.fontFamily};
  color: ${T.textPrimary};
  background: ${T.surface};
  min-height: 100vh;
  padding: var(--pf-spacing-40) var(--pf-spacing-48) var(--pf-spacing-64);
}
.dsth-shell {
  max-width: 960px;
  margin: 0 auto;
}
.dsth-intro {
  margin: 0 0 var(--pf-spacing-32);
  font: var(--pf-font-body-m);
  color: ${T.textSecondary};
}
.dsth-groups {
  display: flex;
  flex-direction: column;
  gap: var(--pf-spacing-40);
}
.dsth-group-title {
  margin: 0 0 var(--pf-spacing-16);
  font: var(--pf-font-label-xs-caps);
  letter-spacing: var(--pf-tracking-label-xs-caps);
  text-transform: uppercase;
  color: ${T.textSecondary};
}
.dsth-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--pf-spacing-16);
}
.dsth-item {
  display: block;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
}
.dsth-item:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
.dsth-item-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 128px;
  padding: var(--pf-spacing-24);
  background: ${T.surfaceMuted};
  border-bottom: 1px solid ${T.border};
  pointer-events: none;
  user-select: none;
}
.dsth-item-icon {
  font-size: 40px;
  line-height: 1;
  color: ${T.textMuted};
}
.dsth-item-body {
  padding: var(--pf-spacing-16);
}
.dsth-item-title {
  margin: 0 0 var(--pf-spacing-4);
  font: var(--pf-font-heading-s);
  color: var(--pf-text-primary);
}
.dsth-item-description {
  margin: 0;
  font: var(--pf-font-body-m);
  color: ${T.textSecondary};
}
.dsth-empty {
  margin: 0;
  font: var(--pf-font-body-m);
  color: ${T.textSecondary};
}
@media (max-width: 767px) {
  .dsth {
    padding: var(--pf-spacing-20) var(--pf-spacing-16) var(--pf-spacing-40);
  }
}
`;

interface RegistryPlugin {
  pluginId: string;
  canonicalName: string;
  reviewRoute: string;
  pluginsGroup: string;
  description?: string;
}

function groupPlugins(items: RegistryPlugin[]): Array<{ group: string; items: RegistryPlugin[] }> {
  const groups = new Map<string, RegistryPlugin[]>();

  for (const item of items) {
    const group = item.pluginsGroup || 'Other';
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

export function ToolsHubPage() {
  const [search, setSearch] = useState('');
  const plugins = toolsRegistry.plugins as RegistryPlugin[];

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? plugins.filter((plugin) => {
          const haystack = [
            plugin.canonicalName,
            plugin.pluginsGroup,
            plugin.description ?? '',
            plugin.pluginId,
          ]
            .join(' ')
            .toLowerCase();
          return haystack.includes(query);
        })
      : plugins;

    return groupPlugins(filtered);
  }, [plugins, search]);

  return (
    <div className="dsth">
      <style>{PAGE_STYLE}</style>
      <main className="dsth-shell">
        <DsPageHeader
          title="Tools"
          backHref={HUB_ROUTES.hub}
          backAriaLabel="Назад к Hub"
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Поиск плагинов и инструментов"
          searchAriaLabel="Поиск плагинов и инструментов"
        />
        <p className="dsth-intro">Плагины и инструменты AID</p>

        {filteredGroups.length === 0 ? (
          <p className="dsth-empty">Плагины и инструменты не найдены.</p>
        ) : (
          <div className="dsth-groups">
            {filteredGroups.map(({ group, items }) => (
              <section key={group} aria-labelledby={`dsth-group-${group}`}>
                <h2 className="dsth-group-title" id={`dsth-group-${group}`}>
                  {group}
                </h2>
                <div className="dsth-items">
                  {items.map((plugin) => (
                    <a
                      key={plugin.pluginId}
                      className={`dsth-item ${DS_INTERACTIVE_CARD_CLASS}`}
                      href={withBase(productPath(resolveProductId(currentAppPath()), plugin.reviewRoute))}
                    >
                      <div className="dsth-item-preview" aria-hidden="true">
                        <span className="dsth-item-icon">⎘</span>
                      </div>
                      <div className="dsth-item-body">
                        <p className="dsth-item-title">{plugin.canonicalName}</p>
                        {plugin.description && (
                          <p className="dsth-item-description">{plugin.description}</p>
                        )}
                      </div>
                    </a>
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
