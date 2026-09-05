import { optionsResponse } from '../_lib/cors.js';
import { handleProposeDecision } from '../_lib/proposeDecision.js';

/** Vercel Web API — propose registry decisions via backend GitHub token. */
export function OPTIONS(): Response {
  return optionsResponse();
}

export async function POST(request: Request): Promise<Response> {
  return handleProposeDecision(request, { fetchImpl: fetch });
}
