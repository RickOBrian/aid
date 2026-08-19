import { formatColorModeValueLabel } from '../dsColorSwatch';
import { switchTokenSources } from './switchTokens';
import type { AnatomyProperty, DriverColorMode, ResolvedAnatomyProperty } from './anatomyTypes';

function findSwitchTokenValue(tokenRef: string, mode: DriverColorMode) {
  const source = switchTokenSources.find((candidate) => candidate.name === tokenRef);
  if (!source) {
    return null;
  }
  return mode === 'day' ? source.day : source.night;
}

export function resolveSwitchAnatomyProperty(
  property: AnatomyProperty,
  mode: DriverColorMode,
): ResolvedAnatomyProperty {
  if (property.kind !== 'semantic-token' || !property.tokenRef) {
    return {
      ...property,
      resolvedValue: property.staticValue ?? '—',
    };
  }

  const tokenValue = findSwitchTokenValue(property.tokenRef, mode);
  const resolvedValue = tokenValue
    ? formatColorModeValueLabel(tokenValue)
    : property.staticValue ?? '—';

  return {
    ...property,
    resolvedValue: property.staticValue ? `${resolvedValue} (${property.staticValue})` : resolvedValue,
  };
}

export function resolveSwitchComputedProperty(
  property: AnatomyProperty,
  mode: DriverColorMode,
  computed: CSSStyleDeclaration | null,
): ResolvedAnatomyProperty {
  const base = resolveSwitchAnatomyProperty(property, mode);

  if (!computed) {
    return base;
  }

  if (property.property.toLowerCase().includes('width') && property.kind === 'raw-value') {
    return { ...base, resolvedValue: computed.width || base.resolvedValue };
  }

  if (property.property.toLowerCase().includes('height') && property.kind === 'raw-value') {
    return { ...base, resolvedValue: computed.height || base.resolvedValue };
  }

  if (property.property.toLowerCase().includes('background') && property.kind === 'semantic-token') {
    return base;
  }

  if (property.property.toLowerCase().includes('border radius')) {
    return { ...base, resolvedValue: computed.borderRadius || base.resolvedValue };
  }

  return base;
}

export function anatomyKindLabel(kind: AnatomyProperty['kind']): string {
  switch (kind) {
    case 'semantic-token':
      return 'Semantic token';
    case 'platform-convention':
      return 'Platform convention';
    case 'raw-value':
      return 'Raw / geometry';
    case 'hardcode':
      return 'Hardcode';
    default:
      return kind;
  }
}
