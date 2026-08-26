import { Fragment, useMemo, useRef, useState } from 'react';
import { ChangelogTable } from './ChangelogTable';
import { DsPageHeader } from './DsPageHeader';
import { DS_TOKEN_JSON_ACTIONS_STYLE, TokenJsonActions } from './dsTokenJsonActions';
import { DS_CHANGELOG_TABLE_STYLE, DS_COPYABLE_STYLE, DS_TOAST_STYLE, DS_TOKEN_TABLE_STYLE } from './dsChangelogTable';
import { stringifyTokenJson } from './exportTokenJson';
import { loadTokenChangelog } from './loadTokenChangelog';
import {
  buildGlassTableRows,
  filterGlassSections,
  riderGlassCollection,
  riderGlassPreviewStyle,
  riderGlassPreviewSurfaceStyle,
  riderGlassSections,
  riderGlassStyles,
  type GlassColorMode,
  type RiderGlassStyle,
} from './products/rider/glassData';

const PAGE_STYLE = `
${DS_CHANGELOG_TABLE_STYLE}
${DS_COPYABLE_STYLE}
${DS_TOAST_STYLE}
${DS_TOKEN_JSON_ACTIONS_STYLE}
${DS_TOKEN_TABLE_STYLE}
.dgp,
.dgp *,
.dgp *::before,
.dgp *::after {
  box-sizing: border-box;
}
.dgp {
  font-family: 'Google Sans', system-ui, sans-serif;
  color: #2d2c2e;
  background: #ffffff;
  min-height: 100vh;
  padding: 40px 48px 64px;
}
.dgp-search-empty {
  margin: 0;
  padding: 24px 0;
  color: rgba(0, 0, 0, 0.54);
  font-size: 14px;
  line-height: 20px;
}
.dgp-data {
  border: 1px solid #ebedf0;
  border-radius: 8px;
  overflow: hidden;
}
.dgp-group-head {
  padding: 12px 16px;
  background: #f5f5f5;
  border-top: 1px solid #ebedf0;
  border-bottom: 1px solid #ebedf0;
  font-size: 13px;
  font-weight: 500;
  line-height: 16px;
  color: #2d2c2e;
}
.dgp-data > .dgp-group-head:first-child {
  border-top: none;
}
.dgp-style-row {
  display: flex;
  gap: 48px;
  align-items: flex-start;
  padding: 24px 16px;
  background: #ffffff;
  border-bottom: 1px solid #ebedf0;
}
.dgp-style-row:last-child {
  border-bottom: none;
}
.dgp-sample {
  flex: 0 1 400px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.dgp-sample__label {
  margin: 0;
  font-size: 11px;
  font-weight: 500;
  line-height: 14px;
  color: rgba(0, 0, 0, 0.54);
}
.dgp-sample__stage {
  position: relative;
  width: 280px;
  padding: 24px;
  border-radius: 12px;
  background:
    linear-gradient(135deg, rgba(151, 71, 255, 0.15) 0%, rgba(61, 106, 254, 0.12) 50%, rgba(255, 180, 80, 0.14) 100%),
    repeating-linear-gradient(
      45deg,
      rgba(0, 0, 0, 0.04) 0,
      rgba(0, 0, 0, 0.04) 8px,
      rgba(255, 255, 255, 0.5) 8px,
      rgba(255, 255, 255, 0.5) 16px
    );
}
.dgp-sample__preview {
  pointer-events: none;
}
.dgp-sample__caption {
  margin: 0;
  font-size: 11px;
  line-height: 14px;
  color: rgba(0, 0, 0, 0.38);
  white-space: pre-wrap;
}
.dgp-token-table-wrap {
  flex: 1 1 580px;
  min-width: 0;
}
.ds-token-table tbody tr:nth-child(even):not(.dgp-token-table__group) td {
  background: #fafafa;
}
.dgp-token-table__group td {
  background: #f5f5f5;
  font-size: 13px;
  font-weight: 500;
  color: #2d2c2e;
}
.dgp-col-param {
  width: 160px;
  min-width: 120px;
  color: #2d2c2e;
}
.dgp-col-value {
  width: 130px;
  min-width: 100px;
  font-weight: 500;
  color: #2d2c2e;
}
.dgp-col-token {
  color: rgba(0, 0, 0, 0.54);
  white-space: nowrap;
}
.dgp-mode-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dgp-mode-field span {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.45);
}
.dgp-mode-segment {
  display: inline-flex;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}
.dgp-mode-segment button {
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
.dgp-mode-segment button:last-child {
  border-right: none;
}
.dgp-mode-segment button[aria-pressed="true"] {
  background: var(--ds-accent-bg);
  color: var(--ds-accent);
  font-weight: 500;
}
.dgp-mode-segment button:focus-visible {
  outline: 2px solid var(--ds-accent);
  outline-offset: -2px;
}
@media (max-width: 1024px) {
  .dgp {
    padding: 32px 24px 48px;
  }
  .dgp-style-row {
    gap: 24px;
    padding: 20px 16px;
  }
}
@media (max-width: 767px) {
  .dgp {
    padding: 20px 16px 40px;
  }
  .dgp-style-row {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }
  .dgp-sample {
    flex-basis: auto;
    width: 100%;
  }
  .dgp-token-table-wrap {
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
    <div className="ds-toast" role="status" aria-live="polite">
      Скопировано в буфер
    </div>
  ) : null;

  return { copyText, copyNotice };
}

function ModeSegmentControl({
  value,
  onChange,
}: {
  value: GlassColorMode;
  onChange: (mode: GlassColorMode) => void;
}) {
  return (
    <div className="dgp-mode-field">
      <span id="dgp-mode-label">Режим</span>
      <div className="dgp-mode-segment" role="group" aria-labelledby="dgp-mode-label">
        <button type="button" aria-pressed={value === 'day'} onClick={() => onChange('day')}>
          Day
        </button>
        <button type="button" aria-pressed={value === 'night'} onClick={() => onChange('night')}>
          Night
        </button>
      </div>
    </div>
  );
}

function GlassTokenTable({
  item,
  onCopyText,
}: {
  item: RiderGlassStyle;
  onCopyText: (text: string) => void;
}) {
  const rows = buildGlassTableRows(item);

  return (
    <div className="dgp-token-table-wrap ds-token-table-wrap">
      <table className="ds-token-table">
        <thead>
          <tr>
            <th className="dgp-col-param">Параметр</th>
            <th className="dgp-col-value">Day</th>
            <th className="dgp-col-value">Night</th>
            <th className="dgp-col-token">Токен</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            if (row.kind === 'group') {
              return (
                <tr key={row.key} className="dgp-token-table__group">
                  <td colSpan={4}>{row.label}</td>
                </tr>
              );
            }

            return (
              <tr key={row.key}>
                <td className="dgp-col-param">{row.parameterLabel}</td>
                <td className="dgp-col-value">{row.dayValue}</td>
                <td className="dgp-col-value">{row.nightValue}</td>
                <td className="dgp-col-token">
                  <button
                    type="button"
                    className="ds-copyable"
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

function GlassStyleRow({
  item,
  mode,
  onCopyText,
}: {
  item: RiderGlassStyle;
  mode: GlassColorMode;
  onCopyText: (text: string) => void;
}) {
  return (
    <article className="dgp-style-row">
      <div className="dgp-sample">
        <p className="dgp-sample__label">{item.name}</p>
        <div className="dgp-sample__stage">
          <div className="dgp-sample__preview" style={riderGlassPreviewStyle(item, mode)}>
            <div style={riderGlassPreviewSurfaceStyle(item, mode)} aria-hidden />
          </div>
        </div>
        <p className="dgp-sample__caption">{item.caption}</p>
      </div>
      <GlassTokenTable item={item} onCopyText={onCopyText} />
    </article>
  );
}

export function GlassPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState<GlassColorMode>('day');
  const { copyText, copyNotice } = useCopyNotice();
  const glassChangelog = useMemo(
    () => loadTokenChangelog(riderGlassCollection.collectionName),
    [],
  );
  const filteredSections = useMemo(
    () => filterGlassSections(riderGlassSections, searchQuery),
    [searchQuery],
  );
  const glassTokensJson = useMemo(
    () =>
      stringifyTokenJson({
        collectionName: riderGlassCollection.collectionName,
        artifact: riderGlassCollection.artifact,
        mode,
        tokens: riderGlassStyles.map((item) => ({
          name: item.tokenName,
          id: item.id,
          caption: item.caption,
          groups: item.groups.map((group) => ({
            title: group.title,
            parameters: group.parameters.map((parameter) => ({
              id: parameter.id,
              label: parameter.label,
              day: parameter.day,
              night: parameter.night,
              token: `${item.tokenName}/${group.title === 'Glass' ? 'Glass' : group.title}/${parameter.id}`,
            })),
          })),
        })),
      }),
    [mode],
  );
  const hasTokens = riderGlassStyles.length > 0;

  return (
    <div className="dgp">
      <style>{PAGE_STYLE}</style>

      <DsPageHeader
        title="Glass"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Поиск стиля или параметра"
        searchAriaLabel="Поиск стиля или параметра"
        actions={(
          <>
            <ModeSegmentControl value={mode} onChange={setMode} />
            <TokenJsonActions
              filename={riderGlassCollection.artifact.replace(/\//g, ' ')}
              json={glassTokensJson}
              disabled={!hasTokens}
              onCopyText={copyText}
            />
          </>
        )}
      />

      {filteredSections.length === 0 && searchQuery.trim() ? (
        <p className="dgp-search-empty">Ничего не найдено</p>
      ) : (
        <div className="dgp-data">
          {filteredSections.map((section) => (
            <Fragment key={section.id}>
              <div className="dgp-group-head">{section.title}</div>
              {section.items.map((item) => (
                <GlassStyleRow key={item.id} item={item} mode={mode} onCopyText={copyText} />
              ))}
            </Fragment>
          ))}
        </div>
      )}

      {glassChangelog ? <ChangelogTable data={glassChangelog} /> : null}

      {copyNotice}
    </div>
  );
}
