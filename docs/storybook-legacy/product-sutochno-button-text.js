/**
 * Sutochno ButtonText — live preview renderer for System Storybook.
 */
(function () {
  'use strict';

  const VARIANTS = [
    { id: 'primary', label: 'Primary' },
    { id: 'secondary', label: 'Secondary' },
    { id: 'outline', label: 'Outline' },
    { id: 'tertiary', label: 'Tertiary' },
    { id: 'primary-inverse', label: 'Primary Inverse' },
    { id: 'primary-inverse-static', label: 'Primary Inverse Static' },
    { id: 'transparent', label: 'Transparent' },
  ];

  const SIZES = [
    { id: 'large', label: 'Large' },
    { id: 'medium', label: 'Medium' },
    { id: 'small', label: 'Small' },
    { id: 'tiny', label: 'Tiny' },
  ];

  const ICON_SVG = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 3v14M3 10h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  const CHEVRON_SVG = '<svg class="sbt__chevron" width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden="true"><path d="M1 1L6 6L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function createButton(options) {
    const {
      variant = 'primary',
      size = 'large',
      text = 'Button',
      icon = false,
      disabled = false,
      loading = false,
      pressed = false,
    } = options;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = ['sbt', `sbt--${variant}`, `sbt--${size}`, pressed ? 'sbt--force-pressed' : ''].filter(Boolean).join(' ');
    btn.disabled = disabled || loading;
    if (loading) btn.setAttribute('aria-busy', 'true');

    if (loading) {
      btn.innerHTML = '<span class="sbt__dots" aria-hidden="true"><span></span><span></span><span></span></span>';
      return btn;
    }

    if (icon && size !== 'tiny') {
      const iconEl = document.createElement('span');
      iconEl.className = 'sbt__icon';
      iconEl.innerHTML = ICON_SVG;
      btn.appendChild(iconEl);
    }

    const textEl = document.createElement('span');
    textEl.className = 'sbt__text';
    textEl.textContent = text;
    btn.appendChild(textEl);

    if (size === 'tiny') {
      btn.insertAdjacentHTML('beforeend', CHEVRON_SVG);
    }

    return btn;
  }

  function renderMatrix(container) {
    if (!container) return;
    container.innerHTML = VARIANTS.map((variant) => `
      <div class="sbt-preview-row">
        <div class="sbt-preview-row__label">${variant.label}</div>
        ${SIZES.map((size) => `<span data-slot="${variant.id}-${size.id}"></span>`).join('')}
      </div>
    `).join('');

    for (const variant of VARIANTS) {
      for (const size of SIZES) {
        const slot = container.querySelector(`[data-slot="${variant.id}-${size.id}"]`);
        if (!slot) continue;
        slot.replaceWith(createButton({
          variant: variant.id,
          size: size.id,
          icon: size.id !== 'tiny',
        }));
      }
    }
  }

  function renderStates(container) {
    if (!container) return;
    const stateCards = [
      { variant: 'primary', label: 'Primary', dark: false },
      { variant: 'secondary', label: 'Secondary', dark: false },
      { variant: 'transparent', label: 'Transparent', dark: false },
      { variant: 'primary-inverse', label: 'Primary Inverse', dark: true },
    ];

    container.innerHTML = stateCards.map((card) => `
      <div class="sbt-preview-states__card${card.dark ? ' sbt-preview-states__card--dark' : ''}" data-card="${card.variant}">
        <div class="sbt-preview-states__title">${card.label}</div>
        <div class="sbt-preview-grid" data-states="${card.variant}"></div>
      </div>
    `).join('');

    for (const card of stateCards) {
      const grid = container.querySelector(`[data-states="${card.variant}"]`);
      if (!grid) continue;
      [
        createButton({ variant: card.variant, size: 'large', text: 'Default', icon: true }),
        createButton({ variant: card.variant, size: 'large', text: 'Pressed', icon: true, pressed: true }),
        createButton({ variant: card.variant, size: 'large', text: 'Disabled', icon: true, disabled: true }),
        createButton({ variant: card.variant, size: 'large', loading: true }),
      ].forEach((btn) => grid.appendChild(btn));
    }
  }

  window.DSSutochnoButtonText = {
    renderMatrix,
    renderStates,
    createButton,
  };
})();
