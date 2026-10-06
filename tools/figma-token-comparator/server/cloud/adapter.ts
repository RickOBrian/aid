/**
 * Яндекс Cloud Functions ↔ Web API (ADR-038).
 *
 * Обработчики в `api/` написаны под Web API: принимают Request, отдают
 * Response. Vercel вызывает их как есть, а Cloud Functions за API Gateway
 * присылает событие и ждёт объект ответа. Этот файл — единственное место,
 * где одно превращается в другое; обработчики и их тесты не меняются.
 */

/** HTTP-событие API Gateway → Cloud Functions (формат по умолчанию). */
export interface YcHttpEvent {
  httpMethod: string;
  path?: string;
  url?: string;
  headers?: Record<string, string>;
  multiValueHeaders?: Record<string, string[]>;
  queryStringParameters?: Record<string, string>;
  body?: string;
  isBase64Encoded?: boolean;
}

export interface YcHttpResponse {
  statusCode: number;
  headers: Record<string, string>;
  multiValueHeaders: Record<string, string[]>;
  body: string;
  isBase64Encoded: boolean;
}

/** Хост запроса — для абсолютного URL, который требует конструктор Request. */
function hostOf(headers: Headers): string {
  return headers.get('host') ?? 'localhost';
}

function readHeaders(event: YcHttpEvent): Headers {
  const headers = new Headers();
  for (const [name, values] of Object.entries(event.multiValueHeaders ?? {})) {
    for (const value of values) headers.append(name, value);
  }
  // Одиночные заголовки дублируют multiValueHeaders; берём их, только если
  // такого заголовка ещё нет, иначе значения задвоятся.
  for (const [name, value] of Object.entries(event.headers ?? {})) {
    if (!headers.has(name)) headers.set(name, value);
  }
  return headers;
}

/** Путь с query: `url` уже содержит строку запроса, `path` — нет. */
function pathWithQuery(event: YcHttpEvent): string {
  if (event.url) return event.url;
  const path = event.path ?? '/';
  const query = new URLSearchParams(event.queryStringParameters ?? {}).toString();
  return query ? `${path}?${query}` : path;
}

export function eventToRequest(event: YcHttpEvent): Request {
  const method = event.httpMethod.toUpperCase();
  const headers = readHeaders(event);
  const url = new URL(pathWithQuery(event), `https://${hostOf(headers)}`);

  const hasBody = method !== 'GET' && method !== 'HEAD' && event.body !== undefined && event.body !== '';
  const body = hasBody
    ? event.isBase64Encoded
      ? Buffer.from(event.body as string, 'base64')
      : (event.body as string)
    : undefined;

  return new Request(url, { method, headers, body });
}

/** Ответы API — JSON или пустые, поэтому тело всегда текст. */
export async function responseToResult(response: Response): Promise<YcHttpResponse> {
  const headers: Record<string, string> = {};
  const multiValueHeaders: Record<string, string[]> = {};
  response.headers.forEach((value, name) => {
    headers[name] = value;
    multiValueHeaders[name] = [value];
  });
  return {
    statusCode: response.status,
    headers,
    multiValueHeaders,
    body: await response.text(),
    isBase64Encoded: false,
  };
}
