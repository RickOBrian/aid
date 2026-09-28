/**
 * Описание релиза плагина (Markdown с GitHub) → простые блоки для React.
 *
 * Не Markdown-движок и не HTML: понимает ровно то, чем пишутся релизы
 * Token Comparator, — абзацы, заголовки `###`, списки `-` и `1.`, код в
 * обратных кавычках. Всё прочее выводится как текст. Разметка из описания
 * не попадает в DOM как HTML, поэтому санитайзер не нужен.
 *
 * Раздел «Установка» пропускается: у страницы свои шаги установки, и два
 * набора инструкций рядом расходились бы.
 */

export type NoteInline = { kind: 'text'; text: string } | { kind: 'code'; text: string };

export type NoteBlock =
  | { kind: 'heading'; inline: NoteInline[] }
  | { kind: 'paragraph'; inline: NoteInline[] }
  | { kind: 'list'; ordered: boolean; items: NoteInline[][] };

const SKIPPED_SECTIONS = new Set(['установка']);

export function parseInline(source: string): NoteInline[] {
  const plain = source
    // [текст](ссылка) → текст: ссылки из описания не выводим.
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1');
  return plain
    .split('`')
    .map((text, index): NoteInline => ({ kind: index % 2 === 1 ? 'code' : 'text', text }))
    .filter((part) => part.text.length > 0);
}

export function parseReleaseNotes(markdown: string): NoteBlock[] {
  const blocks: NoteBlock[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let skipping = false;

  const flush = () => {
    if (paragraph.length > 0) {
      blocks.push({ kind: 'paragraph', inline: parseInline(paragraph.join(' ')) });
      paragraph = [];
    }
    if (list) {
      blocks.push({ kind: 'list', ordered: list.ordered, items: list.items.map(parseInline) });
      list = null;
    }
  };

  for (const rawLine of markdown.replace(/\r\n?/g, '\n').split('\n')) {
    const line = rawLine.trim();
    const heading = /^#{1,6}\s+(.+)$/.exec(line);

    if (heading) {
      flush();
      skipping = SKIPPED_SECTIONS.has(heading[1].trim().toLowerCase());
      if (!skipping) {
        blocks.push({ kind: 'heading', inline: parseInline(heading[1].trim()) });
      }
      continue;
    }
    if (skipping) {
      continue;
    }
    if (line === '') {
      flush();
      continue;
    }

    const bullet = /^[-*]\s+(.+)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.+)$/.exec(line);
    const item = bullet ?? numbered;
    if (item) {
      const ordered = Boolean(numbered);
      if (paragraph.length > 0 || (list && list.ordered !== ordered)) {
        flush();
      }
      list ??= { ordered, items: [] };
      list.items.push(item[1]);
      continue;
    }

    if (list) {
      // Продолжение пункта на следующей строке.
      list.items[list.items.length - 1] += ` ${line}`;
    } else {
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}
