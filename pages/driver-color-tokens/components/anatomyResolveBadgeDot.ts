import { formatColorModeValueLabel } from '../dsColorSwatch';
import { badgeDotTokenSources } from './badgeDotTokens';
import type { AnatomyProperty, DriverColorMode, ResolvedAnatomyProperty } from './anatomyTypes';

function findBadgeDotTokenValue(tokenRef: string, mode: DriverColorMode) {
  const source = badgeDotTokenSources.find((candidate) => candidate.name === tokenRef);
  if (!source) {
    return null;
  }
  return mode === 'day' ? source.day : source.night;
}

export function resolveBadgeDotAnatomyProperty(
  property: AnatomyProperty,
  mode: DriverColorMode,
): ResolvedAnatomyProperty {
  if (property.kind !== 'semantic-token' || !property.tokenRef) {
    return {
      ...property,
      resolvedValue: property.staticValue ?? '—',
    };
  }

  const tokenValue = findBadgeDotTokenValue(property.tokenRef, mode);
  if (!tokenValue) {
    return {
      ...property,
      resolvedValue: property.staticValue ?? '—',
    };
  }

  const resolvedValue = formatColorModeValueLabel(tokenValue);
  return {
    ...property,
    resolvedValue: property.staticValue ? `${resolvedValue} (${property.staticValue})` : resolvedValue,
  };
}

export function resolveBadgeDotComputedProperty(
  property: AnatomyProperty,
  mode: DriverColorMode,
  computed: CSSStyleDeclaration | null,
): ResolvedAnatomyProperty {
  const base = resolveBadgeDotAnatomyProperty(property, mode);

  if (!computed) {
    return base;
  }

  if (property.property.toLowerCase().includes('size')) {
    const width = computed.width;
    const height = computed.height;
    if (width && height) {
      return { ...base, resolvedValue: `${width} × ${height}` };
    }
  }

  if (property.property.toLowerCase().includes('border radius')) {
    return { ...base, resolvedValue: computed.borderRadius || base.resolvedValue };
  }

  return base;
}
