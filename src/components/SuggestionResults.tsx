import { Lightbulb } from "lucide-react";
import type { Form2SuggestionItem, Form2SuggestionSummary } from "@/lib/results";

/** Read-only list of the optional "missing question" suggestions (Form 2). */
export default function SuggestionResults({
  summary,
  items,
}: {
  summary: Form2SuggestionSummary;
  items: Form2SuggestionItem[];
}) {
  const stats = [
    { label: "Yes, I have a suggestion", value: summary.yes },
    { label: "No, questions are sufficient", value: summary.no },
    ...(summary.skipped > 0 ? [{ label: "Earlier responses (pre-Q4)", value: summary.skipped }] : []),
  ];

  return (
    <section
      aria-labelledby="suggestions-heading"
      className="mt-4 rounded-[20px] border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          <Lightbulb className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h2 id="suggestions-heading" className="text-[15px] font-semibold">4. Missing Question Check &amp; Suggested Questions</h2>
          <p className="text-xs text-zinc-500">
            “Do you think we are missing any major question that would be helpful for our Fairness-Aware AI Routine Generator?”
          </p>
        </div>
      </div>

      <dl className={`mt-4 grid gap-2 text-center ${stats.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-zinc-200 bg-zinc-50 px-2 py-3">
            <dd className="text-xl font-black tabular-nums text-zinc-900">{stat.value}</dd>
            <dt className="mt-0.5 text-[11px] font-semibold leading-tight text-zinc-500">{stat.label}</dt>
          </div>
        ))}
      </dl>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">No written suggestions have been submitted yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item, index) => (
            <li
              key={item.id ?? index}
              className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4"
            >
              <p className="text-sm font-bold text-zinc-900">
                {item.question ?? <span className="font-medium text-zinc-500">(No question text)</span>}
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <p className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700">
                  <span className="mr-1.5 text-[11px] font-black uppercase tracking-wide text-violet-700">A</span>
                  {item.optionA ?? <span className="text-zinc-400">—</span>}
                </p>
                <p className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700">
                  <span className="mr-1.5 text-[11px] font-black uppercase tracking-wide text-violet-700">B</span>
                  {item.optionB ?? <span className="text-zinc-400">—</span>}
                </p>
              </div>
              <p className="mt-2 text-[11px] text-zinc-500">
                {item.role} · {item.department} · {new Date(item.createdAt).toISOString().slice(0, 10)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
