import { optionsResponse } from '../_lib/cors.js';
import { handleRecordChangelog } from '../_lib/changelogRecord.js';

/** «Записать изменения» из плагина: запись «Не опубликовано» → PR с чейнжлогом. */
export function OPTIONS(): Response {
  return optionsResponse();
}

export async function POST(request: Request): Promise<Response> {
  return handleRecordChangelog(request, { fetchImpl: fetch });
}
