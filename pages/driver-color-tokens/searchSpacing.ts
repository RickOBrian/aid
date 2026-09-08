import type { SpacingToken } from './spacingData';
import { matchesSearch } from './searchTokens';

export function filterSpacingTokens(tokens: SpacingToken[], query: string): SpacingToken[] {
  if (!query.trim()) {
    return tokens;
  }

  return tokens.filter(
    (token) =>
      matchesSearch(token.name, query) ||
      matchesSearch(token.id, query) ||
      matchesSearch(token.valuePxLabel, query) ||
      matchesSearch(token.valueRemLabel, query),
  );
}
