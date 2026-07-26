/**
 * Product components hub — read-only list from _products.json.
 */
(function () {
  'use strict';

  const sb = window.DSProductStorybook;

  function renderComponentItem(productId, item) {
    const href = item.href || '#';
    const status = item.status
      ? `<span class="storybook-nav__status">${sb.escapeHtml(item.status)}</span>`
      : '';
    return `
      <li>
        <a class="product-components__link" href="${sb.escapeHtml(href)}">
          ${sb.escapeHtml(item.label)}
          ${status}
        </a>
      </li>
    `;
  }

  async function init() {
    const productId = sb.productFromUrl();
    const root = document.getElementById('product-components-root');
    const titleEl = document.getElementById('product-title');
    const breadcrumbEl = document.getElementById('product-breadcrumb');
    if (!root || !productId) {
      if (root) root.innerHTML = '<p class="storybook-status is-error">Укажите продукт: <code>?product=sutochno</code></p>';
      return;
    }

    try {
      const product = await sb.loadProduct(productId);
      const items = product.components?.items || [];

      sb.setActivePage(productId, 'components');
      if (titleEl) titleEl.textContent = `${product.label} — Components`;
      if (breadcrumbEl) {
        breadcrumbEl.innerHTML = `<a href="product.html?product=${sb.escapeHtml(productId)}">← ${sb.escapeHtml(product.label)}</a>`;
      }

      if (!items.length) {
        root.innerHTML = `
          <section class="storybook-section">
            <h2>Компоненты</h2>
            <p class="product-components__empty">
              Компоненты появятся здесь. Токены продукта — в разделе
              <a href="product-colors.html?product=${sb.escapeHtml(productId)}">Colors</a>.
            </p>
          </section>
        `;
        return;
      }

      const grouped = items.reduce((acc, item) => {
        const group = item.group || 'Components';
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
      }, {});

      root.innerHTML = Object.entries(grouped).map(([group, groupItems]) => `
        <section class="storybook-section product-components__group">
          <h2>${sb.escapeHtml(group)}</h2>
          <ul class="product-components__list">
            ${groupItems.map((item) => renderComponentItem(productId, item)).join('')}
          </ul>
        </section>
      `).join('');
    } catch (err) {
      root.innerHTML = `<p class="storybook-status is-error">Ошибка загрузки: ${sb.escapeHtml(err.message)}</p>`;
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
