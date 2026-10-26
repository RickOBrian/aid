/**
 * Переиспользуемые стили таблиц и UI-хрома DS-портала (`pages/aid-portal/`).
 *
 * Новые разделы токенов обязаны подключать:
 * - `DS_TOKEN_TABLE_STYLE` + классы `ds-token-table-wrap` / `ds-token-table`
 * - `DS_CHANGELOG_TABLE_STYLE` + `<ChangelogTable />`
 * - `DS_COPYABLE_STYLE`, `DS_TOAST_STYLE` (или классы `ds-copyable`, `ds-toast`)
 *
 * Канон layout-токенов — `DS_PORTAL_LAYOUT_TOKENS`. Не дублировать значения inline.
 */

/**
 * Layout-/visual-токены портала — ссылки на Persefona Kit (`persefona/tokens.css`,
 * спека presentbook-6). Ключи прежние, значения — только `var(--pf-*)`.
 */
export const DS_PORTAL_LAYOUT_TOKENS = {
  fontFamily: 'var(--pf-type-family-sans-1)',
  fontMono: 'var(--pf-type-family-mono-1)',
  textPrimary: 'var(--pf-text-primary)',
  textSecondary: 'var(--pf-text-secondary)',
  textMuted: 'var(--pf-text-muted)',
  textDisabled: 'var(--pf-text-disabled)',
  surface: 'var(--pf-bg-surface-main)',
  surfaceMuted: 'var(--pf-bg-surface-muted)',
  surfaceZebra: 'var(--pf-bg-surface-zebra)',
  border: 'var(--pf-line-default)',
  borderHover: 'var(--pf-line-hover)',
  toastBackground: 'var(--pf-bg-inverse-main)',
  toastText: 'var(--pf-text-inverse)',
  pagePaddingDesktop: 'var(--pf-spacing-40) var(--pf-spacing-48) var(--pf-spacing-64)',
  pagePaddingTablet: 'var(--pf-spacing-32) var(--pf-spacing-24) var(--pf-spacing-48)',
  pagePaddingMobile: 'var(--pf-spacing-20) var(--pf-spacing-16) var(--pf-spacing-40)',
  /* TableCell (Kit 2:118): Default — body-s, Header — label-xs-caps */
  tableFontSize: 'var(--pf-type-size-13)',
  tableLineHeight: 'var(--pf-type-lh-20)',
  tableHeadFontSize: 'var(--pf-type-size-11)',
  tableHeadLetterSpacing: 'var(--pf-tracking-label-xs-caps)',
  tableCellPadding: 'var(--pf-spacing-12) var(--pf-spacing-16)',
  tableWrapRadius: 'var(--pf-radius-m)',
  /* Статус «ждёт / не выпущено» — Badge Warning и Banner Warning: мягкие, без рамки
     (рамка — цветом фона, чтобы не сдвигать раскладку). */
  statusPendingSurface: 'var(--pf-bg-accent-status-warning-main)',
  statusPendingSurfaceSubtle: 'var(--pf-bg-accent-status-warning-main)',
  statusPendingBorder: 'var(--pf-bg-accent-status-warning-main)',
  statusPendingText: 'var(--pf-text-warning)',
  badgeRadius: 'var(--pf-radius-pill)',
  badgeFontSize: 'var(--pf-type-size-12)',
  badgePadding: 'var(--pf-spacing-4) var(--pf-spacing-8)',
  cardRadius: 'var(--pf-radius-l)',
  shadow1: 'var(--pf-shadow-1)',
  shadow2: 'var(--pf-shadow-2)',
  focusRing: 'var(--pf-focus-ring)',
  focusOffset: 'var(--pf-focus-offset)',
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
  opacity: 0.72; /* pf-gap: состояние hover — bg-accent-states-hover (пачка №0) */
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
  bottom: var(--pf-spacing-24);
  transform: translateX(-50%);
  z-index: 1000;
  padding: var(--pf-spacing-10) var(--pf-spacing-16);
  border-radius: var(--pf-radius-m);
  background: ${DS_PORTAL_LAYOUT_TOKENS.toastBackground};
  color: ${DS_PORTAL_LAYOUT_TOKENS.toastText};
  font: var(--pf-font-body-s);
  box-shadow: var(--pf-shadow-1);
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
  font: var(--pf-font-body-s);
  color: ${DS_PORTAL_LAYOUT_TOKENS.textPrimary};
}
.ds-token-table thead th {
  text-align: left;
  padding: ${DS_PORTAL_LAYOUT_TOKENS.tableCellPadding};
  background: ${DS_PORTAL_LAYOUT_TOKENS.surfaceMuted};
  font: var(--pf-font-label-xs-caps);
  letter-spacing: var(--pf-tracking-label-xs-caps);
  text-transform: uppercase;
  color: ${DS_PORTAL_LAYOUT_TOKENS.textPrimary};
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
  margin-top: var(--pf-spacing-16);
  padding-top: var(--pf-spacing-48);
  border-top: 1px solid ${DS_PORTAL_LAYOUT_TOKENS.border};
}
.dctp-changelog-heading {
  margin: 0 0 var(--pf-spacing-16);
  font: var(--pf-font-heading-m);
  color: ${DS_PORTAL_LAYOUT_TOKENS.textPrimary};
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
  font: var(--pf-font-code-s);
  color: ${DS_PORTAL_LAYOUT_TOKENS.textPrimary};
}
.dctp-changelog-version--unreleased {
  font: var(--pf-font-body-s);
  white-space: nowrap;
}
.dctp-changelog-date {
  font: var(--pf-font-body-s);
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
  gap: var(--pf-spacing-8);
}
.dctp-changelog-change {
  display: flex;
  align-items: flex-start;
  gap: var(--pf-spacing-10);
  font: var(--pf-font-body-s);
  color: ${DS_PORTAL_LAYOUT_TOKENS.textPrimary};
}
.dctp-changelog-change-body {
  display: flex;
  flex-direction: column;
  gap: var(--pf-spacing-8);
  min-width: 0;
}
.dctp-changelog-kind {
  flex-shrink: 0;
  width: var(--pf-spacing-8);
  height: var(--pf-spacing-8);
  margin-top: var(--pf-spacing-6);
  border-radius: var(--pf-radius-pill);
}
.dctp-changelog-change-text {
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
  font: var(--pf-font-body-s);
}
.dctp-changelog-change-details {
  margin: 0;
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
  white-space: pre-wrap;
  font: var(--pf-font-body-s);
  color: ${DS_PORTAL_LAYOUT_TOKENS.textSecondary};
}
.dctp-changelog-empty {
  margin: 0;
  padding: var(--pf-spacing-16) var(--pf-spacing-20);
  border: 1px dashed ${DS_PORTAL_LAYOUT_TOKENS.border};
  border-radius: ${DS_PORTAL_LAYOUT_TOKENS.tableWrapRadius};
  font: var(--pf-font-body-s);
  color: ${DS_PORTAL_LAYOUT_TOKENS.textSecondary};
}
.dctp-changelog-cards {
  display: none;
  flex-direction: column;
  gap: var(--pf-spacing-12);
}
.dctp-changelog-card {
  border: 1px solid ${DS_PORTAL_LAYOUT_TOKENS.border};
  border-radius: ${DS_PORTAL_LAYOUT_TOKENS.tableWrapRadius};
  padding: var(--pf-spacing-16);
  background: ${DS_PORTAL_LAYOUT_TOKENS.surface};
}
.dctp-changelog-card-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--pf-spacing-8);
  margin-bottom: var(--pf-spacing-8);
}
.dctp-changelog-card-author {
  margin: 0 0 var(--pf-spacing-12);
  /* pf-gap: body-xs 12/16 ещё не в Kit (спека §7.1, п. 6а) — прежний размер */
  font-size: 11px;
  line-height: 14px;
  color: ${DS_PORTAL_LAYOUT_TOKENS.textSecondary};
}
@media (max-width: 767px) {
  .dctp-changelog {
    padding-top: var(--pf-spacing-32);
  }
  .dctp-changelog-table-wrap {
    display: none;
  }
  .dctp-changelog-cards {
    display: flex;
  }
}
`;
