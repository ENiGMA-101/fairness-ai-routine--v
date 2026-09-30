"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clearDraft, draftKey, getBrowserId, isSubmitted, SUBMISSION_EVENT, type SurveyForm } from "@/lib/browser";
import { DEPARTMENTS, FORM1_ALLOWED_VALUES, SURVEY_VERSION, TIME_SLOTS } from "@/lib/survey";

export type Form1Draft = {
  role: string;
  department: string;
  departmentOther: string;
  answers: Record<string, string>;
};
export type Form2Draft = {
  role: string;
  department: string;
  departmentOther: string;
  timeSlots: Record<string, number>;
  longGap: number | null;
  fairness: number | null;
  feedback: string;
};

export const EMPTY_FORM1_DRAFT: Form1Draft = { role: "", department: "", departmentOther: "", answers: {} };
export const EMPTY_FORM2_DRAFT: Form2Draft = {
  role: "", department: "", departmentOther: "", timeSlots: {}, longGap: null, fairness: null, feedback: "",
};

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
const text = (value: unknown) => typeof value === "string" ? value : "";
const rating = (value: unknown): number | null =>
  typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5 ? value : null;

function profile(value: Record<string, unknown>) {
  return {
    role: value.role === "Student" || value.role === "Teacher" ? value.role : "",
    department: DEPARTMENTS.includes(value.department as typeof DEPARTMENTS[number]) ? String(value.department) : "",
    departmentOther: text(value.departmentOther),
  };
}

export function restoreForm1Draft(raw: unknown): Form1Draft {
  const value = object(raw);
  const answers: Record<string, string> = {};
  for (const [id, answer] of Object.entries(object(value.answers))) {
    if (id !== "role" && id !== "department" && typeof answer === "string" && FORM1_ALLOWED_VALUES[id]?.includes(answer)) {
      answers[id] = answer;
    }
  }
  return { ...profile(value), answers };
}

export function restoreForm2Draft(raw: unknown): Form2Draft {
  const value = object(raw);
  const slots = object(value.timeSlots);
  const timeSlots: Record<string, number> = {};
  for (const slot of TIME_SLOTS) {
    const answer = rating(slots[slot.id]);
    if (answer !== null) timeSlots[slot.id] = answer;
  }
  return { ...profile(value), timeSlots, longGap: rating(value.longGap), fairness: rating(value.fairness), feedback: text(value.feedback) };
}

/**
 * Local-only, versioned, browser-scoped drafts. Each input handler synchronously
 * saves its next snapshot before returning, including the final edit before a
 * refresh. This module never fetches or sends answers to a server.
 */
export function useLocalSurveyDraft<T extends object>(
  form: SurveyForm,
  empty: T,
  restore: (value: unknown) => T,
) {
  const [draft, setDraft] = useState<T>(empty);
  const [ready, setReady] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [restored, setRestored] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const current = useRef<T>(empty);
  const browserId = useRef("");
  const hydrated = useRef(false);

  useEffect(() => {
    browserId.current = getBrowserId();
    const key = draftKey(form, browserId.current);
    const load = (initial = false) => {
      if (isSubmitted(form)) {
        clearDraft(form);
        setHasDraft(false);
        return;
      }
      try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return;
        const saved = object(JSON.parse(raw));
        if (saved.browserId !== browserId.current || saved.surveyVersion !== SURVEY_VERSION) return;
        const next = restore(saved.data);
        current.current = next;
        setDraft(next);
        setHasDraft(true);
        if (initial) setRestored(true);
      } catch {
        // Malformed drafts are ignored without preventing a fresh response.
      }
    };
    try {
      const probe = `${key}:storage-check`;
      window.localStorage.setItem(probe, "1");
      window.localStorage.removeItem(probe);
    } catch {
      setStorageAvailable(false);
    }
    load(true);
    hydrated.current = true;
    setReady(true);

    const onStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === `${form}_submitted_v${SURVEY_VERSION}` || event.key === null) load();
    };
    const onSubmitted = () => {
      if (isSubmitted(form)) {
        clearDraft(form);
        setHasDraft(false);
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(SUBMISSION_EVENT, onSubmitted);
    return () => {
      hydrated.current = false;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SUBMISSION_EVENT, onSubmitted);
    };
  }, [form, empty, restore]);

  const update = useCallback(<K extends keyof T>(field: K, value: T[K] | ((previous: T[K]) => T[K])) => {
    if (!hydrated.current || isSubmitted(form)) return;
    const resolved = typeof value === "function" ? (value as (previous: T[K]) => T[K])(current.current[field]) : value;
    const next = { ...current.current, [field]: resolved };
    current.current = next;
    setDraft(next);
    try {
      window.localStorage.setItem(draftKey(form, browserId.current), JSON.stringify({
        browserId: browserId.current,
        surveyVersion: SURVEY_VERSION,
        updatedAt: new Date().toISOString(),
        data: next,
      }));
      setHasDraft(true);
      setStorageAvailable(true);
    } catch {
      setStorageAvailable(false);
    }
  }, [form]);

  return { draft, update, ready, hasDraft, restored, storageAvailable };
}
