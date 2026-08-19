import { useEffect } from 'react';
import { DriverColorTokensPage } from './DriverColorTokensPage';
import { HubPage } from './HubPage';
import { IconsPage } from './IconsPage';
import { RadiusPage } from './RadiusPage';
import { SpacingPage } from './SpacingPage';
import { ShadowsPage } from './ShadowsPage';
import { ComponentsHubPage } from './ComponentsHubPage';
import { SwitchPage } from './SwitchPage';
import { TypographyPage } from './TypographyPage';
import { ProductSectionUnavailablePage } from './ProductSectionUnavailablePage';
import { HUB_ROUTES } from './hubData';
import { DEFAULT_PRODUCT_ID, getProductLabel, resolveProductRoute } from './productRegistry';

/**
 * Route table is unprefixed (`/tokens/colors`, `/components/switch`, …) —
 * `resolveProductRoute` strips any leading `/driver` or `/rider` segment
 * before this table is consulted, so old unprefixed Driver links keep
 * resolving exactly as before (no redirect, no regression).
 */
function resolveSectionKey(remainder: string) {
  const path = remainder === '' ? '/' : remainder;

  if (path === HUB_ROUTES.hub || path === '/') {
    return 'hub' as const;
  }

  if (path === HUB_ROUTES.colors) {
    return 'colors' as const;
  }

  if (path === HUB_ROUTES.icons) {
    return 'icons' as const;
  }

  if (path === HUB_ROUTES.typography) {
    return 'typography' as const;
  }

  if (path === HUB_ROUTES.shadows) {
    return 'shadows' as const;
  }

  if (path === HUB_ROUTES.radius) {
    return 'radius' as const;
  }

  if (path === HUB_ROUTES.spacing) {
    return 'spacing' as const;
  }

  if (path === HUB_ROUTES.components) {
    return 'components' as const;
  }

  if (path === HUB_ROUTES.switch) {
    return 'switch' as const;
  }

  return 'not-found' as const;
}

function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Google Sans', system-ui, sans-serif",
        color: '#2d2c2e',
        background: '#f5f5f5',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div>
        <p style={{ margin: '0 0 12px', fontSize: 18 }}>Страница не найдена</p>
        <a href={HUB_ROUTES.hub} style={{ color: '#2d2c2e' }}>
          Перейти на главную
        </a>
      </div>
    </div>
  );
}

export function App() {
  const { productId, remainder } = resolveProductRoute(window.location.pathname);
  const page = resolveSectionKey(remainder);

  useEffect(() => {
    if (page !== 'not-found') {
      document.title = getProductLabel(productId);
    }
  }, [productId, page]);

  if (page === 'not-found') {
    return <NotFoundPage />;
  }

  if (page === 'hub') {
    return <HubPage productId={productId} />;
  }

  // Only Driver has real page implementations today. Other products
  // (Rider) share the same routes/structure but have no content yet — see
  // `products/<id>/index.ts` and `productContent.ts`.
  if (productId !== DEFAULT_PRODUCT_ID) {
    return <ProductSectionUnavailablePage productId={productId} sectionKey={page} />;
  }

  if (page === 'colors') {
    return <DriverColorTokensPage />;
  }

  if (page === 'icons') {
    return <IconsPage />;
  }

  if (page === 'typography') {
    return <TypographyPage />;
  }

  if (page === 'shadows') {
    return <ShadowsPage />;
  }

  if (page === 'radius') {
    return <RadiusPage />;
  }

  if (page === 'spacing') {
    return <SpacingPage />;
  }

  if (page === 'components') {
    return <ComponentsHubPage />;
  }

  if (page === 'switch') {
    return <SwitchPage />;
  }

  return <NotFoundPage />;
}
