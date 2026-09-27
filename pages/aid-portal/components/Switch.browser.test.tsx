import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { page, userEvent } from 'vitest/browser';
import { Switch } from './Switch';
import type { SwitchPreviewState } from './switch.api';
import { MODES, MatrixCell, blockingAxeViolations } from './visualMatrix';

/**
 * Definition of Done, п.7: снимок каждого допустимого сочетания
 * вариант × состояние в обеих темах, и axe на каждом.
 *
 * Состояния — те же, что на странице компонента (`SwitchPreviewState`):
 * pressed, skeleton и error у Switch не реализованы (`switch.api.ts`),
 * поэтому и снимков у них нет (`component-standards.md` §7.4).
 */

const STATES: SwitchPreviewState[] = ['default', 'hover', 'focus', 'disabled', 'loading'];
const VALUES = [false, true];

afterEach(cleanup);

describe('Switch — матрица', () => {
  for (const mode of MODES) {
    for (const checked of VALUES) {
      for (const state of STATES) {
        const name = `switch-${mode}-${checked ? 'on' : 'off'}-${state}`;

        it(name, async () => {
          render(
            <MatrixCell mode={mode}>
              <Switch
                checked={checked}
                isDisabled={state === 'disabled'}
                isLoading={state === 'loading'}
                aria-label="Уведомления"
              />
            </MatrixCell>,
          );
          const control = page.getByRole('switch');

          if (state === 'hover') {
            await userEvent.hover(control);
          }
          if (state === 'focus') {
            // С клавиатуры, чтобы сработал :focus-visible, а не просто :focus.
            await userEvent.tab();
            expect(document.activeElement).toBe(control.element());
          }

          await expect.element(page.getByTestId('cell')).toMatchScreenshot(name);
          expect(await blockingAxeViolations(page.getByTestId('cell').element())).toEqual([]);
        });
      }
    }
  }
});
