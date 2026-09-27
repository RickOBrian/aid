import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

/**
 * Тесты компонентов портала — два проекта.
 *
 * До 2026-09-21 тест-раннера не было вообще: Definition of Done требовал
 * тесты, а выполнять требование было нечем (аудит, находка №3).
 *
 * `unit` — jsdom: логика, атрибуты, поведение. Гоняется в CI (`npm test`).
 * `browser` — настоящий Chromium: снимки матрицы вариант × состояние в обеих
 * темах и axe (DoD п.7). jsdom не умеет ни то, ни другое: не рисует, не
 * считает контраст, не знает `:hover` и `:focus-visible`.
 * Запуск — `npm run test:browser`.
 */
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./vitest.setup.ts'],
          include: ['components/**/*.test.{ts,tsx}'],
          exclude: ['components/**/*.browser.test.{ts,tsx}'],
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          setupFiles: ['./vitest.browser.setup.ts'],
          include: ['components/**/*.browser.test.{ts,tsx}'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            viewport: { width: 480, height: 320 },
          },
        },
      },
    ],
  },
});
