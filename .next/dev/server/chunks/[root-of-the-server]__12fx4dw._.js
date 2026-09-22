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
"[project]/src/lib/results.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "FORM1_ROW_KEYS",
    ()=>FORM1_ROW_KEYS,
    "FORM2_ROW_KEYS",
    ()=>FORM2_ROW_KEYS,
    "getForm1Results",
    ()=>getForm1Results,
    "getForm2Results",
    ()=>getForm2Results
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/sql/expressions/select.js [app-route] (ecmascript)");
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
const FORM1_ROW_KEYS = {
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
    q_conflict_teacher: "qConflictTeacher"
};
const FORM2_ROW_KEYS = {
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
    fairness_rating: "fairnessRating"
};
function tally(values, questionId) {
    const counts = new Map();
    let total = 0;
    for (const raw of values){
        if (raw === null || raw === undefined || raw === "") continue;
        const key = String(raw);
        counts.set(key, (counts.get(key) ?? 0) + 1);
        total += 1;
    }
    const order = Array.from(counts.entries()).sort((a, b)=>b[1] - a[1]);
    return order.map(([value, count])=>({
            value,
            label: questionId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$survey$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["labelFor"])(questionId, value) : value,
            count,
            percent: total ? Math.round(count / total * 100) : 0
        }));
}
function averageOf(values) {
    if (!values.length) return 0;
    return Math.round(values.reduce((a, b)=>a + b, 0) / values.length * 100) / 100;
}
async function getForm1Results() {
    const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["form1Responses"]).orderBy((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["desc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["form1Responses"].createdAt));
    const distributions = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$survey$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FORM1_QUESTIONS"].map((q)=>{
        const key = FORM1_ROW_KEYS[q.id];
        const values = rows.map((r)=>r[key] ?? null);
        const distRows = tally(values, q.id);
        const total = distRows.reduce((sum, r)=>sum + r.count, 0);
        return {
            id: q.id,
            title: q.titleBn,
            titleEn: q.titleEn,
            total,
            rows: distRows
        };
    });
    return {
        totalResponses: rows.length,
        students: rows.filter((r)=>r.role === "Student").length,
        teachers: rows.filter((r)=>r.role === "Teacher").length,
        distributions,
        recent: rows.slice(0, 8).map((r)=>({
                role: r.role,
                department: r.departmentOther ?? r.department,
                createdAt: r.createdAt.toISOString()
            }))
    };
}
async function getForm2Results() {
    const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["form2Responses"]).orderBy((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["desc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["form2Responses"].createdAt));
    const ratingSummary = (id, label, range, values)=>({
            id,
            label,
            range,
            average: averageOf(values),
            total: values.length,
            distribution: tally(values)
        });
    const slots = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$survey$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TIME_SLOTS"].map((slot)=>{
        const key = FORM2_ROW_KEYS[slot.id];
        const values = rows.map((r)=>r[key]);
        return ratingSummary(slot.id, slot.label, slot.range, values);
    });
    const sorted = [
        ...slots
    ].sort((a, b)=>b.average - a.average);
    return {
        totalResponses: rows.length,
        students: rows.filter((r)=>r.role === "Student").length,
        teachers: rows.filter((r)=>r.role === "Teacher").length,
        slots,
        longGap: ratingSummary("long_gap_rating", "Long campus gaps between classes (idle wait time)", undefined, rows.map((r)=>r.longGapRating)),
        fairness: ratingSummary("fairness_rating", "Multi-semester fairness (algorithmic memory)", undefined, rows.map((r)=>r.fairnessRating)),
        roleSplit: {
            id: "role",
            title: "Role",
            total: rows.length,
            rows: tally(rows.map((r)=>r.role))
        },
        departmentSplit: {
            id: "department",
            title: "Department",
            total: rows.length,
            rows: tally(rows.map((r)=>r.department))
        },
        feedback: rows.filter((r)=>r.feedback && r.feedback.trim().length > 0).slice(0, 40).map((r)=>({
                text: r.feedback,
                role: r.role,
                department: r.departmentOther ?? r.department
            })),
        bestSlot: sorted[0],
        worstSlot: sorted[sorted.length - 1]
    };
}
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/api/form1/stats/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/db/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/db/schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$results$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/results.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$survey$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/survey.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$results$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$results$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
const dynamic = "force-dynamic";
async function GET(req) {
    const question = req.nextUrl.searchParams.get("question") ?? "";
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$survey$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FORM1_COLUMN_KEYS"].includes(question)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "invalid question"
        }, {
            status: 400
        });
    }
    try {
        const key = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$results$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FORM1_ROW_KEYS"][question];
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select({
            value: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["form1Responses"][key]
        }).from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["form1Responses"]);
        const counts = {};
        let total = 0;
        for (const row of rows){
            const raw = row.value;
            if (raw === null || raw === "") continue;
            const value = String(raw);
            counts[value] = (counts[value] ?? 0) + 1;
            total += 1;
        }
        const percentages = {};
        for (const [value, count] of Object.entries(counts)){
            percentages[value] = total ? Math.round(count / total * 100) : 0;
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            total,
            counts,
            percentages
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

//# sourceMappingURL=%5Broot-of-the-server%5D__12fx4dw._.js.map