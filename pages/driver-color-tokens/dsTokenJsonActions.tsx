import { useState } from 'react';

export const DS_TOKEN_JSON_ACTIONS_STYLE = `
.ds-token-json-actions {
  display: inline-flex;
  flex-shrink: 0;
}
.ds-token-json-btn {
  font-family: 'Google Sans', system-ui, sans-serif;
  font-size: 13px;
  font-weight: 500;
  line-height: 16px;
  color: #2d2c2e;
  background: #ffffff;
  border: 1px solid #ebedf0;
  padding: 8px 12px;
  cursor: pointer;
}
.ds-token-json-btn--view {
  border-radius: 8px 0 0 8px;
  border-right: none;
}
.ds-token-json-btn--download {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 8px 8px 0;
  border-left: 1px solid #ebedf0;
  padding: 8px 10px;
}
.ds-token-json-btn:hover:not(:disabled) {
  background: #f5f5f5;
}
.ds-token-json-btn:disabled {
  color: rgba(0, 0, 0, 0.26);
  cursor: not-allowed;
}
.ds-token-json-btn:disabled svg {
  opacity: 0.38;
}
.ds-token-json-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.ds-token-json-modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.38);
}
.ds-token-json-modal-panel {
  position: relative;
  width: min(960px, 100%);
  max-height: min(80vh, 900px);
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #ebedf0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.16);
}
.ds-token-json-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #ebedf0;
}
.ds-token-json-modal-head h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
}
.ds-token-json-modal-actions {
  display: flex;
  gap: 8px;
}
.ds-token-json-modal-btn {
  font-family: 'Google Sans', system-ui, sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #2d2c2e;
  background: #ffffff;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
}
.ds-token-json-modal-btn:hover {
  background: #f5f5f5;
}
.ds-token-json-modal-body {
  margin: 0;
  padding: 20px;
  overflow: auto;
  font-family: 'Google Sans', system-ui, sans-serif;
  font-size: 12px;
  line-height: 18px;
  white-space: pre-wrap;
  word-break: break-word;
  color: #2d2c2e;
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
    border-radius: 12px 12px 0 0;
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
@media (max-width: 480px) {
  .ds-token-json-btn {
    font-size: 12px;
    padding: 8px 10px;
  }
  .ds-token-json-modal-body {
    padding: 16px;
    font-size: 11px;
    line-height: 16px;
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
