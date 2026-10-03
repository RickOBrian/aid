import { createRoot } from 'react-dom/client';
import { App } from './App';
import { AuthGate } from './AuthGate';
import { currentAppPath, withBase } from './base';
import { canonicalAppPath } from './productRegistry';

// Старые адреса (`/`, `/tokens/colors`, `/driver/design-system`) — на
// канонические с продуктом (`/driver`, `/driver/tokens/colors`) без перезагрузки.
const canonical = canonicalAppPath(currentAppPath());
if (canonical) {
  window.history.replaceState(window.history.state, '', `${withBase(canonical)}${window.location.search}${window.location.hash}`);
}

createRoot(document.getElementById('root')!).render(
  <AuthGate>
    <App />
  </AuthGate>,
);
