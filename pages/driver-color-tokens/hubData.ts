export interface HubItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string | null;
  /**
   * Optional sub-group inside a HubSection (e.g. "Controls" per
   * `skills/_shared/component-categories-guide.md`). Items without a group
   * render as a flat list, preserving the previous behavior.
   */
  group?: string;
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
  typography: '/tokens/typography',
  shadows: '/tokens/shadows',
  radius: '/tokens/radius',
  spacing: '/tokens/spacing',
  components: '/components',
  switch: '/components/switch',
} as const;

/** Название дизайн-системы. */
export const HUB_PAGE_TITLE = 'aid: driver';

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
        id: 'typography',
        title: 'Typography',
        description: 'Стили текста и типографические токены',
        icon: 'Aa',
        href: HUB_ROUTES.typography,
      },
      {
        id: 'spacing',
        title: 'Spacing',
        description: 'Core и semantic отступы',
        icon: '↔',
        href: HUB_ROUTES.spacing,
      },
      {
        id: 'radius',
        title: 'Radius',
        description: 'Скругления у углов',
        icon: '∠',
        href: HUB_ROUTES.radius,
      },
      {
        id: 'shadows',
        title: 'Shadows',
        description: 'Elevation и nine-patch тени',
        icon: '❑',
        href: HUB_ROUTES.shadows,
      },
      {
        id: 'icons',
        title: 'Icons',
        description: 'Иконки и логотипы',
        icon: '☆',
        href: HUB_ROUTES.icons,
      },
    ],
  },
  {
    id: 'components',
    title: 'Components',
    items: [
      {
        id: 'components',
        title: 'Components',
        description: 'Каталог UI-компонентов дизайн-системы',
        icon: '▣',
        href: HUB_ROUTES.components,
      },
    ],
  },
];
