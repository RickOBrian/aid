/* ============================================================
   Guide Page — «Developer Guide» рендерер по Figma-референсу
   💎 🦆 DS — Шаблоны гайдов ДС · [AGENT] Developer Guide, node 2163:7276

   Секции (в порядке рендера):
   1. Guide Header Detailed — мокап, название, версия, статус, платформы
   2. Анатомия — callout-стейдж + легенда (переиспользует spec-anatomy__*)
   3. Скругления — agents.cornerRadius по каждому radius-токену
   4. Размеры и отступы — сначала все размерности, затем markup на размер
   5. Типы заливки — насыщенность/прозрачность одной семантической группы
   6. Appearance — цветовые варианты внутри типа заливки
   7. Состояния — default/hover/focus/pressed/disabled и т.п.
   8. Область тапа — hit area, если компонент тапабелен
   9. Ограничения — min/max width, кол-во строк и т.п.
   10. Анимация — переходы/транзишны, если применимо

   Секции 2–3 переиспользуют геометрию/визуал measure-agents.js —
   единый визуальный язык с component spec pages (spec-inspector.js).

   Использование:
     <div id="guide-page"></div>
     <script>
       window.DS_COMPONENT_GUIDE = { name, description, version, status,
         platforms, anatomy, radius, dimensions, sizes, fillTypes,
         appearance, states, tapArea, constraints, animation };
     </script>
     <script src="measure-agents.js"></script>
     <script src="guide-page.js"></script>
     <script>DSGuidePage.render(document.getElementById('guide-page'));</script>

   Любая секция кроме Header пропускается, если соответствующее поле
   не передано — «пустые секции не рендерятся» (тот же принцип, что и
   в spec-inspector.js).

   Анатомия/скругления/размеры-отступы/состояния выводятся из того же
   window.DS_COMPONENT_SPEC, что и engineering-аудит в spec-inspector.js,
   если явно не переданы в DS_COMPONENT_GUIDE — одна спека, два представления,
   без ручного дублирования данных при роллауте на новые страницы.
   ============================================================ */
(function () {
  'use strict';

  const agents = window.DSMeasureAgents;

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function swatchStyle(entry) {
    const bg = entry.bg ? `background: var(--${esc(entry.bg)});` : '';
    const color = entry.text ? `color: var(--${esc(entry.text)});` : '';
    const border = entry.border ? `border-color: var(--${esc(entry.border)});` : '';
    return `${bg}${color}${border}`;
  }

  /* ---------- derivation from DS_COMPONENT_SPEC ----------
     Радиус/размеры-отступы/состояния можно объявить явно в
     DS_COMPONENT_GUIDE, но по умолчанию выводятся из той же спеки,
     что и engineering-аудит (spec-inspector.js) — single source of
     truth, без ручного дублирования данных на страницах rollout. */

  function specPartLabel(partId) {
    const spec = window.DS_COMPONENT_SPEC;
    const part = spec && (spec.parts || []).find((p) => p.id === partId);
    return part ? part.label : partId;
  }

  function deriveRadius() {
    const spec = window.DS_COMPONENT_SPEC;
    const borders = spec && spec.aspects && spec.aspects.borders;
    if (!borders || !borders.length) return [];
    return borders
      .filter((entry) => /radius/i.test(String(entry.property || '')))
      .map((entry) => ({
        label: entry.part ? specPartLabel(entry.part) : null,
        // entry.part is a DS_COMPONENT_SPEC.parts id (engineering-audit
        // namespace, always includes 'root' with a real selector — see
        // spec-inspector.js), not a guide.anatomy id (visual-legend
        // namespace, which may omit 'root' or rename it e.g. 'container').
        // Carried through so mountRadiusPreviews() can look the real DOM
        // node up via spec.parts instead of the anatomy legend's ids.
        part: entry.part || null,
        token: entry.token,
        value: entry.value != null ? String(entry.value) : undefined,
      }));
  }

  // Legacy {size, value} radius rows (button-text.html, counter-value.html)
  // carry no design token, only a value string like '16px' or
  // 'pill (9999px)' — pull the first px number out so the preview can still
  // get a real border-radius + a resolvable arc instead of staying a plain
  // square. Returns null when nothing px-shaped is found.
  function parseLegacyRadiusPx(value) {
    if (value == null) return null;
    const match = String(value).match(/(\d+(?:\.\d+)?)\s*px/);
    return match ? parseFloat(match[1]) : null;
  }

  function deriveDimensions() {
    const spec = window.DS_COMPONENT_SPEC;
    const size = spec && spec.aspects && spec.aspects.size;
    if (!size || !size.length) return [];
    return size
      .filter((entry) => /width|height|ширина|высота/i.test(String(entry.property || '')))
      .map((entry) => ({
        label: entry.property,
        value: entry.token ? `var(--${entry.token})` : String(entry.value),
      }));
  }

  function classifySpacingEntry(prop) {
    const p = String(prop || '').toLowerCase();
    if (/^gap\b|(^|\s)gap(\s|$)|· gap/.test(p)) {
      return { type: 'gap', direction: /верт|vertical/.test(p) ? 'vertical' : 'horizontal' };
    }
    if (/margin-(top|bottom)/.test(p)) return null; // zone-offset — вне "Размеры и отступы"
    if (/верт|vertical|\(верт|padding-top|padding-bottom|inset-control-v|inset-container-v/.test(p)) {
      return { type: 'padding', direction: 'vertical' };
    }
    if (/гориз|horizontal|\(гориз|padding-left|padding-right|inset-control-h|inset-container-h/.test(p)) {
      return { type: 'padding', direction: 'horizontal' };
    }
    return null;
  }

  function deriveSizes() {
    const spec = window.DS_COMPONENT_SPEC;
    const spacing = spec && spec.aspects && spec.aspects.spacing;
    if (!spacing || !spacing.length) return [];

    const byPart = new Map();
    const push = (partId, item) => {
      if (!byPart.has(partId)) byPart.set(partId, []);
      byPart.get(partId).push(item);
    };

    spacing.forEach((entry) => {
      const partId = entry.part || '_global';
      const prop = String(entry.property || '').toLowerCase();
      if (/^padding$/.test(prop)) {
        // shorthand 'padding' (даже hardcode-нарушение) — раскладываем на
        // vertical/horizontal band, чтобы markup не терялся из-за формы записи
        const bits = String(entry.value == null ? '' : entry.value).trim().split(/\s+/);
        const v = bits[0];
        const h = bits[1] || bits[0];
        if (v) push(partId, { type: 'padding', direction: 'vertical', value: v, token: entry.token });
        if (h) push(partId, { type: 'padding', direction: 'horizontal', value: h, token: entry.token });
        return;
      }
      const cls = classifySpacingEntry(prop);
      if (!cls) return;
      push(partId, Object.assign({ token: entry.token, value: entry.value != null ? String(entry.value) : undefined }, cls));
    });

    const variants = [];
    byPart.forEach((entries, partId) => {
      if (!entries.length) return;
      variants.push({
        name: partId === '_global' || partId === 'root' ? null : specPartLabel(partId),
        spacing: entries,
      });
    });
    return variants;
  }

  const STATE_TEXT_DEFAULT = { hover: 'Оверлей над base-фоном страницы.', disabled: 'Opacity 40% + неинтерактивен.' };

  function deriveStates() {
    const spec = window.DS_COMPONENT_SPEC;
    const colors = spec && spec.aspects && spec.aspects.colors;
    if (!colors || !colors.length) return [];
    const byContext = new Map();
    colors.forEach((entry) => {
      const key = entry.context || 'default';
      if (!byContext.has(key)) byContext.set(key, {});
      const bucket = byContext.get(key);
      const prop = String(entry.property || '').toLowerCase();
      if (/background/.test(prop)) bucket.bg = entry.token;
      else if (/^color$/.test(prop) || /color \(/.test(prop)) bucket.text = entry.token;
    });
    const states = [];
    byContext.forEach((bucket, key) => {
      if (!bucket.bg) return; // без фона нет визуального swatch
      states.push({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        bg: bucket.bg,
        text: bucket.text || 'text-primary',
        description: STATE_TEXT_DEFAULT[key] || '',
      });
    });
    return states;
  }

  /* ---------- 1. Guide Header Detailed ---------- */

  const PLATFORM_LABEL = { ready: 'готово', planned: 'в планах', missing: 'нет' };

  function renderPlatformBadge(platform) {
    const status = ['ready', 'planned', 'missing'].includes(platform.status) ? platform.status : 'missing';
    const title = platform.note || PLATFORM_LABEL[status];
    return `<span class="guide-badge guide-badge--platform-${status}" title="${esc(title)}">${esc(platform.name)}</span>`;
  }

  function renderHeader(guide) {
    const status = guide.status === 'legacy' ? 'legacy' : 'stable';
    const statusLabel = status === 'legacy' ? 'Legacy' : 'Stable';
    const version = guide.version ? `Версия ${guide.version}${guide.version && !/stable|legacy/i.test(guide.version) ? `-${status}` : ''}` : null;
    const platforms = (guide.platforms || []).map(renderPlatformBadge).join('');

    return `
      <section class="guide-section guide-page-header">
        <div class="guide-page-header__mockup" aria-hidden="true">
          <span class="guide-page-header__mockup-label">Мокап в боевой среде</span>
          <span class="guide-page-header__mockup-hint">превью появится после интеграции скрина продукта</span>
        </div>
        <div class="guide-page-header__info">
          <div class="guide-page-header__text">
            <h1 class="guide-page-header__title">${esc(guide.name || 'Компонент')}</h1>
            ${guide.description ? `<p class="guide-page-header__desc">${esc(guide.description)}</p>` : ''}
          </div>
          <div class="guide-page-header__badges">
            ${version ? `<span class="guide-badge guide-badge--version">${esc(version)}</span>` : ''}
            <span class="guide-badge guide-badge--status-${status}">${esc(statusLabel)}</span>
            ${platforms}
          </div>
        </div>
      </section>`;
  }

  /* ---------- 2. Анатомия ---------- */

  function deriveAnatomy() {
    return (window.DS_COMPONENT_SPEC && window.DS_COMPONENT_SPEC.parts) || [];
  }

  function normalizeAnatomyPart(part, index) {
    return {
      id: part.id || part.partId || `part-${index + 1}`,
      label: part.label || part.part || part.name || `Part ${index + 1}`,
      description: part.description || '',
      selector: part.selector || part.target || null,
      targetType: part.targetType || null,
      optional: part.optional ?? part.isOptional,
      nested: part.nested || null,
      callout: part.callout || null,
      // Per-size availability + overrides (multi-size components, see
      // sizeSamples / partsForSize below). Absent `sizes` means "present in
      // every size" — the common case, so existing single-size pages need
      // no migration.
      sizes: Array.isArray(part.sizes) ? part.sizes.map(normalizeSizeId) : null,
      bySize: part.bySize || null,
    };
  }

  function normalizeAnatomyParts(guide) {
    const raw = pickOrDerive(guide, 'anatomy', deriveAnatomy);
    return raw.map(normalizeAnatomyPart);
  }

  function normalizeSizeId(value) {
    return String(value == null ? '' : value).trim().toLowerCase();
  }

  /* ---------- per-size samples (shared registry) ----------
     `guide.sizeSamples: [{ id, label, sample }]` — ONE ordered registry of
     real per-size markup for the whole page, written once and consumed by
     both the anatomy stage (size dropdown below) and the radius previews
     (renderRadius → mountRadiusPreviews' per-row sample override). Keeping
     it single means a size's markup is never transcribed twice and can't
     drift between the two sections. Absent registry → every consumer keeps
     its previous single-sample behaviour untouched. */

  function normalizeSizeSamples(guide) {
    return (guide.sizeSamples || [])
      .map((entry, index) => ({
        id: normalizeSizeId(entry.id || entry.size || `size-${index + 1}`),
        label: entry.label || entry.size || entry.id || `Size ${index + 1}`,
        sample: entry.sample || '',
      }))
      .filter((entry) => entry.sample);
  }

  function defaultSizeId(guide, sizeSamples) {
    const requested = normalizeSizeId(guide.anatomyDefaultSize);
    const match = sizeSamples.find((entry) => entry.id === requested);
    return (match || sizeSamples[0] || {}).id || '';
  }

  function sizeSampleHtml(guide, sizeLabelOrId) {
    const id = normalizeSizeId(sizeLabelOrId);
    if (!id) return '';
    const match = normalizeSizeSamples(guide).find((entry) => entry.id === id);
    return match ? match.sample : '';
  }

  /* A part participates in a given size unless it declares a `sizes`
     whitelist that excludes it — e.g. ButtonText's leading icon exists in
     large/medium/small only, its trailing chevron in tiny only. `bySize`
     patches whatever genuinely differs for that size (description, the
     required/optional flag, label) instead of duplicating the whole part
     list per size. */
  function partsForSize(guide, sizeId) {
    return normalizeAnatomyParts(guide)
      .filter((part) => !sizeId || !part.sizes || part.sizes.includes(sizeId))
      .map((part) => {
        const override = part.bySize && sizeId ? part.bySize[sizeId] : null;
        return override ? Object.assign({}, part, override) : part;
      });
  }

  function resolveAnatomySample(guide, sizeId) {
    // Registry first (multi-size pages): the anatomy stage shows the markup
    // of the size currently picked in the dropdown, so a size whose element
    // composition differs (ButtonText tiny — no icon, mandatory chevron) is
    // annotated against its OWN instance instead of the page's single
    // default one.
    const sizeSample = sizeSampleHtml(guide, sizeId);
    if (sizeSample) {
      const wrap = document.createElement('div');
      wrap.innerHTML = sizeSample;
      return wrap;
    }
    // guide.anatomyPreview is an explicit, anatomy-only override — takes
    // priority whenever set, even if #spec-sample also exists on the page.
    // #spec-sample is the shared Preview block (visible standalone section,
    // also read by spec-inspector.js for hit-area) and commonly holds more
    // instances than anatomy needs (e.g. all appearance × state variants);
    // anatomyPreview lets a page keep #spec-sample untouched while giving
    // the anatomy stage its own minimal instance set — see
    // anatomy-annotation-standard.md §4.1. Falls back to #spec-sample /
    // #guide-anatomy-sample when no override is provided.
    if (guide.anatomyPreview) {
      const wrap = document.createElement('div');
      wrap.innerHTML = guide.anatomyPreview;
      return wrap;
    }
    return document.getElementById('spec-sample') || document.getElementById('guide-anatomy-sample') || null;
  }

  function anatomyOverloadHtml(parts) {
    return parts.length > 4
      ? '⚠️ Более 4 элементов — риск визуального перегруза. Рассмотрите группировку (например, Container + Content вместо отдельных padding/text слоёв).'
      : '';
  }

  function anatomyLegendHtml(parts) {
    // Numbering follows the CURRENT size's part list, so badges on the stage
    // and rows in the legend renumber together when the size changes (tiny's
    // list starts at Text because it has no leading icon at all).
    return parts
      .map((part, i) => {
        if (agents && agents.anatomyLegendItem) {
          return agents.anatomyLegendItem({
            index: i + 1,
            title: part.label,
            description: part.description || '',
            nested: part.nested || null,
            optional: part.optional,
            partId: part.id,
            hasSelector: Boolean(part.selector),
          });
        }
        return `<div class="spec-anatomy__item"><span class="spec-anatomy__bullet">${i + 1}</span><div class="spec-anatomy__body"><p class="spec-anatomy__title">${esc(part.label)}</p></div></div>`;
      })
      .join('');
  }

  /* Size dropdown for the anatomy stage — rendered only when the page ships
     a `sizeSamples` registry with more than one entry, so single-size pages
     keep the exact markup they had before. Visual language is the existing
     presentbook one: the trigger reads as the same uppercase size chip used
     in «Скругления» (.spec-spatial-chip--token), the panel/options reuse
     .spec-select__* from the spec-inspector dropdowns. */
  function anatomySizeSelectHtml(sizeSamples, currentId) {
    if (sizeSamples.length < 2) return '';
    const current = sizeSamples.find((entry) => entry.id === currentId) || sizeSamples[0];
    const options = sizeSamples
      .map(
        (entry) => `
          <button type="button" role="option" class="spec-select__option${entry.id === current.id ? ' is-selected' : ''}"
                  aria-selected="${entry.id === current.id ? 'true' : 'false'}" data-size="${esc(entry.id)}">
            <span class="guide-anatomy-size__option-label">${esc(entry.label)}</span>
          </button>`
      )
      .join('');
    return `
      <div class="guide-anatomy-size" data-guide-anatomy-size>
        <span class="guide-anatomy-size__label" id="guide-anatomy-size-label">Размер</span>
        <div class="guide-anatomy-size__control">
          <button type="button" class="guide-anatomy-size__trigger" aria-haspopup="listbox" aria-expanded="false"
                  aria-labelledby="guide-anatomy-size-label" data-guide-anatomy-size-trigger>
            <span class="spec-spatial-chip spec-spatial-chip--token" data-guide-anatomy-size-current>${esc(current.label)}</span>
            <span class="spec-select__chevron" aria-hidden="true">▾</span>
          </button>
          <div class="guide-anatomy-size__panel spec-select__panel" role="listbox" aria-labelledby="guide-anatomy-size-label" hidden>${options}</div>
        </div>
      </div>`;
  }

  function renderAnatomy(guide) {
    const sizeSamples = normalizeSizeSamples(guide);
    const currentSize = defaultSizeId(guide, sizeSamples);
    const parts = partsForSize(guide, currentSize);
    if (!parts.length) return '';

    const overload = anatomyOverloadHtml(parts);

    return `
      <section class="guide-section" aria-labelledby="guide-anatomy-heading">
        <h2 class="guide-section__title" id="guide-anatomy-heading">Анатомия</h2>
        ${anatomySizeSelectHtml(sizeSamples, currentSize)}
        <p class="guide-anatomy__overload" data-guide-anatomy-overload${overload ? '' : ' hidden'}>${overload}</p>
        <div class="spec-anatomy">
          <div class="spec-anatomy__frame">
            <div class="spec-anatomy__stage" data-guide-anatomy-stage aria-label="Диаграмма анатомии компонента"></div>
          </div>
          <div class="spec-anatomy__legend">${anatomyLegendHtml(parts)}</div>
        </div>
      </section>`;
  }

  /* Click/keyboard wiring for the size dropdown. `onPick(sizeId)` gets the
     newly chosen size; the trigger chip label and option selection state are
     updated here so the caller only has to re-render the stage + legend. */
  function wireAnatomySizeSelect(root, sizeSamples, onPick) {
    const wrap = root && root.querySelector('[data-guide-anatomy-size]');
    if (!wrap) return;
    const trigger = wrap.querySelector('[data-guide-anatomy-size-trigger]');
    const panel = wrap.querySelector('.guide-anatomy-size__panel');
    const currentLabel = wrap.querySelector('[data-guide-anatomy-size-current]');
    if (!trigger || !panel) return;

    const close = () => {
      panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    };
    const open = () => {
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      const target = panel.querySelector('.is-selected') || panel.querySelector('.spec-select__option');
      if (target) target.focus();
    };

    trigger.addEventListener('click', () => (panel.hidden ? open() : close()));

    panel.addEventListener('click', (event) => {
      const option = event.target.closest('.spec-select__option');
      if (!option) return;
      const sizeId = option.dataset.size;
      panel.querySelectorAll('.spec-select__option').forEach((el) => {
        const selected = el === option;
        el.classList.toggle('is-selected', selected);
        el.setAttribute('aria-selected', String(selected));
      });
      const picked = sizeSamples.find((entry) => entry.id === sizeId);
      if (currentLabel && picked) currentLabel.textContent = picked.label;
      close();
      trigger.focus();
      onPick(sizeId);
    });

    panel.addEventListener('keydown', (event) => {
      const options = [...panel.querySelectorAll('.spec-select__option')];
      const index = options.indexOf(document.activeElement);
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
        const target = options[(next + options.length) % options.length];
        if (target) target.focus();
      } else if (event.key === 'Escape') {
        close();
        trigger.focus();
      }
    });

    document.addEventListener('click', (event) => {
      if (!panel.hidden && !wrap.contains(event.target)) close();
    });
  }

  function mountAnatomyStage(container, guide) {
    const stage = container && container.querySelector('[data-guide-anatomy-stage]');
    if (!stage || !agents) return;

    const sizeSamples = normalizeSizeSamples(guide);
    const legendRoot = container.querySelector('.spec-anatomy__legend');
    const overloadEl = container.querySelector('[data-guide-anatomy-overload]');
    let paint = () => {};

    // One code path for the initial mount and for every size switch — the
    // stage always shows the selected size's own sample, annotated with the
    // part list that size actually has (partsForSize), so numbers, callout
    // geometry and legend flags stay in sync by construction instead of
    // being kept aligned by hand.
    const mountSize = (sizeId) => {
      const sample = resolveAnatomySample(guide, sizeId);
      if (!sample) return;
      const sizeParts = partsForSize(guide, sizeId);
      const calloutParts = sizeParts.filter((part) => part.selector);

      stage.innerHTML = sample.innerHTML;
      stage.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
      stage.querySelectorAll('input, button, a').forEach((el) => el.setAttribute('tabindex', '-1'));

      if (legendRoot) legendRoot.innerHTML = anatomyLegendHtml(sizeParts);
      if (overloadEl) {
        const overload = anatomyOverloadHtml(sizeParts);
        overloadEl.textContent = overload;
        overloadEl.hidden = !overload;
      }

      // legendRoot is passed through so canvas hover (badge/line) and
      // legend-row hover drive the same is-active state — see
      // anatomyPartToggle. Re-wired on every size switch because the legend
      // rows above are brand-new nodes.
      paint = () => agents.mountAnatomyCallouts(stage, calloutParts, legendRoot);
      paint();
      if (agents.wireAnatomyLegend) agents.wireAnatomyLegend(stage, legendRoot);
      if (agents.wireAnatomyPartSwitches) {
        agents.wireAnatomyPartSwitches(stage, legendRoot, calloutParts, () => paint());
      }
    };

    mountSize(defaultSizeId(guide, sizeSamples));
    wireAnatomySizeSelect(container, sizeSamples, mountSize);

    let raf = null;
    window.addEventListener('resize', () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => paint());
    });
  }

  /* ---------- 3. Скругления ---------- */

  function pickOrDerive(guide, key, deriveFn) {
    // явно переданное поле (даже []) уважается как «раздел скрыт»;
    // отсутствующее поле — выводится из DS_COMPONENT_SPEC
    return Object.prototype.hasOwnProperty.call(guide, key) ? guide[key] || [] : deriveFn();
  }

  function renderRadius(guide) {
    const radius = pickOrDerive(guide, 'radius', deriveRadius);
    if (!radius.length || !agents) return '';
    const items = radius
      .map((entry) => {
        // Legacy rows have no entry.token — try to recover a real px value
        // from entry.value so the fallback box still gets a genuine
        // border-radius + arc instead of staying a plain square (see
        // parseLegacyRadiusPx / radius-preview-standard.md §4).
        const legacyPx = entry.token ? null : parseLegacyRadiusPx(entry.value);
        return agents.cornerRadius({
          tokenName: entry.token || entry.value || '—',
          value: entry.value || (entry.token ? `var(--${entry.token})` : '—'),
          radiusStyle: entry.token
            ? `border-radius: var(--${esc(entry.token)});`
            : legacyPx != null ? `border-radius: ${legacyPx}px;` : '',
          resolveToken: entry.token || (legacyPx != null ? 'legacy' : ''),
          // Engineering-namespace part id (DS_COMPONENT_SPEC.parts, always
          // has 'root') — lets mountRadiusPreviews() clone the real DOM node
          // instead of falling back to the generic preview box. Legacy rows
          // have no entry.part, so they correctly stay on the fallback box.
          radiusPart: entry.part || '',
          // Per-row real markup for THIS row's own size, so
          // mountRadiusPreviews() clones it instead of repeating the
          // page-wide anatomy sample's single size on every legacy
          // {size, value} row (see cornerRadius() / mountRadiusPreviews() in
          // measure-agents.js). Resolved from the page's shared sizeSamples
          // registry by `entry.size`, which the anatomy stage reads too —
          // one markup string per size for the whole page. `entry.sample`
          // stays supported as a row-local escape hatch for a row whose
          // markup genuinely isn't the registry's instance.
          sampleHtml: entry.sample || sizeSampleHtml(guide, entry.size),
          // entry.label — anatomy-part descriptor (token-schema entries);
          // entry.size — size-variant descriptor (legacy {size, value} rows,
          // e.g. button-text.html Large/Medium/Small/Tiny) — same chip slot.
          chip: entry.label || entry.size
            ? `<span class="spec-spatial-chip spec-spatial-chip--token">${esc(entry.label || entry.size)}</span>`
            : '',
        });
      })
      .join('');
    return `
      <section class="guide-section" aria-labelledby="guide-radius-heading">
        <h2 class="guide-section__title" id="guide-radius-heading">Скругления</h2>
        <div class="guide-block" style="flex-direction:row;flex-wrap:wrap;justify-content:center">${items}</div>
      </section>`;
  }

  /* ---------- 4. Размеры и отступы ---------- */

  function renderDimensionChip(dim) {
    return `<span class="guide-dim-chip"><span class="guide-dim-chip__label">${esc(dim.label)}</span><span class="guide-dim-chip__value">${esc(dim.value)}</span></span>`;
  }

  function gapPadAgentOptions(entry) {
    return {
      tokenName: entry.token || 'hardcode',
      value: entry.value || (entry.token ? `var(--${entry.token})` : '—'),
      bandSize: entry.bandSize,
    };
  }

  function paddingAgent(entry) {
    if (!entry || !agents) return '';
    return agents.gapsAndPaddings(Object.assign(
      { type: 'padding', direction: entry.direction === 'horizontal' ? 'horizontal' : 'vertical' },
      gapPadAgentOptions(entry)
    ));
  }

  function gapAgent(entry) {
    if (!entry || !agents) return '';
    return agents.gapsAndPaddings(Object.assign(
      { type: 'gap', direction: entry.direction === 'vertical' ? 'vertical' : 'horizontal' },
      gapPadAgentOptions(entry)
    ));
  }

  function renderSizeVariant(variant) {
    const dims = (variant.dimensions || []).map(renderDimensionChip).join('');
    const spacing = variant.spacing || [];
    const paddingEntries = spacing.filter((e) => e.type !== 'gap');
    const gapEntries = spacing.filter((e) => e.type === 'gap');

    const vAgent = paddingAgent(paddingEntries.find((e) => e.direction !== 'horizontal'));
    const hAgent = paddingAgent(paddingEntries.find((e) => e.direction === 'horizontal'));

    const insetBlock = vAgent || hAgent
      ? `
        <div class="spec-inset-diagram spec-inset-diagram--agents">
          ${vAgent ? `<div class="spec-inset-diagram__agent-slot spec-inset-diagram__agent-slot--v">${vAgent}</div>` : ''}
          <div class="spec-inset-diagram__agent-row">
            ${hAgent ? `<div class="spec-inset-diagram__agent-slot spec-inset-diagram__agent-slot--h">${hAgent}</div>` : ''}
            <div class="spec-inset-diagram__content">контент</div>
          </div>
        </div>`
      : '';

    const gapBlocks = gapEntries
      .map(
        (entry) => `
        <div class="spec-gap-diagram__bridge">
          <span class="spec-gap-diagram__cell">slot A</span>
          ${gapAgent(entry)}
          <span class="spec-gap-diagram__cell">slot B</span>
        </div>`
      )
      .join('');

    return `
      <div class="guide-size-variant">
        ${variant.name ? `<p class="guide-size-variant__label">${esc(variant.name)}</p>` : ''}
        ${dims ? `<div class="guide-dim-row">${dims}</div>` : ''}
        ${insetBlock || gapBlocks ? `<div class="guide-block guide-size-variant__stage">${insetBlock}${gapBlocks}</div>` : ''}
      </div>`;
  }

  function renderSizes(guide) {
    const dims = pickOrDerive(guide, 'dimensions', deriveDimensions);
    const sizes = pickOrDerive(guide, 'sizes', deriveSizes);
    if (!dims.length && !sizes.length) return '';

    const dimsBlock = dims.length
      ? `<div class="guide-dim-row">${dims.map(renderDimensionChip).join('')}</div>`
      : '';
    const sizeBlocks = sizes.map(renderSizeVariant).join('');

    return `
      <section class="guide-section" aria-labelledby="guide-sizes-heading">
        <h2 class="guide-section__title" id="guide-sizes-heading">Размеры и отступы</h2>
        ${dimsBlock}
        ${sizeBlocks}
      </section>`;
  }

  /* ---------- 5. Типы заливки ---------- */

  function renderFillTypes(guide) {
    if (!guide.fillTypes || !guide.fillTypes.length) return '';
    const cards = guide.fillTypes
      .map((type) => {
        const sample = `<span class="guide-swatch-card__sample" style="${swatchStyle(type)}">${esc(type.sample || 'Aa')}</span>`;
        const wrapped = type.backdrop
          ? `<span class="guide-swatch-card__sample" style="background:var(--${esc(type.backdrop)});padding:10px;height:auto;border:none">${sample}</span>`
          : sample;
        return `
        <div class="guide-swatch-card">
          ${wrapped}
          <p class="guide-swatch-card__name">${esc(type.name)}</p>
          ${type.description ? `<p class="guide-swatch-card__desc">${esc(type.description)}</p>` : ''}
        </div>`;
      })
      .join('');
    return `
      <section class="guide-section" aria-labelledby="guide-fill-types-heading">
        <h2 class="guide-section__title" id="guide-fill-types-heading">Типы заливки</h2>
        <p class="guide-section__lead">Тип заливки — насыщенность заполнения одной семантической группы: от плотной (Solid) до пастельной (Ghost) или инверсной для контраста на цветном фоне.</p>
        <div class="guide-block"><div class="guide-swatch-grid">${cards}</div></div>
      </section>`;
  }

  /* ---------- 6. Appearance ---------- */

  function renderAppearance(guide) {
    if (!guide.appearance || !guide.appearance.length) return '';
    const groups = guide.appearance
      .map((group) => {
        const cards = (group.variants || [])
          .map(
            (variant) => `
            <div class="guide-swatch-card">
              <span class="guide-swatch-card__sample" style="${swatchStyle(variant)}">${esc(variant.sample || 'Aa')}</span>
              <p class="guide-swatch-card__name">${esc(variant.name)}</p>
            </div>`
          )
          .join('');
        return `
          <div class="guide-appearance-group">
            <p class="guide-appearance-group__label">${esc(group.fillType || group.name)}</p>
            <div class="guide-swatch-grid">${cards}</div>
          </div>`;
      })
      .join('');
    return `
      <section class="guide-section" aria-labelledby="guide-appearance-heading">
        <h2 class="guide-section__title" id="guide-appearance-heading">Appearance</h2>
        <p class="guide-section__lead">Appearance — цветовой вариант внутри одного типа заливки: меняется значение цвета (например, Main → Success), не его насыщенность. Не каждый appearance доступен в каждом типе заливки.</p>
        <div class="guide-block">${groups}</div>
      </section>`;
  }

  /* ---------- 7. Состояния ---------- */

  function renderStates(guide) {
    const states = pickOrDerive(guide, 'states', deriveStates);
    if (!states.length) return '';
    const cards = states
      .map(
        (state) => `
        <div class="guide-swatch-card">
          <span class="guide-swatch-card__sample" style="${swatchStyle(state)}">${esc(state.sample || 'Aa')}</span>
          <p class="guide-swatch-card__name">${esc(state.name)}</p>
          ${state.description ? `<p class="guide-swatch-card__desc">${esc(state.description)}</p>` : ''}
        </div>`
      )
      .join('');
    return `
      <section class="guide-section" aria-labelledby="guide-states-heading">
        <h2 class="guide-section__title" id="guide-states-heading">Состояния</h2>
        <div class="guide-block"><div class="guide-swatch-grid">${cards}</div></div>
      </section>`;
  }

  /* ---------- 8. Область тапа ---------- */

  function renderTapArea(guide) {
    if (!guide.tapArea) return '';
    const value = guide.tapArea.value ? `<span class="guide-tap-area__value">${esc(guide.tapArea.value)}</span>` : '';
    return `
      <section class="guide-section" aria-labelledby="guide-tap-area-heading">
        <h2 class="guide-section__title" id="guide-tap-area-heading">Область тапа</h2>
        <div class="guide-tap-area">
          ${agents && guide.tapArea.value ? agents.widthHeight({ type: 'width', value: guide.tapArea.value }) : ''}
          <p class="guide-tap-area__text">${esc(guide.tapArea.text || 'За область тапа отвечает физический размер компонента.')} ${value}</p>
        </div>
      </section>`;
  }

  /* ---------- 9. Ограничения ---------- */

  function renderConstraints(guide) {
    if (!guide.constraints || !guide.constraints.length) return '';
    const rows = guide.constraints
      .map(
        (row) => `
        <div class="guide-constraints__row">
          <dt>${esc(row.label)}</dt>
          <dd>${row.value}</dd>
        </div>`
      )
      .join('');
    return `
      <section class="guide-section" aria-labelledby="guide-constraints-heading">
        <h2 class="guide-section__title" id="guide-constraints-heading">Ограничения</h2>
        <div class="guide-constraints">${rows}</div>
      </section>`;
  }

  /* ---------- 10. Анимация ---------- */

  function renderAnimation(guide) {
    if (!guide.animation) return '';
    return `
      <section class="guide-section" aria-labelledby="guide-animation-heading">
        <h2 class="guide-section__title" id="guide-animation-heading">Анимация</h2>
        <p class="guide-animation__text">${esc(guide.animation.text || guide.animation)}</p>
      </section>`;
  }

  function render(container, guideArg) {
    const guide = guideArg || window.DS_COMPONENT_GUIDE;
    if (!container || !guide) return;

    const sections = [
      renderHeader(guide),
      renderAnatomy(guide),
      renderRadius(guide),
      renderSizes(guide),
      renderFillTypes(guide),
      renderAppearance(guide),
      renderStates(guide),
      renderTapArea(guide),
      renderConstraints(guide),
      renderAnimation(guide),
    ].filter(Boolean);

    container.innerHTML = `<div class="guide-page">${sections.join('')}</div>`;
    mountAnatomyStage(container, guide);
    // Swap generic radius-preview boxes for a real clone of the component's
    // own DOM node wherever one resolves (spec.parts selector match against
    // the same anatomy sample) — see mountRadiusPreviews() in
    // measure-agents.js and radius-preview-standard.md §4. Must run before
    // resolveRadiusArcs() so the arc math reads the clone's real geometry,
    // not the empty fallback box's.
    if (agents && agents.mountRadiusPreviews) {
      // Page-wide fallback sample for rows without their own per-row markup:
      // the default size's registry entry when there is one, else the single
      // anatomyPreview/#spec-sample as before.
      const fallbackSample = resolveAnatomySample(guide, defaultSizeId(guide, normalizeSizeSamples(guide)));
      agents.mountRadiusPreviews(container, fallbackSample, normalizeAnatomyParts(guide));
    }
    // Static section, computed once against the just-inserted previews'
    // real rendered geometry — see resolveRadiusArcs() in measure-agents.js.
    if (agents && agents.resolveRadiusArcs) agents.resolveRadiusArcs(container);
  }

  window.DSGuidePage = { render };
})();
