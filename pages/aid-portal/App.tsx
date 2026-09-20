import { useEffect } from 'react';
import { DriverColorTokensPage } from './DriverColorTokensPage';
import { HubPage } from './HubPage';
import { LoginPage } from './LoginPage';
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
import { ToolsHubPage } from './ToolsHubPage';
import { TokenComparatorPluginPage } from './TokenComparatorPluginPage';
import { GuidePage, guideExists } from './GuidePage';
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

  // Маршрут гайда динамический: /guides/<guideId>. Гайды приходят из
  // guide-registry.json и собираются build-guides.mjs, поэтому отдельная
  // ветка на каждый документ здесь не нужна.
  if (path.startsWith(`${HUB_ROUTES.guides}/`)) {
    const guideId = path.slice(HUB_ROUTES.guides.length + 1);
    return guideExists(guideId) ? ('guide' as const) : ('not-found' as const);
  }

  if (path === HUB_ROUTES.tools) {
    return 'tools' as const;
  }

  if (path === HUB_ROUTES.toolsTokenComparator) {
    return 'toolsTokenComparator' as const;
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
  // `/login` is product-agnostic (the session cookie from middleware.ts guards
  // every product) — handled before product-prefix resolution so it never
  // falls through to `NotFoundPage` for `/login` or `/rider/login`-style paths.
  if (window.location.pathname === '/login') {
    return <LoginPage />;
  }

  const { productId, remainder } = resolveProductRoute(window.location.pathname);
  const page = resolveSectionKey(remainder);

  useEffect(() => {
    // Гайд не принадлежит продукту и ставит свой заголовок сам. Эффект
    // родителя выполняется после эффекта потомка, поэтому без этой проверки
    // он бы перезаписал название гайда меткой продукта.
    if (page !== 'not-found' && page !== 'guide') {
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
  } else if (page === 'guide') {
    content = <GuidePage guideId={remainder.slice(HUB_ROUTES.guides.length + 1)} />;
  } else if (page === 'tools') {
    content = <ToolsHubPage />;
  } else if (page === 'toolsTokenComparator') {
    content = <TokenComparatorPluginPage />;
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
