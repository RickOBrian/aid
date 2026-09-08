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
    const hex = rgbToHex(rgba.r, rgba.g, rgba.b);
    if (pct >= 100) return hex;
    return `${hex} • ${pct}%`;
  }

  function formatHexAlphaLabel(hex, alphaPct) {
    if (!hex) return '—';
    if (alphaPct >= 100) return hex;
    return `${hex} • ${alphaPct}%`;
  }

  function parseAlphaDisplay(displayValue) {
    const match = displayValue.trim().match(/^#([0-9A-Fa-f]{6})\s*[•·]\s*(\d+)%$/);
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

  // Step-order validation compares base color only. Alpha/transparency must
  // never factor in here — an `-aXX` alpha variant shares its base hex with
  // a fully-opaque step and must not be flagged just because its rendered
  // (alpha-blended-over-background) appearance looks lighter. We therefore
  // read r/g/b straight off parseColor (which ignores `a`) instead of
  // blending against any background, i.e. never call `effectiveLuminance`
  // or similar here.
  function checkStepOrderViolation(items, index) {
    if (index === 0) return false;
    const currStep = parseCoreToken(items[index].token).step;
    const prevStep = parseCoreToken(items[index - 1].token).step;
    const currN = getStepNumeric(currStep);
    const prevN = getStepNumeric(prevStep);
    if (currN <= prevN) return false;

    const currVal = readTokenValue(items[index].token) || items[index].light;
    const prevVal = readTokenValue(items[index - 1].token) || items[index - 1].light;
    const currLum = colorLuminance(currVal);
    const prevLum = colorLuminance(prevVal);
    if (currLum === null || prevLum === null) return false;
    return currLum > prevLum;
  }

  // ── Core token → resolved color (single source of truth for swatches) ───
  //
  // Resolution order: live computed CSS value (getComputedStyle) first,
  // falling back to the registry's Light value. Never render a swatch from
  // the token's textual name alone (e.g. inline `var(--token)`) — if a core
  // token isn't defined in the live stylesheet, that CSS var silently
  // resolves to nothing and paints an indistinguishable "empty" swatch.
  function resolveCoreTokenAppearance(token, coreTokenIndex) {
    const row = coreTokenIndex ? coreTokenIndex.get(token) : null;
    const live = readTokenValue(token) || (row ? row.light : '');
    const color = parseColor(live);
    if (!color) return { valid: false, hex: null, alphaPct: 100 };

    const { step } = parseCoreToken(token);
    let alphaPct = 100;
    if (isAlphaStep(step)) {
      alphaPct = parseAlphaFromStep(step);
    } else if (color.a < 1) {
      alphaPct = Math.round(color.a * 100);
    }

    return { valid: true, hex: rgbToHex(color.r, color.g, color.b), alphaPct };
  }

  function renderCoreSwatch(token, coreTokenIndex) {
    const appearance = resolveCoreTokenAppearance(token, coreTokenIndex);
    if (!appearance.valid) {
      return `<span class="color-swatch color-swatch--error" title="Не удалось получить цвет: ${escapeHtml(token)}" aria-hidden="true">!</span>`;
    }
    return renderSemanticSwatch(appearance.hex, appearance.alphaPct);
  }

  function parseSemanticCategory(name) {
    const match = name.match(/^--(bg|text|icon|line|shadow)-/);
    return match ? match[1] : 'other';
  }

  function normalizeSemanticRef(value) {
    const v = value.trim();
    if (!v || v === '—') return v;
    if (v.startsWith('var(')) return v;
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) return v;
    if (/^rgba?\(/i.test(v)) return v;
    if (v.startsWith('--')) return `var(${v})`;
    return `var(--${v})`;
  }

  function readTokenValue(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  // ── Semantic → Core mapping (hex + alpha model) ──────────────────────────

  function parseAlphaFromStep(step) {
    const match = String(step).match(/-a(\d+)$/i);
    return match ? Number(match[1]) : 100;
  }

  function getCoreTokenBasePrefix(coreToken) {
    return coreToken.replace(/-a\d+$/i, '');
  }

  function findAlphaCoreToken(basePrefix, alphaPct, coreTokenIndex) {
    if (alphaPct >= 100) return basePrefix;
    const padded = `${basePrefix}-a${String(alphaPct).padStart(2, '0')}`;
    if (coreTokenIndex.has(padded)) return padded;
    const plain = `${basePrefix}-a${alphaPct}`;
    if (coreTokenIndex.has(plain)) return plain;
    return null;
  }

  function readSemanticCssRef(semanticToken, mode, row) {
    const key = mode === 'dark' ? `${semanticToken}::dark` : semanticToken;
    if (modified.has(key)) return modified.get(key).newValue;
    // Единый источник рантайм-значения — DSTokenStore (материализован из
    // registry). Никаких inline-стилей и локальных dark-оверрайдов.
    const stored = tokenStore() ? tokenStore().get(semanticToken, mode) : '';
    if (stored) return stored;
    const registryVal = mode === 'dark' ? row.dark : row.light;
    return normalizeSemanticRef(registryVal);
  }

  function parseSemanticMapping(rawRef, coreTokenIndex) {
    if (rawRef === '—') return { empty: true };

    const ref = String(rawRef).trim();
    const warningMessage = 'не core-формат: ожидается hex + alpha';

    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(ref) || /^rgba?\(/i.test(ref)) {
      const color = parseColor(ref);
      return {
        valid: false,
        warning: true,
        message: warningMessage,
        hex: color ? rgbToHex(color.r, color.g, color.b) : null,
        alphaPct: color ? Math.round(color.a * 100) : 100,
        coreToken: null,
        basePrefix: '',
        cssRef: ref,
      };
    }

    const normalized = normalizeSemanticRef(ref);
    const coreToken = extractCoreTokenRef(normalized);
    if (!coreToken || !coreTokenIndex.has(coreToken)) {
      return {
        valid: false,
        warning: true,
        message: warningMessage,
        hex: null,
        alphaPct: 100,
        coreToken: null,
        basePrefix: '',
        cssRef: ref,
      };
    }

    const appearance = resolveCoreTokenAppearance(coreToken, coreTokenIndex);
    const basePrefix = getCoreTokenBasePrefix(coreToken);
    if (!appearance.valid) {
      return {
        valid: false,
        warning: true,
        message: warningMessage,
        coreToken,
        basePrefix,
        hex: null,
        alphaPct: 100,
        cssRef: `var(${coreToken})`,
      };
    }

    const { hex, alphaPct } = appearance;
    const alphaMatch = findAlphaCoreToken(basePrefix, alphaPct, coreTokenIndex);
    const valid = alphaPct >= 100 ? coreToken === basePrefix : alphaMatch === coreToken;

    return {
      valid,
      warning: !valid,
      message: valid ? '' : warningMessage,
      coreToken,
      basePrefix,
      hex,
      alphaPct,
      cssRef: `var(${coreToken})`,
    };
  }

  function extractCoreTokenRef(cssValue) {
    const match = String(cssValue).trim().match(/^var\((--core-[\w-]+)\)$/);
    return match ? match[1] : null;
  }

  function buildCoreTokenIndex() {
    const map = new Map();
    registry.core.forEach((row) => map.set(row.token, row));
    return map;
  }

  function listExistingPalettes() {
    const set = new Set();
    registry.core.forEach((row) => set.add(parseCoreToken(row.token).palette));
    return [...set].sort();
  }

  function buildTokenOptionsPanelHtml(selectedToken, coreTokenIndex) {
    return groupCoreRows(registry.core)
      .map((group) => {
        const options = group.items
          .map((row) => {
            const isSelected = row.token === selectedToken;
            return `
              <button type="button" class="token-select__option${isSelected ? ' is-selected' : ''}"
                      role="option" aria-selected="${isSelected ? 'true' : 'false'}"
                      tabindex="-1" data-token="${escapeHtml(row.token)}">
                <span class="token-select__option-swatch">${renderCoreSwatch(row.token, coreTokenIndex)}</span>
                <span class="token-select__option-name">${escapeHtml(row.token)}</span>
                ${isSelected ? '<span class="token-select__option-check" aria-hidden="true">✓</span>' : ''}
              </button>`;
          })
          .join('');
        return `
          <div class="token-select__group" role="group" aria-label="${escapeHtml(group.label)}">
            <div class="token-select__group-label">${escapeHtml(group.label)}</div>
            ${options}
          </div>`;
      })
      .join('');
  }

  function renderSemanticSwatch(hex, alphaPct) {
    const color = parseHex(hex);
    if (!color) {
      return '<span class="color-swatch color-swatch--empty" aria-hidden="true"></span>';
    }
    if (alphaPct >= 100) {
      return `<span class="color-swatch" style="background-color: ${escapeHtml(hex)}" aria-hidden="true"></span>`;
    }

    const alpha = alphaPct / 100;
    const alphaStr = Number.isInteger(alphaPct) ? String(alpha) : alpha.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
    const rgba = `rgba(${color.r}, ${color.g}, ${color.b}, ${alphaStr})`;

    return `
      <span class="color-swatch color-swatch--alpha" aria-hidden="true">
        <span class="color-swatch__solid" style="background-color: ${escapeHtml(hex)}"></span>
        <span class="color-swatch__alpha color-swatch__checker">
          <span class="color-swatch__alpha-fill" style="background-color: ${escapeHtml(rgba)}"></span>
        </span>
      </span>`;
  }

  function formatCoreTokenShortName(coreToken) {
    if (!coreToken) return '— выбрать core-токен —';
    return coreToken.replace(/^--/, '');
  }

  let tokenSelectUid = 0;

  function renderCoreMapContent(model, semanticToken, mode, coreTokenIndex) {
    const summaryLabel = model.hex
      ? formatHexAlphaLabel(model.hex, model.alphaPct ?? 100)
      : '—';
    const tokenShortName = formatCoreTokenShortName(model.coreToken);
    const swatchHtml = model.hex
      ? renderSemanticSwatch(model.hex, model.alphaPct ?? 100)
      : '<span class="color-swatch color-swatch--empty" aria-hidden="true"></span>';
    const warningHtml = model.warning
      ? `<span class="core-map__warning">${escapeHtml(model.message || 'не core-формат: ожидается hex + alpha')}</span>`
      : '<span class="core-map__warning" hidden></span>';
    const triggerId = `token-select-trigger-${tokenSelectUid++}`;

    return `
      <div class="token-select">
        <button type="button" class="token-select__trigger${model.warning ? ' is-unmapped' : ''}"
                id="${triggerId}" aria-haspopup="listbox" aria-expanded="false"
                aria-label="${mode === 'dark' ? 'Dark' : 'Light'} core token for ${escapeHtml(semanticToken)}">
          ${model.warning ? '<span class="token-select__warning-icon" aria-hidden="true">⚠</span>' : ''}
          <span class="token-select__swatch-slot">${swatchHtml}</span>
          <span class="token-select__meta">
            <span class="token-select__token-name">${escapeHtml(tokenShortName)}</span>
            <span class="token-select__label">${escapeHtml(summaryLabel)}</span>
          </span>
          <span class="token-select__chevron" aria-hidden="true">▾</span>
        </button>
        <div class="token-select__panel" role="listbox" aria-labelledby="${triggerId}" hidden>
          ${buildTokenOptionsPanelHtml(model.coreToken, coreTokenIndex)}
        </div>
      </div>
      ${warningHtml}`;
  }

  function updateCoreMapFromModel(mapEl, model, coreTokenIndex) {
    if (!mapEl || !model) return;

    if (activeTokenSelect?.wrapper?.closest('.core-map') === mapEl) {
      closeActiveTokenSelect();
    }

    mapEl.classList.toggle('core-map--warning', Boolean(model.warning));
    mapEl.classList.toggle('core-map--invalid', Boolean(model.warning));

    const semanticToken = mapEl.dataset.token;
    const mode = mapEl.dataset.mode;
    mapEl.innerHTML = renderCoreMapContent(model, semanticToken, mode, coreTokenIndex);
    bindTokenSelectCell(mapEl);

    const key = mode === 'dark' ? `${semanticToken}::dark` : semanticToken;
    const trigger = mapEl.querySelector('.token-select__trigger');
    if (trigger) trigger.classList.toggle('is-modified', modified.has(key));
  }

  function commitSemanticMapping(mapEl, coreToken, coreTokenIndex) {
    const semanticToken = mapEl.dataset.token;
    const mode = mapEl.dataset.mode;
    const cssRef = `var(${coreToken})`;

    applyToken(semanticToken, cssRef, mode === 'dark' ? 'dark' : 'light');
    trackChange(semanticToken, cssRef, mode === 'dark' ? 'dark' : 'light');

    const model = parseSemanticMapping(cssRef, coreTokenIndex);
    updateCoreMapFromModel(mapEl, model, coreTokenIndex);
    return model;
  }

  function renderCoreMappingControl(semanticToken, mode, rawRef, coreTokenIndex) {
    if (rawRef === '—') return '<span class="storybook-status">—</span>';

    const model = parseSemanticMapping(rawRef, coreTokenIndex);
    const warningClass = model.warning ? ' core-map--warning core-map--invalid' : '';

    return `
      <div class="core-map${warningClass}" data-token="${escapeHtml(semanticToken)}" data-mode="${mode}">
        ${renderCoreMapContent(model, semanticToken, mode, coreTokenIndex)}
      </div>`;
  }

  // ── Token-select dropdown: overlay/portal behavior ───────────────────────
  //
  // The panel must render above the table without affecting row/cell layout
  // and without being clipped by ancestors that establish a clipping
  // context (e.g. `.table-wrap { overflow: hidden }`). On open we move the
  // panel node to `document.body` (manual portal), position it with
  // `position: fixed` via getBoundingClientRect, and move it back into its
  // original wrapper on close. Only one panel is ever open at a time.
  //
  // Do NOT wrap the portaled panel in a full-viewport overlay root — an
  // `inset: 0` layer can interfere with trigger hit-testing depending on
  // browser/stacking behaviour. The panel itself is the only portaled node.

  let activeTokenSelect = null; // { wrapper, trigger, panel }

  function positionTokenSelectPanel(trigger, panel) {
    const rect = trigger.getBoundingClientRect();
    const gap = 4;
    const maxHeight = 320;
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const openUpward = spaceBelow < Math.min(maxHeight, 160) && rect.top > spaceBelow;

    panel.style.position = 'fixed';
    panel.style.left = `${rect.left}px`;
    panel.style.width = `${rect.width}px`;
    panel.style.right = 'auto';
    panel.style.maxHeight = `${Math.min(maxHeight, openUpward ? rect.top - gap : spaceBelow)}px`;

    if (openUpward) {
      panel.style.top = 'auto';
      panel.style.bottom = `${window.innerHeight - rect.top + gap}px`;
    } else {
      panel.style.bottom = 'auto';
      panel.style.top = `${rect.bottom + gap}px`;
    }
  }

  function resetTokenSelectPanelStyles(panel) {
    panel.style.position = '';
    panel.style.top = '';
    panel.style.bottom = '';
    panel.style.left = '';
    panel.style.right = '';
    panel.style.width = '';
    panel.style.maxHeight = '';
  }

  function closeActiveTokenSelect() {
    if (!activeTokenSelect) return;
    const { wrapper, trigger, panel } = activeTokenSelect;

    wrapper.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
    panel.classList.remove('token-select__panel--portaled');
    resetTokenSelectPanelStyles(panel);
    wrapper.appendChild(panel);

    activeTokenSelect = null;
  }

  function openTokenSelect(wrapper, trigger, panel) {
    closeActiveTokenSelect();
    activeTokenSelect = { wrapper, trigger, panel };

    wrapper.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');

    document.body.appendChild(panel);
    panel.hidden = false;
    panel.classList.add('token-select__panel--portaled');
    positionTokenSelectPanel(trigger, panel);

    const selected = panel.querySelector('.token-select__option.is-selected') || panel.querySelector('.token-select__option');
    selected?.focus({ preventScroll: true });
  }

  function bindTokenSelectCell(mapEl) {
    const wrapper = mapEl.querySelector('.token-select');
    const trigger = mapEl.querySelector('.token-select__trigger');
    const panel = mapEl.querySelector('.token-select__panel');
    if (!wrapper || !trigger || !panel) return;

    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = wrapper.classList.contains('is-open');
      closeActiveTokenSelect();
      if (!isOpen) openTokenSelect(wrapper, trigger, panel);
    });

    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        openTokenSelect(wrapper, trigger, panel);
      }
    });

    panel.addEventListener('click', (event) => {
      event.stopPropagation();
      const option = event.target.closest('.token-select__option');
      if (!option) return;
      const chosen = option.dataset.token;
      if (!chosen) return;

      closeActiveTokenSelect();
      trigger.focus();
      commitSemanticMapping(mapEl, chosen, buildCoreTokenIndex());
    });

    panel.addEventListener('keydown', (event) => {
      const options = [...panel.querySelectorAll('.token-select__option')];
      const currentIndex = options.indexOf(document.activeElement);

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        options[Math.min(options.length - 1, currentIndex + 1)]?.focus({ preventScroll: true });
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        options[Math.max(0, currentIndex - 1)]?.focus({ preventScroll: true });
      } else if (event.key === 'Home') {
        event.preventDefault();
        options[0]?.focus({ preventScroll: true });
      } else if (event.key === 'End') {
        event.preventDefault();
        options[options.length - 1]?.focus({ preventScroll: true });
      } else if (event.key === 'Escape') {
        event.preventDefault();
        closeActiveTokenSelect();
        trigger.focus();
      } else if (event.key === 'Tab') {
        closeActiveTokenSelect();
      }
    });
  }

  function bindSemanticControls(scope) {
    scope.querySelectorAll('.core-map').forEach((mapEl) => {
      if (mapEl.querySelector('.token-select')) bindTokenSelectCell(mapEl);
    });
  }

  function cleanupLegacyTokenSelectOverlay() {
    document.querySelectorAll('.token-select-overlay-root').forEach((el) => el.remove());
  }

  let tokenSelectOutsideClickBound = false;
  function ensureTokenSelectOutsideClickHandler() {
    if (tokenSelectOutsideClickBound) return;
    tokenSelectOutsideClickBound = true;

    document.addEventListener('click', (event) => {
      if (event.target.closest('.token-select__trigger')) return;
      if (event.target.closest('.token-select__panel')) return;
      closeActiveTokenSelect();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeActiveTokenSelect();
    });
    window.addEventListener(
      'scroll',
      (event) => {
        if (!activeTokenSelect) return;
        if (event.target instanceof Element && event.target.closest('.token-select__panel')) return;
        positionTokenSelectPanel(activeTokenSelect.trigger, activeTokenSelect.panel);
      },
      true
    );
    window.addEventListener('resize', () => {
      if (activeTokenSelect) positionTokenSelectPanel(activeTokenSelect.trigger, activeTokenSelect.panel);
    });
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
        palette,
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

  function tokenStore() {
    return window.DSTokenStore || null;
  }

  // Материализуем весь registry (core + semantic, light + dark) в единый
  // авторитетный рантайм-слой. После этого КАЖДЫЙ токен реестра объявлен как
  // реальная CSS-переменная — исчезает рассинхрон "токен есть в таблице, а
  // var(--token) not defined". Ссылки semantic → core сохраняются как
  // var(--core-*), поэтому правка core автоматически доходит до semantic.
  function materializeRegistry() {
    const store = tokenStore();
    if (!store) {
      console.warn('DSTokenStore недоступен — пропускаю материализацию токенов');
      return;
    }
    const entries = [];
    registry.core.forEach((row) => {
      // Core-уровень не имеет light/dark mode-splitting — только одно сырое
      // значение (хранится в столбце "Light value" реестра по историческим
      // причинам общей таблицы, но семантически это просто "value").
      // row.dark для core намеренно игнорируется, даже если в реестре
      // окажется не "—" — core-слой не должен участвовать в mode-логике.
      if (row.light && row.light !== '—') entries.push({ name: row.token, value: row.light, mode: 'light' });
    });
    registry.semantic.forEach((row) => {
      if (row.light && row.light !== '—') {
        entries.push({ name: row.token, value: normalizeSemanticRef(row.light), mode: 'light' });
      }
      if (row.dark && row.dark !== '—') {
        entries.push({ name: row.token, value: normalizeSemanticRef(row.dark), mode: 'dark' });
      }
    });
    store.materialize(entries);
  }

  function applyToken(name, value, mode) {
    const store = tokenStore();
    if (store) {
      store.set(name, value, mode === 'dark' ? 'dark' : 'light');
      return;
    }
    // Graceful degradation: без стора правим :root напрямую (light-путь).
    if (mode !== 'dark') document.documentElement.style.setProperty(name, value);
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

  // ── Discard / rollback all pending (unsaved) changes ─────────────────────
  //
  // Canonical baseline = материализованный registry в DSTokenStore. Откат =
  // снять живой override у каждого изменённого токена (store.reset), после
  // чего значение возвращается к baseline. Это гарантирует, что light и dark
  // сходятся ровно к canonical-состоянию, а не к JS-приближению.
  function discardPendingChanges() {
    if (!modified.size) return;

    closeActiveTokenSelect();

    const store = tokenStore();
    modified.forEach((change) => {
      if (store) store.reset(change.token, change.mode === 'dark' ? 'dark' : 'light');
      else if (change.mode !== 'dark') document.documentElement.style.removeProperty(change.token);
    });
    modified.clear();
    updateSaveBar();

    const saveStatus = document.getElementById('save-status');
    if (saveStatus) {
      saveStatus.textContent = '';
      saveStatus.className = 'storybook-status';
    }

    const activeTabBtn = document.querySelector('.storybook-tabs__btn.is-active');
    if (activeTabBtn) switchTab(activeTabBtn.dataset.tab);
  }

  function renderCoreTab(container) {
    const groups = groupCoreRows(registry.core);
    const coreTokenIndex = buildCoreTokenIndex();

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
            <td>${renderCoreSwatch(row.token, coreTokenIndex)}</td>
            <td>${renderRowActions(row.token, 'core-color')}</td>
          </tr>`;
          })
          .join('');

        return `
        <section class="color-token-group" id="${escapeHtml(group.id)}">
          <div class="color-token-group__title-row">
            <h3 class="color-token-group__title">${escapeHtml(group.label)}</h3>
            <div class="color-token-group__title-actions">
              <button type="button" class="token-category-rename"
                      data-rename-category="${escapeHtml(group.palette || group.label)}">Rename category</button>
              <button type="button" class="token-category-delete"
                      data-delete-category="${escapeHtml(group.palette || group.label)}">Delete category</button>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Palette</th>
                  <th>Step</th>
                  <th>Value</th>
                  <th>Swatch</th>
                  <th><span class="visually-hidden">Действия</span></th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </section>`;
      })
      .join('');

    bindInputs(container);
    bindColorDeleteControls(container);
    return groups;
  }

  function renderSemanticTab(container) {
    const groups = groupSemanticRows(registry.semantic);
    const coreTokenIndex = buildCoreTokenIndex();

    container.innerHTML = groups
      .map((group) => {
        const rows = group.items
          .map((row) => {
            const lightRef = readSemanticCssRef(row.token, 'light', row);
            const darkRef = row.dark === '—' ? '—' : readSemanticCssRef(row.token, 'dark', row);
            originals.set(row.token, lightRef);
            if (row.dark !== '—') originals.set(`${row.token}::dark`, darkRef);

            return `
          <tr data-token="${escapeHtml(row.token)}">
            <td><code class="token-name">${escapeHtml(row.token)}</code></td>
            <td>${renderCoreMappingControl(row.token, 'light', lightRef, coreTokenIndex)}</td>
            <td>${renderCoreMappingControl(row.token, 'dark', darkRef, coreTokenIndex)}</td>
            <td>${renderRowActions(row.token, 'semantic-color')}</td>
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
                  <th>Light value</th>
                  <th>Dark value</th>
                  <th><span class="visually-hidden">Действия</span></th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </section>`;
      })
      .join('');

    bindSemanticControls(container);
    bindColorDeleteControls(container);
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
    // Typing only edits the input's own draft value (native browser behavior —
    // no listener needed). Commit (apply + track + swatch) happens on blur only,
    // so partial/incomplete input never touches the CSS var or reflows the preview.
    scope.querySelectorAll('.token-editor-input').forEach((input) => {
      input.addEventListener('blur', () => {
        const name = input.dataset.token;
        const mode = input.dataset.mode;
        const key = mode === 'dark' ? `${name}::dark` : name;
        const orig = originals.get(key) ?? originals.get(name) ?? '';
        input.value = window.DSStorybook.normalizeTokenValue(input.value.trim(), orig);

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
          if (swatchCell && parseRgba(next)) {
            swatchCell.innerHTML = renderCoreSwatch(name, buildCoreTokenIndex());
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

  async function parseSaveResponse(res) {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (_) {
      if (text.trimStart().startsWith('<!DOCTYPE') || text.trimStart().startsWith('<html')) {
        throw new Error(
          'Сервер не поддерживает сохранение. Запустите: python3 scripts/docs-server.py'
        );
      }
      throw new Error('Некорректный ответ сервера (ожидался JSON)');
    }
  }

  function isNetworkFetchError(err) {
    return err instanceof TypeError && /failed to fetch/i.test(String(err.message));
  }

  async function postSave(payload) {
    let lastNetworkError;

    for (const url of getSaveEndpoints()) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await parseSaveResponse(res);
        if (!res.ok || !data.ok) {
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        return data;
      } catch (err) {
        if (isNetworkFetchError(err)) {
          lastNetworkError = err;
          continue;
        }
        throw err;
      }
    }

    throw lastNetworkError || new Error('Не удалось сохранить токены');
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

  // ── Create flow: new core color / new semantic color ─────────────────────
  //
  // Explicit "Add …" action (not an empty table row). Confirm → POST
  // { creates: [...] } → server validates + writes the canonical registry +
  // regenerates the derived CSS in one request → we re-fetch the registry
  // and re-render the active tab in place (no page reload).

  const NEW_CATEGORY_VALUE = '__new__';

  async function reloadRegistryAndRerender() {
    const res = await fetch(`${REGISTRY_URL}?_=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('registry fetch failed');
    const md = await res.text();
    const rows = parseRegistryTable(md);
    registry.core = rows.filter((r) => r.level === 'core');
    registry.semantic = rows.filter((r) => r.level === 'semantic');

    materializeRegistry();

    const activeTabBtn = document.querySelector('.storybook-tabs__btn.is-active');
    if (activeTabBtn) switchTab(activeTabBtn.dataset.tab);
  }

  // ── Delete flow: remove core / semantic token or (empty) core category ───
  //
  // Explicit per-row / per-category action. Never a one-click destructive op:
  // a confirm step is always required. Before offering the confirm, we run a
  // dependency/usage check (structural refs + declared consumers). If the
  // entry is used we surface a BLOCKING state with the dependency list and
  // never delete silently or reassign dependents. The server re-validates the
  // same rules against the on-disk registry (source of truth).

  function renderRowActions(token, kind) {
    return `<span class="token-row-actions">
      <button type="button" class="token-row-rename" title="Переименовать ${escapeHtml(token)}"
              aria-label="Переименовать ${escapeHtml(token)}"
              data-rename-token="${escapeHtml(token)}" data-rename-kind="${escapeHtml(kind)}">✎</button>
      <button type="button" class="token-row-delete" title="Удалить ${escapeHtml(token)}"
              aria-label="Удалить ${escapeHtml(token)}"
              data-delete-token="${escapeHtml(token)}" data-delete-kind="${escapeHtml(kind)}">&times;</button>
    </span>`;
  }

  function usedInConsumers(cell) {
    const v = String(cell || '').trim();
    if (!v || v === '—' || v === '(reserved)') return [];
    return v
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function escapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function isConsumerFile(entry) {
    const name = String(entry || '').trim().split(/\s+/)[0];
    return /\.(html|css)$/i.test(name);
  }

  function consumerFileName(entry) {
    return String(entry || '').trim().split(/\s+/)[0];
  }

  // Resolve a usedIn filename to a fetch URL relative to docs/storybook/.
  function resolveConsumerUrl(filename) {
    if (filename.startsWith('docs/')) return `../${filename.replace(/^docs\//, '')}`;
    if (filename.includes('/')) return `../${filename}`;
    return `../guides/${filename}`;
  }

  // Lightweight structural hint at a token reference — only headings, table/style
  // blocks, and filename cues. No prose/markdown parsing.
  function sectionHintAt(content, index, filename) {
    const before = content.slice(0, index);

    if (/\.css$/i.test(filename)) return 'CSS stylesheet';

    const styleOpen = before.lastIndexOf('<style');
    const styleClose = before.lastIndexOf('</style>');
    if (styleOpen !== -1 && styleOpen > styleClose) {
      const chunk = content.slice(styleOpen, index);
      if (/data-theme\s*=\s*["']dark|\[data-theme=["']dark/i.test(chunk)) {
        return 'Dark theme / :root';
      }
      return 'Theme / :root block';
    }

    const tableOpen = before.lastIndexOf('<table');
    const tableClose = before.lastIndexOf('</table>');
    if (tableOpen !== -1 && tableOpen > tableClose) {
      if (/core-color/i.test(filename)) return 'Core tokens table';
      if (/semantic-color/i.test(filename)) return 'Semantic tokens table';
      return 'Table';
    }

    const headings = [...before.matchAll(/<h[23][^>]*>([^<]+)/gi)];
    if (headings.length) {
      return headings[headings.length - 1][1].trim().replace(/\s+/g, ' ').slice(0, 56);
    }

    if (/storybook/i.test(filename)) return 'Storybook UI';
    return null;
  }

  function findUsageContexts(content, token, filename) {
    const re = new RegExp(`${escapeRegExp(token)}(?![\\w-])`, 'g');
    const hints = new Set();
    let count = 0;
    let match;
    while ((match = re.exec(content)) !== null) {
      count += 1;
      const hint = sectionHintAt(content, match.index, filename);
      if (hint) hints.add(hint);
    }
    return { count, hints: [...hints].slice(0, 3) };
  }

  function formatUseCount(count) {
    return count === 1 ? '1 use' : `${count} uses`;
  }

  // Enrich declared consumer files with per-file use counts and structural hints.
  async function enrichDependencyGroups(token, groups) {
    return Promise.all(
      groups.map(async (group) => {
        const items = await Promise.all(
          group.items.map(async (item) => {
            if (!isConsumerFile(item)) return item;

            const file = consumerFileName(item);
            try {
              const res = await fetch(resolveConsumerUrl(file));
              if (!res.ok) throw new Error('fetch failed');
              const content = await res.text();
              const { count, hints } = findUsageContexts(content, token, file);
              const meta = hints.length
                ? `${formatUseCount(count)} · ${hints.join(', ')}`
                : formatUseCount(count);
              return { primary: file, meta, detailed: true };
            } catch {
              return { primary: file, meta: 'count unavailable', detailed: true };
            }
          })
        );

        const fileItems = items.filter((i) => i && typeof i === 'object' && i.primary);
        const totalUses = fileItems.reduce((sum, entry) => {
          const m = String(entry.meta || '').match(/^(\d+) use/);
          return sum + (m ? Number(m[1]) : 0);
        }, 0);

        let label = group.label;
        if (totalUses > 0 && fileItems.length > 0) {
          const fileWord = fileItems.length === 1 ? 'file' : 'files';
          const useWord = totalUses === 1 ? 'use' : 'uses';
          label = `${String(group.label).replace(/:$/, '')} (${totalUses} ${useWord} in ${fileItems.length} ${fileWord}):`;
        }

        return {
          ...group,
          label,
          items,
          detailed: items.some((i) => i && typeof i === 'object' && i.detailed),
        };
      })
    );
  }

  function coreRefName(cell) {
    const v = String(cell || '').trim();
    if (!v || v === '—') return null;
    if (/^#/.test(v) || /^rgba?\(/i.test(v)) return null;
    const stripped = v.replace(/^var\(/, '').replace(/\)$/, '');
    return stripped.startsWith('--') ? stripped : `--${stripped}`;
  }

  // Semantic tokens referencing a given core token (light or dark column).
  function semanticRefsToCore(token) {
    return registry.semantic
      .filter((r) => coreRefName(r.light) === token || coreRefName(r.dark) === token)
      .map((r) => r.token);
  }

  // Returns { blocked, dependencies } for a single color token.
  function computeColorTokenDependencies(token) {
    const coreRow = registry.core.find((r) => r.token === token);
    const semRow = registry.semantic.find((r) => r.token === token);
    const dependencies = [];

    if (coreRow) {
      const refs = semanticRefsToCore(token);
      if (refs.length) {
        dependencies.push({ label: 'Semantic-токены ссылаются на этот core-токен:', items: refs });
      }
      const refKeys = new Set(refs.map((r) => r.replace(/^--/, '')));
      const extraConsumers = usedInConsumers(coreRow.usedIn).filter(
        (c) => !refKeys.has(c.replace(/^--/, '').replace(/\s*\(.*\)\s*$/, '').trim())
      );
      if (extraConsumers.length) {
        dependencies.push({ label: 'Указан как используемый (usedIn):', items: extraConsumers });
      }
    } else if (semRow) {
      const consumers = usedInConsumers(semRow.usedIn);
      if (consumers.length) {
        dependencies.push({ label: 'Используется консьюмерами (usedIn):', items: consumers });
      }
    }

    const blocked = dependencies.some((g) => g.items.length);
    return { blocked, dependencies, exists: Boolean(coreRow || semRow) };
  }

  function tokensInPalette(palette) {
    return registry.core.filter((r) => parseCoreToken(r.token).palette === palette).map((r) => r.token);
  }

  function buildDeleteColorTokenConfig(token, kind, triggerEl) {
    const { blocked, dependencies } = computeColorTokenDependencies(token);

    if (blocked) {
      return {
        title: `Нельзя удалить ${token}`,
        message:
          'Токен используется — удаление заблокировано, чтобы не сломать зависимости. ' +
          'Сначала переназначьте или удалите зависимые записи, затем повторите.',
        blocked: true,
        dependencies,
        triggerEl,
      };
    }

    return {
      title: `Удалить ${token}?`,
      message: 'Токен не используется другими токенами и консьюмерами. Удаление необратимо.',
      confirmLabel: 'Удалить',
      blocked: false,
      triggerEl,
      onConfirm: async () => {
        const data = await postSave({
          deletes: [{ kind: 'color-token', token }],
          author: localStorage.getItem('ds-author') || 'sergej',
        }).catch((err) => ({ __error: err.message }));

        if (data.__error) return { ok: false, error: data.__error };
        if (!data.ok) return { ok: false, error: data.error || 'Не удалось удалить' };
        await reloadRegistryAndRerender();
        return { ok: true };
      },
    };
  }

  function buildDeleteCategoryConfig(palette, triggerEl) {
    const contained = tokensInPalette(palette);

    if (contained.length) {
      return {
        title: `Категория "${palette}" не пуста`,
        message:
          'Внутри ещё есть токены. Категория не удаляется вместе с содержимым автоматически — ' +
          'сначала удалите каждый токен по отдельности (каждый со своей проверкой зависимостей).',
        blocked: true,
        dependencies: [{ label: 'Токены в категории:', items: contained }],
        triggerEl,
      };
    }

    return {
      title: `Удалить категорию "${palette}"?`,
      message: 'Категория пуста. Удаление убирает пустую группу из палитры.',
      confirmLabel: 'Удалить категорию',
      blocked: false,
      triggerEl,
      onConfirm: async () => {
        const data = await postSave({
          deletes: [{ kind: 'core-category', palette }],
          author: localStorage.getItem('ds-author') || 'sergej',
        }).catch((err) => ({ __error: err.message }));

        if (data.__error) return { ok: false, error: data.__error };
        if (!data.ok) return { ok: false, error: data.error || 'Не удалось удалить категорию' };
        await reloadRegistryAndRerender();
        return { ok: true };
      },
    };
  }

  function bindColorDeleteControls(scope) {
    scope.querySelectorAll('[data-delete-token]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const token = btn.dataset.deleteToken;
        const kind = btn.dataset.deleteKind;
        let config = buildDeleteColorTokenConfig(token, kind, btn);
        if (config.blocked && config.dependencies?.length) {
          config = {
            ...config,
            dependencies: await enrichDependencyGroups(token, config.dependencies),
          };
        }
        window.DSTokenConfirm.open(config);
      });
    });

    scope.querySelectorAll('[data-delete-category]').forEach((btn) => {
      btn.addEventListener('click', () => {
        window.DSTokenConfirm.open(buildDeleteCategoryConfig(btn.dataset.deleteCategory, btn));
      });
    });

    scope.querySelectorAll('[data-rename-token]').forEach((btn) => {
      btn.addEventListener('click', () => {
        window.DSTokenCreate.open(buildRenameColorTokenConfig(btn.dataset.renameToken, btn));
      });
    });

    scope.querySelectorAll('[data-rename-category]').forEach((btn) => {
      btn.addEventListener('click', () => {
        window.DSTokenCreate.open(buildRenameCategoryConfig(btn.dataset.renameCategory, btn));
      });
    });
  }

  // ── Rename flow: rename core / semantic token or core category ────────────
  //
  // Rename is never a cosmetic label change. It reuses the create modal (a
  // "new name" field with format + collision validation), shows every
  // reference the rename will cascade to, and on confirm POSTs
  // { renames: [...] }. The server rewrites the canonical registry, all
  // intra-registry references, regenerates the derived CSS and rewrites every
  // var(--old) consumer — then we re-fetch and re-render in place.

  function isCoreToken(token) {
    return registry.core.some((r) => r.token === token);
  }

  function tokenReferenceGroups(token) {
    // Reuse the dependency computation — for rename these are the references
    // that WILL be updated (not blockers).
    const { dependencies } = computeColorTokenDependencies(token);
    return dependencies;
  }

  function refsSummary(groups) {
    const count = groups.reduce((n, g) => n + g.items.length, 0);
    return count
      ? `На это имя ссылается ${count} записей — все ссылки будут обновлены автоматически.`
      : 'На это имя нет ссылок — обычное переименование.';
  }

  function validateNewColorName(value, oldToken, level) {
    const v = value.trim();
    if (v === oldToken) return 'Новое имя совпадает со старым';
    if (level === 'core') {
      if (!/^--core-[a-z][a-z0-9]*(-[a-z0-9]+)*-\d{1,3}(-a\d{2}|-b)?$/.test(v)) {
        return 'Формат: --core-<палитра>-<step>';
      }
    } else if (!/^--(bg|text|icon|line|shadow)-[a-z]+(-[a-z]+)*$/.test(v)) {
      return 'Формат: --(bg|text|icon|line|shadow)-роль-вариант';
    }
    if (registry.core.some((r) => r.token === v) || registry.semantic.some((r) => r.token === v)) {
      return `Токен ${v} уже существует`;
    }
    return null;
  }

  function buildRenameColorTokenConfig(token, triggerEl) {
    const level = isCoreToken(token) ? 'core' : 'semantic';
    const references = tokenReferenceGroups(token);

    return {
      title: `Rename ${token}`,
      description: refsSummary(references),
      references,
      submitLabel: 'Переименовать',
      submittingLabel: 'Переименование…',
      errorLabel: 'Не удалось переименовать',
      triggerEl,
      fields: [
        {
          id: 'newName',
          label: 'Новое имя',
          type: 'text',
          value: token,
          required: true,
          validate: (value) => validateNewColorName(value, token, level),
        },
      ],
      onSubmit: async (values) => {
        const data = await postSave({
          renames: [{ kind: 'color-token', from: token, to: values.newName.trim() }],
          author: localStorage.getItem('ds-author') || 'sergej',
        }).catch((err) => ({ __error: err.message }));

        if (data.__error) return { ok: false, error: data.__error };
        if (!data.ok) return { ok: false, error: data.error || 'Не удалось переименовать' };
        await reloadRegistryAndRerender();
        return { ok: true };
      },
    };
  }

  function buildRenameCategoryConfig(palette, triggerEl) {
    const contained = tokensInPalette(palette);
    const refSet = new Set();
    contained.forEach((t) => semanticRefsToCore(t).forEach((s) => refSet.add(s)));
    const references = [
      { label: 'Токены категории (будут переименованы):', items: contained },
    ];
    if (refSet.size) {
      references.push({ label: 'Semantic-токены ссылаются на эти core-токены:', items: [...refSet] });
    }

    return {
      title: `Rename category "${palette}"`,
      description: `${contained.length} core-токенов будут переименованы; ${refSet.size} ссылок обновятся автоматически.`,
      references,
      submitLabel: 'Переименовать',
      submittingLabel: 'Переименование…',
      errorLabel: 'Не удалось переименовать категорию',
      triggerEl,
      fields: [
        {
          id: 'newName',
          label: 'Новое имя категории',
          type: 'text',
          value: palette,
          placeholder: 'например azure-cool',
          hint: 'строчные буквы/цифры, дефис как разделитель, без слов primary/brand/error/main',
          required: true,
          validate: (value) => {
            const v = value.trim();
            if (v === palette) return 'Новое имя совпадает со старым';
            if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(v)) return 'Строчные буквы/цифры, дефис как разделитель';
            if (/primary|secondary|brand|error|success|warning|danger|info|accent|main|default/.test(v)) {
              return 'Без слов вроде primary/brand/error/main';
            }
            if (listExistingPalettes().includes(v)) return `Категория "${v}" уже существует`;
            return null;
          },
        },
      ],
      onSubmit: async (values) => {
        const data = await postSave({
          renames: [{ kind: 'core-category', from: palette, to: values.newName.trim() }],
          author: localStorage.getItem('ds-author') || 'sergej',
        }).catch((err) => ({ __error: err.message }));

        if (data.__error) return { ok: false, error: data.__error };
        if (!data.ok) return { ok: false, error: data.error || 'Не удалось переименовать категорию' };
        await reloadRegistryAndRerender();
        return { ok: true };
      },
    };
  }

  function buildAddCoreColorConfig(triggerEl) {
    const palettes = listExistingPalettes();

    return {
      title: 'Add core color',
      description: 'Новый core-токен: сырое значение без смысловой нагрузки.',
      submitLabel: 'Создать',
      triggerEl,
      fields: [
        {
          id: 'category',
          label: 'Category',
          type: 'select',
          required: true,
          options: [
            ...palettes.map((p) => ({ value: p, label: p })),
            { value: NEW_CATEGORY_VALUE, label: '+ Создать новую category…' },
          ],
        },
        {
          id: 'newCategory',
          label: 'Новое имя category',
          type: 'text',
          placeholder: 'например sapphire-cool',
          hint: 'строчные буквы/цифры, дефис как разделитель, без слов primary/brand/error/main',
          showIf: (values) => values.category === NEW_CATEGORY_VALUE,
          required: true,
          validate: (value) => {
            if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(value)) {
              return 'Строчные буквы/цифры, дефис как разделитель';
            }
            if (/primary|secondary|brand|error|success|warning|danger|info|accent|main|default/.test(value)) {
              return 'Без слов вроде primary/brand/error/main — палитра должна быть нейтральной';
            }
            if (listExistingPalettes().includes(value)) {
              return `Category "${value}" уже существует — выберите её в списке`;
            }
            return null;
          },
        },
        {
          id: 'step',
          label: 'Step',
          type: 'text',
          placeholder: '55 или 55-a12',
          hint: 'число 0–100, опционально -aNN (alpha) или -b',
          required: true,
          validate: (value) => (/^\d{1,3}(-a\d{2}|-b)?$/.test(value) ? null : 'Например: 55, 55-a12, 55-b'),
        },
        {
          // Core-токены хранят одно сырое значение без mode-splitting —
          // light/dark назначаются только на semantic-уровне ссылкой на
          // разные core-токены. Поэтому у core-color ровно одно поле value.
          id: 'value',
          label: 'Value',
          type: 'text',
          placeholder: '#3B82F6 или rgba(59,130,246,0.12)',
          required: true,
          validate: (value) => (parseColor(value) ? null : '#RRGGBB или rgba(r, g, b, a)'),
        },
      ],
      onSubmit: async (values) => {
        const palette = values.category === NEW_CATEGORY_VALUE ? values.newCategory : values.category;
        const data = await postSave({
          creates: [{ kind: 'core-color', palette, step: values.step, value: values.value }],
          author: localStorage.getItem('ds-author') || 'sergej',
        }).catch((err) => ({ __error: err.message }));

        if (data.__error) return { ok: false, error: data.__error };
        await reloadRegistryAndRerender();
        return { ok: true };
      },
    };
  }

  function buildAddSemanticColorConfig(triggerEl) {
    const coreOptions = registry.core.map((row) => ({ value: row.token, label: row.token }));

    return {
      title: 'Add semantic color',
      description: 'Semantic-токен всегда ссылается на существующий core-токен.',
      submitLabel: 'Создать',
      triggerEl,
      fields: [
        {
          id: 'token',
          label: 'Token name',
          type: 'text',
          placeholder: '--bg-accent-subtle',
          hint: 'категория bg/text/icon/line/shadow, строчные буквы и дефисы, без цифр',
          required: true,
          validate: (value) => {
            const v = value.startsWith('--') ? value : `--${value}`;
            if (!/^--(bg|text|icon|line|shadow)-[a-z]+(-[a-z]+)*$/.test(v)) {
              return '--(bg|text|icon|line|shadow)-роль-вариант, без цифр';
            }
            if (registry.semantic.some((r) => r.token.toLowerCase() === v.toLowerCase())) {
              return `Токен ${v} уже существует`;
            }
            return null;
          },
        },
        {
          id: 'light',
          label: 'Light value (core token)',
          type: 'select',
          required: true,
          options: coreOptions,
        },
        {
          id: 'dark',
          label: 'Dark value (core token)',
          type: 'select',
          required: true,
          options: [{ value: '—', label: '— (совпадает со значением light)' }, ...coreOptions],
        },
      ],
      onSubmit: async (values) => {
        const token = values.token.startsWith('--') ? values.token : `--${values.token}`;
        const data = await postSave({
          creates: [
            {
              kind: 'semantic-color',
              token,
              light: `var(${values.light})`,
              dark: values.dark === '—' ? '' : `var(${values.dark})`,
            },
          ],
          author: localStorage.getItem('ds-author') || 'sergej',
        }).catch((err) => ({ __error: err.message }));

        if (data.__error) return { ok: false, error: data.__error };
        await reloadRegistryAndRerender();
        return { ok: true };
      },
    };
  }

  function bindCreateButtons() {
    const addCoreBtn = document.getElementById('add-core-color-btn');
    const addSemanticBtn = document.getElementById('add-semantic-color-btn');

    if (addCoreBtn) {
      addCoreBtn.addEventListener('click', () => {
        window.DSTokenCreate.open(buildAddCoreColorConfig(addCoreBtn));
      });
    }
    if (addSemanticBtn) {
      addSemanticBtn.addEventListener('click', () => {
        window.DSTokenCreate.open(buildAddSemanticColorConfig(addSemanticBtn));
      });
    }
  }

  function switchTab(tabId) {
    closeActiveTokenSelect();

    document.querySelectorAll('.storybook-tabs__btn').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.tab === tabId);
      btn.setAttribute('aria-selected', btn.dataset.tab === tabId ? 'true' : 'false');
    });

    document.querySelectorAll('[data-tab-scope]').forEach((el) => {
      el.hidden = el.dataset.tabScope !== tabId;
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

    materializeRegistry();

    document.querySelectorAll('.storybook-tabs__btn').forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Снимаем legacy-слой прошлой версии редактора: раньше dark-режим правился
    // отдельным <style id="color-dark-overrides">, теперь всё идёт через
    // единый DSTokenStore-слой.
    const legacyDark = document.getElementById('color-dark-overrides');
    if (legacyDark) legacyDark.remove();
    cleanupLegacyTokenSelectOverlay();
    bindCreateButtons();
    ensureTokenSelectOutsideClickHandler();
    switchTab('core');
    loadChangelog();
    probeSaveApi();

    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const saveStatus = document.getElementById('save-status');

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        discardPendingChanges();
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        if (!modified.size) return;

        saveBtn.disabled = true;
        if (cancelBtn) cancelBtn.disabled = true;
        if (saveStatus) {
          saveStatus.textContent = 'Сохранение…';
          saveStatus.className = 'storybook-status';
        }

        // Отправляем mode-aware changes: и light, и dark. Сервер сам решит,
        // в какую колонку registry (Light/Dark) записать значение и
        // перегенерирует storybook-color-tokens.css из canonical-реестра.
        // tokens{} — плоская light-карта для обратной совместимости и
        // обновления :root в guide-файлах.
        const tokens = {};
        const changes = [];
        modified.forEach((change) => {
          changes.push({
            token: change.token,
            oldValue: change.oldValue,
            newValue: change.newValue,
            mode: change.mode === 'dark' ? 'dark' : 'light',
          });
          if (change.mode !== 'dark') tokens[change.token] = change.newValue;
        });

        try {
          const data = await postSave({
            tokens,
            changes,
            author: localStorage.getItem('ds-author') || 'sergej',
          });
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
          if (cancelBtn) cancelBtn.disabled = false;
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    let tokensRendered = false;
    const timeoutId = setTimeout(() => {
      if (!tokensRendered) {
        const coreEl = document.getElementById('tab-core-content');
        if (coreEl) {
          coreEl.innerHTML =
            '<p class="storybook-status is-error">Не удалось загрузить токены. Проверьте консоль.</p>';
        }
      }
    }, 5000);

    init()
      .then(() => {
        tokensRendered = true;
        clearTimeout(timeoutId);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        console.error('init failed:', err);
        const coreEl = document.getElementById('tab-core-content');
        if (coreEl) {
          coreEl.innerHTML = `<p class="storybook-status is-error">${escapeHtml(err.message)}</p>`;
        }
      });
  });

  window.DSColorEditor = { init };
})();
