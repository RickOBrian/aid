/**
 * AID Style Migration — главный поток плагина.
 *
 * Этап 0: каркас и проверки API (docs/spike-2026-09-29.md, «Факты API»).
 * Проверки на чтение документ не меняют; проверки с записью работают во
 * временном фрейме на странице «AID Migration» и убирают его за собой.
 */

import type { CodeToUi, UiToCode } from "./messages";
import { runReadProbes } from "./probes/readProbes";
import { runWriteProbes } from "./probes/writeProbes";

const WINDOW = { width: 440, height: 640 };

function post(message: CodeToUi): void {
  figma.ui.postMessage(message);
}

figma.showUI(__html__, { ...WINDOW, themeColors: false });

post({ type: "init", fileName: figma.root.name, selectionCount: figma.currentPage.selection.length });

figma.on("selectionchange", () => {
  post({ type: "selection", selectionCount: figma.currentPage.selection.length });
});

figma.ui.onmessage = async (message: UiToCode) => {
  if (message.type === "close") {
    figma.closePlugin();
    return;
  }
  if (message.type === "run-probes") {
    const report = (title: string) => post({ type: "probe-progress", title });
    try {
      const results = message.kind === "read" ? await runReadProbes(report) : await runWriteProbes(report);
      post({ type: "probe-results", kind: message.kind, results });
    } catch (e) {
      post({ type: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }
};
