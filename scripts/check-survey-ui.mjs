import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseURL = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000";
const screenshotDir = process.env.TEST_SCREENSHOT_DIR ?? "/tmp/fairness-ui-check";
await mkdir(screenshotDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1360, height: 900 }, colorScheme: "light", reducedMotion: "reduce" });
page.setDefaultTimeout(6_000);
page.setDefaultNavigationTimeout(12_000);
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

async function checkSurveyVisibility(viewport, theme, label) {
  await page.setViewportSize(viewport);
  await page.goto(baseURL, { waitUntil: "load" });
  const current = await page.locator("html").evaluate((html) => html.classList.contains("dark") ? "dark" : "light");
  if (current !== theme) {
    await page.getByRole("button", { name: `Switch to ${theme} theme` }).click();
  }
  assert.equal(await page.locator("html").evaluate((html) => html.classList.contains("dark")), theme === "dark", `${label}: theme applied`);
  const one = page.getByRole("link", { name: "Open Form 1 — Student and Teacher Survey", exact: true });
  const two = page.getByRole("link", { name: "Open Form 2 — Time-Slot Rating Survey", exact: true });
  for (const [name, link] of [["Form 1", one], ["Form 2", two]]) {
    assert(await link.isVisible(), `${label}: ${name} is visible`);
    const box = await link.boundingBox();
    assert(box && box.y >= 0 && box.y + box.height <= viewport.height, `${label}: ${name} button is within initial viewport (bottom=${box?.y + box?.height})`);
  }
  const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  assert(noOverflow, `${label}: no horizontal overflow`);
  await page.screenshot({ path: `${screenshotDir}/${label}.png`, fullPage: true });
  console.log(`PASS ${label}: both survey buttons in first viewport, theme correct, no overflow`);
}

try {
  await checkSurveyVisibility({ width: 1360, height: 900 }, "light", "home-desktop-light");
  await checkSurveyVisibility({ width: 1360, height: 900 }, "dark", "home-desktop-dark");
  await checkSurveyVisibility({ width: 390, height: 844 }, "light", "home-mobile-light");
  await checkSurveyVisibility({ width: 390, height: 844 }, "dark", "home-mobile-dark");

  await page.setViewportSize({ width: 1100, height: 1000 });
  let statsRequests = 0;
  page.on("request", (request) => {
    if (request.url().includes("/api/form1/stats")) statsRequests += 1;
  });
  await page.goto(`${baseURL}/form1`, { waitUntil: "load" });
  await page.waitForFunction(() => {
    const raw = sessionStorage.getItem("fairness-poll-stats:form1");
    return raw && !!JSON.parse(raw).data.semester;
  });
  const stats = await page.evaluate(() => JSON.parse(sessionStorage.getItem("fairness-poll-stats:form1")).data.semester);
  await page.getByRole("button", { name: /^Student\s/ }).click();
  const semester = page.locator("#question-semester");
  await semester.waitFor({ state: "visible" });
  assert.equal(await semester.locator("[data-poll-result]").count(), 0, "No results before clicking semester");
  assert.equal(await page.locator(".survey-card[id]").first().getAttribute("id"), "question-semester", "Semester remains first");
  const studentOrder = await page.locator(".survey-card[id]").evaluateAll((cards) => cards.map((card) => card.id));
  assert.deepEqual(studentOrder, [
    "question-semester", "question-q_avoid", "question-q_weekly_off", "question-q_between_classes",
    "question-q_extra_time", "question-q_long_gap", "question-q_midday_break", "question-q_max_hours",
    "question-q_lab_cap", "question-q_priority_group", "question-q_conflict_student",
  ], "Form 1 student order matches Google Forms");
  assert.equal(await page.locator(".survey-card[id] .survey-visual").count(), 10, "Every applicable student question has its diagram");
  console.log("PASS Form 1: exact student order, semester first, percentages hidden before click, diagrams present");

  const requestsBefore = statsRequests;
  await semester.getByRole("button").nth(0).click();
  await semester.locator('[data-poll-result="1.1"]').waitFor({ state: "visible" });
  assert.equal(await semester.locator("[data-poll-result]").count(), 8, "All eight semester results revealed");
  const values = ["1.1", "1.2", "2.1", "2.2", "3.1", "3.2", "4.1", "4.2"];
  for (const value of values) {
    const text = await semester.locator(`[data-poll-result="${value}"]`).innerText();
    assert(text.includes(`${stats.percentages[value] ?? 0}%`), `${value}: correct percentage`);
    assert(text.includes(`${stats.counts[value] ?? 0} vote`), `${value}: correct submitted count`);
  }
  assert.equal(await page.locator('.survey-card:not(#question-semester) [data-poll-result]').count(), 0, "Other unclicked questions remain hidden");
  assert.equal(statsRequests, requestsBefore, "Semester click makes no additional stats request");
  console.log("PASS semester: clicking reveals all eight counts and percentages from the preloaded data");

  const snapshotBefore = await semester.locator("[data-poll-result]").allTextContents();
  await semester.getByRole("button").nth(1).click();
  assert.equal(await semester.getByRole("button").nth(1).getAttribute("aria-pressed"), "true");
  assert.deepEqual(await semester.locator("[data-poll-result]").allTextContents(), snapshotBefore, "Changing answer does not change counts");
  assert.equal(statsRequests, requestsBefore, "Changing semester makes no network request");
  await semester.screenshot({ path: `${screenshotDir}/semester-results-dark.png` });
  console.log("PASS semester: answer can change without casting another vote or fetching stats");

  const avoid = page.locator("#question-q_avoid");
  await avoid.getByRole("button").first().click();
  assert.equal(await avoid.locator("[data-poll-result]").count(), 2, "Preference poll still reveals both choices");
  console.log("PASS preference poll: both choices still reveal after selection");

  await page.getByRole("link", { name: "Return to the survey home page", exact: true }).click();
  await page.waitForURL(baseURL + "/");
  assert(await page.getByRole("link", { name: "Open Form 1 — Student and Teacher Survey", exact: true }).isVisible());
  console.log("PASS Home button returns to the survey-first landing page");

  await page.goto(`${baseURL}/form2`, { waitUntil: "load" });
  assert(await page.getByText("1. Time-Slot Preference Rating *", { exact: true }).isVisible());
  for (const label of ["8:00–9:20", "9:30–10:50", "11:00–12:20", "12:30–13:50", "14:00–15:20", "15:30–16:50", "17:00–18:20"]) {
    assert(await page.getByText(label, { exact: true }).isVisible(), `Form 2 slot visible: ${label}`);
  }
  const longGapTitle = page.getByText("2. Long Campus Gaps Between Classes (Idle Wait Time) *", { exact: true });
  const fairnessTitle = page.getByText("3. Multi-Semester Fairness (Algorithmic Memory) *", { exact: true });
  const feedbackTitle = page.getByText("4. Additional Feedback & Constraints", { exact: true });
  assert(await longGapTitle.isVisible() && await fairnessTitle.isVisible() && await feedbackTitle.isVisible(), "Form 2 questions visible");
  const y = async (locator) => (await locator.boundingBox()).y;
  assert(await y(longGapTitle) < await y(fairnessTitle) && await y(fairnessTitle) < await y(feedbackTitle), "Form 2 Google Forms order is fixed");
  assert.equal(await page.getByPlaceholder("Short answer text").count(), 1, "Form 2 feedback placeholder matches");
  console.log("PASS Form 2: exact slot labels, 1–5 structure, question order and feedback copy");

  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log(`All checks passed. Screenshots: ${screenshotDir}`);
} finally {
  await browser.close();
}
