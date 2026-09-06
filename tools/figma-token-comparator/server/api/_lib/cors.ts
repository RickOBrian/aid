export const REGISTRY_API_CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Plugin-Secret',
};

/** @deprecated Use REGISTRY_API_CORS_HEADERS — kept for existing imports. */
export const PROPOSE_DECISION_CORS_HEADERS = REGISTRY_API_CORS_HEADERS;

export function jsonResponse(
  body: unknown,
  status: number,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...REGISTRY_API_CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

export function optionsResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: REGISTRY_API_CORS_HEADERS,
  });
}
