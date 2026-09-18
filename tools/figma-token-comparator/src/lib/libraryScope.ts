/**
 * Какие решения действуют при сканировании с выбранной библиотекой.
 *
 * Идентификаторы переменных и стилей (`VariableID:23:13`, node_id стиля)
 * уникальны только внутри своего файла — в другой библиотеке тот же id может
 * принадлежать другому токену. Поэтому решение, которое ссылается на
 * конкретный токен, действует только в той библиотеке, где его приняли.
 * «Игнорировать» и «кандидат на новый токен» от библиотеки не зависят.
 *
 * Решения без отметки библиотеки — записи реестра до v1.4.0 — действуют в
 * любой: так было до появления нескольких библиотек.
 */

import type { Decision, StoredDecision } from "../comparators/types";

const LIBRARY_BOUND_DECISIONS: ReadonlySet<Decision> = new Set([
  "mapped",
  "mapped_suggested",
  "value_fix_proposed",
]);

/** Решение ссылается на конкретный токен библиотеки. */
export function isLibraryBoundDecision(entry: Pick<StoredDecision, "decision">): boolean {
  return LIBRARY_BOUND_DECISIONS.has(entry.decision);
}

export function scopeHistoryToLibrary(
  history: Record<string, StoredDecision>,
  activeFileKey: string | null
): Record<string, StoredDecision> {
  if (!activeFileKey) return history;
  const scoped: Record<string, StoredDecision> = {};
  for (const [recordId, entry] of Object.entries(history)) {
    if (isLibraryBoundDecision(entry) && entry.libraryFileKey && entry.libraryFileKey !== activeFileKey) continue;
    scoped[recordId] = entry;
  }
  return scoped;
}
