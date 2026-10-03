import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createBase } from '../base';

/**
 * Превью PR живёт в папке (`/pr-12/`), основной сайт — в корне (ADR-038).
 * Пропущенная база ломает превью молча: ссылка ведёт на основной сайт или в 404.
 */

describe('createBase', () => {
  const preview = createBase('/pr-12/');
  const root = createBase('/');

  it('добавляет базу к путям от корня приложения', () => {
    expect(preview.withBase('/driver/tokens/colors')).toBe('/pr-12/driver/tokens/colors');
    expect(preview.withBase('/')).toBe('/pr-12/');
    expect(root.withBase('/driver/tokens/colors')).toBe('/driver/tokens/colors');
  });

  it('не трогает внешние и относительные ссылки', () => {
    expect(preview.withBase('https://github.com/RickOBrian/aid')).toBe('https://github.com/RickOBrian/aid');
    expect(preview.withBase('//cdn.example/x.js')).toBe('//cdn.example/x.js');
    expect(preview.withBase('icons/x.svg')).toBe('icons/x.svg');
  });

  it('снимает базу с адреса перед разбором маршрута', () => {
    expect(preview.stripBase('/pr-12/driver/tokens/colors')).toBe('/driver/tokens/colors');
    expect(preview.stripBase('/pr-12/')).toBe('/');
    expect(preview.stripBase('/pr-12')).toBe('/');
    expect(preview.stripBase('/pr-120/x')).toBe('/pr-120/x');
    expect(root.stripBase('/driver')).toBe('/driver');
  });
});

describe('страж: пути в коде портала учитывают базу', () => {
  const appRoot = join(__dirname, '..');
  const sources = readdirSync(appRoot)
    .filter((name) => /\.(ts|tsx)$/.test(name) && !name.endsWith('.d.ts'))
    .concat(readdirSync(join(appRoot, 'components')).filter((n) => /\.tsx?$/.test(n) && !/\.test\./.test(n)).map((n) => `components/${n}`))
    .map((name) => ({ name, text: readFileSync(join(appRoot, name), 'utf8') }));

  it('адрес страницы читается только через currentAppPath()', () => {
    const offenders = sources
      .filter(({ name, text }) => name !== 'base.ts' && text.includes('window.location.pathname'))
      .map(({ name }) => name);
    expect(offenders).toEqual([]);
  });

  // Внешние адреса: Figma, GitHub Releases. Всё остальное — через withBase().
  const EXTERNAL_HREFS = new Set(['figma.url', 'pluginMeta.downloadUrl', 'release.releaseUrl', 'release.releasesUrl']);

  it('внутренние href оборачиваются в withBase()', () => {
    const offenders: string[] = [];
    for (const { name, text } of sources) {
      for (const match of text.matchAll(/href=\{([^}]*)\}/g)) {
        const expression = match[1].trim();
        if (!expression.startsWith('withBase(') && !EXTERNAL_HREFS.has(expression)) {
          offenders.push(`${name}: href={${expression}}`);
        }
      }
      for (const match of text.matchAll(/href="(\/[^"]*)"/g)) {
        offenders.push(`${name}: href="${match[1]}"`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
