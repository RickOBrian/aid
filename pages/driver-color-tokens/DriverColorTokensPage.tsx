import type { CSSProperties } from 'react';
import {
  semanticColorSections,
  type ColorModeValue,
  type SemanticColorRow,
} from './data';

const PAGE_STYLE = `
.dctp {
  font-family: 'Google Sans', system-ui, sans-serif;
  color: #2d2c2e;
  background: #ffffff;
  min-height: 100vh;
  padding: 40px 48px 64px;
}
.dctp-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ebedf0;
}
.dctp-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 500;
  line-height: 36px;
}
.dctp section {
  margin-bottom: 48px;
}
.dctp h2 {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
}
.dctp-table-wrap {
  overflow-x: auto;
  border: 1px solid #ebedf0;
  border-radius: 8px;
}
.dctp-table {
  width: 100%;
  table-layout: fixed;
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
}
.dctp-table thead th.dctp-group-day,
.dctp-table thead th.dctp-group-night {
  text-align: center;
  border-left: 1px solid #ebedf0;
}
.dctp-table tbody tr + tr td {
  border-top: 1px solid #ebedf0;
}
.dctp-table td {
  padding: 10px 16px;
  vertical-align: top;
}
.dctp-col-name,
.dctp-table thead th.dctp-col-name {
  width: 180px;
  font-weight: 500;
  white-space: normal;
  overflow-wrap: break-word;
}
.dctp-col-description,
.dctp-table thead th.dctp-col-description {
  width: 380px;
  border-left: 1px solid #ebedf0;
  color: rgba(0, 0, 0, 0.54);
  white-space: normal;
  overflow-wrap: break-word;
  word-break: break-word;
  line-height: 20px;
}
.dctp-col-mode {
  border-left: 1px solid #ebedf0;
  white-space: nowrap;
}
.dctp-col-preview {
  width: 48px;
  padding-right: 8px;
}
.dctp-col-hex,
.dctp-col-opacity {
  font-family: 'Google Sans', system-ui, sans-serif;
  font-size: 12px;
  white-space: nowrap;
}
.dctp-col-mode.dctp-col-preview {
  vertical-align: middle;
}
.dctp-swatch {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background-color: #ffffff;
  background-image:
    linear-gradient(45deg, #eeeeee 25%, transparent 25%),
    linear-gradient(-45deg, #eeeeee 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #eeeeee 75%),
    linear-gradient(-45deg, transparent 75%, #eeeeee 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0;
  overflow: hidden;
}
.dctp-swatch-fill {
  width: 100%;
  height: 100%;
}
`;

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '');
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function colorFillStyle({ hex, opacity }: ColorModeValue): CSSProperties {
  const { r, g, b } = hexToRgb(hex);
  return { backgroundColor: `rgba(${r}, ${g}, ${b}, ${opacity / 100})` };
}

function MiniSwatch({ value }: { value: ColorModeValue }) {
  return (
    <div className="dctp-swatch">
      <div className="dctp-swatch-fill" style={colorFillStyle(value)} />
    </div>
  );
}

function ModeCells({ value }: { value: ColorModeValue }) {
  return (
    <>
      <td className="dctp-col-mode dctp-col-preview">
        <MiniSwatch value={value} />
      </td>
      <td className="dctp-col-mode dctp-col-hex">{value.hex.toUpperCase()}</td>
      <td className="dctp-col-mode dctp-col-opacity">{value.opacity}%</td>
    </>
  );
}

function SemanticColorRowView({ row }: { row: SemanticColorRow }) {
  return (
    <tr>
      <td className="dctp-col-name">{row.name}</td>
      <ModeCells value={row.day} />
      <ModeCells value={row.night} />
      <td className="dctp-col-description">{row.description}</td>
    </tr>
  );
}

function SemanticColorTable({ rows }: { rows: SemanticColorRow[] }) {
  return (
    <div className="dctp-table-wrap">
      <table className="dctp-table">
        <thead>
          <tr>
            <th rowSpan={2} className="dctp-col-name">Название</th>
            <th className="dctp-group-day" colSpan={3}>Day</th>
            <th className="dctp-group-night" colSpan={3}>Night</th>
            <th rowSpan={2} className="dctp-col-description">Описание</th>
          </tr>
          <tr>
            <th className="dctp-col-mode">Цвет</th>
            <th className="dctp-col-mode">HEX</th>
            <th className="dctp-col-mode">Opacity</th>
            <th className="dctp-col-mode">Цвет</th>
            <th className="dctp-col-mode">HEX</th>
            <th className="dctp-col-mode">Opacity</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <SemanticColorRowView key={row.name} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DriverColorTokensPage() {
  return (
    <div className="dctp">
      <style>{PAGE_STYLE}</style>

      <header className="dctp-header">
        <h1>Color</h1>
      </header>

      {semanticColorSections.map(({ title, rows }) => (
        <section key={title}>
          <h2>{title}</h2>
          <SemanticColorTable rows={rows} />
        </section>
      ))}
    </div>
  );
}
