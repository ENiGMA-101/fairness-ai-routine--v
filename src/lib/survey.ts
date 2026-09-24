/**
 * Canonical survey specification transcribed from the attached Google Forms.
 * UI, validation, analytics, and database versioning all import from this file.
 */

export const SURVEY_VERSION = 2 as const;

export type Option = { value: string; label: string };
export type Audience = "Student" | "Teacher" | "Both";

export type QuestionDef = {
  /** Stable API/database key. */
  id: string;
  /** Exact Google Forms question text. */
  titleBn: string;
  /** Only set when the Google Form itself contains a second title/subtitle. */
  titleEn?: string;
  options: Option[];
  audience: Audience;
};

export const ROLE_OPTIONS: Option[] = [
  { value: "Student", label: "Student" },
  { value: "Teacher", label: "Teacher" },
];

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

export const DEPARTMENT_OPTIONS: Option[] = DEPARTMENTS.map((department) => ({
  value: department,
  label: department,
}));

/** Form 2 displays ENGLISH in capitals, while storing the same normalized value. */
export const FORM2_DEPARTMENT_OPTIONS: Option[] = DEPARTMENT_OPTIONS.map((option) => ({
  ...option,
  label: option.value === "English" ? "ENGLISH" : option.label,
}));

export const SEMESTERS = ["1.1", "1.2", "2.1", "2.2", "3.1", "3.2", "4.1", "4.2"] as const;

export const STUDENT_SECTION_INTRO = {
  title: "🎓 Student Section",
  english: [
    "The following questions are about your class-time preferences and daily routine.",
    "Please choose the option that you personally prefer.",
    "There are no right or wrong answers.",
  ],
  bangla: [
    "নিচের প্রশ্নগুলো আপনার পছন্দের ক্লাস সময় এবং দৈনন্দিন রুটিন সম্পর্কে।",
    "আপনি ব্যক্তিগতভাবে যে অপশনটি বেশি পছন্দ করেন সেটি নির্বাচন করুন।",
    "এখানে কোনো সঠিক বা ভুল উত্তর নেই।",
  ],
} as const;

export const TEACHER_SECTION_INTRO = {
  title: "👩‍🏫 Teacher Section",
  english: [
    "The following questions are about teaching schedules, workload, preferred times, and fairness.",
    "Please choose the option that you think would make teaching easier and the overall routine fairer.",
  ],
  bangla: [
    "নিচের প্রশ্নগুলো শিক্ষকদের ক্লাসের সময়, ক্লাসের চাপ, পছন্দের সময় এবং ন্যায্যতা সম্পর্কে।",
    "শিক্ষাদান সহজ এবং পুরো রুটিনকে আরও ন্যায্য করতে পারে—আপনি যে অপশনটি মনে করেন সেটি নির্বাচন করুন।",
  ],
} as const;

const YES_NO: Option[] = [
  { value: "yes", label: "হ্যাঁ" },
  { value: "no", label: "না" },
];

const CONFLICT_OPTIONS: Option[] = [
  { value: "students_first", label: "Students first priority" },
  { value: "teacher_first", label: "Teacher first priority" },
];

export const FORM1_QUESTIONS: QuestionDef[] = [
  {
    id: "role",
    titleBn: "Are you a Student or Teacher?",
    audience: "Both",
    options: ROLE_OPTIONS,
  },
  {
    id: "department",
    titleBn: "Which department do you belong to?",
    audience: "Both",
    options: DEPARTMENT_OPTIONS,
  },

  // Student Section — exact order from Google Forms.
  {
    id: "semester",
    titleBn: "1. Which semester are you currently studying in? (focusing on 2 semesters/year)",
    audience: "Student",
    options: SEMESTERS.map((semester) => ({ value: semester, label: semester })),
  },
  {
    id: "q_avoid",
    titleBn: "আপনি কোনটি এড়িয়ে চলতে চান?",
    audience: "Student",
    options: [
      { value: "morning", label: "সকালের প্রথম ক্লাসগুলো এড়িয়ে চলা" },
      { value: "evening", label: "বিকেল বা সন্ধ্যার শেষের ক্লাসগুলো এড়িয়ে চলা" },
    ],
  },
  {
    id: "q_weekly_off",
    titleBn: "সপ্তাহে ১ দিন পুরো ছুটি পাওয়ার জন্য ৪ দিন বেশি সময় (৫–৬ ঘণ্টা) ক্লাস করা।",
    audience: "Student",
    options: [
      { value: "one_day_off", label: "প্রতিদিন অল্প সময়ের ক্লাস করার চেয়ে সপ্তাহে ১ দিন পুরো ছুটি পছন্দ করি" },
      { value: "daily", label: "প্রতিদিন অল্প সময়ের ক্লাস করা পছন্দ করি, পুরো ১ দিন ছুটির দরকার নেই" },
    ],
  },
  {
    id: "q_between_classes",
    titleBn: "একই দিনে দুটি ক্লাসের মাঝে আপনি কোনটি পছন্দ করেন?",
    audience: "Student",
    options: [
      { value: "back_to_back", label: "একটানা একের পর এক ক্লাস" },
      { value: "with_break", label: "ক্লাসের মাঝে কিছু বিরতি থাকা" },
    ],
  },
  {
    id: "q_extra_time",
    titleBn: "যদি আপনাকে একটি অসুবিধাজনক ক্লাসের সময় বেছে নিতেই হয়, তবে আপনি কি সেটি পছন্দ করবেন?",
    audience: "Student",
    options: YES_NO,
  },
  {
    id: "q_long_gap",
    titleBn: "দুটি ক্লাসের মাঝে যদি দীর্ঘ বিরতি (২ ঘণ্টা ৪০ মিনিট বা তার বেশি) থাকে, তবে কোনটি ভালো?",
    audience: "Student",
    options: [
      { value: "same_day", label: "দুটি ক্লাস একই দিনে রাখা" },
      { value: "different_day", label: "একটি ক্লাস অন্য দিনে স্থানান্তর করা" },
    ],
  },
  {
    id: "q_midday_break",
    titleBn: "দুপুরের বিরতি (১:০০টা – ২:২০টা) কীভাবে নির্ধারণ করা উচিত?",
    audience: "Student",
    options: [
      { value: "mandatory", label: "১:০০টা থেকে ২:২০টা পর্যন্ত সময় ফাঁকা রাখা" },
      { value: "flexible", label: "সময়সূচি নমনীয় ও প্রয়োজন অনুযায়ী পরিবর্তনযোগ্য রাখা" },
    ],
  },
  {
    id: "q_max_hours",
    titleBn: "দিনে কত ঘণ্টার ক্লাস আপনার জন্য মানানসই বা আরামদায়ক?",
    audience: "Student",
    options: [
      { value: "4_hours", label: "দিনে সর্বোচ্চ ৪ ঘণ্টা ক্লাস" },
      { value: "6_hours", label: "দিনে সর্বোচ্চ ৬ ঘণ্টা পর্যন্ত ক্লাস" },
    ],
  },
  {
    id: "q_lab_cap",
    titleBn: "দিনে কতটুকু প্র্যাকটিক্যাল/ল্যাব করা আপনার জন্য মানানসই?",
    audience: "Student",
    options: [
      { value: "one", label: "দিনে একটি ল্যাব" },
      { value: "two", label: "দিনে দুটি ল্যাব" },
    ],
  },
  {
    id: "q_priority_group",
    titleBn: "পছন্দের ক্লাসের সময় পাওয়ার ক্ষেত্রে কাদের (AI)-এর কাছে আগে প্রাধান্য দেওয়া উচিত?",
    audience: "Student",
    options: [
      { value: "seniors", label: "Most সিনিয়রদের আগে Priority" },
      { value: "juniors", label: "জুনিয়রদের আগে Priority" },
    ],
  },
  {
    id: "q_conflict_student",
    titleBn: "শিক্ষার্থী ও শিক্ষকদের পছন্দের মধ্যে দ্বন্দ্ব তৈরি হলে, এক্ষেত্রে (AI) কীভাবে সিদ্ধান্ত নেবে?",
    audience: "Student",
    options: CONFLICT_OPTIONS,
  },

  // Teacher Section — exact order from Google Forms.
  {
    id: "q_teaching_schedule",
    titleBn: "আপনি শিক্ষকতার কোন ধরনের সময়সূচি বেশি পছন্দ করবেন?",
    audience: "Teacher",
    options: [
      { value: "less_days", label: "কম দিনে বেশি ক্লাস নেওয়া" },
      { value: "daily_less", label: "প্রতিদিন কম সংখ্যক ক্লাস নেওয়া" },
    ],
  },
  {
    id: "q_zero_day",
    titleBn: "আপনি কি প্রতি সপ্তাহে ক্লাস ছাড়া পুরো ১ দিন ছুটি পছন্দ করবেন?",
    audience: "Teacher",
    options: YES_NO,
  },
  {
    id: "q_consecutive",
    titleBn: "আপনার যদি পরপর দুটি ১ ঘণ্টা ২০ মিনিটের ক্লাস থাকে, তবে আপনি কোনটি পছন্দ করবেন?",
    audience: "Teacher",
    options: [
      { value: "continuous", label: "বিরতিহীন একটানা ক্লাস" },
      { value: "with_break", label: "দুটি ক্লাসের মাঝে কিছু বিরতি" },
    ],
  },
  {
    id: "q_gap_pref",
    titleBn: "আপনার ক্লাসের মাঝে ফাঁকা সময় থাকলে কোনটি আপনার বেশি পছন্দ?",
    audience: "Teacher",
    options: [
      { value: "no_gap", label: "ছোট বা কম সময়ের বিরতি" },
      { value: "consultation", label: "পাঠদানের মাঝে ১–২ ঘণ্টা কাজের সময় — শিক্ষার্থী পরামর্শ, গবেষণা ইত্যাদি" },
    ],
  },
  {
    id: "q_faculty_conflict",
    titleBn: "দুইজন শিক্ষক যদি একই সময় ও রুম চান, তবে এক্ষেত্রে (AI) কীভাবে সিদ্ধান্ত নেবে?",
    audience: "Teacher",
    options: [
      { value: "seniority_workload", label: "জ্যেষ্ঠতা (সিনিয়রিটি) বা কাজের চাপের উপর ভিত্তি করে অগ্রাধিকার দেওয়া" },
      { value: "semester_rotation", label: "পুনরাবৃত্তি সুযোগ দেওয়া — একজন এই সেমিস্টারে পেলে, অন্যজন পরের সেমিস্টারে পাবেন" },
    ],
  },
  {
    id: "q_compensate",
    titleBn: "কেউ যদি এই সেমিস্টারে খুব কঠিন রুটিন পান, তবে তাদের (AI)-এর কি পরের সেমিস্টারে একটি ভালো রুটিন দেওয়ার চেষ্টা করা উচিত?",
    audience: "Teacher",
    options: YES_NO,
  },
  {
    id: "q_conflict_teacher",
    titleBn: "শিক্ষার্থী ও শিক্ষকদের পছন্দের মধ্যে দ্বন্দ্ব তৈরি হলে, এক্ষেত্রে (AI) কীভাবে সিদ্ধান্ত নেবে?",
    audience: "Teacher",
    options: CONFLICT_OPTIONS,
  },
];

export const STUDENT_QUESTION_IDS = FORM1_QUESTIONS
  .filter((question) => question.audience === "Student")
  .map((question) => question.id);

export const TEACHER_QUESTION_IDS = FORM1_QUESTIONS
  .filter((question) => question.audience === "Teacher")
  .map((question) => question.id);

export const FORM1_REQUIRED_BY_ROLE: Record<"Student" | "Teacher", readonly string[]> = {
  Student: STUDENT_QUESTION_IDS,
  Teacher: TEACHER_QUESTION_IDS,
};

export const FORM1_ALLOWED_VALUES: Record<string, readonly string[]> = Object.fromEntries(
  FORM1_QUESTIONS.map((question) => [question.id, question.options.map((option) => option.value)]),
);

export type SlotDef = { id: string; label: string; range: string };

export const TIME_SLOTS: SlotDef[] = [
  { id: "time_slot_8_00", label: "8:00–9:20", range: "Early morning" },
  { id: "time_slot_9_30", label: "9:30–10:50", range: "Morning" },
  { id: "time_slot_11_00", label: "11:00–12:20", range: "Late morning" },
  { id: "time_slot_12_30", label: "12:30–13:50", range: "Midday" },
  { id: "time_slot_14_00", label: "14:00–15:20", range: "Early afternoon" },
  { id: "time_slot_15_30", label: "15:30–16:50", range: "Late afternoon" },
  { id: "time_slot_17_00", label: "17:00–18:20", range: "Evening" },
];

export const RATING_SCALE = [
  { value: 1, label: "1 = Hate it" },
  { value: 2, label: "2 = Dislike it" },
  { value: 3, label: "3 = Neutral" },
  { value: 4, label: "4 = Like it" },
  { value: 5, label: "5 = Love it" },
] as const;

export const FORM2_COPY = {
  matrixTitle: "1. Time-Slot Preference Rating",
  matrixInstruction: "Rate each time slot:",
  matrixScale: "1 = Hate it | 2 = Dislike it | 3 = Neutral | 4 = Like it | 5 = Love it",
  rowsLabel: "Rows = Time Slots (24-Hour Time)",
  columnsLabel: "Columns = Rating (1–5)",
  longGapTitle: "2. Long Campus Gaps Between Classes (Idle Wait Time)",
  longGapBn: "মনে করুন, আপনার একটি ক্লাস সকালে এবং পরের ক্লাসটি অনেক পরে—মাঝখানে ২ ঘণ্টারও বেশি ফাঁকা সময় আছে।",
  longGapLeft: "আমি এটি একেবারেই পছন্দ করি না / সময়ের অপচয়",
  longGapRight: "আমার এতে সমস্যা নেই / এই সময়টা আমার কাজে লাগে",
  fairnessTitle: "3. Multi-Semester Fairness (Algorithmic Memory)",
  fairnessBn: "ধরুন, কোনো শিক্ষার্থী দল বা শিক্ষক এই সেমিস্টারে একটি খারাপ রুটিন পেলেন। এআই (AI)-এর কি এটি মনে রাখা উচিত এবং পরের সেমিস্টারে তাদের একটি ভালো রুটিন দেওয়ার চেষ্টা করা উচিত?",
  fairnessLeft: "না, প্রতিটি সেমিস্টারকে আলাদাভাবে দেখা উচিত",
  fairnessRight: "হ্যাঁ, এআই-এর উচিত পরের সেমিস্টারে তাদের সুবিধা পুষিয়ে দেওয়া",
  feedbackTitle: "4. Additional Feedback & Constraints",
  feedbackBn: "এআই রুটিন জেনারেটরের বিবেচনা করা উচিত—এমন আর কোনো পরামর্শ বা সমস্যা কি আপনার জানা আছে? আপনার মতামত এখানে লিখুন।",
  feedbackPlaceholder: "Short answer text",
} as const;

export const FORM1_QUESTION_KEYS = FORM1_QUESTIONS.map((question) => question.id);

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

export function questionById(questionId: string): QuestionDef | undefined {
  return FORM1_QUESTIONS.find((question) => question.id === questionId);
}

export function labelFor(questionId: string, value: string | number): string {
  return questionById(questionId)?.options.find((option) => option.value === String(value))?.label ?? String(value);
}
