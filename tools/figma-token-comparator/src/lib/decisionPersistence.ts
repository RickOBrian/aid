/**
 * Судьба решения после «Применить в макет» — общая логика для цветов и
 * типографики.
 *
 * Вынесена из code.ts отдельным модулем по двум причинам: обе категории
 * должны вести себя одинаково (расхождение между ними уже приводило к
 * молчаливой потере решений), и эта логика должна покрываться тестами, а
 * code.ts исполняет код при импорте и юнит-тестам недоступен.
 */

import type { StoredDecision } from "../comparators/types";
import { clearMappingHistoryEntry, getSubmittedSignatures, setMappingHistoryEntry } from "./storage";

export interface ApplyToLayoutSkip {
  nodeId: string;
  reason: string;
}

export interface PersistDecisionAfterApplyOptions {
  recordId: string;
  /** Решение, которое было в истории до применения. */
  base: StoredDecision;
  /** Сколько слоёв группы применено суммарно, включая прошлые заходы. */
  appliedCount: number;
  /** Сколько слоёв в группе всего. */
  totalCount: number;
  applySkips: ApplyToLayoutSkip[];
  /** Только для типографики: какие именно слои уже применены. */
  appliedNodeIds?: string[];
}

/**
 * Полный успех: в таблице запись больше не нужна — группа перепривязана и при
 * следующем сканировании пересчитается как Exact match. Но она может быть ещё
 * не отправлена в реестр, и тогда удалять её нельзя: иначе самый
 * доказательный класс решений (реально исполненные) в реестр не попадёт
 * никогда. Поэтому удаляем только уже отправленное, остальное оставляем в
 * очереди на согласование.
 *
 * Частичный успех: не удаляем ни при каких условиях — вместе с решением
 * потерялся бы и список пропущенных слоёв, а оставшиеся слои вернулись бы в
 * таблицу без следа, что по ним вообще принималось решение.
 */
export async function persistDecisionAfterApply(
  options: PersistDecisionAfterApplyOptions
): Promise<void> {
  const { recordId, base, appliedCount, totalCount, applySkips } = options;
  const fullSuccess = applySkips.length === 0 && appliedCount >= totalCount;

  if (fullSuccess) {
    // Решение из реестра уже согласовано — держать его локально незачем.
    const submitted = await getSubmittedSignatures();
    if (submitted.has(recordId) || base.source === "registry") {
      await clearMappingHistoryEntry(recordId);
      return;
    }
  }

  // Поля учёта применения переписываются целиком, а не доливаются к base:
  // иначе успешная повторная попытка оставила бы applyPartial и список
  // пропусков от предыдущего, неудачного захода.
  const { appliedNodeIds: _applied, applySkips: _skips, applyPartial: _partial, ...decision } = base;

  await setMappingHistoryEntry(
    recordId,
    {
      ...decision,
      ...(options.appliedNodeIds ? { appliedNodeIds: options.appliedNodeIds } : {}),
      ...(applySkips.length > 0 ? { applySkips } : {}),
      ...(fullSuccess ? {} : { applyPartial: appliedCount > 0 }),
    },
    // Учёт применённых слоёв — служебная перезапись, а не новое решение
    // пользователя: очередь на согласование она трогать не должна.
    { keepSubmitted: true }
  );
}
