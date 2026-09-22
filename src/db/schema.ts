import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Form 1 — Student & Teacher Survey (exact questions preserved from the PDFs)
 */
export const form1Responses = pgTable("form1_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  browserId: text("browser_id").notNull().unique(),
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
});

/**
 * Form 2 — Time-Slot Rating Survey
 */
export const form2Responses = pgTable("form2_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  browserId: text("browser_id").notNull().unique(),
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
});

export type Form1Row = typeof form1Responses.$inferSelect;
export type Form2Row = typeof form2Responses.$inferSelect;
