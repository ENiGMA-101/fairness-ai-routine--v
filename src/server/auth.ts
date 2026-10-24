import crypto from 'node:crypto';

export interface VerifiedGoogleIdentity {
  sub: string;
  name: string;
  email?: string;
  picture?: string | null;
}

export interface VerifiedSession {
  uid: string;
  sub: string;
  name: string;
  avatar: string | null;
  csrf: string;
  iat: number;
  exp: number;
}

const SESSION_COOKIE_NAME = 'cop_session';
const OAUTH_STATE_COOKIE_NAME = 'cop_oauth_state';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

const FALLBACK_DEV_SECRET = crypto.randomBytes(32).toString('hex');

let testGoogleVerifier:
  | ((tokenOrCode: string) => Promise<VerifiedGoogleIdentity | null>)
  | null = null;

export function setTestGoogleVerifier(
  fn: ((tokenOrCode: string) => Promise<VerifiedGoogleIdentity | null>) | null
): void {
  testGoogleVerifier = fn;
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (
    secret &&
    secret.trim().length >= 16 &&
    !secret.includes('replace_with_32_byte')
  ) {
    return secret.trim();
  }
  return FALLBACK_DEV_SECRET;
}

export function isGoogleAuthConfigured(): boolean {
  if (testGoogleVerifier) return true;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  return Boolean(
    clientId &&
      clientId.trim().length > 0 &&
      !clientId.includes('your-google-client-id')
  );
}

export function getGoogleClientId(): string | null {
  if (!isGoogleAuthConfigured()) return null;
  return (process.env.GOOGLE_CLIENT_ID || '').trim() || null;
}

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(input: string): string {
  const pad = 4 - (input.length % 4);
  const normalized =
    input.replace(/-/g, '+').replace(/_/g, '/') + (pad < 4 ? '='.repeat(pad) : '');
  return Buffer.from(normalized, 'base64').toString('utf8');
}

function signData(data: string): string {
  return crypto
    .createHmac('sha256', getSessionSecret())
    .update(data)
    .digest('base64url');
}

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function createSessionToken(user: {
  uid: string;
  sub: string;
  name: string;
  avatar: string | null;
}): { token: string; session: VerifiedSession } {
  const now = Math.floor(Date.now() / 1000);
  const session: VerifiedSession = {
    uid: user.uid,
    sub: user.sub,
    name: user.name,
    avatar: user.avatar,
    csrf: crypto.randomBytes(18).toString('hex'),
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };

  const payloadB64 = base64UrlEncode(JSON.stringify(session));
  const sig = signData(payloadB64);
  return {
    token: `${payloadB64}.${sig}`,
    session,
  };
}

export function formatSessionSetCookie(
  token: string,
  isSecure = process.env.NODE_ENV === 'production'
): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ];
  if (isSecure) parts.push('Secure');
  return parts.join('; ');
}

export function formatClearSessionCookie(
  isSecure = process.env.NODE_ENV === 'production'
): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (isSecure) parts.push('Secure');
  return parts.join('; ');
}

export function parseCookies(cookieHeader?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    try {
      out[k] = decodeURIComponent(v);
    } catch {
      out[k] = v;
    }
  }
  return out;
}

export function readVerifiedSession(cookieHeader?: string): VerifiedSession | null {
  const cookies = parseCookies(cookieHeader);
  const raw = cookies[SESSION_COOKIE_NAME];
  if (!raw) return null;

  const dotIdx = raw.indexOf('.');
  if (dotIdx === -1) return null;
  const payloadB64 = raw.slice(0, dotIdx);
  const providedSig = raw.slice(dotIdx + 1);
  const expectedSig = signData(payloadB64);

  if (!safeCompare(providedSig, expectedSig)) {
    return null;
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(payloadB64)) as VerifiedSession;
    const now = Math.floor(Date.now() / 1000);
    if (!parsed.uid || !parsed.sub || !parsed.csrf || parsed.exp <= now) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function verifyCsrfToken(
  session: VerifiedSession,
  headerValue?: string | string[]
): boolean {
  const token = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  if (!token || typeof token !== 'string') return false;
  return safeCompare(token.trim(), session.csrf);
}

/**
 * Verifies a Google ID Token server-side against Google's OIDC tokeninfo endpoint.
 */
export async function verifyGoogleIdToken(
  idToken: string
): Promise<VerifiedGoogleIdentity | null> {
  if (!idToken || typeof idToken !== 'string') return null;

  if (testGoogleVerifier) {
    return testGoogleVerifier(idToken);
  }

  const clientId = getGoogleClientId();
  if (!clientId) return null;

  const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
    idToken
  )}`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) return null;

  const data = (await res.json()) as Record<string, any>;
  if (!data || !data.sub) return null;

  // Verify audience and issuer
  if (data.aud !== clientId) return null;
  if (
    data.iss !== 'accounts.google.com' &&
    data.iss !== 'https://accounts.google.com'
  ) {
    return null;
  }

  const exp = Number(data.exp);
  if (!Number.isFinite(exp) || exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  const displayName = (data.name || data.given_name || data.email || 'Pen Fighter')
    .toString()
    .trim()
    .slice(0, 60);

  return {
    sub: String(data.sub),
    name: displayName || 'Pen Fighter',
    email: data.email ? String(data.email) : undefined,
    picture: data.picture ? String(data.picture) : null,
  };
}

/**
 * Generates an OAuth 2.0 authorization URL and signed state cookie for Google Sign-In redirect flow.
 */
export function buildGoogleOAuthRedirect(redirectUri: string): {
  authUrl: string;
  stateCookie: string;
} | null {
  const clientId = getGoogleClientId();
  if (!clientId) return null;

  const stateRaw = crypto.randomBytes(16).toString('hex');
  const stateSig = signData(stateRaw);
  const signedState = `${stateRaw}.${stateSig}`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    state: signedState,
    prompt: 'select_account',
  });

  const isSecure = process.env.NODE_ENV === 'production';
  const cookieParts = [
    `${OAUTH_STATE_COOKIE_NAME}=${encodeURIComponent(signedState)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=600',
  ];
  if (isSecure) cookieParts.push('Secure');

  return {
    authUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    stateCookie: cookieParts.join('; '),
  };
}

export function verifyOAuthStateCookie(
  stateParam: string | undefined,
  cookieHeader: string | undefined
): boolean {
  if (!stateParam) return false;
  const cookies = parseCookies(cookieHeader);
  const cookieState = cookies[OAUTH_STATE_COOKIE_NAME];
  if (!cookieState || !safeCompare(stateParam, cookieState)) return false;

  const dot = stateParam.indexOf('.');
  if (dot === -1) return false;
  const raw = stateParam.slice(0, dot);
  const sig = stateParam.slice(dot + 1);
  return safeCompare(sig, signData(raw));
}

export async function exchangeGoogleCodeForIdentity(
  code: string,
  redirectUri: string
): Promise<VerifiedGoogleIdentity | null> {
  if (testGoogleVerifier) {
    return testGoogleVerifier(code);
  }

  const clientId = getGoogleClientId();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
  if (!clientId || !clientSecret) return null;

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!tokenRes.ok) return null;
  const tokenJson = (await tokenRes.json()) as { id_token?: string };
  if (!tokenJson.id_token) return null;

  return verifyGoogleIdToken(tokenJson.id_token);
}
