import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url));

/**
 * SPA sandbox routes whose URL path collides with an on-disk source
 * directory of the same name (e.g. `/components/switch` vs
 * `components/Switch.tsx`, case-insensitive on macOS/Windows). Vite's dev
 * server resolves such requests as module transforms instead of falling
 * back to `index.html`, breaking client-side routing in `npm run dev`
 * (production `vite preview` is unaffected — it only serves `dist/`).
 *
 * This plugin forces an explicit SPA fallback for these routes in dev only.
 */
function spaComponentRoutesPlugin(routes: string[]): Plugin {
  return {
    name: 'ds-spa-component-routes',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        if (routes.includes(url) && req.headers.accept?.includes('text/html')) {
          req.url = '/';
        }
        next();
      });
    },
  };
}

export default defineConfig({
  root: rootDir,
  esbuild: {
    jsx: 'automatic',
  },
  plugins: [spaComponentRoutesPlugin(['/components/switch'])],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: true,
    open: '/',
  },
});
