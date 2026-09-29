/**
 * Шкалы с сохранением порядка: радиусы, отступы, уровни текста. Чистая логика.
 *
 * Каждому значению исходника (по возрастанию) — токен продукта (по
 * возрастанию) так, чтобы порядок не ломался: что было больше, не станет
 * меньше. Если ступеней в исходнике больше, соседние сливаются. Минимум
 * суммарной «цены» ищем динамикой — это монотонное сопоставление.
 */

export interface Step {
  value: number;
  /** Вес — насколько часто встречается: частое важнее попасть точно. */
  weight: number;
}

/**
 * @param cost цена поставить ступень исходника i на ступень продукта j
 * @param merge цена слить ступень i с предыдущей (обе → один токен) —
 *              потеря иерархии; по умолчанию слияние бесплатно
 * @returns индекс ступени продукта для каждой ступени исходника (не убывает)
 */
export function monotoneAssign(
  n: number,
  m: number,
  cost: (i: number, j: number) => number,
  merge: (i: number) => number = () => 0,
): number[] {
  if (n === 0) return [];
  if (m === 0) return Array(n).fill(-1);
  // best[i][j] — минимальная цена для первых i+1 ступеней, если i-я → j.
  const best: number[][] = Array.from({ length: n }, () => Array(m).fill(Infinity));
  const from: number[][] = Array.from({ length: n }, () => Array(m).fill(-1));
  for (let j = 0; j < m; j++) best[0][j] = cost(0, j);
  for (let i = 1; i < n; i++) {
    // Лучшее из строго меньших ступеней продукта — без слияния.
    let runMin = Infinity;
    let runArg = -1;
    for (let j = 0; j < m; j++) {
      const same = best[i - 1][j] + merge(i);
      const [prev, arg] = same <= runMin ? [same, j] : [runMin, runArg];
      best[i][j] = prev + cost(i, j);
      from[i][j] = arg;
      if (best[i - 1][j] < runMin) {
        runMin = best[i - 1][j];
        runArg = j;
      }
    }
  }
  let j = best[n - 1].indexOf(Math.min(...best[n - 1]));
  const out = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    out[i] = j;
    j = from[i][j];
  }
  return out;
}

/** Цена для чисел: во сколько раз отличаются, а не на сколько пикселей (4 → 8 хуже, чем 40 → 44). */
export function ratioCost(a: number, b: number): number {
  return Math.abs(Math.log((a + 1) / (b + 1)));
}

/** Шкала чисел: радиусы или отступы исходника → токены продукта. */
export function mapScale(source: Step[], target: number[]): number[] {
  const src = [...source.keys()].sort((a, b) => source[a].value - source[b].value);
  const tgt = [...target.keys()].sort((a, b) => target[a] - target[b]);
  const assigned = monotoneAssign(src.length, tgt.length, (i, j) => source[src[i]].weight * ratioCost(source[src[i]].value, target[tgt[j]]));
  const out = Array(source.length).fill(-1);
  src.forEach((s, i) => (out[s] = assigned[i] >= 0 ? tgt[assigned[i]] : -1));
  return out;
}
