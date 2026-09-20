import type { CSSProperties } from 'react';
import type { ColorModeValue } from './data';
import {
  DS_VALUE_META_CAPTION_CLASS,
  DS_VALUE_META_CLASS,
  DS_VALUE_META_PRIMARY_CLASS,
} from './dsValueMeta';

export const DS_COLOR_SWATCH_STYLE = `
.ds-color-mode-cell {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.ds-color-mode-cell-meta {
  flex: 1;
  min-width: 0;
}
.ds-color-mode-cell-meta .ds-value-meta__primary {
  white-space: nowrap;
  overflow-wrap: normal;
  word-break: normal;
}
.ds-color-mode-cell-meta button.ds-value-meta__primary {
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  cursor: pointer;
  text-align: left;
}
.ds-color-swatch-btn {
  display: inline-flex;
  padding: 0;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: pointer;
}
.ds-color-swatch-btn:hover {
  opacity: 1;
}
.ds-color-swatch {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
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
.ds-color-swatch-fill {
  width: 100%;
  height: 100%;
}
@media (max-width: 767px) {
  .ds-color-swatch {
    width: 24px;
    height: 24px;
  }
}
`;

export function hexWithoutHash(hex: string): string {
  return hex.replace(/^#/, '').toUpperCase();
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '');
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

export function colorFillStyle({ hex, opacity }: ColorModeValue): CSSProperties {
  const { r, g, b } = hexToRgb(hex);
  return { backgroundColor: `rgba(${r}, ${g}, ${b}, ${opacity / 100})` };
}

export function ColorSwatch({
  value,
  onCopyHex,
}: {
  value: ColorModeValue;
  onCopyHex?: (hex: string) => void;
}) {
  const hex = hexWithoutHash(value.hex);

  if (!onCopyHex) {
    return (
      <div className="ds-color-swatch" aria-hidden="true">
        <div className="ds-color-swatch-fill" style={colorFillStyle(value)} />
      </div>
    );
  }

  return (
    <button
      type="button"
      className="ds-copyable ds-color-swatch-btn"
      aria-label={`Скопировать ${hex}`}
      onClick={() => {
        onCopyHex(hex);
      }}
    >
      <div className="ds-color-swatch">
        <div className="ds-color-swatch-fill" style={colorFillStyle(value)} />
      </div>
    </button>
  );
}

export function formatColorModeValueLabel({ hex, opacity }: ColorModeValue): string {
  return `${hex.toUpperCase()} · ${opacity}%`;
}

export function ColorModeValueDisplay({
  value,
  onCopyHex,
}: {
  value: ColorModeValue;
  onCopyHex?: (hex: string) => void;
}) {
  const hex = hexWithoutHash(value.hex);

  return (
    <div className="ds-color-mode-cell">
      <ColorSwatch value={value} onCopyHex={onCopyHex} />
      <div className={`${DS_VALUE_META_CLASS} ds-color-mode-cell-meta`}>
        {onCopyHex ? (
          <button
            type="button"
            className={`ds-copyable ${DS_VALUE_META_PRIMARY_CLASS}`}
            onClick={() => {
              onCopyHex(hex);
            }}
          >
            {value.hex.toUpperCase()}
          </button>
        ) : (
          <span className={DS_VALUE_META_PRIMARY_CLASS}>{value.hex.toUpperCase()}</span>
        )}
        <span className={DS_VALUE_META_CAPTION_CLASS}>{value.opacity}%</span>
      </div>
    </div>
  );
}
