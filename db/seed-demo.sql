-- Optional v2 development data. Never run this in the real research database.
-- Remove with: delete from form1_responses where browser_id like 'demo-v2-%';
--              delete from form2_responses where browser_id like 'demo-v2-%';

insert into form1_responses
  (browser_id, survey_version, role, department, semester, q_avoid, q_weekly_off,
   q_between_classes, q_extra_time, q_long_gap, q_midday_break, q_max_hours,
   q_lab_cap, q_priority_group, q_conflict_student)
values
  ('demo-v2-s01',2,'Student','CSE','1.1','morning','one_day_off','back_to_back','yes','same_day','mandatory','4_hours','one','seniors','students_first'),
  ('demo-v2-s02',2,'Student','EEE','2.2','evening','daily','with_break','no','different_day','flexible','6_hours','two','juniors','teacher_first'),
  ('demo-v2-s03',2,'Student','BBA','3.1','morning','one_day_off','with_break','yes','different_day','mandatory','4_hours','one','seniors','students_first')
on conflict (browser_id, survey_version) do nothing;

insert into form1_responses
  (browser_id, survey_version, role, department, q_teaching_schedule, q_zero_day,
   q_consecutive, q_gap_pref, q_faculty_conflict, q_compensate, q_conflict_teacher)
values
  ('demo-v2-t01',2,'Teacher','CSE','less_days','yes','continuous','consultation','seniority_workload','yes','teacher_first'),
  ('demo-v2-t02',2,'Teacher','English','daily_less','no','with_break','no_gap','semester_rotation','yes','students_first')
on conflict (browser_id, survey_version) do nothing;

insert into form2_responses
  (browser_id, survey_version, role, department, time_slot_8_00, time_slot_9_30,
   time_slot_11_00, time_slot_12_30, time_slot_14_00, time_slot_15_30,
   time_slot_17_00, long_gap_rating, fairness_rating, feedback)
values
  ('demo-v2-r01',2,'Student','CSE',2,4,5,4,4,3,1,2,5,'Long gaps make commuting difficult.'),
  ('demo-v2-r02',2,'Student','EEE',1,3,5,5,4,2,1,1,5,null),
  ('demo-v2-r03',2,'Teacher','BBA',2,3,4,3,4,4,3,3,5,'Keep one research day when possible.')
on conflict (browser_id, survey_version) do nothing;
