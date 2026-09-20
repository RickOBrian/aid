#!/usr/bin/env node
/**
 * build-structure — собирает PROJECT_STRUCTURE.md из фактического дерева.
 *
 * Файл существовал как снимок, сделанный руками, и протух через две недели:
 * знал пять правил Cursor из семнадцати, описывал папки, которых уже нет.
 * Документ, единственная работа которого — повторять файловую систему,
 * обязан из неё и строиться.
 *
 * Назначение разделов — единственное, что здесь пишет человек: таблица
 * PURPOSE ниже. Пути в ней проверяются на существование.
 */

import { readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const SKIP = new Set([
  'node_modules', '.git', 'dist', 'storybook-static', '.vercel',
  '.DS_Store', 'generated', '.tmp-qa',
]);

/** Назначение разделов — пишется человеком, пути проверяются. */
const PURPOSE = [
  ['skills/_shared/standards/', 'Публикуемые стандарты дизайн-системы'],
  ['skills/_shared/protocols/', 'Как работаем мы: git, скиллы, импорт, форма гайдов'],
  ['skills/_shared/protocols/gates/', 'Обязательные гейты процесса'],
  ['skills/_shared/architecture/', 'Технические описания конкретных фич'],
  ['skills/_shared/notes/', 'Черновики и заметки'],
  ['skills/', 'Скиллы: по папке на скилл, внутри SKILL.md'],
  ['pages/aid-portal/', 'Presentbook: портал дизайн-системы (проект aid-ds на Vercel)'],
  ['products/', 'Манифесты продуктов и их реестр'],
  ['tokens/', 'Changelog коллекций токенов, по префиксу продукта'],
  ['changes/', 'Очереди pending и released по продуктам'],
  ['docs/standards-alpha/', 'Рабочие материалы альфы: план, решения, вопросы'],
  ['scripts/', 'Проверки и генераторы репозитория'],
  ['tools/', 'Плагин Figma Token Comparator и его бэкенд'],
  ['memory/', 'Журналы памяти скиллов, по файлу на человека'],
  ['.cursor/rules/', 'Архив правил Cursor: указатели на переехавшее содержание'],
  ['.github/workflows/', 'CI: проверка документов, типов и сборки портала'],
];

function tree(dir, prefix = '', depth = 0, maxDepth = 2) {
  if (depth > maxDepth) return [];
  // Фильтр обязан отсеять всё, что не будет напечатано, ДО подсчёта
  // последнего элемента — иначе ветка рисуется как промежуточная там, где
  // она последняя. Файлы печатаются только на верхнем уровне.
  const entries = readdirSync(join(repoRoot, dir), { withFileTypes: true })
    .filter((e) => !SKIP.has(e.name) && !(e.name.startsWith('.') && depth > 0))
    .filter((e) => e.isDirectory() || depth === 0)
    .sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name));

  const lines = [];
  entries.forEach((entry, i) => {
    const last = i === entries.length - 1;
    const branch = last ? '└── ' : '├── ';
    const rel = dir === '.' ? entry.name : `${dir}/${entry.name}`;

    if (entry.isDirectory()) {
      const count = readdirSync(join(repoRoot, rel)).filter((n) => !SKIP.has(n)).length;
      lines.push(`${prefix}${branch}${entry.name}/${depth === maxDepth ? `  (${count})` : ''}`);
      lines.push(...tree(rel, prefix + (last ? '    ' : '│   '), depth + 1, maxDepth));
    } else if (depth === 0) {
      lines.push(`${prefix}${branch}${entry.name}`);
    }
  });
  return lines;
}

const missing = PURPOSE.filter(([path]) => !existsSync(join(repoRoot, path)));
if (missing.length) {
  console.error('[build-structure] в таблице назначений — несуществующие пути:');
  for (const [path] of missing) console.error(`  ${path}`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const content = `# Структура проекта aid

> Файл собирается \`node scripts/build-structure.mjs\`. Руками не править:
> дерево строится из репозитория, таблица назначений — из PURPOSE в скрипте.
> Снимок: ${today}

\`\`\`
aid/
${tree('.').join('\n')}
\`\`\`

## Назначение разделов

| Путь | Назначение |
|------|------------|
${PURPOSE.map(([p, d]) => `| \`${p}\` | ${d} |`).join('\n')}

## Исключено из дерева

${[...SKIP].map((s) => `\`${s}\``).join(', ')}

Глубина дерева — два уровня; для папок на нижнем уровне показано число элементов.
`;

writeFileSync(join(repoRoot, 'PROJECT_STRUCTURE.md'), content, 'utf8');
console.log(`[build-structure] PROJECT_STRUCTURE.md собран, разделов в таблице: ${PURPOSE.length}`);
