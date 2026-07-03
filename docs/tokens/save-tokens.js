#!/usr/bin/env node
/**
 * docs/tokens/save-tokens.js
 *
 * Persists typography CSS custom properties to :root blocks across the docs site.
 *
 * Usage:
 *   echo '{"--body-m-size":"15px"}' | node docs/tokens/save-tokens.js
 *   node docs/tokens/save-tokens.js --serve [port]
 *
 * POST body: { tokens: { "--token": "value" }, changes?: [{ token, oldValue, newValue }], author?: "name" }
 * Legacy body: { "--token": "value", ... }
 */

'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const CHANGELOG_PATH = path.join(__dirname, 'typography-tokens-changelog.md');
const COLOR_REGISTRY_PATH = path.join(__dirname, 'color-tokens-registry.md');
const COLOR_CHANGELOG_PATH = path.join(__dirname, 'color-tokens-changelog.md');
const GUIDES_DIR = path.join(REPO_ROOT, 'docs', 'guides');
const STORYBOOK_DIR = path.join(REPO_ROOT, 'docs', 'storybook');
const STORYBOOK_COLOR_TOKENS_CSS = path.join(STORYBOOK_DIR, 'storybook-color-tokens.css');
const STYLE_CSS = path.join(REPO_ROOT, 'docs', 'assets', 'style.css');
const DOCS_THEME_CSS = path.join(REPO_ROOT, 'docs', 'assets', 'docs-theme.css');

const EXTRA_CSS_TARGETS = [STYLE_CSS, DOCS_THEME_CSS];

function listHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.html'))
    .map((name) => path.join(dir, name));
}

function getTargetFiles() {
  return [
    ...listHtmlFiles(GUIDES_DIR),
    ...listHtmlFiles(STORYBOOK_DIR),
    ...EXTRA_CSS_TARGETS.filter((f) => fs.existsSync(f)),
  ];
}

function updateRootBlocks(content, updates) {
  let updated = content;
  let changed = false;

  const rootRe = /:root\s*\{/g;
  let match;
  const replacements = [];

  while ((match = rootRe.exec(content)) !== null) {
    const open = match.index + match[0].length;
    let depth = 1;
    let i = open;
    while (i < content.length && depth > 0) {
      if (content[i] === '{') depth += 1;
      if (content[i] === '}') depth -= 1;
      i += 1;
    }
    if (depth !== 0) continue;

    const inner = content.slice(open, i - 1);
    let newInner = inner;
    let blockChanged = false;

    for (const [token, value] of Object.entries(updates)) {
      const declRe = new RegExp(`(${escapeRegExp(token)}\\s*:\\s*)([^;\\n]+)(\\s*;)`, 'g');
      if (declRe.test(newInner)) {
        newInner = newInner.replace(declRe, `$1${value}$3`);
        blockChanged = true;
      }
    }

    if (blockChanged) {
      replacements.push({ start: open, end: i - 1, text: newInner });
      changed = true;
    }
  }

  for (let r = replacements.length - 1; r >= 0; r -= 1) {
    const { start, end, text } = replacements[r];
    updated = updated.slice(0, start) + text + updated.slice(end);
  }

  return { content: updated, changed };
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function readLatestVersion() {
  const md = fs.readFileSync(CHANGELOG_PATH, 'utf8');
  const versions = [...md.matchAll(/\|\s*(\d+\.\d+\.\d+)\s*\|/g)].map((m) => m[1]);
  return versions.length ? versions[versions.length - 1] : '1.0.0';
}

function bumpPatch(version) {
  // Token value change = PATCH per semver-guide.md
  // MINOR = new token added, MAJOR = token renamed or deleted
  const parts = version.split('.').map(Number);
  parts[2] += 1;
  return parts.join('.');
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatChangelogEntry(changes) {
  if (!changes.length) {
    return { tokenCol: 'multiple', changeCol: 'token updates' };
  }

  const tokenCol = changes.map((c) => c.token).join(', ');
  const changeCol =
    changes.length > 3
      ? `${changes.length} tokens updated`
      : changes.map((c) => `${c.token}: ${c.oldValue} → ${c.newValue}`).join('; ');

  return { tokenCol, changeCol };
}

function isColorToken(name) {
  return /^--(core|bg|text|icon|line|shadow)-/.test(name);
}

function normalizeSemanticRegistryRef(value) {
  const v = value.trim();
  if (!v) return v;
  if (v.startsWith('var(--')) return v.slice(6, -1).replace(/^--/, '');
  if (v.startsWith('var(')) return v.slice(4, -1).replace(/^--/, '');
  return v.replace(/^--/, '');
}

function updateColorRegistry(content, tokens) {
  let updated = content;
  let changed = false;

  for (const [token, value] of Object.entries(tokens)) {
    const coreRe = new RegExp(
      `(\\| ${escapeRegExp(token)} \\| core \\| )([^|]+)( \\|)`,
      'g'
    );
    if (coreRe.test(content)) {
      updated = updated.replace(coreRe, `$1${value}$3`);
      changed = true;
      continue;
    }

    const semanticRe = new RegExp(
      `(\\| ${escapeRegExp(token)} \\| semantic \\| )([^|]+)( \\|)`,
      'g'
    );
    if (semanticRe.test(updated)) {
      const ref = normalizeSemanticRegistryRef(value);
      updated = updated.replace(semanticRe, `$1${ref}$3`);
      changed = true;
    }
  }

  return { content: updated, changed };
}

function readLatestVersionFrom(md) {
  const versions = [...md.matchAll(/\|\s*(\d+\.\d+\.\d+)\s*\|/g)].map((m) => m[1]);
  return versions.length ? versions[versions.length - 1] : '1.0.0';
}

function appendChangelogFile(changelogPath, { version, date, changes, author }) {
  let md = fs.readFileSync(changelogPath, 'utf8');
  const { tokenCol, changeCol } = formatChangelogEntry(changes);
  const row = `| ${version} | ${date} | ${tokenCol} | ${changeCol} | ${author} |`;

  const insertAt = md.lastIndexOf('\n|');
  if (insertAt === -1) {
    md += '\n' + row + '\n';
  } else {
    const lineEnd = md.indexOf('\n', insertAt + 1);
    const pos = lineEnd === -1 ? md.length : lineEnd;
    md = md.slice(0, pos) + '\n' + row + md.slice(pos);
  }

  fs.writeFileSync(changelogPath, md, 'utf8');
}

function appendTypographyChangelog(entry) {
  appendChangelogFile(CHANGELOG_PATH, entry);
}

function appendColorChangelog(entry) {
  appendChangelogFile(COLOR_CHANGELOG_PATH, entry);
}

function splitTokensByKind(tokens) {
  const color = {};
  const typography = {};
  for (const [key, value] of Object.entries(tokens)) {
    if (isColorToken(key)) color[key] = value;
    else typography[key] = value;
  }
  return { color, typography };
}

function cssValueForRoot(token, value) {
  if (!isColorToken(token)) return value;
  if (token.startsWith('--core-')) return value;
  if (value.startsWith('var(')) return value;
  if (value.startsWith('--')) return `var(${value})`;
  return `var(--${value})`;
}

function getColorTargetFiles() {
  const files = [
    ...listHtmlFiles(GUIDES_DIR).filter((f) => f.includes('color-tokens')),
    STORYBOOK_COLOR_TOKENS_CSS,
  ];
  return files.filter((f) => fs.existsSync(f));
}

function normalizePayload(body) {
  const author = body.author || 'system';
  const tokens = body.tokens && typeof body.tokens === 'object' ? body.tokens : body;
  const changes = Array.isArray(body.changes) ? body.changes : [];

  const cleanTokens = {};
  for (const [key, value] of Object.entries(tokens)) {
    if (key.startsWith('--') && typeof value === 'string') {
      cleanTokens[key] = value.trim();
    }
  }

  return { tokens: cleanTokens, changes, author };
}

function saveTokens(payload) {
  const { tokens, changes, author } = normalizePayload(payload);
  const tokenNames = Object.keys(tokens);

  if (!tokenNames.length) {
    return { ok: false, error: 'No tokens in request body' };
  }

  const { color: colorTokens, typography: typoTokens } = splitTokensByKind(tokens);
  const filesUpdated = [];
  const date = todayISO();
  let savedVersion = null;
  const changelogChanges =
    changes.length > 0
      ? changes
      : tokenNames.map((token) => ({
          token,
          oldValue: '—',
          newValue: tokens[token],
        }));

  if (Object.keys(typoTokens).length) {
    for (const filePath of getTargetFiles()) {
      const original = fs.readFileSync(filePath, 'utf8');
      const { content, changed } = updateRootBlocks(original, typoTokens);
      if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        filesUpdated.push(path.relative(REPO_ROOT, filePath));
      }
    }

    const typoChanges = changelogChanges.filter((c) => !isColorToken(c.token));
    if (typoChanges.length) {
      savedVersion = bumpPatch(readLatestVersion());
      appendTypographyChangelog({ version: savedVersion, date, changes: typoChanges, author });
    }
  }

  if (Object.keys(colorTokens).length) {
    const rootUpdates = {};
    for (const [token, value] of Object.entries(colorTokens)) {
      rootUpdates[token] = cssValueForRoot(token, value);
    }

    for (const filePath of getColorTargetFiles()) {
      const original = fs.readFileSync(filePath, 'utf8');
      const { content, changed } = updateRootBlocks(original, rootUpdates);
      if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        filesUpdated.push(path.relative(REPO_ROOT, filePath));
      }
    }

    if (fs.existsSync(COLOR_REGISTRY_PATH)) {
      const registry = fs.readFileSync(COLOR_REGISTRY_PATH, 'utf8');
      const { content, changed } = updateColorRegistry(registry, colorTokens);
      if (changed) {
        fs.writeFileSync(COLOR_REGISTRY_PATH, content, 'utf8');
        filesUpdated.push(path.relative(REPO_ROOT, COLOR_REGISTRY_PATH));
      }
    }

    const colorChanges = changelogChanges.filter((c) => isColorToken(c.token));
    if (colorChanges.length) {
      const colorVersion = bumpPatch(
        readLatestVersionFrom(fs.readFileSync(COLOR_CHANGELOG_PATH, 'utf8'))
      );
      appendColorChangelog({ version: colorVersion, date, changes: colorChanges, author });
      if (!savedVersion) savedVersion = colorVersion;
    }
  }

  return { ok: true, version: savedVersion || '1.0.0', filesUpdated: [...new Set(filesUpdated)] };
}

function readStdin() {
  return new Promise((resolve, reject) => {
    const chunks = [];
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => chunks.push(c));
    process.stdin.on('end', () => resolve(chunks.join('')));
    process.stdin.on('error', reject);
  });
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
  });
  res.end(body);
}

function startServer(port) {
  const server = http.createServer(async (req, res) => {
    const path = (req.url || '').split('?')[0];

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
      res.end();
      return;
    }

    if (req.method !== 'POST') {
      sendJson(res, 405, { ok: false, error: 'Method not allowed' });
      return;
    }

    if (path !== '/' && path !== '/save-tokens' && path !== '/docs/tokens/save-tokens') {
      sendJson(res, 404, { ok: false, error: 'Not found' });
      return;
    }

    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        const payload = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
        const result = saveTokens(payload);
        sendJson(res, result.ok ? 200 : 400, result);
      } catch (err) {
        sendJson(res, 500, { ok: false, error: err.message });
      }
    });
  });

  server.listen(port, () => {
    console.log(`save-tokens server → http://localhost:${port}`);
  });
}

async function main() {
  if (process.argv.includes('--serve')) {
    const portArg = process.argv[process.argv.indexOf('--serve') + 1];
    startServer(Number(portArg) || 3336);
    return;
  }

  const argJson = process.argv[2];
  const raw = argJson || (await readStdin());
  if (!raw || !raw.trim()) {
    console.error('Usage: node save-tokens.js \'{"--body-m-size":"15px"}\'');
    process.exit(1);
  }

  const result = saveTokens(JSON.parse(raw));
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
