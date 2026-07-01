/**
 * Typography token editor — live preview + save
 */
(function () {
  'use strict';

  const TOKEN_SCAN_PREFIXES = [
    '--heading-',
    '--body-',
    '--label-',
    '--meta-',
    '--font-',
    '--leading-',
    '--tracking-',
  ];

  const TYPOGRAPHY_TOKEN_RE =
    /^--(?:font-[\w-]+|(?:heading|body|label|meta)-[a-z0-9]+-(?:size|lh|weight)|leading-[\w-]+|tracking-[\w-]+|text-[\w-]+-(?:size|lh|weight|tracking))$/;

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
  const PROP_ORDER = { size: 0, lh: 1, weight: 2 };

  function inferCategory(name) {
    if (name.includes('-size')) return 'font-size';
    if (name.includes('-lh')) return 'line-height';
    if (name.includes('-weight')) return 'font-weight';
    if (name.startsWith('--font-')) return 'font-family';
    if (name.startsWith('--leading-')) return 'line-height';
    if (name.startsWith('--tracking-')) return 'letter-spacing';
    return 'other';
  }

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
      if (role && (prop === 'size' || prop === 'lh' || prop === 'weight')) {
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
      letterSpacing: 'normal',
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

  function collectTypographyTokens() {
    const styles = getComputedStyle(document.documentElement);
    const names = new Set();

    for (const sheet of document.styleSheets) {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch (_) {
        continue;
      }
      if (!rules) continue;

      for (const rule of rules) {
        if (rule.selectorText !== ':root') continue;
        for (const prop of rule.style) {
          if (!prop.startsWith('--')) continue;
          if (!TOKEN_SCAN_PREFIXES.some((p) => prop.startsWith(p))) continue;
          const value = rule.style.getPropertyValue(prop).trim();
          if (isTypographyToken(prop, value)) names.add(prop);
        }
      }
    }

    for (let i = 0; i < styles.length; i += 1) {
      const prop = styles[i];
      if (!prop.startsWith('--')) continue;
      if (!TOKEN_SCAN_PREFIXES.some((p) => prop.startsWith(p))) continue;
      const value = styles.getPropertyValue(prop).trim();
      if (isTypographyToken(prop, value)) names.add(prop);
    }

    return [...names]
      .map((name) => ({
        name,
        category: inferCategory(name),
        value: styles.getPropertyValue(name).trim(),
      }))
      .filter((token) => isTypographyToken(token.name, token.value));
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

  async function postSave(payload) {
    const endpoints = getSaveEndpoints();
    let lastError;

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
        lastError = err;
      }
    }

    throw lastError || new Error('Не удалось сохранить токены');
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
          ${
            index === 0
              ? `<td class="token-preview-cell" rowspan="${rowspan}">
            <span class="token-preview" style="${styleAttr}">${escapeHtml(sample)}</span>
          </td>`
              : ''
          }
          <td>
            <input class="token-editor-input" type="text"
                   value="${escapeHtml(token.value)}"
                   data-token="${escapeHtml(token.name)}"
                   data-cluster="${escapeHtml(cluster.role)}"
                   aria-label="Edit ${escapeHtml(token.name)}">
          </td>
        </tr>`
          )
          .join('');
      })
      .join('');

    tbody.querySelectorAll('.token-editor-input').forEach((input) => {
      input.addEventListener('input', () => {
        const name = input.dataset.token;
        const clusterId = input.dataset.cluster;
        const next = input.value.trim();
        const orig = originals.get(name);

        document.documentElement.style.setProperty(name, next);

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
  }

  function renderTokenTable(tokens) {
    const container = document.getElementById('tokens-groups');
    if (!container) return;

    const originals = new Map(tokens.map((t) => [t.name, t.value]));
    const modified = new Map();
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
                <th>Превью</th>
                <th>Редактирование</th>
              </tr>
            </thead>
            <tbody data-group="${escapeHtml(group.id)}"></tbody>
          </table>
        </div>
      </section>`
      )
      .join('');

    const saveBar = document.getElementById('save-bar');
    const saveCount = document.getElementById('save-count');
    const saveBtn = document.getElementById('save-btn');
    const saveStatus = document.getElementById('save-status');

    function updateSaveBar() {
      const count = modified.size;
      if (saveBar) saveBar.classList.toggle('is-visible', count > 0);
      if (saveCount) saveCount.textContent = count ? `${count} изменений` : '';
    }

    function onInputChange() {
      updateSaveBar();
      if (saveStatus) {
        saveStatus.textContent = '';
        saveStatus.className = 'storybook-status';
      }
    }

    groups.forEach((group) => {
      const tbody = container.querySelector(`tbody[data-group="${group.id}"]`);
      if (tbody) renderTokenRows(group.tokens, originals, modified, tbody, onInputChange);
    });

    if (saveBtn) {
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
  }

  function camelToKebab(str) {
    return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
  }

  function init() {
    const tokens = collectTypographyTokens();
    renderTokenTable(tokens);
    loadChangelog();
    probeSaveApi();
  }

  document.addEventListener('DOMContentLoaded', init);

  window.DSTypographyEditor = { collectTypographyTokens, init };
})();
