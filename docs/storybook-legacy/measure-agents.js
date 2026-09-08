/* ============================================================
   DS Measure Agents — визуальные маркеры из Figma [AGENT] kit
   💎 🦆 DS — Шаблоны гайдов ДС · node 2507:1085

   Компоненты:
   - gapsAndPaddings — inset (синий) / gap (розовый), vert / horiz
   - widthHeight      — габариты width / height
   - cornerRadius     — скругление угла
   - anatomyMarker    — zone offset / callout с точкой и линией
   - anatomyLegendItem — строка Guide List для блока «Анатомия»

   Measure kit: node 2507:1085 · Anatomy guide: node 16:3754 (rq3uQ09lNx8bRShWUO1oaP)
   ============================================================ */
(function () {
  'use strict';

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function entryAttr(entryId) {
    return entryId ? ` data-entry="${esc(entryId)}"` : '';
  }

  function chipHtml(chip) {
    return chip || '';
  }

  /**
   * [AGENT] Gaps-and-Paddings
   * type: 'gap' | 'padding'
   * direction: 'vertical' | 'horizontal'
   */
  function gapsAndPaddings(options) {
    const type = options.type === 'padding' ? 'padding' : 'gap';
    const direction = options.direction === 'horizontal' ? 'horizontal' : 'vertical';
    const tokenName = options.tokenName || '—';
    const value = options.value != null ? String(options.value) : '—';
    const bandSize = options.bandSize || (direction === 'vertical' ? '24px' : '32px');
    const chip = options.chip || '';
    const entryId = options.entryId || '';

    return `
      <div class="ds-agent-gap-pad ds-agent-gap-pad--${type} ds-agent-gap-pad--${direction}"${entryAttr(entryId)} style="--ds-agent-band-size:${esc(bandSize)}">
        <span class="ds-agent-gap-pad__band" aria-hidden="true"></span>
        <span class="ds-agent-gap-pad__bubble">
          ${chipHtml(chip)}
          <span class="ds-agent-gap-pad__token">${esc(tokenName)}</span>
          <span class="ds-agent-gap-pad__value">${esc(value)}</span>
        </span>
      </div>`;
  }

  /**
   * [AGENT] Width-Height
   * type: 'width' | 'height'
   */
  function widthHeight(options) {
    const type = options.type === 'width' ? 'width' : 'height';
    const value = options.value != null ? String(options.value) : '—';
    const entryId = options.entryId || '';

    return `
      <div class="ds-agent-dimension ds-agent-dimension--${type}"${entryAttr(entryId)}>
        <span class="ds-agent-dimension__line" aria-hidden="true"></span>
        <span class="ds-agent-dimension__bubble">${esc(value)}</span>
      </div>`;
  }

  /**
   * [AGENT] Corner-Radius
   */
  function cornerRadius(options) {
    const tokenName = options.tokenName || '—';
    const value = options.value != null ? String(options.value) : '—';
    const radiusStyle = options.radiusStyle || '';
    const chip = options.chip || '';
    const entryId = options.entryId || '';
    const resolveToken = options.resolveToken || '';
    // DS_COMPONENT_SPEC.parts id (engineering-audit namespace, always has
    // 'root' with a real selector) — read by mountRadiusPreviews() to try
    // cloning the real DOM node instead of leaving the generic fallback box.
    const radiusPart = options.radiusPart || '';
    // Legacy {size, value} radius tables (button-text.html, counter-value.html)
    // list several SIZE VARIANTS of the same part (Large/Medium/Small/Tiny —
    // all part: 'root') against a single page-wide anatomy sample that is
    // only ever ONE size. Without an override, mountRadiusPreviews() would
    // clone that same single instance into every row, so every row draws an
    // identical arc regardless of its own label (e.g. the "Tiny — pill
    // 9999px" row would show the Large sample's plain rounded-rect corner,
    // not a pill). `sampleHtml` lets a row carry its OWN small real-markup
    // snippet (e.g. `sbt sbt--tiny`) so mountRadiusPreviews() clones from it
    // instead of the shared sample — see mountRadiusPreviews() below.
    const sampleHtml = options.sampleHtml || '';
    // Entries without a real design token (legacy {size, value} rows) pass
    // the same string as both tokenName and value — showing both lines
    // would just repeat it twice ("16px 16px"). Show the token-name line
    // only when it actually carries information distinct from the value.
    const showToken = tokenName !== '—' && tokenName !== value;

    return `
      <div class="ds-agent-radius"${entryAttr(entryId)}>
        <div class="ds-agent-radius__preview"${radiusStyle ? ` style="${radiusStyle}"` : ''}${resolveToken ? ` data-resolve-radius="${esc(resolveToken)}"` : ''}${radiusPart ? ` data-radius-part="${esc(radiusPart)}"` : ''}${sampleHtml ? ` data-radius-sample-html="${esc(sampleHtml)}"` : ''}>
          <span class="ds-agent-radius__arc" aria-hidden="true"></span>
        </div>
        <span class="ds-agent-radius__bubble">
          ${chipHtml(chip)}
          ${showToken ? `<span class="ds-agent-radius__token">${esc(tokenName)}</span>` : ''}
          <span class="ds-agent-radius__value">${esc(value)}</span>
        </span>
      </div>`;
  }

  /**
   * [AGENT] Radius-preview real-component mount
   *
   * Swaps the generic .ds-agent-radius__preview box for a clone of the
   * component's own real DOM node, so the arc traces an actual rendered
   * corner (pill Switch track, rounded Card surface, …) instead of an
   * abstract 72×56 rectangle — see radius-preview-standard.md §4.
   *
   * Lookup order per [data-radius-part]:
   *  1. window.DS_COMPONENT_SPEC.parts (engineering-audit namespace — the
   *     same one aspects.borders[].part already references, always has a
   *     'root' entry with a real selector, e.g. '.switch', '.card').
   *  2. 'root' with no spec.parts match → sample.firstElementChild — last
   *     resort for a sample assembled without a matching spec.parts entry.
   *  3. Any other id with no spec.parts match → guide.anatomy's own
   *     `parts` (legend namespace), in case a page defines the part only
   *     there.
   * No match at all → leave the static fallback box untouched.
   *
   * Per-row sample override (`data-radius-sample-html`, see cornerRadius()):
   * a legacy size-variant row (Large/Medium/Small/Tiny, all the same
   * `part`) parses its OWN markup into a private detached wrapper and
   * resolves `sourceEl` against THAT instead of the shared `sample` — so
   * each row clones the real node for its own size instead of every row
   * repeating whichever single instance the page-wide sample happens to be.
   */
  function mountRadiusPreviews(container, sample, parts) {
    if (!container) return;
    const spec = window.DS_COMPONENT_SPEC;

    container.querySelectorAll('[data-radius-part]').forEach((previewEl) => {
      const partId = previewEl.dataset.radiusPart;
      const specPart = spec && (spec.parts || []).find((p) => p.id === partId);

      let rowSample = sample;
      if (previewEl.dataset.radiusSampleHtml) {
        rowSample = document.createElement('div');
        rowSample.innerHTML = previewEl.dataset.radiusSampleHtml;
      }
      if (!rowSample) return;

      let sourceEl = null;
      if (specPart && specPart.selector) sourceEl = rowSample.querySelector(specPart.selector);
      if (!sourceEl && partId === 'root') sourceEl = rowSample.firstElementChild || null;
      if (!sourceEl) {
        const anatomyPart = (parts || []).find((p) => p.id === partId);
        if (anatomyPart && anatomyPart.selector) sourceEl = rowSample.querySelector(anatomyPart.selector);
      }
      if (!sourceEl) return;

      const clone = sourceEl.cloneNode(true);
      clone.removeAttribute('id');
      clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
      clone.querySelectorAll('input, button, a').forEach((el) => el.setAttribute('tabindex', '-1'));
      clone.classList.add('ds-agent-radius__clone');

      previewEl.classList.add('ds-agent-radius__preview--real');
      previewEl.innerHTML = '';
      previewEl.appendChild(clone);

      // Re-create the arc host removed by the innerHTML reset above —
      // resolveRadiusArcs() below finds it the same way for a real clone
      // or the untouched fallback box.
      const arcHost = document.createElement('span');
      arcHost.className = 'ds-agent-radius__arc';
      arcHost.setAttribute('aria-hidden', 'true');
      previewEl.appendChild(arcHost);
    });
  }

  // Purely cosmetic gap between the drawn arc and the target's real corner
  // — the arc is a separate visual callout, not a redraw of the border
  // itself, so it must float just outside the real edge instead of fusing
  // with it. Tune freely; every preview uses the same value so the "hover
  // gap" reads consistently across tokens/components.
  const RADIUS_ARC_OUTSET = 4;

  /**
   * [AGENT] Corner-Radius arc geometry sync
   *
   * .ds-agent-radius__arc is an SVG quarter-circle <path>, not a CSS
   * border/border-radius trick — a `border-top-right-radius: inherit`
   * corner box only reads the *unclamped* token value, decoupled from the
   * box's own rendered size, so the curve and the real corner drift apart
   * (this is exactly the bug this function exists to prevent). The path is
   * built fresh from the real rendered geometry of whichever element the
   * arc sits on — either a real cloned component node (see
   * mountRadiusPreviews) or the generic fallback box — so both go through
   * the same math and the same visual result:
   *
   *  1. `target` = `.ds-agent-radius__clone` if mountRadiusPreviews()
   *     mounted a real component, else the `.ds-agent-radius__preview`
   *     box itself.
   *  2. `radius` = `min(realRadiusPx, min(target.width, target.height) / 2)`
   *     — realRadiusPx read via `getComputedStyle(target).borderTopRightRadius`,
   *     the actual used px value; the /2 clamp matches what the browser
   *     itself applies once a uniform radius exceeds half the shorter side
   *     (e.g. radius-full on a non-square target). This single scalar
   *     drives BOTH axes (width/height of the arc box, and both the rx and
   *     ry of the SVG arc command) — never derive a separate width-based
   *     and height-based value, or a non-square target (a wide pill Chip/
   *     Badge, not just a square Switch) draws an ellipse instead of a
   *     true quarter-circle.
   *  3. The path traces a circle around the SAME center as the target's
   *     real corner curvature (`(targetRect.right - radius, targetRect.top
   *     + radius)`), just with its radius grown to `radius +
   *     RADIUS_ARC_OUTSET` — a same-center, bigger-radius circle is the
   *     only offset that stays perpendicular-uniform (a true "hover"
   *     distance) around the *entire* visible quarter, on every target
   *     shape. Translating the same-size circle diagonally by the outset
   *     (the previous approach) keeps that property for an isolated
   *     rounded-rect corner (radius ≪ target size) but silently breaks it
   *     for a pill/circle target (`radius === min(width, height) / 2`,
   *     e.g. CounterValue, Switch, radius-full chips): there the "corner"
   *     IS the whole boundary, so a center-shifted copy visibly drifts off
   *     the real circle instead of floating uniformly outside it. Keeping
   *     the center fixed and growing the radius fixes both cases with the
   *     same formula — no shape-specific branch needed.
   *  4. `.ds-agent-radius__arc` is kept as a *sibling* of the target inside
   *     `.ds-agent-radius__preview` (never injected into the clone itself,
   *     so a component's own `position` context is never touched) and
   *     positioned via `top`/`right` deltas between the target's and the
   *     preview's `getBoundingClientRect()`, minus the outset.
   *  5. The path's two endpoints sit exactly on two adjoining edges of its
   *     own SVG viewport (`(0,0)` and `(drawRadius,drawRadius)`), so the
   *     2px stroke's half-width bleeds ~1px past the viewport at each
   *     endpoint. `<svg>` defaults to `overflow: hidden` in the UA
   *     stylesheet, which shaves that sliver off the two tips — fixed once
   *     in CSS (`.ds-agent-radius__arc-svg { overflow: visible }`, see
   *     storybook-spec-inspector.css) rather than by padding every path's
   *     coordinates here, since none of the ancestors up to
   *     `.storybook-layout` clip (all `overflow: visible`), so nothing
   *     downstream needs the arc to stay confined to its own box.
   *
   * Static demonstration section (Guide Page «Скругления», not the
   * anatomy halo) — run once after every `.ds-agent-radius__preview` on
   * the page has its inline border-radius (and, if any, its real clone)
   * in place; no hover/resize recompute needed.
   */
  function resolveRadiusArcs(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('[data-resolve-radius]').forEach((previewEl) => {
      const arcHost = previewEl.querySelector('.ds-agent-radius__arc');
      if (!arcHost) return;

      const target = previewEl.querySelector('.ds-agent-radius__clone') || previewEl;
      const targetRect = target.getBoundingClientRect();
      const previewRect = previewEl.getBoundingClientRect();
      if (!targetRect.width || !targetRect.height) return;

      const realRadiusPx = parseFloat(getComputedStyle(target).borderTopRightRadius) || 0;
      const radius = Math.max(0, Math.min(realRadiusPx, Math.min(targetRect.width, targetRect.height) / 2));

      if (radius <= 0) {
        arcHost.innerHTML = '';
        return;
      }

      // Same-center, bigger-radius circle (see point 3 above) — the arc
      // box's own size grows to this new radius on both axes.
      const drawRadius = radius + RADIUS_ARC_OUTSET;

      // CSS `top`/`right` on an absolutely-positioned child are measured from
      // the *padding* edge of its positioned ancestor (`previewEl`), not from
      // the border-box that getBoundingClientRect() returns — so a preview
      // with its own border (the fallback box's `border: 2px solid`) eats
      // into the offset unless compensated here. Real-clone previews have
      // `border: none` (see storybook-spec-inspector.css), so this is a
      // no-op for them and only matters for the fallback box.
      const previewBorderTop = parseFloat(getComputedStyle(previewEl).borderTopWidth) || 0;
      const previewBorderRight = parseFloat(getComputedStyle(previewEl).borderRightWidth) || 0;

      arcHost.style.top = `${targetRect.top - previewRect.top - RADIUS_ARC_OUTSET - previewBorderTop}px`;
      arcHost.style.right = `${previewRect.right - targetRect.right - RADIUS_ARC_OUTSET - previewBorderRight}px`;
      arcHost.style.width = `${drawRadius}px`;
      arcHost.style.height = `${drawRadius}px`;

      // Local box coordinates, drawRadius×drawRadius: start at the box's own
      // top-left corner (0,0), sweep clockwise to its bottom-right corner
      // (drawRadius,drawRadius) around a center at (0,drawRadius) — that
      // center, translated back to page coordinates, lands exactly on the
      // target's real corner-curvature center (see point 3), so the curve
      // is a uniform radial offset of the real corner, not a diagonal copy.
      arcHost.innerHTML = `<svg class="ds-agent-radius__arc-svg" width="${drawRadius}" height="${drawRadius}" viewBox="0 0 ${drawRadius} ${drawRadius}" aria-hidden="true"><path d="M 0 0 A ${drawRadius} ${drawRadius} 0 0 1 ${drawRadius} ${drawRadius}"/></svg>`;
    });
  }

  /**
   * [AGENT] Anatomy-Marker
   * position: 'left' | 'right' | 'top' | 'bottom'
   */
  function anatomyMarker(options) {
    const position = ['left', 'right', 'top', 'bottom'].includes(options.position)
      ? options.position
      : 'left';
    const label = options.label != null ? String(options.label) : '—';
    const chip = options.chip || '';
    const entryId = options.entryId || '';

    return `
      <div class="ds-agent-marker ds-agent-marker--${position}"${entryAttr(entryId)}>
        <span class="ds-agent-marker__dot" aria-hidden="true"></span>
        <span class="ds-agent-marker__line" aria-hidden="true"></span>
        <span class="ds-agent-marker__bubble">
          ${chipHtml(chip)}
          <span class="ds-agent-marker__label">${esc(label)}</span>
        </span>
      </div>`;
  }

  function anatomyLegendItem(options) {
    const index = options.index != null ? String(options.index) : '1';
    const title = options.title || '—';
    const description = options.description || '';
    const nested = options.nested || null;
    const optional = options.optional;
    const partId = options.partId || '';
    // Whether this Item resolves to a real DOM node in the current sample —
    // only then can the switch actually hide/show something on canvas. An
    // optional Item without one (e.g. a nested DS component referenced by
    // name only, not wired into the live sample markup) gets a disabled
    // switch with an explanatory title instead of a non-functional control —
    // see toggleAnatomyPart / wireAnatomyPartSwitches below.
    const hasSelector = options.hasSelector !== false;

    let titleHtml;
    if (nested) {
      const label = `❖ ${nested.name}`;
      titleHtml = nested.href
        ? `<p class="spec-anatomy__title spec-anatomy__title--nested"><a href="${esc(nested.href)}">${esc(label)}</a></p>`
        : `<p class="spec-anatomy__title spec-anatomy__title--nested">${esc(label)}</p>`;
    } else {
      titleHtml = `<p class="spec-anatomy__title">${esc(title)}</p>`;
    }

    // Real production Switch component (docs/assets/style.css, .switch /
    // .switch__knob — see docs/storybook/components/switch.html) — dogfoods
    // the DS's own control instead of a bespoke icon. A switch only makes
    // sense where there is something to toggle, i.e. optional Items — a
    // required Item is always present, there is nothing to turn off, so it
    // gets a plain label with no control at all (not even a disabled one).
    // aria-checked drives the on/off look directly (no extra state class
    // needed); disabled covers "optional but no resolvable DOM node to
    // toggle in this sample" — see toggleAnatomyPart / wireAnatomyPartSwitches
    // below for the click wiring.
    let toggleHtml = '';
    if (optional === true && hasSelector) {
      toggleHtml = `
        <p class="spec-anatomy__toggle">
          <button type="button" class="switch" role="switch" aria-checked="true" data-part="${esc(partId)}">
            <span class="switch__knob" aria-hidden="true"></span>
          </button>
          Опциональный элемент
        </p>`;
    } else if (optional === true && !hasSelector) {
      const reason = nested
        ? `Недоступно — ${nested.name} не является частью разметки в этом сэмпле`
        : 'Недоступно — нет отдельного DOM-узла для переключения в этом сэмпле';
      toggleHtml = `
        <p class="spec-anatomy__toggle">
          <button type="button" class="switch" role="switch" aria-checked="false" aria-disabled="true" disabled title="${esc(reason)}" data-part="${esc(partId)}">
            <span class="switch__knob" aria-hidden="true"></span>
          </button>
          Опциональный элемент
        </p>`;
    } else if (optional === false) {
      toggleHtml = `
        <p class="spec-anatomy__toggle spec-anatomy__toggle--cannot">Обязательный элемент</p>`;
    }

    return `
      <div class="spec-anatomy__item" data-part="${esc(partId)}">
        <span class="spec-anatomy__bullet">${esc(index)}</span>
        <div class="spec-anatomy__body">
          ${titleHtml}
          ${description ? `<p class="spec-anatomy__desc">${description}</p>` : ''}
          ${toggleHtml}
        </div>
      </div>`;
  }

  /* ---------- anatomy stage: callout lines + badges (Figma «Анатомия») ----------
     Reusable across spec-inspector.js (component spec pages) и guide-page.js
     (Guide Header Detailed template). Mutates `stage` DOM in place: clears
     previous callouts, positions a badge + SVG line + dot per part. */

  const CALLOUT_BADGE_R = 12;
  const CALLOUT_EDGE_INSET = 8;
  const CALLOUT_GAP = 40;
  const CALLOUT_MIN_SPACING = CALLOUT_BADGE_R * 2 + 6;
  const CALLOUT_TIER_GAP = CALLOUT_BADGE_R * 2 + 14;
  const CALLOUT_DENSE_THRESHOLD = 4;

  /* ---------- small / tiny target disambiguation + hover halo ----------
     A single dot-and-line pointer reads fine on a normal-sized element, but
     on a row of tight tags (Stable/Draft/Core/Semantic) the endpoint can
     look like it belongs to whichever neighbor happens to be closest.
     Target size (width/height, unconditional — no per-part exception)
     decides two things, applied to every entry the same way:
       - a perpendicular tick at the anchor below CALLOUT_TICK_MIN
       - which hover halo it gets: a full stroke-only outline below
         CALLOUT_TINY_MIN (layoutTinyTargets/appendTinyOutline), a slightly
         softer stroke-only box otherwise (appendAnatomyHighlight) — both are
         fill:none contours, never a background fill (anatomy-annotation-
         standard.md §2) — every entry gets exactly one, always, so hover
         works the same on any Item.
     See mountAnatomyCallouts / layoutTinyTargets below. */
  const CALLOUT_TICK_MIN = 32;   // width/height below this → perpendicular tick at the anchor
  const CALLOUT_TINY_MIN = 16;   // width/height below this → full-outline hover halo instead of the softer box
  const CALLOUT_TICK_LEN = 7;
  const CALLOUT_OUTLINE_PAD = 3;
  const CALLOUT_TINY_STUB = 10;
  const CALLOUT_DOT_RADIUS = 3;  // 6px diameter anchor dot (SVG circle r)

  function findPartEl(stage, part) {
    if (!part.selector) return null;
    return stage.querySelector(part.selector);
  }

  function findPrimaryTextNode(el) {
    if (!el) return null;
    for (let i = 0; i < el.childNodes.length; i++) {
      const node = el.childNodes[i];
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) return node;
    }
    return null;
  }

  function clientRectToStageRect(clientRect, stageRect) {
    const left = clientRect.left - stageRect.left;
    const top = clientRect.top - stageRect.top;
    return {
      top,
      bottom: top + clientRect.height,
      left,
      right: left + clientRect.width,
      width: clientRect.width,
      height: clientRect.height,
      cx: left + clientRect.width / 2,
      cy: top + clientRect.height / 2,
    };
  }

  /* Text-only Items (Label in Chip/Badge — direct text content, no wrapper)
     have no element of their own; measure the text node's ink box via Range
     so halo/anchor sit on the glyphs, not the Container's padding/border. */
  function measureTextContentRect(hostEl, stageRect) {
    const textNode = findPrimaryTextNode(hostEl);
    if (!textNode) return null;
    const range = document.createRange();
    range.selectNodeContents(textNode);
    const r = range.getBoundingClientRect();
    if (!r.width && !r.height) return null;
    return clientRectToStageRect(r, stageRect);
  }

  /* Resolves an anatomy part to either an element box (Container) or a
     text-content box (Label without its own DOM node). Explicit
     part.targetType === 'text' always uses Range; otherwise a later part
     whose selector resolves to a host already claimed by an earlier
     element-target part is auto-promoted to text-content. */
  function resolveAnatomyTarget(stage, part, stageRect, claimedHosts) {
    if (!part.selector) return null;
    const hostEl = stage.querySelector(part.selector);
    if (!hostEl) return null;

    const asText = part.targetType === 'text' || claimedHosts.has(hostEl);
    if (asText) {
      const rect = measureTextContentRect(hostEl, stageRect);
      if (!rect) return null;
      return { kind: 'text', hostEl, rect };
    }

    claimedHosts.add(hostEl);
    const rect = clientRectToStageRect(hostEl.getBoundingClientRect(), stageRect);
    // Same "no box, no callout" rule already applied to text-content targets
    // (measureTextContentRect above): a node can be in the DOM (found by
    // selector) yet render nothing — display:none via the anatomy switch
    // (toggleAnatomyPart), a collapsed nested placeholder, etc. Zero-size is
    // treated as "not found" rather than drawing a degenerate 0×0 halo.
    if (!rect.width && !rect.height) return null;
    return { kind: 'element', hostEl, rect };
  }

  /* ---------- non-crossing boundary labeling ----------
     Anchors are grouped to the top/bottom half of the component (by anchor
     center-Y relative to the group's own bounding box — this is what makes
     Card-like components with header/footer route header anchors above and
     footer anchors below). Within each half, anchors are sorted by X and
     badges are placed in that same left-to-right order, so the badge→anchor
     lines form a monotonic (non-crossing) matching by construction. Dense
     groups (>4 anchors on one side) are staggered into two tiers (near/far)
     by parity of the sorted index, each tier keeping the same left-to-right
     order. A pairwise segment-intersection sweep runs afterwards as a safety
     net for any residual crossing (e.g. top vs bottom lines meeting near a
     narrow component). */

  function segmentsIntersect(a1, a2, b1, b2) {
    const cross = (o, p, q) => (p.x - o.x) * (q.y - o.y) - (p.y - o.y) * (q.x - o.x);
    const onSegment = (p, q, r) =>
      Math.min(p.x, r.x) - 0.01 <= q.x && q.x <= Math.max(p.x, r.x) + 0.01 &&
      Math.min(p.y, r.y) - 0.01 <= q.y && q.y <= Math.max(p.y, r.y) + 0.01;
    const d1 = cross(b1, b2, a1);
    const d2 = cross(b1, b2, a2);
    const d3 = cross(a1, a2, b1);
    const d4 = cross(a1, a2, b2);
    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
    if (d1 === 0 && onSegment(b1, a1, b2)) return true;
    if (d2 === 0 && onSegment(b1, a2, b2)) return true;
    if (d3 === 0 && onSegment(a1, b1, a2)) return true;
    if (d4 === 0 && onSegment(a1, b2, a2)) return true;
    return false;
  }

  /* Order-preserving spread: enforces `minGap` between consecutive values
     without ever changing their relative order (no swaps → no crossings),
     then shifts the whole run back inside [lo, hi] if it overflowed. */
  function spreadOrdered(values, minGap, lo, hi) {
    const n = values.length;
    if (!n) return [];
    const out = values.slice();
    for (let i = 1; i < n; i++) {
      if (out[i] < out[i - 1] + minGap) out[i] = out[i - 1] + minGap;
    }
    if (out[n - 1] > hi) {
      const shift = out[n - 1] - hi;
      for (let i = 0; i < n; i++) out[i] -= shift;
    }
    if (out[0] < lo) {
      const shift = lo - out[0];
      for (let i = 0; i < n; i++) out[i] += shift;
    }
    return out;
  }

  function layoutSideGroup(group, side, stageRect, edgeY) {
    if (!group.length) return [];
    const sorted = group.slice().sort((a, b) => a.rect.cx - b.rect.cx);
    const useTwoTiers = sorted.length > CALLOUT_DENSE_THRESHOLD;
    const lo = CALLOUT_EDGE_INSET + CALLOUT_BADGE_R;
    const hi = stageRect.width - CALLOUT_EDGE_INSET - CALLOUT_BADGE_R;

    // Two tiers (near/far), split by parity of the sorted index — each tier
    // is spread independently since same-tier badges are the ones that can
    // visually collide; alternating tiers already have vertical clearance.
    const tierXs = [[], []];
    const tierIdx = [[], []];
    sorted.forEach((entry, i) => {
      const tier = useTwoTiers ? i % 2 : 0;
      tierXs[tier].push(entry.rect.cx);
      tierIdx[tier].push(i);
    });
    const spreadByTier = tierXs.map((xs) => spreadOrdered(xs, CALLOUT_MIN_SPACING, lo, hi));

    const badgeX = new Array(sorted.length);
    tierIdx.forEach((idxs, tier) => {
      idxs.forEach((sortedI, k) => { badgeX[sortedI] = spreadByTier[tier][k]; });
    });

    return sorted.map((entry, i) => {
      const tier = useTwoTiers ? i % 2 : 0;
      const gap = CALLOUT_GAP + tier * CALLOUT_TIER_GAP;
      const dotX = entry.rect.cx;
      const badgeCx = badgeX[i];
      let badgeCy;
      // Anchor at the target's own geometric center, not its near edge —
      // the line visually "enters" the element instead of grazing its
      // boundary, which is where it gets mistaken for a neighbor's edge.
      const dotY = entry.rect.cy;
      let lineY1;
      if (side === 'top') {
        badgeCy = Math.max(CALLOUT_EDGE_INSET + CALLOUT_BADGE_R, edgeY - gap - CALLOUT_BADGE_R);
        lineY1 = badgeCy + CALLOUT_BADGE_R;
      } else {
        badgeCy = Math.min(stageRect.height - CALLOUT_EDGE_INSET - CALLOUT_BADGE_R, edgeY + gap + CALLOUT_BADGE_R);
        lineY1 = badgeCy - CALLOUT_BADGE_R;
      }
      const geom = {
        badgeCx,
        badgeCy,
        lineX1: badgeCx,
        lineY1,
        lineX2: dotX,
        lineY2: dotY,
        dotX,
        dotY,
      };
      return { entry, geom };
    });
  }

  function resolveCrossings(combined) {
    let changed = true;
    let guard = 0;
    while (changed && guard < 8) {
      changed = false;
      guard += 1;
      for (let i = 0; i < combined.length; i++) {
        for (let j = i + 1; j < combined.length; j++) {
          const gi = combined[i].geom;
          const gj = combined[j].geom;
          const crosses = segmentsIntersect(
            { x: gi.badgeCx, y: gi.badgeCy }, { x: gi.dotX, y: gi.dotY },
            { x: gj.badgeCx, y: gj.badgeCy }, { x: gj.dotX, y: gj.dotY },
          );
          if (crosses) {
            const swap = { badgeCx: gi.badgeCx, badgeCy: gi.badgeCy, lineX1: gi.lineX1, lineY1: gi.lineY1 };
            gi.badgeCx = gj.badgeCx; gi.badgeCy = gj.badgeCy; gi.lineX1 = gj.lineX1; gi.lineY1 = gj.lineY1;
            gj.badgeCx = swap.badgeCx; gj.badgeCy = swap.badgeCy; gj.lineX1 = swap.lineX1; gj.lineY1 = swap.lineY1;
            changed = true;
          }
        }
      }
    }
  }

  function layoutAnatomyCallouts(entries, stageRect) {
    if (!entries.length) return [];
    const compTop = Math.min(...entries.map((e) => e.rect.top));
    const compBottom = Math.max(...entries.map((e) => e.rect.bottom));
    const compCenterY = (compTop + compBottom) / 2;

    const topGroup = [];
    const bottomGroup = [];
    entries.forEach((e) => {
      if (e.rect.cy <= compCenterY) topGroup.push(e);
      else bottomGroup.push(e);
    });

    const combined = [
      ...layoutSideGroup(topGroup, 'top', stageRect, compTop),
      ...layoutSideGroup(bottomGroup, 'bottom', stageRect, compBottom),
    ];

    resolveCrossings(combined);
    return combined;
  }

  /* Targets under CALLOUT_TINY_MIN skip the dot-and-line pointer entirely —
     at that size any single endpoint is ambiguous. Instead each gets its
     own full-outline treatment: the badge sits just outside the target's
     own top-right corner (spread horizontally so several tiny targets in
     a row don't stack their badges), joined by a short stub straight to
     that corner. No participation in the top/bottom row layout above, so
     these can't disturb the non-crossing order of the normal-sized set. */
  function layoutTinyTargets(entries, stageRect) {
    if (!entries.length) return [];
    const lo = CALLOUT_EDGE_INSET + CALLOUT_BADGE_R;
    const hiX = stageRect.width - CALLOUT_EDGE_INSET - CALLOUT_BADGE_R;
    const loY = CALLOUT_EDGE_INSET + CALLOUT_BADGE_R;
    const hiY = stageRect.height - CALLOUT_EDGE_INSET - CALLOUT_BADGE_R;

    const sorted = entries.slice().sort((a, b) => a.rect.cx - b.rect.cx);
    const rawX = sorted.map((entry) => entry.rect.right + CALLOUT_OUTLINE_PAD + CALLOUT_BADGE_R + CALLOUT_TINY_STUB);
    const spreadX = spreadOrdered(rawX, CALLOUT_MIN_SPACING, lo, hiX);

    return sorted.map((entry, i) => {
      const rect = entry.rect;
      const cornerX = rect.right + CALLOUT_OUTLINE_PAD;
      const cornerY = rect.top - CALLOUT_OUTLINE_PAD;
      const badgeCx = Math.min(Math.max(spreadX[i], lo), hiX);
      const badgeCy = Math.min(Math.max(cornerY - CALLOUT_BADGE_R - CALLOUT_TINY_STUB * 0.7, loY), hiY);
      const geom = {
        badgeCx,
        badgeCy,
        lineX1: badgeCx,
        lineY1: badgeCy,
        lineX2: cornerX,
        lineY2: cornerY,
        dotX: cornerX,
        dotY: cornerY,
      };
      return { entry, geom };
    });
  }

  /* Corner radius for a halo box: reads the target's own computed
     border-radius (so a pill-shaped target gets a pill-shaped halo,
     not an unrelated fixed corner) and falls back to `fallback` only
     when the target has no radius info. Clamped to half the box so an
     oversized value (e.g. radius-full's 9999px) can't misreport — SVG
     itself would clamp rx the same way, this just keeps the number sane
     for callers that inspect it. */
  function haloRadiusFor(el, boxWidth, boxHeight, fallback) {
    const parsed = el ? parseFloat(getComputedStyle(el).borderRadius) : NaN;
    const pad = CALLOUT_OUTLINE_PAD;
    const radius = Number.isFinite(parsed) && parsed >= 0 ? parsed + pad : fallback;
    return Math.min(radius, boxWidth / 2, boxHeight / 2);
  }

  /* Recomputes a halo <rect>'s geometry from the CURRENT layout, right
     before it's revealed on hover — never from whatever rect happened to
     be measured at paint time. getBoundingClientRect() always forces a
     fresh layout flush, so this is never stale even if fonts/content
     reflowed the page after the initial mount. Re-reads the stage's own
     rect too (not a cached one), so scroll/resize between mount and hover
     can't shift the halo relative to its target. No-op for nodes that
     aren't a halo (no stored target element). */
  function refreshAnatomyHaloGeometry(node, stage) {
    const hostEl = node.__anatomyHostEl || node.__anatomyTargetEl;
    if (!hostEl || !stage) return;
    const pad = CALLOUT_OUTLINE_PAD;
    const stageRect = stage.getBoundingClientRect();
    const kind = node.__anatomyTargetKind || 'element';
    const fallback = node.classList.contains('spec-anatomy-callout__outline') ? 3 : 4;

    const rect = kind === 'text'
      ? measureTextContentRect(hostEl, stageRect)
      : clientRectToStageRect(hostEl.getBoundingClientRect(), stageRect);
    if (!rect) return;

    const width = rect.width + pad * 2;
    const height = rect.height + pad * 2;
    node.setAttribute('x', String(rect.left - pad));
    node.setAttribute('y', String(rect.top - pad));
    node.setAttribute('width', String(width));
    node.setAttribute('height', String(height));
    node.setAttribute('rx', String(
      kind === 'text'
        ? Math.min(2, width / 2, height / 2)
        : haloRadiusFor(hostEl, width, height, fallback),
    ));
  }

  /* Hover-revealed stroke-only outline behind a normal-sized (non-tiny)
     target — ties the number/line to the exact box on demand, not just to
     wherever the line/dot happens to land. Fill is always transparent (see
     .spec-anatomy-callout__highlight in storybook-spec-inspector.css) — the
     halo is a contour, never a background fill, regardless of the target's
     own background color (anatomy-annotation-standard.md §2). Applied
     unconditionally to every non-tiny entry, see mountAnatomyCallouts.
     Geometry here is only the *initial* paint; refreshAnatomyHaloGeometry
     re-derives it from the live target on every hover (see
     anatomyPartToggle). */
  function appendAnatomyHighlight(svg, rect, partId, hostEl, targetKind) {
    const pad = CALLOUT_OUTLINE_PAD;
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    el.classList.add('spec-anatomy-callout__highlight');
    if (partId) el.dataset.part = partId;
    el.__anatomyTargetEl = hostEl || null;
    el.__anatomyHostEl = hostEl || null;
    el.__anatomyTargetKind = targetKind || 'element';
    const width = rect.width + pad * 2;
    const height = rect.height + pad * 2;
    el.setAttribute('x', String(rect.left - pad));
    el.setAttribute('y', String(rect.top - pad));
    el.setAttribute('width', String(width));
    el.setAttribute('height', String(height));
    el.setAttribute('rx', String(
      targetKind === 'text'
        ? Math.min(2, width / 2, height / 2)
        : haloRadiusFor(hostEl, width, height, 4),
    ));
    svg.appendChild(el);
  }

  /* Full outline around a tiny target — replaces the dot/line for that one
     callout (see layoutTinyTargets). Same live-refresh contract as
     appendAnatomyHighlight above. */
  function appendTinyOutline(svg, rect, partId, hostEl, targetKind) {
    const pad = CALLOUT_OUTLINE_PAD;
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    el.classList.add('spec-anatomy-callout__outline');
    if (partId) el.dataset.part = partId;
    el.__anatomyTargetEl = hostEl || null;
    el.__anatomyHostEl = hostEl || null;
    el.__anatomyTargetKind = targetKind || 'element';
    const width = rect.width + pad * 2;
    const height = rect.height + pad * 2;
    el.setAttribute('x', String(rect.left - pad));
    el.setAttribute('y', String(rect.top - pad));
    el.setAttribute('width', String(width));
    el.setAttribute('height', String(height));
    el.setAttribute('rx', String(
      targetKind === 'text'
        ? Math.min(2, width / 2, height / 2)
        : haloRadiusFor(hostEl, width, height, 3),
    ));
    svg.appendChild(el);
  }

  /* Short tick perpendicular to the line direction at the anchor point —
     reinforces "exactly this point" on targets too small for the center
     anchor alone to read unambiguously, without switching to full-outline
     mode (that's reserved for CALLOUT_TINY_MIN and below). */
  function appendAnatomyTick(svg, geom, partId) {
    const dx = geom.lineX2 - geom.lineX1;
    const dy = geom.lineY2 - geom.lineY1;
    const len = Math.hypot(dx, dy) || 1;
    const ux = -dy / len;
    const uy = dx / len;
    const half = CALLOUT_TICK_LEN / 2;
    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    tick.classList.add('spec-anatomy-callout__tick');
    if (partId) tick.dataset.part = partId;
    tick.setAttribute('x1', String(geom.dotX - ux * half));
    tick.setAttribute('y1', String(geom.dotY - uy * half));
    tick.setAttribute('x2', String(geom.dotX + ux * half));
    tick.setAttribute('y2', String(geom.dotY + uy * half));
    tick.setAttribute('stroke-linecap', 'round');
    svg.appendChild(tick);
  }

  function appendAnatomyBadge(svg, geom, index, partId) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.classList.add('spec-anatomy-callout');
    if (partId) g.dataset.part = partId;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.classList.add('spec-anatomy-callout__badge');
    circle.setAttribute('cx', String(geom.badgeCx));
    circle.setAttribute('cy', String(geom.badgeCy));
    circle.setAttribute('r', String(CALLOUT_BADGE_R));
    g.appendChild(circle);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.classList.add('spec-anatomy-callout__label');
    label.setAttribute('x', String(geom.badgeCx));
    label.setAttribute('y', String(geom.badgeCy));
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('dominant-baseline', 'central');
    label.textContent = String(index);
    g.appendChild(label);

    svg.appendChild(g);
    return g;
  }

  /* Invisible wide-stroke twin of a callout line, purely for a comfortable
     hover hit-area — the visible line stays a thin 1.5px stroke. */
  function appendAnatomyLineHit(svg, geom, partId) {
    const hit = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    hit.classList.add('spec-anatomy-callout__line-hit');
    if (partId) hit.dataset.part = partId;
    hit.setAttribute('x1', String(geom.lineX1));
    hit.setAttribute('y1', String(geom.lineY1));
    hit.setAttribute('x2', String(geom.lineX2));
    hit.setAttribute('y2', String(geom.lineY2));
    svg.appendChild(hit);
    return hit;
  }

  /* Single source of truth for "this part is active" — toggled by hovering
     either the badge/line on the canvas or the matching legend row below,
     so both entry points drive the exact same state instead of two
     separate implementations. */
  function anatomyPartToggle(stage, legendRoot, partId) {
    const legendItem = legendRoot ? legendRoot.querySelector(`.spec-anatomy__item[data-part="${partId}"]`) : null;
    return {
      activate() {
        stage.querySelectorAll(`[data-part="${partId}"]`).forEach((node) => {
          // Re-measure the halo from the live DOM right before it becomes
          // visible — the mount-time rect it was drawn with can go stale
          // (font swap, content reflow elsewhere on the page, etc.).
          refreshAnatomyHaloGeometry(node, stage);
          node.classList.add('is-active');
        });
        if (legendItem) legendItem.classList.add('is-active');
      },
      deactivate() {
        stage.querySelectorAll(`[data-part="${partId}"]`).forEach((node) => node.classList.remove('is-active'));
        if (legendItem) legendItem.classList.remove('is-active');
      },
    };
  }

  /* Wires hover/focus on a freshly-created canvas node (badge group or line
     hit-area) to the shared per-part toggle — called right after each node
     is built, so it keeps working across mountAnatomyCallouts repaints
     (e.g. on resize), where the previous run's nodes are discarded. */
  function bindAnatomyCanvasHover(node, stage, legendRoot, partId) {
    if (!node || !partId) return;
    const { activate, deactivate } = anatomyPartToggle(stage, legendRoot, partId);
    node.addEventListener('mouseenter', activate);
    node.addEventListener('mouseleave', deactivate);
  }

  function mountAnatomyCallouts(stage, parts, legendRoot) {
    if (!stage) return;
    stage.querySelectorAll('.spec-anatomy-callout-svg').forEach((node) => node.remove());

    const stageRect = stage.getBoundingClientRect();
    if (!stageRect.width || !stageRect.height) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('spec-anatomy-callout-svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', String(Math.ceil(stageRect.width)));
    svg.setAttribute('height', String(Math.ceil(stageRect.height)));
    svg.setAttribute('viewBox', `0 0 ${stageRect.width} ${stageRect.height}`);

    // Badge numbers must keep matching the legend, i.e. the original `parts`
    // order — only the (x, y) placement is re-derived by layoutAnatomyCallouts
    // below, so `entry.index` is threaded through unchanged.
    const entries = [];
    const claimedHosts = new Set();
    (parts || []).forEach((part, i) => {
      const target = resolveAnatomyTarget(stage, part, stageRect, claimedHosts);
      if (!target) return;
      const rect = target.rect;
      entries.push({
        part,
        index: i,
        el: target.hostEl,
        hostEl: target.hostEl,
        targetKind: target.kind,
        rect,
        isTiny: rect.width < CALLOUT_TINY_MIN || rect.height < CALLOUT_TINY_MIN,
        isSmall: rect.width < CALLOUT_TICK_MIN || rect.height < CALLOUT_TICK_MIN,
      });
    });
    if (!entries.length) return;

    const tinyEntries = entries.filter((entry) => entry.isTiny);
    const normalEntries = entries.filter((entry) => !entry.isTiny);

    const layout = layoutAnatomyCallouts(normalEntries, stageRect);
    const tinyLayout = layoutTinyTargets(tinyEntries, stageRect);

    // Every anatomy target gets exactly one hover-revealed halo — a
    // stroke-only box for normal-sized targets, a stroke-only outline for
    // tiny ones (layoutTinyTargets/appendTinyOutline). Neither ever fills
    // its background (fill:none in both .spec-anatomy-callout__highlight and
    // .spec-anatomy-callout__outline) — the halo color is a fixed accent
    // token, independent of the target's own background (anatomy-annotation-
    // standard.md §2). Size (isTiny) is the
    // only thing deciding which of the two a target gets; there is no
    // per-id/per-part exception, so hover works the same for every current
    // and future Item regardless of whether it's plain text, a nested DS
    // component, or a target with its own complex markup. Previously this
    // was gated behind `entry.isAdjacent` (only tight/shared targets got a
    // highlight at all), which meant hover on any well-spaced normal Item
    // had literally no halo element to reveal — that gate is removed.
    // Layered back-to-front: highlights/outlines sit behind the
    // pointers/badges so the halo reads as "background" for the target,
    // not as an extra callout of its own.
    layout.forEach(({ entry }) => {
      appendAnatomyHighlight(svg, entry.rect, entry.part.id, entry.hostEl, entry.targetKind);
    });
    tinyLayout.forEach(({ entry }) => {
      appendTinyOutline(svg, entry.rect, entry.part.id, entry.hostEl, entry.targetKind);
    });

    layout.forEach(({ entry, geom }) => {
      const part = entry.part;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.classList.add('spec-anatomy-callout__line');
      line.dataset.part = part.id || '';
      line.setAttribute('x1', String(geom.lineX1));
      line.setAttribute('y1', String(geom.lineY1));
      line.setAttribute('x2', String(geom.lineX2));
      line.setAttribute('y2', String(geom.lineY2));
      line.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line);
      const lineHit = appendAnatomyLineHit(svg, geom, part.id);

      if (entry.isSmall) appendAnatomyTick(svg, geom, part.id);

      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.classList.add('spec-anatomy-callout__dot');
      dot.dataset.part = part.id || '';
      dot.setAttribute('cx', String(geom.dotX));
      dot.setAttribute('cy', String(geom.dotY));
      dot.setAttribute('r', String(CALLOUT_DOT_RADIUS));
      svg.appendChild(dot);

      const badge = appendAnatomyBadge(svg, geom, entry.index + 1, part.id);
      bindAnatomyCanvasHover(badge, stage, legendRoot, part.id);
      bindAnatomyCanvasHover(lineHit, stage, legendRoot, part.id);
    });

    // Tiny targets: short stub straight into the outline's corner, no dot —
    // the outline itself is the disambiguation, not the endpoint.
    tinyLayout.forEach(({ entry, geom }) => {
      const part = entry.part;

      const stub = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      stub.classList.add('spec-anatomy-callout__line');
      stub.dataset.part = part.id || '';
      stub.setAttribute('x1', String(geom.lineX1));
      stub.setAttribute('y1', String(geom.lineY1));
      stub.setAttribute('x2', String(geom.lineX2));
      stub.setAttribute('y2', String(geom.lineY2));
      stub.setAttribute('stroke-linecap', 'round');
      svg.appendChild(stub);
      const stubHit = appendAnatomyLineHit(svg, geom, part.id);

      const badge = appendAnatomyBadge(svg, geom, entry.index + 1, part.id);
      bindAnatomyCanvasHover(badge, stage, legendRoot, part.id);
      bindAnatomyCanvasHover(stubHit, stage, legendRoot, part.id);
    });

    if (svg.childNodes.length) stage.appendChild(svg);
  }

  function wireAnatomyLegend(stage, legendRoot) {
    if (!stage || !legendRoot) return;
    const items = legendRoot.querySelectorAll('.spec-anatomy__item[data-part]');
    items.forEach((item) => {
      const partId = item.dataset.part;
      // Same shared toggle the canvas hover (badge/line) uses in
      // mountAnatomyCallouts — one state, two entry points.
      const { activate, deactivate } = anatomyPartToggle(stage, legendRoot, partId);
      item.addEventListener('mouseenter', activate);
      item.addEventListener('mouseleave', deactivate);
      item.addEventListener('focusin', activate);
      item.addEventListener('focusout', deactivate);
    });
  }

  /* Wires the real Switch buttons (see anatomyLegendItem — production
     .switch component, rendered only for optional Items) in the legend to
     the live sample: clicking toggles display:none on every DOM node
     matching that part's selector inside `stage`, flips aria-checked (the
     production CSS keys off this attribute directly, no separate state
     class needed), and re-paints the canvas (`repaint`) so the callout for
     a hidden part disappears instead of drawing a degenerate 0×0 halo (see
     the zero-size guard in resolveAnatomyTarget). Disabled switches
     (optional Item with no resolvable DOM node — see anatomyLegendItem) are
     skipped: nothing to hide, and the native `disabled` attribute already
     keeps them out of the tab order / non-interactive. Required Items don't
     render a switch at all (nothing to toggle), so there is nothing to wire
     for them here. */
  function toggleAnatomyPart(stage, part, switchEl) {
    const nodes = stage.querySelectorAll(part.selector);
    if (!nodes.length) return;
    const nowOn = switchEl.getAttribute('aria-checked') !== 'true';
    nodes.forEach((node) => {
      node.style.display = nowOn ? '' : 'none';
    });
    switchEl.setAttribute('aria-checked', String(nowOn));
  }

  function wireAnatomyPartSwitches(stage, legendRoot, parts, repaint) {
    if (!stage || !legendRoot) return;
    const switches = legendRoot.querySelectorAll('button.switch[data-part]:not(:disabled)');
    switches.forEach((switchEl) => {
      const partId = switchEl.dataset.part;
      const part = (parts || []).find((p) => p.id === partId);
      if (!part || !part.selector) return;
      switchEl.addEventListener('click', () => {
        toggleAnatomyPart(stage, part, switchEl);
        if (typeof repaint === 'function') repaint();
      });
    });
  }

  window.DSMeasureAgents = {
    esc,
    gapsAndPaddings,
    widthHeight,
    cornerRadius,
    mountRadiusPreviews,
    resolveRadiusArcs,
    anatomyMarker,
    anatomyLegendItem,
    findPartEl,
    mountAnatomyCallouts,
    wireAnatomyLegend,
    wireAnatomyPartSwitches,
  };
})();
