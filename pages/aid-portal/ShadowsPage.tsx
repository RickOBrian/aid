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
  font-family: var(--pf-type-family-sans-1);
  color: var(--pf-text-primary);
  background: var(--pf-bg-surface-main);
  min-height: 100vh;
  padding: var(--pf-spacing-40) var(--pf-spacing-48) var(--pf-spacing-64);
}
.dsp-search-empty {
  margin: 0;
  padding: var(--pf-spacing-24) 0;
  color: var(--pf-text-secondary);
  font: var(--pf-font-body-m);
}
.dsp-data {
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-m);
  overflow: hidden;
}
.dsp-group-head {
  padding: var(--pf-spacing-12) var(--pf-spacing-16);
  background: var(--pf-bg-surface-muted);
  border-top: 1px solid var(--pf-line-default);
  border-bottom: 1px solid var(--pf-line-default);
  /* pf-gap: label-m 14/20·500 — до него прежний размер 13/16 */
  font-size: 13px;
  font-weight: var(--pf-type-weight-500);
  line-height: 16px;
  color: var(--pf-text-primary);
}
.dsp-data > .dsp-group-head:first-child {
  border-top: none;
}
.dsp-style-row {
  display: flex;
  gap: var(--pf-spacing-48);
  align-items: flex-start;
  padding: var(--pf-spacing-24) var(--pf-spacing-16);
  background: var(--pf-bg-surface-main);
  border-bottom: 1px solid var(--pf-line-default);
}
.dsp-style-row:last-child {
  border-bottom: none;
}
.dsp-sample {
  flex: 0 1 400px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--pf-spacing-16);
}
.dsp-sample__label {
  margin: 0;
  font: var(--pf-font-label-xs-caps);
  letter-spacing: var(--pf-tracking-label-xs-caps);
  text-transform: uppercase;
  color: var(--pf-text-secondary);
}
.dsp-sample__preview {
  width: 200px;
  height: 80px;
  border-radius: var(--pf-radius-xl);
  background: var(--pf-bg-surface-main);
}
.dsp-sample__caption {
  margin: 0;
  /* pf-gap: body-xs 12/16·400 — до него прежний размер 11/14 */
  font-size: 11px;
  line-height: 14px;
  color: var(--pf-text-secondary);
  white-space: pre-wrap;
}
.dsp-token-table-wrap {
  flex: 1 1 580px;
  min-width: 0;
}
.ds-token-table tbody tr:nth-child(even):not(.dsp-token-table__level) td {
  background: var(--pf-bg-surface-zebra);
}
.dsp-token-table__level td {
  background: var(--pf-bg-surface-muted);
  /* pf-gap: label-m 14/20·500 — до него прежний размер 13 */
  font-size: 13px;
  font-weight: var(--pf-type-weight-500);
  color: var(--pf-text-primary);
}
.dsp-col-param {
  width: 160px;
  min-width: 120px;
  color: var(--pf-text-primary);
}
.dsp-col-value {
  width: 130px;
  min-width: 100px;
  font-weight: var(--pf-type-weight-500);
  color: var(--pf-text-primary);
}
.dsp-col-token {
  color: var(--pf-text-secondary);
  white-space: nowrap;
}
.dsp-mode-field {
  display: flex;
  flex-direction: column;
  gap: var(--pf-spacing-4);
}
.dsp-mode-field span {
  font: var(--pf-font-label-xs-caps);
  letter-spacing: var(--pf-tracking-label-xs-caps);
  text-transform: uppercase;
  color: var(--pf-text-secondary);
}
.dsp-mode-segment {
  display: inline-flex;
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-m);
  background: var(--pf-bg-surface-main);
}
.dsp-mode-segment > button:first-child { border-top-left-radius: inherit; border-bottom-left-radius: inherit; }
.dsp-mode-segment > button:last-child { border-top-right-radius: inherit; border-bottom-right-radius: inherit; }
.dsp-mode-segment > button:focus-visible { position: relative; z-index: 1; }
.dsp-mode-segment button {
  margin: 0;
  padding: var(--pf-spacing-6) var(--pf-spacing-12);
  border: none;
  border-right: 1px solid var(--pf-line-default);
  background: transparent;
  font: inherit;
  /* pf-gap: label-m 14/20·500 — до него прежний размер 13 */
  font-size: 13px;
  cursor: pointer;
  color: var(--pf-text-primary);
}
.dsp-mode-segment button:last-child {
  border-right: none;
}
.dsp-mode-segment button[aria-pressed="true"] {
  background: var(--ds-selected-bg);
  color: var(--ds-selected-text);
  font-weight: var(--pf-type-weight-500);
}
.dsp-mode-segment button:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
@media (max-width: 1023px) {
  .dsp {
    padding: var(--pf-spacing-32) var(--pf-spacing-24) var(--pf-spacing-48);
  }
  .dsp-style-row {
    gap: var(--pf-spacing-24);
    padding: var(--pf-spacing-20) var(--pf-spacing-16);
  }
}
@media (max-width: 767px) {
  .dsp {
    padding: var(--pf-spacing-20) var(--pf-spacing-16) var(--pf-spacing-40);
  }
  .dsp-style-row {
    flex-direction: column;
    gap: var(--pf-spacing-16);
    padding: var(--pf-spacing-16);
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
