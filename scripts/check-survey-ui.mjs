import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseURL = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000";
const screenshotDir = process.env.TEST_SCREENSHOT_DIR ?? "/tmp/fairness-ui-check";
await mkdir(screenshotDir, { recursive: true });

const STUDENT_FORM1 = [
  "semester", "q_avoid", "q_weekly_off", "q_between_classes", "q_extra_time", "q_long_gap",
  "q_midday_break", "q_max_hours", "q_lab_cap", "q_priority_group", "q_conflict_student",
];
const TEACHER_FORM1 = [
  "q_teaching_schedule", "q_zero_day", "q_consecutive", "q_gap_pref", "q_faculty_conflict",
  "q_compensate", "q_conflict_teacher",
];
const CANONICAL_FORM1 = [
  "role", "department", ...STUDENT_FORM1, ...TEACHER_FORM1,
];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1360, height: 900 }, colorScheme: "light", reducedMotion: "reduce" });
page.setDefaultTimeout(8000);
page.setDefaultNavigationTimeout(15000);
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const cardIds = () => page.locator(".survey-card[id]").evaluateAll((cards) => cards.map((card) => card.id.replace(/^question-/, "")));

async function checkHome(viewport, theme, label) {
  await page.setViewportSize(viewport);
  await page.goto(baseURL, { waitUntil: "load" });
  const dark = await page.locator("html").evaluate((html) => html.classList.contains("dark"));
  if (dark !== (theme === "dark")) {
    // The theme switch is client-hydrated; wait for hydration before clicking it.
    await page.waitForTimeout(600);
    await page.getByRole("button", { name: "Toggle dark mode" }).click();
    await page.waitForFunction((expected) => document.documentElement.classList.contains("dark") === expected, theme === "dark");
  }
  assert.equal(await page.locator("html").evaluate((html) => html.classList.contains("dark")), theme === "dark");
  for (const name of ["Open Form 1 — Student and Teacher Survey", "Open Form 2 — Time-Slot Rating Survey"]) {
    const link = page.getByRole("link", { name, exact: true });
    assert(await link.isVisible(), `${label}: survey CTA visible`);
    const box = await link.boundingBox();
    assert(box && box.y + box.height <= viewport.height, `${label}: survey CTA above fold`);
  }
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label}: no horizontal overflow`);
  console.log(`PASS homepage ${label}: both forms immediately visible`);
}

async function assertCardRevealed(cardId, stats) {
  const card = page.locator(`#question-${cardId}`);
  const expected = Object.keys(stats[cardId]?.counts ?? {}).length;
  assert(expected > 0, `${cardId}: options are defined in canonical stats`);
  assert.equal(await card.locator("[data-poll-result]").count(), expected, `${cardId}: all options revealed`);
  for (const [value, count] of Object.entries(stats[cardId].counts)) {
    const text = await card.locator(`[data-poll-result="${value}"]`).innerText();
    assert(text.includes(`${count} vote`), `${cardId}/${value}: submitted count is displayed`);
    assert(text.includes(`${stats[cardId].percentages[value]}%`), `${cardId}/${value}: percentage is displayed`);
  }
}

try {
  await checkHome({ width: 1360, height: 900 }, "light", "desktop-light");
  await checkHome({ width: 1360, height: 900 }, "dark", "desktop-dark");
  await checkHome({ width: 390, height: 844 }, "light", "mobile-light");
  await checkHome({ width: 390, height: 844 }, "dark", "mobile-dark");

  // Form 1: no percentages on first visit. Clicking an option reveals ONLY
  // that question's results; every other question stays hidden until clicked.
  await page.setViewportSize({ width: 1100, height: 1000 });
  await page.goto(`${baseURL}/form1`, { waitUntil: "load" });
  assert.equal(await page.locator("[data-poll-result]").count(), 0, "no poll percentages before a selection");
  await page.getByRole("button", { name: "Student", exact: true }).click();
  await page.locator("#question-semester").waitFor({ state: "visible" });
  await page.waitForFunction(() => {
    const raw = sessionStorage.getItem("fairness-poll-stats:form1");
    return raw && JSON.parse(raw).data.semester;
  });
  const form1Stats = await page.evaluate(() => JSON.parse(sessionStorage.getItem("fairness-poll-stats:form1")).data);
  const studentIds = await cardIds();
  assert.equal(studentIds[0], "semester", "semester stays fixed first");
  assert.deepEqual([...studentIds].sort(), [...STUDENT_FORM1].sort(), "student branch shows the exact applicable question set, no mixing");
  assert.equal(await page.locator("[data-poll-result]").count(), 0, "profile selection reveals nothing by itself");
  const semester = page.locator("#question-semester");
  await semester.getByRole("button").first().click();
  await semester.locator("[data-poll-result]").first().waitFor({ state: "visible" });
  assert.equal(await semester.locator("[data-poll-result]").count(), 8, "semester click reveals all eight semester options");
  const otherCards = page.locator(".survey-card[id]:not(#question-semester)");
  assert.equal(await otherCards.locator("[data-poll-result]").count(), 0, "other questions stay hidden after one question is clicked");
  for (const [value, count] of Object.entries(form1Stats.semester.counts)) {
    const text = await semester.locator(`[data-poll-result="${value}"]`).innerText();
    assert(text.includes(`${count} vote`), `semester/${value}: submitted count displayed`);
    assert(text.includes(`${form1Stats.semester.percentages[value]}%`), `semester/${value}: percentage displayed`);
  }
  console.log("PASS Form 1: one click reveals ONLY that question's results");

  // Clicking a second question reveals only that question too; changing a
  // selection only moves the highlight and never changes database statistics.
  const avoid = page.locator("#question-q_avoid");
  await avoid.getByRole("button").first().click();
  await avoid.locator("[data-poll-result]").first().waitFor({ state: "visible" });
  assert.equal(await avoid.locator("[data-poll-result]").count(), 2, "second clicked question reveals both its options");
  assert.equal(await semester.locator("[data-poll-result]").count(), 8, "first question stays revealed independently");
  const beforeSwitch = await avoid.locator("[data-poll-result]").allTextContents();
  await avoid.getByRole("button").last().click();
  assert.deepEqual(await avoid.locator("[data-poll-result]").allTextContents(), beforeSwitch, "pre-submit answer changes do not change database statistics");
  assert.equal(await avoid.getByRole("button", { pressed: true }).count(), 1, "exactly one option highlighted per question");
  console.log("PASS Form 1: per-question reveal is independent; re-selection only moves highlight");

  // Teacher branch contains only teacher questions, no Student or Semester item.
  await page.goto(`${baseURL}/form1`, { waitUntil: "load" });
  await page.getByRole("button", { name: "Teacher", exact: true }).click();
  await page.waitForFunction(() => sessionStorage.getItem("fairness-poll-stats:form1"));
  const teacherIds = await cardIds();
  assert.deepEqual([...teacherIds].sort(), [...TEACHER_FORM1].sort(), "teacher branch contains only teacher questions, no mixing");
  assert(!teacherIds.includes("semester"), "semester question is student-only");
  // Shuffle check: reload and confirm the post-semester order varies across entries.
  const seenOrders = new Set();
  for (let attempt = 0; attempt < 4; attempt += 1) {
    await page.goto(`${baseURL}/form1`, { waitUntil: "load" });
    await page.getByRole("button", { name: "Student", exact: true }).click();
    await page.locator("#question-semester").waitFor({ state: "visible" });
    const ids = await cardIds();
    assert.equal(ids[0], "semester", "semester fixed first on every entry");
    seenOrders.add(ids.slice(1).join(","));
  }
  assert(seenOrders.size >= 2, `opinion questions shuffle on entry (saw ${seenOrders.size} distinct orders)`);
  console.log("PASS Form 1 shuffle: semester fixed, opinion order varies per entry");
  await page.goto(`${baseURL}/form1`, { waitUntil: "load" });
  await page.getByRole("button", { name: "Teacher", exact: true }).click();
  await page.locator(`#question-${teacherIds[0]}`).waitFor({ state: "visible" });
  const teacherFirst = page.locator(`#question-${teacherIds[0]}`);
  await teacherFirst.getByRole("button").first().click();
  await teacherFirst.locator("[data-poll-result]").first().waitFor({ state: "visible" });
  assert((await teacherFirst.locator("[data-poll-result]").count()) > 0, "clicked teacher question reveals its results");
  const unclickedTeacher = page.locator(`#question-${teacherIds[1]}`);
  assert.equal(await unclickedTeacher.locator("[data-poll-result]").count(), 0, "unclicked teacher questions stay hidden");
  console.log("PASS Form 1: teacher questions never mix with student-only questions");

  // Results endpoints preserve source serial order, never the interactive sort.
  const form1Results = await (await page.request.get(`${baseURL}/api/form1/results`)).json();
  assert.deepEqual(form1Results.distributions.map((item) => item.id), CANONICAL_FORM1, "Form 1 results remain in source serial order");
  console.log("PASS Form 1 analytics retains canonical serial order");

  // Form 2: rating one slot reveals ONLY that row; other rows stay hidden.
  await page.goto(`${baseURL}/form2`, { waitUntil: "load" });
  assert.equal(await page.locator("[data-rating-result]").count(), 0, "Form 2 results initially hidden");
  await page.waitForFunction(() => {
    const raw = sessionStorage.getItem("fairness-poll-stats:form2");
    return raw && JSON.parse(raw).data.time_slot_8_00;
  });
  const matrixRows = page.locator("[data-time-slot]");
  assert.equal(await matrixRows.count(), 7, "all seven original time slots present");
  const firstRow = matrixRows.first();
  await firstRow.getByRole("button").first().click();
  await firstRow.locator("[data-rating-result]").first().waitFor({ state: "visible" });
  assert.equal(await firstRow.locator("[data-rating-result]").count(), 5, "rated row reveals all five ratings");
  assert.equal(await matrixRows.nth(1).locator("[data-rating-result]").count(), 0, "unrated rows stay hidden");
  const form2Results = await (await page.request.get(`${baseURL}/api/form2/results`)).json();
  assert.deepEqual(form2Results.slots.map((slot) => slot.id), ["time_slot_8_00","time_slot_9_30","time_slot_11_00","time_slot_12_30","time_slot_14_00","time_slot_15_30","time_slot_17_00"], "Form 2 analytics retain canonical slot order");
  console.log("PASS Form 2: rating one slot reveals only that row; analytics order is canonical");

  assert.deepEqual(errors, [], "no browser runtime errors");
  console.log("All browser regression checks passed.");
} finally {
  await browser.close();
}
