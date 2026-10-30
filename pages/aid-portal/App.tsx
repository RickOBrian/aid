import { useEffect } from 'react';
import { DriverColorTokensPage } from './DriverColorTokensPage';
import { HubPage } from './HubPage';
import { LoginPage } from './LoginPage';
import { TtmPage } from './TtmPage';
import { ManagePage } from './ManagePage';
import { TasksPage } from './TasksPage';
import { TeamPage } from './TeamPage';
import { IconsPage } from './IconsPage';
import { RadiusPage } from './RadiusPage';
import { SpacingPage } from './SpacingPage';
import { ShadowsPage } from './ShadowsPage';
import { GlassPage } from './GlassPage';
import { GradientsPage } from './GradientsPage';
import { ComponentsHubPage } from './ComponentsHubPage';
import { SwitchPage } from './SwitchPage';
import { BadgeCountPage } from './BadgeCountPage';
import { BadgeDotPage } from './BadgeDotPage';
import { GuidesHubPage } from './GuidesHubPage';
import { ToolsHubPage } from './ToolsHubPage';
import { TokenComparatorPluginPage } from './TokenComparatorPluginPage';
import { MapShimmerPage } from './MapShimmerPage';
import { GuidePage, findGuideByPath } from './GuidePage';
import { TypographyPage } from './TypographyPage';
import { ProductSectionUnavailablePage } from './ProductSectionUnavailablePage';
import { HUB_ROUTES } from './hubData';
import { hasProductContent } from './productContent';
import { ProductAccentScope } from './ProductAccentScope';
import { DEFAULT_PRODUCT_ID, getProductLabel, normalizePathname, productHubPath, resolveProductId, resolveProductRoute } from './productRegistry';
import { currentAppPath, withBase } from './base';

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

  if (path === HUB_ROUTES.gradients) {
    return 'gradients' as const;
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

  // Маршрут гайда динамический: /guides/<guideId>, у гайда на согласовании —
  // /guides/preview/<guideId>[/<глава>]. Гайды приходят из
  // guide-registry.json и собираются build-guides.mjs, поэтому отдельная
  // ветка на каждый документ здесь не нужна.
  if (path.startsWith(`${HUB_ROUTES.guides}/`)) {
    return findGuideByPath(normalizePathname(path)) ? ('guide' as const) : ('not-found' as const);
  }

  if (path === HUB_ROUTES.tools) {
    return 'tools' as const;
  }

  if (path === HUB_ROUTES.toolsTokenComparator) {
    return 'toolsTokenComparator' as const;
  }

  if (path === HUB_ROUTES.toolsMapShimmer) {
    return 'toolsMapShimmer' as const;
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
        fontFamily: 'var(--pf-type-family-sans-1)',
        color: 'var(--pf-text-primary)',
        background: 'var(--pf-bg-surface-main)',
        padding: 'var(--pf-spacing-24)',
        textAlign: 'center',
      }}
    >
      <div>
        <p style={{ margin: '0 0 var(--pf-spacing-12)', font: 'var(--pf-font-heading-m)' }}>Страница не найдена</p>
        <a href={withBase(productHubPath(resolveProductId(currentAppPath())))} style={{ color: 'var(--pf-text-accent)', textDecoration: 'underline' }}>
          Перейти на главную
        </a>
      </div>
    </div>
  );
}

export function App() {
  // `/login` is product-agnostic (one session cookie, checked by AuthGate,
  // covers every product) — handled before product-prefix resolution so it never
  // falls through to `NotFoundPage` for `/login` or `/rider/login`-style paths.
  if (currentAppPath() === '/login') {
    return <LoginPage />;
  }
  // `/ttm` — КПД команды AID (AID-13): без продукта и без ссылок из меню.
  if (currentAppPath() === '/ttm') {
    return <TtmPage />;
  }
  // «Управление» (ADR-046): без продукта в адресе и без ссылок из меню.
  const managePath = normalizePathname(currentAppPath());
  if (managePath === '/manage') {
    return <ManagePage />;
  }
  if (managePath === '/manage/tasks' || managePath.startsWith('/manage/tasks/')) {
    return <TasksPage />;
  }
  if (managePath === '/manage/team') {
    return <TeamPage />;
  }

  const { productId, remainder } = resolveProductRoute(currentAppPath());
  const page = resolveSectionKey(remainder);

  useEffect(() => {
    // Гайд не принадлежит продукту и ставит свой заголовок сам. Эффект
    // родителя выполняется после эффекта потомка, поэтому без этой проверки
    // он бы перезаписал название гайда меткой продукта.
    if (page !== 'not-found' && page !== 'guide' && page !== 'toolsMapShimmer') {
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
  } else if (page === 'gradients' && hasProductContent(productId, 'gradients')) {
    content = <GradientsPage />;
  } else if (page === 'spacing' && hasProductContent(productId, 'spacing')) {
    content = <SpacingPage productId={productId} />;
  } else if (page === 'radius' && hasProductContent(productId, 'radius')) {
    content = <RadiusPage productId={productId} />;
  } else if (page === 'icons' && hasProductContent(productId, 'icons')) {
    content = <IconsPage productId={productId} />;
  } else if (page === 'guides') {
    content = <GuidesHubPage />;
  } else if (page === 'guide') {
    content = <GuidePage path={normalizePathname(remainder)} />;
  } else if (page === 'tools') {
    content = <ToolsHubPage />;
  } else if (page === 'toolsTokenComparator') {
    content = <TokenComparatorPluginPage />;
  } else if (page === 'toolsMapShimmer') {
    content = <MapShimmerPage />;
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

  // Гайды, инструменты и «не найдено» не зависят от продукта: хром у них —
  // графит Kit из `:root`, без цвета продукта (приёмка #384, п. 1).
  const productNeutral =
    page === 'not-found' || page === 'guides' || page === 'guide' || page === 'tools' || page === 'toolsTokenComparator' || page === 'toolsMapShimmer';
  if (productNeutral || content.type === NotFoundPage) {
    return content;
  }
  return <ProductAccentScope productId={productId}>{content}</ProductAccentScope>;
}
