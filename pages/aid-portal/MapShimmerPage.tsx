import { useEffect, useMemo, useRef, useState } from 'react';
import { DsPageHeader } from './DsPageHeader';
import { DS_PORTAL_LAYOUT_TOKENS } from './dsChangelogTable';
import { HUB_ROUTES } from './hubData';
import {
  HEX_RE,
  MAP_THEMES,
  SCREEN,
  SHIMMER_KNOBS,
  cloneDefaults,
  parseStoredState,
  rgba,
  shimmerBackground,
  shimmerExport,
  speedPtPerSec,
  type MapTheme,
  type ShimmerSettings,
  type ShimmerState,
} from './mapShimmerModel';
import mapDay from './assets/map-shimmer/rider-map-day.jpg';
import mapNight from './assets/map-shimmer/rider-map-night.jpg';

const T = DS_PORTAL_LAYOUT_TOKENS;
const STORAGE_KEY = 'aid-map-shimmer-v1';
const MAP_IMAGES: Record<MapTheme, string> = { day: mapDay, night: mapNight };
const THEME_TITLE: Record<MapTheme, string> = { day: 'Светлая тема', night: 'Тёмная тема' };

/**
 * Настройщик блика карты Rider в состоянии Loading (presentbook-8, AID-86).
 * Хром страницы — Persefona Kit (`--pf-*`). Цвета полосы и приглушения — то,
 * что подбирает дизайнер, поэтому это значения ползунков, а не токены.
 */
const PAGE_STYLE = `
.dsms, .dsms *, .dsms *::before, .dsms *::after { box-sizing: border-box; }
.dsms {
  font-family: ${T.fontFamily};
  color: ${T.textPrimary};
  background: ${T.surface};
  min-height: 100vh;
  padding: ${T.pagePaddingDesktop};
}
.dsms-shell { max-width: 1180px; margin: 0 auto; display: grid; gap: var(--pf-spacing-24); }
.dsms-shell > .ds-page-header { margin-bottom: 0; }
.dsms-intro { margin: 0; font: var(--pf-font-body-m); color: ${T.textSecondary}; max-width: 70ch; }
.dsms-toolbar { display: flex; flex-wrap: wrap; gap: var(--pf-spacing-8); align-items: center; }
.dsms-btn {
  margin: 0;
  padding: var(--pf-spacing-6) var(--pf-spacing-12);
  border: 1px solid ${T.border};
  border-radius: var(--pf-radius-s);
  background: ${T.surface};
  color: ${T.textPrimary};
  font: var(--pf-font-label-s);
  cursor: pointer;
}
.dsms-btn:hover { border-color: ${T.borderHover}; }
.dsms-btn:focus-visible, .dsms input:focus-visible { outline: var(--pf-focus-ring); outline-offset: var(--pf-focus-offset); }
.dsms-btn--primary { background: var(--pf-bg-accent-main); border-color: var(--pf-bg-accent-main); color: var(--pf-text-inverse); }
.dsms-note { margin: 0; font: var(--pf-font-body-s); color: ${T.textSecondary}; }
.dsms-benches { display: grid; grid-template-columns: repeat(auto-fit, minmax(330px, 1fr)); gap: var(--pf-spacing-20); }
.dsms-bench {
  border: 1px solid ${T.border};
  border-radius: var(--pf-radius-l);
  padding: var(--pf-spacing-16);
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--pf-spacing-16);
  align-items: start;
}
.dsms-bench h2 {
  grid-column: 1 / -1;
  margin: 0;
  font: var(--pf-font-heading-s);
  display: flex;
  justify-content: space-between;
  gap: var(--pf-spacing-8);
  flex-wrap: wrap;
}
.dsms-bench h2 span { font: var(--pf-font-code-s); color: ${T.textSecondary}; }
.dsms-phone-box {
  width: 234px;
  max-width: 100%;
  border-radius: var(--pf-radius-xl);
  overflow: hidden;
  position: relative;
  justify-self: center;
  border: 1px solid ${T.border};
}
.dsms-phone { width: ${SCREEN.width}px; height: ${SCREEN.height}px; position: absolute; left: 0; top: 0; transform-origin: 0 0; overflow: hidden; }
.dsms-phone img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; max-width: none; }
.dsms-dim { position: absolute; inset: 0; }
.dsms-sh { position: absolute; }
.dsms-knobs { display: grid; gap: var(--pf-spacing-12); min-width: 0; }
.dsms-knob { display: grid; gap: var(--pf-spacing-4); }
.dsms-knob label, .dsms-knob .dsms-knob-title {
  display: flex; justify-content: space-between; gap: var(--pf-spacing-8);
  font: var(--pf-font-body-s); color: ${T.textSecondary};
}
.dsms-knob output { font: var(--pf-font-code-s); color: ${T.textPrimary}; font-variant-numeric: tabular-nums; }
.dsms-knob input[type=range] { width: 100%; accent-color: var(--pf-bg-accent-main); }
.dsms-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--pf-spacing-10); align-items: center; }
.dsms-color { display: flex; align-items: center; gap: var(--pf-spacing-8); }
.dsms-color input[type=color] {
  width: 36px; height: 28px; padding: 0;
  border: 1px solid ${T.border}; border-radius: var(--pf-radius-s); background: none;
}
.dsms-color input[type=text] {
  width: 84px; padding: var(--pf-spacing-4) var(--pf-spacing-6);
  border: 1px solid ${T.border}; border-radius: var(--pf-radius-s);
  background: ${T.surfaceMuted}; color: ${T.textPrimary}; font: var(--pf-font-code-s);
}
.dsms-sep { border-top: 1px solid ${T.border}; margin: var(--pf-spacing-2) 0; }
.dsms-values { border: 1px solid ${T.border}; border-radius: var(--pf-radius-l); padding: var(--pf-spacing-16); display: grid; gap: var(--pf-spacing-10); }
.dsms-values h2 { margin: 0; font: var(--pf-font-heading-s); }
.dsms-values pre {
  margin: 0; overflow-x: auto; padding: var(--pf-spacing-12);
  font: var(--pf-font-code-s); background: ${T.surfaceMuted};
  border: 1px solid ${T.border}; border-radius: var(--pf-radius-m);
}
@media (max-width: 767px) {
  .dsms { padding: ${T.pagePaddingMobile}; }
  .dsms-bench { grid-template-columns: minmax(0, 1fr); }
}
`;

function loadState(): ShimmerState {
  try {
    return parseStoredState(window.localStorage.getItem(STORAGE_KEY)) ?? cloneDefaults();
  } catch {
    return cloneDefaults();
  }
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

interface BenchProps {
  theme: MapTheme;
  settings: ShimmerSettings;
  loadingOn: boolean;
  onChange: (patch: Partial<ShimmerSettings>) => void;
  shimmerRef: (el: HTMLDivElement | null) => void;
}

function ColorKnob({ id, label, hex, alpha, onHex, onAlpha }: {
  id: string; label: string; hex: string; alpha: number;
  onHex: (hex: string) => void; onAlpha: (alpha: number) => void;
}) {
  const [draft, setDraft] = useState(hex);
  useEffect(() => setDraft(hex), [hex]);
  return (
    <div className="dsms-knob" role="group" aria-labelledby={`${id}-title`}>
      <span className="dsms-knob-title" id={`${id}-title`}>
        {label}
        <output>{`${hex} · ${alpha}%`}</output>
      </span>
      <div className="dsms-row2">
        <div className="dsms-color">
          <input type="color" aria-label={`${label}, цвет`} value={hex.toLowerCase()} onChange={(e) => onHex(e.target.value.toUpperCase())} />
          <input
            type="text"
            aria-label={`${label}, хекс`}
            maxLength={7}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => (HEX_RE.test(draft) ? onHex(draft.toUpperCase()) : setDraft(hex))}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          />
        </div>
        <input type="range" min={0} max={100} step={1} aria-label={`${label}, непрозрачность`} value={alpha} onChange={(e) => onAlpha(Number(e.target.value))} />
      </div>
    </div>
  );
}

function Bench({ theme, settings: s, loadingOn, onChange, shimmerRef }: BenchProps) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0.6);
  const bg = shimmerBackground(s);
  const diag = Math.ceil(Math.hypot(SCREEN.width, SCREEN.height)) * 2;

  useEffect(() => {
    const box = boxRef.current;
    if (!box || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => setScale(box.clientWidth / SCREEN.width));
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="dsms-bench" aria-labelledby={`dsms-${theme}-title`}>
      <h2 id={`dsms-${theme}-title`}>
        {THEME_TITLE[theme]}
        <span>{`период ${Math.round(bg.period)} pt · ${speedPtPerSec(s)} pt/с`}</span>
      </h2>
      <div className="dsms-phone-box" ref={boxRef} style={{ height: SCREEN.height * scale }}>
        <div className="dsms-phone" style={{ transform: `scale(${scale})` }}>
          <img alt={`Карта Rider ${theme === 'day' ? 'днём' : 'ночью'}`} src={MAP_IMAGES[theme]} />
          <div className="dsms-dim" hidden={!loadingOn} style={{ background: rgba(s.dim, s.dimAlpha) }} />
          <div
            className="dsms-sh"
            ref={shimmerRef}
            hidden={!loadingOn}
            data-period={bg.period}
            style={{
              width: diag,
              height: diag,
              left: (SCREEN.width - diag) / 2,
              top: (SCREEN.height - diag) / 2,
              transform: `rotate(${s.angle}deg)`,
              backgroundSize: bg.size,
              backgroundImage: bg.image,
            }}
          />
        </div>
      </div>
      <div className="dsms-knobs">
        {SHIMMER_KNOBS.map((knob) => (
          <div className="dsms-knob" key={knob.key}>
            <label htmlFor={`dsms-${theme}-${knob.key}`}>
              {knob.label}
              <output>{`${s[knob.key]}${knob.unit}`}</output>
            </label>
            <input
              type="range"
              id={`dsms-${theme}-${knob.key}`}
              min={knob.min}
              max={knob.max}
              step={knob.step}
              value={s[knob.key]}
              onChange={(e) => onChange({ [knob.key]: Number(e.target.value) })}
            />
          </div>
        ))}
        <div className="dsms-sep" />
        <ColorKnob id={`dsms-${theme}-band`} label="Цвет полосы" hex={s.band} alpha={s.bandAlpha}
          onHex={(band) => onChange({ band })} onAlpha={(bandAlpha) => onChange({ bandAlpha })} />
        <ColorKnob id={`dsms-${theme}-dim`} label="Приглушение" hex={s.dim} alpha={s.dimAlpha}
          onHex={(dim) => onChange({ dim })} onAlpha={(dimAlpha) => onChange({ dimAlpha })} />
      </div>
    </section>
  );
}

export function MapShimmerPage() {
  const [state, setState] = useState<ShimmerState>(loadState);
  const reducedMotion = useMemo(prefersReducedMotion, []);
  const [playing, setPlaying] = useState(!reducedMotion);
  const [loadingOn, setLoadingOn] = useState(true);
  const [copied, setCopied] = useState('');
  const shimmerEls = useRef<Partial<Record<MapTheme, HTMLDivElement | null>>>({});
  const stateRef = useRef(state);
  stateRef.current = state;

  const json = useMemo(() => JSON.stringify(shimmerExport(state), null, 2), [state]);

  useEffect(() => {
    document.title = 'Map Loading Shimmer';
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* хранилище недоступно — настройки живут до перезагрузки */
    }
  }, [state]);

  useEffect(() => {
    if (!playing) return undefined;
    let frame = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      for (const theme of MAP_THEMES) {
        const el = shimmerEls.current[theme];
        if (!el) continue;
        const { cycle } = stateRef.current[theme];
        const period = Number(el.dataset.period) || 0;
        el.style.backgroundPosition = `${(((now - t0) % cycle) / cycle) * period}px 0`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  const patch = (theme: MapTheme) => (p: Partial<ShimmerSettings>) =>
    setState((prev) => ({ ...prev, [theme]: { ...prev[theme], ...p } }));

  const copy = () => {
    const failed = () => setCopied('Не скопировалось — выделите текст и нажмите ⌘C');
    try {
      void navigator.clipboard.writeText(json).then(() => setCopied('Скопировано'), failed);
    } catch {
      failed();
    }
  };

  return (
    <div className="dsms">
      <style>{PAGE_STYLE}</style>
      <main className="dsms-shell">
        <DsPageHeader title="Map Loading Shimmer" backHref={HUB_ROUTES.tools} backAriaLabel="Назад к Tools" showSearch={false} />
        <p className="dsms-intro">
          Блик и приглушение карты Rider в состоянии Loading. Ползунки меняют анимацию вживую; значения внизу копируются
          одной кнопкой и уходят в чат Map.
        </p>
        <div className="dsms-toolbar">
          <button type="button" className="dsms-btn dsms-btn--primary" onClick={() => setPlaying((v) => !v)}>
            {playing ? 'Пауза' : 'Запустить'}
          </button>
          <button type="button" className="dsms-btn" onClick={() => setLoadingOn((v) => !v)}>
            {loadingOn ? 'Выключить Loading' : 'Включить Loading'}
          </button>
          <button type="button" className="dsms-btn" onClick={() => setState(cloneDefaults())}>
            Сбросить к исходным
          </button>
          {reducedMotion && (
            <p className="dsms-note">Включено «уменьшение движения» — анимация на паузе, запустите кнопкой.</p>
          )}
        </div>
        <div className="dsms-benches">
          {MAP_THEMES.map((theme) => (
            <Bench
              key={theme}
              theme={theme}
              settings={state[theme]}
              loadingOn={loadingOn}
              onChange={patch(theme)}
              shimmerRef={(el) => { shimmerEls.current[theme] = el; }}
            />
          ))}
        </div>
        <section className="dsms-values" aria-labelledby="dsms-values-title">
          <h2 id="dsms-values-title">Значения для передачи</h2>
          <pre>{json}</pre>
          <div className="dsms-toolbar">
            <button type="button" className="dsms-btn" onClick={copy}>Скопировать</button>
            <span className="dsms-note" role="status">{copied}</span>
          </div>
          <p className="dsms-note">
            Угол — наклон полосы от вертикали, градусы (+ — верх вправо). Ширина — поперёк полосы, pt экрана
            {` ${SCREEN.width} × ${SCREEN.height}`}. Цикл — время, за которое узор сдвигается на один период; скорость — тот же
            сдвиг в pt/с. При одной полосе период = путь через весь экран.
          </p>
        </section>
      </main>
    </div>
  );
}
