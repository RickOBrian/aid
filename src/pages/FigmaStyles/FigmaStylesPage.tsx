import type { CSSProperties } from 'react';
import {
  backgroundColors,
  buttonColors,
  effectStyles,
  gradients,
  iconColors,
  localEffectStyles,
  messageFieldColors,
  pastelColors,
  strokeColors,
  textColors,
  typographyStyles,
  utilityColors,
  type ColorSwatch,
  type ShadowLayer,
  type ShadowStyle,
  type Swatch,
  type TypographyStyle,
} from './data';

/**
 * Табличный дамп цветовых стилей из Figma «Driver App • Work».
 * Значения рендерятся буквально из data.ts — без токенов и CSS-переменных.
 */

const PAGE_STYLE = `
.fsp {
  font-family: 'Roboto', system-ui, sans-serif;
  color: #2d2c2e;
  background: #ffffff;
  min-height: 100vh;
  padding: 40px 48px 64px;
}
.fsp-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ebedf0;
}
.fsp-header h1 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 500;
  line-height: 36px;
}
.fsp-header p {
  margin: 0;
  color: rgba(0, 0, 0, 0.54);
  font-size: 14px;
  line-height: 20px;
}
.fsp section {
  margin-bottom: 48px;
}
.fsp h2 {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
  color: #2d2c2e;
}
.fsp-table-wrap {
  overflow-x: auto;
  border: 1px solid #ebedf0;
  border-radius: 8px;
}
.fsp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  line-height: 16px;
}
.fsp-table thead th {
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
.fsp-table tbody tr + tr td {
  border-top: 1px solid #ebedf0;
}
.fsp-table td {
  padding: 10px 16px;
  vertical-align: middle;
}
.fsp-table td.fsp-col-preview {
  width: 56px;
  padding-right: 8px;
}
.fsp-table td.fsp-col-name {
  min-width: 220px;
  font-weight: 500;
  word-break: break-word;
}
.fsp-table td.fsp-col-hex,
.fsp-table td.fsp-col-opacity {
  font-family: 'Roboto Mono', 'SF Mono', Menlo, Consolas, monospace;
  font-size: 12px;
  white-space: nowrap;
}
.fsp-table td.fsp-col-comment {
  color: rgba(0, 0, 0, 0.54);
  min-width: 180px;
}
.fsp-mini-swatch {
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
.fsp-mini-swatch-fill {
  width: 100%;
  height: 100%;
}
.fsp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
.fsp-card {
  background: #ffffff;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.fsp-type-sample {
  background: #ffffff;
  border-radius: 6px;
  padding: 12px 8px;
  color: #111111;
}
.fsp-name {
  font-size: 13px;
  font-weight: 600;
  word-break: break-word;
}
.fsp-meta {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.54);
  font-family: 'Roboto Mono', 'SF Mono', Menlo, Consolas, monospace;
}
.fsp-comment {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.38);
}
.fsp-shadow-box {
  width: 100%;
  height: 96px;
  border-radius: 8px;
  background: #ffffff;
  margin: 16px 0 8px;
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

function colorFillStyle(hex: string, opacity: number): CSSProperties {
  const { r, g, b } = hexToRgb(hex);
  return { backgroundColor: `rgba(${r}, ${g}, ${b}, ${opacity / 100})` };
}

function shadowLayerToCss(layer: ShadowLayer): string {
  return `${layer.offsetX}px ${layer.offsetY}px ${layer.blur}px ${layer.color}`;
}

function shadowToBoxShadow(layers: ShadowLayer[]): string {
  return layers.map(shadowLayerToCss).join(', ');
}

function MiniSwatch({ fillStyle }: { fillStyle: CSSProperties }) {
  return (
    <div className="fsp-mini-swatch">
      <div className="fsp-mini-swatch-fill" style={fillStyle} />
    </div>
  );
}

function ColorTokenRow({ swatch }: { swatch: ColorSwatch }) {
  return (
    <tr>
      <td className="fsp-col-preview">
        <MiniSwatch fillStyle={colorFillStyle(swatch.hex, swatch.opacity)} />
      </td>
      <td className="fsp-col-name">{swatch.name}</td>
      <td className="fsp-col-hex">{swatch.hex.toUpperCase()}</td>
      <td className="fsp-col-opacity">{swatch.opacity}%</td>
      <td className="fsp-col-comment">{swatch.comment ?? '—'}</td>
    </tr>
  );
}

function GradientTokenRow({ swatch }: { swatch: Extract<Swatch, { type: 'gradient' }> }) {
  return (
    <tr>
      <td className="fsp-col-preview">
        <MiniSwatch fillStyle={{ backgroundImage: swatch.gradient }} />
      </td>
      <td className="fsp-col-name">{swatch.name}</td>
      <td className="fsp-col-hex" colSpan={2}>Linear gradient</td>
      <td className="fsp-col-comment">{swatch.comment ?? '—'}</td>
    </tr>
  );
}

function ColorTokensTable({ swatches }: { swatches: Swatch[] }) {
  return (
    <div className="fsp-table-wrap">
      <table className="fsp-table">
        <thead>
          <tr>
            <th>Preview</th>
            <th>Name</th>
            <th>HEX</th>
            <th>Opacity</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {swatches.map((swatch) =>
            swatch.type === 'gradient'
              ? <GradientTokenRow key={swatch.name} swatch={swatch} />
              : <ColorTokenRow key={swatch.name} swatch={swatch} />,
          )}
        </tbody>
      </table>
    </div>
  );
}

function ColorSection({ title, swatches }: { title: string; swatches: Swatch[] }) {
  return (
    <section>
      <h2>{title}</h2>
      <ColorTokensTable swatches={swatches} />
    </section>
  );
}

function TypographyCard({ style }: { style: TypographyStyle }) {
  const sampleStyle: CSSProperties = {
    fontFamily: style.fontFamily,
    fontSize: style.fontSizePx,
    lineHeight: `${style.lineHeightPx}px`,
    letterSpacing: style.letterSpacingPx,
  };

  return (
    <div className="fsp-card">
      <div className="fsp-type-sample" style={sampleStyle}>Aa Пример текста</div>
      <div className="fsp-name">{style.name}</div>
      <div className="fsp-meta">
        {style.fontFamily} · {style.fontSizePx}/{style.lineHeightPx}px · track {style.letterSpacingPx}px
      </div>
      {style.comment && <div className="fsp-comment">{style.comment}</div>}
    </div>
  );
}

function ShadowCard({ shadow }: { shadow: ShadowStyle }) {
  const params = shadow.layers
    .map((layer) => `${layer.blur}/${layer.offsetX}×${layer.offsetY}/${layer.color}`)
    .join(' + ');

  return (
    <div className="fsp-card">
      <div className="fsp-shadow-box" style={{ boxShadow: shadowToBoxShadow(shadow.layers) }} />
      <div className="fsp-name">{shadow.name}</div>
      <div className="fsp-meta">{params}</div>
      {shadow.comment && <div className="fsp-comment">{shadow.comment}</div>}
    </div>
  );
}

export function FigmaStylesPage() {
  return (
    <div className="fsp">
      <style>{PAGE_STYLE}</style>

      <header className="fsp-header">
        <h1>Color tokens — Driver App</h1>
        <p>
          Таблица цветовых стилей из Figma «Driver App • Work». Буквальные значения
          (HEX + opacity), без привязки к токен-архитектуре.
        </p>
      </header>

      <ColorSection title="Texts" swatches={textColors} />
      <ColorSection title="Icons" swatches={iconColors} />
      <ColorSection title="Buttons" swatches={buttonColors} />
      <ColorSection title="Backgrounds" swatches={backgroundColors} />
      <ColorSection title="Strokes" swatches={strokeColors} />
      <ColorSection title="Messages / Fields" swatches={messageFieldColors} />
      <ColorSection title="Pastel" swatches={pastelColors} />
      <ColorSection title="Utility" swatches={utilityColors} />
      <ColorSection title="Gradients" swatches={gradients} />

      <section>
        <h2>Typography styles</h2>
        <div className="fsp-grid">
          {typographyStyles.map((style) => (
            <TypographyCard key={style.name} style={style} />
          ))}
        </div>
      </section>

      <section>
        <h2>Effect styles (library)</h2>
        <div className="fsp-grid">
          {effectStyles.map((shadow) => (
            <ShadowCard key={shadow.name} shadow={shadow} />
          ))}
        </div>
      </section>

      <section>
        <h2>Local effect styles</h2>
        <div className="fsp-grid">
          {localEffectStyles.map((shadow) => (
            <ShadowCard key={shadow.name} shadow={shadow} />
          ))}
        </div>
      </section>
    </div>
  );
}
