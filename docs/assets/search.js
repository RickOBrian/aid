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
      // Note: frontmatter already stripped by parseFrontmatter — do NOT apply
      // /^---[\s\S]*?---/m here; guides have many --- dividers that would be eaten.
      .replace(/```[\s\S]*?```/gm, '')          // fenced code
      .replace(/<style[\s\S]*?<\/style>/gi, '') // inline <style> blocks (illustration CSS)
      .replace(/<[^>]+>/g, ' ')                 // HTML tags → space
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

      // Disable stemmer and trimmer — trimmer strips Cyrillic (uses \W which
      // matches non-ASCII), so all Russian tokens become empty strings.
      this.pipeline.remove(lunr.stemmer);
      this.pipeline.remove(lunr.trimmer);
      this.searchPipeline.remove(lunr.stemmer);
      this.searchPipeline.remove(lunr.trimmer);

      docs.forEach(d => this.add(d));
    });

    indexReady = true;
    console.log('[DS Search] index ready. docs=' + Object.keys(docStore).length +
      ' total textLen=' + Object.values(docStore).reduce((s, d) => s + (d.text ? d.text.length : 0), 0));
    dispatchEvent(new CustomEvent('ds:search-ready'));
  }

  // ── Search ────────────────────────────────────────────────────────────────
  function search(query) {
    // Debug logs fire BEFORE any early return so they're always visible
    console.log('[DS Search] called. indexReady=' + indexReady + ' query=' + JSON.stringify(query));
    if (!search._debugged && indexReady) {
      search._debugged = true;
      const storeInfo = Object.values(docStore).map(d =>
        d.id + ': textLen=' + (d.text ? d.text.length : 0)
      );
      console.log('[DS Search] docStore:', storeInfo.join(' | '));
    }

    if (!indexReady || !query.trim()) return [];

    const q   = query.trim();
    const qLo = q.toLowerCase();

    // ── Lunr pass (Latin / short-form matches) ────────────────────────────
    let lunrResults = [];

    // 1. Exact
    try { lunrResults = lunrIndex.search(q); } catch (_) {}

    // 2. Wildcard prefix: "ст*"
    if (!lunrResults.length) {
      try {
        lunrResults = lunrIndex.search(q.split(/\s+/).map(t => t + '*').join(' '));
      } catch (_) {}
    }

    // 3. Fuzzy ±1
    if (!lunrResults.length) {
      try {
        lunrResults = lunrIndex.search(q.split(/\s+/).map(t => t + '~1').join(' '));
      } catch (_) {}
    }

    // ── Substring pass — always runs, critical for Cyrillic ───────────────
    // Lunr's pipeline removes Cyrillic tokens even without trimmer in some
    // environments; substring scan on raw text is the reliable fallback.
    const subResults = Object.values(docStore)
      .filter(doc => {
        const nameMatch = doc.name.toLowerCase().includes(qLo);
        const textMatch = !!(doc.text && doc.text.toLowerCase().includes(qLo));
        console.log('[DS Search] substr check', doc.id,
          '| name:', JSON.stringify(doc.name.slice(0, 30)),
          '| textLen:', doc.text ? doc.text.length : 0,
          '| nameMatch:', nameMatch, '| textMatch:', textMatch);
        return nameMatch || textMatch;
      })
      .map(doc => ({ ref: doc.id, score: 0.5 }));

    // Merge: Lunr first (higher relevance), then substring-only additions
    const seen   = new Set(lunrResults.map(r => r.ref));
    const merged = [...lunrResults, ...subResults.filter(r => !seen.has(r.ref))];

    return merged.slice(0, 8).map(r => {
      const doc = docStore[r.ref];
      if (!doc) return null;
      return {
        ...doc,
        score:   r.score,
        context: extractContext(doc.text || '', q, CFG.contextLen),
        url:     CFG.guidePage + '?id=' + doc.id,
      };
    }).filter(Boolean);
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

    function triggerSearch() {
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
    }

    // Use both events: 'input' may be suppressed for Cyrillic in Yandex Browser
    // when compositionstart fires without compositionend. 'keyup' is the fallback.
    input.addEventListener('input', triggerSearch);
    input.addEventListener('keyup',  triggerSearch);

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
  window.DSSearch = {
    search,
    manifest: GUIDE_MANIFEST,
    isReady:  () => indexReady,
    // Debug helper — run DSSearch.debug('ст') in browser console
    debug(q) {
      const qLo = (q || '').toLowerCase();
      return Object.values(docStore).map(d => ({
        id:        d.id,
        textLen:   d.text ? d.text.length : 0,
        textSample: d.text ? d.text.slice(0, 120) : '(empty)',
        nameMatch: d.name.toLowerCase().includes(qLo),
        textMatch: !!(d.text && d.text.toLowerCase().includes(qLo)),
      }));
    },
  };

})();
