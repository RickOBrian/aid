/**
 * Scope-based tie-break для кандидатов совпадения токенов Colors.
 *
 * Figma Variable.scopes ограничивает, где переменную разрешено
 * использовать (STROKE_COLOR, TEXT_FILL, FRAME_FILL, SHAPE_FILL,
 * ALL_FILLS, EFFECT_COLOR, ALL_SCOPES).
 *
 * ВАЖНО: это ТОЛЬКО tie-breaker ВНУТРИ одного уровня совпадения
 * (Exact/Value/Name/Approximate) в colorComparator.ts — не отдельный шаг
 * приоритета. Более точное совпадение без подходящего scope всегда важнее
 * менее точного совпадения с "правильным" scope. Этот модуль ничего не
 * знает про уровни приоритета — только про сравнение scope с одним
 * свойством макета в рамках уже отобранного набора кандидатов-кандидатов
 * одного уровня.
 */

/** Свойство макета из LayoutRecord.property для категории Colors. */
export type LayoutColorProperty = "fill" | "stroke" | "text-fill";

const FILL_COMPATIBLE_SCOPES = new Set(["FRAME_FILL", "SHAPE_FILL", "ALL_FILLS"]);
const STROKE_COMPATIBLE_SCOPES = new Set(["STROKE_COLOR"]);
const TEXT_FILL_COMPATIBLE_SCOPES = new Set(["TEXT_FILL"]);

function expectedScopesForProperty(property: string): Set<string> {
  if (property === "stroke") return STROKE_COMPATIBLE_SCOPES;
  if (property === "text-fill") return TEXT_FILL_COMPATIBLE_SCOPES;
  return FILL_COMPATIBLE_SCOPES; // "fill" (не текстовый: frame/shape)
}

/**
 * true, если scopes переменной библиотеки подходят для свойства макета.
 * ALL_SCOPES совместим с любым свойством. Отсутствие/пустой scopes
 * трактуется как "не подтверждено" (false) — не даёт токену приоритет,
 * но и не исключает его: см. `preferScopeCompatibleCandidates`.
 */
export function isScopeCompatibleWithProperty(scopes: string[] | undefined, property: string): boolean {
  if (!scopes || scopes.length === 0) return false;
  if (scopes.includes("ALL_SCOPES")) return true;
  const expected = expectedScopesForProperty(property);
  return scopes.some((scope) => expected.has(scope));
}

/**
 * Переупорядочивает кандидатов ОДНОГО уровня совпадения так, чтобы
 * scope-совместимые оказались первыми. Если ни один кандидат не
 * совместим со свойством макета — порядок остаётся исходным. Опирается на
 * стабильность Array.prototype.sort (гарантирована спецификацией с
 * ES2019, доступна в среде выполнения плагина Figma).
 *
 * Кандидатов <= 1 — no-op (единственный кандидат не требует tie-break).
 */
export function preferScopeCompatibleCandidates<T>(
  candidates: T[],
  property: string,
  getScopes: (candidate: T) => string[] | undefined
): T[] {
  if (candidates.length <= 1) return candidates;

  const hasCompatible = candidates.some((candidate) =>
    isScopeCompatibleWithProperty(getScopes(candidate), property)
  );
  if (!hasCompatible) return candidates;

  return [...candidates].sort((a, b) => {
    const aRank = isScopeCompatibleWithProperty(getScopes(a), property) ? 0 : 1;
    const bRank = isScopeCompatibleWithProperty(getScopes(b), property) ? 0 : 1;
    return aRank - bRank;
  });
}
