/**
 * Данные превью Switch Rider (AID-94, designer-33, issue #596).
 *
 * Значения берутся из данных портала (`products/rider/*`) по именам токенов
 * из Figma (`.Switch · audit` 2313:104, Rider Components). Двух цветов в данных
 * портала пока нет — они лежат в `PORTAL_MISSING_COLORS` с источником в репо
 * и помечаются на странице. Литералы без токена — в `SWITCH_NO_TOKEN`.
 *
 * Хелперы токенов повторяют `spinnerPreviewData.ts` из PR #473 (ещё не в main);
 * после его мержа — свести в один модуль.
 */
import { semanticColorSections } from './products/rider/colorData';
import { riderRadiusTokens } from './products/rider/radiusData';
import { composeRiderBoxShadow, riderShadowStyles, type ShadowColorMode } from './products/rider/shadowData';
import { riderSpacingTokens } from './products/rider/spacingData';
import { riderTypographySections } from './products/rider/typographyData';

export type RiderMode = ShadowColorMode;

export type SwitchState = 'default' | 'pressed' | 'disabled' | 'loading';

export const SWITCH_STATES: readonly SwitchState[] = ['default', 'pressed', 'disabled', 'loading'];

function hexToRgba(hex: string, opacityPercent: number): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return opacityPercent >= 100 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${opacityPercent / 100})`;
}

/**
 * Цвета Switch, которых ещё нет в `products/rider/colorData.ts`. Значения — из
 * чейнжлогов в репо, не из головы:
 * - Background/Accent Pressed — `tokens/rider-colors-semantic-changelog.json` 1.12.0 (main);
 * - Background/Accent Tint — Rider Colors/Semantic 1.13.0/2.1.0, чейнжлог в открытых
 *   PR #570 и #589 (в main ещё нет).
 */
export const PORTAL_MISSING_COLORS: Record<string, { day: string; night: string; source: string }> = {
  'Background/Accent Pressed': {
    day: '#7521E0',
    night: '#753FE0',
    source: 'чейнжлог Rider Colors/Semantic 1.12.0',
  },
  'Background/Accent Tint': {
    day: '#F9EDFF',
    night: '#3C235B',
    source: 'чейнжлог Rider Colors/Semantic 2.1.0 (PR #570, #589 — не в main)',
  },
};

/** `riderColor('Background/Accent', 'night')` — цвет color-sem Rider. */
export function riderColor(token: string, mode: RiderMode): string {
  const missing = PORTAL_MISSING_COLORS[token];
  if (missing) {
    return hexToRgba(missing[mode], 100);
  }
  const slash = token.indexOf('/');
  const sectionTitle = token.slice(0, slash);
  const rowName = token.slice(slash + 1);
  const row = semanticColorSections.find((s) => s.title === sectionTitle)?.rows.find((r) => r.name === rowName);
  if (!row) {
    throw new Error(`Rider color token not found: ${token}`);
  }
  return hexToRgba(row[mode].hex, row[mode].opacity);
}

/** Значение токена в виде «#HEX · N %» для таблицы. */
export function riderColorLabel(token: string, mode: RiderMode): string {
  const missing = PORTAL_MISSING_COLORS[token];
  if (missing) {
    return missing[mode];
  }
  const slash = token.indexOf('/');
  const row = semanticColorSections
    .find((s) => s.title === token.slice(0, slash))
    ?.rows.find((r) => r.name === token.slice(slash + 1));
  if (!row) {
    throw new Error(`Rider color token not found: ${token}`);
  }
  const { hex, opacity } = row[mode];
  return opacity >= 100 ? hex : `${hex} · ${opacity} %`;
}

/** `riderSpace('space-20')` → `20px`. */
export function riderSpace(token: string): string {
  const item = riderSpacingTokens.find((t) => t.name === token);
  if (!item) {
    throw new Error(`Rider space token not found: ${token}`);
  }
  return `${item.valuePx}px`;
}

/** `riderRadius('radius-pill')` → `9999px`. */
export function riderRadius(token: string): string {
  const item = riderRadiusTokens.find((t) => t.name === token);
  if (!item) {
    throw new Error(`Rider radius token not found: ${token}`);
  }
  return item.borderTopRightRadius;
}

/** Тень Rider (effects · Shadows) по имени стиля: `Knob` — Level 1 и 2. */
export function riderShadow(name: string, mode: RiderMode): string {
  const item = riderShadowStyles.find((s) => s.name === name);
  if (!item) {
    throw new Error(`Rider shadow style not found: ${name}`);
  }
  return composeRiderBoxShadow(item, mode);
}

/** Текстовый стиль Rider (iOS) в виде CSS `font` + `letter-spacing`. */
export function riderType(name: string): { font: string; letterSpacing: string } {
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

/** Токены дорожки по Checked × State — как в Figma `.Switch · audit` 2313:104. */
export const SWITCH_TRACK: Record<SwitchState, { off: string; on: string }> = {
  default: { off: 'Background/Tertiary', on: 'Background/Accent' },
  pressed: { off: 'Background/Tertiary', on: 'Background/Accent Pressed' },
  disabled: { off: 'Background/Secondary', on: 'Background/Accent Tint' },
  loading: { off: 'Background/Secondary', on: 'Background/Accent Tint' },
};

export const SWITCH_KNOB_COLOR = 'Background/Constant White';
export const SWITCH_KNOB_SHADOW = 'Knob';
/** Spinner в бегунке Loading: Size 24, Tone Accent → Icon/Accent (Figma 2313:104). */
export const SWITCH_SPINNER_COLOR = 'Icon/Accent';

/** Размеры на токенах Rider Space / Radius. */
export const SWITCH_TOKENS = {
  paddingNear: 'space-2',
  paddingFar: 'space-20',
  radius: 'radius-pill',
} as const;

/** Значения без токена — показаны как в Figma и помечены на странице. */
export const SWITCH_NO_TOKEN = {
  width: 50,
  height: 32,
  /** PD 25.11 «Не нужен токен». */
  knob: 28,
  spinner: 24,
  /** Пробел токена motion; до нормы — 100 мс ease-out (ответ Standards 25.11). */
  durationMs: 100,
  easing: 'ease-out',
} as const;

/** Spinner — вариант «дуга» (AID-61): Duration/Loop 2000 и Duration/Loop Pulse 1500. */
export const SPINNER_TIMING = { spinMs: 2000, dashMs: 1500 } as const;
