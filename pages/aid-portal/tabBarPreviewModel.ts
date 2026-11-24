/**
 * Превью TabBar Rider (presentbook-10, AID-89) — модель без DOM.
 *
 * Геометрия капсулы и таба — гайд TabBar (Rider Components, пейдж 389:47,
 * мастер 599:2814, .Tab 599:2798). Анимация «перетекание» подложки выбранного
 * таба (блок 5 гайда, 678:4156): растяжение на старый и новый таб с
 * расширением по высоте → пружина на новый таб. Значения анимации — параметры
 * подбора для дизайнера, а не токены.
 */
import { semanticColorSections } from './products/rider/colorData';
import { riderGlassStyles } from './products/rider/glassData';
import { riderRadiusTokens } from './products/rider/radiusData';
import { riderSpacingTokens } from './products/rider/spacingData';
import { riderTypographySections } from './products/rider/typographyData';

export type TabBarTheme = 'day' | 'night';
export const TAB_BAR_THEMES: TabBarTheme[] = ['day', 'night'];

export type StretchEasing = 'ease-in-out' | 'ease-out' | 'linear';
export const STRETCH_EASINGS: StretchEasing[] = ['ease-in-out', 'ease-out', 'linear'];

export interface TabBarMotion {
  /** Фаза 1 · растяжение, мс. */
  stretchMs: number;
  stretchEasing: StretchEasing;
  /** Расширение подложки по высоте на фазе растяжения, px сверху и снизу. */
  growPx: number;
  /** Фаза 2 · пружина. */
  mass: number;
  stiffness: number;
  damping: number;
  /** Число табов. */
  tabs: 3 | 4;
}

/** Как в гайде TabBar, блок 5: Smart Animate 140 мс ease-in-out, пружина 1 / 420 / 24, +2. */
export const GUIDE_MOTION: TabBarMotion = {
  stretchMs: 140,
  stretchEasing: 'ease-in-out',
  growPx: 2,
  mass: 1,
  stiffness: 420,
  damping: 24,
  tabs: 4,
};

/**
 * Умолчания страницы — быстрее гайда (Валентина Волчёнкова, 30.10: «надо только
 * сделать анимацию перехода фона выбранного таба быстрее»). Кандидаты, не решение.
 */
export const DEFAULT_MOTION: TabBarMotion = {
  stretchMs: 100,
  stretchEasing: 'ease-in-out',
  growPx: 2,
  mass: 1,
  stiffness: 700,
  damping: 40,
  tabs: 4,
};

export interface MotionKnob {
  key: 'stretchMs' | 'growPx' | 'mass' | 'stiffness' | 'damping';
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

export const MOTION_KNOBS: MotionKnob[] = [
  { key: 'stretchMs', label: 'Растяжение · длительность', min: 0, max: 400, step: 10, unit: ' мс' },
  { key: 'growPx', label: 'Расширение по высоте', min: 0, max: 4, step: 1, unit: ' px' },
  { key: 'stiffness', label: 'Пружина · stiffness', min: 100, max: 1200, step: 10, unit: '' },
  { key: 'damping', label: 'Пружина · damping', min: 5, max: 80, step: 1, unit: '' },
  { key: 'mass', label: 'Пружина · mass', min: 0.5, max: 3, step: 0.1, unit: '' },
];

// ── Токены Rider из данных портала ─────────────────────────────────────────

function hexToRgba(hex: string, opacityPercent: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const rgb = `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  return opacityPercent >= 100 ? `rgb(${rgb})` : `rgba(${rgb}, ${opacityPercent / 100})`;
}

/** `riderColor('Background/Navbar', 'night')` — цвет color-sem Rider из данных портала. */
export function riderColor(token: string, theme: TabBarTheme): string {
  const [section, name] = token.split('/');
  const row = semanticColorSections.find((s) => s.title === section)?.rows.find((r) => r.name === name);
  if (!row) throw new Error(`Rider color token not found: ${token}`);
  return hexToRgba(row[theme].hex, row[theme].opacity);
}

export function riderSpace(token: string): number {
  const item = riderSpacingTokens.find((t) => t.name === token);
  if (!item) throw new Error(`Rider space token not found: ${token}`);
  return item.valuePx;
}

export function riderRadius(token: string): string {
  const item = riderRadiusTokens.find((t) => t.name === token);
  if (!item) throw new Error(`Rider radius token not found: ${token}`);
  return item.borderTopRightRadius;
}

/** Caption 2 (iOS: SF Pro Text Medium 11/14) — в вебе системный стек. */
export function caption2(): { font: string; letterSpacing: string } {
  const style = riderTypographySections.flatMap((s) => s.items).find((i) => i.name === 'Caption 2');
  if (!style) throw new Error('Rider text style not found: Caption 2');
  const v = style.ios;
  return {
    font: `${v.fontWeight} ${v.fontSize}px/${v.lineHeight}px -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif`,
    letterSpacing: `${v.letterSpacing}px`,
  };
}

/**
 * Glass/Navbar в вебе — приближение: размытие фона и внешние тени стиля
 * (Drop Shadow 1 — мягкая тень, Drop Shadow 2 — тонкий кант). Преломление,
 * дисперсия и внутренние тени Figma GLASS в CSS не повторяются.
 */
export function navbarGlassShadow(): string {
  const style = riderGlassStyles.find((s) => s.id === 'navbar');
  if (!style) throw new Error('Rider glass style not found: navbar');
  const parts: string[] = [];
  for (const id of ['drop-shadow-1', 'drop-shadow-2']) {
    const group = style.groups.find((g) => g.id === id);
    if (!group) continue;
    const v = (p: string) => group.parameters.find((x) => x.id === p)?.day ?? '0';
    parts.push(`${v('offset-x')}px ${v('offset-y')}px ${v('blur')}px ${v('spread')}px ${v('color')}`);
  }
  return parts.join(', ');
}

/** Размытие фона для Glass/Navbar (Figma GLASS frost 50) — подобрано на глаз. */
export const GLASS_BLUR_PX = 25;

/**
 * Background/Tab Selected — в данных портала (color-sem Rider) этой строки нет,
 * значения из гайда TabBar. Днём наложение Plus darker, ночью — обычное.
 */
export const TAB_SELECTED = {
  day: { color: 'rgba(217, 217, 217, 0.5)', blend: 'plus-darker' as const },
  night: { color: 'rgba(255, 255, 255, 0.2)', blend: 'normal' as const },
};

/** Без токена: Home Indicator iOS (системный элемент), экран 390. */
export const NO_TOKEN = {
  screenWidth: 390,
  homeIndicatorZone: 34,
  homeIndicator: { width: 134, height: 5, bottom: 8 },
  dockSide: 16,
} as const;

// ── Геометрия ──────────────────────────────────────────────────────────────

export const CAPSULE = { width: 358, height: 64 } as const;
export const TAB = { iconSize: 24, padY: 8, padX: 12, gap: 2 } as const;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Отступ капсулы (space-4) и gap между табами (4). */
export function capsuleInset(): number {
  return riderSpace('space-4');
}

export function tabWidth(tabs: number, width: number = CAPSULE.width): number {
  const inset = capsuleInset();
  return (width - inset * 2 - inset * (tabs - 1)) / tabs;
}

/** Подложка в покое на табе `index`: отступ 4 от края капсулы, высота 56. */
export function restRect(index: number, tabs: number, width: number = CAPSULE.width): Rect {
  const inset = capsuleInset();
  const w = tabWidth(tabs, width);
  return { x: inset + index * (w + inset), y: inset, w, h: CAPSULE.height - inset * 2 };
}

/** Подложка на фазе растяжения: охватывает `from` и таб `to`, выше на `grow` сверху и снизу. */
export function stretchedRect(from: Rect, to: Rect, grow: number): Rect {
  const left = Math.min(from.x, to.x);
  const right = Math.max(from.x + from.w, to.x + to.w);
  const inset = capsuleInset();
  const h = CAPSULE.height - inset * 2 + grow * 2;
  return { x: left, y: (CAPSULE.height - h) / 2, w: right - left, h };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpRect(a: Rect, b: Rect, t: number): Rect {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) };
}

// ── Кривые ────────────────────────────────────────────────────────────────

const BEZIER: Record<StretchEasing, [number, number, number, number]> = {
  'ease-in-out': [0.42, 0, 0.58, 1],
  'ease-out': [0, 0, 0.58, 1],
  linear: [0, 0, 1, 1],
};

export function easingCss(e: StretchEasing): string {
  const [a, b, c, d] = BEZIER[e];
  return e === 'linear' ? 'linear' : `cubic-bezier(${a}, ${b}, ${c}, ${d})`;
}

/** Значение кубической кривой Безье (как CSS cubic-bezier) в момент `t` ∈ [0, 1]. */
export function ease(e: StretchEasing, t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const [x1, y1, x2, y2] = BEZIER[e];
  if (x1 === y1 && x2 === y2) return t;
  const bx = (s: number) => 3 * (1 - s) * (1 - s) * s * x1 + 3 * (1 - s) * s * s * x2 + s * s * s;
  const by = (s: number) => 3 * (1 - s) * (1 - s) * s * y1 + 3 * (1 - s) * s * s * y2 + s * s * s;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i += 1) {
    const mid = (lo + hi) / 2;
    if (bx(mid) < t) lo = mid;
    else hi = mid;
  }
  return by((lo + hi) / 2);
}

/**
 * Пружина от 0 к 1 без начальной скорости: доля пути в момент `tMs`.
 * Может выходить за 1 — это перелёт пружины.
 */
export function springProgress(tMs: number, m: Pick<TabBarMotion, 'mass' | 'stiffness' | 'damping'>): number {
  if (tMs <= 0) return 0;
  const t = tMs / 1000;
  const w0 = Math.sqrt(m.stiffness / m.mass);
  const zeta = m.damping / (2 * Math.sqrt(m.stiffness * m.mass));
  const x0 = -1;
  let x: number;
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    x = Math.exp(-zeta * w0 * t) * (x0 * Math.cos(wd * t) + ((zeta * w0 * x0) / wd) * Math.sin(wd * t));
  } else if (zeta === 1) {
    x = Math.exp(-w0 * t) * (x0 + w0 * x0 * t);
  } else {
    const s = Math.sqrt(zeta * zeta - 1);
    const r1 = -w0 * (zeta - s);
    const r2 = -w0 * (zeta + s);
    const a = (-r2 * x0) / (r1 - r2);
    x = a * Math.exp(r1 * t) + (x0 - a) * Math.exp(r2 * t);
  }
  return 1 + x;
}

/** Время, после которого пружина держится в пределах `eps` от цели (доля пути), мс. */
export function springSettleMs(m: Pick<TabBarMotion, 'mass' | 'stiffness' | 'damping'>, eps = 0.005): number {
  let lastOut = 0;
  for (let t = 0; t <= 5000; t += 1) {
    if (Math.abs(1 - springProgress(t, m)) >= eps) lastOut = t;
  }
  return lastOut + 1;
}

/** Наибольший перелёт пружины, доля пути (0 — без перелёта). */
export function springOvershoot(m: Pick<TabBarMotion, 'mass' | 'stiffness' | 'damping'>): number {
  let max = 0;
  for (let t = 0; t <= 2000; t += 1) max = Math.max(max, springProgress(t, m) - 1);
  return max;
}

/** Полное время перетекания: растяжение + пружина до успокоения, мс. */
export function totalMs(m: TabBarMotion): number {
  return m.stretchMs + springSettleMs(m);
}

export type Phase = 'stretch' | 'spring' | 'rest';

/**
 * Кадр подложки через `tMs` после нажатия: из `from` (там, где подложка была
 * в момент нажатия, — допускается прерванная анимация) на таб `toIndex`.
 */
export function pillFrame(
  tMs: number,
  from: Rect,
  toIndex: number,
  m: TabBarMotion,
  settleMs: number = springSettleMs(m),
): { rect: Rect; phase: Phase } {
  const to = restRect(toIndex, m.tabs);
  const stretched = stretchedRect(from, to, m.growPx);
  if (tMs < m.stretchMs) {
    return { rect: lerpRect(from, stretched, ease(m.stretchEasing, tMs / m.stretchMs)), phase: 'stretch' };
  }
  const springT = tMs - m.stretchMs;
  if (springT >= settleMs) return { rect: to, phase: 'rest' };
  return { rect: lerpRect(stretched, to, springProgress(springT, m)), phase: 'spring' };
}

// ── Передача и хранение ───────────────────────────────────────────────────

export function motionExport(m: TabBarMotion) {
  return {
    component: 'TabBar (Rider)',
    stretch: { durationMs: m.stretchMs, easing: m.stretchEasing, cssEasing: easingCss(m.stretchEasing), heightGrowPx: m.growPx },
    spring: { mass: m.mass, stiffness: m.stiffness, damping: m.damping, settleMs: springSettleMs(m) },
    totalMs: totalMs(m),
    tabs: m.tabs,
    guide: {
      stretch: { durationMs: GUIDE_MOTION.stretchMs, easing: GUIDE_MOTION.stretchEasing, heightGrowPx: GUIDE_MOTION.growPx },
      spring: { mass: GUIDE_MOTION.mass, stiffness: GUIDE_MOTION.stiffness, damping: GUIDE_MOTION.damping },
      totalMs: totalMs(GUIDE_MOTION),
    },
  };
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

/** Сохранённое в браузере — только если форма цела; числа обрезаются до границ бегунков. */
export function parseStoredMotion(raw: string | null): TabBarMotion | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<TabBarMotion> | null;
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const result: TabBarMotion = { ...DEFAULT_MOTION };
    for (const knob of MOTION_KNOBS) {
      result[knob.key] = clamp(value[knob.key], knob.min, knob.max, result[knob.key]);
    }
    if (STRETCH_EASINGS.includes(value.stretchEasing as StretchEasing)) result.stretchEasing = value.stretchEasing as StretchEasing;
    if (value.tabs === 3 || value.tabs === 4) result.tabs = value.tabs;
    return result;
  } catch {
    return null;
  }
}

/** Табы демо-набора (599:2914) и иконки Rider Icons (`public/icons/rider/informative`). */
export const DEMO_TABS = [
  { id: 'taxi', label: 'Такси', icon: 'ic_taxi_fill', file: '/icons/rider/informative/taxi_fill.svg' },
  { id: 'delivery', label: 'Доставка', icon: 'ic_delivery_fill', file: '/icons/rider/informative/delivery_fill.svg' },
  { id: 'drive', label: 'Драйв', icon: 'ic_wheel', file: '/icons/rider/informative/wheel.svg' },
  { id: 'medicine', label: 'Скорая', icon: 'ic_medicine_case_fill', file: '/icons/rider/informative/medicine_case_fill.svg' },
] as const;
