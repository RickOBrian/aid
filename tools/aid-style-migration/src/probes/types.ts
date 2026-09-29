/**
 * Проверки API этапа 0 (docs/spike-2026-09-29.md, «Факты API»).
 *
 * Каждая проверка отвечает на один вопрос о поведении Figma, от которого
 * зависит архитектура: что мы ожидаем и что увидели на самом деле.
 */

export type ProbeStatus = "ok" | "fail" | "info" | "skip";

export interface ProbeResult {
  /** Стабильный идентификатор — по нему результат ищется в трекере. */
  id: string;
  title: string;
  status: ProbeStatus;
  /** Что ожидали — формулировка из трекера. */
  expected: string;
  /** Что увидели. */
  actual: string;
  /** Длительность проверки, мс; для замеров скорости — главный результат. */
  ms?: number;
}

export type ProbeKind = "read" | "write";
