/**
 * Semantic Driver color tokens for the Switch component.
 * Source of truth: `pages/driver-color-tokens/data.ts` (Controls, Strokes sections).
 * Day → light mode (`row.day`), Night → dark mode (`row.night`) —
 * see `products/driver/product.json` → `colorModeMapping`.
 *
 * No raw hex values are authored here: every value is read from the
 * canonical token rows and converted to a CSS color string.
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

const checkedRow = findRow('Controls', 'Checked');
const uncheckedRow = findRow('Controls', 'Unchecked');
const keyRow = findRow('Controls', 'Key');
const strokePrimaryRow = findRow('Strokes', 'Primary');

export interface SwitchColorVars {
  '--ds-switch-checked': string;
  '--ds-switch-unchecked': string;
  '--ds-switch-key': string;
  '--ds-switch-stroke': string;
}

export const switchColorVars: { day: SwitchColorVars; night: SwitchColorVars } = {
  day: {
    '--ds-switch-checked': toCssColor(checkedRow.day),
    '--ds-switch-unchecked': toCssColor(uncheckedRow.day),
    '--ds-switch-key': toCssColor(keyRow.day),
    '--ds-switch-stroke': toCssColor(strokePrimaryRow.day),
  },
  night: {
    '--ds-switch-checked': toCssColor(checkedRow.night),
    '--ds-switch-unchecked': toCssColor(uncheckedRow.night),
    '--ds-switch-key': toCssColor(keyRow.night),
    '--ds-switch-stroke': toCssColor(strokePrimaryRow.night),
  },
};

function cssVarBlock(vars: SwitchColorVars): string {
  return Object.entries(vars)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');
}

/**
 * Scoped (non-global) CSS custom properties for `.ds-switch-root`.
 * Day values are the default; `[data-theme="night"]` overrides them —
 * matches the ambient theming convention from `skills/_shared/platforms.md`.
 */
export const SWITCH_TOKEN_STYLE = `
.ds-switch-root {
${cssVarBlock(switchColorVars.day)}
}
[data-theme="night"] .ds-switch-root {
${cssVarBlock(switchColorVars.night)}
}
`;
