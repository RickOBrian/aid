/**
 * Typography token editor — live preview + save
 */
(function () {
  'use strict';

  const TYPOGRAPHY_TOKEN_RE =
    /^--(?:font-[\w-]+|(?:heading|body|label|meta)-[a-z0-9]+-(?:size|lh|weight|tracking)|leading-[\w-]+|tracking-[\w-]+|text-[\w-]+-(?:size|lh|weight|tracking))$/;

  const COLOR_TOKEN_PREFIX_RE = /^--(?:text-(?!.*-(?:size|lh|weight|tracking)$)|icon-|bg-|line-|core-)/;

  function isColorValue(value) {
    const v = value.trim();
    if (!v) return false;
    if (/^#[0-9a-f]{3,8}$/i.test(v)) return true;
    if (/^rgba?\(/i.test(v)) return true;
    if (/^hsla?\(/i.test(v)) return true;
    if (/var\(--core-/i.test(v)) return true;
    if (/var\(--(?:text|icon|bg|line)-/i.test(v)) return true;
    return false;
  }

  function isTypographyToken(name, value = '') {
    if (COLOR_TOKEN_PREFIX_RE.test(name)) return false;
    if (!TYPOGRAPHY_TOKEN_RE.test(name)) return false;
    if (isColorValue(value)) return false;
    return true;
  }

  const SAMPLE_TEXT = 'Aid — быстрый рыжий лис';
  const SAMPLE_TEXT_MONO = 'const aid = "быстрый лис";';

  const TOKEN_GROUPS = [
    {
      id: 'fonts',
      label: 'Шрифты',
      match: (name) => name.startsWith('--font-'),
    },
    {
      id: 'headings',
      label: 'Заголовки',
      match: (name) => name.startsWith('--heading-'),
    },
    {
      id: 'lead',
      label: 'Лид',
      match: (name) => name.startsWith('--body-l-'),
    },
    {
      id: 'body',
      label: 'Основной текст',
      match: (name) => name.startsWith('--body-m-') || name.startsWith('--body-s-'),
    },
    {
      id: 'labels',
      label: 'Лейблы',
      match: (name) => name.startsWith('--label-'),
    },
    {
      id: 'meta',
      label: 'Мета',
      match: (name) => name.startsWith('--meta-'),
    },
    {
      id: 'spacing',
      label: 'Letter-spacing / Leading',
      match: (name) => name.startsWith('--leading-') || name.startsWith('--tracking-'),
    },
  ];

  const SIZE_ORDER = ['xl', 'l', 'm', 's', 'xs'];
  const PROP_ORDER = { size: 0, lh: 1, weight: 2, tracking: 3 };
  const ROLE_PROPS = new Set(['size', 'lh', 'weight', 'tracking']);

  function getRolePrefix(name) {
    const match = name.match(/^--(heading|body|label|meta)-([a-z0-9]+)-/);
    return match ? `--${match[1]}-${match[2]}` : null;
  }

  function sortRoleTokens(tokens) {
    return [...tokens].sort((a, b) => {
      const prop = (name, role) => name.slice(role.length + 1);
      const role = getRolePrefix(tokens[0].name);
      return (PROP_ORDER[prop(a.name, role)] ?? 99) - (PROP_ORDER[prop(b.name, role)] ?? 99);
    });
  }

  function compareRoles(a, b) {
    const key = (role) => {
      const match = role.match(/^--(heading|body|label|meta)-([a-z0-9]+)$/);
      if (!match) return [99, role];
      const idx = SIZE_ORDER.indexOf(match[2]);
      return [idx === -1 ? 99 : idx, role];
    };
    const [aIdx, aRole] = key(a);
    const [bIdx, bRole] = key(b);
    return aIdx - bIdx || aRole.localeCompare(bRole);
  }

  function clusterTokensInSection(tokens) {
    const byRole = new Map();
    const standalone = [];

    tokens.forEach((token) => {
      const role = getRolePrefix(token.name);
      const prop = role ? token.name.slice(role.length + 1) : '';
      if (role && ROLE_PROPS.has(prop)) {
        if (!byRole.has(role)) byRole.set(role, []);
        byRole.get(role).push(token);
      } else {
        standalone.push(token);
      }
    });

    const roleClusters = [...byRole.entries()]
      .map(([role, roleTokens]) => ({
        role,
        tokens: sortRoleTokens(roleTokens),
        kind: 'role',
      }))
      .sort((a, b) => compareRoles(a.role, b.role));

    const singleClusters = standalone
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((token) => ({
        role: token.name,
        tokens: [token],
        kind: 'single',
      }));

    return [...roleClusters, ...singleClusters];
  }

  function groupTokens(tokens) {
    const assigned = new Set();

    return TOKEN_GROUPS.map((group) => {
      const items = tokens.filter((token) => {
        if (assigned.has(token.name)) return false;
        return group.match(token.name);
      });

      items.forEach((token) => assigned.add(token.name));
      return { ...group, tokens: items };
    }).filter((group) => group.tokens.length > 0);
  }

  function previewStyleForRole(role) {
    return {
      fontFamily: "var(--font-body, 'Google Sans', system-ui, sans-serif)",
      fontSize: `var(${role}-size)`,
      lineHeight: `var(${role}-lh)`,
      fontWeight: `var(${role}-weight)`,
      letterSpacing: `var(${role}-tracking, normal)`,
      color: 'var(--text-primary)',
    };
  }

  function previewStyleForToken(token) {
    const base = {
      fontFamily: "var(--font-body, 'Google Sans', system-ui, sans-serif)",
      fontSize: 'var(--body-m-size)',
      lineHeight: 'var(--body-m-lh)',
      fontWeight: 'var(--body-m-weight)',
      letterSpacing: 'normal',
      color: 'var(--text-primary)',
    };

    if (token.name.startsWith('--font-')) {
      base.fontFamily = `var(${token.name})`;
      return base;
    }

    switch (token.category) {
      case 'font-size':
        base.fontSize = `var(${token.name})`;
        break;
      case 'line-height':
        base.lineHeight = `var(${token.name})`;
        break;
      case 'font-weight':
        base.fontWeight = `var(${token.name})`;
        break;
      case 'font-family':
        base.fontFamily = `var(${token.name})`;
        break;
      case 'letter-spacing':
        base.letterSpacing = `var(${token.name})`;
        break;
      default:
        base.fontSize = `var(${token.name})`;
    }

    return base;
  }

  function buildStyleAttr(styles) {
    return Object.entries(styles)
      .map(([key, value]) => `${camelToKebab(key)}:${value}`)
      .join(';');
  }

  function previewSampleText(name) {
    return name === '--font-mono' ? SAMPLE_TEXT_MONO : SAMPLE_TEXT;
  }

  function getClusterPreviewStyle(cluster) {
    return cluster.kind === 'role'
      ? previewStyleForRole(cluster.role)
      : previewStyleForToken(cluster.tokens[0]);
  }

  function updateClusterPreview(tbody, cluster) {
    const previewEl = tbody.querySelector(
      `tr[data-cluster="${CSS.escape(cluster.role)}"] .token-preview`
    );
    if (!previewEl) return;
    Object.assign(previewEl.style, getClusterPreviewStyle(cluster));
  }

  // ── Canonical source: docs/tokens/typography-tokens-registry.md ──────────
  //
  // The editor no longer discovers tokens by scanning whichever stylesheets
  // happen to be loaded on this page (fragile, implicit). It fetches the
  // registry — the same file save-tokens.js writes to and generates
  // storybook-typography-tokens.css from — so the table always reflects the
  // canonical set, including tokens created via the "+ Add style" flow.
  const REGISTRY_URL = '../tokens/typography-tokens-registry.md';

  function parseTypographyRegistryTable(md) {
    const rows = [];
    let inTable = false;

    for (const line of md.split('\n')) {
      if (!line.startsWith('|')) continue;
      if (line.includes('Token') && line.includes('Category')) {
        inTable = true;
        continue;
      }
      if (!inTable || /^[|\s\-:]+$/.test(line)) continue;

      const cells = line.split('|').map((c) => c.trim());
      if (cells.length < 5) continue;
      const name = cells[1].startsWith('--') ? cells[1] : `--${cells[1]}`;
      rows.push({ name, category: cells[2], value: cells[3], usedIn: cells[4] || '—' });
    }

    return rows;
  }

  async function fetchTypographyTokens() {
    const res = await fetch(`${REGISTRY_URL}?_=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('registry fetch failed');
    const md = await res.text();
    return parseTypographyRegistryTable(md).filter((t) => isTypographyToken(t.name, t.value));
  }

  function parseChangelogTable(md) {
    const lines = md.split('\n');
    const rows = [];
    let inTable = false;

    for (const line of lines) {
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

  async function loadChangelog() {
    const tbody = document.getElementById('changelog-tbody');
    if (!tbody) return;

    try {
      const res = await fetch(`../tokens/typography-tokens-changelog.md?_=${Date.now()}`, {
        cache: 'no-store',
      });
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

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
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
    const endpoints = getSaveEndpoints();
    let lastNetworkError;

    for (const url of endpoints) {
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

  function renderTokenRows(tokens, originals, modified, tbody, onInputChange) {
    const clusters = clusterTokensInSection(tokens);

    tbody.innerHTML = clusters
      .map((cluster) => {
        const preview = getClusterPreviewStyle(cluster);
        const styleAttr = buildStyleAttr(preview);
        const sample = previewSampleText(cluster.tokens[0].name);
        const rowspan = cluster.tokens.length;

        return cluster.tokens
          .map(
            (token, index) => `
        <tr data-cluster="${escapeHtml(cluster.role)}" data-token="${escapeHtml(token.name)}">
          <td><code class="token-name">${escapeHtml(token.name)}</code></td>
          <td><span class="token-category">${escapeHtml(token.category)}</span></td>
          <td><code class="token-value" data-token="${escapeHtml(token.name)}">${escapeHtml(token.value)}</code></td>
          <td>
            <div class="token-edit-cell">
              <input class="token-editor-input" type="text"
                     value="${escapeHtml(token.value)}"
                     data-token="${escapeHtml(token.name)}"
                     data-cluster="${escapeHtml(cluster.role)}"
                     aria-label="Edit ${escapeHtml(token.name)}">
              <button type="button" class="token-row-rename" title="Переименовать ${escapeHtml(token.name)}"
                      aria-label="Переименовать ${escapeHtml(token.name)}"
                      data-rename-token="${escapeHtml(token.name)}">✎</button>
              <button type="button" class="token-row-delete" title="Удалить ${escapeHtml(token.name)}"
                      aria-label="Удалить ${escapeHtml(token.name)}"
                      data-delete-token="${escapeHtml(token.name)}">&times;</button>
            </div>
          </td>
          ${
            index === 0
              ? `<td class="token-preview-cell" rowspan="${rowspan}">
            <span class="token-preview" style="${styleAttr}">${escapeHtml(sample)}</span>
          </td>`
              : ''
          }
        </tr>`
          )
          .join('');
      })
      .join('');

    // Typing only edits the input's own draft value (native browser behavior —
    // no listener needed). Commit (apply + preview + track) happens on blur only,
    // so partial/incomplete input never touches the CSS var or reflows the preview.
    tbody.querySelectorAll('.token-editor-input').forEach((input) => {
      input.addEventListener('blur', () => {
        const name = input.dataset.token;
        const clusterId = input.dataset.cluster;
        const orig = originals.get(name);
        const next = window.DSStorybook.normalizeTokenValue(input.value.trim(), orig);
        input.value = next;

        // Единый source of truth: правка идёт в DSTokenStore, который
        // перегенерирует авторитетный рантайм-слой (та же модель, что и у
        // цветов). Fallback на :root — только если стор недоступен.
        if (window.DSTokenStore) window.DSTokenStore.set(name, next, 'light');
        else document.documentElement.style.setProperty(name, next);

        const valueCell = tbody.querySelector(
          `code.token-value[data-token="${CSS.escape(name)}"]`
        );
        if (valueCell) valueCell.textContent = next;

        const cluster = clusters.find((item) => item.role === clusterId);
        if (cluster) updateClusterPreview(tbody, cluster);

        if (next === orig) {
          modified.delete(name);
          input.classList.remove('is-modified');
        } else {
          modified.set(name, { token: name, oldValue: orig, newValue: next });
          input.classList.add('is-modified');
        }

        onInputChange();
      });
    });

    bindTypographyDeleteControls(tbody);
  }

  // ── Delete flow: remove a typography token / style ────────────────────────
  //
  // Explicit per-row action with a mandatory confirm step (never one-click).
  // Before confirming, we check declared consumers (usedIn). If the token is
  // used we show a BLOCKING state with the dependency list and refuse to
  // delete silently. The server re-validates the same rule against the
  // canonical registry.

  function typographyConsumers(name) {
    const row = currentTokens.find((t) => t.name === name);
    const v = String((row && row.usedIn) || '').trim();
    if (!v || v === '—' || v === '(reserved)') return [];
    return v
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function buildDeleteTypographyConfig(name, triggerEl) {
    const consumers = typographyConsumers(name);

    if (consumers.length) {
      return {
        title: `Нельзя удалить ${name}`,
        message:
          'Токен используется — удаление заблокировано, чтобы не сломать зависимости. ' +
          'Сначала снимите использование, затем повторите.',
        blocked: true,
        dependencies: [{ label: 'Используется консьюмерами (usedIn):', items: consumers }],
        triggerEl,
      };
    }

    return {
      title: `Удалить ${name}?`,
      message:
        'Токен не числится используемым консьюмерами. Удаление необратимо. ' +
        'Для role-стиля удаляйте все 4 свойства (size / lh / weight / tracking), иначе стиль останется неполным.',
      confirmLabel: 'Удалить',
      blocked: false,
      triggerEl,
      onConfirm: async () => {
        const data = await postSave({
          deletes: [{ kind: 'typography-token', token: name }],
          author: localStorage.getItem('ds-author') || 'sergej',
        }).catch((err) => ({ __error: err.message }));

        if (data.__error) return { ok: false, error: data.__error };
        if (!data.ok) return { ok: false, error: data.error || 'Не удалось удалить' };
        await reloadTypographyAndRerender();
        return { ok: true };
      },
    };
  }

  function bindTypographyDeleteControls(scope) {
    scope.querySelectorAll('[data-delete-token]').forEach((btn) => {
      btn.addEventListener('click', () => {
        window.DSTokenConfirm.open(buildDeleteTypographyConfig(btn.dataset.deleteToken, btn));
      });
    });

    scope.querySelectorAll('[data-rename-token]').forEach((btn) => {
      btn.addEventListener('click', () => {
        window.DSTokenCreate.open(buildRenameTypographyConfig(btn.dataset.renameToken, btn));
      });
    });
  }

  // ── Rename flow: rename standalone token / role ───────────────────────────
  //
  // A role sub-token (--heading-m-size …) is never renamed on its own — the
  // property segment is fixed by the architecture. Renaming a role token
  // renames the whole role (all 4 sub-tokens) atomically. Standalone tokens
  // (font/leading/tracking) rename directly. Both reuse the create modal:
  // "new name" field + references preview → POST { renames: [...] } → server
  // rewrites the registry + regenerates CSS + rewrites var(--old) consumers.

  const TYPOGRAPHY_ROLE_TOKEN_RE = /^--(heading|body|label|meta)-([a-z0-9]+)-(size|lh|weight|tracking)$/;

  function typographyRoleOf(name) {
    const m = name.match(TYPOGRAPHY_ROLE_TOKEN_RE);
    return m ? `${m[1]}-${m[2]}` : null;
  }

  function typographyReferenceGroups(name) {
    const consumers = typographyConsumers(name);
    return consumers.length
      ? [{ label: 'Используется консьюмерами (ссылки обновятся):', items: consumers }]
      : [];
  }

  function buildRenameTypographyConfig(name, triggerEl) {
    const role = typographyRoleOf(name);
    const references = typographyReferenceGroups(name);
    const refNote = references.length
      ? 'Затронутые var(--…) ссылки обновятся автоматически.'
      : 'Явных ссылок в реестре не найдено.';

    if (role) {
      return {
        title: `Rename role "${role}"`,
        description: `Роль переименуется целиком (size / lh / weight / tracking). ${refNote}`,
        references,
        submitLabel: 'Переименовать',
        submittingLabel: 'Переименование…',
        errorLabel: 'Не удалось переименовать роль',
        triggerEl,
        fields: [
          {
            id: 'newRole',
            label: 'Новое имя роли',
            type: 'text',
            value: role,
            placeholder: 'heading-l',
            hint: 'heading|body|label|meta + строчный суффикс',
            required: true,
            validate: (value) => {
              const v = value.trim();
              if (v === role) return 'Новое имя совпадает со старым';
              if (!/^(heading|body|label|meta)-[a-z0-9]+$/.test(v)) return 'heading|body|label|meta + строчный суффикс';
              const dup = ['size', 'lh', 'weight', 'tracking'].find((p) => typographyTokenExists(`--${v}-${p}`));
              return dup ? `--${v}-${dup} уже существует` : null;
            },
          },
        ],
        onSubmit: async (values) => {
          const data = await postSave({
            renames: [{ kind: 'typography-role', from: role, to: values.newRole.trim() }],
            author: localStorage.getItem('ds-author') || 'sergej',
          }).catch((err) => ({ __error: err.message }));

          if (data.__error) return { ok: false, error: data.__error };
          if (!data.ok) return { ok: false, error: data.error || 'Не удалось переименовать роль' };
          await reloadTypographyAndRerender();
          return { ok: true };
        },
      };
    }

    return {
      title: `Rename ${name}`,
      description: refNote,
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
          value: name,
          required: true,
          validate: (value) => {
            const v = value.trim();
            if (v === name) return 'Новое имя совпадает со старым';
            const normalized = v.startsWith('--') ? v : `--${v}`;
            if (!/^--(font-[\w-]+|leading-[\w-]+|tracking-[\w-]+)$/.test(normalized)) {
              return '--font-*, --leading-* или --tracking-*';
            }
            return typographyTokenExists(normalized) ? `${normalized} уже существует` : null;
          },
        },
      ],
      onSubmit: async (values) => {
        const to = values.newName.trim().startsWith('--') ? values.newName.trim() : `--${values.newName.trim()}`;
        const data = await postSave({
          renames: [{ kind: 'typography-token', from: name, to }],
          author: localStorage.getItem('ds-author') || 'sergej',
        }).catch((err) => ({ __error: err.message }));

        if (data.__error) return { ok: false, error: data.__error };
        if (!data.ok) return { ok: false, error: data.error || 'Не удалось переименовать' };
        await reloadTypographyAndRerender();
        return { ok: true };
      },
    };
  }

  // originals/modified are shared, persistent state — renderTokenTable() is
  // called again after a successful "Add style" create (to reflect the new
  // row without a page reload), so the save-bar button listener is bound
  // ONCE (bindSaveBar) against these stable references instead of being
  // re-attached on every render (which would stack duplicate handlers).
  let originals = new Map();
  const modified = new Map();
  let currentTokens = [];

  function updateSaveBar() {
    const saveBar = document.getElementById('save-bar');
    const saveCount = document.getElementById('save-count');
    const count = modified.size;
    if (saveBar) saveBar.classList.toggle('is-visible', count > 0);
    if (saveCount) saveCount.textContent = count ? `${count} изменений` : '';
  }

  function onInputChange() {
    updateSaveBar();
    const saveStatus = document.getElementById('save-status');
    if (saveStatus) {
      saveStatus.textContent = '';
      saveStatus.className = 'storybook-status';
    }
  }

  function renderTokenTable(tokens) {
    const container = document.getElementById('tokens-groups');
    if (!container) return;

    currentTokens = tokens;
    originals = new Map(tokens.map((t) => [t.name, t.value]));
    modified.clear();
    const groups = groupTokens(tokens);

    container.innerHTML = groups
      .map(
        (group) => `
      <section class="storybook-token-group" aria-labelledby="token-group-${group.id}">
        <h3 id="token-group-${group.id}">${escapeHtml(group.label)}</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Токен</th>
                <th>Свойство</th>
                <th>Значение</th>
                <th>Редактирование</th>
                <th>Превью</th>
              </tr>
            </thead>
            <tbody data-group="${escapeHtml(group.id)}"></tbody>
          </table>
        </div>
      </section>`
      )
      .join('');

    groups.forEach((group) => {
      const tbody = container.querySelector(`tbody[data-group="${group.id}"]`);
      if (tbody) renderTokenRows(group.tokens, originals, modified, tbody, onInputChange);
    });

    updateSaveBar();
  }

  function bindSaveBar() {
    const saveBtn = document.getElementById('save-btn');
    const saveStatus = document.getElementById('save-status');
    if (!saveBtn) return;

    saveBtn.addEventListener('click', async () => {
      if (!modified.size) return;

      saveBtn.disabled = true;
      if (saveStatus) {
        saveStatus.textContent = 'Сохранение…';
        saveStatus.className = 'storybook-status';
      }

      const tokens = {};
      const changes = [];
      modified.forEach((c) => {
        tokens[c.token] = c.newValue;
        changes.push(c);
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

        await loadChangelog();
        setTimeout(() => location.reload(), 600);
      } catch (err) {
        if (saveStatus) {
          saveStatus.textContent = err.message;
          saveStatus.className = 'storybook-status is-error';
        }
        saveBtn.disabled = false;
      }
    });
  }

  function camelToKebab(str) {
    return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
  }

  function materializeTokens(tokens) {
    if (!window.DSTokenStore) {
      console.warn('DSTokenStore недоступен — пропускаю материализацию typography');
      return;
    }
    window.DSTokenStore.materialize(
      tokens.map((t) => ({ name: t.name, value: t.value, mode: 'light' }))
    );
  }

  // ── Create flow: new style (role) / new standalone token ─────────────────
  //
  // Explicit "+ Add style" action. A "role" bundles all 4 required
  // properties in one atomic create (see token-rules.md — "Состав
  // типографического стиля"), enforcing the family constraint that a
  // typography role is never partial. Confirm → POST { creates: [...] } →
  // server writes the canonical registry + regenerates the derived CSS →
  // we re-fetch and re-render in place (no page reload).

  const TYPOGRAPHY_ROLE_NAME_RE = /^(heading|body|label|meta)-[a-z0-9]+$/;
  const TYPOGRAPHY_STANDALONE_NAME_RE = /^--(font-[\w-]+|leading-[\w-]+|tracking-[\w-]+)$/;

  function typographyTokenExists(name) {
    return currentTokens.some((t) => t.name.toLowerCase() === name.toLowerCase());
  }

  function rejectColorValue(value) {
    return isColorValue(value) ? 'Typography-токен не может содержать цветовое значение' : null;
  }

  async function reloadTypographyAndRerender() {
    const tokens = await fetchTypographyTokens();
    materializeTokens(tokens);
    renderTokenTable(tokens);
    await loadChangelog();
  }

  function buildAddStyleConfig(triggerEl) {
    const isStandalone = (values) => values.kind === 'standalone';
    const isRole = (values) => values.kind !== 'standalone';

    return {
      title: 'Add style',
      description:
        'Role (heading/body/label/meta) требует все 4 свойства сразу: size, line-height, weight, tracking. ' +
        'Отдельный токен (font-*/leading-*/tracking-*) — одно значение.',
      submitLabel: 'Создать',
      triggerEl,
      fields: [
        {
          id: 'kind',
          label: 'Тип',
          type: 'select',
          required: true,
          options: [
            { value: 'role', label: 'Новый role (heading/body/label/meta)' },
            { value: 'standalone', label: 'Отдельный токен (font-*/leading-*/tracking-*)' },
          ],
        },
        {
          id: 'role',
          label: 'Role name',
          type: 'text',
          placeholder: 'heading-2xl',
          hint: 'heading|body|label|meta + строчный суффикс',
          showIf: isRole,
          required: true,
          validate: (value) => {
            if (!TYPOGRAPHY_ROLE_NAME_RE.test(value)) return 'heading|body|label|meta + строчный суффикс';
            const dup = ['size', 'lh', 'weight', 'tracking'].find((p) => typographyTokenExists(`--${value}-${p}`));
            return dup ? `--${value}-${dup} уже существует` : null;
          },
        },
        { id: 'size', label: 'Size', type: 'text', placeholder: '40px', showIf: isRole, required: true, validate: rejectColorValue },
        { id: 'lh', label: 'Line-height', type: 'text', placeholder: '48px', showIf: isRole, required: true, validate: rejectColorValue },
        { id: 'weight', label: 'Weight', type: 'text', placeholder: '700', showIf: isRole, required: true, validate: rejectColorValue },
        { id: 'tracking', label: 'Tracking', type: 'text', placeholder: '-0.2px', showIf: isRole, required: true, validate: rejectColorValue },
        {
          id: 'token',
          label: 'Token name',
          type: 'text',
          placeholder: '--font-display',
          showIf: isStandalone,
          required: true,
          validate: (value) => {
            const name = value.startsWith('--') ? value : `--${value}`;
            if (!TYPOGRAPHY_STANDALONE_NAME_RE.test(name)) return '--font-*, --leading-* или --tracking-*';
            return typographyTokenExists(name) ? `${name} уже существует` : null;
          },
        },
        {
          id: 'category',
          label: 'Category',
          type: 'select',
          showIf: isStandalone,
          required: true,
          options: [
            { value: 'font-family', label: 'font-family' },
            { value: 'line-height', label: 'line-height' },
            { value: 'letter-spacing', label: 'letter-spacing' },
            { value: 'font-weight', label: 'font-weight' },
          ],
        },
        {
          id: 'value',
          label: 'Value',
          type: 'text',
          placeholder: "'Inter', sans-serif",
          showIf: isStandalone,
          required: true,
          validate: rejectColorValue,
        },
      ],
      onSubmit: async (values) => {
        const payload =
          values.kind === 'standalone'
            ? {
                kind: 'typography-standalone',
                token: values.token.startsWith('--') ? values.token : `--${values.token}`,
                category: values.category,
                value: values.value,
              }
            : {
                kind: 'typography-role',
                role: values.role,
                size: values.size,
                lh: values.lh,
                weight: values.weight,
                tracking: values.tracking,
              };

        const data = await postSave({
          creates: [payload],
          author: localStorage.getItem('ds-author') || 'sergej',
        }).catch((err) => ({ __error: err.message }));

        if (data.__error) return { ok: false, error: data.__error };
        await reloadTypographyAndRerender();
        return { ok: true };
      },
    };
  }

  function bindCreateButton() {
    const btn = document.getElementById('add-style-btn');
    if (btn) {
      btn.addEventListener('click', () => window.DSTokenCreate.open(buildAddStyleConfig(btn)));
    }
  }

  async function init() {
    const tokens = await fetchTypographyTokens();
    materializeTokens(tokens);
    renderTokenTable(tokens);
    bindSaveBar();
    bindCreateButton();
    loadChangelog();
    probeSaveApi();
  }

  document.addEventListener('DOMContentLoaded', () => {
    init().catch((err) => {
      console.error('typography init failed:', err);
      const container = document.getElementById('tokens-groups');
      if (container) {
        container.innerHTML = `<p class="storybook-status is-error">${escapeHtml(err.message)}</p>`;
      }
    });
  });

  window.DSTypographyEditor = { fetchTypographyTokens, init };
})();
