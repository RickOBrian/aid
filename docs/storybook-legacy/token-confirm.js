/**
 * DSTokenConfirm — общий destructive-confirm / dependency flow для token editor.
 *
 * Один компонент модалки для безопасного удаления (и любого другого
 * необратимого действия). Ничего не знает о конкретной token family —
 * вызывающий редактор (colors-editor.js, typography-editor.js, любой будущий
 * *-editor.js) сам считает зависимости и передаёт их в конфиг.
 *
 * Два состояния (определяются полем `blocked`):
 *   • blocked=false → запись не используется: показываем confirm-шаг с
 *     destructive-кнопкой. Ни одного удаления в один клик без подтверждения.
 *   • blocked=true  → запись используется: показываем зависимости и НЕ даём
 *     destructive-действие. Только «Понятно» (закрыть). Зависимости не
 *     скрываются, авто-reassign не делается.
 *
 * Контракт:
 *   window.DSTokenConfirm.open({
 *     title,
 *     message,                    // основная строка
 *     confirmLabel,               // подпись destructive-кнопки (default 'Удалить')
 *     blocked,                    // bool — блокирующее состояние
 *     dependencies: [             // опц. список групп зависимостей
 *       { label, items: [string | { primary, meta? }], detailed?: bool }
 *     ],
 *     triggerEl,                  // куда вернуть фокус после закрытия
 *     onConfirm() -> Promise<{ ok:true } | { ok:false, error }>
 *   })
 *
 * Использует те же .token-modal* классы, что и DSTokenCreate, плюс
 * .token-modal--danger / .token-modal__deps для destructive-состояния.
 */
(function () {
  'use strict';

  let backdropEl = null;
  let modalEl = null;
  let activeConfig = null;
  let lastFocusedEl = null;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function ensureDom() {
    if (backdropEl) return;

    backdropEl = document.createElement('div');
    backdropEl.className = 'token-modal-backdrop';
    backdropEl.hidden = true;

    modalEl = document.createElement('div');
    modalEl.className = 'token-modal token-modal--danger';
    modalEl.setAttribute('role', 'dialog');
    modalEl.setAttribute('aria-modal', 'true');
    modalEl.setAttribute('aria-labelledby', 'token-confirm-title');

    backdropEl.appendChild(modalEl);
    document.body.appendChild(backdropEl);

    backdropEl.addEventListener('mousedown', (event) => {
      if (event.target === backdropEl) close();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !backdropEl.hidden) close();
    });
  }

  function renderDepItem(item) {
    if (item && typeof item === 'object' && item.primary) {
      const meta = item.meta
        ? `<span class="token-modal__dep-meta">${escapeHtml(item.meta)}</span>`
        : '';
      return `<li class="token-modal__dep-item"><code>${escapeHtml(item.primary)}</code>${meta}</li>`;
    }
    return `<li><code>${escapeHtml(String(item))}</code></li>`;
  }

  function renderDependencies(dependencies) {
    if (!dependencies || !dependencies.length) return '';
    const blocks = dependencies
      .filter((group) => group && group.items && group.items.length)
      .map((group) => {
        const detailed =
          group.detailed ||
          group.items.some((item) => item && typeof item === 'object' && item.primary);
        const listClass = detailed
          ? 'token-modal__dep-list token-modal__dep-list--detailed'
          : 'token-modal__dep-list';
        return `
        <div class="token-modal__dep-group">
          <p class="token-modal__dep-label">${escapeHtml(group.label)}</p>
          <ul class="${listClass}">
            ${group.items.map((item) => renderDepItem(item)).join('')}
          </ul>
        </div>`;
      })
      .join('');
    if (!blocks) return '';
    return `<div class="token-modal__deps">${blocks}</div>`;
  }

  function render(config) {
    const footer = config.blocked
      ? `<button type="button" class="storybook-btn storybook-btn--secondary" data-action="close">Понятно</button>`
      : `<button type="button" class="storybook-btn storybook-btn--secondary" data-action="cancel">Отмена</button>
         <button type="button" class="storybook-btn storybook-btn--danger" data-action="confirm">${escapeHtml(config.confirmLabel || 'Удалить')}</button>`;

    modalEl.innerHTML = `
      <div class="token-modal__header">
        <h2 class="token-modal__title" id="token-confirm-title">${escapeHtml(config.title)}</h2>
        <button type="button" class="token-modal__close" aria-label="Закрыть">&times;</button>
      </div>
      ${config.message ? `<p class="token-modal__description">${escapeHtml(config.message)}</p>` : ''}
      ${renderDependencies(config.dependencies)}
      <p class="token-modal__error token-modal__error--form" hidden></p>
      <div class="token-modal__footer">
        ${footer}
      </div>`;

    modalEl.querySelector('.token-modal__close').addEventListener('click', close);
    modalEl.querySelector('[data-action="close"]')?.addEventListener('click', close);
    modalEl.querySelector('[data-action="cancel"]')?.addEventListener('click', close);
    modalEl.querySelector('[data-action="confirm"]')?.addEventListener('click', handleConfirm);
  }

  function setFormError(message) {
    const errEl = modalEl.querySelector('.token-modal__error--form');
    if (!errEl) return;
    if (message) {
      errEl.textContent = message;
      errEl.hidden = false;
    } else {
      errEl.textContent = '';
      errEl.hidden = true;
    }
  }

  async function handleConfirm() {
    const confirmBtn = modalEl.querySelector('[data-action="confirm"]');
    const cancelBtn = modalEl.querySelector('[data-action="cancel"]');
    setFormError('');

    if (typeof activeConfig.onConfirm !== 'function') {
      close();
      return;
    }

    confirmBtn.disabled = true;
    if (cancelBtn) cancelBtn.disabled = true;
    const originalLabel = confirmBtn.textContent;
    confirmBtn.textContent = 'Удаление…';

    try {
      const result = await activeConfig.onConfirm();
      if (result && result.ok) {
        close();
        return;
      }
      setFormError((result && result.error) || 'Не удалось удалить');
    } catch (err) {
      setFormError(err.message || 'Не удалось удалить');
    } finally {
      confirmBtn.disabled = false;
      if (cancelBtn) cancelBtn.disabled = false;
      confirmBtn.textContent = originalLabel;
    }
  }

  function open(config) {
    ensureDom();
    activeConfig = config;
    lastFocusedEl = config.triggerEl || document.activeElement;

    render(config);
    backdropEl.hidden = false;
    document.body.classList.add('token-modal-open');

    // Focus the least-destructive action first (Close / Cancel), never the
    // destructive button — avoids an accidental Enter-triggered delete.
    const safeBtn = modalEl.querySelector('[data-action="close"], [data-action="cancel"]');
    safeBtn?.focus();
  }

  function close() {
    if (!backdropEl || backdropEl.hidden) return;
    backdropEl.hidden = true;
    document.body.classList.remove('token-modal-open');
    activeConfig = null;
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') lastFocusedEl.focus();
    lastFocusedEl = null;
  }

  window.DSTokenConfirm = { open, close };
})();
