import type { Preview } from '@storybook/react';

/**
 * Конфигурация Storybook.
 *
 * До 2026-09-21 здесь жил переключатель UI Kit и декоратор, подгружавший
 * бандлы токенов легаси-продуктов. Продукты удалены из репозитория;
 * вместе с ними ушли переключатель, декоратор, загрузчик токенов и аддон
 * подсветки сайдбара.
 *
 * Осталась одна история — дамп стилей Figma, помеченный в манифесте driver
 * как reference-only. Нужен ли Storybook ради неё — открытый вопрос.
 */

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
};

export default preview;
