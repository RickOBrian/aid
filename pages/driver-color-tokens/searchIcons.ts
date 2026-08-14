import type { IconSection } from './iconsData';
import { matchesSearch } from './searchTokens';

export function filterIconSections(sections: IconSection[], query: string): IconSection[] {
  if (!query.trim()) {
    return sections;
  }

  return sections
    .map((section) => {
      const titleMatches = matchesSearch(section.title, query);
      const items = titleMatches
        ? section.items
        : section.items.filter(
            (item) =>
              matchesSearch(item.name, query) || matchesSearch(item.id, query),
          );

      if (titleMatches || items.length > 0) {
        return { ...section, items };
      }

      return null;
    })
    .filter((section): section is IconSection => section !== null);
}
