/**
 * Запросы к Figma REST API из главного потока (manifest разрешает
 * api.figma.com). Общее для токенов, компонентов и иконок по ссылке.
 */

const API = "https://api.figma.com/v1";

export class RestError extends Error {}

function explain(status: number, what: string, scope: string, raw?: string): string {
  if (status === 401) return "Personal Access Token недействителен. Проверьте токен в «Доступ по ссылке».";
  if (status === 403) return `Нет доступа к ${what} (403). Нужен scope ${scope} у токена и доступ к файлу у его владельца.${raw ? ` Ответ: ${raw}` : ""}`;
  if (status === 404) return `Файл не найден (404): проверьте ссылку и что у владельца токена есть доступ.${raw ? ` Ответ: ${raw}` : ""}`;
  if (status === 429) return "Превышен лимит запросов Figma REST API — подождите минуту и повторите.";
  return `Ошибка Figma REST API (${status}) при чтении: ${what}.${raw ? ` ${raw}` : ""}`;
}

export async function get<T>(path: string, token: string, what: string, scope: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API}${path}`, { headers: { "X-Figma-Token": token } });
  } catch {
    throw new RestError("Не удалось связаться с api.figma.com — проверьте сеть.");
  }
  if (!response.ok) {
    let raw: string | undefined;
    try {
      const body = (await response.json()) as { message?: string; err?: string };
      raw = body.message ?? body.err;
    } catch {
      // не JSON
    }
    throw new RestError(explain(response.status, what, scope, raw));
  }
  return (await response.json()) as T;
}

/** Документы нод пачками: у /nodes ограничена длина запроса. */
export async function getNodes<T>(
  file: string,
  ids: string[],
  token: string,
  report: (done: number, total: number) => void,
  depth?: number,
): Promise<Map<string, T | undefined>> {
  const BATCH = 40;
  const out = new Map<string, T | undefined>();
  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH);
    report(Math.min(i + BATCH, ids.length), ids.length);
    const body = await get<{ nodes?: Record<string, { document?: T } | null> }>(
      `/files/${file}/nodes?ids=${batch.map(encodeURIComponent).join(",")}${depth ? `&depth=${depth}` : ""}`,
      token,
      "содержимому файла",
      "file_content:read",
    );
    for (const id of batch) out.set(id, body.nodes?.[id]?.document);
  }
  return out;
}

export async function fileName(file: string, token: string): Promise<string> {
  const { name } = await get<{ name: string }>(`/files/${file}?depth=1`, token, "файлу", "file_content:read");
  return name;
}
