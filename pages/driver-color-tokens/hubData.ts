export interface HubItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string | null;
}

export interface HubSection {
  id: string;
  title: string;
  items: HubItem[];
}

export const HUB_ROUTES = {
  hub: '/design-system',
  colors: '/tokens/colors',
  icons: '/tokens/icons',
} as const;

/** Название дизайн-системы. */
export const HUB_PAGE_TITLE = 'aid design system';

export const HUB_SECTIONS: HubSection[] = [
  {
    id: 'tokens',
    title: 'Tokens',
    items: [
      {
        id: 'colors',
        title: 'Colors',
        description: 'Semantic-цвета Day/Night с preview и HEX',
        icon: '◐',
        href: HUB_ROUTES.colors,
      },
      {
        id: 'spacing',
        title: 'Spacing',
        description: 'Core и semantic отступы',
        icon: '↔',
        href: null,
      },
      {
        id: 'typography',
        title: 'Typography',
        description: 'Стили текста и типографические токены',
        icon: 'Aa',
        href: null,
      },
      {
        id: 'icons',
        title: 'Icons',
        description: 'Иконки и логотипы',
        icon: '◇',
        href: HUB_ROUTES.icons,
      },
    ],
  },
  {
    id: 'components',
    title: 'Components',
    items: [
      {
        id: 'components-hub',
        title: 'Components',
        description: 'Каталог UI-компонентов дизайн-системы',
        icon: '▣',
        href: null,
      },
    ],
  },
];
