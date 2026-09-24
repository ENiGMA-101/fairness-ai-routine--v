-- Fairness-Aware AI Routine Generator — exact Google Forms survey schema (v2)
-- Safe to run repeatedly on Neon, Supabase, Railway, RDS, or local PostgreSQL.

create extension if not exists "pgcrypto";

create table if not exists form1_responses (
  id uuid primary key default gen_random_uuid(),
  browser_id text not null,
  survey_version integer not null default 2,
  role text not null check (role in ('Student', 'Teacher')),
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
  created_at timestamptz not null default now(),
  constraint form1_browser_version_unique unique (browser_id, survey_version)
);

create table if not exists form2_responses (
  id uuid primary key default gen_random_uuid(),
  browser_id text not null,
  survey_version integer not null default 2,
  role text not null check (role in ('Student', 'Teacher')),
  department text not null,
  department_other text,
  time_slot_8_00 int not null check (time_slot_8_00 between 1 and 5),
  time_slot_9_30 int not null check (time_slot_9_30 between 1 and 5),
  time_slot_11_00 int not null check (time_slot_11_00 between 1 and 5),
  time_slot_12_30 int not null check (time_slot_12_30 between 1 and 5),
  time_slot_14_00 int not null check (time_slot_14_00 between 1 and 5),
  time_slot_15_30 int not null check (time_slot_15_30 between 1 and 5),
  time_slot_17_00 int not null check (time_slot_17_00 between 1 and 5),
  long_gap_rating int not null check (long_gap_rating between 1 and 5),
  fairness_rating int not null check (fairness_rating between 1 and 5),
  feedback text,
  created_at timestamptz not null default now(),
  constraint form2_browser_version_unique unique (browser_id, survey_version)
);

-- Upgrade pre-versioned installations. Existing rows remain version 1 and are
-- intentionally excluded from v2 analytics because several questions changed meaning.
alter table form1_responses add column if not exists survey_version integer;
alter table form2_responses add column if not exists survey_version integer;
update form1_responses set survey_version = 1 where survey_version is null;
update form2_responses set survey_version = 1 where survey_version is null;
alter table form1_responses alter column survey_version set default 2;
alter table form2_responses alter column survey_version set default 2;
alter table form1_responses alter column survey_version set not null;
alter table form2_responses alter column survey_version set not null;
alter table form1_responses drop constraint if exists form1_responses_browser_id_key;
alter table form1_responses drop constraint if exists form1_responses_browser_id_unique;
alter table form2_responses drop constraint if exists form2_responses_browser_id_key;
alter table form2_responses drop constraint if exists form2_responses_browser_id_unique;
create unique index if not exists form1_browser_version_unique on form1_responses (browser_id, survey_version);
create unique index if not exists form2_browser_version_unique on form2_responses (browser_id, survey_version);



DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'form1_v2_answer_domain_check') THEN
    ALTER TABLE form1_responses ADD CONSTRAINT form1_v2_answer_domain_check CHECK (
      survey_version <> 2 OR (
        (q_avoid IS NULL OR q_avoid IN ('morning','evening')) AND
        (q_weekly_off IS NULL OR q_weekly_off IN ('one_day_off','daily')) AND
        (q_between_classes IS NULL OR q_between_classes IN ('back_to_back','with_break')) AND
        (q_extra_time IS NULL OR q_extra_time IN ('yes','no')) AND
        (q_long_gap IS NULL OR q_long_gap IN ('same_day','different_day')) AND
        (q_midday_break IS NULL OR q_midday_break IN ('mandatory','flexible')) AND
        (q_max_hours IS NULL OR q_max_hours IN ('4_hours','6_hours')) AND
        (q_lab_cap IS NULL OR q_lab_cap IN ('one','two')) AND
        (q_priority_group IS NULL OR q_priority_group IN ('seniors','juniors')) AND
        (q_conflict_student IS NULL OR q_conflict_student IN ('students_first','teacher_first')) AND
        (q_teaching_schedule IS NULL OR q_teaching_schedule IN ('less_days','daily_less')) AND
        (q_zero_day IS NULL OR q_zero_day IN ('yes','no')) AND
        (q_consecutive IS NULL OR q_consecutive IN ('continuous','with_break')) AND
        (q_gap_pref IS NULL OR q_gap_pref IN ('no_gap','consultation')) AND
        (q_faculty_conflict IS NULL OR q_faculty_conflict IN ('seniority_workload','semester_rotation')) AND
        (q_compensate IS NULL OR q_compensate IN ('yes','no')) AND
        (q_conflict_teacher IS NULL OR q_conflict_teacher IN ('students_first','teacher_first'))
      )
    ) NOT VALID;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'form1_v2_role_completeness_check') THEN
    ALTER TABLE form1_responses ADD CONSTRAINT form1_v2_role_completeness_check CHECK (
      survey_version <> 2 OR
      (role = 'Student' AND semester IS NOT NULL AND q_avoid IS NOT NULL AND q_weekly_off IS NOT NULL AND
       q_between_classes IS NOT NULL AND q_extra_time IS NOT NULL AND q_long_gap IS NOT NULL AND
       q_midday_break IS NOT NULL AND q_max_hours IS NOT NULL AND q_lab_cap IS NOT NULL AND
       q_priority_group IS NOT NULL AND q_conflict_student IS NOT NULL AND
       q_teaching_schedule IS NULL AND q_zero_day IS NULL AND q_consecutive IS NULL AND q_gap_pref IS NULL AND
       q_faculty_conflict IS NULL AND q_compensate IS NULL AND q_conflict_teacher IS NULL)
      OR
      (role = 'Teacher' AND semester IS NULL AND q_avoid IS NULL AND q_weekly_off IS NULL AND
       q_between_classes IS NULL AND q_extra_time IS NULL AND q_long_gap IS NULL AND q_midday_break IS NULL AND
       q_max_hours IS NULL AND q_lab_cap IS NULL AND q_priority_group IS NULL AND q_conflict_student IS NULL AND
       q_teaching_schedule IS NOT NULL AND q_zero_day IS NOT NULL AND q_consecutive IS NOT NULL AND
       q_gap_pref IS NOT NULL AND q_faculty_conflict IS NOT NULL AND q_compensate IS NOT NULL AND
       q_conflict_teacher IS NOT NULL)
    ) NOT VALID;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'form2_rating_range_check') THEN
    ALTER TABLE form2_responses ADD CONSTRAINT form2_rating_range_check CHECK (
      time_slot_8_00 BETWEEN 1 AND 5 AND time_slot_9_30 BETWEEN 1 AND 5 AND
      time_slot_11_00 BETWEEN 1 AND 5 AND time_slot_12_30 BETWEEN 1 AND 5 AND
      time_slot_14_00 BETWEEN 1 AND 5 AND time_slot_15_30 BETWEEN 1 AND 5 AND
      time_slot_17_00 BETWEEN 1 AND 5 AND long_gap_rating BETWEEN 1 AND 5 AND fairness_rating BETWEEN 1 AND 5
    ) NOT VALID;
  END IF;
END $$;

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
from form2_responses
where survey_version = 2;
