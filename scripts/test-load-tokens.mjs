import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'tokens');

function loadKit(kit) {
  const tokens = [];
  for (const layer of ['core', 'semantic']) {
    const dir = join(root, kit, layer);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
      const data = JSON.parse(readFileSync(join(dir, file), 'utf8'));
      if (Array.isArray(data)) tokens.push(...data.map((t) => ({ ...t, source: layer })));
    }
  }
  const legacyPath = join(root, kit, 'legacy', 'legacy-tokens.json');
  if (existsSync(legacyPath)) {
    const legacy = JSON.parse(readFileSync(legacyPath, 'utf8'));
    if (Array.isArray(legacy)) tokens.push(...legacy.map((t) => ({ ...t, source: 'legacy' })));
  }
  return tokens;
}

for (const kit of ['ui-kit-a', 'ui-kit-b']) {
  const tokens = loadKit(kit);
  const legacy = tokens.filter((t) => t.source === 'legacy').length;
  console.log(`${kit}: ${tokens.length} tokens (${legacy} legacy)`);
}
