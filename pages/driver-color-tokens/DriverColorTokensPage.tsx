import { useMemo, useRef, useState, type CSSProperties } from 'react';
import { ChangelogTable } from './ChangelogTable';
import { DsPageHeader } from './DsPageHeader';
import { DS_TOKEN_JSON_ACTIONS_STYLE, TokenJsonActions } from './dsTokenJsonActions';
import { DS_CHANGELOG_TABLE_STYLE, DS_COPYABLE_STYLE, DS_TOAST_STYLE } from './dsChangelogTable';
import {
  DS_VALUE_META_CAPTION_CLASS,
  DS_VALUE_META_CLASS,
  DS_VALUE_META_PRIMARY_CLASS,
  DS_VALUE_META_STYLE,
} from './dsValueMeta';
import {
  exportColorSectionsJson,
  stringifyTokenJson,
} from './exportTokenJson';
import { getProductColorContent } from './productColorData';
import { loadTokenChangelog } from './loadTokenChangelog';
import { filterColorTokenSections } from './searchTokens';
import type { ColorModeValue, SemanticColorRow, SemanticColorSection } from './data';
import { DEFAULT_PRODUCT_ID } from './productRegistry';

const PAGE_STYLE = `
${DS_VALUE_META_STYLE}
${DS_CHANGELOG_TABLE_STYLE}
${DS_COPYABLE_STYLE}
${DS_TOAST_STYLE}
${DS_TOKEN_JSON_ACTIONS_STYLE}
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
  .dctp-table-wrap {
    display: none;
  }
  .dctp-cards {
    display: flex;
  }
  .dctp-toast {
    left: 16px;
    right: 16px;
    bottom: 16px;
    transform: none;
    text-align: center;
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

export function DriverColorTokensPage({ productId = DEFAULT_PRODUCT_ID }: { productId?: string }) {
  const { sections, collection } = getProductColorContent(productId);
  const tokenChangelog = loadTokenChangelog(collection.collectionName);
  const [searchQuery, setSearchQuery] = useState('');
  const { copyText, copyNotice } = useCopyNotice();
  const colorTokensJson = useMemo(
    () => stringifyTokenJson(exportColorSectionsJson(sections)),
    [sections],
  );
  const filteredSections = useMemo(
    () => filterColorTokenSections(sections, searchQuery),
    [sections, searchQuery],
  );
  const copyHex = (hex: string) => copyText(hexWithoutHash(hex));
  const exportFilename = collection.artifact.split('/').pop() ?? 'Color';
  const hasTokens = sections.some((section) => section.rows.length > 0);

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
          <TokenJsonActions
            filename={exportFilename}
            json={colorTokensJson}
            disabled={!hasTokens}
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
