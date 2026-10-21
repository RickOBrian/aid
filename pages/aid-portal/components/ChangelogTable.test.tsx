import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChangelogTable, sortChangelogEntries, UNRELEASED_LABEL, type ChangelogEntry } from '../ChangelogTable';

/**
 * Запись «Не опубликовано» (changelog-guide §4): `version` и `date` — `null`
 * до публикации библиотеки. В таблице она первой строкой.
 */

const entry = (version: string | null, date: string | null, description = 'Правка'): ChangelogEntry => ({
  version,
  date,
  type: 'minor',
  author: 'Sergey AI',
  changes: [{ kind: 'added', description }],
});

describe('sortChangelogEntries', () => {
  it('«Не опубликовано» — первой, опубликованные от новой к старой', () => {
    const sorted = sortChangelogEntries([entry('1.0.0', '2026-08-11'), entry(null, null), entry('1.2.0', '2026-10-01')]);
    expect(sorted.map((item) => item.version)).toEqual([null, '1.2.0', '1.0.0']);
  });

  it('не мутирует исходный массив', () => {
    const entries = [entry('1.0.0', '2026-08-11'), entry(null, null)];
    sortChangelogEntries(entries);
    expect(entries[0].version).toBe('1.0.0');
  });
});

describe('ChangelogTable', () => {
  it('строка «Не опубликовано» без даты идёт первой', () => {
    render(
      <ChangelogTable
        data={{
          artifact: 'driver-colors-semantic',
          currentVersion: '1.0.0',
          entries: [entry('1.0.0', '2026-08-11', 'Первичный набор'), entry(null, null, 'Button/Warning Pressed')],
        }}
      />,
    );

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toContain(UNRELEASED_LABEL);
    expect(rows[0].textContent).toContain('Button/Warning Pressed');
    expect(rows[0].querySelector('time')).toBeNull();
    expect(rows[1].textContent).toContain('1.0.0');
  });

  it('чейнжлог только с неопубликованной записью и без версии коллекции', () => {
    render(<ChangelogTable data={{ artifact: 'rider-spacing', currentVersion: null, entries: [entry(null, null)] }} />);
    expect(screen.getAllByText(UNRELEASED_LABEL).length).toBeGreaterThan(0);
  });
});
