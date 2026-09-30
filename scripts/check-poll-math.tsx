import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DistributionCard, RatingCard } from "@/components/ResultCards";
import { countValidVotes, leadingValues, sortOptionsByLivePercentage } from "@/lib/poll-analytics";
import { computeLeader } from "@/lib/poll-stats";
import { FORM1_QUESTIONS, STUDENT_QUESTION_IDS, TEACHER_QUESTION_IDS } from "@/lib/survey";

const options = [
  { value: "A", label: "Option A" },
  { value: "B", label: "Option B" },
  { value: "C", label: "Option C" },
];
function distribution(counts: Record<string, number>) {
  const values = Object.entries(counts).flatMap(([value, count]) => Array(count).fill(value) as string[]);
  const stats = countValidVotes(values, options.map(({ value }) => value));
  const rows = options.map(({ value, label }) => ({ value, label, count: stats.counts[value], percent: stats.percentages[value] }));
  return { stats, rows };
}

for (const counts of [{ A: 6, B: 4, C: 0 }, { A: 4, B: 6, C: 0 }]) {
  const { stats, rows } = distribution(counts);
  const winner = counts.A > counts.B ? "A" : "B";
  const leader = computeLeader(rows);
  assert.deepEqual(leadingValues(rows).map(({ value }) => value), [winner]);
  assert.equal(leader.leader?.value, winner);
  assert.equal(leader.isTie, false);
  const html = renderToStaticMarkup(createElement(DistributionCard, {
    dist: { id: "test", title: "Test", total: stats.total, rows, ...leader },
  }));
  assert(html.includes("Leading response"));
  assert(html.includes("60%"));
  console.log(`PASS ${stats.percentages.A}% / ${stats.percentages.B}%: correct unique leader`);
}

const tied = distribution({ A: 5, B: 5, C: 0 });
const tieLeader = computeLeader(tied.rows);
assert.deepEqual(tieLeader.tiedValues, ["A", "B"]);
assert(tieLeader.isTie);
const tieHTML = renderToStaticMarkup(createElement(DistributionCard, {
  dist: { id: "tie", title: "Tie", total: tied.stats.total, rows: tied.rows, ...tieLeader },
}));
assert(tieHTML.includes("Tie ·"));
assert.equal(tied.stats.counts.C, 0);
assert.equal(tied.stats.percentages.C, 0);
assert(tieHTML.includes("0%"));
console.log("PASS explicit ties and correct zero-vote percentages");

const three = distribution({ A: 20, B: 30, C: 50 });
assert.deepEqual(three.stats.percentages, { A: 20, B: 30, C: 50 });
assert.deepEqual(sortOptionsByLivePercentage(options, three.stats).map(({ value }) => value), ["C", "B", "A"]);
assert.deepEqual(options.map(({ value }) => value), ["A", "B", "C"]);
const questionOne = countValidVotes(["A", "A", "B", null, "", "invalid", undefined], ["A", "B", "C"]);
assert.equal(questionOne.total, 3);
assert.deepEqual(questionOne.percentages, { A: 67, B: 33, C: 0 });
assert.deepEqual(countValidVotes(["Y", "Y", null, "invalid"], ["X", "Y"]).percentages, { X: 0, Y: 100 });
console.log("PASS submitted-only per-question denominator and unchanged canonical options");

assert.deepEqual(FORM1_QUESTIONS.slice(0, 3).map(({ id }) => id), ["role", "department", "semester"]);
assert.deepEqual(FORM1_QUESTIONS.filter(({ audience }) => audience === "Student").map(({ id }) => id), STUDENT_QUESTION_IDS);
assert.deepEqual(FORM1_QUESTIONS.filter(({ audience }) => audience === "Teacher").map(({ id }) => id), TEACHER_QUESTION_IDS);
assert(TEACHER_QUESTION_IDS.every((id) => !STUDENT_QUESTION_IDS.includes(id)));
console.log("PASS fixed source order and isolated Student / Teacher branches");

for (const tie of [false, true]) {
  const summary = {
    id: "slot", label: "Slot", average: 4, total: 10,
    distribution: [1, 2, 3, 4, 5].map((n) => ({
      value: String(n), label: String(n),
      count: tie ? (n === 4 || n === 5 ? 5 : 0) : (n === 5 ? 6 : n === 4 ? 4 : 0),
      percent: tie ? (n === 4 || n === 5 ? 50 : 0) : (n === 5 ? 60 : n === 4 ? 40 : 0),
    })),
  };
  const html = renderToStaticMarkup(createElement(RatingCard, { summary }));
  assert(html.includes("4.00"));
  assert(html.includes(tie ? "50%" : "60%"));
  assert.deepEqual(computeLeader(summary.distribution).tiedValues, tie ? ["4", "5"] : ["5"]);
}
console.log("PASS unchanged 1–5 rating summaries, leaders and ties");
console.log("All poll analytics regression checks passed.");
