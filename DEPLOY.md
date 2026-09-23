# Fairness-Aware AI Routine Generator — Vercel Deployment Guide

Deploy the research survey to Vercel in less than 60 seconds.

## 🔐 Public-launch checklist (professional deployment)

- [ ] **Delete `fairness-app.zip` from the repository/public folder** if you ever copied it there — source code must never be public. In this project the archive is generated at the project root and served only through `/api/source?token=…`.
- [ ] **Set `ADMIN_TOKEN`** in Vercel → Settings → Environment Variables (any long random string). It protects `/api/source`, `/api/export` and the `/setup` admin console.
- [ ] **Do not expose CSV export publicly** — export buttons only exist inside `/setup` behind the token.
- [ ] The public site only shows: the two forms, aggregate live results, and research context.

## 🚀 Instant 1-Click Deploy (Zero Database Setup Required!)

**Good news:** You do **NOT** need to configure any database to run this survey on Vercel!
The app includes a built-in zero-config storage engine (`src/lib/storage.ts`) with live polling percentages, duplicate browser protection, and 1-click CSV/Excel export.

### 3 Steps to Deploy:
1. **Unzip `fairness-app.zip`** (or push to GitHub).
2. Go to [vercel.com](https://vercel.com) → Click **Add New… → Project** → Import your repository.
3. Click **Deploy**. **No environment variables needed!**

Your survey is immediately live with:
- `/` — Modern landing page with live response counters
- `/form1` — 11 student questions + 7 teacher questions (Bangla & English) with graphical infographics
- `/form2` — 7 daily time-slot ratings (1–5 scale), gap tolerance, fairness
- `/results/form1` & `/results/form2` — Live graphical dashboards
- `/api/export?form=form1&format=csv` — 1-click CSV export for Excel / Google Sheets

---

## 🗄️ (Optional) Connecting a PostgreSQL Database (Neon or Supabase)

If you wish to use an external PostgreSQL database, the app automatically supports it and **auto-creates all tables** (`CREATE TABLE IF NOT EXISTS`) without you ever running manual SQL scripts.

### Option A: Neon Postgres in Vercel Storage (Easiest)
1. In your project dashboard on Vercel, click the **Storage** tab.
2. Click **Create Database** → Select **Neon**.
3. Choose a region and click **Connect to Project**.
4. Vercel automatically sets `POSTGRES_URL`.
5. Trigger a **Redeploy** in Vercel. Done!

### Option B: Free Neon.tech Account (100% Free Forever)
1. Sign up at [neon.tech](https://neon.tech) (takes 10 seconds with Google/GitHub, no credit card).
2. Click **Create Project** → copy the connection string:
   ```text
   postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require
   ```
3. In your Vercel Project → **Settings** → **Environment Variables**:
   - Name: `DATABASE_URL`
   - Value: `postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require`
4. Click **Save** and trigger a **Redeploy**.

### Option C: Supabase
1. Create a project on [supabase.com](https://supabase.com).
2. Go to **Project Settings** → **Database** → under **Connection string**, select **URI**.
3. Choose **Transaction mode** (port `6543`).
4. Set it as `DATABASE_URL` in Vercel Environment Variables.

---

## 🛠️ Features Included
- **Exact PDF Preserved**: Exact questions from UAP routine research surveys in both Bengali and English.
- **Graphical Infographics**: Every question has a visual comparison card (morning/evening rush, 4-day packed vs 5-day week, timeline gaps, lab load, student vs teacher balance).
- **Time-Slot Matrix**: Interactive 7-slot rating board with emojis (😡 1 to 🤩 5) and live distribution bars.
- **Duplicate Protection**: One response per browser via anonymous localStorage ID.
- **CSV / Excel Export**: Download responses anytime from the dashboard.
- **Auto-Healing Schema**: If a database is connected, all tables are created automatically on the fly.
