import { useMemo } from 'react';

export type ChangelogChangeKind = 'added' | 'changed' | 'fixed' | 'deprecated' | 'removed';

export type ChangelogReleaseType = 'major' | 'minor' | 'patch';

export interface ChangelogChange {
  kind: ChangelogChangeKind;
  description: string;
  details?: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  type: ChangelogReleaseType;
  author: string;
  changes: ChangelogChange[];
}

export interface TokenChangelog {
  artifact: string;
  currentVersion: string;
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
      {entries.map((entry) => (
        <article key={entry.version} className="dctp-changelog-card">
          <div className="dctp-changelog-card-head">
            <span className="dctp-changelog-version">{entry.version}</span>
            <time className="dctp-changelog-date" dateTime={entry.date}>
              {formatChangelogDate(entry.date)}
            </time>
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
    () => [...data.entries].sort((left, right) => compareSemverDesc(left.version, right.version)),
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
            {sortedEntries.map((entry) => (
              <tr key={entry.version}>
                <td className="dctp-changelog-col-version">
                  <span className="dctp-changelog-version">{entry.version}</span>
                </td>
                <td className="dctp-changelog-col-changes">
                  <ChangelogChangesList changes={entry.changes} />
                </td>
                <td className="dctp-changelog-col-date">
                  <time className="dctp-changelog-date" dateTime={entry.date}>
                    {formatChangelogDate(entry.date)}
                  </time>
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
