-- Fairness-Aware AI Routine Generator — survey schema
-- Run this on any PostgreSQL instance (Neon, Supabase, Railway, RDS, local…).
-- It matches src/db/schema.ts exactly, so `npx drizzle-kit push` is optional.

create extension if not exists "pgcrypto";

create table if not exists form1_responses (
  id uuid primary key default gen_random_uuid(),
  browser_id text unique not null,
  role text not null,
  department text not null,
  department_other text,
  semester text,
  q_avoid text,
  q_weekly_off text,
  q_between_classes text,
  q_extra_time text,
  q_long_gap text,
  q_midday_break text,
  q_max_hours text,
  q_lab_cap text,
  q_priority_group text,
  q_conflict_student text,
  q_teaching_schedule text,
  q_zero_day text,
  q_consecutive text,
  q_gap_pref text,
  q_faculty_conflict text,
  q_compensate text,
  q_conflict_teacher text,
  created_at timestamptz not null default now()
);

create table if not exists form2_responses (
  id uuid primary key default gen_random_uuid(),
  browser_id text unique not null,
  role text not null,
  department text not null,
  department_other text,
  time_slot_8_00 int not null,
  time_slot_9_30 int not null,
  time_slot_11_00 int not null,
  time_slot_12_30 int not null,
  time_slot_14_00 int not null,
  time_slot_15_30 int not null,
  time_slot_17_00 int not null,
  long_gap_rating int not null,
  fairness_rating int not null,
  feedback text,
  created_at timestamptz not null default now()
);

-- Optional analytics view: average rating per time slot, ranked.
create or replace view form2_slot_averages as
select
  round(avg(time_slot_8_00)::numeric, 2)  as "08:00-09:20",
  round(avg(time_slot_9_30)::numeric, 2)  as "09:30-10:50",
  round(avg(time_slot_11_00)::numeric, 2) as "11:00-12:20",
  round(avg(time_slot_12_30)::numeric, 2) as "12:30-13:50",
  round(avg(time_slot_14_00)::numeric, 2) as "14:00-15:20",
  round(avg(time_slot_15_30)::numeric, 2) as "15:30-16:50",
  round(avg(time_slot_17_00)::numeric, 2) as "17:00-18:20",
  round(avg(long_gap_rating)::numeric, 2) as long_gap,
  round(avg(fairness_rating)::numeric, 2) as fairness,
  count(*) as responses
from form2_responses;
