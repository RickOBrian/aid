// Собирает временный Node-сервер API в один файл: deploy/node/dist/server.cjs
// (AID-18). Запуск: node deploy/node/build.mjs из pages/aid-portal.
import { build } from 'esbuild';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

await build({
  entryPoints: [join(here, 'server.ts')],
  outfile: join(here, 'dist/server.cjs'),
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  logLevel: 'warning',
});
console.log('[build-node] deploy/node/dist/server.cjs');
