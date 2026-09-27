"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

/** Scroll to and focus an unanswered section when validation fails. */
export function focusSurveyQuestion(id: string) {
  const element = document.getElementById(id.startsWith("slot-") ? id : `question-${id}`);
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => element.focus({ preventScroll: true }), 250);
}

type Props = {
  ids: readonly string[];
  answered: number;
  total: number;
  validationMessage?: string;
};

export default function SurveyNavigator({ ids, answered, total, validationMessage }: Props) {
  const [activeId, setActiveId] = useState(ids[0] ?? "role");
  const idsKey = ids.join("|");

  useEffect(() => {
    let frame = 0;
    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const stickyOffset = window.innerWidth < 640 ? 160 : 120;
        let current = ids[0];
        for (const id of ids) {
          const item = document.getElementById(`question-${id}`);
          if (item && item.getBoundingClientRect().top <= stickyOffset) current = id;
        }
        if (current) setActiveId((old) => old === current ? old : current);
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- idsKey represents the current display order
  }, [idsKey]);

  const index = Math.max(0, ids.indexOf(activeId));
  const navigate = (next: number) => {
    const id = ids[next];
    if (!id) return;
    setActiveId(id);
    focusSurveyQuestion(id);
  };

  return (
    <nav className="survey-navigation fixed inset-x-0 bottom-0 z-40 border-t border-violet-200/70 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_28px_-18px_rgba(38,23,99,.38)] backdrop-blur-xl dark:border-violet-500/30 dark:bg-[#13213a]/95" aria-label="Survey question navigation">
      {validationMessage && (
        <div role="alert" className="mx-auto max-w-3xl px-3 pt-2 sm:px-5">
          <p className="rounded-lg bg-rose-50 px-3 py-1.5 text-[12px] font-semibold leading-snug text-rose-800 dark:bg-rose-500/15 dark:text-rose-200">{validationMessage}</p>
        </div>
      )}
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-3 py-2.5 sm:px-5">
        <button type="button" onClick={() => navigate(index - 1)} disabled={index <= 0} aria-label="Previous question" className="inline-flex min-h-11 min-w-[78px] touch-manipulation items-center justify-center gap-1 rounded-xl border border-violet-300 bg-violet-50 px-3 text-[13px] font-bold text-violet-800 disabled:cursor-not-allowed disabled:opacity-40 dark:border-violet-400/30 dark:bg-violet-500/15 dark:text-violet-100 sm:min-w-28 sm:text-sm">
          <ArrowLeft className="h-4 w-4" /> <span>Previous</span>
        </button>
        <div className="min-w-0 text-center">
          <div className="whitespace-nowrap text-[12px] font-black text-slate-900 dark:text-slate-100 sm:text-sm">Question {index + 1} of {ids.length}</div>
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{answered} / {total} answered</div>
        </div>
        <button type="button" onClick={() => navigate(index + 1)} disabled={index >= ids.length - 1} aria-label="Next question" className="inline-flex min-h-11 min-w-[78px] touch-manipulation items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3 text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-28 sm:text-sm">
          <span>Next</span> <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
