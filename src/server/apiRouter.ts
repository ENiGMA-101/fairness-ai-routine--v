import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  buildGoogleOAuthRedirect,
  createSessionToken,
  exchangeGoogleCodeForIdentity,
  formatClearSessionCookie,
  formatSessionSetCookie,
  getGoogleClientId,
  isGoogleAuthConfigured,
  readVerifiedSession,
  verifyCsrfToken,
  verifyGoogleIdToken,
  verifyOAuthStateCookie,
} from './auth';
import { getCloudRepository, isDatabaseConfigured } from './db';
import { validateMatchSubmissionPayload, validateSavePayload } from './validation';

export interface ApiRequestInput {
  method: string;
  pathname: string;
  query?: Record<string, string | undefined>;
  headers: Record<string, string | string[] | undefined>;
  body?: any;
  ip?: string;
}

export interface ApiResponseOutput {
  status: number;
  headers?: Record<string, string | string[]>;
  body: any;
  redirectUrl?: string;
}

const MAX_BODY_BYTES = 64 * 1024; // 64 KB limit

// Simple sliding-window rate limiter per IP/key
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxRequests = 90, windowMs = 60_000): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= maxRequests;
}

export function clearRateLimitBuckets(): void {
  rateBuckets.clear();
}

function getHeaderString(
  headers: Record<string, string | string[] | undefined>,
  name: string
): string | undefined {
  const val = headers[name.toLowerCase()] ?? headers[name];
  if (Array.isArray(val)) return val.join('; ');
  return val;
}

function getRedirectUri(headers: Record<string, string | string[] | undefined>): string {
  if (
    process.env.GOOGLE_REDIRECT_URI &&
    !process.env.GOOGLE_REDIRECT_URI.includes('your-google')
  ) {
    return process.env.GOOGLE_REDIRECT_URI.trim();
  }
  const base =
    process.env.APP_URL && !process.env.APP_URL.includes('MY_APP_URL')
      ? process.env.APP_URL.replace(/\/$/, '')
      : `http://${getHeaderString(headers, 'host') || 'localhost:3000'}`;
  return `${base}/api/auth/google/callback`;
}

/**
 * Core transport-agnostic API handler for ClashOfPens cloud saves & Google authentication.
 */
export async function handleApiRequest(req: ApiRequestInput): Promise<ApiResponseOutput> {
  const method = (req.method || 'GET').toUpperCase();
  const pathname = req.pathname.replace(/\/+$/, '') || '/api';
  const ip = req.ip || getHeaderString(req.headers, 'x-forwarded-for') || 'local';

  if (!checkRateLimit(`${ip}:${pathname}`, 120, 60_000)) {
    return {
      status: 429,
      body: { error: 'Too many requests. Please wait a moment and try again.' },
    };
  }

  const cookieHeader = getHeaderString(req.headers, 'cookie');
  const session = readVerifiedSession(cookieHeader);

  try {
    // ========================================================================
    // 1. GET /api/me — Current authenticated user & server configuration status
    // ========================================================================
    if (pathname === '/api/me' && method === 'GET') {
      const dbReady = isDatabaseConfigured();
      const authReady = isGoogleAuthConfigured();

      if (!session) {
        return {
          status: 200,
          body: {
            authenticated: false,
            user: null,
            csrfToken: null,
            config: {
              googleAuthConfigured: authReady,
              googleClientId: getGoogleClientId(),
              databaseConfigured: dbReady,
            },
          },
        };
      }

      const repo = getCloudRepository();
      const dbUser = repo ? await repo.getUserById(session.uid) : null;
      if (repo && !dbUser) {
        return {
          status: 200,
          body: {
            authenticated: false,
            user: null,
            csrfToken: null,
            config: {
              googleAuthConfigured: authReady,
              googleClientId: getGoogleClientId(),
              databaseConfigured: dbReady,
            },
          },
        };
      }
      const save = repo ? await repo.getSaveByUserId(session.uid) : null;

      return {
        status: 200,
        body: {
          authenticated: true,
          user: {
            id: session.uid,
            displayName: dbUser?.displayName || session.name,
            avatarUrl: dbUser?.avatarUrl ?? session.avatar,
          },
          save,
          csrfToken: session.csrf,
          config: {
            googleAuthConfigured: authReady,
            googleClientId: getGoogleClientId(),
            databaseConfigured: dbReady,
          },
        },
      };
    }

    // ========================================================================
    // 2. GET /api/auth/google/start — Initiate Google OAuth 2.0 Redirect
    // ========================================================================
    if (pathname === '/api/auth/google/start' && method === 'GET') {
      if (!isGoogleAuthConfigured()) {
        return {
          status: 503,
          body: {
            error:
              'Google Sign-In is not configured on this server. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
            code: 'AUTH_NOT_CONFIGURED',
          },
        };
      }

      const redirectUri = getRedirectUri(req.headers);
      const redirectData = buildGoogleOAuthRedirect(redirectUri);
      if (!redirectData) {
        return {
          status: 503,
          body: { error: 'Google OAuth configuration is incomplete.' },
        };
      }

      return {
        status: 302,
        headers: {
          'Set-Cookie': redirectData.stateCookie,
          Location: redirectData.authUrl,
        },
        redirectUrl: redirectData.authUrl,
        body: { redirectUrl: redirectData.authUrl },
      };
    }

    // ========================================================================
    // 3. GET /api/auth/google/callback — Complete Google OAuth 2.0 Callback
    // ========================================================================
    if (pathname === '/api/auth/google/callback' && method === 'GET') {
      const code = req.query?.code;
      const state = req.query?.state;

      if (!code || !verifyOAuthStateCookie(state, cookieHeader)) {
        return {
          status: 400,
          body: { error: 'Invalid OAuth callback state or missing authorization code.' },
        };
      }

      const repo = getCloudRepository();
      if (!repo) {
        return {
          status: 503,
          body: {
            error: 'Neon PostgreSQL database is not configured (DATABASE_URL missing).',
            code: 'DB_NOT_CONFIGURED',
          },
        };
      }

      const redirectUri = getRedirectUri(req.headers);
      const identity = await exchangeGoogleCodeForIdentity(code, redirectUri);
      if (!identity) {
        return {
          status: 401,
          body: { error: 'Failed to verify Google identity.' },
        };
      }

      const userRecord = await repo.upsertGoogleUser({
        googleSub: identity.sub,
        displayName: identity.name,
        avatarUrl: identity.picture ?? null,
      });

      const { token } = createSessionToken({
        uid: userRecord.id,
        sub: userRecord.googleSub,
        name: userRecord.displayName,
        avatar: userRecord.avatarUrl,
      });

      const setCookie = formatSessionSetCookie(token);
      return {
        status: 302,
        headers: {
          'Set-Cookie': setCookie,
          Location: '/?auth=success',
        },
        redirectUrl: '/?auth=success',
        body: { ok: true },
      };
    }

    // ========================================================================
    // 4. POST /api/auth/google — Verify Google ID Token & Establish Session
    // ========================================================================
    if (pathname === '/api/auth/google' && method === 'POST') {
      if (!isGoogleAuthConfigured()) {
        return {
          status: 503,
          body: {
            error:
              'Google Sign-In is not configured on this server. Set GOOGLE_CLIENT_ID in environment variables.',
            code: 'AUTH_NOT_CONFIGURED',
          },
        };
      }

      const repo = getCloudRepository();
      if (!repo) {
        return {
          status: 503,
          body: {
            error:
              'Neon PostgreSQL database is not configured on this server. Set DATABASE_URL in environment variables.',
            code: 'DB_NOT_CONFIGURED',
          },
        };
      }

      const idToken = req.body?.idToken || req.body?.credential;
      if (!idToken || typeof idToken !== 'string') {
        return {
          status: 400,
          body: { error: 'Google ID token (credential) is required.' },
        };
      }

      const identity = await verifyGoogleIdToken(idToken);
      if (!identity) {
        return {
          status: 401,
          body: { error: 'Invalid or expired Google ID token.' },
        };
      }

      const userRecord = await repo.upsertGoogleUser({
        googleSub: identity.sub,
        displayName: identity.name,
        avatarUrl: identity.picture ?? null,
      });

      const { token, session: newSession } = createSessionToken({
        uid: userRecord.id,
        sub: userRecord.googleSub,
        name: userRecord.displayName,
        avatar: userRecord.avatarUrl,
      });

      return {
        status: 200,
        headers: {
          'Set-Cookie': formatSessionSetCookie(token),
        },
        body: {
          authenticated: true,
          user: {
            id: userRecord.id,
            displayName: userRecord.displayName,
            avatarUrl: userRecord.avatarUrl,
          },
          csrfToken: newSession.csrf,
        },
      };
    }

    // ========================================================================
    // 5. POST /api/auth/logout — Clear Session Cookie
    // ========================================================================
    if (pathname === '/api/auth/logout' && method === 'POST') {
      if (session) {
        const csrfHeader = getHeaderString(req.headers, 'x-csrf-token');
        if (!verifyCsrfToken(session, csrfHeader)) {
          return {
            status: 403,
            body: { error: 'Invalid or missing CSRF token.' },
          };
        }
      }

      return {
        status: 200,
        headers: {
          'Set-Cookie': formatClearSessionCookie(),
        },
        body: { ok: true, authenticated: false },
      };
    }

    // ========================================================================
    // All remaining endpoints require a verified authenticated session!
    // ========================================================================
    if (!session) {
      return {
        status: 401,
        body: { error: 'Authentication required. Please sign in with Google.' },
      };
    }

    // Enforce CSRF token on all state-changing authenticated endpoints
    if (method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH') {
      const csrfHeader = getHeaderString(req.headers, 'x-csrf-token');
      if (!verifyCsrfToken(session, csrfHeader)) {
        return {
          status: 403,
          body: { error: 'CSRF token verification failed.' },
        };
      }
    }

    const repo = getCloudRepository();
    if (!repo) {
      return {
        status: 503,
        body: {
          error:
            'Neon PostgreSQL cloud database is not configured on this server. Set DATABASE_URL.',
          code: 'DB_NOT_CONFIGURED',
        },
      };
    }

    // ========================================================================
    // 6. GET /api/save — Fetch Authenticated User's Cloud Save
    // ========================================================================
    if (pathname === '/api/save' && method === 'GET') {
      const save = await repo.getSaveByUserId(session.uid);
      return {
        status: 200,
        body: { save },
      };
    }

    // ========================================================================
    // 7. PUT /api/save — Validate & Upsert Authenticated User's Cloud Save
    // ========================================================================
    if (pathname === '/api/save' && method === 'PUT') {
      // Strictly scope to session.uid — ignore any client-supplied userId
      const validation = validateSavePayload(req.body, session.uid);
      if (!validation.valid) {
        return {
          status: 400,
          body: { error: validation.error },
        };
      }

      const result = await repo.upsertSave(validation.data);
      if (result.status === 'conflict') {
        return {
          status: 409,
          body: {
            error: 'Cloud save has a newer revision than your local copy.',
            code: 'REVISION_CONFLICT',
            serverSave: result.serverSave,
            cloudSave: result.serverSave,
          },
        };
      }

      return {
        status: 200,
        body: {
          ok: true,
          save: result.save,
        },
      };
    }

    // ========================================================================
    // 8. GET /api/matches — Fetch Authenticated User's Completed Match History
    // ========================================================================
    if (pathname === '/api/matches' && method === 'GET') {
      const limitParam = req.query?.limit ? Number(req.query.limit) : 25;
      const matches = await repo.getMatchHistory(
        session.uid,
        Number.isFinite(limitParam) ? limitParam : 25
      );
      return {
        status: 200,
        body: { matches },
      };
    }

    // ========================================================================
    // 9. POST /api/matches — Idempotently Record Completed Match & Rewards
    // ========================================================================
    if (pathname === '/api/matches' && method === 'POST') {
      const validation = validateMatchSubmissionPayload(req.body, session.uid);
      if (!validation.valid) {
        return {
          status: 400,
          body: { error: validation.error },
        };
      }

      const recorded = await repo.recordCompletedMatch(validation.data);
      return {
        status: recorded.wasDuplicate ? 200 : 201,
        body: {
          ok: true,
          wasDuplicate: recorded.wasDuplicate,
          match: recorded.match,
          save: recorded.save,
        },
      };
    }

    // ========================================================================
    // 10. DELETE /api/account — Confirmed Account & Cloud Data Deletion
    // ========================================================================
    if (pathname === '/api/account' && method === 'DELETE') {
      const confirmation = req.body?.confirmDelete || req.body?.confirm;
      if (confirmation !== 'DELETE_MY_ACCOUNT') {
        return {
          status: 400,
          body: {
            error: 'Account deletion requires explicit confirmation (confirmDelete: "DELETE_MY_ACCOUNT").',
          },
        };
      }

      await repo.deleteUserAccount(session.uid);
      return {
        status: 200,
        headers: {
          'Set-Cookie': formatClearSessionCookie(),
        },
        body: {
          ok: true,
          deleted: true,
        },
      };
    }

    return {
      status: 404,
      body: { error: `API endpoint not found: ${method} ${pathname}` },
    };
  } catch (err) {
    // Never expose raw database errors or stack traces to the browser
    console.error('[ClashOfPens API Error]:', err);
    return {
      status: 500,
      body: {
        error: 'An unexpected server error occurred. Please try again later.',
      },
    };
  }
}

/**
 * Node HTTP / Vite Connect / Vercel Serverless adapter for handleApiRequest.
 */
export async function nodeHttpApiHandler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const urlObj = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const query: Record<string, string | undefined> = {};
  urlObj.searchParams.forEach((v, k) => {
    query[k] = v;
  });

  let parsedBody: any = undefined;
  const method = (req.method || 'GET').toUpperCase();

  if (method !== 'GET' && method !== 'HEAD') {
    // Check if body already parsed by Vercel
    if ((req as any).body !== undefined) {
      parsedBody = (req as any).body;
    } else {
      try {
        const rawBody = await new Promise<string>((resolve, reject) => {
          let data = '';
          let totalBytes = 0;
          req.on('data', (chunk: Buffer) => {
            totalBytes += chunk.length;
            if (totalBytes > MAX_BODY_BYTES) {
              reject(new Error('PAYLOAD_TOO_LARGE'));
              req.destroy();
              return;
            }
            data += chunk.toString('utf8');
          });
          req.on('end', () => resolve(data));
          req.on('error', reject);
        });

        if (rawBody.trim().length > 0) {
          parsedBody = JSON.parse(rawBody);
        } else {
          parsedBody = {};
        }
      } catch (err: any) {
        if (err?.message === 'PAYLOAD_TOO_LARGE') {
          res.statusCode = 413;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'Payload too large (max 64KB).' }));
          return;
        }
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'Malformed JSON request body.' }));
        return;
      }
    }
  }

  const output = await handleApiRequest({
    method,
    pathname: urlObj.pathname,
    query,
    headers: req.headers as Record<string, string | string[] | undefined>,
    body: parsedBody,
    ip: req.socket?.remoteAddress,
  });

  res.statusCode = output.status;
  if (output.headers) {
    for (const [k, v] of Object.entries(output.headers)) {
      res.setHeader(k, v);
    }
  }
  res.setHeader('Cache-Control', 'no-store');

  if (output.status === 302 && output.redirectUrl) {
    res.end();
    return;
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(output.body));
}
