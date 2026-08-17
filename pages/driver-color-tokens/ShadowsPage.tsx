import { Fragment, useMemo, useRef, useState } from 'react';
import { ChangelogTable } from './ChangelogTable';
import { DsPageHeader } from './DsPageHeader';
import { DS_TOKEN_JSON_ACTIONS_STYLE, TokenJsonActions } from './dsTokenJsonActions';
import { DS_CHANGELOG_TABLE_STYLE, DS_COPYABLE_STYLE, DS_TOAST_STYLE } from './dsChangelogTable';
import {
  exportShadowsTokenJson,
  hasShadowTokens,
  stringifyTokenJson,
  TOKEN_JSON_FILENAMES,
} from './exportTokenJson';
import {
  buildShadowTableRows,
  shadowPreviewStyle,
  shadowsCollection,
  shadowSections,
  type ShadowSection,
  type ShadowStyle,
} from './shadowsData';
import { loadTokenChangelog } from './loadTokenChangelog';
import { filterShadowSections } from './searchShadows';

const shadowsChangelog = loadTokenChangelog(shadowsCollection.collectionName);

const PAGE_STYLE = `
${DS_CHANGELOG_TABLE_STYLE}
${DS_COPYABLE_STYLE}
${DS_TOAST_STYLE}
${DS_TOKEN_JSON_ACTIONS_STYLE}
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

function ShadowDataTable({
  sections,
  onCopyText,
}: {
  sections: ShadowSection[];
  onCopyText: (text: string) => void;
}) {
  return (
    <div className="dsp-data">
      {sections.map((section) => (
        <Fragment key={section.id}>
          <div className="dsp-group-head">{section.title}</div>
          {section.items.map((item) => (
            <ShadowStyleRow key={item.id} item={item} onCopyText={onCopyText} />
          ))}
        </Fragment>
      ))}
    </div>
  );
}

export function ShadowsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { copyText, copyNotice } = useCopyNotice();
  const filteredSections = useMemo(
    () => filterShadowSections(shadowSections, searchQuery),
    [searchQuery],
  );
  const shadowsTokensJson = useMemo(
    () => stringifyTokenJson(exportShadowsTokenJson()),
    [],
  );

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
          <TokenJsonActions
            filename={TOKEN_JSON_FILENAMES.shadows}
            json={shadowsTokensJson}
            disabled={!hasShadowTokens()}
            onCopyText={copyText}
          />
        )}
      />

      {filteredSections.length === 0 && searchQuery.trim() ? (
        <p className="dsp-search-empty">Ничего не найдено</p>
      ) : (
        <ShadowDataTable sections={filteredSections} onCopyText={copyText} />
      )}

      {shadowsChangelog ? <ChangelogTable data={shadowsChangelog} /> : null}

      {copyNotice}
    </div>
  );
}
