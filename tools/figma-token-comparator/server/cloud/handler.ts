/**
 * Точка входа функции `registry-api` в Яндекс Облаке (ADR-038).
 *
 * Маршруты — те же модули, что Vercel вызывает из `api/registry/`: у каждого
 * пути свои экспорты OPTIONS / GET / POST. Новый эндпоинт добавляется в
 * `api/registry/`, сюда и в спецификацию шлюза `cloud/gateway.yaml`.
 */

import * as registry from '../api/registry/index.js';
import * as proposalStatus from '../api/registry/proposal-status.js';
import * as proposeDecision from '../api/registry/propose-decision.js';
import { jsonResponse } from '../api/_lib/cors.js';
import { eventToRequest, responseToResult, type YcHttpEvent, type YcHttpResponse } from './adapter.js';

type MethodHandler = (request: Request) => Response | Promise<Response>;
type Route = Partial<Record<'OPTIONS' | 'GET' | 'POST', MethodHandler>>;

export const ROUTES: Record<string, Route> = {
  '/api/registry': registry,
  '/api/registry/proposal-status': proposalStatus,
  '/api/registry/propose-decision': proposeDecision,
};

/** `/api/registry/` и `/api/registry` — один маршрут. */
function normalizePath(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

export async function route(request: Request): Promise<Response> {
  const methods = ROUTES[normalizePath(new URL(request.url).pathname)];
  if (!methods) return jsonResponse({ error: 'not_found' }, 404);
  const handler = methods[request.method as keyof Route];
  if (!handler) return jsonResponse({ error: 'method_not_allowed' }, 405);
  return handler(request);
}

export async function handler(event: YcHttpEvent): Promise<YcHttpResponse> {
  try {
    return await responseToResult(await route(eventToRequest(event)));
  } catch (error) {
    console.error('[registry-api] Unhandled error', error);
    return responseToResult(jsonResponse({ error: 'internal_error' }, 500));
  }
}
