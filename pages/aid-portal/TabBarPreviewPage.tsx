import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { withBase } from './base';
import mapDay from './assets/map-shimmer/rider-map-day.jpg';
import mapNight from './assets/map-shimmer/rider-map-night.jpg';
import {
  CAPSULE,
  DEFAULT_MOTION,
  DEMO_TABS,
  GLASS_BLUR_PX,
  GUIDE_MOTION,
  MOTION_KNOBS,
  NO_TOKEN,
  STRETCH_EASINGS,
  TAB,
  TAB_BAR_THEMES,
  TAB_SELECTED,
  caption2,
  capsuleInset,
  motionExport,
  cssBlend,
  navbarGlassLayers,
  parseStoredMotion,
  pillFrame,
  restRect,
  riderColor,
  riderRadius,
  springSettleMs,
  totalMs,
  type Phase,
  type Rect,
  type TabBarMotion,
  type TabBarTheme,
} from './tabBarPreviewModel';

/**
 * Превью TabBar Rider (presentbook-10, AID-89) — `aidteam.pro/rider/preview/tab-bar`.
 * Только по прямой ссылке, без ссылок из меню (как превью Spinner и BottomSheet).
 *
 * Решение PD 24.11: «Тогда собери превью-страницей в презентбуке по всем
 * пожеланиям дизайнера и текущему гайду». TabBar день и ночь рядом,
 * перетекание подложки в две фазы, бегунки подбора. Хром — Persefona Kit
 * (`--pf-*`), TabBar — токены Rider из данных портала; чего в данных нет —
 * подписано на странице.
 */

const STORAGE_KEY = 'aid-tab-bar-preview-v1';
const MAP_IMAGES: Record<TabBarTheme, string> = { day: mapDay, night: mapNight };
const THEME_TITLE: Record<TabBarTheme, string> = { day: 'День', night: 'Ночь' };
const PHASE_LABEL: Record<Phase, string> = { stretch: 'фаза 1 · растяжение', spring: 'фаза 2 · пружина', rest: 'покой' };
const EASING_LABEL: Record<TabBarMotion['stretchEasing'], string> = {
  'ease-in-out': 'ease-in-out',
  'ease-out': 'ease-out',
  linear: 'linear',
};
const SLOW_FACTOR = 5;

function loadMotion(): TabBarMotion {
  try {
    return parseStoredMotion(window.localStorage.getItem(STORAGE_KEY)) ?? { ...DEFAULT_MOTION };
  } catch {
    return { ...DEFAULT_MOTION };
  }
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

function supportsBlend(mode: string): boolean {
  try {
    return typeof CSS !== 'undefined' && CSS.supports('mix-blend-mode', mode);
  } catch {
    return false;
  }
}

function supportsPlusDarker(): boolean {
  return supportsBlend('plus-darker');
}

function rectStyle(r: Rect): CSSProperties {
  return { transform: `translate(${r.x}px, ${r.y}px)`, width: r.w, height: r.h };
}

function applyRect(el: HTMLElement | null, r: Rect) {
  if (!el) return;
  el.style.transform = `translate(${r.x}px, ${r.y}px)`;
  el.style.width = `${r.w}px`;
  el.style.height = `${r.h}px`;
}

interface TabBarProps {
  theme: TabBarTheme;
  tabs: number;
  selected: number;
  pillRect: Rect;
  plusDarker: boolean;
  pillRef?: (el: HTMLDivElement | null) => void;
  onSelect?: (index: number) => void;
  label: string;
}

function TabBar({ theme, tabs, selected, pillRect, plusDarker, pillRef, onSelect, label }: TabBarProps) {
  const type = caption2();
  const inset = capsuleInset();
  const color = riderColor('Text/Primary', theme);
  const iconColor = riderColor('Icon/Primary', theme);
  const sel = TAB_SELECTED[theme];
  const blend = sel.blend === 'plus-darker' ? (plusDarker ? 'plus-darker' : 'multiply') : 'normal';
  const radius = riderRadius('radius-pill');
  const capsuleStyle: CSSProperties = {
    width: CAPSULE.width,
    height: CAPSULE.height,
    padding: inset,
    gap: inset,
    borderRadius: radius,
  };
  const support = { plusDarker, plusLighter: supportsBlend('plus-lighter') };
  const layers = navbarGlassLayers(theme);
  // Каждый эффект — свой слой с наложением; капсула не создаёт контекст наложения,
  // поэтому слои смешиваются с картой под TabBar, а не с белым.
  const layer = (l: (typeof layers)[number]) => (
    <span
      key={l.id}
      className="tbx-glass-fx"
      data-effect={l.id}
      aria-hidden="true"
      style={{ borderRadius: radius, boxShadow: l.shadow, mixBlendMode: cssBlend(l.blend, support) as CSSProperties['mixBlendMode'] }}
    />
  );
  return (
    <div className="tbx-capsule" style={capsuleStyle} role="group" aria-label={label}>
      {layers.filter((l) => !l.inner).map(layer)}
      <span
        className="tbx-glass"
        aria-hidden="true"
        style={{
          borderRadius: radius,
          background: riderColor('Background/Navbar', theme),
          backdropFilter: `blur(${GLASS_BLUR_PX}px)`,
          WebkitBackdropFilter: `blur(${GLASS_BLUR_PX}px)`,
        }}
      />
      {layers.filter((l) => l.inner).map(layer)}
      <div
        className="tbx-pill"
        ref={pillRef}
        aria-hidden="true"
        style={{
          ...rectStyle(pillRect),
          background: sel.color,
          mixBlendMode: blend as CSSProperties['mixBlendMode'],
          borderRadius: riderRadius('radius-pill'),
        }}
      />
      {DEMO_TABS.slice(0, tabs).map((tab, index) => {
        const content = (
          <>
            <span
              className="tbx-icon"
              aria-hidden="true"
              style={{
                width: TAB.iconSize,
                height: TAB.iconSize,
                background: iconColor,
                WebkitMaskImage: `url(${withBase(tab.file)})`,
                maskImage: `url(${withBase(tab.file)})`,
              }}
            />
            <span className="tbx-tab-label" style={{ font: type.font, letterSpacing: type.letterSpacing, color }}>
              {tab.label}
            </span>
          </>
        );
        const style: CSSProperties = { padding: `${TAB.padY}px ${TAB.padX}px`, gap: TAB.gap };
        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={index === selected}
            className="tbx-tab"
            style={style}
            // Нажатие сразу переносит выделение (гайд, блок 5); клавиатура — через click.
            onPointerDown={(e) => {
              if (e.button === 0) onSelect?.(index);
            }}
            onClick={(e) => {
              if (e.detail === 0) onSelect?.(index);
            }}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}

function HomeIndicator({ theme }: { theme: TabBarTheme }) {
  const h = NO_TOKEN.homeIndicator;
  return (
    <div className="tbx-home" style={{ height: NO_TOKEN.homeIndicatorZone }} aria-hidden="true">
      <span
        style={{
          width: h.width,
          height: h.height,
          marginBottom: h.bottom,
          background: theme === 'day' ? '#000000' : '#FFFFFF',
        }}
      />
    </div>
  );
}

export function TabBarPreviewPage() {
  const reducedMotion = useMemo(prefersReducedMotion, []);
  const plusDarker = useMemo(supportsPlusDarker, []);
  const [motion, setMotion] = useState<TabBarMotion>(loadMotion);
  const [selected, setSelected] = useState(0);
  const [phase, setPhase] = useState<Phase>('rest');
  const [animate, setAnimate] = useState(!reducedMotion);
  const [autoRun, setAutoRun] = useState(!reducedMotion);
  const [slow, setSlow] = useState(false);
  const [dock, setDock] = useState(true);
  const [copied, setCopied] = useState('');
  const pillEls = useRef<Partial<Record<TabBarTheme, HTMLDivElement | null>>>({});
  const current = useRef<Rect>(restRect(0, motion.tabs));
  const frame = useRef(0);
  const motionRef = useRef(motion);
  motionRef.current = motion;
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const preRef = useRef<HTMLPreElement | null>(null);

  const json = useMemo(() => JSON.stringify(motionExport(motion), null, 2), [motion]);
  const settle = useMemo(() => springSettleMs(motion), [motion]);
  const guideTotal = useMemo(() => totalMs(GUIDE_MOTION), []);
  const total = motion.stretchMs + settle;

  useEffect(() => {
    document.title = 'TabBar · превью перетекания';
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(motion));
    } catch {
      /* хранилище недоступно — настройки живут до перезагрузки */
    }
  }, [motion]);

  const paint = useCallback((r: Rect) => {
    current.current = r;
    for (const theme of TAB_BAR_THEMES) applyRect(pillEls.current[theme] ?? null, r);
  }, []);

  const stop = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
  }, []);

  const select = useCallback(
    (index: number, fromUser: boolean) => {
      if (fromUser) setAutoRun(false);
      const m = motionRef.current;
      if (index === selectedRef.current && frame.current === 0) return;
      setSelected(index);
      stop();
      if (!animate) {
        paint(restRect(index, m.tabs));
        setPhase('rest');
        return;
      }
      const from = current.current;
      // Параметры фиксируются на старте перетекания: бегунок во время прогона не дёргает подложку.
      const frozen = { ...m };
      const settleMs = springSettleMs(frozen);
      const t0 = performance.now();
      const scale = slow ? SLOW_FACTOR : 1;
      let lastPhase: Phase | null = null;
      const tick = (now: number) => {
        const res = pillFrame((now - t0) / scale, from, index, frozen, settleMs);
        paint(res.rect);
        if (res.phase !== lastPhase) {
          lastPhase = res.phase;
          setPhase(res.phase);
        }
        frame.current = res.phase === 'rest' ? 0 : requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
    },
    [animate, slow, paint, stop],
  );

  // Смена числа табов: подложка встаёт на свой таб без анимации.
  useEffect(() => {
    stop();
    const index = Math.min(selectedRef.current, motion.tabs - 1);
    setSelected(index);
    setPhase('rest');
    paint(restRect(index, motion.tabs));
  }, [motion.tabs, paint, stop]);

  useEffect(() => stop, [stop]);

  // Автопрогон: следующий таб после полного перетекания и паузы.
  useEffect(() => {
    if (!autoRun) return undefined;
    const every = total * (slow && animate ? SLOW_FACTOR : 1) + 700;
    const id = window.setInterval(() => {
      select((selectedRef.current + 1) % motionRef.current.tabs, false);
    }, every);
    return () => window.clearInterval(id);
  }, [autoRun, total, slow, animate, select]);

  const patch = (p: Partial<TabBarMotion>) => setMotion((prev) => ({ ...prev, ...p }));

  const copy = () => {
    const fallback = () => {
      const pre = preRef.current;
      const selection = window.getSelection();
      if (pre && selection) {
        const range = document.createRange();
        range.selectNodeContents(pre);
        selection.removeAllRanges();
        selection.addRange(range);
        let ok = false;
        try {
          ok = document.execCommand('copy');
        } catch {
          ok = false;
        }
        setCopied(ok ? 'Скопировано' : 'Текст выделен — нажмите ⌘C');
        return;
      }
      setCopied('Не скопировалось — выделите текст и нажмите ⌘C');
    };
    try {
      if (!navigator.clipboard?.writeText) {
        fallback();
        return;
      }
      void navigator.clipboard.writeText(json).then(() => setCopied('Скопировано'), fallback);
    } catch {
      fallback();
    }
  };

  return (
    <div className="tbx-page">
      <style>{TAB_BAR_PREVIEW_STYLE}</style>
      <header className="tbx-header">
        <p className="pf-label-xs-caps tbx-muted">Rider · AID-89 · превью</p>
        <h1 className="pf-heading-l tbx-h1">TabBar · превью перетекания</h1>
        <p className="pf-body-m tbx-muted tbx-lead">
          Подложка выбранного таба перетекает в две фазы: растягивается на старый и новый таб и чуть подрастает по высоте, потом
          пружиной встаёт на новый таб. Иконки и подписи не двигаются. Нажмите на таб или включите автопрогон; бегунки меняют
          анимацию сразу. Подобранные значения скопируйте внизу и передайте в чат TabBar.
        </p>
        <span className="pf-badge pf-badge--warning">Не опубликовано · только по прямой ссылке</span>
      </header>

      <section className="tbx-card" aria-label="TabBar днём и ночью">
        <div className="tbx-toolbar">
          <button type="button" className={`tbx-btn${autoRun ? ' tbx-btn--on' : ''}`} aria-pressed={autoRun} onClick={() => setAutoRun((v) => !v)}>
            Автопрогон
          </button>
          <button type="button" className={`tbx-btn${!animate ? ' tbx-btn--on' : ''}`} aria-pressed={!animate} onClick={() => setAnimate((v) => !v)}>
            Без анимации
          </button>
          <button type="button" className={`tbx-btn${slow ? ' tbx-btn--on' : ''}`} aria-pressed={slow} onClick={() => setSlow((v) => !v)}>
            Замедлить ×{SLOW_FACTOR}
          </button>
          <button type="button" className={`tbx-btn${dock ? ' tbx-btn--on' : ''}`} aria-pressed={dock} onClick={() => setDock((v) => !v)}>
            DockTabBar
          </button>
          <fieldset className="tbx-seg">
            <legend className="pf-label-s tbx-muted">Табов</legend>
            {([3, 4] as const).map((n) => (
              <label key={n} className={`tbx-seg-option pf-label-s${motion.tabs === n ? ' is-active' : ''}`}>
                <input type="radio" name="tbx-tabs" checked={motion.tabs === n} onChange={() => patch({ tabs: n })} />
                {n}
              </label>
            ))}
          </fieldset>
          <span className="pf-code-s tbx-phase" aria-live="off">
            {PHASE_LABEL[phase]}
          </span>
        </div>
        {reducedMotion && (
          <p className="pf-body-s tbx-muted">
            Включено «уменьшение движения» — подложка переносится без анимации. Чтобы посмотреть перетекание, отожмите «Без
            анимации».
          </p>
        )}
        <div className="tbx-stages">
          {TAB_BAR_THEMES.map((theme) => (
            <figure key={theme} className="tbx-stage-wrap">
              <figcaption className="pf-label-s tbx-muted">
                {THEME_TITLE[theme]}
                {dock ? ' · DockTabBar, экран 390' : ' · TabBar 358'}
              </figcaption>
              <div className={`tbx-stage${dock ? ' tbx-stage--dock' : ''}`} style={{ width: dock ? NO_TOKEN.screenWidth : CAPSULE.width + 32 }}>
                <img className="tbx-map" src={MAP_IMAGES[theme]} alt="" />
                <div className="tbx-dock" style={dock ? { padding: `0 ${NO_TOKEN.dockSide}px` } : undefined}>
                  <TabBar
                    theme={theme}
                    tabs={motion.tabs}
                    selected={selected}
                    pillRect={current.current}
                    plusDarker={plusDarker}
                    pillRef={(el) => {
                      pillEls.current[theme] = el;
                    }}
                    onSelect={(i) => select(i, true)}
                    label={`TabBar, ${THEME_TITLE[theme].toLowerCase()}`}
                  />
                  {dock && <HomeIndicator theme={theme} />}
                </div>
              </div>
            </figure>
          ))}
        </div>
        <p className="pf-body-s tbx-muted">
          Сейчас: растяжение {motion.stretchMs} мс + пружина ≈ {settle} мс = <b>≈ {total} мс</b>. В гайде: {GUIDE_MOTION.stretchMs} мс +
          ≈ {guideTotal - GUIDE_MOTION.stretchMs} мс = ≈ {guideTotal} мс. Пружина считается до 0,5 % от пути.
        </p>
      </section>

      <section className="tbx-card" aria-labelledby="tbx-knobs-title">
        <div className="tbx-section-head">
          <h2 id="tbx-knobs-title" className="pf-heading-s tbx-h2">
            Подбор анимации
          </h2>
          <div className="tbx-toolbar">
            <button type="button" className="tbx-btn" onClick={() => setMotion({ ...GUIDE_MOTION, tabs: motion.tabs })}>
              Как в гайде
            </button>
            <button type="button" className="tbx-btn" onClick={() => setMotion({ ...DEFAULT_MOTION, tabs: motion.tabs })}>
              Сбросить
            </button>
          </div>
        </div>
        <p className="pf-body-s tbx-muted">
          Было в гайде: растяжение {GUIDE_MOTION.stretchMs} мс {GUIDE_MOTION.stretchEasing}, пружина {GUIDE_MOTION.mass} ·{' '}
          {GUIDE_MOTION.stiffness} · {GUIDE_MOTION.damping} (mass · stiffness · damping), расширение +{GUIDE_MOTION.growPx}. Умолчания
          страницы быстрее — по пожеланию дизайнера 30.10 «сделать анимацию перехода фона выбранного таба быстрее»:{' '}
          {DEFAULT_MOTION.stretchMs} мс, пружина {DEFAULT_MOTION.mass} · {DEFAULT_MOTION.stiffness} · {DEFAULT_MOTION.damping}.
        </p>
        <div className="tbx-knobs">
          {MOTION_KNOBS.map((knob) => (
            <div className="tbx-knob" key={knob.key}>
              <label htmlFor={`tbx-${knob.key}`} className="pf-body-s">
                {knob.label}
                <output htmlFor={`tbx-${knob.key}`} className="pf-code-s">
                  {`${motion[knob.key]}${knob.unit}`}
                  <span className="tbx-muted">{` · гайд ${GUIDE_MOTION[knob.key]}`}</span>
                </output>
              </label>
              <input
                id={`tbx-${knob.key}`}
                type="range"
                min={knob.min}
                max={knob.max}
                step={knob.step}
                value={motion[knob.key]}
                onChange={(e) => patch({ [knob.key]: Number(e.target.value) })}
              />
            </div>
          ))}
          <fieldset className="tbx-seg">
            <legend className="pf-body-s tbx-muted">Растяжение · кривая</legend>
            {STRETCH_EASINGS.map((e) => (
              <label key={e} className={`tbx-seg-option pf-label-s${motion.stretchEasing === e ? ' is-active' : ''}`}>
                <input type="radio" name="tbx-easing" checked={motion.stretchEasing === e} onChange={() => patch({ stretchEasing: e })} />
                {EASING_LABEL[e]}
              </label>
            ))}
          </fieldset>
        </div>
      </section>

      <section className="tbx-card" aria-labelledby="tbx-values-title">
        <h2 id="tbx-values-title" className="pf-heading-s tbx-h2">
          Значения для передачи
        </h2>
        <pre ref={preRef} className="pf-code-s tbx-pre">
          {json}
        </pre>
        <div className="tbx-toolbar">
          <button type="button" className="tbx-btn" onClick={copy}>
            Скопировать
          </button>
          <span className="pf-body-s tbx-muted" role="status">
            {copied}
          </span>
        </div>
        <p className="pf-body-s tbx-muted">Значения анимации — параметры подбора, не токены. Настройки сохраняются в этом браузере.</p>
      </section>

      <section className="tbx-card tbx-notes" aria-labelledby="tbx-notes-title">
        <h2 id="tbx-notes-title" className="pf-heading-s tbx-h2">
          Что здесь приближённо
        </h2>
        <ul className="pf-body-s">
          <li>
            <b>Приближение стекла Figma.</b> Glass/Navbar (Figma GLASS, frost 50) в вебе — размытие фона {GLASS_BLUR_PX} px и семь
            теней стиля отдельными слоями со своим наложением, как в Figma: кант и внутренняя тень Linear Burn →{' '}
            <code>plus-darker</code>
            {plusDarker ? '' : ' (в этом браузере нет — multiply)'}, блики Linear Dodge → <code>plus-lighter</code>
            {supportsBlend('plus-lighter') ? '' : ' (в этом браузере нет — screen)'}. Поэтому кант только затемняет то, что под
            капсулой: ночью на тёмной карте он почти не виден, светлого кольца нет. Преломления и дисперсии нет.
          </li>
          <li>
            <b>Plus darker.</b> Днём подложка Background/Tab Selected (#D9D9D9 50 %) ложится с наложением Plus darker.{' '}
            {plusDarker
              ? 'Этот браузер его поддерживает — показано как в Figma.'
              : 'Этот браузер plus-darker не поддерживает — показано через multiply, днём подложка может выглядеть чуть иначе, чем в Figma (точнее — в Safari).'}{' '}
            Ночью — одна подложка #FFFFFF 20 % обычным наложением, без двойной подложки.
          </li>
          <li>
            Background/Tab Selected нет в данных портала (color-sem Rider) — значения из гайда TabBar. Остальные цвета, отступ
            space-4, radius-pill и Caption 2 — из данных портала.
          </li>
          <li>
            Подпись — Caption 2 (SF Pro Text Medium 11/14) системным шрифтом; одна строка, многоточие. Home Indicator iOS (134 × 5,
            зона 34) и экран 390 — без токена, системный элемент.
          </li>
          <li>Карта под TabBar — снимок для настройщика блика карты, только фон.</li>
        </ul>
      </section>
    </div>
  );
}

const TAB_BAR_PREVIEW_STYLE = `
.tbx-page {
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
  .tbx-page { padding: var(--pf-spacing-20) var(--pf-spacing-16) var(--pf-spacing-40); }
}
.tbx-header { display: flex; flex-direction: column; align-items: flex-start; gap: var(--pf-spacing-8); }
.tbx-h1, .tbx-h2, .tbx-header p { margin: 0; }
.tbx-lead { max-width: 72ch; }
.tbx-muted { color: var(--pf-text-secondary); margin: 0; }
.tbx-card {
  background: var(--pf-bg-surface-main);
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-l);
  padding: var(--pf-spacing-24);
  display: flex;
  flex-direction: column;
  gap: var(--pf-spacing-16);
  min-width: 0;
}
.tbx-card > p { margin: 0; }
.tbx-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: var(--pf-spacing-8); }
.tbx-btn {
  margin: 0;
  color: var(--pf-text-primary);
  background: var(--pf-bg-surface-main);
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-m);
  padding: var(--pf-spacing-6) var(--pf-spacing-12);
  font: var(--pf-font-label-s);
  cursor: pointer;
}
.tbx-btn:hover { border-color: var(--pf-line-hover); }
.tbx-btn--on { background: var(--pf-bg-accent-main); border-color: var(--pf-bg-accent-main); color: var(--pf-text-inverse); }
.tbx-btn:focus-visible, .tbx-seg-option:focus-within, .tbx-tab:focus-visible, .tbx-knob input:focus-visible {
  outline: 2px solid var(--pf-line-focus);
  outline-offset: 2px;
}
.tbx-phase { margin-left: auto; color: var(--pf-text-secondary); }
.tbx-seg { display: inline-flex; align-items: center; flex-wrap: wrap; gap: var(--pf-spacing-4); border: 0; margin: 0; padding: 0; }
.tbx-seg legend { float: left; margin-right: var(--pf-spacing-8); padding: 0; }
.tbx-seg-option {
  position: relative;
  padding: var(--pf-spacing-6) var(--pf-spacing-12);
  border-radius: var(--pf-radius-pill);
  border: 1px solid var(--pf-line-default);
  cursor: pointer;
  color: var(--pf-text-secondary);
}
.tbx-seg-option.is-active { background: var(--pf-bg-accent-main); border-color: var(--pf-bg-accent-main); color: var(--pf-text-inverse); }
.tbx-seg-option input { position: absolute; opacity: 0; inset: 0; margin: 0; cursor: pointer; }
.tbx-stages { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 400px), 1fr)); gap: var(--pf-spacing-20); }
.tbx-stage-wrap { margin: 0; display: flex; flex-direction: column; gap: var(--pf-spacing-8); min-width: 0; overflow-x: auto; }
.tbx-stage {
  position: relative;
  height: 220px;
  overflow: hidden;
  border-radius: var(--pf-radius-m);
  outline: 1px solid var(--pf-line-default);
  outline-offset: -1px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  flex-shrink: 0;
}
.tbx-map { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 70%; max-width: none; }
.tbx-dock { position: relative; display: flex; flex-direction: column; align-items: center; padding-bottom: 16px; }
.tbx-stage--dock .tbx-dock { padding-bottom: 0; width: 100%; box-sizing: border-box; }
.tbx-home { display: flex; align-items: flex-end; justify-content: center; width: 100%; }
.tbx-home span { display: block; border-radius: 100px; }
.tbx-capsule { position: relative; box-sizing: border-box; display: flex; flex-shrink: 0; }
.tbx-glass, .tbx-glass-fx { position: absolute; inset: 0; pointer-events: none; }
.tbx-pill { position: absolute; left: 0; top: 0; will-change: transform, width, height; pointer-events: none; }
.tbx-tab {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0;
  border: 0;
  background: none;
  border-radius: 9999px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
}
.tbx-icon { display: block; flex-shrink: 0; -webkit-mask-size: 100% 100%; mask-size: 100% 100%; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; }
.tbx-tab-label { display: block; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tbx-section-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--pf-spacing-12); }
.tbx-knobs { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: var(--pf-spacing-16) var(--pf-spacing-24); align-items: end; }
.tbx-knob { display: grid; gap: var(--pf-spacing-4); }
.tbx-knob label { display: flex; justify-content: space-between; gap: var(--pf-spacing-8); color: var(--pf-text-secondary); }
.tbx-knob output { color: var(--pf-text-primary); font-variant-numeric: tabular-nums; }
.tbx-knob input { width: 100%; accent-color: var(--pf-bg-accent-main); }
.tbx-pre {
  margin: 0;
  overflow-x: auto;
  padding: var(--pf-spacing-12);
  background: var(--pf-bg-surface-muted);
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-m);
}
.tbx-notes ul { margin: 0; padding-left: var(--pf-spacing-20); display: grid; gap: var(--pf-spacing-6); color: var(--pf-text-secondary); }
@media (prefers-reduced-motion: reduce) { .tbx-pill { will-change: auto; } }
`;
