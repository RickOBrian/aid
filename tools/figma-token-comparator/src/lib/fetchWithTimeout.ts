/**
 * fetch с пределом ожидания — для всех запросов к реестру решений.
 *
 * Без предела подвисшее соединение держит «Загрузка реестра…» или кнопку
 * отправки бесконечно: так было в Figma у Principal Designer 2026-10-08,
 * когда raw.githubusercontent.com не отвечал. Сам запрос по таймауту не
 * отменяется (fetch в песочнице плагина не принимает AbortSignal), его
 * результат просто больше не ждут.
 */

/** Сколько ждать сервер реестра. Холодный старт функции в Облаке — до ~4 с. */
export const REGISTRY_TIMEOUT_MS = 15_000;

export class FetchTimeoutError extends Error {
  constructor(readonly url: string) {
    super(`Request timed out: ${url}`);
    this.name = "FetchTimeoutError";
  }
}

export function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs: number = REGISTRY_TIMEOUT_MS
): Promise<Response> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new FetchTimeoutError(url)), timeoutMs);
  });
  return Promise.race([fetch(url, init), timeout]).finally(() => clearTimeout(timer));
}
