/**
 * Базовый путь приложения (`vite build --base`).
 *
 * На основном домене портал живёт в корне (`/`), а превью каждого PR — в
 * папке (`/pr-12/`, ADR-038). Ссылки и маршруты в коде пишутся от корня
 * приложения (`/driver/tokens/colors`): `withBase` добавляет базу при отрисовке
 * ссылки и запросе файла, `stripBase` снимает её с адреса перед разбором
 * маршрута. API (`/api/...`) от базы не зависит — он всегда в корне домена.
 */

function normalizeBase(base: string): string {
  const withLeading = base.startsWith('/') ? base : `/${base}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

export function createBase(rawBase: string) {
  const base = normalizeBase(rawBase);

  /** `/driver/x` → `/pr-12/driver/x`. Внешние ссылки и относительные пути не трогает. */
  function withBase(path: string): string {
    if (!path.startsWith('/') || path.startsWith('//')) {
      return path;
    }
    return `${base}${path.slice(1)}`;
  }

  /** `/pr-12/driver/x` → `/driver/x`. Адрес вне базы возвращается как есть. */
  function stripBase(pathname: string): string {
    if (base === '/') {
      return pathname;
    }
    const prefix = base.slice(0, -1);
    if (pathname === prefix || pathname === base) {
      return '/';
    }
    return pathname.startsWith(base) ? pathname.slice(prefix.length) : pathname;
  }

  return { base, withBase, stripBase };
}

const appBase = createBase(import.meta.env.BASE_URL ?? '/');

export const APP_BASE = appBase.base;
export const withBase = appBase.withBase;
export const stripBase = appBase.stripBase;

/** Текущий маршрут приложения без базы — его разбирает `resolveProductRoute`. */
export function currentAppPath(): string {
  return stripBase(window.location.pathname);
}
