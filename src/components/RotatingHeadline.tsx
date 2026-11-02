"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * Two-part hero headline with alternating "fixed" and "changing" phrases.
 *
 *   Mode A – first phrase fixed ("Better schedules."), second phrase changes.
 *   Mode B – second phrase fixed ("Better learning experiences."), first phrase changes.
 *
 * The loop below is built so that every step changes exactly ONE phrase; the two
 * phrases never change at the same time:
 *
 *   0 Better schedules.             | Better learning experiences.   (start of Mode A)
 *   1 Better schedules.             | Fairer university routines.
 *   2 Better schedules.             | Smarter scheduling decisions.
 *   3 Better schedules.             | More balanced academic life.
 *   4 Better schedules.             | Better learning experiences.   (start of Mode B, 2nd phrase changes)
 *   5 Fairer university routines.   | Better learning experiences.
 *   6 Smarter scheduling decisions. | Better learning experiences.
 *   7 More balanced academic life.  | Better learning experiences.
 *   → back to 0 (1st phrase changes back to "Better schedules.")
 */
const FIRST = [
  "Better schedules.",
  "Fairer university routines.",
  "Smarter scheduling decisions.",
  "More balanced academic life.",
] as const;
const SECOND = [
  "Better learning experiences.",
  "Fairer university routines.",
  "Smarter scheduling decisions.",
  "More balanced academic life.",
] as const;

/** [index into FIRST, index into SECOND] */
const FRAMES: readonly (readonly [number, number])[] = [
  [0, 0], [0, 1], [0, 2], [0, 3], // Mode A: "Better schedules." stays fixed
  [0, 0], [1, 0], [2, 0], [3, 0], // Mode B: "Better learning experiences." stays fixed
];

/** How long each combination stays on screen (the 600ms CSS transition is part of this). */
const HOLD_MS = 3600;

type Slot = "first" | "second";

/** The slot that changed to produce `frame` – it receives the purple accent. */
function changedSlot(frame: number, previous: number): Slot {
  const [pf] = FRAMES[previous];
  const [f] = FRAMES[frame];
  return pf !== f ? "first" : "second";
}

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const getReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getServerReducedMotion = () => false;

function PhraseSlot({
  phrases,
  active,
  exiting,
  accent,
}: {
  phrases: readonly string[];
  active: number;
  exiting: number | null;
  accent: boolean;
}) {
  // All phrases share one grid cell: the slot is always as tall as its tallest phrase,
  // so changing text can never move the content below it.
  return (
    <span className="headline-slot" data-accent={accent}>
      {phrases.map((phrase, index) => {
        const state = index === active ? "active" : index === exiting ? "exit" : "idle";
        return (
          <span key={phrase} className="headline-phrase" data-state={state} aria-hidden={state !== "active"}>
            {phrase}
          </span>
        );
      })}
    </span>
  );
}

export default function RotatingHeadline() {
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getServerReducedMotion);
  const [{ frame, previous }, setStep] = useState({ frame: 0, previous: 0 });

  useEffect(() => {
    // Respect prefers-reduced-motion: keep the first, complete headline static.
    if (reducedMotion) return;
    // One timer per step; cleanup on every step change and on unmount.
    const timer = window.setTimeout(() => {
      setStep((current) => ({ frame: (current.frame + 1) % FRAMES.length, previous: current.frame }));
    }, HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [frame, reducedMotion]);

  const [firstIndex, secondIndex] = reducedMotion ? FRAMES[0] : FRAMES[frame];
  const [prevFirst, prevSecond] = FRAMES[previous];
  const changed: Slot = reducedMotion || frame === previous ? "second" : changedSlot(frame, previous);

  return (
    <h1 id="research-heading" className="headline" data-reduced-motion={reducedMotion}>
      <PhraseSlot
        phrases={FIRST}
        active={firstIndex}
        exiting={prevFirst !== firstIndex ? prevFirst : null}
        accent={changed === "first"}
      />
      <PhraseSlot
        phrases={SECOND}
        active={secondIndex}
        exiting={prevSecond !== secondIndex ? prevSecond : null}
        accent={changed === "second"}
      />
    </h1>
  );
}
