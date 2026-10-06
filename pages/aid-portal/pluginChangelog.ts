import type { ChangelogChange, ChangelogChangeKind, ChangelogEntry, TokenChangelog } from './ChangelogTable';
import type { PluginReleaseSummary } from './api/_lib/pluginRelease';
import { parseReleaseNotes, type NoteInline } from './releaseNotes';

/**
 * Changelog плагина для страницы Token Comparator — из релизов GitHub, в том
 * же виде, что changelog токенов в портале (`ChangelogTable`).
 *
 * Описания релизов пишутся по-разному, поэтому разделы раскладываются так:
 * - «Новое», «Изменено», «Исправлено» (и английские Included, Fixed…) —
 *   каждый пункт отдельной строкой с этим видом изменения;
 * - инструкции к обновлению и смысловые разделы («Типографика теперь
 *   полноценная категория») — одной строкой «Изменено»: заголовок и текст;
 * - «Установка», «Install», «Verified», «Out of scope» — не показываются:
 *   шаги установки есть на странице, служебное читателю не нужно;
 * - вводный абзац — первой строкой версии; цитата о перенумерации версий
 *   («> Раньше этот релиз назывался…») пропускается.
 */

const KIND_BY_HEADING: Record<string, ChangelogChangeKind> = {
  новое: 'added',
  добавлено: 'added',
  included: 'added',
  added: 'added',
  изменено: 'changed',
  changed: 'changed',
  исправлено: 'fixed',
  fixed: 'fixed',
  удалено: 'removed',
  removed: 'removed',
  устарело: 'deprecated',
  deprecated: 'deprecated',
};

const SKIPPED_HEADINGS = new Set(['установка', 'install', 'verified', 'out of scope']);

type Section =
  | { type: 'lead' }
  | { type: 'skip' }
  | { type: 'kind'; kind: ChangelogChangeKind }
  | { type: 'group'; change: ChangelogChange };

function plain(parts: NoteInline[]): string {
  return parts.map((part) => part.text).join('').trim();
}

function releaseChanges(notes: string, version: string): ChangelogChange[] {
  const lead: string[] = [];
  const changes: ChangelogChange[] = [];
  let section: Section = { type: 'lead' };

  for (const block of parseReleaseNotes(notes)) {
    if (block.kind === 'heading') {
      const title = plain(block.inline);
      const key = title.toLowerCase();
      if (section.type === 'lead' && title.includes(version)) {
        continue; // заголовок-название релиза («Token Comparator v1.0.0»)
      }
      if (SKIPPED_HEADINGS.has(key)) {
        section = { type: 'skip' };
      } else if (KIND_BY_HEADING[key]) {
        section = { type: 'kind', kind: KIND_BY_HEADING[key] };
      } else {
        const change: ChangelogChange = { kind: 'changed', description: title };
        changes.push(change);
        section = { type: 'group', change };
      }
      continue;
    }

    const lines =
      block.kind === 'paragraph' ? [plain(block.inline)] : block.items.map((item) => plain(item));
    const text = lines.filter((line) => line && !line.startsWith('>'));
    if (text.length === 0) {
      continue;
    }

    if (section.type === 'lead') {
      lead.push(...text);
    } else if (section.type === 'kind') {
      const { kind } = section;
      changes.push(...text.map((description) => ({ kind, description })));
    } else if (section.type === 'group') {
      section.change.details = [section.change.details, ...text].filter(Boolean).join('\n');
    }
  }

  if (lead.length > 0) {
    changes.unshift({ kind: changes[0]?.kind ?? 'changed', description: lead.join(' ') });
  }
  return changes;
}

function compareVersions(a: string, b: string): number {
  const [left, right] = [a, b].map((value) => value.split('.').map((part) => Number(part)));
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) {
      return left[index] - right[index];
    }
  }
  return 0;
}

function releaseType(version: string, previous: string | undefined): ChangelogEntry['type'] {
  if (!previous) {
    return 'minor';
  }
  const [major, minor] = version.split('.');
  const [prevMajor, prevMinor] = previous.split('.');
  if (major !== prevMajor) {
    return 'major';
  }
  return minor !== prevMinor ? 'minor' : 'patch';
}

export function pluginChangelog(history: PluginReleaseSummary[]): TokenChangelog | null {
  if (history.length === 0) {
    return null;
  }
  const ascending = [...history].sort((left, right) => compareVersions(left.version, right.version));
  const entries: ChangelogEntry[] = ascending.map((release, index) => ({
    version: release.version,
    date: release.date,
    author: release.author,
    type: releaseType(release.version, ascending[index - 1]?.version),
    changes: releaseChanges(release.notes, release.version),
  }));
  return {
    artifact: 'Token Comparator',
    currentVersion: ascending[ascending.length - 1].version,
    entries,
  };
}
