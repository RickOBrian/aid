/**
 * Роли элементов человеческим языком — для окна, анкеты и страницы
 * «Язык продукта». Ключ роли — из `roles.ts`.
 */

const BASE: Record<string, string> = {
  "screen-bg": "Фон экрана",
  overlay: "Затемнение",
  sheet: "Шторка",
  modal: "Модалка",
  card: "Карточка",
  "card-tint": "Цветная карточка",
  surface: "Поверхность",
  "action-main": "Главное действие",
  "action-primary": "Обычная кнопка",
  "action-secondary": "Второстепенная кнопка",
  "action-disabled": "Неактивная кнопка",
  "action-destructive": "Разрушительная кнопка",
  "action-floating": "Плавающая кнопка",
  input: "Поле ввода",
  chip: "Чип",
  handle: "Ручка шторки",
  header: "Заголовок",
  row: "Строка списка",
  bubble: "Пузырь сообщения",
  badge: "Бейдж-счётчик",
  divider: "Разделитель",
  "tab/indicator": "Индикатор таба",
  link: "Ссылка",
  "text/primary": "Основной текст",
  "text/secondary": "Вторичный текст",
  "text/tertiary": "Третичный текст",
  "text/status": "Текст статуса",
  "text/on-color": "Текст на контрастном фоне",
  "icon/primary": "Основная иконка",
  "icon/secondary": "Вторичная иконка",
  "icon/tertiary": "Третичная иконка",
  "icon/on-color": "Иконка на контрастном фоне",
  "icon/accent": "Иконка-акцент",
  "icon/status": "Иконка статуса",
  "icon/stroke": "Иконка · обводка",
  decor: "Декор",
};

const PART: Record<string, string> = {
  label: "подпись",
  icon: "иконка",
  part: "деталь",
  meta: "метка (время)",
  stroke: "обводка",
};

const MEANING: Record<string, string> = {
  accent: "акцент",
  positive: "позитив",
  negative: "негатив",
  warning: "предупреждение",
  info: "инфо",
  neutral: "нейтральный",
};

export type RoleGroup = "actions" | "text" | "icons" | "surfaces" | "other";

export const GROUP_LABELS: Record<RoleGroup, string> = {
  actions: "Кнопки и управление",
  text: "Текст",
  icons: "Иконки",
  surfaces: "Поверхности",
  other: "Прочее",
};

export const GROUP_ORDER: RoleGroup[] = ["actions", "text", "icons", "surfaces", "other"];

/** «action-main/label» → «Главное действие · подпись»; «text/status-negative» → «Текст статуса · негатив». */
export function roleLabel(key: string): string {
  if (BASE[key]) return BASE[key];
  const status = key.match(/^(text|icon)\/status-(\w+)$/);
  if (status) return `${BASE[`${status[1]}/status`]} · ${MEANING[status[2]] ?? status[2]}`;
  const tinted = key.match(/^(card-tint|decor)\/(\w+)$/);
  if (tinted) return `${BASE[tinted[1]]} · ${MEANING[tinted[2]] ?? tinted[2]}`;
  const i = key.lastIndexOf("/");
  if (i > 0 && PART[key.slice(i + 1)]) return `${roleLabel(key.slice(0, i))} · ${PART[key.slice(i + 1)]}`;
  return key;
}

export function roleGroup(key: string): RoleGroup {
  if (/^(action-|input|chip|tab\/|link|handle)/.test(key)) return "actions";
  if (key.startsWith("text/")) return "text";
  if (key.startsWith("icon/")) return "icons";
  if (/^(screen-bg|overlay|sheet|modal|card|surface|divider|header|row)/.test(key)) return "surfaces";
  return "other";
}
