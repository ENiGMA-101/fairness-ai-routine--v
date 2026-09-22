const ID_KEY = "fairness_browser_id";

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
  return window.localStorage.getItem(`${form}_submitted`) === "true";
}

export function markSubmitted(form: "form1" | "form2"): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${form}_submitted`, "true");
}

export function resetSubmitted(form: "form1" | "form2"): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(`${form}_submitted`);
}
