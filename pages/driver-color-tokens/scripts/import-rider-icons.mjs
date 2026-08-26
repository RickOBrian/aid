/**
 * Build Rider icon catalog + SVG assets from Figma Rider-Icons file (node 3691:4).
 *
 * Usage: node scripts/import-rider-icons.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync as readSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sanitizeIconSvg } from '../sanitizeIconSvg.ts';

const FILE_KEY = 'n6LppQbTv85yI29h6u30DI';
const ROOT_NODE_ID = '3691:4';
const BATCH = 50;

const SECTION_FRAMES = new Map([
  ['Brands', 'brands'],
  ['Controls', 'controls'],
  ['informative', 'informative'],
  ['Actions', 'actions'],
  ['Addresses', 'addresses'],
]);

const rootDir = dirname(fileURLToPath(import.meta.url));
const appRoot = join(rootDir, '..');
const publicRoot = join(appRoot, 'public/icons/rider');
const iconsDataPath = join(appRoot, 'products/rider/iconsData.ts');

function resolveToken() {
  if (process.env.FIGMA_API_KEY || process.env.FIGMA_API_TOKEN) {
    return process.env.FIGMA_API_KEY || process.env.FIGMA_API_TOKEN;
  }
  try {
    const mcpPath = join(rootDir, '../../../.cursor/mcp.json');
    const mcp = JSON.parse(readSync(mcpPath, 'utf8'));
    for (const server of Object.values(mcp?.mcpServers ?? {})) {
      const key = server?.env?.FIGMA_API_KEY || server?.env?.FIGMA_API_TOKEN;
      if (key) return key;
    }
  } catch {
    // noop
  }
  return null;
}

function symbolToId(symbolName) {
  if (symbolName.startsWith('Property 1=')) {
    const active = symbolName.includes('Active=On') ? 'on' : 'off';
    return `radiobutton_${active}`;
  }
  return symbolName
    .replace(/^ic_/, '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_/-]/gi, '_')
    .toLowerCase();
}

function sectionTitle(name) {
  if (name === 'informative') return 'Informative';
  return name;
}

function walkSymbols(node, sectionId, sectionTitleName, items, usedIds) {
  if (node.type === 'SYMBOL' || node.type === 'COMPONENT') {
    const figmaNodeId = node.id;
    const symbolName = node.name;
    let id = symbolToId(symbolName);
    if (usedIds.has(id)) {
      let suffix = 2;
      while (usedIds.has(`${id}_${suffix}`)) suffix += 1;
      id = `${id}_${suffix}`;
    }
    usedIds.add(id);
    items.push({
      id,
      name: id,
      figmaNodeId,
      symbolName,
      sectionId,
      sectionTitle: sectionTitleName,
    });
    return;
  }

  if (node.type === 'FRAME' && SECTION_FRAMES.has(node.name)) {
    sectionId = SECTION_FRAMES.get(node.name);
    sectionTitleName = sectionTitle(node.name);
    usedIds = new Set();
  }

  for (const child of node.children ?? []) {
    walkSymbols(child, sectionId, sectionTitleName, items, usedIds);
  }
}

function groupSections(flatItems) {
  const map = new Map();
  for (const item of flatItems) {
    if (!map.has(item.sectionId)) {
      map.set(item.sectionId, {
        id: item.sectionId,
        title: item.sectionTitle,
        items: [],
      });
    }
    map.get(item.sectionId).items.push({
      id: item.id,
      name: item.name,
      figmaNodeId: item.figmaNodeId,
    });
  }
  const order = ['brands', 'controls', 'informative', 'actions', 'addresses'];
  return order.filter((id) => map.has(id)).map((id) => map.get(id));
}

function emitIconsData(sections) {
  const lines = [
    '/**',
    ' * Rider icons from Figma «Rider Icons» (node 3691:4).',
    ' * Source: https://www.figma.com/design/n6LppQbTv85yI29h6u30DI/Rider-Icons?node-id=3691-4',
    ' */',
    '',
    "import type { IconSection } from '../../iconsData';",
    '',
    'function icon(id: string, name: string, figmaNodeId: string) {',
    '  return { id, name, figmaNodeId };',
    '}',
    '',
    'export const riderIconCollection = {',
    "  collectionName: 'rider-icons',",
    "  artifact: 'Icons/Rider',",
    '} as const;',
    '',
    'export const riderIconSections: IconSection[] = [',
  ];

  for (const section of sections) {
    lines.push('  {');
    lines.push(`    id: '${section.id}',`);
    lines.push(`    title: '${section.title}',`);
    lines.push('    items: [');
    for (const item of section.items) {
      lines.push(`      icon('${item.id}', '${item.name.replace(/'/g, "\\'")}', '${item.figmaNodeId}'),`);
    }
    lines.push('    ],');
    lines.push('  },');
  }

  lines.push('];', '');
  return `${lines.join('\n')}`;
}

const token = resolveToken();
if (!token) {
  console.error('Set FIGMA_API_KEY or FIGMA_API_TOKEN');
  process.exit(1);
}

const apiUrl = `https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${encodeURIComponent(ROOT_NODE_ID)}&depth=20`;
const treeRes = await fetch(apiUrl, { headers: { 'X-Figma-Token': token } });
if (!treeRes.ok) {
  throw new Error(`Figma nodes API ${treeRes.status}: ${await treeRes.text()}`);
}

const treeJson = await treeRes.json();
const rootNode = treeJson.nodes?.[ROOT_NODE_ID]?.document;
if (!rootNode) {
  throw new Error('Root node 3691:4 not found');
}

const flatItems = [];
walkSymbols(rootNode, null, null, flatItems, null);
const sections = groupSections(flatItems);

await mkdir(publicRoot, { recursive: true });
for (const section of sections) {
  await mkdir(join(publicRoot, section.id), { recursive: true });
}

let ok = 0;
const errors = [];
const allIcons = sections.flatMap((section) =>
  section.items.map((item) => ({ ...item, sectionId: section.id })),
);

for (let i = 0; i < allIcons.length; i += BATCH) {
  const batch = allIcons.slice(i, i + BATCH);
  const ids = batch.map((item) => item.figmaNodeId).join(',');
  const imagesUrl = `https://api.figma.com/v1/images/${FILE_KEY}?ids=${encodeURIComponent(ids)}&format=svg&svg_outline_text=false&svg_include_id=true`;
  const res = await fetch(imagesUrl, { headers: { 'X-Figma-Token': token } });
  if (!res.ok) {
    throw new Error(`Figma images API ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  if (data.err) {
    throw new Error(data.err);
  }

  for (const item of batch) {
    const assetUrl = data.images[item.figmaNodeId];
    if (!assetUrl) {
      errors.push({ id: item.id, sectionId: item.sectionId, error: 'No URL' });
      continue;
    }
    try {
      const svgRes = await fetch(assetUrl);
      if (!svgRes.ok) {
        throw new Error(`Download ${svgRes.status}`);
      }
      const raw = await svgRes.text();
      const sanitized = sanitizeIconSvg(raw, item.id);
      const outPath = join(publicRoot, item.sectionId, `${item.id}.svg`);
      await writeFile(outPath, `${sanitized}\n`, 'utf8');
      ok += 1;
    } catch (error) {
      errors.push({ id: item.id, sectionId: item.sectionId, error: String(error) });
    }
  }
}

writeFileSync(iconsDataPath, emitIconsData(sections), 'utf8');

console.log(
  JSON.stringify(
    {
      sections: sections.map((s) => ({ id: s.id, count: s.items.length })),
      total: allIcons.length,
      downloaded: ok,
      errors,
      iconsDataPath,
    },
    null,
    2,
  ),
);

spawnSync(process.execPath, ['scripts/ensure-icon-dimensions.mjs'], {
  cwd: appRoot,
  stdio: 'inherit',
});
