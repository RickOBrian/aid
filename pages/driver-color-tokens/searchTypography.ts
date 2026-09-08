import type { TypographySection } from './typographyData';
import { matchesSearch } from './searchTokens';

export function filterTypographySections(
  sections: TypographySection[],
  query: string,
): TypographySection[] {
  if (!query.trim()) {
    return sections;
  }

  return sections
    .map((section) => {
      const titleMatches = matchesSearch(section.title, query);
      const items = titleMatches
        ? section.items
        : section.items.filter(
            (item) => matchesSearch(item.name, query) || matchesSearch(item.id, query),
          );

      if (titleMatches || items.length > 0) {
        return { ...section, items };
      }

      return null;
    })
    .filter((section): section is TypographySection => section !== null);
}
