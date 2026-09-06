export const PROPOSE_DECISION_CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export function jsonResponse(
  body: unknown,
  status: number,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...PROPOSE_DECISION_CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

export function optionsResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: PROPOSE_DECISION_CORS_HEADERS,
  });
}
