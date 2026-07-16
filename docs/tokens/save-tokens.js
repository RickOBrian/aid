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
const TYPOGRAPHY_REGISTRY_PATH = path.join(__dirname, 'typography-tokens-registry.md');
const GUIDES_DIR = path.join(REPO_ROOT, 'docs', 'guides');
const STORYBOOK_DIR = path.join(REPO_ROOT, 'docs', 'storybook');
const STORYBOOK_COLOR_TOKENS_CSS = path.join(STORYBOOK_DIR, 'storybook-color-tokens.css');
const STORYBOOK_TYPOGRAPHY_TOKENS_CSS = path.join(STORYBOOK_DIR, 'storybook-typography-tokens.css');
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

// ── Canonical registry write (mode-aware) ───────────────────────────────
//
// color-tokens-registry.md is THE single source of truth. Each change is
// written to the correct column (Light / Dark) of its token row. Core tokens
// store a raw value; semantic tokens store a core-token reference (var(...)
// stripped to `core-*`). Line-based editing preserves the markdown table
// structure exactly.
function registryValueForToken(token, rawValue) {
  if (token.startsWith('--core-')) return String(rawValue).trim();
  return normalizeSemanticRegistryRef(rawValue);
}

function applyColorChangesToRegistry(content, colorChangeList) {
  const byToken = new Map();
  for (const change of colorChangeList) {
    if (!byToken.has(change.token)) byToken.set(change.token, {});
    const slot = byToken.get(change.token);
    const value = registryValueForToken(change.token, change.newValue);
    if (change.mode === 'dark') slot.dark = value;
    else slot.light = value;
  }

  let changed = false;
  const lines = content.split('\n').map((line) => {
    if (!line.startsWith('|')) return line;
    const cells = line.split('|'); // ['', ' token ', ' level ', ' light ', ' dark ', ' usedIn ', '']
    if (cells.length < 6) return line;
    const token = cells[1].trim();
    if (!byToken.has(token)) return line;

    const upd = byToken.get(token);
    if (upd.light !== undefined) cells[3] = ` ${upd.light} `;
    if (upd.dark !== undefined) cells[4] = ` ${upd.dark} `;
    changed = true;
    return cells.join('|');
  });

  return { content: lines.join('\n'), changed };
}

function appendColorRegistryRows(content, newRows) {
  const rowLines = newRows.map(
    (r) => `| ${r.token} | ${r.level} | ${r.light} | ${r.dark} | ${r.usedIn || '—'} |`
  );
  return insertTableRows(content, rowLines);
}

function parseColorRegistryRows(md) {
  const rows = [];
  let inTable = false;

  for (const line of md.split('\n')) {
    if (!line.startsWith('|')) continue;
    if (line.includes('Token') && line.includes('Level')) {
      inTable = true;
      continue;
    }
    if (!inTable || /^[|\s\-:]+$/.test(line)) continue;

    const cells = line.split('|').map((c) => c.trim());
    if (cells.length < 6) continue;
    const token = cells[1].startsWith('--') ? cells[1] : `--${cells[1]}`;
    rows.push({ token, level: cells[2].toLowerCase(), light: cells[3], dark: cells[4], usedIn: cells[5] || '—' });
  }

  return rows;
}

// ── Runtime CSS var layer, GENERATED from the canonical registry ─────────
//
// storybook-color-tokens.css is not hand-maintained — it is a derived output
// of the registry. Regenerating it on every save guarantees: every registry
// token is declared, no drift, no `var(--token)` that resolves to nothing.
function registryRefToCss(value) {
  const v = String(value).trim();
  if (!v || v === '—') return null;
  if (v.startsWith('var(')) return v;
  if (/^#/.test(v) || /^rgba?\(/i.test(v) || /^hsla?\(/i.test(v)) return v;
  if (v.startsWith('--')) return `var(${v})`;
  return `var(--${v})`;
}

// ── Typography registry (canonical source, mirrors the color registry) ───

function parseTypographyRegistryRows(md) {
  const rows = [];
  let inTable = false;

  for (const line of md.split('\n')) {
    if (!line.startsWith('|')) continue;
    if (line.includes('Token') && line.includes('Category')) {
      inTable = true;
      continue;
    }
    if (!inTable || /^[|\s\-:]+$/.test(line)) continue;

    const cells = line.split('|').map((c) => c.trim());
    if (cells.length < 5) continue;
    const token = cells[1].startsWith('--') ? cells[1] : `--${cells[1]}`;
    rows.push({ token, category: cells[2], value: cells[3], usedIn: cells[4] || '—' });
  }

  return rows;
}

function applyTypographyChangesToRegistry(content, changeList) {
  const byToken = new Map(changeList.map((c) => [c.token, c.newValue]));

  let changed = false;
  const lines = content.split('\n').map((line) => {
    if (!line.startsWith('|')) return line;
    const cells = line.split('|');
    if (cells.length < 6) return line;
    const token = cells[1].trim();
    if (!byToken.has(token)) return line;
    cells[3] = ` ${byToken.get(token)} `;
    changed = true;
    return cells.join('|');
  });

  return { content: lines.join('\n'), changed };
}

function appendTypographyRegistryRows(content, newRows) {
  const rowLines = newRows.map(
    (r) => `| ${r.token} | ${r.category} | ${r.value} | ${r.usedIn || '—'} |`
  );
  return insertTableRows(content, rowLines);
}

function renderStorybookTypographyCss(rows) {
  const decls = rows
    .filter((r) => r.value && r.value !== '—')
    .map((r) => `  ${r.token}: ${r.value};`);

  return [
    '/* Storybook — typography tokens (see skills/_shared/token-rules.md) */',
    '/* GENERATED from docs/tokens/typography-tokens-registry.md by save-tokens.js — do not edit by hand */',
    '',
    ':root {',
    decls.join('\n'),
    '}',
    '',
  ].join('\n');
}

// Append one or more `| ... |` table rows right after the last existing row
// of the (single) markdown table in the file. Falls back to end-of-file.
function insertTableRows(content, rowLines) {
  const lines = content.split('\n');
  let lastRowIdx = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].startsWith('|') && !/^[|\s\-:]+$/.test(lines[i])) lastRowIdx = i;
  }
  if (lastRowIdx === -1) {
    return `${content.replace(/\n+$/, '')}\n${rowLines.join('\n')}\n`;
  }
  lines.splice(lastRowIdx + 1, 0, ...rowLines);
  return lines.join('\n');
}

function renderStorybookColorCss(rows) {
  const lightDecls = [];
  const darkDecls = [];

  for (const row of rows) {
    const light = registryRefToCss(row.light);
    if (light) lightDecls.push(`  ${row.token}: ${light};`);
    const dark = registryRefToCss(row.dark);
    if (dark) darkDecls.push(`  ${row.token}: ${dark};`);
  }

  return [
    '/* Storybook — color tokens (no-hardcode-color-protocol) */',
    '/* GENERATED from docs/tokens/color-tokens-registry.md by save-tokens.js — do not edit by hand */',
    '',
    ':root {',
    lightDecls.join('\n'),
    '}',
    '',
    '[data-theme="dark"] {',
    darkDecls.join('\n'),
    '}',
    '',
  ].join('\n');
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

// ── Create flow: new token / new style ────────────────────────────────────
//
// Separate, explicit channel (payload.creates) — does NOT reuse the
// tokens/changes diffing path used by in-place edits. A create is validated
// server-side (defense in depth: the client already validates, but the
// registry on disk is the actual source of truth and may have moved since
// the editor loaded it), written straight into the canonical registry, and
// the derived generated CSS is regenerated in the same request — so the
// new token is real (declared + resolvable) before the response returns.

const PALETTE_NAME_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const PALETTE_FORBIDDEN_WORDS = [
  'primary', 'secondary', 'brand', 'error', 'success', 'warning',
  'danger', 'info', 'accent', 'main', 'default',
];
const CORE_STEP_RE = /^\d{1,3}(?:-a\d{2}|-b)?$/;
const HEX_COLOR_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const RGBA_COLOR_RE = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)$/i;
const SEMANTIC_TOKEN_NAME_RE = /^--(?:bg|text|icon|line|shadow)-[a-z]+(?:-[a-z]+)*$/;
const TYPOGRAPHY_ROLE_RE = /^(?:heading|body|label|meta)-[a-z0-9]+$/;
const TYPOGRAPHY_STANDALONE_RE = /^--(?:font-[\w-]+|leading-[\w-]+|tracking-[\w-]+)$/;
const TYPOGRAPHY_ROLE_CATEGORY = { size: 'font-size', lh: 'line-height', weight: 'font-weight', tracking: 'letter-spacing' };

function isValidColorValue(value) {
  return HEX_COLOR_RE.test(value) || RGBA_COLOR_RE.test(value);
}

function looksLikeColorValue(value) {
  const v = String(value).trim();
  return (
    isValidColorValue(v) ||
    /^hsla?\(/i.test(v) ||
    /var\(--(?:core|text|icon|bg|line)-/i.test(v)
  );
}

function validatePaletteName(name) {
  if (!PALETTE_NAME_RE.test(name)) {
    return 'Имя палитры: строчные буквы/цифры, дефис как разделитель (например sapphire, neutral-x)';
  }
  const lower = name.toLowerCase();
  if (PALETTE_FORBIDDEN_WORDS.some((w) => lower.includes(w))) {
    return 'Core-палитра должна быть нейтральной (без слов вроде primary/brand/error/main)';
  }
  return null;
}

function coreTokenExists(coreRows, token) {
  return coreRows.some((r) => r.token.toLowerCase() === token.toLowerCase());
}

// Core-уровень не имеет light/dark mode-splitting: один raw value на токен.
// Mode-aware mapping — исключительно semantic-слой (ссылка на разные
// core-токены). Поэтому create-операция принимает единственное поле value,
// без light/dark пары.
function validateCoreColorCreate(op, coreRows) {
  const palette = String(op.palette || '').trim().toLowerCase();
  const step = String(op.step || '').trim();
  const value = String(op.value || '').trim();

  const paletteError = validatePaletteName(palette);
  if (paletteError) return { error: paletteError, field: 'palette' };
  if (!CORE_STEP_RE.test(step)) {
    return { error: 'Step: число (0-100), опционально с -aNN (alpha) или -b', field: 'step' };
  }
  if (!isValidColorValue(value)) {
    return { error: 'Value: #RRGGBB или rgba(r, g, b, a)', field: 'value' };
  }

  const token = `--core-${palette}-${step}`;
  if (coreTokenExists(coreRows, token)) {
    return { error: `Токен ${token} уже существует`, field: 'step' };
  }

  // row.light/row.dark — это имена столбцов общей registry-таблицы
  // (историческая, разделяемая с semantic-строками структура хранения),
  // а не mode-концепция уровня core. dark всегда '—' и не берётся из
  // пользовательского ввода.
  return {
    row: { token, level: 'core', light: value, dark: '—', usedIn: '—' },
  };
}

function validateSemanticColorCreate(op, coreRows, semanticRows) {
  const token = String(op.token || '').trim();
  const light = String(op.light || '').trim();
  const dark = String(op.dark || '').trim();

  if (!SEMANTIC_TOKEN_NAME_RE.test(token)) {
    return {
      error: 'Имя: --(bg|text|icon|line|shadow)-роль-вариант, только строчные буквы и дефисы, без цифр',
      field: 'token',
    };
  }
  if (semanticRows.some((r) => r.token.toLowerCase() === token.toLowerCase())) {
    return { error: `Токен ${token} уже существует`, field: 'token' };
  }

  const lightCore = normalizeSemanticRegistryRef(light);
  if (!light || !coreTokenExists(coreRows, `--${lightCore.replace(/^--/, '')}`)) {
    return { error: 'Light value должен ссылаться на существующий core-токен', field: 'light' };
  }

  let darkCore = '—';
  if (dark && dark !== '—') {
    darkCore = normalizeSemanticRegistryRef(dark);
    if (!coreTokenExists(coreRows, `--${darkCore.replace(/^--/, '')}`)) {
      return { error: 'Dark value должен ссылаться на существующий core-токен', field: 'dark' };
    }
  }

  return {
    row: { token, level: 'semantic', light: lightCore, dark: darkCore, usedIn: '—' },
  };
}

function typographyTokenExists(typoRows, token) {
  return typoRows.some((r) => r.token.toLowerCase() === token.toLowerCase());
}

function validateTypographyRoleCreate(op, typoRows) {
  const role = String(op.role || '').trim().toLowerCase();
  if (!TYPOGRAPHY_ROLE_RE.test(role)) {
    return {
      error: 'Role: heading|body|label|meta + строчный суффикс (например heading-2xl)',
      field: 'role',
    };
  }

  const props = ['size', 'lh', 'weight', 'tracking'];
  const values = {};
  for (const prop of props) {
    const raw = String(op[prop] || '').trim();
    if (!raw) return { error: `Свойство "${prop}" обязательно для полного typography-стиля`, field: prop };
    if (looksLikeColorValue(raw)) {
      return { error: 'Typography-токен не может содержать цветовое значение', field: prop };
    }
    values[prop] = raw;
  }

  const rows = props.map((prop) => ({
    token: `--${role}-${prop}`,
    category: TYPOGRAPHY_ROLE_CATEGORY[prop],
    value: values[prop],
    usedIn: '—',
  }));

  const dup = rows.find((r) => typographyTokenExists(typoRows, r.token));
  if (dup) return { error: `Токен ${dup.token} уже существует`, field: 'role' };

  return { rows };
}

function validateTypographyStandaloneCreate(op, typoRows) {
  const token = String(op.token || '').trim();
  const value = String(op.value || '').trim();
  const category = String(op.category || '').trim() || 'other';

  if (!TYPOGRAPHY_STANDALONE_RE.test(token)) {
    return {
      error: 'Имя: --font-*, --leading-* или --tracking-* (строчные буквы, цифры, дефис)',
      field: 'token',
    };
  }
  if (!value) return { error: 'Значение обязательно', field: 'value' };
  if (looksLikeColorValue(value)) {
    return { error: 'Typography-токен не может содержать цветовое значение', field: 'value' };
  }
  if (typographyTokenExists(typoRows, token)) {
    return { error: `Токен ${token} уже существует`, field: 'token' };
  }

  return { rows: [{ token, category, value, usedIn: '—' }] };
}

function processCreates(creates, author, date) {
  const filesUpdated = [];
  const createdTokens = [];

  const colorRegistryExists = fs.existsSync(COLOR_REGISTRY_PATH);
  let colorRegistryMd = colorRegistryExists ? fs.readFileSync(COLOR_REGISTRY_PATH, 'utf8') : '';
  let coreRows = colorRegistryExists ? parseColorRegistryRows(colorRegistryMd).filter((r) => r.level === 'core') : [];
  let semanticRows = colorRegistryExists ? parseColorRegistryRows(colorRegistryMd).filter((r) => r.level === 'semantic') : [];
  const newColorRows = [];

  const typoRegistryExists = fs.existsSync(TYPOGRAPHY_REGISTRY_PATH);
  let typoRegistryMd = typoRegistryExists ? fs.readFileSync(TYPOGRAPHY_REGISTRY_PATH, 'utf8') : '';
  let typoRows = typoRegistryExists ? parseTypographyRegistryRows(typoRegistryMd) : [];
  const newTypoRows = [];

  for (const op of creates) {
    const kind = op && op.kind;

    if (kind === 'core-color') {
      const result = validateCoreColorCreate(op, coreRows);
      if (result.error) return { ok: false, error: result.error, field: result.field };
      coreRows = [...coreRows, result.row];
      newColorRows.push(result.row);
      createdTokens.push(result.row.token);
    } else if (kind === 'semantic-color') {
      const result = validateSemanticColorCreate(op, coreRows, semanticRows);
      if (result.error) return { ok: false, error: result.error, field: result.field };
      semanticRows = [...semanticRows, result.row];
      newColorRows.push(result.row);
      createdTokens.push(result.row.token);
    } else if (kind === 'typography-role') {
      const result = validateTypographyRoleCreate(op, typoRows);
      if (result.error) return { ok: false, error: result.error, field: result.field };
      typoRows = [...typoRows, ...result.rows];
      newTypoRows.push(...result.rows);
      createdTokens.push(...result.rows.map((r) => r.token));
    } else if (kind === 'typography-standalone') {
      const result = validateTypographyStandaloneCreate(op, typoRows);
      if (result.error) return { ok: false, error: result.error, field: result.field };
      typoRows = [...typoRows, ...result.rows];
      newTypoRows.push(...result.rows);
      createdTokens.push(...result.rows.map((r) => r.token));
    } else {
      return { ok: false, error: `Неизвестный тип создания: ${kind}` };
    }
  }

  let colorVersion = null;
  if (newColorRows.length) {
    if (!colorRegistryExists) return { ok: false, error: 'color-tokens-registry.md не найден' };
    colorRegistryMd = appendColorRegistryRows(colorRegistryMd, newColorRows);
    fs.writeFileSync(COLOR_REGISTRY_PATH, colorRegistryMd, 'utf8');
    filesUpdated.push(path.relative(REPO_ROOT, COLOR_REGISTRY_PATH));

    const allColorRows = parseColorRegistryRows(colorRegistryMd);
    const css = renderStorybookColorCss(allColorRows);
    fs.writeFileSync(STORYBOOK_COLOR_TOKENS_CSS, css, 'utf8');
    filesUpdated.push(path.relative(REPO_ROOT, STORYBOOK_COLOR_TOKENS_CSS));

    colorVersion = bumpPatch(readLatestVersionFrom(fs.readFileSync(COLOR_CHANGELOG_PATH, 'utf8')));
    appendColorChangelog({
      version: colorVersion,
      date,
      changes: newColorRows.map((r) => ({
        token: r.token,
        oldValue: '—',
        newValue: r.level === 'core' ? r.light : `${r.light} / ${r.dark}`,
      })),
      author,
    });
  }

  let typoVersion = null;
  if (newTypoRows.length) {
    if (!typoRegistryExists) return { ok: false, error: 'typography-tokens-registry.md не найден' };
    typoRegistryMd = appendTypographyRegistryRows(typoRegistryMd, newTypoRows);
    fs.writeFileSync(TYPOGRAPHY_REGISTRY_PATH, typoRegistryMd, 'utf8');
    filesUpdated.push(path.relative(REPO_ROOT, TYPOGRAPHY_REGISTRY_PATH));

    const allTypoRows = parseTypographyRegistryRows(typoRegistryMd);
    const css = renderStorybookTypographyCss(allTypoRows);
    fs.writeFileSync(STORYBOOK_TYPOGRAPHY_TOKENS_CSS, css, 'utf8');
    filesUpdated.push(path.relative(REPO_ROOT, STORYBOOK_TYPOGRAPHY_TOKENS_CSS));

    typoVersion = bumpPatch(readLatestVersion());
    appendTypographyChangelog({
      version: typoVersion,
      date,
      changes: newTypoRows.map((r) => ({ token: r.token, oldValue: '—', newValue: r.value })),
      author,
    });
  }

  return {
    ok: true,
    version: colorVersion || typoVersion || '1.0.0',
    filesUpdated: [...new Set(filesUpdated)],
    createdTokens,
  };
}

// ── Delete flow: remove token / style / (empty) category ──────────────────
//
// Separate, explicit channel (payload.deletes) — symmetric to creates and
// never touching the tokens/changes edit path. Deletion is destructive, so
// the server re-runs the dependency/usage check against the on-disk registry
// (the client already checks, but the file is the source of truth and may
// have moved). If a token is still referenced by another token or lists any
// consumer, the delete is refused with the blocking dependency list — the
// server never silently drops a used token, and never reassigns dependents.

function usedInConsumers(cell) {
  const v = String(cell || '').trim();
  if (!v || v === '—' || v === '(reserved)') return [];
  return v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// A semantic light/dark cell stores a core-token reference like
// `core-sapphire-55` (or `var(--core-…)`); normalize to `--core-…` for
// exact comparison against a core token name. Hex/rgba/empty → null.
function normalizeCoreRefName(cell) {
  const v = String(cell || '').trim();
  if (!v || v === '—') return null;
  if (/^#/.test(v) || /^rgba?\(/i.test(v) || /^hsla?\(/i.test(v)) return null;
  const stripped = v.replace(/^var\(/, '').replace(/\)$/, '');
  return stripped.startsWith('--') ? stripped : `--${stripped}`;
}

function corePaletteOf(token) {
  const body = String(token).replace(/^--core-/, '');
  const m = body.match(/^(.+)-(\d+(?:-a\d+|-b)?)$/);
  return m ? m[1] : body;
}

// Structural dependents (semantic tokens referencing this core token) plus
// declared consumers (usedIn column). Deduplicated on a normalized key so a
// dependent listed both structurally (`--bg-accent-main`) and in usedIn
// (`bg-accent-main`, possibly with a `(dark)` note) is surfaced only once.
function collectColorTokenBlockers(token, coreRow, semanticRows) {
  const refs = semanticRows
    .filter((r) => normalizeCoreRefName(r.light) === token || normalizeCoreRefName(r.dark) === token)
    .map((r) => r.token);

  const dedupKey = (name) => name.replace(/^--/, '').replace(/\s*\(.*\)\s*$/, '').trim();
  const seen = new Set(refs.map(dedupKey));
  const out = [...refs];

  for (const consumer of usedInConsumers(coreRow ? coreRow.usedIn : '')) {
    const key = dedupKey(consumer);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(consumer);
  }
  return out;
}

function validateColorTokenDelete(op, coreRows, semanticRows) {
  const token = String(op.token || '').trim();
  if (!token) return { error: 'Не указан токен для удаления' };

  const coreRow = coreRows.find((r) => r.token === token);
  const semRow = semanticRows.find((r) => r.token === token);
  if (!coreRow && !semRow) return { error: `Токен ${token} не найден в реестре` };

  if (coreRow) {
    const blockers = collectColorTokenBlockers(token, coreRow, semanticRows);
    if (blockers.length) {
      return {
        error: `Нельзя удалить ${token}: на него ссылаются другие токены / консьюмеры`,
        blockers,
        blocked: true,
      };
    }
    return { token, level: 'core', oldValue: coreRow.light };
  }

  const consumers = usedInConsumers(semRow.usedIn);
  if (consumers.length) {
    return {
      error: `Нельзя удалить ${token}: используется консьюмерами`,
      blockers: consumers,
      blocked: true,
    };
  }
  return { token, level: 'semantic', oldValue: `${semRow.light} / ${semRow.dark}` };
}

function validateTypographyTokenDelete(op, typoRows) {
  const token = String(op.token || '').trim();
  if (!token) return { error: 'Не указан токен для удаления' };

  const row = typoRows.find((r) => r.token === token);
  if (!row) return { error: `Токен ${token} не найден в реестре` };

  const consumers = usedInConsumers(row.usedIn);
  if (consumers.length) {
    return {
      error: `Нельзя удалить ${token}: используется консьюмерами`,
      blockers: consumers,
      blocked: true,
    };
  }
  return { token, oldValue: row.value };
}

// Category deletion is intentionally NON-cascading: only an empty core
// category may be removed. A non-empty category returns its contained tokens
// as blockers — the server never mass-deletes or reassigns them heuristically.
function validateCoreCategoryDelete(op, coreRows) {
  const palette = String(op.palette || '').trim();
  if (!palette) return { error: 'Не указана категория для удаления' };

  const contained = coreRows.filter((r) => corePaletteOf(r.token) === palette).map((r) => r.token);
  if (contained.length) {
    return {
      error: `Категория "${palette}" не пуста — сначала удалите её токены по отдельности`,
      blockers: contained,
      blocked: true,
    };
  }
  return { palette, empty: true };
}

// Drop every table row whose token cell matches one of `tokens`. Header and
// separator rows (and any non-table line) are preserved untouched.
function removeRegistryRows(content, tokens) {
  const set = new Set(tokens);
  const lines = content.split('\n').filter((line) => {
    if (!line.startsWith('|')) return true;
    if (/^[|\s\-:]+$/.test(line)) return true;
    const cells = line.split('|').map((c) => c.trim());
    const raw = cells[1] || '';
    if (raw === 'Token') return true;
    const token = raw.startsWith('--') ? raw : `--${raw}`;
    return !set.has(token);
  });
  return lines.join('\n');
}

function processDeletes(deletes, author, date) {
  const filesUpdated = [];

  const colorRegistryExists = fs.existsSync(COLOR_REGISTRY_PATH);
  const colorRegistryMd = colorRegistryExists ? fs.readFileSync(COLOR_REGISTRY_PATH, 'utf8') : '';
  const allColorRows = colorRegistryExists ? parseColorRegistryRows(colorRegistryMd) : [];
  const coreRows = allColorRows.filter((r) => r.level === 'core');
  const semanticRows = allColorRows.filter((r) => r.level === 'semantic');

  const typoRegistryExists = fs.existsSync(TYPOGRAPHY_REGISTRY_PATH);
  const typoRegistryMd = typoRegistryExists ? fs.readFileSync(TYPOGRAPHY_REGISTRY_PATH, 'utf8') : '';
  const typoRows = typoRegistryExists ? parseTypographyRegistryRows(typoRegistryMd) : [];

  const colorTokensToDelete = [];
  const typoTokensToDelete = [];
  const colorChanges = [];
  const typoChanges = [];

  for (const op of deletes) {
    const kind = op && op.kind;

    if (kind === 'color-token') {
      const result = validateColorTokenDelete(op, coreRows, semanticRows);
      if (result.error) {
        return { ok: false, error: result.error, blockers: result.blockers, blocked: result.blocked };
      }
      colorTokensToDelete.push(result.token);
      colorChanges.push({ token: result.token, oldValue: result.oldValue, newValue: '(deleted)' });
    } else if (kind === 'typography-token') {
      const result = validateTypographyTokenDelete(op, typoRows);
      if (result.error) {
        return { ok: false, error: result.error, blockers: result.blockers, blocked: result.blocked };
      }
      typoTokensToDelete.push(result.token);
      typoChanges.push({ token: result.token, oldValue: result.oldValue, newValue: '(deleted)' });
    } else if (kind === 'core-category') {
      const result = validateCoreCategoryDelete(op, coreRows);
      if (result.error) {
        return { ok: false, error: result.error, blockers: result.blockers, blocked: result.blocked };
      }
      // Empty category → nothing to remove from the registry (categories are
      // derived from token names). Succeeds as a no-op.
    } else {
      return { ok: false, error: `Неизвестный тип удаления: ${kind}` };
    }
  }

  let colorVersion = null;
  if (colorTokensToDelete.length) {
    if (!colorRegistryExists) return { ok: false, error: 'color-tokens-registry.md не найден' };
    const nextMd = removeRegistryRows(colorRegistryMd, colorTokensToDelete);
    fs.writeFileSync(COLOR_REGISTRY_PATH, nextMd, 'utf8');
    filesUpdated.push(path.relative(REPO_ROOT, COLOR_REGISTRY_PATH));

    if (fs.existsSync(STORYBOOK_COLOR_TOKENS_CSS)) {
      const css = renderStorybookColorCss(parseColorRegistryRows(nextMd));
      fs.writeFileSync(STORYBOOK_COLOR_TOKENS_CSS, css, 'utf8');
      filesUpdated.push(path.relative(REPO_ROOT, STORYBOOK_COLOR_TOKENS_CSS));
    }

    colorVersion = bumpPatch(readLatestVersionFrom(fs.readFileSync(COLOR_CHANGELOG_PATH, 'utf8')));
    appendColorChangelog({ version: colorVersion, date, changes: colorChanges, author });
  }

  let typoVersion = null;
  if (typoTokensToDelete.length) {
    if (!typoRegistryExists) return { ok: false, error: 'typography-tokens-registry.md не найден' };
    const nextMd = removeRegistryRows(typoRegistryMd, typoTokensToDelete);
    fs.writeFileSync(TYPOGRAPHY_REGISTRY_PATH, nextMd, 'utf8');
    filesUpdated.push(path.relative(REPO_ROOT, TYPOGRAPHY_REGISTRY_PATH));

    if (fs.existsSync(STORYBOOK_TYPOGRAPHY_TOKENS_CSS)) {
      const css = renderStorybookTypographyCss(parseTypographyRegistryRows(nextMd));
      fs.writeFileSync(STORYBOOK_TYPOGRAPHY_TOKENS_CSS, css, 'utf8');
      filesUpdated.push(path.relative(REPO_ROOT, STORYBOOK_TYPOGRAPHY_TOKENS_CSS));
    }

    typoVersion = bumpPatch(readLatestVersion());
    appendTypographyChangelog({ version: typoVersion, date, changes: typoChanges, author });
  }

  return {
    ok: true,
    version: colorVersion || typoVersion || '1.0.0',
    filesUpdated: [...new Set(filesUpdated)],
    deletedTokens: [...colorTokensToDelete, ...typoTokensToDelete],
  };
}

// ── Rename flow: rename token / category with reference cascade ───────────
//
// Separate, explicit channel (payload.renames). A rename is NEVER a cosmetic
// label change: it rewrites the canonical registry (the token's own row AND
// every intra-registry reference — semantic→core value cells, usedIn
// mentions), regenerates the derived CSS, and rewrites every CSS-var consumer
// (`var(--old)` / `--old:` declarations) across the docs surfaces. Occurrences
// that are NOT safe, mechanical, token-boundary replacements (e.g. a bare
// mention of the name in prose) are never touched — they are reported back as
// `manualReview` so nothing is silently left as a broken/stale reference.
// Server re-validates against the on-disk registry (source of truth).

function coreTokenStep(token) {
  const body = String(token).replace(/^--core-/, '');
  const m = body.match(/^(.+)-(\d+(?:-a\d+|-b)?)$/);
  return m ? m[2] : null;
}

function validateColorTokenRename(op, coreRows, semanticRows) {
  const from = String(op.from || '').trim();
  const to = String(op.to || '').trim();
  if (!from || !to) return { error: 'Не указаны from/to для переименования' };
  if (from === to) return { error: 'Новое имя совпадает со старым', field: 'to' };

  const isCore = coreRows.some((r) => r.token === from);
  const isSem = semanticRows.some((r) => r.token === from);
  if (!isCore && !isSem) return { error: `Токен ${from} не найден в реестре` };

  if (isCore) {
    if (!to.startsWith('--core-')) return { error: 'Имя core-токена: --core-<палитра>-<step>', field: 'to' };
    const m = to.replace(/^--core-/, '').match(/^(.+)-(\d+(?:-a\d+|-b)?)$/);
    if (!m) return { error: 'Имя core-токена: --core-<палитра>-<step>', field: 'to' };
    const palErr = validatePaletteName(m[1]);
    if (palErr) return { error: palErr, field: 'to' };
    if (!CORE_STEP_RE.test(m[2])) return { error: 'Step: число 0-100, опц. -aNN или -b', field: 'to' };
  } else if (!SEMANTIC_TOKEN_NAME_RE.test(to)) {
    return { error: 'Имя semantic-токена: --(bg|text|icon|line|shadow)-…', field: 'to' };
  }

  if (coreRows.some((r) => r.token === to) || semanticRows.some((r) => r.token === to)) {
    return { error: `Токен ${to} уже существует`, field: 'to' };
  }
  return { map: new Map([[from, to]]) };
}

function validateCoreCategoryRename(op, coreRows) {
  const from = String(op.from || '').trim();
  const to = String(op.to || '').trim();
  if (!from || !to) return { error: 'Не указаны from/to категории' };
  if (from === to) return { error: 'Новое имя совпадает со старым', field: 'to' };

  const palErr = validatePaletteName(to);
  if (palErr) return { error: palErr, field: 'to' };

  const inCat = coreRows.filter((r) => corePaletteOf(r.token) === from);
  if (!inCat.length) return { error: `Категория "${from}" не найдена` };
  if (coreRows.some((r) => corePaletteOf(r.token) === to)) {
    return { error: `Категория "${to}" уже существует`, field: 'to' };
  }

  const map = new Map();
  for (const r of inCat) {
    const step = coreTokenStep(r.token);
    if (!step) return { error: `Не удалось разобрать step у ${r.token}` };
    map.set(r.token, `--core-${to}-${step}`);
  }
  for (const nt of map.values()) {
    if (coreRows.some((r) => r.token === nt)) return { error: `Токен ${nt} уже существует`, field: 'to' };
  }
  return { map };
}

function validateTypographyTokenRename(op, typoRows) {
  const from = String(op.from || '').trim();
  const to = String(op.to || '').trim();
  if (!from || !to) return { error: 'Не указаны from/to' };
  if (from === to) return { error: 'Новое имя совпадает со старым', field: 'to' };
  if (!typoRows.some((r) => r.token === from)) return { error: `Токен ${from} не найден` };
  if (!TYPOGRAPHY_STANDALONE_RE.test(to)) {
    return { error: 'Имя: --font-*, --leading-* или --tracking-*', field: 'to' };
  }
  if (typoRows.some((r) => r.token === to)) return { error: `Токен ${to} уже существует`, field: 'to' };
  return { map: new Map([[from, to]]) };
}

function validateTypographyRoleRename(op, typoRows) {
  const from = String(op.from || '').trim();
  const to = String(op.to || '').trim();
  if (!from || !to) return { error: 'Не указаны from/to роли' };
  if (from === to) return { error: 'Новое имя совпадает со старым', field: 'to' };
  if (!TYPOGRAPHY_ROLE_RE.test(to)) {
    return { error: 'Role: heading|body|label|meta + строчный суффикс', field: 'to' };
  }

  const props = ['size', 'lh', 'weight', 'tracking'];
  const existing = props.filter((p) => typoRows.some((r) => r.token === `--${from}-${p}`));
  if (!existing.length) return { error: `Роль ${from} не найдена` };
  for (const p of props) {
    if (typoRows.some((r) => r.token === `--${to}-${p}`)) {
      return { error: `Токен --${to}-${p} уже существует`, field: 'to' };
    }
  }

  const map = new Map();
  existing.forEach((p) => map.set(`--${from}-${p}`, `--${to}-${p}`));
  return { map };
}

function bareMapFrom(renameMap) {
  return new Map([...renameMap].map(([k, v]) => [k.replace(/^--/, ''), v.replace(/^--/, '')]));
}

// Cell-level rewrite of the color registry: token cell, semantic→core value
// cells, and denormalized usedIn mentions. No substring guessing — every
// replacement is anchored to a specific parsed cell.
function applyRenamesToColorRegistry(content, renameMap) {
  const bareMap = bareMapFrom(renameMap);
  let changed = false;

  const lines = content.split('\n').map((line) => {
    if (!line.startsWith('|') || /^[|\s\-:]+$/.test(line)) return line;
    const cells = line.split('|');
    if (cells.length < 7) return line;
    if (cells[1].trim() === 'Token') return line;

    const tokRaw = cells[1].trim();
    const tok = tokRaw.startsWith('--') ? tokRaw : `--${tokRaw}`;
    if (renameMap.has(tok)) {
      cells[1] = ` ${renameMap.get(tok)} `;
      changed = true;
    }

    if (cells[2].trim().toLowerCase() === 'semantic') {
      [3, 4].forEach((i) => {
        const val = cells[i].trim();
        if (!val || val === '—') return;
        const norm = normalizeCoreRefName(val);
        if (norm && renameMap.has(norm)) {
          cells[i] = ` ${renameMap.get(norm).replace(/^--/, '')} `;
          changed = true;
        }
      });
    }

    const used = cells[5];
    if (used && used.trim() && used.trim() !== '—') {
      let u = used;
      for (const [ob, nb] of bareMap) {
        const re = new RegExp(`${escapeRegExp(ob)}(?![\\w-])`, 'g');
        if (re.test(u)) {
          u = u.replace(re, nb);
          changed = true;
        }
      }
      cells[5] = u;
    }

    return cells.join('|');
  });

  return { content: lines.join('\n'), changed };
}

function applyRenamesToTypographyRegistry(content, renameMap) {
  const bareMap = bareMapFrom(renameMap);
  let changed = false;

  const lines = content.split('\n').map((line) => {
    if (!line.startsWith('|') || /^[|\s\-:]+$/.test(line)) return line;
    const cells = line.split('|');
    if (cells.length < 6) return line;
    if (cells[1].trim() === 'Token') return line;

    const tokRaw = cells[1].trim();
    const tok = tokRaw.startsWith('--') ? tokRaw : `--${tokRaw}`;
    if (renameMap.has(tok)) {
      cells[1] = ` ${renameMap.get(tok)} `;
      changed = true;
    }

    const used = cells[4];
    if (used && used.trim() && used.trim() !== '—') {
      let u = used;
      for (const [ob, nb] of bareMap) {
        const re = new RegExp(`${escapeRegExp(ob)}(?![\\w-])`, 'g');
        if (re.test(u)) {
          u = u.replace(re, nb);
          changed = true;
        }
      }
      cells[4] = u;
    }

    return cells.join('|');
  });

  return { content: lines.join('\n'), changed };
}

// Every .html / .css under docs/, except the two generated token CSS files
// (regenerated from the registry) and hidden dirs.
function walkDocConsumerFiles() {
  const out = [];
  const root = path.join(REPO_ROOT, 'docs');
  (function rec(dir) {
    for (const name of fs.readdirSync(dir)) {
      if (name.startsWith('.')) continue;
      const fp = path.join(dir, name);
      const st = fs.statSync(fp);
      if (st.isDirectory()) rec(fp);
      else if (/\.(html|css)$/.test(name)) out.push(fp);
    }
  })(root);
  return out.filter((fp) => fp !== STORYBOOK_COLOR_TOKENS_CSS && fp !== STORYBOOK_TYPOGRAPHY_TOKENS_CSS);
}

// Rewrite only mechanical, token-boundary-safe references (`var(--old)` and
// `--old:` declarations). Any other boundary-matched occurrence of the old
// name (prose, code samples) is counted and reported for manual review, never
// silently rewritten.
function rewriteConsumerReferences(renameMap) {
  const filesUpdated = [];
  const manualReview = [];

  for (const fp of walkDocConsumerFiles()) {
    let content = fs.readFileSync(fp, 'utf8');
    const original = content;
    let fileOther = 0;

    for (const [oldT, newT] of renameMap) {
      const oldEsc = escapeRegExp(oldT);
      const totalCount = (content.match(new RegExp(`${oldEsc}(?![\\w-])`, 'g')) || []).length;
      if (!totalCount) continue;

      const varRe = new RegExp(`var\\(\\s*${oldEsc}\\s*\\)`, 'g');
      const varCount = (content.match(varRe) || []).length;
      content = content.replace(varRe, `var(${newT})`);

      const declRe = new RegExp(`${oldEsc}(?![\\w-])(\\s*:)`, 'g');
      const declCount = (content.match(declRe) || []).length;
      content = content.replace(declRe, `${newT}$1`);

      const other = totalCount - varCount - declCount;
      if (other > 0) fileOther += other;
    }

    if (content !== original) {
      fs.writeFileSync(fp, content, 'utf8');
      filesUpdated.push(path.relative(REPO_ROOT, fp));
    }
    if (fileOther > 0) manualReview.push({ file: path.relative(REPO_ROOT, fp), count: fileOther });
  }

  return { filesUpdated, manualReview };
}

function processRenames(renames, author, date) {
  const filesUpdated = [];
  const renamedPairs = [];

  const colorExists = fs.existsSync(COLOR_REGISTRY_PATH);
  let colorMd = colorExists ? fs.readFileSync(COLOR_REGISTRY_PATH, 'utf8') : '';
  const allColor = colorExists ? parseColorRegistryRows(colorMd) : [];
  const coreRows = allColor.filter((r) => r.level === 'core');
  const semanticRows = allColor.filter((r) => r.level === 'semantic');

  const typoExists = fs.existsSync(TYPOGRAPHY_REGISTRY_PATH);
  let typoMd = typoExists ? fs.readFileSync(TYPOGRAPHY_REGISTRY_PATH, 'utf8') : '';
  const typoRows = typoExists ? parseTypographyRegistryRows(typoMd) : [];

  const colorMap = new Map();
  const typoMap = new Map();
  const colorChanges = [];
  const typoChanges = [];

  const record = (map, changes, r) => {
    for (const [f, t] of r.map) {
      map.set(f, t);
      changes.push({ token: f, oldValue: f, newValue: `${t} (renamed)` });
      renamedPairs.push({ from: f, to: t });
    }
  };

  for (const op of renames) {
    const kind = op && op.kind;
    if (kind === 'color-token') {
      const r = validateColorTokenRename(op, coreRows, semanticRows);
      if (r.error) return { ok: false, error: r.error, field: r.field };
      record(colorMap, colorChanges, r);
    } else if (kind === 'core-category') {
      const r = validateCoreCategoryRename(op, coreRows);
      if (r.error) return { ok: false, error: r.error, field: r.field };
      record(colorMap, colorChanges, r);
    } else if (kind === 'typography-token') {
      const r = validateTypographyTokenRename(op, typoRows);
      if (r.error) return { ok: false, error: r.error, field: r.field };
      record(typoMap, typoChanges, r);
    } else if (kind === 'typography-role') {
      const r = validateTypographyRoleRename(op, typoRows);
      if (r.error) return { ok: false, error: r.error, field: r.field };
      record(typoMap, typoChanges, r);
    } else {
      return { ok: false, error: `Неизвестный тип переименования: ${kind}` };
    }
  }

  let colorVersion = null;
  if (colorMap.size) {
    if (!colorExists) return { ok: false, error: 'color-tokens-registry.md не найден' };
    colorMd = applyRenamesToColorRegistry(colorMd, colorMap).content;
    fs.writeFileSync(COLOR_REGISTRY_PATH, colorMd, 'utf8');
    filesUpdated.push(path.relative(REPO_ROOT, COLOR_REGISTRY_PATH));

    if (fs.existsSync(STORYBOOK_COLOR_TOKENS_CSS)) {
      fs.writeFileSync(STORYBOOK_COLOR_TOKENS_CSS, renderStorybookColorCss(parseColorRegistryRows(colorMd)), 'utf8');
      filesUpdated.push(path.relative(REPO_ROOT, STORYBOOK_COLOR_TOKENS_CSS));
    }

    colorVersion = bumpPatch(readLatestVersionFrom(fs.readFileSync(COLOR_CHANGELOG_PATH, 'utf8')));
    appendColorChangelog({ version: colorVersion, date, changes: colorChanges, author });
  }

  let typoVersion = null;
  if (typoMap.size) {
    if (!typoExists) return { ok: false, error: 'typography-tokens-registry.md не найден' };
    typoMd = applyRenamesToTypographyRegistry(typoMd, typoMap).content;
    fs.writeFileSync(TYPOGRAPHY_REGISTRY_PATH, typoMd, 'utf8');
    filesUpdated.push(path.relative(REPO_ROOT, TYPOGRAPHY_REGISTRY_PATH));

    if (fs.existsSync(STORYBOOK_TYPOGRAPHY_TOKENS_CSS)) {
      fs.writeFileSync(STORYBOOK_TYPOGRAPHY_TOKENS_CSS, renderStorybookTypographyCss(parseTypographyRegistryRows(typoMd)), 'utf8');
      filesUpdated.push(path.relative(REPO_ROOT, STORYBOOK_TYPOGRAPHY_TOKENS_CSS));
    }

    typoVersion = bumpPatch(readLatestVersion());
    appendTypographyChangelog({ version: typoVersion, date, changes: typoChanges, author });
  }

  // CSS-var consumers across all docs surfaces (guides, storybook, assets).
  const combined = new Map([...colorMap, ...typoMap]);
  let manualReview = [];
  if (combined.size) {
    const res = rewriteConsumerReferences(combined);
    filesUpdated.push(...res.filesUpdated);
    manualReview = res.manualReview;
  }

  return {
    ok: true,
    version: colorVersion || typoVersion || '1.0.0',
    filesUpdated: [...new Set(filesUpdated)],
    renamed: renamedPairs,
    manualReview,
  };
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

// Guide HTML files carry their own :root blocks (light values only). The
// storybook CSS var layer is NOT listed here — it is fully regenerated from
// the registry, so it never drifts.
function getColorGuideFiles() {
  return listHtmlFiles(GUIDES_DIR)
    .filter((f) => f.includes('color-tokens'))
    .filter((f) => fs.existsSync(f));
}

// ============================================================
// Component edits — канал component editor layer (spec pages).
// Изменяет конкретные декларации в CSS компонентов (docs/**.css):
//  - kind: 'token' — var(--prevToken) → var(--nextToken) внутри правила
//  - kind: 'value' — подстрока prev → next внутри деклараций props правила
// Канал атомарный: сначала все правки применяются в памяти с валидацией,
// файлы пишутся только если валидны все правки запроса.
// ============================================================

const TOKEN_NAME_RE = /^[a-z0-9][a-z0-9-]*$/;

function normalizeSelectorText(sel) {
  return String(sel).replace(/\s+/g, ' ').trim();
}

// Находит блоки правил с точно совпадающим селектором. Формат файлов
// проекта — обычный несвёрнутый CSS без вложенности, поэтому достаточно
// линейного сканирования `selector { ... }`.
function findRuleBlocks(content, selector) {
  const wanted = normalizeSelectorText(selector);
  const blocks = [];
  const re = /([^{}/]+)\{([^{}]*)\}/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    const selText = normalizeSelectorText(match[1].split('}').pop());
    if (selText === wanted) {
      const bodyStart = match.index + match[0].indexOf('{') + 1;
      blocks.push({ start: bodyStart, end: bodyStart + match[2].length });
    }
  }
  return blocks;
}

function validateComponentEdit(edit) {
  if (!edit || typeof edit !== 'object') return 'Некорректная правка';
  if (typeof edit.file !== 'string' || !edit.file.startsWith('docs/') || !edit.file.endsWith('.css')) {
    return `Недопустимый файл: ${edit.file}`;
  }
  if (!edit.selector || typeof edit.selector !== 'string') return 'Не указан селектор';

  if (edit.kind === 'token') {
    if (!TOKEN_NAME_RE.test(edit.prevToken || '') || !TOKEN_NAME_RE.test(edit.nextToken || '')) {
      return `Некорректное имя токена: ${edit.prevToken} → ${edit.nextToken}`;
    }
    // Архитектурный guard: компоненты ссылаются только на semantic-слой.
    if (edit.nextToken.startsWith('core-')) {
      return `Компонент не может ссылаться на core-токен: ${edit.nextToken}`;
    }
    return null;
  }

  if (edit.kind === 'value') {
    const props = Array.isArray(edit.props) ? edit.props : [];
    if (!props.length || !props.every((p) => /^[a-z-]+$/.test(p))) {
      return 'Некорректный список свойств';
    }
    if (typeof edit.prev !== 'string' || !edit.prev.trim()) return 'Пустое prev-значение';
    if (typeof edit.next !== 'string' || !edit.next.trim()) return 'Пустое next-значение';
    if (/[;{}]/.test(edit.next)) return `Недопустимые символы в значении: ${edit.next}`;
    // Protocol guard: сырые цвета в компонентах запрещены — только токены.
    if (/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i.test(edit.next)) {
      return `Хардкод цвета запрещён (no-hardcode-color-protocol): ${edit.next}`;
    }
    return null;
  }

  return `Неизвестный вид правки: ${edit.kind}`;
}

function applyComponentEditToContent(content, edit) {
  const blocks = findRuleBlocks(content, edit.selector);
  if (!blocks.length) {
    return { error: `Правило не найдено: ${edit.selector} (${edit.file})` };
  }

  let changed = false;
  let result = content;
  // Идём с конца, чтобы индексы более ранних блоков не сдвигались.
  for (const block of [...blocks].reverse()) {
    const body = result.slice(block.start, block.end);
    let nextBody = body;

    if (edit.kind === 'token') {
      const re = new RegExp(
        `var\\(\\s*--${edit.prevToken.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}(\\s*[,)])`,
        'g'
      );
      nextBody = body.replace(re, `var(--${edit.nextToken}$1`);
    } else {
      // value: заменяем prev → next только внутри деклараций указанных props
      for (const prop of edit.props) {
        const declRe = new RegExp(`(^|;|\\s)(${prop})(\\s*:\\s*)([^;}]+)`, 'g');
        nextBody = nextBody.replace(declRe, (m, lead, p, colon, val) => {
          const nextVal = val.split(edit.prev).join(edit.next);
          return `${lead}${p}${colon}${nextVal}`;
        });
      }
    }

    if (nextBody !== body) {
      result = result.slice(0, block.start) + nextBody + result.slice(block.end);
      changed = true;
    }
  }

  if (!changed) {
    const what = edit.kind === 'token' ? `var(--${edit.prevToken})` : `${edit.prev}`;
    return { error: `Текущее значение не найдено в правиле ${edit.selector}: ${what}` };
  }
  return { content: result };
}

function processComponentEdits(edits) {
  // 1) Валидация всех правок до каких-либо изменений.
  for (const edit of edits) {
    const error = validateComponentEdit(edit);
    if (error) return { ok: false, error };
  }

  // 2) Применение в памяти, сгруппированно по файлам (атомарно).
  const fileContents = new Map();
  for (const edit of edits) {
    const absPath = path.join(REPO_ROOT, edit.file);
    if (!absPath.startsWith(REPO_ROOT)) {
      return { ok: false, error: `Недопустимый путь: ${edit.file}` };
    }
    if (!fileContents.has(edit.file)) {
      if (!fs.existsSync(absPath)) {
        return { ok: false, error: `Файл не найден: ${edit.file}` };
      }
      fileContents.set(edit.file, fs.readFileSync(absPath, 'utf8'));
    }
    const applied = applyComponentEditToContent(fileContents.get(edit.file), edit);
    if (applied.error) return { ok: false, error: applied.error };
    fileContents.set(edit.file, applied.content);
  }

  // 3) Запись только после успеха всех правок.
  const filesUpdated = [];
  for (const [file, content] of fileContents) {
    fs.writeFileSync(path.join(REPO_ROOT, file), content, 'utf8');
    filesUpdated.push(file);
  }

  return { ok: true, filesUpdated, edits: edits.length };
}

function normalizePayload(body) {
  const author = body.author || 'system';
  const tokens = body.tokens && typeof body.tokens === 'object' ? body.tokens : body;
  const changes = Array.isArray(body.changes) ? body.changes : [];
  const creates = Array.isArray(body.creates) ? body.creates : [];
  const deletes = Array.isArray(body.deletes) ? body.deletes : [];
  const renames = Array.isArray(body.renames) ? body.renames : [];
  const componentEdits = Array.isArray(body.componentEdits) ? body.componentEdits : [];

  const cleanTokens = {};
  for (const [key, value] of Object.entries(tokens)) {
    if (key.startsWith('--') && typeof value === 'string') {
      cleanTokens[key] = value.trim();
    }
  }

  return { tokens: cleanTokens, changes, creates, deletes, renames, componentEdits, author };
}

function saveTokens(payload) {
  const { tokens, changes, creates, deletes, renames, componentEdits, author } =
    normalizePayload(payload);

  // Component editor layer — отдельный канал: правит конкретные декларации
  // в CSS компонентов, не затрагивая token registries.
  if (componentEdits.length) {
    return processComponentEdits(componentEdits);
  }

  // Create flow is a separate, explicit channel — it never touches the
  // tokens/changes diffing path used by in-place edits.
  if (creates.length) {
    return processCreates(creates, author, todayISO());
  }

  // Delete flow — likewise a separate, explicit destructive channel with its
  // own server-side dependency re-validation.
  if (deletes.length) {
    return processDeletes(deletes, author, todayISO());
  }

  // Rename flow — separate explicit channel; rewrites the registry, all
  // references, and regenerates derived CSS in one request (reference cascade).
  if (renames.length) {
    return processRenames(renames, author, todayISO());
  }

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

  // Authoritative, mode-aware color change list. Prefer the `changes` array
  // (carries mode: light|dark); fall back to the flat token map (legacy/CLI,
  // treated as light) so old callers keep working.
  let colorChangeList = changes
    .filter((c) => isColorToken(c.token) && typeof c.newValue === 'string')
    .map((c) => ({
      token: c.token,
      oldValue: c.oldValue,
      newValue: c.newValue,
      mode: c.mode === 'dark' ? 'dark' : 'light',
    }));

  if (!colorChangeList.length && Object.keys(colorTokens).length) {
    colorChangeList = Object.entries(colorTokens).map(([token, value]) => ({
      token,
      oldValue: '—',
      newValue: value,
      mode: 'light',
    }));
  }

  if (colorChangeList.length) {
    // 1) Guide HTML :root blocks — light values only (existing behaviour).
    const rootUpdates = {};
    for (const change of colorChangeList) {
      if (change.mode === 'dark') continue;
      rootUpdates[change.token] = cssValueForRoot(change.token, change.newValue);
    }
    if (Object.keys(rootUpdates).length) {
      for (const filePath of getColorGuideFiles()) {
        const original = fs.readFileSync(filePath, 'utf8');
        const { content, changed } = updateRootBlocks(original, rootUpdates);
        if (changed) {
          fs.writeFileSync(filePath, content, 'utf8');
          filesUpdated.push(path.relative(REPO_ROOT, filePath));
        }
      }
    }

    // 2) Canonical source of truth: write the registry (mode-aware columns).
    let registryRows = null;
    if (fs.existsSync(COLOR_REGISTRY_PATH)) {
      const registry = fs.readFileSync(COLOR_REGISTRY_PATH, 'utf8');
      const { content, changed } = applyColorChangesToRegistry(registry, colorChangeList);
      if (changed) {
        fs.writeFileSync(COLOR_REGISTRY_PATH, content, 'utf8');
        filesUpdated.push(path.relative(REPO_ROOT, COLOR_REGISTRY_PATH));
      }
      registryRows = parseColorRegistryRows(content);
    }

    // 3) Automatic propagation: regenerate the runtime CSS var layer from the
    //    canonical registry. Every registry token gets a real declaration.
    if (registryRows && fs.existsSync(STORYBOOK_COLOR_TOKENS_CSS)) {
      const css = renderStorybookColorCss(registryRows);
      const prev = fs.readFileSync(STORYBOOK_COLOR_TOKENS_CSS, 'utf8');
      if (css !== prev) {
        fs.writeFileSync(STORYBOOK_COLOR_TOKENS_CSS, css, 'utf8');
        filesUpdated.push(path.relative(REPO_ROOT, STORYBOOK_COLOR_TOKENS_CSS));
      }
    }

    // 4) Changelog.
    const colorVersion = bumpPatch(
      readLatestVersionFrom(fs.readFileSync(COLOR_CHANGELOG_PATH, 'utf8'))
    );
    appendColorChangelog({ version: colorVersion, date, changes: colorChangeList, author });
    if (!savedVersion) savedVersion = colorVersion;
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

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = {
  saveTokens,
  processComponentEdits,
  validateComponentEdit,
  findRuleBlocks,
  applyColorChangesToRegistry,
  parseColorRegistryRows,
  renderStorybookColorCss,
  registryRefToCss,
  parseTypographyRegistryRows,
  applyTypographyChangesToRegistry,
  renderStorybookTypographyCss,
  processCreates,
  processDeletes,
  removeRegistryRows,
  validateColorTokenDelete,
  validateTypographyTokenDelete,
  validateCoreCategoryDelete,
  processRenames,
  applyRenamesToColorRegistry,
  applyRenamesToTypographyRegistry,
  rewriteConsumerReferences,
  validateColorTokenRename,
  validateCoreCategoryRename,
  validateTypographyTokenRename,
  validateTypographyRoleRename,
};
