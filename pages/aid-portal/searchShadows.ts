import type { ShadowSection } from './shadowsData';
import { matchesSearch } from './searchTokens';

export function filterShadowSections(sections: ShadowSection[], query: string): ShadowSection[] {
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
              matchesSearch(item.name, query) ||
              matchesSearch(item.id, query) ||
              matchesSearch(item.caption, query),
          );

      if (titleMatches || items.length > 0) {
        return { ...section, items };
      }

      return null;
    })
    .filter((section): section is ShadowSection => section !== null);
}
