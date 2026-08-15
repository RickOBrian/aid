import { useMemo, useRef, useState } from 'react';
import { ChangelogTable } from './ChangelogTable';
import { DsPageHeader } from './DsPageHeader';
import { DS_CHANGELOG_TABLE_STYLE, DS_COPYABLE_STYLE, DS_TOAST_STYLE } from './dsChangelogTable';
import { loadTokenChangelog } from './loadTokenChangelog';
import {
  spacingCollection,
  spacingPreviewHeight,
  spacingTokens,
  type SpacingToken,
} from './spacingData';
import { filterSpacingTokens } from './searchSpacing';

const spacingChangelog = loadTokenChangelog(spacingCollection.collectionName);

const PAGE_STYLE = `
${DS_CHANGELOG_TABLE_STYLE}
${DS_COPYABLE_STYLE}
${DS_TOAST_STYLE}
.dps,
.dps *,
.dps *::before,
.dps *::after {
  box-sizing: border-box;
}
.dps {
  font-family: 'Google Sans', system-ui, sans-serif;
  color: #2d2c2e;
  background: #ffffff;
  min-height: 100vh;
  padding: 40px 48px 64px;
}
.dps-search-empty {
  margin: 0;
  padding: 24px 0;
  color: rgba(0, 0, 0, 0.54);
  font-size: 14px;
  line-height: 20px;
}
.dps-table-wrap {
  min-width: 0;
}
.dps-table {
  min-width: 560px;
}
.dps-table td {
  padding: 12px 16px;
}
.dps-col-name {
  min-width: 200px;
}
.dps-name {
  font-size: 14px;
  line-height: 20px;
  color: #2d2c2e;
}
.dps-col-visual {
  width: 120px;
}
.dps-col-px,
.dps-col-rem {
  min-width: 96px;
  font-weight: 500;
}
.dps-visual {
  display: flex;
  align-items: center;
  min-height: 48px;
}
.dps-visual__bar {
  width: 40px;
  background: rgba(141, 185, 253, 0.24);
  border-top: 2px solid #2c64e3;
  border-bottom: 2px solid #2c64e3;
}
.dps-cards {
  display: none;
  flex-direction: column;
  gap: 12px;
}
.dps-card {
  border: 1px solid #ebedf0;
  border-radius: 8px;
  padding: 14px 16px;
  background: #ffffff;
}
.dps-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.dps-card-values {
  display: flex;
  gap: 12px;
  font-size: 13px;
  font-weight: 500;
  line-height: 16px;
  color: #2d2c2e;
}
@media (max-width: 1024px) {
  .dps {
    padding: 32px 24px 48px;
  }
}
@media (max-width: 767px) {
  .dps {
    padding: 20px 16px 40px;
  }
  .dps-table-wrap {
    display: none;
  }
  .dps-cards {
    display: flex;
  }
}
`;

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
    <div className="dps-toast" role="status" aria-live="polite">
      Скопировано в буфер
    </div>
  ) : null;

  return { copyText, copyNotice };
}

function SpacingVisual({ token }: { token: SpacingToken }) {
  return (
    <div className="dps-visual">
      <div
        className="dps-visual__bar"
        style={{ height: spacingPreviewHeight(token) }}
        aria-hidden="true"
      />
    </div>
  );
}

function SpacingTable({
  tokens,
  onCopyText,
}: {
  tokens: SpacingToken[];
  onCopyText: (text: string) => void;
}) {
  return (
    <div className="dps-table-wrap ds-token-table-wrap">
      <table className="ds-token-table dps-table">
        <thead>
          <tr>
            <th className="dps-col-name">Название</th>
            <th className="dps-col-visual">Превью</th>
            <th className="dps-col-px">px</th>
            <th className="dps-col-rem">rem</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr key={token.id}>
              <td className="dps-col-name">
                <button
                  type="button"
                  className="dps-copyable dps-name"
                  onClick={() => {
                    void onCopyText(token.name);
                  }}
                >
                  {token.name}
                </button>
              </td>
              <td className="dps-col-visual">
                <SpacingVisual token={token} />
              </td>
              <td className="dps-col-px">
                <button
                  type="button"
                  className="dps-copyable"
                  onClick={() => {
                    void onCopyText(token.valuePxLabel);
                  }}
                >
                  {token.valuePxLabel}
                </button>
              </td>
              <td className="dps-col-rem">
                <button
                  type="button"
                  className="dps-copyable"
                  onClick={() => {
                    void onCopyText(token.valueRemLabel);
                  }}
                >
                  {token.valueRemLabel}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SpacingCards({
  tokens,
  onCopyText,
}: {
  tokens: SpacingToken[];
  onCopyText: (text: string) => void;
}) {
  return (
    <div className="dps-cards">
      {tokens.map((token) => (
        <article key={token.id} className="dps-card">
          <div className="dps-card-head">
            <button
              type="button"
              className="dps-copyable dps-name"
              onClick={() => {
                void onCopyText(token.name);
              }}
            >
              {token.name}
            </button>
            <div className="dps-card-values">
              <button
                type="button"
                className="dps-copyable"
                onClick={() => {
                  void onCopyText(token.valuePxLabel);
                }}
              >
                {token.valuePxLabel}px
              </button>
              <button
                type="button"
                className="dps-copyable"
                onClick={() => {
                  void onCopyText(token.valueRemLabel);
                }}
              >
                {token.valueRemLabel}rem
              </button>
            </div>
          </div>
          <SpacingVisual token={token} />
        </article>
      ))}
    </div>
  );
}

export function SpacingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { copyText, copyNotice } = useCopyNotice();
  const filteredTokens = useMemo(
    () => filterSpacingTokens(spacingTokens, searchQuery),
    [searchQuery],
  );

  return (
    <div className="dps">
      <style>{PAGE_STYLE}</style>

      <DsPageHeader
        title="Spacing"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Поиск токена"
        searchAriaLabel="Поиск токена"
      />

      {filteredTokens.length === 0 && searchQuery.trim() ? (
        <p className="dps-search-empty">Ничего не найдено</p>
      ) : (
        <>
          <SpacingTable tokens={filteredTokens} onCopyText={copyText} />
          <SpacingCards tokens={filteredTokens} onCopyText={copyText} />
        </>
      )}

      {spacingChangelog ? <ChangelogTable data={spacingChangelog} /> : null}

      {copyNotice}
    </div>
  );
}
