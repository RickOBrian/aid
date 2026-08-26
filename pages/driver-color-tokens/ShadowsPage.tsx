import { Fragment, useMemo, useRef, useState } from 'react';
import { ChangelogTable } from './ChangelogTable';
import { DsPageHeader } from './DsPageHeader';
import { DS_TOKEN_JSON_ACTIONS_STYLE, TokenJsonActions } from './dsTokenJsonActions';
import { DS_CHANGELOG_TABLE_STYLE, DS_COPYABLE_STYLE, DS_TOAST_STYLE, DS_TOKEN_TABLE_STYLE } from './dsChangelogTable';
import { stringifyTokenJson, TOKEN_JSON_FILENAMES } from './exportTokenJson';
import {
  buildShadowTableRows,
  shadowPreviewStyle,
  type ShadowSection,
  type ShadowStyle,
} from './shadowsData';
import { loadTokenChangelog } from './loadTokenChangelog';
import { filterShadowSections } from './searchShadows';
import { DEFAULT_PRODUCT_ID } from './productRegistry';
import {
  DEFAULT_SHADOW_MODE,
  getProductShadowContent,
  type ShadowColorMode,
} from './productShadowData';
import {
  buildRiderShadowTableRows,
  riderShadowPreviewStyle,
  type RiderShadowStyle,
} from './products/rider/shadowData';

const PAGE_STYLE = `
${DS_CHANGELOG_TABLE_STYLE}
${DS_COPYABLE_STYLE}
${DS_TOAST_STYLE}
${DS_TOKEN_JSON_ACTIONS_STYLE}
${DS_TOKEN_TABLE_STYLE}
.dsp,
.dsp *,
.dsp *::before,
.dsp *::after {
  box-sizing: border-box;
}
.dsp {
  font-family: 'Google Sans', system-ui, sans-serif;
  color: #2d2c2e;
  background: #ffffff;
  min-height: 100vh;
  padding: 40px 48px 64px;
}
.dsp-search-empty {
  margin: 0;
  padding: 24px 0;
  color: rgba(0, 0, 0, 0.54);
  font-size: 14px;
  line-height: 20px;
}
.dsp-data {
  border: 1px solid #ebedf0;
  border-radius: 8px;
  overflow: hidden;
}
.dsp-group-head {
  padding: 12px 16px;
  background: #f5f5f5;
  border-top: 1px solid #ebedf0;
  border-bottom: 1px solid #ebedf0;
  font-size: 13px;
  font-weight: 500;
  line-height: 16px;
  color: #2d2c2e;
}
.dsp-data > .dsp-group-head:first-child {
  border-top: none;
}
.dsp-style-row {
  display: flex;
  gap: 48px;
  align-items: flex-start;
  padding: 24px 16px;
  background: #ffffff;
  border-bottom: 1px solid #ebedf0;
}
.dsp-style-row:last-child {
  border-bottom: none;
}
.dsp-sample {
  flex: 0 1 400px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.dsp-sample__label {
  margin: 0;
  font-size: 11px;
  font-weight: 500;
  line-height: 14px;
  color: rgba(0, 0, 0, 0.54);
}
.dsp-sample__preview {
  width: 200px;
  height: 80px;
  border-radius: 16px;
  background: #ffffff;
}
.dsp-sample__caption {
  margin: 0;
  font-size: 11px;
  line-height: 14px;
  color: rgba(0, 0, 0, 0.38);
  white-space: pre-wrap;
}
.dsp-token-table-wrap {
  flex: 1 1 580px;
  min-width: 0;
}
.ds-token-table tbody tr:nth-child(even):not(.dsp-token-table__level) td {
  background: #fafafa;
}
.dsp-token-table__level td {
  background: #f5f5f5;
  font-size: 13px;
  font-weight: 500;
  color: #2d2c2e;
}
.dsp-col-param {
  width: 160px;
  min-width: 120px;
  color: #2d2c2e;
}
.dsp-col-value {
  width: 130px;
  min-width: 100px;
  font-weight: 500;
  color: #2d2c2e;
}
.dsp-col-token {
  color: rgba(0, 0, 0, 0.54);
  white-space: nowrap;
}
.dsp-mode-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dsp-mode-field span {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.45);
}
.dsp-mode-segment {
  display: inline-flex;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}
.dsp-mode-segment button {
  margin: 0;
  padding: 6px 12px;
  border: none;
  border-right: 1px solid #ebedf0;
  background: transparent;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.7);
}
.dsp-mode-segment button:last-child {
  border-right: none;
}
.dsp-mode-segment button[aria-pressed="true"] {
  background: var(--ds-accent-bg);
  color: var(--ds-accent);
  font-weight: 500;
}
.dsp-mode-segment button:focus-visible {
  outline: 2px solid var(--ds-accent);
  outline-offset: -2px;
}
@media (max-width: 1024px) {
  .dsp {
    padding: 32px 24px 48px;
  }
  .dsp-style-row {
    gap: 24px;
    padding: 20px 16px;
  }
}
@media (max-width: 767px) {
  .dsp {
    padding: 20px 16px 40px;
  }
  .dsp-style-row {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }
  .dsp-sample {
    flex-basis: auto;
    width: 100%;
  }
  .dsp-token-table-wrap {
    flex-basis: auto;
    width: 100%;
  }
  .ds-token-table {
    min-width: 520px;
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
    <div className="dsp-toast" role="status" aria-live="polite">
      Скопировано в буфер
    </div>
  ) : null;

  return { copyText, copyNotice };
}

function ModeSegmentControl({
  value,
  onChange,
}: {
  value: ShadowColorMode;
  onChange: (mode: ShadowColorMode) => void;
}) {
  return (
    <div className="dsp-mode-field">
      <span id="dsp-mode-label">Режим</span>
      <div className="dsp-mode-segment" role="group" aria-labelledby="dsp-mode-label">
        <button
          type="button"
          aria-pressed={value === 'day'}
          onClick={() => onChange('day')}
        >
          Day
        </button>
        <button
          type="button"
          aria-pressed={value === 'night'}
          onClick={() => onChange('night')}
        >
          Night
        </button>
      </div>
    </div>
  );
}

function ShadowTokenTable({
  item,
  onCopyText,
}: {
  item: ShadowStyle;
  onCopyText: (text: string) => void;
}) {
  const rows = buildShadowTableRows(item);

  return (
    <div className="dsp-token-table-wrap ds-token-table-wrap">
      <table className="ds-token-table">
        <thead>
          <tr>
            <th className="dsp-col-param">Параметр</th>
            <th className="dsp-col-value">Значение</th>
            <th className="dsp-col-token">Токен</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            if (row.kind === 'level') {
              return (
                <tr key={row.key} className="dsp-token-table__level">
                  <td colSpan={3}>{row.label}</td>
                </tr>
              );
            }

            return (
              <tr key={row.key}>
                <td className="dsp-col-param">{row.parameterLabel}</td>
                <td className="dsp-col-value">{row.value}</td>
                <td className="dsp-col-token">
                  <button
                    type="button"
                    className="dsp-copyable"
                    onClick={() => {
                      void onCopyText(row.token);
                    }}
                  >
                    {row.token}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RiderShadowTokenTable({
  item,
  onCopyText,
}: {
  item: RiderShadowStyle;
  onCopyText: (text: string) => void;
}) {
  const rows = buildRiderShadowTableRows(item);

  return (
    <div className="dsp-token-table-wrap ds-token-table-wrap">
      <table className="ds-token-table">
        <thead>
          <tr>
            <th className="dsp-col-param">Параметр</th>
            <th className="dsp-col-value">Day</th>
            <th className="dsp-col-value">Night</th>
            <th className="dsp-col-token">Токен</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            if (row.kind === 'level') {
              return (
                <tr key={row.key} className="dsp-token-table__level">
                  <td colSpan={4}>{row.label}</td>
                </tr>
              );
            }

            return (
              <tr key={row.key}>
                <td className="dsp-col-param">{row.parameterLabel}</td>
                <td className="dsp-col-value">{row.dayValue}</td>
                <td className="dsp-col-value">{row.nightValue}</td>
                <td className="dsp-col-token">
                  <button
                    type="button"
                    className="dsp-copyable"
                    onClick={() => {
                      void onCopyText(row.token);
                    }}
                  >
                    {row.token}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ShadowStyleRow({
  item,
  onCopyText,
}: {
  item: ShadowStyle;
  onCopyText: (text: string) => void;
}) {
  return (
    <article className="dsp-style-row">
      <div className="dsp-sample">
        <p className="dsp-sample__label">{item.name}</p>
        <div className="dsp-sample__preview" style={shadowPreviewStyle(item)} />
        <p className="dsp-sample__caption">{item.caption}</p>
      </div>
      <ShadowTokenTable item={item} onCopyText={onCopyText} />
    </article>
  );
}

function RiderShadowStyleRow({
  item,
  mode,
  onCopyText,
}: {
  item: RiderShadowStyle;
  mode: ShadowColorMode;
  onCopyText: (text: string) => void;
}) {
  return (
    <article className="dsp-style-row">
      <div className="dsp-sample">
        <p className="dsp-sample__label">{item.name}</p>
        <div className="dsp-sample__preview" style={riderShadowPreviewStyle(item, mode)} />
        <p className="dsp-sample__caption">{item.caption}</p>
      </div>
      <RiderShadowTokenTable item={item} onCopyText={onCopyText} />
    </article>
  );
}

function ShadowDataTable({
  sections,
  riderStyles,
  mode,
  onCopyText,
}: {
  sections: ShadowSection[];
  riderStyles: RiderShadowStyle[] | null;
  mode: ShadowColorMode;
  onCopyText: (text: string) => void;
}) {
  const riderStyleIds = new Set(riderStyles?.map((item) => item.id));

  return (
    <div className="dsp-data">
      {sections.map((section) => (
        <Fragment key={section.id}>
          <div className="dsp-group-head">{section.title}</div>
          {section.items.map((item) =>
            riderStyles && riderStyleIds.has(item.id) ? (
              <RiderShadowStyleRow
                key={item.id}
                item={riderStyles.find((style) => style.id === item.id)!}
                mode={mode}
                onCopyText={onCopyText}
              />
            ) : (
              <ShadowStyleRow key={item.id} item={item} onCopyText={onCopyText} />
            ),
          )}
        </Fragment>
      ))}
    </div>
  );
}

export function ShadowsPage({ productId = DEFAULT_PRODUCT_ID }: { productId?: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState<ShadowColorMode>(DEFAULT_SHADOW_MODE);
  const { copyText, copyNotice } = useCopyNotice();
  const { sections, riderStyles, collection, modes } = useMemo(
    () => getProductShadowContent(productId, mode),
    [productId, mode],
  );
  const shadowsChangelog = useMemo(
    () => loadTokenChangelog(collection.collectionName),
    [collection.collectionName],
  );
  const filteredSections = useMemo(
    () => filterShadowSections(sections, searchQuery),
    [sections, searchQuery],
  );
  const filteredRiderStyles = useMemo(() => {
    if (!riderStyles) {
      return null;
    }
    const visibleIds = new Set(filteredSections.flatMap((section) => section.items.map((item) => item.id)));
    return riderStyles.filter((item) => visibleIds.has(item.id));
  }, [filteredSections, riderStyles]);
  const shadowsTokensJson = useMemo(
    () =>
      stringifyTokenJson({
        collectionName: collection.collectionName,
        artifact: collection.artifact,
        ...(modes ? { mode } : {}),
        tokens: sections.flatMap((section) =>
          section.items.map((item) => ({
            name: item.tokenName,
            id: item.id,
            caption: item.caption,
            boxShadow: item.previewBoxShadow,
            layers: item.layers.map(({ level, offsetX, offsetY, blur, color }) => ({
              ...(level !== undefined ? { level } : {}),
              offsetX,
              offsetY,
              blur,
              color,
            })),
          })),
        ),
      }),
    [collection, mode, modes, sections],
  );
  const exportFilename =
    productId === 'rider'
      ? collection.artifact.replace(/\//g, ' ')
      : TOKEN_JSON_FILENAMES.shadows;
  const hasTokens = sections.some((section) => section.items.length > 0);

  return (
    <div className="dsp">
      <style>{PAGE_STYLE}</style>

      <DsPageHeader
        title="Shadows"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Поиск тени"
        searchAriaLabel="Поиск тени"
        actions={(
          <>
            {modes ? <ModeSegmentControl value={mode} onChange={setMode} /> : null}
            <TokenJsonActions
              filename={exportFilename}
              json={shadowsTokensJson}
              disabled={!hasTokens}
              onCopyText={copyText}
            />
          </>
        )}
      />

      {filteredSections.length === 0 && searchQuery.trim() ? (
        <p className="dsp-search-empty">Ничего не найдено</p>
      ) : (
        <ShadowDataTable
          sections={filteredSections}
          riderStyles={filteredRiderStyles}
          mode={mode}
          onCopyText={copyText}
        />
      )}

      {shadowsChangelog ? <ChangelogTable data={shadowsChangelog} /> : null}

      {copyNotice}
    </div>
  );
}
