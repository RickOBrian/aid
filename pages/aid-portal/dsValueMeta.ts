/**
 * Переиспользуемая пара «основное значение + подпись» DS-портала.
 *
 * Примеры: название иконки + размер, hex + alpha%.
 * Подключать `DS_VALUE_META_STYLE` на странице.
 *
 * Модификаторы:
 * - `ds-value-meta--center` — выравнивание по центру (сетка иконок).
 */

export const DS_VALUE_META_CLASS = 'ds-value-meta';
export const DS_VALUE_META_CENTER_CLASS = 'ds-value-meta--center';
export const DS_VALUE_META_PRIMARY_CLASS = 'ds-value-meta__primary';
export const DS_VALUE_META_CAPTION_CLASS = 'ds-value-meta__caption';

export const DS_VALUE_META_STYLE = `
.ds-value-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--pf-spacing-2);
  min-width: 0;
}
.ds-value-meta--center {
  align-items: center;
}
.ds-value-meta--center .ds-value-meta__primary,
.ds-value-meta--center .ds-value-meta__caption {
  width: 100%;
  text-align: center;
}
.ds-value-meta__primary {
  margin: 0;
  font: var(--pf-font-code-s);
  color: var(--pf-text-primary);
  overflow-wrap: anywhere;
  word-break: break-word;
}
.ds-value-meta__caption {
  margin: 0;
  /* pf-gap: body-xs 12/16·400 — до него прежний размер */
  font-family: var(--pf-type-family-sans-1);
  font-size: 10px;
  line-height: 12px;
  font-weight: var(--pf-type-weight-400);
  color: var(--pf-text-secondary);
}
`;
