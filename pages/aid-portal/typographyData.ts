import type { CSSProperties } from 'react';

export interface TypographyStyle {
  id: string;
  name: string;
  fontFamily: string;
  fontWeight: number;
  fontWeightLabel: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform?: CSSProperties['textTransform'];
  /**
   * Optional token-path group prefix (e.g. `Titles`) — set by products whose
   * Figma source nests style tokens under a group, so `typographyTokenPath`
   * can reproduce the exact canonical path (`Titles/Large Title/font-family`)
   * instead of the flat `name/property` used by Driver.
   */
  tokenGroup?: string;
}

export interface TypographySection {
  id: string;
  title: string;
  items: TypographyStyle[];
}

function style(
  id: string,
  name: string,
  fontWeight: number,
  fontWeightLabel: string,
  fontSize: number,
  lineHeight: number,
  letterSpacing: number,
  options?: Pick<TypographyStyle, 'textTransform'>,
): TypographyStyle {
  return {
    id,
    name,
    fontFamily: 'Roboto',
    fontWeight,
    fontWeightLabel,
    fontSize,
    lineHeight,
    letterSpacing,
    ...(options?.textTransform ? { textTransform: options.textTransform } : {}),
  };
}

/** Driver Typography — значения из Figma (typography-sem, Roboto). */
export const typographySections: TypographySection[] = [
  {
    id: 'headline',
    title: 'Headline',
    items: [
      style('headline-1', 'headline 1', 500, 'Medium (500)', 44, 56, 0),
      style('headline-2', 'headline 2', 400, 'Regular (400)', 44, 56, 0),
      style('headline-3', 'headline 3', 700, 'Bold (700)', 30, 36, 0.15),
      style('headline-4', 'headline 4', 500, 'Medium (500)', 30, 36, 0.15),
      style('headline-5', 'headline 5', 400, 'Regular (400)', 30, 36, 0.15),
      style('headline-6', 'headline 6', 500, 'Medium (500)', 22, 28, 0.3),
    ],
  },
  {
    id: 'title',
    title: 'Title',
    items: [
      style('title-1', 'title 1', 600, 'Semi Bold (600)', 20, 22, 0.15),
    ],
  },
  {
    id: 'subtitle',
    title: 'Subtitle',
    items: [
      style('subtitle-1', 'subtitle 1', 500, 'Medium (500)', 18, 24, 0.15),
      style('subtitle-1-bold', 'subtitle 1 bold', 700, 'Bold (700)', 18, 24, 0.15),
      style('subtitle-2', 'subtitle 2', 500, 'Medium (500)', 14, 16, 0.1),
    ],
  },
  {
    id: 'body',
    title: 'Body',
    items: [
      style('body-1', 'body 1', 400, 'Regular (400)', 18, 24, 0.15),
      style('body-2', 'body 2', 400, 'Regular (400)', 16, 20, 0.15),
      style('body-2-medium', 'body 2 medium', 500, 'Medium (500)', 16, 20, 0.15),
      style('body-2-tall', 'body 2 tall', 500, 'Medium (500)', 16, 24, 0.15),
      style('body-3', 'body 3', 400, 'Regular (400)', 14, 16, 0),
    ],
  },
  {
    id: 'caption',
    title: 'Captions',
    items: [
      style('caption-1', 'caption 1', 600, 'Semi Bold (600)', 12, 16, 0.24, {
        textTransform: 'uppercase',
      }),
    ],
  },
];

export const typographyCollection = {
  collectionName: 'typography-sem',
  artifact: 'Typography/Semantic',
} as const;

export const TYPOGRAPHY_SAMPLE_TEXT = 'Съешь ещё этих мягких булок';

export const TYPOGRAPHY_PARAMETERS = [
  { id: 'font-family', label: 'Font Family' },
  { id: 'font-weight', label: 'Font Weight' },
  { id: 'font-size', label: 'Font Size' },
  { id: 'line-height', label: 'Line Height' },
  { id: 'letter-spacing', label: 'Letter Spacing' },
] as const;

export function typographyTokenPath(styleItem: TypographyStyle, property: string): string {
  const prefix = styleItem.tokenGroup ? `${styleItem.tokenGroup}/${styleItem.name}` : styleItem.name;
  return `${prefix}/${property}`;
}

export function typographyParameterValue(
  styleItem: TypographyStyle,
  property: (typeof TYPOGRAPHY_PARAMETERS)[number]['id'],
): string {
  switch (property) {
    case 'font-family':
      return styleItem.fontFamily;
    case 'font-weight':
      return styleItem.fontWeightLabel;
    case 'font-size':
      return `${styleItem.fontSize}px`;
    case 'line-height':
      return `${styleItem.lineHeight}px`;
    case 'letter-spacing':
      return `${styleItem.letterSpacing}px`;
    default:
      return '';
  }
}

export function formatTypographySizeLine(styleItem: TypographyStyle): string {
  return `${styleItem.fontSize} / ${styleItem.lineHeight}px`;
}

export function formatTypographySpecCaption(styleItem: TypographyStyle): string {
  const base = `${formatTypographySizeLine(styleItem)} · ${styleItem.fontWeightLabel}`;
  return styleItem.textTransform === 'uppercase' ? `${base} · ALLCAPS` : base;
}

export function typographyPreviewStyle(styleItem: TypographyStyle): CSSProperties {
  return {
    fontFamily: `'${styleItem.fontFamily}', sans-serif`,
    fontWeight: styleItem.fontWeight,
    fontSize: `${styleItem.fontSize}px`,
    lineHeight: `${styleItem.lineHeight}px`,
    letterSpacing: `${styleItem.letterSpacing}px`,
    ...(styleItem.textTransform ? { textTransform: styleItem.textTransform } : {}),
  };
}
