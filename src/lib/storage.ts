import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export type Form1Record = {
  id: string;
  browserId: string;
  role: string;
  department: string;
  departmentOther: string | null;
  semester: string | null;
  qAvoid: string | null;
  qWeeklyOff: string | null;
  qBetweenClasses: string | null;
  qExtraTime: string | null;
  qLongGap: string | null;
  qMiddayBreak: string | null;
  qMaxHours: string | null;
  qLabCap: string | null;
  qPriorityGroup: string | null;
  qConflictStudent: string | null;
  qTeachingSchedule: string | null;
  qZeroDay: string | null;
  qConsecutive: string | null;
  qGapPref: string | null;
  qFacultyConflict: string | null;
  qCompensate: string | null;
  qConflictTeacher: string | null;
  createdAt: string;
};

export type Form2Record = {
  id: string;
  browserId: string;
  role: string;
  department: string;
  departmentOther: string | null;
  timeSlot800: number;
  timeSlot930: number;
  timeSlot1100: number;
  timeSlot1230: number;
  timeSlot1400: number;
  timeSlot1530: number;
  timeSlot1700: number;
  longGapRating: number;
  fairnessRating: number;
  feedback: string | null;
  createdAt: string;
};

type StoreData = {
  form1: Form1Record[];
  form2: Form2Record[];
};

// Seed demo data so dashboard charts look alive from the start
const INITIAL_FORM1: Form1Record[] = [
  { id: "demo-s01", browserId: "demo-s01", role: "Student", department: "CSE", departmentOther: null, semester: "2.1", qAvoid: "morning", qWeeklyOff: "one_day_off", qBetweenClasses: "back_to_back", qExtraTime: "early", qLongGap: "different_day", qMiddayBreak: "mandatory", qMaxHours: "3h", qLabCap: "one", qPriorityGroup: "seniors", qConflictStudent: "students_first", qTeachingSchedule: null, qZeroDay: null, qConsecutive: null, qGapPref: null, qFacultyConflict: null, qCompensate: null, qConflictTeacher: null, createdAt: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: "demo-s02", browserId: "demo-s02", role: "Student", department: "CSE", departmentOther: null, semester: "3.2", qAvoid: "evening", qWeeklyOff: "one_day_off", qBetweenClasses: "with_break", qExtraTime: "early", qLongGap: "different_day", qMiddayBreak: "mandatory", qMaxHours: "4h_plus", qLabCap: "one", qPriorityGroup: "seniors", qConflictStudent: "students_first", qTeachingSchedule: null, qZeroDay: null, qConsecutive: null, qGapPref: null, qFacultyConflict: null, qCompensate: null, qConflictTeacher: null, createdAt: new Date(Date.now() - 3600000 * 20).toISOString() },
  { id: "demo-s03", browserId: "demo-s03", role: "Student", department: "EEE", departmentOther: null, semester: "1.1", qAvoid: "morning", qWeeklyOff: "daily", qBetweenClasses: "back_to_back", qExtraTime: "late", qLongGap: "same_day", qMiddayBreak: "flexible", qMaxHours: "3h", qLabCap: "two", qPriorityGroup: "juniors", qConflictStudent: "students_first", qTeachingSchedule: null, qZeroDay: null, qConsecutive: null, qGapPref: null, qFacultyConflict: null, qCompensate: null, qConflictTeacher: null, createdAt: new Date(Date.now() - 3600000 * 18).toISOString() },
  { id: "demo-s04", browserId: "demo-s04", role: "Student", department: "CE", departmentOther: null, semester: "4.1", qAvoid: "evening", qWeeklyOff: "one_day_off", qBetweenClasses: "with_break", qExtraTime: "early", qLongGap: "different_day", qMiddayBreak: "mandatory", qMaxHours: "3h", qLabCap: "one", qPriorityGroup: "seniors", qConflictStudent: "teacher_first", qTeachingSchedule: null, qZeroDay: null, qConsecutive: null, qGapPref: null, qFacultyConflict: null, qCompensate: null, qConflictTeacher: null, createdAt: new Date(Date.now() - 3600000 * 15).toISOString() },
  { id: "demo-s05", browserId: "demo-s05", role: "Student", department: "BBA", departmentOther: null, semester: "2.2", qAvoid: "morning", qWeeklyOff: "daily", qBetweenClasses: "back_to_back", qExtraTime: "either", qLongGap: "same_day", qMiddayBreak: "flexible", qMaxHours: "4h_plus", qLabCap: "two", qPriorityGroup: "juniors", qConflictStudent: "students_first", qTeachingSchedule: null, qZeroDay: null, qConsecutive: null, qGapPref: null, qFacultyConflict: null, qCompensate: null, qConflictTeacher: null, createdAt: new Date(Date.now() - 3600000 * 12).toISOString() },
  { id: "demo-s06", browserId: "demo-s06", role: "Student", department: "English", departmentOther: null, semester: "1.2", qAvoid: "evening", qWeeklyOff: "one_day_off", qBetweenClasses: "with_break", qExtraTime: "late", qLongGap: "different_day", qMiddayBreak: "mandatory", qMaxHours: "3h", qLabCap: "one", qPriorityGroup: "juniors", qConflictStudent: "students_first", qTeachingSchedule: null, qZeroDay: null, qConsecutive: null, qGapPref: null, qFacultyConflict: null, qCompensate: null, qConflictTeacher: null, createdAt: new Date(Date.now() - 3600000 * 10).toISOString() },
  { id: "demo-s07", browserId: "demo-s07", role: "Student", department: "Pharmacy", departmentOther: null, semester: "3.1", qAvoid: "morning", qWeeklyOff: "one_day_off", qBetweenClasses: "back_to_back", qExtraTime: "early", qLongGap: "different_day", qMiddayBreak: "mandatory", qMaxHours: "3h", qLabCap: "one", qPriorityGroup: "seniors", qConflictStudent: "teacher_first", qTeachingSchedule: null, qZeroDay: null, qConsecutive: null, qGapPref: null, qFacultyConflict: null, qCompensate: null, qConflictTeacher: null, createdAt: new Date(Date.now() - 3600000 * 8).toISOString() },
  { id: "demo-s08", browserId: "demo-s08", role: "Student", department: "CSE", departmentOther: null, semester: "2.2", qAvoid: "evening", qWeeklyOff: "daily", qBetweenClasses: "back_to_back", qExtraTime: "early", qLongGap: "same_day", qMiddayBreak: "flexible", qMaxHours: "4h_plus", qLabCap: "one", qPriorityGroup: "juniors", qConflictStudent: "students_first", qTeachingSchedule: null, qZeroDay: null, qConsecutive: null, qGapPref: null, qFacultyConflict: null, qCompensate: null, qConflictTeacher: null, createdAt: new Date(Date.now() - 3600000 * 6).toISOString() },
  { id: "demo-s09", browserId: "demo-s09", role: "Student", department: "EEE", departmentOther: null, semester: "4.2", qAvoid: "morning", qWeeklyOff: "one_day_off", qBetweenClasses: "with_break", qExtraTime: "late", qLongGap: "different_day", qMiddayBreak: "mandatory", qMaxHours: "3h", qLabCap: "one", qPriorityGroup: "seniors", qConflictStudent: "students_first", qTeachingSchedule: null, qZeroDay: null, qConsecutive: null, qGapPref: null, qFacultyConflict: null, qCompensate: null, qConflictTeacher: null, createdAt: new Date(Date.now() - 3600000 * 4).toISOString() },
  { id: "demo-s10", browserId: "demo-s10", role: "Student", department: "Law", departmentOther: null, semester: "1.1", qAvoid: "evening", qWeeklyOff: "daily", qBetweenClasses: "back_to_back", qExtraTime: "early", qLongGap: "same_day", qMiddayBreak: "flexible", qMaxHours: "3h", qLabCap: "two", qPriorityGroup: "juniors", qConflictStudent: "students_first", qTeachingSchedule: null, qZeroDay: null, qConsecutive: null, qGapPref: null, qFacultyConflict: null, qCompensate: null, qConflictTeacher: null, createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: "demo-t01", browserId: "demo-t01", role: "Teacher", department: "CSE", departmentOther: null, semester: null, qAvoid: null, qWeeklyOff: null, qBetweenClasses: null, qExtraTime: null, qLongGap: null, qMiddayBreak: null, qMaxHours: null, qLabCap: null, qPriorityGroup: null, qConflictStudent: null, qTeachingSchedule: "less_days", qZeroDay: "yes", qConsecutive: "continuous", qGapPref: "consultation", qFacultyConflict: "seniority", qCompensate: "yes", qConflictTeacher: "teacher_first", createdAt: new Date(Date.now() - 3600000 * 22).toISOString() },
  { id: "demo-t02", browserId: "demo-t02", role: "Teacher", department: "EEE", departmentOther: null, semester: null, qAvoid: null, qWeeklyOff: null, qBetweenClasses: null, qExtraTime: null, qLongGap: null, qMiddayBreak: null, qMaxHours: null, qLabCap: null, qPriorityGroup: null, qConflictStudent: null, qTeachingSchedule: "daily_less", qZeroDay: "yes", qConsecutive: "with_break", qGapPref: "consultation", qFacultyConflict: "seniority", qCompensate: "yes", qConflictTeacher: "students_first", createdAt: new Date(Date.now() - 3600000 * 16).toISOString() },
  { id: "demo-t03", browserId: "demo-t03", role: "Teacher", department: "BBA", departmentOther: null, semester: null, qAvoid: null, qWeeklyOff: null, qBetweenClasses: null, qExtraTime: null, qLongGap: null, qMiddayBreak: null, qMaxHours: null, qLabCap: null, qPriorityGroup: null, qConflictStudent: null, qTeachingSchedule: "less_days", qZeroDay: "yes", qConsecutive: "continuous", qGapPref: "no_gap", qFacultyConflict: "first_come", qCompensate: "no", qConflictTeacher: "teacher_first", createdAt: new Date(Date.now() - 3600000 * 11).toISOString() },
  { id: "demo-t04", browserId: "demo-t04", role: "Teacher", department: "English", departmentOther: null, semester: null, qAvoid: null, qWeeklyOff: null, qBetweenClasses: null, qExtraTime: null, qLongGap: null, qMiddayBreak: null, qMaxHours: null, qLabCap: null, qPriorityGroup: null, qConflictStudent: null, qTeachingSchedule: "daily_less", qZeroDay: "no", qConsecutive: "with_break", qGapPref: "consultation", qFacultyConflict: "seniority", qCompensate: "yes", qConflictTeacher: "teacher_first", createdAt: new Date(Date.now() - 3600000 * 3).toISOString() },
];

const INITIAL_FORM2: Form2Record[] = [
  { id: "demo-r01", browserId: "demo-r01", role: "Student", department: "CSE", departmentOther: null, timeSlot800: 2, timeSlot930: 4, timeSlot1100: 5, timeSlot1230: 4, timeSlot1400: 4, timeSlot1530: 3, timeSlot1700: 1, longGapRating: 2, fairnessRating: 5, feedback: "অনেক সময় একই দিনে দুটি ক্লাসের মাঝে ৩ ঘণ্টা ফাঁকা থাকে, যাতায়াত খরচ বেড়ে যায়।", createdAt: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: "demo-r02", browserId: "demo-r02", role: "Student", department: "CSE", departmentOther: null, timeSlot800: 3, timeSlot930: 5, timeSlot1100: 5, timeSlot1230: 3, timeSlot1400: 3, timeSlot1530: 2, timeSlot1700: 1, longGapRating: 2, fairnessRating: 4, feedback: null, createdAt: new Date(Date.now() - 3600000 * 20).toISOString() },
  { id: "demo-r03", browserId: "demo-r03", role: "Student", department: "EEE", departmentOther: null, timeSlot800: 1, timeSlot930: 3, timeSlot1100: 5, timeSlot1230: 5, timeSlot1400: 4, timeSlot1530: 2, timeSlot1700: 1, longGapRating: 1, fairnessRating: 5, feedback: "ল্যাব ক্লাস যেন দুপুরের বিরতির সাথে না থাকে।", createdAt: new Date(Date.now() - 3600000 * 18).toISOString() },
  { id: "demo-r04", browserId: "demo-r04", role: "Student", department: "CE", departmentOther: null, timeSlot800: 2, timeSlot930: 4, timeSlot1100: 4, timeSlot1230: 4, timeSlot1400: 5, timeSlot1530: 3, timeSlot1700: 2, longGapRating: 3, fairnessRating: 4, feedback: null, createdAt: new Date(Date.now() - 3600000 * 14).toISOString() },
  { id: "demo-r05", browserId: "demo-r05", role: "Student", department: "BBA", departmentOther: null, timeSlot800: 4, timeSlot930: 5, timeSlot1100: 4, timeSlot1230: 2, timeSlot1400: 3, timeSlot1530: 3, timeSlot1700: 2, longGapRating: 3, fairnessRating: 5, feedback: "শিক্ষকদের জন্য গবেষণার দিন রাখা উচিত, তবে শিক্ষার্থীদের ক্লাসও যেন বাদ না পড়ে।", createdAt: new Date(Date.now() - 3600000 * 12).toISOString() },
  { id: "demo-r06", browserId: "demo-r06", role: "Student", department: "English", departmentOther: null, timeSlot800: 5, timeSlot930: 5, timeSlot1100: 4, timeSlot1230: 3, timeSlot1400: 3, timeSlot1530: 2, timeSlot1700: 1, longGapRating: 2, fairnessRating: 4, feedback: null, createdAt: new Date(Date.now() - 3600000 * 10).toISOString() },
  { id: "demo-r07", browserId: "demo-r07", role: "Student", department: "Pharmacy", departmentOther: null, timeSlot800: 2, timeSlot930: 4, timeSlot1100: 5, timeSlot1230: 4, timeSlot1400: 4, timeSlot1530: 3, timeSlot1700: 2, longGapRating: 2, fairnessRating: 5, feedback: null, createdAt: new Date(Date.now() - 3600000 * 8).toISOString() },
  { id: "demo-r08", browserId: "demo-r08", role: "Teacher", department: "CSE", departmentOther: null, timeSlot800: 1, timeSlot930: 2, timeSlot1100: 4, timeSlot1230: 5, timeSlot1400: 5, timeSlot1530: 4, timeSlot1700: 3, longGapRating: 3, fairnessRating: 5, feedback: "Seniority ও workload বিবেচনা করে AI সিদ্ধান্ত নিলে ভালো হবে।", createdAt: new Date(Date.now() - 3600000 * 6).toISOString() },
  { id: "demo-r09", browserId: "demo-r09", role: "Teacher", department: "EEE", departmentOther: null, timeSlot800: 1, timeSlot930: 3, timeSlot1100: 4, timeSlot1230: 4, timeSlot1400: 5, timeSlot1530: 4, timeSlot1700: 2, longGapRating: 2, fairnessRating: 4, feedback: null, createdAt: new Date(Date.now() - 3600000 * 4).toISOString() },
  { id: "demo-r10", browserId: "demo-r10", role: "Teacher", department: "BBA", departmentOther: null, timeSlot800: 2, timeSlot930: 3, timeSlot1100: 4, timeSlot1230: 3, timeSlot1400: 4, timeSlot1530: 4, timeSlot1700: 3, longGapRating: 3, fairnessRating: 5, feedback: "ধারাবাহিক সেমিস্টারের রুটিন মনে রাখার ব্যবস্থা থাকা দরকার।", createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
];

function getFilePath(): string {
  // Prefer /tmp in serverless or local directory
  const tmpDir = os.tmpdir();
  return path.join(tmpDir, "fairness_survey_db.json");
}

const memoryStore = globalThis as typeof globalThis & {
  __fairnessStore?: StoreData;
};

export function loadStore(): StoreData {
  if (memoryStore.__fairnessStore) {
    return memoryStore.__fairnessStore;
  }

  const file = getFilePath();
  try {
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.form1) && Array.isArray(parsed.form2)) {
        memoryStore.__fairnessStore = parsed;
        return parsed;
      }
    }
  } catch {
    /* fallback to defaults */
  }

  const initial: StoreData = {
    form1: [...INITIAL_FORM1],
    form2: [...INITIAL_FORM2],
  };
  memoryStore.__fairnessStore = initial;
  saveStore(initial);
  return initial;
}

export function saveStore(data: StoreData): void {
  memoryStore.__fairnessStore = data;
  const file = getFilePath();
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.warn("Could not persist to file:", err);
  }
}

export function addForm1Response(record: Omit<Form1Record, "id" | "createdAt">): {
  ok: boolean;
  id: string;
  duplicate?: boolean;
} {
  const store = loadStore();
  const existing = store.form1.find((r) => r.browserId === record.browserId);
  if (existing) {
    return { ok: false, duplicate: true, id: existing.id };
  }

  const newId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `f1-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const created: Form1Record = {
    ...record,
    id: newId,
    createdAt: new Date().toISOString(),
  };

  store.form1.unshift(created);
  saveStore(store);
  return { ok: true, id: newId };
}

export function addForm2Response(record: Omit<Form2Record, "id" | "createdAt">): {
  ok: boolean;
  id: string;
  duplicate?: boolean;
} {
  const store = loadStore();
  const existing = store.form2.find((r) => r.browserId === record.browserId);
  if (existing) {
    return { ok: false, duplicate: true, id: existing.id };
  }

  const newId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `f2-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const created: Form2Record = {
    ...record,
    id: newId,
    createdAt: new Date().toISOString(),
  };

  store.form2.unshift(created);
  saveStore(store);
  return { ok: true, id: newId };
}

export function getAllForm1(): Form1Record[] {
  return loadStore().form1;
}

export function getAllForm2(): Form2Record[] {
  return loadStore().form2;
}
