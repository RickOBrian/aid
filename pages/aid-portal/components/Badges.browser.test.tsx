import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { page } from 'vitest/browser';
import { BadgeCount } from './BadgeCount';
import { BadgeDot } from './BadgeDot';
import { MODES, MatrixCell, blockingAxeViolations } from './visualMatrix';

/**
 * Definition of Done, п.7 для бейджей. Состояний у них нет — это не
 * интерактивные элементы. BadgeCount меняется только длиной значения:
 * одна цифра, две, переполнение через `max`. Токены бейджей от темы не
 * зависят, но стоят они на фоне темы — поэтому обе.
 */

const COUNT_VALUES = [
  { label: '1-digit', value: 3 },
  { label: '2-digits', value: 42 },
  { label: 'overflow', value: 250 },
];

afterEach(cleanup);

/**
 * Временное исключение (changes/driver/pending/component-deviation-badge-count-night-contrast.json).
 * Night: белый текст на Fields · Warning #F85973 — 3,2:1, ниже AA 4,5:1.
 * В библиотеке Figma Counter на тех же токенах. Тест ждёт ровно это нарушение:
 * когда дизайн исправит токен, ожидание сломается и напомнит снять исключение.
 */
const KNOWN_VIOLATIONS: Record<string, string[]> = {
  'badge-count-night-2-digits': ['color-contrast (serious): Elements must meet minimum color contrast ratio thresholds'],
  'badge-count-night-overflow': ['color-contrast (serious): Elements must meet minimum color contrast ratio thresholds'],
};

describe('BadgeCount — матрица', () => {
  for (const mode of MODES) {
    for (const { label, value } of COUNT_VALUES) {
      const name = `badge-count-${mode}-${label}`;

      it(name, async () => {
        render(
          <MatrixCell mode={mode}>
            <BadgeCount value={value} />
          </MatrixCell>,
        );
        await expect.element(page.getByTestId('cell')).toMatchScreenshot(name);
        expect(await blockingAxeViolations(page.getByTestId('cell').element())).toEqual(
          KNOWN_VIOLATIONS[name] ?? [],
        );
      });
    }
  }
});

describe('BadgeDot — матрица', () => {
  for (const mode of MODES) {
    const name = `badge-dot-${mode}`;

    it(name, async () => {
      render(
        <MatrixCell mode={mode}>
          <BadgeDot aria-label="Есть непрочитанные уведомления" />
        </MatrixCell>,
      );
      await expect.element(page.getByTestId('cell')).toMatchScreenshot(name);
      expect(await blockingAxeViolations(page.getByTestId('cell').element())).toEqual([]);
    });
  }
});
