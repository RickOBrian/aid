import { useState } from 'react';
import {
  ComponentReleaseStatus,
  COMPONENT_RELEASE_STATUS_STYLE,
} from './ComponentReleaseStatus';
import { DsPageHeader } from './DsPageHeader';
import { HUB_ROUTES } from './hubData';
import { Switch } from './components/Switch';
import { DS_CHANGELOG_TABLE_STYLE } from './dsChangelogTable';
import { loadComponentChangelog } from './loadComponentChangelog';
import { loadComponentPendingItems, formatReleasedVersionLabel } from './loadComponentPending';
import switchMeta from './components/switch.meta.json';

const switchChangelog = loadComponentChangelog('switch');
const switchPendingItems = loadComponentPendingItems('switch');

/**
 * Switch — review/sandbox page (temporary placement, Option A).
 *
 * componentsRoot for Driver is still `null` (`products/driver/product.json`);
 * this page and route live inside the existing presentbook until a
 * permanent component architecture is approved by Principal Designer.
 */

const PAGE_STYLE = `
${DS_CHANGELOG_TABLE_STYLE}
${COMPONENT_RELEASE_STATUS_STYLE}
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
  max-width: 960px;
  margin: 0 auto;
}
.dsw-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  background: #f5f5f5;
  border: 1px solid #ebedf0;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: rgba(0, 0, 0, 0.54);
  margin-bottom: 24px;
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
.dsw-meta {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 8px 16px;
  font-size: 13px;
  line-height: 20px;
  margin-bottom: 40px;
  padding: 16px 20px;
  border: 1px solid #ebedf0;
  border-radius: 12px;
}
.dsw-meta dt {
  color: rgba(0, 0, 0, 0.54);
}
.dsw-meta dd {
  margin: 0;
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

export function SwitchPage() {
  const [liveChecked, setLiveChecked] = useState(true);

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
        <span className="dsw-badge">Review sandbox · componentsRoot: null</span>
        <span className="dsw-pending-badge" style={{ marginLeft: 8 }}>
          Pending initial release
        </span>

        <dl className="dsw-meta">
          <dt>Canonical name</dt>
          <dd>
            {switchMeta.canonicalName} (alias: {switchMeta.aliases.join(', ')})
          </dd>
          <dt>Current version</dt>
          <dd>
            {formatReleasedVersionLabel(switchMeta.currentVersion)} · Pending initial release
          </dd>
          <dt>Review route</dt>
          <dd>{switchMeta.reviewRoute}</dd>
          <dt>Architecture level</dt>
          <dd>Surface View</dd>
          <dt>Components group</dt>
          <dd>Controls</dd>
          <dt>Tokens</dt>
          <dd>Controls · Checked / Unchecked / Key, Strokes · Primary</dd>
          <dt>Figma source</dt>
          <dd>🕓 Wilhelm Library, node 9872:15</dd>
          <dt>Source file</dt>
          <dd>pages/driver-color-tokens/components/Switch.tsx</dd>
        </dl>

        <section className="dsw-section">
          <h2>Live demo</h2>
          <p>Keyboard: Tab to focus, Enter/Space to toggle (native button semantics).</p>
          <div className="dsw-live">
            <Switch checked={liveChecked} onChange={setLiveChecked} aria-label="Пример переключателя" />
            <span>{liveChecked ? 'On' : 'Off'}</span>
          </div>
        </section>

        <section className="dsw-section">
          <h2>State matrix — Day (light)</h2>
          <p>row.day из pages/driver-color-tokens/data.ts.</p>
          <div className="dsw-theme-block" data-theme="day">
            <p className="dsw-theme-label">Day</p>
            <StateMatrix />
          </div>
        </section>

        <section className="dsw-section">
          <h2>State matrix — Night (dark)</h2>
          <p>row.night из pages/driver-color-tokens/data.ts.</p>
          <div className="dsw-theme-block" data-theme="night">
            <p className="dsw-theme-label">Night</p>
            <StateMatrix />
          </div>
        </section>

        <section className="dsw-section">
          <h2>Accessibility</h2>
          <ul className="dsw-a11y-list">
            <li>Native <code>&lt;button role="switch" aria-checked&gt;</code> — семантика и клавиатура (Enter/Space) без дополнительного JS.</li>
            <li><code>focus-visible</code> ring через Strokes · Primary, hover — только Web (<code>@media (hover: hover)</code>).</li>
            <li>Интерактивная область кнопки — минимум 44×44px, визуальный трек остаётся 40×24px как в Figma.</li>
            <li>Disabled — нативный атрибут <code>disabled</code>, opacity 40% (правило `.cursorrules`, не 50% из Figma-мокапа).</li>
            <li>Loading — <code>aria-busy="true"</code>, кнопка остаётся в фокус-порядке, клик блокируется в обработчике.</li>
          </ul>
        </section>

        <ComponentReleaseStatus
          componentName={switchMeta.canonicalName}
          changelog={switchChangelog}
          pendingItems={switchPendingItems}
          reviewRoute={switchMeta.reviewRoute}
        />
      </div>
    </div>
  );
}
