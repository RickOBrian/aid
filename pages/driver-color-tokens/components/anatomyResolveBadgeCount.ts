import { formatColorModeValueLabel } from '../dsColorSwatch';
import { badgeCountTokenSources } from './badgeCountTokens';
import type { AnatomyProperty, DriverColorMode, ResolvedAnatomyProperty } from './anatomyTypes';

function findBadgeCountTokenValue(tokenRef: string, mode: DriverColorMode) {
  const source = badgeCountTokenSources.find((candidate) => candidate.name === tokenRef);
  if (!source) {
    return null;
  }
  return mode === 'day' ? source.day : source.night;
}

/**
 * Resolves an anatomy property to its display value.
 *
 * Only color tokens (Fields · Warning, Texts · Primary light ind) are looked
 * up dynamically by mode via `badgeCountTokenSources`. Non-color semantic
 * tokens (radius-12, space-6, space-2, shadow-1, subtitle-2) are marked
 * `kind: 'semantic-token'` in the schema but resolve through `staticValue` —
 * there is no per-mode variance to look up, and no separate token table is
 * needed for a single fixed value.
 */
export function resolveBadgeCountAnatomyProperty(
  property: AnatomyProperty,
  mode: DriverColorMode,
): ResolvedAnatomyProperty {
  if (property.kind !== 'semantic-token' || !property.tokenRef) {
    return {
      ...property,
      resolvedValue: property.staticValue ?? '—',
    };
  }

  const tokenValue = findBadgeCountTokenValue(property.tokenRef, mode);
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

export function resolveBadgeCountComputedProperty(
  property: AnatomyProperty,
  mode: DriverColorMode,
  computed: CSSStyleDeclaration | null,
): ResolvedAnatomyProperty {
  const base = resolveBadgeCountAnatomyProperty(property, mode);

  if (!computed) {
    return base;
  }

  if (property.property.toLowerCase().includes('border radius')) {
    return { ...base, resolvedValue: computed.borderRadius || base.resolvedValue };
  }

  return base;
}
