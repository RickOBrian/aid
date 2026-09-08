/**
 * DSTokenCreate — общий "Add token / Add style" flow для token editor.
 *
 * Один компонент модалки, управляемый декларативным конфигом полей.
 * Ничего не знает о конкретной token family — конфиг (набор полей,
 * валидация, submit) собирает вызывающий редактор (colors-editor.js,
 * typography-editor.js, и любой будущий *-editor.js).
 *
 * Контракт:
 *   window.DSTokenCreate.open({
 *     title, description,
 *     fields: [{ id, label, type: 'text'|'select', options, placeholder,
 *                 hint, required, showIf(values), validate(value, values) }],
 *     submitLabel,
 *     triggerEl,           // элемент, куда вернуть фокус после закрытия
 *     onSubmit(values) -> Promise<{ ok:true } | { ok:false, error, fieldErrors }>
 *   })
 *
 * Это НЕ заменяет существующий inline edit flow (blur-commit в таблицах) —
 * создание нового токена идёт отдельным, явным путём: confirm → onSubmit
 * пишет в canonical source → редактор сам материализует результат и
 * перерисовывает свою секцию (без reload).
 */
(function () {
  'use strict';

  let backdropEl = null;
  let modalEl = null;
  let formEl = null;
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
    modalEl.className = 'token-modal';
    modalEl.setAttribute('role', 'dialog');
    modalEl.setAttribute('aria-modal', 'true');
    modalEl.setAttribute('aria-labelledby', 'token-modal-title');

    backdropEl.appendChild(modalEl);
    document.body.appendChild(backdropEl);

    backdropEl.addEventListener('mousedown', (event) => {
      if (event.target === backdropEl) close();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !backdropEl.hidden) close();
    });
  }

  function fieldValue(field) {
    const input = formEl.querySelector(`[name="${CSS.escape(field.id)}"]`);
    if (!input) return '';
    return input.value;
  }

  function collectValues(fields) {
    const values = {};
    fields.forEach((field) => {
      values[field.id] = fieldValue(field).trim();
    });
    return values;
  }

  function isFieldVisible(field, values) {
    return typeof field.showIf === 'function' ? Boolean(field.showIf(values)) : true;
  }

  function setFieldError(fieldId, message) {
    const wrap = formEl.querySelector(`[data-field="${CSS.escape(fieldId)}"]`);
    if (!wrap) return;
    const errEl = wrap.querySelector('.token-modal__error');
    if (!errEl) return;
    if (message) {
      errEl.textContent = message;
      errEl.hidden = false;
      wrap.classList.add('is-invalid');
    } else {
      errEl.textContent = '';
      errEl.hidden = true;
      wrap.classList.remove('is-invalid');
    }
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

  function refreshVisibility() {
    const values = collectValues(activeConfig.fields);
    activeConfig.fields.forEach((field) => {
      const wrap = formEl.querySelector(`[data-field="${CSS.escape(field.id)}"]`);
      if (!wrap) return;
      const visible = isFieldVisible(field, values);
      wrap.hidden = !visible;
      if (!visible) setFieldError(field.id, '');
    });
  }

  function renderField(field) {
    const inputId = `token-modal-field-${field.id}`;
    const requiredAttr = field.required ? 'required' : '';
    let controlHtml = '';

    if (field.type === 'select') {
      const options = (field.options || [])
        .map(
          (opt) =>
            `<option value="${escapeHtml(opt.value)}"${opt.value === field.value ? ' selected' : ''}>${escapeHtml(opt.label)}</option>`
        )
        .join('');
      controlHtml = `
        <select id="${inputId}" name="${escapeHtml(field.id)}" class="token-modal__select" ${requiredAttr}>
          ${options}
        </select>`;
    } else {
      controlHtml = `
        <input id="${inputId}" name="${escapeHtml(field.id)}" type="text" class="token-modal__input"
               value="${escapeHtml(field.value || '')}"
               placeholder="${escapeHtml(field.placeholder || '')}" ${requiredAttr}>`;
    }

    return `
      <div class="token-modal__field" data-field="${escapeHtml(field.id)}">
        <label class="token-modal__label" for="${inputId}">${escapeHtml(field.label)}${field.required ? ' *' : ''}</label>
        ${controlHtml}
        ${field.hint ? `<p class="token-modal__hint">${escapeHtml(field.hint)}</p>` : ''}
        <p class="token-modal__error" hidden></p>
      </div>`;
  }

  // Optional references block — used by the rename flow to surface every
  // dependent reference (semantic→core mappings, usedIn consumers) that the
  // rename will cascade to. Purely informational; does not block submit.
  function renderReferences(references) {
    if (!references || !references.length) return '';
    const blocks = references
      .filter((group) => group && group.items && group.items.length)
      .map(
        (group) => `
        <div class="token-modal__dep-group">
          <p class="token-modal__dep-label">${escapeHtml(group.label)}</p>
          <ul class="token-modal__dep-list">
            ${group.items.map((item) => `<li><code>${escapeHtml(item)}</code></li>`).join('')}
          </ul>
        </div>`
      )
      .join('');
    if (!blocks) return '';
    return `<div class="token-modal__deps token-modal__deps--info">${blocks}</div>`;
  }

  function render(config) {
    modalEl.innerHTML = `
      <div class="token-modal__header">
        <h2 class="token-modal__title" id="token-modal-title">${escapeHtml(config.title)}</h2>
        <button type="button" class="token-modal__close" aria-label="Закрыть">&times;</button>
      </div>
      ${config.description ? `<p class="token-modal__description">${escapeHtml(config.description)}</p>` : ''}
      ${renderReferences(config.references)}
      <form class="token-modal__form" novalidate>
        ${config.fields.map(renderField).join('')}
        <p class="token-modal__error token-modal__error--form" hidden></p>
      </form>
      <div class="token-modal__footer">
        <button type="button" class="storybook-btn storybook-btn--secondary" data-action="cancel">Отмена</button>
        <button type="button" class="storybook-btn storybook-btn--primary" data-action="submit">${escapeHtml(config.submitLabel || 'Создать')}</button>
      </div>`;

    formEl = modalEl.querySelector('.token-modal__form');

    formEl.addEventListener('input', refreshVisibility);
    formEl.addEventListener('change', refreshVisibility);

    modalEl.querySelector('.token-modal__close').addEventListener('click', close);
    modalEl.querySelector('[data-action="cancel"]').addEventListener('click', close);
    modalEl.querySelector('[data-action="submit"]').addEventListener('click', handleSubmit);

    refreshVisibility();
  }

  async function handleSubmit() {
    const submitBtn = modalEl.querySelector('[data-action="submit"]');
    const cancelBtn = modalEl.querySelector('[data-action="cancel"]');
    setFormError('');

    const values = collectValues(activeConfig.fields);
    let firstInvalidId = null;

    activeConfig.fields.forEach((field) => {
      if (!isFieldVisible(field, values)) return;

      let error = null;
      if (field.required && !values[field.id]) {
        error = 'Обязательное поле';
      } else if (typeof field.validate === 'function') {
        error = field.validate(values[field.id], values) || null;
      }

      setFieldError(field.id, error);
      if (error && !firstInvalidId) firstInvalidId = field.id;
    });

    if (firstInvalidId) {
      formEl.querySelector(`[name="${CSS.escape(firstInvalidId)}"]`)?.focus();
      return;
    }

    submitBtn.disabled = true;
    cancelBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = activeConfig.submittingLabel || 'Создание…';

    try {
      const result = await activeConfig.onSubmit(values);
      if (result && result.ok) {
        close();
        return;
      }

      setFormError((result && result.error) || activeConfig.errorLabel || 'Не удалось создать токен');
      if (result && result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([id, msg]) => setFieldError(id, msg));
      }
    } catch (err) {
      setFormError(err.message || activeConfig.errorLabel || 'Не удалось создать токен');
    } finally {
      submitBtn.disabled = false;
      cancelBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  }

  function open(config) {
    ensureDom();
    activeConfig = config;
    lastFocusedEl = config.triggerEl || document.activeElement;

    render(config);
    backdropEl.hidden = false;
    document.body.classList.add('token-modal-open');

    const firstField = formEl.querySelector('input, select');
    firstField?.focus();
  }

  function close() {
    if (!backdropEl || backdropEl.hidden) return;
    backdropEl.hidden = true;
    document.body.classList.remove('token-modal-open');
    activeConfig = null;
    formEl = null;
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') lastFocusedEl.focus();
    lastFocusedEl = null;
  }

  window.DSTokenCreate = { open, close };
})();
