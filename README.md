# Fairness-Aware AI Routine Generator

A bilingual university research survey built with Next.js App Router, Tailwind and PostgreSQL (Drizzle ORM). Students and teachers share anonymous timetable preferences and rate seven daily time slots.

## Public experience

- **`/`**: research topic, immediate access to both surveys, live response counters and aggregate insights.
- **`/form1`**: exact Student/Teacher Google Forms wording, options, branching sections, diagrams, and fixed source order. After choosing an option, every option in that question reveals its percentage and submitted vote count. Changing an answer does not cast a vote; only Submit records it.
- **`/form2`**: exact seven time-slot rows and 1–5 scale, followed by Long Campus Gaps, Multi-Semester Fairness, and optional feedback in Google Forms order. Rating a slot or question reveals all five submitted rating results.
- **`/results/form1`** and **`/results/form2`**: aggregate results in the original question order (never shuffled).
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
