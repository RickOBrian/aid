import { describe, expect, it } from 'vitest';

import {
  allEntriesAlreadyPresent,
  mergeRegistryEntries,
  registryEntriesChanged,
} from './mergeRegistryEntries.js';
import type { RegistryFileEntry } from './registryTypes.js';

function entry(overrides: Partial<RegistryFileEntry> & { signature: string }): RegistryFileEntry {
  return {
    decision: 'mapped',
    proposedBy: 'designer',
    proposedAt: '2026-09-18T00:00:00.000Z',
    ...overrides,
  };
}

describe('mergeRegistryEntries', () => {
  it('добавляет новую подпись в конец', () => {
    const merged = mergeRegistryEntries([entry({ signature: 'a' })], [entry({ signature: 'b' })]);

    expect(merged.map((item) => item.signature)).toEqual(['a', 'b']);
  });

  it('заменяет решение по существующей подписи, а не дописывает второе', () => {
    const merged = mergeRegistryEntries(
      [entry({ signature: 'a', decision: 'mapped', targetVariableName: 'bg/accent' })],
      [entry({ signature: 'a', decision: 'ignored', comment: 'передумали' })],
    );

    expect(merged).toHaveLength(1);
    expect(merged[0].decision).toBe('ignored');
    expect(merged[0].comment).toBe('передумали');
  });

  it('заменённая запись остаётся на своём месте в файле', () => {
    const merged = mergeRegistryEntries(
      [entry({ signature: 'a' }), entry({ signature: 'b' }), entry({ signature: 'c' })],
      [entry({ signature: 'b', decision: 'candidate' })],
    );

    expect(merged.map((item) => item.signature)).toEqual(['a', 'b', 'c']);
    expect(merged[1].decision).toBe('candidate');
  });

  it('замена не тянет за собой поля прежнего решения', () => {
    const merged = mergeRegistryEntries(
      [entry({ signature: 'a', decision: 'mapped', targetVariableName: 'bg/accent', comment: 'старый' })],
      [entry({ signature: 'a', decision: 'candidate' })],
    );

    expect(merged[0].targetVariableName).toBeUndefined();
    expect(merged[0].comment).toBeUndefined();
  });

  it('в одном запросе побеждает последняя запись с той же подписью', () => {
    const merged = mergeRegistryEntries(
      [],
      [entry({ signature: 'a', decision: 'mapped' }), entry({ signature: 'a', decision: 'ignored' })],
    );

    expect(merged).toHaveLength(1);
    expect(merged[0].decision).toBe('ignored');
  });

  it('схлопывает дубликаты, накопившиеся в реестре раньше', () => {
    const merged = mergeRegistryEntries(
      [entry({ signature: 'a', decision: 'mapped' }), entry({ signature: 'a', decision: 'ignored' })],
      [],
    );

    expect(merged).toHaveLength(1);
    expect(merged[0].decision).toBe('mapped');
  });

  it('пустой список предложений ничего не ломает', () => {
    const current = [entry({ signature: 'a' }), entry({ signature: 'b' })];

    expect(mergeRegistryEntries(current, [])).toEqual(current);
  });

  it('не мутирует входные массивы', () => {
    const current = [entry({ signature: 'a', decision: 'mapped' })];
    const incoming = [entry({ signature: 'a', decision: 'ignored' })];

    mergeRegistryEntries(current, incoming);

    expect(current[0].decision).toBe('mapped');
    expect(incoming[0].decision).toBe('ignored');
  });
});

describe('registryEntriesChanged', () => {
  it('новая подпись — изменение', () => {
    const current = [entry({ signature: 'a' })];
    const merged = mergeRegistryEntries(current, [entry({ signature: 'b' })]);

    expect(registryEntriesChanged(current, merged)).toBe(true);
  });

  it('другое решение по той же подписи — изменение', () => {
    const current = [entry({ signature: 'a', decision: 'mapped' })];
    const merged = mergeRegistryEntries(current, [entry({ signature: 'a', decision: 'ignored' })]);

    expect(registryEntriesChanged(current, merged)).toBe(true);
  });

  it('повторная отправка того же решения изменением не считается', () => {
    const current = [entry({ signature: 'a', decision: 'mapped', targetVariableName: 'bg/accent' })];
    const merged = mergeRegistryEntries(current, [
      entry({
        signature: 'a',
        decision: 'mapped',
        targetVariableName: 'bg/accent',
        proposedAt: '2026-09-19T10:00:00.000Z',
        proposedBy: 'другой дизайнер',
      }),
    ]);

    expect(registryEntriesChanged(current, merged)).toBe(false);
  });

  it('изменившийся комментарий — изменение', () => {
    const current = [entry({ signature: 'a', decision: 'ignored', comment: 'так задумано' })];
    const merged = mergeRegistryEntries(current, [
      entry({ signature: 'a', decision: 'ignored', comment: 'уточнили причину' }),
    ]);

    expect(registryEntriesChanged(current, merged)).toBe(true);
  });

  it('схлопывание накопленных дубликатов — изменение', () => {
    const current = [entry({ signature: 'a' }), entry({ signature: 'a' })];
    const merged = mergeRegistryEntries(current, []);

    expect(registryEntriesChanged(current, merged)).toBe(true);
  });
});

describe('allEntriesAlreadyPresent', () => {
  it('то же решение по той же подписи — уже есть', () => {
    const existing = [entry({ signature: 'a', decision: 'mapped', targetVariableName: 'bg/accent' })];
    const incoming = [
      entry({
        signature: 'a',
        decision: 'mapped',
        targetVariableName: 'bg/accent',
        proposedAt: '2026-09-19T00:00:00.000Z',
        proposedBy: 'другой дизайнер',
      }),
    ];

    expect(allEntriesAlreadyPresent(existing, incoming)).toBe(true);
  });

  it('другое решение по той же подписи — это не дубликат', () => {
    const existing = [entry({ signature: 'a', decision: 'mapped' })];
    const incoming = [entry({ signature: 'a', decision: 'ignored', comment: 'передумали' })];

    expect(allEntriesAlreadyPresent(existing, incoming)).toBe(false);
  });

  it('хотя бы одна новая подпись — не дубликат', () => {
    const existing = [entry({ signature: 'a' })];
    const incoming = [entry({ signature: 'a' }), entry({ signature: 'b' })];

    expect(allEntriesAlreadyPresent(existing, incoming)).toBe(false);
  });

  it('пустой список предложений дубликатом не считается', () => {
    expect(allEntriesAlreadyPresent([entry({ signature: 'a' })], [])).toBe(false);
  });

  it('пустое состояние реестра — ничего не совпадает', () => {
    expect(allEntriesAlreadyPresent([], [entry({ signature: 'a' })])).toBe(false);
  });
});
