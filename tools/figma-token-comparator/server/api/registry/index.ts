import { optionsResponse } from '../_lib/cors.js';
import { handleGetRegistry } from '../_lib/getRegistry.js';

/** Реестр решений из main, без ключа: сервер читает GitHub своим токеном. */
export function OPTIONS(): Response {
  return optionsResponse();
}

export async function GET(request: Request): Promise<Response> {
  return handleGetRegistry(request, { fetchImpl: fetch });
}
