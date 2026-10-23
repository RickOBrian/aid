import { useRef, useState } from 'react';
import {
  ComponentReleaseStatus,
  COMPONENT_RELEASE_STATUS_STYLE,
} from './ComponentReleaseStatus';
import { DsPageHeader } from './DsPageHeader';
import { HUB_ROUTES } from './hubData';
import { BadgeDot } from './components/BadgeDot';
import { AnatomyInspector } from './components/AnatomyInspector';
import { badgeDotAnatomySchema } from './components/badgeDot.anatomy';
import { resolveBadgeDotComputedProperty } from './components/anatomyResolveBadgeDot';
import { badgeDotTokenSources } from './components/badgeDotTokens';
import { ComponentMetaHeader, COMPONENT_META_HEADER_STYLE } from './ComponentMetaHeader';
import { ComponentApiSummary, COMPONENT_API_SUMMARY_STYLE } from './ComponentApiSummary';
import { ComponentCodeSnippet, COMPONENT_CODE_SNIPPET_STYLE } from './ComponentCodeSnippet';
import { COMPONENT_VALUE_KIND_STYLE } from './componentValueKind';
import { COPY_BUTTON_STYLE } from './CopyButton';
import {
  badgeDotApiSpec,
  buildBadgeDotSnippets,
  formatBadgeDotSelection,
  type BadgeDotSelection,
} from './components/badgeDot.api';
import { DS_CHANGELOG_TABLE_STYLE, DS_COPYABLE_STYLE, DS_TOKEN_TABLE_STYLE, DS_TOAST_STYLE } from './dsChangelogTable';
import { ChangelogTable } from './ChangelogTable';
import { ColorModeValueDisplay, DS_COLOR_SWATCH_STYLE } from './dsColorSwatch';
import { DS_VALUE_META_STYLE } from './dsValueMeta';
import { loadComponentChangelog } from './loadComponentChangelog';
import { loadComponentPendingItems } from './loadComponentPending';
import badgeDotMeta from './components/badge-dot.meta.json';
import type { ProductColorMode } from './components/anatomyTypes';

const badgeDotChangelog = loadComponentChangelog('badge-dot');
const badgeDotPendingItems = loadComponentPendingItems('badge-dot');

type BadgeDotTab = 'preview' | 'tokens' | 'accessibility' | 'anatomy';

const FIGMA_URL =
  'https://www.figma.com/design/o0IUYIS7vadbmXPXd81ql9/WB-AID-Driver-Components?node-id=89-4216';

const TABS: { id: BadgeDotTab; label: string }[] = [
  { id: 'preview', label: 'Preview' },
  { id: 'tokens', label: 'Tokens' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'anatomy', label: 'Anatomy' },
];

const GEOMETRY_TOKEN_ROWS: { name: string; value: string; source: string }[] = [
  { name: 'space-8', value: '8×8px', source: 'spacingData.ts' },
  { name: 'radius-4', value: '50% (circle on 8px square)', source: 'components/BadgeDot.tsx' },
];

const PAGE_STYLE = `
${DS_CHANGELOG_TABLE_STYLE}
${DS_TOKEN_TABLE_STYLE}
${DS_COPYABLE_STYLE}
${DS_TOAST_STYLE}
${DS_VALUE_META_STYLE}
${DS_COLOR_SWATCH_STYLE}
${COMPONENT_RELEASE_STATUS_STYLE}
${COPY_BUTTON_STYLE}
${COMPONENT_VALUE_KIND_STYLE}
${COMPONENT_META_HEADER_STYLE}
${COMPONENT_API_SUMMARY_STYLE}
${COMPONENT_CODE_SNIPPET_STYLE}
.dsbd,
.dsbd *,
.dsbd *::before,
.dsbd *::after {
  box-sizing: border-box;
}
.dsbd {
  font-family: var(--pf-type-family-sans-1);
  color: var(--pf-text-primary);
  background: var(--pf-bg-surface-main);
  min-height: 100vh;
  padding: var(--pf-spacing-40) var(--pf-spacing-48) var(--pf-spacing-64);
}
.dsbd-shell {
  max-width: 1280px;
  margin: 0 auto;
}
.dsbd-layout {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.dsbd-main {
  min-width: 0;
}
.dsbd-aside {
  min-width: 0;
}
@media (min-width: 1024px) {
  .dsbd-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(300px, 360px);
    gap: 0 var(--pf-spacing-40);
    align-items: start;
  }
  .dsbd-aside {
    position: sticky;
    top: 24px;
    max-height: calc(100vh - 48px);
    overflow-y: auto;
    padding-bottom: var(--pf-spacing-24);
    border-left: 1px solid var(--pf-line-default);
    padding-left: var(--pf-spacing-40);
  }
  .dsbd-aside .ds-capi,
  .dsbd-aside .ds-ccode {
    margin-bottom: var(--pf-spacing-24);
  }
  .dsbd-aside .dsw-release {
    margin-top: 0;
    padding-top: var(--pf-spacing-24);
    border-top: 1px solid var(--pf-line-default);
  }
  .dsbd-aside .dctp-changelog {
    margin-top: 0;
    padding-top: var(--pf-spacing-24);
    border-top: 1px solid var(--pf-line-default);
  }
  .dsbd-main .ds-cmeta {
    margin-bottom: var(--pf-spacing-24);
  }
}
@media (min-width: 1280px) {
  .dsbd-layout {
    grid-template-columns: minmax(0, 1fr) 380px;
    gap: 0 var(--pf-spacing-48);
  }
}
@media (max-width: 1023px) {
  .dsbd-aside {
    margin-top: var(--pf-spacing-8);
    padding-top: var(--pf-spacing-32);
    border-top: 1px solid var(--pf-line-default);
  }
  .dsbd-aside .dsw-release {
    margin-top: var(--pf-spacing-16);
  }
}
.dsbd-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--pf-spacing-4);
  margin-bottom: var(--pf-spacing-32);
  border-bottom: 1px solid var(--pf-line-default);
  padding-bottom: 0;
}
.dsbd-tab {
  margin: 0;
  padding: var(--pf-spacing-10) var(--pf-spacing-16);
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  font-family: var(--pf-type-family-sans-1);
  font-size: 14px; /* pf-gap: label-m 14/20·500 (таб) */
  line-height: 20px; /* pf-gap: label-m */
  font-weight: var(--pf-type-weight-500);
  color: var(--pf-text-secondary);
  cursor: pointer;
  margin-bottom: -1px;
  transition: color 150ms ease;
}
.dsbd-tab:hover,
.dsbd-tab:focus-visible {
  color: var(--pf-text-primary);
}
.dsbd-tab:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
.dsbd-tab[aria-selected="true"] {
  color: var(--ds-accent);
  border-bottom-color: var(--ds-accent);
}
.dsbd-section {
  margin-bottom: var(--pf-spacing-48);
}
.dsbd-section h2 {
  margin: 0 0 var(--pf-spacing-8);
  font: var(--pf-font-heading-m);
  color: var(--pf-text-primary);
}
.dsbd-section > p,
.dsbd-section > ul {
  margin: 0 0 var(--pf-spacing-20);
  font: var(--pf-font-body-m);
  color: var(--pf-text-secondary);
  max-width: 640px;
}
.dsbd-theme-block {
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-l);
  padding: var(--pf-spacing-24);
  margin-bottom: var(--pf-spacing-16);
}
.dsbd-theme-block[data-theme="night"] {
  background: var(--pf-bg-inverse-main);
  border-color: var(--pf-bg-inverse-main);
}
.dsbd-theme-label {
  font: var(--pf-font-label-xs-caps);
  letter-spacing: var(--pf-tracking-label-xs-caps);
  text-transform: uppercase;
  color: var(--pf-text-secondary);
  margin: 0 0 var(--pf-spacing-16);
}
.dsbd-theme-block[data-theme="night"] .dsbd-theme-label {
  color: var(--pf-text-inverse);
}
.dsbd-live {
  display: flex;
  align-items: center;
  gap: var(--pf-spacing-16);
  min-height: 48px;
}
.dsbd-a11y-list {
  margin: 0;
  padding-left: var(--pf-spacing-20);
  font: var(--pf-font-body-m);
  color: var(--pf-text-primary);
}
.dsbd-a11y-list li {
  margin-bottom: var(--pf-spacing-8);
}
.dsbd-sandbox-controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--pf-spacing-16) var(--pf-spacing-24);
  margin-bottom: var(--pf-spacing-24);
  padding: var(--pf-spacing-16);
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-l);
  background: var(--pf-bg-surface-zebra);
}
.dsbd-sandbox-field {
  display: flex;
  flex-direction: column;
  gap: var(--pf-spacing-6);
}
.dsbd-sandbox-field label,
.dsbd-sandbox-field > span {
  font: var(--pf-font-label-xs-caps);
  letter-spacing: var(--pf-tracking-label-xs-caps);
  text-transform: uppercase;
  color: var(--pf-text-secondary);
}
.dsbd-sandbox-segment {
  display: inline-flex;
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-m);
  background: var(--pf-bg-surface-main);
}
.dsbd-sandbox-segment > button:first-child { border-top-left-radius: inherit; border-bottom-left-radius: inherit; }
.dsbd-sandbox-segment > button:last-child { border-top-right-radius: inherit; border-bottom-right-radius: inherit; }
.dsbd-sandbox-segment > button:focus-visible { position: relative; z-index: 1; }
.dsbd-sandbox-segment button {
  margin: 0;
  padding: var(--pf-spacing-6) var(--pf-spacing-12);
  border: none;
  border-right: 1px solid var(--pf-line-default);
  background: transparent;
  font-family: var(--pf-type-family-sans-1);
  font-size: 13px; /* pf-gap: label-m (сегмент) */
  font-weight: var(--pf-type-weight-400);
  cursor: pointer;
  color: var(--pf-text-primary);
  transition: background-color 150ms ease, color 150ms ease;
}
.dsbd-sandbox-segment button:last-child {
  border-right: none;
}
.dsbd-sandbox-segment button[aria-pressed="true"] {
  background: var(--ds-selected-bg);
  color: var(--ds-selected-text);
  font-weight: var(--pf-type-weight-500);
}
.dsbd-sandbox-segment button:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
.dsbd-geometry-table {
  min-width: 560px;
}
.dsbd-geometry-col-name {
  min-width: 120px;
  font-weight: var(--pf-type-weight-500);
}
.dsbd-token-table {
  min-width: 560px;
}
.dsbd-token-col-name {
  min-width: 148px;
  font-weight: var(--pf-type-weight-500);
}
.dsbd-token-name {
  font-weight: var(--pf-type-weight-500);
  text-align: left;
}
.dsbd-token-col-mode {
  min-width: 120px;
  width: 150px;
}
.dsbd-toast {
  bottom: var(--pf-spacing-24);
  z-index: 1100;
  pointer-events: none;
}
@media (max-width: 767px) {
  .dsbd {
    padding: var(--pf-spacing-20) var(--pf-spacing-16) var(--pf-spacing-40);
  }
  .dsbd-sandbox-controls {
    gap: var(--pf-spacing-12);
    padding: var(--pf-spacing-12);
  }
}
`;

function SegmentControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
}) {
  return (
    <div className="dsbd-sandbox-field">
      <span id={`${label}-label`}>{label}</span>
      <div className="dsbd-sandbox-segment" role="group" aria-labelledby={`${label}-label`}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
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
    <div className="ds-toast dsbd-toast" role="status" aria-live="polite">
      Скопировано в буфер
    </div>
  ) : null;

  return { copyText, copyNotice };
}

export function BadgeDotPage() {
  const { copyText, copyNotice } = useCopyNotice();
  const [activeTab, setActiveTab] = useState<BadgeDotTab>('preview');
  const [previewMode, setPreviewMode] = useState<ProductColorMode>('day');

  const selection: BadgeDotSelection = { mode: previewMode };

  return (
    <div className="dsbd">
      <style>{PAGE_STYLE}</style>
      <div className="dsbd-shell">
        <DsPageHeader
          title="BadgeDot"
          backHref={HUB_ROUTES.components}
          backAriaLabel="Назад к Components"
          showSearch={false}
        />

        <div className="dsbd-layout">
          <div className="dsbd-main">
            <ComponentMetaHeader
              name={badgeDotMeta.canonicalName}
              aliases={badgeDotMeta.aliases}
              architectureLevel={badgeDotMeta.architectureLevel}
              group={badgeDotMeta.componentsGroup}
              sourcePath={badgeDotMeta.sourcePath}
              figma={{ fileLabel: 'WB AID Driver Components', nodeId: '89:4216', url: FIGMA_URL }}
            />

            <div className="dsbd-sandbox-controls">
              <SegmentControl
                label="Mode"
                value={previewMode}
                options={[
                  { value: 'day', label: 'Day' },
                  { value: 'night', label: 'Night' },
                ]}
                onChange={setPreviewMode}
              />
            </div>

            <div className="dsbd-tabs" role="tablist" aria-label="BadgeDot review sections">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  className="dsbd-tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'preview' && (
              <section className="dsbd-section" role="tabpanel">
                <h2>Live demo</h2>
                <p>Non-interactive display element — no keyboard interaction.</p>
                <div className="dsbd-theme-block" data-theme={previewMode}>
                  <p className="dsbd-theme-label">{previewMode}</p>
                  <div className="dsbd-live">
                    <BadgeDot aria-label="Есть непрочитанные уведомления" />
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'tokens' && (
              <section className="dsbd-section" role="tabpanel">
                <h2>Semantic tokens</h2>
                <p>
                  Цвет — из <code>pages/aid-portal/data.ts</code> через
                  <code> components/badgeDotTokens.ts</code>; токен не зависит от темы (Day = Night).
                </p>
                <div className="ds-token-table-wrap">
                  <table className="ds-token-table dsbd-token-table">
                    <thead>
                      <tr>
                        <th className="dsbd-token-col-name">Token</th>
                        <th className="dsbd-token-col-mode">Day</th>
                        <th className="dsbd-token-col-mode">Night</th>
                      </tr>
                    </thead>
                    <tbody>
                      {badgeDotTokenSources.map((row) => (
                        <tr key={row.name}>
                          <td className="dsbd-token-col-name">
                            <button
                              type="button"
                              className="ds-copyable dsbd-token-name"
                              onClick={() => {
                                void copyText(row.name);
                              }}
                            >
                              {row.name}
                            </button>
                          </td>
                          <td className="dsbd-token-col-mode">
                            <ColorModeValueDisplay
                              value={row.day}
                              onCopyHex={(hex) => {
                                void copyText(hex);
                              }}
                            />
                          </td>
                          <td className="dsbd-token-col-mode">
                            <ColorModeValueDisplay
                              value={row.night}
                              onCopyHex={(hex) => {
                                void copyText(hex);
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h2 style={{ marginTop: 'var(--pf-spacing-32)' }}>Geometry</h2>
                <p>Размер и форма — semantic-токены, без Day/Night-варианта.</p>
                <div className="ds-token-table-wrap">
                  <table className="ds-token-table dsbd-geometry-table">
                    <thead>
                      <tr>
                        <th className="dsbd-geometry-col-name">Token</th>
                        <th>Value</th>
                        <th>Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {GEOMETRY_TOKEN_ROWS.map((row) => (
                        <tr key={row.name}>
                          <td className="dsbd-geometry-col-name">
                            <button
                              type="button"
                              className="ds-copyable dsbd-token-name"
                              onClick={() => {
                                void copyText(row.name);
                              }}
                            >
                              {row.name}
                            </button>
                          </td>
                          <td>{row.value}</td>
                          <td>{row.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeTab === 'accessibility' && (
              <section className="dsbd-section" role="tabpanel">
                <h2>Accessibility</h2>
                <ul className="dsbd-a11y-list">
                  <li>
                    Не интерактивен — <code>&lt;span role="img"&gt;</code>, без keyboard-обработчиков.
                  </li>
                  <li>
                    Когда точка несёт смысл сама по себе — передайте <code>aria-label</code>
                    (например «Есть непрочитанные уведомления»).
                  </li>
                  <li>
                    Когда родительский элемент уже озвучивает состояние — передайте
                    <code> aria-hidden="true"</code>, чтобы точка не дублировалась скринридером.
                  </li>
                  <li>
                    Размер 8×8px — ниже минимального touch target (44px Web); компонент не
                    интерактивен, кликабельной зоной управляет родитель.
                  </li>
                </ul>
              </section>
            )}

            {activeTab === 'anatomy' && (
              <section className="dsbd-section" role="tabpanel">
                <h2>Anatomy inspector</h2>
                <AnatomyInspector
                  schema={badgeDotAnatomySchema}
                  mode={previewMode}
                  simState="default"
                  remeasureKey={previewMode}
                  resolveProperty={resolveBadgeDotComputedProperty}
                >
                  <BadgeDot aria-label="Есть непрочитанные уведомления" />
                </AnatomyInspector>
              </section>
            )}
          </div>

          <aside className="dsbd-aside" aria-label="Component API and release">
            <ComponentCodeSnippet
              platforms={buildBadgeDotSnippets(selection)}
              selectionSummary={formatBadgeDotSelection(selection)}
            />

            <ComponentApiSummary spec={badgeDotApiSpec} />

            <ComponentReleaseStatus
              changelog={badgeDotChangelog}
              pendingItems={badgeDotPendingItems}
              reviewRoute={badgeDotMeta.reviewRoute}
            />

            {badgeDotChangelog ? (
              <ChangelogTable
                data={{
                  artifact: badgeDotChangelog.artifact,
                  currentVersion: badgeDotChangelog.currentVersion ?? '0.0.0',
                  entries: badgeDotChangelog.entries,
                }}
                emptyMessage="Записей в release changelog пока нет. Первый релиз v1.0.0 с impact initial — только на Release Gate после запроса Principal Designer."
              />
            ) : null}
          </aside>
        </div>

        {copyNotice}
      </div>
    </div>
  );
}
