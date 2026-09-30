# Live Participation

This is an additive feature on the existing v2 surveys. `src/lib/survey.ts`, canonical question wording/options, visualizations, response-table definitions and poll math are unchanged. Form 1 follows the canonical finalized question order rather than reshuffling on entry.

## Editable drafts

- Both forms save the next answer snapshot synchronously in the input event handler, using localStorage.
- Keys are scoped to the existing `fairness_browser_id`, form, and `SURVEY_VERSION`.
- Drafts include profile choices, role-specific answers, the seven time-slot ratings, the two opinion ratings, and optional feedback.
- Refreshing, navigating away or closing/reopening a form restores the editable selections.
- Draft helpers never fetch or send answers. Heartbeats contain only browser ID, session ID and page scope.
- Only the existing final Submit action calls the form's submission endpoint.
- A successful database acknowledgement (or confirmed duplicate 409) marks the existing versioned submission key and clears the corresponding draft.
- Failures preserve the draft. Configured-database failures return 503, never a false successful file-fallback submission.
- Submission markers synchronize across tabs; existing database unique indexes remain authoritative and prevent concurrent duplicate requests.

## Presence and submitted totals

- Uses the existing PostgreSQL connection through Drizzle. Compatible with Supabase PostgreSQL; no new credentials or backend service is required.
- Visible public pages heartbeat every 15 seconds. Each tab/route has an independent session token; counts use DISTINCT browser IDs, not tabs.
- Hiding/closing a page sends a best-effort leave beacon. Missing heartbeats expire after 45 seconds, even if a beacon fails. Rows older than five minutes are cleaned up on heartbeats.
- The homepage card and existing community counters automatically fetch uncached database aggregates every 4 seconds, and on focus, visibility changes and submission.
- Live users and submitted responses are separate database queries. Remaining on a visible success/results page keeps a submitted browser active; merely having submitted never creates presence.
- Only the displayed live value is clamped to at least 1. The API returns the actual count.
- “All surveys” counts unique browsers that submitted either form (a browser that completed both is counted once). “Form 01” and “Form 02” independently count distinct submitted browser IDs for that form and current survey version.
- If the database is unavailable, the UI shows a reconnecting state and retains the last acknowledged values. It does not invent submitted counts.

## Additive deployment

The existing `ensureTablesExist` initializer applies `survey_presence` and its index idempotently through Drizzle. For separately managed migrations, apply **only** `db/live-participation.sql` using your database-owner connection. There is no need to recreate or alter response tables.

The presence table has RLS enabled with no client policies, blocking direct anonymous Supabase API access to browser IDs. The trusted server/database-owner connection serves public aggregate counts. Keep `DATABASE_URL` server-side.

## Verification

- `scripts/check-live-participation.ts` runs real browser and database acceptance tests on a running production preview. Test IDs are namespaced and cleaned up in a `finally` block.
- `scripts/check-poll-math.tsx` checks existing percentage denominators, leaders, ties, rating summaries and canonical survey order.
- Run `npx next typegen`, `npm exec tsc -- --noEmit --pretty false`, and `npm run build`, followed by the platform-managed build/start/healthcheck.
