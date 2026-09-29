/** Диагностика: проверки API этапа 0 и отчёт для трекера. */

import { formatReport, statusLabel } from "../probes/report";
import type { ProbeResult, ProbeStatus } from "../probes/types";
import { badge, copyText, el, h, send } from "./dom";

const TONE: Record<ProbeStatus, "success" | "danger" | "info" | "neutral"> = {
  ok: "success",
  fail: "danger",
  info: "info",
  skip: "neutral",
};

const collected = new Map<string, ProbeResult>();

function render(): void {
  const box = el<HTMLDivElement>("results");
  box.replaceChildren(
    ...[...collected.values()].map((r) =>
      h("article", { className: "ds-result" }, [
        h("div", { className: "ds-result__head" }, [h("span", { text: r.title }), badge(statusLabel(r.status), TONE[r.status])]),
        h("div", { className: "ds-result__row" }, [h("b", { text: "Ожидали: " }), r.expected]),
        h("div", { className: "ds-result__row" }, [h("b", { text: "Увидели: " }), r.actual]),
      ]),
    ),
  );
  el<HTMLButtonElement>("copy-report").disabled = collected.size === 0;
}

export function initProbes(setStatus: (text: string) => void, fileName: () => string): void {
  const read = el<HTMLButtonElement>("run-read");
  const write = el<HTMLButtonElement>("run-write");
  const busy = (on: boolean) => {
    read.disabled = on;
    write.disabled = on;
  };
  read.addEventListener("click", () => {
    busy(true);
    send({ type: "run-probes", kind: "read" });
  });
  write.addEventListener("click", () => {
    busy(true);
    send({ type: "run-probes", kind: "write" });
  });
  el<HTMLButtonElement>("copy-report").addEventListener("click", () => {
    const text = formatReport([...collected.values()], { fileName: fileName(), date: new Date().toISOString().slice(0, 10) });
    setStatus(copyText(text) ? "Отчёт скопирован — вставьте его в трекер" : "Не удалось скопировать");
  });

  probeHandlers.done = (results) => {
    for (const r of results) collected.set(r.id, r);
    render();
    busy(false);
    setStatus("Проверки готовы");
  };
  probeHandlers.failed = () => busy(false);
}

export const probeHandlers: { done: (r: ProbeResult[]) => void; failed: () => void } = {
  done: () => undefined,
  failed: () => undefined,
};
