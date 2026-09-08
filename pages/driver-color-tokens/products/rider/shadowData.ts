import type { CSSProperties } from 'react';
import type { ShadowLayer, ShadowSection, ShadowStyle } from '../../shadowsData';
import { SHADOW_PARAMETERS } from '../../shadowsData';

/**
 * Rider shadow tokens from Figma «🙋🏻‍♀️ WB AID Rider Tokens — Styles»,
 * section «Shadows (effects)» (node 17:20).
 * Source: https://www.figma.com/design/yrfG6u9osujKX8e1B14lpT/…?node-id=17-20
 *
 * Collection `effects`, modes Day / Night — color differs per mode; geometry is shared.
 */

export type ShadowColorMode = 'day' | 'night';

export const RIDER_SHADOW_MODES: readonly ShadowColorMode[] = ['day', 'night'] as const;

export interface DualShadowLayerValue {
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
}

export interface DualShadowLayer {
  level?: number;
  day: DualShadowLayerValue;
  night: DualShadowLayerValue;
}

export interface RiderShadowStyle {
  id: string;
  name: string;
  tokenName: string;
  caption: string;
  layers: DualShadowLayer[];
}

export const riderShadowCollection = {
  collectionName: 'rider-effects-shadows',
  artifact: 'Rider Effects/Shadows',
} as const;

export type RiderShadowTableRow =
  | { kind: 'level'; label: string; key: string }
  | {
      kind: 'parameter';
      key: string;
      parameterLabel: string;
      dayValue: string;
      nightValue: string;
      token: string;
    };

function layerValue(
  offsetX: number,
  offsetY: number,
  blur: number,
  dayColor: string,
  nightColor: string,
  level?: number,
): DualShadowLayer {
  const base = { offsetX, offsetY, blur };
  return {
    level,
    day: { ...base, color: dayColor },
    night: { ...base, color: nightColor },
  };
}

function riderStyle(
  id: string,
  name: string,
  tokenName: string,
  layers: DualShadowLayer[],
): RiderShadowStyle {
  return {
    id,
    name,
    tokenName,
    caption: `Стиль: ${name}`,
    layers,
  };
}

/** Rider Shadows — values from Figma (effects · Shadows, node 17:20). */
export const riderShadowStyles: RiderShadowStyle[] = [
  riderStyle('mini', 'Mini', 'Mini', [
    layerValue(0, 2, 8, 'rgba(0,0,0,0.12)', 'rgba(0,0,0,0.42)'),
  ]),
  riderStyle('small', 'Small', 'Small', [
    layerValue(0, 0, 20, 'rgba(0,0,0,0.12)', 'rgba(0,0,0,0.42)', 1),
    layerValue(0, 0, 4, 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.38)', 2),
  ]),
  riderStyle('medium', 'Medium', 'Medium', [
    layerValue(0, 6, 20, 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.38)'),
  ]),
  riderStyle('large', 'Large', 'Large', [
    layerValue(0, 1, 30, 'rgba(0,0,0,0.12)', 'rgba(0,0,0,0.42)', 1),
    layerValue(0, 6, 14, 'rgba(0,0,0,0.16)', 'rgba(0,0,0,0.16)', 2),
  ]),
  riderStyle('large-air', 'Large Air', 'Large Air', [
    layerValue(0, 8, 36, 'rgba(0,0,0,0.16)', 'rgba(0,0,0,0.16)'),
  ]),
  riderStyle('brand-button', 'Brand Button', 'Brand Button', [
    layerValue(0, 4, 20, 'rgba(133,38,255,0.12)', 'rgba(133,38,255,0.12)', 1),
    layerValue(0, 8, 14, 'rgba(0,61,172,0.08)', 'rgba(0,61,172,0.08)', 2),
  ]),
  riderStyle('bottom-sheet', 'Bottom Sheet', 'Bottom Sheet', [
    layerValue(0, 3, 5, 'rgba(0,0,0,0.20)', 'rgba(0,0,0,0.20)', 1),
    layerValue(0, 1, 18, 'rgba(0,0,0,0.12)', 'rgba(0,0,0,0.12)', 2),
    layerValue(0, 6, 10, 'rgba(0,0,0,0.14)', 'rgba(0,0,0,0.14)', 3),
  ]),
  riderStyle('fab', 'FAB', 'FAB', [
    layerValue(0, 4, 12, 'rgba(0,0,0,0.10)', 'rgba(0,0,0,0.10)'),
  ]),
  riderStyle('knob', 'Knob', 'Knob', [
    layerValue(0, 3, 1, 'rgba(0,0,0,0.06)', 'rgba(0,0,0,0.06)', 1),
    layerValue(0, 3, 8, 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.15)', 2),
  ]),
  riderStyle('cards', 'Cards', 'Cards', [
    layerValue(0, 2, 8, 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.15)'),
  ]),
];

export const riderShadowSections: ShadowSection[] = [
  {
    id: 'effects',
    title: 'Effects',
    items: riderShadowStyles.map((item) => resolveRiderShadowStyle(item, 'day')),
  },
];

function dualLayerParameterValue(
  layerItem: DualShadowLayer,
  mode: ShadowColorMode,
  parameterId: (typeof SHADOW_PARAMETERS)[number]['id'],
): string {
  const value = layerItem[mode];
  switch (parameterId) {
    case 'offset-x':
      return String(value.offsetX);
    case 'offset-y':
      return String(value.offsetY);
    case 'blur':
      return String(value.blur);
    case 'color':
      return value.color;
    default:
      return '';
  }
}

export function riderShadowTokenPath(
  item: RiderShadowStyle,
  level: number | undefined,
  parameterId: string,
): string {
  if (level !== undefined) {
    return `${item.tokenName}/Level ${level}/${parameterId}`;
  }
  return `${item.tokenName}/${parameterId}`;
}

export function composeRiderBoxShadow(item: RiderShadowStyle, mode: ShadowColorMode): string {
  const ordered = [...item.layers].sort((a, b) => (b.level ?? 1) - (a.level ?? 1));
  return ordered
    .map((layerItem) => {
      const value = layerItem[mode];
      return `${value.offsetX}px ${value.offsetY}px ${value.blur}px 0px ${value.color}`;
    })
    .join(', ');
}

export function resolveRiderShadowStyle(item: RiderShadowStyle, mode: ShadowColorMode): ShadowStyle {
  return {
    id: item.id,
    name: item.name,
    tokenName: item.tokenName,
    caption: item.caption,
    previewBoxShadow: composeRiderBoxShadow(item, mode),
    layers: item.layers.map((layerItem) => ({
      level: layerItem.level,
      ...layerItem[mode],
    })),
  };
}

export function resolveRiderShadowSections(mode: ShadowColorMode): ShadowSection[] {
  return [
    {
      id: 'effects',
      title: 'Effects',
      items: riderShadowStyles.map((item) => resolveRiderShadowStyle(item, mode)),
    },
  ];
}

export function buildRiderShadowTableRows(item: RiderShadowStyle): RiderShadowTableRow[] {
  const rows: RiderShadowTableRow[] = [];
  const hasLevels = item.layers.some((layerItem) => layerItem.level !== undefined);

  if (hasLevels) {
    let currentLevel: number | undefined;

    for (const layerItem of item.layers) {
      if (layerItem.level !== undefined && layerItem.level !== currentLevel) {
        currentLevel = layerItem.level;
        rows.push({
          kind: 'level',
          label: `Level ${layerItem.level}`,
          key: `${item.id}-level-${layerItem.level}`,
        });
      }

      for (const parameter of SHADOW_PARAMETERS) {
        rows.push({
          kind: 'parameter',
          key: `${item.id}-${layerItem.level ?? 'single'}-${parameter.id}`,
          parameterLabel: parameter.label,
          dayValue: dualLayerParameterValue(layerItem, 'day', parameter.id),
          nightValue: dualLayerParameterValue(layerItem, 'night', parameter.id),
          token: riderShadowTokenPath(item, layerItem.level, parameter.id),
        });
      }
    }

    return rows;
  }

  const singleLayer = item.layers[0];
  for (const parameter of SHADOW_PARAMETERS) {
    rows.push({
      kind: 'parameter',
      key: `${item.id}-${parameter.id}`,
      parameterLabel: parameter.label,
      dayValue: dualLayerParameterValue(singleLayer, 'day', parameter.id),
      nightValue: dualLayerParameterValue(singleLayer, 'night', parameter.id),
      token: riderShadowTokenPath(item, undefined, parameter.id),
    });
  }

  return rows;
}

export function riderShadowPreviewStyle(item: RiderShadowStyle, mode: ShadowColorMode): CSSProperties {
  return {
    boxShadow: composeRiderBoxShadow(item, mode),
  };
}
