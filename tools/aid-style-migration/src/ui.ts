/**
 * UI плагина. Этап 1 — сборка макетов; проверки API этапа 0 — в
 * «Диагностике».
 */

import type { CodeToUi } from "./messages";
import { assembleHandlers, initAssemble } from "./ui/assemblePanel";
import { el } from "./ui/dom";
import { initProbes, probeHandlers } from "./ui/probesPanel";

let fileName = "";
const status = el<HTMLDivElement>("status");
const setStatus = (text: string) => {
  status.textContent = text;
};

initAssemble(setStatus);
initProbes(setStatus, () => fileName);

window.onmessage = (event: MessageEvent) => {
  const message = event.data?.pluginMessage as CodeToUi | undefined;
  if (!message) return;
  switch (message.type) {
    case "init":
      fileName = message.fileName;
      el("file-name").textContent = `Сборка макетов · ${message.fileName}`;
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
    case "notice":
      setStatus(message.message);
      break;
    case "error":
      setStatus(`Ошибка: ${message.message}`);
      probeHandlers.failed();
      assembleHandlers.failed();
      break;
  }
};
