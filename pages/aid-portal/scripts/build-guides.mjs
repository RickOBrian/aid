/**
 * build-guides — превращает канонические .md в готовые к показу страницы.
 *
 * Раньше каждый гайд был отдельной React-страницей, вручную повторяющей
 * markdown: 439 строк TSX на один документ, и уже разошедшихся с источником
 * (ADR-002). Теперь источник один — файл в skills/_shared/, а портал
 * показывает его результат.
 *
 * Разбор markdown происходит здесь, на сборке, а не в браузере: парсер не
 * попадает в рантайм-бандл.
 *
 * На выходе:
 *   generated/guides/<guideId>.html   тело гайда
 *   generated/guides/index.json       метаданные всех гайдов
 *   public/guides/sources/<file>.md   исходник для скачивания
 *
 * Гайд из внешнего источника (`chapters` + `sourceDir` в реестре) собирается
 * по главам: generated/guides/<guideId>--<chapterId>.html, разметка
 * ограничена — см. external-guide-markdown.mjs.
 */

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { createExternalMarked } from './external-guide-markdown.mjs';

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(appRoot, '../..');
const registry = JSON.parse(readFileSync(join(appRoot, 'guide-registry.json'), 'utf8'));

const generatedDir = join(appRoot, 'generated/guides');
const sourcesDir = join(appRoot, 'public/guides/sources');
rmSync(generatedDir, { recursive: true, force: true });
mkdirSync(generatedDir, { recursive: true });
mkdirSync(sourcesDir, { recursive: true });

/** Значение поля frontmatter — верхнего уровня или вложенного в metadata. */
function field(block, key) {
  const m = block.match(new RegExp(`^\\s*${key}:\\s*"?([^"\\n]+)"?\\s*$`, 'm'));
  return m ? m[1].trim() : null;
}

/** Разделяет frontmatter и тело markdown. */
function splitFrontmatter(raw) {
  if (!raw.startsWith('---')) return { frontmatter: '', body: raw };
  const fmEnd = raw.indexOf('\n---', 3);
  return { frontmatter: raw.slice(4, fmEnd), body: raw.slice(fmEnd + 4) };
}

/** Якорь заголовка: латиница и кириллица в kebab-case. */
function slug(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

marked.use({
  renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      const id = slug(text);
      return `<h${depth} id="${id}">${text}</h${depth}>\n`;
    },
  },
});

const index = [];
let built = 0;

/**
 * Многоглавный гайд из внешнего источника: глава — подстраница, первая
 * глава — страница гайда (`reviewRoute`), остальные — `reviewRoute/<id>`.
 */
function buildChapteredGuide(guide) {
  const { guideId, sourceDir, chapters: files } = guide;
  const chapters = files.map((fileName, index) => {
    const sourceFile = join(repoRoot, sourceDir, fileName);
    if (!existsSync(sourceFile)) {
      console.error(`[build-guides] ${guideId}: глава не найдена — ${sourceDir}/${fileName}`);
      process.exit(1);
    }
    const { frontmatter, body } = splitFrontmatter(readFileSync(sourceFile, 'utf8'));
    const chapterId = field(frontmatter, 'id') ?? fileName.replace(/\.md$/, '');
    const titleMatch = body.match(/^#\s+(.+)$/m);
    return {
      fileName,
      chapterId,
      title: titleMatch ? titleMatch[1].trim() : (field(frontmatter, 'title') ?? chapterId),
      route: index === 0 ? guide.reviewRoute : `${guide.reviewRoute}/${chapterId}`,
      body: body.replace(/^#\s+.+$/m, ''),
    };
  });

  const routeByFile = new Map(chapters.map((chapter) => [chapter.fileName, chapter.route]));
  const md = createExternalMarked({ resolveChapter: (fileName) => routeByFile.get(fileName) ?? null });

  for (const chapter of chapters) {
    writeFileSync(join(generatedDir, `${guideId}--${chapter.chapterId}.html`), md.parse(chapter.body), 'utf8');
  }

  index.push({
    guideId,
    title: guide.canonicalName,
    canonicalName: guide.canonicalName,
    version: guide.version ?? null,
    status: 'draft',
    lastReviewed: null,
    kind: null,
    sourcePath: sourceDir,
    sourceDownloadUrl: null,
    reviewRoute: guide.reviewRoute,
    guidesGroup: guide.guidesGroup,
    description: guide.description ?? null,
    publication: guide.publication ?? 'published',
    author: guide.author ?? null,
    source: guide.source ?? null,
    chapters: chapters.map(({ chapterId, title, route }) => ({ chapterId, title, route })),
  });

  built += 1;
  console.log(`[build-guides] ${guideId} ← ${sourceDir} (глав: ${chapters.length})`);
}

for (const guide of registry.guides ?? []) {
  const { guideId, sourcePath, sourceDownloadFileName } = guide;

  if (guide.chapters) {
    buildChapteredGuide(guide);
    continue;
  }

  if (!sourcePath) {
    console.warn(`[build-guides] ${guideId}: нет sourcePath — пропуск`);
    continue;
  }

  const sourceFile = join(repoRoot, sourcePath);
  if (!existsSync(sourceFile)) {
    console.error(`[build-guides] ${guideId}: источник не найден — ${sourcePath}`);
    process.exit(1);
  }

  const raw = readFileSync(sourceFile, 'utf8');
  const hasFrontmatter = raw.startsWith('---');
  const fmEnd = hasFrontmatter ? raw.indexOf('\n---', 3) : -1;
  const frontmatter = hasFrontmatter ? raw.slice(4, fmEnd) : '';
  let body = hasFrontmatter ? raw.slice(fmEnd + 4) : raw;

  /* Заголовок и строка статуса показываются в шапке страницы,
     поэтому из тела убираются — иначе они задвоятся. */
  const titleMatch = body.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : guide.canonicalName;
  body = body.replace(/^#\s+.+$/m, '');
  body = body.replace(/^>\s*Статус:.*$/m, '');
  body = body.replace(/^\s*---\s*$/m, '');

  writeFileSync(join(generatedDir, `${guideId}.html`), marked.parse(body), 'utf8');

  index.push({
    guideId,
    title,
    canonicalName: guide.canonicalName,
    version: field(frontmatter, 'version'),
    status: field(frontmatter, 'status') ?? 'draft',
    lastReviewed: field(frontmatter, 'lastReviewed'),
    kind: field(frontmatter, 'kind'),
    sourcePath,
    sourceDownloadUrl: sourceDownloadFileName ? `/guides/sources/${sourceDownloadFileName}` : null,
    reviewRoute: guide.reviewRoute,
    guidesGroup: guide.guidesGroup,
    description: guide.description ?? null,
    publication: guide.publication ?? 'published',
    author: null,
    source: null,
    chapters: null,
  });

  if (sourceDownloadFileName) cpSync(sourceFile, join(sourcesDir, sourceDownloadFileName));

  built += 1;
  console.log(`[build-guides] ${guideId} ← ${sourcePath}`);
}

writeFileSync(join(generatedDir, 'index.json'), `${JSON.stringify(index, null, 2)}\n`, 'utf8');
console.log(`[build-guides] собрано гайдов: ${built}`);
