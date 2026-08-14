/**
 * Переиспользуемая оболочка интерактивной карточки DS-портала.
 *
 * Hover: более тёмная обводка (только на устройствах с fine pointer).
 * Подключать `DS_INTERACTIVE_CARD_STYLE` на странице и класс `DS_INTERACTIVE_CARD_CLASS`
 * на корневой элемент карточки.
 *
 * Модификаторы:
 * - `ds-interactive-card--context-menu` — cursor: context-menu (ПКМ / long-press).
 */

export const DS_INTERACTIVE_CARD_CLASS = 'ds-interactive-card';

export const DS_INTERACTIVE_CARD_STYLE = `
.ds-interactive-card {
  border: 1px solid #ebedf0;
  border-radius: 8px;
  background: #ffffff;
  transition: border-color 0.15s ease;
}
@media (hover: hover) and (pointer: fine) {
  .ds-interactive-card:hover {
    border-color: #d0d4dc;
  }
}
.ds-interactive-card--context-menu {
  cursor: context-menu;
}
`;
