/**
 * Страница маппинга — куда «Печать в Figma» кладёт таблицы отчётов (AID-49).
 *
 * Страница находится по метке плагина в sharedPluginData, а не по имени:
 * дизайнер может переименовать её (например, «Маппинг» → «Mapping» при
 * переходе имён Figma на латиницу), и отчёты не разъедутся по двум страницам.
 *
 * Переходный период: страница без метки находится по одному из известных
 * имён, и метка ставится на неё. Новая страница получает имя «Mapping».
 */

export const MAPPING_NAMESPACE = "aid_token_comparator";
export const MAPPING_PAGE_KEY = "mappingPage";
export const MAPPING_PAGE_NAME = "Mapping";
/** Имена страницы, по которым её находит плагин без метки: прежнее и новое. */
export const KNOWN_MAPPING_PAGE_NAMES: readonly string[] = ["Маппинг", "Mapping"];

/** Минимум от PageNode, который нужен для выбора страницы. */
export interface MappingPageCandidate {
  name: string;
  getSharedPluginData(namespace: string, key: string): string;
}

export function isMarkedMappingPage(page: MappingPageCandidate): boolean {
  return page.getSharedPluginData(MAPPING_NAMESPACE, MAPPING_PAGE_KEY) === "1";
}

/**
 * Страница маппинга среди страниц файла: сначала помеченная, иначе первая
 * с известным именем (без учёта пробелов по краям и регистра); null — нет такой.
 * Копия помеченной страницы тоже несёт метку — берём первую по порядку.
 */
export function pickMappingPage<T extends MappingPageCandidate>(pages: readonly T[]): T | null {
  const marked = pages.find(isMarkedMappingPage);
  if (marked) return marked;
  const known = new Set(KNOWN_MAPPING_PAGE_NAMES.map((name) => name.toLowerCase()));
  return pages.find((page) => known.has(page.name.trim().toLowerCase())) ?? null;
}

export function markMappingPage(page: { setSharedPluginData(namespace: string, key: string, value: string): void }): void {
  page.setSharedPluginData(MAPPING_NAMESPACE, MAPPING_PAGE_KEY, "1");
}
