/**
 * Read-only product Colors — same layout components as colors-editor (tabs, groups, TOC).
 */
(function () {
  'use strict';

  const sb = window.DSProductStorybook;
  const swatch = window.DSColorSwatch;
  const esc = swatch.escapeHtml;

  const SEMANTIC_CATEGORY_ORDER = ['bg', 'text', 'icon', 'line', 'shadow', 'other'];

  function parseStandardEntries(data, source) {
    if (!Array.isArray(data)) return [];
    return data
      .filter((row) => row && typeof row === 'object')
      .map((row) => ({
        name: String(row.name || '').trim(),
        value: String(row.value || '').trim(),
        source,
        deviation: '',
      }))
      .filter((row) => row.name && row.value);
  }

  function parseLegacyEntries(data) {
    if (!Array.isArray(data)) return [];
    return data
      .filter((row) => row && typeof row === 'object')
      .map((row) => ({
        name: String(row.name || '').trim(),
        value: String(row.value || '').trim(),
        valueDark: String(row.valueDark || row.value || '').trim(),
        source: 'legacy',
        deviation: row.deviation != null ? String(row.deviation) : '',
      }))
      .filter((row) => row.name && row.value);
  }

  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    return res.json();
  }

  async function loadLayer(urls, parser) {
    const rows = [];
    for (const url of urls) {
      try {
        const data = await fetchJson(url);
        rows.push(...parser(data));
      } catch (err) {
        console.warn('[product-tokens]', err.message);
      }
    }
    return rows;
  }

  function parseCoreToken(name) {
    const body = name.replace(/^core-/, '');
    const alphaMatch = body.match(/^(.+)-(\d+-a\d+)$/);
    if (alphaMatch) return { palette: alphaMatch[1], step: alphaMatch[2] };
    const bMatch = body.match(/^(.+)-(\d+-b)$/);
    if (bMatch) return { palette: bMatch[1], step: bMatch[2] };
    const numMatch = body.match(/^(.+)-(\d+)$/);
    if (numMatch) return { palette: numMatch[1], step: numMatch[2] };
    return { palette: body, step: '—' };
  }

  function parseSemanticCategory(name) {
    const match = name.match(/^(bg|text|icon|line|shadow)-/);
    return match ? match[1] : 'other';
  }

  function slugify(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function groupCoreRows(tokens) {
    const byPalette = new Map();
    for (const token of tokens) {
      const { palette } = parseCoreToken(token.name);
      if (!byPalette.has(palette)) byPalette.set(palette, []);
      byPalette.get(palette).push(token);
    }
    return [...byPalette.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([palette, items]) => ({
        id: `core-${slugify(palette)}`,
        label: palette,
        palette,
        items,
      }));
  }

  function groupSemanticRows(tokens) {
    const byCategory = new Map();
    for (const token of tokens) {
      const cat = parseSemanticCategory(token.name);
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat).push(token);
    }
    return SEMANTIC_CATEGORY_ORDER
      .filter((cat) => byCategory.has(cat))
      .concat([...byCategory.keys()].filter((cat) => !SEMANTIC_CATEGORY_ORDER.includes(cat)))
      .map((cat) => ({
        id: `semantic-${cat}`,
        label: cat,
        items: byCategory.get(cat).sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }

  function groupLegacyRows(tokens) {
    const byCategory = new Map();
    for (const token of tokens) {
      const cat = token.name.includes('/') ? token.name.split('/')[0] : 'other';
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat).push(token);
    }
    return [...byCategory.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, items]) => ({
        id: `legacy-${slugify(category)}`,
        label: category,
        items: items.sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }

  function renderReadonlyValue(value) {
    const display = swatch.formatColorDisplay(value);
    return `<span class="token-value-readonly">${esc(display)}</span>`;
  }

  function renderValueCell(value) {
    return `
      <div class="product-token-value-cell">
        ${swatch.renderValueSwatch(value)}
        ${renderReadonlyValue(value)}
      </div>`;
  }

  function getColorMode() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function syncColorModeHighlight() {
    const mode = getColorMode();
    document.body.dataset.productColorMode = mode;
  }

  function bindColorModeSync() {
    syncColorModeHighlight();
    const observer = new MutationObserver(syncColorModeHighlight);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }

  function renderLegacyBadge(deviation) {
    const title = deviation ? ` title="${esc(deviation)}"` : '';
    return `<span class="chip product-token-legacy-chip"${title}>LEGACY</span>`;
  }

  function renderCoreGroups(groups) {
    if (!groups.length) {
      return '<p class="storybook-status">Core-токены не найдены.</p>';
    }
    return groups.map((group) => {
      const rows = group.items.map((token) => {
        const { palette, step } = parseCoreToken(token.name);
        return `
          <tr data-token="${esc(token.name)}">
            <td><code class="token-name">${esc(token.name)}</code></td>
            <td>${esc(palette)}</td>
            <td>${esc(step)}</td>
            <td>${renderReadonlyValue(token.value)}</td>
            <td>${swatch.renderValueSwatch(token.value)}</td>
          </tr>`;
      }).join('');

      return `
        <section class="color-token-group" id="${esc(group.id)}">
          <h3 class="color-token-group__title">${esc(group.label)}</h3>
          <div class="table-wrap" data-ds-component="Table">
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
    }).join('');
  }

  function renderSemanticGroups(groups) {
    if (!groups.length) {
      return '<p class="storybook-status">Semantic-токены не найдены.</p>';
    }
    return groups.map((group) => {
      const rows = group.items.map((token) => `
        <tr data-token="${esc(token.name)}">
          <td><code class="token-name">${esc(token.name)}</code></td>
          <td>${renderReadonlyValue(token.value)}</td>
          <td>${swatch.renderValueSwatch(token.value)}</td>
        </tr>`).join('');

      return `
        <section class="color-token-group" id="${esc(group.id)}">
          <h3 class="color-token-group__title">${esc(group.label)}</h3>
          <div class="table-wrap" data-ds-component="Table">
            <table>
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Value</th>
                  <th>Swatch</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </section>`;
    }).join('');
  }

  function renderLegacyGroups(groups) {
    if (!groups.length) {
      return '<p class="storybook-status">Legacy-токены не найдены.</p>';
    }
    return groups.map((group) => {
      const rows = group.items.map((token) => `
        <tr data-token="${esc(token.name)}" class="product-token-row--legacy">
          <td>
            <code class="token-name">${esc(token.name)}</code>
            ${renderLegacyBadge(token.deviation)}
          </td>
          <td class="product-token-mode-cell product-token-mode-cell--light">${renderValueCell(token.value)}</td>
          <td class="product-token-mode-cell product-token-mode-cell--dark">${renderValueCell(token.valueDark)}</td>
          <td class="product-token-deviation">${token.deviation ? esc(token.deviation) : '—'}</td>
        </tr>`).join('');

      return `
        <section class="color-token-group" id="${esc(group.id)}">
          <h3 class="color-token-group__title">${esc(group.label)}</h3>
          <div class="table-wrap product-token-table--modes" data-ds-component="Table">
            <table>
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Light value</th>
                  <th>Dark value</th>
                  <th>Deviation</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </section>`;
    }).join('');
  }

  function renderToc(groups) {
    const tocEl = document.getElementById('page-toc-list');
    if (!tocEl) return;
    if (!groups.length) {
      tocEl.innerHTML = '';
      return;
    }
    tocEl.innerHTML = groups
      .map((group) => `<a class="storybook-toc__link" href="#${esc(group.id)}">${esc(group.label)}</a>`)
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

  function switchTab(tabId, groupsByTab) {
    const tabs = document.querySelectorAll('#product-color-tabs .storybook-tabs__btn');
    const panels = {
      core: document.getElementById('tab-core'),
      semantic: document.getElementById('tab-semantic'),
      legacy: document.getElementById('tab-legacy'),
    };

    tabs.forEach((btn) => {
      const active = btn.dataset.tab === tabId;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    Object.entries(panels).forEach(([id, panel]) => {
      if (!panel) return;
      const show = id === tabId;
      panel.hidden = !show;
    });

    renderToc(groupsByTab[tabId] || []);
  }

  function setupTabs(availableTabs, groupsByTab) {
    const tablist = document.getElementById('product-color-tabs');
    if (!tablist) return;

    const buttons = [...tablist.querySelectorAll('.storybook-tabs__btn')];
    buttons.forEach((btn) => {
      const tab = btn.dataset.tab;
      const hasContent = availableTabs.includes(tab);
      btn.hidden = !hasContent;
      if (hasContent) {
        btn.addEventListener('click', () => switchTab(tab, groupsByTab));
      }
    });

    tablist.hidden = availableTabs.length <= 1;
    if (availableTabs.length) {
      switchTab(availableTabs[0], groupsByTab);
    }
  }

  async function init() {
    const productId = sb.productFromUrl();
    const titleEl = document.getElementById('product-title');
    const descEl = document.getElementById('product-description');
    const breadcrumbEl = document.getElementById('product-breadcrumb');
    const coreEl = document.getElementById('tab-core-content');
    const semanticEl = document.getElementById('tab-semantic-content');
    const legacyEl = document.getElementById('tab-legacy-content');

    if (!productId) {
      const msg = '<p class="storybook-status is-error">Укажите продукт: <code>?product=sutochno</code></p>';
      if (coreEl) coreEl.innerHTML = msg;
      return;
    }

    try {
      const product = await sb.loadProduct(productId);
      const colors = product.tokens?.colors || {};

      sb.setActivePage(productId, 'tokens/colors');
      if (titleEl) titleEl.textContent = 'Colors';
      if (breadcrumbEl) {
        breadcrumbEl.innerHTML = `<a href="product.html?product=${esc(productId)}">← ${esc(product.label)}</a>`;
      }
      if (descEl) {
        descEl.innerHTML = product.status === 'legacy'
          ? `Legacy-токены из <code>tokens/${esc(productId)}/</code>. Light и Dark из Figma-экспорта. Переключатель темы в шапке подсвечивает активный режим.`
          : `Цветовые токены из <code>tokens/${esc(productId)}/</code>. Core — сырые значения; Semantic — назначение.`;
      }

      const [core, semantic, legacy] = await Promise.all([
        loadLayer(colors.core || [], (data) => parseStandardEntries(data, 'core')),
        loadLayer(colors.semantic || [], (data) => parseStandardEntries(data, 'semantic')),
        loadLayer(colors.legacy || [], parseLegacyEntries),
      ]);

      const groupsByTab = {
        core: groupCoreRows(core),
        semantic: groupSemanticRows(semantic),
        legacy: groupLegacyRows(legacy),
      };

      if (coreEl) coreEl.innerHTML = renderCoreGroups(groupsByTab.core);
      if (semanticEl) semanticEl.innerHTML = renderSemanticGroups(groupsByTab.semantic);
      if (legacyEl) legacyEl.innerHTML = renderLegacyGroups(groupsByTab.legacy);

      const availableTabs = ['core', 'semantic', 'legacy'].filter((tab) => {
        const content = groupsByTab[tab];
        return content.length > 0;
      });

      if (!availableTabs.length) {
        if (legacyEl) legacyEl.innerHTML = '<p class="storybook-status">Токены не найдены для этого продукта.</p>';
        document.getElementById('tab-legacy').hidden = false;
        return;
      }

      setupTabs(availableTabs, groupsByTab);
      bindColorModeSync();
    } catch (err) {
      const msg = `<p class="storybook-status is-error">Ошибка загрузки: ${esc(err.message)}</p>`;
      if (legacyEl) legacyEl.innerHTML = msg;
      document.getElementById('tab-legacy').hidden = false;
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
