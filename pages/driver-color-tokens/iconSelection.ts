import type { IconSection } from './iconsData';

export function iconSelectionKey(sectionId: string, itemId: string): string {
  return `${sectionId}/${itemId}`;
}

export function countIconsInSections(sections: IconSection[]): number {
  return sections.reduce((total, section) => total + section.items.length, 0);
}

export function filterSectionsBySelectionKeys(
  sections: IconSection[],
  selectedKeys: ReadonlySet<string>,
): IconSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        selectedKeys.has(iconSelectionKey(section.id, item.id)),
      ),
    }))
    .filter((section) => section.items.length > 0);
}

export function getSectionSelectionState(
  section: IconSection,
  selectedKeys: ReadonlySet<string>,
): { all: boolean; some: boolean; none: boolean } {
  if (section.items.length === 0) {
    return { all: false, some: false, none: true };
  }

  let selectedCount = 0;
  for (const item of section.items) {
    if (selectedKeys.has(iconSelectionKey(section.id, item.id))) {
      selectedCount += 1;
    }
  }

  return {
    all: selectedCount === section.items.length,
    some: selectedCount > 0 && selectedCount < section.items.length,
    none: selectedCount === 0,
  };
}
