/* ============================================================
   Spec Inspector — engineering audit layer для component spec pages
   System Storybook: цвета/типографика (аудит), «Размер и hit area»
   (живое измерение), и editable-строки (data-entry), к которым
   привязывается spec-editor.js (typed dropdown / inline value).

   Visual measure-кадры — анатомия, скругления, outer-inset/gap/zone-
   offset диаграммы — больше НЕ рендерятся здесь. Единственный источник
   этих секций теперь Guide Page (guide-page.js + guide-page.css),
   читающая те же DS_COMPONENT_SPEC.parts/aspects.borders/aspects.spacing.
   См. guide-page-pass.md. Подключать measure-agents.js перед обоими
   скриптами (нужен для widthHeight-агентов в «Размер и hit area»).

   Страница декларирует данные в window.DS_COMPONENT_SPEC:

   {
     name: 'ButtonIcon',
     interactive: true,            // контрол → строка hit area в блоке размеров
     parts: [                      // именованные части текущего компонента
       {
         id: 'root',               // ссылка для attribution в measure-записях
         label: 'Container',
         selector: '.btn-icon',    // ищется внутри #spec-sample (превью)
         description: '…',         // допускается HTML (данные страницы, trusted)
         nested: { name: 'Badge', href: 'badge.html' } // вложенный компонент:
                                   // здесь НЕ разворачивается и не аннотируется,
                                   // только ссылка на его собственную спеку
       }
     ],
     aspects: {
       size:       [{ part, property, token?|value?, hardcoded?, note? }],
       spacing:    [{ … }],
       colors:     [{ …, context: 'default'|'hover'|'focus'|…|'<вариант>' }],
       borders:    [{ … }],
       typography: [{ part, role, tokens: [...], sample, extra?: [rows] }]
     }
   }

   Логика выбора блоков (общая для всех component spec pages):
   - «Размер и hit area» — если есть size-записи или компонент интерактивен
     (hit area измеряется на живом сэмпле и сравнивается с 44px Web);
   - остальные аспекты — только если по ним есть хотя бы одна запись;
   - пустые аспекты не рендерятся; какие блоки скрыты — видно в
     Inspection index в сайдбаре.

   Значения токенов резолвятся из живого CSS (getComputedStyle),
   поэтому реагируют на переключение темы.
   ============================================================ */
(function () {
  'use strict';

  const spec = window.DS_COMPONENT_SPEC;
  const mount = document.getElementById('spec-inspector');
  const agents = window.DSMeasureAgents;
  if (!spec || !mount) return;
  if (!agents) {
    console.warn('[spec-inspector] DSMeasureAgents not loaded — include measure-agents.js before spec-inspector.js');
  }

  const sampleStage = document.getElementById('spec-sample');
  const parts = spec.parts || [];
  const aspects = spec.aspects || {};

  // Стабильные id записей: по ним editable-слой (spec-editor.js) находит
  // отрендеренные строки и привязывает контролы редактирования.
  Object.entries(aspects).forEach(([aspect, entries]) => {
    (entries || []).forEach((entry, i) => {
      entry.__id = `${aspect}:${i}`;
      (entry.extra || []).forEach((extra, j) => {
        extra.__id = `${aspect}:${i}:x${j}`;
      });
    });
  });

  /* ---------- helpers ---------- */

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function resolveToken(token) {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--' + token)
      .trim();
    return value || '—';
  }

  function partLabel(id) {
    const part = parts.find((p) => p.id === id);
    return part ? part.label : id || '';
  }

  function entryTokens(entries) {
    const out = [];
    (entries || []).forEach((entry) => {
      if (entry.token) out.push(entry.token);
      if (entry.tokens) out.push(...entry.tokens);
      (entry.extra || []).forEach((extra) => {
        if (extra.token) out.push(extra.token);
      });
    });
    return out;
  }

  /* ---------- generic measure row ---------- */

  function measureRow(entry) {
    const rowClasses = ['spec-measure__row'];
    if (entry.hardcoded) rowClasses.push('spec-measure__row--violation');

    const target = entry.part
      ? `${esc(partLabel(entry.part))} · ${esc(entry.property)}`
      : esc(entry.property);

    let tokenCol;
    if (entry.token) {
      tokenCol = `<code class="token-ref">${esc(entry.token)}</code>`;
    } else {
      const cls = entry.hardcoded ? 'spec-hardcode spec-hardcode--violation' : 'spec-hardcode';
      tokenCol = `<code class="${cls}">${esc(entry.value)}</code>`;
    }

    let valueCol;
    if (entry.token) {
      valueCol = `<span class="spec-measure__value" data-resolve="${esc(entry.token)}"></span>`;
    } else if (entry.hardcoded) {
      valueCol = '<span class="spec-measure__value spec-measure__value--violation">hardcode</span>';
    } else {
      valueCol = '<span class="spec-measure__value">—</span>';
    }

    const swatch = entry.swatch && entry.token
      ? `<span class="spec-swatch" style="background: var(--${esc(entry.token)})"></span>`
      : '';
    const note = entry.note ? `<p class="spec-measure__note">${entry.note}</p>` : '';
    const partAttr = entry.part ? ` data-part="${esc(entry.part)}"` : '';
    const entryAttr = entry.__id ? ` data-entry="${esc(entry.__id)}"` : '';

    return `
      <div class="${rowClasses.join(' ')}"${partAttr}${entryAttr}>
        <span class="spec-measure__target">${target}</span>
        <span class="spec-measure__token">${swatch}${tokenCol}</span>
        ${valueCol}
        ${note}
      </div>`;
  }

  function measureList(entries) {
    return `<div class="spec-measure">${entries.map(measureRow).join('')}</div>`;
  }

  /* ---------- spatial measure presentation ---------- */

  const SPATIAL_GROUPS = {
    'outer-inset': {
      label: 'Outer / container inset',
      hint: 'Padding и inset от границы контейнера до внутреннего контента.',
    },
    'inner-gap': {
      label: 'Inner slot-to-slot gaps',
      hint: 'Расстояния между соседними элементами внутри одной части.',
    },
    'zone-offset': {
      label: 'Zone spacing',
      hint: 'Отступы между зонами компонента (margin-top / margin-bottom).',
    },
    'inner-offset': {
      label: 'Inner offset',
      hint: 'Направленный внутренний отступ (например, под leading-элемент).',
    },
    radius: {
      label: 'Corner radius',
      hint: 'Скругление углов контейнера; визуальный measure-кадр — в Guide Page (секция «Скругления»).',
    },
    'border-line': {
      label: 'Border stroke',
      hint: 'Обводка и разделители; значение токена stroke, не геометрия inset.',
    },
    other: {
      label: 'Other spacing',
      hint: 'Записи без однозначной spatial-классификации.',
    },
  };

  const SPATIAL_ORDER = {
    spacing: ['outer-inset', 'inner-gap', 'zone-offset', 'inner-offset', 'other'],
    borders: ['radius', 'border-line', 'other'],
  };

  function partIsNested(partId) {
    const part = parts.find((p) => p.id === partId);
    return !!(part && part.nested);
  }

  function spatialKind(entry, aspect) {
    const prop = String(entry.property || '').toLowerCase();
    if (aspect === 'borders') {
      if (/radius/.test(prop)) return 'radius';
      return 'border-line';
    }
    if (/^gap\b|(^|\s)gap(\s|$)|· gap/.test(prop)) return 'inner-gap';
    if (/margin-(top|bottom)|margin-top|margin-bottom/.test(prop)) return 'zone-offset';
    if (/padding-left|padding-right|под иконку|inner offset|leading/.test(prop)) {
      return 'inner-offset';
    }
    if (/padding|inset|margin/.test(prop)) return 'outer-inset';
    return 'other';
  }

  function entryDisplayValue(entry) {
    if (entry.token) {
      const resolved = resolveToken(entry.token);
      return resolved !== '—' ? resolved : entry.token;
    }
    return entry.value != null ? String(entry.value) : '—';
  }

  function entrySourceChip(entry) {
    if (entry.hardcoded) return '<span class="spec-spatial-chip spec-spatial-chip--hardcode">hardcode</span>';
    if (entry.edit) return '<span class="spec-spatial-chip spec-spatial-chip--editable">editable</span>';
    if (entry.token) return '<span class="spec-spatial-chip spec-spatial-chip--token">token</span>';
    return '<span class="spec-spatial-chip spec-spatial-chip--derived">derived</span>';
  }

  // NB: используется только renderSize() для width/height dimension-агентов
  // («Размер и hit area» — живое измерение, вне Guide Page). Остальные
  // spatial-диаграммы (outer-inset/inner-gap/zone-offset/radius/anatomy)
  // теперь рендерит guide-page.js — см. guide-page-pass.md.

  function spatialPxLength(raw) {
    const text = String(raw == null ? '' : raw).trim();
    if (!text || text === '—') return null;
    const match = text.match(/^([\d.]+)px$/);
    if (match) return `${Math.max(6, Math.min(parseFloat(match[1]), 48))}px`;
    const num = parseFloat(text);
    if (!Number.isNaN(num) && num > 0) return `${Math.max(6, Math.min(num, 48))}px`;
    return null;
  }

  function shorthandPaddingBands(value) {
    const parts = String(value || '')
      .trim()
      .split(/\s+/)
      .map((chunk) => spatialPxLength(chunk) || spatialPxLength(chunk.replace(/[^\d.]/g, '') + 'px'));
    if (!parts.length || parts.some((p) => !p)) return null;
    if (parts.length === 1) return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
    if (parts.length === 2) return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
    if (parts.length === 3) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] };
    return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
  }

  function spatialBandSize(entry) {
    const raw = entryDisplayValue(entry);
    const fromRaw = shorthandPaddingBands(raw);
    if (fromRaw) return fromRaw;
    const resolved = spatialPxLength(raw);
    if (resolved) return resolved;
    if (entry.value) {
      const fromValue = shorthandPaddingBands(entry.value);
      if (fromValue) return fromValue;
    }
    return '14px';
  }

  function agentFromEntry(entry) {
    const band = spatialBandSize(entry);
    return {
      tokenName: entry.token || entry.value || '—',
      value: entryDisplayValue(entry),
      chip: entrySourceChip(entry),
      entryId: entry.__id || '',
      bandSize: typeof band === 'string' ? band : '14px',
    };
  }

  /* ---------- spatial groups: audit-only (без visual diagram) ----------
     Visual measure-кадры (inset/gap/zone-offset/radius) теперь рендерит
     guide-page.js в Guide Page — см. guide-page-pass.md. Здесь остаётся
     только классификация + editable measureList (spec-editor.js биндится
     по data-entry внутри этих строк). */

  function renderSpatialGroup(kind, entries, options = {}) {
    const meta = SPATIAL_GROUPS[kind] || SPATIAL_GROUPS.other;
    const label = options.labelOverride || meta.label;
    return `
      <div class="spec-spatial-group${options.nested ? ' spec-spatial-group--nested' : ''}">
        <p class="spec-spatial-group__label">${esc(label)}</p>
        <p class="spec-spatial-group__hint">${esc(meta.hint)}</p>
        ${options.nestedNote || ''}
        ${measureList(entries)}
      </div>`;
  }

  function renderNestedScope(partId, partEntries, aspect) {
    const part = parts.find((p) => p.id === partId);
    const nestedBuckets = new Map();
    partEntries.forEach((entry) => {
      const kind = spatialKind(entry, aspect);
      if (!nestedBuckets.has(kind)) nestedBuckets.set(kind, []);
      nestedBuckets.get(kind).push(entry);
    });
    const order = SPATIAL_ORDER[aspect] || SPATIAL_ORDER.spacing;
    const groups = order
      .filter((kind) => nestedBuckets.has(kind))
      .map((kind) => renderSpatialGroup(kind, nestedBuckets.get(kind), { nested: true }))
      .join('');
    const nestedNote =
      part && part.nested
        ? `<p class="spec-nested">nested · ${
            part.nested.href
              ? `<a href="${esc(part.nested.href)}">${esc(part.nested.name)}</a>`
              : `<strong>${esc(part.nested.name)}</strong>`
          } — measure остаётся в scope вложенного компонента; здесь только attribution.</p>`
        : '';
    return `
      <div class="spec-spatial-scope spec-spatial-scope--nested">
        <p class="spec-spatial-scope__label">Nested scope — ${esc(part?.label || partId)}</p>
        ${nestedNote}
        ${groups}
      </div>`;
  }

  function partitionSpatialEntries(entries, aspect) {
    const parent = [];
    const nested = [];
    (entries || []).forEach((entry) => {
      if (entry.part && partIsNested(entry.part)) nested.push(entry);
      else parent.push(entry);
    });
    const buckets = new Map();
    parent.forEach((entry) => {
      const kind = spatialKind(entry, aspect);
      if (!buckets.has(kind)) buckets.set(kind, []);
      buckets.get(kind).push(entry);
    });
    return { buckets, nested };
  }

  function renderSpatialAspect(entries, aspect) {
    const { buckets, nested } = partitionSpatialEntries(entries, aspect);
    const order = SPATIAL_ORDER[aspect] || SPATIAL_ORDER.spacing;
    const sections = order
      .filter((kind) => buckets.has(kind) && buckets.get(kind).length)
      .map((kind) => renderSpatialGroup(kind, buckets.get(kind)));

    if (nested.length) {
      const nestedParts = [...new Set(nested.map((e) => e.part))];
      nestedParts.forEach((partId) => {
        const partEntries = nested.filter((e) => e.part === partId);
        sections.push(renderNestedScope(partId, partEntries, aspect));
      });
    }

    return sections.join('');
  }

  function renderSpacing() {
    return renderSpatialAspect(aspects.spacing || [], 'spacing');
  }

  function renderBorders() {
    return renderSpatialAspect(aspects.borders || [], 'borders');
  }

  /* ---------- block renderers ----------
     Анатомия (callout-стейдж + легенда) больше не рендерится здесь —
     единственный источник теперь Guide Page (guide-page.js), которая
     читает те же DS_COMPONENT_SPEC.parts. См. guide-page-pass.md. */

  function renderSize() {
    const rows = (aspects.size || []).map(measureRow);
    const dimensionAgents = agents
      ? (aspects.size || [])
          .filter((entry) => /width|height|ширина|высота/i.test(String(entry.property)))
          .map((entry) => {
            const type = /height|высота/i.test(String(entry.property)) ? 'height' : 'width';
            return agents.widthHeight(
              Object.assign({ type, value: entryDisplayValue(entry) }, agentFromEntry(entry))
            );
          })
          .join('')
      : '';
    if (spec.interactive) {
      rows.push(`
        <div class="spec-measure__row spec-measure__row--hit">
          <span class="spec-measure__target">Hit area · измерено на сэмпле</span>
          <span class="spec-measure__token"><span class="spec-hit-value" data-hit-area-value>…</span></span>
          <span class="spec-measure__value" data-hit-area-status></span>
          <p class="spec-measure__note">Референс: touch target 44×44px (Web) из правил проекта.</p>
        </div>`);
    }
    const agentsBlock = dimensionAgents
      ? `<div class="spec-size-agents" aria-hidden="true">${dimensionAgents}</div>`
      : '';
    return `${agentsBlock}<div class="spec-measure">${rows.join('')}</div>`;
  }

  const CONTEXT_ORDER = ['default', 'hover', 'focus', 'pressed', 'disabled', 'placeholder'];

  function renderColors() {
    const groups = [];
    (aspects.colors || []).forEach((entry) => {
      const key = entry.context || 'default';
      let group = groups.find((g) => g.key === key);
      if (!group) {
        group = { key, items: [] };
        groups.push(group);
      }
      group.items.push(Object.assign({ swatch: entry.swatch !== false }, entry));
    });
    groups.sort((a, b) => {
      const ai = CONTEXT_ORDER.indexOf(a.key);
      const bi = CONTEXT_ORDER.indexOf(b.key);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
    return groups
      .map((group) => {
        const heading = groups.length > 1
          ? `<p class="spec-measure__context">${esc(group.key)}</p>`
          : '';
        return heading + measureList(group.items);
      })
      .join('');
  }

  function typeStyleFromTokens(tokens) {
    const decls = [];
    tokens.forEach((token) => {
      if (/-size$/.test(token)) decls.push(`font-size: var(--${token})`);
      else if (/-lh$/.test(token)) decls.push(`line-height: var(--${token})`);
      else if (/-weight(-strong)?$/.test(token)) decls.push(`font-weight: var(--${token})`);
      else if (/-tracking/.test(token)) decls.push(`letter-spacing: var(--${token})`);
    });
    return decls.join('; ');
  }

  function renderTypography() {
    return (aspects.typography || [])
      .map((entry) => {
        const chips = entry.tokens
          .map(
            (token) => `
              <span class="spec-type__token">
                <code class="token-ref">${esc(token)}</code>
                <span class="spec-measure__value" data-resolve="${esc(token)}"></span>
              </span>`
          )
          .join('');
        const extras = (entry.extra || []).map(measureRow).join('');
        const partAttr = entry.part ? ` data-part="${esc(entry.part)}"` : '';
        const entryAttr = entry.__id ? ` data-entry="${esc(entry.__id)}"` : '';
        return `
          <div class="spec-type"${partAttr}${entryAttr}>
            <p class="spec-type__sample" style="${typeStyleFromTokens(entry.tokens)}">${esc(entry.sample || entry.role)}</p>
            <p class="spec-type__role">${esc(partLabel(entry.part))} · роль <strong>${esc(entry.role)}</strong></p>
            <div class="spec-type__tokens">${chips}</div>
            ${extras ? `<div class="spec-measure">${extras}</div>` : ''}
          </div>`;
      })
      .join('');
  }

  /* ---------- block registry + selection logic ---------- */

  const BLOCKS = [
    {
      id: 'size',
      title: 'Размер и hit area',
      hint: 'Габариты и область взаимодействия; hit area измеряется на живом сэмпле.',
      visible: () => (aspects.size || []).length > 0 || !!spec.interactive,
      count: () => (aspects.size || []).length + (spec.interactive ? 1 : 0),
      countLabel: 'записей',
      tokens: () => entryTokens(aspects.size),
      render: renderSize,
    },
    {
      id: 'spacing',
      title: 'Отступы',
      hint: 'Пространственные отношения по смысловым группам: outer inset, inner gaps, zone spacing. Визуальная разметка — в Guide Page («Размеры и отступы»); здесь — привязка к токенам и редактирование.',
      visible: () => (aspects.spacing || []).length > 0,
      count: () => (aspects.spacing || []).length,
      countLabel: 'записей',
      tokens: () => entryTokens(aspects.spacing),
      render: renderSpacing,
    },
    {
      id: 'colors',
      title: 'Цвета и состояния',
      hint: 'Цветовые токены по элементам и состояниям/вариантам текущего компонента.',
      visible: () => (aspects.colors || []).length > 0,
      count: () => (aspects.colors || []).length,
      countLabel: 'записей',
      tokens: () => entryTokens(aspects.colors),
      render: renderColors,
    },
    {
      id: 'borders',
      title: 'Границы и радиусы',
      hint: 'Radius — визуал в Guide Page («Скругления»); border stroke — таблица значений без смешивания с inset/gap.',
      visible: () => (aspects.borders || []).length > 0,
      count: () => (aspects.borders || []).length,
      countLabel: 'записей',
      tokens: () => entryTokens(aspects.borders),
      render: renderBorders,
    },
    {
      id: 'typography',
      title: 'Типографика',
      hint: 'Типографические роли компонента; каждый сэмпл отрисован токенами своей роли.',
      visible: () => (aspects.typography || []).length > 0,
      count: () => (aspects.typography || []).length,
      countLabel: 'ролей',
      tokens: () => entryTokens(aspects.typography),
      render: renderTypography,
    },
  ];

  /* ---------- render ---------- */

  const visibleBlocks = BLOCKS.filter((block) => block.visible());
  const hiddenBlocks = BLOCKS.filter((block) => !block.visible());

  mount.innerHTML = visibleBlocks
    .map(
      (block) => `
        <section class="spec-block spec-inspect" id="inspect-${block.id}" aria-labelledby="inspect-${block.id}-title">
          <h3 class="spec-block__title" id="inspect-${block.id}-title">${block.title}</h3>
          <p class="spec-inspect__hint">${block.hint}</p>
          ${block.render()}
        </section>`
    )
    .join('');

  /* ---------- token index (sidebar) ---------- */

  function renderIndex() {
    const indexMount = document.getElementById('spec-token-index');
    if (!indexMount) return;
    const links = visibleBlocks
      .map((block) => {
        const tokens = new Set(block.tokens());
        const meta = tokens.size
          ? `${tokens.size} ток.`
          : `${block.count()} ${block.countLabel}`;
        return `
          <a class="spec-index__item" href="#inspect-${block.id}">
            <span>${block.title}</span>
            <span class="spec-index__count">${meta}</span>
          </a>`;
      })
      .join('');
    const skipped = hiddenBlocks.length
      ? `<p class="spec-index__skipped">Скрыто как неинформативное для этого компонента: ${hiddenBlocks
          .map((block) => block.title)
          .join(', ')}.</p>`
      : '';
    indexMount.innerHTML = links + skipped;
  }

  /* ---------- hit area (measured on live sample) ---------- */

  function measureHitArea() {
    const valueSlot = mount.querySelector('[data-hit-area-value]');
    if (!valueSlot || !sampleStage) return;
    const rootPart = parts[0];
    const el = rootPart && rootPart.selector
      ? sampleStage.querySelector(rootPart.selector)
      : sampleStage.firstElementChild;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    valueSlot.textContent = `${w}\u00d7${h}px`;
    const status = mount.querySelector('[data-hit-area-status]');
    if (status) {
      const ok = Math.min(w, h) >= 44;
      status.textContent = ok ? '\u2265 44px — ok' : '< 44px (Web)';
      status.classList.add(ok ? 'spec-hit-ok' : 'spec-hit-warn');
    }
  }

  /* ---------- live token values (theme-aware) ---------- */

  function findEntryById(entryId) {
    let found = null;
    Object.values(aspects).some((entries) =>
      (entries || []).some((entry) => {
        if (entry && entry.__id === entryId) {
          found = entry;
          return true;
        }
        return (entry.extra || []).some((extra) => {
          if (extra.__id === entryId) {
            found = extra;
            return true;
          }
          return false;
        });
      })
    );
    return found;
  }

  // Обновляет только «Размер и hit area» dimension-агенты (widthHeight,
  // живёт в spec-inspector — не дублируется в Guide Page) и generic
  // em-значения в measure-строках. Spatial-диаграммы (inset/gap/radius)
  // больше не рендерятся здесь — см. guide-page.js.
  function refreshSpatialAnnotations() {
    mount.querySelectorAll('[data-entry]').forEach((el) => {
      const entry = findEntryById(el.dataset.entry);
      if (!entry) return;
      const value = entryDisplayValue(entry);
      const em = el.querySelector('em');
      if (em) em.textContent = value;
      el.querySelectorAll('.ds-agent-dimension__bubble').forEach((node) => {
        node.textContent = value;
      });
    });
  }

  function refreshResolved() {
    mount.querySelectorAll('[data-resolve]').forEach((el) => {
      el.textContent = resolveToken(el.dataset.resolve);
    });
    refreshSpatialAnnotations();
  }

  new MutationObserver(refreshResolved).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  /* ---------- boot ---------- */

  renderIndex();
  measureHitArea();
  refreshResolved();
  window.addEventListener('load', measureHitArea);

  // Публичный API для editable-слоя (spec-editor.js): после live-изменения
  // CSS перечитать резолвнутые значения и hit area.
  window.DSSpecInspector = {
    spec,
    refresh() {
      refreshResolved();
      measureHitArea();
    },
  };
})();
