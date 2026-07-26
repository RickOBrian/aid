/**
 * Storybook shared — nav + theme
 */
(function () {
  'use strict';

  // Root-relative so nested pages (e.g. docs/storybook/components/badge.html)
  // resolve the same nav file as top-level Storybook pages.
  const NAV_URL = '/docs/storybook/_storybook-nav.json?v=6';
  const ACTIVE_PAGE = document.body.dataset.storybookPage || '';

  async function loadNav() {
    const navEl = document.getElementById('storybook-nav');
    if (!navEl) return;

    try {
      const res = await fetch(NAV_URL);
      if (!res.ok) throw new Error('nav fetch failed');
      const data = await res.json();
      navEl.innerHTML = '';

      for (const section of data.sections || []) {
        const label = document.createElement('div');
        label.className = 'storybook-nav__section-label';
        label.textContent = section.label;
        navEl.appendChild(label);

        let lastGroup = null;
        for (const item of section.items || []) {
          if (item.group !== lastGroup) {
            lastGroup = item.group || null;
            if (lastGroup) {
              const groupLabel = document.createElement('div');
              groupLabel.className = 'storybook-nav__group-label';
              groupLabel.textContent = lastGroup;
              navEl.appendChild(groupLabel);
            }
          }

          const a = document.createElement('a');
          a.className = 'storybook-nav__item';
          if (item.group) a.classList.add('storybook-nav__item--grouped');
          if (item.href) {
            a.href = item.href;
            const isActive = item.id === ACTIVE_PAGE
              || (ACTIVE_PAGE && item.id && ACTIVE_PAGE.startsWith(item.id.split('/')[0] + '/')
                && item.href.includes('product=') && ACTIVE_PAGE.includes(item.id.split('/')[0]));
            if (isActive) {
              a.classList.add('is-active');
            }
          } else {
            a.href = '#';
            a.classList.add('is-planned');
          }
          a.textContent = item.label;

          if (item.status) {
            const status = document.createElement('span');
            status.className = 'storybook-nav__status';
            status.textContent = item.status;
            a.appendChild(status);
          }

          navEl.appendChild(a);
        }
      }
    } catch (err) {
      navEl.innerHTML = `<p class="storybook-status is-error">Nav: ${err.message}</p>`;
    }
  }

  /**
   * Normalizes a plain numeric edit (e.g. "32", "3", "-0.5") into a unit-suffixed
   * CSS value by reusing the unit of the token's previous value (e.g. "32px").
   * Values that already carry a unit, or aren't plain numbers, pass through untouched.
   */
  function normalizeTokenValue(raw, previousValue) {
    const value = String(raw).trim();
    if (!/^-?\d+(?:\.\d+)?$/.test(value)) return value;

    const unitMatch = String(previousValue || '').trim().match(/^-?\d+(?:\.\d+)?([a-z%]+)$/i);
    if (!unitMatch) return value;

    return `${value}${unitMatch[1]}`;
  }

  function initTheme() {
    const html = document.documentElement;
    const btn = document.getElementById('theme-toggle');
    const iconSun = document.getElementById('icon-sun');
    const iconMoon = document.getElementById('icon-moon');
    if (!btn) return;

    function applyTheme(theme) {
      html.setAttribute('data-theme', theme);
      if (iconSun) iconSun.style.display = theme === 'dark' ? 'block' : 'none';
      if (iconMoon) iconMoon.style.display = theme === 'light' ? 'block' : 'none';
      localStorage.setItem('ds-theme', theme);
    }

    btn.addEventListener('click', () => {
      applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });

    const saved = localStorage.getItem('ds-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (prefersDark ? 'dark' : 'light'));
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadNav();
  });

  window.DSStorybook = { initTheme, loadNav, normalizeTokenValue };
})();
