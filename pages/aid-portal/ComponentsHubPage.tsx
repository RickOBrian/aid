import { useMemo, useState } from 'react';
import { ComponentPreview } from './componentPreviewRegistry';
import { DsPageHeader } from './DsPageHeader';
import { DS_INTERACTIVE_CARD_CLASS, DS_INTERACTIVE_CARD_STYLE } from './dsInteractiveCard';
import { HUB_ROUTES } from './hubData';
import componentRegistry from './component-registry.json';
import { currentAppPath, withBase } from './base';
import { productPath, resolveProductId } from './productRegistry';

const PAGE_STYLE = `
${DS_INTERACTIVE_CARD_STYLE}
.dsch,
.dsch *,
.dsch *::before,
.dsch *::after {
  box-sizing: border-box;
}
.dsch {
  font-family: var(--pf-type-family-sans-1);
  color: var(--pf-text-primary);
  background: var(--pf-bg-surface-main);
  min-height: 100vh;
  padding: var(--pf-spacing-40) var(--pf-spacing-48) var(--pf-spacing-64);
}
.dsch-shell {
  max-width: 960px;
  margin: 0 auto;
}
.dsch-intro {
  margin: 0 0 var(--pf-spacing-32);
  font: var(--pf-font-body-m);
  color: var(--pf-text-secondary);
}
.dsch-groups {
  display: flex;
  flex-direction: column;
  gap: var(--pf-spacing-40);
}
.dsch-group-title {
  margin: 0 0 var(--pf-spacing-16);
  font: var(--pf-font-label-xs-caps);
  letter-spacing: var(--pf-tracking-label-xs-caps);
  text-transform: uppercase;
  color: var(--pf-text-secondary);
}
.dsch-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--pf-spacing-16);
}
.dsch-item {
  display: block;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
}
.dsch-item:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
.dsch-item-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 128px;
  padding: var(--pf-spacing-24);
  background: var(--pf-bg-surface-muted);
  border-bottom: 1px solid var(--pf-line-default);
  pointer-events: none;
  user-select: none;
}
.dsch-preview-fallback {
  font: var(--pf-font-body-s);
  color: var(--pf-text-muted);
}
.dsch-item-body {
  padding: var(--pf-spacing-16);
}
.dsch-item-title {
  margin: 0 0 var(--pf-spacing-4);
  font: var(--pf-font-heading-s);
  color: var(--pf-text-primary);
}
.dsch-item-description {
  margin: 0;
  font: var(--pf-font-body-m);
  color: var(--pf-text-secondary);
}
.dsch-empty {
  margin: 0;
  font: var(--pf-font-body-m);
  color: var(--pf-text-secondary);
}
@media (max-width: 767px) {
  .dsch {
    padding: var(--pf-spacing-20) var(--pf-spacing-16) var(--pf-spacing-40);
  }
}
`;

interface RegistryComponent {
  componentId: string;
  canonicalName: string;
  reviewRoute: string;
  componentsGroup: string;
  description?: string;
}

function groupComponents(items: RegistryComponent[]): Array<{ group: string; items: RegistryComponent[] }> {
  const groups = new Map<string, RegistryComponent[]>();

  for (const item of items) {
    const group = item.componentsGroup || 'Other';
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
      items: groupItems.sort((left, right) =>
        left.canonicalName.localeCompare(right.canonicalName, 'ru'),
      ),
    }));
}

export function ComponentsHubPage() {
  const [search, setSearch] = useState('');
  const components = componentRegistry.components as RegistryComponent[];

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? components.filter((component) => {
          const haystack = [
            component.canonicalName,
            component.componentsGroup,
            component.description ?? '',
            component.componentId,
          ]
            .join(' ')
            .toLowerCase();
          return haystack.includes(query);
        })
      : components;

    return groupComponents(filtered);
  }, [components, search]);

  return (
    <div className="dsch">
      <style>{PAGE_STYLE}</style>
      <main className="dsch-shell">
        <DsPageHeader
          title="Components"
          backHref={HUB_ROUTES.hub}
          backAriaLabel="Назад к Hub"
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Поиск компонентов"
          searchAriaLabel="Поиск компонентов"
        />
        <p className="dsch-intro">
          Каталог UI-компонентов дизайн-системы. Выберите компонент, чтобы открыть review sandbox.
        </p>

        {filteredGroups.length === 0 ? (
          <p className="dsch-empty">Компоненты не найдены.</p>
        ) : (
          <div className="dsch-groups">
            {filteredGroups.map(({ group, items }) => (
              <section key={group} aria-labelledby={`dsch-group-${group}`}>
                <h2 className="dsch-group-title" id={`dsch-group-${group}`}>
                  {group}
                </h2>
                <div className="dsch-items">
                  {items.map((component) => (
                    <a
                      key={component.componentId}
                      className={`dsch-item ${DS_INTERACTIVE_CARD_CLASS}`}
                      href={withBase(productPath(resolveProductId(currentAppPath()), component.reviewRoute))}
                    >
                      <div className="dsch-item-preview" aria-hidden="true">
                        <ComponentPreview componentId={component.componentId} />
                      </div>
                      <div className="dsch-item-body">
                        <p className="dsch-item-title">{component.canonicalName}</p>
                        {component.description && (
                          <p className="dsch-item-description">{component.description}</p>
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
