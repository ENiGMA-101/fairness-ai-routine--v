import { SURVEY_VERSION } from "@/lib/survey";

const ID_KEY = "fairness_browser_id";
export const SUBMISSION_EVENT = "fairness:submitted";
export type SurveyForm = "form1" | "form2";
export const submissionKey = (form: SurveyForm) => `${form}_submitted_v${SURVEY_VERSION}`;
export const draftKey = (form: SurveyForm, browserId: string) =>
  `fairness_draft_${form}_v${SURVEY_VERSION}_${browserId}`;

let memoryId = "";
const memorySubmitted = new Set<SurveyForm>();

function randomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

/** Retains the existing persistent anonymous browser ID and storage key. */
export function getBrowserId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(ID_KEY);
    if (!id) {
      id = memoryId || randomId();
      window.localStorage.setItem(ID_KEY, id);
    }
    memoryId = id;
    return id;
  } catch {
    memoryId ||= randomId();
    return memoryId;
  }
}

export function isSubmitted(form: SurveyForm): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(submissionKey(form)) === "true" || memorySubmitted.has(form);
  } catch {
    return memorySubmitted.has(form);
  }
}

export function clearDraft(form: SurveyForm): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(draftKey(form, getBrowserId()));
  } catch {
    // Submission is still enforced by the database if browser storage is disabled.
  }
}

/** Call only after an acknowledged database submission, or an existing-response 409. */
export function markSubmitted(form: SurveyForm): void {
  if (typeof window === "undefined") return;
  memorySubmitted.add(form);
  try {
    window.localStorage.setItem(submissionKey(form), "true");
  } catch {
    // The database unique index remains the authoritative duplicate guard.
  }
  clearDraft(form);
  window.dispatchEvent(new CustomEvent(SUBMISSION_EVENT, { detail: { form } }));
}

export function resetSubmitted(form: SurveyForm): void {
  if (typeof window === "undefined") return;
  memorySubmitted.delete(form);
  try {
    window.localStorage.removeItem(submissionKey(form));
  } catch {
    // Optional private-console helper; never changes database responses.
  }
}
