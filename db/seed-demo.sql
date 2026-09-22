-- Demo data so the dashboards are not empty on a fresh install.
-- Safe to remove:  psql "$DATABASE_URL" -c "delete from form1_responses where browser_id like 'demo-%'; delete from form2_responses where browser_id like 'demo-%';"

insert into form1_responses
  (browser_id, role, department, semester, q_avoid, q_weekly_off, q_between_classes, q_extra_time,
   q_long_gap, q_midday_break, q_max_hours, q_lab_cap, q_priority_group, q_conflict_student)
values
  ('demo-s01','Student','CSE','2.1','morning','one_day_off','back_to_back','early','different_day','mandatory','3h','one','seniors','students_first'),
  ('demo-s02','Student','CSE','3.2','evening','one_day_off','with_break','early','different_day','mandatory','4h_plus','one','seniors','students_first'),
  ('demo-s03','Student','EEE','1.1','morning','daily','back_to_back','late','same_day','flexible','3h','two','juniors','students_first'),
  ('demo-s04','Student','CE','4.1','evening','one_day_off','with_break','early','different_day','mandatory','3h','one','seniors','teacher_first'),
  ('demo-s05','Student','BBA','2.2','morning','daily','back_to_back','either','same_day','flexible','4h_plus','two','juniors','students_first'),
  ('demo-s06','Student','English','1.2','evening','one_day_off','with_break','late','different_day','mandatory','3h','one','juniors','students_first'),
  ('demo-s07','Student','Pharmacy','3.1','morning','one_day_off','back_to_back','early','different_day','mandatory','3h','one','seniors','teacher_first'),
  ('demo-s08','Student','CSE','2.2','evening','daily','back_to_back','early','same_day','flexible','4h_plus','one','juniors','students_first'),
  ('demo-s09','Student','EEE','4.2','morning','one_day_off','with_break','late','different_day','mandatory','3h','one','seniors','students_first'),
  ('demo-s10','Student','Law','1.1','evening','daily','back_to_back','early','same_day','flexible','3h','two','juniors','students_first')
on conflict (browser_id) do nothing;

insert into form1_responses
  (browser_id, role, department, q_teaching_schedule, q_zero_day, q_consecutive, q_gap_pref,
   q_faculty_conflict, q_compensate, q_conflict_teacher)
values
  ('demo-t01','Teacher','CSE','less_days','yes','continuous','consultation','seniority','yes','teacher_first'),
  ('demo-t02','Teacher','EEE','daily_less','yes','with_break','consultation','seniority','yes','students_first'),
  ('demo-t03','Teacher','BBA','less_days','yes','continuous','no_gap','first_come','no','teacher_first'),
  ('demo-t04','Teacher','English','daily_less','no','with_break','consultation','seniority','yes','teacher_first')
on conflict (browser_id) do nothing;

insert into form2_responses
  (browser_id, role, department, time_slot_8_00, time_slot_9_30, time_slot_11_00, time_slot_12_30,
   time_slot_14_00, time_slot_15_30, time_slot_17_00, long_gap_rating, fairness_rating, feedback)
values
  ('demo-r01','Student','CSE',2,4,5,4,4,3,1,2,5,'অনেক সময় একই দিনে দুটি ক্লাসের মাঝে ৩ ঘণ্টা ফাঁকা থাকে, যাতায়াত খরচ বেড়ে যায়।'),
  ('demo-r02','Student','CSE',3,5,5,3,3,2,1,2,4,null),
  ('demo-r03','Student','EEE',1,3,5,5,4,2,1,1,5,'ল্যাব ক্লাস যেন দুপুরের বিরতির সাথে না থাকে।'),
  ('demo-r04','Student','CE',2,4,4,4,5,3,2,3,4,null),
  ('demo-r05','Student','BBA',4,5,4,2,3,3,2,3,5,'শিক্ষকদের জন্য গবেষণার দিন রাখা উচিত, তবে শিক্ষার্থীদের ক্লাসও যেন বাদ না পড়ে।'),
  ('demo-r06','Student','English',5,5,4,3,3,2,1,2,4,null),
  ('demo-r07','Student','Pharmacy',2,4,5,4,4,3,2,2,5,null),
  ('demo-r08','Teacher','CSE',1,2,4,5,5,4,3,3,5,'Seniority ও workload বিবেচনা করে AI সিদ্ধান্ত নিলে ভালো হবে।'),
  ('demo-r09','Teacher','EEE',1,3,4,4,5,4,2,2,4,null),
  ('demo-r10','Teacher','BBA',2,3,4,3,4,4,3,3,5,'ধারাবাহিক সেমিস্টারের রুটিন মনে রাখার ব্যবস্থা থাকা দরকার।')
on conflict (browser_id) do nothing;
