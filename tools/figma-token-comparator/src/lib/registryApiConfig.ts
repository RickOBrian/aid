/**
 * Registry backend API — адреса эндпоинтов.
 *
 * Ключ доступа к бэкенду здесь больше не лежит. Раньше он инлайнился в
 * dist/code.js на сборке, а dist/code.js раздаётся публичным релизом — то
 * есть «секрет» мог прочитать любой, кто скачал плагин. Теперь ключ вводится
 * в настройках плагина, как токены Figma и GitHub, и хранится в clientStorage
 * конкретного пользователя (см. storage.getRegistrySecret).
 */

export const REGISTRY_PROPOSE_URL =
  "https://aid-registry-api.vercel.app/api/registry/propose-decision";

export const DEFAULT_REGISTRY_OWNER = "RickOBrian";
export const DEFAULT_REGISTRY_REPO = "aid";
export const DEFAULT_REGISTRY_PATH = "decisions-registry.json";
