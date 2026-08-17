import { useMemo, useState } from 'react';
import { ComponentPreview } from './componentPreviewRegistry';
import { DsPageHeader } from './DsPageHeader';
import { DS_INTERACTIVE_CARD_CLASS, DS_INTERACTIVE_CARD_STYLE } from './dsInteractiveCard';
import { HUB_ROUTES } from './hubData';
import componentRegistry from './component-registry.json';

const PAGE_STYLE = `
${DS_INTERACTIVE_CARD_STYLE}
.dsch,
.dsch *,
.dsch *::before,
.dsch *::after {
  box-sizing: border-box;
}
.dsch {
  font-family: 'Google Sans', system-ui, sans-serif;
  color: #2d2c2e;
  background: #ffffff;
  min-height: 100vh;
  padding: 48px 48px 64px;
}
.dsch-shell {
  max-width: 960px;
  margin: 0 auto;
}
.dsch-intro {
  margin: 0 0 32px;
  font-size: 14px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.54);
}
.dsch-groups {
  display: flex;
  flex-direction: column;
  gap: 40px;
}
.dsch-group-title {
  margin: 0 0 16px;
  font-size: 11px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.32);
}
.dsch-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.dsch-item {
  display: block;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  transition: background-color 0.15s ease;
}
.dsch-item:hover {
  background: rgba(245, 245, 245, 0.48);
}
.dsch-item:focus-visible {
  outline: 2px solid rgba(45, 44, 46, 0.32);
  outline-offset: 2px;
}
.dsch-item-preview {
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
.dsch-preview-fallback {
  font-size: 13px;
  line-height: 16px;
  color: rgba(0, 0, 0, 0.38);
}
.dsch-item-body {
  padding: 16px;
}
.dsch-item-title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
  color: rgba(0, 0, 0, 0.87);
}
.dsch-item-description {
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.54);
}
.dsch-empty {
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.54);
}
@media (max-width: 768px) {
  .dsch {
    padding: 24px 16px 48px;
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
                      href={component.reviewRoute}
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
