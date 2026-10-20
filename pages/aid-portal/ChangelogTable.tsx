import { useMemo } from 'react';

export type ChangelogChangeKind = 'added' | 'changed' | 'fixed' | 'deprecated' | 'removed';

export type ChangelogReleaseType = 'major' | 'minor' | 'patch';

export interface ChangelogChange {
  kind: ChangelogChangeKind;
  description: string;
  details?: string;
}

export interface ChangelogEntry {
  /** `null` — запись «Не опубликовано»: изменение уже в библиотеке, версии ещё нет (changelog-guide §4). */
  version: string | null;
  date: string | null;
  type: ChangelogReleaseType;
  author: string;
  changes: ChangelogChange[];
}

export interface TokenChangelog {
  artifact: string;
  currentVersion: string | null;
  entries: ChangelogEntry[];
}

const CHANGE_KIND_COLORS: Record<ChangelogChangeKind, string> = {
  added: '#23AD58',
  changed: '#005AFF',
  fixed: '#F0A11D',
  deprecated: '#9E9E9E',
  removed: '#D62347',
};

function compareSemverDesc(a: string, b: string): number {
  const partsA = a.split('.').map((part) => Number.parseInt(part, 10) || 0);
  const partsB = b.split('.').map((part) => Number.parseInt(part, 10) || 0);

  for (let index = 0; index < 3; index += 1) {
    const diff = (partsB[index] ?? 0) - (partsA[index] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
}

export const UNRELEASED_LABEL = 'Не опубликовано';

/** «Не опубликовано» — первой, дальше опубликованные от новой версии к старой. */
export function sortChangelogEntries(entries: ChangelogEntry[]): ChangelogEntry[] {
  return [...entries].sort((left, right) => {
    if (left.version === null || right.version === null) {
      return (left.version === null ? 0 : 1) - (right.version === null ? 0 : 1);
    }
    return compareSemverDesc(left.version, right.version);
  });
}

function entryKey(entry: ChangelogEntry, index: number): string {
  return entry.version ?? `unreleased-${index}`;
}

function ChangelogVersion({ version }: { version: string | null }) {
  return version === null ? (
    <span className="dctp-changelog-version dctp-changelog-version--unreleased">{UNRELEASED_LABEL}</span>
  ) : (
    <span className="dctp-changelog-version">{version}</span>
  );
}

function ChangelogDate({ date }: { date: string | null }) {
  if (date === null) {
    return <span className="dctp-changelog-date">—</span>;
  }

  return (
    <time className="dctp-changelog-date" dateTime={date}>
      {formatChangelogDate(date)}
    </time>
  );
}

function formatChangelogDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function ChangelogChangesList({ changes }: { changes: ChangelogChange[] }) {
  return (
    <ul className="dctp-changelog-changes">
      {changes.map((change, index) => (
        <li
          key={`${change.kind}-${index}`}
          className="dctp-changelog-change"
        >
          <span
            className="dctp-changelog-kind"
            style={{ backgroundColor: CHANGE_KIND_COLORS[change.kind] }}
            aria-hidden="true"
          />
          <div className="dctp-changelog-change-body">
            <span className="dctp-changelog-change-text">{change.description}</span>
            {change.details ? (
              <p className="dctp-changelog-change-details">{change.details}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

function ChangelogEntryCards({ entries }: { entries: ChangelogEntry[] }) {
  return (
    <div className="dctp-changelog-cards">
      {entries.map((entry, index) => (
        <article key={entryKey(entry, index)} className="dctp-changelog-card">
          <div className="dctp-changelog-card-head">
            <ChangelogVersion version={entry.version} />
            <ChangelogDate date={entry.date} />
          </div>
          <p className="dctp-changelog-card-author">Автор · {entry.author}</p>
          <ChangelogChangesList changes={entry.changes} />
        </article>
      ))}
    </div>
  );
}

export function ChangelogTable({
  data,
  emptyMessage,
}: {
  data: TokenChangelog;
  emptyMessage?: string;
}) {
  const sortedEntries = useMemo(
    () => sortChangelogEntries(data.entries),
    [data.entries],
  );

  if (sortedEntries.length === 0) {
    if (!emptyMessage) {
      return null;
    }

    return (
      <section className="dctp-changelog" aria-labelledby="dctp-changelog-heading">
        <h2 id="dctp-changelog-heading" className="dctp-changelog-heading">
          Changelog
        </h2>
        <p className="dctp-changelog-empty">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className="dctp-changelog" aria-labelledby="dctp-changelog-heading">
      <h2 id="dctp-changelog-heading" className="dctp-changelog-heading">
        Changelog
      </h2>

      <div className="dctp-changelog-table-wrap ds-token-table-wrap">
        <table className="ds-token-table dctp-table dctp-changelog-table">
          <thead>
            <tr>
              <th className="dctp-changelog-col-version">Версия</th>
              <th className="dctp-changelog-col-changes">Список изменений</th>
              <th className="dctp-changelog-col-date">Дата</th>
              <th className="dctp-changelog-col-author">Автор</th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries.map((entry, index) => (
              <tr key={entryKey(entry, index)}>
                <td className="dctp-changelog-col-version">
                  <ChangelogVersion version={entry.version} />
                </td>
                <td className="dctp-changelog-col-changes">
                  <ChangelogChangesList changes={entry.changes} />
                </td>
                <td className="dctp-changelog-col-date">
                  <ChangelogDate date={entry.date} />
                </td>
                <td className="dctp-changelog-col-author">{entry.author}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ChangelogEntryCards entries={sortedEntries} />
    </section>
  );
}
