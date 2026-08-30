/**
 * Vercel Routing Middleware — cookie session auth for Presentbook (Hobby plan).
 * Runs on Edge at deploy time; local `npm run dev` (Vite) does not execute this file.
 * @see https://vercel.com/docs/routing-middleware
 */

import { readSessionCookie, verifySessionCookie } from './auth/session';

const LOGIN_HTML = `<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Login — aid Presentbook</title>
  </head>
  <body>
    <h1>Login</h1>
    <p>Форма входа будет добавлена на следующем шаге.</p>
    <p>Для проверки через curl: POST /api/login с JSON {"username":"…","password":"…"}.</p>
  </body>
</html>`;

function loginPageResponse(): Response {
  return new Response(LOGIN_HTML, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

function redirectToLogin(request: Request): Response {
  return Response.redirect(new URL('/login', request.url), 302);
}

async function hasValidSession(request: Request): Promise<boolean> {
  const cookieSecret = process.env.AUTH_COOKIE_SECRET;
  if (!cookieSecret) {
    return false;
  }

  const sessionCookie = readSessionCookie(request.headers.get('cookie'));
  if (!sessionCookie) {
    return false;
  }

  const payload = await verifySessionCookie(sessionCookie, cookieSecret);
  return payload !== null;
}

export default async function middleware(request: Request): Promise<Response | undefined> {
  const { pathname } = new URL(request.url);

  if (pathname === '/api/login') {
    return;
  }

  if (pathname === '/login') {
    return loginPageResponse();
  }

  if (await hasValidSession(request)) {
    return;
  }

  return redirectToLogin(request);
}

export const config = {
  matcher: [
    /*
     * HTML/SPA routes only (/, /tokens/colors, /rider/…, etc.).
     * Skips Vite bundles (assets/ — default assetsDir, not overridden in vite.config.ts),
     * public/ copies (icons/, guides/) and files with static extensions.
     */
    '/((?!assets/|icons/|guides/|favicon\\.ico|.*\\.(?:js|css|ico|svg|png|jpe?g|gif|webp|woff2?|ttf|json|map|txt|webmanifest)$).*)',
  ],
};
