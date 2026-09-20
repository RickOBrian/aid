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
        fontFamily: "'Google Sans', system-ui, sans-serif",
        color: '#2d2c2e',
        background: '#ffffff',
        minHeight: '100vh',
        padding: '40px 48px 64px',
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <DsPageHeader title={sectionLabel} showSearch={false} />
        <p style={{ fontSize: 14, lineHeight: '20px', color: 'rgba(0, 0, 0, 0.54)' }}>
          Нет данных для продукта «{productLabel}».
        </p>
      </div>
    </div>
  );
}
