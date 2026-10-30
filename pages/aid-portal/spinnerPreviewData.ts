/**
 * Данные превью Spinner (AID-61): значения Rider берутся из данных портала
 * (`products/rider/*`) по именам токенов из Figma — своих чисел здесь нет,
 * кроме мест, где в аудите Map Pin токена нет (помечены `noToken`).
 */
import { semanticColorSections } from './products/rider/colorData';
import { riderRadiusTokens } from './products/rider/radiusData';
import { composeRiderBoxShadow, riderShadowStyles, type ShadowColorMode } from './products/rider/shadowData';
import { riderSpacingTokens } from './products/rider/spacingData';
import { riderTypographySections } from './products/rider/typographyData';

export type RiderMode = ShadowColorMode;

function hexToRgba(hex: string, opacityPercent: number): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return opacityPercent >= 100 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${opacityPercent / 100})`;
}

/** `riderColor('Button/Primary', 'night')` — цвет color-sem Rider. */
export function riderColor(token: string, mode: RiderMode): string {
  const slash = token.indexOf('/');
  const sectionTitle = token.slice(0, slash);
  const rowName = token.slice(slash + 1);
  const row = semanticColorSections.find((s) => s.title === sectionTitle)?.rows.find((r) => r.name === rowName);
  if (!row) {
    throw new Error(`Rider color token not found: ${token}`);
  }
  return hexToRgba(row[mode].hex, row[mode].opacity);
}

/** `riderSpace('space-16')` → `16px`. */
export function riderSpace(token: string): string {
  const item = riderSpacingTokens.find((t) => t.name === token);
  if (!item) {
    throw new Error(`Rider space token not found: ${token}`);
  }
  return `${item.valuePx}px`;
}

/** `riderRadius('radius-16')` → `16px`. */
export function riderRadius(token: string): string {
  const item = riderRadiusTokens.find((t) => t.name === token);
  if (!item) {
    throw new Error(`Rider radius token not found: ${token}`);
  }
  return item.borderTopRightRadius;
}

/** Тень Rider (effects · Shadows) по имени стиля: `Small`, `Medium`. */
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

/** Длительности по умолчанию — кандидаты, не утверждены (анкета Standards). */
export const SPINNER_DEFAULTS = {
  v1Spin: 1200,
  v2Spin: 2000,
  v2Dash: 1500,
} as const;

/**
 * Кнопки в состоянии загрузки — аудит Button (Rider Components, пейдж
 * «👀 Button · audit», варианты `State=Loading · Spinner`).
 */
export const BUTTON_LOADING_VARIANTS = [
  { id: 'primary', label: 'Primary', node: '902:11622', bg: 'Button/Primary', spinner: 'Text/Constant White', overlay: false },
  { id: 'secondary', label: 'Secondary', node: '902:11720', bg: 'Button/Secondary', spinner: 'Text/Primary', overlay: false },
  { id: 'primary-overlay', label: 'Primary · Overlay', node: '902:11671', bg: 'Button/Constant White', spinner: 'Text/Constant Black', overlay: true },
  {
    id: 'secondary-overlay',
    label: 'Secondary · Overlay',
    node: '902:11769',
    bg: 'Button/Constant White Secondary',
    spinner: 'Text/Constant Black',
    overlay: true,
  },
] as const;

/** Значения аудита Map Pin без токена — показаны как в Figma. */
export const MAP_PIN_NO_TOKEN = {
  bubbleRadius: '18px',
  bubbleToPinGap: '-8px',
} as const;
