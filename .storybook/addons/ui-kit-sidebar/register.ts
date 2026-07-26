import { addons } from '@storybook/manager-api';
import { GLOBALS_UPDATED } from '@storybook/core-events';

const STYLE_ID = 'ui-kit-sidebar-filter';

/** Подсвечивает активный продукт в сайдбаре, не скрывая остальные. */
function applySidebarHighlight(uiKit: string): void {
  const activeSlug = uiKit.replace(/-/g, '');

  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    [data-item-id*="${activeSlug}"] {
      font-weight: 600;
    }
  `;
}

addons.register('ui-kit-sidebar-filter', (api) => {
  const readUiKit = () => (api.getGlobals?.() as { uiKit?: string } | undefined)?.uiKit ?? 'sutochno';

  applySidebarHighlight(readUiKit());

  api.on(GLOBALS_UPDATED, ({ globals }: { globals?: { uiKit?: string } }) => {
    applySidebarHighlight(globals?.uiKit ?? 'sutochno');
  });
});
