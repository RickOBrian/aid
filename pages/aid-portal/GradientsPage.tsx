import { useMemo, useRef, useState } from 'react';
import { ChangelogTable } from './ChangelogTable';
import { DsPageHeader } from './DsPageHeader';
import {
  DS_CHANGELOG_TABLE_STYLE,
  DS_COPYABLE_STYLE,
  DS_PORTAL_LAYOUT_TOKENS,
  DS_TOAST_STYLE,
  DS_TOKEN_TABLE_STYLE,
} from './dsChangelogTable';
import {
  DS_VALUE_META_CAPTION_CLASS,
  DS_VALUE_META_CLASS,
  DS_VALUE_META_PRIMARY_CLASS,
  DS_VALUE_META_STYLE,
} from './dsValueMeta';
import {
  gradientCss,
  gradientStyles,
  gradientsCollection,
  splitGradientColor,
  type GradientMode,
  type GradientStyle,
} from './gradientsData';
import { loadTokenChangelog } from './loadTokenChangelog';

/**
 * Gradients — Driver. Устроена как Shadows: на каждый стиль — превью и
 * таблица, внизу changelog коллекции. Режим Day/Night переключает превью;
 * в таблице видны оба значения каждой точки.
 */

const T = DS_PORTAL_LAYOUT_TOKENS;

const PAGE_STYLE = `
${DS_CHANGELOG_TABLE_STYLE}
${DS_COPYABLE_STYLE}
${DS_TOAST_STYLE}
${DS_TOKEN_TABLE_STYLE}
${DS_VALUE_META_STYLE}
.dgp,
.dgp *,
.dgp *::before,
.dgp *::after {
  box-sizing: border-box;
}
.dgp {
  font-family: ${T.fontFamily};
  color: ${T.textPrimary};
  background: ${T.surface};
  min-height: 100vh;
  padding: ${T.pagePaddingDesktop};
}
.dgp-data {
  border: 1px solid ${T.border};
  border-radius: ${T.tableWrapRadius};
  overflow: hidden;
}
.dgp-style-row {
  display: flex;
  gap: var(--pf-spacing-48);
  align-items: flex-start;
  padding: var(--pf-spacing-24) var(--pf-spacing-16);
  border-bottom: 1px solid ${T.border};
}
.dgp-style-row:last-child {
  border-bottom: none;
}
.dgp-sample {
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  gap: var(--pf-spacing-12);
}
.dgp-sample__label {
  margin: 0;
  font: var(--pf-font-label-xs-caps);
  letter-spacing: var(--pf-tracking-label-xs-caps);
  text-transform: uppercase;
  color: ${T.textSecondary};
}
.dgp-sample__stage {
  padding: var(--pf-spacing-16);
  border: 1px solid ${T.border};
  border-radius: ${T.tableWrapRadius};
  background: ${T.surfaceMuted};
}
.dgp-sample__preview {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--pf-radius-l);
}
.dgp-sample__caption {
  margin: 0;
  /* pf-gap: body-xs 12/16·400 — до него прежний размер 11/14 */
  font-size: 11px;
  line-height: 14px;
  color: ${T.textSecondary};
}
.dgp-token-table-wrap {
  flex: 1 1 580px;
  min-width: 0;
}
.ds-token-table tbody tr:nth-child(even) td {
  background: ${T.surfaceZebra};
}
.dgp-col-variable {
  color: ${T.textSecondary};
  white-space: nowrap;
}
.dgp-col-position {
  width: 90px;
}
.dgp-color {
  display: flex;
  align-items: center;
  gap: var(--pf-spacing-8);
}
.dgp-color__swatch {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: 1px solid ${T.border};
  border-radius: var(--pf-radius-s);
}
.dgp-mode-field {
  display: flex;
  flex-direction: column;
  gap: var(--pf-spacing-4);
}
.dgp-mode-field span {
  font: var(--pf-font-label-xs-caps);
  letter-spacing: var(--pf-tracking-label-xs-caps);
  text-transform: uppercase;
  color: ${T.textSecondary};
}
.dgp-mode-segment {
  display: inline-flex;
  border: 1px solid ${T.border};
  border-radius: ${T.tableWrapRadius};
  background: ${T.surface};
}
.dgp-mode-segment > button:first-child { border-top-left-radius: inherit; border-bottom-left-radius: inherit; }
.dgp-mode-segment > button:last-child { border-top-right-radius: inherit; border-bottom-right-radius: inherit; }
.dgp-mode-segment > button:focus-visible { position: relative; z-index: 1; }
.dgp-mode-segment button {
  margin: 0;
  padding: var(--pf-spacing-6) var(--pf-spacing-12);
  border: none;
  border-right: 1px solid ${T.border};
  background: transparent;
  font: inherit;
  /* pf-gap: label-m 14/20·500 — до него прежний размер 13 */
  font-size: 13px;
  cursor: pointer;
  color: ${T.textSecondary};
}
.dgp-mode-segment button:last-child {
  border-right: none;
}
.dgp-mode-segment button[aria-pressed="true"] {
  background: var(--ds-selected-bg);
  color: var(--ds-selected-text);
  font-weight: var(--pf-type-weight-500);
}
.dgp-mode-segment button:focus-visible {
  outline: var(--pf-focus-ring);
  outline-offset: var(--pf-focus-offset);
}
@media (max-width: 1023px) {
  .dgp {
    padding: ${T.pagePaddingTablet};
  }
  .dgp-style-row {
    gap: var(--pf-spacing-24);
  }
}
@media (max-width: 767px) {
  .dgp {
    padding: ${T.pagePaddingMobile};
  }
  .dgp-style-row {
    flex-direction: column;
    gap: var(--pf-spacing-16);
    padding: var(--pf-spacing-16);
  }
  .dgp-sample,
  .dgp-token-table-wrap {
    flex-basis: auto;
    width: 100%;
  }
  .dgp-sample__preview {
    max-width: 200px;
  }
  .ds-token-table {
    min-width: 520px;
  }
}
`;

function useCopyNotice() {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setVisible(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
        timeoutRef.current = null;
      }, 2000);
    } catch {
      // noop
    }
  };

  const copyNotice = visible ? (
    <div className="ds-toast" role="status" aria-live="polite">
      Скопировано в буфер
    </div>
  ) : null;

  return { copyText, copyNotice };
}

function ModeSegmentControl({ value, onChange }: { value: GradientMode; onChange: (mode: GradientMode) => void }) {
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

function ColorCell({ value, onCopyText }: { value: string; onCopyText: (text: string) => void }) {
  const { hex, opacity } = splitGradientColor(value);

  return (
    <td>
      <div className="dgp-color">
        <span className="dgp-color__swatch" style={{ background: value }} aria-hidden="true" />
        <div className={DS_VALUE_META_CLASS}>
          <button
            type="button"
            className={`ds-copyable ${DS_VALUE_META_PRIMARY_CLASS}`}
            onClick={() => {
              void onCopyText(hex);
            }}
          >
            {hex}
          </button>
          <span className={DS_VALUE_META_CAPTION_CLASS}>{opacity}%</span>
        </div>
      </div>
    </td>
  );
}

function GradientStyleRow({
  item,
  mode,
  onCopyText,
}: {
  item: GradientStyle;
  mode: GradientMode;
  onCopyText: (text: string) => void;
}) {
  return (
    <article className="dgp-style-row">
      <div className="dgp-sample">
        <p className="dgp-sample__label">{item.name}</p>
        <div className="dgp-sample__stage">
          <div
            className="dgp-sample__preview"
            style={{ background: gradientCss(item, mode) }}
            role="img"
            aria-label={`${item.name}, ${mode === 'day' ? 'Day' : 'Night'}`}
          />
        </div>
        <p className="dgp-sample__caption">Линейный · {item.angle}°</p>
      </div>
      <div className="dgp-token-table-wrap ds-token-table-wrap">
        <table className="ds-token-table">
          <thead>
            <tr>
              <th>Переменная</th>
              <th className="dgp-col-position">Позиция</th>
              <th>Day</th>
              <th>Night</th>
            </tr>
          </thead>
          <tbody>
            {item.stops.map((stop) => (
              <tr key={stop.variable}>
                <td className="dgp-col-variable">
                  <button
                    type="button"
                    className="ds-copyable"
                    onClick={() => {
                      void onCopyText(stop.variable);
                    }}
                  >
                    {stop.variable}
                  </button>
                </td>
                <td className="dgp-col-position">{stop.position}%</td>
                <ColorCell value={stop.day} onCopyText={onCopyText} />
                <ColorCell value={stop.night} onCopyText={onCopyText} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export function GradientsPage() {
  const [mode, setMode] = useState<GradientMode>('day');
  const { copyText, copyNotice } = useCopyNotice();
  const changelog = useMemo(() => loadTokenChangelog(gradientsCollection.collectionName), []);

  return (
    <div className="dgp">
      <style>{PAGE_STYLE}</style>

      <DsPageHeader
        title="Gradients"
        showSearch={false}
        actions={<ModeSegmentControl value={mode} onChange={setMode} />}
      />

      <div className="dgp-data">
        {gradientStyles.map((item) => (
          <GradientStyleRow key={item.id} item={item} mode={mode} onCopyText={copyText} />
        ))}
      </div>

      {changelog ? <ChangelogTable data={changelog} /> : null}

      {copyNotice}
    </div>
  );
}
