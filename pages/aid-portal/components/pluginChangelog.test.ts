import { describe, expect, it } from 'vitest';
import { pluginChangelog } from '../pluginChangelog';

/**
 * Changelog плагина на странице Token Comparator — из описаний релизов GitHub,
 * в формате changelog портала.
 */

const release = (version: string, notes: string, date = '2026-09-26') => ({ version, date, author: 'RickOBrian', notes });

describe('pluginChangelog', () => {
  it('разделы «Новое», «Изменено», «Исправлено» — пунктами со своим видом', () => {
    const log = pluginChangelog([
      release('1.6.0', 'Коротко о релизе.\n\n### Новое\n\n- Первое\n- Второе\n\n### Изменено\n\n- Третье\n\n### Исправлено\n\n- Четвёртое'),
    ])!;
    expect(log.entries[0].changes).toEqual([
      { kind: 'added', description: 'Коротко о релизе.' },
      { kind: 'added', description: 'Первое' },
      { kind: 'added', description: 'Второе' },
      { kind: 'changed', description: 'Третье' },
      { kind: 'fixed', description: 'Четвёртое' },
    ]);
  });

  it('установка и служебные разделы не показываются, цитата о перенумерации тоже', () => {
    const log = pluginChangelog([
      release('1.0.1', '> Раньше этот релиз назывался **v0.1.1**.\n\nПересборка.\n\n### Установка\n\n1. Скачайте\n\n### Verified\n\n- SHA'),
    ])!;
    expect(log.entries[0].changes).toEqual([{ kind: 'changed', description: 'Пересборка.' }]);
  });

  it('смысловой раздел и инструкция к обновлению — одной строкой с текстом', () => {
    const log = pluginChangelog([
      release('1.1.0', '### Обновление\n\nЗамените файлы.\n\n### Типографика теперь полноценная категория\n\n- Фильтр\n- Экспорт'),
    ])!;
    expect(log.entries[0].changes).toEqual([
      { kind: 'changed', description: 'Обновление', details: 'Замените файлы.' },
      { kind: 'changed', description: 'Типографика теперь полноценная категория', details: 'Фильтр\nЭкспорт' },
    ]);
  });

  it('заголовок-название релиза пропускается, код в обратных кавычках — текстом', () => {
    const log = pluginChangelog([release('1.0.0', '## Token Comparator v1.0.0\n\nFirst release.\n\n### Included\n\n- Packaging (`7a6c85a`)')])!;
    expect(log.entries[0].changes).toEqual([
      { kind: 'added', description: 'First release.' },
      { kind: 'added', description: 'Packaging (7a6c85a)' },
    ]);
  });

  it('тип версии — по разнице с предыдущей, текущая — самая новая', () => {
    const log = pluginChangelog([release('1.1.0', ''), release('1.0.1', ''), release('1.0.0', ''), release('2.0.0', '')])!;
    expect(Object.fromEntries(log.entries.map((entry) => [entry.version, entry.type]))).toEqual({
      '1.0.0': 'minor',
      '1.0.1': 'patch',
      '1.1.0': 'minor',
      '2.0.0': 'major',
    });
    expect(log.currentVersion).toBe('2.0.0');
  });

  it('нет релизов — нет таблицы', () => {
    expect(pluginChangelog([])).toBeNull();
  });
});
