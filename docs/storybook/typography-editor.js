/**
 * Typography token editor — live preview + save
 */
(function () {
  'use strict';

  const TOKEN_PREFIXES = [
    '--heading-',
    '--body-',
    '--label-',
    '--meta-',
    '--font-',
    '--text-',
    '--leading-',
    '--tracking-',
  ];

  const SAMPLE_TEXT = 'Aid — быстрый рыжий лис';

  function inferCategory(name) {
    if (name.includes('-size')) return 'font-size';
    if (name.includes('-lh')) return 'line-height';
    if (name.includes('-weight')) return 'font-weight';
    if (name.startsWith('--font-')) return 'font-family';
    if (name.startsWith('--leading-')) return 'line-height';
    if (name.startsWith('--tracking-')) return 'letter-spacing';
    if (name.startsWith('--text-') && name.endsWith('-size')) return 'font-size';
    return 'other';
  }

  function previewStyle(name, category) {
    const base = {
      fontFamily: 'var(--font-body, Inter, system-ui, sans-serif)',
      fontSize: 'var(--body-m-size)',
      lineHeight: 'var(--body-m-lh)',
      fontWeight: 'var(--body-m-weight)',
      letterSpacing: 'normal',
      color: 'var(--text-primary)',
    };

    switch (category) {
      case 'font-size':
        base.fontSize = `var(${name})`;
        break;
      case 'line-height':
        base.lineHeight = `var(${name})`;
        break;
      case 'font-weight':
        base.fontWeight = `var(${name})`;
        break;
      case 'font-family':
        base.fontFamily = `var(${name})`;
        break;
      case 'letter-spacing':
        base.letterSpacing = `var(${name})`;
        break;
      default:
        base.fontSize = `var(${name})`;
    }

    return base;
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
          if (prop.startsWith('--') && TOKEN_PREFIXES.some((p) => prop.startsWith(p))) {
            names.add(prop);
          }
        }
      }
    }

    for (let i = 0; i < styles.length; i += 1) {
      const prop = styles[i];
      if (prop.startsWith('--') && TOKEN_PREFIXES.some((p) => prop.startsWith(p))) {
        names.add(prop);
      }
    }

    return [...names]
      .sort()
      .map((name) => ({
        name,
        category: inferCategory(name),
        value: styles.getPropertyValue(name).trim(),
      }));
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

  function renderTokenTable(tokens) {
    const tbody = document.getElementById('tokens-tbody');
    if (!tbody) return;

    const originals = new Map(tokens.map((t) => [t.name, t.value]));
    const modified = new Map();

    tbody.innerHTML = tokens
      .map((token) => {
        const preview = previewStyle(token.name, token.category);
        const styleAttr = Object.entries(preview)
          .map(([k, v]) => `${camelToKebab(k)}:${v}`)
          .join(';');

        return `
        <tr data-token="${escapeHtml(token.name)}">
          <td><code class="token-name">${escapeHtml(token.name)}</code></td>
          <td><span class="token-category">${escapeHtml(token.category)}</span></td>
          <td><code class="token-value">${escapeHtml(token.value)}</code></td>
          <td><span class="token-preview" style="${styleAttr}">${SAMPLE_TEXT}</span></td>
          <td>
            <input class="token-editor-input" type="text"
                   value="${escapeHtml(token.value)}"
                   data-token="${escapeHtml(token.name)}"
                   aria-label="Edit ${escapeHtml(token.name)}">
          </td>
        </tr>`;
      })
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

    tbody.querySelectorAll('.token-editor-input').forEach((input) => {
      input.addEventListener('input', () => {
        const name = input.dataset.token;
        const next = input.value.trim();
        const orig = originals.get(name);

        document.documentElement.style.setProperty(name, next);

        const row = tbody.querySelector(`tr[data-token="${name}"]`);
        const valueCell = row?.querySelector('.token-value');
        const previewEl = row?.querySelector('.token-preview');
        if (valueCell) valueCell.textContent = next;

        if (previewEl) {
          const category = inferCategory(name);
          const style = previewStyle(name, category);
          Object.assign(previewEl.style, style);
        }

        if (next === orig) {
          modified.delete(name);
          input.classList.remove('is-modified');
        } else {
          modified.set(name, { token: name, oldValue: orig, newValue: next });
          input.classList.add('is-modified');
        }

        updateSaveBar();
        if (saveStatus) {
          saveStatus.textContent = '';
          saveStatus.className = 'storybook-status';
        }
      });
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
