import { optionsResponse } from '../_lib/cors.js';
import { handleListChangelogs } from '../_lib/changelogRecord.js';

/** Чейнжлоги библиотек из main и их записи «Не опубликовано» — без ключа. */
export function OPTIONS(): Response {
  return optionsResponse();
}

export async function GET(request: Request): Promise<Response> {
  return handleListChangelogs(request, { fetchImpl: fetch });
}
