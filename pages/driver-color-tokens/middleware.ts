/**
 * Vercel Routing Middleware — Basic Auth for Presentbook (Hobby plan).
 * Runs on Edge at deploy time; local `npm run dev` (Vite) does not execute this file.
 * @see https://vercel.com/docs/routing-middleware
 */

const BASIC_AUTH_REALM = 'Secure Area';

function unauthorized(): Response {
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${BASIC_AUTH_REALM}"`,
    },
  });
}

function parseBasicAuth(authorization: string | null): { user: string; password: string } | null {
  if (!authorization?.startsWith('Basic ')) {
    return null;
  }

  try {
    const encoded = authorization.slice('Basic '.length);
    const decoded = atob(encoded);
    const separatorIndex = decoded.indexOf(':');

    if (separatorIndex === -1) {
      return null;
    }

    return {
      user: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1),
    };
  } catch {
    return null;
  }
}

function isAuthorized(request: Request): boolean {
  const expectedUser = process.env.BASIC_AUTH_USER;
  const expectedPassword = process.env.BASIC_AUTH_PASSWORD;

  if (!expectedUser || !expectedPassword) {
    return false;
  }

  const credentials = parseBasicAuth(request.headers.get('authorization'));
  if (!credentials) {
    return false;
  }

  return credentials.user === expectedUser && credentials.password === expectedPassword;
}

export default function middleware(request: Request): Response | undefined {
  if (isAuthorized(request)) {
    return;
  }

  return unauthorized();
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
