import {
  buildSessionSetCookieHeader,
  createSessionPayload,
  signSessionCookie,
} from './_lib/session.js';

interface LoginRequestBody {
  username?: string;
  password?: string;
}

/** Vercel Web API — named HTTP method export (default export ignores returned Response). */
export async function POST(request: Request): Promise<Response> {
  const expectedUser = process.env.BASIC_AUTH_USER;
  const expectedPassword = process.env.BASIC_AUTH_PASSWORD;
  const cookieSecret = process.env.AUTH_COOKIE_SECRET;

  if (!expectedUser || !expectedPassword || !cookieSecret) {
    return new Response(JSON.stringify({ error: 'Auth is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: LoginRequestBody;
  try {
    body = (await request.json()) as LoginRequestBody;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (body.username !== expectedUser || body.password !== expectedPassword) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const sessionCookie = await signSessionCookie(createSessionPayload(), cookieSecret);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': buildSessionSetCookieHeader(sessionCookie),
    },
  });
}
