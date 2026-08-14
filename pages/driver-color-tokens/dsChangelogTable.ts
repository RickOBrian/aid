/**
 * Переиспользуемые стили таблицы Changelog DS-портала.
 * Подключать `DS_CHANGELOG_TABLE_STYLE` на странице с `<ChangelogTable />`.
 */

export const DS_CHANGELOG_TABLE_STYLE = `
.dctp-table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid #ebedf0;
  border-radius: 8px;
}
.dctp-table {
  width: 100%;
  min-width: 640px;
  table-layout: auto;
  border-collapse: collapse;
  font-size: 13px;
  line-height: 16px;
}
.dctp-table thead th {
  text-align: left;
  padding: 12px 16px;
  background: #f5f5f5;
  color: rgba(0, 0, 0, 0.54);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-bottom: 1px solid #ebedf0;
  white-space: nowrap;
  vertical-align: bottom;
}
.dctp-table tbody tr + tr td {
  border-top: 1px solid #ebedf0;
}
.dctp-table td {
  padding: 10px 16px;
  vertical-align: middle;
  overflow: visible;
}
.dctp-changelog {
  margin-top: 16px;
  padding-top: 48px;
  border-top: 1px solid #ebedf0;
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
  border-left: 1px solid #ebedf0;
  white-space: nowrap;
}
.dctp-changelog-col-author,
.dctp-table thead th.dctp-changelog-col-author {
  width: 120px;
  min-width: 100px;
  border-left: 1px solid #ebedf0;
  white-space: nowrap;
}
.dctp-changelog-col-changes,
.dctp-table thead th.dctp-changelog-col-changes {
  min-width: 280px;
  border-left: 1px solid #ebedf0;
}
.dctp-changelog-version {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  font-weight: 500;
  line-height: 16px;
  color: #2d2c2e;
}
.dctp-changelog-date {
  font-size: 13px;
  line-height: 16px;
  color: rgba(0, 0, 0, 0.54);
}
.dctp-changelog-col-author {
  color: rgba(0, 0, 0, 0.54);
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
  color: #2d2c2e;
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
}
`;
