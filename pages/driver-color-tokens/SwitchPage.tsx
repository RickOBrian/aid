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
import type { DriverColorMode } from './components/anatomyTypes';

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
  font-family: 'Google Sans', system-ui, sans-serif;
  color: #2d2c2e;
  background: #ffffff;
  min-height: 100vh;
  padding: 40px 48px 64px;
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
    gap: 0 40px;
    align-items: start;
  }
  .dsw-aside {
    position: sticky;
    top: 24px;
    max-height: calc(100vh - 48px);
    overflow-y: auto;
    padding-bottom: 24px;
    border-left: 1px solid #ebedf0;
    padding-left: 40px;
  }
  .dsw-aside .ds-capi,
  .dsw-aside .ds-ccode {
    margin-bottom: 24px;
  }
  .dsw-aside .dsw-release {
    margin-top: 0;
    padding-top: 24px;
    border-top: 1px solid #ebedf0;
  }
  .dsw-aside .dctp-changelog {
    margin-top: 0;
    padding-top: 24px;
    border-top: 1px solid #ebedf0;
  }
  .dsw-main .ds-cmeta {
    margin-bottom: 24px;
  }
}
@media (min-width: 1280px) {
  .dsw-layout {
    grid-template-columns: minmax(0, 1fr) 380px;
    gap: 0 48px;
  }
}
@media (max-width: 1023px) {
  .dsw-aside {
    margin-top: 8px;
    padding-top: 32px;
    border-top: 1px solid #ebedf0;
  }
  .dsw-aside .dsw-release {
    margin-top: 16px;
  }
}
.dsw-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 32px;
  border-bottom: 1px solid #ebedf0;
  padding-bottom: 0;
}
.dsw-tab {
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
.dsw-tab:hover,
.dsw-tab:focus-visible {
  color: #2d2c2e;
  outline: none;
}
.dsw-tab[aria-selected="true"] {
  color: var(--ds-accent);
  border-bottom-color: var(--ds-accent);
}
.dsw-section {
  margin-bottom: 48px;
}
.dsw-section h2 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
}
.dsw-section p {
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.54);
  max-width: 640px;
}
.dsw-theme-block {
  border: 1px solid #ebedf0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
}
.dsw-theme-block[data-theme="night"] {
  background: #2d2c2e;
  border-color: #2d2c2e;
}
.dsw-theme-label {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.38);
  margin: 0 0 16px;
}
.dsw-theme-block[data-theme="night"] .dsw-theme-label {
  color: rgba(255, 255, 255, 0.7);
}
.dsw-matrix {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 20px;
}
.dsw-matrix-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.dsw-matrix-cell-label {
  font-size: 13px;
  line-height: 18px;
  color: rgba(0, 0, 0, 0.54);
}
.dsw-theme-block[data-theme="night"] .dsw-matrix-cell-label {
  color: rgba(255, 255, 255, 0.7);
}
.dsw-live {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
}
.dsw-live[data-sim-state="hover"] .ds-switch-root:not(:disabled):not([aria-disabled="true"]) .ds-switch__track,
.dsw-live[data-sim-state="focus"] .ds-switch-root:not(:disabled):not([aria-disabled="true"]) .ds-switch__track {
  box-shadow: 0 0 0 2px var(--ds-switch-stroke);
}
.dsw-a11y-list {
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.7);
}
.dsw-a11y-list li {
  margin-bottom: 8px;
}
.dsw-sandbox-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  margin-bottom: 24px;
  padding: 16px;
  border: 1px solid #ebedf0;
  border-radius: 12px;
  background: #fafafa;
}
.dsw-sandbox-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dsw-sandbox-field label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.45);
}
.dsw-sandbox-segment {
  display: inline-flex;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}
.dsw-sandbox-segment button {
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
.dsw-sandbox-segment button:last-child {
  border-right: none;
}
.dsw-sandbox-segment button[aria-pressed="true"] {
  background: var(--ds-accent-bg);
  color: var(--ds-accent);
  font-weight: 500;
}
.dsw-sandbox-segment button:focus-visible {
  outline: 2px solid var(--ds-accent);
  outline-offset: -2px;
}
.dsw-switch-token-table {
  min-width: 720px;
}
.dsw-switch-token-col-name {
  min-width: 148px;
  font-weight: 500;
}
.dsw-switch-token-name {
  font-weight: 500;
  text-align: left;
}
.dsw-switch-token-col-var {
  min-width: 168px;
  white-space: nowrap;
}
.dsw-switch-token-col-var code {
  font-size: 12px;
}
.dsw-switch-token-col-mode {
  min-width: 120px;
  width: 150px;
}
.dsw-toast {
  bottom: 32px;
  z-index: 1100;
  pointer-events: none;
}
@media (max-width: 767px) {
  .dsw {
    padding: 20px 16px 40px;
  }
  .dsw-sandbox-controls {
    gap: 12px;
    padding: 12px;
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
    padding: 8px 6px;
    font-size: 12px;
    border-right: 1px solid #ebedf0;
    border-bottom: 1px solid #ebedf0;
  }
  .dsw-sandbox-segment button:last-child {
    border-right: 1px solid #ebedf0;
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
  mode: DriverColorMode;
  onModeChange: (next: DriverColorMode) => void;
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

  const [previewMode, setPreviewMode] = useState<DriverColorMode>('day');
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
                <p>Значения из pages/driver-color-tokens/data.ts через components/switchTokens.ts.</p>
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
                    Disabled — нативный атрибут <code>disabled</code>, opacity 40% (правило `.cursorrules`, не
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
