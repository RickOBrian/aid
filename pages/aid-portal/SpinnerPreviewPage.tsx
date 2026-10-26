import { useEffect, useState, type CSSProperties } from 'react';
import {
  BUTTON_LOADING_VARIANTS,
  MAP_PIN_NO_TOKEN,
  SPINNER_DEFAULTS,
  riderColor,
  riderRadius,
  riderShadow,
  riderSpace,
  riderType,
  type RiderMode,
} from './spinnerPreviewData';

/**
 * Превью анимации Spinner Rider (AID-61) — `aidteam.pro/rider/preview/spinner`.
 * Страница для аудита: ссылок на неё в меню и на других страницах нет,
 * попасть можно только по прямой ссылке (решение sergej 2026-10-26).
 *
 * Два варианта анимации и бегунки длительности — дизайнер подбирает скорость
 * на аудите. Ниже — тот же спиннер внутри Button, Button Floating и Map Pin
 * в состоянии загрузки (компоненты на стадии аудита, только это состояние).
 * Хром — Persefona Kit (`--pf-*`), сцены — токены Rider из данных портала.
 */

type Variant = 1 | 2;

/** ic_loading (Rider Icons 709:13), viewBox 24. */
const IC_LOADING =
  'M12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 11.4477 3.55228 11 3 11C2.44772 11 2 11.4477 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C11.4477 2 11 2.44772 11 3C11 3.55228 11.4477 4 12 4Z';
/** ic_chevron_right (Rider Icons), viewBox 24. */
const IC_CHEVRON_RIGHT =
  'M16.3753 11.7192L12.3347 7.8623C11.8884 7.43627 11.8884 6.74555 12.3347 6.31952C12.781 5.89349 13.5047 5.89349 13.951 6.31952L18.7997 10.9479C19.246 11.3739 19.246 12.0646 18.7997 12.4906L13.951 17.119C13.5047 17.545 12.781 17.545 12.3347 17.119C11.8884 16.6929 11.8884 16.0022 12.3347 15.5762L16.3753 11.7192Z';
/** Map Pin · Pin bg (аудит Map Pin 733:5272), 44×62. */
const PIN_SHAPE =
  'M21.865 0H22.135C26.7401 0 30.6441 0.918974 33.8708 2.64461C37.0974 4.37025 39.6297 6.90256 41.3554 10.1292C43.081 13.3559 44 17.2599 44 21.865V22.135C44 26.7401 43.081 30.6441 41.3554 33.8708C39.6297 37.0974 37.0974 39.6297 33.8708 41.3554C33.1136 41.7603 32.3191 42.1209 31.4869 42.4355C26.1124 44.7029 23.4085 46.4475 23.375 49.4437L23.375 60.625C23.375 61.3844 22.7594 62 22 62C21.2406 62 20.625 61.3844 20.625 60.625L20.625 49.4437C20.625 46.5232 17.9756 44.756 12.7007 42.5055C11.8002 42.1746 10.9432 41.7907 10.1292 41.3554C6.90256 39.6297 4.37025 37.0974 2.64461 33.8708C0.994002 30.7844 0.0814356 26.4806 0.00520234 22.134L0 21.865C0 17.2599 0.918974 13.3559 2.64461 10.1292C4.37025 6.90256 6.90256 4.37025 10.1292 2.64461C13.3559 0.918974 17.2599 0 21.865 0Z';

const MODES: { mode: RiderMode; label: string }[] = [
  { mode: 'day', label: 'день' },
  { mode: 'night', label: 'ночь' },
];

function Spinner({ variant, size, color }: { variant: Variant; size: number; color: string }) {
  return (
    <svg className={`spx-spin spx-spin--v${variant}`} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ color }}>
      <g>
        {variant === 1 ? (
          <path d={IC_LOADING} fill="currentColor" />
        ) : (
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        )}
      </g>
    </svg>
  );
}

function Slider({
  id,
  label,
  value,
  min,
  max,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="spx-ctl">
      <label htmlFor={id} className="pf-body-s">
        {label}
      </label>
      <output htmlFor={id} className="pf-code-s">
        {value} мс
      </output>
      <input id={id} type="range" min={min} max={max} step={50} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function SizeStage({ variant, mode, label }: { variant: Variant; mode: RiderMode; label: string }) {
  return (
    <div className="spx-stage" style={{ background: riderColor('Background/Primary', mode) }}>
      {[96, 32, 24, 16].map((size) => (
        <Spinner key={size} variant={variant} size={size} color={riderColor('Icon/Primary', mode)} />
      ))}
      <span className="spx-stage-tag pf-label-xs-caps" style={{ color: riderColor('Text/Secondary', mode) }}>
        {label}
      </span>
    </div>
  );
}

function ButtonLoading({ item, variant, mode }: { item: (typeof BUTTON_LOADING_VARIANTS)[number]; variant: Variant; mode: RiderMode }) {
  const label = riderType('Subtitle 1');
  const style: CSSProperties = {
    background: riderColor(item.bg, mode),
    padding: `${riderSpace('space-6')} ${riderSpace('space-16')}`,
    borderRadius: riderRadius('radius-16'),
    minHeight: 56,
  };
  return (
    <div className="spx-button" style={style} role="img" aria-label={`Button ${item.label} · загрузка`}>
      {/* Подпись невидима и держит ширину — как в аудите (opacity 0). */}
      <span className="spx-button-label" style={{ font: label.font, letterSpacing: label.letterSpacing }}>
        Button
      </span>
      <span className="spx-center">
        <Spinner variant={variant} size={24} color={riderColor(item.spinner, mode)} />
      </span>
    </div>
  );
}

function ButtonFloatingLoading({ variant, mode }: { variant: Variant; mode: RiderMode }) {
  const label = riderType('Subtitle 2');
  const style: CSSProperties = {
    background: riderColor('Background/Primary', mode),
    padding: riderSpace('space-14'),
    gap: riderSpace('space-2'),
    borderRadius: riderRadius('radius-pill'),
    minWidth: riderSpace('space-52'),
    minHeight: riderSpace('space-52'),
    boxShadow: riderShadow('Small', mode),
  };
  return (
    <div className="spx-button spx-fab" style={style} role="img" aria-label="Button Floating · загрузка">
      <span className="spx-fab-hidden" style={{ width: 24, height: 24 }} />
      <span
        className="spx-fab-hidden"
        style={{ font: label.font, letterSpacing: label.letterSpacing, padding: `0 ${riderSpace('space-2')}` }}
      >
        Button
      </span>
      <span className="spx-center">
        <Spinner variant={variant} size={24} color={riderColor('Icon/Primary', mode)} />
      </span>
    </div>
  );
}

function MapPinLoading({ variant, mode }: { variant: Variant; mode: RiderMode }) {
  const title = riderType('Subtitle 2');
  const caption = riderType('Caption 1');
  return (
    <div className="spx-pin" role="img" aria-label="Map Pin · загрузка" style={{ gap: MAP_PIN_NO_TOKEN.bubbleToPinGap }}>
      <div
        className="spx-pin-bubble"
        style={{
          background: riderColor('Background/Primary', mode),
          padding: `${riderSpace('space-8')} ${riderSpace('space-8')} ${riderSpace('space-8')} ${riderSpace('space-16')}`,
          borderRadius: MAP_PIN_NO_TOKEN.bubbleRadius,
          boxShadow: riderShadow('Medium', mode),
        }}
      >
        <div className="spx-pin-text">
          <span style={{ font: title.font, letterSpacing: title.letterSpacing, color: riderColor('Text/Primary', mode) }}>
            ул. Юных Ленинцев 36, стр 2
          </span>
          <span style={{ font: caption.font, letterSpacing: caption.letterSpacing, color: riderColor('Text/Secondary', mode) }}>
            Подъезд 2
          </span>
        </div>
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <path d={IC_CHEVRON_RIGHT} fill={riderColor('Icon/Tertiary', mode)} />
        </svg>
      </div>
      <div className="spx-pin-body">
        <svg width="44" height="64" viewBox="0 0 44 64" aria-hidden="true">
          <path d={PIN_SHAPE} fill={riderColor('Background/Accent', mode)} />
        </svg>
        <span className="spx-pin-loader">
          <Spinner variant={variant} size={24} color={riderColor('Icon/Constant White', mode)} />
        </span>
      </div>
    </div>
  );
}

function ComponentScene({ mode, variant }: { mode: RiderMode; variant: Variant }) {
  const backdrop = riderColor('Background/Secondary', mode);
  return (
    <div className="spx-scene" style={{ background: riderColor('Background/Primary', mode) }}>
      <span className="spx-stage-tag pf-label-xs-caps" style={{ color: riderColor('Text/Secondary', mode) }}>
        {MODES.find((m) => m.mode === mode)?.label}
      </span>
      <div className="spx-scene-group">
        <p className="spx-scene-title pf-label-s" style={{ color: riderColor('Text/Secondary', mode) }}>
          Button
        </p>
        <div className="spx-row">
          {BUTTON_LOADING_VARIANTS.filter((b) => !b.overlay).map((item) => (
            <ButtonLoading key={item.id} item={item} variant={variant} mode={mode} />
          ))}
        </div>
        <div className="spx-row spx-backdrop" style={{ background: backdrop }}>
          {BUTTON_LOADING_VARIANTS.filter((b) => b.overlay).map((item) => (
            <ButtonLoading key={item.id} item={item} variant={variant} mode={mode} />
          ))}
        </div>
      </div>
      <div className="spx-scene-group">
        <p className="spx-scene-title pf-label-s" style={{ color: riderColor('Text/Secondary', mode) }}>
          Button Floating
        </p>
        <div className="spx-row spx-backdrop" style={{ background: backdrop }}>
          <ButtonFloatingLoading variant={variant} mode={mode} />
        </div>
      </div>
      <div className="spx-scene-group">
        <p className="spx-scene-title pf-label-s" style={{ color: riderColor('Text/Secondary', mode) }}>
          Map Pin
        </p>
        <div className="spx-row spx-backdrop spx-backdrop--map" style={{ background: backdrop }}>
          <MapPinLoading variant={variant} mode={mode} />
        </div>
      </div>
    </div>
  );
}

export function SpinnerPreviewPage() {
  const [v1Spin, setV1Spin] = useState<number>(SPINNER_DEFAULTS.v1Spin);
  const [v2Spin, setV2Spin] = useState<number>(SPINNER_DEFAULTS.v2Spin);
  const [v2Dash, setV2Dash] = useState<number>(SPINNER_DEFAULTS.v2Dash);
  const [inComponents, setInComponents] = useState<Variant>(1);

  useEffect(() => {
    document.title = 'Spinner · превью анимации';
  }, []);

  const durations = {
    '--spx-v1-spin': `${v1Spin}ms`,
    '--spx-v2-spin': `${v2Spin}ms`,
    '--spx-v2-dash': `${v2Dash}ms`,
  } as CSSProperties;

  return (
    <div className="spx-page" style={durations}>
      <style>{SPINNER_PREVIEW_STYLE}</style>
      <header className="spx-header">
        <p className="pf-label-xs-caps spx-muted">Rider · AID-61 · аудит</p>
        <h1 className="pf-heading-l spx-h1">Spinner · превью анимации</h1>
        <p className="pf-body-m spx-muted spx-lead">
          Два способа показать неопределённую загрузку. Бегунки меняют длительность сразу — и на образцах, и в компонентах
          ниже. Подберите скорость и запишите число в аудит.
        </p>
        <span className="pf-badge pf-badge--warning">Не опубликовано · только по прямой ссылке</span>
      </header>

      <section className="spx-grid" aria-label="Варианты анимации">
        <article className="spx-card">
          <h2 className="pf-heading-s spx-h2">Вариант 1 · равномерное вращение</h2>
          <p className="pf-body-s spx-muted">Иконка ic_loading из Rider Icons как есть. Один токен длительности.</p>
          {MODES.map(({ mode, label }) => (
            <SizeStage key={mode} variant={1} mode={mode} label={label} />
          ))}
          <div className="spx-controls">
            <Slider id="spx-v1-spin" label="Оборот · linear" value={v1Spin} min={300} max={3000} onChange={setV1Spin} />
            <button type="button" className="spx-reset pf-label-s" onClick={() => setV1Spin(SPINNER_DEFAULTS.v1Spin)}>
              Вернуть {SPINNER_DEFAULTS.v1Spin} мс
            </button>
          </div>
        </article>
        <article className="spx-card">
          <h2 className="pf-heading-s spx-h2">Вариант 2 · дуга растягивается и сжимается</h2>
          <p className="pf-body-s spx-muted">
            Своя дуга той же толщины вместо ic_loading. Вращение и длина дуги идут разными циклами, как у индикатора Material 3.
          </p>
          {MODES.map(({ mode, label }) => (
            <SizeStage key={mode} variant={2} mode={mode} label={label} />
          ))}
          <div className="spx-controls">
            <Slider id="spx-v2-spin" label="Вращение · linear" value={v2Spin} min={500} max={4000} onChange={setV2Spin} />
            <Slider id="spx-v2-dash" label="Цикл дуги · ease-in-out" value={v2Dash} min={500} max={4000} onChange={setV2Dash} />
            <button
              type="button"
              className="spx-reset pf-label-s"
              onClick={() => {
                setV2Spin(SPINNER_DEFAULTS.v2Spin);
                setV2Dash(SPINNER_DEFAULTS.v2Dash);
              }}
            >
              Вернуть {SPINNER_DEFAULTS.v2Spin} / {SPINNER_DEFAULTS.v2Dash} мс
            </button>
          </div>
        </article>
      </section>

      <section className="spx-card" aria-labelledby="spx-components-title">
        <div className="spx-section-head">
          <h2 id="spx-components-title" className="pf-heading-s spx-h2">
            В компонентах
          </h2>
          <fieldset className="spx-switch">
            <legend className="pf-label-s spx-muted">Анимация</legend>
            {([1, 2] as const).map((v) => (
              <label key={v} className={`spx-switch-option pf-label-s${inComponents === v ? ' is-active' : ''}`}>
                <input type="radio" name="spx-variant" value={v} checked={inComponents === v} onChange={() => setInComponents(v)} />
                Вариант {v}
              </label>
            ))}
          </fieldset>
        </div>
        <p className="pf-body-s spx-muted">
          Состояние загрузки из аудитов Rider Components: Button (`State=Loading · Spinner`), Button Floating
          (`State=Loading`), Map Pin (`type=eta, state=loading`). Подпись в кнопках скрыта и держит ширину. Серая подложка
          заменяет карту.
        </p>
        <div className="spx-scenes">
          {MODES.map(({ mode }) => (
            <ComponentScene key={mode} mode={mode} variant={inComponents} />
          ))}
        </div>
        <p className="pf-body-s spx-muted">
          У Map Pin радиус пузыря 18 и наложение −8 в аудите без токена — показаны как в Figma.
        </p>
      </section>

      <p className="pf-body-s spx-muted">
        Длительности — кандидаты, не утверждены. Вариант выбирает дизайнер на аудите, токены — после выбора.
      </p>
    </div>
  );
}

const SPINNER_PREVIEW_STYLE = `
.spx-page {
  min-height: 100vh;
  box-sizing: border-box;
  background: var(--pf-bg-surface-muted);
  color: var(--pf-text-primary);
  font-family: var(--pf-type-family-sans-1);
  padding: var(--pf-spacing-40) var(--pf-spacing-48) var(--pf-spacing-64);
  display: flex;
  flex-direction: column;
  gap: var(--pf-spacing-24);
  max-width: 1280px;
  margin: 0 auto;
}
@media (max-width: 767px) {
  .spx-page { padding: var(--pf-spacing-20) var(--pf-spacing-16) var(--pf-spacing-40); }
}
.spx-header { display: flex; flex-direction: column; align-items: flex-start; gap: var(--pf-spacing-8); }
.spx-h1, .spx-h2, .spx-header p { margin: 0; }
.spx-lead { max-width: 68ch; }
.spx-muted { color: var(--pf-text-secondary); margin: 0; }
.spx-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr)); gap: var(--pf-spacing-20); }
.spx-card {
  background: var(--pf-bg-surface-main);
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-l);
  padding: var(--pf-spacing-24);
  display: flex;
  flex-direction: column;
  gap: var(--pf-spacing-16);
  min-width: 0;
}
.spx-stage {
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-m);
  padding: var(--pf-spacing-24);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--pf-spacing-24);
}
.spx-stage-tag { margin-left: auto; }
.spx-controls { display: flex; flex-direction: column; gap: var(--pf-spacing-12); border-top: 1px solid var(--pf-line-default); padding-top: var(--pf-spacing-16); }
.spx-ctl { display: grid; grid-template-columns: 1fr auto; gap: var(--pf-spacing-4) var(--pf-spacing-12); align-items: center; }
.spx-ctl output { font-variant-numeric: tabular-nums; text-align: right; }
.spx-ctl input { grid-column: 1 / -1; width: 100%; accent-color: var(--pf-bg-accent-main); }
.spx-reset {
  align-self: flex-start;
  color: var(--pf-text-primary);
  background: var(--pf-bg-surface-main);
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-m);
  padding: var(--pf-spacing-6) var(--pf-spacing-12);
  cursor: pointer;
}
.spx-reset:hover { border-color: var(--pf-line-hover); }
.spx-reset:focus-visible, .spx-switch-option:focus-within { outline: 2px solid var(--pf-line-focus); outline-offset: 2px; }
.spx-section-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--pf-spacing-12); }
.spx-switch { display: inline-flex; align-items: center; gap: var(--pf-spacing-4); border: 0; margin: 0; padding: 0; }
.spx-switch legend { float: left; margin-right: var(--pf-spacing-8); padding: 0; }
.spx-switch-option {
  position: relative;
  padding: var(--pf-spacing-6) var(--pf-spacing-12);
  border-radius: var(--pf-radius-pill);
  border: 1px solid var(--pf-line-default);
  cursor: pointer;
  color: var(--pf-text-secondary);
}
.spx-switch-option.is-active { background: var(--pf-bg-accent-main); border-color: var(--pf-bg-accent-main); color: var(--pf-text-inverse); }
.spx-switch-option input { position: absolute; opacity: 0; inset: 0; margin: 0; cursor: pointer; }
.spx-scenes { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr)); gap: var(--pf-spacing-16); }
.spx-scene {
  position: relative;
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-m);
  padding: var(--pf-spacing-24);
  display: flex;
  flex-direction: column;
  gap: var(--pf-spacing-20);
  min-width: 0;
}
.spx-scene > .spx-stage-tag { position: absolute; top: var(--pf-spacing-16); right: var(--pf-spacing-16); }
.spx-scene-group { display: flex; flex-direction: column; gap: var(--pf-spacing-8); }
.spx-scene-title { margin: 0; }
.spx-row { display: flex; flex-wrap: wrap; align-items: center; gap: var(--pf-spacing-12); }
.spx-backdrop { border-radius: var(--pf-radius-m); padding: var(--pf-spacing-16); }
.spx-backdrop--map { justify-content: center; padding: var(--pf-spacing-24) var(--pf-spacing-16); }
.spx-button { position: relative; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; }
.spx-button-label, .spx-fab-hidden { opacity: 0; white-space: nowrap; }
.spx-center { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.spx-center svg { display: block; }
.spx-pin { display: inline-flex; flex-direction: column; align-items: center; max-width: 100%; }
.spx-pin-bubble { display: flex; align-items: center; width: 265px; max-width: 100%; box-sizing: border-box; position: relative; z-index: 1; }
.spx-pin-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  white-space: nowrap;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(to left, transparent 0, #000 24px);
  mask-image: linear-gradient(to left, transparent 0, #000 24px);
}
.spx-pin-body { position: relative; width: 44px; height: 64px; }
.spx-pin-body > svg { display: block; }
.spx-pin-loader { position: absolute; left: 10px; top: 10px; width: 24px; height: 24px; }
.spx-pin-loader svg { display: block; }
.spx-spin g { transform-origin: 12px 12px; }
.spx-spin--v1 g { animation: spx-rotate var(--spx-v1-spin, 1200ms) linear infinite; }
.spx-spin--v2 g { animation: spx-rotate var(--spx-v2-spin, 2000ms) linear infinite; }
.spx-spin--v2 circle { stroke-dasharray: 1 57; stroke-dashoffset: 0; animation: spx-dash var(--spx-v2-dash, 1500ms) ease-in-out infinite; }
@keyframes spx-rotate { to { transform: rotate(360deg); } }
@keyframes spx-dash {
  0% { stroke-dasharray: 1 57; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 42 57; stroke-dashoffset: -14; }
  100% { stroke-dasharray: 42 57; stroke-dashoffset: -55; }
}
`;
