import { useState } from 'react';

export const DS_TOKEN_JSON_ACTIONS_STYLE = `
.ds-token-json-actions {
  display: inline-flex;
  flex-shrink: 0;
}
.ds-token-json-btn {
  /* pf-gap: label-m 14/20·500 — до него прежний размер 13/16 */
  font-family: var(--pf-type-family-sans-1);
  font-size: 13px;
  font-weight: var(--pf-type-weight-500);
  line-height: 16px;
  color: var(--pf-text-primary);
  background: var(--pf-bg-surface-main);
  border: 1px solid var(--pf-line-default);
  padding: var(--pf-spacing-8) var(--pf-spacing-12);
  cursor: pointer;
}
.ds-token-json-btn--view {
  border-radius: var(--pf-radius-m) 0 0 var(--pf-radius-m);
  border-right: none;
}
.ds-token-json-btn--download {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 var(--pf-radius-m) var(--pf-radius-m) 0;
  border-left: 1px solid var(--pf-line-default);
  padding: var(--pf-spacing-8) var(--pf-spacing-10);
}
.ds-token-json-btn:hover:not(:disabled) {
  background: #f5f5f5; /* pf-gap: bg-accent-states-hover */
}
.ds-token-json-btn:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
.ds-token-json-btn:disabled {
  color: var(--pf-text-disabled);
  cursor: not-allowed;
}
.ds-token-json-btn:disabled svg {
  color: var(--pf-icon-disabled);
}
.ds-token-json-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--pf-spacing-24);
}
.ds-token-json-modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.38); /* pf-gap: bg-overlay */
}
.ds-token-json-modal-panel {
  position: relative;
  width: min(960px, 100%);
  max-height: min(80vh, 900px);
  display: flex;
  flex-direction: column;
  background: var(--pf-bg-surface-main);
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-xl);
  overflow: hidden;
  box-shadow: var(--pf-shadow-2);
}
.ds-token-json-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--pf-spacing-16);
  padding: var(--pf-spacing-16) var(--pf-spacing-20);
  border-bottom: 1px solid var(--pf-line-default);
}
.ds-token-json-modal-head h3 {
  margin: 0;
  font: var(--pf-font-heading-s);
  color: var(--pf-text-primary);
}
.ds-token-json-modal-actions {
  display: flex;
  gap: var(--pf-spacing-8);
}
.ds-token-json-modal-btn {
  /* pf-gap: label-m 14/20·500 — до него прежний размер 13 */
  font-family: var(--pf-type-family-sans-1);
  font-size: 13px;
  font-weight: var(--pf-type-weight-500);
  color: var(--pf-text-primary);
  background: var(--pf-bg-surface-main);
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-m);
  padding: var(--pf-spacing-6) var(--pf-spacing-12);
  cursor: pointer;
}
.ds-token-json-modal-btn:hover {
  background: #f5f5f5; /* pf-gap: bg-accent-states-hover */
}
.ds-token-json-modal-btn:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
.ds-token-json-modal-body {
  margin: 0;
  padding: var(--pf-spacing-20);
  overflow: auto;
  font: var(--pf-font-code-m);
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--pf-text-primary);
}
@media (max-width: 767px) {
  .ds-token-json-btn--view {
    flex: 1 1 auto;
  }
  .ds-token-json-btn--download {
    flex: 0 0 44px;
    padding-inline: 0;
  }
  .ds-token-json-modal {
    padding: 0;
    align-items: flex-end;
  }
  .ds-token-json-modal-panel {
    width: 100%;
    max-height: 92vh;
    border-radius: var(--pf-radius-xl) var(--pf-radius-xl) 0 0;
  }
  .ds-token-json-modal-head {
    flex-direction: column;
    align-items: stretch;
  }
  .ds-token-json-modal-actions {
    width: 100%;
  }
  .ds-token-json-modal-btn {
    flex: 1 1 0;
  }
}
@media (max-width: 479px) {
  .ds-token-json-btn {
    font-size: 12px; /* pf-gap: label-m — прежний мобильный размер */
    padding: var(--pf-spacing-8) var(--pf-spacing-10);
  }
  .ds-token-json-modal-body {
    padding: var(--pf-spacing-16);
    font: var(--pf-font-code-s);
  }
}
`;

function downloadJson(filename: string, json: string) {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2v8m0 0L5.5 7.5M8 10l2.5-2.5M3 12.5h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface TokenJsonActionsProps {
  filename: string;
  json: string;
  disabled?: boolean;
  onCopyText: (text: string) => void;
}

export function TokenJsonActions({
  filename,
  json,
  disabled = false,
  onCopyText,
}: TokenJsonActionsProps) {
  const [isJsonOpen, setIsJsonOpen] = useState(false);

  return (
    <>
      <div className="ds-token-json-actions ds-page-header__action-group">
        <button
          type="button"
          className="ds-token-json-btn ds-token-json-btn--view"
          disabled={disabled}
          onClick={() => setIsJsonOpen(true)}
        >
          Показать JSON
        </button>
        <button
          type="button"
          className="ds-token-json-btn ds-token-json-btn--download"
          disabled={disabled}
          aria-label="Скачать JSON"
          onClick={() => downloadJson(filename, json)}
        >
          <DownloadIcon />
        </button>
      </div>

      {isJsonOpen && (
        <div className="ds-token-json-modal" role="dialog" aria-modal="true" aria-label="JSON токенов">
          <button
            type="button"
            className="ds-token-json-modal-backdrop"
            aria-label="Закрыть"
            onClick={() => setIsJsonOpen(false)}
          />
          <div className="ds-token-json-modal-panel">
            <div className="ds-token-json-modal-head">
              <h3>{filename}.json</h3>
              <div className="ds-token-json-modal-actions">
                <button
                  type="button"
                  className="ds-token-json-modal-btn"
                  onClick={() => {
                    void onCopyText(json);
                  }}
                >
                  Копировать
                </button>
                <button
                  type="button"
                  className="ds-token-json-modal-btn"
                  onClick={() => setIsJsonOpen(false)}
                >
                  Закрыть
                </button>
              </div>
            </div>
            <pre className="ds-token-json-modal-body">{json}</pre>
          </div>
        </div>
      )}
    </>
  );
}
