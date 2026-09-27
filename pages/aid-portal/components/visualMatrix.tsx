import type { ReactNode } from 'react';
import axe from 'axe-core';
import { semanticColorSections, type ColorModeValue } from '../data';
import type { ProductColorMode } from './anatomyTypes';

/**
 * Общее для браузерных тестов: ячейка матрицы и проверка axe.
 * Только для `*.browser.test.tsx` — в jsdom axe не считает контраст.
 */

export const MODES: ProductColorMode[] = ['day', 'night'];

function bgPrimary(mode: ProductColorMode): string {
  const row = semanticColorSections
    .find((section) => section.title === 'Bg')
    ?.rows.find((candidate) => candidate.name === 'Primary');
  if (!row) {
    throw new Error('Driver color tokens: "Bg · Primary" row not found in data.ts');
  }
  const value: ColorModeValue = row[mode];
  return value.hex;
}

/**
 * Ячейка на фоне Bg · Primary своей темы. `data-theme` включает ночные
 * значения компонента так же, как на странице компонента в портале.
 * Отступ оставляет место кольцу фокуса и тени.
 */
export function MatrixCell({ mode, children }: { mode: ProductColorMode; children: ReactNode }) {
  return (
    <div
      data-testid="cell"
      data-theme={mode}
      style={{ display: 'inline-flex', padding: 12, background: bgPrimary(mode) }}
    >
      {children}
    </div>
  );
}

/** Порог из `testing-strategy.md`: axe — 0 critical, 0 serious. */
const BLOCKING_IMPACTS = new Set(['critical', 'serious']);

export async function blockingAxeViolations(element: Element): Promise<string[]> {
  const result = await axe.run(element, { resultTypes: ['violations'] });
  return result.violations
    .filter((violation) => BLOCKING_IMPACTS.has(violation.impact ?? ''))
    .map((violation) => `${violation.id} (${violation.impact}): ${violation.help}`);
}
