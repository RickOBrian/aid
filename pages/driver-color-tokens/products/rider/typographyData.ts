import type { CSSProperties } from 'react';
import type { TypographySection, TypographyStyle } from '../../typographyData';

/**
 * Rider semantic typography tokens from Figma «🙋🏻‍♀️ WB AID Rider Tokens — Styles»,
 * section «Rider Typography Styles» (node 11:8).
 * Source: https://www.figma.com/design/yrfG6u9osujKX8e1B14lpT/?node-id=11-8
 *
 * Unlike Driver (single Roboto set), Rider ships two parallel platform sets —
 * iOS (SF Pro) and Android (Roboto) — switched by one page-level control.
 */

export type TypographyPlatform = 'ios' | 'android';

export const RIDER_TYPOGRAPHY_PLATFORMS: readonly TypographyPlatform[] = ['ios', 'android'] as const;

export interface RiderTypographyPlatformValue {
  fontFamily: string;
  fontWeight: number;
  fontWeightLabel: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform?: CSSProperties['textTransform'];
}

export interface RiderTypographyStyle {
  id: string;
  name: string;
  ios: RiderTypographyPlatformValue;
  android: RiderTypographyPlatformValue;
}

export interface RiderTypographySection {
  id: string;
  title: string;
  items: RiderTypographyStyle[];
}

function platformValue(
  fontFamily: string,
  fontWeight: number,
  fontWeightLabel: string,
  fontSize: number,
  lineHeight: number,
  letterSpacing: number,
): RiderTypographyPlatformValue {
  return { fontFamily, fontWeight, fontWeightLabel, fontSize, lineHeight, letterSpacing };
}

function riderStyle(
  id: string,
  name: string,
  ios: RiderTypographyPlatformValue,
  android: RiderTypographyPlatformValue,
): RiderTypographyStyle {
  return { id, name, ios, android };
}

/** Rider Typography — значения из Figma (typography-sem, node 11:8). */
export const riderTypographySections: RiderTypographySection[] = [
  {
    id: 'titles',
    title: 'Titles',
    items: [
      riderStyle(
        'large-title',
        'Large Title',
        platformValue('SF Pro Display', 600, 'SemiBold (600)', 44, 48, 0.26),
        platformValue('Roboto', 500, 'Medium (500)', 44, 48, 0),
      ),
      riderStyle(
        'title-1',
        'Title 1',
        platformValue('SF Pro Display', 700, 'Bold (700)', 34, 40, 0.36),
        platformValue('Roboto', 700, 'Bold (700)', 34, 40, 0),
      ),
      riderStyle(
        'title-2',
        'Title 2',
        platformValue('SF Pro Display', 700, 'Bold (700)', 30, 32, 0.36),
        platformValue('Roboto', 700, 'Bold (700)', 30, 32, 0.15),
      ),
      riderStyle(
        'title-3',
        'Title 3',
        platformValue('SF Pro Display', 700, 'Bold (700)', 24, 28, 0.33),
        platformValue('Roboto', 700, 'Bold (700)', 24, 28, 0.15),
      ),
      riderStyle(
        'title-4',
        'Title 4',
        platformValue('SF Pro Display', 600, 'SemiBold (600)', 22, 28, 0.3),
        platformValue('Roboto', 500, 'Medium (500)', 22, 28, 0.15),
      ),
    ],
  },
  {
    id: 'subtitles',
    title: 'Subtitles',
    items: [
      riderStyle(
        'subtitle-1',
        'Subtitle 1',
        platformValue('SF Pro Text', 600, 'SemiBold (600)', 17, 24, -0.43),
        platformValue('Roboto', 500, 'Medium (500)', 17, 24, 0.15),
      ),
      riderStyle(
        'subtitle-2',
        'Subtitle 2',
        platformValue('SF Pro Text', 600, 'SemiBold (600)', 15, 20, -0.26),
        platformValue('Roboto', 500, 'Medium (500)', 15, 20, 0.1),
      ),
      riderStyle(
        'subtitle-3',
        'Subtitle 3',
        platformValue('SF Pro Text', 500, 'Medium (500)', 14, 16, -0.15),
        platformValue('Roboto', 500, 'Medium (500)', 14, 16, 0.1),
      ),
    ],
  },
  {
    id: 'bodies',
    title: 'Bodies',
    items: [
      riderStyle(
        'body-large',
        'Body Large',
        platformValue('SF Pro Text', 400, 'Regular (400)', 22, 28, 0.3),
        platformValue('Roboto', 400, 'Regular (400)', 22, 28, 0.3),
      ),
      riderStyle(
        'body-1',
        'Body 1',
        platformValue('SF Pro Text', 400, 'Regular (400)', 17, 24, -0.44),
        platformValue('Roboto', 400, 'Regular (400)', 17, 24, 0),
      ),
      riderStyle(
        'body-2',
        'Body 2',
        platformValue('SF Pro Text', 400, 'Regular (400)', 15, 20, -0.26),
        platformValue('Roboto', 400, 'Regular (400)', 15, 20, 0),
      ),
      riderStyle(
        'body-3',
        'Body 3',
        platformValue('SF Pro Text', 400, 'Regular (400)', 14, 16, -0.15),
        platformValue('Roboto', 400, 'Regular (400)', 14, 16, 0),
      ),
    ],
  },
  {
    id: 'captions',
    title: 'Captions',
    items: [
      riderStyle(
        'caption-1',
        'Caption 1',
        platformValue('SF Pro Text', 400, 'Regular (400)', 12, 16, 0),
        platformValue('Roboto', 400, 'Regular (400)', 12, 16, 0),
      ),
      riderStyle(
        'caption-2',
        'Caption 2',
        platformValue('SF Pro Text', 500, 'Medium (500)', 11, 14, 0),
        platformValue('Roboto', 500, 'Medium (500)', 11, 14, 0),
      ),
      riderStyle(
        'caption-cap',
        'Caption CAP',
        platformValue('SF Pro Text', 600, 'SemiBold (600)', 17, 20, -0.23),
        platformValue('Roboto', 600, 'SemiBold (600)', 17, 20, -0.23),
      ),
    ],
  },
];

export const typographyCollection = {
  collectionName: 'rider-typography-sem',
  artifact: 'Rider Typography/Semantic',
} as const;

function resolvePlatformStyle(
  item: RiderTypographyStyle,
  section: RiderTypographySection,
  platform: TypographyPlatform,
): TypographyStyle {
  const value = platform === 'ios' ? item.ios : item.android;
  return {
    id: item.id,
    name: item.name,
    tokenGroup: section.title,
    ...value,
  };
}

/** Resolves Rider's dual-platform sections into the shared `TypographySection[]` shape for one platform. */
export function resolveRiderTypographySections(platform: TypographyPlatform): TypographySection[] {
  return riderTypographySections.map((section) => ({
    id: section.id,
    title: section.title,
    items: section.items.map((item) => resolvePlatformStyle(item, section, platform)),
  }));
}
