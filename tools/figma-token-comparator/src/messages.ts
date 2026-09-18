/**
 * Типизированный протокол сообщений между главным потоком плагина
 * (code.ts) и UI-iframe (ui.ts), передаваемых через figma.ui.postMessage /
 * window.onmessage.
 */

import type {
  ComparisonResult,
  Decision,
  LibraryTextStyle,
  LibraryToken,
  ScanScope,
  TokenCategory,
} from "./comparators/types";
import type { LibraryMeta } from "./lib/storage";
import type { ProposalStatusInfo } from "./lib/proposalLifecycle";

export interface UiReadyMessage {
  type: "ui-ready";
}

export interface SaveSettingsMessage {
  type: "save-settings";
  payload: { token: string; registrySecret: string };
}

export interface SaveGitHubSettingsMessage {
  type: "save-github-settings";
  payload: { token: string; repo: string; registryPath: string };
}

export interface LoadRegistryMessage {
  type: "load-registry";
  payload: { token: string; repo: string; registryPath: string };
}

export interface InitEmptyRegistryMessage {
  type: "init-empty-registry";
  payload: { repo: string; registryPath: string };
}

/** Удалить библиотеку из списка вместе с её данными. Решения остаются в истории. */
export interface RemoveLibraryMessage {
  type: "remove-library";
  payload: { fileKey: string };
}

/** Открыть ссылку во внешнем браузере — только запросы на согласование на GitHub. */
export interface OpenExternalMessage {
  type: "open-external";
  payload: { url: string };
}

/** Выбрать библиотеку для сканирования (вкладка «Сканирование»). */
export interface SetActiveLibraryMessage {
  type: "set-active-library";
  payload: { fileKey: string };
}

/** Загрузить библиотеку: добавить в список или обновить уже загруженную. */
export interface LoadLibraryMessage {
  type: "load-library";
  payload: { libraryInput: string; token: string };
}

export interface ScanMessage {
  type: "scan";
  payload: {
    scope: ScanScope;
    /**
     * Категория сканирования. По умолчанию "colors" — текущий UI не передаёт
     * поле; Phase 3 добавит переключатель типографики.
     */
    category?: TokenCategory;
  };
}

export interface SelectNodesMessage {
  type: "select-nodes";
  payload: { nodeIds: string[] };
}

export interface ApplyDecisionMessage {
  type: "apply-decision";
  payload: {
    recordId: string;
    decision: Decision;
    category?: TokenCategory;
    comment?: string;
    targetVariableId?: string;
    targetStyleId?: string;
    targetStyleName?: string;
    mismatchedProperties?: string[];
    targetName?: string;
    targetCollectionName?: string;
    proposedModeId?: string;
    proposedModeName?: string;
    currentLibraryValue?: string;
    proposedValue?: string;
    // Transient review-projection metadata — снимок ComparisonResult /
    // ComparisonTarget на момент Apply, нужен только для человекочитаемого
    // GitHub PR body. НЕ является частью реестра решений (decisions-registry.json).
    sourceProperty?: string;
    sourceBindingType?: string;
    sourceName?: string;
    sourceDisplayValue?: string;
    nodePath?: string;
    nodeName?: string;
    /** LayoutRecord.nodeIds на момент Apply — для навигации к слою в макете из UI. */
    nodeIds?: string[];
    occurrenceCount?: number;
    targetModeName?: string;
    targetDisplayValue?: string;
  };
}

export interface ClearDecisionMessage {
  type: "clear-decision";
  payload: { recordId: string };
}

export interface ResizeWindowMessage {
  type: "resize-window";
  payload: { width: number; height: number };
}

export interface ResizeWindowEndMessage {
  type: "resize-window-end";
  payload: { width: number; height: number };
}

/**
 * Пункт "Напечатать" в меню кнопок экспорта — строит визуальную Figma-таблицу
 * на странице "Маппинг" из тех же (видимых/отфильтрованных) результатов, что
 * уже используются для CSV/JSON/MD экспорта. sourceFormat передаётся только
 * для контекста/логирования — состав и дизайн таблицы от него не зависят.
 */
export interface PrintToFigmaMessage {
  type: "print-to-figma";
  payload: {
    sourceFormat: "csv" | "json" | "md";
    results: ComparisonResult[];
  };
}

/**
 * Превью "Было / Будет" для строки со статусом Value match / Name match /
 * Conflict / Approximate match. Плоская форма сообщений (без payload) —
 * намеренное отличие от остального протокола, продиктованное постановкой
 * задачи; recordId/before/after лежат прямо на сообщении.
 *
 * `variableId` — необязательный явный target: используется, когда токен
 * выбран вручную через «Выбрать токен из AID» (combobox), но решение ещё
 * не сохранено через «Применить решение» — history в code.ts об этом
 * токене ничего не знает. Без `variableId` превью строится по
 * автоматически найденному `result.target` (или сохранённому mapped-
 * решению), как раньше.
 *
 * `styleId` — то же для типографики: стиль текста библиотеки (`nodeId`),
 * выбранный через «Выбрать стиль из AID» до сохранения решения.
 */
export interface BuildPreviewMessage {
  type: "build-preview";
  recordId: string;
  variableId?: string;
  styleId?: string;
}

/**
 * Применить в макет — единственное действие плагина, которое реально меняет
 * макет (привязывает переменную библиотеки к fill/stroke/text fill
 * затронутых нод). Отдельное, самостоятельное действие: не переиспользует
 * ApplyDecisionMessage и требует явного подтверждения в UI перед отправкой.
 * Плоская форма (без payload) — по аналогии с BuildPreviewMessage.
 */
export interface ApplyToLayoutMessage {
  type: "apply-to-layout";
  recordId: string;
}

export interface ToggleAdminModeMessage {
  type: "toggle-admin-mode";
}

/**
 * UI запрашивает у code.ts свежий список ещё не отправленных решений перед
 * показом подтверждающей модалки — единственное место, где backend/history
 * читаются как source of truth для этого списка (не currentResults в UI,
 * который может быть устаревшим относительно clientStorage).
 */
export interface RequestProposePreviewMessage {
  type: "request-propose-preview";
  payload?: { category?: TokenCategory };
}

/**
 * Отправить на согласование — теперь только выбранные в модалке подтверждения
 * решения (пользователь мог снять чекбоксы у части строк), а не всегда весь
 * pending-набор.
 */
export interface ProposeDecisionsMessage {
  type: "propose-decisions";
  payload: { recordIds: string[] };
}

/** Удалить pending-записи mappingHistory для категории (при переключении сканирования). */
export interface ClearPendingProposalsMessage {
  type: "clear-pending-proposals";
  payload: { category: TokenCategory };
}

export type UiToCodeMessage =
  | UiReadyMessage
  | SaveSettingsMessage
  | SaveGitHubSettingsMessage
  | LoadRegistryMessage
  | InitEmptyRegistryMessage
  | LoadLibraryMessage
  | RemoveLibraryMessage
  | SetActiveLibraryMessage
  | OpenExternalMessage
  | ScanMessage
  | SelectNodesMessage
  | ApplyDecisionMessage
  | ClearDecisionMessage
  | ResizeWindowMessage
  | ResizeWindowEndMessage
  | PrintToFigmaMessage
  | BuildPreviewMessage
  | ApplyToLayoutMessage
  | ToggleAdminModeMessage
  | RequestProposePreviewMessage
  | ProposeDecisionsMessage
  | ClearPendingProposalsMessage;

export interface InitStateMessage {
  type: "init-state";
  payload: {
    hasToken: boolean;
    hasRegistrySecret: boolean;
    libraries: LibraryMeta[];
    activeLibraryKey: string | null;
    tokens: LibraryToken[];
    textStyles: LibraryTextStyle[];
    /** Стили текста текущей библиотеки загружены. */
    textStylesAvailable: boolean;
    hasGitHubToken: boolean;
    githubRepo: string | null;
    githubRegistryPath: string | null;
    registryCache: { registryVersion: number; entryCount: number; fetchedAt: string; localOnly: boolean } | null;
    adminMode: boolean;
    pendingProposeCount: number;
    pendingProposeCountByCategory: Record<TokenCategory, number>;
  };
}

export interface GitHubSettingsSavedMessage {
  type: "github-settings-saved";
  payload: { repo: string; registryPath: string };
}

export interface RegistryLoadingMessage {
  type: "registry-loading";
}

export interface RegistryLoadedMessage {
  type: "registry-loaded";
  payload: {
    registryVersion: number;
    entryCount: number;
    updatedAt: string;
    fetchedAt: string;
    localOnly: boolean;
  };
}

export interface RegistryNotFoundMessage {
  type: "registry-not-found";
  payload: { repo: string; registryPath: string };
}

export interface RegistryInitializedMessage {
  type: "registry-initialized";
  payload: { registryVersion: number; entryCount: number; updatedAt: string };
}

export interface SettingsSavedMessage {
  type: "settings-saved";
  payload: Record<string, never>;
}

export interface LibraryLoadingMessage {
  type: "library-loading";
}

/** Статусы отправленных решений: на согласовании или отклонено. Ключ — подпись строки. */
export interface ProposalStatusesMessage {
  type: "proposal-statuses";
  payload: { statuses: Record<string, ProposalStatusInfo> };
}

/**
 * Список библиотек изменился: загрузили, обновили, удалили или выбрали другую.
 * `tokens` / `textStyles` — данные текущей библиотеки для списков выбора.
 */
export interface LibrariesChangedMessage {
  type: "libraries-changed";
  payload: {
    libraries: LibraryMeta[];
    activeLibraryKey: string | null;
    tokens: LibraryToken[];
    textStyles: LibraryTextStyle[];
    /** Стили текста текущей библиотеки загружены — можно сканировать типографику. */
    textStylesAvailable: boolean;
    textStylesError?: string;
    /** Имя только что загруженной библиотеки — для строки статуса. */
    loadedFileName?: string;
  };
}

export interface ScanProgressMessage {
  type: "scan-progress";
  payload: { message: string };
}

export interface ScanResultsMessage {
  type: "scan-results";
  payload: {
    category: TokenCategory;
    results: ComparisonResult[];
    libraryTokens: LibraryToken[];
    libraryTextStyles: LibraryTextStyle[];
    /** Сколько групп скрыто, потому что их закрыло согласованное решение из реестра. */
    resolvedByTeam?: number;
  };
}

export interface DecisionAppliedMessage {
  type: "decision-applied";
  payload: { recordId: string; result: ComparisonResult };
}

export interface ErrorMessage {
  type: "error";
  payload: { message: string };
}

export interface PrintProgressMessage {
  type: "print-progress";
  payload: {
    message: string;
    /** 0–100 — известная доля выполненной работы (построение строк). Отсутствует, пока доля неизвестна (индетерминированный лоадер в UI). */
    percent?: number;
  };
}

export interface PrintSuccessMessage {
  type: "print-success";
  payload: {
    pageName: string;
    /** Сколько строк реально попало в Figma-таблицу (может быть меньше totalRows при truncated). */
    rowCount: number;
    /** Сколько строк было в исходной (видимой/отфильтрованной) выборке. */
    totalRows: number;
    /** true, если выборка превысила лимит печатаемых строк и была обрезана — CSV/JSON/MD не затронуты. */
    truncated: boolean;
  };
}

export interface PrintErrorMessage {
  type: "print-error";
  payload: { message: string };
}

/** Одна пара "Было/Будет" для конкретного режима (Day/Night, Light/Dark и т.п.). */
export interface PreviewModeResult {
  modeName: string;
  /** data:image/png;base64,... — снимок клона с текущим значением макета для этого режима. */
  before: string;
  /** data:image/png;base64,... — снимок клона с предлагаемым значением библиотеки для этого режима. */
  after: string;
}

/**
 * Ответ на build-preview — успех. Плоская форма, см. BuildPreviewMessage.
 * По одной паре "Было/Будет" на каждый режим, общий для макета и библиотеки.
 */
export interface PreviewReadyMessage {
  type: "preview-ready";
  recordId: string;
  modes: PreviewModeResult[];
}

/** Ответ на build-preview — ошибка (лимит размера, неподдерживаемый тип ноды и т.п.). */
export interface PreviewErrorMessage {
  type: "preview-error";
  recordId: string;
  message: string;
}

/**
 * Ответ на apply-to-layout — итог применения переменной к нодам группы.
 * Плоская форма, см. ApplyToLayoutMessage. applied — сколько нод обработано
 * успешно; skipped — нода не найдена / несовместимый paint / ошибка API, с
 * причиной для каждой. Частичный успех — нормальный исход, не ошибка.
 */
export interface ApplyToLayoutResultMessage {
  type: "apply-to-layout-result";
  recordId: string;
  applied: number;
  /** Сколько слоёв вообще пытались изменить — размер списка id группы. */
  attempted: number;
  /** Сколько вхождений в группе всего: больше attempted, если список обрезан лимитом. */
  occurrences: number;
  skipped: Array<{ nodeId: string; reason: string }>;
  /** true — часть occurrences применена, часть осталась pending (typography batch). */
  partial?: boolean;
  appliedNodeIds?: string[];
}

export interface AdminModeChangedMessage {
  type: "admin-mode-changed";
  payload: { enabled: boolean };
}

export interface PendingProposeCountMessage {
  type: "pending-propose-count";
  payload: {
    count: number;
    byCategory: Record<TokenCategory, number>;
  };
}

/**
 * Одна строка в подтверждающей модалке "Отправить решения на согласование".
 * Строится code.ts из StoredDecision (mappingHistory) — тех же данных, что
 * пойдут в ProposeDecisionEntryPayload на backend. Это read-only проекция
 * для показа пользователю, не отдельный источник истины.
 */
export interface ProposePreviewEntry {
  recordId: string;
  decision: Decision;
  category?: TokenCategory;
  comment?: string;
  nodeName?: string;
  nodePath?: string;
  /** LayoutRecord.nodeIds на момент Apply — для перехода к слою из модалки подтверждения. */
  nodeIds?: string[];
  sourceProperty?: string;
  sourceDisplayValue?: string;
  occurrenceCount?: number;
  targetVariableName?: string;
  targetStyleId?: string;
  targetStyleName?: string;
  mismatchedProperties?: string[];
  targetCollectionName?: string;
  targetModeName?: string;
  targetDisplayValue?: string;
  proposedModeName?: string;
  currentLibraryValue?: string;
  proposedValue?: string;
}

export interface ProposePreviewMessage {
  type: "propose-preview";
  payload: { entries: ProposePreviewEntry[] };
}

export interface DecisionsSubmittedMessage {
  type: "decisions-submitted";
  payload: {
    count: number;
    /** true — новый pull request не создавался: предлагать было нечего. */
    unchanged: boolean;
    /** Почему именно: уже в реестре или уже ждут согласования. */
    reason?: "already_in_registry" | "already_proposed";
  };
}

export interface DecisionsSubmitFailedMessage {
  type: "decisions-submit-failed";
}

export interface RegistryUnavailableMessage {
  type: "registry-unavailable";
}

export type CodeToUiMessage =
  | InitStateMessage
  | SettingsSavedMessage
  | GitHubSettingsSavedMessage
  | RegistryLoadingMessage
  | RegistryLoadedMessage
  | RegistryNotFoundMessage
  | RegistryInitializedMessage
  | LibraryLoadingMessage
  | LibrariesChangedMessage
  | ProposalStatusesMessage
  | ScanProgressMessage
  | ScanResultsMessage
  | DecisionAppliedMessage
  | ErrorMessage
  | PrintProgressMessage
  | PrintSuccessMessage
  | PrintErrorMessage
  | PreviewReadyMessage
  | PreviewErrorMessage
  | ApplyToLayoutResultMessage
  | AdminModeChangedMessage
  | PendingProposeCountMessage
  | ProposePreviewMessage
  | DecisionsSubmittedMessage
  | DecisionsSubmitFailedMessage
  | RegistryUnavailableMessage;
