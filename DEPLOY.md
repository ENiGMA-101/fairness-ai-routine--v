# Public launch checklist · Fairness-Aware AI Routine Generator

The landing page links straight to Form 1 and Form 2. Visitors can choose a light or dark theme. Responses are anonymous and shown as aggregate poll results.

## Deploy to Vercel

1. Push the source project to a **private** repository and import it in Vercel (or unzip your locally generated `fairness-app.zip` and import those files).
2. Connect a **persistent PostgreSQL database**. In Vercel: Project → Storage → create/connect Neon. Vercel usually supplies `POSTGRES_URL`. Alternatively create a Neon or Supabase database and set `DATABASE_URL` to its connection string.
3. In Vercel → Settings → Environment Variables, add a random `ADMIN_TOKEN` **at least 24 characters long** (e.g. generated with `openssl rand -hex 32`). Keep it private. It protects `/setup`, CSV export and source download. If omitted, those endpoints are disabled.
4. Deploy, then check `/api/health` for database connectivity. Tables are initialized automatically; `db/init.sql` is provided for manual setup if needed.
5. The application upgrades existing tables automatically: legacy responses are marked `survey_version = 1`, while the attached Google Forms specification is stored as version 2. Submit one v2 test response on each form, confirm it survives a redeploy, then remove the test rows before inviting participants.

## Important: no database ≠ durable data

The optional local fallback writes to the server's temporary filesystem. Vercel functions have ephemeral, independently scaled filesystems: responses saved there can disappear or disagree across instances. **For public research, set `DATABASE_URL` or `POSTGRES_URL` and verify `/api/health` before sharing your URL.** Do not treat fallback counts or demo rows as real research data.

## Privacy

- Public pages never expose CSV/JSON exports, source archives or database diagnostics.
- `fairness-app.zip` is created at the repository root with `node scripts/make-zip.mjs`, is excluded by `.gitignore`, and is not in `public/`.
- Without a strong `ADMIN_TOKEN`, private API routes reject requests.
- The browser ID only prevents a repeat response from that browser; it is not a secure identity system.
- Each question starts with percentages hidden. After choosing any option, **all options in that question** reveal their percentages and submitted vote counts. Changing the selection never casts a vote; Submit records it.

## Verify before launch

- `/form1` and `/form2`: options begin without percentages. Click Option A: both A **and** B show percentages and submitted vote counts. Click B: selection changes immediately, while counts stay unchanged until Submit.
- Switch dark/light, then refresh: the chosen theme remains.
- Visit a submitted form again: the already-submitted screen appears.
- Open `/api/export` and `/api/source` without an admin token: both return `401`.
- `/results/form1` and `/results/form2` show responses from your persistent database in the original survey order.
