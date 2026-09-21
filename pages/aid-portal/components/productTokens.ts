/**
 * Чтение непветовых токенов продукта: пространство, радиусы, тени, типографика.
 *
 * Цветовой слой каждого компонента уже читал значения из данных продукта и
 * бросал ошибку, если строка не найдена. Остальные четыре категории при этом
 * писались в CSS литералами, хотя анатомия объявляла их semantic-токенами —
 * то есть анатомия показывала чистый результат там, где его не было
 * (аудит 2026-09-21, находка №1).
 *
 * Здесь та же дисциплина, что у цвета: имя токена не найдено — сборка падает,
 * а не подставляет значение молча. Переименование токена в данных продукта
 * обязано ломать сборку, иначе компонент тихо разойдётся с источником.
 */

import { spacingTokens } from '../spacingData';
import { radiusTokens } from '../radiusData';
import { shadowSections } from '../shadowsData';
import { typographySections } from '../typographyData';

function fail(category: string, name: string, available: string[]): never {
  throw new Error(
    `Driver ${category} tokens: "${name}" не найден. Доступные: ${available.join(', ')}`,
  );
}

/**
 * Токен ищется по `id`, затем по `name`.
 *
 * У теней это разные значения: `id: 'shadow-1'`, `name: 'shadow 1'` — через
 * пробел. Анатомии компонентов ссылаются на `id`, поэтому он первичен.
 */
function byIdOrName<T extends { id: string; name: string }>(list: T[], key: string) {
  return list.find((candidate) => candidate.id === key) ?? list.find((candidate) => candidate.name === key);
}

/** Отступ по имени токена пространства: `space-2` → `2px`. */
export function spacing(name: string): string {
  const token = byIdOrName(spacingTokens, name);
  if (!token) fail('spacing', name, spacingTokens.map((t) => t.id));
  return `${token.valuePx}px`;
}

/** Радиус по имени токена: `radius-12` → `12px`. */
export function radius(name: string): string {
  const token = byIdOrName(radiusTokens, name);
  if (!token) fail('radius', name, radiusTokens.map((t) => t.id));
  return token.valueLabel === '0' ? '0' : `${token.valueLabel}px`;
}

/** Тень по имени токена: `shadow-1` → готовая строка box-shadow. */
export function shadow(name: string): string {
  const all = shadowSections.flatMap((section) => section.items);
  const token = byIdOrName(all, name);
  if (!token) fail('shadow', name, all.map((t) => t.id));
  return token.previewBoxShadow;
}

export interface TypographyDecl {
  fontFamily: string;
  fontWeight: number;
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
}

/** Роль типографики по имени: `subtitle-2` → полный набор свойств стиля. */
export function typography(name: string): TypographyDecl {
  const all = typographySections.flatMap((section) => section.items);
  const token = byIdOrName(all, name);
  if (!token) fail('typography', name, all.map((t) => t.id));
  return {
    fontFamily: token.fontFamily,
    fontWeight: token.fontWeight,
    fontSize: `${token.fontSize}px`,
    lineHeight: `${token.lineHeight}px`,
    letterSpacing: `${token.letterSpacing}px`,
  };
}

/** Объявления типографики как строки CSS — для подстановки в блок правил. */
export function typographyCss(name: string): string {
  const t = typography(name);
  return [
    `font-family: ${t.fontFamily};`,
    `font-weight: ${t.fontWeight};`,
    `font-size: ${t.fontSize};`,
    `line-height: ${t.lineHeight};`,
    `letter-spacing: ${t.letterSpacing};`,
  ].join('\n  ');
}
