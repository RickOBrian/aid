/**
 * Comparator для категории Colors.
 *
 * Приоритет определения статуса строки (реализует ТЗ):
 * 1. Подтверждённый маппинг из истории решений -> "mapped".
 * 2. Точное совпадение variableId макета с variableId библиотеки -> "exact".
 * 3. Точное совпадение resolved-значения (hex + alpha) в любом режиме
 *    коллекции color-sem -> "value".
 * 4. Совпадение по имени переменной/стиля при разных значениях в color-sem ->
 *    "name-match" (небольшое отклонение) или "conflict" (существенное).
 * 4a. Совпадение по имени, но значение библиотеки не резолвится (алиас за
 *     пределы файла — известное ограничение REST API) -> "name-match-unresolved".
 * 5. Approximate match через Delta E ниже порога по color-sem -> "approximate".
 * 6. Иначе -> "layout-only" (UI показывает как "Hardcoded (no analog)",
 *    если bindingType === "hardcoded").
 */

import { APPROX_MATCH_DELTA_E_THRESHOLD, deltaE } from "../lib/colorUtils";
import { filterSemanticColorTokens } from "../lib/semanticColorLibrary";
import { preferScopeCompatibleCandidates } from "../lib/variableScope";
import type {
  ComparisonResult,
  ComparisonTarget,
  ITokenComparator,
  LayoutRecord,
  LibraryToken,
  ScanScope,
  StoredDecision,
} from "./types";
import { scanColors } from "../lib/scanner";

/** Ниже этого Delta E разница имён при совпадающем sourceName считается "name-match", выше — "conflict". */
const NAME_CONFLICT_DELTA_E_THRESHOLD = 20;

/** true, если элемент уже привязан к переменной из загруженной библиотеки (по id или стабильному key). */
export function isUsingLibraryVariable(record: LayoutRecord, library: LibraryToken[]): boolean {
  if (record.bindingType !== "variable") return false;

  const libraryIds = new Set(library.map((token) => token.variableId));
  const libraryKeys = new Set(library.map((token) => token.key));

  if (record.variableId && libraryIds.has(record.variableId)) return true;
  if (record.variableKey && libraryKeys.has(record.variableKey)) return true;
  return false;
}

/**
 * Строка попадает в таблицу только если требует решения пользователя:
 * - hardcoded (нет токена);
 * - style / ghost (цвет через paint style, не variable);
 * - variable не из эталонной библиотеки.
 * Скрываем: variable из библиoteki; строки с решением ignored/mapped/mapped_suggested.
 */
export function requiresUserAction(result: ComparisonResult, library: LibraryToken[]): boolean {
  if (result.decision === "ignored" || result.decision === "mapped" || result.decision === "mapped_suggested") {
    return false;
  }

  switch (result.bindingType) {
    case "hardcoded":
      return true;
    case "style":
    case "ghost":
      return true;
    case "variable":
      return !isUsingLibraryVariable(result, library);
    default:
      return true;
  }
}

interface ColorComparisonValue {
  hex: string;
  alpha: number;
}

function readColorValue(value: Record<string, unknown>): ColorComparisonValue {
  return { hex: String(value.hex), alpha: Number(value.alpha) };
}

function alphaMatches(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.01; // допускаем погрешность округления процентов
}

/**
 * Строит ComparisonTarget из произвольного токена библиотеки по индексу
 * режима. Экспортируется отдельно от findRecordStatus/computeColor...,
 * чтобы code.ts мог построить target для превью по токену, выбранному
 * вручную через combobox «Выбрать токен из AID» ДО сохранения решения
 * (history ещё не содержит эту запись) — см. handleBuildPreview.
 */
export function toTarget(token: LibraryToken, modeIndex: number): ComparisonTarget {
  const mode = token.modes[modeIndex] ?? token.modes[0];
  return {
    variableId: token.variableId,
    name: token.name,
    collectionName: token.collectionName,
    modeId: mode.modeId,
    modeName: mode.modeName,
    displayValue: mode.displayValue,
    valueUnresolved: mode.unresolved === true,
    allModes: token.modes,
  };
}

/** Индекс режима токена, чьё значение точно совпадает с value, либо -1. */
function findExactModeIndex(token: LibraryToken, value: ColorComparisonValue): number {
  return token.modes.findIndex((mode) => {
    if (mode.unresolved) return false;
    const modeValue = readColorValue(mode.comparisonValue);
    return modeValue.hex === value.hex && alphaMatches(modeValue.alpha, value.alpha);
  });
}

function findRecordStatus(
  record: LayoutRecord,
  library: LibraryToken[]
): { status: ComparisonResult["status"]; target?: ComparisonTarget; deltaE?: number } {
  const value = readColorValue(record.comparisonValue);
  const suggestionLibrary = filterSemanticColorTokens(library);

  // 2. Exact match по variableId или стабильному key (импортированная переменная библиотеки).
  if (record.bindingType === "variable") {
    const exactById =
      record.variableId !== undefined
        ? library.find((token) => token.variableId === record.variableId)
        : undefined;
    const exactByKey =
      record.variableKey !== undefined
        ? library.find((token) => token.key === record.variableKey)
        : undefined;
    const exactToken = exactById ?? exactByKey;
    if (exactToken) {
      const modeIndex = findExactModeIndex(exactToken, value);
      return { status: "exact", target: toTarget(exactToken, Math.max(modeIndex, 0)) };
    }
  }

  // 3. Value match — точное совпадение hex+alpha в любом токене/режиме color-sem.
  // Кандидаты одного уровня (тот же hex+alpha) — scope-совместимый со
  // свойством макета (fill/stroke/text-fill) предпочитается как tie-breaker;
  // при единственном кандидате порядок не меняется.
  const valueCandidates: Array<{ token: LibraryToken; modeIndex: number }> = [];
  for (const token of suggestionLibrary) {
    const modeIndex = findExactModeIndex(token, value);
    if (modeIndex !== -1) valueCandidates.push({ token, modeIndex });
  }
  if (valueCandidates.length > 0) {
    const ordered = preferScopeCompatibleCandidates(valueCandidates, record.property, (c) => c.token.scopes);
    const winner = ordered[0];
    return { status: "value", target: toTarget(winner.token, winner.modeIndex) };
  }

  // 4. Name match / Conflict — совпадение имени переменной/стиля при разных значениях.
  if (record.sourceName) {
    const normalizedName = record.sourceName.trim().toLowerCase();
    // Кандидаты одного уровня (то же имя) — тот же scope tie-break, что и
    // для Value match, до вычисления bestModeIndex/deltaE внутри токена.
    const nameCandidates = suggestionLibrary.filter(
      (token) => token.name.trim().toLowerCase() === normalizedName
    );
    const nameMatch =
      nameCandidates.length > 0
        ? preferScopeCompatibleCandidates(nameCandidates, record.property, (token) => token.scopes)[0]
        : undefined;
    if (nameMatch) {
      const hasResolvedMode = nameMatch.modes.some((mode) => !mode.unresolved);

      // 4a. Имя совпало, но ни одно значение библиотеки не резолвится —
      // переменная ссылается алиасом на другой библиотечный файл. Не
      // теряем это как "нет совпадения": показываем пользователю сам факт
      // совпадения по имени, чтобы он принял решение вручную.
      if (!hasResolvedMode) {
        return { status: "name-match-unresolved", target: toTarget(nameMatch, 0) };
      }

      let bestModeIndex = 0;
      let bestDeltaE = Infinity;
      nameMatch.modes.forEach((mode, index) => {
        if (mode.unresolved) return;
        const modeValue = readColorValue(mode.comparisonValue);
        const distance = deltaE(value.hex, modeValue.hex);
        if (distance < bestDeltaE) {
          bestDeltaE = distance;
          bestModeIndex = index;
        }
      });
      const status = bestDeltaE > NAME_CONFLICT_DELTA_E_THRESHOLD ? "conflict" : "name-match";
      return { status, target: toTarget(nameMatch, bestModeIndex), deltaE: bestDeltaE };
    }
  }

  // 5. Approximate match — минимальный Delta E по semantic-коллекции color-sem.
  // Собираем всех кандидатов и их Delta E, затем среди кандидатов с
  // МИНИМАЛЬНЫМ (равным) Delta E применяем тот же scope tie-break, что и
  // для Value/Name match — приоритет уровней (Value > Name > Approximate)
  // при этом не меняется: этот блок выполняется только если предыдущие
  // уровни не дали совпадения.
  interface ApproxCandidate {
    token: LibraryToken;
    modeIndex: number;
    distance: number;
  }
  const approxCandidates: ApproxCandidate[] = [];
  let bestDeltaE = Infinity;
  for (const token of suggestionLibrary) {
    token.modes.forEach((mode, index) => {
      if (mode.unresolved) return;
      const modeValue = readColorValue(mode.comparisonValue);
      if (!alphaMatches(modeValue.alpha, value.alpha)) return; // alpha должна совпадать для approximate
      const distance = deltaE(value.hex, modeValue.hex);
      if (distance < bestDeltaE) bestDeltaE = distance;
      approxCandidates.push({ token, modeIndex: index, distance });
    });
  }
  if (approxCandidates.length > 0 && bestDeltaE <= APPROX_MATCH_DELTA_E_THRESHOLD) {
    const bestCandidates = approxCandidates.filter((candidate) => candidate.distance === bestDeltaE);
    const ordered = preferScopeCompatibleCandidates(bestCandidates, record.property, (c) => c.token.scopes);
    const winner = ordered[0];
    return { status: "approximate", target: toTarget(winner.token, winner.modeIndex), deltaE: winner.distance };
  }

  // 6. Совсем нет совпадений.
  return { status: "layout-only" };
}

function applyHistory(
  record: LayoutRecord,
  result: Omit<ComparisonResult, keyof LayoutRecord>,
  history: Record<string, StoredDecision>,
  library: LibraryToken[]
): ComparisonResult {
  const stored = history[record.id];
  if (!stored) {
    return { ...record, ...result };
  }

  const withDecision: ComparisonResult = {
    ...record,
    ...result,
    decision: stored.decision,
    decisionComment: stored.comment,
    decisionTargetVariableId: stored.targetVariableId,
    decisionTimestamp: stored.timestamp,
    decisionProposedModeId: stored.proposedModeId,
    decisionProposedModeName: stored.proposedModeName,
    decisionCurrentLibraryValue: stored.currentLibraryValue,
    decisionProposedValue: stored.proposedValue,
  };

  // 1. Приоритет: подтверждённый маппинг (mapped / mapped_suggested) переопределяет статус целиком.
  if ((stored.decision === "mapped" || stored.decision === "mapped_suggested") && stored.targetVariableId) {
    const targetToken = library.find((token) => token.variableId === stored.targetVariableId);
    if (targetToken) {
      withDecision.status = "mapped";
      withDecision.target = toTarget(targetToken, 0);
      withDecision.deltaE = undefined;
    }
  }

  return withDecision;
}

/**
 * Считает ComparisonResult для каждой записи БЕЗ фильтра requiresUserAction —
 * нужен для точечного пересчёта одной группы (после apply-decision /
 * clear-decision / apply-to-layout), когда UI должен получить актуальную
 * карточку строки независимо от того, попадёт ли она в основную
 * (отфильтрованную) таблицу результатов при следующем полном скане.
 * Правила сравнения и приоритеты статусов — те же самые, см. верх файла.
 */
export function computeColorComparisonResults(
  records: LayoutRecord[],
  library: LibraryToken[],
  history: Record<string, StoredDecision>
): ComparisonResult[] {
  return records.map((record) => {
    const computed = findRecordStatus(record, library);
    return applyHistory(record, computed, history, library);
  });
}

export function compareColorsWithLibrary(
  records: LayoutRecord[],
  library: LibraryToken[],
  history: Record<string, StoredDecision>
): ComparisonResult[] {
  return computeColorComparisonResults(records, library, history).filter((result) =>
    requiresUserAction(result, library)
  );
}

export const colorComparator: ITokenComparator<ScanScope> = {
  category: "colors",
  async scanLayout(scope: ScanScope): Promise<LayoutRecord[]> {
    return scanColors(scope);
  },
  compareWithLibrary(
    records: LayoutRecord[],
    library: LibraryToken[],
    history: Record<string, StoredDecision>
  ): ComparisonResult[] {
    return compareColorsWithLibrary(records, library, history);
  },
};
