import { useMemo } from 'react';

export type ChangelogChangeKind = 'added' | 'changed' | 'fixed' | 'removed';

export type ChangelogReleaseType = 'major' | 'minor' | 'patch';

export interface ChangelogChange {
  kind: ChangelogChangeKind;
  description: string;
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
          <span className="dctp-changelog-change-text">{change.description}</span>
        </li>
      ))}
    </ul>
  );
}

export function ChangelogTable({ data }: { data: TokenChangelog }) {
  const sortedEntries = useMemo(
    () => [...data.entries].sort((left, right) => compareSemverDesc(left.version, right.version)),
    [data.entries],
  );

  if (sortedEntries.length === 0) {
    return null;
  }

  return (
    <section className="dctp-changelog" aria-labelledby="dctp-changelog-heading">
      <h2 id="dctp-changelog-heading" className="dctp-changelog-heading">
        Changelog
      </h2>

      <div className="dctp-table-wrap">
        <table className="dctp-table dctp-changelog-table">
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
    </section>
  );
}
