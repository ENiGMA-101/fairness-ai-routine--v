# Deploy to Vercel — step by step

## 0. What you need

- A Vercel account (free tier is enough)
- A PostgreSQL database (any of the following)
  - **Neon** (recommended, free): neon.tech
  - **Supabase**: supabase.com (use the *connection pooler* URI)
  - **Vercel Postgres** (Neon under the hood, created from the Vercel dashboard)
  - Any other Postgres you can reach over the internet

## 1. Create the database tables

Grab the connection string of your new database, then run the SQL in `db/init.sql`:

- **Supabase**: Dashboard → SQL Editor → paste `db/init.sql` → Run.
- **Neon**: Dashboard → SQL Editor → paste → Run.
- **CLI**: `psql "postgresql://…" -f db/init.sql`

This creates `form1_responses`, `form2_responses`, and a `form2_slot_averages` view.
(Alternatively run `npx drizzle-kit push` locally with `DATABASE_URL` set — same result.)

## 2. Import the project into Vercel

Option A — ZIP upload:

1. Unzip `fairness-app.zip`.
2. Push the folder to a GitHub repo (Vercel's dashboard no longer accepts raw ZIPs, but the
   GitHub route takes ~1 minute and gives you auto-deploys).

Option B — GitHub:

```bash
git init && git add . && git commit -m "fairness survey"
git branch -M main
git remote add origin https://github.com/<you>/fairness-survey.git
git push -u origin main
```

Then in Vercel: **Add New… → Project → Import** your repo.

## 3. Add the environment variable

In the Vercel import wizard (or Settings → Environment Variables):

| Key | Value | Environments |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://…` (your connection string) | Production, Preview, Development |

Nothing else is required — there are no other secrets in this app.

## 4. Deploy

Click **Deploy**. Vercel runs `npm run build` and starts the app.

Verify:

- `https://<your-app>.vercel.app/` → landing page with live counters
- `https://<your-app>.vercel.app/api/health` → `{"ok":true}`
- Fill and submit both forms → counters increase, `/results/*` show bars

## 5. Common issues

| Symptom | Fix |
| --- | --- |
| `/api/health` returns `{"ok":false}` | `DATABASE_URL` missing/typo, or DB unreachable |
| Results pages show a red "Could not read from the database" box | Tables not created — run `db/init.sql` |
| Submitting twice in the same browser does nothing | Expected: one response per browser (clear the site's localStorage to test again) |
| Supabase error `relation "form1_responses" does not exist` | You ran the SQL in the wrong project/schema — use the connection string of the same project |

## 6. Sharing the survey

Post two links:

- Form 1: `https://<your-app>.vercel.app/form1`
- Form 2: `https://<your-app>.vercel.app/form2`

Results pages are public (read-only, anonymous — no personal data is collected anywhere).
