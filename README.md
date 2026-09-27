# Fairness-Aware AI Routine Generator

A bilingual university research survey built with Next.js App Router, Tailwind and PostgreSQL (Drizzle ORM). Students and teachers share anonymous timetable preferences and rate seven daily time slots.

## Public experience

- **`/`**: research topic, immediate access to both surveys, live response counters and aggregate insights.
- **`/form1`**: original bilingual questions and diagrams, with role, department and semester fixed; the remaining Student/Teacher questions shuffle independently on each visit. Survey option buttons sort by their live percentage. Clicking one reveals all options' current counts and percentages; changing an answer never casts a vote.
- **`/form2`**: the same seven time-slot rows and 1–5 ratings with live, sorted answer choices; each selected slot/question reveals all its valid submitted results.
- **`/results/form1`** and **`/results/form2`**: live aggregate results remain in original question and option order. Highest-count options are highlighted correctly; ties are labeled rather than claiming a unique leader.
- A site-wide light/dark theme switch remembers your choice in the browser.

## Production deployment

**A PostgreSQL database is required for durable responses on Vercel.** A local `/tmp` fallback exists for previews, but serverless files are ephemeral and must **not** be relied on to collect research responses. Connect Neon (through Vercel Storage) or Supabase and set `DATABASE_URL` or `POSTGRES_URL` in Vercel environment variables. The application creates survey tables automatically, or you can apply `db/init.sql`.

Set a unique `ADMIN_TOKEN` (at least 24 characters) to unlock `/setup`, `/api/export` and `/api/source`. Without a configured token these private endpoints stay locked. The generated archive is kept at the project root, outside `public/`, and is gitignored.

See `DEPLOY.md` for a step-by-step checklist.

## Local development

```bash
npm install
cp .env.example .env
# Set DATABASE_URL in .env to your local PostgreSQL connection
# Optionally set ADMIN_TOKEN to use the private console
npx drizzle-kit push
npm run dev
```

## Data model

- `form1_responses`: anonymous role, department, semester, and the exact role-specific preference answers.
- `form2_responses`: seven 1–5 time-slot ratings, gap/fairness ratings, and optional feedback.
- `survey_version = 2` isolates the revised Google Forms survey from legacy responses.
- `(browser_id, survey_version)` is unique per form. Browser submission markers are versioned too.
- API validation is generated from the canonical options in `src/lib/survey.ts`; v2 database checks enforce answer domains and student/teacher completeness.

Question text, option order, scale labels, and section copy are defined in `src/lib/survey.ts`; matching diagrams are in `src/components/Visuals.tsx`. Results are filtered to v2 and preserve canonical option order in `src/lib/results.ts`.
