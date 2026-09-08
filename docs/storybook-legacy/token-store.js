/**
 * DSTokenStore — единый runtime-слой материализации токенов.
 *
 * Идея (single source of truth + automatic propagation):
 *   canonical token source (registry / :root definitions)
 *     → materialize() наполняет baseline-модель
 *     → editor change вызывает set()/reset()
 *     → render() перегенерирует ОДИН авторитетный <style id="ds-token-layer">
 *     → все потребители var(--token) обновляются автоматически
 *
 * Почему это чинит рассинхрон:
 *   Слой добавляется последним в <head>, использует те же селекторы
 *   (:root / [data-theme="dark"]) и потому выигрывает каскад у статических
 *   стилей. В нём объявлены ВСЕ токены из canonical-модели — включая те,
 *   которых нет в вручную поддерживаемых CSS-файлах. Значит var(--token)
 *   больше не бывает "not defined" на странице редактора.
 *
 * Слой общий: работает для core colors, semantic colors, typography и любых
 * будущих групп — модель не знает семантики токена, только имя/значение/режим.
 */
(function () {
  'use strict';

  const STYLE_ID = 'ds-token-layer';

  // baseline = canonical-значения (из registry/:root); overrides = живые правки.
  const baseline = { light: new Map(), dark: new Map() };
  const overrides = { light: new Map(), dark: new Map() };

  let styleEl = null;

  function normalizeMode(mode) {
    return mode === 'dark' ? 'dark' : 'light';
  }

  function isEmptyValue(value) {
    return value == null || value === '' || value === '—';
  }

  function ensureStyleEl() {
    if (!styleEl) {
      styleEl = document.getElementById(STYLE_ID) || document.createElement('style');
      styleEl.id = STYLE_ID;
    }
    // Держим слой последним в <head>, чтобы он выигрывал каскад у link-стилей.
    if (styleEl.parentNode !== document.head || document.head.lastChild !== styleEl) {
      document.head.appendChild(styleEl);
    }
    return styleEl;
  }

  function effective(mode) {
    const map = new Map(baseline[mode]);
    overrides[mode].forEach((value, name) => map.set(name, value));
    return map;
  }

  function renderBlock(selector, map) {
    if (!map.size) return '';
    const decls = [...map.entries()]
      .map(([name, value]) => `  ${name}: ${value};`)
      .join('\n');
    return `${selector} {\n${decls}\n}`;
  }

  function render() {
    const el = ensureStyleEl();
    const light = renderBlock(':root', effective('light'));
    const dark = renderBlock('[data-theme="dark"]', effective('dark'));
    el.textContent = [light, dark].filter(Boolean).join('\n\n');
  }

  const DSTokenStore = {
    /**
     * Наполнить baseline canonical-значениями.
     * entries: Array<{ name, value, mode? }>  (mode по умолчанию 'light')
     */
    materialize(entries) {
      (entries || []).forEach((entry) => {
        if (!entry || !entry.name || isEmptyValue(entry.value)) return;
        baseline[normalizeMode(entry.mode)].set(entry.name, String(entry.value).trim());
      });
      render();
      return this;
    },

    /** Живая правка одного токена. Пустое значение снимает override. */
    set(name, value, mode) {
      if (!name) return this;
      const m = normalizeMode(mode);
      if (isEmptyValue(value)) overrides[m].delete(name);
      else overrides[m].set(name, String(value).trim());
      render();
      return this;
    },

    /** Откат одного токена к canonical baseline. */
    reset(name, mode) {
      overrides[normalizeMode(mode)].delete(name);
      render();
      return this;
    },

    /** Откат всех живых правок к canonical baseline. */
    resetAll() {
      overrides.light.clear();
      overrides.dark.clear();
      render();
      return this;
    },

    /** Текущее эффективное значение (override → baseline). */
    get(name, mode) {
      const m = normalizeMode(mode);
      if (overrides[m].has(name)) return overrides[m].get(name);
      if (baseline[m].has(name)) return baseline[m].get(name);
      return '';
    },

    /** Есть ли живая (несохранённая) правка для токена. */
    isModified(name, mode) {
      return overrides[normalizeMode(mode)].has(name);
    },
  };

  window.DSTokenStore = DSTokenStore;
})();
