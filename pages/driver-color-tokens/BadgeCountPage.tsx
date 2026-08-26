import { useRef, useState } from 'react';
import {
  ComponentReleaseStatus,
  COMPONENT_RELEASE_STATUS_STYLE,
} from './ComponentReleaseStatus';
import { DsPageHeader } from './DsPageHeader';
import { HUB_ROUTES } from './hubData';
import { BadgeCount } from './components/BadgeCount';
import { AnatomyInspector } from './components/AnatomyInspector';
import { badgeCountAnatomySchema } from './components/badgeCount.anatomy';
import { resolveBadgeCountComputedProperty } from './components/anatomyResolveBadgeCount';
import { badgeCountTokenSources } from './components/badgeCountTokens';
import { ComponentMetaHeader, COMPONENT_META_HEADER_STYLE } from './ComponentMetaHeader';
import { ComponentApiSummary, COMPONENT_API_SUMMARY_STYLE } from './ComponentApiSummary';
import { ComponentCodeSnippet, COMPONENT_CODE_SNIPPET_STYLE } from './ComponentCodeSnippet';
import { COMPONENT_VALUE_KIND_STYLE } from './componentValueKind';
import { COPY_BUTTON_STYLE } from './CopyButton';
import {
  badgeCountApiSpec,
  buildBadgeCountSnippets,
  formatBadgeCountSelection,
  BADGE_COUNT_VALUE_VARIANTS,
  type BadgeCountSelection,
} from './components/badgeCount.api';
import { DS_CHANGELOG_TABLE_STYLE, DS_COPYABLE_STYLE, DS_TOKEN_TABLE_STYLE, DS_TOAST_STYLE } from './dsChangelogTable';
import { ChangelogTable } from './ChangelogTable';
import { ColorModeValueDisplay, DS_COLOR_SWATCH_STYLE } from './dsColorSwatch';
import { DS_VALUE_META_STYLE } from './dsValueMeta';
import { loadComponentChangelog } from './loadComponentChangelog';
import { loadComponentPendingItems } from './loadComponentPending';
import badgeCountMeta from './components/badge-count.meta.json';
import type { DriverColorMode } from './components/anatomyTypes';

const badgeCountChangelog = loadComponentChangelog('badge-count');
const badgeCountPendingItems = loadComponentPendingItems('badge-count');

type BadgeCountTab = 'preview' | 'values' | 'tokens' | 'accessibility' | 'anatomy';

const FIGMA_URL =
  'https://www.figma.com/design/o0IUYIS7vadbmXPXd81ql9/WB-AID-Driver-Components?node-id=89-4214';

const TABS: { id: BadgeCountTab; label: string }[] = [
  { id: 'preview', label: 'Preview' },
  { id: 'values', label: 'Values' },
  { id: 'tokens', label: 'Tokens' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'anatomy', label: 'Anatomy' },
];

const GEOMETRY_TOKEN_ROWS: { name: string; value: string; source: string }[] = [
  { name: 'radius-12', value: '12px', source: 'radiusData.ts' },
  { name: 'space-2', value: '2px (padding-y)', source: 'spacingData.ts' },
  { name: 'space-6', value: '6px (padding-x)', source: 'spacingData.ts' },
  { name: 'shadow-1', value: '0px 0px 1px rgba(0,0,0,.15), 0px 1px 2px rgba(0,0,0,.12)', source: 'shadowsData.ts' },
  { name: 'subtitle-2', value: 'Roboto Medium 14/16, tracking 0.1px', source: 'typographyData.ts' },
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
.dsbc,
.dsbc *,
.dsbc *::before,
.dsbc *::after {
  box-sizing: border-box;
}
.dsbc {
  font-family: 'Google Sans', system-ui, sans-serif;
  color: #2d2c2e;
  background: #ffffff;
  min-height: 100vh;
  padding: 40px 48px 64px;
}
.dsbc-shell {
  max-width: 1280px;
  margin: 0 auto;
}
.dsbc-layout {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.dsbc-main {
  min-width: 0;
}
.dsbc-aside {
  min-width: 0;
}
@media (min-width: 1024px) {
  .dsbc-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(300px, 360px);
    gap: 0 40px;
    align-items: start;
  }
  .dsbc-aside {
    position: sticky;
    top: 24px;
    max-height: calc(100vh - 48px);
    overflow-y: auto;
    padding-bottom: 24px;
    border-left: 1px solid #ebedf0;
    padding-left: 40px;
  }
  .dsbc-aside .ds-capi,
  .dsbc-aside .ds-ccode {
    margin-bottom: 24px;
  }
  .dsbc-aside .dsw-release {
    margin-top: 0;
    padding-top: 24px;
    border-top: 1px solid #ebedf0;
  }
  .dsbc-aside .dctp-changelog {
    margin-top: 0;
    padding-top: 24px;
    border-top: 1px solid #ebedf0;
  }
  .dsbc-main .ds-cmeta {
    margin-bottom: 24px;
  }
}
@media (min-width: 1280px) {
  .dsbc-layout {
    grid-template-columns: minmax(0, 1fr) 380px;
    gap: 0 48px;
  }
}
@media (max-width: 1023px) {
  .dsbc-aside {
    margin-top: 8px;
    padding-top: 32px;
    border-top: 1px solid #ebedf0;
  }
  .dsbc-aside .dsw-release {
    margin-top: 16px;
  }
}
.dsbc-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 32px;
  border-bottom: 1px solid #ebedf0;
  padding-bottom: 0;
}
.dsbc-tab {
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
.dsbc-tab:hover,
.dsbc-tab:focus-visible {
  color: #2d2c2e;
  outline: none;
}
.dsbc-tab[aria-selected="true"] {
  color: var(--ds-accent);
  border-bottom-color: var(--ds-accent);
}
.dsbc-section {
  margin-bottom: 48px;
}
.dsbc-section h2 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
}
.dsbc-section p {
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.54);
  max-width: 640px;
}
.dsbc-theme-block {
  border: 1px solid #ebedf0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
}
.dsbc-theme-block[data-theme="night"] {
  background: #2d2c2e;
  border-color: #2d2c2e;
}
.dsbc-theme-label {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.38);
  margin: 0 0 16px;
}
.dsbc-theme-block[data-theme="night"] .dsbc-theme-label {
  color: rgba(255, 255, 255, 0.7);
}
.dsbc-matrix {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 20px;
}
.dsbc-matrix-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.dsbc-matrix-cell-label {
  font-size: 13px;
  line-height: 18px;
  color: rgba(0, 0, 0, 0.54);
}
.dsbc-theme-block[data-theme="night"] .dsbc-matrix-cell-label {
  color: rgba(255, 255, 255, 0.7);
}
.dsbc-live {
  display: flex;
  align-items: center;
  gap: 16px;
}
.dsbc-a11y-list {
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.7);
}
.dsbc-a11y-list li {
  margin-bottom: 8px;
}
.dsbc-sandbox-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  margin-bottom: 24px;
  padding: 16px;
  border: 1px solid #ebedf0;
  border-radius: 12px;
  background: #fafafa;
}
.dsbc-sandbox-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dsbc-sandbox-field label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.45);
}
.dsbc-sandbox-segment {
  display: inline-flex;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}
.dsbc-sandbox-segment button {
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
.dsbc-sandbox-segment button:last-child {
  border-right: none;
}
.dsbc-sandbox-segment button[aria-pressed="true"] {
  background: var(--ds-accent-bg);
  color: var(--ds-accent);
  font-weight: 500;
}
.dsbc-sandbox-segment button:focus-visible {
  outline: 2px solid var(--ds-accent);
  outline-offset: -2px;
}
.dsbc-geometry-table {
  min-width: 560px;
}
.dsbc-geometry-col-name {
  min-width: 120px;
  font-weight: 500;
}
.dsbc-token-table {
  min-width: 560px;
}
.dsbc-token-col-name {
  min-width: 148px;
  font-weight: 500;
}
.dsbc-token-name {
  font-weight: 500;
  text-align: left;
}
.dsbc-token-col-mode {
  min-width: 120px;
  width: 150px;
}
.dsbc-toast {
  bottom: 32px;
  z-index: 1100;
  pointer-events: none;
}
@media (max-width: 767px) {
  .dsbc {
    padding: 20px 16px 40px;
  }
  .dsbc-sandbox-controls {
    gap: 12px;
    padding: 12px;
  }
  .dsbc-sandbox-field {
    flex: 1 1 100%;
    min-width: 0;
    max-width: 100%;
  }
  .dsbc-sandbox-segment {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(72px, 1fr));
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }
  .dsbc-sandbox-segment button {
    min-width: 0;
    padding: 8px 6px;
    font-size: 12px;
    border-right: 1px solid #ebedf0;
    border-bottom: 1px solid #ebedf0;
  }
  .dsbc-sandbox-segment button:last-child {
    border-right: 1px solid #ebedf0;
  }
}
`;

function ValueMatrix() {
  return (
    <div className="dsbc-matrix">
      {BADGE_COUNT_VALUE_VARIANTS.map((variant) => (
        <div key={variant.id} className="dsbc-matrix-cell">
          <BadgeCount value={variant.value} />
          <span className="dsbc-matrix-cell-label">
            {variant.label} ({variant.value})
          </span>
        </div>
      ))}
    </div>
  );
}

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
    <div className="dsbc-sandbox-field">
      <span id={`${label}-label`}>{label}</span>
      <div className="dsbc-sandbox-segment" role="group" aria-labelledby={`${label}-label`}>
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

function SelectionControls({
  mode,
  onModeChange,
  variantId,
  onVariantIdChange,
}: {
  mode: DriverColorMode;
  onModeChange: (next: DriverColorMode) => void;
  variantId: string;
  onVariantIdChange: (next: string) => void;
}) {
  return (
    <div className="dsbc-sandbox-controls">
      <SegmentControl
        label="Mode"
        value={mode}
        options={[
          { value: 'day', label: 'Day' },
          { value: 'night', label: 'Night' },
        ]}
        onChange={onModeChange}
      />
      <SegmentControl
        label="Value"
        value={variantId}
        options={BADGE_COUNT_VALUE_VARIANTS.map((variant) => ({ value: variant.id, label: variant.label }))}
        onChange={onVariantIdChange}
      />
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
    <div className="ds-toast dsbc-toast" role="status" aria-live="polite">
      Скопировано в буфер
    </div>
  ) : null;

  return { copyText, copyNotice };
}

export function BadgeCountPage() {
  const { copyText, copyNotice } = useCopyNotice();
  const [activeTab, setActiveTab] = useState<BadgeCountTab>('preview');

  const [previewMode, setPreviewMode] = useState<DriverColorMode>('day');
  const [previewVariantId, setPreviewVariantId] = useState(BADGE_COUNT_VALUE_VARIANTS[0].id);
  const previewValue =
    BADGE_COUNT_VALUE_VARIANTS.find((variant) => variant.id === previewVariantId)?.value ??
    BADGE_COUNT_VALUE_VARIANTS[0].value;

  const selection: BadgeCountSelection = { mode: previewMode, value: previewValue };

  return (
    <div className="dsbc">
      <style>{PAGE_STYLE}</style>
      <div className="dsbc-shell">
        <DsPageHeader
          title="BadgeCount"
          backHref={HUB_ROUTES.components}
          backAriaLabel="Назад к Components"
          showSearch={false}
        />

        <div className="dsbc-layout">
          <div className="dsbc-main">
            <ComponentMetaHeader
              name={badgeCountMeta.canonicalName}
              aliases={badgeCountMeta.aliases}
              architectureLevel={badgeCountMeta.architectureLevel}
              group={badgeCountMeta.componentsGroup}
              sourcePath={badgeCountMeta.sourcePath}
              figma={{ fileLabel: 'WB AID Driver Components', nodeId: '89:4214', url: FIGMA_URL }}
            />

            <SelectionControls
              mode={previewMode}
              onModeChange={setPreviewMode}
              variantId={previewVariantId}
              onVariantIdChange={setPreviewVariantId}
            />

            <div className="dsbc-tabs" role="tablist" aria-label="BadgeCount review sections">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  className="dsbc-tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'preview' && (
              <section className="dsbc-section" role="tabpanel">
                <h2>Live demo</h2>
                <p>Non-interactive display element — no keyboard interaction.</p>
                <div className="dsbc-theme-block" data-theme={previewMode}>
                  <p className="dsbc-theme-label">{previewMode}</p>
                  <div className="dsbc-live">
                    <BadgeCount value={previewValue} />
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'values' && (
              <section className="dsbc-section" role="tabpanel">
                <h2>Value matrix</h2>
                <p>
                  BadgeCount не интерактивен — вместо hover/pressed/focused здесь варианты по длине
                  значения: 1 цифра, 2 цифры, переполнение (значение больше <code>max</code>, по
                  умолчанию 99, рендерится как «{'{'}max{'}'}+»).
                </p>
                <div className="dsbc-theme-block" data-theme="day">
                  <p className="dsbc-theme-label">Day</p>
                  <ValueMatrix />
                </div>
                <div className="dsbc-theme-block" data-theme="night">
                  <p className="dsbc-theme-label">Night</p>
                  <ValueMatrix />
                </div>
              </section>
            )}

            {activeTab === 'tokens' && (
              <section className="dsbc-section" role="tabpanel">
                <h2>Semantic tokens</h2>
                <p>
                  Цвета — из <code>pages/driver-color-tokens/data.ts</code> через
                  <code> components/badgeCountTokens.ts</code>; оба токена не зависят от темы (Day = Night).
                </p>
                <div className="ds-token-table-wrap">
                  <table className="ds-token-table dsbc-token-table">
                    <thead>
                      <tr>
                        <th className="dsbc-token-col-name">Token</th>
                        <th className="dsbc-token-col-mode">Day</th>
                        <th className="dsbc-token-col-mode">Night</th>
                      </tr>
                    </thead>
                    <tbody>
                      {badgeCountTokenSources.map((row) => (
                        <tr key={row.name}>
                          <td className="dsbc-token-col-name">
                            <button
                              type="button"
                              className="ds-copyable dsbc-token-name"
                              onClick={() => {
                                void copyText(row.name);
                              }}
                            >
                              {row.name}
                            </button>
                          </td>
                          <td className="dsbc-token-col-mode">
                            <ColorModeValueDisplay
                              value={row.day}
                              onCopyHex={(hex) => {
                                void copyText(hex);
                              }}
                            />
                          </td>
                          <td className="dsbc-token-col-mode">
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

                <h2 style={{ marginTop: 32 }}>Geometry &amp; typography</h2>
                <p>Радиус, паддинги, тень и типографика — semantic-токены, без Day/Night-варианта.</p>
                <div className="ds-token-table-wrap">
                  <table className="ds-token-table dsbc-geometry-table">
                    <thead>
                      <tr>
                        <th className="dsbc-geometry-col-name">Token</th>
                        <th>Value</th>
                        <th>Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {GEOMETRY_TOKEN_ROWS.map((row) => (
                        <tr key={row.name}>
                          <td className="dsbc-geometry-col-name">
                            <button
                              type="button"
                              className="ds-copyable dsbc-token-name"
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
              <section className="dsbc-section" role="tabpanel">
                <h2>Accessibility</h2>
                <ul className="dsbc-a11y-list">
                  <li>
                    Не интерактивен — обычный <code>&lt;div&gt;</code>, без роли кнопки/переключателя,
                    без keyboard-обработчиков.
                  </li>
                  <li>
                    Текст числа читается скринридером как есть; для контекста (например «10
                    непрочитанных сообщений») передавайте <code>aria-label</code> — по умолчанию
                    озвучивается голое число.
                  </li>
                  <li>
                    Переполнение (<code>value &gt; max</code>) рендерится как обычный текст
                    («99+»), не обрезается визуально — читается скринридером буквально.
                  </li>
                  <li>
                    Контраст: белый текст (Texts · Primary light ind, 100%) на Fields · Warning
                    (#D62347) — токен подобран как theme-independent именно для стабильного
                    контраста в Day и Night.
                  </li>
                </ul>
              </section>
            )}

            {activeTab === 'anatomy' && (
              <section className="dsbc-section" role="tabpanel">
                <h2>Anatomy inspector</h2>
                <AnatomyInspector
                  schema={badgeCountAnatomySchema}
                  mode={previewMode}
                  simState="default"
                  remeasureKey={`${previewMode}-${previewValue}`}
                  resolveProperty={resolveBadgeCountComputedProperty}
                >
                  <BadgeCount value={previewValue} />
                </AnatomyInspector>
              </section>
            )}
          </div>

          <aside className="dsbc-aside" aria-label="Component API and release">
            <ComponentCodeSnippet
              platforms={buildBadgeCountSnippets(selection)}
              selectionSummary={formatBadgeCountSelection(selection)}
            />

            <ComponentApiSummary spec={badgeCountApiSpec} />

            <ComponentReleaseStatus
              changelog={badgeCountChangelog}
              pendingItems={badgeCountPendingItems}
              reviewRoute={badgeCountMeta.reviewRoute}
            />

            {badgeCountChangelog ? (
              <ChangelogTable
                data={{
                  artifact: badgeCountChangelog.artifact,
                  currentVersion: badgeCountChangelog.currentVersion ?? '0.0.0',
                  entries: badgeCountChangelog.entries,
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
