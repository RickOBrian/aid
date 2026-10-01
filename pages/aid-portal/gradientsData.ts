/**
 * Driver Gradients — значения из Figma «🚖 WB AID Driver Tokens & Styles»:
 * стили Gradients/* (paint styles) и коллекция переменных `gradients`
 * (режимы day и night). Каждая точка градиента привязана к переменной
 * `<Группа>/Step N`.
 *
 * Угол — направление ручек градиента из `gradientTransform` стиля,
 * пересчитанное в угол CSS для квадратного превью.
 */

export type GradientMode = 'day' | 'night';

export interface GradientStop {
  /** Имя переменной в коллекции `gradients`. */
  variable: string;
  /** Позиция точки, %. */
  position: number;
  day: string;
  night: string;
}

export interface GradientStyle {
  id: string;
  /** Имя стиля в Figma. */
  name: string;
  angle: number;
  stops: GradientStop[];
}

export const gradientsCollection = {
  collectionName: 'driver-gradients',
  artifact: 'Gradients',
} as const;

function stop(variable: string, position: number, day: string, night = day): GradientStop {
  return { variable, position, day, night };
}

export const gradientStyles: GradientStyle[] = [
  {
    id: 'silver',
    name: 'Gradients/Silver',
    angle: 152.6,
    stops: [
      stop('Silver/Step 1', 0, '#DAE5E9'),
      stop('Silver/Step 2', 38.02, '#C5D4D9'),
      stop('Silver/Step 2-3', 70.83, '#8C96A3'),
      stop('Silver/Step 3', 100, '#CCDBE0'),
    ],
  },
  {
    id: 'gold',
    name: 'Gradients/Gold',
    angle: 153.5,
    stops: [
      stop('Gold/Step 1', 0, '#F3C668'),
      stop('Gold/Step 2', 38.02, '#EFB113'),
      stop('Gold/Step 2-3', 70.83, '#B77408'),
      stop('Gold/Step 3', 100, '#EFB113'),
    ],
  },
  {
    id: 'motivation',
    name: 'Gradients/Motivation',
    angle: 161.2,
    stops: [
      stop('Motivation/Step 1', 0, '#7000FF'),
      stop('Motivation/Step 2', 100, '#63DED7'),
    ],
  },
  {
    id: 'bottom',
    name: 'Gradients/Bottom',
    angle: 180,
    stops: [
      stop('Bottom/Step 1', 0, '#FFFFFF00', '#1F1F2300'),
      stop('Bottom/Step 2', 100, '#FFFFFF', '#1F1F23'),
    ],
  },
];

/** Раздел для `products/driver/index.ts`: хаб показывает Gradients, если он не пуст. */
export const gradientSections = [{ id: 'gradients', title: 'Gradients', items: gradientStyles }];

export function gradientCss(style: GradientStyle, mode: GradientMode): string {
  const stops = style.stops.map((item) => `${item[mode]} ${item.position}%`).join(', ');
  return `linear-gradient(${style.angle}deg, ${stops})`;
}

/** `#RRGGBBAA` → HEX и непрозрачность в %: так цвет подписан на странице цветов. */
export function splitGradientColor(hex: string): { hex: string; opacity: number } {
  if (hex.length !== 9) {
    return { hex, opacity: 100 };
  }
  return { hex: hex.slice(0, 7), opacity: Math.round((parseInt(hex.slice(7), 16) / 255) * 100) };
}
