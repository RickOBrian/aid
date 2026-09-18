/**
 * Общие типы сравнения токенов.
 *
 * Модуль не привязан к конкретной категории (Colors/Typography/Spacing/...) —
 * каждая категория реализует `ITokenComparator` и использует свои формы
 * `LayoutRecord` / `LibraryToken`, но общий контракт (scanLayout ->
 * compareWithLibrary -> ComparisonResult[]) одинаков для всех будущих
 * comparator-модулей.
 */

/** Категория comparator-модуля. */
export type TokenCategory = "colors" | "typography";

/** Способ привязки значения в макете к источнику правды. */
export type BindingType =
  | "variable"
  | "style"
  | "hardcoded"
  | "ghost"
  /** Зарезервировано для будущих typography variables (Phase 2+); не используется в Phase 1. */
  | "typography-variable";

/** textCase в формате Figma REST / Plugin API. */
export type TypographyTextCase =
  | "ORIGINAL"
  | "UPPER"
  | "LOWER"
  | "TITLE"
  | "SMALL_CAPS"
  | "SMALL_CAPS_FORCED";

/** textDecoration в формате Figma REST / Plugin API. */
export type TypographyTextDecoration = "NONE" | "STRIKETHROUGH" | "UNDERLINE";

/** Нормализованные свойства текстового стиля для программного сравнения. */
export interface TypographyComparisonValue {
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  /** Нормализовано в px. */
  lineHeight: number;
  letterSpacing: number;
  textCase: TypographyTextCase;
  textDecoration: TypographyTextDecoration;
  /**
   * true — lineHeight вычислен приближённо (AUTO / INTRINSIC_% без font metrics).
   * См. typographyUtils.normalizeLineHeightFromRest / normalizeLineHeightFromPlugin.
   */
  lineHeightApproximate?: boolean;
  /**
   * true — fontWeight получен через inferFontWeightFromFontName() (TextStyle),
   * а не нативный numeric fontWeight TEXT-ноды.
   */
  fontWeightApproximate?: boolean;
  /**
   * true — на TEXT-ноде figma.mixed только на некритичных полях (letterSpacing,
   * textCase, textDecoration); критичные поля резолвлены.
   */
  partiallyMixed?: boolean;
  /** Какие некритичные поля были figma.mixed (для подписи в UI). */
  partiallyMixedFields?: Array<"letterSpacing" | "textCase" | "textDecoration">;
}

/** Text Style эталонной библиотеки (после резолва REST-ответа Figma Styles). */
export interface LibraryTextStyle {
  /** node_id стиля в файле библиотеки — совпадает с textStyleId в макете после импорта. */
  styleId: string;
  /** Стабильный key опубликованного стиля. */
  key: string;
  name: string;
  displayValue: string;
  comparisonValue: TypographyComparisonValue;
}

/** Итог сравнения одной группы записей макета с библиотекой. */
export type MatchStatus =
  | "mapped" // подтверждённый маппинг из истории решений
  | "exact" // variableId макета === variableId библиотеки
  | "value" // совпадение resolved-значения (с учётом alpha) в нужном режиме
  | "name-match" // совпадение имени переменной/стиля, но разные значения
  | "conflict" // совпадение имени, но существенно разные значения
  | "name-match-unresolved" // совпадение имени, но значение библиотеки не резолвится (внешний алиас за пределы файла)
  | "approximate" // перцептивное совпадение ниже порога (Delta E)
  | "name-mismatch" // typography: стиль применён, имя не соответствует ожидаемому semantic-токену
  | "mixed-unresolved" // typography: figma.mixed для fontSize/fontName
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
  /** Категория comparator-модуля. */
  category: TokenCategory;
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
  /** id paint/text style, если bindingType === "style" | "ghost". */
  styleId?: string;
  /** Стабильный key опубликованного Text Style (typography) или paint style. */
  styleKey?: string;
  /** Сколько раз эта же группа встретилась в скоупе сканирования. */
  count: number;
  /** Путь для одного из представителей группы (breadcrumb от страницы). */
  representativeNodePath: string;
  representativeNodeName: string;
  /** id всех нод, попавших в группу (для выделения в Figma по клику). */
  nodeIds: string[];
  /**
   * true — в группе больше вхождений, чем сохранено id: список обрезан
   * лимитом сканера. `count` в этом случае больше `nodeIds.length`, и
   * «Применить в макет» физически не сможет затронуть всю группу.
   */
  nodeIdsTruncated?: boolean;
  /**
   * Значения переменной макета по ВСЕМ режимам её коллекции (например,
   * Day/Night) — заполняется только для bindingType === "variable", когда
   * удалось резолвить значение через Plugin API. Позволяет показать в
   * таблице оба значения (day/night) для наглядного сравнения с
   * библиотекой по каждому режиму. Пусто для hardcoded/style/ghost и для
   * переменных, которые не удалось резолвить.
   */
  modeValues?: LayoutRecordModeValue[];
  /**
   * Typography-only: не удалось полностью резолвить fontSize/fontName (figma.mixed).
   * Детальная статус-модель — Phase 2; Phase 1 только сохраняет флаг и не падает.
   */
  typographyUnresolved?: boolean;
  /**
   * Typography-only: текст внутри instance и/или override свойств поверх linked Text Style.
   */
  isOverride?: boolean;
  /**
   * Typography-only: не удалось сопоставить TEXT-ноду в instance с main component
   * (reorder/swap) — isOverride остаётся false, флаг только для диагностики.
   */
  structuralDriftDetected?: boolean;
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
  /** Typography — style node id библиотеки (пусто для color-only target). */
  styleId?: string;
  /** Typography — стабильный key опубликованного Text Style. */
  styleKey?: string;
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
  decisionTargetStyleId?: string;
  decisionTimestamp?: string;
  /** value_fix_proposed — режим библиотеки, который предлагается поправить. */
  decisionProposedModeId?: string;
  decisionProposedModeName?: string;
  /** value_fix_proposed — текущее значение библиотеки в этом режиме (контекст). */
  decisionCurrentLibraryValue?: string;
  /** value_fix_proposed — предлагаемое новое значение (hex). */
  decisionProposedValue?: string;
  /** Typography — несовпадающие свойства (fontSize первым при наличии). */
  mismatchedProperties?: string[];
  /** Typography — fontWeight на стороне макета через эвристику. */
  fontWeightApproximate?: boolean;
  /** Typography apply-to-layout — decision применена не ко всем occurrences. */
  applyPartial?: boolean;
  /** Typography apply-to-layout — пропущенные ноды с причиной (из mappingHistory). */
  applySkips?: Array<{ nodeId: string; reason: string }>;
}

/** Общий интерфейс comparator-модуля категории. */
export interface ITokenComparator<TScope = unknown, TLibrary = LibraryToken> {
  category: string;
  scanLayout(scope: TScope): Promise<LayoutRecord[]>;
  compareWithLibrary(
    records: LayoutRecord[],
    library: TLibrary[],
    history: Record<string, StoredDecision>
  ): ComparisonResult[];
}

/** Хранимое в clientStorage подтверждённое решение по группе записей. */
export interface StoredDecision {
  decision: Decision;
  /** Категория comparator-модуля — для фильтрации pending при переключении UI. */
  category?: TokenCategory;
  targetVariableId?: string;
  /** Typography — style node id целевого Text Style библиотеки. */
  targetStyleId?: string;
  /** Typography — human-readable имя целевого Text Style. */
  targetStyleName?: string;
  targetName?: string;
  /** Typography — несовпадающие свойства на момент Apply (для propose payload). */
  mismatchedProperties?: string[];
  /** Typography — nodeIds, к которым apply-to-layout уже применён (частичный batch). */
  appliedNodeIds?: string[];
  /** Typography — причины пропуска по nodeId при частичном apply. */
  applySkips?: Array<{ nodeId: string; reason: string }>;
  /** Typography — decision применена не ко всем occurrences. */
  applyPartial?: boolean;
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

  // ---------------------------------------------------------------------
  // Transient review-projection metadata — снимок ComparisonResult /
  // ComparisonTarget НА МОМЕНТ Apply, нужен ИСКЛЮЧИТЕЛЬНО для человекочитаемого
  // GitHub PR body (см. server/api/_lib/pullRequestBody.ts).
  //
  // ВАЖНО: эти поля НЕ являются частью реестра решений. Они не должны
  // попадать в RegistryFileEntry / decisions-registry.json — единственный
  // machine/audit source of truth. См. skills/_shared/github-sync-architecture.md,
  // раздел "Transient review metadata vs registry data".
  // ---------------------------------------------------------------------
  /** LayoutRecord.property на момент Apply (fill/stroke/text-fill). */
  sourceProperty?: string;
  /** LayoutRecord.bindingType на момент Apply (variable/style/hardcoded/ghost). */
  sourceBindingType?: string;
  /** LayoutRecord.sourceName на момент Apply — имя переменной/стиля источника. */
  sourceName?: string;
  /** LayoutRecord.displayValue на момент Apply — отображаемое значение источника (hex/alpha). */
  sourceDisplayValue?: string;
  /** LayoutRecord.representativeNodePath на момент Apply — breadcrumb от страницы. */
  nodePath?: string;
  /** LayoutRecord.representativeNodeName на момент Apply. */
  nodeName?: string;
  /** LayoutRecord.nodeIds на момент Apply — для навигации к слою в макете из UI. */
  nodeIds?: string[];
  /** LayoutRecord.count на момент Apply — сколько слоёв затронуто группой. */
  occurrenceCount?: number;
  /** ComparisonTarget.modeName на момент Apply (для mapped/mapped_suggested). */
  targetModeName?: string;
  /** ComparisonTarget.displayValue на момент Apply — отображаемое значение целевого токена (hex/alpha). */
  targetDisplayValue?: string;
}

/** Скоуп сканирования, выбираемый пользователем в UI. */
export type ScanScope = "file" | "page" | "selection";
