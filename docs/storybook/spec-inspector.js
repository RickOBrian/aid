/* ============================================================
   Spec Inspector — общий inspection/measure framework для
   component spec pages System Storybook.

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
   - «Анатомия» — только если у компонента ≥ 2 именованных частей;
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
  if (!spec || !mount) return;

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
      hint: 'Скругление углов контейнера — отдельный measure-кадр.',
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

  function axisLabelForEntry(entry) {
    const prop = String(entry.property || '').toLowerCase();
    if (/верт|vertical|\(верт|padding-top|padding-bottom|inset-control-v|inset-container-v/.test(prop)) {
      return 'vert';
    }
    if (/гориз|horizontal|\(гориз|padding-left|padding-right|inset-control-h|inset-container-h|лев|прав/.test(prop)) {
      return 'horiz';
    }
    if (/^gap\b|(^|\s)gap(\s|$)/.test(prop)) return 'gap';
    if (/margin-top/.test(prop)) return 'below';
    if (/margin-bottom/.test(prop)) return 'above';
    if (/^padding$/.test(prop)) return 'inset';
    return entry.property || 'measure';
  }

  function groupEntriesByPart(entries) {
    const map = new Map();
    entries.forEach((entry) => {
      const key = entry.part || '_global';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(entry);
    });
    return map;
  }

  function renderInsetDiagram(partId, entries) {
    const partName = partId === '_global' ? 'Component' : partLabel(partId);
    let padTop = '';
    let padRight = '';
    let padBottom = '';
    let padLeft = '';
    const annotations = [];

    entries.forEach((entry) => {
      const prop = String(entry.property || '').toLowerCase();
      const val = entryDisplayValue(entry);
      const label = esc(entry.token || entry.value || '—');
      const chip = entrySourceChip(entry);
      const axis = esc(axisLabelForEntry(entry));
      const entryAttr = entry.__id ? ` data-entry="${esc(entry.__id)}"` : '';
      const ann = `<span class="spec-inset-diagram__ann"${entryAttr}>${chip}<span class="spec-inset-diagram__axis">${axis}</span><code>${label}</code><em>${esc(val)}</em></span>`;
      const band = spatialBandSize(entry);
      const bands = typeof band === 'object' ? band : null;
      const bandPx = typeof band === 'string' ? band : '14px';

      if (/^padding$/.test(prop) && bands) {
        padTop = bands.top;
        padRight = bands.right;
        padBottom = bands.bottom;
        padLeft = bands.left;
        annotations.push(`<div class="spec-inset-diagram__ann-row">${ann}</div>`);
      } else if (/верт|vertical|\(верт|padding-top|padding-bottom|inset-control-v|inset-container-v/.test(prop)) {
        padTop = padBottom = bandPx;
        annotations.push(`<div class="spec-inset-diagram__ann-row spec-inset-diagram__ann-row--v">${ann}</div>`);
      } else if (/гориз|horizontal|\(гориз|inset-control-h|inset-container-h/.test(prop)) {
        padLeft = padRight = bandPx;
        annotations.push(`<div class="spec-inset-diagram__ann-row spec-inset-diagram__ann-row--h">${ann}</div>`);
      } else if (/padding-left|left|лев/.test(prop)) {
        padLeft = bandPx;
        annotations.push(`<div class="spec-inset-diagram__ann-row spec-inset-diagram__ann-row--h">${ann}</div>`);
      } else if (/padding-right|right|прав/.test(prop)) {
        padRight = bandPx;
        annotations.push(`<div class="spec-inset-diagram__ann-row spec-inset-diagram__ann-row--h">${ann}</div>`);
      } else if (/padding|inset|margin/.test(prop)) {
        padTop = padBottom = padLeft = padRight = bandPx;
        annotations.push(`<div class="spec-inset-diagram__ann-row">${ann}</div>`);
      } else {
        annotations.push(`<div class="spec-inset-diagram__ann-row">${ann}</div>`);
      }
    });

    const style = [
      padTop && `--spec-pad-top:${padTop}`,
      padRight && `--spec-pad-right:${padRight}`,
      padBottom && `--spec-pad-bottom:${padBottom}`,
      padLeft && `--spec-pad-left:${padLeft}`,
    ]
      .filter(Boolean)
      .join(';');

    return `
      <div class="spec-inset-diagram" data-part="${esc(partId)}"${style ? ` style="${style}"` : ''}>
        <p class="spec-spatial-frame__part">${esc(partName)}</p>
        <div class="spec-inset-diagram__shell">
          <div class="spec-inset-diagram__band spec-inset-diagram__band--top" aria-hidden="true">
            <span class="spec-inset-diagram__band-label">top</span>
          </div>
          <div class="spec-inset-diagram__mid">
            <div class="spec-inset-diagram__band spec-inset-diagram__band--left" aria-hidden="true">
              <span class="spec-inset-diagram__band-label">left</span>
            </div>
            <div class="spec-inset-diagram__content">content</div>
            <div class="spec-inset-diagram__band spec-inset-diagram__band--right" aria-hidden="true">
              <span class="spec-inset-diagram__band-label">right</span>
            </div>
          </div>
          <div class="spec-inset-diagram__band spec-inset-diagram__band--bottom" aria-hidden="true">
            <span class="spec-inset-diagram__band-label">bottom</span>
          </div>
        </div>
        ${annotations.length ? `<div class="spec-inset-diagram__anns">${annotations.join('')}</div>` : ''}
      </div>`;
  }

  function renderGapDiagram(partId, entries) {
    const partName = partId === '_global' ? 'Component' : partLabel(partId);
    const bridges = entries
      .map((entry) => {
        const label = esc(entry.token || entry.value || '—');
        const val = esc(entryDisplayValue(entry));
        const chip = entrySourceChip(entry);
        const axis = esc(axisLabelForEntry(entry));
        const entryAttr = entry.__id ? ` data-entry="${esc(entry.__id)}"` : '';
        const gapWidth = spatialBandSize(entry);
        const gapStyle =
          typeof gapWidth === 'string' ? ` style="--spec-gap-width:${gapWidth}"` : '';
        return `
          <div class="spec-gap-diagram__bridge"${gapStyle}>
            <span class="spec-gap-diagram__cell">slot A</span>
            <span class="spec-gap-diagram__measure">
              <span class="spec-gap-diagram__line" aria-hidden="true"></span>
              <span class="spec-gap-diagram__label"${entryAttr}>${chip}<span class="spec-gap-diagram__axis">${axis}</span><code>${label}</code><em>${val}</em></span>
            </span>
            <span class="spec-gap-diagram__cell">slot B</span>
          </div>`;
      })
      .join('');
    return `
      <div class="spec-gap-diagram" data-part="${esc(partId)}">
        <p class="spec-spatial-frame__part">${esc(partName)}</p>
        ${bridges}
      </div>`;
  }

  function renderOffsetDiagram(partId, entries) {
    const partName = partId === '_global' ? 'Component' : partLabel(partId);
    const rows = entries
      .map((entry) => {
        const label = esc(entry.token || entry.value || '—');
        const val = esc(entryDisplayValue(entry));
        const chip = entrySourceChip(entry);
        const axis = esc(axisLabelForEntry(entry));
        const entryAttr = entry.__id ? ` data-entry="${esc(entry.__id)}"` : '';
        const arrow = /margin-top/.test(entry.property) ? '↓' : '↑';
        const zoneA = /margin-top/.test(entry.property) ? 'upper zone' : 'content zone';
        const zoneB = /margin-top/.test(entry.property) ? 'content zone' : 'lower zone';
        return `
          <div class="spec-offset-diagram__stack">
            <span class="spec-offset-diagram__zone">${zoneA}</span>
            <span class="spec-offset-diagram__bridge" aria-hidden="true">${arrow}</span>
            <span class="spec-offset-diagram__label"${entryAttr}>${chip}<span class="spec-offset-diagram__axis">${axis}</span><code>${label}</code><em>${val}</em></span>
            <span class="spec-offset-diagram__zone">${zoneB}</span>
          </div>`;
      })
      .join('');
    return `
      <div class="spec-offset-diagram" data-part="${esc(partId)}">
        <p class="spec-spatial-frame__part">${esc(partName)}</p>
        ${rows}
      </div>`;
  }

  function renderRadiusDiagram(entry) {
    const partName = entry.part ? partLabel(entry.part) : 'Component';
    const token = entry.token;
    const radiusStyle = token ? `border-radius: var(--${esc(token)});` : '';
    const label = esc(token || entry.value || '—');
    const val = esc(entryDisplayValue(entry));
    const chip = entrySourceChip(entry);
    const derivedNote = entry.edit
      ? ''
      : '<p class="spec-spatial-frame__derived">derived — декларация может перекрываться другим stylesheet</p>';
    const entryAttr = entry.__id ? ` data-entry="${esc(entry.__id)}"` : '';
    return `
      <div class="spec-radius-diagram" data-part="${esc(entry.part || '')}">
        <p class="spec-spatial-frame__part">${esc(partName)} · ${esc(entry.property)}</p>
        <div class="spec-radius-diagram__stage">
          <div class="spec-radius-diagram__box" style="${radiusStyle}"${token ? ` data-resolve-radius="${esc(token)}"` : ''}>
            <span class="spec-radius-diagram__corner" aria-hidden="true"></span>
            <span class="spec-radius-diagram__callout" aria-hidden="true">corner</span>
          </div>
          <p class="spec-radius-diagram__label"${entryAttr}>${chip}<code>${label}</code><em>${val}</em></p>
        </div>
        ${derivedNote}
      </div>`;
  }

  function renderSpatialFrame(kind, entries) {
    if (kind === 'outer-inset') {
      const byPart = groupEntriesByPart(entries);
      return [...byPart.entries()].map(([partId, partEntries]) => renderInsetDiagram(partId, partEntries)).join('');
    }
    if (kind === 'inner-gap') {
      const byPart = groupEntriesByPart(entries);
      return [...byPart.entries()].map(([partId, partEntries]) => renderGapDiagram(partId, partEntries)).join('');
    }
    if (kind === 'zone-offset') {
      const byPart = groupEntriesByPart(entries);
      return [...byPart.entries()].map(([partId, partEntries]) => renderOffsetDiagram(partId, partEntries)).join('');
    }
    if (kind === 'inner-offset') {
      const byPart = groupEntriesByPart(entries);
      return [...byPart.entries()].map(([partId, partEntries]) => renderInsetDiagram(partId, partEntries)).join('');
    }
    if (kind === 'radius') {
      return entries.map((entry) => renderRadiusDiagram(entry)).join('');
    }
    return '';
  }

  /* ---------- prototype: measure card для outer inset ----------
     Documentation-card подача вместо debug-диаграммы с band-лейблами.
     Включается точечно: spec.presentation.outerInset === 'measure-card'
     (сейчас только Card). Классификация и editable-модель не меняются:
     metadata-строки — те же measureRow с data-entry, к которым
     spec-editor привязывает контролы. */

  const protoOuterInsetCard =
    !!(spec.presentation && spec.presentation.outerInset === 'measure-card');

  function insetAxisOf(entry) {
    const prop = String(entry.property || '').toLowerCase();
    if (/верт|vertical|\(верт|padding-top|padding-bottom/.test(prop)) return 'v';
    if (/гориз|horizontal|\(гориз|padding-left|padding-right/.test(prop)) return 'h';
    return null;
  }

  function insetStatusSuffix(entry) {
    if (entry.hardcoded) return 'hardcode';
    if (!entry.token && !entry.edit) return 'derived';
    return '';
  }

  function bandAxisPx(band, side) {
    if (typeof band === 'string') return band;
    if (band && band[side]) return band[side];
    return '14px';
  }

  function insetCallout(entry, axis) {
    if (!entry) return '';
    const status = insetStatusSuffix(entry);
    const dimCls = status ? ` spec-measure-card__dim--${status}` : '';
    const valCls = status ? ` spec-measure-card__val--${status}` : '';
    return `<span class="spec-measure-card__dim spec-measure-card__dim--${axis}${dimCls}" aria-hidden="true"></span>
      <span class="spec-measure-card__val spec-measure-card__val--${axis}${valCls}" data-entry-value="${esc(entry.__id)}">${esc(entryDisplayValue(entry))}</span>`;
  }

  function renderInsetMeasureCard(partId, entries) {
    const partName = partId === '_global' ? 'Component' : partLabel(partId);
    const vEntry = entries.find((e) => insetAxisOf(e) === 'v');
    const hEntry = entries.find((e) => insetAxisOf(e) === 'h');

    const padVars = [];
    if (vEntry) {
      const px = bandAxisPx(spatialBandSize(vEntry), 'top');
      padVars.push(`--spec-pad-top:${px}`, `--spec-pad-bottom:${px}`);
    }
    if (hEntry) {
      const px = bandAxisPx(spatialBandSize(hEntry), 'left');
      padVars.push(`--spec-pad-left:${px}`, `--spec-pad-right:${px}`);
    }

    const vCallout = insetCallout(vEntry, 'v');
    const hCallout = insetCallout(hEntry, 'h');

    return `
      <div class="spec-measure-card">
        <div class="spec-measure-card__stage">
          <p class="spec-measure-card__caption">${esc(partName)} — inset от границы контейнера до контента</p>
          <div class="spec-inset-diagram spec-measure-card__object" data-part="${esc(partId)}"${padVars.length ? ` style="${padVars.join(';')}"` : ''}>
            ${vCallout}
            ${hCallout}
            <div class="spec-measure-card__content">контент</div>
          </div>
        </div>
        <div class="spec-measure-card__meta">
          <p class="spec-measure-card__meta-caption">Привязка</p>
          ${measureList(entries)}
        </div>
      </div>`;
  }

  function renderInsetMeasureCardGroup(entries) {
    const meta = SPATIAL_GROUPS['outer-inset'];
    const byPart = groupEntriesByPart(entries);
    const cards = [...byPart.entries()]
      .map(([partId, partEntries]) => renderInsetMeasureCard(partId, partEntries))
      .join('');
    return `
      <div class="spec-spatial-group spec-spatial-group--measure-card">
        <p class="spec-spatial-group__label">${esc(meta.label)}</p>
        <p class="spec-spatial-group__hint">${esc(meta.hint)}</p>
        ${cards}
      </div>`;
  }

  function renderSpatialGroup(kind, entries, options = {}) {
    if (kind === 'outer-inset' && !options.nested && protoOuterInsetCard) {
      return renderInsetMeasureCardGroup(entries);
    }
    const meta = SPATIAL_GROUPS[kind] || SPATIAL_GROUPS.other;
    const skipFrame = options.skipFrame || kind === 'border-line';
    const frame = skipFrame ? '' : `<div class="spec-spatial-frame">${renderSpatialFrame(kind, entries)}</div>`;
    const label = options.labelOverride || meta.label;
    return `
      <div class="spec-spatial-group${options.nested ? ' spec-spatial-group--nested' : ''}">
        <p class="spec-spatial-group__label">${esc(label)}</p>
        <p class="spec-spatial-group__hint">${esc(meta.hint)}</p>
        ${options.nestedNote || ''}
        ${frame}
        <p class="spec-spatial-group__controls">Привязка и редактирование</p>
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

  /* ---------- block renderers ---------- */

  function renderAnatomy() {
    const legend = parts
      .map((part, i) => {
        const nested = part.nested
          ? `<p class="spec-nested">nested · ${
              part.nested.href
                ? `<a href="${esc(part.nested.href)}">${esc(part.nested.name)}</a>`
                : `<strong>${esc(part.nested.name)}</strong>`
            } — токены и структура аннотируются в её собственной спеке</p>`
          : '';
        return `
          <li class="spec-anatomy__item" data-part="${esc(part.id)}">
            <span class="spec-pin">${i + 1}</span>
            <div class="spec-anatomy__body">
              <p class="spec-anatomy__name">${esc(part.label)} <code>${esc(part.selector)}</code></p>
              ${part.description ? `<p class="spec-anatomy__desc">${part.description}</p>` : ''}
              ${nested}
            </div>
          </li>`;
      })
      .join('');
    return `
      <div class="spec-anatomy__stage" data-anatomy-stage></div>
      <ol class="spec-anatomy__legend">${legend}</ol>`;
  }

  function renderSize() {
    const rows = (aspects.size || []).map(measureRow);
    if (spec.interactive) {
      rows.push(`
        <div class="spec-measure__row spec-measure__row--hit">
          <span class="spec-measure__target">Hit area · измерено на сэмпле</span>
          <span class="spec-measure__token"><span class="spec-hit-value" data-hit-area-value>…</span></span>
          <span class="spec-measure__value" data-hit-area-status></span>
          <p class="spec-measure__note">Референс: touch target 44×44px (Web) из правил проекта.</p>
        </div>`);
    }
    return `<div class="spec-measure">${rows.join('')}</div>`;
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
      id: 'anatomy',
      title: 'Анатомия',
      hint: 'Части текущего компонента; номера продублированы на сэмпле. Наведите на строку, чтобы подсветить элемент.',
      visible: () => parts.length >= 2,
      count: () => parts.length,
      countLabel: 'частей',
      tokens: () => [],
      render: renderAnatomy,
    },
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
      hint: 'Пространственные отношения по смысловым группам: outer inset, inner gaps, zone spacing — каждая с отдельным measure-кадром.',
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
      hint: 'Radius — отдельный visual measure-кадр; border stroke — таблица значений без смешивания с inset/gap.',
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

  /* ---------- anatomy stage: clone sample + pins ---------- */

  function findPartEl(stage, part) {
    if (!part.selector) return null;
    return stage.querySelector(part.selector);
  }

  function positionPins(stage) {
    stage.querySelectorAll('.spec-pin--stage').forEach((pin) => pin.remove());
    const stageRect = stage.getBoundingClientRect();
    const placed = [];
    parts.forEach((part, i) => {
      const el = findPartEl(stage, part);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      let left = Math.max(0, rect.left - stageRect.left - 9);
      const top = Math.max(0, rect.top - stageRect.top - 9);
      // Разводим пины, попавшие в одну точку (вложенные/совпадающие части)
      while (placed.some((p) => Math.abs(p.left - left) < 20 && Math.abs(p.top - top) < 20)) {
        left += 22;
      }
      placed.push({ left, top });
      const pin = document.createElement('span');
      pin.className = 'spec-pin spec-pin--stage';
      pin.textContent = String(i + 1);
      pin.style.left = left + 'px';
      pin.style.top = top + 'px';
      stage.appendChild(pin);
    });
  }

  function mountAnatomy() {
    const stage = mount.querySelector('[data-anatomy-stage]');
    if (!stage || !sampleStage) return;
    stage.innerHTML = sampleStage.innerHTML;
    stage.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    stage.querySelectorAll('input, button, a').forEach((el) => {
      el.setAttribute('tabindex', '-1');
    });
    positionPins(stage);
    let raf = null;
    window.addEventListener('resize', () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => positionPins(stage));
    });
    window.addEventListener('load', () => positionPins(stage));
  }

  function bindHighlights() {
    const stage = mount.querySelector('[data-anatomy-stage]');
    if (!stage) return;
    mount.querySelectorAll('[data-part]').forEach((row) => {
      const part = parts.find((p) => p.id === row.dataset.part);
      if (!part) return;
      row.addEventListener('mouseenter', () => {
        const el = findPartEl(stage, part);
        if (el) el.classList.add('spec-part-highlight');
      });
      row.addEventListener('mouseleave', () => {
        stage
          .querySelectorAll('.spec-part-highlight')
          .forEach((el) => el.classList.remove('spec-part-highlight'));
      });
    });
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

  function refreshSpatialAnnotations() {
    // value-only callouts (measure card): не несут data-entry, чтобы
    // editable-контролы оставались на metadata-строках. Живой токен после
    // правки читается из data-resolve той же строки (его обновляет editor).
    mount.querySelectorAll('[data-entry-value]').forEach((el) => {
      const id = el.dataset.entryValue;
      const rowResolve = mount.querySelector(`[data-entry="${CSS.escape(id)}"] [data-resolve]`);
      const liveToken = rowResolve ? rowResolve.dataset.resolve : null;
      const entry = findEntryById(id);
      const value = liveToken ? resolveToken(liveToken) : entry ? entryDisplayValue(entry) : '';
      if (!value) return;
      el.textContent = value;

      const object = el.closest('.spec-measure-card__object');
      if (!object) return;
      const px = spatialPxLength(value);
      if (!px) return;
      if (el.classList.contains('spec-measure-card__val--v')) {
        object.style.setProperty('--spec-pad-top', px);
        object.style.setProperty('--spec-pad-bottom', px);
      } else if (el.classList.contains('spec-measure-card__val--h')) {
        object.style.setProperty('--spec-pad-left', px);
        object.style.setProperty('--spec-pad-right', px);
      }
    });

    mount.querySelectorAll('[data-entry]').forEach((el) => {
      const entry = findEntryById(el.dataset.entry);
      if (!entry) return;
      const em = el.querySelector('em');
      if (em) em.textContent = entryDisplayValue(entry);
      const bridge = el.closest('.spec-gap-diagram__bridge');
      if (bridge) {
        const band = spatialBandSize(entry);
        if (typeof band === 'string') bridge.style.setProperty('--spec-gap-width', band);
      }
    });

    mount.querySelectorAll('.spec-inset-diagram').forEach((diagram) => {
      // measure card обновляется выше по live-токенам callout'ов
      if (diagram.classList.contains('spec-measure-card__object')) return;
      const partId = diagram.dataset.part;
      const entries = (aspects.spacing || []).filter(
        (entry) => (entry.part || '_global') === partId && spatialKind(entry, 'spacing') === 'outer-inset'
      );
      if (!entries.length) return;
      let padTop = '';
      let padRight = '';
      let padBottom = '';
      let padLeft = '';
      entries.forEach((entry) => {
        const prop = String(entry.property || '').toLowerCase();
        const band = spatialBandSize(entry);
        const bands = typeof band === 'object' ? band : null;
        // одиночное значение ('16px') приходит объектом из shorthand-парсера —
        // берём осевую сторону, не сваливаясь в дефолт
        const bandPx = bandAxisPx(band, 'top');
        if (/^padding$/.test(prop) && bands) {
          padTop = bands.top;
          padRight = bands.right;
          padBottom = bands.bottom;
          padLeft = bands.left;
        } else if (/верт|vertical|\(верт|padding-top|padding-bottom|inset-control-v|inset-container-v/.test(prop)) {
          padTop = padBottom = bandPx;
        } else if (/гориз|horizontal|\(гориз|inset-control-h|inset-container-h/.test(prop)) {
          padLeft = padRight = bandPx;
        } else if (/padding-left|left|лев/.test(prop)) {
          padLeft = bandPx;
        } else if (/padding-right|right|прав/.test(prop)) {
          padRight = bandPx;
        } else if (/padding|inset|margin/.test(prop)) {
          padTop = padBottom = padLeft = padRight = bandPx;
        }
      });
      const style = [
        padTop && `--spec-pad-top:${padTop}`,
        padRight && `--spec-pad-right:${padRight}`,
        padBottom && `--spec-pad-bottom:${padBottom}`,
        padLeft && `--spec-pad-left:${padLeft}`,
      ]
        .filter(Boolean)
        .join(';');
      if (style) diagram.setAttribute('style', style);
    });
  }

  function refreshResolved() {
    mount.querySelectorAll('[data-resolve]').forEach((el) => {
      el.textContent = resolveToken(el.dataset.resolve);
    });
    mount.querySelectorAll('[data-resolve-radius]').forEach((el) => {
      const token = el.dataset.resolveRadius;
      if (token) el.style.borderRadius = `var(--${token})`;
    });
    refreshSpatialAnnotations();
  }

  new MutationObserver(refreshResolved).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  /* ---------- boot ---------- */

  renderIndex();
  mountAnatomy();
  bindHighlights();
  measureHitArea();
  refreshResolved();
  window.addEventListener('load', measureHitArea);

  // Публичный API для editable-слоя (spec-editor.js): после live-изменения
  // CSS перечитать резолвнутые значения, hit area и позиции пинов.
  window.DSSpecInspector = {
    spec,
    refresh() {
      refreshResolved();
      measureHitArea();
      const stage = mount.querySelector('[data-anatomy-stage]');
      if (stage) positionPins(stage);
    },
  };
})();
