import { optionsResponse } from '../_lib/cors.js';
import { handleGetRegistry } from '../_lib/getRegistry.js';

/** Vercel Web API — read decisions-registry.json from main via backend GitHub token. */
export function OPTIONS(): Response {
  return optionsResponse();
}

export async function GET(request: Request): Promise<Response> {
  return handleGetRegistry(request, { fetchImpl: fetch });
}
