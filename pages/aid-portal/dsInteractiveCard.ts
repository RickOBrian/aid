/**
 * Переиспользуемая оболочка интерактивной карточки DS-портала.
 *
 * Вид — IslandLink (Persefona, спека presentbook-6 §2): рамка line-default → line-hover,
 * hover фона — bg-accent-states-hover (пробел Kit), radius-m (только fine pointer).
 * Подключать `DS_INTERACTIVE_CARD_STYLE` на странице и класс `DS_INTERACTIVE_CARD_CLASS`
 * на корневой элемент карточки.
 *
 * Модификаторы:
 * - `ds-interactive-card--context-menu` — cursor: context-menu (ПКМ / long-press).
 */

export const DS_INTERACTIVE_CARD_CLASS = 'ds-interactive-card';

export const DS_INTERACTIVE_CARD_STYLE = `
.ds-interactive-card {
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-m);
  background: var(--pf-bg-surface-main);
  transition: border-color 150ms ease, background-color 150ms ease;
}
@media (hover: hover) and (pointer: fine) {
  .ds-interactive-card:hover {
    border-color: var(--pf-line-hover);
    background: #f5f5f5; /* pf-gap: bg-accent-states-hover (пачка №0) */
  }
}
.ds-interactive-card:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
.ds-interactive-card--context-menu {
  cursor: context-menu;
}
`;
