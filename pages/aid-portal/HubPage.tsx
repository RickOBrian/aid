import { useEffect } from 'react';
import { buildHubSections, type HubSection } from './hubData';
import { DEFAULT_PRODUCT_ID, getProductLabel, getProductLabelParts } from './productRegistry';
import { ProductSwitcher, PRODUCT_SWITCHER_STYLE, ProductSwitcherNameTrigger } from './ProductSwitcher';
import { withBase } from './base';

const PAGE_STYLE = `
${PRODUCT_SWITCHER_STYLE}
.dsh,
.dsh *,
.dsh *::before,
.dsh *::after {
  box-sizing: border-box;
}
.dsh {
  font-family: var(--pf-type-family-sans-1);
  color: var(--pf-text-primary);
  background: var(--pf-bg-surface-main);
  min-height: 100vh;
  padding: var(--pf-spacing-40) var(--pf-spacing-48) var(--pf-spacing-64);
}
.dsh-shell {
  max-width: 1200px;
  margin: 0 auto;
}
.dsh-title-row {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: var(--pf-spacing-8);
  margin: 0 0 var(--pf-spacing-64);
}
.dsh-title {
  margin: 0;
  font: var(--pf-font-display-l);
  letter-spacing: var(--pf-tracking-display-l);
  text-align: center;
  color: var(--pf-text-primary);
}
.dsh-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--pf-spacing-48) var(--pf-spacing-64);
  align-items: start;
}
.dsh-section-title {
  margin: 0 0 var(--pf-spacing-24);
  font: var(--pf-font-label-xs-caps);
  letter-spacing: var(--pf-tracking-label-xs-caps);
  text-transform: uppercase;
  color: var(--pf-text-secondary);
}
.dsh-items {
  display: flex;
  flex-direction: column;
  gap: var(--pf-spacing-24);
}
/* IslandLink, плоский вид (без рамки) — спека presentbook-6 §3.1 */
.dsh-item {
  display: block;
  text-decoration: none;
  color: inherit;
  border-radius: var(--pf-radius-m);
  padding: var(--pf-spacing-4) 0;
  transition: background-color 150ms ease;
}
.dsh-item--link {
  cursor: pointer;
}
.dsh-item--link:hover {
  background: rgba(245, 245, 245, 0.72); /* pf-gap: bg-accent-states-hover (пачка №0) */
}
.dsh-item--link:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
.dsh-item--soon {
  cursor: not-allowed;
}
.dsh-item--soon .dsh-item-icon,
.dsh-item--soon .dsh-item-title,
.dsh-item--soon .dsh-item-description {
  color: var(--pf-text-disabled);
}
.dsh-item-head {
  display: flex;
  align-items: center;
  gap: var(--pf-spacing-10);
  margin-bottom: var(--pf-spacing-8);
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
  color: var(--pf-text-primary);
}
.dsh-item-title-row {
  display: flex;
  align-items: center;
  gap: var(--pf-spacing-8);
  min-width: 0;
}
.dsh-item-title {
  margin: 0;
  font: var(--pf-font-heading-s);
  color: var(--pf-text-primary);
}
/* Badge Neutral */
.dsh-soon-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: var(--pf-spacing-4) var(--pf-spacing-8);
  border-radius: var(--pf-radius-pill);
  background: var(--pf-bg-accent-status-neutral-main);
  font: var(--pf-font-label-s);
  color: var(--pf-text-neutral);
}
.dsh-item-description {
  margin: 0;
  padding-left: calc(28px + var(--pf-spacing-10));
  font: var(--pf-font-body-m);
  color: var(--pf-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
@media (max-width: 767px) {
  .dsh {
    padding: var(--pf-spacing-20) var(--pf-spacing-16) var(--pf-spacing-40);
  }
  .dsh-title-row {
    margin-bottom: var(--pf-spacing-40);
  }
  .dsh-title {
    font-size: 36px; /* pf-gap: мобильный display-l (стиля 36/44 в Kit нет) */
    line-height: 44px; /* pf-gap: мобильный display-l */
  }
  .dsh-grid {
    gap: var(--pf-spacing-32);
  }
  .dsh-item-description {
    white-space: normal;
  }
}
`;

function HubItemCard({ item }: { item: HubSection['items'][number] }) {
  const content = (
    <>
      <div className="dsh-item-head">
        <span className="dsh-item-icon" aria-hidden="true">{item.icon}</span>
        <div className="dsh-item-title-row">
          <p className="dsh-item-title">{item.title}</p>
          {item.href === null && <span className="dsh-soon-badge">Нет данных</span>}
        </div>
      </div>
      <p className="dsh-item-description">{item.description}</p>
    </>
  );

  if (item.href !== null) {
    return (
      <a className="dsh-item dsh-item--link" href={withBase(item.href)}>
        {content}
      </a>
    );
  }

  return (
    <div
      className="dsh-item dsh-item--soon"
      aria-disabled="true"
      title="Нет данных"
      onClick={(event) => event.preventDefault()}
    >
      {content}
    </div>
  );
}

export interface HubPageProps {
  productId?: string;
}

export function HubPage({ productId = DEFAULT_PRODUCT_ID }: HubPageProps) {
  const productLabel = getProductLabel(productId);
  const { prefix, name } = getProductLabelParts(productId);
  const sections = buildHubSections(productId);

  useEffect(() => {
    document.title = productLabel;
  }, [productLabel]);

  return (
    <div className="dsh">
      <style>{PAGE_STYLE}</style>
      <main className="dsh-shell">
        <div className="dsh-title-row">
          <ProductSwitcher currentProductId={productId} size="hub">
            <h1 className="dsh-title">
              {prefix ? <span className="ds-product-switcher__prefix">{prefix}</span> : null}
              <ProductSwitcherNameTrigger>{name}</ProductSwitcherNameTrigger>
            </h1>
          </ProductSwitcher>
        </div>
        <div className="dsh-grid">
          {sections.map((section) => (
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
