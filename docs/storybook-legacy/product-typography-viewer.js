/**
 * Read-only product Typography — same layout as typography.html (storybook-token-group + Table).
 */
(function () {
  'use strict';

  const sb = window.DSProductStorybook;
  const esc = sb.escapeHtml;

  const SAMPLE_TEXT = 'Sutochno — быстрый рыжий лис';

  const SAMPLE_BY_STYLE = {
    'display-l': 'Главная страница',
    'display-m': 'Промо-блок',
    'title-l': 'Заголовок страницы',
    'title-m': 'Заголовок раздела',
    'title-s': 'Заголовок блока',
    'subhead-l': 'Заголовок карточки',
    'subhead-m': 'Заголовок элемента',
    'subhead-s': 'Компактный заголовок',
    'label-l': 'Перейти к бронированию',
    'label-m': 'Перейти к бронированию',
    'label-s': 'Перейти к бронированию',
  };

  function sampleText(style) {
    if (SAMPLE_BY_STYLE[style.id]) return SAMPLE_BY_STYLE[style.id];
    if (style.id.startsWith('caption')) return 'Служебный текст';
    if (style.id.startsWith('micro')) return 'Тег';
    if (style.id.startsWith('body')) return 'Основной текст для параграфов и описаний';
    return style.name;
  }

  function groupLabel(group) {
    if (group.id === 'heading') return 'Heading';
    if (group.sizeLabel) return `Text · ${group.sizeLabel}`;
    return group.label;
  }

  function styleTokens(style) {
    const prefix = `--sutochno-${style.id}`;
    return [
      { name: `${prefix}-size`, category: 'font-size', value: `${style.size}px` },
      { name: `${prefix}-lh`, category: 'line-height', value: `${style.lineHeight}px` },
      { name: `${prefix}-weight`, category: 'font-weight', value: String(style.weight) },
      { name: `${prefix}-tracking`, category: 'letter-spacing', value: style.letterSpacing },
    ];
  }

  function renderBadges(style) {
    const badges = [];
    (style.tags || []).forEach((tag) => {
      if (tag === 'Only Web') {
        badges.push('<span class="chip product-token-legacy-chip">Only Web</span>');
      }
    });
    if (style.legacy) {
      badges.push('<span class="chip product-token-legacy-chip" title="Legacy style">LEGACY</span>');
    }
    return badges.join('');
  }

  function renderPreviewCell(style) {
    const badges = renderBadges(style);
    const badgeRow = badges ? `<div class="product-typo-preview__badges">${badges}</div>` : '';
    return `
      <div class="product-typo-preview">
        <div class="product-typo-preview__role">
          <code class="token-name">${esc(style.name)}</code>
          ${badgeRow}
        </div>
        <span class="token-preview product-typo-${esc(style.id)}">${esc(sampleText(style))}</span>
        ${style.description ? `<p class="product-typo-preview__desc">${esc(style.description)}</p>` : ''}
      </div>
    `;
  }

  function renderClusterRows(style) {
    const tokens = styleTokens(style);
    const clusterId = style.id;
    const legacyClass = style.legacy ? ' product-token-row--legacy' : '';

    return tokens
      .map(
        (token, index) => `
        <tr data-cluster="${esc(clusterId)}" data-token="${esc(token.name)}" class="${legacyClass.trim()}">
          <td><code class="token-name">${esc(token.name)}</code></td>
          <td><span class="token-category">${esc(token.category)}</span></td>
          <td><code class="token-value-readonly">${esc(token.value)}</code></td>
          ${
            index === 0
              ? `<td class="token-preview-cell" rowspan="${tokens.length}">${renderPreviewCell(style)}</td>`
              : ''
          }
        </tr>`,
      )
      .join('');
  }

  function renderFontGroup(fontFamily) {
    const tokenName = '--font-family-sutochno';
    const value = `"${fontFamily}", system-ui, -apple-system, BlinkMacSystemFont, sans-serif`;

    return `
      <section class="storybook-token-group" aria-labelledby="token-group-fonts">
        <h3 id="token-group-fonts">Шрифты</h3>
        <div class="table-wrap" data-ds-component="Table">
          <table>
            <thead>
              <tr>
                <th>Токен</th>
                <th>Свойство</th>
                <th>Значение</th>
                <th>Превью</th>
              </tr>
            </thead>
            <tbody>
              <tr data-cluster="font-family" data-token="${esc(tokenName)}">
                <td><code class="token-name">${esc(tokenName)}</code></td>
                <td><span class="token-category">font-family</span></td>
                <td><code class="token-value-readonly">${esc(value)}</code></td>
                <td class="token-preview-cell">
                  <span class="token-preview" style="font-family:var(--font-family-sutochno)">${esc(SAMPLE_TEXT)}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderStyleGroup(group) {
    const rows = group.styles.map(renderClusterRows).join('');
    const id = group.id;

    return `
      <section class="storybook-token-group" aria-labelledby="token-group-${esc(id)}">
        <h3 id="token-group-${esc(id)}">${esc(groupLabel(group))}</h3>
        <div class="table-wrap" data-ds-component="Table">
          <table>
            <thead>
              <tr>
                <th>Токен</th>
                <th>Свойство</th>
                <th>Значение</th>
                <th>Превью</th>
              </tr>
            </thead>
            <tbody data-group="${esc(id)}">${rows}</tbody>
          </table>
        </div>
      </section>
    `;
  }

  async function init() {
    const productId = sb.productFromUrl();
    const container = document.getElementById('tokens-groups');
    const titleEl = document.getElementById('product-title');

    if (!productId) {
      if (container) {
        container.innerHTML = '<p class="storybook-status is-error">Укажите <code>?product=sutochno</code></p>';
      }
      return;
    }

    try {
      const product = await sb.loadProduct(productId);
      sb.setActivePage(productId, 'tokens/typography');
      document.body.dataset.product = productId;
      await sb.applyProductAssets(productId);

      if (titleEl) titleEl.textContent = `${product.label} · Typography`;

      const typoPath = product.tokens?.typography?.legacy?.[0];
      if (!typoPath) {
        if (container) {
          container.innerHTML = '<p class="storybook-status">Типографика для этого продукта ещё не импортирована.</p>';
        }
        return;
      }

      const res = await fetch(typoPath);
      if (!res.ok) throw new Error(`${typoPath}: ${res.status}`);
      const data = await res.json();

      if (container) {
        container.innerHTML = [
          renderFontGroup(data.fontFamily || 'Inter'),
          ...data.groups.map(renderStyleGroup),
        ].join('');
      }
    } catch (err) {
      if (container) container.innerHTML = `<p class="storybook-status is-error">${esc(err.message)}</p>`;
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
