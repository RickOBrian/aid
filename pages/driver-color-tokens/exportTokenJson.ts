import { colorTokenCollection, semanticColorSections } from './data';
import {
  ICON_DEFAULT_SIZE,
  iconAssetPath,
  iconCollection,
  iconSections,
} from './iconsData';
import { radiusCollection, radiusTokens } from './radiusData';
import { shadowsCollection, shadowSections } from './shadowsData';
import { spacingCollection, spacingTokens } from './spacingData';
import { typographyCollection, typographySections } from './typographyData';

/** Colors — секции semantic-токенов с режимами Day/Night. */
export function exportColorTokenJson() {
  return semanticColorSections;
}

/** Spacing — semantic spacing scale с px и rem. */
export function exportSpacingTokenJson() {
  return {
    collectionName: spacingCollection.collectionName,
    artifact: spacingCollection.artifact,
    tokens: spacingTokens.map(({ name, valuePx, valueRemLabel }) => ({
      name,
      value: {
        px: valuePx,
        rem: Number(valueRemLabel),
      },
    })),
  };
}

/** Radius — semantic radius scale со значениями для CSS. */
export function exportRadiusTokenJson() {
  return {
    collectionName: radiusCollection.collectionName,
    artifact: radiusCollection.artifact,
    tokens: radiusTokens.map(({ name, borderTopRightRadius }) => ({
      name,
      value: borderTopRightRadius,
    })),
  };
}

/** Typography — секции текстовых стилей с параметрами шрифта. */
export function exportTypographyTokenJson() {
  return {
    collectionName: typographyCollection.collectionName,
    artifact: typographyCollection.artifact,
    sections: typographySections.map(({ title, items }) => ({
      title,
      styles: items.map(
        ({ name, fontFamily, fontWeight, fontSize, lineHeight, letterSpacing }) => ({
          name,
          fontFamily,
          fontWeight,
          fontSize: `${fontSize}px`,
          lineHeight: `${lineHeight}px`,
          letterSpacing: `${letterSpacing}px`,
        }),
      ),
    })),
  };
}

/** Shadows — elevation/nine-patch тени со слоями и итоговым box-shadow. */
export function exportShadowsTokenJson() {
  return {
    collectionName: shadowsCollection.collectionName,
    artifact: shadowsCollection.artifact,
    tokens: shadowSections.flatMap((section) =>
      section.items.map((item) => ({
        name: item.tokenName,
        id: item.id,
        caption: item.caption,
        boxShadow: item.previewBoxShadow,
        layers: item.layers.map(({ level, offsetX, offsetY, blur, color }) => ({
          ...(level !== undefined ? { level } : {}),
          offsetX,
          offsetY,
          blur,
          color,
        })),
      })),
    ),
  };
}

/** Icons — каталог иконок Wilhelm с путями к SVG-ассетам. */
export function exportIconsTokenJson() {
  return {
    collectionName: iconCollection.collectionName,
    artifact: iconCollection.artifact,
    defaultSize: ICON_DEFAULT_SIZE,
    sections: iconSections.map(({ id, title, items }) => ({
      id,
      title,
      icons: items.map(({ id: iconId, name, figmaNodeId }) => ({
        id: iconId,
        name,
        figmaNodeId,
        assetPath: iconAssetPath(id, iconId),
      })),
    })),
  };
}

export function stringifyTokenJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function hasColorTokens(): boolean {
  return semanticColorSections.some((section) => section.rows.length > 0);
}

export function hasSpacingTokens(): boolean {
  return spacingTokens.length > 0;
}

export function hasRadiusTokens(): boolean {
  return radiusTokens.length > 0;
}

export function hasTypographyTokens(): boolean {
  return typographySections.some((section) => section.items.length > 0);
}

export function hasShadowTokens(): boolean {
  return shadowSections.some((section) => section.items.length > 0);
}

export function hasIconTokens(): boolean {
  return iconSections.some((section) => section.items.length > 0);
}

export const TOKEN_JSON_FILENAMES = {
  color: colorTokenCollection.artifact.split('/').pop() ?? 'Color',
  spacing: 'Spacing',
  radius: 'Radius',
  typography: 'Typography',
  shadows: 'Shadows',
  icons: 'Icons',
} as const;
