import { useCallback, useEffect, useRef, useState } from 'react';

export const COPY_BUTTON_STYLE = `
.ds-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--pf-spacing-4);
  margin: 0;
  padding: var(--pf-spacing-2) var(--pf-spacing-8);
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-s);
  background: var(--pf-bg-surface-main);
  font: var(--pf-font-label-s);
  color: var(--pf-text-secondary);
  cursor: pointer;
  white-space: nowrap;
}
.ds-copy-btn:hover {
  color: var(--pf-text-primary);
  border-color: var(--pf-line-hover);
}
.ds-copy-btn:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
.ds-copy-btn[data-copied="true"] {
  color: var(--pf-text-success);
  border-color: var(--pf-bg-accent-status-success-main);
  background: var(--pf-bg-accent-status-success-main);
}
`;

interface CopyButtonProps {
  value: string;
  label?: string;
  ariaLabel?: string;
}

export function CopyButton({ value, label = 'Copy', ariaLabel }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    },
    [],
  );

  const handleCopy = useCallback(() => {
    void navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true);
        if (timerRef.current !== null) {
          window.clearTimeout(timerRef.current);
        }
        timerRef.current = window.setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => setCopied(false));
  }, [value]);

  return (
    <button
      type="button"
      className="ds-copy-btn"
      data-copied={copied || undefined}
      onClick={handleCopy}
      aria-label={ariaLabel ?? `${label}: ${value}`}
    >
      {copied ? 'Copied' : label}
    </button>
  );
}
