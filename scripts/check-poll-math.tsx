import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DistributionCard, RatingCard } from "@/components/ResultCards";
import {
  countValidVotes,
  leadingValues,
  sortOptionsByLivePercentage,
} from "@/lib/poll-analytics";
import {
  FORM1_QUESTIONS,
  STUDENT_QUESTION_IDS,
  TEACHER_QUESTION_IDS,
  shuffleSurveyQuestions,
} from "@/lib/survey";

const options = [
  { value: "A", label: "Option A" },
  { value: "B", label: "Option B" },
  { value: "C", label: "Option C" },
];

function distribution(counts: Record<string, number>) {
  const values = Object.entries(counts).flatMap(([value, count]) => Array(count).fill(value) as string[]);
  const stats = countValidVotes(values, options.map(({ value }) => value));
  return {
    stats,
    rows: options.map(({ value, label }) => ({
      value,
      label,
      count: stats.counts[value],
      percent: stats.percentages[value],
    })),
  };
}

for (const counts of [
  { A: 6, B: 4, C: 0 },
  { A: 4, B: 6, C: 0 },
]) {
  const { stats, rows } = distribution(counts);
  const winner = counts.A > counts.B ? "A" : "B";
  assert.deepEqual(leadingValues(rows).map(({ value }) => value), [winner]);
  const html = renderToStaticMarkup(createElement(DistributionCard, {
    dist: { id: "test", title: "Test", total: stats.total, rows },
  }));
  assert(html.includes(`data-leading-option="${winner}"`));
  assert.equal((html.match(/data-leading-option=/g) ?? []).length, 1);
  assert(html.includes("Leading response"));
  assert(html.includes("60%"));
  console.log(`PASS ${stats.percentages.A}% / ${stats.percentages.B}%: ${winner} is the unique leader`);
}

const tied = distribution({ A: 5, B: 5, C: 0 });
assert.deepEqual(leadingValues(tied.rows).map(({ value }) => value), ["A", "B"]);
const tieHTML = renderToStaticMarkup(createElement(DistributionCard, {
  dist: { id: "tie", title: "Tie", total: tied.stats.total, rows: tied.rows },
}));
assert(tieHTML.includes("Tied leading responses"));
assert(tieHTML.includes('data-leading-option="A"'));
assert(tieHTML.includes('data-leading-option="B"'));
assert(!tieHTML.includes("Leading response ·"));
assert.equal(tied.stats.counts.C, 0);
assert.equal(tied.stats.percentages.C, 0);
assert(tieHTML.includes("width:0%"));
console.log("PASS 50% / 50%: both highlighted as tied; 0-vote option is 0% with empty bar");

const three = distribution({ A: 20, B: 30, C: 50 });
assert.deepEqual(three.stats.percentages, { A: 20, B: 30, C: 50 });
assert.deepEqual(sortOptionsByLivePercentage(options, three.stats).map(({ value }) => value), ["C", "B", "A"]);
assert.deepEqual(options.map(({ value }) => value), ["A", "B", "C"]);
console.log("PASS 20/30/50: correct percentages and survey-only sorting; canonical order unchanged");

const questionOne = countValidVotes(["A", "A", "B", null, "", "invalid", undefined], ["A", "B", "C"]);
const questionTwo = countValidVotes(["Y", "Y", null, "invalid"], ["X", "Y"]);
assert.equal(questionOne.total, 3);
assert.deepEqual(questionOne.percentages, { A: 67, B: 33, C: 0 });
assert.equal(questionTwo.total, 2);
assert.deepEqual(questionTwo.percentages, { X: 0, Y: 100 });
assert.deepEqual(sortOptionsByLivePercentage(options, null).map(({ value }) => value), ["A", "B", "C"]);
const stableTie = distribution({ A: 2, B: 6, C: 2 });
assert.deepEqual(sortOptionsByLivePercentage(options, stableTie.stats).map(({ value }) => value), ["B", "A", "C"]);
console.log("PASS per-question denominator excludes missing/invalid/unsubmitted answers; ties sort stably");

const canonicalIds = FORM1_QUESTIONS.map(({ id }) => id);
const shuffledA = shuffleSurveyQuestions(FORM1_QUESTIONS, () => 0);
const shuffledB = shuffleSurveyQuestions(FORM1_QUESTIONS, () => 0.9999);
for (const ordered of [shuffledA, shuffledB]) {
  assert.deepEqual(ordered.slice(0, 3).map(({ id }) => id), ["role", "department", "semester"]);
  assert.deepEqual(new Set(ordered.map(({ id }) => id)), new Set(canonicalIds));
  const student = ordered.filter(({ audience }) => audience === "Student").map(({ id }) => id);
  const teacher = ordered.filter(({ audience }) => audience === "Teacher").map(({ id }) => id);
  assert.equal(student[0], "semester");
  assert.deepEqual(new Set(student), new Set(STUDENT_QUESTION_IDS));
  assert.deepEqual(new Set(teacher), new Set(TEACHER_QUESTION_IDS));
  assert(teacher.every((id) => !STUDENT_QUESTION_IDS.includes(id)));
}
assert.notDeepEqual(shuffledA.map(({ id }) => id), shuffledB.map(({ id }) => id));
assert.deepEqual(FORM1_QUESTIONS.map(({ id }) => id), canonicalIds);
console.log("PASS question shuffling: pinned profile/semester; Student and Teacher groups isolated");

const ratingHTML = renderToStaticMarkup(createElement(RatingCard, {
  summary: {
    id: "slot", label: "Slot", average: 4, total: 10,
    distribution: [1, 2, 3, 4, 5].map((n) => ({
      value: String(n), label: String(n), count: n === 5 ? 6 : n === 4 ? 4 : 0,
      percent: n === 5 ? 60 : n === 4 ? 40 : 0,
    })),
  },
}));
assert(ratingHTML.includes('data-leading-rating="5"'));
assert(ratingHTML.includes("Leading rating"));
const ratingTieHTML = renderToStaticMarkup(createElement(RatingCard, {
  summary: {
    id: "tie", label: "Tied ratings", average: 4, total: 10,
    distribution: [1, 2, 3, 4, 5].map((n) => ({
      value: String(n), label: String(n), count: n === 4 || n === 5 ? 4 : n === 3 ? 2 : 0,
      percent: n === 4 || n === 5 ? 40 : n === 3 ? 20 : 0,
    })),
  },
}));
assert(ratingTieHTML.includes("Tied leading ratings"));
assert(ratingTieHTML.includes('data-leading-rating="4"'));
assert(ratingTieHTML.includes('data-leading-rating="5"'));
console.log("PASS 1–5 rating cards highlight real leaders and explicitly label ties");
console.log("All poll analytics regression checks passed.");
