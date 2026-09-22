import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { badgeCountApiSpec } from './badgeCount.api';
import { badgeDotApiSpec } from './badgeDot.api';
import { switchApiSpec } from './switch.api';
import type { ComponentApiSpec } from '../ComponentApiSummary';

/**
 * Страж находки №5 (аудит 2026-09-21).
 *
 * `switch.api.ts` перечислял `indeterminate` среди состояний, хотя ADR-021
 * относит его к значениям: оно не возникает от взаимодействия и переживает
 * `disabled`. Заодно в списке не было `skeleton` — настоящего состояния из
 * канона. То есть контракт расходился со стандартом в обе стороны, и заметить
 * это можно было только сверив два файла глазами.
 *
 * Тест закрывает класс: имена состояний берутся из машинного слоя стандарта,
 * а не переписываются здесь. Если канон изменится, тест начнёт мерить новый
 * канон сам.
 *
 * Полнота списка не проверяется: компонент вправе перечислить только те
 * состояния, о которых ему есть что сказать. Проверяется происхождение имён.
 */

interface StandardStates {
  list: string[];
  structuralViewExtra: string[];
  stateVsValue: {
    knownValues: { name: string; isState: boolean }[];
  };
}

/** Корень репозитория — ближайший предок, в котором лежит `skills/_shared`. */
function findStandardsFile(): string {
  const relative = 'skills/_shared/standards/component-standards.json';
  let dir = process.cwd();
  for (;;) {
    const candidate = resolve(dir, relative);
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error(`Не найден ${relative} ни в одном родителе ${process.cwd()}`);
    }
    dir = parent;
  }
}

const standard = JSON.parse(readFileSync(findStandardsFile(), 'utf-8')) as {
  states: StandardStates;
};

const canonical = new Set([...standard.states.list, ...standard.states.structuralViewExtra]);

const valuesNotStates = new Set(
  standard.states.stateVsValue.knownValues.filter((v) => !v.isState).map((v) => v.name),
);

/**
 * BadgeCount и BadgeDot группируют имена в одной строке («hover / pressed /
 * focused»), а BadgeCount вдобавок описывает через состояния свои значения —
 * это находка, записанная отдельно. Поэтому по канону сверяется тот контракт,
 * который уже приведён к нему.
 */
const specs: [string, ComponentApiSpec][] = [['switch', switchApiSpec]];

const allSpecs: [string, ComponentApiSpec][] = [
  ['switch', switchApiSpec],
  ['badge-count', badgeCountApiSpec],
  ['badge-dot', badgeDotApiSpec],
];

describe('контракт компонента: состояния против значений', () => {
  it.each(specs)('%s: каждое имя состояния есть в каноне', (_id, spec) => {
    const unknown = spec.states.map((s) => s.name).filter((name) => !canonical.has(name));
    expect(unknown).toEqual([]);
  });

  it.each(allSpecs)('%s: значение не выдаётся за состояние', (_id, spec) => {
    const misplaced = spec.states.map((s) => s.name).filter((name) => valuesNotStates.has(name));
    expect(misplaced).toEqual([]);
  });

  it('канон прочитан, а не выдуман', () => {
    expect(canonical.has('skeleton')).toBe(true);
    expect(valuesNotStates.has('indeterminate')).toBe(true);
  });

  it('switch объявляет checked значением, а не состоянием', () => {
    expect(switchApiSpec.values?.map((v) => v.name)).toContain('checked');
    expect(switchApiSpec.states.map((s) => s.name)).not.toContain('indeterminate');
  });
});
