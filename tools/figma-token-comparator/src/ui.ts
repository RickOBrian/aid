/**
 * Логика UI плагина (работает внутри iframe, без доступа к Plugin API).
 * Общение с главным потоком — только через postMessage / window.onmessage
 * по типизированному протоколу из src/messages.ts.
 */

import type {
  ComparisonResult,
  Decision,
  LibraryToken,
  MatchStatus,
  ScanScope,
} from "./comparators/types";
import { isValidHex, normalizeHex } from "./lib/colorUtils";
import { findLayoutValueForTargetMode, sortModesStable } from "./lib/modePairing";
import { filterSemanticColorTokens } from "./lib/semanticColorLibrary";
import { buildExportRows, toCSV, toJSON, toMarkdown, type ExportRow } from "./lib/exporter";
import type { CodeToUiMessage, UiToCodeMessage } from "./messages";
import { clampWindowSize } from "./lib/windowSize";

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

let currentResults: ComparisonResult[] = [];
let currentLibraryTokens: LibraryToken[] = [];
let selectedRecordId: string | null = null;

interface RowControls {
  select: HTMLSelectElement;
  mappedExtra: HTMLElement;
  commentExtra: HTMLElement;
  valueFixExtra: HTMLElement;
}

const rowControls = new Map<string, RowControls>();

const STATUS_LABELS: Record<MatchStatus, string> = {
  mapped: "Mapped",
  exact: "Exact match",
  value: "Value match",
  "name-match": "Name match",
  conflict: "Conflict",
  "name-match-unresolved": "Name match (value unknown)",
  approximate: "Approximate match",
  "layout-only": "Layout only",
};

/** Ключ фильтра в шапке «Статус» — может отличаться от MatchStatus (style/ghost/hardcoded). */
type StatusFilterKey = MatchStatus | "style-binding" | "ghost-binding" | "hardcoded-no-analog";

function getResultStatusFilterKey(result: ComparisonResult): StatusFilterKey {
  if (result.bindingType === "style") return "style-binding";
  if (result.bindingType === "ghost") return "ghost-binding";
  if (result.status === "layout-only" && result.bindingType === "hardcoded") return "hardcoded-no-analog";
  return result.status;
}

function statusFilterKeyLabel(key: StatusFilterKey): string {
  if (key === "style-binding") return "Style binding";
  if (key === "ghost-binding") return "Ghost style";
  if (key === "hardcoded-no-analog") return "Hardcoded (no analog)";
  return STATUS_LABELS[key];
}

function statusFilterBadgeClass(key: StatusFilterKey): string {
  if (key === "hardcoded-no-analog") return "hardcoded-no-analog";
  return key;
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

function updateStatusFilterIndicator(): void {
  const indicator = $<HTMLElement>("tc-status-filter-indicator");
  indicator.hidden = !isStatusFilterPartial();
}

function closeStatusFilterMenu(): void {
  const btn = $<HTMLButtonElement>("tc-status-filter-btn");
  const menu = $<HTMLElement>("tc-status-filter-menu");
  btn.setAttribute("aria-expanded", "false");
  menu.hidden = true;
}

function openStatusFilterMenu(): void {
  renderStatusFilterMenu();
  const btn = $<HTMLButtonElement>("tc-status-filter-btn");
  const menu = $<HTMLElement>("tc-status-filter-menu");
  btn.setAttribute("aria-expanded", "true");
  menu.hidden = false;
}

function toggleStatusFilterMenu(): void {
  const menu = $<HTMLElement>("tc-status-filter-menu");
  if (menu.hidden) openStatusFilterMenu();
  else closeStatusFilterMenu();
}

function applyStatusFilterChange(): void {
  updateStatusFilterIndicator();
  renderResultsTable(selectedRecordId ?? undefined);
}

function renderStatusFilterMenu(): void {
  const menu = $<HTMLElement>("tc-status-filter-menu");
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
          <span class="ds-badge ${escapeHtml(statusFilterBadgeClass(key))}">${escapeHtml(statusFilterKeyLabel(key))}</span>
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
  const btn = $<HTMLButtonElement>("tc-status-filter-btn");
  const menu = $<HTMLElement>("tc-status-filter-menu");

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

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) closeStatusFilterMenu();
  });
}

function statusLabel(result: ComparisonResult): string {
  if (result.bindingType === "style") {
    return "Style binding";
  }
  if (result.bindingType === "ghost") {
    return "Ghost style";
  }
  if (result.status === "layout-only" && result.bindingType === "hardcoded") {
    return "Hardcoded (no analog)";
  }
  if (result.status === "approximate") {
    return `Approximate match${result.deltaE !== undefined ? ` (ΔE ${result.deltaE.toFixed(1)})` : ""}`;
  }
  return STATUS_LABELS[result.status];
}

const BINDING_LABELS: Record<string, string> = {
  variable: "Variable",
  style: "Style",
  hardcoded: "Hardcoded",
  ghost: "Ghost",
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
// Гайд — аккордеон
// ---------------------------------------------------------------------------

function initGuideAccordion(): void {
  const root = document.getElementById("tc-guide-accordion");
  if (!root) return;

  root.querySelectorAll<HTMLButtonElement>(".ds-guide-accordion__trigger").forEach((trigger) => {
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
    const libraryInput = fileKeyInput.value.trim();
    if (!libraryInput) {
      showError("Укажите URL, file key или уже загруженную библиотеку.");
      return;
    }
    post({
      type: "save-settings",
      payload: { token: tokenInput.value.trim(), libraryInput },
    });
  });

  loadBtn.addEventListener("click", () => {
    const libraryInput = fileKeyInput.value.trim();
    const token = tokenInput.value.trim();
    if (!libraryInput) {
      showError("Укажите URL, file key или имя уже загруженной библиотеки.");
      return;
    }
    loadBtn.disabled = true;
    post({ type: "load-library", payload: { libraryInput, token } });
  });
}

function renderLibraryStatus(text: string): void {
  $("tc-library-status").textContent = text;
}

function renderRegistryStatus(text: string): void {
  $("tc-registry-status").textContent = text;
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

function initScanPanel(): void {
  const scanBtn = $<HTMLButtonElement>("tc-scan-btn");
  scanBtn.addEventListener("click", () => {
    const scope = getSelectedScope();
    scanBtn.disabled = true;
    $("tc-scan-status").textContent = "Сканирование...";
    post({ type: "scan", payload: { scope } });
  });
}

// ---------------------------------------------------------------------------
// Таблица результатов
// ---------------------------------------------------------------------------

const ACTION_OPTIONS: Array<{ value: Decision; label: string }> = [
  { value: "mapped_suggested", label: "Использовать предложенный" },
  { value: "mapped", label: "Выбрать токен из AID" },
  { value: "ignored", label: "Игнорировать" },
  { value: "candidate", label: "Отметить как новый токен-кандидат" },
  {
    value: "value_fix_proposed",
    label: "Предложить правку значения в библиотеке",
  },
];

function canProposeValueFix(_result: ComparisonResult): boolean {
  return currentLibraryTokens.length > 0;
}

/** "Использовать предложенный" доступен только если плагин сам нашёл target-токен для строки. */
function canUseSuggestedToken(result: ComparisonResult): boolean {
  return Boolean(result.target);
}

// ---------------------------------------------------------------------------
// Показать превью — "Было / Будет" для строк с library target
// ---------------------------------------------------------------------------

/** Превью доступно только для статусов с реальным library target и резолвленным значением — не для Hardcoded (no analog) / layout-only. */
const PREVIEW_ELIGIBLE_STATUSES: ReadonlySet<MatchStatus> = new Set(["value", "name-match", "conflict", "approximate"]);

function canShowPreview(result: ComparisonResult): boolean {
  return (
    PREVIEW_ELIGIBLE_STATUSES.has(result.status) &&
    Boolean(result.target) &&
    result.target?.valueUnresolved !== true
  );
}

let previewInFlight = false;
let activePreviewRecordId: string | null = null;

/**
 * `.tc-mapped-preview-btn` (комбобокс «Выбрать токен из AID») зависит ещё
 * и от того, выбран ли токен — при снятии общей блокировки (disabled =
 * false) её нельзя просто разблокировать, если токен ещё не выбран.
 */
function setPreviewButtonsDisabled(disabled: boolean): void {
  document.querySelectorAll<HTMLButtonElement>(".tc-preview-btn").forEach((btn) => {
    if (disabled) {
      btn.disabled = true;
      return;
    }
    if (btn.classList.contains("tc-mapped-preview-btn")) {
      const host = btn.closest<HTMLElement>(".ds-action-extra");
      btn.disabled = !host?.dataset.selectedVariableId;
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
}

function showPreviewErrorInModal(message: string): void {
  $("tc-preview-loading").hidden = true;
  $("tc-preview-images").hidden = true;
  const errorEl = $("tc-preview-error");
  errorEl.hidden = false;
  errorEl.textContent = message;
}

function openPreviewModal(): void {
  $("tc-preview-overlay").hidden = false;
  showPreviewLoading();
}

function closePreviewModal(): void {
  $("tc-preview-overlay").hidden = true;
  activePreviewRecordId = null;
}

/**
 * `variableId` — токен, выбранный вручную через combobox «Выбрать токен
 * из AID», ещё до сохранения решения («Применить решение»). Без него
 * превью строится по автоматически найденному target строки, как раньше.
 */
function requestPreview(recordId: string, variableId?: string): void {
  if (previewInFlight) {
    showError("Дождитесь завершения текущего построения превью.");
    return;
  }
  previewInFlight = true;
  activePreviewRecordId = recordId;
  setPreviewButtonsDisabled(true);
  openPreviewModal();
  post({ type: "build-preview", recordId, variableId });
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

/** Доступно только для строк со статусом "Mapped" (решение mapped/mapped_suggested) с известной переменной библиотеки. */
function canApplyToLayout(result: ComparisonResult): boolean {
  return result.status === "mapped" && Boolean(result.target?.variableId);
}

const PROPERTY_LABELS: Record<string, string> = {
  fill: "Заливка (fill)",
  stroke: "Обводка (stroke)",
  "text-fill": "Заливка текста (text fill)",
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
    })}<div class="ds-value-meta__caption">${escapeHtml(bindingLabel)} · uses: ${result.count}</div>`;
  } else {
    const hex = String((result.comparisonValue as { hex?: string }).hex ?? "");
    const swatchClass = styleSwatch ? "ds-color-swatch ds-color-swatch--style" : "ds-color-swatch";
    const caption = result.sourceName
      ? `${escapeHtml(bindingLabel)} · ${escapeHtml(result.displayValue)}`
      : escapeHtml(bindingLabel);
    beforeBody = `<span class="${swatchClass}" style="background:${hex}"></span><span class="ds-value-meta__primary">${beforePrimary}</span><div class="ds-value-meta__caption">${caption}</div>`;
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
    showApplyModalPreviewError("Дождитесь завершения другого построения превью и откройте модалку снова.");
    return;
  }
  previewInFlight = true;
  applyModalPreviewPending = true;
  setPreviewButtonsDisabled(true);
  showApplyModalPreviewLoading();
  post({ type: "build-preview", recordId });
}

function openApplyToLayoutModal(result: ComparisonResult): void {
  activeApplyRecordId = result.id;
  applyModalPreviewPending = false;

  $("tc-apply-summary").innerHTML = `
    <div class="tc-apply-summary__row"><span>Слой/группа</span><strong>${escapeHtml(
      result.representativeNodeName || "(без имени)"
    )}</strong></div>
    <div class="tc-apply-summary__row"><span>Свойство</span><strong>${escapeHtml(
      propertyLabel(result.property)
    )}</strong></div>
    <div class="tc-apply-summary__row"><span>Затронуто нод (uses)</span><strong>${result.count}</strong></div>
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

function showApplyToLayoutResult(applied: number, skipped: Array<{ nodeId: string; reason: string }>): void {
  $("tc-apply-loading").hidden = true;
  const resultView = $("tc-apply-result-view");
  resultView.hidden = false;

  const total = applied + skipped.length;
  const skippedHtml =
    skipped.length > 0
      ? `<ul class="tc-apply-skipped-list">${skipped
          .map((item) => `<li><code>${escapeHtml(item.nodeId)}</code> — ${escapeHtml(item.reason)}</li>`)
          .join("")}</ul>`
      : "";

  resultView.innerHTML = `
    <p class="tc-apply-result__summary">Применено к ${applied} из ${total} нод${
    skipped.length > 0 ? `, пропущено: ${skipped.length}` : ""
  }.</p>
    ${skippedHtml}
    <p class="ds-status-line">Пересканируйте макет, чтобы обновить таблицу результатов.</p>
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

function formatLibraryTokenLabel(token: LibraryToken): string {
  return `${token.name} (${token.collectionName})`;
}

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
    requestPreview(recordId, variableId);
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
    )} · uses: ${result.count}</div>`;
  }

  const hex = String((result.comparisonValue as { hex?: string }).hex ?? "");
  const caption = result.sourceName
    ? `${bindingLabel} · ${escapeHtml(result.displayValue)} · uses: ${result.count}`
    : `${bindingLabel} · uses: ${result.count}`;

  return `<span class="${swatchClass}" style="background:${hex}"></span><span class="ds-value-meta__primary">${primary}</span><div class="ds-value-meta__caption">${caption}</div>`;
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
  document.querySelectorAll<HTMLTableRowElement>("#tc-results-tbody tr[data-record-id]").forEach((row) => {
    row.classList.toggle("ds-row-selected", row.dataset.recordId === recordId);
  });
  updateApplyButtonState();
}

function updateApplyButtonState(): void {
  const btn = $<HTMLButtonElement>("tc-apply-decision-btn");
  btn.disabled = !selectedRecordId || !rowControls.has(selectedRecordId);
}

function renderResultsSummary(): void {
  const total = currentResults.length;
  const visible = getFilteredResults();
  const visibleCount = visible.length;
  const decided = visible.filter((r) => r.decision).length;

  if (total === 0) {
    $("tc-results-summary").textContent = "Все в порядке — расхождений не найдено (или запустите сканирование).";
    return;
  }

  if (visibleCount === 0) {
    $("tc-results-summary").textContent = `0 из ${total} случаев — выберите статусы в фильтре колонки «Статус».`;
    return;
  }

  if (isStatusFilterPartial()) {
    $("tc-results-summary").textContent = `${visibleCount} из ${total} случаев (фильтр по статусу), обработано: ${decided}/${visibleCount}`;
    return;
  }

  $("tc-results-summary").textContent = `${total} случаев требуют решения, обработано: ${decided}/${total}`;
}

function renderResultsTable(preferredSelectedId?: string): void {
  const tbody = $("tc-results-tbody");
  tbody.innerHTML = "";
  rowControls.clear();
  selectedRecordId = null;
  updateStatusFilterIndicator();
  renderResultsSummary();

  const visibleResults = getFilteredResults();

  if (currentResults.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="6" class="ds-empty-state">Расхождений нет — все цвета уже на токенах библиотеки или не требуют замены. Запустите сканирование заново после изменений в макете.</td>`;
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

  const nextSelectedId =
    preferredSelectedId && visibleResults.some((item) => item.id === preferredSelectedId)
      ? preferredSelectedId
      : visibleResults[0].id;
  setSelectedRow(nextSelectedId);
}

function buildResultRow(result: ComparisonResult): HTMLTableRowElement {
  const row = document.createElement("tr");
  row.dataset.recordId = result.id;

  const statusCell = document.createElement("td");
  const badge = document.createElement("span");
  if (result.decision === "value_fix_proposed") {
    badge.className = "ds-badge value-fix-proposed";
    badge.textContent = `Правка предложена (${result.decisionProposedModeName ?? "mode"})`;
    badge.title = `Исходный статус: ${statusLabel(result)}`;
  } else {
    const badgeClass =
      result.bindingType === "style"
        ? "style-binding"
        : result.bindingType === "ghost"
          ? "ghost-binding"
          : result.status === "layout-only" && result.bindingType === "hardcoded"
            ? "hardcoded-no-analog"
            : result.status;
    badge.className = `ds-badge ${badgeClass}`;
    badge.textContent = statusLabel(result);
    if (result.status === "name-match-unresolved") {
      badge.title =
        "В библиотеке есть переменная с этим именем, но её значение не удалось получить (алиас на другой файл). Сравните вручную и выберите решение.";
    }
  }
  statusCell.appendChild(badge);
  if (result.decision && result.decision !== "value_fix_proposed") {
    const check = document.createElement("span");
    check.className = "ds-decision-check";
    check.textContent = " ✓";
    check.title = `Решение: ${result.decision}`;
    statusCell.appendChild(check);
  }
  row.appendChild(statusCell);

  const layerCell = document.createElement("td");
  const layerLink = document.createElement("button");
  layerLink.type = "button";
  layerLink.className = "ds-accent-link";
  layerLink.title = "Перейти к слою в макете";
  layerLink.textContent = result.representativeNodeName || "(без имени)";
  layerLink.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    post({ type: "select-nodes", payload: { nodeIds: result.nodeIds } });
  });
  layerCell.appendChild(layerLink);
  const path = document.createElement("div");
  path.className = "ds-value-meta__caption";
  path.textContent = result.representativeNodePath;
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

  if (canShowPreview(result)) {
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
      },
    });
    return;
  }

  if (decision === "mapped") {
    const input = mappedExtra.querySelector(".ds-combobox__input") as HTMLInputElement | null;
    const label = input?.value.trim() ?? "";
    let variableId = mappedExtra.dataset.selectedVariableId;
    if (!variableId && label) {
      const matchedToken = currentLibraryTokens.find((token) => formatLibraryTokenLabel(token) === label);
      variableId = matchedToken?.variableId;
    }
    if (!variableId) {
      showError("Выберите токен из списка AID — точное совпадение по имени не найдено.");
      return;
    }
    post({
      type: "apply-decision",
      payload: { recordId: result.id, decision, targetVariableId: variableId, targetName: label },
    });
    return;
  }

  if (decision === "ignored") {
    const comment = (commentExtra.querySelector(".tc-comment-input") as HTMLTextAreaElement).value.trim();
    if (!comment) {
      showError("Для решения «Игнорировать» комментарий обязателен.");
      return;
    }
    post({ type: "apply-decision", payload: { recordId: result.id, decision, comment } });
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
      showError("Выбранный токен не найден в загруженной библиотеке.");
      return;
    }
    const modeSelect = valueFixExtra.querySelector<HTMLSelectElement>(".tc-value-fix-mode");
    const proposedInput = valueFixExtra.querySelector<HTMLInputElement>(".tc-value-fix-proposed");
    const commentInput = valueFixExtra.querySelector<HTMLTextAreaElement>(".tc-value-fix-comment");
    if (!modeSelect || !proposedInput) {
      showError("Не удалось прочитать поля решения «Предложить правку значения».");
      return;
    }
    if (!modeSelect.value) {
      showError("Выберите режим библиотеки, для которого предлагается правка.");
      return;
    }
    const proposedRaw = proposedInput.value.trim();
    if (!isValidHex(proposedRaw)) {
      showError("Укажите валидный hex в поле «Предлагаемое значение» (#RRGGBB).");
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
      },
    });
    return;
  }

  post({ type: "apply-decision", payload: { recordId: result.id, decision } });
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
  $<HTMLButtonElement>("tc-apply-decision-btn").addEventListener("click", () => {
    if (!selectedRecordId) return;
    const controls = rowControls.get(selectedRecordId);
    const result = currentResults.find((item) => item.id === selectedRecordId);
    if (!controls || !result) return;
    applyDecision(result, controls.select, controls.mappedExtra, controls.commentExtra, controls.valueFixExtra);
  });
}

// ---------------------------------------------------------------------------
// Экспорт: кнопка + меню «Скачать» / «Напечатать»
// ---------------------------------------------------------------------------

type ExportFormat = "csv" | "json" | "md";

const EXPORT_FILE_CONFIG: Record<
  ExportFormat,
  { filename: string; mime: string; serialize: (rows: ExportRow[]) => string }
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
        downloadTextFile(config.filename, config.mime, config.serialize(rows));
      });

    dropdown.querySelector<HTMLButtonElement>('[data-action="print"]')?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeAllExportMenus();
      const results = getFilteredResults();
      if (results.length === 0) {
        showError("Нет строк для печати — таблица результатов пуста или всё скрыто фильтром.");
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
      const { hasToken, libraryFileName, libraryCache, hasGitHubToken, githubRepo, githubRegistryPath, registryCache } =
        message.payload;
      if (libraryFileName) $<HTMLInputElement>("tc-filekey-input").value = libraryFileName;
      $<HTMLInputElement>("tc-token-input").placeholder = hasToken ? "•••••••• (сохранён)" : "figd_...";
      renderLibraryStatus(
        libraryCache
          ? `Библиотека загружена: ${libraryCache.count} цветовых переменных, обновлена ${new Date(
              libraryCache.fetchedAt
            ).toLocaleString("ru-RU")}.`
          : "Библиотека ещё не загружена."
      );

      if (githubRepo) $<HTMLInputElement>("tc-github-repo-input").value = githubRepo;
      if (githubRegistryPath) $<HTMLInputElement>("tc-github-registry-path-input").value = githubRegistryPath;
      $<HTMLInputElement>("tc-github-token-input").placeholder = hasGitHubToken
        ? "•••••••• (сохранён)"
        : "github_pat_...";
      renderRegistryStatus(
        registryCache
          ? registryCache.localOnly
            ? `Локальный пустой реестр: версия ${registryCache.registryVersion}, ${registryCache.entryCount} записей, инициализирован ${new Date(
                registryCache.fetchedAt
              ).toLocaleString("ru-RU")}.`
            : `Реестр загружен: версия ${registryCache.registryVersion}, ${registryCache.entryCount} записей, обновлён ${new Date(
                registryCache.fetchedAt
              ).toLocaleString("ru-RU")}.`
          : "Реестр ещё не загружен."
      );
      hideRegistryNotFoundPrompt();
      break;
    }
    case "settings-saved":
      if (message.payload.libraryFileName) {
        $<HTMLInputElement>("tc-filekey-input").value = message.payload.libraryFileName;
      }
      renderLibraryStatus("Настройки сохранены.");
      break;
    case "github-settings-saved":
      $<HTMLInputElement>("tc-github-repo-input").value = message.payload.repo;
      $<HTMLInputElement>("tc-github-registry-path-input").value = message.payload.registryPath;
      renderRegistryStatus("Настройки GitHub сохранены.");
      break;
    case "registry-loading":
      renderRegistryStatus("Загрузка реестра...");
      hideRegistryNotFoundPrompt();
      break;
    case "registry-loaded": {
      $<HTMLButtonElement>("tc-load-registry-btn").disabled = false;
      renderRegistryStatus(
        `Реестр загружен: версия ${message.payload.registryVersion}, ${message.payload.entryCount} записей, обновлён ${new Date(
          message.payload.updatedAt
        ).toLocaleString("ru-RU")}.`
      );
      hideRegistryNotFoundPrompt();
      break;
    }
    case "registry-not-found": {
      $<HTMLButtonElement>("tc-load-registry-btn").disabled = false;
      renderRegistryStatus("Файл реестра ещё не создан в репозитории.");
      showRegistryNotFoundPrompt(message.payload.repo, message.payload.registryPath);
      break;
    }
    case "registry-initialized":
      renderRegistryStatus(
        `Локальный пустой реестр инициализирован: версия ${message.payload.registryVersion}, ${message.payload.entryCount} записей.`
      );
      hideRegistryNotFoundPrompt();
      break;
    case "library-loading":
      renderLibraryStatus("Загрузка библиотеки...");
      break;
    case "library-loaded": {
      $<HTMLButtonElement>("tc-load-library-btn").disabled = false;
      currentLibraryTokens = message.payload.tokens;
      $<HTMLInputElement>("tc-filekey-input").value = message.payload.fileName;
      renderLibraryStatus(
        `Библиотека загружена: ${message.payload.tokens.length} цветовых переменных, обновлена ${new Date(
          message.payload.fetchedAt
        ).toLocaleString("ru-RU")}.`
      );
      break;
    }
    case "scan-progress":
      $("tc-scan-status").textContent = message.payload.message;
      break;
    case "scan-results": {
      $<HTMLButtonElement>("tc-scan-btn").disabled = false;
      $("tc-scan-status").textContent = `Готово: найдено ${message.payload.results.length} групп значений.`;
      currentResults = message.payload.results;
      currentLibraryTokens = message.payload.libraryTokens;
      syncStatusFiltersFromResults(currentResults, true);
      closeStatusFilterMenu();
      renderResultsTable();
      switchToTab("results");
      break;
    }
    case "decision-applied": {
      const index = currentResults.findIndex((r) => r.id === message.payload.recordId);
      if (index !== -1) {
        currentResults[index] = message.payload.result;
        // После Mapped строка меняет status на "mapped" — новый ключ фильтра,
        // которого не было при первом скане. Без добавления в activeStatusFilters
        // строка исчезает из таблицы сразу после «Применить решение», и кнопка
        // «Применить в макет» становится недоступна.
        if (message.payload.result.status === "mapped") {
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
        showApplyToLayoutResult(message.applied, message.skipped);
      }
      break;
    }
    case "error": {
      $<HTMLButtonElement>("tc-load-library-btn").disabled = false;
      $<HTMLButtonElement>("tc-load-registry-btn").disabled = false;
      $<HTMLButtonElement>("tc-scan-btn").disabled = false;
      setExportButtonsDisabled(false);
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
initGuideAccordion();
initScopeSegment();
initSettingsPanel();
initGitHubSettingsPanel();
initScanPanel();
initStatusFilterMenu();
initComboboxGlobalHandlers();
initExportMenus();
initApplyFooterButton();
initPreviewModal();
initApplyToLayoutModal();
initWindowResize();
renderResultsTable();
post({ type: "ui-ready" });
