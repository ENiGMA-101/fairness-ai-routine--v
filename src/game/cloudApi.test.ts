import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSaveApiPayload,
  evaluateSyncComparison,
  formatSyncStatusLabel,
  mergeLocalAndCloudProgress,
} from './cloudSync';
import { INITIAL_PROGRESS } from './storage';
import { DEFAULT_SETTINGS } from './constants';
import { InMemoryCloudRepository, setTestCloudRepository } from '../server/db';
import { setTestGoogleVerifier } from '../server/auth';
import { handleApiRequest } from '../server/apiRouter';

test('formatSyncStatusLabel returns exact required status labels', () => {
  assert.equal(formatSyncStatusLabel('saved'), 'Saved');
  assert.equal(formatSyncStatusLabel('syncing'), 'Syncing');
  assert.equal(formatSyncStatusLabel('offline'), 'Offline — saved on this device');
  assert.equal(formatSyncStatusLabel('error'), 'Sync failed — Retry');
});

test('evaluateSyncComparison and mergeLocalAndCloudProgress handle local, cloud, and divergent progress cleanly', () => {
  const localProg = {
    ...INITIAL_PROGRESS,
    coins: 520,
    xp: 350,
    matchesPlayed: 4,
    matchesWon: 3,
    unlockedSkins: ['matador_pinpoint', 'matador_alltime', 'matador_iteen'],
  };

  // 1. Empty cloud save -> push_local
  assert.equal(evaluateSyncComparison(localProg, null, null), 'push_local');

  // 2. Divergent cloud save with different unlocked pens and higher coins -> conflict
  const cloudRecord = {
    userId: 'u_1',
    saveVersion: 3,
    revision: 4,
     level: 2,
    coins: 890,
    xp: 200,
    equippedPenId: 'matador_alltime',
    selectedTableId: 'school_bench',
    unlockedPens: ['matador_pinpoint', 'matador_alltime', 'ember_flame'],
    unlockedTables: ['school_bench'],
    challengeProgress: {
      completedChallenges: ['ch_one_shot'],
      championshipTrophies: 1,
      matchesPlayed: 6,
      matchesWon: 4,
      knockoutsCount: 8,
      trickShotsCount: 1,
      lastDailyDate: '2026-10-24',
      dailyStreak: 2,
      equippedArena: 'classic',
    },
    settings: DEFAULT_SETTINGS,
    achievements: [{ key: 'first_win', unlockedAt: new Date().toISOString() }],
    updatedAt: new Date().toISOString(),
  };

  assert.equal(evaluateSyncComparison(localProg, 2, cloudRecord), 'conflict');

  // 3. Smart merge combines unlocked pens, completed challenges, and max stats without data loss
  const merged = mergeLocalAndCloudProgress(localProg, DEFAULT_SETTINGS, cloudRecord);
  assert.equal(merged.progress.coins, 890);
  assert.equal(merged.progress.xp, 350);
  assert.equal(merged.progress.matchesPlayed, 6);
  assert.equal(merged.progress.championshipTrophies, 1);
  assert.ok(merged.progress.unlockedSkins.includes('matador_iteen'));
  assert.ok(merged.progress.unlockedSkins.includes('ember_flame'));
  assert.ok(merged.progress.completedChallenges.includes('ch_one_shot'));
});

test('Server API endpoints enforce auth, CSRF, schema validation, optimistic concurrency, idempotent match rewards, and account deletion', async () => {
  const memRepo = new InMemoryCloudRepository();
  setTestCloudRepository(memRepo);
  setTestGoogleVerifier(async (token) => {
    if (token === 'valid_google_token') {
      return {
        sub: 'google_sub_12345',
        name: 'Arafat Hossain',
        picture: 'https://example.com/avatar.png',
      };
    }
    return null;
  });

  // 1. Unauthenticated requests to protected endpoints return 401
  const unauthSave = await handleApiRequest({
    method: 'PUT',
    pathname: '/api/save',
    headers: {},
    body: {},
  });
  assert.equal(unauthSave.status, 401);

  // 2. Sign in via POST /api/auth/google
  const loginRes = await handleApiRequest({
    method: 'POST',
    pathname: '/api/auth/google',
    headers: {},
    body: { credential: 'valid_google_token' },
  });
  assert.equal(loginRes.status, 200);
  assert.equal(loginRes.body.authenticated, true);
  assert.equal(loginRes.body.user.displayName, 'Arafat Hossain');
  const csrfToken = loginRes.body.csrfToken;
  assert.ok(csrfToken);

  const rawSetCookie = loginRes.headers?.['Set-Cookie'];
  const setCookieHeader = Array.isArray(rawSetCookie)
    ? rawSetCookie[0]
    : rawSetCookie || '';
  const sessionCookie = setCookieHeader.split(';')[0];
  assert.ok(sessionCookie.startsWith('cop_session='));

  // 3. Reject mutating request without CSRF token (403)
  const missingCsrfRes = await handleApiRequest({
    method: 'PUT',
    pathname: '/api/save',
    headers: { cookie: sessionCookie },
    body: buildSaveApiPayload(INITIAL_PROGRESS, DEFAULT_SETTINGS, 'school_bench'),
  });
  assert.equal(missingCsrfRes.status, 403);

  // 4. Reject invalid payload with negative coins or unknown pen ID (400)
  const invalidSaveRes = await handleApiRequest({
    method: 'PUT',
    pathname: '/api/save',
    headers: {
      cookie: sessionCookie,
      'x-csrf-token': csrfToken,
    },
    body: {
      ...buildSaveApiPayload(INITIAL_PROGRESS, DEFAULT_SETTINGS, 'school_bench'),
      coins: -500,
    },
  });
  assert.equal(invalidSaveRes.status, 400);

  // 5. Valid PUT /api/save increments revision and persists progress
  const updatedLocal = {
    ...INITIAL_PROGRESS,
    coins: 450,
    xp: 200,
    matchesPlayed: 2,
    matchesWon: 2,
  };
  const validSaveRes = await handleApiRequest({
    method: 'PUT',
    pathname: '/api/save',
    headers: {
      cookie: sessionCookie,
      'x-csrf-token': csrfToken,
    },
    body: buildSaveApiPayload(updatedLocal, DEFAULT_SETTINGS, 'school_bench', 1),
  });
  assert.equal(validSaveRes.status, 200);
  assert.equal(validSaveRes.body.save.revision, 2);
  assert.equal(validSaveRes.body.save.coins, 450);

  // 6. Stale expectedRevision triggers 409 Conflict
  const staleSaveRes = await handleApiRequest({
    method: 'PUT',
    pathname: '/api/save',
    headers: {
      cookie: sessionCookie,
      'x-csrf-token': csrfToken,
    },
    body: buildSaveApiPayload(
      { ...updatedLocal, coins: 600 },
      DEFAULT_SETTINGS,
      'school_bench',
      1 // stale! current is 2
    ),
  });
  assert.equal(staleSaveRes.status, 409);

  // 7. Idempotent POST /api/matches records match once and prevents duplicate rewards on retry
  const matchPayload = {
    idempotencyKey: 'match_unique_key_001',
    matchMode: 'ai_battle',
    result: 'win',
    opponentType: 'bot',
    opponentName: 'Backbench Boss',
    shotsTaken: 4,
    knockouts: 1,
    durationSeconds: 32,
    coinsAwarded: 80,
    xpAwarded: 85,
  };

  const matchRes1 = await handleApiRequest({
    method: 'POST',
    pathname: '/api/matches',
    headers: {
      cookie: sessionCookie,
      'x-csrf-token': csrfToken,
    },
    body: matchPayload,
  });
  assert.equal(matchRes1.status, 201);
  assert.equal(matchRes1.body.wasDuplicate, false);
  const coinsAfterFirst = matchRes1.body.save.coins;
  assert.equal(coinsAfterFirst, 450 + 80);

  // Replay exact same match idempotencyKey -> must NOT add 80 coins again
  const matchRes2 = await handleApiRequest({
    method: 'POST',
    pathname: '/api/matches',
    headers: {
      cookie: sessionCookie,
      'x-csrf-token': csrfToken,
    },
    body: matchPayload,
  });
  assert.equal(matchRes2.status, 200);
  assert.equal(matchRes2.body.wasDuplicate, true);
  assert.equal(matchRes2.body.save.coins, coinsAfterFirst);

  // 8. Account deletion requires confirmation and deletes all cloud records
  const unconfirmedDel = await handleApiRequest({
    method: 'DELETE',
    pathname: '/api/account',
    headers: {
      cookie: sessionCookie,
      'x-csrf-token': csrfToken,
    },
    body: { confirmDelete: 'WRONG' },
  });
  assert.equal(unconfirmedDel.status, 400);

  const confirmedDel = await handleApiRequest({
    method: 'DELETE',
    pathname: '/api/account',
    headers: {
      cookie: sessionCookie,
      'x-csrf-token': csrfToken,
    },
    body: { confirmDelete: 'DELETE_MY_ACCOUNT' },
  });
  assert.equal(confirmedDel.status, 200);
  assert.equal(confirmedDel.body.deleted, true);

  // Verify user no longer exists in repository
  const meAfterDel = await handleApiRequest({
    method: 'GET',
    pathname: '/api/me',
    headers: { cookie: sessionCookie },
  });
  assert.equal(meAfterDel.body.authenticated, false);

  setTestGoogleVerifier(null);
  setTestCloudRepository(null);
});
