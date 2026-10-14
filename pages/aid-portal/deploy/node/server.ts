/**
 * Временный Node-сервер API Presentbook для зеркала вне Яндекс Облака
 * (AID-18, сбой Облака 2026-10-14). Не замена ADR-038: зеркало разовое,
 * в `main` не мержится.
 *
 * nginx отдаёт статику из `dist/`, а `/api/*` проксирует сюда. Обработчики —
 * те же `api/*.ts` через `route()` функции Облака, без правок. Без IAM-токена
 * Облака `/api/ttm` и `/api/tasks` отвечают 503 — закрытые данные зеркало не
 * отдаёт.
 *
 * Переменные: PORT (по умолчанию 8787), BASIC_AUTH_USER, BASIC_AUTH_PASSWORD,
 * AUTH_COOKIE_SECRET (вводит PD на сервере, в файл окружения systemd),
 * GITHUB_RELEASES_TOKEN — необязательна.
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { route } from '../yc/handler';

const PORT = Number(process.env.PORT ?? 8787);
const MAX_BODY = 64 * 1024;

async function readBody(req: IncomingMessage): Promise<Buffer | undefined> {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return undefined;
  }
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY) {
      throw new Error('body too large');
    }
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks);
}

function toRequest(req: IncomingMessage, body: Buffer | undefined): Request {
  // За nginx: схема и хост — из заголовков прокси.
  const proto = (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0] ?? 'http';
  const host = (req.headers['x-forwarded-host'] as string | undefined) ?? req.headers.host ?? 'localhost';
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(name, item));
    } else if (value !== undefined) {
      headers.set(name, value);
    }
  }
  return new Request(`${proto}://${host}${req.url ?? '/'}`, { method: req.method, headers, body: body ? new Uint8Array(body) : undefined });
}

async function send(res: ServerResponse, response: Response): Promise<void> {
  const setCookies = response.headers.getSetCookie();
  response.headers.forEach((value, name) => {
    if (name !== 'set-cookie') {
      res.setHeader(name, value);
    }
  });
  if (setCookies.length > 0) {
    res.setHeader('set-cookie', setCookies);
  }
  res.statusCode = response.status;
  res.end(Buffer.from(await response.arrayBuffer()));
}

const server = createServer((req, res) => {
  void (async () => {
    try {
      if (!req.url?.startsWith('/api/')) {
        res.statusCode = 404;
        res.end();
        return;
      }
      await send(res, await route(toRequest(req, await readBody(req))));
    } catch (error) {
      // Только тип ошибки: тело запроса (пароль входа) в журнал не попадает.
      console.error(`presentbook-api: ${(error as Error).name}`);
      res.statusCode = 500;
      res.end();
    }
  })();
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`presentbook-api: 127.0.0.1:${PORT}`);
});
