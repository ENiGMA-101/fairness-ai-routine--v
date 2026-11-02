"use client";

import { useId } from "react";
import { CheckCircle2, Lightbulb, PlusCircle, X } from "lucide-react";
import {
  FORM2_SUGGESTION_COPY as COPY,
  FORM2_SUGGESTION_LIMITS,
  type Form2SuggestionChoice,
} from "@/lib/survey";

export type SuggestionFields = {
  suggestedQuestion: string;
  suggestedOptionA: string;
  suggestedOptionB: string;
};

type Props = {
  choice: Form2SuggestionChoice | "";
  fields: SuggestionFields;
  onChoice: (value: Form2SuggestionChoice | "") => void;
  onField: (field: keyof SuggestionFields, value: string) => void;
};

const inputClass =
  "mt-1.5 w-full rounded-2xl border-2 border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20";

/**
 * Optional Form 2 question placed before "4. Additional Feedback & Constraints".
 * Choosing "Yes" reveals a tiny question builder (question + Option A + Option B).
 * The builder stays mounted while collapsed, so text typed before switching to "No"
 * is kept and reappears if the respondent switches back to "Yes".
 */
export default function SuggestionQuestion({ choice, fields, onChoice, onField }: Props) {
  const uid = useId();
  const open = choice === "yes";
  const options: { value: Form2SuggestionChoice; label: string; bn: string; Icon: typeof Lightbulb }[] = [
    { value: "yes", label: COPY.yes, bn: COPY.yesBn, Icon: Lightbulb },
    { value: "no", label: COPY.no, bn: COPY.noBn, Icon: CheckCircle2 },
  ];

  return (
    <section
      id="question-suggestion"
      aria-labelledby={`${uid}-title`}
      className="mb-6 rounded-[28px] border border-zinc-200/80 bg-white p-6 shadow-sm md:p-7"
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 id={`${uid}-title`} className="text-[17px] font-bold leading-snug text-zinc-900">
            {COPY.title}
          </h3>
          <p lang="bn" className="mt-1 text-sm leading-relaxed text-zinc-600">{COPY.titleBn}</p>
        </div>
      </div>
      <p className="mt-2 text-xs font-semibold text-zinc-500">
        {COPY.optionalHint} <span lang="bn">{COPY.optionalHintBn}</span>
      </p>

      <div role="radiogroup" aria-labelledby={`${uid}-title`} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map(({ value, label, bn, Icon }) => {
          const selected = choice === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChoice(value)}
              className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${selected
                ? "border-violet-600 bg-violet-50/70 text-violet-950 shadow-md ring-2 ring-violet-500/20"
                : "border-zinc-200 bg-white font-medium text-zinc-700 hover:border-violet-300 hover:bg-zinc-50"}`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${selected ? "bg-violet-600 text-white" : "bg-zinc-100 text-zinc-500"}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-sm ${selected ? "font-bold" : "font-semibold"}`}>{label}</span>
                <span lang="bn" className="mt-0.5 block text-xs text-zinc-500">{bn}</span>
              </span>
              <span
                aria-hidden="true"
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${selected ? "border-violet-600 bg-violet-600" : "border-zinc-300"}`}
              >
                {selected ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
              </span>
            </button>
          );
        })}
      </div>

      {choice ? (
        <button
          type="button"
          onClick={() => onChoice("")}
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 underline-offset-2 hover:text-violet-700 hover:underline"
        >
          <X className="h-3 w-3" aria-hidden="true" /> {COPY.clear} · <span lang="bn">{COPY.clearBn}</span>
        </button>
      ) : null}

      {/* Smooth reveal. Collapsed content is inert, so it cannot be focused or announced. */}
      <div className="suggestion-reveal" data-open={open} aria-hidden={!open} inert={!open}>
        <div>
          <div
            id={`${uid}-builder`}
            className="mt-5 space-y-4 rounded-2xl border border-violet-100 bg-violet-50/50 p-4 md:p-5"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-violet-700">
              {COPY.builderTitle} · <span lang="bn" className="normal-case tracking-normal">{COPY.builderTitleBn}</span>
            </p>

            <div>
              <label htmlFor={`${uid}-q`} className="text-sm font-bold text-zinc-800">
                {COPY.questionLabel} <span lang="bn" className="text-xs font-medium text-zinc-500">· {COPY.questionLabelBn}</span>
              </label>
              <textarea
                id={`${uid}-q`}
                rows={2}
                maxLength={FORM2_SUGGESTION_LIMITS.question}
                value={fields.suggestedQuestion}
                onChange={(event) => onField("suggestedQuestion", event.target.value)}
                placeholder={COPY.questionPlaceholder}
                className={`${inputClass} resize-y`}
              />
            </div>

            <div>
              <label htmlFor={`${uid}-a`} className="text-sm font-bold text-zinc-800">
                {COPY.optionALabel} <span lang="bn" className="text-xs font-medium text-zinc-500">· {COPY.optionALabelBn}</span>
              </label>
              <input
                id={`${uid}-a`}
                type="text"
                maxLength={FORM2_SUGGESTION_LIMITS.option}
                value={fields.suggestedOptionA}
                onChange={(event) => onField("suggestedOptionA", event.target.value)}
                placeholder={COPY.optionAPlaceholder}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor={`${uid}-b`} className="text-sm font-bold text-zinc-800">
                {COPY.optionBLabel} <span lang="bn" className="text-xs font-medium text-zinc-500">· {COPY.optionBLabelBn}</span>
              </label>
              <input
                id={`${uid}-b`}
                type="text"
                maxLength={FORM2_SUGGESTION_LIMITS.option}
                value={fields.suggestedOptionB}
                onChange={(event) => onField("suggestedOptionB", event.target.value)}
                placeholder={COPY.optionBPlaceholder}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
