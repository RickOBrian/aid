/**
 * DS Docs — search.js
 * Cross-page full-text search powered by Lunr.js.
 *
 * Dependencies (must be loaded before this script):
 *   - lunr.min.js (CDN)
 *
 * Config (set window.DS_CONFIG before this script loads):
 *   window.DS_CONFIG = {
 *     guidesBase: '/skills/_shared/',   // path to MD files
 *     guidePage:  '/docs/guides/template.html'  // guide page URL
 *   }
 *
 * Graceful fallbacks:
 *   - frontmatter `title:` used if `name:` missing (typography guides)
 *   - top-level `version:` used if `metadata.version:` missing
 */

(function () {
  'use strict';

  // ── Configuration ──────────────────────────────────────────────────────────
  const CFG = Object.assign({
    guidesBase: '/skills/_shared/',
    guidePage:  '/docs/guides/template.html',
    contextLen: 100,
  }, window.DS_CONFIG || {});

  // ── Guide manifest ─────────────────────────────────────────────────────────
  // Single source of truth for all indexed guides.
  const GUIDE_MANIFEST = [
    { id: 'core-color-tokens-guide',         name: 'Core Color Tokens',          category: 'Tokens',     sub: 'Color',        level: 'core',     status: 'Draft',  version: '1.2.0' },
    { id: 'semantic-color-tokens-guide',     name: 'Semantic Color Tokens',      category: 'Tokens',     sub: 'Color',        level: 'semantic', status: 'Stable', version: '1.2.0' },
    { id: 'core-space-tokens-guide',         name: 'Core Space Tokens',          category: 'Tokens',     sub: 'Space',        level: 'core',     status: 'Draft',  version: '1.1.0' },
    { id: 'semantic-space-tokens-guide',     name: 'Semantic Space Tokens',      category: 'Tokens',     sub: 'Space',        level: 'semantic', status: 'Draft',  version: '1.0.0' },
    { id: 'core-typography-tokens-guide',    name: 'Core Typography Tokens',     category: 'Tokens',     sub: 'Typography',   level: 'core',     status: 'Draft',  version: '1.0.0' },
    { id: 'semantic-typography-tokens-guide',name: 'Semantic Typography Tokens', category: 'Tokens',     sub: 'Typography',   level: 'semantic', status: 'Draft',  version: '1.1.0' },
    { id: 'ds-component-architecture-guide', name: 'Архитектура компонентов',    category: 'Components', sub: null,           level: null,       status: 'Draft',  version: '1.1.0' },
    { id: 'component-states-guide',          name: 'Состояния компонентов',      category: 'Components', sub: null,           level: null,       status: 'Draft',  version: '1.1.0' },
  ];

  // ── State ──────────────────────────────────────────────────────────────────
  let lunrIndex   = null;
  let docStore    = {};   // id → { name, category, sub, text, version, status }
  let indexReady  = false;

  // ── Frontmatter parser ─────────────────────────────────────────────────────
  function parseFrontmatter(raw) {
    if (!raw.startsWith('---')) return { fm: {}, body: raw };

    // Handle double-frontmatter (e.g. core-color-tokens-guide)
    let search = raw;
    let offset = 0;
    if (raw.startsWith('---\n')) {
      const firstClose = raw.indexOf('\n---', 4);
      if (firstClose !== -1) {
        const nextOpen = raw.indexOf('\n---', firstClose + 4);
        if (nextOpen !== -1 && nextOpen < firstClose + 80) {
          // Two consecutive --- blocks → skip the first one
          offset = firstClose + 1;
          search = raw.slice(offset);
        }
      }
    }

    const end = search.indexOf('\n---', 4);
    if (end === -1) return { fm: {}, body: raw };

    const fmRaw = search.slice(4, end);
    const body  = search.slice(end + 4).trimStart();
    const fm    = {};
    let inMeta  = false;
    let inDesc  = false;
    const descLines = [];

    for (const line of fmRaw.split('\n')) {
      if (line.startsWith('metadata:')) { inMeta = true; continue; }
      if (line.startsWith('description:')) { inDesc = true; continue; }

      if (inDesc) {
        if (line.startsWith(' ') || line.startsWith('\t')) {
          descLines.push(line.trim());
          continue;
        }
        inDesc = false;
      }

      if (inMeta && (line.startsWith('  ') || line.startsWith('\t'))) {
        const trimmed = line.trim();
        if (trimmed.startsWith('version:')) fm.metaVersion = trimmed.split(':')[1].trim().replace(/"/g, '');
        if (trimmed.startsWith('owner:'))   fm.owner       = trimmed.split(':')[1].trim();
        if (trimmed.startsWith('platforms:')) fm.platforms  = trimmed.split(':')[1].trim();
        continue;
      }
      inMeta = false;

      if (line.includes(':') && !line.startsWith(' ')) {
        const [k, ...rest] = line.split(':');
        const v = rest.join(':').trim();
        fm[k.trim()] = v.replace(/^"(.*)"$/, '$1');
      }
    }

    if (descLines.length) fm.description = descLines.join(' ');

    // Graceful fallbacks for non-standard frontmatter
    fm.name    = fm.name    || fm.title  || '';
    fm.version = fm.metaVersion || fm.version || '';

    return { fm, body };
  }

  // ── Strip MD formatting from text ──────────────────────────────────────────
  function stripMd(text) {
    return text
      .replace(/^---[\s\S]*?---\n/m, '')       // frontmatter
      .replace(/```[\s\S]*?```/gm, '')          // fenced code
      .replace(/`[^`]+`/g, '')                  // inline code
      .replace(/!\[.*?\]\(.*?\)/g, '')          // images
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → text
      .replace(/#{1,6}\s+/g, '')               // headings
      .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1') // bold/italic
      .replace(/^\s*[-*+>|]\s*/gm, ' ')        // lists, blockquotes, tables
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  // ── Extract context around a match ────────────────────────────────────────
  function extractContext(text, term, len) {
    const idx = text.toLowerCase().indexOf(term.toLowerCase());
    if (idx === -1) return text.slice(0, len * 2) + '…';

    const start  = Math.max(0, idx - len);
    const end    = Math.min(text.length, idx + term.length + len);
    const before = start > 0 ? '…' : '';
    const after  = end < text.length ? '…' : '';
    const ctx    = text.slice(start, end);

    // Highlight the match within context
    const re = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return before + ctx.replace(re, '<mark class="search-highlight">$1</mark>') + after;
  }

  // ── Fetch and index a single guide ────────────────────────────────────────
  async function fetchGuide(guide) {
    const url = CFG.guidesBase + guide.id + '.md';
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw  = await res.text();
      const { fm, body } = parseFrontmatter(raw);
      const text = stripMd(body);

      docStore[guide.id] = {
        id:          guide.id,
        name:        fm.name || guide.name,
        category:    guide.category,
        sub:         guide.sub,
        level:       guide.level,
        status:      guide.status,
        version:     fm.version || guide.version,
        description: fm.description || '',
        text,
      };
      return { id: guide.id, name: docStore[guide.id].name, body: text };
    } catch (err) {
      console.warn('[search] Failed to fetch', url, err.message);
      // Partial doc from manifest — still searchable by name/category
      docStore[guide.id] = {
        id:       guide.id,
        name:     guide.name,
        category: guide.category,
        sub:      guide.sub,
        level:    guide.level,
        status:   guide.status,
        version:  guide.version,
        text:     '',
      };
      return { id: guide.id, name: guide.name, body: '' };
    }
  }

  // ── Build Lunr index ──────────────────────────────────────────────────────
  async function buildIndex() {
    const docs = await Promise.all(GUIDE_MANIFEST.map(fetchGuide));

    lunrIndex = lunr(function () {
      this.ref('id');
      this.field('name',     { boost: 10 });
      this.field('category', { boost: 5  });
      this.field('body',     { boost: 1  });

      // Disable Lunr stemming for Russian-heavy content
      this.pipeline.remove(lunr.stemmer);
      this.searchPipeline.remove(lunr.stemmer);

      docs.forEach(d => this.add(d));
    });

    indexReady = true;
    dispatchEvent(new CustomEvent('ds:search-ready'));
  }

  // ── Search ────────────────────────────────────────────────────────────────
  function search(query) {
    if (!indexReady || !query.trim()) return [];

    const q   = query.trim();
    const qLo = q.toLowerCase();
    let results = [];

    // 1. Exact Lunr match
    try { results = lunrIndex.search(q); } catch (_) {}

    // 2. Wildcard prefix: "ст" → "ст*" matches "стабильный", "структура" etc.
    if (!results.length) {
      try {
        const wq = q.split(/\s+/).map(t => t + '*').join(' ');
        results = lunrIndex.search(wq);
      } catch (_) {}
    }

    // 3. Fuzzy ±1 for typo tolerance
    if (!results.length) {
      try {
        const fq = q.split(/\s+/).map(t => t + '~1').join(' ');
        results = lunrIndex.search(fq);
      } catch (_) {}
    }

    // 4. Substring fallback — scans docStore directly, catches mid-word matches
    //    e.g. "ст" inside "Состояния", "static", "states"
    if (!results.length) {
      results = Object.values(docStore)
        .filter(doc =>
          doc.name.toLowerCase().includes(qLo) ||
          (doc.text && doc.text.toLowerCase().includes(qLo))
        )
        .map(doc => ({ ref: doc.id, score: 0.5 }));
    }

    return results.slice(0, 8).map(r => {
      const doc = docStore[r.ref];
      return {
        ...doc,
        score:   r.score,
        context: extractContext(doc.text, q, CFG.contextLen),
        url:     CFG.guidePage + '?id=' + doc.id,
      };
    });
  }

  // ── Render results ────────────────────────────────────────────────────────
  function renderResults(results, query, containerEl) {
    if (!containerEl) return;

    if (!results.length) {
      containerEl.innerHTML =
        `<div class="search-empty">Ничего не найдено по запросу «${query}»</div>`;
      return;
    }

    containerEl.innerHTML = results.map(r => `
      <a class="search-result" href="${r.url}#search:${encodeURIComponent(query)}" data-id="${r.id}">
        <div class="search-result__header">
          <span class="search-result__name">${r.name}</span>
          <span class="search-result__meta">${[r.category, r.sub].filter(Boolean).join(' › ')}</span>
        </div>
        <p class="search-result__context">${r.context}</p>
      </a>
    `).join('');
  }

  // ── Wire up index.html search UI ─────────────────────────────────────────
  function initIndexSearch() {
    const input     = document.getElementById('search-input');
    const resultsEl = document.getElementById('search-results');
    if (!input || !resultsEl) return;

    function openDropdown()  { resultsEl.hidden = false; }
    function closeDropdown() { resultsEl.hidden = true; resultsEl.innerHTML = ''; }

    let debounceTimer;

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const q = input.value.trim();

        if (!q) { closeDropdown(); return; }

        openDropdown();

        if (!indexReady) {
          resultsEl.innerHTML = '<div class="search-empty">Индекс загружается…</div>';
          addEventListener('ds:search-ready', () => {
            renderResults(search(q), q, resultsEl);
          }, { once: true });
          return;
        }

        renderResults(search(q), q, resultsEl);
      }, 160);
    });

    // Close on Esc
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        input.value = '';
        closeDropdown();
        input.blur();
      }
      // Navigate to first result on Enter
      if (e.key === 'Enter') {
        const first = resultsEl.querySelector('.search-result');
        if (first) first.click();
      }
    });

    // Close when clicking outside the search wrapper
    document.addEventListener('click', e => {
      const wrapper = document.getElementById('search-wrapper') || input.closest('.search');
      if (wrapper && !wrapper.contains(e.target)) closeDropdown();
    });

    // Re-open dropdown on focus if there's a query
    input.addEventListener('focus', () => {
      if (input.value.trim() && resultsEl.innerHTML) openDropdown();
    });
  }

  // ── Handle highlight on guide page (hash #search:query) ──────────────────
  function handleGuideHighlight() {
    const hash = location.hash;
    if (!hash.startsWith('#search:')) return;
    const query = decodeURIComponent(hash.slice('#search:'.length));
    if (!query) return;

    // Dispatch to nav.js so it can highlight
    window.addEventListener('ds:content-ready', () => {
      dispatchEvent(new CustomEvent('ds:highlight-term', { detail: { term: query } }));
    }, { once: true });
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initIndexSearch();
    handleGuideHighlight();
    // Build index in background — don't block render
    if (typeof lunr !== 'undefined') {
      buildIndex().catch(err => console.error('[search] Index build failed', err));
    } else {
      console.warn('[search] Lunr not loaded — search unavailable');
    }
  });

  // ── Public API ────────────────────────────────────────────────────────────
  window.DSSearch = { search, manifest: GUIDE_MANIFEST, isReady: () => indexReady };

})();
