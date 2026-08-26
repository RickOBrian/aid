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
import type { DriverColorMode } from './components/anatomyTypes';

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
  font-family: 'Google Sans', system-ui, sans-serif;
  color: #2d2c2e;
  background: #ffffff;
  min-height: 100vh;
  padding: 40px 48px 64px;
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
    gap: 0 40px;
    align-items: start;
  }
  .dsbd-aside {
    position: sticky;
    top: 24px;
    max-height: calc(100vh - 48px);
    overflow-y: auto;
    padding-bottom: 24px;
    border-left: 1px solid #ebedf0;
    padding-left: 40px;
  }
  .dsbd-aside .ds-capi,
  .dsbd-aside .ds-ccode {
    margin-bottom: 24px;
  }
  .dsbd-aside .dsw-release {
    margin-top: 0;
    padding-top: 24px;
    border-top: 1px solid #ebedf0;
  }
  .dsbd-aside .dctp-changelog {
    margin-top: 0;
    padding-top: 24px;
    border-top: 1px solid #ebedf0;
  }
  .dsbd-main .ds-cmeta {
    margin-bottom: 24px;
  }
}
@media (min-width: 1280px) {
  .dsbd-layout {
    grid-template-columns: minmax(0, 1fr) 380px;
    gap: 0 48px;
  }
}
@media (max-width: 1023px) {
  .dsbd-aside {
    margin-top: 8px;
    padding-top: 32px;
    border-top: 1px solid #ebedf0;
  }
  .dsbd-aside .dsw-release {
    margin-top: 16px;
  }
}
.dsbd-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 32px;
  border-bottom: 1px solid #ebedf0;
  padding-bottom: 0;
}
.dsbd-tab {
  margin: 0;
  padding: 10px 16px;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.54);
  cursor: pointer;
  margin-bottom: -1px;
}
.dsbd-tab:hover,
.dsbd-tab:focus-visible {
  color: #2d2c2e;
  outline: none;
}
.dsbd-tab[aria-selected="true"] {
  color: var(--ds-accent);
  border-bottom-color: var(--ds-accent);
}
.dsbd-section {
  margin-bottom: 48px;
}
.dsbd-section h2 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
}
.dsbd-section > p,
.dsbd-section > ul {
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.54);
  max-width: 640px;
}
.dsbd-theme-block {
  border: 1px solid #ebedf0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
}
.dsbd-theme-block[data-theme="night"] {
  background: #2d2c2e;
  border-color: #2d2c2e;
}
.dsbd-theme-label {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.38);
  margin: 0 0 16px;
}
.dsbd-theme-block[data-theme="night"] .dsbd-theme-label {
  color: rgba(255, 255, 255, 0.7);
}
.dsbd-live {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 48px;
}
.dsbd-a11y-list {
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.7);
}
.dsbd-a11y-list li {
  margin-bottom: 8px;
}
.dsbd-sandbox-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  margin-bottom: 24px;
  padding: 16px;
  border: 1px solid #ebedf0;
  border-radius: 12px;
  background: #fafafa;
}
.dsbd-sandbox-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dsbd-sandbox-field label,
.dsbd-sandbox-field > span {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.45);
}
.dsbd-sandbox-segment {
  display: inline-flex;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}
.dsbd-sandbox-segment button {
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
.dsbd-sandbox-segment button:last-child {
  border-right: none;
}
.dsbd-sandbox-segment button[aria-pressed="true"] {
  background: var(--ds-accent-bg);
  color: var(--ds-accent);
  font-weight: 500;
}
.dsbd-sandbox-segment button:focus-visible {
  outline: 2px solid var(--ds-accent);
  outline-offset: -2px;
}
.dsbd-geometry-table {
  min-width: 560px;
}
.dsbd-geometry-col-name {
  min-width: 120px;
  font-weight: 500;
}
.dsbd-token-table {
  min-width: 560px;
}
.dsbd-token-col-name {
  min-width: 148px;
  font-weight: 500;
}
.dsbd-token-name {
  font-weight: 500;
  text-align: left;
}
.dsbd-token-col-mode {
  min-width: 120px;
  width: 150px;
}
.dsbd-toast {
  bottom: 32px;
  z-index: 1100;
  pointer-events: none;
}
@media (max-width: 767px) {
  .dsbd {
    padding: 20px 16px 40px;
  }
  .dsbd-sandbox-controls {
    gap: 12px;
    padding: 12px;
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
  const [previewMode, setPreviewMode] = useState<DriverColorMode>('day');

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
                  Цвет — из <code>pages/driver-color-tokens/data.ts</code> через
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

                <h2 style={{ marginTop: 32 }}>Geometry</h2>
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
