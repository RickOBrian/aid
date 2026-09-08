import type { CSSProperties } from 'react';

/**
 * Rider Glass tokens from Figma «🙋🏻‍♀️ WB AID Rider Tokens — Styles»,
 * section «Glass (effects)» (node 70:12).
 * Source: https://www.figma.com/design/yrfG6u9osujKX8e1B14lpT/…?node-id=70-12
 *
 * Collection `effects`, modes Day / Night — values are identical in v1.0.0.
 */

export type GlassColorMode = 'day' | 'night';

export const RIDER_GLASS_MODES: readonly GlassColorMode[] = ['day', 'night'] as const;

export const riderGlassCollection = {
  collectionName: 'rider-effects-glass',
  artifact: 'Rider Effects/Glass',
} as const;

export interface GlassParameterDef {
  id: string;
  label: string;
  day: string;
  night: string;
}

export interface GlassParameterGroup {
  id: string;
  title: string;
  parameters: GlassParameterDef[];
}

export interface RiderGlassStyle {
  id: string;
  name: string;
  tokenName: string;
  caption: string;
  groups: GlassParameterGroup[];
  preview: {
    backgroundColor: string;
    borderRadius: string;
  };
}

export type GlassTableRow =
  | { kind: 'group'; label: string; key: string }
  | {
      kind: 'parameter';
      key: string;
      parameterLabel: string;
      dayValue: string;
      nightValue: string;
      token: string;
    };

function param(id: string, label: string, value: string): GlassParameterDef {
  return { id, label, day: value, night: value };
}

const navbarGlassGroups: GlassParameterGroup[] = [
  {
    id: 'glass',
    title: 'Glass',
    parameters: [
      param('radius', 'Radius', '50'),
      param('refraction', 'Refraction', '0.7'),
      param('depth', 'Depth', '30'),
      param('light-angle', 'Light Angle', '0'),
      param('light-intensity', 'Light Intensity', '0.25'),
      param('dispersion', 'Dispersion', '0.2'),
      param('splay', 'Splay', '0.2'),
    ],
  },
  {
    id: 'inner-shadow-1',
    title: 'Inner Shadow 1',
    parameters: [
      param('offset-x', 'Offset X', '0'),
      param('offset-y', 'Offset Y', '8'),
      param('blur', 'Blur', '30'),
      param('spread', 'Spread', '-40'),
      param('color', 'Color', 'rgba(230,230,230,1)'),
    ],
  },
  {
    id: 'inner-shadow-2',
    title: 'Inner Shadow 2',
    parameters: [
      param('offset-x', 'Offset X', '0'),
      param('offset-y', 'Offset Y', '-8'),
      param('blur', 'Blur', '10'),
      param('spread', 'Spread', '-40'),
      param('color', 'Color', 'rgba(40,40,40,0.25)'),
    ],
  },
  {
    id: 'inner-shadow-3',
    title: 'Inner Shadow 3',
    parameters: [
      param('offset-x', 'Offset X', '0'),
      param('offset-y', 'Offset Y', '8'),
      param('blur', 'Blur', '10'),
      param('spread', 'Spread', '-40'),
      param('color', 'Color', 'rgba(40,40,40,0.25)'),
    ],
  },
  {
    id: 'drop-shadow-1',
    title: 'Drop Shadow 1',
    parameters: [
      param('offset-x', 'Offset X', '0'),
      param('offset-y', 'Offset Y', '8'),
      param('blur', 'Blur', '15'),
      param('spread', 'Spread', '0'),
      param('color', 'Color', 'rgba(0,0,0,0.02)'),
    ],
  },
  {
    id: 'drop-shadow-2',
    title: 'Drop Shadow 2',
    parameters: [
      param('offset-x', 'Offset X', '0'),
      param('offset-y', 'Offset Y', '0'),
      param('blur', 'Blur', '0'),
      param('spread', 'Spread', '0.5'),
      param('color', 'Color', 'rgba(232,232,232,1)'),
    ],
  },
  {
    id: 'drop-shadow-3',
    title: 'Drop Shadow 3',
    parameters: [
      param('offset-x', 'Offset X', '-1.25'),
      param('offset-y', 'Offset Y', '0'),
      param('blur', 'Blur', '0'),
      param('spread', 'Spread', '-0.75'),
      param('color', 'Color', 'rgba(208,208,208,1)'),
    ],
  },
  {
    id: 'drop-shadow-4',
    title: 'Drop Shadow 4',
    parameters: [
      param('offset-x', 'Offset X', '1.25'),
      param('offset-y', 'Offset Y', '0'),
      param('blur', 'Blur', '0'),
      param('spread', 'Spread', '-0.75'),
      param('color', 'Color', 'rgba(208,208,208,1)'),
    ],
  },
];

export const riderGlassStyles: RiderGlassStyle[] = [
  {
    id: 'navbar',
    name: 'Navbar',
    tokenName: 'Navbar',
    caption: 'Стиль: Glass/Navbar',
    groups: navbarGlassGroups,
    preview: {
      backgroundColor: 'rgba(245,245,245,0.6)',
      borderRadius: '9999px',
    },
  },
];

export interface GlassSection {
  id: string;
  title: string;
  items: RiderGlassStyle[];
}

export const riderGlassSections: GlassSection[] = [
  {
    id: 'glass',
    title: 'Glass',
    items: riderGlassStyles,
  },
];

function groupTokenPrefix(style: RiderGlassStyle, group: GlassParameterGroup): string {
  if (group.id === 'glass') {
    return `${style.tokenName}/Glass`;
  }
  const title = group.title.replace(/\s+/g, ' ');
  return `${style.tokenName}/${title}`;
}

export function glassTokenPath(style: RiderGlassStyle, group: GlassParameterGroup, parameterId: string): string {
  return `${groupTokenPrefix(style, group)}/${parameterId}`;
}

export function buildGlassTableRows(item: RiderGlassStyle): GlassTableRow[] {
  const rows: GlassTableRow[] = [];

  for (const group of item.groups) {
    rows.push({
      kind: 'group',
      label: group.title,
      key: `${item.id}-${group.id}-group`,
    });

    for (const parameter of group.parameters) {
      rows.push({
        kind: 'parameter',
        key: `${item.id}-${group.id}-${parameter.id}`,
        parameterLabel: parameter.label,
        dayValue: parameter.day,
        nightValue: parameter.night,
        token: glassTokenPath(item, group, parameter.id),
      });
    }
  }

  return rows;
}

function shadowLayer(
  inset: boolean,
  offsetX: number,
  offsetY: number,
  blur: number,
  spread: number,
  color: string,
): string {
  const insetPrefix = inset ? 'inset ' : '';
  return `${insetPrefix}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}`;
}

export function composeGlassDropShadow(_mode: GlassColorMode): string {
  return [
    shadowLayer(false, 1.25, 0, 0, -0.75, 'rgba(208,208,208,1)'),
    shadowLayer(false, -1.25, 0, 0, -0.75, 'rgba(208,208,208,1)'),
    shadowLayer(false, 0, 0, 0, 0.5, 'rgba(232,232,232,1)'),
    shadowLayer(false, 0, 8, 15, 0, 'rgba(0,0,0,0.02)'),
  ].join(', ');
}

export function composeGlassInnerShadow(_mode: GlassColorMode): string {
  return [
    shadowLayer(true, 0, 8, 10, -40, 'rgba(40,40,40,0.25)'),
    shadowLayer(true, 0, -8, 10, -40, 'rgba(40,40,40,0.25)'),
    shadowLayer(true, 0, 8, 30, -40, 'rgba(230,230,230,1)'),
  ].join(', ');
}

export function riderGlassPreviewStyle(item: RiderGlassStyle, mode: GlassColorMode): CSSProperties {
  return {
    position: 'relative',
    width: 200,
    height: 80,
    borderRadius: item.preview.borderRadius,
    boxShadow: composeGlassDropShadow(mode),
    background: 'transparent',
  };
}

export function riderGlassPreviewSurfaceStyle(item: RiderGlassStyle, mode: GlassColorMode): CSSProperties {
  const radius = Number(item.groups[0]?.parameters.find((p) => p.id === 'radius')?.day ?? 50);

  return {
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    backgroundColor: item.preview.backgroundColor,
    backdropFilter: `blur(${Math.round(radius / 2)}px) saturate(180%)`,
    WebkitBackdropFilter: `blur(${Math.round(radius / 2)}px) saturate(180%)`,
    boxShadow: composeGlassInnerShadow(mode),
  };
}

export function filterGlassSections(sections: GlassSection[], query: string): GlassSection[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return sections;
  }

  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.name.toLowerCase().includes(normalized)) {
          return true;
        }
        if (item.caption.toLowerCase().includes(normalized)) {
          return true;
        }
        return buildGlassTableRows(item).some(
          (row) =>
            row.kind === 'parameter' &&
            (row.parameterLabel.toLowerCase().includes(normalized) ||
              row.token.toLowerCase().includes(normalized)),
        );
      }),
    }))
    .filter((section) => section.items.length > 0);
}
