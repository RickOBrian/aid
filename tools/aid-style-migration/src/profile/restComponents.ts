/**
 * Компоненты и иконки библиотеки по ссылке (этап 2c).
 *
 * /component_sets и /components — опубликованное (library_content:read);
 * /nodes?depth=1 — размеры и свойства (file_content:read).
 */

import { get, getNodes } from "./rest";
import { componentsIndexFromRest, type RestComponentEntry, type RestComponentNode } from "./restParse";
import type { ComponentsIndex } from "./types";

export async function fetchComponents(file: string, token: string, report: (title: string) => void): Promise<ComponentsIndex> {
  report("наборы компонентов");
  const sets = await get<{ meta?: { component_sets: RestComponentEntry[] } }>(
    `/files/${file}/component_sets`,
    token,
    "компонентам",
    "library_content:read",
  );
  report("компоненты");
  const comps = await get<{ meta?: { components: RestComponentEntry[] } }>(`/files/${file}/components`, token, "компонентам", "library_content:read");

  const setList = sets.meta?.component_sets ?? [];
  const compList = comps.meta?.components ?? [];
  const standaloneIds = compList.filter((c) => !c.containing_frame?.containingComponentSet?.nodeId).map((c) => c.node_id);
  // depth=1: у набора — его варианты с размерами; у одиночного — он сам.
  const nodes = await getNodes<RestComponentNode>(
    file,
    [...setList.map((s) => s.node_id), ...standaloneIds],
    token,
    (d, t) => report(`размеры и свойства ${d} из ${t}`),
    1,
  );
  return componentsIndexFromRest(setList, compList, nodes);
}
