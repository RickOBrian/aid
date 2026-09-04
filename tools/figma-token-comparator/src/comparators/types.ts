/**
 * Общие типы сравнения токенов.
 *
 * Модуль не привязан к конкретной категории (Colors/Typography/Spacing/...) —
 * каждая категория реализует `ITokenComparator` и использует свои формы
 * `LayoutRecord` / `LibraryToken`, но общий контракт (scanLayout ->
 * compareWithLibrary -> ComparisonResult[]) одинаков для всех будущих
 * comparator-модулей.
 */

/** Способ привязки значения в макете к источнику правды. */
export type BindingType = "variable" | "style" | "hardcoded" | "ghost";

/** Итог сравнения одной группы записей макета с библиотекой. */
export type MatchStatus =
  | "mapped" // подтверждённый маппинг из истории решений
  | "exact" // variableId макета === variableId библиотеки
  | "value" // совпадение resolved-значения (с учётом alpha) в нужном режиме
  | "name-match" // совпадение имени переменной/стиля, но разные значения
  | "conflict" // совпадение имени, но существенно разные значения
  | "name-match-unresolved" // совпадение имени, но значение библиотеки не резолвится (внешний алиас за пределы файла)
  | "approximate" // перцептивное совпадение ниже порога (Delta E)
  | "layout-only"; // нет совпадений в библиотеке вообще

/**
 * Решение дизайнера по строке расхождения.
 * - "mapped_suggested" — использовать токен, который предложил сам плагин (result.target),
 *   без ручного выбора.
 * - "mapped" — выбрать другой токен из библиотеки вручную (предложенный не подходит).
 * Оба варианта приводят к одинаковому финальному состоянию (строка привязана к токену
 * библиотеки) и одинаково скрываются из таблицы при перескане — см. colorComparator.ts.
 */
export type Decision = "mapped_suggested" | "mapped" | "ignored" | "candidate" | "value_fix_proposed";

/** Базовая запись, найденная в макете (до сравнения с библиотекой). */
export interface LayoutRecord {
  /** Стабильный ключ группы: hash(property + resolvedValue + bindingType + sourceName). */
  id: string;
  /** Категория comparator-модуля, например "colors" (будущие: "typography", "spacing", ...). */
  category: string;
  /** Подтип свойства внутри категории, например "fill" / "stroke" / "text-fill". */
  property: string;
  bindingType: BindingType;
  /** Отображаемое значение, например "#RRGGBB" или "#RRGGBB @ 80%". */
  displayValue: string;
  /**
   * Значение, пригодное для программного сравнения (не для отображения).
   * Для Colors — { hex, alpha }. Каждая новая категория определяет свою
   * форму comparisonValue и читает её только в своём comparator-модуле.
   */
  comparisonValue: Record<string, unknown>;
  /** Имя переменной/стиля-источника, если применимо (пусто для hardcoded/ghost). */
  sourceName: string;
  /** id переменной макета, если bindingType === "variable" (для Exact match). */
  variableId?: string;
  /**
   * Стабильный key опубликованной переменной Figma — одинаковый в файле
   * библиотеки и в макете после импорта (в отличие от variableId).
   */
  variableKey?: string;
  /** id paint style, если bindingType === "style" | "ghost". */
  styleId?: string;
  /** Сколько раз эта же группа встретилась в скоупе сканирования. */
  count: number;
  /** Путь для одного из представителей группы (breadcrumb от страницы). */
  representativeNodePath: string;
  representativeNodeName: string;
  /** id всех нод, попавших в группу (для выделения в Figma по клику). */
  nodeIds: string[];
  /**
   * Значения переменной макета по ВСЕМ режимам её коллекции (например,
   * Day/Night) — заполняется только для bindingType === "variable", когда
   * удалось резолвить значение через Plugin API. Позволяет показать в
   * таблице оба значения (day/night) для наглядного сравнения с
   * библиотекой по каждому режиму. Пусто для hardcoded/style/ghost и для
   * переменных, которые не удалось резолвить.
   */
  modeValues?: LayoutRecordModeValue[];
}

/** Значение записи макета в конкретном режиме (day/night и т.п.), см. LayoutRecord.modeValues. */
export interface LayoutRecordModeValue {
  modeId: string;
  modeName: string;
  displayValue: string;
  comparisonValue: Record<string, unknown>;
}

/** Значение токена библиотеки в конкретном режиме (mode). */
export interface LibraryTokenModeValue {
  modeId: string;
  modeName: string;
  /** Резолвленное значение в отображаемом виде категории (для цвета — hex+alpha). */
  displayValue: string;
  /** Значение для программного сравнения, форма зависит от категории (см. LayoutRecord.comparisonValue). */
  comparisonValue: Record<string, unknown>;
  /**
   * true, если Figma REST API не смог резолвить значение в этом режиме —
   * типично для переменной, ссылающейся алиасом на переменную из ДРУГОГО
   * библиотечного файла (`/variables/local` отдаёт только локальные
   * переменные текущего файла). Токен всё равно остаётся в библиотеке для
   * поиска по имени — `displayValue` в этом случае содержит пояснение для
   * пользователя, а не hex.
   */
  unresolved?: boolean;
}

/** Токен эталонной библиотеки (после резолва REST-ответа Figma Variables). */
export interface LibraryToken {
  variableId: string;
  /** Стабильный key переменной — совпадает между библиотекой и импортом в макет. */
  key: string;
  name: string;
  collectionId: string;
  collectionName: string;
  resolvedType: string;
  modes: LibraryTokenModeValue[];
  /**
   * Figma Variable.scopes — где переменную разрешено использовать
   * (STROKE_COLOR, TEXT_FILL, FRAME_FILL, SHAPE_FILL, ALL_FILLS,
   * EFFECT_COLOR, ALL_SCOPES). Используется только как tie-breaker при
   * равном качестве совпадения — см. `lib/variableScope.ts`.
   */
  scopes: string[];
}

/** Целевой токен, выбранный как совпадение/маппинг для строки. */
export interface ComparisonTarget {
  variableId: string;
  name: string;
  collectionName: string;
  modeId: string;
  modeName: string;
  displayValue: string;
  /** true, если это значение библиотеки не резолвится (внешний алиас) — displayValue содержит пояснение, не hex. */
  valueUnresolved?: boolean;
  /**
   * Все режимы токена библиотеки (например, Day/Night) — используется UI,
   * чтобы показать оба значения рядом со значениями макета, а не только
   * тот режим, что использовался для расчёта статуса совпадения.
   */
  allModes?: LibraryTokenModeValue[];
}

/** Результат сравнения одной группы записей макета с библиотекой. */
export interface ComparisonResult extends LayoutRecord {
  status: MatchStatus;
  target?: ComparisonTarget;
  /** Delta E между макетом и целевым значением — только для approximate. */
  deltaE?: number;
  decision?: Decision;
  decisionComment?: string;
  decisionTargetVariableId?: string;
  decisionTimestamp?: string;
  /** value_fix_proposed — режим библиотеки, который предлагается поправить. */
  decisionProposedModeId?: string;
  decisionProposedModeName?: string;
  /** value_fix_proposed — текущее значение библиотеки в этом режиме (контекст). */
  decisionCurrentLibraryValue?: string;
  /** value_fix_proposed — предлагаемое новое значение (hex). */
  decisionProposedValue?: string;
}

/** Общий интерфейс comparator-модуля категории. */
export interface ITokenComparator<TScope = unknown> {
  category: string;
  scanLayout(scope: TScope): Promise<LayoutRecord[]>;
  compareWithLibrary(
    records: LayoutRecord[],
    library: LibraryToken[],
    history: Record<string, StoredDecision>
  ): ComparisonResult[];
}

/** Хранимое в clientStorage подтверждённое решение по группе записей. */
export interface StoredDecision {
  decision: Decision;
  targetVariableId?: string;
  targetName?: string;
  targetCollectionName?: string;
  comment?: string;
  timestamp: string;
  /** value_fix_proposed — id режима target-переменной библиотеки. */
  proposedModeId?: string;
  /** value_fix_proposed — имя режима (Day, Night, …). */
  proposedModeName?: string;
  /** value_fix_proposed — текущее значение библиотеки в этом режиме. */
  currentLibraryValue?: string;
  /** value_fix_proposed — предлагаемое значение (hex). */
  proposedValue?: string;
}

/** Скоуп сканирования, выбираемый пользователем в UI. */
export type ScanScope = "file" | "page" | "selection";
