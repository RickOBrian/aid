/**
 * Сырые данные стилей из Figma-файла «Первая версия Драйвера».
 *
 * Это не токены дизайн-системы — только буквальный дамп значений стилей
 * (цвета, типографика, тени) для наглядного просмотра. Namespace-имена
 * (day/…, night/…, ind./…) — как они называются в самом Figma-файле.
 */

export interface ColorSwatch {
  type: 'color';
  name: string;
  /** HEX без альфа-канала. */
  hex: string;
  /** Opacity в процентах (0–100). */
  opacity: number;
  comment?: string;
}

export interface GradientSwatch {
  type: 'gradient';
  name: string;
  /** Готовое значение CSS-градиента (placeholder, если точные stop-цвета не извлечены). */
  gradient: string;
  comment?: string;
}

export type Swatch = ColorSwatch | GradientSwatch;

export interface TypographyStyle {
  name: string;
  fontFamily: string;
  fontSizePx: number;
  lineHeightPx: number;
  letterSpacingPx: number;
  comment?: string;
}

export interface ShadowLayer {
  blur: number;
  offsetX: number;
  offsetY: number;
  /** Цвет тени в формате rgba(). */
  color: string;
}

export interface ShadowStyle {
  name: string;
  layers: ShadowLayer[];
  comment?: string;
}

function color(name: string, hex: string, opacity: number, comment?: string): ColorSwatch {
  return { type: 'color', name, hex, opacity, comment };
}

function gradient(name: string, gradientValue: string, comment?: string): GradientSwatch {
  return { type: 'gradient', name, gradient: gradientValue, comment };
}

export const textColors: ColorSwatch[] = [
  color('Texts day/primary 1', '#000000', 87, 'Основной текст (день)'),
  color('Texts day/primary 2', '#ffffff', 100, 'Основной текст на тёмном фоне'),
  color('Texts day/secondary 1', '#000000', 54, 'Вторичный текст'),
  color('Texts day/tertiary', '#000000', 38, 'Третичный текст'),
  color('Texts day/disabled', '#000000', 26, 'Неактивный текст'),
  color('Texts day/warning', '#d62347', 100, 'Текст-предупреждение'),
  color('Texts day/positive', '#23ad58', 100, 'Текст-подтверждение'),
  color('Texts day/accent', '#8526ff', 100, 'Акцентный текст'),
  color('Texts day/primary light ind.', '#ffffff', 100, 'Основной текст на индикаторе (светлый)'),
  color('Texts day/secondary light ind.', '#ffffff', 70, 'Вторичный текст на индикаторе (светлый)'),
  color('Texts day/disabled light ind.', '#ffffff', 16, 'Неактивный текст на индикаторе'),
  color('Texts day/primary dark ind.', '#000000', 87, 'Основной текст (тёмный индикатор)'),
  color('Texts day/primary widget white', '#ffffff', 100, 'Текст в белом виджете'),
  color('Texts day/primary ind. night', '#ffffff', 100, 'Ночной индикатор'),
  color('Texts day/secondary ind. day', '#000000', 54, 'Вторичный (дневной индикатор)'),
  color('Texts night/primary 1', '#ffffff', 100, 'Основной текст (ночь)'),
  color('Texts night/primary light ind.', '#ffffff', 100, 'Ночь, светлый индикатор'),
  color('Texts ind./primary night', '#ffffff', 100, 'Индикатор, ночь'),
  color('Texts ind./secondary dark', '#000000', 54, 'Индикатор, тёмный вторичный'),
  color('Texts ind./secondary light', '#ffffff', 70, 'Индикатор, светлый вторичный'),
];

export const iconColors: ColorSwatch[] = [
  color('Icons day/primary 1', '#2d2c2e', 100, 'Основная иконка (день)'),
  color('Icons day/primary 2', '#ffffff', 100, 'Основная иконка (инверсия)'),
  color('Icons day/secondary 1', '#000000', 54, 'Вторичная иконка'),
  color('Icons day/secondary 2', '#ffffff', 100, 'Вторичная (на тёмном)'),
  color('Icons day/informative', '#000000', 38, 'Информативная'),
  color('Icons day/inactive', '#000000', 26, 'Неактивная'),
  color('Icons day/positive', '#23ad58', 100, 'Позитивная'),
  color('Icons day/warning', '#d62347', 100, 'Предупреждение'),
  color('Icons day/special', '#005aff', 100, 'Специальная (синяя)'),
  color('Icons day/accent', '#8526ff', 100, 'Акцентная (фиолет)'),
  color('Icons day/primary light ind.', '#ffffff', 100, 'Светлый индикатор'),
  color('Icons day/secondary light ind.', '#ffffff', 50, 'Вторичный светлый'),
  color('Icons day/inactive light ind.', '#ffffff', 16, 'Неактивный светлый'),
  color('Icons day/informative light ind.', '#ffffff', 38, 'Информативный светлый'),
  color('Icons day/secondary dark ind.', '#000000', 54, 'Вторичный тёмный'),
  color('Icons day/primary widget white', '#ffffff', 100, 'Виджет белый'),
  color('Icons day/secondary widget white', '#ffffff', 50, 'Виджет, вторичный'),
  color('Icons day/primary ind. night', '#ffffff', 100, 'Ночной индикатор'),
  color('Icons day/secondary ind. day', '#000000', 54, 'Дневной индикатор'),
  color('Icons ind./primary light', '#ffffff', 100, 'Светлый индикатор'),
  color('Icons ind./secondary dark', '#000000', 54, 'Тёмный вторичный'),
  color('Icons night/primary 1', '#ffffff', 100, 'Ночь, основная'),
  color('Icons night/primary 2', '#2d2c2e', 100, 'Ночь, инверсия'),
  color('Icons night/positive', '#23ad58', 100, 'Ночь, позитивная'),
  color('Icons night/informative', '#ffffff', 38, 'Ночь, информативная'),
  color('Icons night/informative light ind.', '#ffffff', 38, 'Ночь, светлый инф. индикатор'),
  color('Icons night/primary light ind.', '#ffffff', 100, 'Ночь, светлый индикатор'),
  color('Icons night/secondary light ind.', '#ffffff', 50, 'Ночь, вторичный светлый'),
  color('Icons night/inactive light ind.', '#ffffff', 16, 'Ночь, неактивный'),
];

export const buttonColors: ColorSwatch[] = [
  color('Buttons day/primary', '#2d2c2e', 100, 'Основная кнопка'),
  color('Buttons day/secondary', '#ebedf0', 100, 'Вторичная кнопка'),
  color('Buttons day/fab', '#ffffff', 100, 'FAB (Floating Action Button)'),
  color('Buttons day/disabled', '#f5f5f5', 100, 'Неактивная кнопка'),
  color('Buttons day/positive', '#23ad58', 100, 'Позитивная кнопка'),
  color('Buttons night/fab', '#504f52', 100, 'FAB ночной'),
];

export const backgroundColors: Swatch[] = [
  color('Bg day/primary', '#ffffff', 100, 'Основной фон'),
  color('Bg day/secondary', '#f5f5f5', 100, 'Вторичный фон'),
  color('Bg day/actions', '#2d2c2e', 100, 'Фон действий'),
  gradient(
    'Bg day/fade',
    'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
    'Градиентный fade (точных stop-цветов нет — рендерить как placeholder-градиент)',
  ),
  color('Bg night/actions', '#000000', 100, 'Фон действий (ночь)'),
];

export const strokeColors: ColorSwatch[] = [
  color('Strokes day/primary', '#2d2c2e', 100, 'Основная обводка'),
  color('Strokes day/secondary', '#000000', 38, 'Вторичная обводка'),
  color('Strokes day/informative', '#ebedf0', 100, 'Информативная обводка'),
  color('Strokes day/informative light ind.', '#ffffff', 16, 'Инф. обводка на индикаторе'),
];

export const messageFieldColors: ColorSwatch[] = [
  color('Messages day/default', '#ebedf0', 100, 'Фон сообщения по умолчанию'),
  color('Messages day/positive', '#23ad58', 100, 'Позитивное сообщение'),
  color('Messages day/warning', '#d62347', 100, 'Предупреждение'),
  color('Fields day/warning', '#d62347', 100, 'Поле с ошибкой'),
];

export const pastelColors: ColorSwatch[] = [
  color('Pastel / Sign', '#6a98cd', 100, 'Голубой'),
  color('Pastel / Lips', '#cf6f96', 100, 'Розовый'),
  color('Pastel / Morion', '#605e5e', 100, 'Тёмно-серый'),
  color('Pastel / Vk', '#637fa3', 100, 'Серо-голубой'),
  color('Pastel / Nebula', '#b8dbc9', 100, 'Мятный'),
  color('Pastel / Olive', '#d9dbbe', 100, 'Оливковый'),
  color('Pastel / Wealth', '#7ca08e', 100, 'Зелёный приглушённый'),
  color('Pastel / Ghost', '#c3d9eb', 100, 'Голубой светлый'),
  color('Pastel / Bronze', '#b2896a', 100, 'Бронзовый'),
  color('Pastel / Parchment', '#f6eedf', 100, 'Пергаментный'),
  color('Pastel / Corn', '#f0ce86', 100, 'Кукурузный'),
  color('Pastel / Skin', '#f0d4c5', 100, 'Телесный'),
  color('Pastel / Plum', '#d1c0e5', 100, 'Сливовый'),
  color('Pastel / Concrete', '#d4d4d4', 100, 'Бетон'),
  color('Pastel / Peach', '#edba8e', 100, 'Персиковый'),
  color('Pastel / Turquoise', '#a1c8d1', 100, 'Бирюзовый'),
];

export const utilityColors: ColorSwatch[] = [
  color('Black / 300', '#000000', 38, 'Чёрный 38%'),
  color('Black / 400', '#000000', 54, 'Чёрный 54%'),
  color('Black / 800', '#000000', 87, 'Чёрный 87%'),
  color('White / 900', '#ffffff', 100, 'Белый'),
  color('Grey / Normal', '#ebedf0', 100, 'Серый нормальный'),
  color('Grey / Light', '#f5f5f5', 100, 'Серый светлый'),
  color('Purple / Normal', '#7000ff', 100, 'Фиолетовый'),
  color('Raisin', '#2d2b2c', 100, 'Тёмный «изюмный»'),
];

export const gradients: GradientSwatch[] = [
  gradient(
    'Gradients / Silver',
    'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 50%, #a8a8a8 100%)',
    'Серебряный градиент (точные stop-цвета не извлечены — placeholder)',
  ),
  gradient(
    'Gradients / Motivation',
    'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)',
    'Мотивационный градиент (точные stop-цвета не извлечены — placeholder)',
  ),
];

export const typographyStyles: TypographyStyle[] = [
  { name: 'Titles / Title 1', fontFamily: 'Roboto Medium', fontSizePx: 72, lineHeightPx: 88, letterSpacingPx: 0, comment: 'Крупный заголовок' },
  { name: 'Headlines / Headline 1', fontFamily: 'Roboto Medium', fontSizePx: 44, lineHeightPx: 56, letterSpacingPx: 0, comment: 'Заголовок 1-го уровня' },
  { name: 'Headlines / Headline 4', fontFamily: 'Roboto Medium', fontSizePx: 30, lineHeightPx: 36, letterSpacingPx: 0.15, comment: 'Заголовок 4-го уровня' },
  { name: 'Headlines / Headline 6', fontFamily: 'Roboto Medium', fontSizePx: 22, lineHeightPx: 28, letterSpacingPx: 0.3, comment: 'Заголовок 6-го уровня' },
  { name: 'Subtitles / Subtitle 1', fontFamily: 'Roboto Medium', fontSizePx: 18, lineHeightPx: 24, letterSpacingPx: 0.15, comment: 'Подзаголовок 1' },
  { name: 'Subtitles/Subtitle 2', fontFamily: 'Roboto Medium', fontSizePx: 14, lineHeightPx: 16, letterSpacingPx: 0.1, comment: 'Подзаголовок 2' },
  { name: 'Bodies / Body 1', fontFamily: 'Roboto Regular', fontSizePx: 18, lineHeightPx: 24, letterSpacingPx: 0.15, comment: 'Основной текст' },
  { name: 'Bodies / Body 2', fontFamily: 'Roboto Regular', fontSizePx: 14, lineHeightPx: 16, letterSpacingPx: 0, comment: 'Мелкий текст' },
];

export const effectStyles: ShadowStyle[] = [
  {
    name: 'Shadow 2',
    layers: [{ blur: 12, offsetX: 0, offsetY: 2, color: 'rgba(0,0,0,0.12)' }],
    comment: 'Лёгкая тень',
  },
  {
    name: 'Shadow 3',
    layers: [{ blur: 12, offsetX: 0, offsetY: 4, color: 'rgba(0,0,0,0.16)' }],
    comment: 'Средняя тень',
  },
  {
    name: 'Shadow 4',
    layers: [{ blur: 12, offsetX: 0, offsetY: 4, color: 'rgba(0,0,0,0.36)' }],
    comment: 'Глубокая тень',
  },
  {
    name: 'Shadow 5',
    layers: [{ blur: 16, offsetX: 0, offsetY: 8, color: 'rgba(0,0,0,0.25)' }],
    comment: 'Крупная тень',
  },
  {
    name: 'Shadow 6',
    layers: [
      { blur: 5, offsetX: 0, offsetY: 3, color: 'rgba(0,0,0,0.20)' },
      { blur: 18, offsetX: 0, offsetY: 1, color: 'rgba(0,0,0,0.12)' },
      { blur: 10, offsetX: 0, offsetY: 6, color: 'rgba(0,0,0,0.14)' },
    ],
    comment: 'Составная тень',
  },
  {
    name: 'Shadow 7',
    layers: [
      { blur: 15, offsetX: 0, offsetY: 11, color: 'rgba(0,0,0,0.20)' },
      { blur: 46, offsetX: 0, offsetY: 9, color: 'rgba(0,0,0,0.12)' },
      { blur: 38, offsetX: 0, offsetY: 24, color: 'rgba(0,0,0,0.14)' },
    ],
    comment: 'Максимальная тень',
  },
  {
    name: 'Elevation 6 (remote)',
    layers: [
      { blur: 14, offsetX: 0, offsetY: 6, color: 'rgba(0,0,0,0.20)' },
      { blur: 4, offsetX: 0, offsetY: -1, color: 'rgba(0,0,0,0.04)' },
    ],
    comment: 'Material-style elevation',
  },
  {
    name: 'Elevation 24',
    layers: [
      { blur: 15, offsetX: 0, offsetY: 11, color: 'rgba(0,0,0,0.20)' },
      { blur: 46, offsetX: 0, offsetY: 9, color: 'rgba(0,0,0,0.12)' },
      { blur: 38, offsetX: 0, offsetY: 24, color: 'rgba(0,0,0,0.14)' },
    ],
    comment: 'Совпадает по значениям с Shadow 7',
  },
  {
    name: 'Up / 1',
    layers: [{ blur: 12, offsetX: 0, offsetY: 0, color: 'rgba(0,0,0,0.12)' }],
    comment: 'Тень без смещения (эффект приподнятости)',
  },
];

export const localEffectStyles: ShadowStyle[] = [
  {
    name: 'Elevation 4',
    layers: [
      { blur: 4, offsetX: 0, offsetY: 2, color: 'rgba(0,0,0,0.20)' },
      { blur: 10, offsetX: 0, offsetY: 1, color: 'rgba(0,0,0,0.12)' },
      { blur: 5, offsetX: 0, offsetY: 4, color: 'rgba(0,0,0,0.14)' },
    ],
    comment: 'Локальный стиль',
  },
  {
    name: 'Elevation 6',
    layers: [
      { blur: 14, offsetX: 0, offsetY: 6, color: 'rgba(0,0,0,0.20)' },
      { blur: 4, offsetX: 0, offsetY: -1, color: 'rgba(0,0,0,0.04)' },
    ],
    comment: 'Дублирует библиотечный «Elevation 6 (remote)» по значениям',
  },
];
