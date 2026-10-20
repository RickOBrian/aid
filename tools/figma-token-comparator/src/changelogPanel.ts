/**
 * Вкладка «Чейнжлог» — «Записать изменения» (changelog-guide §6), сторона UI.
 * Главный поток — src/changelogFlow.ts.
 */

import { KIND_LABELS, type DraftChange } from "./lib/changelogRecord";
import type { ChangelogTableInfo, CodeToUiMessage, UiToCodeMessage } from "./messages";

type Post = (message: UiToCodeMessage) => void;

const COMPONENTS_SOURCE = "__components__";

const FAILURE_TEXT: Record<string, string> = {
  invalid_key: "Нужен ключ для отправки решений — укажите его в «Настройках».",
  network: "Нет связи с сервером. Проверьте подключение и попробуйте ещё раз.",
  submit_failed: "Сервер не смог записать изменения. Попробуйте позже.",
  registry_unavailable: "Сервер не отдал список чейнжлогов. Попробуйте позже.",
  stale: "Библиотеку поправили после черновика — черновик собран заново, проверьте его.",
};

const BUMP_TEXT: Record<DraftChange["bump"], string> = { major: "major", minor: "minor", patch: "patch" };

let post: Post = () => undefined;
let tables: ChangelogTableInfo[] = [];
let drafts: DraftChange[] = [];
let draftPath: string | null = null;
let loaded = false;

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`UI element #${id} not found`);
  return node as T;
}

function setStatus(text: string, link?: string | null): void {
  const status = el("tc-changelog-status");
  status.textContent = text;
  if (link) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ds-badge ds-badge--info ds-badge--action";
    button.textContent = `PR #${link.replace(/^.*\//, "")}`;
    button.addEventListener("click", () => post({ type: "open-external", payload: { url: link } }));
    status.append(" ", button);
  }
}

function setBusy(busy: boolean): void {
  for (const id of ["tc-changelog-refresh-btn", "tc-changelog-baseline-btn", "tc-changelog-record-btn"]) {
    el<HTMLButtonElement>(id).disabled = busy;
  }
  el<HTMLSelectElement>("tc-changelog-select").disabled = busy;
}

function selectedTable(): ChangelogTableInfo | null {
  const path = el<HTMLSelectElement>("tc-changelog-select").value;
  return tables.find((table) => table.path === path) ?? null;
}

function hideDraft(): void {
  drafts = [];
  draftPath = null;
  el("tc-changelog-draft").hidden = true;
}

function load(): void {
  setBusy(true);
  hideDraft();
  setStatus("Ищу таблицы чейнжлогов в этом файле…");
  post({ type: "changelog-load" });
}

/** Таблица выбрана: нет снимка — предложить его снять, есть — собрать черновик. */
function onTableSelected(): void {
  hideDraft();
  const table = selectedTable();
  el("tc-changelog-baseline").hidden = !table || table.hasSnapshot;
  if (!table) return;
  if (!table.hasSnapshot) {
    setStatus("");
    return;
  }
  setBusy(true);
  setStatus("Сравниваю со снимком…");
  post({ type: "changelog-prepare", payload: { path: table.path } });
}

function renderTables(payload: Extract<CodeToUiMessage, { type: "changelog-tables" }>["payload"]): void {
  const previous = el<HTMLSelectElement>("tc-changelog-select").value;
  tables = payload.tables;
  const select = el<HTMLSelectElement>("tc-changelog-select");
  select.replaceChildren(
    ...tables.map((table) => {
      const option = document.createElement("option");
      option.value = table.path;
      option.textContent = table.currentVersion ? `${table.artifact} · ${table.currentVersion}` : table.artifact;
      return option;
    })
  );
  if (tables.some((table) => table.path === previous)) select.value = previous;

  const source = el<HTMLSelectElement>("tc-changelog-source-select");
  source.replaceChildren(
    ...payload.collections.map((collection) => {
      const option = document.createElement("option");
      option.value = collection.id;
      option.textContent = collection.name;
      return option;
    }),
    Object.assign(document.createElement("option"), {
      value: COMPONENTS_SOURCE,
      textContent: "Компоненты и иконки файла",
    })
  );

  setBusy(false);
  if (tables.length === 0) {
    el("tc-changelog-baseline").hidden = true;
    setStatus("В этом файле нет таблиц чейнжлогов из репозитория. Откройте плагин в файле библиотеки.");
    return;
  }
  onTableSelected();
}

function renderDraft(payload: Extract<CodeToUiMessage, { type: "changelog-draft" }>["payload"]): void {
  setBusy(false);
  drafts = payload.drafts;
  draftPath = payload.path;
  const table = tables.find((item) => item.path === payload.path);
  const since = payload.baseVersion ? `от версии ${payload.baseVersion}` : "от снимка";

  if (drafts.length === 0) {
    el("tc-changelog-draft").hidden = true;
    setStatus(`Изменений ${since} нет.`, table?.pullRequestUrl);
    return;
  }

  setStatus(`${table?.sourceLabel ?? ""} · изменений ${since}: ${drafts.length}`, table?.pullRequestUrl);
  el<HTMLInputElement>("tc-changelog-author").value = payload.author;

  const list = el("tc-changelog-list");
  list.replaceChildren(
    ...drafts.map((draft, index) => {
      const item = document.createElement("li");
      item.className = "tc-changelog-item";

      const head = document.createElement("div");
      head.className = "ds-row";
      const badge = document.createElement("span");
      badge.className = `ds-badge ${draft.kind === "removed" ? "ds-badge--danger" : draft.kind === "added" ? "ds-badge--success" : "ds-badge--info"}`;
      badge.textContent = KIND_LABELS[draft.kind];
      const bump = document.createElement("span");
      bump.className = "ds-badge ds-badge--neutral ds-badge--secondary";
      bump.textContent = BUMP_TEXT[draft.bump];
      bump.title = "Предлагаемая цифра версии";
      head.append(badge, bump);

      const description = document.createElement("textarea");
      description.className = "ds-textarea";
      description.rows = 2;
      description.value = draft.description;
      description.placeholder = draft.hint ? `${draft.hint}: что и зачем — одной фразой` : "Что и зачем — одной фразой";
      description.setAttribute("aria-label", `Описание: ${KIND_LABELS[draft.kind]}`);
      description.addEventListener("input", () => {
        drafts[index] = { ...drafts[index], description: description.value };
      });

      item.append(head, description);
      if (draft.details) {
        const details = document.createElement("pre");
        details.className = "tc-changelog-item__details";
        details.textContent = draft.details;
        item.append(details);
      }
      return item;
    })
  );
  el("tc-changelog-draft").hidden = false;
}

export function initRecordPanel(postMessage: Post): void {
  post = postMessage;
  el("tc-tab-changelog").addEventListener("click", () => {
    if (!loaded) {
      loaded = true;
      load();
    }
  });
  el("tc-changelog-refresh-btn").addEventListener("click", load);
  el("tc-changelog-select").addEventListener("change", onTableSelected);

  el("tc-changelog-baseline-btn").addEventListener("click", () => {
    const table = selectedTable();
    if (!table) return;
    const value = el<HTMLSelectElement>("tc-changelog-source-select").value;
    setBusy(true);
    setStatus("Снимаю снимок…");
    post({
      type: "changelog-baseline",
      payload: {
        path: table.path,
        source: value === COMPONENTS_SOURCE ? { kind: "components" } : { kind: "variables", collectionId: value },
      },
    });
  });

  el("tc-changelog-record-btn").addEventListener("click", () => {
    if (!draftPath) return;
    const missing = drafts.filter((draft) => !draft.description.trim());
    if (missing.length > 0) {
      setStatus(`Допишите описание: ${missing.length}.`);
      return;
    }
    setBusy(true);
    setStatus("Обновляю таблицу и отправляю…");
    post({
      type: "changelog-record",
      payload: { path: draftPath, drafts, author: el<HTMLInputElement>("tc-changelog-author").value },
    });
  });
}

/** Сообщения главного потока для вкладки; true — сообщение обработано. */
export function handleRecordMessage(message: CodeToUiMessage): boolean {
  switch (message.type) {
    case "changelog-tables":
      renderTables(message.payload);
      return true;
    case "changelog-draft":
      renderDraft(message.payload);
      return true;
    case "changelog-recorded": {
      setBusy(false);
      const table = tables.find((item) => item.path === message.payload.path);
      if (table && message.payload.pullRequestUrl) table.pullRequestUrl = message.payload.pullRequestUrl;
      const text =
        message.payload.outcome === "unchanged"
          ? "Таблица обновлена; запись на сервере уже такая же."
          : message.payload.outcome === "updated"
            ? "Таблица обновлена, запись дописана в открытый PR."
            : "Таблица обновлена, открыт PR с чейнжлогом.";
      setStatus(text, message.payload.pullRequestUrl);
      return true;
    }
    case "changelog-failed": {
      setBusy(false);
      const problems = message.payload.problems?.join(" ");
      setStatus(problems || FAILURE_TEXT[message.payload.reason] || FAILURE_TEXT.submit_failed);
      return true;
    }
    default:
      return false;
  }
}

/** Общая ошибка главного потока — разблокировать кнопки вкладки. */
export function resetRecordPanel(): void {
  setBusy(false);
}
