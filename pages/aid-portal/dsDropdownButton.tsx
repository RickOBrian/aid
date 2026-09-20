/**
 * Переиспользуемый триггер выпадающего списка DS-портала.
 *
 * Справа от текста — шеврон вниз; при `open` поворачивается на 180°.
 * Подключать `DS_DROPDOWN_BUTTON_STYLE` на странице и класс `DS_DROPDOWN_TRIGGER_CLASS`
 * на кнопку-триггер вместе с `DsDropdownChevron`.
 */

export const DS_DROPDOWN_TRIGGER_CLASS = 'ds-dropdown-trigger';
export const DS_DROPDOWN_TRIGGER_CHEVRON_CLASS = 'ds-dropdown-trigger__chevron';
export const DS_DROPDOWN_TRIGGER_CHEVRON_OPEN_CLASS = 'ds-dropdown-trigger__chevron--open';

export const DS_DROPDOWN_BUTTON_STYLE = `
.ds-dropdown-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.ds-dropdown-trigger__chevron {
  flex-shrink: 0;
  transition: transform 0.15s ease;
}
.ds-dropdown-trigger__chevron--open {
  transform: rotate(180deg);
}
.ds-dropdown-trigger:disabled .ds-dropdown-trigger__chevron {
  opacity: 0.38;
}
`;

export function DsDropdownChevron({ open = false }: { open?: boolean }) {
  return (
    <svg
      className={
        open
          ? `${DS_DROPDOWN_TRIGGER_CHEVRON_CLASS} ${DS_DROPDOWN_TRIGGER_CHEVRON_OPEN_CLASS}`
          : DS_DROPDOWN_TRIGGER_CHEVRON_CLASS
      }
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
