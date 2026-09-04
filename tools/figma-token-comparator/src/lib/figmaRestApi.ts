/**
 * Обёртка над Figma REST API для чтения переменных эталонной библиотеки.
 *
 * GET https://api.figma.com/v1/files/:file_key/variables/local
 *
 * Выполняется из главного потока плагина (code.ts), а не из UI iframe —
 * именно поэтому manifest.json объявляет networkAccess.allowedDomains
 * с api.figma.com: без этого fetch из плагина будет заблокирован.
 */

import { rgbToHex } from "./colorUtils";
import { parseFigmaFileKey } from "./figmaUrl";
import type { LibraryToken, LibraryTokenModeValue } from "../comparators/types";

const API_BASE = "https://api.figma.com/v1";

/** Ошибка запроса к REST API с понятным для пользователя сообщением. */
export class FigmaRestApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "FigmaRestApiError";
  }
}

interface RawColorValue {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface RawVariableAlias {
  type: "VARIABLE_ALIAS";
  id: string;
}

type RawVariableValue = RawColorValue | RawVariableAlias | number | string | boolean;

interface RawVariable {
  id: string;
  name: string;
  key: string;
  variableCollectionId: string;
  resolvedType: string;
  valuesByMode: Record<string, RawVariableValue>;
  /** true — переменная из другой (внешней) библиотеки, использованная внутри файла. */
  remote: boolean;
  hiddenFromPublishing?: boolean;
  deletedButReferenced?: boolean;
  /**
   * Где разрешено использовать переменную (STROKE_COLOR, TEXT_FILL,
   * FRAME_FILL, SHAPE_FILL, ALL_FILLS, EFFECT_COLOR, ALL_SCOPES).
   * Используется для scope-based tie-break в colorComparator.ts.
   */
  scopes?: string[];
}

interface RawVariableCollectionMode {
  modeId: string;
  name: string;
}

interface RawVariableCollection {
  id: string;
  name: string;
  key: string;
  modes: RawVariableCollectionMode[];
  defaultModeId: string;
  remote: boolean;
}

interface RawVariablesResponse {
  status: number;
  error: boolean;
  message?: string;
  meta?: {
    variables: Record<string, RawVariable>;
    variableCollections: Record<string, RawVariableCollection>;
  };
}

function isColorValue(value: RawVariableValue): value is RawColorValue {
  return (
    typeof value === "object" &&
    value !== null &&
    "r" in value &&
    "g" in value &&
    "b" in value &&
    "a" in value
  );
}

function isVariableAlias(value: RawVariableValue): value is RawVariableAlias {
  return typeof value === "object" && value !== null && (value as RawVariableAlias).type === "VARIABLE_ALIAS";
}

/**
 * Резолвит значение переменной в конкретном режиме, следуя по цепочке
 * VARIABLE_ALIAS (частый паттерн: semantic-токен ссылается на core-токен,
 * иногда в другой коллекции). Защищена от циклов через visited-set.
 */
function resolveColorInMode(
  variables: Record<string, RawVariable>,
  variable: RawVariable,
  modeId: string,
  visited: Set<string> = new Set()
): RawColorValue | null {
  if (visited.has(variable.id)) return null; // защита от циклической ссылки
  visited.add(variable.id);

  const raw = variable.valuesByMode[modeId];
  if (raw === undefined) return null;

  if (isColorValue(raw)) return raw;

  if (isVariableAlias(raw)) {
    const target = variables[raw.id];
    if (!target) return null;
    // Алиас может указывать на переменную с другим набором режимов —
    // при отсутствии modeId в target используем его дефолтный режим
    // на уровне вызывающего кода (см. fetchLibraryColorVariables).
    const targetModeValue = target.valuesByMode[modeId] ?? Object.values(target.valuesByMode)[0];
    if (targetModeValue === undefined) return null;
    if (isColorValue(targetModeValue)) return targetModeValue;
    if (isVariableAlias(targetModeValue)) {
      return resolveColorInMode(variables, target, modeId, visited);
    }
  }

  return null;
}

function buildErrorMessage(status: number, rawMessage?: string): string {
  if (status === 401 || status === 403) {
    return "Personal Access Token недействителен или не имеет доступа к этому файлу библиотеки. Проверьте токен в настройках.";
  }
  if (status === 404) {
    return [
      "Файл библиотеки не найден (404). Проверьте:",
      "• file key: ouP1hUC4YjVRpfgdvzy3FA — только ключ или полный URL (плагин извлечёт ключ сам);",
      "• PAT создан под тем же аккаунтом, у которого есть доступ к файлу в команде;",
      "• у токена включён scope file_variables:read (Settings → Security → Personal access tokens).",
      rawMessage ? `Ответ API: ${rawMessage}` : "",
    ]
      .filter(Boolean)
      .join(" ");
  }
  if (status === 429) {
    return "Превышен лимит запросов к Figma REST API (rate limit). Подождите минуту и нажмите «Обновить библиотеку» ещё раз.";
  }
  return `Ошибка запроса к Figma REST API (${status})${rawMessage ? `: ${rawMessage}` : "."}`;
}

/**
 * Человекочитаемое имя Figma-файла по file_key.
 * При ошибке или недостаточном scope PAT возвращает fileKey как fallback.
 */
export async function fetchFigmaFileName(fileKey: string, token: string): Promise<string> {
  if (!fileKey.trim() || !token.trim()) return fileKey;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/files/${encodeURIComponent(fileKey)}?depth=1`, {
      method: "GET",
      headers: { "X-Figma-Token": token },
    });
  } catch {
    return fileKey;
  }

  if (!response.ok) return fileKey;

  try {
    const body = (await response.json()) as { name?: string };
    const name = body.name?.trim();
    return name || fileKey;
  } catch {
    return fileKey;
  }
}

/**
 * Загружает все COLOR-переменные библиотеки и возвращает их в
 * нормализованном виде: одна запись на переменную, со всеми режимами и
 * их resolved hex-значениями.
 */
export async function fetchLibraryColorVariables(
  fileKeyOrUrl: string,
  token: string
): Promise<LibraryToken[]> {
  const fileKey = parseFigmaFileKey(fileKeyOrUrl);
  if (!fileKey.trim()) {
    throw new FigmaRestApiError("Не указан file_key библиотечного файла.");
  }
  if (!token.trim()) {
    throw new FigmaRestApiError("Не указан Personal Access Token.");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/files/${encodeURIComponent(fileKey)}/variables/local`, {
      method: "GET",
      headers: { "X-Figma-Token": token },
    });
  } catch (networkError) {
    throw new FigmaRestApiError(
      "Не удалось связаться с api.figma.com. Проверьте подключение к сети."
    );
  }

  if (!response.ok) {
    let message: string | undefined;
    try {
      const errorBody = (await response.json()) as { message?: string };
      message = errorBody.message;
    } catch {
      // тело ответа не JSON — используем только статус
    }
    throw new FigmaRestApiError(buildErrorMessage(response.status, message), response.status);
  }

  let body: RawVariablesResponse;
  try {
    body = (await response.json()) as RawVariablesResponse;
  } catch {
    throw new FigmaRestApiError("Ответ Figma REST API не является валидным JSON.");
  }

  if (body.error || !body.meta) {
    throw new FigmaRestApiError(
      buildErrorMessage(body.status ?? response.status, body.message)
    );
  }

  const { variables, variableCollections } = body.meta;
  const result: LibraryToken[] = [];

  for (const variable of Object.values(variables)) {
    if (variable.resolvedType !== "COLOR") continue;
    if (variable.deletedButReferenced) continue;
    // /variables/local отдаёт не только локальные переменные выбранного файла,
    // но и remote-переменные из ДРУГИХ библиотек, которые эта библиотека сама
    // потребляет (Figma REST API docs: "remote variables used in the file").
    // Такие записи не относятся к выбранной пользователем библиотеке и не
    // должны попадать в "Предлагаем" — пропускаем их как самостоятельные
    // токены. Для резолва алиасов (resolveColorInMode) полная карта
    // `variables` используется как есть, без этого фильтра.
    if (variable.remote) continue;

    const collection = variableCollections[variable.variableCollectionId];
    if (!collection) continue;

    const modes: LibraryTokenModeValue[] = [];
    for (const mode of collection.modes) {
      const resolved = resolveColorInMode(variables, variable, mode.modeId);
      if (!resolved) {
        // Известное ограничение REST API: переменная ссылается алиасом на
        // переменную из ДРУГОГО библиотечного файла — /variables/local
        // отдаёт только локальные переменные текущего файла, такая ссылка
        // не резолвится. Не выбрасываем токен целиком: имя должно остаться
        // доступным для name-match/conflict проверки в comparator'е, иначе
        // расхождение по имени (и другому оттенку) молча теряется и строка
        // ошибочно попадает в "Layout only" / "нет совпадения".
        modes.push({
          modeId: mode.modeId,
          modeName: mode.name,
          displayValue: "значение не получено (внешняя ссылка)",
          comparisonValue: {},
          unresolved: true,
        });
        continue;
      }
      const hex = rgbToHex(resolved.r, resolved.g, resolved.b);
      const alphaPercent = Math.round(resolved.a * 100);
      const displayValue = alphaPercent >= 100 ? hex : `${hex} @ ${alphaPercent}%`;
      modes.push({
        modeId: mode.modeId,
        modeName: mode.name,
        displayValue,
        comparisonValue: { hex, alpha: resolved.a },
      });
    }

    if (modes.length === 0) continue;

    result.push({
      variableId: variable.id,
      key: variable.key,
      name: variable.name,
      collectionId: collection.id,
      collectionName: collection.name,
      resolvedType: variable.resolvedType,
      modes,
      scopes: variable.scopes ?? [],
    });
  }

  return result;
}
