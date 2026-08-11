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
 * Наглядный дамп стилей из Figma-файла «Первая версия Драйвера».
 *
 * Это НЕ компонент дизайн-системы: значения рендерятся буквально из data.ts,
 * без привязки к токенам и без CSS-переменных — только для просмотра исходных
 * стилей Figma-файла как есть.
 */

const PAGE_STYLE = `
.fsp {
  font-family: system-ui, sans-serif;
  color: #111111;
  background: #fafafa;
  min-height: 100vh;
  padding: 32px;
}
.fsp h1 {
  margin: 0 0 8px;
  font-size: 24px;
}
.fsp > p {
  margin: 0 0 32px;
  color: #666666;
  font-size: 14px;
}
.fsp section {
  margin-bottom: 40px;
}
.fsp h2 {
  margin: 0 0 16px;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #444444;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 8px;
}
.fsp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
.fsp-card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.fsp-swatch {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  background-color: #ffffff;
  background-image:
    linear-gradient(45deg, #eeeeee 25%, transparent 25%),
    linear-gradient(-45deg, #eeeeee 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #eeeeee 75%),
    linear-gradient(-45deg, transparent 75%, #eeeeee 75%);
  background-size: 16px 16px;
  background-position: 0 0, 0 8px, 8px -8px, -8px 0;
}
.fsp-swatch-fill {
  width: 100%;
  height: 100%;
  border-radius: 5px;
}
.fsp-name {
  font-size: 13px;
  font-weight: 600;
  word-break: break-word;
}
.fsp-meta {
  font-size: 12px;
  color: #666666;
  font-family: 'SF Mono', Menlo, Consolas, monospace;
}
.fsp-comment {
  font-size: 12px;
  color: #888888;
}
.fsp-type-sample {
  background: #ffffff;
  border-radius: 6px;
  padding: 12px 8px;
  color: #111111;
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
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return { r, g, b };
}

function shadowLayerToCss(layer: ShadowLayer): string {
  return `${layer.offsetX}px ${layer.offsetY}px ${layer.blur}px ${layer.color}`;
}

function shadowToBoxShadow(layers: ShadowLayer[]): string {
  return layers.map(shadowLayerToCss).join(', ');
}

function ColorSwatchCard({ swatch }: { swatch: ColorSwatch }) {
  const { r, g, b } = hexToRgb(swatch.hex);
  const fillStyle: CSSProperties = {
    backgroundColor: `rgba(${r}, ${g}, ${b}, ${swatch.opacity / 100})`,
  };

  return (
    <div className="fsp-card">
      <div className="fsp-swatch">
        <div className="fsp-swatch-fill" style={fillStyle} />
      </div>
      <div className="fsp-name">{swatch.name}</div>
      <div className="fsp-meta">{swatch.hex.toUpperCase()} · {swatch.opacity}%</div>
      {swatch.comment && <div className="fsp-comment">{swatch.comment}</div>}
    </div>
  );
}

function GradientSwatchCard({ swatch }: { swatch: Extract<Swatch, { type: 'gradient' }> }) {
  const fillStyle: CSSProperties = {
    backgroundImage: swatch.gradient,
  };

  return (
    <div className="fsp-card">
      <div className="fsp-swatch">
        <div className="fsp-swatch-fill" style={fillStyle} />
      </div>
      <div className="fsp-name">{swatch.name}</div>
      <div className="fsp-meta">Gradient (Linear)</div>
      {swatch.comment && <div className="fsp-comment">{swatch.comment}</div>}
    </div>
  );
}

function SwatchCard({ swatch }: { swatch: Swatch }) {
  return swatch.type === 'gradient'
    ? <GradientSwatchCard swatch={swatch} />
    : <ColorSwatchCard swatch={swatch} />;
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
  const boxStyle: CSSProperties = {
    boxShadow: shadowToBoxShadow(shadow.layers),
  };
  const params = shadow.layers
    .map((layer) => `${layer.blur}/${layer.offsetX}×${layer.offsetY}/${layer.color}`)
    .join(' + ');

  return (
    <div className="fsp-card">
      <div className="fsp-shadow-box" style={boxStyle} />
      <div className="fsp-name">{shadow.name}</div>
      <div className="fsp-meta">{params}</div>
      {shadow.comment && <div className="fsp-comment">{shadow.comment}</div>}
    </div>
  );
}

function ColorSection({ title, swatches }: { title: string; swatches: Swatch[] }) {
  return (
    <section>
      <h2>{title}</h2>
      <div className="fsp-grid">
        {swatches.map((swatch) => (
          <SwatchCard key={swatch.name} swatch={swatch} />
        ))}
      </div>
    </section>
  );
}

export function FigmaStylesPage() {
  return (
    <div className="fsp">
      <style>{PAGE_STYLE}</style>

      <h1>Стили Figma — «Первая версия Драйвера»</h1>
      <p>Буквальный дамп значений стилей из Figma-файла, без токенов и без CSS-переменных.</p>

      <ColorSection title="Тексты" swatches={textColors} />
      <ColorSection title="Иконки" swatches={iconColors} />
      <ColorSection title="Кнопки" swatches={buttonColors} />
      <ColorSection title="Фоны" swatches={backgroundColors} />
      <ColorSection title="Обводки" swatches={strokeColors} />
      <ColorSection title="Сообщения / Поля" swatches={messageFieldColors} />
      <ColorSection title="Pastel палитра" swatches={pastelColors} />
      <ColorSection title="Утилитарные цвета" swatches={utilityColors} />
      <ColorSection title="Градиенты" swatches={gradients} />

      <section>
        <h2>Стили текста</h2>
        <div className="fsp-grid">
          {typographyStyles.map((style) => (
            <TypographyCard key={style.name} style={style} />
          ))}
        </div>
      </section>

      <section>
        <h2>Стили эффектов (тени, библиотека)</h2>
        <div className="fsp-grid">
          {effectStyles.map((shadow) => (
            <ShadowCard key={shadow.name} shadow={shadow} />
          ))}
        </div>
      </section>

      <section>
        <h2>Локальные стили эффектов</h2>
        <div className="fsp-grid">
          {localEffectStyles.map((shadow) => (
            <ShadowCard key={shadow.name} shadow={shadow} />
          ))}
        </div>
      </section>
    </div>
  );
}
