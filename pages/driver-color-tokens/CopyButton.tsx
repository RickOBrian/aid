import { useCallback, useEffect, useRef, useState } from 'react';

export const COPY_BUTTON_STYLE = `
.ds-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  padding: 2px 8px;
  border: 1px solid #ebedf0;
  border-radius: 6px;
  background: #ffffff;
  font: inherit;
  font-size: 11px;
  line-height: 16px;
  color: rgba(0, 0, 0, 0.54);
  cursor: pointer;
  white-space: nowrap;
}
.ds-copy-btn:hover {
  color: #2d2c2e;
  border-color: #d7dade;
}
.ds-copy-btn:focus-visible {
  outline: 2px solid rgba(45, 44, 46, 0.32);
  outline-offset: 2px;
}
.ds-copy-btn[data-copied="true"] {
  color: #1f7a3f;
  border-color: #b9e6c9;
  background: #eef8f1;
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
