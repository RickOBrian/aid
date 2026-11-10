// Собирает заливку для use_figma: тело migrate-styles.js и run-page.js на figma.root одним вызовом.
// node scripts/build-kit.mjs — печатает HASH и путь к файлу заливки. Заливать один раз на версию правил.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const dir = dirname(fileURLToPath(import.meta.url));
const out = join(tmpdir(), 'aid-style-kit');
mkdirSync(out, { recursive: true });

// код выполняется внутри async-функции: для терсера заворачиваем и снимаем обёртку
const minify = name => {
  const src = join(out, name);
  writeFileSync(src, `async function __k(){${readFileSync(join(dir, name), 'utf8')}}`);
  const min = execSync(`npx --yes terser@5 "${src}" -c -m --format quote_style=1`, { encoding: 'utf8', maxBuffer: 1 << 24 }).trim();
  const m = /^async function \w+\(\)\{([\s\S]*)\}[;]?$/.exec(min);
  if (!m) throw new Error(`не снята обёртка: ${name}`);
  return m[1];
};
// хеш тот же, что считает проверка в заливке: по кодовым единицам UTF-16
const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h >>> 0; };

const body = minify('migrate-styles.js'), runner = minify('run-page.js');
const HASH = hash(body + runner);
const upload = `const b=${JSON.stringify(body)},r=${JSON.stringify(runner)};let h=0;const s=b+r;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;h=h>>>0;if(h!==${HASH})return{error:'контрольная сумма',h};const R=figma.root;R.setSharedPluginData('mig','body',b);R.setSharedPluginData('mig','runner',r);R.setSharedPluginData('mig','hash',String(h));return{hash:h,len:s.length};`;
writeFileSync(join(out, 'upload.js'), upload);
console.log(JSON.stringify({ HASH, chars: upload.length, upload: join(out, 'upload.js') }));
