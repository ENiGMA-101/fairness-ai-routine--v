-- Additive migration only. Run once against the existing PostgreSQL / Supabase
-- database if migrations are managed separately. The application's existing
-- ensureTablesExist helper also applies this idempotently through Drizzle.
-- No response tables, constraints, survey versions, answers, or results change.
CREATE TABLE IF NOT EXISTS survey_presence (
  session_id text PRIMARY KEY,
  browser_id text NOT NULL,
  scope text NOT NULL,
  last_seen timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT survey_presence_scope_check CHECK (scope IN ('home', 'form1', 'form2'))
);
CREATE INDEX IF NOT EXISTS survey_presence_last_seen_idx ON survey_presence (last_seen);
-- Only the trusted database-owner connection used by the server may access IDs.
-- No anonymous or authenticated client policies are created.
ALTER TABLE survey_presence ENABLE ROW LEVEL SECURITY;
