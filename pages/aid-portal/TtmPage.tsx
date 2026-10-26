import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { isTtmData, type TtmChainStep, type TtmComplexity, type TtmData } from './api/_lib/ttm';
import { apiUrl, withBase } from './base';
import { DS_PORTAL_LAYOUT_TOKENS, DS_TOKEN_TABLE_STYLE } from './dsChangelogTable';
import { DS_PRODUCT_ACCENT_STYLE } from './dsProductAccent';
import {
  HOURS_PER_FTE,
  ROLE_LABEL,
  SPECIALISTS,
  calcProducts,
  complexityPoints,
  formatMinutes,
  niceMax,
  spreadRange,
  calcTotals,
  chainFor,
  chainHours,
  formatDuration,
  formatNumber,
  formatStepHours,
  leversFromData,
  ratio,
  specialistSplit,
  type TtmLevers,
} from './ttmModel';

/**
 * «КПД команды AID» — `aidteam.pro/ttm` (AID-13). Ссылок на страницу в меню
 * и на других страницах портала нет — решение PD.
 *
 * Данные закрытые: приходят из `/api/ttm` только с сессией, в коде — вёрстка
 * и формулы (`ttmModel.ts`). Локально `npm run dev` функций не выполняет —
 * данные берутся из `ttm-data.local.json` рядом, если он есть (в git не
 * попадает, `.gitignore`).
 *
 * Анимация появления: секция, попав в экран, досчитывает числа и
 * выращивает полосы. При `prefers-reduced-motion` всё сразу в конечном виде.
 */

const T = DS_PORTAL_LAYOUT_TOKENS;

const PAGE_STYLE = `
${DS_TOKEN_TABLE_STYLE}
${DS_PRODUCT_ACCENT_STYLE}
.ttm, .ttm *, .ttm *::before, .ttm *::after { box-sizing: border-box; }
.ttm {
  /* «До» — text-warning, «после» — text-accent (графит) до задачи на цвета данных (спека §3.7, §7.1 п. 14а) */
  --ttm-before: var(--pf-text-warning);
  --ttm-after: var(--pf-text-accent);
  font: var(--pf-font-body-m);
  color: ${T.textPrimary};
  background: ${T.surface};
  min-height: 100vh;
  padding: ${T.pagePaddingDesktop};
}
.ttm-shell { max-width: 1080px; margin: 0 auto; display: grid; gap: var(--pf-spacing-48); }
.ttm-shell > *, .ttm-header > *, .ttm-section > * { min-width: 0; }
.ttm h1, .ttm h2, .ttm h3 { margin: 0; font-weight: var(--pf-type-weight-500); text-wrap: balance; }
.ttm h1 { font: var(--pf-font-heading-l); letter-spacing: var(--pf-tracking-heading-l); }
.ttm h2 { font: var(--pf-font-heading-m); }
.ttm h3 { font: var(--pf-font-heading-s); }
.ttm p { margin: 0; max-width: 72ch; }
.ttm-eyebrow {
  font: var(--pf-font-label-xs-caps);
  letter-spacing: var(--pf-tracking-label-xs-caps); text-transform: uppercase;
  color: ${T.textSecondary};
}
.ttm-muted { color: ${T.textSecondary}; }
.ttm-num { font-variant-numeric: tabular-nums; }
.ttm-section { display: grid; gap: var(--pf-spacing-16); }
.ttm-header { display: grid; gap: var(--pf-spacing-12); }
.ttm-card {
  background: ${T.surface};
  border: 1px solid ${T.border};
  border-radius: var(--pf-radius-m);
  padding: var(--pf-spacing-20);
}
.ttm-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: var(--pf-spacing-16); margin-top: var(--pf-spacing-12); }
.ttm-kpi { display: grid; gap: var(--pf-spacing-6); align-content: start; min-width: 0; }
.ttm-kpi-value { font: var(--pf-font-heading-l); letter-spacing: var(--pf-tracking-heading-l); font-variant-numeric: tabular-nums; }
.ttm-kpi-value small { font: var(--pf-font-body-m); color: ${T.textSecondary}; margin-left: var(--pf-spacing-4); }
.ttm-kpi-note { font: var(--pf-font-body-s); color: ${T.textSecondary}; }
/* Ведущая карточка KPI — графит: bg-inverse-main + text-inverse */
.ttm-kpi-lead { background: var(--pf-bg-inverse-main); border-color: var(--pf-bg-inverse-main); color: var(--pf-text-inverse); }
.ttm-kpi-lead .ttm-eyebrow, .ttm-kpi-lead .ttm-kpi-value, .ttm-kpi-lead .ttm-kpi-value small, .ttm-kpi-lead .ttm-kpi-note { color: var(--pf-text-inverse); }
.ttm-kpi-lead :focus-visible { outline: 2px solid var(--pf-line-focus-inverse); outline-offset: ${T.focusOffset}; }
.ttm-filter { display: flex; flex-wrap: wrap; align-items: center; gap: var(--pf-spacing-8) var(--pf-spacing-16); margin-top: var(--pf-spacing-8); }
/* Сегмент — SegmentedControl (§7.2); нажатый — --ds-selected-* (DS_PRODUCT_ACCENT_STYLE) */
.ttm-segment { display: inline-flex; max-width: 100%; min-width: 0; overflow-x: auto; scrollbar-width: none; border: 1px solid ${T.border}; border-radius: var(--pf-radius-m); }
.ttm-segment button {
  min-height: 36px; padding: var(--pf-spacing-6) var(--pf-spacing-16); border: none; border-right: 1px solid ${T.border};
  background: ${T.surface}; color: ${T.textSecondary}; cursor: pointer; white-space: nowrap; flex: 0 0 auto;
  font: var(--pf-font-body-s); font-weight: var(--pf-type-weight-500); /* pf-gap: label-m (14/20·500), размер прежний 13 */
  transition: background-color 150ms ease;
}
.ttm-segment button:hover:not([aria-pressed='true']) { background: #f5f5f5; /* pf-gap: bg-accent-states-hover (пачка №0) */ }
.ttm-segment button:last-child { border-right: none; }
.ttm-rows { display: grid; gap: var(--pf-spacing-4); }
.ttm-cx { display: grid; gap: var(--pf-spacing-16); }
.ttm-cx > * { min-width: 0; }
.ttm-cx-top { display: flex; flex-wrap: wrap; align-items: center; gap: var(--pf-spacing-8) var(--pf-spacing-12); }
.ttm-cx-top label { font: var(--pf-font-body-s); color: ${T.textSecondary}; }
/* Поле выбора — FieldSelect (§7.2): line-default → line-hover, radius-m */
.ttm-cx select {
  flex: 1 1 260px; min-width: 0; width: 100%; min-height: 36px; padding: var(--pf-spacing-6) var(--pf-spacing-10); text-overflow: ellipsis;
  font: var(--pf-font-body-m); font-size: 14px; line-height: 20px; font-weight: var(--pf-type-weight-500); /* pf-gap: label-m (14/20·500) */
  color: ${T.textPrimary}; background: ${T.surface}; border: 1px solid ${T.border}; border-radius: var(--pf-radius-m);
  transition: border-color 150ms ease;
}
.ttm-cx select:hover { border-color: ${T.borderHover}; }
/* Бейдж сложности — Badge Neutral (без пунктира) */
.ttm-badge {
  display: inline-flex; align-items: center; padding: var(--pf-spacing-4) var(--pf-spacing-8); border-radius: var(--pf-radius-pill);
  font: var(--pf-font-label-s); background: var(--pf-bg-accent-status-neutral-main); color: var(--pf-text-neutral);
}
.ttm-cx svg { display: block; width: 100%; height: auto; overflow: visible; }
.ttm-cx .ttm-cx-grid { stroke: ${T.border}; stroke-dasharray: 2 4; }
.ttm-cx .ttm-cx-axis { stroke: ${T.border}; }
.ttm-cx text { fill: ${T.textSecondary}; font-family: ${T.fontFamily}; font-size: 12px; font-weight: var(--pf-type-weight-400); /* pf-gap: body-xs (12/16·400) */ }
.ttm-cx .ttm-cx-value { fill: ${T.textPrimary}; font-weight: var(--pf-type-weight-500); }
.ttm-cx .ttm-cx-band-before { fill: var(--ttm-before); fill-opacity: 0.18; }
.ttm-cx .ttm-cx-band-after { fill: var(--ttm-after); fill-opacity: 0.16; }
.ttm-cx .ttm-cx-line { fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
.ttm-cx .ttm-cx-line-before { stroke: var(--ttm-before); }
.ttm-cx .ttm-cx-line-after { stroke: var(--ttm-after); }
.ttm-cx .ttm-cx-point { stroke: ${T.surface}; stroke-width: 2; }
.ttm-cx .ttm-cx-point-before { fill: var(--ttm-before); }
.ttm-cx .ttm-cx-point-after { fill: var(--ttm-after); }
.ttm-cx .ttm-cx-draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: ttm-draw 1.1s ease-out forwards; }
@keyframes ttm-draw { to { stroke-dashoffset: 0; } }
@media (prefers-reduced-motion: reduce) { .ttm-cx .ttm-cx-draw { animation: none; stroke-dashoffset: 0; } }
.ttm-mix { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--pf-spacing-8) var(--pf-spacing-12); }
.ttm-mix div { display: grid; gap: var(--pf-spacing-4); font: var(--pf-font-body-s); color: ${T.textSecondary}; }
.ttm-mix i { display: block; height: 6px; border-radius: var(--pf-radius-s); background: ${T.textMuted}; }
.ttm-row {
  display: grid; grid-template-columns: minmax(120px, 0.9fr) minmax(0, 2fr) minmax(110px, 0.7fr);
  gap: var(--pf-spacing-8) var(--pf-spacing-20); align-items: center; padding: var(--pf-spacing-12); border-radius: var(--pf-radius-m);
}
.ttm-row-selected { background: ${T.surfaceMuted}; /* pf-gap: bg-accent-states-active (пачка №0); было --ds-accent-bg */ }
.ttm-row-name b { display: block; font-weight: var(--pf-type-weight-500); }
.ttm-row-name small { display: block; font-size: 12px; line-height: 16px; font-weight: var(--pf-type-weight-400); /* pf-gap: body-xs (12/16·400) */ color: ${T.textSecondary}; font-variant-numeric: tabular-nums; }
.ttm-row-meta { text-align: right; }
.ttm-row-meta b { display: block; font: var(--pf-font-heading-s); color: var(--ds-accent); font-variant-numeric: tabular-nums; }
.ttm-row-meta span { display: block; font-size: 12px; line-height: 16px; font-weight: var(--pf-type-weight-400); /* pf-gap: body-xs (12/16·400) */ color: ${T.textSecondary}; font-variant-numeric: tabular-nums; }
.ttm-pair-row.ttm-wide { grid-template-columns: minmax(0, 1fr) 72px; }
.ttm-levers { display: grid; gap: var(--pf-spacing-16); }
.ttm-levers-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: var(--pf-spacing-16) var(--pf-spacing-24); }
.ttm-lever { display: grid; gap: var(--pf-spacing-6); min-width: 0; }
.ttm-lever label { display: flex; justify-content: space-between; gap: var(--pf-spacing-8); font: var(--pf-font-body-s); color: ${T.textSecondary}; }
.ttm-lever output { color: ${T.textPrimary}; font-variant-numeric: tabular-nums; font-weight: var(--pf-type-weight-500); }
.ttm input[type='range'] { width: 100%; accent-color: var(--ds-accent); }
.ttm-check { display: flex; gap: var(--pf-spacing-8); align-items: center; font: var(--pf-font-body-s); color: ${T.textSecondary}; }
.ttm-check input { accent-color: var(--ds-accent); }
.ttm-legend { display: flex; flex-wrap: wrap; gap: var(--pf-spacing-20); font: var(--pf-font-body-s); color: ${T.textSecondary}; }
.ttm-legend i { display: inline-block; width: 12px; height: 12px; border-radius: var(--pf-radius-s); margin-right: var(--pf-spacing-6); vertical-align: -1px; }
.ttm-before { background: var(--ttm-before); }
.ttm-after { background: var(--ttm-after); }
.ttm-chain { display: grid; gap: var(--pf-spacing-20); }
.ttm-track { display: grid; grid-template-columns: 72px minmax(0, 1fr) 80px; gap: var(--pf-spacing-12); align-items: center; }
.ttm-track-total { text-align: right; font-weight: var(--pf-type-weight-500); font-variant-numeric: tabular-nums; }
.ttm-bar { display: flex; gap: var(--pf-spacing-2); height: 28px; min-width: 0; }
.ttm-seg { height: 100%; border-radius: var(--pf-radius-s); flex: 0 0 auto; }
.ttm-seg:focus-visible { outline: ${T.focusRing}; outline-offset: ${T.focusOffset}; }
.ttm-seg-wait {
  background-image: repeating-linear-gradient(135deg, transparent 0 5px, color-mix(in srgb, ${T.surface} 45%, transparent) 5px 8px);
}
.ttm-steps { display: grid; grid-template-columns: 1fr 1fr; gap: var(--pf-spacing-20); }
.ttm-steps ol { margin: var(--pf-spacing-8) 0 0; padding-left: var(--pf-spacing-20); display: grid; gap: var(--pf-spacing-4); }
.ttm-steps li span { margin-left: var(--pf-spacing-6); font-size: 12px; line-height: 16px; font-weight: var(--pf-type-weight-400); /* pf-gap: body-xs (12/16·400) */ color: ${T.textSecondary}; font-variant-numeric: tabular-nums; }
.ttm-owners { display: grid; gap: var(--pf-spacing-40); }
.ttm-owner { display: grid; gap: var(--pf-spacing-12); }
.ttm-owner-head {
  display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: var(--pf-spacing-12);
  padding-bottom: var(--pf-spacing-8); border-bottom: 1px solid ${T.border};
}
.ttm-owner-head h3 { font: var(--pf-font-heading-s); }
.ttm-owner-sum { color: ${T.textSecondary}; font-variant-numeric: tabular-nums; }
.ttm-tool { display: grid; gap: var(--pf-spacing-16); }
.ttm-tool-head { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: var(--pf-spacing-12); }
.ttm-tool-head > div:first-child { flex: 1 1 420px; min-width: 0; }
.ttm-tool-job { margin-top: var(--pf-spacing-6); }
.ttm-tool-story { display: grid; gap: var(--pf-spacing-6); margin-top: var(--pf-spacing-10); font: var(--pf-font-body-s); color: ${T.textSecondary}; }
.ttm-tool-story b { display: inline-flex; align-items: center; gap: var(--pf-spacing-6); margin-right: var(--pf-spacing-6); font-weight: var(--pf-type-weight-500); color: ${T.textPrimary}; }
.ttm-tool-story b::before { content: ''; width: 10px; height: 10px; border-radius: var(--pf-radius-s); background: var(--ttm-mark); }
/* Тег — Badge Neutral */
.ttm-tag {
  display: inline-block; margin-left: var(--pf-spacing-8); padding: var(--pf-spacing-4) var(--pf-spacing-8); border-radius: var(--pf-radius-pill);
  background: var(--pf-bg-accent-status-neutral-main); color: var(--pf-text-neutral);
  font: var(--pf-font-label-s); vertical-align: 2px;
}
.ttm-tool-factor { text-align: right; }
.ttm-tool-factor b { display: block; font: var(--pf-font-heading-m); color: var(--ds-accent); font-variant-numeric: tabular-nums; }
.ttm-tool-factor span { font-size: 12px; line-height: 16px; font-weight: var(--pf-type-weight-400); /* pf-gap: body-xs (12/16·400) */ color: ${T.textSecondary}; font-variant-numeric: tabular-nums; }
.ttm-ops { display: grid; gap: var(--pf-spacing-12); }
.ttm-op { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 2fr); gap: var(--pf-spacing-6) var(--pf-spacing-16); align-items: center; }
.ttm-op-label small { display: block; font-size: 12px; line-height: 16px; font-weight: var(--pf-type-weight-400); /* pf-gap: body-xs (12/16·400) */ color: ${T.textSecondary}; font-variant-numeric: tabular-nums; }
.ttm-pair { display: grid; gap: var(--pf-spacing-4); min-width: 0; }
.ttm-pair-row { display: grid; grid-template-columns: minmax(0, 1fr) 64px; gap: var(--pf-spacing-8); align-items: center; }
.ttm-fill { height: 10px; border-radius: var(--pf-radius-s); min-width: 2px; }
.ttm-pair-row span { font-size: 12px; line-height: 16px; font-weight: var(--pf-type-weight-400); /* pf-gap: body-xs (12/16·400) */ color: ${T.textSecondary}; text-align: right; font-variant-numeric: tabular-nums; }
.ttm-settled .ttm-seg, .ttm-settled .ttm-fill { transition: width 0.25s ease-out; }
.ttm-table td.ttm-n, .ttm-table th.ttm-n { text-align: right; font-variant-numeric: tabular-nums; }
.ttm-table td, .ttm-table th { white-space: nowrap; }
.ttm-table tfoot td { font-weight: var(--pf-type-weight-500); border-top: 1px solid ${T.border}; padding: ${T.tableCellPadding}; }
.ttm-facts {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1px;
  background: ${T.border}; border: 1px solid ${T.border}; border-radius: var(--pf-radius-m); overflow: hidden;
}
.ttm-fact { background: ${T.surface}; padding: var(--pf-spacing-16); display: grid; gap: var(--pf-spacing-4); align-content: start; }
.ttm-fact b { font: var(--pf-font-heading-m); font-variant-numeric: tabular-nums; }
.ttm-fact span { font: var(--pf-font-body-s); color: ${T.textSecondary}; }
.ttm-method { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--pf-spacing-20) var(--pf-spacing-32); }
.ttm-method p { margin-top: var(--pf-spacing-6); color: ${T.textSecondary}; }
.ttm details summary { cursor: pointer; color: var(--ds-accent); font-weight: var(--pf-type-weight-500); }
.ttm details[open] summary { margin-bottom: var(--pf-spacing-12); }
.ttm :focus-visible { outline: ${T.focusRing}; outline-offset: ${T.focusOffset}; }
.ttm-status { max-width: 560px; margin: 80px auto; display: grid; gap: var(--pf-spacing-12); }
.ttm-status a { color: var(--ds-accent); text-decoration: var(--ds-link-decoration); }
@media (max-width: 767px) {
  .ttm { padding: ${T.pagePaddingMobile}; }
  .ttm-op, .ttm-steps { grid-template-columns: 1fr; }
  .ttm-row { grid-template-columns: 1fr auto; }
  .ttm-row .ttm-pair { grid-column: 1 / -1; grid-row: 2; }
  /* График сжимается вдвое — подписи в единицах viewBox крупнее (не токен: масштаб SVG). */
  .ttm-cx text { font-size: 18px; }
  .ttm-track { grid-template-columns: 56px minmax(0, 1fr) 64px; }
}
`;

// ── Анимация появления ──────────────────────────────────────────────

const REVEAL_MS = 1100;

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

const easeOut = (t: number) => 1 - (1 - t) ** 3;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** Прогресс i-го элемента из `count`: элементы стартуют лесенкой. */
function staggered(progress: number, index: number, count: number): number {
  const start = count > 1 ? (index / (count - 1)) * 0.35 : 0;
  return easeOut(clamp01((progress - start) / 0.65));
}

/** 0 → 1 за `REVEAL_MS`, когда секция попала в экран; сразу 1 без анимации. */
function useReveal<E extends Element>(): [RefObject<E>, number] {
  const ref = useRef<E>(null);
  const [progress, setProgress] = useState(() => (prefersReducedMotion() ? 1 : 0));

  useEffect(() => {
    const element = ref.current;
    if (progress >= 1 || !element) {
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      setProgress(1);
      return;
    }
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }
        observer.disconnect();
        const startedAt = performance.now();
        const tick = (now: number) => {
          const next = clamp01((now - startedAt) / REVEAL_MS);
          setProgress(next);
          if (next < 1) {
            frame = requestAnimationFrame(tick);
          }
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.15 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
    // Анимация одна на секцию — запускается один раз.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, progress];
}

/** «16 недель» → досчитываем 16, хвост оставляем. Не число в начале — как есть. */
function countUpText(text: string, t: number): string {
  const match = /^(\d+(?:[.,]\d+)?)(.*)$/s.exec(text);
  if (!match || t >= 1) {
    return text;
  }
  const [, number, rest] = match;
  const digits = number.includes(',') || number.includes('.') ? number.split(/[.,]/)[1].length : 0;
  return `${formatNumber(Number(number.replace(',', '.')) * t, digits)}${rest}`;
}

/** Прогресс третьей плитки (TTM) — та же лесенка, что у остальных плиток. */
const at0 = (progress: number) => staggered(progress, 2, 4);

// ── Данные ──────────────────────────────────────────────────────────

type LoadState =
  | { kind: 'loading' }
  | { kind: 'ready'; data: TtmData }
  | { kind: 'preview' }
  | { kind: 'unauthorized' }
  | { kind: 'unavailable' };

const localData = import.meta.env.DEV
  ? (import.meta.glob('./ttm-data.local.json', { import: 'default' }) as Record<string, () => Promise<unknown>>)
  : {};

async function loadData(signal: AbortSignal): Promise<LoadState> {
  const local = Object.values(localData)[0];
  if (local) {
    const data = await local();
    return isTtmData(data) ? { kind: 'ready', data } : { kind: 'unavailable' };
  }
  const response = await fetch(apiUrl('/api/ttm'), { signal, credentials: 'same-origin' });
  if (response.status === 401) {
    return { kind: 'unauthorized' };
  }
  if (response.status === 404) {
    return { kind: 'preview' };
  }
  if (!response.ok) {
    return { kind: 'unavailable' };
  }
  const body: unknown = await response.json();
  return isTtmData(body) ? { kind: 'ready', data: body } : { kind: 'unavailable' };
}

function useTtmData(): LoadState {
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal)
      .then(setState)
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({ kind: 'unavailable' });
        }
      });
    return () => controller.abort();
  }, []);
  return state;
}

// ── Секции ──────────────────────────────────────────────────────────

function Kpis({ data, levers }: { data: TtmData; levers: TtmLevers }) {
  const [ref, progress] = useReveal<HTMLDivElement>();
  const totals = calcTotals(data, levers);
  const before = chainHours(chainFor(data.chain.before, data.products, levers.product));
  const after = chainHours(chainFor(data.chain.after, data.products, levers.product));
  const productName = data.products.find((product) => product.id === levers.product)?.name;
  const range = data.complexity ? spreadRange(totals.before, totals.after, data.complexity.spread) : null;
  const ttmBefore = formatDuration(before * at0(progress));
  const ttmAfter = formatDuration(after * at0(progress));
  const at = (index: number) => staggered(progress, index, 4);

  return (
    <div className="ttm-kpis" ref={ref}>
      <div className="ttm-card ttm-kpi ttm-kpi-lead">
        <span className="ttm-eyebrow">КПД команды</span>
        <span className="ttm-kpi-value">
          {formatNumber(totals.factor * at(0), 1)}
          <small>×</small>
        </span>
        <span className="ttm-kpi-note">
          {range
            ? `обычно; диапазон ×${formatNumber(range.factorLow, 1)}–${formatNumber(range.factorHigh, 1)} от быстрого случая до долгого`
            : 'во столько раз быстрее те же операции'}
        </span>
      </div>
      <div className="ttm-card ttm-kpi">
        <span className="ttm-eyebrow">Возвращено в месяц</span>
        <span className="ttm-kpi-value">
          {formatNumber(totals.saved * at(1))}
          <small>ч</small>
        </span>
        <span className="ttm-kpi-note">
          {range && `от ${formatNumber(range.savedLow)} до ${formatNumber(range.savedHigh)} ч · `}≈{' '}
          {formatNumber(totals.saved / HOURS_PER_FTE, 1)} ставки сотрудника · было {formatNumber(totals.before)} ч, стало{' '}
          {formatNumber(totals.after)} ч
        </span>
      </div>
      <div className="ttm-card ttm-kpi">
        <span className="ttm-eyebrow">TTM изменения токена</span>
        <span className="ttm-kpi-value">
          {ttmBefore.value}
          <small>{ttmBefore.unit} →</small> {ttmAfter.value}
          <small>{ttmAfter.unit}</small>
        </span>
        <span className="ttm-kpi-note">
          от решения до кода у разработчика · {productName ?? 'средний продукт'}
        </span>
      </div>
      <div className="ttm-card ttm-kpi">
        <span className="ttm-eyebrow">В деньгах, в месяц</span>
        <span className="ttm-kpi-value">
          {formatNumber((totals.rubPerMonth / 1e6) * at(3), 2)}
          <small>млн ₽</small>
        </span>
        <span className="ttm-kpi-note">
          по {formatNumber(levers.rate)} ₽ за час · ≈ {formatNumber((totals.rubPerMonth * 12) / 1e6, 1)} млн ₽ в год
        </span>
      </div>
    </div>
  );
}

interface LeverSpec {
  key: Exclude<keyof TtmLevers, 'pilots' | 'load' | 'product'> | 'loadPercent';
  label: string;
  min: number;
  max: number;
  step?: number;
}

const LEVERS: LeverSpec[] = [
  { key: 'designers', label: 'Дизайнеров', min: 1, max: 40 },
  { key: 'developers', label: 'Разработчиков', min: 1, max: 60 },
  { key: 'engineers', label: 'Инженеров AID', min: 1, max: 10 },
  { key: 'pms', label: 'Продактов', min: 1, max: 40 },
  { key: 'rate', label: 'Стоимость часа, ₽', min: 1000, max: 6000, step: 250 },
  { key: 'loadPercent', label: 'Загрузка операциями', min: 50, max: 150, step: 10 },
];

function Levers({ levers, pilotsLabel, onChange }: { levers: TtmLevers; pilotsLabel: string; onChange: (next: TtmLevers) => void }) {
  const valueOf = (key: LeverSpec['key']) => (key === 'loadPercent' ? Math.round(levers.load * 100) : levers[key]);
  return (
    <div className="ttm-card ttm-levers">
      <div className="ttm-levers-row">
        {LEVERS.map((lever) => {
          const id = `ttm-lever-${lever.key}`;
          const value = valueOf(lever.key);
          return (
            <div className="ttm-lever" key={lever.key}>
              <label htmlFor={id}>
                {lever.label}
                <output htmlFor={id}>{lever.key === 'loadPercent' ? `${value} %` : formatNumber(value)}</output>
              </label>
              <input
                id={id}
                type="range"
                min={lever.min}
                max={lever.max}
                step={lever.step ?? 1}
                value={value}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  onChange(lever.key === 'loadPercent' ? { ...levers, load: next / 100 } : { ...levers, [lever.key]: next });
                }}
              />
            </div>
          );
        })}
      </div>
      <label className="ttm-check">
        <input type="checkbox" checked={levers.pilots} onChange={(event) => onChange({ ...levers, pilots: event.target.checked })} />
        {pilotsLabel}
      </label>
    </div>
  );
}

function ChainBar({ steps, max, kind, progress }: { steps: TtmChainStep[]; max: number; kind: 'before' | 'after'; progress: number }) {
  return (
    <div className="ttm-bar">
      {steps.map((step, index) => {
        const label = `${step.label}: ${formatStepHours(step.hours)} ч${step.wait ? ' ожидания' : ''}`;
        return (
          <div
            key={index}
            className={`ttm-seg ttm-${kind}${step.wait ? ' ttm-seg-wait' : ''}`}
            style={{ width: `calc(${(step.hours / max) * 100 * staggered(progress, index, steps.length)}% - 2px)` }}
            tabIndex={0}
            role="img"
            aria-label={label}
            title={label}
          />
        );
      })}
    </div>
  );
}

function StepList({ steps }: { steps: TtmChainStep[] }) {
  return (
    <ol>
      {steps.map((step, index) => (
        <li key={index}>
          {step.label}
          <span>
            {formatStepHours(step.hours)} ч{step.wait ? ' ожид.' : ''}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Chain({ data, filter }: { data: TtmData; filter: TtmLevers['product'] }) {
  const [ref, progress] = useReveal<HTMLDivElement>();
  const stepsBefore = chainFor(data.chain.before, data.products, filter);
  const stepsAfter = chainFor(data.chain.after, data.products, filter);
  const before = chainHours(stepsBefore);
  const after = chainHours(stepsAfter);
  const max = Math.max(before, after);
  const eased = easeOut(progress);

  return (
    <div className={`ttm-card ttm-chain${progress >= 1 ? ' ttm-settled' : ''}`} ref={ref}>
      <Legend before="Без инструментов AID" after="С ними" />
      <div className="ttm-track">
        <span className="ttm-muted">Было</span>
        <ChainBar steps={stepsBefore} max={max} kind="before" progress={progress} />
        <span className="ttm-track-total">{formatNumber(before * eased, 1)} ч</span>
      </div>
      <div className="ttm-track">
        <span className="ttm-muted">Стало</span>
        <ChainBar steps={stepsAfter} max={max} kind="after" progress={progress} />
        <span className="ttm-track-total">{formatNumber(after * eased, 1)} ч</span>
      </div>
      <div className="ttm-steps">
        <div>
          <h3>Было</h3>
          <StepList steps={stepsBefore} />
        </div>
        <div>
          <h3>Стало</h3>
          <StepList steps={stepsAfter} />
        </div>
      </div>
    </div>
  );
}

function Legend({ before, after }: { before: string; after: string }) {
  return (
    <div className="ttm-legend">
      <span>
        <i className="ttm-before" aria-hidden="true" />
        {before}
      </span>
      <span>
        <i className="ttm-after" aria-hidden="true" />
        {after}
      </span>
    </div>
  );
}

function Owners({ data, levers }: { data: TtmData; levers: TtmLevers }) {
  const [ref, progress] = useReveal<HTMLDivElement>();
  const totals = calcTotals(data, levers);
  const maxOp = Math.max(1e-9, ...totals.rows.flatMap((row) => row.ops.map((op) => op.hoursBefore)));
  const eased = easeOut(progress);
  let barIndex = 0;
  const barCount = totals.rows.reduce((sum, row) => sum + row.ops.length, 0);

  return (
    <div className={`ttm-owners${progress >= 1 ? ' ttm-settled' : ''}`} ref={ref}>
      {data.owners.map((owner) => {
        const rows = totals.rows.filter((row) => row.tool.owner === owner.id);
        if (rows.length === 0) {
          return null;
        }
        const before = rows.reduce((sum, row) => sum + row.before, 0);
        const after = rows.reduce((sum, row) => sum + row.after, 0);
        return (
          <div className="ttm-owner" key={owner.id}>
            <div className="ttm-owner-head">
              <h3>{owner.name}</h3>
              <span className="ttm-owner-sum">
                {formatNumber(before)} → {formatNumber(after)} ч/мес · ×{formatNumber(ratio(before, after), 1)}
              </span>
            </div>
            {rows.map((row) => (
              <article className="ttm-card ttm-tool" key={row.tool.id}>
                <div className="ttm-tool-head">
                  <div>
                    <h3>
                      {row.tool.name}
                      <span className="ttm-tag">{row.tool.type}</span>
                      <span className="ttm-tag">{row.tool.status}</span>
                    </h3>
                    <p className="ttm-tool-job">{row.tool.job}</p>
                    <div className="ttm-tool-story">
                      <p>
                        <b style={{ ['--ttm-mark' as string]: 'var(--ttm-before)' }}>Было</b>
                        {row.tool.was}
                      </p>
                      <p>
                        <b style={{ ['--ttm-mark' as string]: 'var(--ttm-after)' }}>Стало</b>
                        {row.tool.now}
                      </p>
                    </div>
                  </div>
                  <div className="ttm-tool-factor">
                    <b>×{formatNumber(ratio(row.before, row.after) * eased, 1)}</b>
                    <span>−{formatNumber((row.before - row.after) * eased)} ч/мес</span>
                  </div>
                </div>
                <div className="ttm-ops">
                  {row.ops.map((op, index) => {
                    const t = staggered(progress, barIndex++, barCount);
                    return (
                      <div className="ttm-op" key={index}>
                        <div className="ttm-op-label">
                          {op.label}
                          <small>
                            {op.before} → {op.after} мин · {formatNumber(op.timesPerMonth)} раз {ROLE_LABEL[op.role]}
                          </small>
                        </div>
                        <div className="ttm-pair">
                          <div className="ttm-pair-row" title={`Вручную: ${formatNumber(op.hoursBefore, 1)} ч в месяц`}>
                            <div className="ttm-fill ttm-before" style={{ width: `${(op.hoursBefore / maxOp) * 100 * t}%` }} />
                            <span>{formatNumber(op.hoursBefore)} ч</span>
                          </div>
                          <div className="ttm-pair-row" title={`С инструментом: ${formatNumber(op.hoursAfter, 1)} ч в месяц`}>
                            <div className="ttm-fill ttm-after" style={{ width: `${(op.hoursAfter / maxOp) * 100 * t}%` }} />
                            <span>{formatNumber(op.hoursAfter)} ч</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function SummaryTable({ data, levers }: { data: TtmData; levers: TtmLevers }) {
  const totals = calcTotals(data, levers);
  const ownerName = new Map(data.owners.map((owner) => [owner.id, owner.name]));
  return (
    <div className="ds-token-table-wrap">
      <table className="ds-token-table ttm-table">
        <thead>
          <tr>
            <th>Инструмент</th>
            <th>Владелец</th>
            <th className="ttm-n">Было, ч/мес</th>
            <th className="ttm-n">Стало, ч/мес</th>
            <th className="ttm-n">Возвращено, ч</th>
            <th className="ttm-n">×</th>
          </tr>
        </thead>
        <tbody>
          {totals.rows.map((row) => (
            <tr key={row.tool.id}>
              <td>{row.tool.name}</td>
              <td>{ownerName.get(row.tool.owner) ?? row.tool.owner}</td>
              <td className="ttm-n">{formatNumber(row.before)}</td>
              <td className="ttm-n">{formatNumber(row.after)}</td>
              <td className="ttm-n">{formatNumber(row.before - row.after)}</td>
              <td className="ttm-n">{formatNumber(ratio(row.before, row.after), 1)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Итого</td>
            <td />
            <td className="ttm-n">{formatNumber(totals.before)}</td>
            <td className="ttm-n">{formatNumber(totals.after)}</td>
            <td className="ttm-n">{formatNumber(totals.saved)}</td>
            <td className="ttm-n">{formatNumber(totals.factor, 1)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function Facts({ data }: { data: TtmData }) {
  const [ref, progress] = useReveal<HTMLDivElement>();
  const count = data.facts.items.length;
  return (
    <div className="ttm-facts" ref={ref}>
      {data.facts.items.map((fact, index) => (
        <div className="ttm-fact" key={index}>
          <b>{countUpText(fact.value, staggered(progress, index, count))}</b>
          <span>{fact.label}</span>
        </div>
      ))}
    </div>
  );
}

function OperationsTable({ data }: { data: TtmData }) {
  return (
    <div className="ds-token-table-wrap">
      <table className="ds-token-table ttm-table">
        <thead>
          <tr>
            <th>Операция</th>
            <th>Кто</th>
            <th>Чьё время</th>
            <th className="ttm-n">Вручную, мин</th>
            <th className="ttm-n">С инструментом, мин</th>
            <th className="ttm-n">Раз в месяц</th>
          </tr>
        </thead>
        <tbody>
          {data.tools.flatMap((tool) =>
            tool.ops.map((op, index) => (
              <tr key={`${tool.id}-${index}`}>
                <td>
                  {tool.name}: {op.label}
                </td>
                <td>{ROLE_LABEL[op.role]}</td>
                <td>{splitText(op)}</td>
                <td className="ttm-n">{op.before}</td>
                <td className="ttm-n">{op.after}</td>
                <td className="ttm-n">{formatNumber(op.perMonth, op.perMonth % 1 ? 1 : 0)}</td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  );
}

function Section({ id, eyebrow, title, children }: { id: string; eyebrow?: string; title: string; children: ReactNode }) {
  return (
    <section className="ttm-section" aria-labelledby={id}>
      {eyebrow && <div className="ttm-eyebrow">{eyebrow}</div>}
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  );
}

function splitText(op: Parameters<typeof specialistSplit>[0]): string {
  const split = specialistSplit(op);
  const parts = SPECIALISTS.filter(({ id }) => split[id] > 0);
  return parts.length === 1 ? parts[0].label : parts.map(({ id, label }) => `${label.toLowerCase()} ${Math.round(split[id] * 100)} %`).join(', ');
}

interface OperationRef {
  key: string;
  label: string;
  op: TtmData['tools'][number]['ops'][number];
}

function operationRefs(data: TtmData): OperationRef[] {
  return data.tools.flatMap((tool) => tool.ops.map((op, index) => ({ key: `${tool.id}:${index}`, label: `${tool.name} — ${op.label}`, op })));
}

const CX = { width: 640, height: 300, left: 64, right: 16, top: 20, bottom: 44 };

function ComplexityChart({ data, complexity }: { data: TtmData; complexity: TtmComplexity }) {
  const [ref, progress] = useReveal<HTMLDivElement>();
  const refs = useMemo(() => operationRefs(data), [data]);
  const defaultKey = complexity.defaultOp ? `${complexity.defaultOp.tool}:${complexity.defaultOp.op}` : refs[0]?.key;
  const [selected, setSelected] = useState(() => (refs.some((item) => item.key === defaultKey) ? defaultKey : refs[0]?.key));
  const current = refs.find((item) => item.key === selected) ?? refs[0];
  if (!current) {
    return null;
  }
  const points = complexityPoints(current.op, complexity);
  const top = niceMax(Math.max(1, ...points.map((point) => point.beforeHigh)) * 1.08);
  const innerWidth = CX.width - CX.left - CX.right;
  const innerHeight = CX.height - CX.top - CX.bottom;
  const x = (index: number) => CX.left + innerWidth * (index / Math.max(1, points.length - 1));
  const y = (minutes: number) => CX.top + innerHeight * (1 - minutes / top);
  const line = (key: 'before' | 'after') => `M${points.map((point, index) => `${x(index)},${y(point[key])}`).join('L')}`;
  const band = (low: 'beforeLow' | 'afterLow', high: 'beforeHigh' | 'afterHigh') =>
    `M${points.map((point, index) => `${x(index)},${y(point[high])}`).join('L')}L${points
      .map((point, index) => [index, point] as const)
      .reverse()
      .map(([index, point]) => `${x(index)},${y(point[low])}`)
      .join('L')}Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((k) => top * k);
  const last = points[points.length - 1];
  const lastX = x(points.length - 1);
  const maxShare = Math.max(...complexity.tiers.map((tier) => tier.share));
  const drawing = progress > 0 ? ' ttm-cx-draw' : '';

  return (
    <div className="ttm-card ttm-cx" ref={ref}>
      <div className="ttm-cx-top">
        <label htmlFor="ttm-cx-op">Операция</label>
        <select id="ttm-cx-op" value={current.key} onChange={(event) => setSelected(event.target.value)}>
          {refs.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
        <span className="ttm-badge">{complexity.badge}</span>
      </div>
      <Legend before="Вручную" after="С инструментом" />
      <svg
        viewBox={`0 0 ${CX.width} ${CX.height}`}
        role="img"
        aria-label={`${current.label}: время по уровням сложности. ${points
          .map((point) => `${point.label} — вручную ${formatMinutes(point.before)}, с инструментом ${formatMinutes(point.after)}`)
          .join('; ')}`}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line className="ttm-cx-grid" x1={CX.left} x2={CX.width - CX.right} y1={y(tick)} y2={y(tick)} />
            <text x={CX.left - 8} y={y(tick) + 4} textAnchor="end">
              {formatMinutes(tick)}
            </text>
          </g>
        ))}
        <line className="ttm-cx-axis" x1={CX.left} x2={CX.width - CX.right} y1={y(0)} y2={y(0)} />
        {points.map((point, index) => (
          <text
            key={point.label}
            x={index === 0 ? CX.left : index === points.length - 1 ? CX.width - CX.right : x(index)}
            y={CX.height - 14}
            textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}
          >
            {point.label}
          </text>
        ))}
        <path className="ttm-cx-band-before" d={band('beforeLow', 'beforeHigh')} />
        <path className="ttm-cx-band-after" d={band('afterLow', 'afterHigh')} />
        {/* key — по операции: смена операции заново прорисовывает линии */}
        <path key={`b-${current.key}`} className={`ttm-cx-line ttm-cx-line-before${drawing}`} pathLength={1} d={line('before')} />
        <path key={`a-${current.key}`} className={`ttm-cx-line ttm-cx-line-after${drawing}`} pathLength={1} d={line('after')} />
        {points.map((point, index) => (
          <g key={point.label}>
            <circle className="ttm-cx-point ttm-cx-point-before" cx={x(index)} cy={y(point.before)} r={5}>
              <title>{`${point.label}: вручную ${formatMinutes(point.before)} (от ${formatMinutes(point.beforeLow)} до ${formatMinutes(point.beforeHigh)})`}</title>
            </circle>
            <circle className="ttm-cx-point ttm-cx-point-after" cx={x(index)} cy={y(point.after)} r={5}>
              <title>{`${point.label}: с инструментом ${formatMinutes(point.after)} (от ${formatMinutes(point.afterLow)} до ${formatMinutes(point.afterHigh)})`}</title>
            </circle>
          </g>
        ))}
        <text className="ttm-cx-value" x={lastX - 10} y={y(last.before) - 10} textAnchor="end">
          {formatMinutes(last.before)}
        </text>
        <text className="ttm-cx-value" x={lastX - 10} y={y(last.after) - 10} textAnchor="end">
          {formatMinutes(last.after)}
        </text>
      </svg>
      <div>
        <div className="ttm-eyebrow" style={{ marginBottom: 'var(--pf-spacing-8)' }}>
          Сколько задач какой сложности в месяц
        </div>
        <div className="ttm-mix">
          {complexity.tiers.map((tier) => (
            <div key={tier.label}>
              <i style={{ width: `${(tier.share / maxShare) * 100}%` }} aria-hidden="true" />
              <span>
                {tier.label} · {Math.round(tier.share * 100)} %
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductFilter({ data, value, onChange }: { data: TtmData; value: TtmLevers['product']; onChange: (next: TtmLevers['product']) => void }) {
  const options = [{ id: 'all', name: 'Все продукты' }, ...data.products];
  return (
    <div className="ttm-filter">
      <div className="ttm-segment ds-accent-segment" role="group" aria-label="Продукт">
        {options.map((option) => (
          <button key={option.id} type="button" aria-pressed={value === option.id} onClick={() => onChange(option.id)}>
            {option.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function PairBars({ before, after, max, t, beforeLabel, afterLabel, title }: { before: number; after: number; max: number; t: number; beforeLabel: string; afterLabel: string; title: string }) {
  return (
    <div className="ttm-pair" title={title}>
      <div className="ttm-pair-row ttm-wide">
        <div className="ttm-fill ttm-before" style={{ width: `${(before / max) * 100 * t}%` }} />
        <span>{beforeLabel}</span>
      </div>
      <div className="ttm-pair-row ttm-wide">
        <div className="ttm-fill ttm-after" style={{ width: `${(after / max) * 100 * t}%` }} />
        <span>{afterLabel}</span>
      </div>
    </div>
  );
}

function durationText(hours: number): string {
  const { value, unit } = formatDuration(hours);
  return `${value} ${unit}`;
}

function ProductsTtm({ data, levers }: { data: TtmData; levers: TtmLevers }) {
  const [ref, progress] = useReveal<HTMLDivElement>();
  const results = calcProducts(data, levers);
  const max = Math.max(1e-9, ...results.map((result) => result.ttmBefore));
  const eased = easeOut(progress);
  return (
    <div className={`ttm-card ttm-rows${progress >= 1 ? ' ttm-settled' : ''}`} ref={ref}>
      <Legend before="TTM без инструментов AID" after="С ними" />
      {results.map((result, index) => {
        const t = staggered(progress, index, results.length);
        return (
          <div className={`ttm-row${levers.product === result.product.id ? ' ttm-row-selected' : ''}`} key={result.product.id}>
            <div className="ttm-row-name">
              <b>{result.product.name}</b>
              <small>{formatNumber(result.product.screens)} экранов</small>
            </div>
            <PairBars
              before={result.ttmBefore}
              after={result.ttmAfter}
              max={max}
              t={t}
              beforeLabel={durationText(result.ttmBefore)}
              afterLabel={durationText(result.ttmAfter)}
              title={`${result.product.name}: изменение токена ${durationText(result.ttmBefore)} → ${durationText(result.ttmAfter)}`}
            />
            <div className="ttm-row-meta">
              <b>×{formatNumber(ratio(result.ttmBefore, result.ttmAfter) * eased, 1)}</b>
              <span>быстрее до кода</span>
              <span>−{formatNumber(result.totals.saved * eased)} ч/мес команды</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Specialists({ data, levers }: { data: TtmData; levers: TtmLevers }) {
  const [ref, progress] = useReveal<HTMLDivElement>();
  const totals = calcTotals(data, levers);
  const max = Math.max(1e-9, ...SPECIALISTS.map(({ id }) => totals.bySpecialist[id].before));
  const eased = easeOut(progress);
  return (
    <div className={`ttm-card ttm-rows${progress >= 1 ? ' ttm-settled' : ''}`} ref={ref}>
      <Legend before="Часов в месяц вручную" after="С инструментами" />
      {SPECIALISTS.map((specialist, index) => {
        const hours = totals.bySpecialist[specialist.id];
        const people = levers[specialist.lever];
        const saved = hours.before - hours.after;
        return (
          <div className="ttm-row" key={specialist.id}>
            <div className="ttm-row-name">
              <b>{specialist.label}</b>
              <small>{formatNumber(people)} чел.</small>
            </div>
            <PairBars
              before={hours.before}
              after={hours.after}
              max={max}
              t={staggered(progress, index, SPECIALISTS.length)}
              beforeLabel={`${formatNumber(hours.before)} ч`}
              afterLabel={`${formatNumber(hours.after)} ч`}
              title={`${specialist.label}: ${formatNumber(hours.before)} → ${formatNumber(hours.after)} ч в месяц`}
            />
            <div className="ttm-row-meta">
              <b>−{formatNumber(saved * eased)} ч</b>
              <span>в месяц</span>
              <span>≈ {formatNumber(people > 0 ? saved / people : 0, 1)} ч на человека</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Report({ data }: { data: TtmData }) {
  const [levers, setLevers] = useState<TtmLevers>(() => leversFromData(data));

  return (
    <>
      <header className="ttm-header">
        <div className="ttm-eyebrow">{data.eyebrow}</div>
        <h1>{data.title}</h1>
        <p className="ttm-muted">{data.intro}</p>
        <ProductFilter data={data} value={levers.product} onChange={(product) => setLevers({ ...levers, product })} />
        <Kpis data={data} levers={levers} />
      </header>

      <Section id="ttm-levers" title="Допущения">
        <Levers levers={levers} pilotsLabel={data.pilotsLabel} onChange={setLevers} />
      </Section>

      <Section id="ttm-products" eyebrow="Time to market" title="TTM по продуктам">
        <p className="ttm-muted">
          Сколько рабочего времени проходит от решения дизайнера до кода у разработчика при изменении токена в каждом
          продукте. Аудит макетов растёт с числом экранов, поэтому большие продукты выигрывают больше.
        </p>
        <ProductsTtm data={data} levers={levers} />
      </Section>

      {data.complexity && (
        <Section id="ttm-complexity" eyebrow="Сложность" title="Время от сложности задачи">
          <p className="ttm-muted">
            Вручную время растёт со сложностью: большой экран или правка сразу в нескольких местах занимает в разы дольше
            простой. С инструментом рутину делает машина, и время почти не зависит от сложности. Полоса вокруг линии —
            разброс: от быстрого случая до долгого.
          </p>
          <ComplexityChart data={data} complexity={data.complexity} />
        </Section>
      )}

      <Section id="ttm-chain" eyebrow="Time to market" title="Путь одного изменения токена">
        <p className="ttm-muted">{data.chain.intro}</p>
        <Chain data={data} filter={levers.product} />
      </Section>

      <Section id="ttm-specialists" eyebrow="По специалистам" title="Чьё время возвращается">
        <Specialists data={data} levers={levers} />
      </Section>

      <Section id="ttm-owners" eyebrow="По владельцам" title="Инструменты и операции">
        <Legend before="Часов в месяц вручную" after="С инструментом" />
        <Owners data={data} levers={levers} />
      </Section>

      <Section id="ttm-table" title="Таблица">
        <SummaryTable data={data} levers={levers} />
      </Section>

      <Section id="ttm-facts" eyebrow={data.facts.eyebrow} title="Опора для оценки">
        <Facts data={data} />
      </Section>

      <Section id="ttm-method" title="Как считали">
        <div className="ttm-method">
          {data.method.map((item) => (
            <div key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
        <details>
          <summary>Все допущения по операциям</summary>
          <OperationsTable data={data} />
        </details>
      </Section>
    </>
  );
}

function Status({ state }: { state: Exclude<LoadState, { kind: 'ready' }> }) {
  if (state.kind === 'loading') {
    return (
      <p className="ttm-status ttm-muted" role="status">
        Загружаем данные…
      </p>
    );
  }
  return (
    <div className="ttm-status" role="status">
      <h1>КПД команды AID</h1>
      {state.kind === 'preview' && (
        <p className="ttm-muted">На превью данные страницы не отдаются — они закрытые. Страница с данными открывается на основном сайте после входа.</p>
      )}
      {state.kind === 'unauthorized' && (
        <p className="ttm-muted">
          Сессия закончилась. <a href={withBase('/login')}>Войти снова</a>
        </p>
      )}
      {state.kind === 'unavailable' && <p className="ttm-muted">Данные страницы сейчас недоступны. Попробуйте обновить страницу позже.</p>}
    </div>
  );
}

export function TtmPage() {
  const state = useTtmData();
  const title = state.kind === 'ready' ? state.data.title : 'КПД команды AID';
  useEffect(() => {
    document.title = title;
  }, [title]);

  const content = useMemo(() => (state.kind === 'ready' ? <Report data={state.data} /> : <Status state={state} />), [state]);

  return (
    <div className="ttm">
      <style>{PAGE_STYLE}</style>
      <main className="ttm-shell">{content}</main>
    </div>
  );
}
