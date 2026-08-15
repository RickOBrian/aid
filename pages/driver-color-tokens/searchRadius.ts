import type { RadiusToken } from './radiusData';
import { matchesSearch } from './searchTokens';

export function filterRadiusTokens(tokens: RadiusToken[], query: string): RadiusToken[] {
  if (!query.trim()) {
    return tokens;
  }

  return tokens.filter(
    (token) =>
      matchesSearch(token.name, query) ||
      matchesSearch(token.id, query) ||
      matchesSearch(token.valueLabel, query),
  );
}
