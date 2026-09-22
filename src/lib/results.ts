import { desc } from "drizzle-orm";
import { db, ensureTablesExist, isDatabaseConfigured } from "@/db";
import { form1Responses, form2Responses, type Form1Row, type Form2Row } from "@/db/schema";
import { FORM1_QUESTIONS, TIME_SLOTS, labelFor } from "./survey";

export type DistRow = { value: string; label: string; count: number; percent: number };
export type Distribution = {
  id: string;
  title: string;
  titleEn?: string;
  total: number;
  rows: DistRow[];
};
export type RatingSummary = {
  id: string;
  label: string;
  range?: string;
  average: number;
  total: number;
  distribution: DistRow[];
};

const FORM1_ROW_KEYS: Record<string, keyof Form1Row> = {
  role: "role",
  department: "department",
  semester: "semester",
  q_avoid: "qAvoid",
  q_weekly_off: "qWeeklyOff",
  q_between_classes: "qBetweenClasses",
  q_extra_time: "qExtraTime",
  q_long_gap: "qLongGap",
  q_midday_break: "qMiddayBreak",
  q_max_hours: "qMaxHours",
  q_lab_cap: "qLabCap",
  q_priority_group: "qPriorityGroup",
  q_conflict_student: "qConflictStudent",
  q_teaching_schedule: "qTeachingSchedule",
  q_zero_day: "qZeroDay",
  q_consecutive: "qConsecutive",
  q_gap_pref: "qGapPref",
  q_faculty_conflict: "qFacultyConflict",
  q_compensate: "qCompensate",
  q_conflict_teacher: "qConflictTeacher",
};

const FORM2_ROW_KEYS: Record<string, keyof Form2Row> = {
  role: "role",
  department: "department",
  time_slot_8_00: "timeSlot800",
  time_slot_9_30: "timeSlot930",
  time_slot_11_00: "timeSlot1100",
  time_slot_12_30: "timeSlot1230",
  time_slot_14_00: "timeSlot1400",
  time_slot_15_30: "timeSlot1530",
  time_slot_17_00: "timeSlot1700",
  long_gap_rating: "longGapRating",
  fairness_rating: "fairnessRating",
};

function tally(values: (string | number | null)[], questionId?: string): DistRow[] {
  const counts = new Map<string, number>();
  let total = 0;
  for (const raw of values) {
    if (raw === null || raw === undefined || raw === "") continue;
    const key = String(raw);
    counts.set(key, (counts.get(key) ?? 0) + 1);
    total += 1;
  }
  const order = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  return order.map(([value, count]) => ({
    value,
    label: questionId ? labelFor(questionId, value) : value,
    count,
    percent: total ? Math.round((count / total) * 100) : 0,
  }));
}

function averageOf(values: number[]): number {
  if (!values.length) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
}

export type Form1Results = {
  totalResponses: number;
  students: number;
  teachers: number;
  distributions: Distribution[];
  recent: { role: string; department: string; createdAt: string }[];
};

export async function getForm1Results(): Promise<Form1Results> {
  if (!isDatabaseConfigured()) {
    return {
      totalResponses: 0,
      students: 0,
      teachers: 0,
      distributions: FORM1_QUESTIONS.map((q) => ({
        id: q.id,
        title: q.titleBn,
        titleEn: q.titleEn,
        total: 0,
        rows: [],
      })),
      recent: [],
    };
  }

  await ensureTablesExist();
  const rows = await db.select().from(form1Responses).orderBy(desc(form1Responses.createdAt));

  const distributions: Distribution[] = FORM1_QUESTIONS.map((q) => {
    const key = FORM1_ROW_KEYS[q.id];
    const values = rows.map((r) => (r[key] as string | null) ?? null);
    const distRows = tally(values, q.id);
    const total = distRows.reduce((sum, r) => sum + r.count, 0);
    return { id: q.id, title: q.titleBn, titleEn: q.titleEn, total, rows: distRows };
  });

  return {
    totalResponses: rows.length,
    students: rows.filter((r) => r.role === "Student").length,
    teachers: rows.filter((r) => r.role === "Teacher").length,
    distributions,
    recent: rows.slice(0, 8).map((r) => ({
      role: r.role,
      department: r.departmentOther ?? r.department,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

export type Form2Results = {
  totalResponses: number;
  students: number;
  teachers: number;
  slots: RatingSummary[];
  longGap: RatingSummary;
  fairness: RatingSummary;
  roleSplit: Distribution;
  departmentSplit: Distribution;
  feedback: { text: string; role: string; department: string }[];
  bestSlot?: RatingSummary;
  worstSlot?: RatingSummary;
};

export async function getForm2Results(): Promise<Form2Results> {
  const ratingSummary = (
    id: string,
    label: string,
    range: string | undefined,
    values: number[],
  ): RatingSummary => ({
    id,
    label,
    range,
    average: averageOf(values),
    total: values.length,
    distribution: tally(values),
  });

  if (!isDatabaseConfigured()) {
    const emptySlots = TIME_SLOTS.map((s) => ratingSummary(s.id, s.label, s.range, []));
    return {
      totalResponses: 0,
      students: 0,
      teachers: 0,
      slots: emptySlots,
      longGap: ratingSummary("long_gap_rating", "Long campus gaps", undefined, []),
      fairness: ratingSummary("fairness_rating", "Multi-semester fairness", undefined, []),
      roleSplit: { id: "role", title: "Role", total: 0, rows: [] },
      departmentSplit: { id: "department", title: "Department", total: 0, rows: [] },
      feedback: [],
    };
  }

  await ensureTablesExist();
  const rows = await db.select().from(form2Responses).orderBy(desc(form2Responses.createdAt));

  const slots = TIME_SLOTS.map((slot) => {
    const key = FORM2_ROW_KEYS[slot.id];
    const values = rows.map((r) => r[key] as number);
    return ratingSummary(slot.id, slot.label, slot.range, values);
  });

  const sorted = [...slots].sort((a, b) => b.average - a.average);

  return {
    totalResponses: rows.length,
    students: rows.filter((r) => r.role === "Student").length,
    teachers: rows.filter((r) => r.role === "Teacher").length,
    slots,
    longGap: ratingSummary(
      "long_gap_rating",
      "Long campus gaps between classes (idle wait time)",
      undefined,
      rows.map((r) => r.longGapRating),
    ),
    fairness: ratingSummary(
      "fairness_rating",
      "Multi-semester fairness (algorithmic memory)",
      undefined,
      rows.map((r) => r.fairnessRating),
    ),
    roleSplit: {
      id: "role",
      title: "Role",
      total: rows.length,
      rows: tally(rows.map((r) => r.role)),
    },
    departmentSplit: {
      id: "department",
      title: "Department",
      total: rows.length,
      rows: tally(rows.map((r) => r.department)),
    },
    feedback: rows
      .filter((r) => r.feedback && r.feedback.trim().length > 0)
      .slice(0, 40)
      .map((r) => ({
        text: r.feedback as string,
        role: r.role,
        department: r.departmentOther ?? r.department,
      })),
    bestSlot: sorted[0],
    worstSlot: sorted[sorted.length - 1],
  };
}

export { FORM1_ROW_KEYS, FORM2_ROW_KEYS };
