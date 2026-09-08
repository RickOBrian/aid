import { useEffect, useRef } from 'react';

export function IconRoundCheckbox({
  checked,
  indeterminate = false,
  disabled = false,
  ariaLabel,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  ariaLabel: string;
  onChange: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate, checked]);

  return (
    <label className="dip-round-checkbox">
      <input
        ref={inputRef}
        type="checkbox"
        className="dip-round-checkbox__input"
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => {
          event.stopPropagation();
          onChange();
        }}
        onClick={(event) => {
          event.stopPropagation();
        }}
      />
      <span className="dip-round-checkbox__mark" aria-hidden="true">
        {checked && !indeterminate ? (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M2 5.2 4.1 7.3 8 2.8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
        {indeterminate ? <span className="dip-round-checkbox__dash" /> : null}
      </span>
    </label>
  );
}
