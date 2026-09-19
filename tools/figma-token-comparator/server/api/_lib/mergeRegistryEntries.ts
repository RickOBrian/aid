/**
 * Слияние предложенных решений с тем, что уже лежит в decisions-registry.json.
 *
 * Подпись (`signature`) выводится детерминированно из свойств группы в макете,
 * поэтому двое дизайнеров, сканирующих один файл, получат одинаковые подписи.
 * До этой правки записи просто дописывались в конец, и в реестре оказывались
 * две записи с одной подписью и, возможно, противоположными решениями — какая
 * из них истина, было не определено.
 *
 * Принятое правило: **новое решение заменяет старое**. Реестр хранит текущее
 * решение по каждой подписи, а история изменений остаётся в git — она видна в
 * диффе pull request'а.
 */

import type { RegistryFileEntry } from './registryTypes.js';

/**
 * Поля, по которым решения считаются одинаковыми по существу.
 *
 * `proposedAt` и `proposedBy` сюда не входят: повторная отправка того же
 * решения отличается только временем и автором, и заводить ради этого pull
 * request бессмысленно.
 */
export function entryContentKey(entry: RegistryFileEntry): string {
  return JSON.stringify({
    signature: entry.signature,
    decision: entry.decision,
    category: entry.category ?? null,
    targetVariableId: entry.targetVariableId ?? null,
    targetVariableName: entry.targetVariableName ?? null,
    targetStyleId: entry.targetStyleId ?? null,
    targetStyleName: entry.targetStyleName ?? null,
    mismatchedProperties: entry.mismatchedProperties ?? null,
    targetComponentKey: entry.targetComponentKey ?? null,
    targetComponentName: entry.targetComponentName ?? null,
    comment: entry.comment ?? null,
    targetLibraryFileKey: entry.targetLibraryFileKey ?? null,
    status: entry.status ?? null,
  });
}

/**
 * Записи, пришедшие в одном запросе, схлопываются по подписи — побеждает
 * последняя. Клиент шлёт уникальные recordId, но полагаться на это нельзя:
 * реестр не должен зависеть от дисциплины отправителя.
 */
function dedupeIncoming(incoming: RegistryFileEntry[]): RegistryFileEntry[] {
  const bySignature = new Map<string, RegistryFileEntry>();
  for (const entry of incoming) {
    bySignature.set(entry.signature, entry);
  }
  return [...bySignature.values()];
}

/**
 * Существующие записи сохраняют своё место в файле, новые дописываются в
 * конец. Порядок важен для читаемости диффа: замена решения должна выглядеть
 * как правка одной записи, а не как удаление из середины и добавление в конец.
 */
export function mergeRegistryEntries(
  current: RegistryFileEntry[],
  incoming: RegistryFileEntry[],
): RegistryFileEntry[] {
  const replacements = new Map(dedupeIncoming(incoming).map((entry) => [entry.signature, entry]));
  const merged: RegistryFileEntry[] = [];
  const seen = new Set<string>();

  for (const entry of current) {
    const replacement = replacements.get(entry.signature);
    if (replacement && !seen.has(entry.signature)) {
      merged.push(replacement);
      seen.add(entry.signature);
      continue;
    }
    // Дубликат подписи, накопившийся в реестре до этой правки: оставляем
    // только первое вхождение, остальные схлопываются.
    if (seen.has(entry.signature)) continue;
    merged.push(entry);
    seen.add(entry.signature);
  }

  for (const entry of replacements.values()) {
    if (seen.has(entry.signature)) continue;
    merged.push(entry);
    seen.add(entry.signature);
  }

  return merged;
}

/**
 * Все ли предложенные решения уже лежат — в том же виде — в переданном
 * состоянии реестра.
 *
 * Используется, чтобы не заводить второй pull request, когда первый ещё
 * открыт: слияние идёт от `main`, где решений ещё нет, поэтому повторная
 * отправка выглядит как новое изменение, хотя по смыслу это тот же самый
 * запрос. Решение с ДРУГИМ содержанием таким «дубликатом» не считается — его
 * нужно предложить заново.
 */
export function allEntriesAlreadyPresent(
  existing: RegistryFileEntry[],
  incoming: RegistryFileEntry[],
): boolean {
  if (incoming.length === 0) return false;
  const known = new Map(existing.map((entry) => [entry.signature, entryContentKey(entry)]));
  return incoming.every((entry) => known.get(entry.signature) === entryContentKey(entry));
}

/**
 * true — слияние действительно что-то меняет в реестре.
 *
 * Повторная отправка уже записанного решения (например, после обрыва сети,
 * когда клиент не увидел ответа) не должна заводить второй pull request с
 * пустым по смыслу диффом.
 */
export function registryEntriesChanged(
  current: RegistryFileEntry[],
  merged: RegistryFileEntry[],
): boolean {
  if (current.length !== merged.length) return true;
  return current.some((entry, index) => entryContentKey(entry) !== entryContentKey(merged[index]));
}
