import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { withBase } from './base';
import {
  DETENTS,
  DETENT_LABELS,
  DETENT_SPEC,
  DOCK_TABS,
  DRAGGER_LABEL,
  NO_TOKEN,
  SCREEN_HEIGHT,
  SCREEN_WIDTHS,
  SHEET_ADDRESSES,
  SHEET_ICONS,
  detentTops,
  draggerTarget,
  isRaised,
  overlayProgress,
  pickDetent,
  sheetColor,
  sheetRadius,
  sheetShadow,
  sheetSpace,
  sheetType,
  type Detent,
  type SheetMode,
} from './bottomSheetPreviewData';

/**
 * Веб-демо шторки Rider `BottomSheet` (AID-79; задача presentbook-11 = AID-91, issue #578) —
 * `aidteam.pro/rider/preview/bottom-sheet`. Только по прямой ссылке, ссылок из меню нет.
 *
 * Слои снизу вверх: карта-заглушка → DockTabBar → затемнение Background/Overlay → шторка.
 * Таб-бар всегда за шторкой, шторка всегда от низа экрана. Остановки — detent
 * (`bottomSheetPreviewData.ts`), не px. Вид — аудит Figma 1093:353 (Rider Components).
 * Хром страницы — Persefona Kit (`--pf-*`), экран — токены Rider из данных портала.
 */

const MODES: { mode: SheetMode; label: string }[] = [
  { mode: 'day', label: 'День' },
  { mode: 'night', label: 'Ночь' },
];

/** Высоты по аудиту: строка поиска и строка списка — 60 (min-height Search Field и List Item с подзаголовком). */
const ROW_HEIGHT = 60;
const HOME_INDICATOR_HEIGHT = 34;
const DIVIDER_HEIGHT = sheetSpace('space-2') * 2 + sheetSpace('space-1');
const COLLAPSED_HEIGHT = DETENT_SPEC.draggerHeight + ROW_HEIGHT + HOME_INDICATOR_HEIGHT;
const CONTENT_HEIGHT =
  DETENT_SPEC.draggerHeight + ROW_HEIGHT * (1 + SHEET_ADDRESSES.length) + DIVIDER_HEIGHT + HOME_INDICATOR_HEIGHT;

const ANIMATION_MS = 300;
const DRAG_THRESHOLD = 4;
const FOCUSABLE = 'button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])';

function Icon({ src, color, label }: { src: string; color: string; label?: string }) {
  const url = `url("${withBase(src)}")`;
  return (
    <span
      className="bsx-icon"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ background: color, WebkitMaskImage: url, maskImage: url }}
    />
  );
}

function MapStub({ mode }: { mode: SheetMode }) {
  const fill = NO_TOKEN.mapFill[mode];
  const line = mode === 'day' ? 'rgba(15, 15, 31, 0.07)' : 'rgba(255, 255, 255, 0.06)';
  const road = mode === 'day' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.12)';
  return (
    <div
      className="bsx-map"
      aria-hidden="true"
      style={{
        background: [
          `linear-gradient(115deg, transparent 47%, ${road} 47%, ${road} 50%, transparent 50%)`,
          `linear-gradient(15deg, transparent 62%, ${road} 62%, ${road} 64%, transparent 64%)`,
          `repeating-linear-gradient(0deg, ${line} 0 1px, transparent 1px 56px)`,
          `repeating-linear-gradient(90deg, ${line} 0 1px, transparent 1px 56px)`,
          fill,
        ].join(', '),
      }}
    >
      <span className="bsx-map-tag" style={{ color: sheetColor('Text/Secondary', mode) }}>
        карта-заглушка
      </span>
    </div>
  );
}

function DockTabBar({ mode }: { mode: SheetMode }) {
  const caption = sheetType('Caption 2');
  return (
    <div className="bsx-dock" aria-hidden="true" style={{ height: 64 + HOME_INDICATOR_HEIGHT }}>
      <div
        className="bsx-tabbar"
        style={{
          margin: `0 ${sheetSpace('space-16')}px`,
          padding: sheetSpace('space-4'),
          gap: sheetSpace('space-4'),
          borderRadius: sheetRadius('radius-pill'),
          background: sheetColor('Background/Navbar', mode),
          boxShadow: sheetShadow('Small', mode),
        }}
      >
        {DOCK_TABS.map((tab) => (
          <div
            key={tab.label}
            className="bsx-tab"
            style={{
              borderRadius: sheetRadius('radius-pill'),
              background: tab.selected ? NO_TOKEN.tabSelected[mode] : 'transparent',
            }}
          >
            <Icon src={tab.icon} color={sheetColor('Icon/Primary', mode)} />
            <span style={{ font: caption.font, letterSpacing: caption.letterSpacing, color: sheetColor('Text/Primary', mode) }}>
              {tab.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SheetContent({ mode }: { mode: SheetMode }) {
  const subtitle2 = sheetType('Subtitle 2');
  const body3 = sheetType('Body 3');
  const iconColor = sheetColor('Icon/Primary', mode);
  return (
    <>
      <div
        className="bsx-search"
        style={{ padding: sheetSpace('space-16'), gap: sheetSpace('space-20'), minHeight: ROW_HEIGHT }}
      >
        <button type="button" className="bsx-search-input" style={{ gap: sheetSpace('space-12') }}>
          <Icon src={SHEET_ICONS.passenger} color={iconColor} />
          <span style={{ font: subtitle2.font, letterSpacing: subtitle2.letterSpacing, color: sheetColor('Text/Secondary', mode) }}>
            Куда поедем?
          </span>
        </button>
        <button type="button" className="bsx-icon-button" style={{ paddingLeft: sheetSpace('space-4') }} aria-label="Добавить остановку">
          <Icon src={SHEET_ICONS.plus} color={iconColor} />
        </button>
      </div>
      {SHEET_ADDRESSES.map((item) => (
        <button
          type="button"
          key={item.title}
          className="bsx-row"
          style={{
            padding: `${sheetSpace('space-12')}px ${sheetSpace('space-16')}px ${sheetSpace('space-12')}px ${sheetSpace('space-20')}px`,
            gap: sheetSpace('space-12'),
            minHeight: ROW_HEIGHT,
          }}
        >
          <Icon src={SHEET_ICONS.placeholder} color={iconColor} />
          <span className="bsx-row-text">
            <span style={{ font: subtitle2.font, letterSpacing: subtitle2.letterSpacing, color: sheetColor('Text/Primary', mode) }}>
              {item.title}
            </span>
            <span style={{ font: body3.font, letterSpacing: body3.letterSpacing, color: sheetColor('Text/Secondary', mode) }}>
              {item.subtitle}
            </span>
          </span>
          <Icon src={SHEET_ICONS.placeholder} color={iconColor} />
        </button>
      ))}
      <div style={{ padding: `${sheetSpace('space-2')}px 0` }} role="separator">
        <div style={{ height: sheetSpace('space-1'), background: sheetColor('Stroke/Separator', mode) }} />
      </div>
    </>
  );
}

/**
 * `.ButtonClose` (Rider Components 1576:8284) — тот же крест, что в Dialog. Веб-реализации Dialog
 * в портале нет — первая здесь. Зона нажатия 44×44 абсолютом от правого верхнего угла шторки:
 * сверху 12, справа 8; круг 28 (Background/Secondary, отступ space-2, radius-pill), ic_delete Icon/Tertiary.
 */
function ButtonClose({ mode, onClick }: { mode: SheetMode; onClick: () => void }) {
  return (
    <button
      type="button"
      className="bsx-close"
      aria-label="Закрыть"
      onClick={onClick}
      style={{ top: sheetSpace('space-12'), right: sheetSpace('space-8') }}
    >
      <span
        style={{
          padding: sheetSpace('space-2'),
          borderRadius: sheetRadius('radius-pill'),
          background: sheetColor('Background/Secondary', mode),
        }}
      >
        <Icon src={SHEET_ICONS.close} color={sheetColor('Icon/Tertiary', mode)} />
      </span>
    </button>
  );
}

function HomeIndicator({ mode }: { mode: SheetMode }) {
  return (
    <div className="bsx-home" aria-hidden="true" style={{ height: HOME_INDICATOR_HEIGHT }}>
      <span style={{ background: NO_TOKEN.homeIndicator[mode] }} />
    </div>
  );
}

interface DragState {
  pointerId: number;
  startY: number;
  startTop: number;
  lastY: number;
  lastTime: number;
  velocity: number;
  moved: boolean;
}

export function BottomSheetPreviewPage() {
  const [mode, setMode] = useState<SheetMode>('day');
  const [width, setWidth] = useState<(typeof SCREEN_WIDTHS)[number]>(390);
  const [detent, setDetent] = useState<Detent>('default');
  const [dragTop, setDragTop] = useState<number | null>(null);
  /** Show Close — крест закрытия (по умолчанию выключен, как в Figma). */
  const [showClose, setShowClose] = useState(false);
  /** Шторка закрыта крестом (допущение до решения дизайнера: тап закрывает, как в Dialog). */
  const [closed, setClosed] = useState(false);
  const reopenRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const suppressClickUntilRef = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const draggerRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const fullOpen = detent === 'full' && !closed;
  const prevFullOpenRef = useRef(fullOpen);

  useEffect(() => {
    document.title = 'BottomSheet · демо';
  }, []);

  const tops = useMemo(() => detentTops(SCREEN_HEIGHT, COLLAPSED_HEIGHT, CONTENT_HEIGHT), []);
  const top = closed ? SCREEN_HEIGHT : (dragTop ?? tops[detent]);
  const progress = closed ? 0 : overlayProgress(top, tops);
  const raised = progress >= 0.5;

  // Full-Screen: фокус в шторке, после выхода — на прежнее место.
  useEffect(() => {
    const prev = prevFullOpenRef.current;
    prevFullOpenRef.current = fullOpen;
    if (fullOpen && !prev) {
      const active = document.activeElement as HTMLElement | null;
      returnFocusRef.current = active && !sheetRef.current?.contains(active) ? active : null;
      if (!sheetRef.current?.contains(document.activeElement)) {
        draggerRef.current?.focus();
      }
    } else if (prev && !fullOpen) {
      if (returnFocusRef.current) {
        returnFocusRef.current.focus();
        returnFocusRef.current = null;
      } else if (closed) {
        reopenRef.current?.focus();
      }
    }
  }, [fullOpen, closed]);

  const goTo = useCallback((next: Detent) => {
    setDragTop(null);
    setClosed(false);
    setDetent(next);
  }, []);

  const closeSheet = () => {
    setDragTop(null);
    setClosed(true);
    if (sheetRef.current?.contains(document.activeElement) && !fullOpen) {
      window.setTimeout(() => reopenRef.current?.focus(), 0);
    }
  };

  // Движение и отпускание слушаем на window: указатель быстро уходит за край шторки.
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || dragRef.current || closed) return;
    if ((e.target as HTMLElement).closest('.bsx-close')) return;
    const from = detent;
    const drag: DragState = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startTop: tops[from],
      lastY: e.clientY,
      lastTime: e.timeStamp,
      velocity: 0,
      moved: false,
    };
    dragRef.current = drag;

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== drag.pointerId) return;
      const dy = ev.clientY - drag.startY;
      if (!drag.moved) {
        if (Math.abs(dy) < DRAG_THRESHOLD) return;
        drag.moved = true;
      }
      ev.preventDefault();
      const dt = Math.max(1, ev.timeStamp - drag.lastTime);
      drag.velocity = 0.8 * ((ev.clientY - drag.lastY) / dt) + 0.2 * drag.velocity;
      drag.lastY = ev.clientY;
      drag.lastTime = ev.timeStamp;
      let next = drag.startTop + dy;
      // За крайними остановками — тянется с сопротивлением.
      if (next < tops.full) next = tops.full - (tops.full - next) / 4;
      if (next > tops.collapsed) next = tops.collapsed + (next - tops.collapsed) / 4;
      setDragTop(next);
    };

    const onEnd = (ev: PointerEvent) => {
      if (ev.pointerId !== drag.pointerId) return;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
      dragRef.current = null;
      if (!drag.moved) return;
      suppressClickUntilRef.current = performance.now() + 300;
      const stale = ev.timeStamp - drag.lastTime > 80;
      const finalTop = drag.startTop + (ev.clientY - drag.startY);
      goTo(pickDetent(finalTop, stale ? 0 : drag.velocity, tops, from));
    };

    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
  };

  // Клик после перетаскивания не считается нажатием на полоску или строку.
  const onSheetClickCapture = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (performance.now() < suppressClickUntilRef.current) {
      suppressClickUntilRef.current = 0;
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const onDraggerClick = () => {
    goTo(draggerTarget(detent));
  };

  const onSheetKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && isRaised(detent)) {
      e.preventDefault();
      goTo('default');
      return;
    }
    if (e.key !== 'Tab' || !fullOpen || !sheetRef.current) return;
    const items = Array.from(sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const onDraggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const idx = DETENTS.indexOf(detent);
    if (e.key === 'ArrowUp' && DETENTS[idx + 1]) {
      e.preventDefault();
      goTo(DETENTS[idx + 1]);
    } else if (e.key === 'ArrowDown' && DETENTS[idx - 1]) {
      e.preventDefault();
      goTo(DETENTS[idx - 1]);
    }
  };

  const dragger = raised ? NO_TOKEN.draggerOutside[mode] : NO_TOKEN.draggerInside[mode];
  const dragging = dragTop !== null;

  const screenStyle = {
    width,
    height: SCREEN_HEIGHT,
    '--bsx-ms': `${ANIMATION_MS}ms`,
  } as CSSProperties;

  return (
    <div className="bsx-page">
      <style>{BOTTOM_SHEET_PREVIEW_STYLE}</style>
      <header className="bsx-header">
        <p className="pf-label-xs-caps bsx-muted">Rider · AID-79 · аудит · presentbook-11</p>
        <h1 className="pf-heading-l bsx-h1">BottomSheet · демо</h1>
        <p className="pf-body-m bsx-muted bsx-lead">
          Тяните шторку мышью или пальцем — при отпускании она доводится до ближайшей остановки с учётом скорости. Тап по
          затемнению возвращает в Default. Полоска — кнопка: Enter разворачивает или сворачивает, стрелки вверх и вниз
          меняют остановку, Esc из Expanded и Full-Screen — в Default.
        </p>
        <span className="pf-badge pf-badge--warning">Не опубликовано · только по прямой ссылке</span>
      </header>

      <div className="bsx-layout">
        <section className="bsx-controls" aria-label="Настройки демо">
          <fieldset className="bsx-switch">
            <legend className="pf-label-s bsx-muted">Тема</legend>
            {MODES.map((m) => (
              <label key={m.mode} className={`bsx-option pf-label-s${mode === m.mode ? ' is-active' : ''}`}>
                <input type="radio" name="bsx-mode" checked={mode === m.mode} onChange={() => setMode(m.mode)} />
                {m.label}
              </label>
            ))}
          </fieldset>
          <fieldset className="bsx-switch">
            <legend className="pf-label-s bsx-muted">Ширина экрана</legend>
            {SCREEN_WIDTHS.map((w) => (
              <label key={w} className={`bsx-option pf-label-s${width === w ? ' is-active' : ''}`}>
                <input type="radio" name="bsx-width" checked={width === w} onChange={() => setWidth(w)} />
                {w}
              </label>
            ))}
          </fieldset>
          <fieldset className="bsx-switch">
            <legend className="pf-label-s bsx-muted">Крест · Show Close</legend>
            {[false, true].map((on) => (
              <label key={String(on)} className={`bsx-option pf-label-s${showClose === on ? ' is-active' : ''}`}>
                <input type="radio" name="bsx-close" checked={showClose === on} onChange={() => setShowClose(on)} />
                {on ? 'Вкл' : 'Выкл'}
              </label>
            ))}
          </fieldset>
          <fieldset className="bsx-switch bsx-switch--column">
            <legend className="pf-label-s bsx-muted">В остановку</legend>
            {[...DETENTS].reverse().map((d) => (
              <button
                key={d}
                type="button"
                className={`bsx-option pf-label-s${detent === d && !dragging && !closed ? ' is-active' : ''}`}
                aria-pressed={detent === d && !closed}
                onClick={() => goTo(d)}
              >
                {DETENT_LABELS[d]}
              </button>
            ))}
          </fieldset>
          <dl className="bsx-facts pf-body-s">
            <div>
              <dt className="bsx-muted">Сейчас</dt>
              <dd className="pf-code-s">
                {closed ? 'закрыта' : dragging ? 'тянется' : DETENT_LABELS[detent]} · верх {Math.round(top)}
              </dd>
            </div>
            <div>
              <dt className="bsx-muted">Анимация</dt>
              <dd className="pf-code-s">{ANIMATION_MS} мс ease-in-out</dd>
            </div>
          </dl>
          {closed && (
            <button ref={reopenRef} type="button" className="bsx-option pf-label-s" onClick={() => goTo('default')}>
              Открыть шторку снова
            </button>
          )}
          <p className="pf-body-s bsx-muted">
            При «уменьшении движения» в системе шторка встаёт в остановку без анимации.
          </p>
        </section>

        <div className="bsx-stage">
          <div className={`bsx-screen bsx-screen--${mode}`} style={screenStyle}>
            <MapStub mode={mode} />
            <DockTabBar mode={mode} />
            <div
              className="bsx-overlay"
              aria-hidden="true"
              onClick={() => goTo('default')}
              style={{
                background: sheetColor('Background/Overlay', mode),
                opacity: progress,
                pointerEvents: progress > 0 ? 'auto' : 'none',
                transition: dragging ? 'none' : undefined,
              }}
            />
            <div
              ref={sheetRef}
              className={`bsx-sheet${dragging ? ' is-dragging' : ''}`}
              role={fullOpen ? 'dialog' : 'region'}
              aria-modal={fullOpen ? true : undefined}
              aria-hidden={closed ? true : undefined}
              aria-label="Шторка: куда поедем"
              style={{ top, visibility: closed ? 'hidden' : undefined, transition: closed ? 'top var(--bsx-ms) ease-in-out, visibility 0s var(--bsx-ms)' : undefined }}
              onPointerDown={onPointerDown}
              onClickCapture={onSheetClickCapture}
              onKeyDown={onSheetKeyDown}
            >
              <div
                className="bsx-sheet-bg"
                style={{
                  top: DETENT_SPEC.draggerHeight * progress,
                  background: sheetColor('Background/Primary', mode),
                  borderTopLeftRadius: sheetRadius('radius-28'),
                  borderTopRightRadius: sheetRadius('radius-28'),
                  boxShadow: sheetShadow('Medium', mode),
                }}
              />
              <button
                ref={draggerRef}
                type="button"
                className="bsx-dragger"
                style={{ height: DETENT_SPEC.draggerHeight }}
                aria-label={DRAGGER_LABEL[detent]}
                aria-expanded={isRaised(detent)}
                onClick={onDraggerClick}
                onKeyDown={onDraggerKeyDown}
              >
                <span
                  style={{
                    width: sheetSpace('space-24'),
                    height: sheetSpace('space-4'),
                    borderRadius: sheetRadius('radius-pill'),
                    background: dragger.color,
                    mixBlendMode: dragger.blend,
                  }}
                />
              </button>
              <div className="bsx-sheet-content">
                <SheetContent mode={mode} />
              </div>
              <HomeIndicator mode={mode} />
              {showClose && <ButtonClose mode={mode} onClick={closeSheet} />}
            </div>
          </div>
        </div>
      </div>

      <section className="bsx-notes pf-body-s bsx-muted" aria-label="Пояснения">
        <p>
          Остановки по аудиту: Collapsed — по содержимому (полоска и строка поиска), Default — около половины экрана (верх
          ≈410 из 844), Expanded — по содержимому, верх не выше ≈186, карта видна полосой, Full-Screen — до статус-бара. В
          коде это detent, не px. Затемнение Background/Overlay — только в Expanded и Full-Screen; таб-бар всегда за шторкой;
          Home Indicator один — у шторки, вплотную к низу.
        </p>
        <p>
          Без токена — показаны как в Figma: полоска Dragger внутри шторки (день #CACAD1 72 % multiply, ночь #FFFFFF 32 %) и над
          ней на затемнении (день #FFFFFF, ночь #0F0F1F 54 %) — допущение аудита; фон карты-заглушки; Background/Tab Selected
          (есть в Rider Tokens, ещё не в данных портала). Источник — Rider Components, пейдж «👀 Bottom Sheet · audit»
          1093:353.
        </p>
        <p>
          Крест (Show Close, по умолчанию выключен) — открыто у дизайнера: с крестом он перекрывает правую иконку строки
          поиска, как резервировать место справа — не решено. Тап по кресту закрывает шторку, как в Dialog, — допущение до
          решения (вариант — свернуть в Collapsed). Ночная полоска над листом на затемнении — решается на приёмке аудита.
        </p>
      </section>
    </div>
  );
}

const BOTTOM_SHEET_PREVIEW_STYLE = `
.bsx-page {
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
  .bsx-page { padding: var(--pf-spacing-20) var(--pf-spacing-16) var(--pf-spacing-40); }
}
.bsx-header { display: flex; flex-direction: column; align-items: flex-start; gap: var(--pf-spacing-8); }
.bsx-h1, .bsx-header p { margin: 0; }
.bsx-lead { max-width: 72ch; }
.bsx-muted { color: var(--pf-text-secondary); margin: 0; }
.bsx-layout { display: flex; flex-wrap: wrap; gap: var(--pf-spacing-24); align-items: flex-start; }
.bsx-controls {
  flex: 1 1 260px;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  gap: var(--pf-spacing-20);
  background: var(--pf-bg-surface-main);
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-l);
  padding: var(--pf-spacing-20);
}
.bsx-switch { border: 0; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: var(--pf-spacing-8); }
.bsx-switch legend { margin-bottom: var(--pf-spacing-8); padding: 0; }
.bsx-switch--column { flex-direction: column; }
.bsx-option {
  display: inline-flex;
  align-items: center;
  gap: var(--pf-spacing-8);
  padding: var(--pf-spacing-8) var(--pf-spacing-12);
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-m);
  background: var(--pf-bg-surface-main);
  color: var(--pf-text-primary);
  cursor: pointer;
  font: inherit;
  text-align: left;
}
.bsx-option:hover { border-color: var(--pf-line-hover); }
.bsx-option.is-active { background: var(--pf-bg-inverse-main); color: var(--pf-text-inverse); border-color: var(--pf-bg-inverse-main); }
.bsx-option input { position: absolute; opacity: 0; pointer-events: none; }
.bsx-option:focus-within, .bsx-option:focus-visible { outline: 2px solid var(--pf-line-focus); outline-offset: 2px; }
.bsx-facts { margin: 0; display: flex; flex-direction: column; gap: var(--pf-spacing-8); }
.bsx-facts div { display: flex; justify-content: space-between; gap: var(--pf-spacing-12); }
.bsx-facts dd { margin: 0; }
.bsx-stage { flex: 0 1 auto; max-width: 100%; overflow-x: auto; }
.bsx-notes { display: flex; flex-direction: column; gap: var(--pf-spacing-8); max-width: 80ch; }

.bsx-screen {
  position: relative;
  overflow: hidden;
  border-radius: 44px;
  box-shadow: 0 0 0 1px var(--pf-line-default);
  user-select: none;
  -webkit-user-select: none;
  font-family: 'SF Pro Text', -apple-system, system-ui, sans-serif;
}
.bsx-map { position: absolute; inset: 0; }
.bsx-map-tag { position: absolute; top: 56px; left: 16px; font: 500 11px/14px 'SF Pro Text', -apple-system, system-ui, sans-serif; text-transform: uppercase; letter-spacing: 0.04em; }
.bsx-dock { position: absolute; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; }
.bsx-tabbar { height: 64px; box-sizing: border-box; display: flex; backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); }
.bsx-tab { flex: 1 1 0; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 8px; gap: 2px; min-width: 0; }
.bsx-overlay { position: absolute; inset: 0; transition: opacity var(--bsx-ms) ease-in-out; }
.bsx-sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  touch-action: none;
  transition: top var(--bsx-ms) ease-in-out;
  cursor: grab;
}
.bsx-sheet.is-dragging { transition: none; cursor: grabbing; }
.bsx-sheet.is-dragging .bsx-sheet-bg { transition: none; }
.bsx-sheet-bg { position: absolute; left: 0; right: 0; bottom: 0; transition: top var(--bsx-ms) ease-in-out; }
.bsx-dragger {
  position: relative;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: inherit;
}
.bsx-dragger span { display: block; }
.bsx-dragger:focus-visible { outline: 2px solid var(--pf-line-focus); outline-offset: -2px; border-radius: 8px; }
.bsx-sheet-content { position: relative; flex: 1 1 auto; min-height: 0; overflow: hidden; display: flex; flex-direction: column; }
.bsx-search { display: flex; align-items: center; box-sizing: border-box; flex: 0 0 auto; }
.bsx-search-input, .bsx-row, .bsx-icon-button {
  border: 0;
  background: transparent;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: inherit;
  padding: 0;
}
.bsx-search-input { flex: 1 1 auto; display: flex; align-items: center; min-width: 0; }
.bsx-icon-button { display: flex; }
.bsx-row { display: flex; align-items: center; width: 100%; box-sizing: border-box; flex: 0 0 auto; }
.bsx-row-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.bsx-search-input:focus-visible, .bsx-row:focus-visible, .bsx-icon-button:focus-visible { outline: 2px solid var(--pf-line-focus); outline-offset: -2px; }
.bsx-icon { display: block; flex: 0 0 auto; width: 24px; height: 24px; -webkit-mask-size: 24px 24px; mask-size: 24px 24px; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; }
.bsx-close { position: absolute; z-index: 2; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border: 0; padding: 0; background: transparent; cursor: pointer; }
.bsx-close span { display: flex; }
.bsx-close:focus-visible { outline: 2px solid var(--pf-line-focus); outline-offset: -2px; border-radius: 50%; }
.bsx-home { position: relative; flex: 0 0 auto; }
.bsx-home span { position: absolute; left: 50%; bottom: 8px; width: 144px; height: 5px; border-radius: 5px; transform: translateX(-50%); }

@media (prefers-reduced-motion: reduce) {
  .bsx-sheet, .bsx-sheet-bg, .bsx-overlay { transition: none; }
}
`;
