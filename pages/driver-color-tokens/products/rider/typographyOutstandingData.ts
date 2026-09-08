import type { TypographySection, TypographyStyle } from '../../typographyData';
import type { TypographyPlatform } from './typographyData';

/**
 * Rider «Outstanding» semantic typography tokens — a second, independent
 * style set from Figma «🙋🏻‍♀️ WB AID Rider Tokens — Styles», section
 * «Outstanding Typography Styles» (node 184:91), group `typography-sem-out`.
 * Changelog source: node 184:971.
 * Source: https://www.figma.com/design/yrfG6u9osujKX8e1B14lpT/?node-id=184-91
 *
 * Independent from the Default set: own style names, own iOS/Android values,
 * own token path prefix (`typography-sem-out/…`), own collection/changelog.
 * Unlike Default, every style here has identical numeric values on both
 * platforms — iOS and Android differ only by font family (SF Pro Display vs
 * Roboto), per the Figma source.
 */

interface OutstandingPlatformValue {
  fontFamily: string;
  fontWeight: number;
  fontWeightLabel: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
}

interface OutstandingStyle {
  id: string;
  name: string;
  ios: OutstandingPlatformValue;
  android: OutstandingPlatformValue;
}

const TOKEN_GROUP = 'typography-sem-out';

function value(
  fontWeight: number,
  fontWeightLabel: string,
  fontSize: number,
  lineHeight: number,
  letterSpacing: number,
): { ios: OutstandingPlatformValue; android: OutstandingPlatformValue } {
  return {
    ios: { fontFamily: 'SF Pro Display', fontWeight, fontWeightLabel, fontSize, lineHeight, letterSpacing },
    android: { fontFamily: 'Roboto', fontWeight, fontWeightLabel, fontSize, lineHeight, letterSpacing },
  };
}

const outstandingStyles: OutstandingStyle[] = [
  { id: 'ios-subtitle', name: 'iOS - Subtitle', ...value(500, 'Medium (500)', 16, 16, 0) },
  { id: 'ios-subtitle-l', name: 'iOS - Subtitle L', ...value(500, 'Medium (500)', 18, 20, 0) },
  { id: 'title-title2-nrd', name: 'Title-title2 (NRD)', ...value(700, 'Bold (700)', 19, 23, 0) },
  { id: 'ios-subtitle-t', name: 'iOS - Subtitle T', ...value(500, 'Medium (500)', 16, 18, 0) },
  { id: 'nrd-body', name: 'NRD - Body', ...value(400, 'Regular (400)', 17, 20, 0) },
  { id: 'ios-body', name: 'iOS - Body', ...value(400, 'Regular (400)', 16, 22, 0) },
  { id: 'nrd-action', name: 'NRD - Action', ...value(600, 'Semibold (600)', 18, 20, 0) },
  { id: 'nrd-h1', name: 'NRD - H1', ...value(700, 'Bold (700)', 30, 34, 0) },
  { id: 'nrd-action-bold', name: 'NRD - Action Bold', ...value(700, 'Bold (700)', 18, 20, 0) },
];

export const typographyOutstandingCollection = {
  collectionName: 'rider-typography-sem-out',
  artifact: 'Rider Typography/Semantic Outstanding',
} as const;

function resolvePlatformStyle(item: OutstandingStyle, platform: TypographyPlatform): TypographyStyle {
  const platformValue = platform === 'ios' ? item.ios : item.android;
  return {
    id: item.id,
    name: item.name,
    tokenGroup: TOKEN_GROUP,
    ...platformValue,
  };
}

/** Resolves the Outstanding set into the shared `TypographySection[]` shape for one platform. */
export function resolveRiderOutstandingTypographySections(platform: TypographyPlatform): TypographySection[] {
  return [
    {
      id: 'outstanding',
      title: 'Outstanding',
      items: outstandingStyles.map((item) => resolvePlatformStyle(item, platform)),
    },
  ];
}
