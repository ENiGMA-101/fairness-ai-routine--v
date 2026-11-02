"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Lock, Search, X } from "lucide-react";
import type { Form2FeedbackItem } from "@/lib/results";

type RoleFilter = "All Roles" | "Student" | "Teacher";
type SortOrder = "Latest First" | "Oldest First";

const PREVIEW_CHAR_LIMIT = 200;

export function formatFeedbackTimestamp(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return String(createdAt);
  }

  const raw = new Date(createdAt)
    .toLocaleString("en-BD", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Dhaka",
    })
    .replace(",", " ·");

  if (/^\d{2}:\d{2}\s?(AM|PM)\s·\s\d{2}\s[A-Za-z]{3}\s\d{4}$/i.test(raw)) {
    return raw.replace(/\b(am|pm)\b/i, (m) => m.toUpperCase());
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).formatToParts(date);

  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const hour = getPart("hour");
  const minute = getPart("minute");
  const dayPeriod = getPart("dayPeriod").toUpperCase();
  const day = getPart("day");
  const month = getPart("month");
  const year = getPart("year");

  return `${hour}:${minute} ${dayPeriod} · ${day} ${month} ${year}`;
}

function getStableFeedbackKey(item: Form2FeedbackItem, originalIndex: number): string {
  if (item.id && item.id.trim().length > 0) {
    return item.id;
  }
  return `fb-${originalIndex}-${item.createdAt}-${item.role}-${item.department}`;
}

export default function FeedbackExplorer({
  feedback,
}: {
  feedback: Form2FeedbackItem[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All Roles");
  const [sortOrder, setSortOrder] = useState<SortOrder>("Latest First");
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const totalFeedbackCount = feedback.length;

  const itemsWithKeys = useMemo(
    () =>
      feedback.map((item, idx) => ({
        item,
        stableKey: getStableFeedbackKey(item, idx),
        originalIndex: idx,
      })),
    [feedback],
  );

  const displayedFeedback = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    const filtered = itemsWithKeys.filter(({ item }) => {
      if (roleFilter === "Student" && item.role.toLowerCase() !== "student") {
        return false;
      }
      if (roleFilter === "Teacher" && item.role.toLowerCase() !== "teacher") {
        return false;
      }
      if (
        normalizedSearch.length > 0 &&
        !item.text.toLowerCase().includes(normalizedSearch)
      ) {
        return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      const timeA = new Date(a.item.createdAt).getTime();
      const timeB = new Date(b.item.createdAt).getTime();
      const validA = Number.isNaN(timeA) ? 0 : timeA;
      const validB = Number.isNaN(timeB) ? 0 : timeB;

      if (validA !== validB) {
        return sortOrder === "Latest First" ? validB - validA : validA - validB;
      }
      return sortOrder === "Latest First"
        ? a.originalIndex - b.originalIndex
        : b.originalIndex - a.originalIndex;
    });
  }, [itemsWithKeys, roleFilter, searchQuery, sortOrder]);

  const toggleCardExpansion = (key: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <section
      aria-labelledby="written-feedback-heading"
      className="mt-6 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-[#18243b]"
    >
      {/* Header & Total Feedback Count */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-700/80">
        <div>
          <h2
            id="written-feedback-heading"
            className="text-lg font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Written Feedback
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            All non-empty participant comments and scheduling constraints
          </p>
        </div>
        <div
          data-testid="total-feedback-count"
          className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50/80 px-3.5 py-1.5 text-xs font-bold text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-200"
        >
          <span>Total Feedback:</span>
          <span className="tabular-nums">{totalFeedbackCount}</span>
        </div>
      </div>

      {/* Controls: Search, Role Filter, and Sort Order */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search written feedback..."
            aria-label="Search written feedback"
            data-testid="feedback-search-input"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-[#1e2c47] dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-sky-400 dark:focus:bg-[#223250]"
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200/70 hover:text-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center">
          <div className="relative">
            <label htmlFor="feedback-role-filter" className="sr-only">
              Filter by role
            </label>
            <select
              id="feedback-role-filter"
              aria-label="Filter feedback by role"
              data-testid="feedback-role-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-3.5 pr-9 text-xs font-semibold text-slate-800 transition-colors hover:border-slate-300 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 sm:w-auto dark:border-slate-600 dark:bg-[#1e2c47] dark:text-slate-100 dark:hover:border-slate-500 dark:focus:border-sky-400"
            >
              <option value="All Roles">All Roles</option>
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500 dark:text-slate-300"
              aria-hidden="true"
            />
          </div>

          <div className="relative">
            <label htmlFor="feedback-sort-order" className="sr-only">
              Sort feedback by submission time
            </label>
            <select
              id="feedback-sort-order"
              aria-label="Sort feedback by submission time"
              data-testid="feedback-sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-3.5 pr-9 text-xs font-semibold text-slate-800 transition-colors hover:border-slate-300 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 sm:w-auto dark:border-slate-600 dark:bg-[#1e2c47] dark:text-slate-100 dark:hover:border-slate-500 dark:focus:border-sky-400"
            >
              <option value="Latest First">Latest First</option>
              <option value="Oldest First">Oldest First</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500 dark:text-slate-300"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* Feedback Cards List */}
      {totalFeedbackCount === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-[#1e2d48]/50 dark:text-slate-400">
          No written feedback yet.
        </div>
      ) : displayedFeedback.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-[#1e2d48]/50 dark:text-slate-400">
          No written feedback matches the current search or role filter.
        </div>
      ) : (
        <ul className="mt-5 space-y-3.5" data-testid="feedback-card-list">
          {displayedFeedback.map(({ item, stableKey }) => {
            const isLong = item.text.length > PREVIEW_CHAR_LIMIT;
            const isExpanded = Boolean(expandedCards[stableKey]);
            const visibleText =
              isLong && !isExpanded
                ? item.text.slice(0, PREVIEW_CHAR_LIMIT)
                : item.text;
            const formattedTimestamp = formatFeedbackTimestamp(item.createdAt);
            const isTeacher = item.role.toLowerCase() === "teacher";

            return (
              <li
                key={stableKey}
                data-testid="feedback-card"
                className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 transition-colors sm:p-5 dark:border-slate-700/90 dark:bg-[#1e2d48]"
              >
                {/* Top Row: Role · Department on LEFT, Timestamp on FAR RIGHT */}
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  <div
                    data-testid="feedback-card-meta"
                    className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200"
                  >
                    <span
                      className={
                        isTeacher
                          ? "text-violet-700 dark:text-violet-300"
                          : "text-sky-700 dark:text-sky-300"
                      }
                    >
                      {item.role.toUpperCase()}
                    </span>
                    <span aria-hidden="true" className="text-slate-400 dark:text-slate-500">
                      ·
                    </span>
                    <span>{item.department}</span>
                  </div>

                  <time
                    dateTime={item.createdAt}
                    data-testid="feedback-card-timestamp"
                    className="ml-auto shrink-0 text-right text-[11px] font-medium tabular-nums text-slate-500 sm:text-xs dark:text-slate-400"
                  >
                    {formattedTimestamp}
                  </time>
                </div>

                {/* Feedback Text & Optional Spoiler Panel */}
                <div className="mt-2.5">
                  <p
                    data-testid="feedback-card-text"
                    className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-800 dark:text-slate-100"
                  >
                    {visibleText}
                  </p>

                  {isLong && !isExpanded && (
                    <div
                      data-testid="feedback-spoiler-panel"
                      aria-label="Hidden feedback spoiler area"
                      className="mt-2.5 flex items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-slate-200/65 px-4 py-3 text-xs font-semibold text-slate-700 shadow-inner backdrop-blur-md select-none dark:border-slate-600/80 dark:bg-slate-800/75 dark:text-slate-200"
                    >
                      <Lock
                        className="h-3.5 w-3.5 shrink-0 text-slate-600 dark:text-slate-300"
                        aria-hidden="true"
                      />
                      <span>Hidden feedback</span>
                    </div>
                  )}

                  {isLong && (
                    <div className="mt-2.5">
                      <button
                        type="button"
                        onClick={() => toggleCardExpansion(stableKey)}
                        aria-expanded={isExpanded}
                        data-testid="feedback-toggle-button"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:border-slate-400 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 dark:border-slate-600 dark:bg-[#243550] dark:text-slate-100 dark:hover:border-slate-500 dark:hover:bg-[#2c4060]"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Show less</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Show full feedback</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
