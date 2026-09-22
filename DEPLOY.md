# Deploy to Vercel — 60-Second Setup Guide

## The Easiest Way (Directly inside Vercel Dashboard)

If you don't have an external database, you can create one inside Vercel in 3 clicks for free:

1. **Deploy the project to Vercel**:
   - Push this repo to GitHub (or import via Vercel).
2. **Add a Free Database in Vercel**:
   - In your project overview at [vercel.com](https://vercel.com), click the **Storage** tab.
   - Click **Create Database** → Choose **Neon** (or Postgres).
   - Click **Continue** → Select a region → Click **Connect to Project**.
   - Vercel will automatically configure `POSTGRES_URL` in your environment!
3. **Done!**
   - **Zero SQL needed:** Our application has **auto-schema healing** built in.
   - The first time someone submits a form or loads the page, `form1_responses` and `form2_responses` tables are created automatically!

---

## Alternative Free Databases (No Credit Card)

### Option A: Neon.tech (Recommended, Free Forever)

1. Create a free account at [neon.tech](https://neon.tech) (10 seconds with GitHub/Google).
2. Click **Create Project** → copy the connection string:
   ```text
   postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require
   ```
3. In Vercel: go to your project → **Settings** → **Environment Variables**:
   - Key: `DATABASE_URL`
   - Value: `postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require`
4. Click **Save** and trigger a **Redeploy**.
5. The app connects and auto-creates the tables automatically!

### Option B: Supabase (Free Tier)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **Project Settings** → **Database** → under **Connection string**, select **URI**.
3. Choose **Transaction mode** (port `6543`).
4. Copy the URI and add it as `DATABASE_URL` in Vercel Environment Variables.

---

## Troubleshooting Common Errors

### Error: `Failed query: insert into "form2_responses"...`
- **Cause**: The database was connected, but the tables were not created yet (or an empty database was attached).
- **Fix**: The latest code includes auto-table initialization (`CREATE TABLE IF NOT EXISTS`). Download the updated ZIP, or visit `/setup` in your browser and click **"Re-verify Tables"**.

### Error: `Database not connected / DATABASE_URL is not set`
- **Cause**: Vercel has no database connected yet.
- **Fix**: Add either `DATABASE_URL` or `POSTGRES_URL` in Vercel **Settings → Environment Variables**, or use Vercel's **Storage** tab.

### Check Status
Visit `https://<your-app>.vercel.app/setup` to view live connection health, detected variables, and verify tables with 1 click.
