import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { chromium } from "playwright";
import {
  FORM1_QUESTIONS,
  SEMESTERS,
  STUDENT_QUESTION_IDS,
  TEACHER_QUESTION_IDS,
  SURVEY_VERSION,
  TIME_SLOTS,
} from "../src/lib/survey.ts";

const baseURL = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true });
const browserErrors = [];
const testedIds = [];

function watch(page) { page.on("pageerror", (error) => browserErrors.push(error.message)); }
async function ids(page) {
  return page.locator('.survey-card[id^="question-"]').evaluateAll((cards) => cards.map((el) => el.id.replace("question-", "")));
}
async function values(locator, attr = "data-option-value") {
  return locator.locator(`[${attr}]`).evaluateAll((items, key) => items.map((item) => item.getAttribute(key)), attr);
}
async function submitTeacher(context, id) {
  const answers = Object.fromEntries(TEACHER_QUESTION_IDS.map((qid) => [
    qid, FORM1_QUESTIONS.find(({ id: key }) => key === qid).options[0].value,
  ]));
  return context.request.post("/api/form1/submit", { data: { browser_id: id, role: "Teacher", department: "CSE", answers } });
}

try {
  for (const width of [360, 390, 430, 768, 1360]) {
    const context = await browser.newContext({ baseURL, viewport: { width, height: width < 500 ? 800 : 900 } });
    await context.addInitScript(() => localStorage.setItem("fairness-theme", "dark"));
    const page = await context.newPage(); watch(page);
    for (const path of ["/", "/form1", "/form2"]) {
      await page.goto(path, { waitUntil: "load" });
      await page.waitForFunction(() => document.documentElement.classList.contains("dark"));
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${width}px ${path}: no horizontal scrolling`);
      if (path === "/") {
        const one = page.getByRole("link", { name: /Open Form 1 — Student and Teacher Survey/ });
        const two = page.getByRole("link", { name: /Open Form 2 — Time-Slot Rating Survey/ });
        assert(await one.isVisible() && await two.isVisible(), `${width}px: both surveys visible`);
        if (width < 500) {
          const card = await two.boundingBox();
          assert(card && card.y < 800, `${width}px: Form 2 choice appears in first viewport`);
        }
      }
      if (path === "/form1" || path === "/form2") {
        const roleButton = page.locator('#question-role button[data-profile-option="Student"]');
        const box = await roleButton.boundingBox();
        assert(box && box.height >= 44 && box.width >= 100, `${width}px ${path}: entire role card is touch friendly`);
        await roleButton.click();
        await page.locator('#question-role [data-profile-result="Teacher"]').waitFor();
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${width}px ${path} with results: no horizontal scrolling`);
        assert(await page.getByRole("button", { name: "Next question" }).isVisible());
      }
    }
    await context.close();
    console.log(`PASS ${width}px: dark theme, both forms accessible, touch targets, live profile results, no overflow`);
  }

  const context = await browser.newContext({ baseURL, viewport: { width: 1024, height: 900 } });
  const page = await context.newPage(); watch(page);
  page.setDefaultTimeout(10_000);
  const studentOrders = new Set();
  let previousOptionOrder = null;
  for (let n = 0; n < 4; n++) {
    await page.goto("/form1", { waitUntil: "load" });
    await page.locator('#question-role button[data-profile-option="Student"]').click();
    await page.locator("#question-semester").waitFor();
    await page.waitForTimeout(90); // client-only session shuffle has completed
    const current = await ids(page);
    assert.deepEqual(current.slice(0, 3), ["role", "department", "semester"]);
    assert.deepEqual(new Set(current.slice(2)), new Set(STUDENT_QUESTION_IDS));
    assert(current.every((id) => !TEACHER_QUESTION_IDS.includes(id)), "No teacher-only questions in Student form");
    assert.deepEqual(await values(page.locator("#question-semester")), SEMESTERS, "Semester choices always canonical");
    studentOrders.add(current.join(","));
    const optionOrder = await values(page.locator("#question-q_avoid"));
    if (previousOptionOrder) assert.notDeepEqual(optionOrder, previousOptionOrder, "Options change order on each entry");
    previousOptionOrder = optionOrder;
    assert.equal(await page.locator('#question-q_avoid [data-poll-result]').count(), 0, "Unanswered question hides results");
  }
  assert(studentOrders.size > 1, "Student questions shuffle across sessions");
  console.log("PASS Student questions and options shuffle; profile and semester stay fixed");

  await page.locator('#question-department button[data-profile-option="CSE"]').click();
  const semester = page.locator("#question-semester");
  await semester.locator('button[data-option-value="1.1"]').click();
  await semester.locator("[data-poll-result]").first().waitFor();
  assert.equal(await semester.locator("[data-poll-result]").count(), 8, "Semester reveals every option including zero votes");
  const baseline = (await (await context.request.get("/api/form1/stats/all")).json()).semester;
  await semester.locator('button[data-option-value="1.2"]').click();
  const unchanged = (await (await context.request.get("/api/form1/stats/all")).json()).semester;
  assert.deepEqual(unchanged, baseline, "Changing an answer before Submit never changes database statistics");
  const nav = page.getByRole("navigation", { name: "Survey question navigation" });
  assert(await nav.getByRole("button", { name: "Next question" }).isVisible());
  console.log("PASS fixed Semester choices, all results including 0%, no vote on selection changes");

  const teacherOrders = new Set();
  for (let n = 0; n < 4; n++) {
    await page.goto("/form1", { waitUntil: "load" });
    await page.locator('#question-role button[data-profile-option="Teacher"]').click();
    await page.locator("#question-q_teaching_schedule").waitFor();
    await page.waitForTimeout(90);
    const current = await ids(page);
    assert.deepEqual(current.slice(0, 2), ["role", "department"]);
    assert.deepEqual(new Set(current.slice(2)), new Set(TEACHER_QUESTION_IDS));
    assert(!current.includes("semester"), "Semester is Student-only");
    teacherOrders.add(current.join(","));
  }
  assert(teacherOrders.size > 1, "Teacher questions shuffle independently");
  console.log("PASS Teacher-only questions shuffle without Student questions");

  const teacherCard = page.locator("#question-q_teaching_schedule");
  await teacherCard.locator("button[data-option-value]").first().click();
  await teacherCard.locator("[data-poll-result]").first().waitFor();
  const before = (await (await context.request.get("/api/form1/stats/all")).json()).q_teaching_schedule;
  const optionOrderBefore = await values(teacherCard);
  const contextB = await browser.newContext({ baseURL });
  const teacherId = `mobile-regression-${randomUUID()}`; testedIds.push(teacherId);
  const response = await submitTeacher(contextB, teacherId);
  assert.equal(response.status(), 200, `Second browser vote: ${await response.text()}`);
  await page.waitForFunction((total) => document.querySelector("#question-q_teaching_schedule")?.textContent?.includes(`All options · ${total} submitted response`), before.total + 1, { timeout: 20_000 });
  const updated = (await (await context.request.get("/api/form1/stats/all")).json()).q_teaching_schedule;
  assert.equal(updated.total, before.total + 1);
  assert.deepEqual(await values(teacherCard), optionOrderBefore, "Option order stays stable while live stats refresh");
  for (const [key, count] of Object.entries(updated.counts)) {
    const row = teacherCard.locator(`[data-poll-result="${key}"]`);
    assert((await row.innerText()).includes(`${count} vote`));
    assert((await row.innerText()).includes(`${updated.percentages[key]}%`));
  }
  await contextB.close();
  console.log("PASS another browser's submission refreshes every visible result without moving answer cards");

  // The Submit button stays usable when incomplete, tells a beginner what is
  // missing and moves focus to the first unanswered question.
  const contextStudent = await browser.newContext({ baseURL });
  const studentPage = await contextStudent.newPage(); watch(studentPage);
  const studentId = `mobile-regression-${randomUUID()}`; testedIds.push(studentId);
  await studentPage.addInitScript((id) => localStorage.setItem("fairness_browser_id", id), studentId);
  await studentPage.goto("/form1");
  await studentPage.locator('#question-role button[data-profile-option="Student"]').click();
  await studentPage.getByRole("button", { name: /^Submit Response/ }).click();
  await studentPage.locator('#question-department[data-invalid="true"]').waitFor();
  assert(await studentPage.getByRole("alert").isVisible(), "Missing required answer shows clear message");
  await studentPage.waitForFunction(() => document.activeElement?.id === "question-department");
  await studentPage.locator('#question-department button[data-profile-option="CSE"]').click();
  for (const question of FORM1_QUESTIONS.filter(({ audience }) => audience === "Student")) {
    await studentPage.locator(`#question-${question.id} button[data-option-value="${question.options[0].value}"]`).click();
  }
  const submitButton = studentPage.getByRole("button", { name: /^Submit Response/ });
  assert(await submitButton.isEnabled());
  await submitButton.click();
  await studentPage.getByText("Thank you! Your response has been submitted successfully.").waitFor();
  await studentPage.goto("/form1");
  await studentPage.getByText("You have already submitted this survey").waitFor();
  await contextStudent.close();
  console.log("PASS required validation, focus, successful Student submission, duplicate screen");

  const contextForm2 = await browser.newContext({ baseURL });
  const form2 = await contextForm2.newPage(); watch(form2);
  const form2Id = `mobile-regression-${randomUUID()}`; testedIds.push(form2Id);
  await form2.addInitScript((id) => localStorage.setItem("fairness_browser_id", id), form2Id);
  await form2.goto("/form2");
  await form2.waitForTimeout(80);
  const ratingOrderFirst = await values(form2.locator(`#slot-${TIME_SLOTS[0].id}`), "data-rating-value");
  await form2.reload();
  await form2.waitForTimeout(80);
  const ratingOrderNext = await values(form2.locator(`#slot-${TIME_SLOTS[0].id}`), "data-rating-value");
  assert.notDeepEqual(ratingOrderNext, ratingOrderFirst, "Form 2 rating options shuffle per entry");
  assert.deepEqual(new Set(ratingOrderNext), new Set(["1", "2", "3", "4", "5"]));
  await form2.locator('#question-role button[data-profile-option="Student"]').click();
  await form2.locator('#question-department button[data-profile-option="EEE"]').click();
  await form2.getByRole("button", { name: /^Submit Ratings/ }).click();
  await form2.locator('#slot-time_slot_8_00').waitFor();
  assert(await form2.locator('#question-time-slots').getAttribute("class").then((s) => s.includes("border-rose-400")));
  for (const [index, slot] of TIME_SLOTS.entries()) {
    await form2.locator(`#slot-${slot.id} button[data-rating-value="${index % 5 + 1}"]`).click();
  }
  for (const key of ["long_gap_rating", "fairness_rating"]) {
    await form2.locator(`#question-${key} button[data-rating-value="4"]`).click();
  }
  await form2.getByRole("button", { name: /^Submit Ratings/ }).click();
  await form2.getByText("Thank you! Your response has been submitted successfully.").waitFor();
  await form2.goto("/form2");
  await form2.getByText("You have already submitted this survey").waitFor();
  await contextForm2.close();
  console.log("PASS Form 2 required validation, seven ratings, success and duplicate prevention");

  const apiOne = await (await context.request.get("/api/form1/results")).json();
  assert.deepEqual(apiOne.distributions.map(({ id }) => id), FORM1_QUESTIONS.map(({ id }) => id));
  await page.goto("/results/form1");
  assert.deepEqual(await page.locator("article h3").allTextContents(), FORM1_QUESTIONS.map(({ titleBn }) => titleBn));
  const apiTwo = await (await context.request.get("/api/form2/results")).json();
  assert.deepEqual(apiTwo.slots.map(({ id }) => id), TIME_SLOTS.map(({ id }) => id));
  await page.goto("/results/form2");
  const cardTitles = await page.locator("article h3").allTextContents();
  assert.deepEqual(cardTitles.slice(0, 9), [...apiTwo.slots.map(({ label }) => label), apiTwo.longGap.label, apiTwo.fairness.label]);
  console.log("PASS both dedicated results pages retain canonical question and slot order");

  assert.deepEqual(browserErrors, [], "No browser runtime errors");
  await context.close();
  console.log("All mobile survey browser checks passed.");
} finally {
  await browser.close();
  console.log(`Temporary test browser IDs: ${testedIds.join(", ")}`);
}
