import { HUB_PAGE_TITLE, HUB_SECTIONS, type HubItem } from './hubData';

const PAGE_STYLE = `
.dsh,
.dsh *,
.dsh *::before,
.dsh *::after {
  box-sizing: border-box;
}
.dsh {
  font-family: 'Google Sans', system-ui, sans-serif;
  color: #2d2c2e;
  background: #ffffff;
  min-height: 100vh;
  padding: 48px 48px 64px;
}
.dsh-shell {
  max-width: 1200px;
  margin: 0 auto;
}
.dsh-title {
  margin: 0 0 64px;
  font-size: 48px;
  font-weight: 500;
  line-height: 56px;
  letter-spacing: -0.02em;
  text-align: center;
  color: rgba(0, 0, 0, 0.87);
}
.dsh-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 48px 64px;
  align-items: start;
}
.dsh-section-title {
  margin: 0 0 24px;
  font-size: 11px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.38);
}
.dsh-items {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.dsh-item {
  display: block;
  text-decoration: none;
  color: inherit;
  border-radius: 12px;
  padding: 4px 0;
  transition: background-color 0.15s ease;
}
.dsh-item--link {
  cursor: pointer;
}
.dsh-item--link:hover {
  background: rgba(245, 245, 245, 0.72);
}
.dsh-item--link:focus-visible {
  outline: 2px solid rgba(45, 44, 46, 0.32);
  outline-offset: 4px;
}
.dsh-item--soon {
  opacity: 0.52;
  cursor: default;
  pointer-events: none;
}
.dsh-item-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.dsh-item-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
  color: #2d2c2e;
}
.dsh-item-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.dsh-item-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
  color: rgba(0, 0, 0, 0.87);
}
.dsh-soon-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: #f5f5f5;
  border: 1px solid #ebedf0;
  font-size: 11px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.02em;
  color: rgba(0, 0, 0, 0.54);
}
.dsh-item-description {
  margin: 0;
  padding-left: 38px;
  font-size: 14px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.54);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
@media (max-width: 768px) {
  .dsh {
    padding: 24px 16px 48px;
  }
  .dsh-title {
    margin-bottom: 40px;
    font-size: 36px;
    line-height: 44px;
  }
  .dsh-grid {
    gap: 32px;
  }
  .dsh-item-description {
    white-space: normal;
  }
}
`;

function HubItemCard({ item }: { item: HubItem }) {
  const content = (
    <>
      <div className="dsh-item-head">
        <span className="dsh-item-icon" aria-hidden="true">{item.icon}</span>
        <div className="dsh-item-title-row">
          <p className="dsh-item-title">{item.title}</p>
          {item.href === null && <span className="dsh-soon-badge">Скоро</span>}
        </div>
      </div>
      <p className="dsh-item-description">{item.description}</p>
    </>
  );

  if (item.href !== null) {
    return (
      <a className="dsh-item dsh-item--link" href={item.href}>
        {content}
      </a>
    );
  }

  return (
    <div className="dsh-item dsh-item--soon" aria-disabled="true">
      {content}
    </div>
  );
}

export function HubPage() {
  return (
    <div className="dsh">
      <style>{PAGE_STYLE}</style>
      <main className="dsh-shell">
        <h1 className="dsh-title">{HUB_PAGE_TITLE}</h1>
        <div className="dsh-grid">
          {HUB_SECTIONS.map((section) => (
            <section key={section.id} aria-labelledby={`dsh-section-${section.id}`}>
              <h2 className="dsh-section-title" id={`dsh-section-${section.id}`}>
                {section.title}
              </h2>
              <div className="dsh-items">
                {section.items.map((item) => (
                  <HubItemCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
