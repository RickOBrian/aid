/* ============================================================
   Spec Editor — общий editable framework для component spec pages.
   Слой поверх Spec Inspector (spec-inspector.js): превращает записи
   DS_COMPONENT_SPEC с явным edit-биндингом в редактируемые поля.

   Editable model
   --------------
   Запись аспекта становится редактируемой ТОЛЬКО если несёт биндинг
   на каноническую CSS-декларацию компонента:

     edit: {
       file: 'docs/assets/style.css',  // канонический stylesheet (repo-relative)
       selector: '.btn-icon:hover',    // точный селектор правила
       prop: 'padding',                // для direct value fields (или props: [...])
       roles: ['label', 'meta'],       // ограничение семейств для typography role
     }

   Типы полей (field typing model) — решается автоматически:
   - token  — запись с entry.token + edit             → typed dropdown
   - role   — typography-запись (tokens[]) + edit     → dropdown ролей
   - value  — entry.value + hardcoded + edit          → inline input
   - derived (read-only) — всё остальное:
       * записи без edit-биндинга (нет канонического источника);
       * записи частей с nested-компонентом (их internals — scope их спеки);
       * захардкоженные ЦВЕТА (редактировать сырой hex запрещено
         no-hardcode-color-protocol — сначала токенизировать);
       * вычисляемые значения (hit area).

   Matching rules (field → token family)
   -------------------------------------
   Семейство выводится из текущего токена поля (classifyToken), dropdown
   показывает только совместимый набор из живого каталога токенов:
   - bg-* / text-* / icon-* / line-*  → только тот же color-префикс
     (semantic color layer; core-* токены не классифицируются ни в одно
     семейство и в component-полях недоступны в принципе)
   - inset-{category}-{axis}-*        → только тот же category+axis
   - gap-*                            → gap-*
   - radius-*                         → radius-*
   - typography role                  → роли, у которых существуют все
     суффиксы поля (size/lh/weight…), с фильтром edit.roles
   Каталог собирается из :root/[data-theme]-правил подключённых
   stylesheet'ов — без хардкода списков, масштабируется на новые токены.

   Propagation model
   -----------------
   Изменение применяется в CSSOM того же правила, из которого значение
   читается (live: превью, анатомия, hit area, резолвнутые значения
   обновляются сразу), стейджится в save bar и по Apply & Save уходит
   в save-tokens.js (канал componentEdits) — сервер переписывает ту же
   каноническую декларацию на диске.
   ============================================================ */
(function () {
  'use strict';

  const inspector = window.DSSpecInspector;
  const spec = window.DS_COMPONENT_SPEC;
  const mount = document.getElementById('spec-inspector');
  if (!inspector || !spec || !mount) return;

  const parts = spec.parts || [];
  const aspects = spec.aspects || {};

  /* ---------- helpers ---------- */

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escRe(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function resolveToken(token) {
    return getComputedStyle(document.documentElement).getPropertyValue('--' + token).trim();
  }

  function isColorValue(value) {
    return /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i.test(String(value));
  }

  function partIsNested(partId) {
    const part = parts.find((p) => p.id === partId);
    return !!(part && part.nested);
  }

  /* ---------- token catalog (из живых stylesheet'ов) ---------- */

  function collectTokenCatalog() {
    const names = new Set();
    for (const sheet of document.styleSheets) {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch (_) {
        continue; // cross-origin (fonts)
      }
      for (const rule of rules) {
        if (!rule.selectorText) continue;
        const sel = rule.selectorText;
        if (!/:root|\[data-theme/.test(sel)) continue;
        for (const prop of rule.style) {
          if (prop.startsWith('--')) names.add(prop.slice(2));
        }
      }
    }
    return names;
  }

  const catalog = collectTokenCatalog();

  const COLOR_PREFIXES = ['bg', 'text', 'icon', 'line'];
  const TYPE_ROLE_RE = /^(label|body|heading|meta)-([a-z0-9]+)-size$/;

  // Центральная классификация token family. core-* сюда сознательно не
  // попадает: смешение семейств (semantic-поле → core-токен) исключено
  // структурно, а не проверкой в момент выбора.
  function classifyToken(token) {
    const seg = token.split('-')[0];
    if (COLOR_PREFIXES.includes(seg)) return 'color-' + seg;
    if (/^gap-/.test(token)) return 'gap';
    const inset = token.match(/^(inset-[a-z]+-[hv])-/);
    if (inset) return inset[1];
    if (/^radius-/.test(token)) return 'radius';
    return null;
  }

  function familyTokens(family) {
    const out = [];
    catalog.forEach((name) => {
      if (classifyToken(name) === family) out.push(name);
    });
    return out.sort();
  }

  function typographyRoles() {
    const roles = new Set();
    catalog.forEach((name) => {
      const m = name.match(TYPE_ROLE_RE);
      if (m) roles.add(`${m[1]}-${m[2]}`);
    });
    return [...roles];
  }

  // Роль поля: общий префикс его токенов (label-m-size → label-m).
  function roleOf(tokens) {
    const m = tokens[0] && tokens[0].match(/^((label|body|heading|meta)-[a-z0-9]+)-/);
    return m ? m[1] : null;
  }

  function roleSuffixes(entry, role) {
    return entry.tokens.map((t) => t.slice(role.length + 1));
  }

  function compatibleRoles(entry, binding) {
    const current = roleOf(entry.tokens);
    if (!current) return [];
    const suffixes = roleSuffixes(entry, current);
    const allowedPrefixes = binding.roles || [current.split('-')[0]];
    return typographyRoles()
      .filter((role) => allowedPrefixes.includes(role.split('-')[0]))
      .filter((role) => suffixes.every((s) => catalog.has(`${role}-${s}`)))
      .sort();
  }

  /* ---------- field model ---------- */

  function fieldKind(entry) {
    if (!entry.edit) return null;
    if (entry.part && partIsNested(entry.part)) return null;
    if (entry.tokens && entry.tokens.length) return 'role';
    if (entry.token) {
      return classifyToken(entry.token) ? 'token' : null;
    }
    if (entry.value != null && entry.hardcoded) {
      if (isColorValue(entry.value)) return null; // цвет → только через токен
      return 'value';
    }
    return null;
  }

  /* ---------- CSSOM: поиск канонического правила и live-применение ---------- */

  function normalizeSelector(sel) {
    return String(sel).replace(/\s+/g, ' ').trim();
  }

  function findRules(binding) {
    const found = [];
    const wanted = normalizeSelector(binding.selector);
    for (const sheet of document.styleSheets) {
      if (!sheet.href || !sheet.href.endsWith('/' + binding.file)) continue;
      let rules;
      try {
        rules = sheet.cssRules;
      } catch (_) {
        continue;
      }
      for (const rule of rules) {
        if (rule.selectorText && normalizeSelector(rule.selectorText) === wanted) {
          found.push(rule);
        }
      }
    }
    return found;
  }

  function swapTokenInRules(rules, prevToken, nextToken) {
    const re = new RegExp(`var\\(\\s*--${escRe(prevToken)}(\\s*[,)])`, 'g');
    rules.forEach((rule) => {
      rule.style.cssText = rule.style.cssText.replace(re, `var(--${nextToken}$1`);
    });
  }

  function swapValueInRules(rules, props, prevValue, nextValue) {
    rules.forEach((rule) => {
      props.forEach((prop) => {
        const cur = rule.style.getPropertyValue(prop);
        if (!cur) return;
        const next = cur.replace(prevValue, nextValue);
        if (next !== cur) {
          rule.style.setProperty(prop, next, rule.style.getPropertyPriority(prop));
        }
      });
    });
  }

  /* ---------- staging + save bar ---------- */

  const fields = new Map(); // id → field
  const staged = new Map(); // id → field (current !== baseline)

  function ensureSaveBar() {
    let bar = document.getElementById('spec-save-bar');
    if (bar) return bar;
    bar = document.createElement('div');
    bar.className = 'storybook-save-bar';
    bar.id = 'spec-save-bar';
    bar.setAttribute('aria-live', 'polite');
    bar.innerHTML = `
      <span class="storybook-save-bar__count" id="spec-save-count"></span>
      <span class="storybook-status" id="spec-save-status"></span>
      <button type="button" class="storybook-btn storybook-btn--secondary" id="spec-cancel-btn">Cancel</button>
      <button type="button" class="storybook-btn storybook-btn--primary" id="spec-save-btn">Apply &amp; Save</button>`;
    document.body.appendChild(bar);
    bar.querySelector('#spec-cancel-btn').addEventListener('click', revertAll);
    bar.querySelector('#spec-save-btn').addEventListener('click', saveAll);
    return bar;
  }

  function setStatus(text, isError) {
    const el = document.getElementById('spec-save-status');
    if (!el) return;
    el.textContent = text || '';
    el.classList.toggle('is-success', !isError && !!text);
  }

  function updateSaveBar() {
    const bar = ensureSaveBar();
    const count = staged.size;
    bar.classList.toggle('is-visible', count > 0);
    const countEl = document.getElementById('spec-save-count');
    if (countEl) countEl.textContent = count ? `${count} изменений` : '';
  }

  function stage(field) {
    if (field.current === field.baseline) staged.delete(field.id);
    else staged.set(field.id, field);
    updateSaveBar();
  }

  function revertAll() {
    [...staged.values()].forEach((field) => {
      field.setValue(field.baseline);
    });
    staged.clear();
    setStatus('');
    updateSaveBar();
    inspector.refresh();
  }

  function buildComponentEdits() {
    const edits = [];
    staged.forEach((field) => {
      const b = field.binding;
      if (field.kind === 'token') {
        edits.push({
          kind: 'token',
          file: b.file,
          selector: b.selector,
          prevToken: field.baseline,
          nextToken: field.current,
        });
      } else if (field.kind === 'value') {
        edits.push({
          kind: 'value',
          file: b.file,
          selector: b.selector,
          props: b.props || [b.prop],
          prev: field.baseline,
          next: field.current,
        });
      } else if (field.kind === 'role') {
        field.suffixes.forEach((suffix) => {
          edits.push({
            kind: 'token',
            file: b.file,
            selector: b.selector,
            prevToken: `${field.baseline}-${suffix}`,
            nextToken: `${field.current}-${suffix}`,
          });
        });
      }
    });
    return edits;
  }

  function getSaveEndpoints() {
    const urls = new Set();
    urls.add('/docs/tokens/save-tokens');
    urls.add(new URL('../tokens/save-tokens', window.location.href).href);
    urls.add(`http://${window.location.hostname}:3336/save-tokens`);
    return [...urls];
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
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (_) {
          throw new Error('Сервер не поддерживает сохранение. Запустите: node docs/tokens/save-tokens.js --serve');
        }
        if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
        return data;
      } catch (err) {
        if (err instanceof TypeError && /failed to fetch/i.test(String(err.message))) {
          lastNetworkError = err;
          continue;
        }
        throw err;
      }
    }
    throw lastNetworkError || new Error('Не удалось сохранить изменения');
  }

  async function saveAll() {
    if (!staged.size) return;
    const saveBtn = document.getElementById('spec-save-btn');
    saveBtn.disabled = true;
    setStatus('Сохраняю…');
    try {
      const data = await postSave({
        componentEdits: buildComponentEdits(),
        author: localStorage.getItem('ds-author') || 'sergej',
      });
      staged.forEach((field) => {
        field.baseline = field.current;
      });
      staged.clear();
      updateSaveBar();
      setStatus(`Сохранено (${(data.filesUpdated || []).length} файлов)`);
    } catch (err) {
      setStatus(String(err.message || err), true);
    } finally {
      saveBtn.disabled = false;
    }
  }

  /* ---------- dropdown (тот же interaction pattern, что token-select) ---------- */

  let activeSelect = null;

  function closeActiveSelect() {
    if (!activeSelect) return;
    const { trigger, panel } = activeSelect;
    trigger.setAttribute('aria-expanded', 'false');
    panel.remove();
    activeSelect = null;
  }

  function positionPanel(trigger, panel) {
    const rect = trigger.getBoundingClientRect();
    const maxH = 320;
    const below = window.innerHeight - rect.bottom;
    panel.style.position = 'fixed';
    panel.style.left = Math.min(rect.left, window.innerWidth - panel.offsetWidth - 12) + 'px';
    if (below < Math.min(maxH, panel.offsetHeight) + 12 && rect.top > below) {
      panel.style.top = '';
      panel.style.bottom = window.innerHeight - rect.top + 4 + 'px';
    } else {
      panel.style.bottom = '';
      panel.style.top = rect.bottom + 4 + 'px';
    }
    panel.style.maxHeight = maxH + 'px';
  }

  function optionPreview(field, option) {
    if (field.kind === 'token' && field.family.startsWith('color-')) {
      return `<span class="spec-swatch" style="background: var(--${esc(option)})"></span>`;
    }
    return '';
  }

  function optionMeta(field, option) {
    if (field.kind === 'role') {
      return `${resolveToken(option + '-size')} / ${resolveToken(option + '-lh')}`;
    }
    return resolveToken(option);
  }

  function openSelect(field, trigger) {
    closeActiveSelect();
    const options = field.options();
    const panel = document.createElement('div');
    panel.className = 'spec-select__panel';
    panel.setAttribute('role', 'listbox');
    panel.innerHTML = options
      .map((option) => {
        const selected = option === field.current;
        return `
          <button type="button" class="spec-select__option${selected ? ' is-selected' : ''}"
                  role="option" data-value="${esc(option)}" aria-selected="${selected}">
            ${optionPreview(field, option)}
            <span class="spec-select__option-name">${esc(option)}</span>
            <span class="spec-select__option-meta">${esc(optionMeta(field, option))}</span>
            ${selected ? '<span aria-hidden="true">✓</span>' : ''}
          </button>`;
      })
      .join('');
    document.body.appendChild(panel);
    positionPanel(trigger, panel);
    trigger.setAttribute('aria-expanded', 'true');
    activeSelect = { trigger, panel };

    panel.addEventListener('click', (event) => {
      event.stopPropagation();
      const option = event.target.closest('.spec-select__option');
      if (!option) return;
      closeActiveSelect();
      trigger.focus();
      commitField(field, option.dataset.value);
    });

    panel.addEventListener('keydown', (event) => {
      const opts = [...panel.querySelectorAll('.spec-select__option')];
      const idx = opts.indexOf(document.activeElement);
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        opts[Math.min(opts.length - 1, idx + 1)]?.focus({ preventScroll: true });
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        opts[Math.max(0, idx - 1)]?.focus({ preventScroll: true });
      } else if (event.key === 'Escape') {
        event.preventDefault();
        closeActiveSelect();
        trigger.focus();
      } else if (event.key === 'Tab') {
        closeActiveSelect();
      }
    });

    (panel.querySelector('.is-selected') || panel.querySelector('.spec-select__option'))?.focus({
      preventScroll: true,
    });
  }

  document.addEventListener('click', (event) => {
    if (event.target.closest('.spec-select__trigger')) return;
    if (event.target.closest('.spec-select__panel')) return;
    closeActiveSelect();
  });
  window.addEventListener(
    'scroll',
    () => {
      if (activeSelect) positionPanel(activeSelect.trigger, activeSelect.panel);
    },
    true
  );
  window.addEventListener('resize', () => {
    if (activeSelect) positionPanel(activeSelect.trigger, activeSelect.panel);
  });

  /* ---------- commit + row UI update ---------- */

  function commitField(field, next) {
    if (!next || next === field.current) return;
    field.setValue(next);
    stage(field);
    setStatus('');
    inspector.refresh();
  }

  function updateTokenRowUi(field) {
    const row = field.rowEl;
    const nameEl = row.querySelector('.spec-select__trigger .token-ref');
    if (nameEl) nameEl.textContent = field.kind === 'role' ? field.current : field.current;
    const swatch = row.querySelector('.spec-measure__token .spec-swatch, .spec-select__trigger .spec-swatch');
    if (swatch && field.kind === 'token') swatch.style.background = `var(--${field.current})`;
    if (field.kind === 'token') {
      const valueEl = row.querySelector('[data-resolve]');
      if (valueEl) valueEl.dataset.resolve = field.current;
    }
    if (field.kind === 'role') updateRoleBlockUi(field);
    row.classList.toggle('is-modified', field.current !== field.baseline);
  }

  function updateRoleBlockUi(field) {
    const block = field.rowEl;
    const sample = block.querySelector('.spec-type__sample');
    if (sample) {
      const decls = [];
      field.suffixes.forEach((suffix) => {
        const token = `${field.current}-${suffix}`;
        if (/^size$/.test(suffix)) decls.push(`font-size: var(--${token})`);
        else if (/^lh$/.test(suffix)) decls.push(`line-height: var(--${token})`);
        else if (/^weight(-strong)?$/.test(suffix)) decls.push(`font-weight: var(--${token})`);
      });
      sample.style.cssText = decls.join('; ');
    }
    block.querySelectorAll('.spec-type__token').forEach((chip, i) => {
      const suffix = field.suffixes[i];
      if (!suffix) return;
      const token = `${field.current}-${suffix}`;
      const code = chip.querySelector('.token-ref');
      const value = chip.querySelector('[data-resolve]');
      if (code) code.textContent = token;
      if (value) value.dataset.resolve = token;
    });
    const roleLabel = block.querySelector('.spec-type__role strong');
    if (roleLabel) roleLabel.textContent = field.current;
  }

  /* ---------- field wiring ---------- */

  function makeTokenTrigger(row, field) {
    const cell = row.querySelector('.spec-measure__token');
    if (!cell) return null;
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'spec-select__trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.title = `Совместимое семейство: ${field.family}`;
    while (cell.firstChild) trigger.appendChild(cell.firstChild);
    trigger.insertAdjacentHTML('beforeend', '<span class="spec-select__chevron" aria-hidden="true">▾</span>');
    cell.appendChild(trigger);
    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      if (activeSelect && activeSelect.trigger === trigger) closeActiveSelect();
      else openSelect(field, trigger);
    });
    return trigger;
  }

  function makeRoleTrigger(block, field) {
    const roleLine = block.querySelector('.spec-type__role');
    if (!roleLine) return null;
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'spec-select__trigger spec-select__trigger--role';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML = 'сменить роль <span class="spec-select__chevron" aria-hidden="true">▾</span>';
    roleLine.appendChild(trigger);
    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      if (activeSelect && activeSelect.trigger === trigger) closeActiveSelect();
      else openSelect(field, trigger);
    });
    return trigger;
  }

  const VALUE_RE = /^-?\d*\.?\d+(px|em|rem|%)?(\s+-?\d*\.?\d+(px|em|rem|%)?)*$/;

  function makeValueEditor(row, field) {
    const chip = row.querySelector('.spec-hardcode');
    if (!chip) return;
    chip.classList.add('spec-hardcode--editable');
    chip.setAttribute('role', 'button');
    chip.setAttribute('tabindex', '0');
    chip.title = 'Редактировать значение';

    function startEdit() {
      const input = document.createElement('input');
      input.className = 'spec-edit-input';
      input.value = field.current;
      chip.replaceWith(input);
      input.focus();
      input.select();

      let done = false;
      function finish(commit) {
        if (done) return;
        done = true;
        const next = input.value.trim();
        input.replaceWith(chip);
        if (!commit || next === field.current) return;
        if (!VALUE_RE.test(next)) {
          setStatus(`Некорректное значение: «${next}»`, true);
          return;
        }
        commitField(field, next);
        chip.textContent = field.current;
      }

      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') finish(true);
        else if (event.key === 'Escape') finish(false);
      });
      input.addEventListener('blur', () => finish(true));
    }

    chip.addEventListener('click', startEdit);
    chip.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        startEdit();
      }
    });

    field.onSet = () => {
      chip.textContent = field.current;
      row.classList.toggle('is-modified', field.current !== field.baseline);
    };
  }

  function buildField(entry) {
    const kind = fieldKind(entry);
    if (!kind) return null;

    const binding = entry.edit;
    const rules = findRules(binding);
    if (!rules.length) {
      console.warn(`spec-editor: правило не найдено — ${binding.file} :: ${binding.selector}`);
      return null;
    }

    const field = {
      id: entry.__id,
      kind,
      binding,
      rules,
      entry,
      rowEl: null,
      onSet: null,
    };

    if (kind === 'token') {
      field.family = binding.family || classifyToken(entry.token);
      field.baseline = entry.token;
      field.current = entry.token;
      field.options = () => familyTokens(field.family);
      field.setValue = (next) => {
        swapTokenInRules(field.rules, field.current, next);
        field.current = next;
        updateTokenRowUi(field);
      };
    } else if (kind === 'role') {
      const role = roleOf(entry.tokens);
      if (!role) return null;
      field.suffixes = roleSuffixes(entry, role);
      field.baseline = role;
      field.current = role;
      field.options = () => compatibleRoles(entry, binding);
      field.setValue = (next) => {
        field.suffixes.forEach((suffix) => {
          swapTokenInRules(field.rules, `${field.current}-${suffix}`, `${next}-${suffix}`);
        });
        field.current = next;
        updateTokenRowUi(field);
      };
    } else {
      field.baseline = String(entry.value);
      field.current = String(entry.value);
      field.props = binding.props || [binding.prop];
      field.setValue = (next) => {
        swapValueInRules(field.rules, field.props, field.current, next);
        field.current = next;
        if (field.onSet) field.onSet();
      };
    }

    return field;
  }

  function wireFields() {
    Object.values(aspects).forEach((entries) => {
      (entries || []).forEach((entry) => {
        [entry, ...(entry.extra || [])].forEach((item) => {
          const field = buildField(item);
          if (!field) return;
          const row = mount.querySelector(`[data-entry="${CSS.escape(item.__id)}"]`);
          if (!row) return;
          field.rowEl = row;
          fields.set(field.id, field);
          if (field.kind === 'token') makeTokenTrigger(row, field);
          else if (field.kind === 'role') makeRoleTrigger(row, field);
          else makeValueEditor(row, field);
        });
      });
    });
  }

  /* ---------- boot ---------- */

  wireFields();
  if (fields.size) {
    ensureSaveBar();
    const hint = document.createElement('p');
    hint.className = 'spec-editor-note';
    hint.textContent =
      'Страница редактируемая: токены меняются через typed dropdown (только совместимое семейство), захардкоженные значения — инлайн. Изменения применяются live и сохраняются в канонический CSS через Apply & Save.';
    mount.prepend(hint);
  }

  window.DSSpecEditor = { fields, staged };
})();
