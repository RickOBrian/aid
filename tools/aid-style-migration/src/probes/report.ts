import type { ProbeResult, ProbeStatus } from "./types";

const STATUS_LABEL: Record<ProbeStatus, string> = {
  ok: "подтверждено",
  fail: "опровергнуто",
  info: "замер",
  skip: "пропущено",
};

export function statusLabel(status: ProbeStatus): string {
  return STATUS_LABEL[status];
}

function cell(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\s*\n\s*/g, "; ");
}

/**
 * Отчёт в Markdown — вставляется в трекер как есть: таблица с теми же
 * колонками, что «Факты API» в docs/spike-2026-09-29.md.
 */
export function formatReport(results: ProbeResult[], context: { fileName: string; date: string }): string {
  const lines = [
    `Проверки API — ${context.fileName}, ${context.date}`,
    "",
    "| Проверка | Ожидали | Увидели | Итог | мс |",
    "|---|---|---|---|---|",
  ];
  for (const r of results) {
    const ms = r.ms === undefined ? "" : String(Math.round(r.ms));
    lines.push(`| ${cell(r.title)} | ${cell(r.expected)} | ${cell(r.actual)} | ${statusLabel(r.status)} | ${ms} |`);
  }
  return lines.join("\n");
}
