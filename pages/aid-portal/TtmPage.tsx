import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { isTtmData, type TtmChainStep, type TtmData } from './api/_lib/ttm';
import { apiUrl, withBase } from './base';
import { DS_PORTAL_LAYOUT_TOKENS, DS_TOKEN_TABLE_STYLE } from './dsChangelogTable';
import { ProductAccentScope } from './ProductAccentScope';
import { TTM_COLORS } from './ttmColors';
import { DEFAULT_PRODUCT_ID } from './productRegistry';
import {
  HOURS_PER_DAY,
  HOURS_PER_FTE,
  ROLE_LABEL,
  calcTotals,
  chainHours,
  formatNumber,
  formatStepHours,
  leversFromData,
  ratio,
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
.ttm, .ttm *, .ttm *::before, .ttm *::after { box-sizing: border-box; }
.ttm {
  --ttm-before: ${TTM_COLORS.before};
  --ttm-after: var(--ds-accent);
  font-family: ${T.fontFamily};
  color: ${T.textPrimary};
  background: ${T.surface};
  min-height: 100vh;
  padding: ${T.pagePaddingDesktop};
  font-size: 14px;
  line-height: 22px;
}
.ttm-shell { max-width: 1080px; margin: 0 auto; display: grid; gap: 56px; }
.ttm h1, .ttm h2, .ttm h3 { margin: 0; font-weight: 500; text-wrap: balance; }
.ttm h1 { font-size: 36px; line-height: 44px; }
.ttm h2 { font-size: 22px; line-height: 28px; }
.ttm h3 { font-size: 16px; line-height: 24px; }
.ttm p { margin: 0; max-width: 72ch; }
.ttm-eyebrow {
  font-size: 11px; line-height: 16px; font-weight: 500;
  letter-spacing: ${T.tableHeadLetterSpacing}; text-transform: uppercase;
  color: ${T.textSecondary};
}
.ttm-muted { color: ${T.textSecondary}; }
.ttm-num { font-variant-numeric: tabular-nums; }
.ttm-section { display: grid; gap: 16px; }
.ttm-header { display: grid; gap: 12px; }
.ttm-card {
  background: ${T.surface};
  border: 1px solid ${T.border};
  border-radius: ${T.tableWrapRadius};
  padding: 20px;
}
.ttm-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px; margin-top: 12px; }
.ttm-kpi { display: grid; gap: 6px; align-content: start; min-width: 0; }
.ttm-kpi-value { font-size: 36px; line-height: 44px; font-weight: 500; font-variant-numeric: tabular-nums; }
.ttm-kpi-value small { font-size: 15px; font-weight: 400; color: ${T.textSecondary}; margin-left: 4px; }
.ttm-kpi-note { font-size: 13px; line-height: 18px; color: ${T.textSecondary}; }
.ttm-kpi-lead { background: var(--ds-accent-bg); border-color: var(--ds-accent-bg); }
.ttm-kpi-lead .ttm-kpi-value { color: var(--ds-accent); }
.ttm-levers { display: grid; gap: 16px; }
.ttm-levers-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 16px 24px; }
.ttm-lever { display: grid; gap: 6px; min-width: 0; }
.ttm-lever label { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; color: ${T.textSecondary}; }
.ttm-lever output { color: ${T.textPrimary}; font-variant-numeric: tabular-nums; font-weight: 500; }
.ttm input[type='range'] { width: 100%; accent-color: var(--ds-accent); }
.ttm-check { display: flex; gap: 8px; align-items: center; font-size: 13px; color: ${T.textSecondary}; }
.ttm-check input { accent-color: var(--ds-accent); }
.ttm-legend { display: flex; flex-wrap: wrap; gap: 20px; font-size: 13px; color: ${T.textSecondary}; }
.ttm-legend i { display: inline-block; width: 12px; height: 12px; border-radius: 3px; margin-right: 6px; vertical-align: -1px; }
.ttm-before { background: var(--ttm-before); }
.ttm-after { background: var(--ttm-after); }
.ttm-chain { display: grid; gap: 20px; }
.ttm-track { display: grid; grid-template-columns: 72px minmax(0, 1fr) 80px; gap: 12px; align-items: center; }
.ttm-track-total { text-align: right; font-weight: 500; font-variant-numeric: tabular-nums; }
.ttm-bar { display: flex; gap: 2px; height: 28px; min-width: 0; }
.ttm-seg { height: 100%; border-radius: 2px; flex: 0 0 auto; }
.ttm-seg:first-child { border-radius: 4px 2px 2px 4px; }
.ttm-seg:last-child { border-radius: 2px 4px 4px 2px; }
.ttm-seg:focus-visible { outline: 2px solid ${T.textPrimary}; outline-offset: 2px; }
.ttm-seg-wait {
  background-image: repeating-linear-gradient(135deg, transparent 0 5px, color-mix(in srgb, ${T.surface} 45%, transparent) 5px 8px);
}
.ttm-steps { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.ttm-steps ol { margin: 8px 0 0; padding-left: 20px; display: grid; gap: 4px; }
.ttm-steps li span { margin-left: 6px; font-size: 12px; color: ${T.textSecondary}; font-variant-numeric: tabular-nums; }
.ttm-owners { display: grid; gap: 40px; }
.ttm-owner { display: grid; gap: 12px; }
.ttm-owner-head {
  display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 12px;
  padding-bottom: 8px; border-bottom: 1px solid ${T.border};
}
.ttm-owner-head h3 { font-size: 18px; line-height: 24px; }
.ttm-owner-sum { color: ${T.textSecondary}; font-variant-numeric: tabular-nums; }
.ttm-tool { display: grid; gap: 14px; }
.ttm-tool-head { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 12px; }
.ttm-tool-head > div:first-child { flex: 1 1 420px; min-width: 0; }
.ttm-tool-job { margin-top: 6px; }
.ttm-tool-story { display: grid; gap: 6px; margin-top: 10px; font-size: 13px; line-height: 20px; color: ${T.textSecondary}; }
.ttm-tool-story b { display: inline-flex; align-items: center; gap: 6px; margin-right: 6px; font-weight: 500; color: ${T.textPrimary}; }
.ttm-tool-story b::before { content: ''; width: 10px; height: 10px; border-radius: 3px; background: var(--ttm-mark); }
.ttm-tag {
  display: inline-block; margin-left: 8px; padding: 2px 6px; border-radius: 4px;
  background: ${T.surfaceMuted}; color: ${T.textSecondary};
  font-size: 11px; line-height: 16px; font-weight: 500; vertical-align: 2px;
}
.ttm-tool-factor { text-align: right; }
.ttm-tool-factor b { display: block; font-size: 22px; line-height: 28px; font-weight: 500; color: var(--ds-accent); font-variant-numeric: tabular-nums; }
.ttm-tool-factor span { font-size: 12px; color: ${T.textSecondary}; font-variant-numeric: tabular-nums; }
.ttm-ops { display: grid; gap: 12px; }
.ttm-op { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 2fr); gap: 6px 16px; align-items: center; }
.ttm-op-label small { display: block; font-size: 12px; line-height: 16px; color: ${T.textSecondary}; font-variant-numeric: tabular-nums; }
.ttm-pair { display: grid; gap: 4px; min-width: 0; }
.ttm-pair-row { display: grid; grid-template-columns: minmax(0, 1fr) 64px; gap: 8px; align-items: center; }
.ttm-fill { height: 10px; border-radius: 2px 4px 4px 2px; min-width: 2px; }
.ttm-pair-row span { font-size: 12px; color: ${T.textSecondary}; text-align: right; font-variant-numeric: tabular-nums; }
.ttm-settled .ttm-seg, .ttm-settled .ttm-fill { transition: width 0.25s ease-out; }
.ttm-table td.ttm-n, .ttm-table th.ttm-n { text-align: right; font-variant-numeric: tabular-nums; }
.ttm-table td, .ttm-table th { white-space: nowrap; }
.ttm-table tfoot td { font-weight: 500; border-top: 1px solid ${T.border}; padding: ${T.tableCellPadding}; }
.ttm-facts {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1px;
  background: ${T.border}; border: 1px solid ${T.border}; border-radius: ${T.tableWrapRadius}; overflow: hidden;
}
.ttm-fact { background: ${T.surface}; padding: 16px; display: grid; gap: 4px; align-content: start; }
.ttm-fact b { font-size: 22px; line-height: 28px; font-weight: 500; font-variant-numeric: tabular-nums; }
.ttm-fact span { font-size: 13px; line-height: 18px; color: ${T.textSecondary}; }
.ttm-method { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px 32px; }
.ttm-method p { margin-top: 6px; color: ${T.textSecondary}; }
.ttm details summary { cursor: pointer; color: var(--ds-accent); font-weight: 500; }
.ttm details[open] summary { margin-bottom: 12px; }
.ttm :focus-visible { outline: 2px solid var(--ds-accent); outline-offset: 2px; }
.ttm-status { max-width: 560px; margin: 80px auto; display: grid; gap: 12px; }
.ttm-status a { color: var(--ds-accent); }
@media (max-width: 768px) {
  .ttm { padding: ${T.pagePaddingMobile}; }
  .ttm h1 { font-size: 28px; line-height: 36px; }
  .ttm-op, .ttm-steps { grid-template-columns: 1fr; }
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
  const before = chainHours(data.chain.before);
  const after = chainHours(data.chain.after);
  const at = (index: number) => staggered(progress, index, 4);

  return (
    <div className="ttm-kpis" ref={ref}>
      <div className="ttm-card ttm-kpi ttm-kpi-lead">
        <span className="ttm-eyebrow">КПД команды</span>
        <span className="ttm-kpi-value">
          {formatNumber(totals.factor * at(0), 1)}
          <small>×</small>
        </span>
        <span className="ttm-kpi-note">во столько раз быстрее те же операции</span>
      </div>
      <div className="ttm-card ttm-kpi">
        <span className="ttm-eyebrow">Возвращено в месяц</span>
        <span className="ttm-kpi-value">
          {formatNumber(totals.saved * at(1))}
          <small>ч</small>
        </span>
        <span className="ttm-kpi-note">
          ≈ {formatNumber(totals.saved / HOURS_PER_FTE, 1)} ставки сотрудника · было {formatNumber(totals.before)} ч,
          стало {formatNumber(totals.after)} ч
        </span>
      </div>
      <div className="ttm-card ttm-kpi">
        <span className="ttm-eyebrow">TTM изменения токена</span>
        <span className="ttm-kpi-value">
          {formatNumber((before / HOURS_PER_DAY) * at(2), 1)}
          <small>дн →</small> {formatNumber(after * at(2), 1)}
          <small>ч</small>
        </span>
        <span className="ttm-kpi-note">от решения до кода у разработчика</span>
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
  key: Exclude<keyof TtmLevers, 'pilots' | 'load'> | 'loadPercent';
  label: string;
  min: number;
  max: number;
  step?: number;
}

const LEVERS: LeverSpec[] = [
  { key: 'designers', label: 'Дизайнеров', min: 1, max: 40 },
  { key: 'developers', label: 'Разработчиков', min: 1, max: 60 },
  { key: 'engineers', label: 'Инженеров AID', min: 1, max: 10 },
  { key: 'products', label: 'Продуктов', min: 1, max: 8 },
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

function Chain({ data }: { data: TtmData }) {
  const [ref, progress] = useReveal<HTMLDivElement>();
  const before = chainHours(data.chain.before);
  const after = chainHours(data.chain.after);
  const max = Math.max(before, after);
  const eased = easeOut(progress);

  return (
    <div className={`ttm-card ttm-chain${progress >= 1 ? ' ttm-settled' : ''}`} ref={ref}>
      <Legend before="Без инструментов AID" after="С ними" />
      <div className="ttm-track">
        <span className="ttm-muted">Было</span>
        <ChainBar steps={data.chain.before} max={max} kind="before" progress={progress} />
        <span className="ttm-track-total">{formatNumber(before * eased, 1)} ч</span>
      </div>
      <div className="ttm-track">
        <span className="ttm-muted">Стало</span>
        <ChainBar steps={data.chain.after} max={max} kind="after" progress={progress} />
        <span className="ttm-track-total">{formatNumber(after * eased, 1)} ч</span>
      </div>
      <div className="ttm-steps">
        <div>
          <h3>Было</h3>
          <StepList steps={data.chain.before} />
        </div>
        <div>
          <h3>Стало</h3>
          <StepList steps={data.chain.after} />
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

function Report({ data }: { data: TtmData }) {
  const [levers, setLevers] = useState<TtmLevers>(() => leversFromData(data));

  return (
    <>
      <header className="ttm-header">
        <div className="ttm-eyebrow">{data.eyebrow}</div>
        <h1>{data.title}</h1>
        <p className="ttm-muted">{data.intro}</p>
        <Kpis data={data} levers={levers} />
      </header>

      <Section id="ttm-levers" title="Допущения">
        <Levers levers={levers} pilotsLabel={data.pilotsLabel} onChange={setLevers} />
      </Section>

      <Section id="ttm-chain" eyebrow="Time to market" title="Путь одного изменения токена">
        <p className="ttm-muted">{data.chain.intro}</p>
        <Chain data={data} />
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
    <ProductAccentScope productId={DEFAULT_PRODUCT_ID}>
      <div className="ttm">
        <style>{PAGE_STYLE}</style>
        <main className="ttm-shell">{content}</main>
      </div>
    </ProductAccentScope>
  );
}
