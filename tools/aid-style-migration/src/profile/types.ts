/**
 * Профиль продукта — набор материалов, на которые опирается перевод
 * (трекер, «Материалы продукта»). Продукт — это данные, а не код: имён
 * продуктов и режимов здесь нет, их вводит пользователь.
 */

import type { ThemeRole } from "../lib/vocabulary";
import type { TextCaseKind, UseKind } from "./usage";

export type { ThemeRole };

/** Виды материалов по умолчанию. Список расширяемый — новый вид = новый адаптер. */
export type MaterialKind = "tokens" | "components" | "icons" | "exemplars" | "standards";

export const MATERIAL_KINDS: MaterialKind[] = ["tokens", "components", "icons", "exemplars", "standards"];

export const MATERIAL_LABELS: Record<MaterialKind, string> = {
  tokens: "Токены и стили",
  components: "Компоненты",
  icons: "Иконки",
  exemplars: "Образцовые макеты",
  standards: "Стандарты ДС",
};

/** Откуда прочитан материал. REST — этап 2b. */
export type MaterialSource = "open-file" | "rest";

export interface Material {
  /** Стабильный id: kind + имя файла. Повторная индексация того же файла заменяет запись. */
  id: string;
  kind: MaterialKind;
  fileName: string;
  source: MaterialSource;
  indexedAt: string;
  /** Что нашли — для карточки профиля: «переменных 161», «компонентов 9». */
  stats: Record<string, number>;
  /** Пояснения к числам человеческим языком — например, откуда токены образцов. */
  notes?: string[];
  /** Ссылка, если материал прочитан по ней, — для «Обновить по ссылкам». */
  url?: string;
}

/** Вид материала для ссылки: конкретный или «определить сам». */
export type LinkKind = "auto" | "tokens" | "components" | "icons";

export interface LibraryLink {
  url: string;
  kind: LinkKind;
}


export interface ThemeMode {
  modeId: string;
  name: string;
  role: ThemeRole;
}

export interface ThemeSetting {
  /** Ключ коллекции темы в библиотеке токенов. */
  collectionKey: string;
  collectionName: string;
  modes: ThemeMode[];
}

/** Режим проверки по стандартам ДС (трекер, «пакеты правил»). */
export type StandardsMode = "off" | "reference" | "enforced";

export interface ProductProfile {
  id: string;
  name: string;
  materials: Material[];
  theme: ThemeSetting | null;
  standardsMode: StandardsMode;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Индексы материалов
// ---------------------------------------------------------------------------

export type VariableValue =
  | { kind: "color"; r: number; g: number; b: number; a: number }
  | { kind: "number"; value: number }
  | { kind: "string"; value: string }
  | { kind: "boolean"; value: boolean }
  | { kind: "alias"; name: string; key: string | null };

export interface IndexedVariable {
  key: string;
  name: string;
  /**
   * Видна ли переменная файлам с макетами. Скрытые от публикации (обычно
   * примитивы Core) в перевод не идут: макеты ссылаются на семантику.
   */
  published: boolean;
  resolvedType: VariableResolvedDataType;
  description: string;
  scopes: string[];
  /** Значение по id режима — как записано: число, цвет или ссылка. */
  valuesByMode: Record<string, VariableValue>;
  /**
   * Итоговое значение по id режима — ссылки пройдены до конца. Нужно для
   * перевода по значению-улике и подсчёта контраста; null — цепочку не
   * разрешить (ссылка за пределы файла или цикл).
   */
  resolvedByMode: Record<string, VariableValue | null>;
}

export interface IndexedCollection {
  key: string;
  name: string;
  published: boolean;
  modes: Array<{ modeId: string; name: string }>;
  variables: IndexedVariable[];
}

export interface IndexedTextStyle {
  key: string;
  name: string;
  /** Стили с «_» или «.» в начале имени Figma не публикует. */
  published: boolean;
  description: string;
  fontFamily: string;
  fontStyle: string;
  fontSize: number;
  /** px; null — «авто». */
  lineHeight: number | null;
  letterSpacing: number;
  textCase: string;
  textDecoration: string;
}

export interface IndexedEffectStyle {
  key: string;
  name: string;
  /** Стили с «_» или «.» в начале имени Figma не публикует. */
  published: boolean;
  description: string;
  effects: string[];
}

export interface IndexedPaintStyle {
  key: string;
  name: string;
  /** Стили с «_» или «.» в начале имени Figma не публикует. */
  published: boolean;
  description: string;
  paints: string[];
}

export interface TokensIndex {
  collections: IndexedCollection[];
  textStyles: IndexedTextStyle[];
  effectStyles: IndexedEffectStyle[];
  paintStyles: IndexedPaintStyle[];
}

export interface IndexedProperty {
  name: string;
  type: ComponentPropertyType;
  defaultValue: string | boolean;
  variantOptions?: string[];
}

export interface IndexedComponent {
  key: string;
  name: string;
  description: string;
  width: number;
  height: number;
  /** Ближайший фрейм-группа на странице: «action», «navigator»… */
  group: string;
  page: string;
  properties: IndexedProperty[];
}

export interface IndexedComponentSet extends IndexedComponent {
  variants: Array<{ key: string; name: string; width: number; height: number }>;
}

export interface ComponentsIndex {
  sets: IndexedComponentSet[];
  components: IndexedComponent[];
}

export type UsageCounts = Partial<Record<UseKind, number>>;

/**
 * Как образцы продукта на деле используют токены, стили и компоненты.
 * Агрегаты, а не сырые ноды: в clientStorage должно поместиться.
 */
export interface ExemplarIndex {
  /** Сколько экранов прочитано и из скольких выбрано. */
  screens: number;
  darkScreens: number;
  screensFound: number;
  nodes: number;
  /** Аннотации, пояснения, выноски вне экрана — пропущены, в статистику не вошли. */
  annotationsSkipped: number;
  /** Ключ переменной → где встречается, отдельно в светлых и тёмных экранах. */
  variables: Record<string, { name: string; collection: string; remote: boolean; light: UsageCounts; dark: UsageCounts }>;
  textStyles: Record<string, { name: string; uses: number; fontSize: number; cases: Partial<Record<TextCaseKind, number>> }>;
  /** Компонент → сколько раз и каким регистром в нём набран текст (подписи кнопок и т. п.). */
  components: Record<string, { name: string; setName: string; uses: number; cases: Partial<Record<TextCaseKind, number>> }>;
  /** Значения без токена и текст без стиля — насколько образец сам следует библиотеке. */
  unbound: { fills: number; strokes: number; texts: number };
  textCases: Partial<Record<TextCaseKind, number>>;
}

export type MaterialIndex =
  | { kind: "tokens"; data: TokensIndex }
  | { kind: "components"; data: ComponentsIndex }
  | { kind: "icons"; data: ComponentsIndex }
  | { kind: "exemplars"; data: ExemplarIndex };

/** Формат файла экспорта профиля. */
export const PROFILE_EXPORT_FORMAT = "aid-style-migration/profile";
export const PROFILE_EXPORT_VERSION = 1;

export interface ProfileExport {
  format: typeof PROFILE_EXPORT_FORMAT;
  version: number;
  profile: ProductProfile;
  indexes: Record<string, MaterialIndex>;
}
