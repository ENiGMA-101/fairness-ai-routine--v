module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/db/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "db",
    ()=>db,
    "pool",
    ()=>pool
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$node$2d$postgres$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/node-postgres/driver.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/node_modules/pg)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$node$2d$postgres$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$node$2d$postgres$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const globalForDb = globalThis;
function getPool() {
    if (!globalForDb.__fairnessPool) {
        const url = process.env.DATABASE_URL;
        if (!url) {
            throw new Error("DATABASE_URL is required — set it in .env (locally) or in your host's environment variables.");
        }
        globalForDb.__fairnessPool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["Pool"]({
            connectionString: url
        });
    }
    return globalForDb.__fairnessPool;
}
function getDb() {
    if (!globalForDb.__fairnessDb) {
        globalForDb.__fairnessDb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$node$2d$postgres$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["drizzle"])(getPool());
    }
    return globalForDb.__fairnessDb;
}
const pool = new Proxy({}, {
    get (_target, prop) {
        const real = getPool();
        const value = real[prop];
        return typeof value === "function" ? value.bind(getPool()) : value;
    }
});
const db = new Proxy({}, {
    get (_target, prop) {
        const real = getDb();
        const value = real[prop];
        return typeof value === "function" ? value.bind(getDb()) : value;
    }
});
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/db/schema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "form1Responses",
    ()=>form1Responses,
    "form2Responses",
    ()=>form2Responses
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/integer.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/table.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/text.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/timestamp.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/uuid.js [app-route] (ecmascript)");
;
const form1Responses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("form1_responses", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("id").primaryKey().defaultRandom(),
    browserId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("browser_id").notNull().unique(),
    role: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("role").notNull(),
    department: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("department").notNull(),
    departmentOther: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("department_other"),
    semester: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("semester"),
    qAvoid: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("q_avoid"),
    qWeeklyOff: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("q_weekly_off"),
    qBetweenClasses: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("q_between_classes"),
    qExtraTime: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("q_extra_time"),
    qLongGap: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("q_long_gap"),
    qMiddayBreak: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("q_midday_break"),
    qMaxHours: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("q_max_hours"),
    qLabCap: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("q_lab_cap"),
    qPriorityGroup: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("q_priority_group"),
    qConflictStudent: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("q_conflict_student"),
    qTeachingSchedule: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("q_teaching_schedule"),
    qZeroDay: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("q_zero_day"),
    qConsecutive: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("q_consecutive"),
    qGapPref: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("q_gap_pref"),
    qFacultyConflict: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("q_faculty_conflict"),
    qCompensate: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("q_compensate"),
    qConflictTeacher: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("q_conflict_teacher"),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at", {
        withTimezone: true
    }).defaultNow().notNull()
});
const form2Responses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("form2_responses", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$uuid$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uuid"])("id").primaryKey().defaultRandom(),
    browserId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("browser_id").notNull().unique(),
    role: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("role").notNull(),
    department: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("department").notNull(),
    departmentOther: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("department_other"),
    timeSlot800: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("time_slot_8_00").notNull(),
    timeSlot930: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("time_slot_9_30").notNull(),
    timeSlot1100: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("time_slot_11_00").notNull(),
    timeSlot1230: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("time_slot_12_30").notNull(),
    timeSlot1400: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("time_slot_14_00").notNull(),
    timeSlot1530: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("time_slot_15_30").notNull(),
    timeSlot1700: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("time_slot_17_00").notNull(),
    longGapRating: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("long_gap_rating").notNull(),
    fairnessRating: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("fairness_rating").notNull(),
    feedback: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("feedback"),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("created_at", {
        withTimezone: true
    }).defaultNow().notNull()
});
}),
"[project]/src/lib/survey.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Canonical survey definitions — exact wording preserved from the source PDFs.
 * Shared by the forms (client) and the results dashboards (server).
 */ __turbopack_context__.s([
    "DEPARTMENTS",
    ()=>DEPARTMENTS,
    "FORM1_COLUMN_KEYS",
    ()=>FORM1_COLUMN_KEYS,
    "FORM1_QUESTIONS",
    ()=>FORM1_QUESTIONS,
    "FORM1_QUESTION_KEYS",
    ()=>FORM1_QUESTION_KEYS,
    "FORM2_COLUMN_KEYS",
    ()=>FORM2_COLUMN_KEYS,
    "RATING_SCALE",
    ()=>RATING_SCALE,
    "SEMESTERS",
    ()=>SEMESTERS,
    "TIME_SLOTS",
    ()=>TIME_SLOTS,
    "labelFor",
    ()=>labelFor
]);
const DEPARTMENTS = [
    "CSE",
    "EEE",
    "CE",
    "BBA",
    "English",
    "Pharmacy",
    "Architecture",
    "Law",
    "Other"
];
const SEMESTERS = [
    "1.1",
    "1.2",
    "2.1",
    "2.2",
    "3.1",
    "3.2",
    "4.1",
    "4.2"
];
const YES_NO = [
    {
        value: "yes",
        label: "হ্যাঁ (Yes)"
    },
    {
        value: "no",
        label: "না (No)"
    }
];
const CONFLICT_OPTIONS = [
    {
        value: "students_first",
        label: "শিক্ষার্থীদের পছন্দকে অগ্রাধিকার (Students first)"
    },
    {
        value: "teacher_first",
        label: "শিক্ষকের পছন্দকে অগ্রাধিকার (Teacher first)"
    }
];
const FORM1_QUESTIONS = [
    {
        id: "role",
        titleBn: "আপনি কি শিক্ষার্থী, নাকি শিক্ষক?",
        titleEn: "Are you a Student or a Teacher? *",
        audience: "Both",
        options: [
            {
                value: "Student",
                label: "Student (শিক্ষার্থী)"
            },
            {
                value: "Teacher",
                label: "Teacher (শিক্ষক)"
            }
        ]
    },
    {
        id: "department",
        titleBn: "আপনি কোন বিভাগের?",
        titleEn: "Which department do you belong to? *",
        audience: "Both",
        options: DEPARTMENTS.map((d)=>({
                value: d,
                label: d
            }))
    },
    {
        id: "semester",
        titleBn: "১. আপনি বর্তমানে কোন সেমিস্টারে অধ্যয়নরত? (বছরে ২ সেমিস্টারের উপর গুরুত্ব দিয়ে)",
        titleEn: "1. Which semester are you currently studying in? (Focusing on 2 semesters/year) *",
        audience: "Student",
        options: SEMESTERS.map((s)=>({
                value: s,
                label: s
            }))
    },
    {
        id: "q_avoid",
        titleBn: "আপনি কোনটি এড়াতে চান?",
        titleEn: "Which would you prefer to avoid? *",
        audience: "Student",
        options: [
            {
                value: "morning",
                label: "সকালের ক্লাসগুলো এড়াতে চাই"
            },
            {
                value: "evening",
                label: "বিকেল ও সন্ধ্যার ক্লাসগুলো এড়াতে চাই"
            }
        ]
    },
    {
        id: "q_weekly_off",
        titleBn: "সপ্তাহে ১ দিন পুরোপুরি ছুটি পাওয়ার বদলে ৪ দিন বেশি সময় (২–৩ ঘণ্টা) ক্লাস করা?",
        titleEn: "Trade-off between one fully free weekday vs. 4 packed days with 2–3 extra hours *",
        audience: "Student",
        options: [
            {
                value: "one_day_off",
                label: "প্রতিদিন অল্প সময়ের ক্লাসের চেয়ে সপ্তাহে ১ দিন পুরো ছুটি পাওয়া ভালো"
            },
            {
                value: "daily",
                label: "বরং প্রতি দিন অল্প করে ক্লাস নেওয়া ভালো, ১ দিন পুরোপুরি ফাঁকা না রেখে"
            }
        ]
    },
    {
        id: "q_between_classes",
        titleBn: "একই দিনে দুটি ক্লাসের মাঝে আপনার কোনটি পছন্দ করেন?",
        titleEn: "Between two classes on the same day, which do you prefer? *",
        audience: "Student",
        options: [
            {
                value: "back_to_back",
                label: "একটানা ক্লাস হোক, গ্যাপ কম"
            },
            {
                value: "with_break",
                label: "মাঝে পর্যাপ্ত বিরতি দিয়ে ক্লাস"
            }
        ]
    },
    {
        id: "q_extra_time",
        titleBn: "যদি আপনাকে একটি অসুবিধাজনক সময়ে ক্লাস বেছে নিতে হয়, তবে আপনি কি সেটি পছন্দ করবেন?",
        titleEn: "If you must pick one inconvenient time slot (early morning vs. late evening), which is it? *",
        audience: "Student",
        options: [
            {
                value: "early",
                label: "সকাল ৮:০০ – ৯:২০ (Early morning slot, dismissed earlier)"
            },
            {
                value: "late",
                label: "সন্ধ্যা ৫:০০ – ৬:২০ (Late evening slot, late return home)"
            },
            {
                value: "either",
                label: "দুটোই আমার জন্য ঠিক আছে"
            }
        ]
    },
    {
        id: "q_long_gap",
        titleBn: "দুটি ক্লাসের মাঝে যদি দীর্ঘ বিরতি (২ ঘণ্টা ৪০ মিনিট বা তার বেশি) থাকে, তবে কোনটি ভালো?",
        titleEn: "With a long gap (2h40m+) between classes, which arrangement is better? *",
        audience: "Student",
        options: [
            {
                value: "same_day",
                label: "দুটি ক্লাস একই দিনে থাকা"
            },
            {
                value: "different_day",
                label: "একটি ক্লাস অন্য দিনে সরিয়ে নেওয়া ভালো"
            }
        ]
    },
    {
        id: "q_midday_break",
        titleBn: "দুপুরের বিরতি (১:০০টা – ২:২০টা) কীভাবে নির্ধারণ করা উচিত?",
        titleEn: "How should the midday break (1:00 PM – 2:20 PM) be handled? *",
        audience: "Student",
        options: [
            {
                value: "mandatory",
                label: "১:০০টা থেকে ২:২০টা পর্যন্ত সময ফাঁকা রাখা (mandatory break)"
            },
            {
                value: "flexible",
                label: "সময়সূচি অনুযায়ী প্রয়োজন অনুযায়ী বিরতির ব্যবস্থা রাখা"
            }
        ]
    },
    {
        id: "q_max_hours",
        titleBn: "দিনে কত ঘণ্টার টানা ক্লাসের ধকল আপনি সহ্য করতে পারবেন?",
        titleEn: "How many consecutive class hours per day can you sustain? *",
        audience: "Student",
        options: [
            {
                value: "3h",
                label: "দিনে সর্বোচ্চ ৩ ঘণ্টা ক্লাস (balanced)"
            },
            {
                value: "4h_plus",
                label: "দিনে সর্বোচ্চ ৪ ঘণ্টা বা তার বেশি ক্লাস (packed day, more off days)"
            }
        ]
    },
    {
        id: "q_lab_cap",
        titleBn: "দিনে কতগুলো প্র্যাকটিক্যাল / ল্যাব ক্লাস ভালো হয়?",
        titleEn: "How many practical/lab sessions per day are acceptable? *",
        audience: "Student",
        options: [
            {
                value: "one",
                label: "দিনে একটা ল্যাব (single 3h lab)"
            },
            {
                value: "two",
                label: "দিনে দুটো ল্যাব (double lab / 6h — too much)"
            }
        ]
    },
    {
        id: "q_priority_group",
        titleBn: "শিক্ষার্থীদের মধ্যে কাদের পছন্দকে (ব্যাচ/সেকশন) অগ্রাধিকার দেওয়া উচিত?",
        titleEn: "Which batch/section preference should get priority? *",
        audience: "Student",
        options: [
            {
                value: "seniors",
                label: "সিনিয়রদেরকে Priority (need specific credits to graduate)"
            },
            {
                value: "juniors",
                label: "জুনিয়রদেরকে Priority (help adapt to campus life)"
            }
        ]
    },
    {
        id: "q_conflict_student",
        titleBn: "শিক্ষার্থী ও শিক্ষকদের পছন্দের মধ্যে দ্বন্দ্ব তৈরি হলে, এক্ষেত্রে AI কীভাবে সিদ্ধান্ত নেবে?",
        titleEn: "When student and teacher preferences conflict, how should the AI decide? *",
        audience: "Student",
        options: CONFLICT_OPTIONS
    },
    {
        id: "q_teaching_schedule",
        titleBn: "আপনি শিক্ষকতার কোন ধরনের সময়সূচি বেশি পছন্দ করবেন?",
        titleEn: "Which teaching schedule pattern do you prefer? *",
        audience: "Teacher",
        options: [
            {
                value: "less_days",
                label: "কম দিনে বেশি ক্লাস নেওয়া (high density: 3–4 classes/day)"
            },
            {
                value: "daily_less",
                label: "প্রতিদিন অল্প করে ক্লাস নেওয়া (scattered: 1–2 classes daily)"
            }
        ]
    },
    {
        id: "q_zero_day",
        titleBn: "আপনি কি সপ্তাহে একদিন পুরো ফাঁকা (Zero-Teaching Day) রাখা উচিত বলে মনে করেন?",
        titleEn: "Should there be one fully free (zero-teaching) day per week? *",
        audience: "Teacher",
        options: [
            {
                value: "yes",
                label: "হ্যাঁ — গবেষণা / প্রস্তুতির জন্য একদিন ০ ক্লাস"
            },
            {
                value: "no",
                label: "না — সব দিনে হালকা করে ক্লাস থাকুক"
            }
        ]
    },
    {
        id: "q_consecutive",
        titleBn: "পরপর কয়েকটা ক্লাস নেওয়া? আপনি যদি ৩টি পরপর ক্লাস নেন, তবে আপনি কোনটি পছন্দ করবেন?",
        titleEn: "If you teach 3 consecutive classes, which pattern do you prefer? *",
        audience: "Teacher",
        options: [
            {
                value: "continuous",
                label: "বিরতিহীন একটানা ক্লাস (back-to-back stretch)"
            },
            {
                value: "with_break",
                label: "দুটি ক্লাসের মাঝে বিরতি"
            }
        ]
    },
    {
        id: "q_gap_pref",
        titleBn: "আপনার ক্লাসের মাঝে ফাঁকা সময় থাকলে আপনি কোনটি বেশি পছন্দ করবেন?",
        titleEn: "If there are gaps between your classes, which do you prefer? *",
        audience: "Teacher",
        options: [
            {
                value: "no_gap",
                label: "ফাঁকা না থাকাই ভালো (minimize gap, no waiting)"
            },
            {
                value: "consultation",
                label: "মাঝে গবেষণা বা শিক্ষার্থীদের জন্য ১–২ ঘণ্টা সময়"
            }
        ]
    },
    {
        id: "q_faculty_conflict",
        titleBn: "দুজন শিক্ষক যদি একই সময় ও তারিখে ক্লাস নিতে চান, তবে AI কীভাবে সিদ্ধান্ত নেবে?",
        titleEn: "If two teachers want the same slot, how should the AI decide? *",
        audience: "Teacher",
        options: [
            {
                value: "seniority",
                label: "জ্যেষ্ঠতা ও কাজের চাপ বিবেচনা করে সিদ্ধান্ত নেওয়া"
            },
            {
                value: "first_come",
                label: "যে আগে আবেদন করবে — তাকেই অগ্রাধিকার (first-come first-serve)"
            }
        ]
    },
    {
        id: "q_compensate",
        titleBn: "একই শিক্ষক যদি বার বার খারাপ সময়ে ক্লাস পান, তাহলে পরের সেমিস্টারে ভালো রুটিন দেওয়া উচিত?",
        titleEn: "If a teacher repeatedly gets unfavorable slots, should the next semester compensate them? *",
        audience: "Teacher",
        options: [
            {
                value: "yes",
                label: "হ্যাঁ — পরের সেমিস্টারে প্রাধান্য দেওয়া সময় দেওয়া উচিত"
            },
            {
                value: "no",
                label: "না — প্রতিটি সেমিস্টার আলাদাভাবে দেখা উচিত"
            }
        ]
    },
    {
        id: "q_conflict_teacher",
        titleBn: "শিক্ষার্থী ও শিক্ষকদের পছন্দের মধ্যে দ্বন্দ্ব তৈরি হলে, এক্ষেত্রে AI কীভাবে সিদ্ধান্ত নেবে?",
        titleEn: "When student and teacher preferences conflict, how should the AI decide? *",
        audience: "Teacher",
        options: CONFLICT_OPTIONS
    }
];
const TIME_SLOTS = [
    {
        id: "time_slot_8_00",
        label: "8:00 – 9:20",
        range: "Early morning"
    },
    {
        id: "time_slot_9_30",
        label: "9:30 – 10:50",
        range: "Morning"
    },
    {
        id: "time_slot_11_00",
        label: "11:00 – 12:20",
        range: "Late morning"
    },
    {
        id: "time_slot_12_30",
        label: "12:30 – 13:50",
        range: "Midday"
    },
    {
        id: "time_slot_14_00",
        label: "14:00 – 15:20",
        range: "Early afternoon"
    },
    {
        id: "time_slot_15_30",
        label: "15:30 – 16:50",
        range: "Late afternoon"
    },
    {
        id: "time_slot_17_00",
        label: "17:00 – 18:20",
        range: "Evening"
    }
];
const RATING_SCALE = [
    {
        value: 1,
        label: "1 — Hate it"
    },
    {
        value: 2,
        label: "2 — Dislike"
    },
    {
        value: 3,
        label: "3 — Neutral"
    },
    {
        value: 4,
        label: "4 — Like"
    },
    {
        value: 5,
        label: "5 — Love it"
    }
];
const FORM1_QUESTION_KEYS = FORM1_QUESTIONS.map((q)=>q.id);
const FORM1_COLUMN_KEYS = [
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
    "q_conflict_teacher"
];
const FORM2_COLUMN_KEYS = [
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
    "fairness_rating"
];
function labelFor(questionId, value) {
    const q = FORM1_QUESTIONS.find((item)=>item.id === questionId);
    const found = q?.options.find((o)=>o.value === String(value));
    return found?.label ?? String(value);
}
}),
"[project]/src/app/api/form1/submit/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/db/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/db/schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$survey$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/survey.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const dynamic = "force-dynamic";
const ROLES = [
    "Student",
    "Teacher"
];
const VALUES = {
    q_avoid: [
        "morning",
        "evening"
    ],
    q_weekly_off: [
        "one_day_off",
        "daily"
    ],
    q_between_classes: [
        "back_to_back",
        "with_break"
    ],
    q_extra_time: [
        "early",
        "late",
        "either"
    ],
    q_long_gap: [
        "same_day",
        "different_day"
    ],
    q_midday_break: [
        "mandatory",
        "flexible"
    ],
    q_max_hours: [
        "3h",
        "4h_plus"
    ],
    q_lab_cap: [
        "one",
        "two"
    ],
    q_priority_group: [
        "seniors",
        "juniors"
    ],
    q_conflict_student: [
        "students_first",
        "teacher_first"
    ],
    q_teaching_schedule: [
        "less_days",
        "daily_less"
    ],
    q_zero_day: [
        "yes",
        "no"
    ],
    q_consecutive: [
        "continuous",
        "with_break"
    ],
    q_gap_pref: [
        "no_gap",
        "consultation"
    ],
    q_faculty_conflict: [
        "seniority",
        "first_come"
    ],
    q_compensate: [
        "yes",
        "no"
    ],
    q_conflict_teacher: [
        "students_first",
        "teacher_first"
    ]
};
async function POST(req) {
    let body;
    try {
        body = await req.json();
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Invalid JSON body"
        }, {
            status: 400
        });
    }
    const browserId = (body.browser_id ?? "").trim();
    const role = (body.role ?? "").trim();
    const department = (body.department ?? "").trim();
    const departmentOther = body.department_other?.toString().trim() || null;
    const answers = body.answers ?? {};
    if (!browserId) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "browser_id is required"
    }, {
        status: 400
    });
    if (!ROLES.includes(role)) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "role is required"
    }, {
        status: 400
    });
    if (!department) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "department is required"
    }, {
        status: 400
    });
    if (department === "Other" && !departmentOther) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Please specify your department"
        }, {
            status: 400
        });
    }
    if (department !== "Other" && !__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$survey$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEPARTMENTS"].includes(department)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Unknown department"
        }, {
            status: 400
        });
    }
    const values = {
        browserId,
        role,
        department,
        departmentOther
    };
    const provided = new Set();
    for (const [key, raw] of Object.entries(answers)){
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$survey$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FORM1_COLUMN_KEYS"].includes(key)) continue;
        const value = raw?.toString().trim();
        if (!value) continue;
        if (key === "role" || key === "department") continue;
        if (key === "semester") {
            if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$survey$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SEMESTERS"].includes(value)) continue;
            values.semester = value;
        } else {
            const allowed = VALUES[key];
            if (!allowed || !allowed.includes(value)) continue;
            const mapped = {
                q_avoid: {
                    qAvoid: value
                },
                q_weekly_off: {
                    qWeeklyOff: value
                },
                q_between_classes: {
                    qBetweenClasses: value
                },
                q_extra_time: {
                    qExtraTime: value
                },
                q_long_gap: {
                    qLongGap: value
                },
                q_midday_break: {
                    qMiddayBreak: value
                },
                q_max_hours: {
                    qMaxHours: value
                },
                q_lab_cap: {
                    qLabCap: value
                },
                q_priority_group: {
                    qPriorityGroup: value
                },
                q_conflict_student: {
                    qConflictStudent: value
                },
                q_teaching_schedule: {
                    qTeachingSchedule: value
                },
                q_zero_day: {
                    qZeroDay: value
                },
                q_consecutive: {
                    qConsecutive: value
                },
                q_gap_pref: {
                    qGapPref: value
                },
                q_faculty_conflict: {
                    qFacultyConflict: value
                },
                q_compensate: {
                    qCompensate: value
                },
                q_conflict_teacher: {
                    qConflictTeacher: value
                }
            };
            Object.assign(values, mapped[key]);
        }
        provided.add(key);
    }
    if (role === "Student" && !provided.has("semester")) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Semester is required for students"
        }, {
            status: 400
        });
    }
    try {
        const inserted = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].insert(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["form1Responses"]).values(values).onConflictDoNothing({
            target: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["form1Responses"].browserId
        }).returning({
            id: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["form1Responses"].id
        });
        if (!inserted.length) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "duplicate",
                duplicate: true
            }, {
                status: 409
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true,
            id: inserted[0].id
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unexpected error";
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: message
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0_tl~em._.js.map