/**
 * Адаптер Yandex Cloud Functions (HTTP-вызов из API Gateway) ↔ Web API.
 *
 * Обработчики портала написаны как Vercel Web API: `Request → Response`
 * (`api/*.ts`). Здесь событие функции превращается в `Request`, а `Response` —
 * в ответ функции. Сами обработчики не знают, где работают (ADR-038).
 */

export interface YcHttpEvent {
  httpMethod: string;
  url?: string;
  path?: string;
  headers?: Record<string, string>;
  multiValueHeaders?: Record<string, string[]>;
  queryStringParameters?: Record<string, string>;
  body?: string;
  isBase64Encoded?: boolean;
}

export interface YcHttpResult {
  statusCode: number;
  headers: Record<string, string>;
  multiValueHeaders: Record<string, string[]>;
  body: string;
  isBase64Encoded: boolean;
}

export function toRequest(event: YcHttpEvent): Request {
  const headers = new Headers();
  for (const [name, value] of Object.entries(event.headers ?? {})) {
    headers.set(name, value);
  }
  const host = headers.get('host') ?? 'localhost';
  const rawPath = event.url ?? event.path ?? '/';
  const url = new URL(rawPath, `https://${host}`);
  if (!rawPath.includes('?')) {
    for (const [name, value] of Object.entries(event.queryStringParameters ?? {})) {
      url.searchParams.set(name, value);
    }
  }
  const method = (event.httpMethod ?? 'GET').toUpperCase();
  const hasBody = method !== 'GET' && method !== 'HEAD' && event.body !== undefined && event.body !== '';
  const body = hasBody ? (event.isBase64Encoded ? Buffer.from(event.body!, 'base64') : event.body) : undefined;
  return new Request(url, { method, headers, body });
}

const TEXT_TYPES = /^(text\/|application\/(json|javascript|xml|manifest\+json))|\+xml|\+json/;

export async function fromResponse(response: Response): Promise<YcHttpResult> {
  const headers: Record<string, string> = {};
  const multiValueHeaders: Record<string, string[]> = {};
  response.headers.forEach((value, name) => {
    if (name !== 'set-cookie') {
      headers[name] = value;
    }
  });
  const cookies = response.headers.getSetCookie();
  if (cookies.length > 0) {
    // Несколько Set-Cookie в одном заголовке склеились бы — только multiValueHeaders.
    multiValueHeaders['Set-Cookie'] = cookies;
  }
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType === '' || TEXT_TYPES.test(contentType)) {
    return { statusCode: response.status, headers, multiValueHeaders, body: await response.text(), isBase64Encoded: false };
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  return { statusCode: response.status, headers, multiValueHeaders, body: bytes.toString('base64'), isBase64Encoded: true };
}
