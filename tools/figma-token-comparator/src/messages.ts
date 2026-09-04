/**
 * Типизированный протокол сообщений между главным потоком плагина
 * (code.ts) и UI-iframe (ui.ts), передаваемых через figma.ui.postMessage /
 * window.onmessage.
 */

import type { ComparisonResult, Decision, LibraryToken, ScanScope } from "./comparators/types";

export interface UiReadyMessage {
  type: "ui-ready";
}

export interface SaveSettingsMessage {
  type: "save-settings";
  payload: { token: string; libraryInput: string };
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

export interface LoadLibraryMessage {
  type: "load-library";
  payload: { libraryInput: string; token: string };
}

export interface ScanMessage {
  type: "scan";
  payload: { scope: ScanScope };
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
    comment?: string;
    targetVariableId?: string;
    targetName?: string;
    targetCollectionName?: string;
    proposedModeId?: string;
    proposedModeName?: string;
    currentLibraryValue?: string;
    proposedValue?: string;
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
 */
export interface BuildPreviewMessage {
  type: "build-preview";
  recordId: string;
  variableId?: string;
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

export type UiToCodeMessage =
  | UiReadyMessage
  | SaveSettingsMessage
  | SaveGitHubSettingsMessage
  | LoadRegistryMessage
  | InitEmptyRegistryMessage
  | LoadLibraryMessage
  | ScanMessage
  | SelectNodesMessage
  | ApplyDecisionMessage
  | ClearDecisionMessage
  | ResizeWindowMessage
  | ResizeWindowEndMessage
  | PrintToFigmaMessage
  | BuildPreviewMessage
  | ApplyToLayoutMessage;

export interface InitStateMessage {
  type: "init-state";
  payload: {
    hasToken: boolean;
    /** Имя Figma-файла библиотеки для отображения в поле настроек. */
    libraryFileName: string | null;
    libraryCache: { count: number; fetchedAt: string } | null;
    hasGitHubToken: boolean;
    githubRepo: string | null;
    githubRegistryPath: string | null;
    registryCache: { registryVersion: number; entryCount: number; fetchedAt: string; localOnly: boolean } | null;
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
  payload: { libraryFileName: string };
}

export interface LibraryLoadingMessage {
  type: "library-loading";
}

export interface LibraryLoadedMessage {
  type: "library-loaded";
  payload: { tokens: LibraryToken[]; fetchedAt: string; fileName: string };
}

export interface ScanProgressMessage {
  type: "scan-progress";
  payload: { message: string };
}

export interface ScanResultsMessage {
  type: "scan-results";
  payload: {
    results: ComparisonResult[];
    libraryTokens: LibraryToken[];
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
  skipped: Array<{ nodeId: string; reason: string }>;
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
  | LibraryLoadedMessage
  | ScanProgressMessage
  | ScanResultsMessage
  | DecisionAppliedMessage
  | ErrorMessage
  | PrintProgressMessage
  | PrintSuccessMessage
  | PrintErrorMessage
  | PreviewReadyMessage
  | PreviewErrorMessage
  | ApplyToLayoutResultMessage;
