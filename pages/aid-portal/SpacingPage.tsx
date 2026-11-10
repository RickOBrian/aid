import { useMemo, useRef, useState } from 'react';
import { ChangelogTable } from './ChangelogTable';
import { DsPageHeader } from './DsPageHeader';
import { DS_TOKEN_JSON_ACTIONS_STYLE, TokenJsonActions } from './dsTokenJsonActions';
import { DS_CHANGELOG_TABLE_STYLE, DS_COPYABLE_STYLE, DS_TOAST_STYLE } from './dsChangelogTable';
import { stringifyTokenJson } from './exportTokenJson';
import { loadTokenChangelog } from './loadTokenChangelog';
import { spacingPreviewHeight, type SpacingToken } from './spacingData';
import { filterSpacingTokens } from './searchSpacing';
import { DEFAULT_PRODUCT_ID } from './productRegistry';
import { getProductSpacingContent } from './productSpacingData';

const PAGE_STYLE = `
${DS_CHANGELOG_TABLE_STYLE}
${DS_COPYABLE_STYLE}
${DS_TOAST_STYLE}
${DS_TOKEN_JSON_ACTIONS_STYLE}
.dps,
.dps *,
.dps *::before,
.dps *::after {
  box-sizing: border-box;
}
.dps {
  font-family: var(--pf-type-family-sans-1);
  color: var(--pf-text-primary);
  background: var(--pf-bg-surface-main);
  min-height: 100vh;
  padding: var(--pf-spacing-40) var(--pf-spacing-48) var(--pf-spacing-64);
}
.dps-search-empty {
  margin: 0;
  padding: var(--pf-spacing-24) 0;
  color: var(--pf-text-secondary);
  font: var(--pf-font-body-m);
}
.dps-table-wrap {
  min-width: 0;
}
.dps-table {
  min-width: 560px;
}
.dps-table td {
  padding: var(--pf-spacing-12) var(--pf-spacing-16);
}
.dps-col-name {
  min-width: 200px;
}
.dps-name {
  /* pf-gap: label-m 14/20·500 — имя токена; размер прежний */
  font-size: 14px;
  line-height: 20px;
  font-weight: var(--pf-type-weight-500);
  color: var(--pf-text-primary);
}
.dps-col-visual {
  width: 120px;
}
.dps-col-px,
.dps-col-rem {
  min-width: 96px;
  font-weight: var(--pf-type-weight-500);
}
.dps-visual {
  display: flex;
  align-items: center;
  min-height: 48px;
}
.dps-visual__bar {
  display: flex;
  flex-direction: column;
  width: 40px;
}
.dps-visual__bar-line {
  flex-shrink: 0;
  height: 2px;
  background: var(--pf-bg-accent-vivid-main);
}
.dps-visual__bar-fill {
  flex-shrink: 0;
  width: 100%;
  background: var(--pf-bg-accent-vivid-fade);
}
.dps-cards {
  display: none;
  flex-direction: column;
  gap: var(--pf-spacing-12);
}
.dps-card {
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-m);
  padding: var(--pf-spacing-16) var(--pf-spacing-16);
  background: var(--pf-bg-surface-main);
}
.dps-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--pf-spacing-12);
  margin-bottom: var(--pf-spacing-12);
}
.dps-card-values {
  display: flex;
  gap: var(--pf-spacing-12);
  font: var(--pf-font-code-s);
  color: var(--pf-text-primary);
}
@media (max-width: 1023px) {
  .dps {
    padding: var(--pf-spacing-32) var(--pf-spacing-24) var(--pf-spacing-48);
  }
}
@media (max-width: 767px) {
  .dps {
    padding: var(--pf-spacing-20) var(--pf-spacing-16) var(--pf-spacing-40);
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
      <div className="dps-visual__bar" aria-hidden="true">
        <div className="dps-visual__bar-line" />
        <div
          className="dps-visual__bar-fill"
          style={{ height: spacingPreviewHeight(token) }}
        />
        <div className="dps-visual__bar-line" />
      </div>
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

export function SpacingPage({ productId = DEFAULT_PRODUCT_ID }: { productId?: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { copyText, copyNotice } = useCopyNotice();
  const { tokens, collection } = useMemo(
    () => getProductSpacingContent(productId),
    [productId],
  );
  const spacingChangelog = useMemo(
    () => loadTokenChangelog(collection.collectionName),
    [collection.collectionName],
  );
  const filteredTokens = useMemo(
    () => filterSpacingTokens(tokens, searchQuery),
    [tokens, searchQuery],
  );
  const spacingTokensJson = useMemo(
    () =>
      stringifyTokenJson({
        collectionName: collection.collectionName,
        artifact: collection.artifact,
        tokens: tokens.map(({ name, valuePx, valueRemLabel }) => ({
          name,
          valuePx,
          valueRem: valueRemLabel,
        })),
      }),
    [collection, tokens],
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
        actions={(
          <TokenJsonActions
            filename={collection.artifact.replace(/\//g, ' ')}
            json={spacingTokensJson}
            disabled={tokens.length === 0}
            onCopyText={copyText}
          />
        )}
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
