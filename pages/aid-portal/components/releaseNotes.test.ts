import { describe, expect, it } from 'vitest';
import { parseInline, parseReleaseNotes } from '../releaseNotes';

/**
 * «Что нового» на странице плагина — из описания релиза на GitHub.
 * Формат — как пишутся релизы Token Comparator.
 */

const NOTES = `Статусы объясняют себя прямо в таблице.

### Новое

- Наведите на бейдж — всплывёт пояснение.
- Прозрачность отделяется точкой: \`#2D6CDF · 80%\`.

### Обновление

Достаточно заменить файлы плагина.

### Установка

1. Скачайте \`token-comparator.zip\` и распакуйте
2. Figma Desktop → Plugins → Development`;

describe('parseReleaseNotes', () => {
  const blocks = parseReleaseNotes(NOTES);

  it('раскладывает абзацы, заголовки и списки', () => {
    expect(blocks.map((block) => block.kind)).toEqual(['paragraph', 'heading', 'list', 'heading', 'paragraph']);
  });

  it('пропускает раздел «Установка» — у страницы свои шаги', () => {
    expect(JSON.stringify(blocks)).not.toContain('Установка');
    expect(JSON.stringify(blocks)).not.toContain('Скачайте');
  });

  it('выделяет код в обратных кавычках', () => {
    const list = blocks[2];
    expect(list.kind === 'list' && list.items[1]).toEqual([
      { kind: 'text', text: 'Прозрачность отделяется точкой: ' },
      { kind: 'code', text: '#2D6CDF · 80%' },
      { kind: 'text', text: '.' },
    ]);
  });

  it('различает нумерованный список и склеивает перенос строки в пункте', () => {
    const [list] = parseReleaseNotes('1. Первый\nпродолжение\n2. Второй');
    expect(list).toEqual({
      kind: 'list',
      ordered: true,
      items: [[{ kind: 'text', text: 'Первый продолжение' }], [{ kind: 'text', text: 'Второй' }]],
    });
  });
});

describe('parseInline', () => {
  it('HTML остаётся текстом, ссылки — только подписью', () => {
    expect(parseInline('<img src=x onerror=alert(1)> и [гайд](https://evil.test)')).toEqual([
      { kind: 'text', text: '<img src=x onerror=alert(1)> и гайд' },
    ]);
  });
});
