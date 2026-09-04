/**
 * Сопоставление режимов переменных (Day/Night, Light/Dark, Mode 1/Mode 2…)
 * без привязки к конкретным именам: сначала точное совпадение и синонимы
 * day↔light, night↔dark, затем — попарно по стабильному порядку индексов.
 */

export interface NamedMode {
  modeName: string;
}

/** Приоритет сортировки: day/light → night/dark → остальные в исходном порядке. */
export function modeSortRank(name: string): number {
  const normalized = name.trim().toLowerCase();
  if (normalized === "day" || normalized === "light") return 0;
  if (normalized === "night" || normalized === "dark") return 1;
  return 2;
}

export function normalizeModeName(name: string): string {
  return name.trim().toLowerCase();
}

/** Стабильная сортировка режимов — одинаковая для макета и библиотеки перед index-pairing. */
export function sortModesStable<T extends NamedMode>(modes: T[]): T[] {
  return modes
    .map((mode, index) => ({ mode, index }))
    .sort((a, b) => {
      const rankDiff = modeSortRank(a.mode.modeName) - modeSortRank(b.mode.modeName);
      if (rankDiff !== 0) return rankDiff;
      return a.index - b.index;
    })
    .map(({ mode }) => mode);
}

function findLayoutModeByName<T extends NamedMode>(layoutModes: T[], targetModeName: string): T | undefined {
  const normalizedTarget = normalizeModeName(targetModeName);
  const exact = layoutModes.find((mode) => normalizeModeName(mode.modeName) === normalizedTarget);
  if (exact) return exact;

  const isNightTarget = normalizedTarget === "night" || normalizedTarget === "dark";
  const isDayTarget = normalizedTarget === "day" || normalizedTarget === "light";
  if (isNightTarget) {
    return layoutModes.find((mode) => {
      const normalized = normalizeModeName(mode.modeName);
      return normalized === "night" || normalized === "dark";
    });
  }
  if (isDayTarget) {
    return layoutModes.find((mode) => {
      const normalized = normalizeModeName(mode.modeName);
      return normalized === "day" || normalized === "light";
    });
  }
  return undefined;
}

/** Подпись пары режимов для UI/превью — одно имя или «библиотека · макет». */
export function formatModePairLabel(layoutModeName: string, targetModeName: string): string {
  if (normalizeModeName(layoutModeName) === normalizeModeName(targetModeName)) {
    return targetModeName;
  }
  return `${targetModeName} · ${layoutModeName}`;
}

/**
 * Строит пары layout↔target для превью и value-fix:
 * 1) точное имя или синоним day/light, night/dark;
 * 2) иначе — сопоставление по индексу после sortModesStable (Mode 1↔Day и т.п.).
 */
export function pairModesByIndex<T extends NamedMode, U extends NamedMode>(
  layoutModes: T[],
  targetModes: U[]
): Array<{ layout: T; target: U; label: string }> {
  if (layoutModes.length === 0 || targetModes.length === 0) return [];

  const sortedLayout = sortModesStable(layoutModes);
  const sortedTarget = sortModesStable(targetModes);
  const count = Math.min(sortedLayout.length, sortedTarget.length);
  const pairs: Array<{ layout: T; target: U; label: string }> = [];

  for (let i = 0; i < count; i++) {
    const target = sortedTarget[i];
    const byName = findLayoutModeByName(layoutModes, target.modeName);
    const layout = byName ?? sortedLayout[i];
    pairs.push({
      layout,
      target,
      label: formatModePairLabel(layout.modeName, target.modeName),
    });
  }

  return pairs;
}

/** Значение макета для выбранного режима библиотеки — имя, синоним или index-pairing. */
export function findLayoutValueForTargetMode<T extends NamedMode & { displayValue: string }>(
  layoutModes: T[] | undefined,
  targetModeName: string,
  allTargetModes: NamedMode[] | undefined,
  fallbackDisplayValue: string
): string {
  if (!layoutModes || layoutModes.length === 0) return fallbackDisplayValue;

  const byName = findLayoutModeByName(layoutModes, targetModeName);
  if (byName) return byName.displayValue;

  if (allTargetModes && allTargetModes.length > 0) {
    const sortedTarget = sortModesStable(allTargetModes);
    const sortedLayout = sortModesStable(layoutModes);
    const targetIndex = sortedTarget.findIndex(
      (mode) => normalizeModeName(mode.modeName) === normalizeModeName(targetModeName)
    );
    if (targetIndex >= 0 && sortedLayout[targetIndex]) {
      return sortedLayout[targetIndex].displayValue;
    }
  }

  return fallbackDisplayValue;
}
