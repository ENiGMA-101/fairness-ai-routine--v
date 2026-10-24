# Clash of Pens (কলম যুদ্ধ) — Classroom School Bench Pen Fight

An authentic, physics-driven 2D classroom desk pen-fighting game inspired by Bangladeshi school bench duels. Built with **React 19**, **TypeScript**, **Matter.js**, **Tailwind CSS v4**, and **Neon PostgreSQL + Google Sign-In** serverless cloud saves.

---

## Key Features

### 1. Calibrated Physics & Three Distinct Attack Styles
- **Non-linear Power Response Curve (`powerCurve` & `launchSpeed`)**:
  - **10–25% Power**: Fine tactical positioning and gentle nudges.
  - **50% Power**: Controlled mid-desk slides across the 1200×650 School Bench.
  - **75–100% Power**: High-impact strikes with realistic self-knockout risk if aimed near an edge.
- **Three Attack Points (`ATTACK_SIDES`)**:
  - **Side 1 — Top Strike (শীর্ষ আঘাত)**: Strikes the nib end (`+0.40` offset), producing controlled rotational spin and a curved lateral drift trajectory.
  - **Side 2 — Middle Push (সরাসরি ধাক্কা)**: Strikes dead-center (`0.00` offset) with zero spin and maximum direct momentum transfer (`strike = 0.86`).
  - **Side 3 — Bottom Slam (ভারী আঘাত)**: Heavyweight rear strike (`-0.40` offset, `dens = 1.38`) for bulldozing defenders near the rim.
- **Configurable Edge Knockout Rules (`isOffDesk`)**:
  - **Center Over (50% overhang)** or **Footprint Over (32% overhang)**, allowing realistic edge teetering without premature elimination.
- **Consistent Trajectory Preview**: Uses the exact same `applyLaunch` and `stepBodyDynamics` substeps as live gameplay and AI shot planning.

### 2. Responsive Desktop Sidebar & Mobile/Tablet Layouts
- **Desktop (`>= 1180×600`)**: Two-column layout with a compact **Left Control Sidebar** (`[data-testid="hud-left-sidebar"]`) housing the Turn Banner, Player Scoreboard, Attack Point Selector, Vertical Power Meter, Fine Power Slider, and **FLICK PEN!** button while the **School Bench (`1200×650`)** occupies the main viewport area without overlapping controls.
- **Tablet (`700px–1179px`) & Mobile (`< 700px`)**: Compact bottom control panel (`[data-testid="hud-bottom-panel"]`) with collapsible details and a unifiedカメラ transform (`computeCameraView`, `screenToWorld`, `worldToScreen`) that keeps all 4 table corners visible and preserves exact aspect ratios across resize and orientation changes.

### 3. Friendly Match Player Naming & Best-of-5 Series
- Enter custom player names for 2 or 3 human players in **Friendly Match (Pass & Play)** or **AI Battle**.
- Validates names inline (trims whitespace, requires non-empty names, max 18 characters, blocks control/unsafe characters, prevents duplicate names, and provides a pre-match **Match Summary** confirmation).
- Propagates custom player names across **Secret Pen Placement**, **Turn Handover Prompts**, **In-Game HUD**, **Best-of-5 Series Scoreboard**, **Victory Screen**, and **Match History**.

### 4. Secret Human Pen Placement & Post-Confirmation AI Placement
- Human players drag and rotate their pen anywhere inside the table boundary before the match begins.
- In multiplayer Pass-and-Play, previously confirmed human pen positions remain **hidden** (`Secret Mode`) during handover so opponents cannot counter-place unfairly.
- In AI matches, the bot pen is placed at a randomized, non-overlapping valid position **only after** the human player confirms placement.

### 5. Match Exit Confirmation & Safe Cleanup
- Leaving an active match via the Header Menu button, HUD Leave button, Pen Placement back button, or `Escape` key opens a confirmation dialog:
  - **Title**: *"Do you want to leave the match?"*
  - **Message**: *"Your current match will be abandoned. Completed results will remain unchanged."*
  - **Actions**: **"Stay in Match"** and **"Leave Match"**
- Cancels all pending AI/turn timers via session guards so abandoned matches never mutate completed stats or rewards.

### 6. Neon PostgreSQL + Google Sign-In Cloud Saves
- **Offline-First Local Persistence**: Guest players always have automatic `localStorage` persistence (`Saved` / `Offline — saved on this device`).
- **Server-Only Neon PostgreSQL (`DATABASE_URL`)**: Browser code never connects directly to Neon or exposes `DATABASE_URL` via `VITE_`. All persistence goes through `/api/*` serverless endpoints.
- **Optimistic Concurrency & Conflict Resolution**: Tracks `revision` numbers on `player_saves` and provides an explicit Conflict Resolution UI (**Smart Merge**, **Keep Cloud Save**, or **Keep Device Save**) on `409 Conflict`.
- **Idempotent Match Rewards**: `POST /api/matches` uses a unique `idempotency_key` per match so retries never duplicate coin or XP rewards.

---

## Getting Started

### Prerequisites
- Node.js 20+

### Install & Run Locally
```bash
npm install
npm run dev
```
The development server binds to `http://0.0.0.0:3000` and mounts both the Vite frontend and the `/api/*` backend middleware.

### Run Automated Tests, Typecheck & Production Build
```bash
npm test
npm run lint
npm run build
```

---

## Neon PostgreSQL & Google OAuth Setup (Optional for Cloud Saves)

1. Copy `.env.example` to `.env.local` (or configure in Vercel Project Settings):
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@ep-example.region.aws.neon.tech/neondb?sslmode=require"
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
   SESSION_SECRET="replace-with-at-least-32-random-hex-characters"
   APP_URL="http://localhost:3000"
   ```
   > **Security Note**: Never prefix `DATABASE_URL`, `GOOGLE_CLIENT_SECRET`, or `SESSION_SECRET` with `VITE_`.

2. Run the SQL schema migration (`db/migrations/0001_initial_schema.sql`) against your Neon database:
   ```bash
   npm run db:migrate
   ```
   This creates the `users`, `player_saves`, `match_history`, and `achievements` tables with required constraints and indexes.
