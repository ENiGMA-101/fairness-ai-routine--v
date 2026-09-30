import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { chromium, type Page } from "playwright";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db, pool } from "@/db";
import { form1Responses, form2Responses, surveyPresence } from "@/db/schema";
import { FORM1_QUESTIONS, FORM1_REQUIRED_BY_ROLE, FORM2_COPY, STUDENT_QUESTION_IDS, TEACHER_QUESTION_IDS, SURVEY_VERSION, TIME_SLOTS } from "@/lib/survey";
import type { ParticipationSnapshot } from "@/lib/participation";
import type { Form1Draft } from "@/lib/local-draft";
import { loadStore, saveStore } from "@/lib/storage";

const baseURL = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
if (!["localhost", "127.0.0.1"].includes(new URL(baseURL).hostname)) {
  throw new Error("Acceptance tests may only write temporary responses to a local preview.");
}

async function json<T>(path: string): Promise<T> {
  const response = await fetch(`${baseURL}${path}`, { cache: "no-store" });
  assert(response.ok, `${path}: HTTP ${response.status}`);
  return await response.json() as T;
}
async function eventually(check: () => Promise<boolean>, message: string, timeout = 16_000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (await check()) return;
    await delay(350);
  }
  assert.fail(message);
}
async function waitNumber(page: Page, id: string, expected: number) {
  await eventually(async () => Number((await page.getByTestId(id).innerText()).replaceAll(",", "")) === expected,
    `${id} automatically updates to ${expected}`);
}
async function draftData<T>(page: Page, form: string, id: string): Promise<T> {
  return page.evaluate(({ form, id, version }) => {
    const raw = localStorage.getItem(`fairness_draft_${form}_v${version}_${id}`);
    if (!raw) throw new Error("Expected a saved draft");
    return JSON.parse(raw).data;
  }, { form, id, version: SURVEY_VERSION });
}

async function main() {
  const prefix = `acceptance-${randomUUID()}`;
  const ids = [`${prefix}-home`, `${prefix}-student`, `${prefix}-timeout`, `${prefix}-race`];
  const browser = await chromium.launch({ headless: true });
  const runtimeErrors: string[] = [];
  const monitor = (page: Page) => page.on("pageerror", error => runtimeErrors.push(error.message));
  const makeContext = async (id: string) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1060 }, reducedMotion: "reduce" });
    await context.addInitScript(({ id }) => {
      if (!localStorage.getItem("fairness_browser_id")) localStorage.setItem("fairness_browser_id", id);
      localStorage.setItem("fairness-theme", "dark");
    }, { id });
    return context;
  };

  try {
    const baseline = await json<ParticipationSnapshot>("/api/participation");
    const initialPoll1 = await json<Record<string, { total: number; counts: Record<string, number> }>>("/api/form1/stats/all");
    const initialPoll2 = await json<Record<string, { total: number; counts: Record<string, number> }>>("/api/form2/stats/all");
    const dashboardContext = await makeContext(ids[0]);
    const home = await dashboardContext.newPage();
    monitor(home);
    await home.goto(baseURL);
    await home.locator(".participation-live-badge").getByText("Live now", { exact: true }).waitFor();
    await eventually(async () => Number(await home.getByTestId("live-count").getAttribute("data-actual-count")) >= 1,
      "visible homepage participates in presence");
    const liveBefore = Number(await home.getByTestId("live-count").getAttribute("data-actual-count"));
    assert.equal(await home.getByTestId("submitted-count").innerText(), String(baseline.submitted.total));
    assert(await home.getByRole("heading", { name: /Grab your seat belt, participate with others/ }).isVisible());
    await mkdir("artifacts", { recursive: true });
    await home.screenshot({ path: "artifacts/home-desktop.png", fullPage: true });
    await home.setViewportSize({ width: 390, height: 844 });
    assert(await home.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "mobile homepage does not overflow");
    await home.screenshot({ path: "artifacts/home-mobile.png", fullPage: true });
    await home.setViewportSize({ width: 1440, height: 1060 });

    // A second browser joins while the homepage stays open. No page refresh.
    const studentContext = await makeContext(ids[1]);
    let student = await studentContext.newPage();
    monitor(student);
    let form1Requests = 0;
    let form2Requests = 0;
    studentContext.on("request", request => {
      if (request.url().endsWith("/api/form1/submit") && request.method() === "POST") form1Requests += 1;
      if (request.url().endsWith("/api/form2/submit") && request.method() === "POST") form2Requests += 1;
      if (request.url().endsWith("/api/participation") && request.method() === "POST") {
        const data = request.postDataJSON();
        assert(Object.keys(data).every(key => ["browserId", "sessionId", "scope", "action"].includes(key)), "presence never contains unfinished answers");
      }
    });
    await student.goto(`${baseURL}/form1`);
    await eventually(async () => Number(await home.getByTestId("live-count").getAttribute("data-actual-count")) >= liveBefore + 1,
      "another browser joins live without refreshing the homepage");
    console.log("PASS automatic cross-browser live presence");

    await student.getByRole("button", { name: "Student", exact: true }).click();
    await student.getByRole("button", { name: "CSE", exact: true }).click();
    await student.locator("#question-semester").getByRole("button").first().click();
    await student.locator("#question-q_avoid").getByRole("button").first().click();
    await student.locator("#question-q_weekly_off").getByRole("button").last().click();
    assert.equal(form1Requests, 0, "answer selection never invokes submit");
    await student.reload();
    await student.getByText("Welcome back. Your draft is restored.", { exact: true }).waitFor();
    assert.equal(await student.getByRole("button", { name: "Student", exact: true }).getAttribute("aria-pressed"), "true");
    assert.equal(await student.getByRole("button", { name: "CSE", exact: true }).getAttribute("aria-pressed"), "true");
    assert.equal(await student.locator("#question-q_avoid").getByRole("button").first().getAttribute("aria-pressed"), "true");
    await student.locator("#question-q_avoid").getByRole("button").last().click();
    // Intentionally refresh immediately, without waiting for an autosave effect.
    await student.reload();
    await student.getByText("Welcome back. Your draft is restored.", { exact: true }).waitFor();
    assert.equal(await student.locator("#question-q_avoid").getByRole("button").last().getAttribute("aria-pressed"), "true");
    await student.close();
    student = await studentContext.newPage();
    monitor(student);
    await student.goto(`${baseURL}/form1`);
    await student.getByText("Welcome back. Your draft is restored.", { exact: true }).waitFor();
    assert.equal((await draftData<Form1Draft>(student, "form1", ids[1])).answers.q_avoid, "evening");
    const sourceOrder = await student.locator(".survey-card[id]").evaluateAll(cards => cards.map(card => card.id.replace("question-", "")));
    assert.deepEqual(sourceOrder, STUDENT_QUESTION_IDS, "student questions retain finalized source order");
    assert.equal((await db.select().from(form1Responses).where(eq(form1Responses.browserId, ids[1]))).length, 0);
    assert.deepEqual((await json<ParticipationSnapshot>("/api/participation")).submitted, baseline.submitted);
    assert.deepEqual(await json("/api/form1/stats/all"), initialPoll1, "unfinished drafts do not change poll percentages");
    console.log("PASS Form 1 save, immediate refresh, edit, close/reopen; no database writes or poll/count changes");

    await student.getByRole("button", { name: "Teacher", exact: true }).click();
    assert.deepEqual(await student.locator(".survey-card[id]").evaluateAll(cards => cards.map(card => card.id.replace("question-", ""))), TEACHER_QUESTION_IDS);
    await student.getByRole("button", { name: "Student", exact: true }).click();
    for (const id of STUDENT_QUESTION_IDS) {
      const question = student.locator(`#question-${id}`);
      if (await question.getByRole("button", { pressed: true }).count() === 0) await question.getByRole("button").first().click();
    }
    const finalDraft = await draftData<Form1Draft>(student, "form1", ids[1]);
    const form1Payload = { browser_id: ids[1], role: finalDraft.role, department: finalDraft.department, answers: finalDraft.answers };
    await student.route("**/api/form1/submit", route => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Test outage" }) }));
    await student.getByRole("button", { name: /Submit Response/ }).click();
    await student.getByText(/Your response was not saved/).waitFor();
    assert(await student.evaluate(({ id, version }) => localStorage.getItem(`fairness_draft_form1_v${version}_${id}`) !== null && localStorage.getItem(`form1_submitted_v${version}`) !== "true", { id: ids[1], version: SURVEY_VERSION }));
    assert.equal((await db.select().from(form1Responses).where(eq(form1Responses.browserId, ids[1]))).length, 0);
    await student.unroute("**/api/form1/submit");
    await student.getByRole("button", { name: /Submit Response/ }).click();
    await student.getByRole("heading", { name: "Response Submitted!", exact: true }).waitFor();
    assert.equal((await db.select().from(form1Responses).where(eq(form1Responses.browserId, ids[1]))).length, 1);
    assert(await student.evaluate(({ id, version }) => localStorage.getItem(`fairness_draft_form1_v${version}_${id}`) === null && localStorage.getItem(`form1_submitted_v${version}`) === "true", { id: ids[1], version: SURVEY_VERSION }));
    await waitNumber(home, "submitted-form1", baseline.submitted.form1 + 1);
    await waitNumber(home, "submitted-count", baseline.submitted.total + 1);
    const submittedPoll1 = await json<typeof initialPoll1>("/api/form1/stats/all");
    assert.equal(submittedPoll1.q_avoid.total, initialPoll1.q_avoid.total + 1);
    assert.equal(submittedPoll1.q_avoid.counts.evening, initialPoll1.q_avoid.counts.evening + 1);
    const duplicate = await student.request.post(`${baseURL}/api/form1/submit`, { data: form1Payload });
    assert.equal(duplicate.status(), 409);
    assert.equal((await db.select().from(form1Responses).where(eq(form1Responses.browserId, ids[1]))).length, 1);
    await student.reload();
    await student.getByRole("heading", { name: "You have already submitted this survey", exact: true }).waitFor();
    console.log("PASS failed submit preserves draft; successful submit inserts once, clears draft, updates polls/counts, blocks duplicates");

    // Form 2 has an independent draft and an independent submitted marker.
    await student.goto(`${baseURL}/form2`);
    await student.getByRole("button", { name: "Student", exact: true }).click();
    await student.getByRole("button", { name: "Other", exact: true }).click();
    await student.getByPlaceholder("Other", { exact: true }).fill("Locally saved department");
    for (const [index, slot] of TIME_SLOTS.slice(0, 3).entries()) {
      await student.locator(`[data-time-slot="${slot.id}"]`).getByRole("button").nth(index + 1).click();
    }
    const longGap = student.locator(".survey-card").filter({ has: student.getByRole("heading", { name: `${FORM2_COPY.longGapTitle} *`, exact: true }) });
    const fairness = student.locator(".survey-card").filter({ has: student.getByRole("heading", { name: `${FORM2_COPY.fairnessTitle} *`, exact: true }) });
    await longGap.getByRole("button").nth(3).click();
    await fairness.getByRole("button").nth(4).click();
    await student.getByRole("textbox", { name: "" }).last().fill("Editable local feedback for acceptance testing.");
    await student.reload();
    await student.getByText("Welcome back. Your draft is restored.", { exact: true }).waitFor();
    assert.equal(await student.getByPlaceholder("Other", { exact: true }).inputValue(), "Locally saved department");
    assert.equal(await student.locator("textarea").inputValue(), "Editable local feedback for acceptance testing.");
    assert.equal(await longGap.getByRole("button").nth(3).getAttribute("aria-pressed"), "true");
    assert.equal(await fairness.getByRole("button").nth(4).getAttribute("aria-pressed"), "true");
    await student.locator(`[data-time-slot="${TIME_SLOTS[0].id}"]`).getByRole("button").last().click();
    await student.reload();
    await student.getByText("Welcome back. Your draft is restored.", { exact: true }).waitFor();
    assert.equal(await student.locator(`[data-time-slot="${TIME_SLOTS[0].id}"]`).getByRole("button").last().getAttribute("aria-pressed"), "true");
    assert.equal(form2Requests, 0);
    assert.equal((await db.select().from(form2Responses).where(eq(form2Responses.browserId, ids[1]))).length, 0);
    assert.deepEqual(await json("/api/form2/stats/all"), initialPoll2);
    assert.equal((await json<ParticipationSnapshot>("/api/participation")).submitted.form2, baseline.submitted.form2);
    await student.getByRole("button", { name: "CSE", exact: true }).click();
    for (const slot of TIME_SLOTS) {
      const row = student.locator(`[data-time-slot="${slot.id}"]`);
      if (await row.getByRole("button", { pressed: true }).count() === 0) await row.getByRole("button").last().click();
    }
    await student.getByRole("button", { name: /Submit Ratings/ }).click();
    await student.getByRole("heading", { name: "Ratings Submitted!", exact: true }).waitFor();
    assert.equal((await db.select().from(form2Responses).where(eq(form2Responses.browserId, ids[1]))).length, 1);
    assert(await student.evaluate(({ id, version }) => localStorage.getItem(`fairness_draft_form2_v${version}_${id}`) === null && localStorage.getItem(`form2_submitted_v${version}`) === "true", { id: ids[1], version: SURVEY_VERSION }));
    await waitNumber(home, "submitted-form2", baseline.submitted.form2 + 1);
    // Same browser completed both: one overall participant, one response per form.
    await waitNumber(home, "submitted-count", baseline.submitted.total + 1);
    const submittedPoll2 = await json<typeof initialPoll2>("/api/form2/stats/all");
    assert.equal(submittedPoll2[TIME_SLOTS[0].id].counts["5"], initialPoll2[TIME_SLOTS[0].id].counts["5"] + 1);
    assert((await json<ParticipationSnapshot>("/api/participation")).live.form2 >= 1, "submitted browsers count live only while present");
    await student.reload();
    await student.getByRole("heading", { name: "You have already submitted this survey", exact: true }).waitFor();
    console.log("PASS Form 2 restores every field, remains editable, submits separately and deduplicates overall contributors");

    await student.close();
    await eventually(async () => (await db.select().from(surveyPresence).where(and(
      eq(surveyPresence.browserId, ids[1]), sql`${surveyPresence.lastSeen} > now() - interval '45 seconds'`,
    ))).length === 0, "closed browser presence leaves automatically", 52_000);
    const currentLive = (await json<ParticipationSnapshot>("/api/participation")).live.total;
    const timeoutSession = randomUUID();
    await home.request.post(`${baseURL}/api/participation`, { data: { browserId: ids[2], sessionId: timeoutSession, scope: "form1" } });
    await eventually(async () => Number(await home.getByTestId("live-count").getAttribute("data-actual-count")) === currentLive + 1, "heartbeat join reaches card automatically");
    await db.update(surveyPresence).set({ lastSeen: new Date(Date.now() - 46_000) }).where(eq(surveyPresence.sessionId, timeoutSession));
    await eventually(async () => Number(await home.getByTestId("live-count").getAttribute("data-actual-count")) === currentLive, "stale heartbeat disappears automatically");
    await home.getByRole("button", { name: "Form 01", exact: true }).click();
    const actual = Number(await home.getByTestId("live-count").getAttribute("data-actual-count"));
    assert.equal(await home.getByTestId("live-count").innerText(), String(Math.max(1, actual)));
    await home.getByRole("button", { name: "All surveys", exact: true }).click();
    const tabA = randomUUID(), tabB = randomUUID();
    const beforeTabs = (await json<ParticipationSnapshot>("/api/participation")).live.total;
    for (const sessionId of [tabA, tabB]) await home.request.post(`${baseURL}/api/participation`, { data: { browserId: ids[0], sessionId, scope: "home" } });
    assert.equal((await json<ParticipationSnapshot>("/api/participation")).live.total, beforeTabs, "multiple sessions of one browser count once");
    await home.request.post(`${baseURL}/api/participation`, { data: { browserId: ids[0], sessionId: tabA, action: "leave" } });
    assert.equal((await db.select().from(surveyPresence).where(and(eq(surveyPresence.sessionId, tabB), eq(surveyPresence.browserId, ids[0])))).length, 1, "one tab leaving never deletes another tab");
    console.log("PASS closed/inactive presence removal, minimum live display of 1, and multi-tab deduplication");

    const racePayload = {
      browser_id: ids[3], role: "Teacher", department: "CSE",
      answers: Object.fromEntries(FORM1_REQUIRED_BY_ROLE.Teacher.map(id => [id, FORM1_QUESTIONS.find(q => q.id === id)!.options[0].value])),
    };
    const race = await Promise.all([1, 2].map(() => home.request.post(`${baseURL}/api/form1/submit`, { data: racePayload })));
    assert.deepEqual(race.map(result => result.status()).sort(), [200, 409]);
    assert.equal((await db.select().from(form1Responses).where(eq(form1Responses.browserId, ids[3]))).length, 1);
    const response1 = await home.request.get(`${baseURL}/results/form1`);
    const response2 = await home.request.get(`${baseURL}/results/form2`);
    assert(response1.ok() && response2.ok(), "existing Live Dashboards continue working");
    await home.getByRole("button", { name: "Toggle dark mode" }).click();
    assert(!await home.locator("html").evaluate(html => html.classList.contains("dark")), "existing theme switch still works");
    assert(await home.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "light mode has no overflow");
    assert.deepEqual(runtimeErrors, [], "no browser runtime errors");
    console.log("PASS concurrent database duplicate protection, existing dashboards, and theme toggle");
    console.log("All Live Participation acceptance checks passed.");
  } finally {
    await browser.close();
    await db.delete(form1Responses).where(inArray(form1Responses.browserId, ids));
    await db.delete(form2Responses).where(inArray(form2Responses.browserId, ids));
    await db.delete(surveyPresence).where(inArray(surveyPresence.browserId, ids));
    const backup = loadStore();
    saveStore({
      form1: backup.form1.filter(row => !ids.includes(row.browserId)),
      form2: backup.form2.filter(row => !ids.includes(row.browserId)),
    });
    await pool.end();
    console.log("Temporary acceptance-test database records removed.");
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
