/**
 * Vercel Routing Middleware — cookie session auth for Presentbook (Hobby plan).
 * Runs on Edge at deploy time; local `npm run dev` (Vite) does not execute this file.
 * @see https://vercel.com/docs/routing-middleware
 */

import { readSessionCookie, verifySessionCookie } from './api/_lib/session.js';

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
    // No stub here — pass through so `vercel.json`'s SPA rewrite serves
    // `index.html`, and the React app (App.tsx) renders LoginPage client-side.
    return;
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
