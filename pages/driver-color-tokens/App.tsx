import { useEffect } from 'react';
import { DriverColorTokensPage } from './DriverColorTokensPage';
import { HubPage } from './HubPage';
import { IconsPage } from './IconsPage';
import { RadiusPage } from './RadiusPage';
import { SpacingPage } from './SpacingPage';
import { ShadowsPage } from './ShadowsPage';
import { GlassPage } from './GlassPage';
import { ComponentsHubPage } from './ComponentsHubPage';
import { SwitchPage } from './SwitchPage';
import { BadgeCountPage } from './BadgeCountPage';
import { BadgeDotPage } from './BadgeDotPage';
import { GuidesHubPage } from './GuidesHubPage';
import { VersioningGuidePage } from './VersioningGuidePage';
import { TypographyPage } from './TypographyPage';
import { ProductSectionUnavailablePage } from './ProductSectionUnavailablePage';
import { HUB_ROUTES } from './hubData';
import { hasProductContent } from './productContent';
import { ProductAccentScope } from './ProductAccentScope';
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

  if (path === HUB_ROUTES.glass) {
    return 'glass' as const;
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

  if (path === HUB_ROUTES.badgeCount) {
    return 'badgeCount' as const;
  }

  if (path === HUB_ROUTES.badgeDot) {
    return 'badgeDot' as const;
  }

  if (path === HUB_ROUTES.guides) {
    return 'guides' as const;
  }

  if (path === HUB_ROUTES.guidesVersioning) {
    return 'guidesVersioning' as const;
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

  let content;

  if (page === 'not-found') {
    content = <NotFoundPage />;
  } else if (page === 'hub') {
    content = <HubPage productId={productId} />;
  } else if (page === 'colors' && hasProductContent(productId, 'colors')) {
    content = <DriverColorTokensPage productId={productId} />;
  } else   if (page === 'typography' && hasProductContent(productId, 'typography')) {
    content = <TypographyPage productId={productId} />;
  } else if (page === 'shadows' && hasProductContent(productId, 'shadows')) {
    content = <ShadowsPage productId={productId} />;
  } else if (page === 'glass' && hasProductContent(productId, 'glass')) {
    content = <GlassPage />;
  } else if (page === 'spacing' && hasProductContent(productId, 'spacing')) {
    content = <SpacingPage productId={productId} />;
  } else if (page === 'radius' && hasProductContent(productId, 'radius')) {
    content = <RadiusPage productId={productId} />;
  } else if (page === 'icons' && hasProductContent(productId, 'icons')) {
    content = <IconsPage productId={productId} />;
  } else if (page === 'guides') {
    content = <GuidesHubPage />;
  } else if (page === 'guidesVersioning') {
    content = <VersioningGuidePage />;
  } else if (productId !== DEFAULT_PRODUCT_ID) {
    content = <ProductSectionUnavailablePage productId={productId} sectionKey={page} />;
  } else if (page === 'icons') {
    content = <IconsPage />;
  } else if (page === 'shadows') {
    content = <ShadowsPage />;
  } else if (page === 'radius') {
    content = <RadiusPage />;
  } else if (page === 'spacing') {
    content = <SpacingPage />;
  } else if (page === 'components') {
    content = <ComponentsHubPage />;
  } else if (page === 'switch') {
    content = <SwitchPage />;
  } else if (page === 'badgeCount') {
    content = <BadgeCountPage />;
  } else if (page === 'badgeDot') {
    content = <BadgeDotPage />;
  } else {
    content = <NotFoundPage />;
  }

  return <ProductAccentScope productId={productId}>{content}</ProductAccentScope>;
}
