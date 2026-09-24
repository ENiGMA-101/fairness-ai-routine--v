import { SURVEY_VERSION } from "@/lib/survey";

const ID_KEY = "fairness_browser_id";
const submissionKey = (form: "form1" | "form2") => `${form}_submitted_v${SURVEY_VERSION}`;

function randomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

/** Stable per-browser anonymous id (used for one-vote-per-browser protection). */
export function getBrowserId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(ID_KEY);
  if (!id) {
    id = randomId();
    window.localStorage.setItem(ID_KEY, id);
  }
  return id;
}

export function isSubmitted(form: "form1" | "form2"): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(submissionKey(form)) === "true";
}

export function markSubmitted(form: "form1" | "form2"): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(submissionKey(form), "true");
}

export function resetSubmitted(form: "form1" | "form2"): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(submissionKey(form));
}
