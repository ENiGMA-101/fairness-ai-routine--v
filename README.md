# Fairness-Aware AI Routine Generator

A bilingual university research survey built with Next.js App Router, Tailwind and PostgreSQL (Drizzle ORM). Students and teachers share anonymous timetable preferences and rate seven daily time slots.

## Public experience

- **`/`**: research topic, immediate access to both surveys, live response counters and aggregate insights.
- **`/form1`**: preference survey. Role, department and semester remain fixed; opinion questions shuffle on entry. After choosing an option, **every option in that question** reveals its percentage and number of submitted votes—including all eight semester choices. Fixed order does not suppress results. Changing an answer does not cast a vote; only Submit records it.
- **`/form2`**: seven time-slot ratings, gap/fairness ratings and optional feedback. Rating a slot or a question reveals **all five ratings** and their submitted vote counts.
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

- `form1_responses`: anonymous role, department, semester, and student/teacher preference answers.
- `form2_responses`: seven 1–5 time-slot ratings, gap/fairness ratings, and optional feedback.
- `browser_id` has a database unique constraint per form. The browser also remembers submission state via localStorage.

Question text and display order are defined in `src/lib/survey.ts`; survey illustrations are in `src/components/Visuals.tsx`. Results are aggregated in `src/lib/results.ts`.
