/**
 * Canonical survey definitions — exact wording preserved from the source PDFs.
 * Shared by the forms (client) and the results dashboards (server).
 */

export type Option = { value: string; label: string };

export type QuestionDef = {
  /** snake_case db column key, also used as the stats API `question` param */
  id: string;
  titleBn: string;
  titleEn?: string;
  options: Option[];
  audience: "Student" | "Teacher" | "Both";
};

export const DEPARTMENTS = [
  "CSE",
  "EEE",
  "CE",
  "BBA",
  "English",
  "Pharmacy",
  "Architecture",
  "Law",
  "Other",
] as const;

export const SEMESTERS = ["1.1", "1.2", "2.1", "2.2", "3.1", "3.2", "4.1", "4.2"] as const;

const YES_NO: Option[] = [
  { value: "yes", label: "হ্যাঁ (Yes)" },
  { value: "no", label: "না (No)" },
];

const CONFLICT_OPTIONS: Option[] = [
  { value: "students_first", label: "শিক্ষার্থীদের পছন্দকে অগ্রাধিকার (Students first)" },
  { value: "teacher_first", label: "শিক্ষকের পছন্দকে অগ্রাধিকার (Teacher first)" },
];

export const FORM1_QUESTIONS: QuestionDef[] = [
  {
    id: "role",
    titleBn: "আপনি কি শিক্ষার্থী, নাকি শিক্ষক?",
    titleEn: "Are you a Student or a Teacher? *",
    audience: "Both",
    options: [
      { value: "Student", label: "Student (শিক্ষার্থী)" },
      { value: "Teacher", label: "Teacher (শিক্ষক)" },
    ],
  },
  {
    id: "department",
    titleBn: "আপনি কোন বিভাগের?",
    titleEn: "Which department do you belong to? *",
    audience: "Both",
    options: DEPARTMENTS.map((d) => ({ value: d, label: d })),
  },
  {
    id: "semester",
    titleBn: "১. আপনি বর্তমানে কোন সেমিস্টারে অধ্যয়নরত? (বছরে ২ সেমিস্টারের উপর গুরুত্ব দিয়ে)",
    titleEn: "1. Which semester are you currently studying in? (Focusing on 2 semesters/year) *",
    audience: "Student",
    options: SEMESTERS.map((s) => ({ value: s, label: s })),
  },
  {
    id: "q_avoid",
    titleBn: "আপনি কোনটি এড়াতে চান?",
    titleEn: "Which would you prefer to avoid? *",
    audience: "Student",
    options: [
      { value: "morning", label: "সকালের ক্লাসগুলো এড়াতে চাই" },
      { value: "evening", label: "বিকেল ও সন্ধ্যার ক্লাসগুলো এড়াতে চাই" },
    ],
  },
  {
    id: "q_weekly_off",
    titleBn:
      "সপ্তাহে ১ দিন পুরোপুরি ছুটি পাওয়ার বদলে ৪ দিন বেশি সময় (২–৩ ঘণ্টা) ক্লাস করা?",
    titleEn:
      "Trade-off between one fully free weekday vs. 4 packed days with 2–3 extra hours *",
    audience: "Student",
    options: [
      {
        value: "one_day_off",
        label: "প্রতিদিন অল্প সময়ের ক্লাসের চেয়ে সপ্তাহে ১ দিন পুরো ছুটি পাওয়া ভালো",
      },
      {
        value: "daily",
        label: "বরং প্রতি দিন অল্প করে ক্লাস নেওয়া ভালো, ১ দিন পুরোপুরি ফাঁকা না রেখে",
      },
    ],
  },
  {
    id: "q_between_classes",
    titleBn: "একই দিনে দুটি ক্লাসের মাঝে আপনার কোনটি পছন্দ করেন?",
    titleEn: "Between two classes on the same day, which do you prefer? *",
    audience: "Student",
    options: [
      { value: "back_to_back", label: "একটানা ক্লাস হোক, গ্যাপ কম" },
      { value: "with_break", label: "মাঝে পর্যাপ্ত বিরতি দিয়ে ক্লাস" },
    ],
  },
  {
    id: "q_extra_time",
    titleBn:
      "যদি আপনাকে একটি অসুবিধাজনক সময়ে ক্লাস বেছে নিতে হয়, তবে আপনি কি সেটি পছন্দ করবেন?",
    titleEn:
      "If you must pick one inconvenient time slot (early morning vs. late evening), which is it? *",
    audience: "Student",
    options: [
      { value: "early", label: "সকাল ৮:০০ – ৯:২০ (Early morning slot, dismissed earlier)" },
      { value: "late", label: "সন্ধ্যা ৫:০০ – ৬:২০ (Late evening slot, late return home)" },
      { value: "either", label: "দুটোই আমার জন্য ঠিক আছে" },
    ],
  },
  {
    id: "q_long_gap",
    titleBn:
      "দুটি ক্লাসের মাঝে যদি দীর্ঘ বিরতি (২ ঘণ্টা ৪০ মিনিট বা তার বেশি) থাকে, তবে কোনটি ভালো?",
    titleEn: "With a long gap (2h40m+) between classes, which arrangement is better? *",
    audience: "Student",
    options: [
      { value: "same_day", label: "দুটি ক্লাস একই দিনে থাকা" },
      { value: "different_day", label: "একটি ক্লাস অন্য দিনে সরিয়ে নেওয়া ভালো" },
    ],
  },
  {
    id: "q_midday_break",
    titleBn: "দুপুরের বিরতি (১:০০টা – ২:২০টা) কীভাবে নির্ধারণ করা উচিত?",
    titleEn: "How should the midday break (1:00 PM – 2:20 PM) be handled? *",
    audience: "Student",
    options: [
      { value: "mandatory", label: "১:০০টা থেকে ২:২০টা পর্যন্ত সময ফাঁকা রাখা (mandatory break)" },
      { value: "flexible", label: "সময়সূচি অনুযায়ী প্রয়োজন অনুযায়ী বিরতির ব্যবস্থা রাখা" },
    ],
  },
  {
    id: "q_max_hours",
    titleBn: "দিনে কত ঘণ্টার টানা ক্লাসের ধকল আপনি সহ্য করতে পারবেন?",
    titleEn: "How many consecutive class hours per day can you sustain? *",
    audience: "Student",
    options: [
      { value: "3h", label: "দিনে সর্বোচ্চ ৩ ঘণ্টা ক্লাস (balanced)" },
      { value: "4h_plus", label: "দিনে সর্বোচ্চ ৪ ঘণ্টা বা তার বেশি ক্লাস (packed day, more off days)" },
    ],
  },
  {
    id: "q_lab_cap",
    titleBn: "দিনে কতগুলো প্র্যাকটিক্যাল / ল্যাব ক্লাস ভালো হয়?",
    titleEn: "How many practical/lab sessions per day are acceptable? *",
    audience: "Student",
    options: [
      { value: "one", label: "দিনে একটা ল্যাব (single 3h lab)" },
      { value: "two", label: "দিনে দুটো ল্যাব (double lab / 6h — too much)" },
    ],
  },
  {
    id: "q_priority_group",
    titleBn:
      "শিক্ষার্থীদের মধ্যে কাদের পছন্দকে (ব্যাচ/সেকশন) অগ্রাধিকার দেওয়া উচিত?",
    titleEn: "Which batch/section preference should get priority? *",
    audience: "Student",
    options: [
      { value: "seniors", label: "সিনিয়রদেরকে Priority (need specific credits to graduate)" },
      { value: "juniors", label: "জুনিয়রদেরকে Priority (help adapt to campus life)" },
    ],
  },
  {
    id: "q_conflict_student",
    titleBn:
      "শিক্ষার্থী ও শিক্ষকদের পছন্দের মধ্যে দ্বন্দ্ব তৈরি হলে, এক্ষেত্রে AI কীভাবে সিদ্ধান্ত নেবে?",
    titleEn: "When student and teacher preferences conflict, how should the AI decide? *",
    audience: "Student",
    options: CONFLICT_OPTIONS,
  },
  {
    id: "q_teaching_schedule",
    titleBn: "আপনি শিক্ষকতার কোন ধরনের সময়সূচি বেশি পছন্দ করবেন?",
    titleEn: "Which teaching schedule pattern do you prefer? *",
    audience: "Teacher",
    options: [
      { value: "less_days", label: "কম দিনে বেশি ক্লাস নেওয়া (high density: 3–4 classes/day)" },
      { value: "daily_less", label: "প্রতিদিন অল্প করে ক্লাস নেওয়া (scattered: 1–2 classes daily)" },
    ],
  },
  {
    id: "q_zero_day",
    titleBn:
      "আপনি কি সপ্তাহে একদিন পুরো ফাঁকা (Zero-Teaching Day) রাখা উচিত বলে মনে করেন?",
    titleEn: "Should there be one fully free (zero-teaching) day per week? *",
    audience: "Teacher",
    options: [
      { value: "yes", label: "হ্যাঁ — গবেষণা / প্রস্তুতির জন্য একদিন ০ ক্লাস" },
      { value: "no", label: "না — সব দিনে হালকা করে ক্লাস থাকুক" },
    ],
  },
  {
    id: "q_consecutive",
    titleBn:
      "পরপর কয়েকটা ক্লাস নেওয়া? আপনি যদি ৩টি পরপর ক্লাস নেন, তবে আপনি কোনটি পছন্দ করবেন?",
    titleEn: "If you teach 3 consecutive classes, which pattern do you prefer? *",
    audience: "Teacher",
    options: [
      { value: "continuous", label: "বিরতিহীন একটানা ক্লাস (back-to-back stretch)" },
      { value: "with_break", label: "দুটি ক্লাসের মাঝে বিরতি" },
    ],
  },
  {
    id: "q_gap_pref",
    titleBn: "আপনার ক্লাসের মাঝে ফাঁকা সময় থাকলে আপনি কোনটি বেশি পছন্দ করবেন?",
    titleEn: "If there are gaps between your classes, which do you prefer? *",
    audience: "Teacher",
    options: [
      { value: "no_gap", label: "ফাঁকা না থাকাই ভালো (minimize gap, no waiting)" },
      { value: "consultation", label: "মাঝে গবেষণা বা শিক্ষার্থীদের জন্য ১–২ ঘণ্টা সময়" },
    ],
  },
  {
    id: "q_faculty_conflict",
    titleBn:
      "দুজন শিক্ষক যদি একই সময় ও তারিখে ক্লাস নিতে চান, তবে AI কীভাবে সিদ্ধান্ত নেবে?",
    titleEn: "If two teachers want the same slot, how should the AI decide? *",
    audience: "Teacher",
    options: [
      { value: "seniority", label: "জ্যেষ্ঠতা ও কাজের চাপ বিবেচনা করে সিদ্ধান্ত নেওয়া" },
      { value: "first_come", label: "যে আগে আবেদন করবে — তাকেই অগ্রাধিকার (first-come first-serve)" },
    ],
  },
  {
    id: "q_compensate",
    titleBn:
      "একই শিক্ষক যদি বার বার খারাপ সময়ে ক্লাস পান, তাহলে পরের সেমিস্টারে ভালো রুটিন দেওয়া উচিত?",
    titleEn:
      "If a teacher repeatedly gets unfavorable slots, should the next semester compensate them? *",
    audience: "Teacher",
    options: [
      { value: "yes", label: "হ্যাঁ — পরের সেমিস্টারে প্রাধান্য দেওয়া সময় দেওয়া উচিত" },
      { value: "no", label: "না — প্রতিটি সেমিস্টার আলাদাভাবে দেখা উচিত" },
    ],
  },
  {
    id: "q_conflict_teacher",
    titleBn:
      "শিক্ষার্থী ও শিক্ষকদের পছন্দের মধ্যে দ্বন্দ্ব তৈরি হলে, এক্ষেত্রে AI কীভাবে সিদ্ধান্ত নেবে?",
    titleEn: "When student and teacher preferences conflict, how should the AI decide? *",
    audience: "Teacher",
    options: CONFLICT_OPTIONS,
  },
];

export type SlotDef = { id: string; label: string; range: string };

export const TIME_SLOTS: SlotDef[] = [
  { id: "time_slot_8_00", label: "8:00 – 9:20", range: "Early morning" },
  { id: "time_slot_9_30", label: "9:30 – 10:50", range: "Morning" },
  { id: "time_slot_11_00", label: "11:00 – 12:20", range: "Late morning" },
  { id: "time_slot_12_30", label: "12:30 – 13:50", range: "Midday" },
  { id: "time_slot_14_00", label: "14:00 – 15:20", range: "Early afternoon" },
  { id: "time_slot_15_30", label: "15:30 – 16:50", range: "Late afternoon" },
  { id: "time_slot_17_00", label: "17:00 – 18:20", range: "Evening" },
];

export const RATING_SCALE = [
  { value: 1, label: "1 — Hate it" },
  { value: 2, label: "2 — Dislike" },
  { value: 3, label: "3 — Neutral" },
  { value: 4, label: "4 — Like" },
  { value: 5, label: "5 — Love it" },
];

export const FORM1_QUESTION_KEYS = FORM1_QUESTIONS.map((q) => q.id);

export const FORM1_COLUMN_KEYS = [
  "role",
  "department",
  "semester",
  "q_avoid",
  "q_weekly_off",
  "q_between_classes",
  "q_extra_time",
  "q_long_gap",
  "q_midday_break",
  "q_max_hours",
  "q_lab_cap",
  "q_priority_group",
  "q_conflict_student",
  "q_teaching_schedule",
  "q_zero_day",
  "q_consecutive",
  "q_gap_pref",
  "q_faculty_conflict",
  "q_compensate",
  "q_conflict_teacher",
] as const;

export type Form1ColumnKey = (typeof FORM1_COLUMN_KEYS)[number];

export const FORM2_COLUMN_KEYS = [
  "role",
  "department",
  "time_slot_8_00",
  "time_slot_9_30",
  "time_slot_11_00",
  "time_slot_12_30",
  "time_slot_14_00",
  "time_slot_15_30",
  "time_slot_17_00",
  "long_gap_rating",
  "fairness_rating",
] as const;

export type Form2ColumnKey = (typeof FORM2_COLUMN_KEYS)[number];

export function labelFor(questionId: string, value: string | number): string {
  const q = FORM1_QUESTIONS.find((item) => item.id === questionId);
  const found = q?.options.find((o) => o.value === String(value));
  return found?.label ?? String(value);
}
