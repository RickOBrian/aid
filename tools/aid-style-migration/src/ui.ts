/**
 * UI плагина. Вкладки «Сборка» (этап 1) и «Продукт» (этап 2a); проверки
 * API этапа 0 — в «Диагностике».
 */

import type { CodeToUi } from "./messages";
import { assembleHandlers, initAssemble } from "./ui/assemblePanel";
import { el } from "./ui/dom";
import { initProbes, probeHandlers } from "./ui/probesPanel";
import { initMap, mapHandlers } from "./ui/mapPanel";
import { initProduct, productHandlers } from "./ui/productPanel";

let fileName = "";
const status = el<HTMLDivElement>("status");
const setStatus = (text: string) => {
  status.textContent = text;
};

initAssemble(setStatus);
initProbes(setStatus, () => fileName);
initProduct(setStatus);

initMap(setStatus);

type Tab = "assemble" | "map" | "product";
function showTab(tab: Tab): void {
  for (const t of ["assemble", "map", "product"] as Tab[]) {
    el(`tab-btn-${t}`).setAttribute("aria-pressed", String(t === tab));
    el(`tab-${t}`).hidden = t !== tab;
  }
  el("assemble-footer").hidden = tab !== "assemble";
}
el("tab-btn-assemble").addEventListener("click", () => showTab("assemble"));
el("tab-btn-map").addEventListener("click", () => showTab("map"));
el("tab-btn-product").addEventListener("click", () => showTab("product"));

window.onmessage = (event: MessageEvent) => {
  const message = event.data?.pluginMessage as CodeToUi | undefined;
  if (!message) return;
  switch (message.type) {
    case "init":
      fileName = message.fileName;
      el("file-name").textContent = message.fileName;
      el("selection-count").textContent = String(message.selectionCount);
      assembleHandlers.pages(message.pages);
      break;
    case "selection":
      el("selection-count").textContent = String(message.selectionCount);
      break;
    case "scan-result":
      assembleHandlers.scanResult(message.result);
      break;
    case "thumb":
      assembleHandlers.thumb(message.id, message.png);
      break;
    case "pair-result":
      assembleHandlers.pair(message.lightId, message.darkId);
      break;
    case "assemble-conflict":
      assembleHandlers.conflict(message.sections, message.request);
      break;
    case "assemble-progress":
      assembleHandlers.progress(message.done, message.total);
      break;
    case "assemble-done":
      assembleHandlers.done(message.sections, message.rows, message.ms);
      break;
    case "disassemble-done":
      assembleHandlers.disassembled(message.removed);
      break;
    case "probe-progress":
      setStatus(`Проверяю: ${message.title}…`);
      break;
    case "probe-results":
      probeHandlers.done(message.results);
      break;
    case "profile-state":
      productHandlers.state(message.state);
      break;
    case "file-survey":
      productHandlers.survey(message.survey);
      break;
    case "profile-export":
      productHandlers.exported(message.fileName, message.text);
      break;
    case "index-progress":
      productHandlers.progress(message.title);
      break;
    case "style-map":
      mapHandlers.map(message.map);
      break;
    case "style-map-progress":
      setStatus(`Карта стиля: ${message.title}…`);
      break;
    case "notice":
      setStatus(message.message);
      break;
    case "error":
      setStatus(`Ошибка: ${message.message}`);
      probeHandlers.failed();
      assembleHandlers.failed();
      mapHandlers.failed();
      break;
  }
};
