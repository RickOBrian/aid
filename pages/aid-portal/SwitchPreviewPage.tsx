import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import {
  PORTAL_MISSING_COLORS,
  SPINNER_TIMING,
  SWITCH_KNOB_COLOR,
  SWITCH_KNOB_SHADOW,
  SWITCH_NO_TOKEN,
  SWITCH_SPINNER_COLOR,
  SWITCH_STATES,
  SWITCH_TOKENS,
  SWITCH_TRACK,
  riderColor,
  riderColorLabel,
  riderRadius,
  riderShadow,
  riderSpace,
  riderType,
  type RiderMode,
  type SwitchState,
} from './switchPreviewData';
import { DsPageHeader } from './DsPageHeader';
import { DS_PORTAL_LAYOUT_TOKENS, DS_TOKEN_TABLE_STYLE } from './dsChangelogTable';

const T = DS_PORTAL_LAYOUT_TOKENS;

/**
 * Превью Switch Rider (AID-94) — `aidteam.pro/rider/preview/switch`.
 * Страница для аудита: в меню её нет, ведёт кнопка «Превью анимации ↗» из
 * Figma (`persefona-figma-pages` §6.9). Хром — Persefona Kit (`--pf-*`),
 * сам Switch — токены Rider из данных портала.
 */

const MODES: { mode: RiderMode; label: string }[] = [
  { mode: 'day', label: 'день' },
  { mode: 'night', label: 'ночь' },
];

const STATE_LABEL: Record<SwitchState, string> = {
  default: 'Default',
  pressed: 'Pressed',
  disabled: 'Disabled',
  loading: 'Loading',
};

/** Состояния, которые выбираются в живом демо; Pressed — пока палец на дорожке. */
const LIVE_STATES: readonly SwitchState[] = ['default', 'disabled', 'loading'];

function switchVars(mode: RiderMode, state: SwitchState): CSSProperties {
  const track = SWITCH_TRACK[state];
  return {
    '--sw-off': riderColor(track.off, mode),
    '--sw-on': riderColor(track.on, mode),
    '--sw-off-pressed': riderColor(SWITCH_TRACK.pressed.off, mode),
    '--sw-on-pressed': riderColor(SWITCH_TRACK.pressed.on, mode),
    '--sw-knob': riderColor(SWITCH_KNOB_COLOR, mode),
    '--sw-knob-shadow': riderShadow(SWITCH_KNOB_SHADOW, mode),
    '--sw-spinner': riderColor(SWITCH_SPINNER_COLOR, mode),
    '--sw-near': riderSpace(SWITCH_TOKENS.paddingNear),
    '--sw-far': riderSpace(SWITCH_TOKENS.paddingFar),
    '--sw-radius': riderRadius(SWITCH_TOKENS.radius),
  } as CSSProperties;
}

function Spinner() {
  return (
    <svg className="swp-spin" width={SWITCH_NO_TOKEN.spinner} height={SWITCH_NO_TOKEN.spinner} viewBox="0 0 24 24" aria-hidden="true">
      <g>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function Knob({ state }: { state: SwitchState }) {
  return <span className="swp-knob">{state === 'loading' ? <Spinner /> : null}</span>;
}

/** Живой Switch: тап и Space переключают, Pressed — пока нажат. */
function LiveSwitch({
  mode,
  state,
  checked,
  onToggle,
  label,
}: {
  mode: RiderMode;
  state: SwitchState;
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  const inactive = state === 'disabled' || state === 'loading';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-busy={state === 'loading' || undefined}
      disabled={inactive}
      className="swp-switch swp-switch--live"
      data-state={state}
      style={switchVars(mode, state)}
      onClick={onToggle}
    >
      <Knob state={state} />
    </button>
  );
}

/** Статичный образец варианта набора (Checked × State). */
function SampleSwitch({ mode, state, checked }: { mode: RiderMode; state: SwitchState; checked: boolean }) {
  return (
    <span
      role="img"
      aria-label={`Checked=${checked ? 'True' : 'False'}, State=${STATE_LABEL[state]}`}
      className="swp-switch"
      data-state={state}
      data-checked={checked}
      style={switchVars(mode, state)}
    >
      <Knob state={state} />
    </span>
  );
}

function Stage({ mode, children, label }: { mode: RiderMode; children: ReactNode; label: string }) {
  return (
    <div className="swp-stage" style={{ background: riderColor('Background/Primary', mode) }}>
      {children}
      <span className="swp-stage-tag pf-label-xs-caps" style={{ color: riderColor('Text/Secondary', mode) }}>
        {label}
      </span>
    </div>
  );
}

function Note({ children }: { children: ReactNode }) {
  return <span className="pf-badge pf-badge--warning swp-note">{children}</span>;
}

export function SwitchPreviewPage() {
  const [checked, setChecked] = useState(false);
  const [liveState, setLiveState] = useState<SwitchState>('default');

  useEffect(() => {
    document.title = 'Switch · превью анимации';
  }, []);

  const rowText = riderType('Body 1');
  const timing = {
    '--sw-duration': `${SWITCH_NO_TOKEN.durationMs}ms`,
    '--sw-easing': SWITCH_NO_TOKEN.easing,
    '--sw-spin': `${SPINNER_TIMING.spinMs}ms`,
    '--sw-dash': `${SPINNER_TIMING.dashMs}ms`,
  } as CSSProperties;

  const colorRows: { role: string; token: string; note?: string }[] = [
    { role: 'Дорожка · On', token: SWITCH_TRACK.default.on },
    { role: 'Дорожка · Off', token: SWITCH_TRACK.default.off },
    { role: 'Дорожка · On · Pressed', token: SWITCH_TRACK.pressed.on },
    { role: 'Дорожка · Off · Pressed', token: SWITCH_TRACK.pressed.off, note: 'ждёт #577: слой 12 %, сейчас как Default' },
    { role: 'Дорожка · On · Disabled / Loading', token: SWITCH_TRACK.disabled.on },
    { role: 'Дорожка · Off · Disabled / Loading', token: SWITCH_TRACK.disabled.off },
    { role: 'Бегунок', token: SWITCH_KNOB_COLOR },
    { role: 'Spinner в бегунке (Tone Accent)', token: SWITCH_SPINNER_COLOR },
  ];

  return (
    <div className="swp-page" style={timing}>
      <style>{DS_TOKEN_TABLE_STYLE}</style>
      <style>{SWITCH_PREVIEW_STYLE}</style>
      <DsPageHeader title="Switch · превью анимации" backAriaLabel="Назад к Rider" showSearch={false} />
      <div className="swp-header">
        <p className="pf-label-xs-caps swp-muted">Rider · AID-94 · аудит</p>
        <p className="pf-body-m swp-muted swp-lead">
          Переключатель вкл/выкл на токенах Rider. Нажмите на дорожку или сфокусируйтесь клавишей Tab и нажмите Space —
          бегунок переедет, дорожка сменит цвет. Пока палец или клавиша нажаты — состояние Pressed.
        </p>
        <span className="pf-badge pf-badge--warning">Не опубликовано · только по прямой ссылке</span>
      </div>

      <section className="swp-card" aria-labelledby="swp-live-title">
        <div className="swp-section-head">
          <h2 id="swp-live-title" className="pf-heading-s swp-h2">
            Живой Switch
          </h2>
          <fieldset className="swp-seg">
            <legend className="pf-label-s swp-muted">State</legend>
            {LIVE_STATES.map((s) => (
              <label key={s} className={`swp-seg-option pf-label-s${liveState === s ? ' is-active' : ''}`}>
                <input type="radio" name="swp-state" value={s} checked={liveState === s} onChange={() => setLiveState(s)} />
                {STATE_LABEL[s]}
              </label>
            ))}
          </fieldset>
        </div>
        <div className="swp-grid">
          {MODES.map(({ mode, label }) => (
            <Stage key={mode} mode={mode} label={label}>
              <div className="swp-row">
                <span
                  className="swp-row-text"
                  style={{ font: rowText.font, letterSpacing: rowText.letterSpacing, color: riderColor('Text/Primary', mode) }}
                >
                  Заголовок настройки
                </span>
                <LiveSwitch
                  mode={mode}
                  state={liveState}
                  checked={checked}
                  onToggle={() => setChecked((v) => !v)}
                  label={`Заголовок настройки · ${label}`}
                />
              </div>
            </Stage>
          ))}
        </div>
        <p className="pf-body-s swp-muted">
          Checked: <b>{checked ? 'True' : 'False'}</b>. День и ночь переключаются вместе. Disabled и Loading — тап не
          работает, фокуса нет. Loading — дорожка как Disabled, в бегунке Spinner 24 (дуга, {SPINNER_TIMING.spinMs} /{' '}
          {SPINNER_TIMING.dashMs} мс, как в превью Spinner AID-61).
        </p>
        <p className="swp-notes">
          <Note>
            Пробел токена motion: переезд {SWITCH_NO_TOKEN.durationMs} мс {SWITCH_NO_TOKEN.easing} — временно, без токена
          </Note>
          <Note>Уменьшение движения в системе — без анимации переезда</Note>
        </p>
      </section>

      <section className="swp-card" aria-labelledby="swp-matrix-title">
        <h2 id="swp-matrix-title" className="pf-heading-s swp-h2">
          Все варианты · Checked × State
        </h2>
        <p className="pf-body-s swp-muted">Как набор <code className="pf-code-s">.Switch · audit</code> 2313:104 в Rider Components — 8 вариантов, образцы не нажимаются.</p>
        <div className="swp-grid">
          {MODES.map(({ mode, label }) => (
            <div key={mode} className="swp-matrix" style={{ background: riderColor('Background/Primary', mode) }}>
              <span className="swp-matrix-corner pf-label-xs-caps" style={{ color: riderColor('Text/Secondary', mode) }}>
                {label}
              </span>
              {SWITCH_STATES.map((s) => (
                <span key={s} className="pf-label-s swp-matrix-head" style={{ color: riderColor('Text/Secondary', mode) }}>
                  {STATE_LABEL[s]}
                </span>
              ))}
              {[false, true].map((c) => (
                <div key={String(c)} className="swp-matrix-row">
                  <span className="pf-label-s" style={{ color: riderColor('Text/Secondary', mode) }}>
                    {c ? 'On' : 'Off'}
                  </span>
                  {SWITCH_STATES.map((s) => (
                    <span key={s} className="swp-matrix-cell">
                      <SampleSwitch mode={mode} state={s} checked={c} />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="swp-card" aria-labelledby="swp-spec-title">
        <h2 id="swp-spec-title" className="pf-heading-s swp-h2">
          Размеры и токены
        </h2>
        <div className="ds-token-table-wrap">
          <table className="ds-token-table">
            <thead>
              <tr>
                <th>Что</th>
                <th>Токен</th>
                <th>Значение</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Дорожка</td>
                <td>
                  <Note>нет токена</Note>
                </td>
                <td>
                  {SWITCH_NO_TOKEN.width}×{SWITCH_NO_TOKEN.height}
                </td>
              </tr>
              <tr>
                <td>Бегунок</td>
                <td>
                  <Note>литерал (PD 25.11)</Note>
                </td>
                <td>
                  {SWITCH_NO_TOKEN.knob}×{SWITCH_NO_TOKEN.knob}
                </td>
              </tr>
              <tr>
                <td>Отступ у бегунка / с другой стороны</td>
                <td>
                  <code>{SWITCH_TOKENS.paddingNear}</code> / <code>{SWITCH_TOKENS.paddingFar}</code>
                </td>
                <td>
                  {riderSpace(SWITCH_TOKENS.paddingNear)} / {riderSpace(SWITCH_TOKENS.paddingFar)} — бегунок переезжает
                </td>
              </tr>
              <tr>
                <td>Скругление дорожки и бегунка</td>
                <td>
                  <code>{SWITCH_TOKENS.radius}</code>
                </td>
                <td>{riderRadius(SWITCH_TOKENS.radius)}</td>
              </tr>
              <tr>
                <td>Тень бегунка</td>
                <td>
                  <code>Shadows/{SWITCH_KNOB_SHADOW}</code> · Level 1 и 2
                </td>
                <td>
                  <code>{riderShadow(SWITCH_KNOB_SHADOW, 'day')}</code>
                </td>
              </tr>
              <tr>
                <td>Переезд бегунка и смена цвета</td>
                <td>
                  <Note>пробел токена motion</Note>
                </td>
                <td>
                  {SWITCH_NO_TOKEN.durationMs} мс {SWITCH_NO_TOKEN.easing}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="ds-token-table-wrap">
          <table className="ds-token-table">
            <thead>
              <tr>
                <th>Цвет</th>
                <th>Токен Rider color-sem</th>
                <th>День</th>
                <th>Ночь</th>
              </tr>
            </thead>
            <tbody>
              {colorRows.map((r) => (
                <tr key={r.role}>
                  <td>{r.role}</td>
                  <td>
                    <code>{r.token}</code>
                    {PORTAL_MISSING_COLORS[r.token] ? (
                      <>
                        {' '}
                        <Note>нет в данных портала · {PORTAL_MISSING_COLORS[r.token].source}</Note>
                      </>
                    ) : null}
                    {r.note ? (
                      <>
                        {' '}
                        <Note>{r.note}</Note>
                      </>
                    ) : null}
                  </td>
                  {MODES.map(({ mode }) => (
                    <td key={mode}>
                      <span className="swp-swatch" style={{ background: riderColor(r.token, mode) }} aria-hidden="true" />
                      <code>{riderColorLabel(r.token, mode)}</code>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="pf-body-s swp-muted">
          Доступность в демо: <code>role="switch"</code>, <code>aria-checked</code>, Space и Enter переключают, Loading —{' '}
          <code>aria-busy</code>. Контраст дорожки Off к фону ниже 3:1 — принят как у iOS (исключение через Standards).
        </p>
      </section>
    </div>
  );
}

const SWITCH_PREVIEW_STYLE = `
.swp-page {
  min-height: 100vh;
  box-sizing: border-box;
  background: ${T.surface};
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
  .swp-page { padding: var(--pf-spacing-20) var(--pf-spacing-16) var(--pf-spacing-40); }
}
.swp-header { display: flex; flex-direction: column; align-items: flex-start; gap: var(--pf-spacing-8); }
.swp-h2, .swp-header p { margin: 0; }
.swp-lead { max-width: 68ch; }
.swp-muted { color: var(--pf-text-secondary); margin: 0; }
.swp-card {
  background: ${T.surfaceMuted};
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-l);
  padding: var(--pf-spacing-24);
  display: flex;
  flex-direction: column;
  gap: var(--pf-spacing-16);
  min-width: 0;
}
.swp-section-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--pf-spacing-12); }
.swp-seg { display: inline-flex; align-items: center; flex-wrap: wrap; gap: var(--pf-spacing-4); border: 0; margin: 0; padding: 0; }
.swp-seg legend { float: left; margin-right: var(--pf-spacing-8); padding: 0; }
.swp-seg-option {
  position: relative;
  padding: var(--pf-spacing-6) var(--pf-spacing-12);
  border-radius: var(--pf-radius-pill);
  border: 1px solid var(--pf-line-default);
  cursor: pointer;
  color: var(--pf-text-secondary);
}
.swp-seg-option:hover { border-color: var(--pf-line-hover); }
.swp-seg-option.is-active { background: var(--pf-bg-accent-main); border-color: var(--pf-bg-accent-main); color: var(--pf-text-inverse); }
.swp-seg-option input { position: absolute; opacity: 0; inset: 0; margin: 0; cursor: pointer; }
.swp-seg-option:focus-within { outline: var(--pf-focus-ring); outline-offset: var(--pf-focus-offset); }
.swp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr)); gap: var(--pf-spacing-16); }
.swp-stage {
  position: relative;
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-m);
  padding: var(--pf-spacing-40) var(--pf-spacing-24) var(--pf-spacing-32);
  min-width: 0;
}
.swp-stage-tag { position: absolute; top: var(--pf-spacing-12); right: var(--pf-spacing-16); }
.swp-row { display: flex; align-items: center; justify-content: space-between; gap: var(--pf-spacing-16); max-width: 360px; margin: 0 auto; }
.swp-row-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.swp-notes { display: flex; flex-wrap: wrap; gap: var(--pf-spacing-8); margin: 0; }
.swp-note { white-space: normal; }

/* Switch: 50×32, padding space-2 у бегунка и space-20 с другой стороны, radius-pill. */
.swp-switch {
  all: unset;
  box-sizing: border-box;
  position: relative;
  flex: none;
  display: inline-flex;
  align-items: center;
  width: ${SWITCH_NO_TOKEN.width}px;
  height: ${SWITCH_NO_TOKEN.height}px;
  padding: var(--sw-near) var(--sw-far) var(--sw-near) var(--sw-near);
  border-radius: var(--sw-radius);
  background: var(--sw-off);
  transition: background-color var(--sw-duration, 100ms) var(--sw-easing, ease-out);
  -webkit-tap-highlight-color: transparent;
}
.swp-switch[aria-checked='true'], .swp-switch[data-checked='true'] { background: var(--sw-on); }
.swp-switch--live:not(:disabled) { cursor: pointer; }
.swp-switch--live:not(:disabled):active { background: var(--sw-off-pressed); }
.swp-switch--live[aria-checked='true']:not(:disabled):active { background: var(--sw-on-pressed); }
.swp-switch--live:focus-visible { outline: var(--pf-focus-ring); outline-offset: var(--pf-focus-offset); }
.swp-knob {
  box-sizing: border-box;
  width: ${SWITCH_NO_TOKEN.knob}px;
  height: ${SWITCH_NO_TOKEN.knob}px;
  border-radius: var(--sw-radius);
  background: var(--sw-knob);
  box-shadow: var(--sw-knob-shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sw-spinner);
  transform: translateX(0);
  transition: transform var(--sw-duration, 100ms) var(--sw-easing, ease-out);
}
/* Бегунок переезжает на разницу отступов: space-20 − space-2. */
.swp-switch[aria-checked='true'] .swp-knob, .swp-switch[data-checked='true'] .swp-knob {
  transform: translateX(calc(var(--sw-far) - var(--sw-near)));
}
@media (prefers-reduced-motion: reduce) {
  .swp-switch, .swp-knob { transition: none; }
}
.swp-spin { display: block; }
.swp-spin g { transform-origin: 12px 12px; animation: swp-rotate var(--sw-spin, 2000ms) linear infinite; }
.swp-spin circle { stroke-dasharray: 1 57; stroke-dashoffset: 0; animation: swp-dash var(--sw-dash, 1500ms) ease-in-out infinite; }
@keyframes swp-rotate { to { transform: rotate(360deg); } }
@keyframes swp-dash {
  0% { stroke-dasharray: 1 57; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 42 57; stroke-dashoffset: -14; }
  100% { stroke-dasharray: 42 57; stroke-dashoffset: -55; }
}

.swp-matrix {
  position: relative;
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-m);
  padding: var(--pf-spacing-20) var(--pf-spacing-16);
  display: grid;
  grid-template-columns: var(--pf-spacing-40) repeat(4, minmax(${SWITCH_NO_TOKEN.width}px, 1fr));
  overflow-x: auto;
  row-gap: var(--pf-spacing-16);
  column-gap: var(--pf-spacing-8);
  align-items: center;
  min-width: 0;
}
.swp-matrix-row { display: contents; }
.swp-matrix-head { text-align: center; }
.swp-matrix-cell { display: flex; justify-content: center; }
.ds-token-table code { font: var(--pf-font-code-s); }
.swp-swatch {
  display: inline-block;
  width: var(--pf-spacing-16);
  height: var(--pf-spacing-16);
  margin-right: var(--pf-spacing-6);
  border-radius: var(--pf-radius-s);
  border: 1px solid var(--pf-line-default);
  vertical-align: -2px;
}
`;
