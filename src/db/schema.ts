import { sql } from "drizzle-orm";
import { check, integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { SURVEY_VERSION } from "@/lib/survey";

/** Form 1 — exact Student & Teacher Google Forms survey (versioned). */
export const form1Responses = pgTable(
  "form1_responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    browserId: text("browser_id").notNull(),
    surveyVersion: integer("survey_version").notNull().default(SURVEY_VERSION),
    role: text("role").notNull(),
    department: text("department").notNull(),
    departmentOther: text("department_other"),
    semester: text("semester"),
    qAvoid: text("q_avoid"),
    qWeeklyOff: text("q_weekly_off"),
    qBetweenClasses: text("q_between_classes"),
    qExtraTime: text("q_extra_time"),
    qLongGap: text("q_long_gap"),
    qMiddayBreak: text("q_midday_break"),
    qMaxHours: text("q_max_hours"),
    qLabCap: text("q_lab_cap"),
    qPriorityGroup: text("q_priority_group"),
    qConflictStudent: text("q_conflict_student"),
    qTeachingSchedule: text("q_teaching_schedule"),
    qZeroDay: text("q_zero_day"),
    qConsecutive: text("q_consecutive"),
    qGapPref: text("q_gap_pref"),
    qFacultyConflict: text("q_faculty_conflict"),
    qCompensate: text("q_compensate"),
    qConflictTeacher: text("q_conflict_teacher"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("form1_browser_version_unique").on(table.browserId, table.surveyVersion),
    check("form1_role_check", sql`${table.role} in ('Student', 'Teacher')`),
    check(
      "form1_v2_answer_domain_check",
      sql`${table.surveyVersion} <> 2 or (
        (${table.qAvoid} is null or ${table.qAvoid} in ('morning', 'evening')) and
        (${table.qWeeklyOff} is null or ${table.qWeeklyOff} in ('one_day_off', 'daily')) and
        (${table.qBetweenClasses} is null or ${table.qBetweenClasses} in ('back_to_back', 'with_break')) and
        (${table.qExtraTime} is null or ${table.qExtraTime} in ('yes', 'no')) and
        (${table.qLongGap} is null or ${table.qLongGap} in ('same_day', 'different_day')) and
        (${table.qMiddayBreak} is null or ${table.qMiddayBreak} in ('mandatory', 'flexible')) and
        (${table.qMaxHours} is null or ${table.qMaxHours} in ('4_hours', '6_hours')) and
        (${table.qLabCap} is null or ${table.qLabCap} in ('one', 'two')) and
        (${table.qPriorityGroup} is null or ${table.qPriorityGroup} in ('seniors', 'juniors')) and
        (${table.qConflictStudent} is null or ${table.qConflictStudent} in ('students_first', 'teacher_first')) and
        (${table.qTeachingSchedule} is null or ${table.qTeachingSchedule} in ('less_days', 'daily_less')) and
        (${table.qZeroDay} is null or ${table.qZeroDay} in ('yes', 'no')) and
        (${table.qConsecutive} is null or ${table.qConsecutive} in ('continuous', 'with_break')) and
        (${table.qGapPref} is null or ${table.qGapPref} in ('no_gap', 'consultation')) and
        (${table.qFacultyConflict} is null or ${table.qFacultyConflict} in ('seniority_workload', 'semester_rotation')) and
        (${table.qCompensate} is null or ${table.qCompensate} in ('yes', 'no')) and
        (${table.qConflictTeacher} is null or ${table.qConflictTeacher} in ('students_first', 'teacher_first'))
      )`,
    ),
    check(
      "form1_v2_role_completeness_check",
      sql`${table.surveyVersion} <> 2 or (
        (${table.role} = 'Student' and
          ${table.semester} is not null and ${table.qAvoid} is not null and ${table.qWeeklyOff} is not null and
          ${table.qBetweenClasses} is not null and ${table.qExtraTime} is not null and ${table.qLongGap} is not null and
          ${table.qMiddayBreak} is not null and ${table.qMaxHours} is not null and ${table.qLabCap} is not null and
          ${table.qPriorityGroup} is not null and ${table.qConflictStudent} is not null and
          ${table.qTeachingSchedule} is null and ${table.qZeroDay} is null and ${table.qConsecutive} is null and
          ${table.qGapPref} is null and ${table.qFacultyConflict} is null and ${table.qCompensate} is null and
          ${table.qConflictTeacher} is null)
        or
        (${table.role} = 'Teacher' and
          ${table.semester} is null and ${table.qAvoid} is null and ${table.qWeeklyOff} is null and
          ${table.qBetweenClasses} is null and ${table.qExtraTime} is null and ${table.qLongGap} is null and
          ${table.qMiddayBreak} is null and ${table.qMaxHours} is null and ${table.qLabCap} is null and
          ${table.qPriorityGroup} is null and ${table.qConflictStudent} is null and
          ${table.qTeachingSchedule} is not null and ${table.qZeroDay} is not null and ${table.qConsecutive} is not null and
          ${table.qGapPref} is not null and ${table.qFacultyConflict} is not null and ${table.qCompensate} is not null and
          ${table.qConflictTeacher} is not null)
      )`,
    ),
  ],
);

/** Form 2 — exact Time-Slot Rating Google Form (versioned). */
export const form2Responses = pgTable(
  "form2_responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    browserId: text("browser_id").notNull(),
    surveyVersion: integer("survey_version").notNull().default(SURVEY_VERSION),
    role: text("role").notNull(),
    department: text("department").notNull(),
    departmentOther: text("department_other"),
    timeSlot800: integer("time_slot_8_00").notNull(),
    timeSlot930: integer("time_slot_9_30").notNull(),
    timeSlot1100: integer("time_slot_11_00").notNull(),
    timeSlot1230: integer("time_slot_12_30").notNull(),
    timeSlot1400: integer("time_slot_14_00").notNull(),
    timeSlot1530: integer("time_slot_15_30").notNull(),
    timeSlot1700: integer("time_slot_17_00").notNull(),
    longGapRating: integer("long_gap_rating").notNull(),
    fairnessRating: integer("fairness_rating").notNull(),
    feedback: text("feedback"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("form2_browser_version_unique").on(table.browserId, table.surveyVersion),
    check("form2_role_check", sql`${table.role} in ('Student', 'Teacher')`),
    check(
      "form2_rating_range_check",
      sql`${table.timeSlot800} between 1 and 5
        and ${table.timeSlot930} between 1 and 5
        and ${table.timeSlot1100} between 1 and 5
        and ${table.timeSlot1230} between 1 and 5
        and ${table.timeSlot1400} between 1 and 5
        and ${table.timeSlot1530} between 1 and 5
        and ${table.timeSlot1700} between 1 and 5
        and ${table.longGapRating} between 1 and 5
        and ${table.fairnessRating} between 1 and 5`,
    ),
  ],
);

export type Form1Row = typeof form1Responses.$inferSelect;
export type Form2Row = typeof form2Responses.$inferSelect;
