/**
 * Semantic Driver color tokens for the BadgeCount component.
 * Source of truth: `pages/aid-portal/data.ts` (Fields, Texts sections).
 * Day → light mode (`row.day`), Night → dark mode (`row.night`) —
 * see `products/driver/product.json` → `colorModeMapping`.
 *
 * Both tokens used here are "light ind" / theme-independent rows — day and
 * night resolve to the same value (see
 * `skills/_shared/protocols/gates/token-integrity.md` §7 Driver color
 * mode resolution: "light ind"/"dark ind" are semantic color roles, not
 * theme labels). No raw hex is authored here: every value is read from the
 * canonical token rows.
 */
import { semanticColorSections, type ColorModeValue } from '../data';
import { radius, shadow, spacing, typographyCss } from './productTokens';

function toCssColor({ hex, opacity }: ColorModeValue): string {
  if (opacity >= 100) {
    return hex;
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
}

function findSection(title: string) {
  const section = semanticColorSections.find((candidate) => candidate.title === title);
  if (!section) {
    throw new Error(`Driver color tokens: section "${title}" not found in data.ts`);
  }
  return section;
}

function findRow(sectionTitle: string, rowName: string) {
  const row = findSection(sectionTitle).rows.find((candidate) => candidate.name === rowName);
  if (!row) {
    throw new Error(`Driver color tokens: "${sectionTitle} · ${rowName}" row not found in data.ts`);
  }
  return row;
}

const backgroundRow = findRow('Fields', 'Warning');
const textRow = findRow('Texts', 'Primary light ind');

export interface BadgeCountColorVars {
  '--ds-badge-count-bg': string;
  '--ds-badge-count-text': string;
}

export interface BadgeCountTokenSource {
  name: string;
  cssVar: keyof BadgeCountColorVars;
  day: ColorModeValue;
  night: ColorModeValue;
}

export const badgeCountTokenSources: BadgeCountTokenSource[] = [
  {
    name: 'Fields · Warning',
    cssVar: '--ds-badge-count-bg',
    day: backgroundRow.day,
    night: backgroundRow.night,
  },
  {
    name: 'Texts · Primary light ind',
    cssVar: '--ds-badge-count-text',
    day: textRow.day,
    night: textRow.night,
  },
];

export const badgeCountColorVars: { day: BadgeCountColorVars; night: BadgeCountColorVars } = {
  day: {
    '--ds-badge-count-bg': toCssColor(backgroundRow.day),
    '--ds-badge-count-text': toCssColor(textRow.day),
  },
  night: {
    '--ds-badge-count-bg': toCssColor(backgroundRow.night),
    '--ds-badge-count-text': toCssColor(textRow.night),
  },
};

function cssVarBlock(vars: BadgeCountColorVars): string {
  return Object.entries(vars)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');
}

/**
 * Scoped (non-global) CSS custom properties for `.ds-badge-count-root`.
 * Day values are the default; `[data-theme="night"]` overrides them —
 * matches the ambient theming convention from `skills/_shared/standards/platforms.md`.
 * Both blocks resolve to the same colors here (theme-independent tokens).
 */
/**
 * Непветовые токены компонента: радиус, отступы, тень и типографика.
 * Читаются из данных продукта теми же правилами, что и цвет — имя не найдено,
 * сборка падает. До 2026-09-21 эти значения писались в CSS литералами, тогда
 * как анатомия объявляла их semantic-токенами (аудит, находка №1).
 */
export const badgeCountShapeVars = {
  '--ds-badge-count-radius': radius('radius-12'),
  '--ds-badge-count-pad-v': spacing('space-2'),
  '--ds-badge-count-pad-h': spacing('space-6'),
  '--ds-badge-count-shadow': shadow('shadow-1'),
} as const;

/** Объявления типографики роли `subtitle-2` — подставляются в правило текста. */
export const BADGE_COUNT_TYPOGRAPHY_CSS = typographyCss('subtitle-2');

export const BADGE_COUNT_TOKEN_STYLE = `
.ds-badge-count-root {
${Object.entries(badgeCountShapeVars).map(([n, v]) => `  ${n}: ${v};`).join('\n')}
${cssVarBlock(badgeCountColorVars.day)}
}
[data-theme="night"] .ds-badge-count-root {
${cssVarBlock(badgeCountColorVars.night)}
}
`;
