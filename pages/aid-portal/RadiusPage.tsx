import { useMemo, useRef, useState } from 'react';
import { ChangelogTable } from './ChangelogTable';
import { DsPageHeader } from './DsPageHeader';
import { DS_TOKEN_JSON_ACTIONS_STYLE, TokenJsonActions } from './dsTokenJsonActions';
import { DS_CHANGELOG_TABLE_STYLE, DS_COPYABLE_STYLE, DS_TOAST_STYLE } from './dsChangelogTable';
import {
  stringifyTokenJson,
  TOKEN_JSON_FILENAMES,
} from './exportTokenJson';
import { loadTokenChangelog } from './loadTokenChangelog';
import { type RadiusToken } from './radiusData';
import { filterRadiusTokens } from './searchRadius';
import { DEFAULT_PRODUCT_ID } from './productRegistry';
import { getProductRadiusContent, radiusPreviewStyle } from './productRadiusData';

const PAGE_STYLE = `
${DS_CHANGELOG_TABLE_STYLE}
${DS_COPYABLE_STYLE}
${DS_TOAST_STYLE}
${DS_TOKEN_JSON_ACTIONS_STYLE}
.drp,
.drp *,
.drp *::before,
.drp *::after {
  box-sizing: border-box;
}
.drp {
  font-family: 'Google Sans', system-ui, sans-serif;
  color: #2d2c2e;
  background: #ffffff;
  min-height: 100vh;
  padding: 40px 48px 64px;
}
.drp-search-empty {
  margin: 0;
  padding: 24px 0;
  color: rgba(0, 0, 0, 0.54);
  font-size: 14px;
  line-height: 20px;
}
.drp-table-wrap {
  min-width: 0;
}
.drp-table {
  min-width: 440px;
}
.drp-table td {
  padding: 12px 16px;
}
.drp-col-name {
  min-width: 200px;
}
.drp-name {
  font-size: 14px;
  line-height: 20px;
  color: #2d2c2e;
}
.drp-col-visual {
  width: 120px;
}
.drp-col-value {
  min-width: 120px;
  font-weight: 500;
}
.drp-visual {
  width: 48px;
  height: 48px;
  background: var(--ds-accent-bg);
  border-top: 4px solid var(--ds-accent);
  border-right: 4px solid var(--ds-accent);
  border-bottom: none;
  border-left: none;
}
.drp-cards {
  display: none;
  flex-direction: column;
  gap: 12px;
}
.drp-card {
  border: 1px solid #ebedf0;
  border-radius: 8px;
  padding: 14px 16px;
  background: #ffffff;
}
.drp-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.drp-card-value {
  font-size: 13px;
  font-weight: 500;
  line-height: 16px;
  color: #2d2c2e;
}
@media (max-width: 1024px) {
  .drp {
    padding: 32px 24px 48px;
  }
}
@media (max-width: 767px) {
  .drp {
    padding: 20px 16px 40px;
  }
  .drp-table-wrap {
    display: none;
  }
  .drp-cards {
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
    <div className="drp-toast" role="status" aria-live="polite">
      Скопировано в буфер
    </div>
  ) : null;

  return { copyText, copyNotice };
}

function RadiusVisual({ token }: { token: RadiusToken }) {
  return <div className="drp-visual" style={radiusPreviewStyle(token)} aria-hidden="true" />;
}

function RadiusTable({
  tokens,
  onCopyText,
}: {
  tokens: RadiusToken[];
  onCopyText: (text: string) => void;
}) {
  return (
    <div className="drp-table-wrap ds-token-table-wrap">
      <table className="ds-token-table drp-table">
        <thead>
          <tr>
            <th className="drp-col-name">Название</th>
            <th className="drp-col-visual">Превью</th>
            <th className="drp-col-value">Значение</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr key={token.id}>
              <td className="drp-col-name">
                <button
                  type="button"
                  className="drp-copyable drp-name"
                  onClick={() => {
                    void onCopyText(token.name);
                  }}
                >
                  {token.name}
                </button>
              </td>
              <td className="drp-col-visual">
                <RadiusVisual token={token} />
              </td>
              <td className="drp-col-value">
                <button
                  type="button"
                  className="drp-copyable"
                  onClick={() => {
                    void onCopyText(token.valueLabel);
                  }}
                >
                  {token.valueLabel}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RadiusCards({
  tokens,
  onCopyText,
}: {
  tokens: RadiusToken[];
  onCopyText: (text: string) => void;
}) {
  return (
    <div className="drp-cards">
      {tokens.map((token) => (
        <article key={token.id} className="drp-card">
          <div className="drp-card-head">
            <button
              type="button"
              className="drp-copyable drp-name"
              onClick={() => {
                void onCopyText(token.name);
              }}
            >
              {token.name}
            </button>
            <button
              type="button"
              className="drp-copyable drp-card-value"
              onClick={() => {
                void onCopyText(token.valueLabel);
              }}
            >
              {token.valueLabel}
            </button>
          </div>
          <RadiusVisual token={token} />
        </article>
      ))}
    </div>
  );
}

export function RadiusPage({ productId = DEFAULT_PRODUCT_ID }: { productId?: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { copyText, copyNotice } = useCopyNotice();
  const { tokens, collection } = useMemo(
    () => getProductRadiusContent(productId),
    [productId],
  );
  const radiusChangelog = useMemo(
    () => loadTokenChangelog(collection.collectionName),
    [collection.collectionName],
  );
  const filteredTokens = useMemo(
    () => filterRadiusTokens(tokens, searchQuery),
    [tokens, searchQuery],
  );
  const radiusTokensJson = useMemo(
    () =>
      stringifyTokenJson({
        collectionName: collection.collectionName,
        artifact: collection.artifact,
        tokens: tokens.map(({ name, borderTopRightRadius }) => ({
          name,
          value: borderTopRightRadius,
        })),
      }),
    [collection, tokens],
  );

  return (
    <div className="drp">
      <style>{PAGE_STYLE}</style>

      <DsPageHeader
        title="Radius"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Поиск токена"
        searchAriaLabel="Поиск токена"
        actions={(
          <TokenJsonActions
            filename={productId === 'rider' ? collection.artifact : TOKEN_JSON_FILENAMES.radius}
            json={radiusTokensJson}
            disabled={tokens.length === 0}
            onCopyText={copyText}
          />
        )}
      />

      {filteredTokens.length === 0 && searchQuery.trim() ? (
        <p className="drp-search-empty">Ничего не найдено</p>
      ) : (
        <>
          <RadiusTable tokens={filteredTokens} onCopyText={copyText} />
          <RadiusCards tokens={filteredTokens} onCopyText={copyText} />
        </>
      )}

      {radiusChangelog ? <ChangelogTable data={radiusChangelog} /> : null}

      {copyNotice}
    </div>
  );
}
