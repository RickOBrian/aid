import type { CSSProperties } from 'react';

export interface ShadowLayer {
  level?: number;
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
}

export interface ShadowStyle {
  id: string;
  name: string;
  tokenName: string;
  caption: string;
  previewBoxShadow: string;
  layers: ShadowLayer[];
}

export interface ShadowSection {
  id: string;
  title: string;
  items: ShadowStyle[];
}

export const shadowsCollection = {
  collectionName: 'effects-shadows',
  artifact: 'Effects/Shadows',
} as const;

export const SHADOW_PARAMETERS = [
  { id: 'offset-x', label: 'Offset X' },
  { id: 'offset-y', label: 'Offset Y' },
  { id: 'blur', label: 'Blur' },
  { id: 'color', label: 'Color' },
] as const;

function layer(
  offsetX: number,
  offsetY: number,
  blur: number,
  color: string,
  level?: number,
): ShadowLayer {
  return { level, offsetX, offsetY, blur, color };
}

function shadow(
  id: string,
  name: string,
  tokenName: string,
  caption: string,
  previewBoxShadow: string,
  layers: ShadowLayer[],
): ShadowStyle {
  return { id, name, tokenName, caption, previewBoxShadow, layers };
}

/** Driver Shadows — значения из Figma (effects · Shadows). */
export const shadowSections: ShadowSection[] = [
  {
    id: 'shadows',
    title: 'Shadows',
    items: [
      shadow(
        'shadow-1',
        'shadow 1',
        'Shadow 1',
        'Elevation 1 · Используется для отображения алертов в заказе',
        '0px 0px 1px 0px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.12)',
        [
          layer(0, 1, 2, 'rgba(0,0,0,0.12)', 1),
          layer(0, 0, 1, 'rgba(0,0,0,0.15)', 2),
        ],
      ),
      shadow(
        'shadow-2',
        'shadow 2',
        'Shadow 2',
        'Nine-patch · Шапки боттом-шитов при скролле, табы',
        '0px 2px 12px 0px rgba(0, 0, 0, 0.12)',
        [layer(0, 2, 12, 'rgba(0,0,0,0.12)')],
      ),
      shadow(
        'shadow-3',
        'shadow 3',
        'Shadow 3',
        'Nine-patch · Белые FAB, виджеты на карте',
        '0px 4px 12px 0px rgba(0, 0, 0, 0.16)',
        [layer(0, 4, 12, 'rgba(0,0,0,0.16)')],
      ),
      shadow(
        'shadow-4',
        'shadow 4',
        'Shadow 4',
        'Nine-patch · Чёрные FAB, Экшн-панели',
        '0px 4px 12px 0px rgba(0, 0, 0, 0.36)',
        [layer(0, 4, 12, 'rgba(0,0,0,0.36)')],
      ),
      shadow(
        'shadow-5',
        'shadow 5',
        'Shadow 5',
        'Nine-patch · Зелёный слайдер',
        '0px 8px 16px 0px rgba(0, 0, 0, 0.25)',
        [layer(0, 8, 16, 'rgba(0,0,0,0.25)')],
      ),
      shadow(
        'shadow-6',
        'shadow 6',
        'Shadow 6',
        'Elevation 6 · Боттом шит',
        '0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12), 0px 3px 5px 0px rgba(0, 0, 0, 0.2)',
        [
          layer(0, 3, 5, 'rgba(0,0,0,0.20)', 1),
          layer(0, 1, 18, 'rgba(0,0,0,0.12)', 2),
          layer(0, 6, 10, 'rgba(0,0,0,0.14)', 3),
        ],
      ),
      shadow(
        'shadow-7',
        'shadow 7',
        'Shadow 7',
        'Elevation 24 · Диалоги',
        '0px 24px 38px 0px rgba(0, 0, 0, 0.14), 0px 9px 46px 0px rgba(0, 0, 0, 0.12), 0px 11px 15px 0px rgba(0, 0, 0, 0.2)',
        [
          layer(0, 11, 15, 'rgba(0,0,0,0.20)', 1),
          layer(0, 9, 46, 'rgba(0,0,0,0.12)', 2),
          layer(0, 24, 38, 'rgba(0,0,0,0.14)', 3),
        ],
      ),
    ],
  },
];

export type ShadowTableRow =
  | { kind: 'level'; label: string; key: string }
  | {
      kind: 'parameter';
      key: string;
      parameterLabel: string;
      value: string;
      token: string;
    };

function shadowLayerParameterValue(
  layerItem: ShadowLayer,
  parameterId: (typeof SHADOW_PARAMETERS)[number]['id'],
): string {
  switch (parameterId) {
    case 'offset-x':
      return String(layerItem.offsetX);
    case 'offset-y':
      return String(layerItem.offsetY);
    case 'blur':
      return String(layerItem.blur);
    case 'color':
      return layerItem.color;
    default:
      return '';
  }
}

export function shadowTokenPath(
  item: ShadowStyle,
  level: number | undefined,
  parameterId: string,
): string {
  if (level !== undefined) {
    return `${item.tokenName}/Level ${level}/${parameterId}`;
  }
  return `${item.tokenName}/${parameterId}`;
}

export function buildShadowTableRows(item: ShadowStyle): ShadowTableRow[] {
  const rows: ShadowTableRow[] = [];
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
          value: shadowLayerParameterValue(layerItem, parameter.id),
          token: shadowTokenPath(item, layerItem.level, parameter.id),
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
      value: shadowLayerParameterValue(singleLayer, parameter.id),
      token: shadowTokenPath(item, undefined, parameter.id),
    });
  }

  return rows;
}

export function shadowPreviewStyle(item: ShadowStyle): CSSProperties {
  return {
    boxShadow: item.previewBoxShadow,
  };
}
