/**
 * DS Docs — nav.js
 * In-page search overlay. Overrides Cmd+F / Ctrl+F.
 *
 * Features:
 *  - Keyboard shortcut intercept (Cmd+F / Ctrl+F)
 *  - Highlights all matches in the content area
 *  - Prev / Next navigation with counter "N of M"
 *  - Esc closes overlay and clears highlights
 *  - Also responds to ds:highlight-term event (from search.js cross-page nav)
 *
 * Searches only within #guide-content (or <main> as fallback).
 * Never modifies sidebar, header, or nav elements.
 */

(function () {
  'use strict';

  // ── Constants ─────────────────────────────────────────────────────────────
  const OVERLAY_ID     = 'nav-overlay';
  const MARK_CLASS     = 'nav-highlight';
  const MARK_ACTIVE    = 'nav-highlight--active';
  const SEARCH_ROOT_ID = 'guide-content'; // falls back to <main>

  // ── State ──────────────────────────────────────────────────────────────────
  let marks         = [];   // all <mark> elements from current search
  let currentIndex  = -1;   // index into marks[]
  let isOpen        = false;

  // ── Build overlay DOM ─────────────────────────────────────────────────────
  function buildOverlay() {
    if (document.getElementById(OVERLAY_ID)) return;

    const el = document.createElement('div');
    el.id = OVERLAY_ID;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Поиск по странице');
    el.innerHTML = `
      <div class="nav-overlay__bar">
        <div class="nav-overlay__search">
          <svg class="nav-overlay__icon" width="14" height="14" viewBox="0 0 16 16"
               fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M7 13A6 6 0 1 0 7 1a6 6 0 0 0 0 12ZM14 14l-3-3"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input class="nav-overlay__input" type="search"
                 placeholder="Поиск по странице…"
                 id="nav-input" autocomplete="off" spellcheck="false">
        </div>

        <div class="nav-overlay__controls">
          <span class="nav-overlay__counter" id="nav-counter" aria-live="polite"></span>

          <button class="nav-overlay__btn" id="nav-prev"
                  aria-label="Предыдущее совпадение" title="Предыдущее (Shift+Enter)">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M9 8L6 5l-3 3" stroke="currentColor" stroke-width="1.5"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <button class="nav-overlay__btn" id="nav-next"
                  aria-label="Следующее совпадение" title="Следующее (Enter)">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M3 4l3 3 3-3" stroke="currentColor" stroke-width="1.5"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <button class="nav-overlay__btn nav-overlay__btn--close" id="nav-close"
                  aria-label="Закрыть поиск" title="Закрыть (Esc)">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5"
                    stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(el);
    injectStyles();
    bindOverlayEvents(el);
  }

  // ── Overlay styles (scoped, no external dependency) ───────────────────────
  function injectStyles() {
    if (document.getElementById('nav-styles')) return;
    const style = document.createElement('style');
    style.id = 'nav-styles';
    style.textContent = `
      #${OVERLAY_ID} {
        position: fixed;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        display: none;
        pointer-events: auto;
      }
      #${OVERLAY_ID}.is-open { display: block; }

      .nav-overlay__bar {
        display: flex;
        align-items: center;
        gap: var(--gap-s, 8px);
        background: var(--bg-card-main, #fff);
        border: 1px solid var(--line-default, #e5e5ea);
        border-top: none;
        border-radius: 0 0 var(--radius-l, 12px) var(--radius-l, 12px);
        box-shadow: 0 8px 24px rgba(0,0,0,.12);
        padding: 8px 12px;
        min-width: 400px;
      }

      .nav-overlay__search {
        position: relative;
        flex: 1;
      }

      .nav-overlay__icon {
        position: absolute;
        left: 8px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--icon-secondary, #6e6e73);
        pointer-events: none;
      }

      .nav-overlay__input {
        width: 100%;
        padding: 6px 10px 6px 28px;
        border-radius: var(--radius-m, 8px);
        border: 1px solid var(--line-default, #e5e5ea);
        background: var(--bg-base-main-secondary, #f0f0f2);
        color: var(--text-primary, #111);
        font-family: inherit;
        font-size: 13px;
        line-height: 20px;
        outline: none;
        -webkit-appearance: none;
      }
      .nav-overlay__input:focus {
        border-color: var(--line-accent, #0057ff);
        background: var(--bg-card-main, #fff);
      }
      .nav-overlay__input::-webkit-search-cancel-button { display: none; }

      .nav-overlay__controls {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .nav-overlay__counter {
        font-size: 12px;
        color: var(--text-secondary, #6e6e73);
        min-width: 52px;
        text-align: center;
        white-space: nowrap;
      }

      .nav-overlay__btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border: 1px solid var(--line-default, #e5e5ea);
        border-radius: var(--radius-m, 8px);
        background: transparent;
        color: var(--icon-secondary, #6e6e73);
        cursor: pointer;
        transition: background .1s, color .1s;
      }
      .nav-overlay__btn:hover {
        background: var(--bg-accent-states-hover, rgba(0,87,255,.08));
        color: var(--text-primary, #111);
      }
      .nav-overlay__btn:disabled {
        opacity: .4;
        cursor: not-allowed;
      }
      .nav-overlay__btn--close {
        margin-left: 2px;
        border-color: transparent;
      }

      /* Highlight marks */
      .${MARK_CLASS} {
        background: var(--bg-accent-states-active, rgba(0,87,255,.14));
        color: inherit;
        border-radius: 2px;
        padding: 0 1px;
      }
      .${MARK_ACTIVE} {
        background: var(--bg-accent-main, #0057ff);
        color: var(--text-inverse, #fff);
      }

      /* Search results list styles (used by search.js in index.html) */
      #search-results {
        margin-top: var(--gap-m, 16px);
      }
      .search-result {
        display: block;
        text-decoration: none;
        padding: var(--inset-container-v-m, 16px) var(--inset-container-h-m, 16px);
        border: 1px solid var(--line-default, #e5e5ea);
        border-radius: var(--radius-l, 12px);
        background: var(--bg-card-main, #fff);
        margin-bottom: var(--gap-s, 8px);
        transition: border-color .15s, box-shadow .15s;
      }
      .search-result:hover {
        border-color: var(--bg-accent-main, #0057ff);
        box-shadow: 0 0 0 3px var(--bg-accent-fade, rgba(0,87,255,.12));
      }
      .search-result__header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: var(--gap-s, 8px);
        margin-bottom: var(--gap-xs, 4px);
      }
      .search-result__name {
        font-size: 15px;
        font-weight: 600;
        color: var(--text-primary, #111);
      }
      .search-result__meta {
        font-size: 12px;
        color: var(--text-secondary, #6e6e73);
        white-space: nowrap;
      }
      .search-result__context {
        font-size: 13px;
        color: var(--text-secondary, #6e6e73);
        line-height: 1.5;
      }
      .search-result__context mark.search-highlight,
      .search-highlight {
        background: var(--bg-accent-states-active, rgba(0,87,255,.14));
        color: var(--text-primary, #111);
        border-radius: 2px;
        padding: 0 1px;
      }
      .search-empty {
        padding: var(--inset-container-v-m, 16px);
        color: var(--text-secondary, #6e6e73);
        font-size: 14px;
        text-align: center;
      }
    `;
    document.head.appendChild(style);
  }

  // ── Text node walker ──────────────────────────────────────────────────────
  function getTextNodes(root) {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          // Skip script, style, already-marked content
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
          if (parent.classList.contains(MARK_CLASS)) return NodeFilter.FILTER_REJECT;
          if (!node.textContent.trim()) return NodeFilter.FILTER_SKIP;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    return nodes;
  }

  // ── Highlight all matches ─────────────────────────────────────────────────
  function highlightAll(term) {
    clearHighlights();
    if (!term) return;

    const root = document.getElementById(SEARCH_ROOT_ID) || document.querySelector('main');
    if (!root) return;

    const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const textNodes = getTextNodes(root);

    textNodes.forEach(node => {
      const text = node.textContent;
      if (!re.test(text)) return;
      re.lastIndex = 0;

      const frag = document.createDocumentFragment();
      let last = 0;
      let m;

      while ((m = re.exec(text)) !== null) {
        // Text before match
        if (m.index > last) {
          frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        }
        // Mark element
        const mark = document.createElement('mark');
        mark.className = MARK_CLASS;
        mark.textContent = m[0];
        frag.appendChild(mark);
        marks.push(mark);
        last = m.index + m[0].length;
      }

      // Remaining text
      if (last < text.length) {
        frag.appendChild(document.createTextNode(text.slice(last)));
      }

      node.parentNode.replaceChild(frag, node);
    });

    currentIndex = marks.length ? 0 : -1;
    activateCurrent();
  }

  // ── Clear all highlights ──────────────────────────────────────────────────
  function clearHighlights() {
    marks.forEach(mark => {
      const parent = mark.parentNode;
      if (!parent) return;
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize();
    });
    marks = [];
    currentIndex = -1;
  }

  // ── Activate current match ────────────────────────────────────────────────
  function activateCurrent() {
    marks.forEach((m, i) => {
      m.classList.toggle(MARK_ACTIVE, i === currentIndex);
    });

    if (currentIndex >= 0 && marks[currentIndex]) {
      marks[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    updateCounter();
  }

  // ── Update counter display ────────────────────────────────────────────────
  function updateCounter() {
    const counter = document.getElementById('nav-counter');
    if (!counter) return;

    if (!marks.length) {
      counter.textContent = 'Не найдено';
      return;
    }
    counter.textContent = `${currentIndex + 1} из ${marks.length}`;

    const prevBtn = document.getElementById('nav-prev');
    const nextBtn = document.getElementById('nav-next');
    if (prevBtn) prevBtn.disabled = currentIndex <= 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= marks.length - 1;
  }

  // ── Open / close overlay ──────────────────────────────────────────────────
  function open(prefill) {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) return;
    overlay.classList.add('is-open');
    isOpen = true;

    const input = document.getElementById('nav-input');
    if (input) {
      if (prefill) input.value = prefill;
      input.focus();
      input.select();
      if (prefill) highlightAll(prefill);
    }
    updateCounter();
  }

  function close() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.classList.remove('is-open');
    isOpen = false;
    clearHighlights();

    const input = document.getElementById('nav-input');
    if (input) input.value = '';

    const counter = document.getElementById('nav-counter');
    if (counter) counter.textContent = '';
  }

  // ── Bind events ───────────────────────────────────────────────────────────
  function bindOverlayEvents(overlay) {
    const input   = overlay.querySelector('#nav-input');
    const prevBtn = overlay.querySelector('#nav-prev');
    const nextBtn = overlay.querySelector('#nav-next');
    const closeBtn= overlay.querySelector('#nav-close');

    let debounce;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        highlightAll(input.value.trim());
      }, 150);
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) goToPrev();
        else            goToNext();
      }
      if (e.key === 'Escape') close();
    });

    prevBtn.addEventListener('click', goToPrev);
    nextBtn.addEventListener('click', goToNext);
    closeBtn.addEventListener('click', close);
  }

  function goToNext() {
    if (!marks.length) return;
    currentIndex = Math.min(currentIndex + 1, marks.length - 1);
    activateCurrent();
  }

  function goToPrev() {
    if (!marks.length) return;
    currentIndex = Math.max(currentIndex - 1, 0);
    activateCurrent();
  }

  // ── Global keyboard listener ──────────────────────────────────────────────
  function bindGlobalKeys() {
    document.addEventListener('keydown', e => {
      // Cmd+F / Ctrl+F
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        if (isOpen) {
          const input = document.getElementById('nav-input');
          if (input) { input.focus(); input.select(); }
        } else {
          open();
        }
        return;
      }

      if (e.key === 'Escape' && isOpen) {
        close();
      }
    });
  }

  // ── Cross-page highlight event (from search.js) ───────────────────────────
  function bindSearchHighlight() {
    window.addEventListener('ds:highlight-term', e => {
      const term = e.detail && e.detail.term;
      if (!term) return;
      open(term);
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    buildOverlay();
    bindGlobalKeys();
    bindSearchHighlight();
  });

  // ── Public API ────────────────────────────────────────────────────────────
  window.DSNav = { open, close, highlight: highlightAll, next: goToNext, prev: goToPrev };

})();
