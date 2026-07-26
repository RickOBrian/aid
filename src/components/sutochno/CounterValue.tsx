import type { CSSProperties, ReactNode } from 'react';
import { loadTokens } from '../../tokens';

/**
 * CounterValue — Sutochno (legacy product).
 *
 * Пилюля-счётчик (например, количество непрочитанных уведомлений).
 * Источник: Figma
 * https://www.figma.com/design/nhV7WFYmRkDXterewworMX/...?node-id=134151-270
 *
 * Оформление (цвет фона/текста) — не копия Figma-заливок, а привязка к уже
 * существующим legacy-токенам Sutochno (tokens/sutochno/legacy/legacy-tokens.json)
 * по совпадению HEX-значения.
 *
 * ⚠️ Типографика в Figma-узле ссылается на «Stable/Label/label-s-strong» и
 * «label-xs-strong» — токенов с такими именами нет ни в legacy-типографике
 * Sutochno (skills/_shared/…/typography-styles.json), ни в её semantic-слое.
 * Размер/lineHeight/weight ниже взяты как raw px из Figma-фоллбэков, а не из
 * токена. Нужно завести semantic-типографику label-s-strong/label-xs-strong
 * (или сопоставить существующий Sutochno-стиль) прежде чем убирать эту пометку.
 * ⚠️ У Sutochno нет space- и radius-токенов — паддинги и radius тоже raw px
 * (см. аналогичную пометку в ButtonText.tsx).
 */

export type CounterValueSize = 'medium' | 'small';

export interface CounterValueProps {
  /** Значение счётчика. */
  value?: ReactNode | number;
  /**
   * Верхняя граница отображаемого числа — при превышении показывается `${max}+`.
   * Игнорируется, если `value` не число (например, кастомный ReactNode).
   * Не часть исходного Figma-узла (там задан только кейс "1"), добавлено как
   * практичное расширение для реального использования счётчика уведомлений.
   */
  max?: number;
  size?: CounterValueSize;
  className?: string;
  style?: CSSProperties;
}

interface SizeConfig {
  minSize: number;
  paddingX: number;
  paddingY: number;
  fontSize: number;
  lineHeight: number;
}

const SIZE_CONFIG: Record<CounterValueSize, SizeConfig> = {
  medium: { minSize: 20, paddingX: 6, paddingY: 4, fontSize: 12, lineHeight: 12 },
  small: { minSize: 16, paddingX: 4, paddingY: 2, fontSize: 10, lineHeight: 12 },
};

const SUTOCHNO_TOKENS = loadTokens('sutochno').byName;

/** Legacy-токены Sutochno хранят HEX в формате AARRGGBB (альфа первой), не CSS RRGGBBAA. */
function argbToCss(value: string): string {
  const hex = value.replace('#', '');
  if (hex.length === 8) {
    const alpha = hex.slice(0, 2);
    const rgb = hex.slice(2);
    return `#${rgb}${alpha}`;
  }
  return value.startsWith('#') ? value : `#${value}`;
}

function legacyColor(name: string): string {
  const token = SUTOCHNO_TOKENS[name];
  if (!token) {
    if (typeof console !== 'undefined') {
      console.warn(`[CounterValue] Sutochno legacy-токен «${name}» не найден в legacy-tokens.json`);
    }
    return '#FF00FF';
  }
  return argbToCss(token.value);
}

// Цвета сведены по совпадению HEX с tokens/sutochno/legacy/legacy-tokens.json:
// фон — semantic/brand-element (#EE204D), текст — fixed/main/-basic (белый).
const BACKGROUND_COLOR = legacyColor('semantic/brand-element');
const TEXT_COLOR = legacyColor('fixed/main/-basic');

function formatValue(value: ReactNode | number | undefined, max: number | undefined): ReactNode {
  if (typeof value === 'number' && typeof max === 'number' && value > max) {
    return `${max}+`;
  }
  return value ?? 1;
}

export function CounterValue({ value = 1, max, size = 'medium', className, style }: CounterValueProps) {
  const config = SIZE_CONFIG[size];

  const mergedStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    minWidth: config.minSize,
    minHeight: config.minSize,
    paddingInline: config.paddingX,
    paddingBlock: config.paddingY,
    borderRadius: 9999,
    background: BACKGROUND_COLOR,
    color: TEXT_COLOR,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: config.fontSize,
    lineHeight: `${config.lineHeight}px`,
    fontWeight: 600,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    ...style,
  };

  const classNames = ['scv', `scv--${size}`, className].filter(Boolean).join(' ');

  return (
    <div className={classNames} style={mergedStyle}>
      {formatValue(value, max)}
    </div>
  );
}

export const COUNTER_VALUE_SIZES: CounterValueSize[] = ['medium', 'small'];
