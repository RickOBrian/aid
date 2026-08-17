import { DriverColorTokensPage } from './DriverColorTokensPage';
import { HubPage } from './HubPage';
import { IconsPage } from './IconsPage';
import { RadiusPage } from './RadiusPage';
import { SpacingPage } from './SpacingPage';
import { ShadowsPage } from './ShadowsPage';
import { ComponentsHubPage } from './ComponentsHubPage';
import { SwitchPage } from './SwitchPage';
import { TypographyPage } from './TypographyPage';
import { HUB_ROUTES } from './hubData';

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function resolvePage(pathname: string) {
  const path = normalizePathname(pathname);

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
  const page = resolvePage(window.location.pathname);

  if (page === 'hub') {
    return <HubPage />;
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
