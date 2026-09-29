/**
 * Токены и стили библиотеки по ссылке (этап 2c).
 *
 * Scopes: /variables/local — file_variables:read (только Enterprise);
 * /styles — library_content:read; /nodes — file_content:read.
 */

import { get, getNodes, RestError } from "./rest";
import { tokensIndexFromRest, type RestStyleEntry, type RestStyleNode, type RestVariablesMeta } from "./restParse";
import type { TokensIndex } from "./types";

export interface RestTokens {
  index: TokensIndex;
  /** Переменные не отдались (например, нет scope) — стили при этом прочитаны. */
  variablesError?: string;
}

const EMPTY_META: RestVariablesMeta = { variables: {}, variableCollections: {} };

export async function fetchTokens(file: string, token: string, report: (title: string) => void): Promise<RestTokens> {
  report("переменные");
  let meta = EMPTY_META;
  let variablesError: string | undefined;
  try {
    const vars = await get<{ meta?: RestVariablesMeta }>(`/files/${file}/variables/local`, token, "переменным", "file_variables:read");
    if (vars.meta) meta = vars.meta;
    else variablesError = "Figma REST API не вернул переменные файла.";
  } catch (e) {
    if (!(e instanceof RestError)) throw e;
    variablesError = e.message;
  }

  report("стили");
  const styles = await get<{ meta?: { styles: RestStyleEntry[] } }>(`/files/${file}/styles`, token, "стилям", "library_content:read");
  const wanted = (styles.meta?.styles ?? []).filter((s) => s.style_type === "TEXT" || s.style_type === "EFFECT");
  const nodes = await getNodes<RestStyleNode>(file, wanted.map((s) => s.node_id), token, (d, t) => report(`свойства стилей ${d} из ${t}`));

  return { index: tokensIndexFromRest(meta, wanted, nodes), variablesError };
}
