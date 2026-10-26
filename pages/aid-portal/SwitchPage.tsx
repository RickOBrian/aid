import { useRef, useState } from 'react';
import {
  ComponentReleaseStatus,
  COMPONENT_RELEASE_STATUS_STYLE,
} from './ComponentReleaseStatus';
import { DsPageHeader } from './DsPageHeader';
import { HUB_ROUTES } from './hubData';
import { Switch } from './components/Switch';
import { AnatomyInspector } from './components/AnatomyInspector';
import { switchAnatomySchema } from './components/switch.anatomy';
import { resolveSwitchComputedProperty } from './components/anatomyResolveSwitch';
import { switchTokenSources } from './components/switchTokens';
import { ComponentMetaHeader, COMPONENT_META_HEADER_STYLE } from './ComponentMetaHeader';
import { ComponentApiSummary, COMPONENT_API_SUMMARY_STYLE } from './ComponentApiSummary';
import { ComponentCodeSnippet, COMPONENT_CODE_SNIPPET_STYLE } from './ComponentCodeSnippet';
import { COMPONENT_VALUE_KIND_STYLE } from './componentValueKind';
import { COPY_BUTTON_STYLE } from './CopyButton';
import {
  switchApiSpec,
  buildSwitchSnippets,
  formatSwitchSelection,
  type SwitchPreviewState,
} from './components/switch.api';
import { DS_CHANGELOG_TABLE_STYLE, DS_COPYABLE_STYLE, DS_TOKEN_TABLE_STYLE, DS_TOAST_STYLE } from './dsChangelogTable';
import { ChangelogTable } from './ChangelogTable';
import { ColorModeValueDisplay, DS_COLOR_SWATCH_STYLE } from './dsColorSwatch';
import { DS_VALUE_META_STYLE } from './dsValueMeta';
import { loadComponentChangelog } from './loadComponentChangelog';
import { loadComponentPendingItems } from './loadComponentPending';
import switchMeta from './components/switch.meta.json';
import type { ProductColorMode } from './components/anatomyTypes';

const switchChangelog = loadComponentChangelog('switch');
const switchPendingItems = loadComponentPendingItems('switch');

type SwitchTab = 'preview' | 'states' | 'tokens' | 'accessibility' | 'anatomy';
type AnatomySimState = 'default' | 'hover' | 'focus';

const FIGMA_URL =
  'https://www.figma.com/design/9yNZhsbTfqC8Nv3JFlVtBq/%F0%9F%95%93-Wilhelm-Library?node-id=9872-15';

const TABS: { id: SwitchTab; label: string }[] = [
  { id: 'preview', label: 'Preview' },
  { id: 'states', label: 'States' },
  { id: 'tokens', label: 'Tokens' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'anatomy', label: 'Anatomy' },
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
.dsw,
.dsw *,
.dsw *::before,
.dsw *::after {
  box-sizing: border-box;
}
.dsw {
  font-family: var(--pf-type-family-sans-1);
  color: var(--pf-text-primary);
  background: var(--pf-bg-surface-main);
  min-height: 100vh;
  padding: var(--pf-spacing-40) var(--pf-spacing-48) var(--pf-spacing-64);
}
.dsw-shell {
  max-width: 1280px;
  margin: 0 auto;
}
.dsw-layout {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.dsw-main {
  min-width: 0;
}
.dsw-aside {
  min-width: 0;
}
@media (min-width: 1024px) {
  .dsw-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(300px, 360px);
    gap: 0 var(--pf-spacing-40);
    align-items: start;
  }
  .dsw-aside {
    position: sticky;
    top: 24px;
    max-height: calc(100vh - 48px);
    overflow-y: auto;
    padding-bottom: var(--pf-spacing-24);
    border-left: 1px solid var(--pf-line-default);
    padding-left: var(--pf-spacing-40);
  }
  .dsw-aside .ds-capi,
  .dsw-aside .ds-ccode {
    margin-bottom: var(--pf-spacing-24);
  }
  .dsw-aside .dsw-release {
    margin-top: 0;
    padding-top: var(--pf-spacing-24);
    border-top: 1px solid var(--pf-line-default);
  }
  .dsw-aside .dctp-changelog {
    margin-top: 0;
    padding-top: var(--pf-spacing-24);
    border-top: 1px solid var(--pf-line-default);
  }
  .dsw-main .ds-cmeta {
    margin-bottom: var(--pf-spacing-24);
  }
}
@media (min-width: 1280px) {
  .dsw-layout {
    grid-template-columns: minmax(0, 1fr) 380px;
    gap: 0 var(--pf-spacing-48);
  }
}
@media (max-width: 1023px) {
  .dsw-aside {
    margin-top: var(--pf-spacing-8);
    padding-top: var(--pf-spacing-32);
    border-top: 1px solid var(--pf-line-default);
  }
  .dsw-aside .dsw-release {
    margin-top: var(--pf-spacing-16);
  }
}
.dsw-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--pf-spacing-4);
  margin-bottom: var(--pf-spacing-32);
  border-bottom: 1px solid var(--pf-line-default);
  padding-bottom: 0;
}
.dsw-tab {
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
.dsw-tab:hover,
.dsw-tab:focus-visible {
  color: var(--pf-text-primary);
}
.dsw-tab:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
.dsw-tab[aria-selected="true"] {
  color: var(--ds-accent);
  border-bottom-color: var(--ds-accent);
}
.dsw-section {
  margin-bottom: var(--pf-spacing-48);
}
.dsw-section h2 {
  margin: 0 0 var(--pf-spacing-8);
  font: var(--pf-font-heading-m);
  color: var(--pf-text-primary);
}
.dsw-section p {
  margin: 0 0 var(--pf-spacing-20);
  font: var(--pf-font-body-m);
  color: var(--pf-text-secondary);
  max-width: 640px;
}
.dsw-theme-block {
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-l);
  padding: var(--pf-spacing-24);
  margin-bottom: var(--pf-spacing-16);
}
.dsw-theme-block[data-theme="night"] {
  background: var(--pf-bg-inverse-main);
  border-color: var(--pf-bg-inverse-main);
}
.dsw-theme-label {
  font: var(--pf-font-label-xs-caps);
  letter-spacing: var(--pf-tracking-label-xs-caps);
  text-transform: uppercase;
  color: var(--pf-text-secondary);
  margin: 0 0 var(--pf-spacing-16);
}
.dsw-theme-block[data-theme="night"] .dsw-theme-label {
  color: var(--pf-text-inverse);
}
.dsw-matrix {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--pf-spacing-20);
}
.dsw-matrix-cell {
  display: flex;
  align-items: center;
  gap: var(--pf-spacing-12);
}
.dsw-matrix-cell-label {
  font: var(--pf-font-body-s);
  color: var(--pf-text-secondary);
}
.dsw-theme-block[data-theme="night"] .dsw-matrix-cell-label {
  color: var(--pf-text-inverse);
}
.dsw-live {
  display: flex;
  align-items: center;
  gap: var(--pf-spacing-16);
  font: var(--pf-font-body-m);
}
.dsw-live[data-sim-state="hover"] .ds-switch-root:not(:disabled):not([aria-disabled="true"]) .ds-switch__track,
.dsw-live[data-sim-state="focus"] .ds-switch-root:not(:disabled):not([aria-disabled="true"]) .ds-switch__track {
  box-shadow: 0 0 0 2px var(--ds-switch-stroke);
}
.dsw-a11y-list {
  margin: 0;
  padding-left: var(--pf-spacing-20);
  font: var(--pf-font-body-m);
  color: var(--pf-text-primary);
}
.dsw-a11y-list li {
  margin-bottom: var(--pf-spacing-8);
}
.dsw-sandbox-controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--pf-spacing-16) var(--pf-spacing-24);
  margin-bottom: var(--pf-spacing-24);
  padding: var(--pf-spacing-16);
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-l);
  background: var(--pf-bg-surface-zebra);
}
.dsw-sandbox-field {
  display: flex;
  flex-direction: column;
  gap: var(--pf-spacing-6);
}
.dsw-sandbox-field label {
  font: var(--pf-font-label-xs-caps);
  letter-spacing: var(--pf-tracking-label-xs-caps);
  text-transform: uppercase;
  color: var(--pf-text-secondary);
}
.dsw-sandbox-segment {
  display: inline-flex;
  border: 1px solid var(--pf-line-default);
  border-radius: var(--pf-radius-m);
  background: var(--pf-bg-surface-main);
}
.dsw-sandbox-segment > button:first-child { border-top-left-radius: inherit; border-bottom-left-radius: inherit; }
.dsw-sandbox-segment > button:last-child { border-top-right-radius: inherit; border-bottom-right-radius: inherit; }
.dsw-sandbox-segment > button:focus-visible { position: relative; z-index: 1; }
.dsw-sandbox-segment button {
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
.dsw-sandbox-segment button:last-child {
  border-right: none;
}
.dsw-sandbox-segment button[aria-pressed="true"] {
  background: var(--ds-selected-bg);
  color: var(--ds-selected-text);
  font-weight: var(--pf-type-weight-500);
}
.dsw-sandbox-segment button:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
.dsw-switch-token-table {
  min-width: 720px;
}
.dsw-switch-token-col-name {
  min-width: 148px;
  font-weight: var(--pf-type-weight-500);
}
.dsw-switch-token-name {
  font-weight: var(--pf-type-weight-500);
  text-align: left;
}
.dsw-switch-token-col-var {
  min-width: 168px;
  white-space: nowrap;
}
.dsw-switch-token-col-var code {
  font: var(--pf-font-code-s);
}
.dsw-switch-token-col-mode {
  min-width: 120px;
  width: 150px;
}
.dsw-toast {
  bottom: var(--pf-spacing-24);
  z-index: 1100;
  pointer-events: none;
}
@media (max-width: 767px) {
  .dsw {
    padding: var(--pf-spacing-20) var(--pf-spacing-16) var(--pf-spacing-40);
  }
  .dsw-sandbox-controls {
    gap: var(--pf-spacing-12);
    padding: var(--pf-spacing-12);
  }
  .dsw-sandbox-field {
    flex: 1 1 100%;
    min-width: 0;
    max-width: 100%;
  }
  .dsw-sandbox-segment {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(72px, 1fr));
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }
  .dsw-sandbox-segment button {
    min-width: 0;
    padding: var(--pf-spacing-8) var(--pf-spacing-6);
    font-size: 12px; /* pf-gap: label-m (сегмент, мобильная) */
    border-right: 1px solid var(--pf-line-default);
    border-bottom: 1px solid var(--pf-line-default);
  }
  .dsw-sandbox-segment button:last-child {
    border-right: 1px solid var(--pf-line-default);
  }
}
`;

interface MatrixCellProps {
  label: string;
  checked: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
}

function MatrixCell({ label, checked, isDisabled, isLoading }: MatrixCellProps) {
  return (
    <div className="dsw-matrix-cell">
      <Switch
        checked={checked}
        isDisabled={isDisabled}
        isLoading={isLoading}
        aria-label={label}
        onChange={() => {}}
      />
      <span className="dsw-matrix-cell-label">{label}</span>
    </div>
  );
}

function StateMatrix() {
  return (
    <div className="dsw-matrix">
      <MatrixCell label="Off" checked={false} />
      <MatrixCell label="On" checked />
      <MatrixCell label="Off · loading" checked={false} isLoading />
      <MatrixCell label="On · loading" checked isLoading />
      <MatrixCell label="Off · disabled" checked={false} isDisabled />
      <MatrixCell label="On · disabled" checked isDisabled />
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
    <div className="dsw-sandbox-field">
      <span id={`${label}-label`}>{label}</span>
      <div className="dsw-sandbox-segment" role="group" aria-labelledby={`${label}-label`}>
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
  checked,
  onCheckedChange,
  state,
  onStateChange,
}: {
  mode: ProductColorMode;
  onModeChange: (next: ProductColorMode) => void;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  state: SwitchPreviewState;
  onStateChange: (next: SwitchPreviewState) => void;
}) {
  return (
    <div className="dsw-sandbox-controls">
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
        label="Checked"
        value={checked ? 'on' : 'off'}
        options={[
          { value: 'off', label: 'Off' },
          { value: 'on', label: 'On' },
        ]}
        onChange={(next) => onCheckedChange(next === 'on')}
      />
      <SegmentControl
        label="State"
        value={state}
        options={[
          { value: 'default', label: 'Default' },
          { value: 'hover', label: 'Hover' },
          { value: 'focus', label: 'Focus' },
          { value: 'disabled', label: 'Disabled' },
          { value: 'loading', label: 'Loading' },
        ]}
        onChange={onStateChange}
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
    <div className="ds-toast dsw-toast" role="status" aria-live="polite">
      Скопировано в буфер
    </div>
  ) : null;

  return { copyText, copyNotice };
}

export function SwitchPage() {
  const { copyText, copyNotice } = useCopyNotice();
  const [activeTab, setActiveTab] = useState<SwitchTab>('preview');

  const [previewMode, setPreviewMode] = useState<ProductColorMode>('day');
  const [previewChecked, setPreviewChecked] = useState(true);
  const [previewState, setPreviewState] = useState<SwitchPreviewState>('default');

  const anatomySimState: AnatomySimState =
    previewState === 'hover' || previewState === 'focus' ? previewState : 'default';

  const previewIsDisabled = previewState === 'disabled';
  const previewIsLoading = previewState === 'loading';

  const selection = { mode: previewMode, checked: previewChecked, state: previewState };

  return (
    <div className="dsw">
      <style>{PAGE_STYLE}</style>
      <div className="dsw-shell">
        <DsPageHeader
          title="Switch"
          backHref={HUB_ROUTES.components}
          backAriaLabel="Назад к Components"
          showSearch={false}
        />

        <div className="dsw-layout">
          <div className="dsw-main">
            <ComponentMetaHeader
              name={switchMeta.canonicalName}
              aliases={switchMeta.aliases}
              architectureLevel={switchMeta.architectureLevel}
              group={switchMeta.componentsGroup}
              sourcePath={switchMeta.sourcePath}
              figma={{ fileLabel: 'Wilhelm Library', nodeId: '9872:15', url: FIGMA_URL }}
            />

            <SelectionControls
              mode={previewMode}
              onModeChange={setPreviewMode}
              checked={previewChecked}
              onCheckedChange={setPreviewChecked}
              state={previewState}
              onStateChange={setPreviewState}
            />

            <div className="dsw-tabs" role="tablist" aria-label="Switch review sections">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  className="dsw-tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'preview' && (
              <section className="dsw-section" role="tabpanel">
                <h2>Live demo</h2>
                <p>Keyboard: Tab to focus, Enter/Space to toggle (native button semantics).</p>
                <div className="dsw-theme-block" data-theme={previewMode}>
                  <p className="dsw-theme-label">{previewMode}</p>
                  <div className="dsw-live" data-sim-state={anatomySimState}>
                    <Switch
                      checked={previewChecked}
                      isDisabled={previewIsDisabled}
                      isLoading={previewIsLoading}
                      onChange={setPreviewChecked}
                      aria-label="Пример переключателя"
                    />
                    <span className="dsw-matrix-cell-label">{previewChecked ? 'On' : 'Off'}</span>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'states' && (
              <section className="dsw-section" role="tabpanel">
                <h2>State matrix</h2>
                <p>Статичная матрица Day / Night — все варианты off/on/loading/disabled.</p>
                <div className="dsw-theme-block" data-theme="day">
                  <p className="dsw-theme-label">Day</p>
                  <StateMatrix />
                </div>
                <div className="dsw-theme-block" data-theme="night">
                  <p className="dsw-theme-label">Night</p>
                  <StateMatrix />
                </div>
              </section>
            )}

            {activeTab === 'tokens' && (
              <section className="dsw-section" role="tabpanel">
                <h2>Semantic tokens</h2>
                <p>Значения из pages/aid-portal/data.ts через components/switchTokens.ts.</p>
                <div className="ds-token-table-wrap">
                  <table className="ds-token-table dsw-switch-token-table">
                    <thead>
                      <tr>
                        <th className="dsw-switch-token-col-name">Token</th>
                        <th className="dsw-switch-token-col-var">CSS variable</th>
                        <th className="dsw-switch-token-col-mode">Day</th>
                        <th className="dsw-switch-token-col-mode">Night</th>
                      </tr>
                    </thead>
                    <tbody>
                      {switchTokenSources.map((row) => (
                        <tr key={row.name}>
                          <td className="dsw-switch-token-col-name">
                            <button
                              type="button"
                              className="ds-copyable dsw-switch-token-name"
                              onClick={() => {
                                void copyText(row.name);
                              }}
                            >
                              {row.name}
                            </button>
                          </td>
                          <td className="dsw-switch-token-col-var">
                            <code>{row.cssVar}</code>
                          </td>
                          <td className="dsw-switch-token-col-mode">
                            <ColorModeValueDisplay
                              value={row.day}
                              onCopyHex={(hex) => {
                                void copyText(hex);
                              }}
                            />
                          </td>
                          <td className="dsw-switch-token-col-mode">
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
              </section>
            )}

            {activeTab === 'accessibility' && (
              <section className="dsw-section" role="tabpanel">
                <h2>Accessibility</h2>
                <ul className="dsw-a11y-list">
                  <li>
                    Native <code>&lt;button role="switch" aria-checked&gt;</code> — семантика и клавиатура
                    (Enter/Space) без дополнительного JS.
                  </li>
                  <li>
                    <code>focus-visible</code> ring через Strokes · Primary, hover — только Web (
                    <code>@media (hover: hover)</code>).
                  </li>
                  <li>
                    Интерактивная область кнопки — минимум 44×44px, визуальный трек остаётся 40×24px как в
                    Figma.
                  </li>
                  <li>
                    Disabled — нативный атрибут <code>disabled</code>, opacity 40% (правило доступности, не
                    50% из Figma-мокапа).
                  </li>
                  <li>
                    Loading — <code>aria-busy="true"</code>, кнопка остаётся в фокус-порядке, клик блокируется
                    в обработчике.
                  </li>
                </ul>
              </section>
            )}

            {activeTab === 'anatomy' && (
              <section className="dsw-section" role="tabpanel">
                <h2>Anatomy inspector</h2>
                <AnatomyInspector
                  schema={switchAnatomySchema}
                  mode={previewMode}
                  simState={anatomySimState}
                  remeasureKey={`${previewMode}-${anatomySimState}-${previewChecked}-${previewIsDisabled}-${previewIsLoading}`}
                  resolveProperty={resolveSwitchComputedProperty}
                >
                  <Switch
                    checked={previewChecked}
                    isDisabled={previewIsDisabled}
                    isLoading={previewIsLoading}
                    aria-label="Switch для anatomy inspector"
                    onChange={setPreviewChecked}
                  />
                </AnatomyInspector>
              </section>
            )}
          </div>

          <aside className="dsw-aside" aria-label="Component API and release">
            <ComponentCodeSnippet
              platforms={buildSwitchSnippets(selection)}
              selectionSummary={formatSwitchSelection(selection)}
            />

            <ComponentApiSummary spec={switchApiSpec} />

            <ComponentReleaseStatus
              changelog={switchChangelog}
              pendingItems={switchPendingItems}
              reviewRoute={switchMeta.reviewRoute}
            />

            {switchChangelog ? (
              <ChangelogTable
                data={{
                  artifact: switchChangelog.artifact,
                  currentVersion: switchChangelog.currentVersion ?? '0.0.0',
                  entries: switchChangelog.entries,
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
