import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { loadTokens } from '../../tokens';

/**
 * ButtonText — Sutochno (legacy product).
 *
 * Структура (variant/size/slots/state) взята из Figma:
 * https://www.figma.com/design/nhV7WFYmRkDXterewworMX/...?node-id=132653-39061
 * Оформление (цвета) — не копия Figma-заливок, а привязка к уже существующим
 * legacy-токенам Sutochno (tokens/sutochno/legacy/legacy-tokens.json) по совпадению
 * HEX-значения. Space/radius-токенов у Sutochno нет — размеры взяты как raw px
 * прямо из Figma и помечены как ⚠️ ниже, до появления space- и radius-токенов.
 */

export type ButtonTextVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'tertiary'
  | 'primaryInverse'
  | 'primaryInverseStatic'
  | 'transparent';

export type ButtonTextSize = 'large' | 'medium' | 'small' | 'tiny';

export interface ButtonTextProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'disabled'> {
  /** Текстовый слот кнопки. */
  children?: ReactNode;
  variant?: ButtonTextVariant;
  size?: ButtonTextSize;
  /**
   * Ведущая иконка (leading slot). Недоступна при size="tiny" — в Figma
   * Tiny никогда не показывает iconLeft, только текст + обязательный chevron.
   */
  icon?: ReactNode;
  disabled?: boolean;
  /** Показывает loading-индикатор вместо текста/иконки и блокирует интеракцию. */
  loading?: boolean;
  /**
   * Демо-only оверрайд для документации/скриншотов (например Storybook «States»).
   * В реальном использовании pressed обрабатывается через :active, этот проп не нужен.
   */
  forceState?: 'pressed';
}

interface SizeConfig {
  minHeight: number;
  minWidth?: number;
  paddingX: number;
  paddingY: number;
  radius: number | 'pill';
  gap: number;
  iconSize?: number;
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
  letterSpacing: number;
  showLeadingIcon: boolean;
  showChevron: boolean;
}

// ⚠️ У Sutochno нет space-*/radius-* токенов — значения ниже это raw px из Figma,
// а не привязка к токену. Нужно добавить токены space-4/8/12/16/24, radius-12/16/pill.
const SIZE_CONFIG: Record<ButtonTextSize, SizeConfig> = {
  large: {
    minHeight: 52, paddingX: 24, paddingY: 16, radius: 16, gap: 8, iconSize: 20,
    fontSize: 16, lineHeight: 20, fontWeight: 500, letterSpacing: 0,
    showLeadingIcon: true, showChevron: false,
  },
  medium: {
    minHeight: 44, paddingX: 16, paddingY: 12, radius: 12, gap: 8, iconSize: 16,
    fontSize: 14, lineHeight: 16, fontWeight: 500, letterSpacing: 0,
    showLeadingIcon: true, showChevron: false,
  },
  small: {
    minHeight: 36, paddingX: 12, paddingY: 8, radius: 12, gap: 4, iconSize: 16,
    fontSize: 14, lineHeight: 16, fontWeight: 500, letterSpacing: 0,
    showLeadingIcon: true, showChevron: false,
  },
  tiny: {
    minHeight: 24, minWidth: 44, paddingX: 12, paddingY: 4, radius: 'pill', gap: 4,
    fontSize: 12, lineHeight: 16, fontWeight: 600, letterSpacing: 0.2,
    showLeadingIcon: false, showChevron: true,
  },
};

interface VariantColorSet {
  default: { bg?: string; text: string; border?: string };
  pressed: { bg?: string; text: string; border?: string };
  disabled: { bg?: string; text: string; border?: string };
  borderWidth: (size: ButtonTextSize) => number;
}

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
      console.warn(`[ButtonText] Sutochno legacy-токен «${name}» не найден в legacy-tokens.json`);
    }
    return '#FF00FF';
  }
  return argbToCss(token.value);
}

// Цвета сведены по совпадению HEX с tokens/sutochno/legacy/legacy-tokens.json.
// Pressed/Disabled для Outline и Tertiary не задокументированы отдельным Figma-инстансом
// (Figma-файл переиспользует компонент «ButtonText / Secondary / States» для колонки Outline) —
// применена аналогия с задокументированной парой Secondary/Transparent. Помечено ⚠️ в JSDoc выше.
const VARIANT_COLORS: Record<ButtonTextVariant, VariantColorSet> = {
  primary: {
    default: { bg: legacyColor('main/primary'), text: legacyColor('main/basic') },
    pressed: { bg: legacyColor('gray/07'), text: legacyColor('main/basic') },
    disabled: { bg: legacyColor('gray/03'), text: legacyColor('gray/05') },
    borderWidth: () => 0,
  },
  secondary: {
    default: { border: legacyColor('main/primary'), text: legacyColor('main/primary') },
    pressed: { border: legacyColor('gray/06'), text: legacyColor('gray/07') },
    disabled: { border: legacyColor('gray/03'), text: legacyColor('gray/04') },
    borderWidth: (size) => (size === 'tiny' ? 1.4 : 2),
  },
  // ⚠️ Pressed/disabled — по аналогии с Secondary (см. комментарий выше), не из отдельного Figma-стейта.
  outline: {
    default: { border: legacyColor('gray/03'), text: legacyColor('main/primary') },
    pressed: { border: legacyColor('gray/06'), text: legacyColor('gray/07') },
    disabled: { border: legacyColor('gray/03'), text: legacyColor('gray/04') },
    borderWidth: () => 1,
  },
  // ⚠️ Pressed/disabled — по аналогии с Transparent (не из отдельного Figma-стейта).
  tertiary: {
    default: { bg: legacyColor('gray/02'), text: legacyColor('main/primary') },
    pressed: { bg: legacyColor('gray/02'), text: legacyColor('gray/07') },
    disabled: { bg: legacyColor('gray/03'), text: legacyColor('gray/04') },
    borderWidth: () => 0,
  },
  primaryInverse: {
    default: { bg: legacyColor('main/basic'), text: legacyColor('main/primary') },
    pressed: { bg: legacyColor('main/basic'), text: legacyColor('gray/07') },
    disabled: { bg: legacyColor('gray/03'), text: legacyColor('gray/05') },
    borderWidth: () => 0,
  },
  // ⚠️ Pressed — по аналогии с primaryInverse, "fixed"-эквивалента gray/03 и gray/05 в legacy-tokens.json нет.
  primaryInverseStatic: {
    default: { bg: legacyColor('fixed/main/-basic'), text: legacyColor('fixed/main/-primary') },
    pressed: { bg: legacyColor('fixed/main/-basic'), text: legacyColor('fixed/gray/07') },
    disabled: { bg: legacyColor('gray/03'), text: legacyColor('gray/05') },
    borderWidth: () => 0,
  },
  transparent: {
    default: { text: legacyColor('main/primary') },
    pressed: { text: legacyColor('gray/07') },
    disabled: { text: legacyColor('gray/04') },
    borderWidth: () => 0,
  },
};

const BUTTON_TEXT_STYLE = `
.sbt {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  font-family: Inter, system-ui, sans-serif;
  white-space: nowrap;
  cursor: pointer;
  background: var(--sbt-bg, transparent);
  color: var(--sbt-text);
  border: var(--sbt-border-width, 0px) solid var(--sbt-border, transparent);
}
.sbt:not(:disabled):hover { filter: brightness(0.97); }
.sbt:not(:disabled):active,
.sbt--force-pressed {
  background: var(--sbt-bg-pressed, var(--sbt-bg, transparent));
  color: var(--sbt-text-pressed, var(--sbt-text));
  border-color: var(--sbt-border-pressed, var(--sbt-border, transparent));
  filter: none;
}
.sbt:disabled {
  cursor: not-allowed;
  background: var(--sbt-bg-disabled, var(--sbt-bg, transparent));
  color: var(--sbt-text-disabled, var(--sbt-text));
  border-color: var(--sbt-border-disabled, var(--sbt-border, transparent));
}
.sbt__icon { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sbt__icon svg { display: block; width: 100%; height: 100%; }
.sbt__text { overflow: hidden; text-overflow: ellipsis; }
.sbt__chevron { display: inline-flex; align-items: center; flex-shrink: 0; }
.sbt__dots { display: inline-flex; align-items: center; gap: 4px; }
.sbt__dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: sbt-blink 1s infinite ease-in-out;
}
.sbt__dots span:nth-child(2) { animation-delay: 0.15s; }
.sbt__dots span:nth-child(3) { animation-delay: 0.3s; }
@keyframes sbt-blink { 0%, 80%, 100% { opacity: 0.25; } 40% { opacity: 1; } }
`;

function Chevron() {
  return (
    <svg className="sbt__chevron" width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden="true">
      <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ButtonText({
  children = 'Button',
  variant = 'primary',
  size = 'large',
  icon,
  disabled = false,
  loading = false,
  forceState,
  className,
  style,
  ...rest
}: ButtonTextProps) {
  const config = SIZE_CONFIG[size];
  const colors = VARIANT_COLORS[variant];
  const borderWidth = colors.borderWidth(size);
  const showLeadingIcon = config.showLeadingIcon && Boolean(icon) && !loading;

  const cssVars: Record<string, string> = {
    '--sbt-text': colors.default.text,
    '--sbt-text-pressed': colors.pressed.text,
    '--sbt-text-disabled': colors.disabled.text,
    '--sbt-border-width': `${borderWidth}px`,
  };
  if (colors.default.bg) cssVars['--sbt-bg'] = colors.default.bg;
  if (colors.pressed.bg) cssVars['--sbt-bg-pressed'] = colors.pressed.bg;
  if (colors.disabled.bg) cssVars['--sbt-bg-disabled'] = colors.disabled.bg;
  if (colors.default.border) cssVars['--sbt-border'] = colors.default.border;
  if (colors.pressed.border) cssVars['--sbt-border-pressed'] = colors.pressed.border;
  if (colors.disabled.border) cssVars['--sbt-border-disabled'] = colors.disabled.border;

  const mergedStyle: CSSProperties = {
    ...cssVars,
    minHeight: config.minHeight,
    minWidth: config.minWidth,
    paddingInline: config.paddingX,
    paddingBlock: config.paddingY,
    borderRadius: config.radius === 'pill' ? 9999 : config.radius,
    gap: config.gap,
    fontSize: config.fontSize,
    lineHeight: `${config.lineHeight}px`,
    fontWeight: config.fontWeight,
    letterSpacing: config.letterSpacing,
    ...style,
  } as CSSProperties;

  const classNames = ['sbt', `sbt--${variant}`, `sbt--${size}`, forceState === 'pressed' ? 'sbt--force-pressed' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <style>{BUTTON_TEXT_STYLE}</style>
      <button
        type="button"
        className={classNames}
        style={mergedStyle}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading ? (
          <span className="sbt__dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        ) : (
          <>
            {showLeadingIcon && (
              <span className="sbt__icon" style={{ width: config.iconSize, height: config.iconSize }}>
                {icon}
              </span>
            )}
            <span className="sbt__text">{children}</span>
            {config.showChevron && <Chevron />}
          </>
        )}
      </button>
    </>
  );
}

/** Служебный экспорт для документации/QA — какие legacy-токены реально используются. */
export const BUTTON_TEXT_TOKEN_MAP = {
  'main/primary': 'фон Primary; текст Secondary/Outline/Tertiary/Transparent/PrimaryInverse',
  'main/basic': 'текст Primary; фон PrimaryInverse',
  'gray/02': 'фон Tertiary',
  'gray/03': 'бордер Outline; фон Disabled (filled-варианты)',
  'gray/04': 'текст Disabled (border/ghost-варианты)',
  'gray/05': 'текст Disabled (filled-варианты)',
  'gray/06': 'бордер Pressed (border-варианты)',
  'gray/07': 'фон Pressed (Primary); текст Pressed (border/ghost-варианты)',
  'fixed/main/-basic': 'фон PrimaryInverseStatic',
  'fixed/main/-primary': 'текст PrimaryInverseStatic',
  'fixed/gray/07': 'текст Pressed (PrimaryInverseStatic)',
} as const;

export const BUTTON_TEXT_VARIANTS: ButtonTextVariant[] = [
  'primary', 'secondary', 'outline', 'tertiary', 'primaryInverse', 'primaryInverseStatic', 'transparent',
];

export const BUTTON_TEXT_SIZES: ButtonTextSize[] = ['large', 'medium', 'small', 'tiny'];
