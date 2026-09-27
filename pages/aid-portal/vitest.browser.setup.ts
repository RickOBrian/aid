import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import { afterEach, beforeAll } from 'vitest';
import { page, userEvent } from 'vitest/browser';

/**
 * Окружение браузерных тестов.
 *
 * Roboto — локальная копия, а не Google Fonts, как на сайте: снимок не должен
 * зависеть от сети, иначе он то со шрифтом, то с запасным.
 *
 * Анимации и переходы выключены: лоадер Switch крутится бесконечно, и снимок
 * без этого не стабилизируется.
 *
 * После каждого теста курсор уводится в угол. Иначе он остаётся там, где
 * тест с `hover` его оставил, и следующий компонент, отрисованный на том же
 * месте, получает `:hover` — «default» на снимке оказывается ховером.
 */
const FREEZE_MOTION = `
*, *::before, *::after {
  animation: none !important;
  transition: none !important;
  caret-color: transparent !important;
}
body { margin: 0; min-height: 100vh; }
`;

beforeAll(async () => {
  const style = document.createElement('style');
  style.textContent = FREEZE_MOTION;
  document.head.append(style);
  await document.fonts.load('400 14px Roboto');
  await document.fonts.load('500 14px Roboto');
  await document.fonts.ready;
});

afterEach(async () => {
  await userEvent.hover(page.elementLocator(document.body), { position: { x: 470, y: 310 } });
});
