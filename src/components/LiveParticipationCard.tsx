"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Check, CheckCircle2, Radio, RefreshCw, ShieldCheck, UsersRound } from "lucide-react";
import { useParticipation } from "@/components/ParticipationProvider";

type Filter = "total" | "form1" | "form2";
const FILTERS: { value: Filter; label: string }[] = [
  { value: "total", label: "All surveys" },
  { value: "form1", label: "Form 01" },
  { value: "form2", label: "Form 02" },
];

export default function LiveParticipationCard() {
  const { snapshot, status } = useParticipation();
  const [filter, setFilter] = useState<Filter>("total");
  const actualLive = snapshot?.live[filter] ?? 0;
  const displayedLive = Math.max(1, actualLive);
  const submitted = snapshot?.submitted[filter];
  const number = (value: number | undefined) => value === undefined ? "—" : value.toLocaleString();

  return (
    <section className="participation-card" aria-labelledby="participation-heading">
      <div className="participation-card-head">
        <div>
          <span className="participation-eyebrow"><Radio size={13} /> Better, together</span>
          <h2 id="participation-heading">Grab your seat belt, participate with others <span className="participation-rocket" aria-label="rocket">🚀</span></h2>
          <p>Your response helps shape a fairer university routine.</p>
        </div>
        <span className={`participation-live-badge ${status === "reconnecting" ? "is-reconnecting" : ""}`} role="status">
          <span className="participation-live-dot" />
          {status === "reconnecting" ? "Reconnecting" : status === "connecting" ? "Connecting" : "Live now"}
        </span>
      </div>

      <div className="participation-toolbar">
        <div className="participation-filters" role="group" aria-label="Filter participation by survey">
          {FILTERS.map(({ value, label }) => (
            <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={filter === value ? "is-selected" : ""}>
              {label}
            </button>
          ))}
        </div>
        <span className="participation-auto"><RefreshCw size={11} /> Updates automatically</span>
      </div>

      <div className="participation-metrics">
        <article className="participation-metric participation-metric-live">
          <span className="participation-metric-icon"><UsersRound size={22} strokeWidth={1.7} /></span>
          <div className="participation-metric-content">
            <h3>Live participants</h3>
            <div className="participation-number" aria-live="polite" aria-atomic="true">
              <strong data-testid="live-count" data-actual-count={actualLive}>{displayedLive.toLocaleString()}</strong>
              <span>{displayedLive === 1 ? "participant" : "participants"}</span>
            </div>
            <p><span className="participation-small-dot" /> {filter === "total" ? "Here, shaping what comes next" : `Viewing or filling ${filter === "form1" ? "Form 01" : "Form 02"}`}</p>
          </div>
          <span className="participation-signal" aria-hidden="true"><i /><i /><i /><i /><i /></span>
        </article>

        <article className="participation-metric participation-metric-submitted">
          <span className="participation-metric-icon"><CheckCircle2 size={22} strokeWidth={1.7} /></span>
          <div className="participation-metric-content">
            <h3>Already participated</h3>
            <div className="participation-number" aria-live="polite" aria-atomic="true" title={filter === "total" ? "Unique browsers that submitted either survey. A browser that submitted both is counted once." : "Unique successfully submitted browser responses to this form."}>
              <strong data-testid="submitted-count">{number(submitted)}</strong>
              <span>{filter === "total" ? "unique contributors" : "submitted responses"}</span>
            </div>
            <div className="participation-form-counts">
              <span><Check size={11} /> Form 01 <b data-testid="submitted-form1">{number(snapshot?.submitted.form1)}</b></span>
              <span><Check size={11} /> Form 02 <b data-testid="submitted-form2">{number(snapshot?.submitted.form2)}</b></span>
            </div>
          </div>
        </article>
      </div>

      <div className="participation-card-footer">
        <span><ShieldCheck size={14} /> Drafts stay on your device. Only submitted answers count.</span>
        <Link href={filter === "form2" ? "/results/form2" : "/results/form1"}>Live Dashboard <ArrowUpRight size={14} /></Link>
      </div>
    </section>
  );
}
