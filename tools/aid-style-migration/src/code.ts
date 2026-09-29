/**
 * AID Style Migration — главный поток плагина.
 *
 * Этап 1 — сборка: найти экраны в выбранной области, свести тёмные пары,
 * разложить копии на странице «AID Migration» плитками «было».
 * Этап 2a — профиль продукта: материалы, индекс открытого файла, тема.
 * Исходные страницы не меняются. Проверки API этапа 0 — в «Диагностике».
 */

import { assemble, disassemble, existingSections } from "./assemble/build";
import { pairFromSelection, scan, thumbnail } from "./assemble/collect";
import { WORK_PAGE_NAME } from "./lib/workPage";
import type { CodeToUi, UiToCode } from "./messages";
import { runReadProbes } from "./probes/readProbes";
import { runWriteProbes } from "./probes/writeProbes";
import * as profiles from "./profile/controller";
import { surveyFile } from "./profile/indexFile";

const WINDOW = { width: 480, height: 720 };
/** Превью — не больше стольких экранов за скан: остальное без картинки. */
const THUMB_LIMIT = 200;

function post(message: CodeToUi): void {
  figma.ui.postMessage(message);
}

function errorText(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

figma.showUI(__html__, { ...WINDOW, themeColors: false });

post({
  type: "init",
  fileName: figma.root.name,
  selectionCount: figma.currentPage.selection.length,
  pages: figma.root.children.filter((p) => p.name !== WORK_PAGE_NAME).map((p) => ({ id: p.id, name: p.name })),
});

figma.on("selectionchange", () => {
  post({ type: "selection", selectionCount: figma.currentPage.selection.length });
});

async function handle(message: UiToCode): Promise<void> {
  switch (message.type) {
    case "close":
      figma.closePlugin();
      return;

    case "scan": {
      const result = await scan(message.scope);
      post({ type: "scan-result", result });
      const ids = result.pages.flatMap((p) => p.items.map((i) => i.id)).slice(0, THUMB_LIMIT);
      for (const id of ids) {
        const png = await thumbnail(id);
        if (png) post({ type: "thumb", id, png });
      }
      return;
    }

    case "pair-selected": {
      const pair = pairFromSelection();
      if ("error" in pair) post({ type: "notice", message: pair.error });
      else post({ type: "pair-result", ...pair });
      return;
    }

    case "assemble": {
      const request = message.request;
      if (!request.onConflict) {
        const sections = await existingSections(request.pages);
        if (sections.length) {
          post({ type: "assemble-conflict", sections, request });
          return;
        }
      }
      const result = await assemble(request, (done, total) => post({ type: "assemble-progress", done, total }));
      post({ type: "assemble-done", ...result });
      return;
    }

    case "disassemble":
      post({ type: "disassemble-done", removed: await disassemble() });
      return;

    case "focus": {
      const node = await figma.getNodeByIdAsync(message.nodeId);
      if (!node || node.type === "DOCUMENT" || node.type === "PAGE") return;
      let page: BaseNode | null = node.parent;
      while (page && page.type !== "PAGE") page = page.parent;
      if (page && page.type === "PAGE" && page !== figma.currentPage) await figma.setCurrentPageAsync(page);
      figma.currentPage.selection = [node as SceneNode];
      figma.viewport.scrollAndZoomIntoView([node as SceneNode]);
      return;
    }

    case "profile-load":
      post({ type: "profile-state", state: await profiles.state() });
      return;
    case "profile-create": {
      const result = await profiles.create(message.name);
      if ("error" in result) post({ type: "notice", message: result.error });
      post({ type: "profile-state", state: await profiles.state() });
      return;
    }
    case "profile-select":
      post({ type: "profile-state", state: await profiles.select(message.id) });
      return;
    case "profile-delete":
      post({ type: "profile-state", state: await profiles.remove(message.id) });
      return;
    case "file-survey":
      post({ type: "file-survey", survey: await surveyFile() });
      return;
    case "file-index": {
      const state = await profiles.indexOpenFile(message.kinds, message.exemplarScope, (title) => post({ type: "index-progress", title }));
      post({ type: "profile-state", state });
      post({ type: "notice", message: `Файл «${figma.root.name}» проиндексирован` });
      return;
    }
    case "links-index":
    case "links-refresh": {
      const report = (title: string) => post({ type: "index-progress", title });
      const { state, errors } =
        message.type === "links-index" ? await profiles.indexLinks(message.links, report) : await profiles.refreshLinks(report);
      post({ type: "profile-state", state });
      post({ type: "notice", message: errors.length ? `Не всё прочитано: ${errors.join("; ")}` : "Библиотеки прочитаны по ссылкам" });
      return;
    }
    case "pat-set":
      post({ type: "profile-state", state: await profiles.savePat(message.token) });
      post({ type: "notice", message: message.token.trim() ? "Токен сохранён" : "Токен удалён" });
      return;
    case "material-remove":
      post({ type: "profile-state", state: await profiles.dropMaterial(message.id) });
      return;
    case "theme-set":
      post({ type: "profile-state", state: await profiles.setTheme(message.collectionKey, message.roles) });
      return;
    case "profile-export": {
      const out = await profiles.exportActive();
      if (out) post({ type: "profile-export", ...out });
      return;
    }
    case "profile-import": {
      const result = await profiles.importProfile(message.text);
      if ("error" in result) post({ type: "notice", message: result.error });
      else post({ type: "profile-state", state: result });
      return;
    }

    case "run-probes": {
      const report = (title: string) => post({ type: "probe-progress", title });
      const results = message.kind === "read" ? await runReadProbes(report) : await runWriteProbes(report);
      post({ type: "probe-results", kind: message.kind, results });
      return;
    }
  }
}

figma.ui.onmessage = (message: UiToCode) => {
  handle(message).catch((e) => post({ type: "error", message: errorText(e) }));
};
