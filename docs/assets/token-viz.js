/**
 * DS Docs — token-viz.js
 * Post-processes rendered markdown to add visual token previews.
 *
 * Two modes:
 *
 * 1. EXPLICIT BLOCKS — authors write fenced code with custom language tags:
 *    ```token-color
 *    bg-accent-main | var(--bg-accent-main) | Акцентный фон
 *    text-primary   | var(--text-primary)   | Основной текст
 *    ```
 *
 *    ```token-space
 *    inset-control-h-m | 16 | h      | Горизонтальный отступ контрола M
 *    gap-m             | 16 | gap    | Стандартный gap
 *    radius-m          | 8  | radius | Скругление кнопки
 *    ```
 *
 *    ```token-type
 *    heading-xl | 28 | 36 | 700 | -0.2px | Заголовок экрана
 *    body-m     | 14 | 24 | 500 |  0px   | Основной текст
 *    label-m    | 14 | 20 | 600 |  0px   | Текст на кнопке
 *    ```
 *
 * 2. AUTO-ENHANCE — detects token names in rendered tables and inlines
 *    color swatches / space bars / type samples automatically.
 *
 * Call: initTokenViz(proseElement)
 * The element is scanned after marked.js renders.
 */

(function () {
  'use strict';

  // ── CSS injected once ─────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('token-viz-styles')) return;
    const s = document.createElement('style');
    s.id = 'token-viz-styles';
    s.textContent = `
      /* ── Token grid wrapper ── */
      .tv-grid {
        display: flex;
        flex-direction: column;
        gap: 2px;
        margin-bottom: var(--gap-m, 16px);
        border: 1px solid var(--line-default, #e5e5ea);
        border-radius: var(--radius-m, 8px);
        overflow: hidden;
        background: var(--bg-card-main, #fff);
      }

      .tv-row {
        display: grid;
        align-items: center;
        padding: 10px var(--inset-container-h-s, 12px);
        gap: var(--gap-m, 16px);
        border-bottom: 1px solid var(--line-default, #e5e5ea);
        transition: background 0.1s;
      }
      .tv-row:last-child { border-bottom: none; }
      .tv-row:hover { background: var(--bg-accent-states-hover, rgba(0,87,255,.06)); }

      .tv-name {
        font-family: 'JetBrains Mono', monospace;
        font-size: 12.5px;
        color: var(--text-primary, #111);
        white-space: nowrap;
      }
      .tv-desc {
        font-size: 13px;
        color: var(--text-secondary, #6e6e73);
      }

      /* ── Color token ── */
      .tv-color-row { grid-template-columns: 44px 1fr 1fr auto; }

      .tv-swatch {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-s, 4px);
        border: 1px solid var(--line-default, rgba(0,0,0,0.08));
        flex-shrink: 0;
        box-shadow: none;
      }
      .tv-value {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        color: var(--text-secondary, #6e6e73);
        text-align: right;
      }

      /* Inline swatch (auto-enhance in tables) */
      .tv-inline-swatch {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 2px;
        border: 1px solid rgba(0,0,0,0.12);
        vertical-align: middle;
        margin-right: 4px;
        flex-shrink: 0;
      }

      /* ── Space token ── */
      .tv-space-row { grid-template-columns: 140px 1fr auto; }

      .tv-space-vis {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .tv-space-bar {
        background: var(--bg-accent-fade, rgba(0,87,255,.12));
        border: 1px solid var(--bg-accent-main, #0057ff);
        border-radius: 2px;
        flex-shrink: 0;
        position: relative;
      }
      .tv-space-bar.is-h  { height: 20px; min-width: 2px; }
      .tv-space-bar.is-v  { width: 20px; min-height: 2px; }
      .tv-space-bar.is-gap { height: 12px; border-style: dashed; }
      .tv-space-bar.is-radius {
        background: transparent;
        border: 2px solid var(--bg-accent-main, #0057ff);
        border-radius: var(--radius-m, 8px);
        width: 32px;
        height: 32px;
      }
      .tv-space-px {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        color: var(--text-secondary, #6e6e73);
        white-space: nowrap;
      }

      /* ── Type token ── */
      .tv-type-row { grid-template-columns: 140px 1fr auto; }

      .tv-type-sample {
        color: var(--text-primary, #111);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tv-type-meta {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        color: var(--text-secondary, #6e6e73);
        text-align: right;
        white-space: nowrap;
      }
    `;
    document.head.appendChild(s);
  }

  // ── Parse pipe-delimited rows ─────────────────────────────────────────────
  function parseRows(text) {
    return text.trim().split('\n')
      .map(line => line.split('|').map(s => s.trim()).filter(Boolean))
      .filter(cols => cols.length >= 2);
  }

  // ── Resolve a CSS variable value (live, from computed style) ─────────────
  function resolveCssVar(value) {
    if (!value) return '';
    if (!value.startsWith('var(')) return value;
    const varName = value.match(/var\(\s*(--[^,)]+)/)?.[1];
    if (!varName) return value;
    const computed = getComputedStyle(document.documentElement)
      .getPropertyValue(varName).trim();
    return computed || value;
  }

  // ── Scale a px value for the space bar (max 160px → max 120px bar) ───────
  function scaleSpace(px) {
    const n = Math.min(parseFloat(px) || 0, 160);
    if (n === 0) return 0;
    return Math.max(2, Math.round(n * 0.75));
  }

  // ── Render color grid ─────────────────────────────────────────────────────
  function renderColorGrid(rows) {
    const grid = document.createElement('div');
    grid.className = 'tv-grid';

    rows.forEach(cols => {
      const [name, value, desc = ''] = cols;
      const row = document.createElement('div');
      row.className = 'tv-row tv-color-row';

      const swatch = document.createElement('div');
      swatch.className = 'tv-swatch';
      swatch.style.background = value;
      swatch.title = resolveCssVar(value);

      const nameEl = document.createElement('code');
      nameEl.className = 'tv-name';
      nameEl.textContent = name;

      const descEl = document.createElement('span');
      descEl.className = 'tv-desc';
      descEl.textContent = desc;

      const valEl = document.createElement('span');
      valEl.className = 'tv-value';
      valEl.textContent = resolveCssVar(value) || value;

      row.append(swatch, nameEl, descEl, valEl);
      grid.appendChild(row);
    });

    return grid;
  }

  // ── Render space grid ─────────────────────────────────────────────────────
  // cols: name | px | type (h|v|gap|radius) | desc
  function renderSpaceGrid(rows) {
    const grid = document.createElement('div');
    grid.className = 'tv-grid';

    rows.forEach(cols => {
      const [name, px, type = 'h', desc = ''] = cols;
      const pxNum = parseFloat(px) || 0;

      const row = document.createElement('div');
      row.className = 'tv-row tv-space-row';

      const nameEl = document.createElement('code');
      nameEl.className = 'tv-name';
      nameEl.textContent = name;

      const vis = document.createElement('div');
      vis.className = 'tv-space-vis';

      const bar = document.createElement('div');
      const barType = type === 'radius' ? 'is-radius'
                    : type === 'v'      ? 'is-v'
                    : type === 'gap'    ? 'is-gap'
                    :                     'is-h';
      bar.className = 'tv-space-bar ' + barType;

      if (type === 'radius') {
        const r = Math.min(pxNum, 24);
        bar.style.borderRadius = r + 'px';
      } else if (type === 'v') {
        bar.style.height = scaleSpace(pxNum) + 'px';
      } else {
        bar.style.width = scaleSpace(pxNum) + 'px';
      }

      const pxLabel = document.createElement('span');
      pxLabel.className = 'tv-space-px';
      pxLabel.textContent = pxNum + 'px';

      vis.append(bar, pxLabel);

      const descEl = document.createElement('span');
      descEl.className = 'tv-desc';
      descEl.textContent = desc;

      row.append(nameEl, vis, descEl);
      grid.appendChild(row);
    });

    return grid;
  }

  // ── Render type grid ──────────────────────────────────────────────────────
  // cols: name | size | lh | weight | tracking | desc
  function renderTypeGrid(rows) {
    const grid = document.createElement('div');
    grid.className = 'tv-grid';

    rows.forEach(cols => {
      const [name, size = '14', lh = '22', weight = '400', tracking = '0px', desc = ''] = cols;

      const row = document.createElement('div');
      row.className = 'tv-row tv-type-row';

      const nameEl = document.createElement('code');
      nameEl.className = 'tv-name';
      nameEl.textContent = name;

      const sample = document.createElement('span');
      sample.className = 'tv-type-sample';
      sample.style.fontSize      = size + 'px';
      sample.style.lineHeight    = lh + 'px';
      sample.style.fontWeight    = weight;
      sample.style.letterSpacing = tracking;
      sample.title = `${size}/${lh} · w${weight} · tracking ${tracking}`;
      sample.textContent = desc || 'The quick brown fox jumps over the lazy dog';

      const meta = document.createElement('span');
      meta.className = 'tv-type-meta';
      meta.textContent = `${size}/${lh} w${weight} · ${tracking}`;

      row.append(nameEl, sample, meta);
      grid.appendChild(row);
    });

    return grid;
  }

  // ── Process explicit token-* code blocks ──────────────────────────────────
  function processExplicitBlocks(root) {
    const codeBlocks = root.querySelectorAll(
      'pre > code.language-token-color, ' +
      'pre > code.language-token-space, ' +
      'pre > code.language-token-type'
    );

    codeBlocks.forEach(code => {
      const pre  = code.parentElement;
      const lang = Array.from(code.classList)
        .find(c => c.startsWith('language-token-'))
        ?.replace('language-', '');
      if (!lang) return;

      const rows = parseRows(code.textContent);
      let widget;

      if (lang === 'token-color') widget = renderColorGrid(rows);
      if (lang === 'token-space') widget = renderSpaceGrid(rows);
      if (lang === 'token-type')  widget = renderTypeGrid(rows);

      if (widget) pre.replaceWith(widget);
    });
  }

  // ── Token name patterns ───────────────────────────────────────────────────
  const COLOR_TOKEN_RE  = /^(bg-|text-|icon-|line-)[\w-]+$/;
  const SPACE_TOKEN_RE  = /^(inset-|gap-|radius-)[\w-]+$/;
  const TYPE_TOKEN_RE   = /^(display-|heading-|body-|label-|code-|numeric-|helper-|meta-)[\w-]+$/;

  // Map CSS variable names from style.css token names
  function tokenToCssVar(name) {
    return '--' + name;
  }

  // ── Auto-enhance: add inline swatches to table cells with color tokens ────
  function autoEnhanceColorTable(root) {
    root.querySelectorAll('td, th').forEach(cell => {
      // Find <code> elements that look like color token names
      cell.querySelectorAll('code').forEach(code => {
        const name = code.textContent.trim().replace(/`/g, '');
        if (!COLOR_TOKEN_RE.test(name)) return;
        if (code.querySelector('.tv-inline-swatch')) return; // already enhanced

        const cssVar = tokenToCssVar(name);
        const computed = getComputedStyle(document.documentElement)
          .getPropertyValue(cssVar).trim();
        if (!computed) return; // variable doesn't exist in this theme

        const swatch = document.createElement('span');
        swatch.className = 'tv-inline-swatch';
        swatch.style.background = `var(${cssVar})`;
        swatch.title = computed;
        code.prepend(swatch);
      });
    });
  }

  // ── Auto-enhance: add inline space bars to space token tables ─────────────
  function autoEnhanceSpaceTable(root) {
    root.querySelectorAll('td').forEach(cell => {
      cell.querySelectorAll('code').forEach(code => {
        const name = code.textContent.trim().replace(/`/g, '');
        if (!SPACE_TOKEN_RE.test(name)) return;
        if (code.querySelector('.tv-space-px')) return;

        // Try to find the value from style.css variable
        const cssVar = tokenToCssVar(name);
        const computed = getComputedStyle(document.documentElement)
          .getPropertyValue(cssVar).trim();
        if (!computed) return;

        const pxNum = parseFloat(computed);
        if (isNaN(pxNum) || pxNum > 100) return; // skip large/invalid values

        const bar = document.createElement('span');
        bar.className = 'tv-space-bar is-h';
        bar.style.width  = Math.max(2, Math.round(pxNum * 0.6)) + 'px';
        bar.style.height = '10px';
        bar.style.display = 'inline-block';
        bar.style.verticalAlign = 'middle';
        bar.style.marginRight = '4px';
        bar.title = computed;
        code.prepend(bar);
      });
    });
  }

  // ── Auto-enhance: type token rows get a live text sample ─────────────────
  function autoEnhanceTypeTable(root) {
    root.querySelectorAll('tr').forEach(row => {
      const cells = row.querySelectorAll('td');
      if (!cells.length) return;

      const firstCode = cells[0].querySelector('code');
      if (!firstCode) return;

      const name = firstCode.textContent.trim().replace(/`/g, '');
      if (!TYPE_TOKEN_RE.test(name)) return;
      if (row.querySelector('.tv-type-sample')) return;

      // Parse size/lh/weight from subsequent cells if available
      const size    = parseFloat(cells[1]?.textContent) || null;
      const lh      = parseFloat(cells[2]?.textContent) || null;
      const weight  = parseFloat(cells[3]?.textContent) || null;
      const tracking= cells[4]?.textContent.trim() || null;

      if (!size) return;

      // Insert a live sample cell
      const sampleCell = document.createElement('td');
      const sample = document.createElement('span');
      sample.className = 'tv-type-sample';
      sample.style.fontSize      = size + 'px';
      if (lh)      sample.style.lineHeight    = lh + 'px';
      if (weight)  sample.style.fontWeight    = String(weight);
      if (tracking)sample.style.letterSpacing = tracking;
      sample.style.color = 'var(--text-primary)';
      sample.title = [
        size + 'px',
        lh ? lh + 'px LH' : null,
        weight ? 'w' + weight : null,
        tracking ? 'tracking ' + tracking : null,
      ].filter(Boolean).join(' · ');
      sample.textContent = 'Пример текста · Sample';
      sampleCell.appendChild(sample);

      // Append as last cell
      row.appendChild(sampleCell);

      // Add header cell for the column if this is in a table with thead
      const table = row.closest('table');
      const thead = table?.querySelector('thead tr');
      if (thead && thead.children.length === row.children.length - 1) {
        const th = document.createElement('th');
        th.textContent = 'Пример';
        thead.appendChild(th);
      }
    });
  }

  // ── Main entry point ──────────────────────────────────────────────────────
  function initTokenViz(proseEl) {
    if (!proseEl) return;
    injectStyles();
    processExplicitBlocks(proseEl);
    autoEnhanceColorTable(proseEl);
    autoEnhanceSpaceTable(proseEl);
    autoEnhanceTypeTable(proseEl);
  }

  // ── Public API ────────────────────────────────────────────────────────────
  window.DSTokenViz = { init: initTokenViz };

})();
