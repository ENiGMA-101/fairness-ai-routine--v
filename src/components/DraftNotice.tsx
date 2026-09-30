"use client";

import { Check, HardDrive, RotateCcw, ShieldCheck, TriangleAlert } from "lucide-react";

type Props = { ready: boolean; hasDraft: boolean; restored: boolean; storageAvailable: boolean };

export default function DraftNotice({ ready, hasDraft, restored, storageAvailable }: Props) {
  const Icon = !storageAvailable ? TriangleAlert : restored ? RotateCcw : hasDraft ? Check : HardDrive;
  const title = !storageAvailable
    ? "Browser storage is unavailable"
    : !ready ? "Loading your saved progress…"
    : restored ? "Welcome back. Your draft is restored."
    : hasDraft ? "Progress saved on this browser"
    : "Your progress saves automatically";

  return (
    <div className={`draft-notice ${!storageAvailable ? "draft-notice-warning" : ""}`} role="status" aria-live="polite">
      <span className="draft-notice-icon"><Icon size={18} /></span>
      <div>
        <p>{title}</p>
        <span>{!storageAvailable
          ? "You can still answer, but progress may be lost on refresh. Enable browser storage to save a draft."
          : "Leave and come back anytime. You can edit every answer until you submit."}</span>
      </div>
      <span className="draft-notice-local"><ShieldCheck size={13} /> Only on your device</span>
    </div>
  );
}
