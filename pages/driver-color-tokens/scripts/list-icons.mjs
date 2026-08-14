/**
 * Экспортирует список иконок для sync-скрипта.
 * node scripts/list-icons.mjs
 */
import { iconSections } from '../iconsData.ts';

const list = iconSections.flatMap((section) =>
  section.items.map((item) => ({
    sectionId: section.id,
    iconId: item.id,
    figmaNodeId: item.figmaNodeId,
  })),
);

console.log(JSON.stringify(list, null, 2));
