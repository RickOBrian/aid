// Собирает функцию presentbook-api в один файл для Cloud Functions (nodejs22):
// deploy/yc/dist/presentbook-api/index.js. Запуск: npm run build:yc-function.
import { build } from 'esbuild';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

await build({
  entryPoints: [join(here, 'handler.ts')],
  outfile: join(here, 'dist/presentbook-api/index.js'),
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  logLevel: 'warning',
});
console.log('[build-function] deploy/yc/dist/presentbook-api/index.js');
