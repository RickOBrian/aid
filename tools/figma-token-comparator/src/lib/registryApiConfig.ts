/**
 * Registry backend API — адреса эндпоинтов.
 *
 * Ключ доступа к бэкенду здесь больше не лежит. Раньше он инлайнился в
 * dist/code.js на сборке, а dist/code.js раздаётся публичным релизом — то
 * есть «секрет» мог прочитать любой, кто скачал плагин. Теперь ключ вводится
 * в настройках плагина, как токены Figma и GitHub, и хранится в clientStorage
 * конкретного пользователя (см. storage.getRegistrySecret).
 */

/**
 * Сервер реестра — Яндекс Облако (ADR-038). До 1.7.0 плагин ходил на
 * aid-registry-api.vercel.app; тот адрес работает для старых установок, пока
 * все не переимпортируют плагин, и остаётся в manifest.json до этапа 7.
 */
export const REGISTRY_API_BASE = "https://api.aidteam.pro";

/** Реестр решений из main, без ключа. */
export const REGISTRY_READ_URL = `${REGISTRY_API_BASE}/api/registry`;

export const REGISTRY_PROPOSE_URL = `${REGISTRY_API_BASE}/api/registry/propose-decision`;

/** Статусы отправленных решений: на согласовании или отклонено. */
export const REGISTRY_PROPOSAL_STATUS_URL = `${REGISTRY_API_BASE}/api/registry/proposal-status`;

export const DEFAULT_REGISTRY_OWNER = "RickOBrian";
export const DEFAULT_REGISTRY_REPO = "aid";
export const DEFAULT_REGISTRY_PATH = "decisions-registry.json";
