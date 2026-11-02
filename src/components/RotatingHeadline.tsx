"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * Single-line desktop hero headline with two alternating modes:
 *
 *   Mode A – first phrase fixed ("Better schedules."), second phrase changes:
 *     0 Better schedules.             | Better learning experiences.
 *     1 Better schedules.             | Fairer university routines.
 *     2 Better schedules.             | Smarter scheduling decisions.
 *     3 Better schedules.             | More balanced academic life.
 *
 *   Mode B – second phrase fixed ("Better learning experiences."), first phrase changes:
 *     4 Better schedules.             | Better learning experiences.
 *     5 Fairer university routines.   | Better learning experiences.
 *     6 Smarter scheduling decisions. | Better learning experiences.
 *     7 More balanced academic life.  | Better learning experiences.
 *
 * Every transition changes ONLY ONE phrase at a time; the fixed phrase remains
 * completely static throughout its sequence.
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

/** How long each phrase pair stays visible (~3.5 seconds). */
const HOLD_MS = 3500;
const EXIT_MS = 240;

type Slot = "first" | "second";
type Phase = "active" | "exit" | "enter";

/** Which slot changes when advancing from `previous` to `next`. */
function changedSlot(next: number, previous: number): Slot {
  const [pf] = FRAMES[previous];
  const [nf] = FRAMES[next];
  return pf !== nf ? "first" : "second";
}

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const getReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getServerReducedMotion = () => false;

type StepState = {
  frame: number;
  changingSlot: Slot;
  phase: Phase;
};

export default function RotatingHeadline() {
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getServerReducedMotion);
  const [{ frame, changingSlot, phase }, setStep] = useState<StepState>({
    frame: 0,
    changingSlot: "second",
    phase: "active",
  });

  useEffect(() => {
    if (reducedMotion) return;

    if (phase === "active") {
      const holdTimer = window.setTimeout(() => {
        setStep((current) => {
          const nextFrame = (current.frame + 1) % FRAMES.length;
          const slot = changedSlot(nextFrame, current.frame);
          return {
            frame: current.frame,
            changingSlot: slot,
            phase: "exit",
          };
        });
      }, HOLD_MS);
      return () => window.clearTimeout(holdTimer);
    }

    if (phase === "exit") {
      const exitTimer = window.setTimeout(() => {
        setStep((current) => {
          const nextFrame = (current.frame + 1) % FRAMES.length;
          const slot = changedSlot(nextFrame, current.frame);
          return {
            frame: nextFrame,
            changingSlot: slot,
            phase: "enter",
          };
        });
      }, EXIT_MS);
      return () => window.clearTimeout(exitTimer);
    }

    // phase === "enter": trigger smooth upward slide + fade in on next paint frame
    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        setStep((current) => ({ ...current, phase: "active" }));
      });
    });
    return () => {
      window.cancelAnimationFrame(raf1);
      if (raf2) window.cancelAnimationFrame(raf2);
    };
  }, [frame, phase, reducedMotion]);

  const [firstIndex, secondIndex] = reducedMotion ? FRAMES[0] : FRAMES[frame];
  const mode = !reducedMotion && frame >= 4 ? "B" : "A";
  const activeSlot: Slot = reducedMotion ? "second" : changingSlot;
  const firstState: Phase = !reducedMotion && changingSlot === "first" ? phase : "active";
  const secondState: Phase = !reducedMotion && changingSlot === "second" ? phase : "active";

  return (
    <h1
      id="research-heading"
      className="headline"
      data-mode={mode}
      data-changing-slot={activeSlot}
      data-reduced-motion={reducedMotion}
    >
      <span
        className="headline-slot"
        data-slot="first"
        data-accent={activeSlot === "first"}
        data-fixed={activeSlot !== "first"}
      >
        <span className="headline-phrase" data-state={firstState}>
          {FIRST[firstIndex]}
        </span>
      </span>{" "}
      <span
        className="headline-slot"
        data-slot="second"
        data-accent={activeSlot === "second"}
        data-fixed={activeSlot !== "second"}
      >
        <span className="headline-phrase" data-state={secondState}>
          {SECOND[secondIndex]}
        </span>
      </span>
    </h1>
  );
}
