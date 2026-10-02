# Fairness-Aware AI Routine Generator

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel)](https://fairness-ai-routine-v.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-supported-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-supported-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A research platform for collecting student and teacher scheduling preferences, time-slot ratings, and fairness expectations to support future AI-assisted university routine generation.

> **Research status:** This project currently focuses on structured data collection, validation, aggregate analysis, and research infrastructure. It does not yet generate production university timetables automatically.

## Contents

- [Project overview](#project-overview)
- [Research goals](#research-goals)
- [Promo Video](#promo-video)
- [How the platform works](#how-the-platform-works)
- [Public routes](#public-routes)
- [Survey design](#survey-design)
- [Data and privacy](#data-and-privacy)
- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database and migrations](#database-and-migrations)
- [Production deployment](#production-deployment)
- [Quality checks](#quality-checks)
- [Research and engineering principles](#research-and-engineering-principles)
- [Limitations and future work](#limitations-and-future-work)
- [Contributing](#contributing)
- [License](#license)

## Project overview

University routine generation is a constrained optimization problem involving many competing needs:

- Student preferences for class times, breaks, workload, and gaps.
- Teacher preferences for teaching patterns, workload, consultation time, and fairness.
- Department and semester constraints.
- Room, faculty, and time-slot conflicts.
- Fairness across groups and across multiple semesters.

This application creates a consistent research interface for gathering those preferences before building and evaluating an AI-based routine-generation system. It preserves the original survey wording and option order while providing a web-based experience, validation, aggregate results, and an extensible PostgreSQL data model.

## Research goals

The platform is designed to help investigate:

1. **Preference discovery** — identify the class-time and workload patterns students and teachers prefer.
2. **Conflict resolution** — study how participants prioritize student needs versus teacher needs when preferences conflict.
3. **Time-slot suitability** — collect 1–5 ratings for seven daily class periods.
4. **Campus-gap perception** — measure whether long idle gaps between classes are considered harmful or useful.
5. **Multi-semester fairness** — understand whether a difficult routine in one semester should influence future scheduling decisions.
6. **Fairness-aware optimization** — provide future AI systems with human-centered constraints and preference weights instead of optimizing only for feasibility.

## Promo Video

https://github.com/user-attachments/assets/08499107-1a4b-4605-b42b-c77790635a64

## How the platform works

The application provides two complementary surveys.

### Form 1 — Student and Teacher Preferences

Participants select their role and department, then answer role-specific questions.

#### Students provide preferences about:

- Early or late classes.
- Weekly days off.
- Gaps between classes.
- Midday breaks.
- Daily workload.
- Number of laboratory classes.
- Priority between senior and junior students.
- Student–teacher conflicts.

#### Teachers provide preferences about:

- Teaching-day patterns.
- Weekly days off.
- Consecutive classes.
- Consultation and preparation gaps.
- Faculty scheduling conflicts.
- Compensation across semesters.
- Student–teacher conflicts.

### Form 2 — Time-Slot and Fairness Ratings

Participants rate each time slot on a five-point scale and answer additional fairness questions.

The time slots are:

| Time slot | Period |
| --- | --- |
| 8:00–9:20 | Early morning |
| 9:30–10:50 | Morning |
| 11:00–12:20 | Late morning |
| 12:30–13:50 | Midday |
| 14:00–15:20 | Early afternoon |
| 15:30–16:50 | Late afternoon |
| 17:00–18:20 | Evening |

The rating scale is:

| Rating | Meaning |
| ---: | --- |
| 1 | Hate it |
| 2 | Dislike it |
| 3 | Neutral |
| 4 | Like it |
| 5 | Love it |

Participants also rate:

- Long gaps between campus classes.
- Multi-semester fairness.
- Additional constraints and suggestions through optional feedback.

## Public routes

| Route | Purpose |
| --- | --- |
| `/` | Research introduction, survey access, live response counters, and aggregate insights. |
| `/form1` | Student and Teacher preference survey. |
| `/form2` | Time-slot rating and fairness survey. |
| `/results/form1` | Aggregate Form 1 results in canonical question order. |
| `/results/form2` | Aggregate Form 2 results and time-slot statistics. |
| `/api/health` | Application and database health check for deployment verification. |

The interface supports light and dark themes, and the selected theme is remembered in the browser.

## Survey design

The survey specification is centralized in [`src/lib/survey.ts`](src/lib/survey.ts). This file is the canonical source for:

- Question identifiers and wording.
- Student, Teacher, and shared question groups.
- Department and semester options.
- Time-slot definitions.
- Rating labels.
- Allowed answer values.
- Statistics option ordering.
- Survey versioning.

This prevents the UI, API validation, database checks, exports, and result pages from drifting apart.

### Question order and display behavior

- Canonical question definitions preserve the original research survey order.
- The UI may randomize question presentation where configured.
- Stored answers use stable question identifiers.
- Results are displayed in canonical order.
- Statistics include defined options even when an option has zero responses.
- Percentages are calculated per question from valid responses to that question.

## Data and privacy

The application is designed for anonymous aggregate research collection.

### Stored data

- Role: Student or Teacher.
- Department.
- Optional “Other” department value where applicable.
- Student semester when the participant is a student.
- Role-specific preference answers.
- Seven time-slot ratings.
- Long-gap rating.
- Multi-semester fairness rating.
- Optional free-text feedback.
- Submission timestamp.
- Browser identifier used to prevent duplicate submissions from the same browser and survey version.

### Privacy and security notes

- Public pages expose aggregate results, not individual response records.
- CSV and JSON exports are protected by `ADMIN_TOKEN`.
- Source archives and database diagnostics are protected by `ADMIN_TOKEN`.
- Without a configured admin token, private administrative endpoints remain locked.
- The browser identifier is a duplicate-submission control, not a secure identity system.
- Do not store secrets in the repository.
- Do not expose `DATABASE_URL` or `ADMIN_TOKEN` to the client.
- Use a persistent PostgreSQL database in production.
- The local temporary-file fallback is not durable and should not be used for production research collection on serverless hosting.

For the operational deployment checklist, see [`DEPLOY.md`](DEPLOY.md).

For participation and data-collection guidance, see [`LIVE_PARTICIPATION.md`](LIVE_PARTICIPATION.md).

## Technology stack

- **Framework:** Next.js App Router
- **Language:** JavaScript and TypeScript
- **UI:** React, Tailwind CSS, Lucide React, and custom visual components
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Schema tooling:** Drizzle Kit
- **Validation:** Shared canonical survey definitions and database constraints
- **Deployment target:** Vercel-compatible Next.js deployment
- **Browser tooling:** Playwright dependency for browser-oriented verification

## Project structure

```text
.
├── src/
│   ├── app/              # Next.js routes, pages, and API handlers
│   ├── components/       # Reusable UI and visual components
│   ├── db/               # Database connection and Drizzle schema
│   └── lib/              # Survey specification, analytics, and utilities
├── db/
│   └── init.sql          # Optional/manual database initialization SQL
├── scripts/              # Maintenance and archive-generation scripts
├── archive/              # Archived project assets or research materials
├── DEPLOY.md             # Production deployment checklist
├── LIVE_PARTICIPATION.md # Live data collection guide
├── drizzle.config.json   # Drizzle Kit configuration
├── .env.example          # Environment variable template
└── package.json          # Scripts and dependencies
```

## Getting started

### Prerequisites

Install the following before starting development:

- Node.js compatible with the installed Next.js version.
- npm.
- PostgreSQL for durable local development and production-like testing.

### Clone the repository

```bash
git clone https://github.com/ENiGMA-101/fairness-ai-routine--v.git
cd fairness-ai-routine--v
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

```bash
cp .env.example .env
```

Set at least `DATABASE_URL` in `.env`.

To enable the protected administrative console and export/source endpoints locally, also set a strong `ADMIN_TOKEN`.

### Initialize the database

```bash
npx drizzle-kit push
```

If manual initialization is required, review [`db/init.sql`](db/init.sql).

### Start the development server

```bash
npm run dev
```

Open the application at:

```text
http://localhost:3000
```

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Production: yes | PostgreSQL connection string. |
| `ADMIN_TOKEN` | Only for private admin features | Random secret of at least 24 characters. |

Example:

```dotenv
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
ADMIN_TOKEN=replace-with-a-long-random-secret
```

Generate a secure admin token with:

```bash
openssl rand -hex 32
```

## Database and migrations

The application uses Drizzle ORM with PostgreSQL.

### `form1_responses`

Stores versioned Student and Teacher preference responses, including:

- Role.
- Department.
- Semester.
- Role-specific answers.
- Browser identifier.
- Survey version.
- Submission timestamp.

### `form2_responses`

Stores:

- Role and department.
- Seven time-slot ratings.
- Long-gap rating.
- Multi-semester fairness rating.
- Optional feedback.
- Browser identifier.
- Survey version.
- Submission timestamp.

### `survey_presence`

Tracks anonymous active presence separately from official survey responses.

This table contains no survey answers and is protected with row-level security configuration.

### Validation and versioning

- The current survey specification is `SURVEY_VERSION = 2`.
- Legacy and revised survey responses can be separated by version.
- Unique `(browser_id, survey_version)` indexes prevent duplicate submissions.
- Database checks enforce valid role values.
- Database checks enforce rating ranges.
- Database checks enforce allowed answer values.
- Database checks enforce Student and Teacher answer completeness.
- API validation and database validation derive from the canonical survey specification where possible.

## Production deployment

The recommended deployment target is Vercel with a persistent PostgreSQL provider.

### Deployment steps

1. Import the repository into Vercel.
2. Connect a persistent PostgreSQL database such as Neon or Supabase.
3. Add `DATABASE_URL` to the Vercel environment settings.
4. Add a unique `ADMIN_TOKEN` with at least 24 characters.
5. Deploy the application.
6. Verify `/api/health`.
7. Submit controlled test responses.
8. Confirm `/form1` and `/form2` work correctly.
9. Confirm `/results/form1` and `/results/form2` display aggregate data.
10. Confirm private endpoints reject requests without the admin token.

### Important serverless storage warning

The optional local fallback uses a temporary filesystem.

Vercel functions can have ephemeral and independently scaled filesystems. Data stored in that fallback can disappear or become inconsistent between instances.

A persistent PostgreSQL database is required for reliable research data collection.

See [`DEPLOY.md`](DEPLOY.md) for the complete launch checklist.

## Quality checks

Run the available project checks before opening a pull request or deploying:

```bash
npm run lint
npm run typecheck
npm run build
```

### Recommended manual verification

- Submit one Student Form 1 response.
- Submit one Teacher Form 1 response.
- Rate all Form 2 time slots.
- Submit optional feedback.
- Confirm aggregate results preserve question order.
- Confirm time-slot results preserve time order.
- Confirm all canonical options appear in statistics.
- Confirm duplicate submission protection works.
- Switch between light and dark themes.
- Refresh the page and confirm the theme is remembered.
- Confirm private endpoints reject requests without `ADMIN_TOKEN`.
- Confirm production responses are stored in PostgreSQL.
- Confirm no participant-level responses are publicly exposed.

## Research and engineering principles

1. **Human preferences before automation**  
   Collect and understand stakeholder needs before optimizing schedules.

2. **Fairness is explicit**  
   Fairness is measured as a research dimension rather than treated as an accidental result.

3. **Canonical definitions**  
   Questions, options, validation, and analytics share one source of truth.

4. **Versioned research data**  
   Survey changes remain traceable and separate from earlier versions.

5. **Aggregate-first reporting**  
   Public result pages communicate trends without exposing individual answers.

6. **Constraint transparency**  
   Future scheduling algorithms should make trade-offs and fairness criteria inspectable.

7. **Reproducibility**  
   Deployment, schema, survey, and participation instructions are maintained in the repository.

## Limitations and future work

### Current limitations

- The platform collects preferences but does not yet generate complete university routines.
- Browser-based duplicate prevention is not equivalent to participant authentication.
- Data quality depends on participant coverage, sampling strategy, and honest responses.
- The current fairness model is based on participant ratings and stated preferences.
- The platform does not yet provide a formal mathematical fairness guarantee.
- Room availability, instructor availability, course capacities, prerequisites, and conflict graphs require additional modeling.

### Potential future work

- Build a formal scheduling constraint and optimization model.
- Compare rule-based, mathematical-optimization, and machine-learning approaches.
- Add explainable schedule scoring.
- Add fairness diagnostics.
- Support department-level administrative constraints.
- Add room and resource allocation.
- Add longitudinal multi-semester fairness experiments.
- Develop anonymized research exports.
- Add reproducible analysis notebooks.
- Add automated end-to-end tests.
- Add accessibility and multilingual improvements.
- Add administrative dashboards for research monitoring.

## Contributing

Contributions are welcome, especially in the areas of:

- Survey methodology.
- Fairness metrics.
- Scheduling optimization.
- Accessibility.
- Data protection.
- Database design.
- Testing.
- Research documentation.

Before submitting a pull request:

1. Explain the research or engineering motivation.
2. Keep survey wording and option changes explicit.
3. Create a new survey version when appropriate.
4. Update documentation when routes, schema, environment variables, or deployment behavior changes.
5. Run the project checks:

```bash
npm run lint
npm run typecheck
npm run build
```

6. Do not commit secrets, participant data, database dumps, or generated archives.

For substantial changes to survey questions or fairness definitions, document:

- The reason for the change.
- The expected effect on existing data.
- Whether a new survey version is required.
- Whether existing result calculations remain comparable.

## License

This project is released under the [MIT License](LICENSE).

## Project links

- **Live application:** https://fairness-ai-routine-v.vercel.app
- **Repository:** https://github.com/ENiGMA-101/fairness-ai-routine--v
- **Deployment checklist:** [`DEPLOY.md`](DEPLOY.md)
- **Live participation guide:** [`LIVE_PARTICIPATION.md`](LIVE_PARTICIPATION.md)
