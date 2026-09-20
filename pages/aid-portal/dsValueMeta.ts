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
  gap: 2px;
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
  font-size: 11px;
  line-height: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  overflow-wrap: anywhere;
  word-break: break-word;
}
.ds-value-meta__caption {
  margin: 0;
  font-size: 10px;
  line-height: 12px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.38);
}
`;
