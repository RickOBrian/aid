/**
 * Shared helpers for product Storybook pages (:8000).
 */
(function () {
  'use strict';

  const PRODUCT_ASSETS = {
    sutochno: {
      fonts: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      stylesheets: [
        'storybook-product-sutochno-typography.css',
        'storybook-product-sutochno-button-text.css',
      ],
    },
  };

  window.DSProductStorybook = {
    REGISTRY_URL: '/docs/storybook/_products.json',

    productFromUrl() {
      return new URLSearchParams(window.location.search).get('product') || '';
    },

    escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    },

    async fetchRegistry() {
      const res = await fetch(this.REGISTRY_URL);
      if (!res.ok) throw new Error(`${this.REGISTRY_URL}: ${res.status}`);
      return res.json();
    },

    async loadProduct(productId) {
      const registry = await this.fetchRegistry();
      const product = (registry.products || []).find((p) => p.id === productId);
      if (!product) throw new Error(`Продукт «${productId}» не найден в _products.json`);
      return product;
    },

    setActivePage(productId, pageId) {
      document.body.dataset.storybookPage = `${productId}/${pageId}`;
    },

    getProductAssets(productId) {
      return PRODUCT_ASSETS[productId] || null;
    },

    async applyProductAssets(productId) {
      const assets = this.getProductAssets(productId);
      if (!assets) return;

      if (assets.fonts) {
        const href = assets.fonts;
        const exists = [...document.querySelectorAll('link[rel="stylesheet"]')].some(
          (link) => link.href === href || link.getAttribute('href') === href,
        );
        if (!exists) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = href;
          document.head.appendChild(link);
        }
      }

      const base = new URL('.', window.location.href);
      for (const sheet of assets.stylesheets || []) {
        const resolved = new URL(sheet, base).pathname;
        const exists = [...document.querySelectorAll('link[rel="stylesheet"]')].some(
          (link) => link.pathname === resolved || link.getAttribute('href') === sheet,
        );
        if (!exists) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = sheet;
          document.head.appendChild(link);
        }
      }
    },
  };
})();
