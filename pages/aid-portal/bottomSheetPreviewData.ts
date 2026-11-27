/**
 * Данные и логика веб-демо шторки Rider `BottomSheet` (AID-79, presentbook-11 = AID-91).
 * Источник вида — аудит Figma: Rider Components, пейдж «👀 Bottom Sheet · audit» 1093:353,
 * прототипы `.BottomSheet · audit` 1094:387 и `.Главная · audit` 1095:1067.
 *
 * Цвета, отступы, радиусы, тени и шрифты — из данных портала (`products/rider/*`) по именам
 * токенов Figma. Своих чисел здесь нет, кроме мест без токена — они собраны в `NO_TOKEN`.
 */
import { semanticColorSections } from './products/rider/colorData';
import { riderRadiusTokens } from './products/rider/radiusData';
import { composeRiderBoxShadow, riderShadowStyles, type ShadowColorMode } from './products/rider/shadowData';
import { riderSpacingTokens } from './products/rider/spacingData';
import { riderTypographySections } from './products/rider/typographyData';

export type SheetMode = ShadowColorMode;

function hexToRgba(hex: string, opacityPercent: number): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return opacityPercent >= 100 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${opacityPercent / 100})`;
}

/** `sheetColor('Background/Overlay', 'night')` — цвет color-sem Rider из данных портала. */
export function sheetColor(token: string, mode: SheetMode): string {
  const slash = token.indexOf('/');
  const row = semanticColorSections
    .find((s) => s.title === token.slice(0, slash))
    ?.rows.find((r) => r.name === token.slice(slash + 1));
  if (!row) {
    throw new Error(`Rider color token not found: ${token}`);
  }
  return hexToRgba(row[mode].hex, row[mode].opacity);
}

/** `sheetSpace('space-16')` → 16. */
export function sheetSpace(token: string): number {
  const item = riderSpacingTokens.find((t) => t.name === token);
  if (!item) {
    throw new Error(`Rider space token not found: ${token}`);
  }
  return item.valuePx;
}

/** `sheetRadius('radius-28')` → `28px`. */
export function sheetRadius(token: string): string {
  const item = riderRadiusTokens.find((t) => t.name === token);
  if (!item) {
    throw new Error(`Rider radius token not found: ${token}`);
  }
  return item.borderTopRightRadius;
}

/** Тень Rider (effects · Shadows) по имени стиля. */
export function sheetShadow(name: string, mode: SheetMode): string {
  const item = riderShadowStyles.find((s) => s.name === name);
  if (!item) {
    throw new Error(`Rider shadow style not found: ${name}`);
  }
  return composeRiderBoxShadow(item, mode);
}

/** Текстовый стиль Rider (iOS) — CSS `font` и `letter-spacing`. */
export function sheetType(name: string): { font: string; letterSpacing: string } {
  const style = riderTypographySections.flatMap((s) => s.items).find((i) => i.name === name);
  if (!style) {
    throw new Error(`Rider text style not found: ${name}`);
  }
  const v = style.ios;
  return {
    font: `${v.fontWeight} ${v.fontSize}px/${v.lineHeight}px '${v.fontFamily}', -apple-system, system-ui, sans-serif`,
    letterSpacing: `${v.letterSpacing}px`,
  };
}

/**
 * Токены полоски Dragger (sergej 23.11): заведены в Rider Tokens & Styles, color-sem
 * (VariableID 1857:207 / 1857:208), scope пустой, библиотека ещё не опубликована —
 * в данных портала их пока нет, значения взяты из Figma под именами токенов.
 */
export const PENDING_TOKENS = {
  /** Background/Handle — полоска поверх шторки (Collapsed, Default). */
  'Background/Handle': { day: 'rgba(0, 0, 57, 0.87)', night: 'rgb(74, 74, 89)' },
  /** Background/Handle On Overlay — полоска над шторкой на затемнении (Expanded, Full-Screen). */
  'Background/Handle On Overlay': { day: 'rgb(255, 255, 255)', night: 'rgb(106, 106, 128)' },
} as const;

/** Значения аудита без токена в данных портала — показаны как в Figma, с пометкой. */
export const NO_TOKEN = {
  /** Фон карты-заглушки (заливка инстанса Map в прототипе). */
  mapFill: { day: '#EEF0F2', night: '#1C1D22' },
  /**
   * Background/Tab Selected есть в Rider Tokens 1.12.0 (changelog color-sem), но ещё не в
   * таблице цветов портала: Day #D9D9D9 50 %, Night #FFFFFF 20 %.
   */
  tabSelected: { day: 'rgba(217, 217, 217, 0.5)', night: 'rgba(255, 255, 255, 0.2)' },
  /** Палочка Home Indicator iOS — системный элемент, 144×5, 8 от низа. */
  homeIndicator: { day: '#000000', night: '#FFFFFF' },
} as const;

/** Остановки шторки. В коде — detent, не px. */
export type Detent = 'collapsed' | 'default' | 'expanded' | 'full';

export const DETENTS: readonly Detent[] = ['collapsed', 'default', 'expanded', 'full'] as const;

export const DETENT_LABELS: Record<Detent, string> = {
  collapsed: 'Collapsed',
  default: 'Default',
  expanded: 'Expanded',
  full: 'Full-Screen',
};

/** Экран демо — iPhone 390×844; ширина переключается на 360. */
export const SCREEN_HEIGHT = 844;
export const SCREEN_WIDTHS = [390, 360] as const;

/**
 * Геометрия остановок по аудиту (`.Главная · audit`, 844 по высоте):
 * - Collapsed — по содержимому: полоска 12 + строка поиска 60 + Home Indicator 34 = 106;
 * - Default — ≈ ½ экрана: высота 434 из 844 (верх 410);
 * - Expanded — по содержимому, но верх не выше 186: карта видна полосой;
 * - Full-Screen — до статус-бара: полоска (12) заходит в зону статус-бара, лист с 44.
 */
export const DETENT_SPEC = {
  draggerHeight: 12,
  statusBarHeight: 44,
  defaultHeightRatio: 434 / 844,
  expandedMinTop: 186,
} as const;

/**
 * Верх шторки (px от верха экрана) для каждой остановки.
 * `collapsedHeight` и `contentHeight` — измеренная высота содержимого
 * (полоска + поиск + Home Indicator, и полное содержимое).
 */
export function detentTops(screenHeight: number, collapsedHeight: number, contentHeight: number): Record<Detent, number> {
  const full = DETENT_SPEC.statusBarHeight - DETENT_SPEC.draggerHeight;
  const def = Math.round(screenHeight - screenHeight * DETENT_SPEC.defaultHeightRatio);
  const collapsed = screenHeight - collapsedHeight;
  // Expanded — по содержимому, но не выше предела. Если содержимое ниже Default
  // (как в демо: поиск, три адреса, разделитель), шторка встаёт на предел — как в аудите (верх 186).
  const byContent = screenHeight - contentHeight;
  const expanded = byContent < def ? Math.max(DETENT_SPEC.expandedMinTop, byContent) : DETENT_SPEC.expandedMinTop;
  return { collapsed, default: def, expanded, full };
}

/** Через сколько мс «докатится» шторка по инерции при выборе остановки. */
export const VELOCITY_PROJECTION_MS = 180;

/**
 * Ближайшая остановка с учётом скорости: позицию проецируем вперёд по скорости
 * (px/мс, «+» — вниз) и берём ближайшую. Быстрый взмах не даёт вернуться в ту же остановку.
 */
export function pickDetent(top: number, velocity: number, tops: Record<Detent, number>, from: Detent): Detent {
  const projected = top + velocity * VELOCITY_PROJECTION_MS;
  let best: Detent = from;
  let bestDistance = Infinity;
  for (const d of DETENTS) {
    const distance = Math.abs(tops[d] - projected);
    if (distance < bestDistance) {
      best = d;
      bestDistance = distance;
    }
  }
  const FLICK = 0.5;
  if (best === from && Math.abs(velocity) > FLICK) {
    const idx = DETENTS.indexOf(from);
    const next = velocity < 0 ? DETENTS[idx + 1] : DETENTS[idx - 1];
    if (next) {
      return next;
    }
  }
  return best;
}

/**
 * Доля «развёрнутости» между Default и Expanded: 0 — затемнения нет, полоска внутри;
 * 1 — затемнение полное, полоска над листом.
 */
export function overlayProgress(top: number, tops: Record<Detent, number>): number {
  const span = tops.default - tops.expanded;
  if (span <= 0) {
    return top <= tops.expanded ? 1 : 0;
  }
  return Math.min(1, Math.max(0, (tops.default - top) / span));
}

/** Затемнение и полоска над листом — только в Expanded и Full-Screen. */
export function isRaised(detent: Detent): boolean {
  return detent === 'expanded' || detent === 'full';
}

/** Куда ведёт нажатие на полоску: снизу — развернуть, сверху — свернуть в Default. */
export function draggerTarget(detent: Detent): Detent {
  if (detent === 'collapsed') return 'default';
  if (detent === 'default') return 'expanded';
  return 'default';
}

export const DRAGGER_LABEL: Record<Detent, string> = {
  collapsed: 'Развернуть',
  default: 'Развернуть',
  expanded: 'Свернуть',
  full: 'Свернуть',
};

export const SHEET_ADDRESSES = [
  { title: 'Домой', subtitle: 'Комсомольский пр-т, 41' },
  { title: 'Белорусская', subtitle: 'площадь Тверская Застава, 7' },
  { title: 'Танцы', subtitle: 'пр. Сокольнического Круга, 2' },
] as const;

/** Табы DockTabBar (прототип `.Главная · audit`); иконки — Rider Icons в `public/icons/rider`. */
export const DOCK_TABS = [
  { label: 'Такси', icon: '/icons/rider/informative/taxi_fill.svg', selected: true },
  { label: 'Доставка', icon: '/icons/rider/informative/delivery_fill.svg', selected: false },
  { label: 'Драйв', icon: '/icons/rider/informative/wheel.svg', selected: false },
  { label: 'Скорая', icon: '/icons/rider/informative/medicine_case_fill.svg', selected: false },
] as const;

export const SHEET_ICONS = {
  passenger: '/icons/rider/addresses/passenger.svg',
  plus: '/icons/rider/controls/plus.svg',
  placeholder: '/icons/rider/actions/placeholder.svg',
  /** ic_delete — иконка `.ButtonClose`. */
  close: '/icons/rider/controls/delete.svg',
} as const;
