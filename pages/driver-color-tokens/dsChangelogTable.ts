/**
 * Переиспользуемые стили таблиц и UI-хрома DS-портала (`pages/driver-color-tokens/`).
 *
 * Новые разделы токенов обязаны подключать:
 * - `DS_TOKEN_TABLE_STYLE` + классы `ds-token-table-wrap` / `ds-token-table`
 * - `DS_CHANGELOG_TABLE_STYLE` + `<ChangelogTable />`
 * - `DS_COPYABLE_STYLE`, `DS_TOAST_STYLE` (или классы `ds-copyable`, `ds-toast`)
 *
 * Канон layout-токенов — `DS_PORTAL_LAYOUT_TOKENS`. Не дублировать значения inline.
 */

/** Канонические layout-/visual-токены портала aid-ds. */
export const DS_PORTAL_LAYOUT_TOKENS = {
  fontFamily: "'Google Sans', system-ui, sans-serif",
  textPrimary: '#2d2c2e',
  textSecondary: 'rgba(0, 0, 0, 0.54)',
  textMuted: 'rgba(0, 0, 0, 0.38)',
  surface: '#ffffff',
  surfaceMuted: '#f5f5f5',
  surfaceZebra: '#fafafa',
  border: '#ebedf0',
  toastBackground: '#2d2c2e',
  toastText: '#ffffff',
  pagePaddingDesktop: '40px 48px 64px',
  pagePaddingTablet: '32px 24px 48px',
  pagePaddingMobile: '20px 16px 40px',
  tableFontSize: '13px',
  tableLineHeight: '16px',
  tableHeadFontSize: '11px',
  tableHeadLetterSpacing: '0.06em',
  tableCellPadding: '10px 16px',
  tableWrapRadius: '8px',
} as const;

/** Кнопки копирования значений/токенов. На новых страницах — класс `ds-copyable`. */
export const DS_COPYABLE_STYLE = `
.ds-copyable,
.dctp-copyable,
.dtp-copyable,
.dsp-copyable,
.drp-copyable,
.dps-copyable {
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
  text-align: inherit;
}
.ds-copyable:hover,
.dctp-copyable:hover,
.dtp-copyable:hover,
.dsp-copyable:hover,
.drp-copyable:hover,
.dps-copyable:hover {
  opacity: 0.72;
}
`;

/** Toast «Скопировано в буфер». На новых страницах — класс `ds-toast`. */
export const DS_TOAST_STYLE = `
.ds-toast,
.dctp-toast,
.dtp-toast,
.dsp-toast,
.drp-toast,
.dps-toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  z-index: 1000;
  padding: 10px 16px;
  border-radius: 8px;
  background: ${DS_PORTAL_LAYOUT_TOKENS.toastBackground};
  color: ${DS_PORTAL_LAYOUT_TOKENS.toastText};
  font-size: 13px;
  line-height: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
}
`;

/** Общие стили таблиц данных разделов токенов. */
export const DS_TOKEN_TABLE_STYLE = `
.ds-token-table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid ${DS_PORTAL_LAYOUT_TOKENS.border};
  border-radius: ${DS_PORTAL_LAYOUT_TOKENS.tableWrapRadius};
}
.ds-token-table {
  width: 100%;
  border-collapse: collapse;
  font-size: ${DS_PORTAL_LAYOUT_TOKENS.tableFontSize};
  line-height: ${DS_PORTAL_LAYOUT_TOKENS.tableLineHeight};
}
.ds-token-table thead th {
  text-align: left;
  padding: ${DS_PORTAL_LAYOUT_TOKENS.tableCellPadding};
  background: ${DS_PORTAL_LAYOUT_TOKENS.surfaceMuted};
  font-size: ${DS_PORTAL_LAYOUT_TOKENS.tableHeadFontSize};
  font-weight: 500;
  letter-spacing: ${DS_PORTAL_LAYOUT_TOKENS.tableHeadLetterSpacing};
  text-transform: uppercase;
  color: ${DS_PORTAL_LAYOUT_TOKENS.textSecondary};
  border-bottom: 1px solid ${DS_PORTAL_LAYOUT_TOKENS.border};
  white-space: nowrap;
  vertical-align: bottom;
}
.ds-token-table tbody tr + tr td {
  border-top: 1px solid ${DS_PORTAL_LAYOUT_TOKENS.border};
}
.ds-token-table td {
  padding: ${DS_PORTAL_LAYOUT_TOKENS.tableCellPadding};
  vertical-align: middle;
}
`;

export const DS_CHANGELOG_TABLE_STYLE = `
${DS_TOKEN_TABLE_STYLE}
.dctp-table {
  min-width: 640px;
  table-layout: auto;
}
.dctp-table td {
  overflow: visible;
}
.dctp-changelog {
  margin-top: 16px;
  padding-top: 48px;
  border-top: 1px solid ${DS_PORTAL_LAYOUT_TOKENS.border};
}
.dctp-changelog-heading {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
}
.dctp-changelog-table {
  min-width: 720px;
}
.dctp-changelog-col-version,
.dctp-table thead th.dctp-changelog-col-version {
  width: 96px;
  min-width: 88px;
  white-space: nowrap;
}
.dctp-changelog-col-date,
.dctp-table thead th.dctp-changelog-col-date {
  width: 160px;
  min-width: 140px;
  border-left: 1px solid ${DS_PORTAL_LAYOUT_TOKENS.border};
  white-space: nowrap;
}
.dctp-changelog-col-author,
.dctp-table thead th.dctp-changelog-col-author {
  width: 120px;
  min-width: 100px;
  border-left: 1px solid ${DS_PORTAL_LAYOUT_TOKENS.border};
  white-space: nowrap;
}
.dctp-changelog-col-changes,
.dctp-table thead th.dctp-changelog-col-changes {
  min-width: 280px;
  border-left: 1px solid ${DS_PORTAL_LAYOUT_TOKENS.border};
}
.dctp-table thead th.dctp-group-day,
.dctp-table thead th.dctp-group-night {
  border-left: 1px solid ${DS_PORTAL_LAYOUT_TOKENS.border};
}
.dctp-changelog-version {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  font-weight: 500;
  line-height: 16px;
  color: ${DS_PORTAL_LAYOUT_TOKENS.textPrimary};
}
.dctp-changelog-date {
  font-size: 13px;
  line-height: 16px;
  color: ${DS_PORTAL_LAYOUT_TOKENS.textSecondary};
}
.dctp-changelog-col-author {
  color: ${DS_PORTAL_LAYOUT_TOKENS.textSecondary};
}
.dctp-changelog-changes {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dctp-changelog-change {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  line-height: 20px;
  color: ${DS_PORTAL_LAYOUT_TOKENS.textPrimary};
}
.dctp-changelog-change-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.dctp-changelog-kind {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  margin-top: 6px;
  border-radius: 50%;
}
.dctp-changelog-change-text {
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
  font-size: 14px;
  line-height: normal;
}
.dctp-changelog-change-details {
  margin: 0;
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
  white-space: pre-wrap;
  font-size: 14px;
  font-weight: 500;
  line-height: normal;
}
.dctp-changelog-cards {
  display: none;
  flex-direction: column;
  gap: 12px;
}
.dctp-changelog-card {
  border: 1px solid ${DS_PORTAL_LAYOUT_TOKENS.border};
  border-radius: ${DS_PORTAL_LAYOUT_TOKENS.tableWrapRadius};
  padding: 14px 16px;
  background: ${DS_PORTAL_LAYOUT_TOKENS.surface};
}
.dctp-changelog-card-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.dctp-changelog-card-author {
  margin: 0 0 12px;
  font-size: 11px;
  line-height: 14px;
  color: ${DS_PORTAL_LAYOUT_TOKENS.textSecondary};
}
@media (max-width: 767px) {
  .dctp-changelog {
    padding-top: 32px;
  }
  .dctp-changelog-table-wrap {
    display: none;
  }
  .dctp-changelog-cards {
    display: flex;
  }
}
`;
