import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { createExternalMarked, mermaidToHtml, sanitizeHtml } from '../scripts/external-guide-markdown.mjs';
import guideRegistry from '../guide-registry.json';

/* `generated/` в git не хранится, а в CI `npm test` идёт до сборки:
   гайды собираются здесь, страница импортируется после. */
let findGuideByPath: typeof import('../GuidePage').findGuideByPath;
let resolveRouteLinks: typeof import('../GuidePage').resolveRouteLinks;

beforeAll(async () => {
  execFileSync(process.execPath, [join(__dirname, '../scripts/build-guides.mjs')], { stdio: 'ignore' });
  ({ findGuideByPath, resolveRouteLinks } = await import('../GuidePage'));
});

/**
 * Гайд со стороны (`source` в реестре): разметка ограничена, ссылки между
 * главами идут через маршрут портала, схемы mermaid — текстом.
 */

const md = createExternalMarked({
  resolveChapter: (fileName) => (fileName === '02-commit.md' ? '/guides/preview/g/commit' : null),
});

describe('сырой HTML внешнего гайда', () => {
  it('пропускает только теги белого списка без атрибутов', () => {
    expect(sanitizeHtml('<details><summary>Ответ</summary>да</details>')).toBe(
      '<details><summary>Ответ</summary>да</details>',
    );
    expect(sanitizeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(sanitizeHtml('<details open onclick="x()">')).toBe('&lt;details open onclick=&quot;x()&quot;&gt;');
    expect(sanitizeHtml('<img src=x onerror=alert(1)>')).not.toContain('<img');
  });

  it('размечает `код` и **жирный** внутри HTML-блока', () => {
    expect(sanitizeHtml('<details><summary>Ответ</summary>`main` и **да**</details>')).toContain(
      '<code>main</code> и <strong>да</strong>',
    );
  });

  it('не пропускает HTML через markdown', () => {
    const html = md.parse('Текст <iframe src="https://evil"></iframe>\n\n<div onclick="x()">блок</div>\n');
    expect(html).not.toMatch(/<iframe|<div/);
  });
});

describe('ссылки внешнего гайда', () => {
  it('глава → маршрут портала, неизвестная глава и javascript: → текст', () => {
    const html = md.parse('[коммит](02-commit.md) [нет](99-none.md) [js](javascript:alert(1)) [gh](https://github.com)');
    expect(html).toContain('href="aid-route:/guides/preview/g/commit"');
    expect(html).not.toContain('99-none');
    expect(html).not.toContain('javascript:');
    expect(html).toContain('href="https://github.com" rel="noopener noreferrer"');
  });

  it('картинка остаётся подписью', () => {
    expect(md.parse('![схема](https://x/y.png)')).not.toContain('<img');
  });

  it('resolveRouteLinks подставляет адрес портала и сохраняет якорь', () => {
    const html = '<a href="aid-route:/guides/preview/g/commit#zachem">x</a>';
    expect(resolveRouteLinks(html, (route) => `/pr-1/driver${route}`)).toBe(
      '<a href="/pr-1/driver/guides/preview/g/commit#zachem">x</a>',
    );
  });
});

describe('схемы mermaid текстом', () => {
  it('flowchart: узлы в две строки и подписи стрелок', () => {
    const html = mermaidToHtml('flowchart LR\n  A["Мой компьютер<br/>локальный репозиторий"] -- "push" --> G["GitHub"]\n  G --> A\n');
    expect(html).toContain('<li>Мой компьютер (локальный репозиторий) → GitHub: push</li>');
    expect(html).toContain('<li>GitHub → Мой компьютер (локальный репозиторий)</li>');
  });

  it('gitGraph: ветки, теги и слияния', () => {
    const html = mermaidToHtml(
      'gitGraph\n  commit id: "A" tag: "v1.0.0"\n  branch fix\n  commit id: "B"\n  checkout main\n  merge fix id: "PR"\n',
    );
    expect(html).toContain('<li>main: коммит «A», тег v1.0.0</li>');
    expect(html).toContain('<li>от main создана ветка fix</li>');
    expect(html).toContain('<li>fix: коммит «B»</li>');
    expect(html).toContain('<li>fix слита в main — «PR»</li>');
  });

  it('sequenceDiagram: имена участников', () => {
    const html = mermaidToHtml('sequenceDiagram\n  participant Я as Мой компьютер\n  participant GH as GitHub\n  Я->>GH: push');
    expect(html).toContain('<li>Мой компьютер → GitHub: push</li>');
  });

  it('неразобранный тип — исходником, экранированным', () => {
    const html = mermaidToHtml('pie\n  "<b>a</b>" : 1');
    expect(html).toContain('<pre><code>');
    expect(html).not.toContain('<b>');
  });
});

describe('гайды на согласовании в реестре', () => {
  const pending = guideRegistry.guides.filter(
    (guide) => (guide as { publication?: string }).publication === 'pending-approval',
  );

  it('живут в /guides/preview/ и указывают автора и источник', () => {
    expect(pending.length).toBeGreaterThan(0);
    for (const guide of pending) {
      const entry = guide as typeof guide & { author?: string; source?: { url: string; commit: string } };
      expect(entry.reviewRoute.startsWith('/guides/preview/')).toBe(true);
      expect(entry.author).toBeTruthy();
      expect(entry.source?.url).toMatch(/^https:\/\//);
      expect(entry.source?.commit).toMatch(/^[0-9a-f]{40}$/);
    }
  });

  it('каждая глава собрана и находится по адресу', () => {
    for (const guide of pending) {
      const chapters = (guide as { chapters?: string[] }).chapters ?? [];
      const landing = findGuideByPath(guide.reviewRoute);
      expect(landing?.chapterIndex).toBe(0);
      expect(landing?.guide.chapters).toHaveLength(chapters.length);
      for (const chapter of landing?.guide.chapters ?? []) {
        expect(findGuideByPath(chapter.route)?.chapter?.chapterId).toBe(chapter.chapterId);
      }
    }
  });
});
