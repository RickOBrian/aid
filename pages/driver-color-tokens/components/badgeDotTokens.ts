/**
 * Semantic Driver color tokens for the BadgeDot component.
 * Source of truth: `pages/driver-color-tokens/data.ts` (Icons section).
 * Day → light mode (`row.day`), Night → dark mode (`row.night`) —
 * see `products/driver/product.json` → `colorModeMapping`.
 *
 * Figma variable `Icons/Warning` maps to `Icons · Warning` — theme-independent
 * (#D62347 in Day and Night). No raw hex is authored here.
 */
import { semanticColorSections, type ColorModeValue } from '../data';

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

const backgroundRow = findRow('Icons', 'Warning');

export interface BadgeDotColorVars {
  '--ds-badge-dot-bg': string;
}

export interface BadgeDotTokenSource {
  name: string;
  cssVar: keyof BadgeDotColorVars;
  day: ColorModeValue;
  night: ColorModeValue;
}

export const badgeDotTokenSources: BadgeDotTokenSource[] = [
  {
    name: 'Icons · Warning',
    cssVar: '--ds-badge-dot-bg',
    day: backgroundRow.day,
    night: backgroundRow.night,
  },
];

export const badgeDotColorVars: { day: BadgeDotColorVars; night: BadgeDotColorVars } = {
  day: {
    '--ds-badge-dot-bg': toCssColor(backgroundRow.day),
  },
  night: {
    '--ds-badge-dot-bg': toCssColor(backgroundRow.night),
  },
};

function cssVarBlock(vars: BadgeDotColorVars): string {
  return Object.entries(vars)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');
}

export const BADGE_DOT_TOKEN_STYLE = `
.ds-badge-dot-root {
${cssVarBlock(badgeDotColorVars.day)}
}
[data-theme="night"] .ds-badge-dot-root {
${cssVarBlock(badgeDotColorVars.night)}
}
`;
