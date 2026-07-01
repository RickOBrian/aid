/**
 * Color token editor — registry-driven Core / Semantic tabs
 */
(function () {
  'use strict';

  const REGISTRY_URL = '../tokens/color-tokens-registry.md';
  const CHANGELOG_URL = '../tokens/color-tokens-changelog.md';

  const SEMANTIC_CATEGORY_ORDER = ['bg', 'text', 'icon', 'line', 'shadow', 'other'];

  let registry = { core: [], semantic: [] };
  let originals = new Map();
  const modified = new Map();
  let darkOverridesEl = null;
  const darkOverrides = new Map();

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function parseRegistryTable(md) {
    const rows = [];
    let inTable = false;

    for (const line of md.split('\n')) {
      if (!line.startsWith('|')) continue;
      if (line.includes('Token') && line.includes('Level')) {
        inTable = true;
        continue;
      }
      if (!inTable || /^[\|\s\-:]+$/.test(line)) continue;

      const cols = line
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean);
      if (cols.length < 4) continue;

      rows.push({
        token: cols[0].startsWith('--') ? cols[0] : `--${cols[0]}`,
        level: cols[1].toLowerCase(),
        light: cols[2],
        dark: cols[3],
        usedIn: cols[4] || '—',
      });
    }

    return rows;
  }

  function parseCoreToken(name) {
    const body = name.slice(7);
    const alphaMatch = body.match(/^(.+)-(\d+-a\d+)$/);
    if (alphaMatch) return { palette: alphaMatch[1], step: alphaMatch[2], isAlpha: true };
    const bMatch = body.match(/^(.+)-(\d+-b)$/);
    if (bMatch) return { palette: bMatch[1], step: bMatch[2], isAlpha: false };
    const numMatch = body.match(/^(.+)-(\d+)$/);
    if (numMatch) return { palette: numMatch[1], step: numMatch[2], isAlpha: false };
    return { palette: body, step: '—', isAlpha: false };
  }

  function isAlphaStep(step) {
    return /-a\d+$/i.test(step);
  }

  function parseStepSortKey(step) {
    if (step === '—') return [99999, 9, 0];
    const alphaMatch = step.match(/^(\d+)-a(\d+)$/);
    if (alphaMatch) return [Number(alphaMatch[1]), 2, Number(alphaMatch[2])];
    const bMatch = step.match(/^(\d+)-b$/);
    if (bMatch) return [Number(bMatch[1]), 1, 0];
    const numMatch = step.match(/^(\d+)$/);
    if (numMatch) return [Number(numMatch[1]), 0, 0];
    return [99999, 9, 0];
  }

  function compareSteps(stepA, stepB) {
    const ka = parseStepSortKey(stepA);
    const kb = parseStepSortKey(stepB);
    return ka[0] - kb[0] || ka[1] - kb[1] || ka[2] - kb[2] || String(stepA).localeCompare(String(stepB));
  }

  function getStepNumeric(step) {
    const match = step.match(/^(\d+)/);
    return match ? Number(match[1]) : -1;
  }

  function parseHex(value) {
    const match = value.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!match) return null;
    let hex = match[1];
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: 1,
    };
  }

  function parseRgba(value) {
    const match = value
      .trim()
      .match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
    if (!match) return null;
    return {
      r: Number(match[1]),
      g: Number(match[2]),
      b: Number(match[3]),
      a: match[4] !== undefined ? Number(match[4]) : 1,
    };
  }

  function parseColor(value) {
    return parseRgba(value) || parseHex(value);
  }

  function rgbToHex(r, g, b) {
    return `#${[r, g, b]
      .map((channel) => channel.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()}`;
  }

  function formatAlphaDisplay(cssValue) {
    const rgba = parseRgba(cssValue);
    if (!rgba) return cssValue;
    const pct = Math.round(rgba.a * 100);
    return `${rgbToHex(rgba.r, rgba.g, rgba.b)} · ${pct}%`;
  }

  function parseAlphaDisplay(displayValue) {
    const match = displayValue.trim().match(/^#([0-9A-Fa-f]{6})\s*·\s*(\d+)%$/);
    if (!match) return null;
    const r = parseInt(match[1].slice(0, 2), 16);
    const g = parseInt(match[1].slice(2, 4), 16);
    const b = parseInt(match[1].slice(4, 6), 16);
    const alpha = Number(match[2]) / 100;
    const alphaStr = Number.isInteger(alpha * 100) ? String(alpha) : alpha.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
    return `rgba(${r}, ${g}, ${b}, ${alphaStr})`;
  }

  function colorLuminance(cssValue) {
    const color = parseColor(cssValue);
    if (!color) return null;
    const channels = [color.r, color.g, color.b].map((channel) => {
      const s = channel / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  }

  function effectiveLuminance(cssValue) {
    const rgba = parseRgba(cssValue);
    if (rgba && rgba.a < 1) {
      const fg = colorLuminance(`rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`);
      return rgba.a * fg + (1 - rgba.a);
    }
    return colorLuminance(cssValue);
  }

  function checkStepOrderViolation(items, index) {
    if (index === 0) return false;
    const currStep = parseCoreToken(items[index].token).step;
    const prevStep = parseCoreToken(items[index - 1].token).step;
    const currN = getStepNumeric(currStep);
    const prevN = getStepNumeric(prevStep);
    if (currN <= prevN) return false;

    const currVal = readTokenValue(items[index].token) || items[index].light;
    const prevVal = readTokenValue(items[index - 1].token) || items[index - 1].light;
    const currLum = effectiveLuminance(currVal);
    const prevLum = effectiveLuminance(prevVal);
    if (currLum === null || prevLum === null) return false;
    return currLum > prevLum;
  }

  function renderCoreSwatch(token, cssValue, step) {
    if (!isAlphaStep(step)) {
      return `<span class="color-swatch" style="background-color: var(${escapeHtml(token)})" aria-hidden="true"></span>`;
    }

    const rgba = parseRgba(cssValue);
    const baseHex = rgba ? rgbToHex(rgba.r, rgba.g, rgba.b) : '';

    return `
      <span class="color-swatch color-swatch--alpha" aria-hidden="true">
        <span class="color-swatch__solid" style="background-color: ${escapeHtml(baseHex)}"></span>
        <span class="color-swatch__alpha color-swatch__checker">
          <span class="color-swatch__alpha-fill" style="background-color: var(${escapeHtml(token)})"></span>
        </span>
      </span>`;
  }

  function parseSemanticCategory(name) {
    const match = name.match(/^--(bg|text|icon|line|shadow)-/);
    return match ? match[1] : 'other';
  }

  function normalizeSemanticRef(value) {
    const v = value.trim();
    if (!v || v === '—') return v;
    if (v.startsWith('var(')) return v;
    if (v.startsWith('--')) return `var(${v})`;
    return `var(--${v})`;
  }

  function readTokenValue(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function groupCoreRows(rows) {
    const map = new Map();
    rows.forEach((row) => {
      const { palette } = parseCoreToken(row.token);
      if (!map.has(palette)) map.set(palette, []);
      map.get(palette).push(row);
    });

    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([palette, items]) => ({
        id: `palette-${palette}`,
        label: palette,
        items: items.sort((a, b) => {
          const stepA = parseCoreToken(a.token).step;
          const stepB = parseCoreToken(b.token).step;
          return compareSteps(stepA, stepB);
        }),
      }));
  }

  function groupSemanticRows(rows) {
    const map = new Map();
    rows.forEach((row) => {
      const category = parseSemanticCategory(row.token);
      if (!map.has(category)) map.set(category, []);
      map.get(category).push(row);
    });

    return SEMANTIC_CATEGORY_ORDER.filter((cat) => map.has(cat)).map((category) => ({
      id: `category-${category}`,
      label: category,
      items: map.get(category).sort((a, b) => a.token.localeCompare(b.token)),
    }));
  }

  function ensureDarkOverridesEl() {
    if (darkOverridesEl) return darkOverridesEl;
    darkOverridesEl = document.createElement('style');
    darkOverridesEl.id = 'color-dark-overrides';
    document.head.appendChild(darkOverridesEl);
    return darkOverridesEl;
  }

  function applyToken(name, value, mode) {
    if (mode === 'dark') {
      darkOverrides.set(name, value);
      const el = ensureDarkOverridesEl();
      const rules = [...darkOverrides.entries()].map(([t, v]) => `  ${t}: ${v};`).join('\n');
      el.textContent = `[data-theme="dark"] {\n${rules}\n}`;
      return;
    }
    document.documentElement.style.setProperty(name, value);
  }

  function trackChange(name, next, mode) {
    const key = mode === 'dark' ? `${name}::dark` : name;
    const orig = originals.get(key) ?? originals.get(name) ?? '';
    if (next === orig) {
      modified.delete(key);
    } else {
      modified.set(key, { token: name, oldValue: orig, newValue: next, mode });
    }
    updateSaveBar();
  }

  function renderCoreTab(container) {
    const groups = groupCoreRows(registry.core);

    container.innerHTML = groups
      .map((group) => {
        const rows = group.items
          .map((row, index) => {
            const { palette, step } = parseCoreToken(row.token);
            const live = readTokenValue(row.token) || row.light;
            const isAlpha = isAlphaStep(step);
            const displayValue = isAlpha ? formatAlphaDisplay(live) : live;
            const stepViolation = checkStepOrderViolation(group.items, index);
            originals.set(row.token, live);

            return `
          <tr data-token="${escapeHtml(row.token)}">
            <td>
              <code class="token-name">${escapeHtml(row.token)}</code>
              ${
                stepViolation
                  ? '<span class="color-step-warning" title="step order violation — value appears lighter than lower step">⚠ step order violation — value appears lighter than lower step</span>'
                  : ''
              }
            </td>
            <td>${escapeHtml(palette)}</td>
            <td>${escapeHtml(step)}</td>
            <td>
              <input class="token-editor-input" type="text"
                     value="${escapeHtml(displayValue)}"
                     data-raw-value="${escapeHtml(live)}"
                     data-alpha-display="${isAlpha ? 'true' : 'false'}"
                     data-token="${escapeHtml(row.token)}"
                     data-mode="core"
                     aria-label="Edit ${escapeHtml(row.token)}">
            </td>
            <td>${renderCoreSwatch(row.token, live, step)}</td>
          </tr>`;
          })
          .join('');

        return `
        <section class="color-token-group" id="${escapeHtml(group.id)}">
          <h3 class="color-token-group__title">${escapeHtml(group.label)}</h3>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Palette</th>
                  <th>Step</th>
                  <th>Value</th>
                  <th>Swatch</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </section>`;
      })
      .join('');

    bindInputs(container);
    return groups;
  }

  function renderSemanticTab(container) {
    const groups = groupSemanticRows(registry.semantic);

    container.innerHTML = groups
      .map((group) => {
        const rows = group.items
          .map((row) => {
            const lightLive = readTokenValue(row.token) || normalizeSemanticRef(row.light);
            const darkLive = row.dark === '—' ? '—' : normalizeSemanticRef(row.dark);
            originals.set(row.token, lightLive);
            if (row.dark !== '—') originals.set(`${row.token}::dark`, darkLive);

            return `
          <tr data-token="${escapeHtml(row.token)}">
            <td><code class="token-name">${escapeHtml(row.token)}</code></td>
            <td><span class="token-category">${escapeHtml(parseSemanticCategory(row.token))}</span></td>
            <td>
              <input class="token-editor-input" type="text"
                     value="${escapeHtml(lightLive)}"
                     data-token="${escapeHtml(row.token)}"
                     data-mode="light"
                     aria-label="Light ${escapeHtml(row.token)}">
            </td>
            <td>
              ${
                row.dark === '—'
                  ? '<span class="storybook-status">—</span>'
                  : `<input class="token-editor-input" type="text"
                       value="${escapeHtml(darkLive)}"
                       data-token="${escapeHtml(row.token)}"
                       data-mode="dark"
                       aria-label="Dark ${escapeHtml(row.token)}">`
              }
            </td>
            <td><span class="token-used-in">${escapeHtml(row.usedIn)}</span></td>
            <td>
              <span class="color-swatch color-swatch--semantic"
                    style="--color-swatch-bg: var(${escapeHtml(row.token)})"
                    aria-hidden="true"></span>
            </td>
          </tr>`;
          })
          .join('');

        return `
        <section class="color-token-group" id="${escapeHtml(group.id)}">
          <h3 class="color-token-group__title">${escapeHtml(group.label)}</h3>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Category</th>
                  <th>Light value</th>
                  <th>Dark value</th>
                  <th>Used in</th>
                  <th>Swatch</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </section>`;
      })
      .join('');

    bindInputs(container);
    return groups;
  }

  function resolveInputCssValue(input) {
    const next = input.value.trim();
    if (input.dataset.alphaDisplay === 'true') {
      const fromDisplay = parseAlphaDisplay(next);
      if (fromDisplay) return fromDisplay;
      if (parseRgba(next)) return next;
    }
    return next;
  }

  function bindInputs(scope) {
    scope.querySelectorAll('.token-editor-input').forEach((input) => {
      input.addEventListener('input', () => {
        const name = input.dataset.token;
        const mode = input.dataset.mode;
        const next = resolveInputCssValue(input);
        applyToken(name, next, mode === 'dark' ? 'dark' : 'light');
        if (input.dataset.alphaDisplay === 'true' && parseRgba(next)) {
          input.dataset.rawValue = next;
        }
        trackChange(name, next, mode === 'dark' ? 'dark' : 'light');
        input.classList.toggle('is-modified', modified.has(mode === 'dark' ? `${name}::dark` : name));

        if (mode === 'core' && input.dataset.alphaDisplay === 'true') {
          const row = input.closest('tr');
          const swatchCell = row?.querySelector('td:last-child');
          const { step } = parseCoreToken(name);
          if (swatchCell && parseRgba(next)) {
            swatchCell.innerHTML = renderCoreSwatch(name, next, step);
          }
        }
      });
    });
  }

  function renderToc(groups, tocEl) {
    if (!tocEl) return;
    tocEl.innerHTML = groups
      .map(
        (group) =>
          `<a class="storybook-toc__link" href="#${escapeHtml(group.id)}">${escapeHtml(group.label)}</a>`
      )
      .join('');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          tocEl.querySelectorAll('.storybook-toc__link').forEach((link) => {
            link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
          });
        });
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    groups.forEach((group) => {
      const el = document.getElementById(group.id);
      if (el) observer.observe(el);
    });
  }

  function updateSaveBar() {
    const saveBar = document.getElementById('save-bar');
    const saveCount = document.getElementById('save-count');
    const count = modified.size;
    if (saveBar) saveBar.classList.toggle('is-visible', count > 0);
    if (saveCount) saveCount.textContent = count ? `${count} изменений` : '';
  }

  function getSaveEndpoints() {
    const urls = new Set();
    urls.add('/docs/tokens/save-tokens');
    urls.add(new URL('../tokens/save-tokens', window.location.href).href);
    urls.add(`http://${window.location.hostname}:3336/save-tokens`);
    return [...urls];
  }

  async function postSave(payload) {
    let lastError;
    for (const url of getSaveEndpoints()) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const text = await res.text();
        const data = JSON.parse(text);
        if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
        return data;
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError || new Error('Не удалось сохранить токены');
  }

  async function loadChangelog() {
    const tbody = document.getElementById('changelog-tbody');
    if (!tbody) return;

    try {
      const res = await fetch(`${CHANGELOG_URL}?_=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('changelog fetch failed');
      const md = await res.text();
      const rows = parseChangelogTable(md);

      tbody.innerHTML = rows
        .map(
          (r) => `
        <tr>
          <td>${escapeHtml(r.version)}</td>
          <td>${escapeHtml(r.date)}</td>
          <td><code class="token-name">${escapeHtml(r.token)}</code></td>
          <td>${escapeHtml(r.change)}</td>
          <td>${escapeHtml(r.author)}</td>
        </tr>`
        )
        .join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5" class="storybook-status is-error">${escapeHtml(err.message)}</td></tr>`;
    }
  }

  function parseChangelogTable(md) {
    const rows = [];
    let inTable = false;

    for (const line of md.split('\n')) {
      if (!line.startsWith('|')) continue;
      if (line.includes('Version')) {
        inTable = true;
        continue;
      }
      if (!inTable || /^[\|\s\-:]+$/.test(line)) continue;

      const cols = line
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean);
      if (cols.length >= 5) {
        rows.push({
          version: cols[0],
          date: cols[1],
          token: cols[2],
          change: cols[3],
          author: cols[4],
        });
      }
    }

    return rows.reverse();
  }

  function switchTab(tabId) {
    document.querySelectorAll('.storybook-tabs__btn').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.tab === tabId);
      btn.setAttribute('aria-selected', btn.dataset.tab === tabId ? 'true' : 'false');
    });

    document.querySelectorAll('.storybook-tab-panel').forEach((panel) => {
      panel.hidden = panel.id !== `tab-${tabId}`;
    });

    const coreEl = document.getElementById('tab-core-content');
    const semanticEl = document.getElementById('tab-semantic-content');
    const tocEl = document.getElementById('page-toc-list');
    const groups =
      tabId === 'core'
        ? renderCoreTab(coreEl)
        : renderSemanticTab(semanticEl);
    renderToc(groups, tocEl);
  }

  async function probeSaveApi() {
    const banner = document.getElementById('save-api-banner');
    if (!banner) return;

    try {
      const res = await fetch('/docs/tokens/save-tokens', { method: 'OPTIONS' });
      if (res.status === 204 || res.status === 200) {
        banner.hidden = true;
        return;
      }
    } catch (_) {
      /* try fallback port */
    }

    try {
      const res = await fetch(`http://${window.location.hostname}:3336/save-tokens`, {
        method: 'OPTIONS',
      });
      if (res.status === 204 || res.status === 200) {
        banner.hidden = true;
        return;
      }
    } catch (_) {
      /* no save api */
    }

    banner.hidden = false;
  }

  async function init() {
    const res = await fetch(`${REGISTRY_URL}?_=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('registry fetch failed');
    const md = await res.text();
    const rows = parseRegistryTable(md);
    registry.core = rows.filter((r) => r.level === 'core');
    registry.semantic = rows.filter((r) => r.level === 'semantic');

    document.querySelectorAll('.storybook-tabs__btn').forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    switchTab('core');
    loadChangelog();
    probeSaveApi();

    const saveBtn = document.getElementById('save-btn');
    const saveStatus = document.getElementById('save-status');

    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        if (!modified.size) return;

        saveBtn.disabled = true;
        if (saveStatus) {
          saveStatus.textContent = 'Сохранение…';
          saveStatus.className = 'storybook-status';
        }

        const payload = {};
        modified.forEach((change) => {
          if (change.mode === 'dark') return;
          payload[change.token] = change.newValue;
        });

        try {
          const data = await postSave(payload);
          if (saveStatus) {
            saveStatus.textContent = `Сохранено v${data.version}`;
            saveStatus.className = 'storybook-status is-success';
          }
          setTimeout(() => location.reload(), 600);
        } catch (err) {
          if (saveStatus) {
            saveStatus.textContent = err.message;
            saveStatus.className = 'storybook-status is-error';
          }
          saveBtn.disabled = false;
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    init().catch((err) => {
      const coreEl = document.getElementById('tab-core-content');
      if (coreEl) {
        coreEl.innerHTML = `<p class="storybook-status is-error">${escapeHtml(err.message)}</p>`;
      }
    });
  });

  window.DSColorEditor = { init };
})();
