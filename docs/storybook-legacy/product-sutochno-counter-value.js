/**
 * Sutochno CounterValue — live preview renderer for System Storybook.
 */
(function () {
  'use strict';

  const SIZES = [
    { id: 'medium', label: 'Medium' },
    { id: 'small', label: 'Small' },
  ];

  function formatValue(value, max) {
    if (typeof value === 'number' && typeof max === 'number' && value > max) {
      return `${max}+`;
    }
    return String(value ?? 1);
  }

  function createCounter(options) {
    const { size = 'medium', value = 1, max } = options;
    const el = document.createElement('span');
    el.className = ['scv', `scv--${size}`].join(' ');
    const valueEl = document.createElement('span');
    valueEl.className = 'scv__value';
    valueEl.textContent = formatValue(value, max);
    el.appendChild(valueEl);
    return el;
  }

  function renderSizes(container) {
    if (!container) return;
    container.innerHTML = SIZES.map((size) => `
      <div class="scv-preview-row">
        <div class="scv-preview-row__label">${size.label}</div>
        <span data-slot="size-${size.id}"></span>
      </div>
    `).join('');

    for (const size of SIZES) {
      const slot = container.querySelector(`[data-slot="size-${size.id}"]`);
      if (!slot) continue;
      slot.replaceWith(createCounter({ size: size.id, value: 1 }));
    }
  }

  function renderDigits(container) {
    if (!container) return;
    const cases = [
      { label: '1 digit', value: 1 },
      { label: '2 digits', value: 12 },
      { label: 'overflow (max 99)', value: 100, max: 99 },
    ];

    container.innerHTML = SIZES.map((size) => `
      <div class="scv-preview-card" data-card="${size.id}">
        <div class="scv-preview-card__title">${size.label}</div>
        <div class="scv-preview-grid" data-digits="${size.id}"></div>
      </div>
    `).join('');

    for (const size of SIZES) {
      const grid = container.querySelector(`[data-digits="${size.id}"]`);
      if (!grid) continue;
      for (const testCase of cases) {
        const wrap = document.createElement('div');
        wrap.style.display = 'flex';
        wrap.style.flexDirection = 'column';
        wrap.style.alignItems = 'center';
        wrap.style.gap = '8px';
        const label = document.createElement('div');
        label.style.fontSize = '12px';
        label.style.color = 'var(--text-secondary)';
        label.textContent = testCase.label;
        wrap.appendChild(label);
        wrap.appendChild(createCounter({
          size: size.id,
          value: testCase.value,
          max: testCase.max,
        }));
        grid.appendChild(wrap);
      }
    }
  }

  window.DSSutochnoCounterValue = {
    renderSizes,
    renderDigits,
    createCounter,
  };
})();
