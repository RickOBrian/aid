export const SESSION_COOKIE_NAME = 'session';
export const SESSION_MAX_AGE_SEC = 604800;

export interface SessionPayload {
  authorized: true;
  exp: number;
}

function base64urlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding =
    normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  const binary = atob(normalized + padding);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export function createSessionPayload(): SessionPayload {
  return {
    authorized: true,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC,
  };
}

export async function signSessionCookie(
  payload: SessionPayload,
  secret: string,
): Promise<string> {
  const payloadBase64 = base64urlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payloadBase64),
  );

  return `${payloadBase64}.${base64urlEncode(new Uint8Array(signature))}`;
}

export async function verifySessionCookie(
  cookieValue: string,
  secret: string,
): Promise<SessionPayload | null> {
  const separatorIndex = cookieValue.lastIndexOf('.');
  if (separatorIndex === -1) {
    return null;
  }

  const payloadBase64 = cookieValue.slice(0, separatorIndex);
  const signatureBase64 = cookieValue.slice(separatorIndex + 1);

  try {
    const key = await importHmacKey(secret);
    const signatureBytes = base64urlDecode(signatureBase64);
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes.buffer.slice(
        signatureBytes.byteOffset,
        signatureBytes.byteOffset + signatureBytes.byteLength,
      ),
      new TextEncoder().encode(payloadBase64),
    );

    if (!isValid) {
      return null;
    }

    const payload = JSON.parse(
      new TextDecoder().decode(base64urlDecode(payloadBase64)),
    ) as SessionPayload;

    if (payload.authorized !== true || typeof payload.exp !== 'number') {
      return null;
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function readSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(';')) {
    const trimmed = part.trim();
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const name = trimmed.slice(0, separatorIndex);
    if (name === SESSION_COOKIE_NAME) {
      return trimmed.slice(separatorIndex + 1);
    }
  }

  return null;
}

export function buildSessionSetCookieHeader(cookieValue: string): string {
  return `${SESSION_COOKIE_NAME}=${cookieValue}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_MAX_AGE_SEC}`;
}
