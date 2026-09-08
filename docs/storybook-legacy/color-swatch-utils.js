/**
 * Shared color swatch helpers — used by colors-editor and product token viewer.
 */
(function () {
  'use strict';

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function parseHex(value) {
    const raw = String(value).trim();
    if (!raw.startsWith('#')) return null;
    const h = raw.slice(1);
    if (h.length === 8) {
      const a = parseInt(h.slice(0, 2), 16) / 255;
      const rgb = h.slice(2);
      if (rgb.length !== 6) return null;
      return {
        r: parseInt(rgb.slice(0, 2), 16),
        g: parseInt(rgb.slice(2, 4), 16),
        b: parseInt(rgb.slice(4, 6), 16),
        a,
      };
    }
    const match = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
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
    const match = String(value)
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

  function appearanceFromValue(value) {
    const color = parseColor(value);
    if (!color) return { valid: false, hex: null, alphaPct: 100 };
    const alphaPct = Math.round(color.a * 100);
    return { valid: true, hex: rgbToHex(color.r, color.g, color.b), alphaPct };
  }

  /** Как colors-editor formatAlphaDisplay / formatHexAlphaLabel. */
  function formatColorDisplay(value) {
    const appearance = appearanceFromValue(value);
    if (!appearance.valid) return String(value).trim();
    if (appearance.alphaPct >= 100) return appearance.hex;
    return `${appearance.hex} • ${appearance.alphaPct}%`;
  }

  function renderSemanticSwatch(hex, alphaPct) {
    const color = hex ? parseHex(hex.startsWith('#') ? hex : `#${hex}`) : null;
    if (!color) {
      return '<span class="color-swatch color-swatch--empty" aria-hidden="true"></span>';
    }
    const hexValue = rgbToHex(color.r, color.g, color.b);
    if (alphaPct >= 100) {
      return `<span class="color-swatch" style="background-color: ${escapeHtml(hexValue)}" aria-hidden="true"></span>`;
    }
    const alpha = alphaPct / 100;
    const alphaStr = Number.isInteger(alphaPct) ? String(alpha) : alpha.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
    const rgba = `rgba(${color.r}, ${color.g}, ${color.b}, ${alphaStr})`;
    return `
      <span class="color-swatch color-swatch--alpha" aria-hidden="true">
        <span class="color-swatch__solid" style="background-color: ${escapeHtml(hexValue)}"></span>
        <span class="color-swatch__alpha color-swatch__checker">
          <span class="color-swatch__alpha-fill" style="background-color: ${escapeHtml(rgba)}"></span>
        </span>
      </span>`;
  }

  function renderValueSwatch(value) {
    const appearance = appearanceFromValue(value);
    if (!appearance.valid) {
      return `<span class="color-swatch color-swatch--error" title="Не удалось разобрать цвет" aria-hidden="true">!</span>`;
    }
    return renderSemanticSwatch(appearance.hex, appearance.alphaPct);
  }

  window.DSColorSwatch = {
    escapeHtml,
    parseColor,
    appearanceFromValue,
    formatColorDisplay,
    renderSemanticSwatch,
    renderValueSwatch,
  };
})();
