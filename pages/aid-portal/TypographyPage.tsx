import { Fragment, useMemo, useRef, useState } from 'react';
import { ChangelogTable } from './ChangelogTable';
import { DsPageHeader } from './DsPageHeader';
import { DS_TOKEN_JSON_ACTIONS_STYLE, TokenJsonActions } from './dsTokenJsonActions';
import { DS_CHANGELOG_TABLE_STYLE, DS_COPYABLE_STYLE, DS_TOAST_STYLE } from './dsChangelogTable';
import { stringifyTokenJson } from './exportTokenJson';
import {
  formatTypographySpecCaption,
  TYPOGRAPHY_PARAMETERS,
  TYPOGRAPHY_SAMPLE_TEXT,
  typographyParameterValue,
  typographyPreviewStyle,
  typographyTokenPath,
  type TypographySection,
  type TypographyStyle,
} from './typographyData';
import {
  DEFAULT_TYPOGRAPHY_PLATFORM,
  DEFAULT_TYPOGRAPHY_SET,
  getProductTypographyContent,
  type TypographyPlatform,
  type TypographySetId,
  type TypographySetOption,
} from './productTypographyData';
import { loadTokenChangelog } from './loadTokenChangelog';
import { filterTypographySections } from './searchTypography';
import { DEFAULT_PRODUCT_ID } from './productRegistry';

const TYPOGRAPHY_PLATFORM_LABELS: Record<TypographyPlatform, string> = {
  ios: 'iOS',
  android: 'Android',
};

const PAGE_STYLE = `
${DS_CHANGELOG_TABLE_STYLE}
${DS_COPYABLE_STYLE}
${DS_TOAST_STYLE}
${DS_TOKEN_JSON_ACTIONS_STYLE}
.dtp,
.dtp *,
.dtp *::before,
.dtp *::after {
  box-sizing: border-box;
}
.dtp {
  font-family: var(--pf-type-family-sans-1);
  color: var(--pf-text-primary);
  background: var(--pf-bg-surface-main);
  min-height: 100vh;
  padding: var(--pf-spacing-40) var(--pf-spacing-48) var(--pf-spacing-64);
}
.dtp-search-empty {
  margin: 0;
  padding: var(--pf-spacing-24) 0;
  color: var(--pf-text-secondary);
  font: var(--pf-font-body-m);
}
.dtp-data {
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-m);
  overflow: hidden;
}
.dtp-group-head {
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
.dtp-data > .dtp-group-head:first-child {
  border-top: none;
}
.dtp-style-row {
  display: flex;
  gap: var(--pf-spacing-48);
  align-items: flex-start;
  padding: var(--pf-spacing-24) var(--pf-spacing-16);
  background: var(--pf-bg-surface-main);
  border-bottom: 1px solid var(--pf-line-default);
}
.dtp-style-row:last-child {
  border-bottom: none;
}
.dtp-sample {
  flex: 0 1 400px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--pf-spacing-16);
}
.dtp-sample__label {
  margin: 0;
  font: var(--pf-font-label-xs-caps);
  letter-spacing: var(--pf-tracking-label-xs-caps);
  text-transform: uppercase;
  color: var(--pf-text-secondary);
}
.dtp-sample__preview {
  margin: 0;
  color: var(--pf-text-primary);
  overflow-wrap: anywhere;
  word-break: break-word;
}
.dtp-sample__caption {
  margin: 0;
  /* pf-gap: body-xs 12/16·400 — до него прежний размер 11/14 */
  font-size: 11px;
  line-height: 14px;
  color: var(--pf-text-secondary);
}
.dtp-token-table-wrap {
  flex: 1 1 580px;
  min-width: 0;
}
.ds-token-table tbody tr:nth-child(even) td {
  background: var(--pf-bg-surface-zebra);
}
.dtp-col-param {
  width: 160px;
  min-width: 120px;
  color: var(--pf-text-primary);
}
.dtp-col-value {
  width: 130px;
  min-width: 100px;
  font-weight: var(--pf-type-weight-500);
  color: var(--pf-text-primary);
}
.dtp-col-token {
  color: var(--pf-text-secondary);
  white-space: nowrap;
}
.dtp-platform-field {
  display: flex;
  align-items: center;
  gap: var(--pf-spacing-8);
}
.dtp-platform-field span {
  font: var(--pf-font-label-xs-caps);
  letter-spacing: var(--pf-tracking-label-xs-caps);
  text-transform: uppercase;
  color: var(--pf-text-secondary);
}
.dtp-platform-segment {
  display: inline-flex;
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-m);
  background: var(--pf-bg-surface-main);
}
.dtp-platform-segment > button:first-child { border-top-left-radius: inherit; border-bottom-left-radius: inherit; }
.dtp-platform-segment > button:last-child { border-top-right-radius: inherit; border-bottom-right-radius: inherit; }
.dtp-platform-segment > button:focus-visible { position: relative; z-index: 1; }
.dtp-platform-segment button {
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
.dtp-platform-segment button:last-child {
  border-right: none;
}
.dtp-platform-segment button[aria-pressed="true"],
.dtp-set-segment button[aria-pressed="true"] {
  background: var(--ds-selected-bg);
  color: var(--ds-selected-text);
  font-weight: var(--pf-type-weight-500);
}
.dtp-platform-segment button:focus-visible,
.dtp-set-segment button:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
@media (max-width: 1023px) {
  .dtp {
    padding: var(--pf-spacing-32) var(--pf-spacing-24) var(--pf-spacing-48);
  }
  .dtp-style-row {
    gap: var(--pf-spacing-24);
    padding: var(--pf-spacing-20) var(--pf-spacing-16);
  }
}
@media (max-width: 767px) {
  .dtp {
    padding: var(--pf-spacing-20) var(--pf-spacing-16) var(--pf-spacing-40);
  }
  .dtp-style-row {
    flex-direction: column;
    gap: var(--pf-spacing-16);
    padding: var(--pf-spacing-16);
  }
  .dtp-sample {
    flex-basis: auto;
    width: 100%;
  }
  .dtp-token-table-wrap {
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
    <div className="dtp-toast" role="status" aria-live="polite">
      Скопировано в буфер
    </div>
  ) : null;

  return { copyText, copyNotice };
}

function TypographyTokenTable({
  item,
  onCopyText,
}: {
  item: TypographyStyle;
  onCopyText: (text: string) => void;
}) {
  return (
    <div className="dtp-token-table-wrap ds-token-table-wrap">
      <table className="ds-token-table">
        <thead>
          <tr>
            <th className="dtp-col-param">Параметр</th>
            <th className="dtp-col-value">Значение</th>
            <th className="dtp-col-token">Токен</th>
          </tr>
        </thead>
        <tbody>
          {TYPOGRAPHY_PARAMETERS.map((parameter) => {
            const token = typographyTokenPath(item, parameter.id);
            return (
              <tr key={parameter.id}>
                <td className="dtp-col-param">{parameter.label}</td>
                <td className="dtp-col-value">
                  {typographyParameterValue(item, parameter.id)}
                </td>
                <td className="dtp-col-token">
                  <button
                    type="button"
                    className="dtp-copyable"
                    onClick={() => {
                      void onCopyText(token);
                    }}
                  >
                    {token}
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

function TypographyStyleRow({
  item,
  onCopyText,
}: {
  item: TypographyStyle;
  onCopyText: (text: string) => void;
}) {
  return (
    <article className="dtp-style-row">
      <div className="dtp-sample">
        <p className="dtp-sample__label">{item.name}</p>
        <p className="dtp-sample__preview" style={typographyPreviewStyle(item)}>
          {TYPOGRAPHY_SAMPLE_TEXT}
        </p>
        <p className="dtp-sample__caption">{formatTypographySpecCaption(item)}</p>
      </div>
      <TypographyTokenTable item={item} onCopyText={onCopyText} />
    </article>
  );
}

function TypographyDataTable({
  sections,
  onCopyText,
}: {
  sections: TypographySection[];
  onCopyText: (text: string) => void;
}) {
  return (
    <div className="dtp-data">
      {sections.map((section) => (
        <Fragment key={section.id}>
          <div className="dtp-group-head">{section.title}</div>
          {section.items.map((item) => (
            <TypographyStyleRow key={item.id} item={item} onCopyText={onCopyText} />
          ))}
        </Fragment>
      ))}
    </div>
  );
}

function PlatformSegmentControl({
  value,
  platforms,
  onChange,
}: {
  value: TypographyPlatform;
  platforms: readonly TypographyPlatform[];
  onChange: (next: TypographyPlatform) => void;
}) {
  return (
    <div className="dtp-platform-field">
      <span id="typography-platform-label">Платформа</span>
      <div
        className="dtp-platform-segment"
        role="group"
        aria-labelledby="typography-platform-label"
      >
        {platforms.map((platform) => (
          <button
            key={platform}
            type="button"
            aria-pressed={value === platform}
            onClick={() => onChange(platform)}
          >
            {TYPOGRAPHY_PLATFORM_LABELS[platform]}
          </button>
        ))}
      </div>
    </div>
  );
}

function SetSegmentControl({
  value,
  sets,
  onChange,
}: {
  value: TypographySetId;
  sets: readonly TypographySetOption[];
  onChange: (next: TypographySetId) => void;
}) {
  return (
    <div className="dtp-platform-field">
      <span id="typography-set-label">Набор</span>
      <div
        className="dtp-platform-segment dtp-set-segment"
        role="group"
        aria-labelledby="typography-set-label"
      >
        {sets.map((set) => (
          <button
            key={set.id}
            type="button"
            aria-pressed={value === set.id}
            onClick={() => onChange(set.id)}
          >
            {set.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TypographyPage({ productId = DEFAULT_PRODUCT_ID }: { productId?: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [setId, setSetId] = useState<TypographySetId>(DEFAULT_TYPOGRAPHY_SET);
  // Each typography set keeps its own iOS/Android selection — switching sets
  // never resets or shares the other set's platform choice.
  const [platformBySet, setPlatformBySet] = useState<Record<TypographySetId, TypographyPlatform>>({
    default: DEFAULT_TYPOGRAPHY_PLATFORM,
    outstanding: DEFAULT_TYPOGRAPHY_PLATFORM,
  });
  const { copyText, copyNotice } = useCopyNotice();
  const platform = platformBySet[setId];
  const setPlatform = (next: TypographyPlatform) => {
    setPlatformBySet((current) => ({ ...current, [setId]: next }));
  };
  const { sections, collection, platforms, sets } = useMemo(
    () => getProductTypographyContent(productId, setId, platform),
    [productId, setId, platform],
  );
  const typographyChangelog = useMemo(
    () => loadTokenChangelog(collection.collectionName),
    [collection.collectionName],
  );
  const filteredSections = useMemo(
    () => filterTypographySections(sections, searchQuery),
    [sections, searchQuery],
  );
  const typographyTokensJson = useMemo(
    () =>
      stringifyTokenJson({
        collectionName: collection.collectionName,
        artifact: collection.artifact,
        ...(platforms ? { platform } : {}),
        sections: sections.map(({ title, items }) => ({
          title,
          styles: items.map(
            ({ name, fontFamily, fontWeight, fontSize, lineHeight, letterSpacing, textTransform }) => ({
              name,
              fontFamily,
              fontWeight,
              fontSize: `${fontSize}px`,
              lineHeight: `${lineHeight}px`,
              letterSpacing: `${letterSpacing}px`,
              ...(textTransform ? { textTransform } : {}),
            }),
          ),
        })),
      }),
    [collection, platform, platforms, sections],
  );
  // Independent JSON per set: when a product ships more than one typography
  // set, disambiguate the filename/modal title with the full artifact name
  // (e.g. "Rider Typography Semantic" vs "Rider Typography Semantic Outstanding").
  const exportFilename = sets
    ? collection.artifact.replace(/\//g, ' ')
    : collection.artifact.split('/')[0] ?? 'Typography';
  const hasTokens = sections.some((section) => section.items.length > 0);

  return (
    <div className="dtp">
      <style>{PAGE_STYLE}</style>

      <DsPageHeader
        title="Typography"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Поиск стиля"
        searchAriaLabel="Поиск стиля"
        actions={(
          <>
            {sets ? (
              <SetSegmentControl value={setId} sets={sets} onChange={setSetId} />
            ) : null}
            {platforms ? (
              <PlatformSegmentControl
                value={platform}
                platforms={platforms}
                onChange={setPlatform}
              />
            ) : null}
            <TokenJsonActions
              filename={exportFilename}
              json={typographyTokensJson}
              disabled={!hasTokens}
              onCopyText={copyText}
            />
          </>
        )}
      />

      {filteredSections.length === 0 && searchQuery.trim() ? (
        <p className="dtp-search-empty">Ничего не найдено</p>
      ) : (
        <TypographyDataTable sections={filteredSections} onCopyText={copyText} />
      )}

      {typographyChangelog ? <ChangelogTable data={typographyChangelog} /> : null}

      {copyNotice}
    </div>
  );
}
