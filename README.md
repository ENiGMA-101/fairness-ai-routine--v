# Fairness-Aware AI Routine Generator — Survey Platform

Anonymous research survey for fairness-aware class-routine generation (University of Asia
Pacific). Two forms, live Facebook-style result bars, and one vote per browser.

> **Need the deployable archive?** Run `node scripts/make-zip.mjs` — it writes
> `public/fairness-app.zip`, a complete Vercel-ready project (also downloadable from the
> landing page at `/fairness-app.zip`).

## Routes

| Route | Description |
| --- | --- |
| `/` | Landing page with live response counters + ZIP download |
| `/form1` | Student & Teacher survey — 11 student questions + 7 teacher questions (exact PDF wording, Bangla + English), each with an illustration of the trade-off |
| `/form2` | Time-slot rating survey — rate 7 slots 1–5, long-gap tolerance, multi-semester fairness, free-text constraints |
| `/results/form1` | Live dashboard: distribution bars for every question |
| `/results/form2` | Live dashboard: slot ranking, averages, feedback wall |
| `/api/health` | Healthcheck (`select 1`) |
| `/api/form1/submit`, `/api/form2/submit` | Write a response (duplicate browser IDs return `409`) |
| `/api/form1/stats?question=q_avoid`, `/api/form2/stats?question=time_slot_8_00` | Live percentage bars |
| `/api/form1/results`, `/api/form2/results` | Full aggregate JSON |

## Stack

- Next.js (App Router) + React + Tailwind CSS
- PostgreSQL via Drizzle ORM (`src/db/schema.ts`)
- No auth: responses are anonymous. Duplicate protection = `localStorage` browser ID
  **plus** a `unique` constraint on `browser_id` in the database.

## Local development

```bash
npm install
cp .env.example .env         # point DATABASE_URL at your Postgres
psql "$DATABASE_URL" -f db/init.sql   # or: npx drizzle-kit push
npm run dev
```

## Deploying to Vercel (30 seconds)

1. Unzip `fairness-app.zip` (or push this repo to GitHub).
2. Create a Postgres database — Neon, Supabase, Railway, or Vercel Postgres all work.
3. Run `db/init.sql` against it (Supabase → SQL editor, Neon → SQL editor, or
   `psql "$DATABASE_URL" -f db/init.sql`).
4. Vercel → **Add New… → Project** → import the folder/repo.
5. Add the environment variable `DATABASE_URL` (Production + Preview).
6. Deploy. Done — no other configuration is required.

See `DEPLOY.md` for a step-by-step walkthrough with screenshots-level detail.

## Data model

`form1_responses` — one row per browser: role, department, semester, and 18 preference
columns (`q_avoid`, `q_weekly_off`, `q_between_classes`, `q_extra_time`, `q_long_gap`,
`q_midday_break`, `q_max_hours`, `q_lab_cap`, `q_priority_group`, `q_conflict_student`,
`q_teaching_schedule`, `q_zero_day`, `q_consecutive`, `q_gap_pref`, `q_faculty_conflict`,
`q_compensate`, `q_conflict_teacher`).

`form2_responses` — one row per browser: 7 slot ratings (1–5), `long_gap_rating`,
`fairness_rating`, and free-text `feedback`.

Question wording, option values, and illustrations live in `src/lib/survey.ts` — edit that
one file to change both the forms and the results dashboards.
