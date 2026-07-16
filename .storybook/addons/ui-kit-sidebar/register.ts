import { addons } from '@storybook/manager-api';
import { GLOBALS_UPDATED } from '@storybook/core-events';

const STYLE_ID = 'ui-kit-sidebar-filter';

const ALL_UI_KITS = ['ui-kit-a', 'ui-kit-b', 'sutochno'];

function slugForKit(uiKit: string): string {
  return uiKit.replace(/-/g, '');
}

function applySidebarFilter(uiKit: string): void {
  const activeSlug = slugForKit(uiKit);
  const hideSlugs = ALL_UI_KITS.map(slugForKit).filter((s) => s !== activeSlug);

  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  const hideRules = hideSlugs.flatMap((slug) => [
    `[data-item-id*="${slug}"] { display: none !important; }`,
    `a[href*="/story/${slug}"] { display: none !important; }`,
    `button[data-item-id*="${slug}"] { display: none !important; }`,
    `[data-nodetype="root"][data-item-id*="${slug}"] { display: none !important; }`,
  ]).join('\n');

  style.textContent = `
    ${hideRules}
    [data-item-id*="${activeSlug}"] { display: revert !important; }
    a[href*="/story/${activeSlug}"] { display: revert !important; }
  `;
}

addons.register('ui-kit-sidebar-filter', () => {
  const channel = addons.getChannel();
  const initial = addons.getGlobals()?.uiKit ?? 'ui-kit-a';
  applySidebarFilter(initial);

  channel.on(GLOBALS_UPDATED, ({ globals }) => {
    const uiKit = globals?.uiKit ?? 'ui-kit-a';
    applySidebarFilter(uiKit);
  });
});
