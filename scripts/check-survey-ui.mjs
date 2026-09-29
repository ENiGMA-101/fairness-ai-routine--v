import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { chromium } from "playwright";
import {
  FORM1_QUESTIONS,
  STUDENT_QUESTION_IDS,
  TEACHER_QUESTION_IDS,
  SURVEY_VERSION,
  TIME_SLOTS,
} from "../src/lib/survey.ts";

const baseURL = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true });
const contextA = await browser.newContext({ baseURL, viewport: { width: 1180, height: 880 } });
const page = await contextA.newPage();
page.setDefaultTimeout(10_000);
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const sessionKey = `fairness-poll-stats:v${SURVEY_VERSION}:form1`;
const questionIds = () => page.locator(".survey-card[id]").evaluateAll((cards) => cards.map((card) => card.id.replace("question-", "")));

async function chooseRole(role) {
  await page.getByRole("button", { name: role, exact: true }).click();
  await page.locator(".survey-card[id]").first().waitFor({ state: "visible" });
}

try {
  await page.goto("/", { waitUntil: "load" });
  assert(await page.locator('a[href="/form1"]').last().isVisible());
  assert(await page.locator('a[href="/form2"]').last().isVisible());
  console.log("PASS both surveys are immediately accessible from Home");

  const studentOrders = new Set();
  for (let i = 0; i < 5; i += 1) {
    await page.goto("/form1", { waitUntil: "load" });
    await chooseRole("Student");
    const ids = await questionIds();
    assert.equal(ids[0], "semester", "Semester must always be the first role-specific question");
    assert.deepEqual(new Set(ids), new Set(STUDENT_QUESTION_IDS));
    assert(ids.every((id) => !TEACHER_QUESTION_IDS.includes(id)), "Teacher questions cannot appear in Student section");
    studentOrders.add(ids.join(","));
  }
  assert(studentOrders.size > 1, "Student questions shuffle between entries");
  console.log(`PASS semester fixed; Student questions shuffle across ${studentOrders.size} different visits`);

  const semester = page.locator("#question-semester");
  assert.equal(await semester.locator("[data-poll-result]").count(), 0, "Unanswered question never shows a percentage");
  await page.waitForFunction((key) => {
    const raw = sessionStorage.getItem(key);
    return raw && !!JSON.parse(raw).data.semester;
  }, sessionKey);
  const beforeSelection = (await (await contextA.request.get("/api/form1/stats/all")).json()).semester;
  await semester.locator("button").first().click();
  await semester.locator("[data-poll-result]").first().waitFor({ state: "visible" });
  assert.equal(await semester.locator("[data-poll-result]").count(), 8);
  await semester.locator("button").last().click();
  assert.equal((await (await contextA.request.get("/api/form1/stats/all")).json()).semester.total, beforeSelection.total);
  console.log("PASS selecting and changing an answer reveals results but does not submit a vote");

  const teacherOrders = new Set();
  for (let i = 0; i < 4; i += 1) {
    await page.goto("/form1", { waitUntil: "load" });
    await chooseRole("Teacher");
    const ids = await questionIds();
    assert.deepEqual(new Set(ids), new Set(TEACHER_QUESTION_IDS));
    assert(ids.every((id) => !STUDENT_QUESTION_IDS.includes(id)), "Student questions cannot appear in Teacher section");
    teacherOrders.add(ids.join(","));
  }
  assert(teacherOrders.size > 1, "Teacher questions shuffle independently");
  console.log(`PASS Teacher-only questions shuffle across ${teacherOrders.size} visits; no audience mixing`);

  await page.waitForFunction((key) => {
    const raw = sessionStorage.getItem(key);
    return raw && !!JSON.parse(raw).data.q_teaching_schedule;
  }, sessionKey);
  const teacherCard = page.locator("#question-q_teaching_schedule");
  const beforeVote = (await (await contextA.request.get("/api/form1/stats/all")).json()).q_teaching_schedule;
  await teacherCard.locator("button").first().click();
  assert.equal(await teacherCard.locator("[data-poll-result]").count(), 2, "Both poll options revealed after one click");
  await teacherCard.locator("button").last().click();
  assert.equal((await (await contextA.request.get("/api/form1/stats/all")).json()).q_teaching_schedule.total, beforeVote.total);

  // A second isolated browser context submits a full Teacher survey. The first
  // browser stays on the poll; its visible percentages must update by polling.
  const contextB = await browser.newContext({ baseURL });
  const testId = `poll-regression-${randomUUID()}`;
  const teacherAnswers = Object.fromEntries(TEACHER_QUESTION_IDS.map((id) => [
    id, FORM1_QUESTIONS.find((question) => question.id === id).options[0].value,
  ]));
  const submitted = await contextB.request.post("/api/form1/submit", {
    data: { browser_id: testId, role: "Teacher", department: "CSE", answers: teacherAnswers },
  });
  assert.equal(submitted.status(), 200, `Second browser submission: ${await submitted.text()}`);
  await page.waitForFunction((expected) => {
    const card = document.querySelector("#question-q_teaching_schedule");
    return card?.textContent?.includes(`All options · ${expected} submitted response`);
  }, beforeVote.total + 1, { timeout: 22_000 });
  const refreshed = (await (await contextA.request.get("/api/form1/stats/all")).json()).q_teaching_schedule;
  assert.equal(refreshed.total, beforeVote.total + 1);
  for (const [option, count] of Object.entries(refreshed.counts)) {
    const row = teacherCard.locator(`[data-poll-result="${option}"]`);
    assert((await row.innerText()).includes(`${count} vote`));
    assert((await row.innerText()).includes(`${refreshed.percentages[option]}%`));
  }
  console.log("PASS another browser's submission updates the open poll automatically without reloading");
  await contextB.close();

  // Mock one aggregate response to confirm options are sorted by live percentage
  // in the SURVEY only. No votes are inserted by this display-order test.
  const contextC = await browser.newContext({ baseURL });
  const actual = await (await contextC.request.get("/api/form1/stats/all")).json();
  await contextC.route("**/api/form1/stats/all", async (route) => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ ...actual, q_avoid: {
      total: 10,
      counts: { morning: 2, evening: 8 },
      percentages: { morning: 20, evening: 80 },
    } }),
  }));
  const rankedPage = await contextC.newPage();
  await rankedPage.goto("/form1", { waitUntil: "load" });
  await rankedPage.getByRole("button", { name: "Student", exact: true }).click();
  const ranked = rankedPage.locator("#question-q_avoid");
  await ranked.waitFor({ state: "visible" });
  await rankedPage.waitForFunction((version) => {
    const raw = sessionStorage.getItem(`fairness-poll-stats:v${version}:form1`);
    return raw && JSON.parse(raw).data.q_avoid.percentages.evening === 80;
  }, SURVEY_VERSION);
  assert((await ranked.locator("button").first().innerText()).includes("বিকেল"));
  assert.equal(await ranked.locator("[data-poll-result]").count(), 0);
  await ranked.locator("button").first().click();
  assert.equal(await ranked.locator("[data-poll-result]").count(), 2);
  assert((await ranked.locator("[data-poll-result]").first().innerText()).includes("80%"));
  await contextC.close();
  console.log("PASS survey options sort by live percentage; unclicked results stay hidden");

  // Form 2 is a *numeric* 1–5 rating scale, not a poll that may reorder its
  // options. Even if rating 5 has most votes, its position must stay last.
  const ratingContext = await browser.newContext({ baseURL });
  const originalForm2Stats = await (await ratingContext.request.get("/api/form2/stats/all")).json();
  let mostPopularRating = 5;
  const ratingCounts = () => ({
    total: 10,
    counts: mostPopularRating === 5
      ? { "1": 1, "2": 0, "3": 0, "4": 0, "5": 9 }
      : { "1": 9, "2": 0, "3": 0, "4": 0, "5": 1 },
    percentages: mostPopularRating === 5
      ? { "1": 10, "2": 0, "3": 0, "4": 0, "5": 90 }
      : { "1": 90, "2": 0, "3": 0, "4": 0, "5": 10 },
  });
  await ratingContext.route("**/api/form2/stats/all", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      ...originalForm2Stats,
      time_slot_8_00: ratingCounts(),
      long_gap_rating: ratingCounts(),
      fairness_rating: ratingCounts(),
    }),
  }));
  const ratingPage = await ratingContext.newPage();
  await ratingPage.goto("/form2", { waitUntil: "load" });
  await ratingPage.waitForFunction((version) => {
    const raw = sessionStorage.getItem(`fairness-poll-stats:v${version}:form2`);
    return raw && JSON.parse(raw).data?.long_gap_rating?.percentages?.["5"] === 90;
  }, SURVEY_VERSION);
  const slotGroup = ratingPage.getByRole("group", { name: `Rate ${TIME_SLOTS[0].label}`, exact: true });
  const gapGroup = ratingPage.getByRole("group", { name: /^2\. Long Campus Gaps Between Classes/ });
  const fairnessGroup = ratingPage.getByRole("group", { name: /^3\. Multi-Semester Fairness/ });
  const fixedScale = [1, 2, 3, 4, 5];
  const renderedOrder = (group) => group.locator("button").evaluateAll((buttons) => buttons.map(
    (button) => Number(button.getAttribute("aria-label")?.match(/([1-5]) of 5/)?.[1]),
  ));
  for (const group of [slotGroup, gapGroup, fairnessGroup]) {
    await group.waitFor({ state: "visible" });
    assert.deepEqual(await renderedOrder(group), fixedScale, "Ratings are ordered 1–5 when 5 is most popular");
  }
  await slotGroup.locator("button").nth(4).click();
  await gapGroup.locator("button").nth(1).click();
  await fairnessGroup.locator("button").nth(0).click();
  await slotGroup.locator("button").nth(4).getByText("90%").waitFor({ state: "visible" });
  for (const group of [slotGroup, gapGroup, fairnessGroup]) {
    assert.deepEqual(await renderedOrder(group), fixedScale, "Ratings stay ordered 1–5 after selecting");
  }
  mostPopularRating = 1;
  await ratingPage.evaluate(() => window.dispatchEvent(new Event("focus")));
  await ratingPage.waitForFunction((version) => {
    const raw = sessionStorage.getItem(`fairness-poll-stats:v${version}:form2`);
    return raw && JSON.parse(raw).data?.long_gap_rating?.percentages?.["1"] === 90;
  }, SURVEY_VERSION);
  await gapGroup.locator("button").nth(0).getByText("90%").waitFor({ state: "visible" });
  for (const group of [slotGroup, gapGroup, fairnessGroup]) {
    assert.deepEqual(await renderedOrder(group), fixedScale, "Live updates never reshuffle 1–5 ratings");
  }
  assert.equal(await ratingPage.getByRole("button", { name: /^(Next|Previous)$/i }).count(), 0);
  console.log("PASS Form 2 ratings always read 1–5; no next or previous controls");
  await ratingContext.close();

  const apiOne = await (await contextA.request.get("/api/form1/results")).json();
  assert.deepEqual(apiOne.distributions.map(({ id }) => id), FORM1_QUESTIONS.map(({ id }) => id));
  await page.goto("/results/form1", { waitUntil: "load" });
  assert.deepEqual(
    await page.locator("article h3").allTextContents(),
    apiOne.distributions.filter(({ total }) => total > 0).map(({ title }) => title),
    "Dedicated Form 1 results preserve canonical question order",
  );
  console.log("PASS dedicated Form 1 results preserve original serial order");

  const form2Id = `poll-regression-${randomUUID()}`;
  const responseTwo = await contextA.request.post("/api/form2/submit", {
    data: {
      browser_id: form2Id, role: "Student", department: "EEE",
      time_slots: Object.fromEntries(TIME_SLOTS.map(({ id }, index) => [id, (index % 5) + 1])),
      long_gap_rating: 2, fairness_rating: 5, feedback: "",
    },
  });
  assert.equal(responseTwo.status(), 200, `Form 2 test response: ${await responseTwo.text()}`);
  const apiTwo = await (await contextA.request.get("/api/form2/results")).json();
  assert.deepEqual(apiTwo.slots.map(({ id }) => id), TIME_SLOTS.map(({ id }) => id));
  await page.goto("/results/form2", { waitUntil: "load" });
  const resultLabels = await page.locator("article h3").allTextContents();
  assert.deepEqual(resultLabels.slice(0, 9), [
    ...apiTwo.slots.map(({ label }) => label), apiTwo.longGap.label, apiTwo.fairness.label,
  ], "Dedicated Form 2 results keep original slot and question order");
  console.log("PASS dedicated Form 2 results preserve original serial order");

  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log("All browser poll regression checks passed. Clean up poll-regression-* rows after testing.");
} finally {
  await browser.close();
}
