/**
 * Логика UI плагина (работает внутри iframe, без доступа к Plugin API).
 * Общение с главным потоком — только через postMessage / window.onmessage
 * по типизированному протоколу из src/messages.ts.
 */

import type {
  ComparisonResult,
  Decision,
  LibraryIconSummary,
  LibraryTextStyle,
  LibraryToken,
  ScanScope,
  TokenCategory,
  TypographyComparisonValue,
} from "./comparators/types";
import { filterSemanticTypographyStyles } from "./lib/semanticTypographyLibrary";
import { formatTypographyDisplayValue, readTypographyComparisonValue } from "./lib/typographyUtils";
import { isValidHex, normalizeHex } from "./lib/colorUtils";
import { findLayoutValueForTargetMode, sortModesStable } from "./lib/modePairing";
import { filterSemanticColorTokens } from "./lib/semanticColorLibrary";
import {
  findLibraryTextStyleByLabel,
  findLibraryTokenByLabel,
  formatLibraryTextStyleLabel,
  formatLibraryTokenLabel,
} from "./lib/libraryLabels";
import { getResultStatusFilterKey, type StatusFilterKey } from "./lib/statusKeys";
import { getStatusMeta, type BadgeTone, type StatusMeta } from "./lib/statusMeta";
import { canShowPreview } from "./lib/previewEligibility";
import { parseCssColor, pickPreviewBackdrop, type CheckerColors } from "./lib/previewBackdrop";
import { buildExportRows, toCSV, toJSON, toMarkdown, type ExportRow } from "./lib/exporter";
import type { CodeToUiMessage, ProposePreviewEntry, UiToCodeMessage } from "./messages";
import { clampWindowSize } from "./lib/windowSize";
import { CHANGELOG, getChangelogEntryState, type ChangelogEntry } from "./lib/changelog";
import type { LibraryMeta } from "./lib/storage";
import type { ProposalStatusInfo } from "./lib/proposalLifecycle";
import type { IconOutline } from "./lib/iconShape";
import { version as PLUGIN_VERSION } from "../package.json";

function post(message: UiToCodeMessage): void {
  parent.postMessage({ pluginMessage: message }, "*");
}

function $<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`UI element #${id} not found`);
  return el as T;
}

// ---------------------------------------------------------------------------
// Состояние UI
// ---------------------------------------------------------------------------

let activeCategory: TokenCategory = "colors";
/** Статусы отправленных решений по подписи строки: на согласовании или отклонено. */
let proposalStatuses: Record<string, ProposalStatusInfo> = {};

/** Иконки текущей библиотеки (v1.5.0) — для списка выбора и превью. */
let currentLibraryIcons: LibraryIconSummary[] = [];
let iconsLibraryAvailable = false;

/** Загруженные библиотеки (вкладка «Настройки») и выбранная для сканирования. */
let loadedLibraries: LibraryMeta[] = [];
let activeLibraryKey: string | null = null;

const resultsByCategory: Record<TokenCategory, ComparisonResult[]> = {
  colors: [],
  typography: [],
  icons: [],
};
let currentResults: ComparisonResult[] = [];
/**
 * Категории, по которым в текущей библиотеке уже было сканирование. Пустая
 * таблица до сканирования — «ещё не сканировали», а не «расхождений нет».
 */
const scannedCategories = new Set<TokenCategory>();
const NOT_SCANNED_TEXT = "Сканирования ещё не было — запустите его на вкладке «Сканирование».";
let currentLibraryTokens: LibraryToken[] = [];
let currentLibraryTextStyles: LibraryTextStyle[] = [];
let selectedRecordId: string | null = null;
let adminModeEnabled = false;
let pendingProposeCount = 0;
let pendingProposeCountByCategory: Record<TokenCategory, number> = {
  colors: 0,
  typography: 0,
  icons: 0,
};
let typographyLibraryAvailable = false;
let typographyLibraryError: string | null = null;

const PROD_REGISTRY_LOADING = "Загрузка реестра решений...";
const PROD_REGISTRY_READY = "Реестр решений готов.";
const PROD_REGISTRY_EMPTY = "Реестр решений пуст — можно начинать работу.";
const PROD_REGISTRY_UNAVAILABLE = "Не удалось загрузить реестр решений. Попробуйте позже.";
const PROPOSE_SUCCESS = "Отправлено — ждёт согласования Principal Designer.";
const PROPOSE_ALREADY_IN_REGISTRY = "Эти решения уже записаны в реестре — отправлять было нечего.";
const PROPOSE_ALREADY_PROPOSED = "Эти решения уже отправлены и ждут согласования.";
const PROPOSE_FAILURE = "Не удалось отправить. Попробуйте ещё раз.";

/**
 * Единственная формулировка про недоступные стили текста: используется и в
 * подсказке переключателя категории, и в предупреждении, и при попытке скана.
 */
const TEXT_STYLES_UNAVAILABLE =
  "Стили текста недоступны. Перезагрузите библиотеку токеном, у которого есть доступ к содержимому файла и библиотек.";

function textStylesUnavailableMessage(error: string | null): string {
  return error ? `Стили текста недоступны: ${error}` : TEXT_STYLES_UNAVAILABLE;
}

interface RowControls {
  select: HTMLSelectElement;
  mappedExtra: HTMLElement;
  commentExtra: HTMLElement;
  valueFixExtra: HTMLElement;
}

const rowControls = new Map<string, RowControls>();

/** Подсказка бейджа: английский термин плюс объяснение. */
function statusTooltip(meta: StatusMeta): string {
  return `${meta.term} — ${meta.hint}`;
}

/** Тексты статуса для активной категории — у типографики свои (lib/statusMeta.ts). */
function statusMetaForKey(key: StatusFilterKey): StatusMeta {
  return getStatusMeta(key, activeCategory);
}

function statusFilterKeyLabel(key: StatusFilterKey): string {
  return statusMetaForKey(key).label;
}

/** Классы бейджа для тональности. Форма и цвет не задаются больше нигде. */
function badgeClassName(tone: BadgeTone, secondary = false): string {
  return `ds-badge ds-badge--${tone}${secondary ? " ds-badge--secondary" : ""}`;
}

let activeStatusFilters = new Set<StatusFilterKey>();

function getStatusKeysInResults(results: ComparisonResult[]): StatusFilterKey[] {
  const keys = new Set(results.map(getResultStatusFilterKey));
  return Array.from(keys).sort((a, b) => statusFilterKeyLabel(a).localeCompare(statusFilterKeyLabel(b), "ru"));
}

function syncStatusFiltersFromResults(results: ComparisonResult[], reset: boolean): void {
  const keysInData = getStatusKeysInResults(results);
  if (reset || activeStatusFilters.size === 0) {
    activeStatusFilters = new Set(keysInData);
    return;
  }
  activeStatusFilters = new Set(Array.from(activeStatusFilters).filter((key) => keysInData.includes(key)));
  if (activeStatusFilters.size === 0 && keysInData.length > 0) {
    activeStatusFilters = new Set(keysInData);
  }
}

function getFilteredResults(): ComparisonResult[] {
  if (activeStatusFilters.size === 0) return [];
  return currentResults.filter((result) => activeStatusFilters.has(getResultStatusFilterKey(result)));
}

function isStatusFilterPartial(): boolean {
  const keysInData = getStatusKeysInResults(currentResults);
  return keysInData.length > 0 && activeStatusFilters.size < keysInData.length;
}

/**
 * У каждой таблицы свой набор элементов фильтра, но одновременно видна только
 * одна — поэтому функции работают с контролами активной категории.
 */
const STATUS_FILTER_IDS: Record<TokenCategory, { btn: string; menu: string; indicator: string }> = {
  colors: {
    btn: "tc-status-filter-btn",
    menu: "tc-status-filter-menu",
    indicator: "tc-status-filter-indicator",
  },
  typography: {
    btn: "tc-status-filter-btn-typography",
    menu: "tc-status-filter-menu-typography",
    indicator: "tc-status-filter-indicator-typography",
  },
  icons: {
    btn: "tc-status-filter-btn-icons",
    menu: "tc-status-filter-menu-icons",
    indicator: "tc-status-filter-indicator-icons",
  },
};

function statusFilterEls(category: TokenCategory = activeCategory) {
  const ids = STATUS_FILTER_IDS[category];
  return {
    btn: $<HTMLButtonElement>(ids.btn),
    menu: $<HTMLElement>(ids.menu),
    indicator: $<HTMLElement>(ids.indicator),
  };
}

function updateStatusFilterIndicator(): void {
  statusFilterEls().indicator.hidden = !isStatusFilterPartial();
}

function closeStatusFilterMenu(): void {
  for (const category of ["colors", "typography", "icons"] as const) {
    const { btn, menu } = statusFilterEls(category);
    btn.setAttribute("aria-expanded", "false");
    menu.hidden = true;
  }
}

function openStatusFilterMenu(): void {
  renderStatusFilterMenu();
  const { btn, menu } = statusFilterEls();
  btn.setAttribute("aria-expanded", "true");
  menu.hidden = false;
}

function toggleStatusFilterMenu(): void {
  const { menu } = statusFilterEls();
  if (menu.hidden) openStatusFilterMenu();
  else closeStatusFilterMenu();
}

function applyStatusFilterChange(): void {
  updateStatusFilterIndicator();
  renderResultsTable(selectedRecordId ?? undefined);
}

function renderStatusFilterMenu(): void {
  const { menu } = statusFilterEls();
  const keysInData = getStatusKeysInResults(currentResults);

  if (keysInData.length === 0) {
    menu.innerHTML = `<div class="ds-filter-menu__empty">Нет данных — запустите сканирование.</div>`;
    return;
  }

  menu.innerHTML = `
    <div class="ds-filter-menu__actions">
      <button type="button" class="ds-filter-menu__link" data-action="select-all">Все</button>
      <button type="button" class="ds-filter-menu__link" data-action="clear-all">Снять все</button>
    </div>
    <div class="ds-filter-menu__list">
      ${keysInData
        .map(
          (key) => `
        <label class="ds-filter-menu__item">
          <input type="checkbox" value="${escapeHtml(key)}" ${activeStatusFilters.has(key) ? "checked" : ""} />
          <span class="${badgeClassName(statusMetaForKey(key).tone)}" title="${escapeHtml(statusTooltip(statusMetaForKey(key)))}">${escapeHtml(statusFilterKeyLabel(key))}</span>
        </label>`
        )
        .join("")}
    </div>
  `;

  menu.querySelector<HTMLButtonElement>('[data-action="select-all"]')?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    activeStatusFilters = new Set(keysInData);
    renderStatusFilterMenu();
    applyStatusFilterChange();
  });

  menu.querySelector<HTMLButtonElement>('[data-action="clear-all"]')?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    activeStatusFilters = new Set();
    renderStatusFilterMenu();
    applyStatusFilterChange();
  });

  menu.querySelectorAll<HTMLInputElement>('.ds-filter-menu__item input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const key = checkbox.value as StatusFilterKey;
      if (checkbox.checked) activeStatusFilters.add(key);
      else activeStatusFilters.delete(key);
      applyStatusFilterChange();
    });
  });
}

function initStatusFilterMenu(): void {
  for (const category of ["colors", "typography", "icons"] as const) {
    const { btn, menu } = statusFilterEls(category);

    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleStatusFilterMenu();
    });

    document.addEventListener("click", (event) => {
      if (menu.hidden) return;
      const target = event.target as Node;
      if (!menu.contains(target) && !btn.contains(target)) closeStatusFilterMenu();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeStatusFilterMenu();
  });
}

function statusMetaOf(result: ComparisonResult): StatusMeta {
  return getStatusMeta(getResultStatusFilterKey(result), result.category ?? activeCategory);
}

function statusLabel(result: ComparisonResult): string {
  const meta = statusMetaOf(result);
  if (result.status === "approximate" && result.deltaE !== undefined) {
    return `${meta.label} (ΔE ${result.deltaE.toFixed(1)})`;
  }
  return meta.label;
}

/** Бейдж статуса строки — используется и таблицей цветов, и таблицей типографики. */
function createStatusBadge(result: ComparisonResult): HTMLSpanElement {
  const badge = document.createElement("span");
  if (result.decision === "value_fix_proposed") {
    const mode = result.decisionProposedModeName;
    badge.className = badgeClassName("info");
    badge.textContent = mode ? `Правка предложена · ${mode}` : "Правка предложена";
    badge.title = `Value fix proposed — для токена библиотеки предложена ручная правка значения. Статус до решения: ${statusLabel(
      result
    )}.`;
    return badge;
  }
  const meta = statusMetaOf(result);
  badge.className = badgeClassName(meta.tone);
  badge.textContent = statusLabel(result);
  badge.title = statusTooltip(meta);
  return badge;
}

/** Второй бейдж в ячейке статуса: пометка, а не самостоятельный статус. */
function createSecondaryBadge(label: string, tone: BadgeTone, title: string): HTMLSpanElement {
  const badge = document.createElement("span");
  badge.className = badgeClassName(tone, true);
  badge.textContent = label;
  badge.title = title;
  return badge;
}

const DECISION_LABELS: Record<Decision, string> = {
  mapped_suggested: "выбран предложенный токен",
  mapped: "выбран токен из библиотеки",
  ignored: "расхождение оставлено осознанно",
  candidate: "кандидат на новый токен",
  value_fix_proposed: "предложена правка значения в библиотеке",
};

/** Отметка «решение принято» справа от бейджа статуса. */
function createDecisionCheck(decision: Decision): HTMLSpanElement {
  const check = document.createElement("span");
  check.className = "ds-decision-check";
  check.textContent = " ✓";
  check.title = `Решение принято: ${DECISION_LABELS[decision]}`;
  return check;
}

/**
 * Пометка жизненного цикла отправленного решения. Это кнопка: по клику
 * открывается запрос на согласование на GitHub.
 */
function createProposalStatusBadge(status: ProposalStatusInfo): HTMLButtonElement {
  const isOpen = status.state === "open";
  const badge = document.createElement("button");
  badge.type = "button";
  badge.className = `${badgeClassName(isOpen ? "info" : "warning", true)} ds-badge--action`;
  badge.textContent = `${isOpen ? "На согласовании" : "Отклонено"} · #${status.number}`;
  badge.title = isOpen
    ? `Решение ждёт согласования в запросе #${status.number}. Нажмите, чтобы открыть запрос.`
    : `Запрос #${status.number} закрыт без согласования${
        status.comment ? `: «${status.comment}»` : ""
      }. Пересмотрите решение и отправьте снова. Нажмите, чтобы открыть запрос.`;
  badge.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    post({ type: "open-external", payload: { url: status.url } });
  });
  return badge;
}

/** Пометка строки, решение по которой взято из реестра согласованных решений (lib/registryDecisions.ts). */
function createRegistryDecisionBadge(): HTMLSpanElement {
  return createSecondaryBadge(
    "Согласовано",
    "success",
    "Решение согласовано командой и взято из реестра дизайн-системы. Чтобы предложить другое — примите своё решение и отправьте его на согласование."
  );
}

const BINDING_LABELS: Record<string, string> = {
  variable: "Переменная",
  style: "Стиль",
  hardcoded: "Задано вручную",
  ghost: "Потерянный стиль",
};

function showError(message: string): void {
  const banner = $("tc-error-banner");
  banner.textContent = message;
  banner.classList.add("error");
  banner.hidden = false;
  window.clearTimeout((banner as unknown as { _timer?: number })._timer);
  (banner as unknown as { _timer?: number })._timer = window.setTimeout(() => {
    banner.classList.remove("error");
    banner.textContent = "";
    banner.hidden = true;
  }, 8000);
}

// ---------------------------------------------------------------------------
// Табы
// ---------------------------------------------------------------------------

function initTabs(): void {
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>(".ds-tab"));
  const panels = Array.from(document.querySelectorAll<HTMLElement>(".ds-panel"));
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.setAttribute("aria-selected", "false"));
      panels.forEach((p) => p.setAttribute("aria-hidden", "true"));
      tab.setAttribute("aria-selected", "true");
      const target = document.getElementById(`tc-panel-${tab.dataset.tab}`);
      target?.setAttribute("aria-hidden", "false");
    });
  });
}

function switchToTab(tabName: string): void {
  document.querySelector<HTMLButtonElement>(`.ds-tab[data-tab="${tabName}"]`)?.click();
}

// ---------------------------------------------------------------------------
// Подсказки — кружок с вопросом рядом с заголовком поля
// ---------------------------------------------------------------------------

/** Отступ всплывашки от края окна и от самой кнопки. */
const HINT_GAP = 6;
const HINT_VIEWPORT_MARGIN = 8;

let openHintTrigger: HTMLButtonElement | null = null;

function closeHint(): void {
  if (!openHintTrigger) return;
  openHintTrigger.setAttribute("aria-expanded", "false");
  openHintTrigger.removeAttribute("aria-describedby");
  openHintTrigger = null;
  $("tc-hint-popover").hidden = true;
}

/**
 * Ставит всплывашку под кнопкой, а если снизу не помещается — над ней.
 * Позиция считается в координатах окна (position: fixed): панель настроек
 * скроллится и обрезала бы абсолютно позиционированный элемент по overflow.
 */
function positionHintPopover(trigger: HTMLElement, popover: HTMLElement): void {
  const anchor = trigger.getBoundingClientRect();
  popover.style.left = "0px";
  popover.style.top = "0px";
  const box = popover.getBoundingClientRect();

  const maxLeft = window.innerWidth - box.width - HINT_VIEWPORT_MARGIN;
  const left = Math.max(HINT_VIEWPORT_MARGIN, Math.min(anchor.left, maxLeft));

  const below = anchor.bottom + HINT_GAP;
  const fitsBelow = below + box.height <= window.innerHeight - HINT_VIEWPORT_MARGIN;
  const top = fitsBelow
    ? below
    : Math.max(HINT_VIEWPORT_MARGIN, anchor.top - box.height - HINT_GAP);

  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
}

function openHint(trigger: HTMLButtonElement): void {
  const text = trigger.parentElement?.querySelector<HTMLElement>(".ds-hint-text");
  if (!text) return;

  const popover = $("tc-hint-popover");
  popover.textContent = text.textContent?.trim() ?? "";
  popover.hidden = false;
  positionHintPopover(trigger, popover);

  trigger.setAttribute("aria-expanded", "true");
  trigger.setAttribute("aria-describedby", "tc-hint-popover");
  openHintTrigger = trigger;
}

function initHints(): void {
  document.querySelectorAll<HTMLButtonElement>(".ds-hint-trigger").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const wasOpen = openHintTrigger === trigger;
      closeHint();
      if (!wasOpen) openHint(trigger);
    });
  });

  document.addEventListener("click", (event) => {
    if (!openHintTrigger) return;
    if (!$("tc-hint-popover").contains(event.target as Node)) closeHint();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeHint();
  });

  // Панель прокручивается вместе с кнопкой, а всплывашка позиционирована
  // относительно окна — вместо пересчёта на каждый кадр просто закрываем.
  document.addEventListener("scroll", closeHint, true);
  window.addEventListener("resize", closeHint);
}

// ---------------------------------------------------------------------------
// Гайд — аккордеон
// ---------------------------------------------------------------------------

/** Шеврон строки аккордеона гайда — тот же, что в разметке разделов ui.html. */
const GUIDE_CHEVRON_SVG = `<svg class="ds-guide-accordion__chevron" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function formatChangelogDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function renderChangelogEntry(entry: ChangelogEntry, isOpen: boolean): string {
  const state = getChangelogEntryState(entry, PLUGIN_VERSION);
  const slug = entry.version.replace(/\./g, "-");
  const badge =
    state === "current"
      ? `<span class="${badgeClassName("info")}">Ваша версия</span>`
      : state === "upcoming"
        ? `<span class="${badgeClassName("neutral")}">Готовится</span>`
        : "";
  const date = entry.date
    ? `<span class="ds-guide-changelog__date">${escapeHtml(formatChangelogDate(entry.date))}</span>`
    : "";
  const actions = entry.actions?.length
    ? `<div class="ds-guide-note"><strong>После обновления:</strong> ${entry.actions
        .map((action) => escapeHtml(action))
        .join(" ")}</div>`
    : "";
  const groups = entry.groups
    .map(
      (group) => `
        <h3>${escapeHtml(group.title)}</h3>
        <ul>${group.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    )
    .join("");

  return `
    <div class="ds-guide-accordion__item${isOpen ? " is-open" : ""}">
      <button
        type="button"
        class="ds-guide-accordion__trigger"
        aria-expanded="${isOpen}"
        aria-controls="tc-changelog-panel-${slug}"
      >
        <span class="ds-guide-changelog__head">
          <span>Версия ${escapeHtml(entry.version)}</span>
          ${date}
          ${badge}
        </span>
        ${GUIDE_CHEVRON_SVG}
      </button>
      <div class="ds-guide-accordion__panel" id="tc-changelog-panel-${slug}" role="region"${isOpen ? "" : " hidden"}>
        <p class="ds-guide-changelog__summary">${escapeHtml(entry.summary)}</p>
        ${actions}
        ${groups}
      </div>
    </div>`;
}

/** Блок «Что нового» в гайде: по версии на строку, своя версия раскрыта. */
function renderChangelog(): void {
  $("tc-changelog-current").textContent = `У вас установлена версия ${PLUGIN_VERSION}.`;
  $("tc-changelog-accordion").innerHTML = CHANGELOG.map((entry) =>
    renderChangelogEntry(entry, entry.version === PLUGIN_VERSION)
  ).join("");
}

function initGuideAccordion(): void {
  document.querySelectorAll<HTMLButtonElement>(".ds-guide-accordion .ds-guide-accordion__trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const item = trigger.closest(".ds-guide-accordion__item");
      const panelId = trigger.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!item || !panel) return;

      const willOpen = trigger.getAttribute("aria-expanded") !== "true";
      trigger.setAttribute("aria-expanded", String(willOpen));
      item.classList.toggle("is-open", willOpen);
      panel.hidden = !willOpen;
    });
  });
}

// ---------------------------------------------------------------------------
// Настройки
// ---------------------------------------------------------------------------

function initSettingsPanel(): void {
  const tokenInput = $<HTMLInputElement>("tc-token-input");
  const fileKeyInput = $<HTMLInputElement>("tc-filekey-input");
  const saveBtn = $<HTMLButtonElement>("tc-save-settings-btn");
  const loadBtn = $<HTMLButtonElement>("tc-load-library-btn");

  saveBtn.addEventListener("click", () => {
    post({
      type: "save-settings",
      payload: {
        token: tokenInput.value.trim(),
        registrySecret: $<HTMLInputElement>("tc-registry-secret-input").value,
      },
    });
  });

  $<HTMLButtonElement>("tc-add-library-btn").addEventListener("click", () => {
    setLibraryAddFormOpen($("tc-library-add").hidden === true);
  });

  $<HTMLButtonElement>("tc-cancel-library-btn").addEventListener("click", () => {
    setLibraryAddFormOpen(false);
  });

  loadBtn.addEventListener("click", () => {
    const libraryInput = fileKeyInput.value.trim();
    if (!libraryInput) {
      showError("Вставьте ссылку на файл библиотеки или её ключ.");
      return;
    }
    requestLibraryLoad(libraryInput);
  });

  fileKeyInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") loadBtn.click();
  });

  // Кнопки строк списка создаются заново при каждой отрисовке — слушаем на списке.
  $("tc-library-list").addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-file-key]");
    const fileKey = button?.dataset.fileKey;
    if (!button || !fileKey) return;
    if (button.dataset.action === "remove") {
      post({ type: "remove-library", payload: { fileKey } });
    } else if (button.dataset.action === "refresh") {
      button.disabled = true;
      requestLibraryLoad(fileKey);
    }
  });

  $<HTMLSelectElement>("tc-library-select").addEventListener("change", (event) => {
    const fileKey = (event.target as HTMLSelectElement).value;
    if (!fileKey || fileKey === activeLibraryKey) return;
    post({ type: "set-active-library", payload: { fileKey } });
  });
}

function requestLibraryLoad(libraryInput: string): void {
  $<HTMLButtonElement>("tc-load-library-btn").disabled = true;
  post({
    type: "load-library",
    payload: { libraryInput, token: $<HTMLInputElement>("tc-token-input").value.trim() },
  });
}

/** Форма добавления видна по кнопке «+», а пока библиотек нет — всегда. */
function setLibraryAddFormOpen(open: boolean): void {
  const shouldOpen = open || loadedLibraries.length === 0;
  $("tc-library-add").hidden = !shouldOpen;
  // Пока библиотек нет, форма открыта всегда — отменять нечего.
  $("tc-cancel-library-btn").hidden = loadedLibraries.length === 0;
  if (open) $<HTMLInputElement>("tc-filekey-input").focus();
}

const REFRESH_ICON_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M12.5 8a4.5 4.5 0 1 1-1.32-3.18M12.5 3.5v2.5H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const REMOVE_ICON_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/**
 * Подпись у библиотеки — только если что-то не загрузилось: иначе непонятно,
 * почему, например, недоступна типографика. Счётчики и дата не показываются.
 */
function libraryWarning(library: LibraryMeta): string | null {
  const failed = [
    library.colorCount === null ? "цвета" : null,
    library.textStyleCount === null ? "стили текста" : null,
    library.iconCount === null ? "иконки" : null,
  ].filter(Boolean);
  return failed.length > 0 ? `Не загрузились: ${failed.join(", ")}` : null;
}

function renderLibraryList(): void {
  $("tc-library-list").innerHTML = loadedLibraries
    .map((library) => {
      const name = escapeHtml(library.fileName);
      const fileKey = escapeHtml(library.fileKey);
      const warning = libraryWarning(library);
      return `
      <li class="tc-library-item">
        <div class="tc-library-item__info">
          <span class="tc-library-item__name" title="${name}">${name}</span>
          ${warning ? `<span class="ds-value-meta__caption ds-value-meta__caption--warning">${escapeHtml(warning)}</span>` : ""}
        </div>
        <button type="button" class="ds-icon-btn" data-action="refresh" data-file-key="${fileKey}" aria-label="Обновить библиотеку ${name}" title="Обновить">${REFRESH_ICON_SVG}</button>
        <button type="button" class="ds-icon-btn" data-action="remove" data-file-key="${fileKey}" aria-label="Удалить библиотеку ${name}" title="Удалить">${REMOVE_ICON_SVG}</button>
      </li>`;
    })
    .join("");
}

/** Выбор библиотеки на вкладке «Сканирование». */
function renderLibrarySelect(): void {
  const select = $<HTMLSelectElement>("tc-library-select");
  if (loadedLibraries.length === 0) {
    select.innerHTML = `<option value="">Сначала загрузите библиотеку в «Настройках»</option>`;
    select.disabled = true;
    return;
  }
  select.disabled = false;
  select.innerHTML = loadedLibraries
    .map(
      (library) =>
        `<option value="${escapeHtml(library.fileKey)}"${
          library.fileKey === activeLibraryKey ? " selected" : ""
        }>${escapeHtml(library.fileName)}</option>`
    )
    .join("");
}

/**
 * Результаты сканирования посчитаны против прежней библиотеки — после смены
 * библиотеки они неверны, поэтому сбрасываются.
 */
function resetResultsAfterLibraryChange(): void {
  const hadResults = resultsByCategory.colors.length > 0 || resultsByCategory.typography.length > 0;
  resultsByCategory.colors = [];
  resultsByCategory.typography = [];
  scannedCategories.clear();
  applyActiveCategoryView(true);
  if (hadResults) {
    $("tc-scan-status").textContent = "Библиотека изменена — запустите сканирование заново.";
  }
}

function applyLibrariesState(state: {
  libraries: LibraryMeta[];
  activeLibraryKey: string | null;
  tokens: LibraryToken[];
  textStyles: LibraryTextStyle[];
  textStylesAvailable: boolean;
  textStylesError?: string;
  icons?: LibraryIconSummary[];
  iconsAvailable?: boolean;
}): void {
  const activeChanged = state.activeLibraryKey !== activeLibraryKey;
  currentLibraryIcons = state.icons ?? [];
  iconsLibraryAvailable = state.iconsAvailable === true;
  loadedLibraries = state.libraries;
  activeLibraryKey = state.activeLibraryKey;
  currentLibraryTokens = state.tokens;
  currentLibraryTextStyles = state.textStyles;
  typographyLibraryAvailable = state.textStylesAvailable;
  typographyLibraryError = state.textStylesError ?? null;
  updateTypographyCategoryAvailability();
  updateIconsCategoryAvailability();
  renderLibraryList();
  renderLibrarySelect();
  setLibraryAddFormOpen(false);
  if (activeChanged) resetResultsAfterLibraryChange();
}

function renderLibraryStatus(text: string): void {
  $("tc-library-status").textContent = text;
}

function renderRegistryStatus(text: string): void {
  $("tc-registry-status").textContent = text;
}

function renderProdRegistryStatus(text: string): void {
  $<HTMLElement>("tc-prod-registry-status").textContent = text;
}

function applyAdminMode(adminMode: boolean): void {
  adminModeEnabled = adminMode;
  $<HTMLElement>("tc-admin-github-panel").hidden = !adminMode;
  $<HTMLElement>("tc-admin-badge").hidden = !adminMode;
}

/**
 * Подпись и доступность кнопки «Отправить решения» — всегда по счётчику
 * активной категории.
 *
 * Единственный источник этого состояния: раньше открытие и закрытие модалки
 * включали кнопку обратно по ОБЩЕМУ счётчику, и при нулевом счётчике активной
 * категории кнопка оказывалась активной с подписью «Отправить 0 решений»,
 * а клик по ней не делал ничего.
 */
function syncProposeButton(): void {
  const categoryPending = pendingProposeCountByCategory[activeCategory];
  const btn = $<HTMLButtonElement>("tc-propose-decisions-btn");
  btn.textContent = `Отправить ${categoryPending} ${pluralizeDecisions(categoryPending)} на согласование`;
  btn.disabled = categoryPending === 0;
}

function updateProposeButton(count: number, byCategory?: Record<TokenCategory, number>): void {
  if (byCategory) {
    pendingProposeCountByCategory = byCategory;
  }
  pendingProposeCount = count;
  syncProposeButton();
}

/** «1 слой», «2 слоя», «5 слоёв». */
function pluralizeLayers(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "слой";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "слоя";
  return "слоёв";
}

/** «1 расхождение», «2 расхождения», «5 расхождений». */
function pluralizeIssues(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "расхождение";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "расхождения";
  return "расхождений";
}

function pluralizeDecisions(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "решение";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "решения";
  return "решений";
}

/** Сообщение после отправки: успех или одна из двух причин «отправлять нечего». */
function proposeStatusText(payload: { unchanged: boolean; reason?: string }): string {
  if (!payload.unchanged) return PROPOSE_SUCCESS;
  return payload.reason === "already_proposed"
    ? PROPOSE_ALREADY_PROPOSED
    : PROPOSE_ALREADY_IN_REGISTRY;
}

function renderProposeStatus(text: string): void {
  $<HTMLElement>("tc-propose-status").textContent = text;
}

function applyProdRegistryLoaded(localOnly: boolean, entryCount: number): void {
  if (localOnly || entryCount === 0) {
    renderProdRegistryStatus(PROD_REGISTRY_EMPTY);
    return;
  }
  renderProdRegistryStatus(PROD_REGISTRY_READY);
}

const ADMIN_UNLOCK_CLICKS = 5;
const ADMIN_UNLOCK_WINDOW_MS = 2000;
let adminUnlockClickTimestamps: number[] = [];

function initAdminUnlock(): void {
  $<HTMLElement>("tc-plugin-title").addEventListener("click", () => {
    const now = Date.now();
    adminUnlockClickTimestamps = adminUnlockClickTimestamps.filter(
      (timestamp) => now - timestamp <= ADMIN_UNLOCK_WINDOW_MS
    );
    adminUnlockClickTimestamps.push(now);
    if (adminUnlockClickTimestamps.length >= ADMIN_UNLOCK_CLICKS) {
      adminUnlockClickTimestamps = [];
      post({ type: "toggle-admin-mode" });
    }
  });
}

function initProposePanel(): void {
  $<HTMLButtonElement>("tc-propose-decisions-btn").addEventListener("click", () => {
    if (pendingProposeCountByCategory[activeCategory] === 0) return;
    renderProposeStatus("");
    $<HTMLButtonElement>("tc-propose-decisions-btn").disabled = true;
    post({ type: "request-propose-preview", payload: { category: activeCategory } });
  });
}

// ---------------------------------------------------------------------------
// Модалка подтверждения "Отправить решения на согласование"
//
// Показывает те же поля, что попадут в человекочитаемое PR body на GitHub
// (см. server/api/_lib/pullRequestBody.ts) — Путь / Свойство / Значение /
// Токен / Коллекция-режим / Комментарий в зависимости от decision. Чекбокс у
// строки решает, попадёт ли она в отправку: снятые решения остаются pending
// и не отправляются вовсе (не "отмена" на backend — они просто не включаются
// в текущий payload propose-decisions).
// ---------------------------------------------------------------------------

const PROPOSE_DECISION_META: Record<Decision, { icon: string; label: string }> = {
  mapped: { icon: "🟢", label: "Использовать токен" },
  mapped_suggested: { icon: "🟢", label: "Использовать токен" },
  ignored: { icon: "🔴", label: "Игнорировать" },
  candidate: { icon: "🔵", label: "Кандидат на новый токен" },
  value_fix_proposed: { icon: "🟡", label: "Предложить правку значения токена" },
};

let proposePreviewEntries: ProposePreviewEntry[] = [];
const proposeSelectedIds = new Set<string>();

function bulletHtml(label: string, value: string | number | undefined): string | null {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  if (!text) return null;
  return `<div><strong>${escapeHtml(label)}:</strong> ${escapeHtml(text)}</div>`;
}

function collectionModeHtml(collectionName?: string, modeName?: string): string | null {
  const collection = collectionName?.trim();
  const mode = modeName?.trim();
  if (!collection && !mode) return null;
  const text = collection && mode ? `${collection} / ${mode}` : collection || mode || "";
  return `<div><strong>Коллекция / режим:</strong> ${escapeHtml(text)}</div>`;
}

function isTypographyProposeEntry(entry: ProposePreviewEntry): boolean {
  return entry.category === "typography" || entry.sourceProperty === "text-style";
}

function renderProposeItemDetails(entry: ProposePreviewEntry): string {
  const lines: Array<string | null> = [];
  const typography = isTypographyProposeEntry(entry);
  switch (entry.decision) {
    case "mapped":
    case "mapped_suggested":
      lines.push(
        bulletHtml("Свойство", entry.sourceProperty),
        bulletHtml("Затронуто слоёв", entry.occurrenceCount),
        bulletHtml("Текущая типографика", entry.sourceDisplayValue),
        typography
          ? bulletHtml("Стиль текста", entry.targetStyleName ?? entry.targetVariableName)
          : bulletHtml("Токен", entry.targetVariableName),
        typography
          ? bulletHtml("Целевая типографика", entry.targetDisplayValue)
          : bulletHtml("Значение токена", entry.targetDisplayValue),
        typography && entry.mismatchedProperties?.length
          ? bulletHtml("Несовпадающие свойства", entry.mismatchedProperties.join(", "))
          : null,
        typography ? null : collectionModeHtml(entry.targetCollectionName, entry.targetModeName),
        bulletHtml("Комментарий", entry.comment)
      );
      break;
    case "ignored":
      lines.push(
        bulletHtml("Свойство", entry.sourceProperty),
        bulletHtml("Затронуто слоёв", entry.occurrenceCount),
        bulletHtml("Значение", entry.sourceDisplayValue),
        bulletHtml("Причина", entry.comment?.trim() || "не указана")
      );
      break;
    case "value_fix_proposed":
      lines.push(
        typography
          ? bulletHtml("Стиль текста", entry.targetStyleName ?? entry.targetVariableName)
          : bulletHtml("Токен", entry.targetVariableName),
        typography ? null : collectionModeHtml(entry.targetCollectionName, entry.proposedModeName),
        bulletHtml(
          typography ? "Текущая типографика библиотеки" : "Текущее значение библиотеки",
          entry.currentLibraryValue
        ),
        bulletHtml(
          typography ? "Предлагаемая типографика" : "Предлагаемое значение",
          entry.proposedValue
        ),
        bulletHtml("Комментарий", entry.comment)
      );
      break;
    case "candidate":
      lines.push(
        bulletHtml("Свойство", entry.sourceProperty),
        bulletHtml("Значение", entry.sourceDisplayValue),
        bulletHtml("Комментарий", entry.comment)
      );
      break;
    default:
      break;
  }
  return lines.filter((line): line is string => line !== null).join("");
}

function resolveProposeEntryNodeIds(entry: ProposePreviewEntry): string[] {
  if (entry.nodeIds && entry.nodeIds.length > 0) return entry.nodeIds;
  const result = currentResults.find((item) => item.id === entry.recordId);
  if (result?.nodeIds && result.nodeIds.length > 0) return result.nodeIds;
  return [];
}

function renderProposeItemHtml(entry: ProposePreviewEntry): string {
  const meta = PROPOSE_DECISION_META[entry.decision] ?? { icon: "⚪", label: entry.decision };
  const checked = proposeSelectedIds.has(entry.recordId);
  const title = entry.nodeName?.trim() || entry.recordId;
  const nodeIds = resolveProposeEntryNodeIds(entry);
  const pathHtml = entry.nodePath
    ? nodeIds.length > 0
      ? `<button type="button" class="ds-accent-link tc-propose-item__path tc-propose-item__path-link" data-record-id="${escapeHtml(
          entry.recordId
        )}" title="Перейти к слою в макете">${escapeHtml(entry.nodePath)}</button>`
      : `<div class="tc-propose-item__path">${escapeHtml(entry.nodePath)}</div>`
    : "";
  return `
    <div class="tc-propose-item${checked ? "" : " tc-propose-item--unchecked"}" data-record-id="${escapeHtml(
    entry.recordId
  )}">
      <label class="tc-propose-item__checkbox">
        <input type="checkbox" class="tc-propose-item__check" data-record-id="${escapeHtml(
          entry.recordId
        )}" ${checked ? "checked" : ""} />
      </label>
      <div class="tc-propose-item__body">
        <div class="tc-propose-item__title">
          <span class="tc-propose-item__decision">${meta.icon} ${escapeHtml(meta.label)}</span>
          <span class="tc-propose-item__name">${escapeHtml(title)}</span>
        </div>
        ${pathHtml}
        <div class="tc-propose-item__details">${renderProposeItemDetails(entry)}</div>
      </div>
    </div>
  `;
}

function updateProposeModalFooter(): void {
  const total = proposePreviewEntries.length;
  const selected = proposeSelectedIds.size;
  $<HTMLElement>("tc-propose-selected-count").textContent = `Выбрано ${selected} из ${total}`;
  const confirmBtn = $<HTMLButtonElement>("tc-propose-confirm-btn");
  confirmBtn.textContent = `Отправить ${selected} ${pluralizeDecisions(selected)}`;
  confirmBtn.disabled = selected === 0;
  const selectAll = $<HTMLInputElement>("tc-propose-select-all");
  selectAll.checked = total > 0 && selected === total;
  selectAll.indeterminate = selected > 0 && selected < total;
}

function renderProposeList(): void {
  const container = $<HTMLElement>("tc-propose-list");
  if (proposePreviewEntries.length === 0) {
    container.innerHTML = `<div class="tc-propose-empty">Нет решений, ожидающих отправки.</div>`;
  } else {
    container.innerHTML = proposePreviewEntries.map((entry) => renderProposeItemHtml(entry)).join("");
  }
  updateProposeModalFooter();
}

function toggleProposeItem(recordId: string, checked: boolean): void {
  if (checked) {
    proposeSelectedIds.add(recordId);
  } else {
    proposeSelectedIds.delete(recordId);
  }
  const row = $<HTMLElement>("tc-propose-list").querySelector<HTMLElement>(
    `.tc-propose-item[data-record-id="${cssEscapeRecordId(recordId)}"]`
  );
  if (row) row.classList.toggle("tc-propose-item--unchecked", !checked);
  updateProposeModalFooter();
}

function cssEscapeRecordId(recordId: string): string {
  return typeof CSS !== "undefined" && CSS.escape ? CSS.escape(recordId) : recordId.replace(/"/g, '\\"');
}

function openProposeConfirmModal(entries: ProposePreviewEntry[]): void {
  proposePreviewEntries = entries;
  proposeSelectedIds.clear();
  entries.forEach((entry) => proposeSelectedIds.add(entry.recordId));
  renderProposeList();
  $("tc-propose-overlay").hidden = false;
  syncProposeButton();
}

function closeProposeConfirmModal(): void {
  $("tc-propose-overlay").hidden = true;
  proposePreviewEntries = [];
  proposeSelectedIds.clear();
  syncProposeButton();
}

function confirmProposeSubmit(): void {
  const recordIds = Array.from(proposeSelectedIds);
  if (recordIds.length === 0) return;
  closeProposeConfirmModal();
  renderProposeStatus("");
  $<HTMLButtonElement>("tc-propose-decisions-btn").disabled = true;
  post({ type: "propose-decisions", payload: { recordIds } });
}

function initProposeConfirmModal(): void {
  $<HTMLButtonElement>("tc-propose-close-btn").addEventListener("click", closeProposeConfirmModal);
  $<HTMLButtonElement>("tc-propose-cancel-btn").addEventListener("click", closeProposeConfirmModal);
  $<HTMLButtonElement>("tc-propose-confirm-btn").addEventListener("click", confirmProposeSubmit);
  $("tc-propose-overlay").addEventListener("click", (event) => {
    if (event.target === $("tc-propose-overlay")) closeProposeConfirmModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$("tc-propose-overlay").hidden) closeProposeConfirmModal();
  });
  $<HTMLInputElement>("tc-propose-select-all").addEventListener("change", (event) => {
    const checked = (event.target as HTMLInputElement).checked;
    proposeSelectedIds.clear();
    if (checked) {
      proposePreviewEntries.forEach((entry) => proposeSelectedIds.add(entry.recordId));
    }
    renderProposeList();
  });
  $<HTMLElement>("tc-propose-list").addEventListener("change", (event) => {
    const target = event.target as HTMLElement;
    if (!target.classList.contains("tc-propose-item__check")) return;
    const recordId = target.getAttribute("data-record-id");
    if (!recordId) return;
    toggleProposeItem(recordId, (target as HTMLInputElement).checked);
  });
  $<HTMLElement>("tc-propose-list").addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const pathLink = target.closest<HTMLElement>(".tc-propose-item__path-link");
    if (!pathLink) return;
    event.preventDefault();
    event.stopPropagation();
    const recordId = pathLink.getAttribute("data-record-id");
    if (!recordId) return;
    const entry = proposePreviewEntries.find((item) => item.recordId === recordId);
    if (!entry) return;
    const nodeIds = resolveProposeEntryNodeIds(entry);
    if (nodeIds.length === 0) return;
    post({ type: "select-nodes", payload: { nodeIds } });
  });
}

function hideRegistryNotFoundPrompt(): void {
  $("tc-registry-not-found").hidden = true;
}

function showRegistryNotFoundPrompt(repo: string, registryPath: string): void {
  const block = $<HTMLElement>("tc-registry-not-found");
  $<HTMLElement>("tc-registry-not-found-text").textContent =
    `Реестр ещё не создан в репозитории ${repo} (${registryPath}). Начать с пустого реестра?`;
  block.hidden = false;
}

function initGitHubSettingsPanel(): void {
  const tokenInput = $<HTMLInputElement>("tc-github-token-input");
  const repoInput = $<HTMLInputElement>("tc-github-repo-input");
  const pathInput = $<HTMLInputElement>("tc-github-registry-path-input");
  const saveBtn = $<HTMLButtonElement>("tc-save-github-settings-btn");
  const loadBtn = $<HTMLButtonElement>("tc-load-registry-btn");
  const initEmptyBtn = $<HTMLButtonElement>("tc-init-empty-registry-btn");

  saveBtn.addEventListener("click", () => {
    const repo = repoInput.value.trim();
    if (!repo) {
      showError("Укажите репозиторий в формате owner/repo.");
      return;
    }
    post({
      type: "save-github-settings",
      payload: {
        token: tokenInput.value.trim(),
        repo,
        registryPath: pathInput.value.trim() || "decisions-registry.json",
      },
    });
  });

  loadBtn.addEventListener("click", () => {
    const repo = repoInput.value.trim();
    if (!repo) {
      showError("Укажите репозиторий в формате owner/repo.");
      return;
    }
    hideRegistryNotFoundPrompt();
    loadBtn.disabled = true;
    post({
      type: "load-registry",
      payload: {
        token: tokenInput.value.trim(),
        repo,
        registryPath: pathInput.value.trim() || "decisions-registry.json",
      },
    });
  });

  initEmptyBtn.addEventListener("click", () => {
    const repo = repoInput.value.trim();
    if (!repo) {
      showError("Укажите репозиторий в формате owner/repo.");
      return;
    }
    hideRegistryNotFoundPrompt();
    post({
      type: "init-empty-registry",
      payload: {
        repo,
        registryPath: pathInput.value.trim() || "decisions-registry.json",
      },
    });
  });
}

// ---------------------------------------------------------------------------
// Сканирование
// ---------------------------------------------------------------------------

function getSelectedScope(): ScanScope {
  const pressed = document.querySelector<HTMLButtonElement>('#tc-scope-segment button[aria-pressed="true"]');
  return (pressed?.dataset.scope ?? "page") as ScanScope;
}

function initScopeSegment(): void {
  const segment = $("tc-scope-segment");
  segment.querySelectorAll<HTMLButtonElement>("button[data-scope]").forEach((button) => {
    button.addEventListener("click", () => {
      segment.querySelectorAll<HTMLButtonElement>("button[data-scope]").forEach((item) => {
        item.setAttribute("aria-pressed", "false");
      });
      button.setAttribute("aria-pressed", "true");
    });
  });
}

function getSelectedCategory(): TokenCategory {
  const pressed = document.querySelector<HTMLButtonElement>(
    '#tc-category-segment button[aria-pressed="true"]'
  );
  return (pressed?.dataset.category ?? "colors") as TokenCategory;
}

function updateTypographyCategoryAvailability(): void {
  const typographyBtn = document.querySelector<HTMLButtonElement>(
    '#tc-category-segment button[data-category="typography"]'
  );
  const notice = $<HTMLElement>("tc-typography-library-notice");
  const unavailable = !typographyLibraryAvailable;

  if (typographyBtn) {
    typographyBtn.disabled = unavailable;
    typographyBtn.title = unavailable
      ? textStylesUnavailableMessage(typographyLibraryError)
      : "";
  }

  if (unavailable) {
    notice.hidden = false;
    notice.textContent = textStylesUnavailableMessage(typographyLibraryError);
  } else {
    notice.hidden = true;
    notice.textContent = "";
  }

  if (unavailable && activeCategory === "typography") {
    activeCategory = "colors";
    setCategorySegmentPressed("colors");
    applyActiveCategoryView();
  }
}

/**
 * Почему иконки сканировать нельзя — по данным выбранной библиотеки.
 *
 * Кнопка «Иконки» не блокируется: подсказка неактивной кнопки в Figma не
 * видна, и было непонятно, что делать. Причину пишем в панели сканирования.
 */
function iconsUnavailableMessage(): string {
  const library = loadedLibraries.find((item) => item.fileKey === activeLibraryKey);
  if (!library) return "Сначала загрузите библиотеку иконок на вкладке «Настройки».";
  const name = `«${library.fileName}»`;
  if (library.iconCount === undefined) {
    return `Библиотека ${name} загружена до версии 1.5.0 — иконок в ней пока нет. Обновите её кнопкой ↻ на вкладке «Настройки».`;
  }
  if (library.iconCount === null) {
    return `Иконки из ${name} не загрузились: ${library.iconsError ?? "ошибка запроса"}. Обновите библиотеку кнопкой ↻ на вкладке «Настройки».`;
  }
  return `В ${name} нет опубликованных компонентов. Иконки берутся только из опубликованной библиотеки (Publish library в Figma). Если иконки лежат в другом файле — добавьте его на вкладке «Настройки» и выберите здесь.`;
}

function updateIconsCategoryAvailability(): void {
  const notice = $<HTMLElement>("tc-icons-library-notice");
  const show = activeCategory === "icons" && !iconsLibraryAvailable;
  notice.hidden = !show;
  notice.textContent = show ? iconsUnavailableMessage() : "";
}

const SCAN_PANEL_COPY: Record<TokenCategory, { title: string; caption: string; button: string }> = {
  colors: {
    title: "Сканирование цветов",
    caption: "Выберите библиотеку и область макета для сравнения цветов.",
    button: "Сканировать цвета",
  },
  typography: {
    title: "Сканирование типографики",
    caption: "Выберите библиотеку и область макета для сравнения стилей текста.",
    button: "Сканировать типографику",
  },
  icons: {
    title: "Сканирование иконок",
    caption: "Выберите иконочную библиотеку и область макета для сравнения иконок.",
    button: "Сканировать иконки",
  },
};

function updateScanPanelCopy(): void {
  const copy = SCAN_PANEL_COPY[activeCategory];
  $<HTMLElement>("tc-scan-title").textContent = copy.title;
  $<HTMLElement>("tc-scan-caption").textContent = copy.caption;
  $<HTMLButtonElement>("tc-scan-btn").textContent = copy.button;
}

function setCategorySegmentPressed(category: TokenCategory): void {
  const segment = $("tc-category-segment");
  segment.querySelectorAll<HTMLButtonElement>("button[data-category]").forEach((button) => {
    button.setAttribute("aria-pressed", button.dataset.category === category ? "true" : "false");
  });
}

function updateResultsBlocksVisibility(): void {
  $<HTMLElement>("tc-results-block-colors").hidden = activeCategory !== "colors";
  $<HTMLElement>("tc-results-block-typography").hidden = activeCategory !== "typography";
  $<HTMLElement>("tc-results-block-icons").hidden = activeCategory !== "icons";
  $<HTMLElement>("tc-rescan-typography-btn").hidden = activeCategory === "colors";
  // Экспорт и печать иконок — этап 5 плана v1.5.0.
  setExportButtonsDisabled(currentResults.length === 0 || activeCategory === "icons");
  updateProposeButton(pendingProposeCount);
}

function syncCurrentResultsFromCategory(): void {
  currentResults = resultsByCategory[activeCategory];
}

function applyActiveCategoryView(resetStatusFilters = false): void {
  syncCurrentResultsFromCategory();
  updateScanPanelCopy();
  updateIconsCategoryAvailability();
  updateResultsBlocksVisibility();
  if (resetStatusFilters) {
    syncStatusFiltersFromResults(currentResults, true);
  }
  closeStatusFilterMenu();
  renderResultsTable();
}

function switchActiveCategory(nextCategory: TokenCategory): void {
  if (nextCategory === activeCategory) return;
  if (nextCategory === "typography" && !typographyLibraryAvailable) {
    setCategorySegmentPressed(activeCategory);
    return;
  }

  const pendingForCurrent = pendingProposeCountByCategory[activeCategory];
  if (pendingForCurrent > 0) {
    const confirmed = window.confirm(
      "Смена категории очистит текущие результаты и неотправленные решения. Продолжить?"
    );
    if (!confirmed) {
      setCategorySegmentPressed(activeCategory);
      return;
    }
    post({ type: "clear-pending-proposals", payload: { category: activeCategory } });
    pendingProposeCountByCategory[activeCategory] = 0;
    resultsByCategory[activeCategory] = [];
    updateProposeButton(
      pendingProposeCountByCategory.colors + pendingProposeCountByCategory.typography + pendingProposeCountByCategory.icons,
      pendingProposeCountByCategory
    );
  }

  activeCategory = nextCategory;
  setCategorySegmentPressed(nextCategory);
  applyActiveCategoryView();
}

function initCategorySegment(): void {
  const segment = $("tc-category-segment");
  segment.querySelectorAll<HTMLButtonElement>("button[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextCategory = (button.dataset.category ?? "colors") as TokenCategory;
      switchActiveCategory(nextCategory);
    });
  });
  updateScanPanelCopy();
}

function initScanPanel(): void {
  const scanBtn = $<HTMLButtonElement>("tc-scan-btn");
  scanBtn.addEventListener("click", () => {
    const scope = getSelectedScope();
    const category = getSelectedCategory();
    if (category === "typography" && !typographyLibraryAvailable) {
      showError(textStylesUnavailableMessage(typographyLibraryError));
      return;
    }
    scanBtn.disabled = true;
    $("tc-scan-status").textContent = "Сканирование...";
    post({ type: "scan", payload: { scope, category } });
  });
}

// ---------------------------------------------------------------------------
// Таблица результатов
// ---------------------------------------------------------------------------

const ACTION_OPTIONS: Array<{ value: Decision; label: string }> = [
  { value: "mapped_suggested", label: "Использовать предложенный" },
  { value: "mapped", label: "Выбрать токен из AID" },
  { value: "ignored", label: "Игнорировать" },
  { value: "candidate", label: "Кандидат на новый токен" },
  {
    value: "value_fix_proposed",
    label: "Предложить правку значения токена",
  },
];

function canProposeValueFix(result: ComparisonResult): boolean {
  if (activeCategory === "typography" || result.category === "typography") {
    return (
      currentLibraryTextStyles.length > 0 &&
      Boolean(result.target) &&
      Boolean(result.mismatchedProperties && result.mismatchedProperties.length > 0)
    );
  }
  return currentLibraryTokens.length > 0;
}

/** "Использовать предложенный" доступен только если плагин сам нашёл target-токен для строки. */
function canUseSuggestedToken(result: ComparisonResult): boolean {
  return Boolean(result.target);
}

// ---------------------------------------------------------------------------
// Показать превью — "Было / Будет" для строк с library target
// ---------------------------------------------------------------------------

let previewInFlight = false;
let activePreviewRecordId: string | null = null;

/**
 * `.tc-mapped-preview-btn` (комбобокс «Выбрать токен/стиль из AID») зависит
 * ещё и от того, выбран ли токен или стиль — при снятии общей блокировки
 * (disabled = false) её нельзя просто разблокировать, если выбора ещё нет.
 */
function setPreviewButtonsDisabled(disabled: boolean): void {
  document.querySelectorAll<HTMLButtonElement>(".tc-preview-btn").forEach((btn) => {
    if (disabled) {
      btn.disabled = true;
      return;
    }
    if (btn.classList.contains("tc-mapped-preview-btn")) {
      const host = btn.closest<HTMLElement>(".ds-action-extra");
      btn.disabled = !host?.dataset.selectedVariableId && !host?.dataset.selectedStyleId;
      return;
    }
    btn.disabled = false;
  });
}

function showPreviewLoading(): void {
  $("tc-preview-loading").hidden = false;
  const errorEl = $("tc-preview-error");
  errorEl.hidden = true;
  errorEl.textContent = "";
  $("tc-preview-images").hidden = true;
}

/** Длинная сторона снимка для анализа фона — точности хватает, а крупный PNG не гоняется целиком. */
const PREVIEW_BACKDROP_SAMPLE_SIZE = 256;

function readCheckerColors(baseVar: string, squareVar: string): CheckerColors | null {
  const style = getComputedStyle(document.documentElement);
  const base = parseCssColor(style.getPropertyValue(baseVar));
  const square = parseCssColor(style.getPropertyValue(squareVar));
  return base && square ? [base, square] : null;
}

/**
 * Переключает снимок на тёмную шахматку, если на светлой он не читается —
 * например, белый текст без подложки (см. lib/previewBackdrop.ts).
 */
function applyPreviewBackdrop(img: HTMLImageElement): void {
  const light = readCheckerColors("--ds-surface-checker-base", "--ds-surface-checker");
  const dark = readCheckerColors("--ds-surface-checker-inverse-base", "--ds-surface-checker-inverse");
  if (!light || !dark || !img.naturalWidth || !img.naturalHeight) return;

  const scale = Math.min(1, PREVIEW_BACKDROP_SAMPLE_SIZE / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return;
  // Без сглаживания: иначе тонкие глифы при уменьшении становятся
  // полупрозрачными и выпадают из подсчёта.
  context.imageSmoothingEnabled = false;
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);

  img.classList.toggle("tc-preview-img--inverse", pickPreviewBackdrop(data, { light, dark }) === "dark");
}

function applyPreviewBackdrops(container: HTMLElement): void {
  container.querySelectorAll<HTMLImageElement>(".tc-preview-figure img").forEach((img) => {
    const run = (): void => {
      try {
        applyPreviewBackdrop(img);
      } catch {
        // анализ не удался — снимок остаётся на светлой шахматке, как раньше
      }
    };
    if (img.complete && img.naturalWidth) run();
    else img.addEventListener("load", run, { once: true });
  });
}

function showPreviewImages(modes: Array<{ modeName: string; before: string; after: string }>): void {
  $("tc-preview-loading").hidden = true;
  $("tc-preview-error").hidden = true;
  const container = $("tc-preview-images");
  container.hidden = false;
  container.innerHTML = modes
    .map(
      (mode) => `
    <div class="tc-preview-mode-group">
      <div class="tc-preview-mode-group__label">${escapeHtml(mode.modeName)}</div>
      <div class="tc-preview-mode-group__pair">
        <figure class="tc-preview-figure">
          <img src="${mode.before}" alt="Было — ${escapeHtml(mode.modeName)}" />
          <figcaption>Было</figcaption>
        </figure>
        <figure class="tc-preview-figure">
          <img src="${mode.after}" alt="Будет — ${escapeHtml(mode.modeName)}" />
          <figcaption>Будет</figcaption>
        </figure>
      </div>
    </div>`
    )
    .join("");
  applyPreviewBackdrops(container);
}

function showPreviewErrorInModal(message: string): void {
  $("tc-preview-loading").hidden = true;
  $("tc-preview-images").hidden = true;
  const errorEl = $("tc-preview-error");
  errorEl.hidden = false;
  errorEl.textContent = message;
}

function openPreviewModal(): void {
  const title = activeCategory === "typography" ? "Превью изменения типографики" : "Превью изменения цвета";
  $("tc-preview-title").textContent = title;
  $("tc-preview-modal").setAttribute("aria-label", title);
  $("tc-preview-overlay").hidden = false;
  showPreviewLoading();
}

function closePreviewModal(): void {
  $("tc-preview-overlay").hidden = true;
  activePreviewRecordId = null;
}

/**
 * `selection` — токен (`variableId`) или стиль текста (`styleId`), выбранный
 * вручную через combobox «Выбрать токен/стиль из AID», ещё до сохранения
 * решения («Применить решение»). Без него превью строится по автоматически
 * найденному target строки, как раньше.
 */
function requestPreview(recordId: string, selection: { variableId?: string; styleId?: string } = {}): void {
  if (previewInFlight) {
    showError("Дождитесь, пока построится текущее превью.");
    return;
  }
  previewInFlight = true;
  activePreviewRecordId = recordId;
  setPreviewButtonsDisabled(true);
  openPreviewModal();
  post({ type: "build-preview", recordId, variableId: selection.variableId, styleId: selection.styleId });
}

function initPreviewModal(): void {
  $<HTMLButtonElement>("tc-preview-close-btn").addEventListener("click", () => {
    closePreviewModal();
  });
  $("tc-preview-overlay").addEventListener("click", (event) => {
    if (event.target === $("tc-preview-overlay")) closePreviewModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$("tc-preview-overlay").hidden) closePreviewModal();
  });
}

// ---------------------------------------------------------------------------
// Применить в макет — единственное действие плагина, которое реально меняет
// макет. Отдельное, самостоятельное действие: не переиспользует "Применить
// решение" и требует явного подтверждения в модальном окне перед отправкой.
// ---------------------------------------------------------------------------

/** Доступно только для строк со статусом "Mapped" с известной переменной или Text Style библиотеки. */
/**
 * «Применить в макет» доступно только там, где есть что применить: выбранный
 * токен или стиль библиотеки.
 *
 * Решение «предложить правку значения» сюда не входит. Менять по нему должна
 * библиотека, а не макет, и плагин в библиотеку писать не умеет — раньше
 * кнопка для таких строк применяла слоям их же собственные текущие значения:
 * рендер не менялся, но слой получал override поверх стиля.
 */
function canApplyToLayout(result: ComparisonResult): boolean {
  if (result.status !== "mapped") return false;
  if (result.category === "typography" || activeCategory === "typography") {
    return Boolean(result.target?.styleKey || result.target?.styleId);
  }
  return Boolean(result.target?.variableId);
}

const PROPERTY_LABELS: Record<string, string> = {
  fill: "Заливка",
  stroke: "Обводка",
  "text-fill": "Цвет текста",
};

function propertyLabel(property: string): string {
  return PROPERTY_LABELS[property] ?? property;
}

let applyToLayoutInFlight = false;
let activeApplyRecordId: string | null = null;
/** true, пока для модалки «Применить в макет» строится PNG-превью (общий build-preview с preview modal). */
let applyModalPreviewPending = false;

function setApplyToLayoutButtonsDisabled(disabled: boolean): void {
  document.querySelectorAll<HTMLButtonElement>(".tc-apply-layout-btn").forEach((btn) => {
    btn.disabled = disabled;
  });
}

function renderApplyBeforeAfterHtml(result: ComparisonResult): string {
  const bindingLabel = BINDING_LABELS[result.bindingType] ?? result.bindingType;
  const beforePrimary = result.sourceName ? escapeHtml(result.sourceName) : escapeHtml(result.displayValue);
  const styleSwatch = result.bindingType === "style";

  let beforeBody: string;
  if (result.modeValues && result.modeValues.length > 0) {
    beforeBody = `<span class="ds-value-meta__primary">${beforePrimary}</span>${renderModeValueLines(result.modeValues, {
      styleSwatch,
    })}<div class="ds-value-meta__caption">${escapeHtml(bindingLabel)} · слоёв: ${result.count}</div>`;
  } else {
    const hex = String((result.comparisonValue as { hex?: string }).hex ?? "");
    const swatchClass = styleSwatch ? "ds-color-swatch ds-color-swatch--style" : "ds-color-swatch";
    const caption = result.sourceName
      ? `${escapeHtml(bindingLabel)} · ${escapeHtml(result.displayValue)}`
      : escapeHtml(bindingLabel);
    beforeBody = `<div class="ds-value-meta__head"><span class="${swatchClass}" style="background:${hex}"></span><span class="ds-value-meta__primary">${beforePrimary}</span></div><div class="ds-value-meta__caption">${caption}</div>`;
  }

  const target = result.target;
  let afterBody = `<span class="ds-value-meta__caption">нет переменной</span>`;
  if (target) {
    const modes =
      target.allModes && target.allModes.length > 0
        ? target.allModes
        : [
            {
              modeName: target.modeName,
              displayValue: target.displayValue,
              unresolved: target.valueUnresolved,
            },
          ];
    afterBody = `<span class="ds-value-meta__primary">${escapeHtml(target.name)}</span>${renderModeValueLines(
      modes
    )}<div class="ds-value-meta__caption">${escapeHtml(target.collectionName)} · variable binding</div>`;
  }

  return `
    <div class="tc-apply-before-after__col">
      <div class="tc-apply-before-after__title">Было</div>
      ${beforeBody}
    </div>
    <div class="tc-apply-before-after__col">
      <div class="tc-apply-before-after__title">Стало</div>
      ${afterBody}
    </div>
  `;
}

function showApplyModalPreviewLoading(): void {
  $("tc-apply-preview-loading").hidden = false;
  $("tc-apply-preview-error").hidden = true;
  $("tc-apply-preview-images").hidden = true;
}

function showApplyModalPreviewImages(modes: Array<{ modeName: string; before: string; after: string }>): void {
  $("tc-apply-preview-loading").hidden = true;
  $("tc-apply-preview-error").hidden = true;
  const container = $("tc-apply-preview-images");
  container.hidden = false;
  container.innerHTML = modes
    .map(
      (mode) => `
    <div class="tc-preview-mode-group">
      <div class="tc-preview-mode-group__label">${escapeHtml(mode.modeName)}</div>
      <div class="tc-preview-mode-group__pair">
        <figure class="tc-preview-figure">
          <img src="${mode.before}" alt="Было — ${escapeHtml(mode.modeName)}" />
          <figcaption>Было</figcaption>
        </figure>
        <figure class="tc-preview-figure">
          <img src="${mode.after}" alt="Стало — ${escapeHtml(mode.modeName)}" />
          <figcaption>Стало</figcaption>
        </figure>
      </div>
    </div>`
    )
    .join("");
  applyPreviewBackdrops(container);
}

function showApplyModalPreviewError(message: string): void {
  $("tc-apply-preview-loading").hidden = true;
  $("tc-apply-preview-images").hidden = true;
  const errorEl = $("tc-apply-preview-error");
  errorEl.hidden = false;
  errorEl.textContent = message;
}

function requestApplyModalPreview(recordId: string): void {
  if (previewInFlight) {
    showApplyModalPreviewError("Дождитесь, пока построится другое превью, и откройте окно снова.");
    return;
  }
  previewInFlight = true;
  applyModalPreviewPending = true;
  setPreviewButtonsDisabled(true);
  showApplyModalPreviewLoading();
  post({ type: "build-preview", recordId });
}

function renderTypographyApplyBeforeAfterHtml(result: ComparisonResult): string {
  const layoutValue = readTypographyComparisonValue(result.comparisonValue);
  const beforeText = layoutValue
    ? formatTypographyDisplayValue(layoutValue)
    : result.displayValue;
  const afterText = result.target?.displayValue ?? result.decisionProposedValue ?? "—";
  return `
    <div class="tc-apply-before-after__col">
      <div class="tc-apply-before-after__title">Было</div>
      <div class="ds-value-meta__primary">${escapeHtml(beforeText)}</div>
      <div class="ds-value-meta__caption">${escapeHtml(result.sourceName || result.bindingType)}</div>
    </div>
    <div class="tc-apply-before-after__col">
      <div class="tc-apply-before-after__title">Стало</div>
      <div class="ds-value-meta__primary">${escapeHtml(afterText)}</div>
      <div class="ds-value-meta__caption">Привязан стиль текста</div>
    </div>
  `;
}

function openApplyToLayoutModal(result: ComparisonResult): void {
  activeApplyRecordId = result.id;
  applyModalPreviewPending = false;

  const isTypography = result.category === "typography" || activeCategory === "typography";

  if (isTypography) {
    $("tc-apply-summary").innerHTML = `
      <div class="tc-apply-summary__row"><span>Слой/группа</span><strong>${escapeHtml(
        result.representativeNodeName || "(без имени)"
      )}</strong></div>
      <div class="tc-apply-summary__row"><span>Свойство</span><strong>text-style</strong></div>
      <div class="tc-apply-summary__row"><span>Затронуто слоёв</span><strong>${formatAffectedLayers(
        result
      )}</strong></div>
      <div class="tc-apply-summary__row"><span>Стиль текста</span><strong>${escapeHtml(
        result.target?.name ?? ""
      )}</strong></div>
    `;
    $("tc-apply-before-after").innerHTML = renderTypographyApplyBeforeAfterHtml(result);
    $("tc-apply-confirm-view").hidden = false;
    $("tc-apply-footer").hidden = false;
    $("tc-apply-loading").hidden = true;
    const resultView = $("tc-apply-result-view");
    resultView.hidden = true;
    resultView.innerHTML = "";
    $("tc-apply-overlay").hidden = false;
    requestApplyModalPreview(result.id);
    return;
  }

  $("tc-apply-summary").innerHTML = `
    <div class="tc-apply-summary__row"><span>Слой/группа</span><strong>${escapeHtml(
      result.representativeNodeName || "(без имени)"
    )}</strong></div>
    <div class="tc-apply-summary__row"><span>Свойство</span><strong>${escapeHtml(
      propertyLabel(result.property)
    )}</strong></div>
    <div class="tc-apply-summary__row"><span>Затронуто слоёв</span><strong>${formatAffectedLayers(
      result
    )}</strong></div>
    <div class="tc-apply-summary__row"><span>Переменная</span><strong>${escapeHtml(result.target?.name ?? "")}${
    result.target?.collectionName ? ` (${escapeHtml(result.target.collectionName)})` : ""
  }</strong></div>
  `;

  $("tc-apply-before-after").innerHTML = renderApplyBeforeAfterHtml(result);

  $("tc-apply-confirm-view").hidden = false;
  $("tc-apply-footer").hidden = false;
  $("tc-apply-loading").hidden = true;
  const resultView = $("tc-apply-result-view");
  resultView.hidden = true;
  resultView.innerHTML = "";
  $("tc-apply-overlay").hidden = false;

  requestApplyModalPreview(result.id);
}

function closeApplyToLayoutModal(): void {
  $("tc-apply-overlay").hidden = true;
  activeApplyRecordId = null;
  applyModalPreviewPending = false;
}

function confirmApplyToLayout(): void {
  if (!activeApplyRecordId || applyToLayoutInFlight) return;
  applyToLayoutInFlight = true;
  setApplyToLayoutButtonsDisabled(true);
  $("tc-apply-confirm-view").hidden = true;
  $("tc-apply-footer").hidden = true;
  $("tc-apply-result-view").hidden = true;
  $("tc-apply-loading").hidden = false;
  post({ type: "apply-to-layout", recordId: activeApplyRecordId });
}

/**
 * «Затронуто слоёв» в подтверждающей модалке. У группы, чей список слоёв
 * обрезан лимитом сканера, показываем обе величины — сколько будет изменено
 * и сколько вхождений всего.
 */
function formatAffectedLayers(result: ComparisonResult): string {
  if (!result.nodeIdsTruncated) return String(result.count);
  return `${result.nodeIds.length} из ${result.count}`;
}

function showApplyToLayoutResult(
  applied: number,
  skipped: Array<{ nodeId: string; reason: string }>,
  options: { attempted: number; occurrences: number; partial?: boolean }
): void {
  const { attempted, occurrences, partial } = options;
  $("tc-apply-loading").hidden = true;
  const resultView = $("tc-apply-result-view");
  resultView.hidden = false;

  // Раньше знаменатель считался как applied + skipped, то есть всегда
  // совпадал с числителем при отсутствии пропусков: сообщение «Применено к 7
  // из 7 слоёв» появлялось и тогда, когда в группе было 40 слоёв.
  const skippedHtml =
    skipped.length > 0
      ? `<ul class="tc-apply-skipped-list">${skipped
          .map((item) => `<li><code>${escapeHtml(item.nodeId)}</code> — ${escapeHtml(item.reason)}</li>`)
          .join("")}</ul>`
      : "";

  const partialNote = partial
    ? `<p class="ds-status-line ds-status-line--warning">Применено частично: обновились не все слои — остальные остались как были, причина указана выше.</p>`
    : "";

  // Список слоёв группы обрезается лимитом сканера, поэтому вхождений может
  // быть больше, чем слоёв, которые вообще можно затронуть за один заход.
  const truncatedNote =
    occurrences > attempted
      ? `<p class="ds-status-line ds-status-line--warning">В группе ${occurrences} ${pluralizeLayers(
          occurrences
        )}, но за один раз плагин изменяет не больше ${attempted}. Пересканируйте макет и повторите, чтобы обработать остальные.</p>`
      : "";

  resultView.innerHTML = `
    <p class="tc-apply-result__summary">Применено к ${applied} из ${attempted} ${pluralizeLayers(
    attempted
  )}${skipped.length > 0 ? `, пропущено: ${skipped.length}` : ""}.</p>
    ${partialNote}
    ${truncatedNote}
    ${skippedHtml}
    <p class="ds-status-line">Пересканируйте макет, чтобы обновить таблицу результатов (необязательно, но рекомендуется).</p>
  `;
}

function initApplyToLayoutModal(): void {
  $<HTMLButtonElement>("tc-apply-close-btn").addEventListener("click", closeApplyToLayoutModal);
  $<HTMLButtonElement>("tc-apply-cancel-btn").addEventListener("click", closeApplyToLayoutModal);
  $<HTMLButtonElement>("tc-apply-confirm-btn").addEventListener("click", confirmApplyToLayout);
  $("tc-apply-overlay").addEventListener("click", (event) => {
    if (event.target === $("tc-apply-overlay")) closeApplyToLayoutModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$("tc-apply-overlay").hidden) closeApplyToLayoutModal();
  });
}

function findLayoutValueForLibraryMode(result: ComparisonResult, libraryModeName: string): string {
  const targetModes =
    result.target?.allModes && result.target.allModes.length > 0
      ? result.target.allModes
      : result.target
        ? [{ modeName: result.target.modeName }]
        : undefined;
  return findLayoutValueForTargetMode(
    result.modeValues,
    libraryModeName,
    targetModes,
    result.displayValue
  );
}

function displayValueToHexInput(displayValue: string): string {
  return displayValue.split(" ")[0] ?? displayValue;
}

function setupValueFixExtra(result: ComparisonResult, valueFixExtra: HTMLElement): void {
  const initialToken = result.target
    ? currentLibraryTokens.find((t) => t.variableId === result.target!.variableId) ?? null
    : null;

  const initialVariableId =
    result.decision === "value_fix_proposed" && result.decisionTargetVariableId
      ? result.decisionTargetVariableId
      : initialToken?.variableId;

  valueFixExtra.innerHTML = `
    <label class="ds-field__label">Токен в библиотеке (для правки)</label>
    <div class="ds-combobox tc-value-fix-token-combo">
      <input
        type="text"
        class="ds-combobox__input ds-input"
        placeholder="Начните вводить имя токена..."
        autocomplete="off"
        spellcheck="false"
      />
      <button type="button" class="ds-combobox__toggle" aria-label="Показать переменные" aria-expanded="false">
        ${DROPDOWN_CHEVRON_SVG}
      </button>
      <div class="ds-filter-menu ds-combobox__menu" role="listbox" hidden></div>
    </div>
    <label class="ds-field__label">Режим библиотеки</label>
    <select class="ds-select tc-value-fix-mode"></select>
    <label class="ds-field__label">Сейчас в библиотеке</label>
    <div class="ds-value-meta__caption tc-value-fix-current"></div>
    <label class="ds-field__label">Предлагаемое значение</label>
    <input type="text" class="ds-input tc-value-fix-proposed" placeholder="#RRGGBB" spellcheck="false" autocomplete="off" />
    <textarea rows="2" placeholder="Комментарий (необязательно)" class="tc-value-fix-comment ds-textarea"></textarea>
  `;

  const combobox = valueFixExtra.querySelector<HTMLElement>(".tc-value-fix-token-combo");
  const comboInput = combobox?.querySelector<HTMLInputElement>(".ds-combobox__input");
  const comboToggle = combobox?.querySelector<HTMLButtonElement>(".ds-combobox__toggle");
  const modeSelectEl = valueFixExtra.querySelector<HTMLSelectElement>(".tc-value-fix-mode");
  const currentValueEl = valueFixExtra.querySelector<HTMLElement>(".tc-value-fix-current");
  const proposedValueInput = valueFixExtra.querySelector<HTMLInputElement>(".tc-value-fix-proposed");
  const commentField = valueFixExtra.querySelector<HTMLTextAreaElement>(".tc-value-fix-comment");
  if (!combobox || !comboInput || !comboToggle || !modeSelectEl || !currentValueEl || !proposedValueInput || !commentField) return;

  function populateModes(token: LibraryToken | null): void {
    modeSelectEl!.innerHTML = "";
    if (!token) {
      currentValueEl!.textContent = "";
      return;
    }
    const modes = sortModesForDisplay(token.modes);
    for (const mode of modes) {
      const opt = document.createElement("option");
      opt.value = mode.modeId;
      opt.textContent = mode.modeName;
      opt.dataset.modeName = mode.modeName;
      opt.dataset.libraryValue = mode.displayValue;
      modeSelectEl!.appendChild(opt);
    }
    syncFromModeSelection();
  }

  function syncFromModeSelection(): void {
    const selected = modeSelectEl!.selectedOptions[0];
    if (!selected) {
      currentValueEl!.textContent = "";
      return;
    }
    const modeName = selected.dataset.modeName ?? "";
    const libraryValue = selected.dataset.libraryValue ?? "";
    currentValueEl!.textContent = libraryValue || "значение не получено";
    proposedValueInput!.value = displayValueToHexInput(findLayoutValueForLibraryMode(result, modeName));
  }

  modeSelectEl.addEventListener("change", syncFromModeSelection);

  function selectToken(variableId: string, label: string): void {
    comboInput!.value = label;
    valueFixExtra.dataset.selectedVariableId = variableId;
    setComboboxOpen(combobox!, false);
    const token = currentLibraryTokens.find((t) => t.variableId === variableId) ?? null;
    populateModes(token);
  }

  comboInput.addEventListener("input", () => {
    delete valueFixExtra.dataset.selectedVariableId;
    renderVariableComboboxMenu(combobox, comboInput.value);
    setComboboxOpen(combobox, true);
  });
  comboInput.addEventListener("focus", () => {
    renderVariableComboboxMenu(combobox, comboInput.value);
    setComboboxOpen(combobox, true);
  });
  comboToggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const menu = combobox.querySelector<HTMLElement>(".ds-combobox__menu");
    const willOpen = menu?.hidden !== false;
    if (willOpen) renderVariableComboboxMenu(combobox, comboInput.value);
    setComboboxOpen(combobox, willOpen);
  });

  combobox.addEventListener("click", (event) => {
    const option = (event.target as HTMLElement).closest<HTMLElement>("[data-variable-id]");
    if (option) {
      event.preventDefault();
      event.stopPropagation();
      selectToken(option.dataset.variableId ?? "", option.dataset.label ?? option.textContent ?? "");
    }
  });

  if (initialVariableId) {
    const matched = currentLibraryTokens.find((t) => t.variableId === initialVariableId);
    if (matched) {
      selectToken(matched.variableId, formatLibraryTokenLabel(matched));
    }
  } else if (initialToken) {
    selectToken(initialToken.variableId, formatLibraryTokenLabel(initialToken));
  }

  if (result.decision === "value_fix_proposed" && result.decisionProposedModeId) {
    modeSelectEl.value = result.decisionProposedModeId;
    if (result.decisionCurrentLibraryValue) {
      currentValueEl.textContent = result.decisionCurrentLibraryValue;
    }
    if (result.decisionProposedValue) {
      proposedValueInput.value = result.decisionProposedValue;
    }
    if (result.decisionComment) {
      commentField.value = result.decisionComment;
    }
  }
}

const DROPDOWN_CHEVRON_SVG = `<svg class="ds-dropdown-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;


function filterLibraryTokens(query: string): LibraryToken[] {
  const normalized = query.trim().toLowerCase();
  const semanticTokens = filterSemanticColorTokens(currentLibraryTokens);
  const tokens = normalized
    ? semanticTokens.filter((token) => {
        const label = formatLibraryTokenLabel(token).toLowerCase();
        return (
          label.includes(normalized) ||
          token.name.toLowerCase().includes(normalized) ||
          token.collectionName.toLowerCase().includes(normalized)
        );
      })
    : semanticTokens;
  return tokens.slice(0, 80);
}

/** Компактные свотчи + значения всех режимов библиотеки в пункте combobox. */
function renderLibraryTokenComboboxModesHtml(token: LibraryToken): string {
  const modes = sortModesForDisplay(token.modes);
  if (modes.length === 0) return "";

  const modeItems = modes
    .map((mode) => {
      const label = escapeHtml(mode.modeName);
      if (mode.unresolved) {
        return `<span class="ds-combobox__option-mode"><span class="ds-combobox__option-mode-label">${label}</span><span class="ds-color-swatch ds-color-swatch--compact ds-color-swatch--unknown"></span><span class="ds-combobox__option-mode-value ds-value-meta__caption--warning">—</span></span>`;
      }
      const hex = mode.displayValue.split(" ")[0];
      return `<span class="ds-combobox__option-mode"><span class="ds-combobox__option-mode-label">${label}</span><span class="ds-color-swatch ds-color-swatch--compact" style="background:${escapeHtml(
        hex
      )}"></span><span class="ds-combobox__option-mode-value">${escapeHtml(mode.displayValue)}</span></span>`;
    })
    .join("");

  return `<div class="ds-combobox__option-modes">${modeItems}</div>`;
}

function setComboboxOpen(combobox: HTMLElement, open: boolean): void {
  const menu = combobox.querySelector<HTMLElement>(".ds-combobox__menu");
  const toggle = combobox.querySelector<HTMLButtonElement>(".ds-combobox__toggle");
  const chevron = combobox.querySelector<SVGElement>(".ds-dropdown-chevron");
  if (!menu || !toggle) return;
  menu.hidden = !open;
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
  chevron?.classList.toggle("ds-dropdown-chevron--open", open);
}

/**
 * `onSelect` — опциональный колбэк, вызывается ПОСЛЕ
 * `selectVariableComboboxOption` (т.е. `host.dataset.selectedVariableId`
 * уже выставлен) — используется `setupVariableCombobox`, чтобы включить
 * кнопку «Показать превью» сразу после выбора токена. `setupValueFixExtra`
 * колбэк не передаёт — её поведение не меняется.
 */
function renderVariableComboboxMenu(
  combobox: HTMLElement,
  query: string,
  onSelect?: (variableId: string, label: string) => void
): void {
  const menu = combobox.querySelector<HTMLElement>(".ds-combobox__menu");
  if (!menu) return;

  const tokens = filterLibraryTokens(query);
  if (tokens.length === 0) {
    menu.innerHTML = `<div class="ds-filter-menu__empty">Ничего не найдено</div>`;
    return;
  }

  menu.innerHTML = `
    <div class="ds-filter-menu__list" role="presentation">
      ${tokens
        .map((token) => {
          const label = formatLibraryTokenLabel(token);
          return `
        <button
          type="button"
          class="ds-filter-menu__option ds-filter-menu__option--token"
          role="option"
          data-variable-id="${escapeHtml(token.variableId)}"
          data-label="${escapeHtml(label)}"
        >
          <span class="ds-value-meta__primary">${escapeHtml(token.name)}</span>
          <div class="ds-value-meta__caption">${escapeHtml(token.collectionName)}</div>
          ${renderLibraryTokenComboboxModesHtml(token)}
        </button>`;
        })
        .join("")}
    </div>
  `;

  menu.querySelectorAll<HTMLButtonElement>(".ds-filter-menu__option").forEach((option) => {
    option.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const variableId = option.dataset.variableId ?? "";
      const label = option.dataset.label ?? option.textContent ?? "";
      selectVariableComboboxOption(combobox, variableId, label);
      onSelect?.(variableId, label);
    });
  });
}

function selectVariableComboboxOption(combobox: HTMLElement, variableId: string, label: string): void {
  const input = combobox.querySelector<HTMLInputElement>(".ds-combobox__input");
  const host = combobox.closest<HTMLElement>(".ds-action-extra");
  if (!input || !host || !variableId) return;
  input.value = label;
  host.dataset.selectedVariableId = variableId;
  setComboboxOpen(combobox, false);
}

/**
 * Combobox для решения «Выбрать токен из AID» (mapped). Помимо выбора
 * токена включает кнопку «Показать превью» — доступна сразу после выбора
 * токена в списке, ещё ДО «Применить решение», аналогично тому, как
 * превью доступно для строк с автоматически предложенным токеном (см.
 * canShowPreview). recordId нужен, чтобы отправить build-preview с явным
 * variableId выбранного (но ещё не сохранённого) токена.
 */
function setupVariableCombobox(mappedExtra: HTMLElement, recordId: string, initialVariableId?: string): void {
  mappedExtra.innerHTML = `
    <div class="ds-combobox">
      <input
        type="text"
        class="ds-combobox__input ds-input"
        placeholder="Начните вводить имя токена/стиля..."
        autocomplete="off"
        spellcheck="false"
      />
      <button type="button" class="ds-combobox__toggle" aria-label="Показать переменные" aria-expanded="false">
        ${DROPDOWN_CHEVRON_SVG}
      </button>
      <div class="ds-filter-menu ds-combobox__menu" role="listbox" hidden></div>
    </div>
    <button type="button" class="ds-btn tc-preview-btn tc-mapped-preview-btn" disabled>Показать превью</button>
  `;

  const combobox = mappedExtra.querySelector<HTMLElement>(".ds-combobox");
  const input = mappedExtra.querySelector<HTMLInputElement>(".ds-combobox__input");
  const toggle = mappedExtra.querySelector<HTMLButtonElement>(".ds-combobox__toggle");
  const previewBtn = mappedExtra.querySelector<HTMLButtonElement>(".tc-mapped-preview-btn");
  if (!combobox || !input || !toggle || !previewBtn) return;

  function syncPreviewButtonState(): void {
    previewBtn!.disabled = !mappedExtra.dataset.selectedVariableId || previewInFlight;
  }

  previewBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const variableId = mappedExtra.dataset.selectedVariableId;
    if (!variableId) return;
    requestPreview(recordId, { variableId });
  });

  input.addEventListener("input", () => {
    delete mappedExtra.dataset.selectedVariableId;
    syncPreviewButtonState();
    renderVariableComboboxMenu(combobox, input.value, syncPreviewButtonState);
    setComboboxOpen(combobox, true);
  });

  input.addEventListener("focus", () => {
    renderVariableComboboxMenu(combobox, input.value, syncPreviewButtonState);
    setComboboxOpen(combobox, true);
  });

  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const menu = combobox.querySelector<HTMLElement>(".ds-combobox__menu");
    const willOpen = menu?.hidden !== false;
    if (willOpen) renderVariableComboboxMenu(combobox, input.value, syncPreviewButtonState);
    setComboboxOpen(combobox, willOpen);
  });

  if (initialVariableId) {
    const matchedToken = currentLibraryTokens.find((token) => token.variableId === initialVariableId);
    if (matchedToken) {
      selectVariableComboboxOption(combobox, matchedToken.variableId, formatLibraryTokenLabel(matchedToken));
    }
  }
  syncPreviewButtonState();
}

function initComboboxGlobalHandlers(): void {
  document.addEventListener("click", (event) => {
    const target = event.target as Node;
    document.querySelectorAll<HTMLElement>(".ds-combobox").forEach((combobox) => {
      if (!combobox.contains(target)) setComboboxOpen(combobox, false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    document.querySelectorAll<HTMLElement>(".ds-combobox").forEach((combobox) => {
      setComboboxOpen(combobox, false);
    });
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Порядок отображения режимов в ячейках «Сейчас»/«Предлагаем»: сперва
 * Day/Light, затем Night/Dark, остальные — в исходном порядке. Названия
 * режимов берутся из данных как есть (Driver: Day/Night), сортировка не
 * привязана к конкретной терминологии продукта.
 */
function sortModesForDisplay<T extends { modeName: string }>(modes: T[]): T[] {
  return sortModesStable(modes);
}

/** Одна строка «Day #hex» / «Night #hex» внутри ячейки «Сейчас»/«Предлагаем». */
function renderModeValueLines(
  modes: Array<{ modeName: string; displayValue: string; unresolved?: boolean }>,
  options?: { styleSwatch?: boolean }
): string {
  const swatchClass = options?.styleSwatch ? "ds-color-swatch ds-color-swatch--style" : "ds-color-swatch";
  return sortModesForDisplay(modes)
    .map((mode) => {
      const label = escapeHtml(mode.modeName);
      if (mode.unresolved) {
        return `<div class="ds-value-meta__mode-row"><span class="ds-value-meta__mode-label">${label}</span><span class="${swatchClass} ds-color-swatch--unknown"></span><span class="ds-value-meta__mode-value ds-value-meta__caption--warning">значение не получено</span></div>`;
      }

      const hex = mode.displayValue.split(" ")[0];
      return `<div class="ds-value-meta__mode-row"><span class="ds-value-meta__mode-label">${label}</span><span class="${swatchClass}" style="background:${escapeHtml(
        hex
      )}"></span><span class="ds-value-meta__mode-value">${escapeHtml(mode.displayValue)}</span></div>`;
    })
    .join("");
}

function renderBeforeCellHtml(result: ComparisonResult): string {
  const bindingLabel = BINDING_LABELS[result.bindingType] ?? result.bindingType;
  const primary = result.sourceName ? escapeHtml(result.sourceName) : escapeHtml(result.displayValue);
  const styleSwatch = result.bindingType === "style";
  const swatchClass = styleSwatch ? "ds-color-swatch ds-color-swatch--style" : "ds-color-swatch";

  if (result.modeValues && result.modeValues.length > 0) {
    const modesHtml = renderModeValueLines(result.modeValues, { styleSwatch });
    return `<span class="ds-value-meta__primary">${primary}</span>${modesHtml}<div class="ds-value-meta__caption">${escapeHtml(
      bindingLabel
    )} · слоёв: ${result.count}</div>`;
  }

  const hex = String((result.comparisonValue as { hex?: string }).hex ?? "");
  const caption = result.sourceName
    ? `${bindingLabel} · ${escapeHtml(result.displayValue)} · слоёв: ${result.count}`
    : `${bindingLabel} · слоёв: ${result.count}`;

  return `<div class="ds-value-meta__head"><span class="${swatchClass}" style="background:${hex}"></span><span class="ds-value-meta__primary">${primary}</span></div><div class="ds-value-meta__caption">${caption}</div>`;
}

function renderTargetCellHtml(result: ComparisonResult): string {
  const target = result.target;
  if (!target) {
    return `<span class="ds-value-meta__caption">нет совпадения</span>`;
  }

  const modes =
    target.allModes && target.allModes.length > 0
      ? target.allModes
      : [
          {
            modeName: target.modeName,
            displayValue: target.displayValue,
            unresolved: target.valueUnresolved,
          },
        ];
  const modesHtml = renderModeValueLines(modes);

  return `<span class="ds-value-meta__primary">${escapeHtml(target.name)}</span>${modesHtml}<div class="ds-value-meta__caption">${escapeHtml(
    target.collectionName
  )}</div>`;
}

function setSelectedRow(recordId: string): void {
  selectedRecordId = recordId;
  const tbodySelector = `#tc-results-tbody-${activeCategory}`;
  document.querySelectorAll<HTMLTableRowElement>(`${tbodySelector} tr[data-record-id]`).forEach((row) => {
    row.classList.toggle("ds-row-selected", row.dataset.recordId === recordId);
  });
  updateApplyButtonState();
}

function updateApplyButtonState(): void {
  const hasControls = Boolean(selectedRecordId && rowControls.has(selectedRecordId));
  $<HTMLButtonElement>("tc-apply-decision-btn").disabled = !hasControls;
}

/**
 * Сводка над таблицей — одна для всех категорий.
 *
 * Раньше типографика выходила раньше и показывала только общее число: без
 * счётчика «обработано» и без учёта фильтра, которого у неё и не было.
 */
function renderResultsSummary(): void {
  const total = currentResults.length;
  const emptyText = !scannedCategories.has(activeCategory)
    ? NOT_SCANNED_TEXT
    : activeCategory === "typography"
      ? "Расхождений в типографике нет. Запустите сканирование после изменений в макете."
      : activeCategory === "icons"
        ? "Расхождений в иконках нет. Запустите сканирование после изменений в макете."
        : "Расхождений нет. Запустите сканирование после изменений в макете.";

  const visible = getFilteredResults();
  const visibleCount = visible.length;
  const decided = visible.filter((r) => r.decision).length;

  if (total === 0) {
    $("tc-results-summary").textContent = emptyText;
    return;
  }

  if (visibleCount === 0) {
    $("tc-results-summary").textContent = `Скрыты все ${total} — выберите статусы в фильтре колонки «Статус».`;
    return;
  }

  if (isStatusFilterPartial()) {
    $("tc-results-summary").textContent = `${visibleCount} из ${total} (часть скрыта фильтром), обработано: ${decided}/${visibleCount}`;
    return;
  }

  $("tc-results-summary").textContent = `${total} ${pluralizeIssues(total)}, обработано: ${decided}/${total}`;
}

const TYPOGRAPHY_STATUS_SORT_ORDER: Record<StatusFilterKey, number> = {
  "hardcoded-no-analog": 0,
  "mixed-unresolved": 1,
  "ghost-binding": 2,
  "name-mismatch": 3,
  conflict: 4,
  "name-match": 5,
  exact: 6,
  value: 6,
  mapped: 7,
  "style-binding": 8,
  "name-match-unresolved": 9,
  approximate: 10,
  "layout-only": 11,
  detached: 12,
};

function typographyResultsHaveFontSizeMismatch(result: ComparisonResult): boolean {
  return result.mismatchedProperties?.includes("fontSize") === true;
}

function compareTypographyResults(a: ComparisonResult, b: ComparisonResult): number {
  const keyA = getResultStatusFilterKey(a);
  const keyB = getResultStatusFilterKey(b);
  const orderDiff = (TYPOGRAPHY_STATUS_SORT_ORDER[keyA] ?? 99) - (TYPOGRAPHY_STATUS_SORT_ORDER[keyB] ?? 99);
  if (orderDiff !== 0) return orderDiff;

  if (keyA === "conflict" || keyA === "name-match") {
    const fontSizeDiff =
      Number(typographyResultsHaveFontSizeMismatch(b)) - Number(typographyResultsHaveFontSizeMismatch(a));
    if (fontSizeDiff !== 0) return fontSizeDiff;
  }

  return (a.representativeNodeName || "").localeCompare(b.representativeNodeName || "", "ru");
}

function formatPartiallyMixedHint(value: TypographyComparisonValue): string {
  if (!value.partiallyMixed) return "";
  const fields = value.partiallyMixedFields ?? [];
  const labels: string[] = [];
  if (fields.includes("letterSpacing")) labels.push("spacing");
  if (fields.includes("textCase")) labels.push("case");
  if (fields.includes("textDecoration")) labels.push("decoration");
  if (labels.length === 0) return " · mixed fmt";
  return ` · mixed ${labels.join(", ")}`;
}

function formatTypographyPropertySummary(value: TypographyComparisonValue | null): string {
  if (!value) return "";
  const weightLabel = value.fontWeightApproximate ? `w${value.fontWeight}≈` : `w${value.fontWeight}`;
  return `${value.fontFamily} · ${value.fontSize}px · ${weightLabel}${formatPartiallyMixedHint(value)}`;
}

function renderTypographyUsedStyleCell(result: ComparisonResult): string {
  const value = readTypographyComparisonValue(result.comparisonValue);
  const summary = formatTypographyPropertySummary(value);
  if (result.bindingType === "hardcoded") {
    const hardcodedSummary = summary || escapeHtml(result.displayValue);
    return `<div>— (hardcoded)</div><div class="ds-value-meta__caption">${hardcodedSummary}</div>`;
  }
  const styleName = result.sourceName ? escapeHtml(result.sourceName) : "—";
  const summaryHtml = summary ? `<div class="ds-value-meta__caption">${escapeHtml(summary)}</div>` : "";
  return `<div>${styleName}</div>${summaryHtml}`;
}

function renderTypographyTargetStyleCell(result: ComparisonResult): string {
  if (!result.target) {
    return "—";
  }
  const styleName = result.target.name?.trim() ? escapeHtml(result.target.name) : "—";
  const displayValue = result.target.displayValue?.trim();
  const summaryHtml = displayValue
    ? `<div class="ds-value-meta__caption">${escapeHtml(displayValue)}</div>`
    : "";
  return `<div>${styleName}</div>${summaryHtml}`;
}


function filterLibraryTextStyles(query: string): LibraryTextStyle[] {
  const normalized = query.trim().toLowerCase();
  const styles = filterSemanticTypographyStyles(currentLibraryTextStyles);
  const filtered = normalized
    ? styles.filter((style) => style.name.toLowerCase().includes(normalized))
    : styles;
  return filtered.slice(0, 80);
}

function renderTextStyleComboboxMenu(
  combobox: HTMLElement,
  query: string,
  onSelect?: (styleId: string, label: string) => void
): void {
  const menu = combobox.querySelector<HTMLElement>(".ds-combobox__menu");
  if (!menu) return;
  const styles = filterLibraryTextStyles(query);
  if (styles.length === 0) {
    menu.innerHTML = `<div class="ds-filter-menu__empty">Стили текста не найдены</div>`;
    return;
  }
  menu.innerHTML = `
    <div class="ds-filter-menu__options">
      ${styles
        .map(
          (style) => `
        <button
          type="button"
          class="ds-filter-menu__option"
          role="option"
          data-style-id="${escapeHtml(style.nodeId)}"
          data-label="${escapeHtml(formatLibraryTextStyleLabel(style))}"
        >
          <span class="ds-value-meta__primary">${escapeHtml(style.name)}</span>
          <div class="ds-value-meta__caption">${escapeHtml(style.displayValue)}</div>
        </button>`
        )
        .join("")}
    </div>
  `;
  menu.querySelectorAll<HTMLButtonElement>(".ds-filter-menu__option").forEach((option) => {
    option.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const styleId = option.dataset.styleId ?? "";
      const label = option.dataset.label ?? "";
      selectTextStyleComboboxOption(combobox, styleId, label);
      onSelect?.(styleId, label);
    });
  });
}

function selectTextStyleComboboxOption(combobox: HTMLElement, styleId: string, label: string): void {
  const input = combobox.querySelector<HTMLInputElement>(".ds-combobox__input");
  const host = combobox.closest<HTMLElement>(".ds-action-extra");
  if (!input || !host || !styleId) return;
  input.value = label;
  host.dataset.selectedStyleId = styleId;
  setComboboxOpen(combobox, false);
}

/**
 * Combobox для решения «Выбрать стиль из AID». Как и у цветов, кнопка
 * «Показать превью» доступна сразу после выбора стиля, ещё ДО «Применить
 * решение» — превью строится по явному `styleId` выбранного стиля.
 */
function setupTextStyleCombobox(mappedExtra: HTMLElement, recordId: string, initialStyleId?: string): void {
  mappedExtra.innerHTML = `
    <div class="ds-combobox">
      <input
        type="text"
        class="ds-combobox__input ds-input"
        placeholder="Начните вводить имя стиля..."
        autocomplete="off"
        spellcheck="false"
      />
      <button type="button" class="ds-combobox__toggle" aria-label="Показать стили текста" aria-expanded="false">
        ${DROPDOWN_CHEVRON_SVG}
      </button>
      <div class="ds-filter-menu ds-combobox__menu" role="listbox" hidden></div>
    </div>
    <button type="button" class="ds-btn tc-preview-btn tc-mapped-preview-btn" disabled>Показать превью</button>
  `;

  const combobox = mappedExtra.querySelector<HTMLElement>(".ds-combobox");
  const input = mappedExtra.querySelector<HTMLInputElement>(".ds-combobox__input");
  const toggle = mappedExtra.querySelector<HTMLButtonElement>(".ds-combobox__toggle");
  const previewBtn = mappedExtra.querySelector<HTMLButtonElement>(".tc-mapped-preview-btn");
  if (!combobox || !input || !toggle || !previewBtn) return;

  function syncPreviewButtonState(): void {
    previewBtn!.disabled = !mappedExtra.dataset.selectedStyleId || previewInFlight;
  }

  previewBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const styleId = mappedExtra.dataset.selectedStyleId;
    if (!styleId) return;
    requestPreview(recordId, { styleId });
  });

  input.addEventListener("input", () => {
    delete mappedExtra.dataset.selectedStyleId;
    syncPreviewButtonState();
    renderTextStyleComboboxMenu(combobox, input.value, syncPreviewButtonState);
    setComboboxOpen(combobox, true);
  });
  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const open = toggle.getAttribute("aria-expanded") !== "true";
    if (open) renderTextStyleComboboxMenu(combobox, input.value, syncPreviewButtonState);
    setComboboxOpen(combobox, open);
  });

  if (initialStyleId) {
    const initialStyle = currentLibraryTextStyles.find((style) => style.nodeId === initialStyleId);
    if (initialStyle) {
      selectTextStyleComboboxOption(combobox, initialStyle.nodeId, formatLibraryTextStyleLabel(initialStyle));
      syncPreviewButtonState();
    }
  }
}

function setupTypographyValueFixExtra(result: ComparisonResult, valueFixExtra: HTMLElement): void {
  const layoutValue = readTypographyComparisonValue(result.comparisonValue);
  const targetStyle = result.target
    ? currentLibraryTextStyles.find(
        (style) => style.nodeId === result.target!.styleId || style.key === result.target!.styleKey
      )
    : undefined;
  valueFixExtra.innerHTML = `
    <div class="ds-value-meta__caption">Текущая типографика библиотеки</div>
    <div class="ds-value-meta__primary">${escapeHtml(targetStyle?.displayValue ?? result.target?.displayValue ?? "—")}</div>
    <div class="ds-value-meta__caption">Предлагаемая типографика (из макета)</div>
    <div class="ds-value-meta__primary">${escapeHtml(
      layoutValue ? formatTypographyDisplayValue(layoutValue) : result.displayValue
    )}</div>
    <textarea rows="2" placeholder="Комментарий (необязательно)" class="tc-value-fix-comment ds-textarea"></textarea>
  `;
  if (targetStyle) {
    valueFixExtra.dataset.selectedStyleId = targetStyle.nodeId;
  }
}

function buildTypographyActionCell(result: ComparisonResult): HTMLTableCellElement {
  const cell = document.createElement("td");
  const wrap = document.createElement("div");
  wrap.className = "ds-action-cell";

  const select = document.createElement("select");
  select.className = "ds-select";
  ACTION_OPTIONS.forEach((option) => {
    if (option.value === "value_fix_proposed" && !canProposeValueFix(result)) return;
    if (option.value === "mapped_suggested" && !canUseSuggestedToken(result)) return;
    const opt = document.createElement("option");
    opt.value = option.value;
    opt.textContent =
      option.value === "mapped" && (result.category === "typography" || activeCategory === "typography")
        ? "Выбрать стиль из AID"
        : option.label;
    select.appendChild(opt);
  });
  if (result.decision) select.value = result.decision;
  wrap.appendChild(select);

  if (canShowPreview(result, "typography")) {
    const previewBtn = document.createElement("button");
    previewBtn.type = "button";
    previewBtn.className = "ds-btn tc-preview-btn";
    previewBtn.textContent = "Показать превью";
    previewBtn.disabled = previewInFlight;
    previewBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      requestPreview(result.id);
    });
    wrap.appendChild(previewBtn);
  }

  if (canApplyToLayout(result)) {
    const applyLayoutBtn = document.createElement("button");
    applyLayoutBtn.type = "button";
    applyLayoutBtn.className = "ds-btn tc-apply-layout-btn";
    applyLayoutBtn.textContent = "Применить в макет";
    applyLayoutBtn.disabled = applyToLayoutInFlight;
    applyLayoutBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openApplyToLayoutModal(result);
    });
    wrap.appendChild(applyLayoutBtn);
  }

  const mappedExtra = document.createElement("div");
  mappedExtra.className = "ds-action-extra";
  setupTextStyleCombobox(mappedExtra, result.id, result.decisionTargetStyleId);
  wrap.appendChild(mappedExtra);

  const commentExtra = document.createElement("div");
  commentExtra.className = "ds-action-extra";
  commentExtra.innerHTML = `<textarea rows="2" placeholder="Комментарий (обязателен)" class="tc-comment-input ds-textarea"></textarea>`;
  wrap.appendChild(commentExtra);

  const valueFixExtra = document.createElement("div");
  valueFixExtra.className = "ds-action-extra";
  if (canProposeValueFix(result)) {
    setupTypographyValueFixExtra(result, valueFixExtra);
  }
  wrap.appendChild(valueFixExtra);

  if (result.applyPartial) {
    const partialNote = document.createElement("div");
    partialNote.className = "ds-status-line ds-status-line--warning";
    partialNote.textContent = "Применено частично: часть слоёв группы осталась без изменений.";
    wrap.appendChild(partialNote);
  }

  function syncExtraVisibility(): void {
    mappedExtra.classList.toggle("visible", select.value === "mapped");
    commentExtra.classList.toggle("visible", select.value === "ignored");
    valueFixExtra.classList.toggle("visible", select.value === "value_fix_proposed");
  }
  select.addEventListener("change", syncExtraVisibility);
  syncExtraVisibility();

  if (result.decisionComment && result.decision === "ignored") {
    (commentExtra.querySelector(".tc-comment-input") as HTMLTextAreaElement).value = result.decisionComment;
  }

  rowControls.set(result.id, { select, mappedExtra, commentExtra, valueFixExtra });
  cell.appendChild(wrap);
  return cell;
}

function buildTypographyResultRow(result: ComparisonResult): HTMLTableRowElement {
  const row = document.createElement("tr");
  row.dataset.recordId = result.id;

  const statusCell = document.createElement("td");
  const statusBadges = document.createElement("div");
  statusBadges.className = "ds-status-cell";
  statusCell.appendChild(statusBadges);
  statusBadges.appendChild(createStatusBadge(result));
  if (result.isOverride) {
    statusBadges.appendChild(
      createSecondaryBadge(
        "Переопределён",
        "neutral",
        "Override — типографика слоя отличается от мастер-компонента или связанного с ним стиля текста."
      )
    );
  }
  if (result.decision && result.decision !== "value_fix_proposed") {
    statusBadges.appendChild(createDecisionCheck(result.decision));
  }
  if (result.decisionSource === "registry") {
    statusBadges.appendChild(createRegistryDecisionBadge());
  }
  const proposalStatus = result.decisionSource === "registry" ? undefined : proposalStatuses[result.id];
  if (proposalStatus) {
    statusBadges.appendChild(createProposalStatusBadge(proposalStatus));
  }
  if (result.applyPartial) {
    statusBadges.appendChild(
      createSecondaryBadge("Применено частично", "warning", "Стиль применён не ко всем слоям группы.")
    );
  }
  row.appendChild(statusCell);

  const layerCell = document.createElement("td");
  const layerLink = document.createElement("button");
  layerLink.type = "button";
  layerLink.className = "ds-accent-link ds-layer-name";
  layerLink.title = "Перейти к слою в макете";
  layerLink.textContent = result.representativeNodeName || "(без имени)";
  layerLink.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    post({ type: "select-nodes", payload: { nodeIds: result.nodeIds } });
  });
  layerCell.appendChild(layerLink);
  const path = document.createElement("div");
  path.className = "ds-value-meta__caption ds-value-meta__caption--path";
  path.textContent = result.representativeNodePath;
  path.title = result.representativeNodePath;
  layerCell.appendChild(path);
  row.appendChild(layerCell);

  row.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target.closest("button, select, input, textarea, option, datalist")) return;
    setSelectedRow(result.id);
  });

  const usedStyleCell = document.createElement("td");
  usedStyleCell.innerHTML = renderTypographyUsedStyleCell(result);
  row.appendChild(usedStyleCell);

  const targetCell = document.createElement("td");
  targetCell.innerHTML = renderTypographyTargetStyleCell(result);
  row.appendChild(targetCell);

  const mismatchCell = document.createElement("td");
  mismatchCell.textContent =
    result.mismatchedProperties && result.mismatchedProperties.length > 0
      ? result.mismatchedProperties.join(", ")
      : "—";
  row.appendChild(mismatchCell);

  row.appendChild(buildTypographyActionCell(result));

  return row;
}

function renderTypographyResultsTable(preferredSelectedId?: string): void {
  const tbody = $("tc-results-tbody-typography");
  tbody.innerHTML = "";
  rowControls.clear();
  selectedRecordId = null;
  updateStatusFilterIndicator();
  renderResultsSummary();

  if (currentResults.length === 0) {
    const libraryHint =
      currentLibraryTextStyles.length === 0 ? " Загрузите библиотеку со стилями текста." : "";
    appendEmptyStateRow(
      tbody,
      scannedCategories.has("typography")
        ? `Расхождений нет: стили текста совпадают с библиотекой.${libraryHint} Запустите сканирование заново после изменений в макете.`
        : NOT_SCANNED_TEXT
    );
    updateApplyButtonState();
    return;
  }

  const visibleResults = [...getFilteredResults()].sort(compareTypographyResults);

  if (visibleResults.length === 0) {
    appendEmptyStateRow(
      tbody,
      "Нет строк для выбранных статусов. Откройте фильтр в колонке «Статус» и выберите нужные."
    );
    updateApplyButtonState();
    return;
  }

  for (const result of visibleResults) {
    tbody.appendChild(buildTypographyResultRow(result));
  }

  restorePreferredSelection(preferredSelectedId, visibleResults);
}

/** Пустая строка-заглушка на всю ширину таблицы. */
function appendEmptyStateRow(tbody: HTMLElement, text: string): void {
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = 6;
  cell.className = "ds-empty-state";
  cell.textContent = text;
  row.appendChild(cell);
  tbody.appendChild(row);
}

/**
 * Восстанавливает выделение строки после перерисовки — и только его.
 *
 * Раньше при отсутствии предпочтения выделялась первая строка, и «Применить
 * решение» оказывалась активной для строки, которую пользователь не выбирал:
 * один клик по кнопке записывал решение по случайной строке в постоянную
 * историю и в очередь на согласование.
 */
function restorePreferredSelection(
  preferredSelectedId: string | undefined,
  visibleResults: ComparisonResult[]
): void {
  if (preferredSelectedId && visibleResults.some((item) => item.id === preferredSelectedId)) {
    setSelectedRow(preferredSelectedId);
    return;
  }
  updateApplyButtonState();
}

// ---------------------------------------------------------------------------
// Иконки (v1.5.0): таблица, превью, выбор иконки, решение
// ---------------------------------------------------------------------------

/** Превью иконки: SVG по контуру из геометрии. Нет контура — пустая рамка. */
function iconPreviewHtml(outline: IconOutline | undefined, label: string): string {
  if (!outline || outline.paths.length === 0) {
    return `<span class="tc-icon-preview tc-icon-preview--empty" role="img" aria-label="${escapeHtml(label)}"></span>`;
  }
  const paths = outline.paths
    .map(
      (path) =>
        `<path d="${escapeHtml(path.d)}" fill="currentColor"${path.evenOdd ? ' fill-rule="evenodd"' : ""}/>`
    )
    .join("");
  return `<svg class="tc-icon-preview" viewBox="${outline.viewBox.join(" ")}" role="img" aria-label="${escapeHtml(
    label
  )}">${paths}</svg>`;
}

const ICON_STATUS_SORT_ORDER: Partial<Record<StatusFilterKey, number>> = {
  detached: 0,
  value: 1,
  conflict: 2,
  approximate: 3,
  "layout-only": 4,
  "hardcoded-no-analog": 5,
  exact: 6,
};

function compareIconResults(a: ComparisonResult, b: ComparisonResult): number {
  const order = (result: ComparisonResult) => ICON_STATUS_SORT_ORDER[getResultStatusFilterKey(result)] ?? 9;
  return order(a) - order(b) || b.count - a.count;
}

function buildIconResultRow(result: ComparisonResult): HTMLTableRowElement {
  const row = document.createElement("tr");
  row.dataset.recordId = result.id;
  const icon = result.icon;

  const statusCell = document.createElement("td");
  const statusBadges = document.createElement("div");
  statusBadges.className = "ds-status-cell";
  statusCell.appendChild(statusBadges);
  statusBadges.appendChild(createStatusBadge(result));
  if (icon?.nonstandardSize) {
    statusBadges.appendChild(
      createSecondaryBadge(
        "Нестандартный размер",
        "neutral",
        "Иконка растянута не по размеру компонента библиотеки. Это может быть и ошибкой, и осознанным решением."
      )
    );
  }
  if (icon?.multiLayer) {
    statusBadges.appendChild(
      createSecondaryBadge(
        "Из нескольких слоёв",
        "warning",
        `Иконка собрана из ${icon.layers} ${pluralizeLayers(icon.layers)}, а в библиотеке она цельная. Скорее всего это ошибка сборки, но бывает и намеренно.`
      )
    );
  }
  if (icon?.disputed) {
    const names = icon.alternatives.map((alt) => `${alt.name} (${Math.round(alt.similarity * 100)}%)`).join(", ");
    statusBadges.appendChild(
      createSecondaryBadge("Спорный вариант", "warning", `По форме подходят несколько иконок библиотеки: ${names}. Выберите нужную.`)
    );
  }
  if (result.decision) statusBadges.appendChild(createDecisionCheck(result.decision));
  if (result.decisionSource === "registry") statusBadges.appendChild(createRegistryDecisionBadge());
  row.appendChild(statusCell);

  const iconCell = document.createElement("td");
  const cellWrap = document.createElement("div");
  cellWrap.className = "tc-icon-cell";
  cellWrap.innerHTML = iconPreviewHtml(icon?.outline, `Иконка в макете: ${result.representativeNodeName}`);
  const textWrap = document.createElement("div");
  textWrap.className = "tc-icon-cell__text";
  const layerLink = document.createElement("button");
  layerLink.type = "button";
  layerLink.className = "ds-accent-link ds-layer-name";
  layerLink.title = "Перейти к слою в макете";
  layerLink.textContent = result.representativeNodeName || "(без имени)";
  layerLink.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    post({ type: "select-nodes", payload: { nodeIds: result.nodeIds } });
  });
  textWrap.appendChild(layerLink);
  const path = document.createElement("div");
  path.className = "ds-value-meta__caption ds-value-meta__caption--path";
  path.textContent = result.representativeNodePath;
  path.title = result.representativeNodePath;
  textWrap.appendChild(path);
  cellWrap.appendChild(textWrap);
  iconCell.appendChild(cellWrap);
  row.appendChild(iconCell);

  row.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target.closest("button, select, input, textarea, option, datalist")) return;
    setSelectedRow(result.id);
  });

  const currentCell = document.createElement("td");
  currentCell.innerHTML = `<div class="ds-value-meta__primary">${escapeHtml(result.displayValue)}</div>`;
  row.appendChild(currentCell);

  const targetCell = document.createElement("td");
  if (result.target) {
    const similarity = icon?.similarity !== undefined ? `форма совпадает на ${Math.round(icon.similarity * 100)}%` : "";
    targetCell.innerHTML = `<div class="tc-icon-cell">${iconPreviewHtml(
      icon?.targetOutline,
      `Иконка библиотеки: ${result.target.name}`
    )}<div class="tc-icon-cell__text"><div class="ds-value-meta__primary">${escapeHtml(
      result.target.name
    )}</div><div class="ds-value-meta__caption">${escapeHtml(similarity)}</div></div></div>`;
  } else {
    targetCell.innerHTML = `<div class="ds-value-meta__caption">нет совпадения</div>`;
  }
  row.appendChild(targetCell);

  const usesCell = document.createElement("td");
  usesCell.textContent = String(result.count);
  row.appendChild(usesCell);

  row.appendChild(buildIconActionCell(result));
  return row;
}

const ICON_ACTION_OPTIONS: Array<{ value: Decision; label: string }> = [
  { value: "mapped_suggested", label: "Использовать предложенную" },
  { value: "mapped", label: "Выбрать иконку из AID" },
  { value: "ignored", label: "Игнорировать" },
  { value: "candidate", label: "Кандидат на новую иконку" },
];

function iconSummaryName(icon: LibraryIconSummary): string {
  return icon.setName ? `${icon.setName} / ${icon.name}` : icon.name;
}

function filterLibraryIcons(query: string): LibraryIconSummary[] {
  const normalized = query.trim().toLowerCase();
  const icons = normalized
    ? currentLibraryIcons.filter((icon) => iconSummaryName(icon).toLowerCase().includes(normalized))
    : currentLibraryIcons;
  return icons.slice(0, 80);
}

function renderIconComboboxMenu(combobox: HTMLElement, query: string): void {
  const menu = combobox.querySelector<HTMLElement>(".ds-combobox__menu");
  if (!menu) return;
  const icons = filterLibraryIcons(query);
  if (icons.length === 0) {
    menu.innerHTML = `<div class="ds-filter-menu__empty">Иконки не найдены</div>`;
    return;
  }
  menu.innerHTML = `
    <div class="ds-filter-menu__options">
      ${icons
        .map((icon) => {
          const name = iconSummaryName(icon);
          return `
        <button type="button" class="ds-filter-menu__option tc-icon-cell" role="option" data-component-key="${escapeHtml(
          icon.key
        )}" data-label="${escapeHtml(name)}">
          ${iconPreviewHtml(icon.outline, name)}
          <span class="ds-value-meta__primary">${escapeHtml(name)}</span>
        </button>`;
        })
        .join("")}
    </div>
  `;
  menu.querySelectorAll<HTMLButtonElement>(".ds-filter-menu__option").forEach((option) => {
    option.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const input = combobox.querySelector<HTMLInputElement>(".ds-combobox__input");
      const host = combobox.closest<HTMLElement>(".ds-action-extra");
      const key = option.dataset.componentKey;
      if (!input || !host || !key) return;
      input.value = option.dataset.label ?? "";
      host.dataset.selectedComponentKey = key;
      setComboboxOpen(combobox, false);
    });
  });
}

function setupIconCombobox(mappedExtra: HTMLElement, initialKey?: string): void {
  mappedExtra.innerHTML = `
    <div class="ds-combobox">
      <input type="text" class="ds-combobox__input ds-input" placeholder="Начните вводить имя иконки..." autocomplete="off" spellcheck="false" />
      <button type="button" class="ds-combobox__toggle" aria-label="Показать иконки" aria-expanded="false">
        ${DROPDOWN_CHEVRON_SVG}
      </button>
      <div class="ds-filter-menu ds-combobox__menu" role="listbox" hidden></div>
    </div>
  `;
  const combobox = mappedExtra.querySelector<HTMLElement>(".ds-combobox");
  const input = mappedExtra.querySelector<HTMLInputElement>(".ds-combobox__input");
  const toggle = mappedExtra.querySelector<HTMLButtonElement>(".ds-combobox__toggle");
  if (!combobox || !input || !toggle) return;

  input.addEventListener("input", () => {
    delete mappedExtra.dataset.selectedComponentKey;
    renderIconComboboxMenu(combobox, input.value);
    setComboboxOpen(combobox, true);
  });
  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const open = toggle.getAttribute("aria-expanded") !== "true";
    if (open) renderIconComboboxMenu(combobox, input.value);
    setComboboxOpen(combobox, open);
  });

  const initial = initialKey ? currentLibraryIcons.find((icon) => icon.key === initialKey) : undefined;
  if (initial) {
    input.value = iconSummaryName(initial);
    mappedExtra.dataset.selectedComponentKey = initial.key;
  }
}

function buildIconActionCell(result: ComparisonResult): HTMLTableCellElement {
  const cell = document.createElement("td");
  const wrap = document.createElement("div");
  wrap.className = "ds-action-cell";

  const select = document.createElement("select");
  select.className = "ds-select";
  for (const option of ICON_ACTION_OPTIONS) {
    if (option.value === "mapped_suggested" && !result.target?.componentKey) continue;
    const opt = document.createElement("option");
    opt.value = option.value;
    opt.textContent = option.label;
    select.appendChild(opt);
  }
  if (result.decision && [...select.options].some((opt) => opt.value === result.decision)) {
    select.value = result.decision;
  }
  wrap.appendChild(select);

  const mappedExtra = document.createElement("div");
  mappedExtra.className = "ds-action-extra";
  setupIconCombobox(mappedExtra, result.decisionTargetComponentKey);
  wrap.appendChild(mappedExtra);

  const commentExtra = document.createElement("div");
  commentExtra.className = "ds-action-extra";
  commentExtra.innerHTML = `<textarea rows="2" placeholder="Комментарий (обязателен)" class="tc-comment-input ds-textarea"></textarea>`;
  wrap.appendChild(commentExtra);

  // Правки значения у иконок нет — пустой блок держит общий формат RowControls.
  const valueFixExtra = document.createElement("div");
  valueFixExtra.className = "ds-action-extra";

  const syncExtraVisibility = (): void => {
    mappedExtra.classList.toggle("visible", select.value === "mapped");
    commentExtra.classList.toggle("visible", select.value === "ignored");
  };
  select.addEventListener("change", syncExtraVisibility);
  syncExtraVisibility();

  if (result.decisionComment && result.decision === "ignored") {
    (commentExtra.querySelector(".tc-comment-input") as HTMLTextAreaElement).value = result.decisionComment;
  }

  rowControls.set(result.id, { select, mappedExtra, commentExtra, valueFixExtra });
  cell.appendChild(wrap);
  return cell;
}

function applyIconDecision(
  result: ComparisonResult,
  select: HTMLSelectElement,
  mappedExtra: HTMLElement,
  commentExtra: HTMLElement
): void {
  const decision = select.value as Decision;
  const review = buildSourceReviewContext(result);

  if (decision === "mapped_suggested") {
    if (!result.target?.componentKey) {
      showError("Для этой иконки нет предложенной — выберите «Выбрать иконку из AID».");
      return;
    }
    post({
      type: "apply-decision",
      payload: {
        recordId: result.id,
        decision,
        category: "icons",
        targetComponentKey: result.target.componentKey,
        targetComponentName: result.target.name,
        targetName: result.target.name,
        ...review,
      },
    });
    return;
  }

  if (decision === "mapped") {
    const key = mappedExtra.dataset.selectedComponentKey;
    const icon = key ? currentLibraryIcons.find((item) => item.key === key) : undefined;
    if (!icon) {
      showError("Выберите иконку из списка AID.");
      return;
    }
    post({
      type: "apply-decision",
      payload: {
        recordId: result.id,
        decision,
        category: "icons",
        targetComponentKey: icon.key,
        targetComponentName: iconSummaryName(icon),
        targetName: iconSummaryName(icon),
        ...review,
      },
    });
    return;
  }

  if (decision === "ignored") {
    const comment = (commentExtra.querySelector(".tc-comment-input") as HTMLTextAreaElement).value.trim();
    if (!comment) {
      showError("Для решения «Игнорировать» комментарий обязателен.");
      return;
    }
    post({ type: "apply-decision", payload: { recordId: result.id, decision, category: "icons", comment, ...review } });
    return;
  }

  post({ type: "apply-decision", payload: { recordId: result.id, decision, category: "icons", ...review } });
}

function renderIconResultsTable(preferredSelectedId?: string): void {
  const tbody = $("tc-results-tbody-icons");
  tbody.innerHTML = "";
  rowControls.clear();
  selectedRecordId = null;
  updateStatusFilterIndicator();
  renderResultsSummary();

  if (currentResults.length === 0) {
    appendEmptyStateRow(
      tbody,
      scannedCategories.has("icons")
        ? "Расхождений нет: иконки в макете — из выбранной библиотеки. Запустите сканирование заново после изменений в макете."
        : NOT_SCANNED_TEXT
    );
    updateApplyButtonState();
    return;
  }

  const visibleResults = [...getFilteredResults()].sort(compareIconResults);
  if (visibleResults.length === 0) {
    appendEmptyStateRow(tbody, "Нет строк для выбранных статусов. Откройте фильтр в колонке «Статус» и выберите нужные.");
    updateApplyButtonState();
    return;
  }

  for (const result of visibleResults) tbody.appendChild(buildIconResultRow(result));
  restorePreferredSelection(preferredSelectedId, visibleResults);
}

function renderColorResultsTable(preferredSelectedId?: string): void {
  const tbody = $("tc-results-tbody-colors");
  tbody.innerHTML = "";
  rowControls.clear();
  selectedRecordId = null;
  updateStatusFilterIndicator();
  renderResultsSummary();

  const visibleResults = getFilteredResults();

  if (currentResults.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="6" class="ds-empty-state">${escapeHtml(
      scannedCategories.has("colors")
        ? "Расхождений нет: цвета уже привязаны к токенам библиотеки. Запустите сканирование заново после изменений в макете."
        : NOT_SCANNED_TEXT
    )}</td>`;
    tbody.appendChild(row);
    updateApplyButtonState();
    return;
  }

  if (visibleResults.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="6" class="ds-empty-state">Нет строк для выбранных статусов. Откройте фильтр в колонке «Статус» и выберите один или несколько статусов.</td>`;
    tbody.appendChild(row);
    updateApplyButtonState();
    return;
  }

  for (const result of visibleResults) {
    tbody.appendChild(buildResultRow(result));
  }

  restorePreferredSelection(preferredSelectedId, visibleResults);
}

function renderResultsTable(preferredSelectedId?: string): void {
  updateResultsBlocksVisibility();
  if (activeCategory === "icons") {
    renderIconResultsTable(preferredSelectedId);
    return;
  }
  if (activeCategory === "typography") {
    renderTypographyResultsTable(preferredSelectedId);
    return;
  }
  renderColorResultsTable(preferredSelectedId);
}

function buildResultRow(result: ComparisonResult): HTMLTableRowElement {
  const row = document.createElement("tr");
  row.dataset.recordId = result.id;

  const statusCell = document.createElement("td");
  const statusBadges = document.createElement("div");
  statusBadges.className = "ds-status-cell";
  statusCell.appendChild(statusBadges);
  statusBadges.appendChild(createStatusBadge(result));
  if (result.decision && result.decision !== "value_fix_proposed") {
    statusBadges.appendChild(createDecisionCheck(result.decision));
  }
  if (result.decisionSource === "registry") {
    statusBadges.appendChild(createRegistryDecisionBadge());
  }
  const proposalStatus = result.decisionSource === "registry" ? undefined : proposalStatuses[result.id];
  if (proposalStatus) {
    statusBadges.appendChild(createProposalStatusBadge(proposalStatus));
  }
  if (result.applyPartial) {
    statusBadges.appendChild(
      createSecondaryBadge("Применено частично", "warning", "Переменная применена не ко всем слоям группы.")
    );
  }
  row.appendChild(statusCell);

  const layerCell = document.createElement("td");
  const layerLink = document.createElement("button");
  layerLink.type = "button";
  layerLink.className = "ds-accent-link ds-layer-name";
  layerLink.title = "Перейти к слою в макете";
  layerLink.textContent = result.representativeNodeName || "(без имени)";
  layerLink.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    post({ type: "select-nodes", payload: { nodeIds: result.nodeIds } });
  });
  layerCell.appendChild(layerLink);
  const path = document.createElement("div");
  path.className = "ds-value-meta__caption ds-value-meta__caption--path";
  path.textContent = result.representativeNodePath;
  path.title = result.representativeNodePath;
  layerCell.appendChild(path);
  row.appendChild(layerCell);

  row.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target.closest("button, select, input, textarea, option, datalist")) return;
    setSelectedRow(result.id);
  });

  const beforeCell = document.createElement("td");
  beforeCell.innerHTML = renderBeforeCellHtml(result);
  row.appendChild(beforeCell);

  const targetCell = document.createElement("td");
  targetCell.innerHTML = renderTargetCellHtml(result);
  row.appendChild(targetCell);

  const usesCell = document.createElement("td");
  usesCell.textContent = String(result.count);
  row.appendChild(usesCell);

  row.appendChild(buildActionCell(result));

  return row;
}

function buildActionCell(result: ComparisonResult): HTMLTableCellElement {
  const cell = document.createElement("td");
  const wrap = document.createElement("div");
  wrap.className = "ds-action-cell";

  const select = document.createElement("select");
  select.className = "ds-select";
  ACTION_OPTIONS.forEach((option) => {
    if (option.value === "value_fix_proposed" && !canProposeValueFix(result)) return;
    if (option.value === "mapped_suggested" && !canUseSuggestedToken(result)) return;
    const opt = document.createElement("option");
    opt.value = option.value;
    opt.textContent = option.label;
    select.appendChild(opt);
  });
  if (result.decision) select.value = result.decision;
  wrap.appendChild(select);

  if (canShowPreview(result, "colors")) {
    const previewBtn = document.createElement("button");
    previewBtn.type = "button";
    previewBtn.className = "ds-btn tc-preview-btn";
    previewBtn.textContent = "Показать превью";
    previewBtn.disabled = previewInFlight;
    previewBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      requestPreview(result.id);
    });
    wrap.appendChild(previewBtn);
  }

  if (canApplyToLayout(result)) {
    const applyLayoutBtn = document.createElement("button");
    applyLayoutBtn.type = "button";
    applyLayoutBtn.className = "ds-btn tc-apply-layout-btn";
    applyLayoutBtn.textContent = "Применить в макет";
    applyLayoutBtn.disabled = applyToLayoutInFlight;
    applyLayoutBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openApplyToLayoutModal(result);
    });
    wrap.appendChild(applyLayoutBtn);
  }

  const mappedExtra = document.createElement("div");
  mappedExtra.className = "ds-action-extra";
  setupVariableCombobox(mappedExtra, result.id, result.decisionTargetVariableId);
  wrap.appendChild(mappedExtra);

  const commentExtra = document.createElement("div");
  commentExtra.className = "ds-action-extra";
  commentExtra.innerHTML = `<textarea rows="2" placeholder="Комментарий (обязателен)" class="tc-comment-input ds-textarea"></textarea>`;
  wrap.appendChild(commentExtra);

  const valueFixExtra = document.createElement("div");
  valueFixExtra.className = "ds-action-extra";
  if (canProposeValueFix(result)) {
    setupValueFixExtra(result, valueFixExtra);
  }
  wrap.appendChild(valueFixExtra);

  function syncExtraVisibility(): void {
    mappedExtra.classList.toggle("visible", select.value === "mapped");
    commentExtra.classList.toggle("visible", select.value === "ignored");
    valueFixExtra.classList.toggle("visible", select.value === "value_fix_proposed");
  }
  select.addEventListener("change", syncExtraVisibility);
  syncExtraVisibility();

  if (result.decisionComment && result.decision === "ignored") {
    (commentExtra.querySelector(".tc-comment-input") as HTMLTextAreaElement).value = result.decisionComment;
  }

  rowControls.set(result.id, { select, mappedExtra, commentExtra, valueFixExtra });

  cell.appendChild(wrap);
  return cell;
}

/**
 * Transient review-projection metadata, снятая с текущего ComparisonResult
 * (LayoutRecord) на момент Apply — нужна ИСКЛЮЧИТЕЛЬНО для человекочитаемого
 * GitHub PR body (см. server/api/_lib/pullRequestBody.ts). Эти поля никогда
 * не попадают в decisions-registry.json — только в ApplyDecisionMessage /
 * StoredDecision / ProposeDecisionEntryPayload по пути к PR body.
 */
function buildSourceReviewContext(result: ComparisonResult): {
  sourceProperty: string;
  sourceBindingType: string;
  sourceName?: string;
  sourceDisplayValue: string;
  nodePath: string;
  nodeName: string;
  nodeIds: string[];
  occurrenceCount: number;
} {
  const layoutValue = readTypographyComparisonValue(result.comparisonValue);
  const typographySummary = layoutValue ? formatTypographyDisplayValue(layoutValue) : result.displayValue;
  const isTypography = result.category === "typography" || activeCategory === "typography";
  return {
    sourceProperty: isTypography ? "text-style" : result.property,
    sourceBindingType: result.bindingType,
    sourceName: result.sourceName || undefined,
    sourceDisplayValue: isTypography ? typographySummary : result.displayValue,
    nodePath: result.representativeNodePath,
    nodeName: result.representativeNodeName,
    nodeIds: result.nodeIds,
    occurrenceCount: result.count,
  };
}

function applyTypographyDecision(
  result: ComparisonResult,
  select: HTMLSelectElement,
  mappedExtra: HTMLElement,
  commentExtra: HTMLElement,
  valueFixExtra: HTMLElement
): void {
  const decision = select.value as Decision;
  const review = buildSourceReviewContext(result);
  const layoutValue = readTypographyComparisonValue(result.comparisonValue);
  const layoutSummary = layoutValue ? formatTypographyDisplayValue(layoutValue) : result.displayValue;

  if (decision === "mapped_suggested") {
    if (!result.target?.styleId && !result.target?.styleKey) {
      showError("Для этой строки нет предложенного стиля — выберите «Выбрать стиль из AID».");
      return;
    }
    const suggestedStyle = currentLibraryTextStyles.find(
      (style) => style.nodeId === result.target!.styleId || style.key === result.target!.styleKey
    );
    post({
      type: "apply-decision",
      payload: {
        recordId: result.id,
        decision,
        category: "typography",
        targetStyleId: suggestedStyle?.nodeId ?? result.target?.styleId,
        targetStyleName: suggestedStyle?.name ?? result.target?.name,
        targetName: suggestedStyle?.name ?? result.target?.name,
        mismatchedProperties: result.mismatchedProperties,
        targetDisplayValue: suggestedStyle?.displayValue ?? result.target?.displayValue,
        ...review,
      },
    });
    return;
  }

  if (decision === "mapped") {
    const input = mappedExtra.querySelector(".ds-combobox__input") as HTMLInputElement | null;
    const label = input?.value.trim() ?? "";
    let styleId = mappedExtra.dataset.selectedStyleId;
    if (!styleId && label) {
      styleId = findLibraryTextStyleByLabel(label, currentLibraryTextStyles)?.nodeId;
    }
    if (!styleId) {
      showError("Выберите стиль из списка AID — точного совпадения по имени не нашлось.");
      return;
    }
    const selectedStyle = currentLibraryTextStyles.find((style) => style.nodeId === styleId);
    post({
      type: "apply-decision",
      payload: {
        recordId: result.id,
        decision,
        category: "typography",
        targetStyleId: styleId,
        // В реестр уходит имя стиля, а не подпись из выпадающего списка.
        targetStyleName: selectedStyle?.name ?? label,
        targetName: selectedStyle?.name ?? label,
        mismatchedProperties: result.mismatchedProperties,
        targetDisplayValue: selectedStyle?.displayValue,
        ...review,
      },
    });
    return;
  }

  if (decision === "ignored") {
    const comment = (commentExtra.querySelector(".tc-comment-input") as HTMLTextAreaElement).value.trim();
    if (!comment) {
      showError("Для решения «Игнорировать» комментарий обязателен.");
      return;
    }
    post({
      type: "apply-decision",
      payload: { recordId: result.id, decision, category: "typography", comment, ...review },
    });
    return;
  }

  if (decision === "value_fix_proposed") {
    const styleId = valueFixExtra.dataset.selectedStyleId ?? result.target?.styleId;
    const selectedStyle = styleId
      ? currentLibraryTextStyles.find((style) => style.nodeId === styleId)
      : undefined;
    if (!selectedStyle) {
      showError("Выберите стиль библиотеки, значение которого нужно исправить.");
      return;
    }
    const commentInput = valueFixExtra.querySelector<HTMLTextAreaElement>(".tc-value-fix-comment");
    post({
      type: "apply-decision",
      payload: {
        recordId: result.id,
        decision,
        category: "typography",
        targetStyleId: selectedStyle.nodeId,
        targetStyleName: selectedStyle.name,
        targetName: selectedStyle.name,
        mismatchedProperties: result.mismatchedProperties,
        currentLibraryValue: selectedStyle.displayValue,
        proposedValue: layoutSummary,
        comment: commentInput?.value.trim() || undefined,
        ...review,
      },
    });
    return;
  }

  post({
    type: "apply-decision",
    payload: { recordId: result.id, decision, category: "typography", ...review },
  });
}

function applyDecision(
  result: ComparisonResult,
  select: HTMLSelectElement,
  mappedExtra: HTMLElement,
  commentExtra: HTMLElement,
  valueFixExtra: HTMLElement
): void {
  const decision = select.value as Decision;

  if (decision === "mapped_suggested") {
    if (!result.target) {
      showError("Для этой строки нет предложенного токена библиотеки — выберите «Выбрать токен из AID».");
      return;
    }
    post({
      type: "apply-decision",
      payload: {
        recordId: result.id,
        decision,
        targetVariableId: result.target.variableId,
        targetName: result.target.name,
        targetCollectionName: result.target.collectionName,
        targetModeName: result.target.modeName,
        targetDisplayValue: result.target.displayValue,
        ...buildSourceReviewContext(result),
      },
    });
    return;
  }

  if (decision === "mapped") {
    const input = mappedExtra.querySelector(".ds-combobox__input") as HTMLInputElement | null;
    const label = input?.value.trim() ?? "";
    let variableId = mappedExtra.dataset.selectedVariableId;
    if (!variableId && label) {
      variableId = findLibraryTokenByLabel(label, currentLibraryTokens)?.variableId;
    }
    if (!variableId) {
      showError("Выберите токен из списка AID — точного совпадения по имени не нашлось.");
      return;
    }
    // Ручной выбор токена не привязан к конкретному режиму библиотеки —
    // targetModeName/targetDisplayValue здесь намеренно не заполняются
    // (не выдумываем режим, который дизайнер не выбирал явно).
    const manuallySelectedToken = currentLibraryTokens.find((token) => token.variableId === variableId);
    post({
      type: "apply-decision",
      payload: {
        recordId: result.id,
        decision,
        targetVariableId: variableId,
        // В реестр уходит имя токена, а не подпись из выпадающего списка
        // («bg/accent», а не «bg/accent (color-sem)») — иначе одно и то же
        // поле реестра заполнялось бы в двух форматах, в зависимости от
        // того, выбран токен вручную или предложен плагином.
        targetName: manuallySelectedToken?.name ?? label,
        targetCollectionName: manuallySelectedToken?.collectionName,
        ...buildSourceReviewContext(result),
      },
    });
    return;
  }

  if (decision === "ignored") {
    const comment = (commentExtra.querySelector(".tc-comment-input") as HTMLTextAreaElement).value.trim();
    if (!comment) {
      showError("Для решения «Игнорировать» комментарий обязателен.");
      return;
    }
    post({
      type: "apply-decision",
      payload: { recordId: result.id, decision, comment, ...buildSourceReviewContext(result) },
    });
    return;
  }

  if (decision === "value_fix_proposed") {
    const selectedVariableId = valueFixExtra.dataset.selectedVariableId;
    if (!selectedVariableId) {
      showError("Выберите токен из библиотеки, значение которого нужно исправить.");
      return;
    }
    const selectedToken = currentLibraryTokens.find((t) => t.variableId === selectedVariableId);
    if (!selectedToken) {
      showError("Выбранного токена нет в загруженной библиотеке.");
      return;
    }
    const modeSelect = valueFixExtra.querySelector<HTMLSelectElement>(".tc-value-fix-mode");
    const proposedInput = valueFixExtra.querySelector<HTMLInputElement>(".tc-value-fix-proposed");
    const commentInput = valueFixExtra.querySelector<HTMLTextAreaElement>(".tc-value-fix-comment");
    if (!modeSelect || !proposedInput) {
      showError("Не удалось прочитать поля правки значения. Заполните их заново.");
      return;
    }
    if (!modeSelect.value) {
      showError("Выберите режим библиотеки, для которого предлагается правка.");
      return;
    }
    const proposedRaw = proposedInput.value.trim();
    if (!isValidHex(proposedRaw)) {
      showError("Укажите цвет в формате #RRGGBB в поле «Предлагаемое значение».");
      return;
    }
    const selectedOption = modeSelect.selectedOptions[0];
    const proposedModeName = selectedOption?.dataset.modeName ?? "";
    const currentLibraryValue =
      selectedOption?.dataset.libraryValue ?? result.decisionCurrentLibraryValue ?? "";
    post({
      type: "apply-decision",
      payload: {
        recordId: result.id,
        decision,
        targetVariableId: selectedToken.variableId,
        targetName: selectedToken.name,
        targetCollectionName: selectedToken.collectionName,
        proposedModeId: modeSelect.value,
        proposedModeName,
        currentLibraryValue,
        proposedValue: normalizeHex(proposedRaw),
        comment: commentInput?.value.trim() || undefined,
        ...buildSourceReviewContext(result),
      },
    });
    return;
  }

  post({ type: "apply-decision", payload: { recordId: result.id, decision, ...buildSourceReviewContext(result) } });
}

function downloadTextFile(filename: string, mimeType: string, content: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function initApplyFooterButton(): void {
  const runApplyDecision = () => {
    if (!selectedRecordId) return;
    const controls = rowControls.get(selectedRecordId);
    const result = currentResults.find((item) => item.id === selectedRecordId);
    if (!controls || !result) return;
    if (activeCategory === "icons") {
      applyIconDecision(result, controls.select, controls.mappedExtra, controls.commentExtra);
      return;
    }
    if (activeCategory === "typography") {
      applyTypographyDecision(
        result,
        controls.select,
        controls.mappedExtra,
        controls.commentExtra,
        controls.valueFixExtra
      );
      return;
    }
    applyDecision(result, controls.select, controls.mappedExtra, controls.commentExtra, controls.valueFixExtra);
  };
  $<HTMLButtonElement>("tc-apply-decision-btn").addEventListener("click", runApplyDecision);
}

function initRescanTypographyButton(): void {
  $<HTMLButtonElement>("tc-rescan-typography-btn").addEventListener("click", () => {
    const scope = getSelectedScope();
    $<HTMLButtonElement>("tc-scan-btn").disabled = true;
    $("tc-scan-status").textContent = "Сканирование...";
    post({ type: "scan", payload: { scope, category: activeCategory } });
  });
}

// ---------------------------------------------------------------------------
// Экспорт: кнопка + меню «Скачать» / «Напечатать»
// ---------------------------------------------------------------------------

type ExportFormat = "csv" | "json" | "md";

const EXPORT_FILE_CONFIG: Record<
  ExportFormat,
  { filename: string; mime: string; serialize: (rows: ExportRow[], category: TokenCategory) => string }
> = {
  csv: {
    filename: "token-comparator-mapping.csv",
    mime: "text/csv;charset=utf-8",
    serialize: toCSV,
  },
  json: {
    filename: "token-comparator-mapping.json",
    mime: "application/json;charset=utf-8",
    serialize: toJSON,
  },
  md: {
    filename: "token-comparator-mapping.md",
    mime: "text/markdown;charset=utf-8",
    serialize: toMarkdown,
  },
};

function closeAllExportMenus(): void {
  document.querySelectorAll<HTMLElement>(".ds-export-menu__dropdown").forEach((menu) => {
    menu.hidden = true;
  });
  document.querySelectorAll<HTMLButtonElement>(".ds-export-menu__trigger").forEach((trigger) => {
    trigger.setAttribute("aria-expanded", "false");
    trigger.querySelector(".ds-dropdown-chevron")?.classList.remove("ds-dropdown-chevron--open");
  });
}

function setExportButtonsDisabled(disabled: boolean): void {
  document.querySelectorAll<HTMLButtonElement>(".ds-export-menu__trigger").forEach((trigger) => {
    trigger.disabled = disabled;
  });
}

function renderPrintStatus(text: string): void {
  $("tc-print-status").textContent = text;
}

// ---------------------------------------------------------------------------
// Print loader — кольцо прогресса рядом со статусом "Напечатать"
// ---------------------------------------------------------------------------

const LOADER_RADIUS = 8;
const LOADER_CIRCUMFERENCE = 2 * Math.PI * LOADER_RADIUS;
let printLoaderCompleteTimer: number | undefined;

function getPrintLoaderEls(): { root: HTMLElement; progress: SVGCircleElement | null; percent: HTMLElement | null } {
  const root = $<HTMLElement>("tc-print-loader");
  return {
    root,
    progress: root.querySelector<SVGCircleElement>(".tc-loader__progress"),
    percent: root.querySelector<HTMLElement>(".tc-loader__percent"),
  };
}

/** Неизвестно, сколько осталось — крутящееся кольцо без процента внутри. */
function showPrintLoaderIndeterminate(): void {
  window.clearTimeout(printLoaderCompleteTimer);
  const { root, progress, percent } = getPrintLoaderEls();
  root.hidden = false;
  root.classList.remove("tc-loader--complete");
  root.classList.add("tc-loader--indeterminate");
  if (progress) {
    progress.style.strokeDasharray = "";
    progress.style.strokeDashoffset = "";
  }
  if (percent) percent.textContent = "";
}

/** Известный процент — кольцо-прогресс с числом внутри. */
function showPrintLoaderProgress(percentValue: number): void {
  window.clearTimeout(printLoaderCompleteTimer);
  const { root, progress, percent } = getPrintLoaderEls();
  root.hidden = false;
  root.classList.remove("tc-loader--complete", "tc-loader--indeterminate");
  const clamped = Math.max(0, Math.min(100, Math.round(percentValue)));
  if (progress) {
    progress.style.strokeDasharray = `${LOADER_CIRCUMFERENCE}`;
    progress.style.strokeDashoffset = `${LOADER_CIRCUMFERENCE * (1 - clamped / 100)}`;
  }
  if (percent) percent.textContent = String(clamped);
}

/** Успех — кольцо (детерминированное или крутящееся) анимированно превращается в галочку, затем прячется. */
function completePrintLoader(): void {
  window.clearTimeout(printLoaderCompleteTimer);
  const { root, percent } = getPrintLoaderEls();
  root.hidden = false;
  root.classList.remove("tc-loader--indeterminate");
  root.classList.add("tc-loader--complete");
  if (percent) percent.textContent = "";
  printLoaderCompleteTimer = window.setTimeout(() => {
    root.hidden = true;
    root.classList.remove("tc-loader--complete");
  }, 1600);
}

function hidePrintLoader(): void {
  window.clearTimeout(printLoaderCompleteTimer);
  const { root } = getPrintLoaderEls();
  root.hidden = true;
  root.classList.remove("tc-loader--indeterminate", "tc-loader--complete");
}

function initExportMenus(): void {
  document.querySelectorAll<HTMLElement>(".ds-export-menu").forEach((group) => {
    const format = group.dataset.format as ExportFormat | undefined;
    const trigger = group.querySelector<HTMLButtonElement>(".ds-export-menu__trigger");
    const dropdown = group.querySelector<HTMLElement>(".ds-export-menu__dropdown");
    if (!format || !trigger || !dropdown) return;

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const willOpen = dropdown.hidden;
      closeAllExportMenus();
      if (!willOpen) return;
      dropdown.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      trigger.querySelector(".ds-dropdown-chevron")?.classList.add("ds-dropdown-chevron--open");
    });

    dropdown
      .querySelector<HTMLButtonElement>('[data-action="download"]')
      ?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeAllExportMenus();
        const config = EXPORT_FILE_CONFIG[format];
        const rows = buildExportRows(getFilteredResults());
        downloadTextFile(config.filename, config.mime, config.serialize(rows, activeCategory));
      });

    dropdown.querySelector<HTMLButtonElement>('[data-action="print"]')?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeAllExportMenus();
      const results = getFilteredResults();
      if (results.length === 0) {
        showError("Печатать нечего: таблица пуста или все строки скрыты фильтром.");
        return;
      }
      setExportButtonsDisabled(true);
      renderPrintStatus("Строим таблицу в Figma...");
      showPrintLoaderIndeterminate();
      post({ type: "print-to-figma", payload: { sourceFormat: format, results } });
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target as Node;
    const insideMenu = Array.from(document.querySelectorAll<HTMLElement>(".ds-export-menu")).some((group) =>
      group.contains(target)
    );
    if (!insideMenu) closeAllExportMenus();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAllExportMenus();
  });
}

// ---------------------------------------------------------------------------
// Обработка сообщений от code.ts
// ---------------------------------------------------------------------------

window.onmessage = (event: MessageEvent) => {
  const message = (event.data as { pluginMessage?: CodeToUiMessage }).pluginMessage;
  if (!message) return;

  switch (message.type) {
    case "init-state": {
      const {
        hasToken,
        hasRegistrySecret,
        libraries,
        activeLibraryKey: initialActiveLibraryKey,
        tokens,
        textStyles,
        hasGitHubToken,
        githubRepo,
        githubRegistryPath,
        registryCache,
        adminMode,
        pendingProposeCount: initialPendingCount,
        pendingProposeCountByCategory: initialPendingByCategory,
        textStylesAvailable: initialTextStylesAvailable,
      } = message.payload;
      applyLibrariesState({
        libraries,
        activeLibraryKey: initialActiveLibraryKey,
        tokens,
        textStyles,
        textStylesAvailable: initialTextStylesAvailable,
        icons: message.payload.icons,
        iconsAvailable: message.payload.iconsAvailable,
      });
      $<HTMLInputElement>("tc-token-input").placeholder = hasToken ? "•••••••• (сохранён)" : "figd_...";
      $<HTMLInputElement>("tc-registry-secret-input").placeholder = hasRegistrySecret
        ? "•••••••• (сохранён)"
        : "Нужен только для отправки решений";
      renderLibraryStatus(libraries.length === 0 ? "Библиотек пока нет — добавьте первую." : "");

      if (githubRepo) $<HTMLInputElement>("tc-github-repo-input").value = githubRepo;
      if (githubRegistryPath) $<HTMLInputElement>("tc-github-registry-path-input").value = githubRegistryPath;
      $<HTMLInputElement>("tc-github-token-input").placeholder = hasGitHubToken
        ? "•••••••• (сохранён)"
        : "github_pat_...";
      if (adminMode) {
        renderRegistryStatus(
          registryCache
            ? registryCache.localOnly
              ? `Пустой реестр создан на этом компьютере: записей ${registryCache.entryCount}, ${new Date(
                  registryCache.fetchedAt
                ).toLocaleString("ru-RU")}.`
              : `Реестр загружен: версия ${registryCache.registryVersion}, ${registryCache.entryCount} записей, обновлён ${new Date(
                  registryCache.fetchedAt
                ).toLocaleString("ru-RU")}.`
            : "Реестр ещё не загружен."
        );
      }
      applyAdminMode(adminMode === true);
      updateProposeButton(initialPendingCount, initialPendingByCategory);
      if (registryCache) {
        applyProdRegistryLoaded(registryCache.localOnly, registryCache.entryCount);
      } else {
        renderProdRegistryStatus(PROD_REGISTRY_LOADING);
      }
      hideRegistryNotFoundPrompt();
      break;
    }
    case "admin-mode-changed":
      applyAdminMode(message.payload.enabled === true);
      break;
    case "pending-propose-count":
      updateProposeButton(message.payload.count, message.payload.byCategory);
      break;
    case "propose-preview":
      openProposeConfirmModal(message.payload.entries);
      break;
    case "decisions-submitted":
      renderProposeStatus(proposeStatusText(message.payload));
      break;
    case "decisions-submit-failed":
      renderProposeStatus(PROPOSE_FAILURE);
      syncProposeButton();
      break;
    case "registry-unavailable":
      renderProdRegistryStatus(PROD_REGISTRY_UNAVAILABLE);
      $<HTMLButtonElement>("tc-load-registry-btn").disabled = false;
      break;
    case "settings-saved":
      renderLibraryStatus("Настройки сохранены.");
      break;
    case "github-settings-saved":
      $<HTMLInputElement>("tc-github-repo-input").value = message.payload.repo;
      $<HTMLInputElement>("tc-github-registry-path-input").value = message.payload.registryPath;
      renderRegistryStatus("Настройки GitHub сохранены.");
      break;
    case "registry-loading":
      renderProdRegistryStatus(PROD_REGISTRY_LOADING);
      if (adminModeEnabled) {
        renderRegistryStatus("Загрузка реестра...");
      }
      hideRegistryNotFoundPrompt();
      break;
    case "registry-loaded": {
      $<HTMLButtonElement>("tc-load-registry-btn").disabled = false;
      applyProdRegistryLoaded(message.payload.localOnly, message.payload.entryCount);
      if (adminModeEnabled) {
        renderRegistryStatus(
          message.payload.localOnly
            ? `Пустой реестр создан на этом компьютере: записей ${message.payload.entryCount}.`
            : `Реестр загружен: версия ${message.payload.registryVersion}, ${message.payload.entryCount} записей, обновлён ${new Date(
                message.payload.updatedAt
              ).toLocaleString("ru-RU")}.`
        );
      }
      hideRegistryNotFoundPrompt();
      break;
    }
    case "registry-not-found": {
      $<HTMLButtonElement>("tc-load-registry-btn").disabled = false;
      renderProdRegistryStatus(PROD_REGISTRY_EMPTY);
      if (adminModeEnabled) {
        renderRegistryStatus("Файл реестра ещё не создан в репозитории.");
        showRegistryNotFoundPrompt(message.payload.repo, message.payload.registryPath);
      }
      break;
    }
    case "registry-initialized":
      renderProdRegistryStatus(PROD_REGISTRY_EMPTY);
      if (adminModeEnabled) {
        renderRegistryStatus(
          `Пустой реестр создан: записей ${message.payload.entryCount}.`
        );
      }
      hideRegistryNotFoundPrompt();
      break;
    case "library-loading":
      renderLibraryStatus("Загрузка библиотеки...");
      break;
    case "proposal-statuses":
      proposalStatuses = message.payload.statuses;
      applyActiveCategoryView();
      break;
    case "libraries-changed": {
      $<HTMLButtonElement>("tc-load-library-btn").disabled = false;
      const { loadedFileName } = message.payload;
      if (loadedFileName) $<HTMLInputElement>("tc-filekey-input").value = "";
      applyLibrariesState(message.payload);
      renderLibraryStatus(
        loadedFileName
          ? `Библиотека «${loadedFileName}» загружена.`
          : message.payload.libraries.length === 0
            ? "Библиотек пока нет — добавьте первую."
            : ""
      );
      break;
    }
    case "scan-progress":
      $("tc-scan-status").textContent = message.payload.message;
      break;
    case "scan-results": {
      $<HTMLButtonElement>("tc-scan-btn").disabled = false;
      const { category, results, libraryTokens, libraryTextStyles, resolvedByTeam } = message.payload;
      $("tc-scan-status").textContent =
        `Готово: найдено ${results.length} ${pluralizeIssues(results.length)}.` +
        (resolvedByTeam ? ` Скрыто по согласованным решениям команды: ${resolvedByTeam}.` : "");
      activeCategory = category;
      setCategorySegmentPressed(category);
      resultsByCategory[category] = results;
      scannedCategories.add(category);
      currentLibraryTokens = libraryTokens;
      currentLibraryTextStyles = libraryTextStyles;
      applyActiveCategoryView(true);
      switchToTab("results");
      break;
    }
    case "decision-applied": {
      const index = currentResults.findIndex((r) => r.id === message.payload.recordId);
      if (index !== -1) {
        currentResults[index] = message.payload.result;
        resultsByCategory[activeCategory] = currentResults;
        if (activeCategory === "colors" && message.payload.result.status === "mapped") {
          activeStatusFilters.add("mapped");
          updateStatusFilterIndicator();
        }
        renderResultsTable(message.payload.recordId);
      }
      break;
    }
    case "print-progress":
      renderPrintStatus(message.payload.message);
      if (typeof message.payload.percent === "number") {
        showPrintLoaderProgress(message.payload.percent);
      } else {
        showPrintLoaderIndeterminate();
      }
      break;
    case "print-success": {
      setExportButtonsDisabled(false);
      completePrintLoader();
      const { pageName, rowCount, totalRows, truncated } = message.payload;
      renderPrintStatus(
        truncated
          ? `Таблица построена на странице «${pageName}»: напечатаны первые ${rowCount} из ${totalRows} строк — для полного набора используйте «Скачать».`
          : `Таблица построена на странице «${pageName}»: ${rowCount} строк.`
      );
      break;
    }
    case "print-error": {
      setExportButtonsDisabled(false);
      hidePrintLoader();
      renderPrintStatus("");
      showError(message.payload.message);
      break;
    }
    case "preview-ready": {
      previewInFlight = false;
      setPreviewButtonsDisabled(false);
      if (applyModalPreviewPending && activeApplyRecordId === message.recordId) {
        applyModalPreviewPending = false;
        showApplyModalPreviewImages(message.modes);
      } else if (activePreviewRecordId === message.recordId) {
        showPreviewImages(message.modes);
      }
      break;
    }
    case "preview-error": {
      previewInFlight = false;
      setPreviewButtonsDisabled(false);
      if (applyModalPreviewPending && activeApplyRecordId === message.recordId) {
        applyModalPreviewPending = false;
        showApplyModalPreviewError(message.message);
      } else if (activePreviewRecordId === message.recordId) {
        showPreviewErrorInModal(message.message);
      } else {
        showError(message.message);
      }
      break;
    }
    case "apply-to-layout-result": {
      applyToLayoutInFlight = false;
      setApplyToLayoutButtonsDisabled(false);
      if (activeApplyRecordId === message.recordId) {
        showApplyToLayoutResult(message.applied, message.skipped, {
          attempted: message.attempted,
          occurrences: message.occurrences,
          partial: message.partial,
        });
      }
      break;
    }
    case "error": {
      $<HTMLButtonElement>("tc-load-library-btn").disabled = false;
      $<HTMLButtonElement>("tc-load-registry-btn").disabled = false;
      $<HTMLButtonElement>("tc-scan-btn").disabled = false;
      setExportButtonsDisabled(currentResults.length === 0 || activeCategory === "icons");
      hidePrintLoader();
      renderPrintStatus("");
      if (applyToLayoutInFlight) {
        applyToLayoutInFlight = false;
        setApplyToLayoutButtonsDisabled(false);
        closeApplyToLayoutModal();
      }
      showError(message.payload.message);
      break;
    }
    default:
      break;
  }
};

// ---------------------------------------------------------------------------
// Resize handle — drag за правый нижний угол окна плагина
// ---------------------------------------------------------------------------

function initWindowResize(): void {
  const handle = $<HTMLElement>("tc-resize-handle");

  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;
  let pendingSize: { width: number; height: number } | null = null;
  let rafId: number | null = null;

  function flushResize(): void {
    rafId = null;
    if (!pendingSize) return;
    post({ type: "resize-window", payload: pendingSize });
    pendingSize = null;
  }

  function scheduleResize(size: { width: number; height: number }): void {
    pendingSize = size;
    if (rafId !== null) return;
    rafId = requestAnimationFrame(flushResize);
  }

  function onPointerMove(event: PointerEvent): void {
    if (!dragging) return;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    const size = clampWindowSize({
      width: startWidth + deltaX,
      height: startHeight + deltaY,
    });
    scheduleResize(size);
  }

  function endDrag(event: PointerEvent): void {
    if (!dragging) return;
    dragging = false;
    handle.releasePointerCapture(event.pointerId);

    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    const size = clampWindowSize({
      width: startWidth + deltaX,
      height: startHeight + deltaY,
    });

    pendingSize = null;
    post({ type: "resize-window-end", payload: size });

    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", endDrag);
    window.removeEventListener("pointercancel", endDrag);
  }

  handle.addEventListener("pointerdown", (event: PointerEvent) => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    startWidth = window.innerWidth;
    startHeight = window.innerHeight;
    handle.setPointerCapture(event.pointerId);

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
  });
}

// ---------------------------------------------------------------------------
// Инициализация
// ---------------------------------------------------------------------------

initTabs();
initHints();
renderChangelog();
initGuideAccordion();
initScopeSegment();
initCategorySegment();
initSettingsPanel();
initGitHubSettingsPanel();
initAdminUnlock();
initProposePanel();
initScanPanel();
initStatusFilterMenu();
initComboboxGlobalHandlers();
initExportMenus();
initApplyFooterButton();
initRescanTypographyButton();
initPreviewModal();
initApplyToLayoutModal();
initProposeConfirmModal();
initWindowResize();
renderResultsTable();
applyAdminMode(false);
post({ type: "ui-ready" });
