import { defineConfig } from 'vitest/config';

/**
 * Тесты компонентов портала.
 *
 * До 2026-09-21 тест-раннера не было вообще: Definition of Done требовал
 * тесты, а выполнять требование было нечем (аудит, находка №3).
 */
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['components/**/*.test.{ts,tsx}'],
  },
});
