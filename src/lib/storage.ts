import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { SURVEY_VERSION } from "@/lib/survey";

export type Form1Record = {
  id: string;
  browserId: string;
  surveyVersion: number;
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
  surveyVersion: number;
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

// Never mix fabricated demo rows into research analytics.
const INITIAL_FORM1: Form1Record[] = [];
const INITIAL_FORM2: Form2Record[] = [];

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
  const existing = store.form1.find((r) => r.browserId === record.browserId && r.surveyVersion === record.surveyVersion);
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
  const existing = store.form2.find((r) => r.browserId === record.browserId && r.surveyVersion === record.surveyVersion);
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
  return loadStore().form1.filter((row) => row.surveyVersion === SURVEY_VERSION);
}

export function getAllForm2(): Form2Record[] {
  return loadStore().form2.filter((row) => row.surveyVersion === SURVEY_VERSION);
}
