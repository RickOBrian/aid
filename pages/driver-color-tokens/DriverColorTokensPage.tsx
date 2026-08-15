import { useMemo, useRef, useState, type CSSProperties } from 'react';
import { ChangelogTable } from './ChangelogTable';
import { DsPageHeader } from './DsPageHeader';
import { DS_CHANGELOG_TABLE_STYLE, DS_COPYABLE_STYLE, DS_TOAST_STYLE } from './dsChangelogTable';
import {
  DS_VALUE_META_CAPTION_CLASS,
  DS_VALUE_META_CLASS,
  DS_VALUE_META_PRIMARY_CLASS,
  DS_VALUE_META_STYLE,
} from './dsValueMeta';
import {
  colorTokenCollection,
  semanticColorSections,
  type ColorModeValue,
  type SemanticColorRow,
  type SemanticColorSection,
} from './data';
import { loadTokenChangelog } from './loadTokenChangelog';
import { filterColorTokenSections } from './searchTokens';

const PAGE_STYLE = `
${DS_VALUE_META_STYLE}
${DS_CHANGELOG_TABLE_STYLE}
${DS_COPYABLE_STYLE}
${DS_TOAST_STYLE}
.dctp,
.dctp *,
.dctp *::before,
.dctp *::after {
  box-sizing: border-box;
}
.dctp {
  font-family: 'Google Sans', system-ui, sans-serif;
  color: #2d2c2e;
  background: #ffffff;
  min-height: 100vh;
  padding: 40px 48px 64px;
}
.dctp-search-empty {
  margin: 0;
  padding: 24px 0;
  color: rgba(0, 0, 0, 0.54);
  font-size: 14px;
  line-height: 20px;
}
.dctp section {
  margin-bottom: 48px;
}
.dctp h2 {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
}
.dctp-json-actions {
  display: inline-flex;
  flex-shrink: 0;
}
.dctp-json-btn {
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
.dctp-json-btn--view {
  border-radius: 8px 0 0 8px;
  border-right: none;
}
.dctp-json-btn--download {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 8px 8px 0;
  border-left: 1px solid #ebedf0;
  padding: 8px 10px;
}
.dctp-json-btn:hover:not(:disabled) {
  background: #f5f5f5;
}
.dctp-json-btn:disabled {
  color: rgba(0, 0, 0, 0.26);
  cursor: not-allowed;
}
.dctp-json-btn:disabled svg {
  opacity: 0.38;
}
.dctp-json-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.dctp-json-modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.38);
}
.dctp-json-modal-panel {
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
.dctp-json-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #ebedf0;
}
.dctp-json-modal-head h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
}
.dctp-json-modal-actions {
  display: flex;
  gap: 8px;
}
.dctp-json-modal-btn {
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
.dctp-json-modal-btn:hover {
  background: #f5f5f5;
}
.dctp-json-modal-body {
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
.dctp-toast {
  bottom: 32px;
  z-index: 1100;
  pointer-events: none;
}
.dctp-table {
  min-width: 640px;
  table-layout: auto;
}
.dctp-table td {
  overflow: visible;
}
.dctp-col-name,
.dctp-table thead th.dctp-col-name {
  width: 180px;
  min-width: 140px;
  font-weight: 500;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.dctp-swatch-btn:hover,
.dctp-swatch-btn.dctp-copyable:hover {
  opacity: 1;
}
.dctp-swatch-btn {
  display: inline-flex;
  border-radius: 4px;
}
.dctp-token-name {
  font-weight: 500;
}
.dctp-token-card-name.dctp-copyable {
  display: block;
  width: 100%;
  text-align: left;
}
.dctp-col-description,
.dctp-table thead th.dctp-col-description {
  min-width: 280px;
  width: 42%;
  border-left: 1px solid #ebedf0;
  color: rgba(0, 0, 0, 0.54);
  white-space: normal;
  overflow: visible;
  overflow-wrap: anywhere;
  word-break: break-word;
  line-height: 18px;
}
.dctp-col-mode-group,
.dctp-table thead th.dctp-col-mode-group {
  min-width: 112px;
  width: 150px;
  border-left: 1px solid #ebedf0;
}
.dctp-mode-cell {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.dctp-mode-cell-meta {
  flex: 1;
  min-width: 0;
}
@media (max-width: 1100px) {
  .dctp-table thead th {
    padding: 8px 12px;
  }
  .dctp-table td {
    padding: 8px 12px;
  }
  .dctp-col-description,
  .dctp-table thead th.dctp-col-description {
    line-height: 16px;
  }
  .dctp-mode-cell {
    flex-direction: column;
    align-items: flex-start;
    flex-wrap: nowrap;
    gap: 4px;
  }
  .dctp-swatch {
    width: 28px;
    height: 28px;
  }
}
.dctp-cards {
  display: none;
  flex-direction: column;
  gap: 12px;
}
.dctp-token-card {
  border: 1px solid #ebedf0;
  border-radius: 8px;
  padding: 14px 16px;
  background: #ffffff;
}
.dctp-token-card-name {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
}
.dctp-token-card-modes {
  display: grid;
  gap: 10px;
  margin-bottom: 12px;
}
.dctp-token-card-mode {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  background: #fafafa;
}
.dctp-token-card-mode-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.54);
}
.dctp-token-card-mode-values {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
}
.dctp-token-card-mode-values .dctp-swatch {
  flex-shrink: 0;
}
.dctp-token-card-description {
  margin: 0;
  color: rgba(0, 0, 0, 0.54);
  font-size: 13px;
  line-height: 20px;
  overflow-wrap: break-word;
  word-break: break-word;
}
.dctp-swatch {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background-color: #ffffff;
  background-image:
    linear-gradient(45deg, #eeeeee 25%, transparent 25%),
    linear-gradient(-45deg, #eeeeee 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #eeeeee 75%),
    linear-gradient(-45deg, transparent 75%, #eeeeee 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0;
  overflow: hidden;
}
.dctp-swatch-fill {
  width: 100%;
  height: 100%;
}
@media (max-width: 1024px) {
  .dctp {
    padding: 32px 24px 48px;
  }
}
@media (max-width: 767px) {
  .dctp {
    padding: 20px 16px 40px;
  }
  .dctp-json-btn--view {
    flex: 1 1 auto;
  }
  .dctp-json-btn--download {
    flex: 0 0 44px;
    padding-inline: 0;
  }
  .dctp-table-wrap {
    display: none;
  }
  .dctp-cards {
    display: flex;
  }
  .dctp-json-modal {
    padding: 0;
    align-items: flex-end;
  }
  .dctp-json-modal-panel {
    width: 100%;
    max-height: 92vh;
    border-radius: 12px 12px 0 0;
  }
  .dctp-json-modal-head {
    flex-direction: column;
    align-items: stretch;
  }
  .dctp-json-modal-actions {
    width: 100%;
  }
  .dctp-json-modal-btn {
    flex: 1 1 0;
  }
  .dctp-toast {
    left: 16px;
    right: 16px;
    bottom: 16px;
    transform: none;
    text-align: center;
  }
}
@media (max-width: 480px) {
  .dctp-json-btn {
    font-size: 12px;
    padding: 8px 10px;
  }
  .dctp-json-modal-body {
    padding: 16px;
    font-size: 11px;
    line-height: 16px;
  }
}
`;

function hexWithoutHash(hex: string): string {
  return hex.replace(/^#/, '').toUpperCase();
}

function useCopyNotice() {
  const [copyNoticeVisible, setCopyNoticeVisible] = useState(false);
  const copyNoticeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyNoticeVisible(true);
      if (copyNoticeTimeoutRef.current) {
        clearTimeout(copyNoticeTimeoutRef.current);
      }
      copyNoticeTimeoutRef.current = setTimeout(() => {
        setCopyNoticeVisible(false);
        copyNoticeTimeoutRef.current = null;
      }, 2000);
    } catch {
      // noop
    }
  };

  const copyNotice = copyNoticeVisible ? (
    <div className="dctp-toast" role="status" aria-live="polite">
      Скопировано в буфер
    </div>
  ) : null;

  return { copyText, copyNotice };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '');
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function colorFillStyle({ hex, opacity }: ColorModeValue): CSSProperties {
  const { r, g, b } = hexToRgb(hex);
  return { backgroundColor: `rgba(${r}, ${g}, ${b}, ${opacity / 100})` };
}

function MiniSwatch({
  value,
  onCopyHex,
}: {
  value: ColorModeValue;
  onCopyHex?: (hex: string) => void;
}) {
  const hex = hexWithoutHash(value.hex);

  if (!onCopyHex) {
    return (
      <div className="dctp-swatch">
        <div className="dctp-swatch-fill" style={colorFillStyle(value)} />
      </div>
    );
  }

  return (
    <button
      type="button"
      className="dctp-copyable dctp-swatch-btn"
      aria-label={`Скопировать ${hex}`}
      onClick={() => {
        void onCopyHex(hex);
      }}
    >
      <div className="dctp-swatch">
        <div className="dctp-swatch-fill" style={colorFillStyle(value)} />
      </div>
    </button>
  );
}

function ModeCell({
  value,
  onCopyHex,
}: {
  value: ColorModeValue;
  onCopyHex: (hex: string) => void;
}) {
  const hex = hexWithoutHash(value.hex);

  return (
    <td className="dctp-col-mode-group">
      <div className="dctp-mode-cell">
        <MiniSwatch value={value} onCopyHex={onCopyHex} />
        <div className={`${DS_VALUE_META_CLASS} dctp-mode-cell-meta`}>
          <button
            type="button"
            className={`dctp-copyable ${DS_VALUE_META_PRIMARY_CLASS}`}
            onClick={() => {
              void onCopyHex(hex);
            }}
          >
            {value.hex.toUpperCase()}
          </button>
          <span className={DS_VALUE_META_CAPTION_CLASS}>{value.opacity}%</span>
        </div>
      </div>
    </td>
  );
}

function SemanticColorRowView({
  row,
  onCopyText,
  onCopyHex,
}: {
  row: SemanticColorRow;
  onCopyText: (text: string) => void;
  onCopyHex: (hex: string) => void;
}) {
  return (
    <tr>
      <td className="dctp-col-name">
        <button
          type="button"
          className="dctp-copyable dctp-token-name"
          onClick={() => {
            void onCopyText(row.name);
          }}
        >
          {row.name}
        </button>
      </td>
      <ModeCell value={row.day} onCopyHex={onCopyHex} />
      <ModeCell value={row.night} onCopyHex={onCopyHex} />
      <td className="dctp-col-description">{row.description}</td>
    </tr>
  );
}

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

function JsonActions({
  filename,
  json,
  disabled,
  onCopyText,
}: {
  filename: string;
  json: string;
  disabled: boolean;
  onCopyText: (text: string) => void;
}) {
  const [isJsonOpen, setIsJsonOpen] = useState(false);

  return (
    <>
      <div className="dctp-json-actions ds-page-header__action-group">
        <button
          type="button"
          className="dctp-json-btn dctp-json-btn--view"
          disabled={disabled}
          onClick={() => setIsJsonOpen(true)}
        >
          Показать JSON
        </button>
        <button
          type="button"
          className="dctp-json-btn dctp-json-btn--download"
          disabled={disabled}
          aria-label="Скачать JSON"
          onClick={() => downloadJson(filename, json)}
        >
          <DownloadIcon />
        </button>
      </div>

      {isJsonOpen && (
        <div className="dctp-json-modal" role="dialog" aria-modal="true" aria-label="JSON токенов">
          <button
            type="button"
            className="dctp-json-modal-backdrop"
            aria-label="Закрыть"
            onClick={() => setIsJsonOpen(false)}
          />
          <div className="dctp-json-modal-panel">
            <div className="dctp-json-modal-head">
              <h3>{filename}.json</h3>
              <div className="dctp-json-modal-actions">
                <button
                  type="button"
                  className="dctp-json-modal-btn"
                  onClick={() => {
                    void onCopyText(json);
                  }}
                >
                  Копировать
                </button>
                <button
                  type="button"
                  className="dctp-json-modal-btn"
                  onClick={() => setIsJsonOpen(false)}
                >
                  Закрыть
                </button>
              </div>
            </div>
            <pre className="dctp-json-modal-body">{json}</pre>
          </div>
        </div>
      )}
    </>
  );
}

function ModeValueCard({
  label,
  value,
  onCopyHex,
}: {
  label: string;
  value: ColorModeValue;
  onCopyHex: (hex: string) => void;
}) {
  const hex = hexWithoutHash(value.hex);

  return (
    <div className="dctp-token-card-mode">
      <div className="dctp-token-card-mode-label">{label}</div>
      <div className="dctp-token-card-mode-values">
        <MiniSwatch value={value} onCopyHex={onCopyHex} />
        <div className={DS_VALUE_META_CLASS}>
          <button
            type="button"
            className={`dctp-copyable ${DS_VALUE_META_PRIMARY_CLASS}`}
            onClick={() => {
              void onCopyHex(hex);
            }}
          >
            {value.hex.toUpperCase()}
          </button>
          <span className={DS_VALUE_META_CAPTION_CLASS}>{value.opacity}%</span>
        </div>
      </div>
    </div>
  );
}

function TokenCard({
  row,
  onCopyText,
  onCopyHex,
}: {
  row: SemanticColorRow;
  onCopyText: (text: string) => void;
  onCopyHex: (hex: string) => void;
}) {
  return (
    <article className="dctp-token-card">
      <button
        type="button"
        className="dctp-copyable dctp-token-card-name"
        onClick={() => {
          void onCopyText(row.name);
        }}
      >
        {row.name}
      </button>
      <div className="dctp-token-card-modes">
        <ModeValueCard label="Day" value={row.day} onCopyHex={onCopyHex} />
        <ModeValueCard label="Night" value={row.night} onCopyHex={onCopyHex} />
      </div>
      <p className="dctp-token-card-description">{row.description}</p>
    </article>
  );
}

function TokenCards({
  rows,
  onCopyText,
  onCopyHex,
}: {
  rows: SemanticColorRow[];
  onCopyText: (text: string) => void;
  onCopyHex: (hex: string) => void;
}) {
  return (
    <div className="dctp-cards">
      {rows.map((row) => (
        <TokenCard
          key={row.name}
          row={row}
          onCopyText={onCopyText}
          onCopyHex={onCopyHex}
        />
      ))}
    </div>
  );
}

function TokenTable({
  rows,
  onCopyText,
  onCopyHex,
}: {
  rows: SemanticColorRow[];
  onCopyText: (text: string) => void;
  onCopyHex: (hex: string) => void;
}) {
  return (
    <>
      <div className="dctp-table-wrap ds-token-table-wrap">
        <table className="ds-token-table dctp-table">
          <thead>
            <tr>
              <th className="dctp-col-name">Название</th>
              <th className="dctp-col-mode-group dctp-group-day">Day</th>
              <th className="dctp-col-mode-group dctp-group-night">Night</th>
              <th className="dctp-col-description">Описание</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <SemanticColorRowView
                key={row.name}
                row={row}
                onCopyText={onCopyText}
                onCopyHex={onCopyHex}
              />
            ))}
          </tbody>
        </table>
      </div>
      <TokenCards rows={rows} onCopyText={onCopyText} onCopyHex={onCopyHex} />
    </>
  );
}

function TokenSection({
  title,
  rows,
  onCopyText,
  onCopyHex,
}: SemanticColorSection & {
  onCopyText: (text: string) => void;
  onCopyHex: (hex: string) => void;
}) {
  return (
    <section>
      <h2>{title}</h2>
      <TokenTable rows={rows} onCopyText={onCopyText} onCopyHex={onCopyHex} />
    </section>
  );
}

const PAGE_TITLE = 'Color';
const hasColorTokens = semanticColorSections.some((section) => section.rows.length > 0);
const tokenChangelog = loadTokenChangelog(colorTokenCollection.collectionName);

export function DriverColorTokensPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { copyText, copyNotice } = useCopyNotice();
  const colorTokensJson = useMemo(
    () => JSON.stringify(semanticColorSections, null, 2),
    [],
  );
  const filteredSections = useMemo(
    () => filterColorTokenSections(semanticColorSections, searchQuery),
    [searchQuery],
  );
  const copyHex = (hex: string) => copyText(hexWithoutHash(hex));

  return (
    <div className="dctp">
      <style>{PAGE_STYLE}</style>

      <DsPageHeader
        title={PAGE_TITLE}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Поиск категории или токена"
        searchAriaLabel="Поиск категории или токена"
        actions={(
          <JsonActions
            filename={PAGE_TITLE}
            json={colorTokensJson}
            disabled={!hasColorTokens}
            onCopyText={copyText}
          />
        )}
      />

      {filteredSections.length === 0 && searchQuery.trim() ? (
        <p className="dctp-search-empty">Ничего не найдено</p>
      ) : (
        filteredSections.map((section) => (
          <TokenSection
            key={section.title}
            {...section}
            onCopyText={copyText}
            onCopyHex={copyHex}
          />
        ))
      )}

      {tokenChangelog ? <ChangelogTable data={tokenChangelog} /> : null}

      {copyNotice}
    </div>
  );
}
