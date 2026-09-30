/** Этап 1 в интерфейсе: область, список экранов с парами, сборка. */

import { buildPlan, rowCount } from "../assemble/plan";
import type { AssembleRequest, ScanItem, ScanResult } from "../assemble/types";
import type { PageInfo } from "../messages";
import { badge, el, h, send } from "./dom";

interface State {
  scope: "selection" | "pages";
  pages: PageInfo[];
  checkedPages: Set<string>;
  scan: ScanResult | null;
  included: Set<string>;
  /** тёмный id → светлый id */
  pairs: Map<string, string>;
  thumbs: Map<string, string>;
  pending: AssembleRequest | null;
}

const state: State = {
  scope: "pages",
  pages: [],
  checkedPages: new Set(),
  scan: null,
  included: new Set(),
  pairs: new Map(),
  thumbs: new Map(),
  pending: null,
};

let setStatus: (text: string) => void = () => undefined;

function filteredPages(): PageInfo[] {
  const q = el<HTMLInputElement>("page-filter").value.trim().toLowerCase();
  return q ? state.pages.filter((p) => p.name.toLowerCase().includes(q)) : state.pages;
}

function renderPages(): void {
  el("pages-list").replaceChildren(
    ...filteredPages().map((p) => {
      const input = h("input");
      input.type = "checkbox";
      input.checked = state.checkedPages.has(p.id);
      input.addEventListener("change", () => {
        if (input.checked) state.checkedPages.add(p.id);
        else state.checkedPages.delete(p.id);
      });
      return h("label", { className: "ds-check" }, [input, h("span", { text: p.name })]);
    }),
  );
}

function renderScope(): void {
  el("scope-selection").setAttribute("aria-pressed", String(state.scope === "selection"));
  el("scope-pages").setAttribute("aria-pressed", String(state.scope === "pages"));
  el("pages-box").hidden = state.scope !== "pages";
}

function allItems(): Map<string, ScanItem> {
  const map = new Map<string, ScanItem>();
  for (const page of state.scan?.pages ?? []) for (const item of page.items) map.set(item.id, item);
  return map;
}

function plan() {
  return buildPlan(state.scan?.pages ?? [], state.included, state.pairs);
}

function renderFooter(): void {
  const rows = rowCount(plan());
  const button = el<HTMLButtonElement>("assemble");
  button.disabled = rows === 0;
  button.textContent = rows ? `Собрать · ${rows}` : "Собрать";
}

function thumb(id: string): HTMLImageElement {
  const img = h("img", { className: "ds-thumb" });
  img.alt = "";
  const png = state.thumbs.get(id);
  if (png) img.src = `data:image/png;base64,${png}`;
  img.dataset.thumb = id;
  return img;
}

function nameButton(item: ScanItem): HTMLButtonElement {
  const b = h("button", { className: "ds-screen__name", text: item.name, type: "button" });
  b.title = "Показать на канвасе";
  b.addEventListener("click", () => send({ type: "focus", nodeId: item.id }));
  return b;
}

function screenRow(item: ScanItem, items: Map<string, ScanItem>): HTMLElement[] {
  const check = h("input");
  check.type = "checkbox";
  check.checked = state.included.has(item.id);
  check.setAttribute("aria-label", `Собирать «${item.name}»`);
  check.addEventListener("change", () => {
    if (check.checked) state.included.add(item.id);
    else state.included.delete(item.id);
    renderFooter();
  });

  const meta: Array<Node | string> = [`${item.width}×${item.height}`];
  if (item.kind === "image") meta.push(badge("картинка — по умолчанию не собирается", "neutral"));
  else if (item.dark) meta.push(badge("тёмный, без пары", "warning"));

  const rows: HTMLElement[] = [
    h("div", { className: "ds-screen" }, [
      check,
      thumb(item.id),
      h("div", { className: "ds-screen__body" }, [nameButton(item), h("div", { className: "ds-screen__meta" }, meta)]),
    ]),
  ];

  for (const [darkId, lightId] of state.pairs) {
    if (lightId !== item.id) continue;
    const dark = items.get(darkId);
    if (!dark) continue;
    const unpair = h("button", { className: "ds-link", text: "разъединить", type: "button" });
    unpair.addEventListener("click", () => {
      state.pairs.delete(darkId);
      state.included.add(darkId);
      renderScreens();
    });
    const reason = dark.pairReason && dark.pairedWith === item.id ? ` · ${dark.pairReason}` : " · вручную";
    rows.push(
      h("div", { className: "ds-screen ds-screen--pair" }, [
        h("span"),
        thumb(dark.id),
        h("div", { className: "ds-screen__body" }, [
          nameButton(dark),
          h("div", { className: "ds-screen__meta" }, [badge(`тёмная пара${reason}`, "info"), unpair]),
        ]),
      ]),
    );
  }
  return rows;
}

function renderScreens(): void {
  const scan = state.scan;
  if (!scan) return;
  const items = allItems();
  const list = el("screens-list");
  list.replaceChildren();
  for (const page of scan.pages) {
    const visible = page.items.filter((i) => !state.pairs.has(i.id));
    list.append(h("p", { className: "ds-group-title", text: `${page.pageName} · ${visible.length}` }));
    for (const item of visible) list.append(...screenRow(item, items));
  }

  const screens = [...items.values()].filter((i) => i.kind === "screen").length;
  const images = [...items.values()].filter((i) => i.kind === "image").length;
  el("scan-summary").textContent =
    `Экранов: ${screens}, тёмных пар: ${state.pairs.size}, картинок: ${images}. ` +
    "Имя экрана — показать его на канвасе.";


  el("skipped-box").hidden = scan.skippedTotal === 0;
  el("skipped-summary").textContent = `Не экраны: ${scan.skippedTotal}`;
  el("skipped-list").replaceChildren(
    ...scan.skipped.map((s) => h("div", { text: `${s.pageName} / ${s.name} — ${s.reason}` })),
    ...(scan.skippedTotal > scan.skipped.length ? [h("div", { text: `…и ещё ${scan.skippedTotal - scan.skipped.length}` })] : []),
  );
  el("screens-card").hidden = false;
  renderFooter();
}

function startAssemble(request: AssembleRequest): void {
  el<HTMLButtonElement>("assemble").disabled = true;
  el("conflict").hidden = true;
  setStatus("Собираю…");
  send({ type: "assemble", request });
}

export function initAssemble(status: (text: string) => void): void {
  setStatus = status;

  el("scope-selection").addEventListener("click", () => {
    state.scope = "selection";
    renderScope();
  });
  el("scope-pages").addEventListener("click", () => {
    state.scope = "pages";
    renderScope();
  });
  el("page-filter").addEventListener("input", renderPages);
  el("pages-all").addEventListener("click", () => {
    for (const p of filteredPages()) state.checkedPages.add(p.id);
    renderPages();
  });
  el("pages-none").addEventListener("click", () => {
    state.checkedPages.clear();
    renderPages();
  });

  el("scan").addEventListener("click", () => {
    if (state.scope === "pages" && state.checkedPages.size === 0) {
      setStatus("Отметьте хотя бы одну страницу");
      return;
    }
    setStatus("Ищу экраны…");
    send({
      type: "scan",
      scope: state.scope === "selection" ? { kind: "selection" } : { kind: "pages", pageIds: [...state.checkedPages] },
    });
  });

  el("pair-selected").addEventListener("click", () => send({ type: "pair-selected" }));

  el("assemble").addEventListener("click", () => {
    startAssemble({ pages: plan(), darkFromTheme: false });
  });
  el("conflict-replace").addEventListener("click", () => state.pending && startAssemble({ ...state.pending, onConflict: "replace" }));
  el("conflict-add").addEventListener("click", () => state.pending && startAssemble({ ...state.pending, onConflict: "add" }));
  el("conflict-cancel").addEventListener("click", () => {
    el("conflict").hidden = true;
    state.pending = null;
    renderFooter();
    setStatus("Сборка отменена");
  });

  el("disassemble").addEventListener("click", () => {
    el("disassemble-confirm").hidden = false;
  });
  el("disassemble-no").addEventListener("click", () => {
    el("disassemble-confirm").hidden = true;
  });
  el("disassemble-yes").addEventListener("click", () => {
    el("disassemble-confirm").hidden = true;
    send({ type: "disassemble" });
  });

  renderScope();
}

export const assembleHandlers = {
  pages(pages: PageInfo[]): void {
    state.pages = pages;
    renderPages();
  },
  scanResult(result: ScanResult): void {
    state.scan = result;
    state.thumbs.clear();
    state.pairs = new Map();
    state.included = new Set();
    for (const page of result.pages) {
      for (const item of page.items) {
        if (item.pairedWith) state.pairs.set(item.id, item.pairedWith);
        // Картинки по умолчанию не собираются (решение этапа 1).
        if (item.kind === "screen") state.included.add(item.id);
      }
    }
    renderScreens();
    setStatus("Проверьте список: снимите лишнее, поправьте пары");
  },
  thumb(id: string, png: string): void {
    state.thumbs.set(id, png);
    for (const img of document.querySelectorAll<HTMLImageElement>(`img[data-thumb="${CSS.escape(id)}"]`)) {
      img.src = `data:image/png;base64,${png}`;
    }
  },
  pair(lightId: string, darkId: string): void {
    // Экран может быть только в одной паре.
    for (const [d, l] of [...state.pairs]) if (d === darkId || l === lightId || d === lightId || l === darkId) state.pairs.delete(d);
    state.pairs.set(darkId, lightId);
    state.included.add(lightId);
    renderScreens();
    setStatus("Пара связана");
  },
  conflict(sections: string[], request: AssembleRequest): void {
    state.pending = request;
    el("conflict-text").textContent =
      `Уже собрано: ${sections.join(", ")}. Заменить собранное или добавить новую версию рядом? ` +
      "Ручные правки в заменяемых секциях пропадут; исходники не затрагиваются.";
    el("conflict").hidden = false;
    setStatus("");
  },
  progress(done: number, total: number): void {
    setStatus(`Собираю: ${done} из ${total}`);
  },
  done(sections: number, rows: number, ms: number): void {
    state.pending = null;
    renderFooter();
    setStatus(`Собрано: секций «ДО» ${sections}, экранов ${rows} за ${(ms / 1000).toFixed(1)} с. Дальше — шаг «2 · Перевести»`);
  },
  disassembled(removed: number): void {
    setStatus(removed ? `Убрано секций: ${removed}` : "Собранных секций нет");
  },
  failed(): void {
    renderFooter();
  },
};
