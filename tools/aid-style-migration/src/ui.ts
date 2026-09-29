/**
 * UI плагина. Этап 0: запуск проверок API и отчёт для трекера.
 */

import type { CodeToUi, UiToCode } from "./messages";
import { formatReport, statusLabel } from "./probes/report";
import type { ProbeResult, ProbeStatus } from "./probes/types";

const BADGE_TONE: Record<ProbeStatus, string> = {
  ok: "success",
  fail: "danger",
  info: "info",
  skip: "neutral",
};

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Нет элемента #${id}`);
  return node as T;
}

function send(message: UiToCode): void {
  parent.postMessage({ pluginMessage: message }, "*");
}

const runRead = el<HTMLButtonElement>("run-read");
const runWrite = el<HTMLButtonElement>("run-write");
const copyReport = el<HTMLButtonElement>("copy-report");
const status = el<HTMLDivElement>("status");
const resultsBox = el<HTMLDivElement>("results");

let fileName = "";
const collected = new Map<string, ProbeResult>();

function setBusy(busy: boolean): void {
  runRead.disabled = busy;
  runWrite.disabled = busy;
}

function row(label: string, text: string): HTMLDivElement {
  const div = document.createElement("div");
  div.className = "ds-result__row";
  const b = document.createElement("b");
  b.textContent = `${label}: `;
  div.append(b, document.createTextNode(text));
  return div;
}

function render(): void {
  resultsBox.replaceChildren();
  for (const r of collected.values()) {
    const card = document.createElement("article");
    card.className = "ds-result";

    const head = document.createElement("div");
    head.className = "ds-result__head";
    const title = document.createElement("span");
    title.textContent = r.title;
    const badge = document.createElement("span");
    badge.className = `ds-badge ds-badge--${BADGE_TONE[r.status]}`;
    badge.textContent = statusLabel(r.status);
    head.append(title, badge);

    card.append(head, row("Ожидали", r.expected), row("Увидели", r.actual));
    resultsBox.append(card);
  }
  copyReport.disabled = collected.size === 0;
}

function copyText(text: string): boolean {
  // navigator.clipboard в iframe Figma недоступен — старый путь через textarea.
  const area = document.createElement("textarea");
  area.value = text;
  document.body.append(area);
  area.select();
  const ok = document.execCommand("copy");
  area.remove();
  return ok;
}

runRead.addEventListener("click", () => {
  setBusy(true);
  status.textContent = "Запуск…";
  send({ type: "run-probes", kind: "read" });
});

runWrite.addEventListener("click", () => {
  setBusy(true);
  status.textContent = "Запуск…";
  send({ type: "run-probes", kind: "write" });
});

copyReport.addEventListener("click", () => {
  const text = formatReport([...collected.values()], { fileName, date: new Date().toISOString().slice(0, 10) });
  status.textContent = copyText(text) ? "Отчёт скопирован — вставьте его в трекер" : "Не удалось скопировать";
});

el<HTMLButtonElement>("close").addEventListener("click", () => send({ type: "close" }));

window.onmessage = (event: MessageEvent) => {
  const message = event.data?.pluginMessage as CodeToUi | undefined;
  if (!message) return;
  switch (message.type) {
    case "init":
      fileName = message.fileName;
      el("file-name").textContent = `Этап 0 · проверка API · ${message.fileName}`;
      el("selection-count").textContent = String(message.selectionCount);
      break;
    case "selection":
      el("selection-count").textContent = String(message.selectionCount);
      break;
    case "probe-progress":
      status.textContent = `Проверяю: ${message.title}…`;
      break;
    case "probe-results":
      for (const r of message.results) collected.set(r.id, r);
      render();
      setBusy(false);
      status.textContent = "Готово";
      break;
    case "error":
      setBusy(false);
      status.textContent = `Ошибка: ${message.message}`;
      break;
  }
};
