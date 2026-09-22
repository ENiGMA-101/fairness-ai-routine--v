(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/PollCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PollCard,
    "useStats",
    ()=>useStats
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
function useStats(form) {
    _s();
    const [cache, setCache] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const load = async (questionId)=>{
        try {
            const res = await fetch(`/api/${form}/stats?question=${encodeURIComponent(questionId)}`, {
                cache: "no-store"
            });
            if (!res.ok) return;
            const data = await res.json();
            setCache((prev)=>({
                    ...prev,
                    [questionId]: data
                }));
        } catch  {
        /* keep previous state on network error */ }
    };
    return {
        stats: cache,
        load
    };
}
_s(useStats, "nnz3b5nDzkwENvMntiRONBSQHaI=");
function PollCard({ form, questionId, title, subtitle, options, value, onChange, visual, index }) {
    _s1();
    const { stats, load } = useStats(form);
    const current = stats[questionId];
    const handle = (option)=>{
        onChange(option.value);
        void load(questionId);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "mb-5 rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm",
        children: [
            visual ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-4",
                children: visual
            }, void 0, false, {
                fileName: "[project]/src/components/PollCard.tsx",
                lineNumber: 64,
                columnNumber: 17
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-[16px] font-semibold leading-snug text-zinc-900",
                children: [
                    index ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-violet-600",
                        children: [
                            index,
                            ". "
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/PollCard.tsx",
                        lineNumber: 66,
                        columnNumber: 18
                    }, this) : null,
                    title
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/PollCard.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this),
            subtitle ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-1 text-sm text-zinc-500",
                children: subtitle
            }, void 0, false, {
                fileName: "[project]/src/components/PollCard.tsx",
                lineNumber: 69,
                columnNumber: 19
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 space-y-3",
                children: options.map((opt)=>{
                    const selected = value === opt.value;
                    const pct = current?.percentages?.[opt.value] ?? 0;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>handle(opt),
                        className: `relative w-full overflow-hidden rounded-2xl border-2 px-4 py-3.5 text-left transition ${selected ? "border-violet-600 bg-violet-50" : "border-zinc-200 bg-white hover:border-zinc-400"}`,
                        children: [
                            current ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `absolute inset-y-0 left-0 transition-all duration-700 ${selected ? "bg-violet-200" : "bg-zinc-100"}`,
                                style: {
                                    width: `${pct}%`
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/PollCard.tsx",
                                lineNumber: 87,
                                columnNumber: 17
                            }, this) : null,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative flex items-center justify-between gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${selected ? "border-violet-600 bg-violet-600" : "border-zinc-300"}`,
                                                children: selected ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "h-2 w-2 rounded-full bg-white"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/PollCard.tsx",
                                                    lineNumber: 101,
                                                    columnNumber: 33
                                                }, this) : null
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/PollCard.tsx",
                                                lineNumber: 96,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[15px]",
                                                children: opt.label
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/PollCard.tsx",
                                                lineNumber: 103,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/PollCard.tsx",
                                        lineNumber: 95,
                                        columnNumber: 17
                                    }, this),
                                    current ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "shrink-0 text-sm font-bold text-zinc-700",
                                        children: [
                                            pct,
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/PollCard.tsx",
                                        lineNumber: 106,
                                        columnNumber: 19
                                    }, this) : null
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/PollCard.tsx",
                                lineNumber: 94,
                                columnNumber: 15
                            }, this)
                        ]
                    }, opt.value, true, {
                        fileName: "[project]/src/components/PollCard.tsx",
                        lineNumber: 76,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/components/PollCard.tsx",
                lineNumber: 71,
                columnNumber: 7
            }, this),
            current ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 text-xs text-zinc-400",
                children: [
                    current.total,
                    " response",
                    current.total === 1 ? "" : "s",
                    " • live"
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/PollCard.tsx",
                lineNumber: 115,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 text-xs text-zinc-400",
                children: "Percentages appear once you pick an option"
            }, void 0, false, {
                fileName: "[project]/src/components/PollCard.tsx",
                lineNumber: 119,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/PollCard.tsx",
        lineNumber: 63,
        columnNumber: 5
    }, this);
}
_s1(PollCard, "UFTcda0A5dGkduqbqSY1x1xIMNU=", false, function() {
    return [
        useStats
    ];
});
_c = PollCard;
var _c;
__turbopack_context__.k.register(_c, "PollCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/Visuals.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FORM1_VISUALS",
    ()=>FORM1_VISUALS,
    "VisualAvoid",
    ()=>VisualAvoid,
    "VisualBetween",
    ()=>VisualBetween,
    "VisualCompensate",
    ()=>VisualCompensate,
    "VisualConflict",
    ()=>VisualConflict,
    "VisualConsecutive",
    ()=>VisualConsecutive,
    "VisualEarlyLate",
    ()=>VisualEarlyLate,
    "VisualFacultyConflict",
    ()=>VisualFacultyConflict,
    "VisualFairness",
    ()=>VisualFairness,
    "VisualGapPref",
    ()=>VisualGapPref,
    "VisualLabCap",
    ()=>VisualLabCap,
    "VisualLongGap",
    ()=>VisualLongGap,
    "VisualLongGapForm2",
    ()=>VisualLongGapForm2,
    "VisualMaxHours",
    ()=>VisualMaxHours,
    "VisualMidday",
    ()=>VisualMidday,
    "VisualPacked",
    ()=>VisualPacked,
    "VisualPriority",
    ()=>VisualPriority,
    "VisualTeachingSchedule",
    ()=>VisualTeachingSchedule,
    "VisualZeroDay",
    ()=>VisualZeroDay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function Card({ children, tone = "zinc", title }) {
    const tones = {
        red: "bg-red-50 border-red-200",
        green: "bg-green-50 border-green-200",
        blue: "bg-blue-50 border-blue-200",
        amber: "bg-amber-50 border-amber-200",
        violet: "bg-violet-50 border-violet-200",
        sky: "bg-sky-50 border-sky-200",
        emerald: "bg-emerald-50 border-emerald-200",
        purple: "bg-purple-50 border-purple-200",
        zinc: "bg-zinc-50 border-zinc-200"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `rounded-2xl border p-3 ${tones[tone]}`,
        children: [
            title ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-[13px] font-bold text-zinc-800",
                children: title
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 25,
                columnNumber: 16
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-2 space-y-1",
                children: children
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Visuals.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
_c = Card;
function Block({ text, tone }) {
    const tones = {
        bad: "bg-red-500",
        ok: "bg-emerald-600",
        neutral: "bg-blue-600"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${tones[tone]} rounded-lg px-2 py-1 text-white`,
        children: text
    }, void 0, false, {
        fileName: "[project]/src/components/Visuals.tsx",
        lineNumber: 37,
        columnNumber: 10
    }, this);
}
_c1 = Block;
function VisualAvoid() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid gap-3 sm:grid-cols-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "red",
                title: "Option A — avoid early morning (8:00–11:00)",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Block, {
                        text: "8:00 – 9:20 ❌",
                        tone: "bad"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 44,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Block, {
                        text: "11:00 onwards ✔",
                        tone: "ok"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 45,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "blue",
                title: "Option B — avoid late afternoon (3:30–6:20)",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Block, {
                        text: "Morning classes ✔",
                        tone: "ok"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Block, {
                        text: "15:30 – 18:20 ❌",
                        tone: "bad"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Visuals.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
_c2 = VisualAvoid;
function VisualPacked() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid gap-3 sm:grid-cols-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "amber",
                title: "4 packed days (Sun–Wed)",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: "8:00–11:00 Theory"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 59,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: "11:00–14:00 Lab"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "font-bold",
                        children: "5–6 hours/day, intense"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 61,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "emerald",
                title: "1 full off day (Thursday)",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-2xl font-black",
                        children: "100% OFF"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 64,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: "Mid-week rest"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "font-bold",
                        children: "Dedicated class-free day"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Visuals.tsx",
        lineNumber: 57,
        columnNumber: 5
    }, this);
}
_c3 = VisualPacked;
function VisualBetween() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid gap-3 sm:grid-cols-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "blue",
                title: "Option A — back-to-back (minimal waiting)",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Block, {
                        text: "9:00 – 10:20",
                        tone: "neutral"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 76,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Block, {
                        text: "10:30 – 11:50",
                        tone: "neutral"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "amber",
                title: "Option B — adequate break + self study",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Block, {
                        text: "9:00 – 10:20",
                        tone: "neutral"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Block, {
                        text: "Break + study 📚",
                        tone: "bad"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 81,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Block, {
                        text: "14:00 – 15:20",
                        tone: "ok"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 82,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Visuals.tsx",
        lineNumber: 74,
        columnNumber: 5
    }, this);
}
_c4 = VisualBetween;
function VisualEarlyLate() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid gap-3 sm:grid-cols-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "sky",
                title: "8:00 AM – 9:20 AM",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: "Early morning slot"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 92,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-zinc-500",
                        children: "Dismissed earlier in the afternoon"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 91,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "purple",
                title: "5:00 PM – 6:20 PM",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: "Late evening slot"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 96,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-zinc-500",
                        children: "Late return in the evening"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 97,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 95,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Visuals.tsx",
        lineNumber: 90,
        columnNumber: 5
    }, this);
}
_c5 = VisualEarlyLate;
function VisualLongGap() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-2xl border border-dashed border-red-300 bg-red-50 p-3 text-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "font-bold text-red-700",
                children: "2h 40m+ gap between classes"
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 106,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-xs text-zinc-600",
                children: "Keep both on the same day, or move one to another day?"
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 107,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Visuals.tsx",
        lineNumber: 105,
        columnNumber: 5
    }, this);
}
_c6 = VisualLongGap;
function VisualMidday() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid gap-3 sm:grid-cols-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "emerald",
                title: "Mandatory break",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "No classes 13:00 – 14:20"
                }, void 0, false, {
                    fileName: "[project]/src/components/Visuals.tsx",
                    lineNumber: 116,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 115,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "amber",
                title: "Flexible",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "Classes may run through the midday window"
                }, void 0, false, {
                    fileName: "[project]/src/components/Visuals.tsx",
                    lineNumber: 119,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 118,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Visuals.tsx",
        lineNumber: 114,
        columnNumber: 5
    }, this);
}
_c7 = VisualMidday;
function VisualMaxHours() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid gap-3 sm:grid-cols-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "violet",
                title: "Option A — max 3h/day, balanced",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "More days, lighter days"
                }, void 0, false, {
                    fileName: "[project]/src/components/Visuals.tsx",
                    lineNumber: 129,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 128,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "zinc",
                title: "Option B — 4h+ packed day, many off days",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "Fewer days, heavier days"
                }, void 0, false, {
                    fileName: "[project]/src/components/Visuals.tsx",
                    lineNumber: 132,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 131,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Visuals.tsx",
        lineNumber: 127,
        columnNumber: 5
    }, this);
}
_c8 = VisualMaxHours;
function VisualLabCap() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid gap-3 sm:grid-cols-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "emerald",
                title: "Single 3h lab per day",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "Focus + recovery time"
                }, void 0, false, {
                    fileName: "[project]/src/components/Visuals.tsx",
                    lineNumber: 142,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 141,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "purple",
                title: "Double lab (6h) — too much",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "Fatigue, low quality work"
                }, void 0, false, {
                    fileName: "[project]/src/components/Visuals.tsx",
                    lineNumber: 145,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 144,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Visuals.tsx",
        lineNumber: 140,
        columnNumber: 5
    }, this);
}
_c9 = VisualLabCap;
function VisualPriority() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid gap-3 sm:grid-cols-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "blue",
                title: "Prioritize seniors",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "Need specific credits to graduate on time"
                }, void 0, false, {
                    fileName: "[project]/src/components/Visuals.tsx",
                    lineNumber: 155,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 154,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "green",
                title: "Prioritize juniors",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "Helps them adapt to campus life"
                }, void 0, false, {
                    fileName: "[project]/src/components/Visuals.tsx",
                    lineNumber: 158,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 157,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Visuals.tsx",
        lineNumber: 153,
        columnNumber: 5
    }, this);
}
_c10 = VisualPriority;
function VisualConflict() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid gap-3 sm:grid-cols-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "blue",
                title: "Core & technical rounds",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "Student-focused priority"
                }, void 0, false, {
                    fileName: "[project]/src/components/Visuals.tsx",
                    lineNumber: 168,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 167,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "purple",
                title: "Concentration & working hours",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "Teacher-focused priority"
                }, void 0, false, {
                    fileName: "[project]/src/components/Visuals.tsx",
                    lineNumber: 171,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 170,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Visuals.tsx",
        lineNumber: 166,
        columnNumber: 5
    }, this);
}
_c11 = VisualConflict;
function VisualTeachingSchedule() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid gap-3 sm:grid-cols-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "blue",
                title: "High density: 3–4 classes/day",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "Fewer teaching days per week"
                }, void 0, false, {
                    fileName: "[project]/src/components/Visuals.tsx",
                    lineNumber: 181,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 180,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "purple",
                title: "Scattered: 1–2 classes daily",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "Spread across the week"
                }, void 0, false, {
                    fileName: "[project]/src/components/Visuals.tsx",
                    lineNumber: 184,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 183,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Visuals.tsx",
        lineNumber: 179,
        columnNumber: 5
    }, this);
}
_c12 = VisualTeachingSchedule;
function VisualZeroDay() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid gap-3 sm:grid-cols-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "sky",
                title: "Fixed availability (Sun–Wed)",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "One day with 0 classes for research"
                }, void 0, false, {
                    fileName: "[project]/src/components/Visuals.tsx",
                    lineNumber: 194,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 193,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "violet",
                title: "Soft availability",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "Classes every day, but light"
                }, void 0, false, {
                    fileName: "[project]/src/components/Visuals.tsx",
                    lineNumber: 197,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 196,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Visuals.tsx",
        lineNumber: 192,
        columnNumber: 5
    }, this);
}
_c13 = VisualZeroDay;
function VisualConsecutive() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid gap-3 sm:grid-cols-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "blue",
                title: "Back-to-back teaching stretch",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "9:00 → 12:00 continuous"
                }, void 0, false, {
                    fileName: "[project]/src/components/Visuals.tsx",
                    lineNumber: 207,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 206,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "amber",
                title: "Breaks between classes",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "Rest, review, and reset"
                }, void 0, false, {
                    fileName: "[project]/src/components/Visuals.tsx",
                    lineNumber: 210,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 209,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Visuals.tsx",
        lineNumber: 205,
        columnNumber: 5
    }, this);
}
_c14 = VisualConsecutive;
function VisualGapPref() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid gap-3 sm:grid-cols-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "red",
                title: "Minimize gap — no waiting",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "Leave campus right after class"
                }, void 0, false, {
                    fileName: "[project]/src/components/Visuals.tsx",
                    lineNumber: 220,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 219,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "green",
                title: "1–2h consultation gap",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "Research + student consultation time"
                }, void 0, false, {
                    fileName: "[project]/src/components/Visuals.tsx",
                    lineNumber: 223,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 222,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Visuals.tsx",
        lineNumber: 218,
        columnNumber: 5
    }, this);
}
_c15 = VisualGapPref;
function VisualFacultyConflict() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid gap-3 sm:grid-cols-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "blue",
                title: "Seniority & workload based",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "AI balances load across the department"
                }, void 0, false, {
                    fileName: "[project]/src/components/Visuals.tsx",
                    lineNumber: 233,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 232,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "green",
                title: "First-come, first-serve",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "Whoever requests the slot first wins"
                }, void 0, false, {
                    fileName: "[project]/src/components/Visuals.tsx",
                    lineNumber: 236,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 235,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Visuals.tsx",
        lineNumber: 231,
        columnNumber: 5
    }, this);
}
_c16 = VisualFacultyConflict;
function VisualCompensate() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid gap-3 sm:grid-cols-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "red",
                title: "This semester — unfavorable routine",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "Late evening slots, long gaps"
                }, void 0, false, {
                    fileName: "[project]/src/components/Visuals.tsx",
                    lineNumber: 246,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 245,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                tone: "green",
                title: "Next semester — rewarded",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "Priority on preferred slots"
                }, void 0, false, {
                    fileName: "[project]/src/components/Visuals.tsx",
                    lineNumber: 249,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 248,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Visuals.tsx",
        lineNumber: 244,
        columnNumber: 5
    }, this);
}
_c17 = VisualCompensate;
function VisualLongGapForm2() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-2xl border border-indigo-200 bg-indigo-50 p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: "8:00 AM – 9:20 AM"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 259,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: "Morning lecture"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 260,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 258,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "my-2 rounded-lg border-2 border-dashed border-red-300 bg-red-50 p-3 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-sm font-bold text-red-600",
                        children: "⏳ 2 hours 40 minutes gap (9:20 – 12:00)"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 263,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs text-zinc-500",
                        children: "Waiting / studying / unproductive"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 264,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 262,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: "12:00 PM – 1:20 PM"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 267,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: "Afternoon class"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 268,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 266,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Visuals.tsx",
        lineNumber: 257,
        columnNumber: 5
    }, this);
}
_c18 = VisualLongGapForm2;
function VisualFairness() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-2xl border bg-zinc-50 p-4 text-xs",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-xl border border-red-200 bg-red-50 p-3 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "font-bold",
                        children: "Current semester"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 278,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-1 rounded bg-red-100 px-2 py-1",
                        children: "Unfavorable routine"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 279,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 277,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white",
                children: "→"
            }, void 0, false, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 281,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "font-bold",
                        children: "Next semester"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 285,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-1 rounded bg-emerald-100 px-2 py-1",
                        children: "Priority preferred slots"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Visuals.tsx",
                        lineNumber: 286,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Visuals.tsx",
                lineNumber: 284,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Visuals.tsx",
        lineNumber: 276,
        columnNumber: 5
    }, this);
}
_c19 = VisualFairness;
const FORM1_VISUALS = {
    q_avoid: VisualAvoid,
    q_weekly_off: VisualPacked,
    q_between_classes: VisualBetween,
    q_extra_time: VisualEarlyLate,
    q_long_gap: VisualLongGap,
    q_midday_break: VisualMidday,
    q_max_hours: VisualMaxHours,
    q_lab_cap: VisualLabCap,
    q_priority_group: VisualPriority,
    q_conflict_student: VisualConflict,
    q_teaching_schedule: VisualTeachingSchedule,
    q_zero_day: VisualZeroDay,
    q_consecutive: VisualConsecutive,
    q_gap_pref: VisualGapPref,
    q_faculty_conflict: VisualFacultyConflict,
    q_compensate: VisualCompensate,
    q_conflict_teacher: VisualConflict
};
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10, _c11, _c12, _c13, _c14, _c15, _c16, _c17, _c18, _c19;
__turbopack_context__.k.register(_c, "Card");
__turbopack_context__.k.register(_c1, "Block");
__turbopack_context__.k.register(_c2, "VisualAvoid");
__turbopack_context__.k.register(_c3, "VisualPacked");
__turbopack_context__.k.register(_c4, "VisualBetween");
__turbopack_context__.k.register(_c5, "VisualEarlyLate");
__turbopack_context__.k.register(_c6, "VisualLongGap");
__turbopack_context__.k.register(_c7, "VisualMidday");
__turbopack_context__.k.register(_c8, "VisualMaxHours");
__turbopack_context__.k.register(_c9, "VisualLabCap");
__turbopack_context__.k.register(_c10, "VisualPriority");
__turbopack_context__.k.register(_c11, "VisualConflict");
__turbopack_context__.k.register(_c12, "VisualTeachingSchedule");
__turbopack_context__.k.register(_c13, "VisualZeroDay");
__turbopack_context__.k.register(_c14, "VisualConsecutive");
__turbopack_context__.k.register(_c15, "VisualGapPref");
__turbopack_context__.k.register(_c16, "VisualFacultyConflict");
__turbopack_context__.k.register(_c17, "VisualCompensate");
__turbopack_context__.k.register(_c18, "VisualLongGapForm2");
__turbopack_context__.k.register(_c19, "VisualFairness");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/browser.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getBrowserId",
    ()=>getBrowserId,
    "isSubmitted",
    ()=>isSubmitted,
    "markSubmitted",
    ()=>markSubmitted,
    "resetSubmitted",
    ()=>resetSubmitted
]);
const ID_KEY = "fairness_browser_id";
function randomId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `id-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}
function getBrowserId() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    let id = window.localStorage.getItem(ID_KEY);
    if (!id) {
        id = randomId();
        window.localStorage.setItem(ID_KEY, id);
    }
    return id;
}
function isSubmitted(form) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return window.localStorage.getItem(`${form}_submitted`) === "true";
}
function markSubmitted(form) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    window.localStorage.setItem(`${form}_submitted`, "true");
}
function resetSubmitted(form) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    window.localStorage.removeItem(`${form}_submitted`);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/survey.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
const FORM1_QUESTION_KEYS = FORM1_QUESTIONS.map(_c = (q)=>q.id);
_c1 = FORM1_QUESTION_KEYS;
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
var _c, _c1;
__turbopack_context__.k.register(_c, "FORM1_QUESTION_KEYS$FORM1_QUESTIONS.map");
__turbopack_context__.k.register(_c1, "FORM1_QUESTION_KEYS");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/form1/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Form1Page
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$PollCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/PollCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Visuals$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Visuals.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$browser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/browser.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$survey$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/survey.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
const ROLE_QUESTION = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$survey$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORM1_QUESTIONS"].find(_c = (q)=>q.id === "role");
_c1 = ROLE_QUESTION;
const QUESTIONS = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$survey$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORM1_QUESTIONS"].filter(_c2 = (q)=>q.id !== "role" && q.id !== "department");
_c3 = QUESTIONS;
function Form1Page() {
    _s();
    const [role, setRole] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [department, setDepartment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [departmentOther, setDepartmentOther] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [answers, setAnswers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [submitted, setSubmitted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Form1Page.useEffect": ()=>{
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$browser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSubmitted"])("form1")) setSubmitted(true);
        }
    }["Form1Page.useEffect"], []);
    const visible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Form1Page.useMemo[visible]": ()=>QUESTIONS.filter({
                "Form1Page.useMemo[visible]": (q)=>role === "" ? false : q.audience === role || q.audience === "Both"
            }["Form1Page.useMemo[visible]"])
    }["Form1Page.useMemo[visible]"], [
        role
    ]);
    const total = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Form1Page.useMemo[total]": ()=>role ? visible.length + 2 : 2
    }["Form1Page.useMemo[total]"], [
        role,
        visible.length
    ]);
    const answered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Form1Page.useMemo[answered]": ()=>{
            let count = 0;
            if (role) count += 1;
            if (department) count += 1;
            count += visible.filter({
                "Form1Page.useMemo[answered]": (q)=>Boolean(answers[q.id])
            }["Form1Page.useMemo[answered]"]).length;
            return count;
        }
    }["Form1Page.useMemo[answered]"], [
        role,
        department,
        answers,
        visible
    ]);
    const canSubmit = Boolean(role) && Boolean(department) && visible.length > 0 && visible.every((q)=>Boolean(answers[q.id])) && (department !== "Other" || departmentOther.trim().length > 0);
    const setAnswer = (id, value)=>setAnswers((prev)=>({
                ...prev,
                [id]: value
            }));
    const submit = async ()=>{
        if (!canSubmit || loading) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/form1/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    browser_id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$browser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBrowserId"])(),
                    role,
                    department,
                    department_other: department === "Other" ? departmentOther.trim() : null,
                    answers
                })
            });
            if (res.ok || res.status === 409) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$browser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["markSubmitted"])("form1");
                setSubmitted(true);
                return;
            }
            const data = await res.json().catch(()=>({}));
            setError(data.error ?? `Submission failed (${res.status})`);
        } catch  {
            setError("Network error — please try again.");
        } finally{
            setLoading(false);
        }
    };
    if (submitted) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex min-h-screen items-center justify-center p-6",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full max-w-md rounded-[32px] border border-zinc-200 bg-white p-10 text-center shadow-xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-3xl",
                        children: "✓"
                    }, void 0, false, {
                        fileName: "[project]/src/app/form1/page.tsx",
                        lineNumber: 85,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "mt-6 text-2xl font-bold",
                        children: "Response submitted successfully"
                    }, void 0, false, {
                        fileName: "[project]/src/app/form1/page.tsx",
                        lineNumber: 88,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-2 text-sm text-zinc-500",
                        children: "Thank you! Your anonymous answers are stored. One response per browser is allowed."
                    }, void 0, false, {
                        fileName: "[project]/src/app/form1/page.tsx",
                        lineNumber: 89,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/results/form1",
                        className: "mt-6 block rounded-full bg-black py-3 text-sm font-semibold text-white",
                        children: "View live results"
                    }, void 0, false, {
                        fileName: "[project]/src/app/form1/page.tsx",
                        lineNumber: 92,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/form2",
                        className: "mt-3 block rounded-full bg-zinc-100 py-3 text-sm font-semibold",
                        children: "Also fill Form 2 (time-slot rating) →"
                    }, void 0, false, {
                        fileName: "[project]/src/app/form1/page.tsx",
                        lineNumber: 98,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/",
                        className: "mt-3 block text-xs text-zinc-400",
                        children: "← Back home"
                    }, void 0, false, {
                        fileName: "[project]/src/app/form1/page.tsx",
                        lineNumber: 104,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/form1/page.tsx",
                lineNumber: 84,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/form1/page.tsx",
            lineNumber: 83,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sticky top-0 z-20 border-b border-zinc-200 bg-white/85 backdrop-blur",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto flex max-w-3xl items-center justify-between px-4 py-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/",
                            className: "text-sm font-bold",
                            children: "← Home"
                        }, void 0, false, {
                            fileName: "[project]/src/app/form1/page.tsx",
                            lineNumber: 116,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-sm font-semibold tabular-nums",
                                    children: [
                                        answered,
                                        "/",
                                        total
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/form1/page.tsx",
                                    lineNumber: 120,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-2 w-28 overflow-hidden rounded-full bg-zinc-200",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-full bg-black transition-all duration-500",
                                        style: {
                                            width: `${total ? answered / total * 100 : 0}%`
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/form1/page.tsx",
                                        lineNumber: 124,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/form1/page.tsx",
                                    lineNumber: 123,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/form1/page.tsx",
                            lineNumber: 119,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/form1/page.tsx",
                    lineNumber: 115,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/form1/page.tsx",
                lineNumber: 114,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mx-auto max-w-3xl px-4 py-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-6 rounded-[24px] border border-zinc-200 bg-white p-8 shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-3xl font-black leading-tight",
                                children: "Fairness Aware AI Routine Generator — Student & Teacher Survey"
                            }, void 0, false, {
                                fileName: "[project]/src/app/form1/page.tsx",
                                lineNumber: 135,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-3 text-zinc-600",
                                children: "প্রশ্নগুলো একই পৃষ্ঠায় স্ক্রল করে উত্তর দিন। প্রতিটি উত্তর দেওয়ার পর লাইভ শতকরা ফলাফল দেখতে পাবেন — তবে আপনার ভোট গণনা হবে শুধু Submit চাপার পর।"
                            }, void 0, false, {
                                fileName: "[project]/src/app/form1/page.tsx",
                                lineNumber: 138,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/form1/page.tsx",
                        lineNumber: 134,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$PollCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        form: "form1",
                        questionId: "role",
                        title: ROLE_QUESTION.titleBn,
                        subtitle: ROLE_QUESTION.titleEn,
                        options: ROLE_QUESTION.options,
                        value: role,
                        onChange: setRole
                    }, void 0, false, {
                        fileName: "[project]/src/app/form1/page.tsx",
                        lineNumber: 144,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "mb-5 rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-[16px] font-semibold",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-violet-600",
                                        children: "2. "
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/form1/page.tsx",
                                        lineNumber: 156,
                                        columnNumber: 13
                                    }, this),
                                    "আপনি কোন বিভাগের অন্তর্ভুক্ত?"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/form1/page.tsx",
                                lineNumber: 155,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-sm text-zinc-500",
                                children: "Which department do you belong to? *"
                            }, void 0, false, {
                                fileName: "[project]/src/app/form1/page.tsx",
                                lineNumber: 159,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 space-y-3",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$survey$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEPARTMENTS"].map((d)=>{
                                    const selected = department === d;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setDepartment(d),
                                        className: `w-full rounded-2xl border-2 px-4 py-3 text-left transition ${selected ? "border-violet-600 bg-violet-50" : "border-zinc-200 bg-white hover:border-zinc-400"}`,
                                        children: d
                                    }, d, false, {
                                        fileName: "[project]/src/app/form1/page.tsx",
                                        lineNumber: 164,
                                        columnNumber: 17
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/form1/page.tsx",
                                lineNumber: 160,
                                columnNumber: 11
                            }, this),
                            department === "Other" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                value: departmentOther,
                                onChange: (e)=>setDepartmentOther(e.target.value),
                                placeholder: "আপনার বিভাগের নাম লিখুন (Other department)",
                                className: "mt-3 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500"
                            }, void 0, false, {
                                fileName: "[project]/src/app/form1/page.tsx",
                                lineNumber: 180,
                                columnNumber: 13
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/form1/page.tsx",
                        lineNumber: 154,
                        columnNumber: 9
                    }, this),
                    role === "" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-[24px] border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500",
                        children: "উপরে আপনার ভূমিকা (Student / Teacher) নির্বাচন করলে প্রশ্নগুলো দেখা যাবে।"
                    }, void 0, false, {
                        fileName: "[project]/src/app/form1/page.tsx",
                        lineNumber: 190,
                        columnNumber: 11
                    }, this) : visible.map((q, i)=>{
                        const Visual = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Visuals$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORM1_VISUALS"][q.id];
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$PollCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            form: "form1",
                            questionId: q.id,
                            index: i + 3,
                            title: q.titleBn,
                            subtitle: q.titleEn,
                            options: q.options,
                            value: answers[q.id] ?? null,
                            onChange: (v)=>setAnswer(q.id, v),
                            visual: Visual ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Visual, {}, void 0, false, {
                                fileName: "[project]/src/app/form1/page.tsx",
                                lineNumber: 207,
                                columnNumber: 34
                            }, this) : undefined
                        }, q.id, false, {
                            fileName: "[project]/src/app/form1/page.tsx",
                            lineNumber: 197,
                            columnNumber: 15
                        }, this);
                    }),
                    error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/src/app/form1/page.tsx",
                        lineNumber: 214,
                        columnNumber: 11
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: submit,
                        disabled: !canSubmit || loading,
                        className: "w-full rounded-[20px] bg-black py-5 text-lg font-bold text-white transition disabled:opacity-40",
                        children: loading ? "Submitting…" : `Submit (${answered}/${total})`
                    }, void 0, false, {
                        fileName: "[project]/src/app/form1/page.tsx",
                        lineNumber: 219,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-3 text-center text-xs text-zinc-400",
                        children: "Anonymous • one response per browser • stored in PostgreSQL"
                    }, void 0, false, {
                        fileName: "[project]/src/app/form1/page.tsx",
                        lineNumber: 227,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/form1/page.tsx",
                lineNumber: 133,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/form1/page.tsx",
        lineNumber: 113,
        columnNumber: 5
    }, this);
}
_s(Form1Page, "GqYrKRq31//V2+MAirb4r2ZCvvU=");
_c4 = Form1Page;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "ROLE_QUESTION$FORM1_QUESTIONS.find");
__turbopack_context__.k.register(_c1, "ROLE_QUESTION");
__turbopack_context__.k.register(_c2, "QUESTIONS$FORM1_QUESTIONS.filter");
__turbopack_context__.k.register(_c3, "QUESTIONS");
__turbopack_context__.k.register(_c4, "Form1Page");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_0fl-ubg._.js.map