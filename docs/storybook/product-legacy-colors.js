/**
 * Загрузка legacy color-токенов продукта и применение как CSS custom properties.
 * Имена вида main/primary → --sutochno-legacy-main-primary (валидное имя для CSS).
 */
(function () {
  'use strict';

  function argbToCss(value) {
    const hex = String(value || '').replace('#', '');
    if (hex.length === 8) {
      return `#${hex.slice(2)}${hex.slice(0, 2)}`;
    }
    return value.startsWith('#') ? value : `#${value}`;
  }

  function legacyVarName(tokenName, prefix) {
    const slug = String(tokenName)
      .split('/')
      .map((part) => part.replace(/^-+|-+$/g, ''))
      .filter(Boolean)
      .join('-');
    return `--${prefix}-${slug}`;
  }

  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    return res.json();
  }

  window.DSProductLegacyColors = {
    argbToCss,
    legacyVarName,

    async apply(urls, options) {
      const prefix = options?.prefix || 'sutochno-legacy';
      const root = options?.root || document.documentElement;
      const list = Array.isArray(urls) ? urls : [urls];
      const byName = {};

      for (const url of list) {
        const entries = await fetchJson(url);
        if (!Array.isArray(entries)) continue;
        for (const entry of entries) {
          if (!entry?.name || !entry?.value) continue;
          const cssName = legacyVarName(entry.name, prefix);
          const cssValue = argbToCss(entry.value);
          root.style.setProperty(cssName, cssValue);
          byName[entry.name] = { cssName, cssValue, entry };
        }
      }

      return byName;
    },
  };
})();
