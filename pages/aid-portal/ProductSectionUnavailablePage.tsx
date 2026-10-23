import { useEffect } from 'react';
import { DsPageHeader } from './DsPageHeader';
import { SECTION_LABELS } from './hubData';
import { getProductLabel } from './productRegistry';

/**
 * Fallback for a content route (`/rider/tokens/colors`, `/rider/components/switch`, …)
 * reached directly via URL for a product that has no data for that section
 * yet. The hub already hides these behind disabled cards; this page only
 * covers direct navigation so the URL doesn't render blank or 404.
 */
export function ProductSectionUnavailablePage({
  productId,
  sectionKey,
}: {
  productId: string;
  sectionKey: string;
}) {
  const productLabel = getProductLabel(productId);
  const sectionLabel = SECTION_LABELS[sectionKey] ?? sectionKey;

  useEffect(() => {
    document.title = productLabel;
  }, [productLabel]);

  return (
    <div
      style={{
        fontFamily: 'var(--pf-type-family-sans-1)',
        color: 'var(--pf-text-primary)',
        background: 'var(--pf-bg-surface-main)',
        minHeight: '100vh',
        padding: 'var(--pf-spacing-40) var(--pf-spacing-48) var(--pf-spacing-64)',
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <DsPageHeader title={sectionLabel} showSearch={false} />
        <p style={{ font: 'var(--pf-font-body-m)', color: 'var(--pf-text-secondary)' }}>
          Нет данных для продукта «{productLabel}».
        </p>
      </div>
    </div>
  );
}
