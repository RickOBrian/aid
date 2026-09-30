/**
 * Рабочая страница миграции. Решение Principal Designer (2026-09-29):
 * работаем на странице «AID Migration», создаём её, если её нет; исходные
 * страницы не трогаем.
 */

export const WORK_PAGE_NAME = "AID Migration";

/**
 * Страница анкеты и языка продукта (решение Б, 2026-09-30): канвас
 * показывает подробно, плагин принимает решения. Как и рабочую страницу,
 * её не собираем и не изучаем.
 */
export const LANGUAGE_PAGE_NAME = "AID · Язык продукта";

/** Служебные страницы плагина — не источники макетов. */
export function isPluginPage(name: string): boolean {
  return name === WORK_PAGE_NAME || name === LANGUAGE_PAGE_NAME;
}

export interface WorkPage {
  page: PageNode;
  /** true — страницу создали сейчас; её можно убрать, если она осталась пустой. */
  created: boolean;
}

export async function findOrCreateWorkPage(): Promise<WorkPage> {
  const existing = figma.root.children.find((p) => p.name === WORK_PAGE_NAME);
  if (existing) {
    await existing.loadAsync();
    return { page: existing, created: false };
  }
  const page = figma.createPage();
  page.name = WORK_PAGE_NAME;
  return { page, created: true };
}

/** Убрать страницу, созданную этим запуском, если на ней ничего не осталось. */
export function removeIfCreatedAndEmpty(work: WorkPage): void {
  if (work.created && work.page.children.length === 0 && figma.currentPage !== work.page) {
    work.page.remove();
  }
}
