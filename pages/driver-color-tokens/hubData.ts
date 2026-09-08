import { hasProductContent } from './productContent';

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
  /**
   * Bypasses the `hasProductContent` per-product availability check —
   * for hub items that are shared DS governance/infrastructure, not
   * product-scoped token or component data (e.g. Guides). Never used for
   * token or component sections, which stay derived from actual product
   * content per `productContent.ts`.
   */
  alwaysAvailable?: boolean;
  /**
   * When set, the hub card is shown only for these product ids.
   * Omit to include the item for every product (subject to content availability).
   */
  productIds?: string[];
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
  glass: '/tokens/glass',
  radius: '/tokens/radius',
  spacing: '/tokens/spacing',
  components: '/components',
  switch: '/components/switch',
  badgeCount: '/components/badge-count',
  badgeDot: '/components/badge-dot',
  guides: '/guides',
  guidesVersioning: '/guides/versioning',
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
        id: 'glass',
        title: 'Glass',
        description: 'iOS glass-эффект (frosted blur)',
        icon: '◌',
        href: HUB_ROUTES.glass,
        productIds: ['rider'],
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
  {
    id: 'guides',
    title: 'Guides',
    items: [
      {
        id: 'guides',
        title: 'Guides',
        description: 'Гайды дизайн-системы: версионирование, архитектура, спеки',
        icon: '▤',
        href: HUB_ROUTES.guides,
        // Shared DS governance docs, not product-scoped token/component data —
        // available for every product regardless of `productContent.ts`.
        alwaysAvailable: true,
      },
    ],
  },
];

/** Section titles keyed by hub item id / page key — for the disabled-content fallback page. */
export const SECTION_LABELS: Record<string, string> = {
  ...Object.fromEntries(
    HUB_SECTIONS.flatMap((section) => section.items.map((item) => [item.id, item.title] as const)),
  ),
  switch: 'Switch',
  badgeCount: 'BadgeCount',
  badgeDot: 'BadgeDot',
  guidesVersioning: 'Версионность',
};

/**
 * Per-product hub sections: same titles/descriptions/icons as `HUB_SECTIONS`
 * (never duplicated), but `href` is `null` — and the item renders disabled —
 * whenever `hasProductContent` finds no data for that section under this
 * product. This is the only place availability is decided; it is never a
 * manual boolean on a product config.
 */
export function buildHubSections(productId: string): HubSection[] {
  return HUB_SECTIONS.map((section) => ({
    ...section,
    items: section.items
      .filter((item) => !item.productIds || item.productIds.includes(productId))
      .map((item) => {
      const routeSuffix = item.href;
      const available =
        routeSuffix !== null && (item.alwaysAvailable || hasProductContent(productId, item.id));
      return {
        ...item,
        href: available ? `/${productId}${routeSuffix}` : null,
      };
    }),
  }));
}
