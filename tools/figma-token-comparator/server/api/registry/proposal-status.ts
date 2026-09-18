import { optionsResponse } from '../_lib/cors.js';
import { handleProposalStatus } from '../_lib/proposalStatus.js';

/** Vercel Web API — статусы отправленных решений: открыт запрос или отклонён. */
export function OPTIONS(): Response {
  return optionsResponse();
}

export async function POST(request: Request): Promise<Response> {
  return handleProposalStatus(request, { fetchImpl: fetch });
}
