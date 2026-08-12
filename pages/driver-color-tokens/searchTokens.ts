import type { SemanticColorSection } from './data';

const EN_KEYS = '`qwertyuiop[]asdfghjkl;\'zxcvbnm,./';
const RU_KEYS = 'ёйцукенгшщзхъфывапролджэячсмитьбю.';

function swapKeyboardLayout(text: string, fromKeys: string, toKeys: string): string {
  return [...text].map((char) => {
    const lower = char.toLowerCase();
    const index = fromKeys.indexOf(lower);
    if (index === -1) {
      return char;
    }

    const mapped = toKeys[index] ?? char;
    return char === lower ? mapped : mapped.toUpperCase();
  }).join('');
}

function normalizeSearchText(text: string): string {
  return text.trim().toLowerCase();
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) {
    return 0;
  }
  if (a.length === 0) {
    return b.length;
  }
  if (b.length === 0) {
    return a.length;
  }

  const rows = b.length + 1;
  const cols = a.length + 1;
  const matrix = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

  for (let i = 0; i < rows; i += 1) {
    matrix[i][0] = i;
  }
  for (let j = 0; j < cols; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[b.length][a.length];
}

function maxEditDistance(length: number): number {
  if (length <= 3) {
    return 1;
  }
  if (length <= 7) {
    return 2;
  }
  return 3;
}

function fuzzyMatch(target: string, query: string): boolean {
  const normalizedTarget = normalizeSearchText(target);
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return true;
  }
  if (normalizedTarget.includes(normalizedQuery)) {
    return true;
  }

  const targetParts = normalizedTarget.split(/[\s/-]+/);
  const maxDistance = maxEditDistance(normalizedQuery.length);

  for (const part of targetParts) {
    if (part.includes(normalizedQuery)) {
      return true;
    }
    if (levenshteinDistance(part, normalizedQuery) <= maxDistance) {
      return true;
    }
  }

  if (normalizedTarget.length <= 24) {
    return levenshteinDistance(normalizedTarget, normalizedQuery) <= maxDistance;
  }

  return false;
}

function getSearchVariants(query: string): string[] {
  const normalized = normalizeSearchText(query);
  if (!normalized) {
    return [''];
  }

  return [...new Set([
    normalized,
    swapKeyboardLayout(normalized, EN_KEYS, RU_KEYS),
    swapKeyboardLayout(normalized, RU_KEYS, EN_KEYS),
  ])];
}

function matchesSearch(target: string, query: string): boolean {
  if (!query.trim()) {
    return true;
  }

  return getSearchVariants(query).some((variant) => fuzzyMatch(target, variant));
}

export function filterColorTokenSections(
  sections: SemanticColorSection[],
  query: string,
): SemanticColorSection[] {
  if (!query.trim()) {
    return sections;
  }

  return sections
    .map((section) => {
      const titleMatches = matchesSearch(section.title, query);
      const rows = titleMatches
        ? section.rows
        : section.rows.filter((row) => matchesSearch(row.name, query));

      if (titleMatches || rows.length > 0) {
        return { ...section, rows };
      }

      return null;
    })
    .filter((section): section is SemanticColorSection => section !== null);
}
