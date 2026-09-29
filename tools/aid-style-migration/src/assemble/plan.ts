/**
 * План сборки из того, что пользователь отметил в списке: какие экраны
 * берём и какие тёмные пары оставили. Чистая функция — её видит тест.
 */

import type { AssemblePage, AssembleRow, ScanPage } from "./types";

/**
 * @param pairs тёмный id → светлый id; это итог после «разъединить» и
 *              «связать выделенные», а не только то, что нашёл скан.
 */
export function buildPlan(pages: ScanPage[], included: Set<string>, pairs: Map<string, string>): AssemblePage[] {
  const darkOf = new Map<string, string>();
  for (const [dark, light] of pairs) darkOf.set(light, dark);

  return pages
    .map((page) => {
      const rows: AssembleRow[] = [];
      for (const item of page.items) {
        if (!included.has(item.id) || pairs.has(item.id)) continue;
        if (item.kind === "image") rows.push({ imageId: item.id });
        else if (darkOf.has(item.id)) rows.push({ lightId: item.id, darkId: darkOf.get(item.id) });
        else if (item.dark) rows.push({ darkId: item.id });
        else rows.push({ lightId: item.id });
      }
      return { pageId: page.pageId, pageName: page.pageName, rows };
    })
    .filter((p) => p.rows.length > 0);
}

/** Сколько строк получится — для подписи кнопки «Собрать». */
export function rowCount(plan: AssemblePage[]): number {
  return plan.reduce((n, p) => n + p.rows.length, 0);
}
