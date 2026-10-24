import React from 'react';
import { AlertTriangle, Play, LogOut, RotateCcw, PauseCircle } from 'lucide-react';
import { Sound } from '../game/audio';

interface ExitConfirmModalProps {
  isOpen: boolean;
  isPlacementPhase?: boolean;
  onStayInMatch: () => void;
  onLeaveMatch: () => void;
}

export const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({
  isOpen,
  isPlacementPhase = false,
  onStayInMatch,
  onLeaveMatch,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none"
      data-testid="exit-confirm-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-confirm-title"
    >
      <div className="w-full max-w-md bg-gradient-to-b from-[#24140a] to-[#170c06] border-2 border-[#6b3e20] rounded-3xl p-6 shadow-2xl text-center text-[#f3f4f6]">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-950/80 border-2 border-amber-500/60 flex items-center justify-center shadow-inner">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
        </div>

        <h2
          id="exit-confirm-title"
          data-testid="exit-confirm-title"
          className="font-kalam font-extrabold text-2xl sm:text-3xl text-[#f5d061] mb-2 leading-tight"
        >
          Do you want to leave the match?
        </h2>

        <p
          data-testid="exit-confirm-description"
          className="text-sm text-gray-300 mb-6 leading-relaxed"
        >
          Your current match will be abandoned. Completed results will remain unchanged.
          {isPlacementPhase && (
            <span className="block text-xs text-amber-300/90 mt-1.5">
              Unfinished pen placement setup will be cancelled.
            </span>
          )}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            data-testid="stay-in-match-btn"
            onClick={() => {
              Sound.playClick();
              onStayInMatch();
            }}
            className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:brightness-110 active:scale-95 text-white font-kalam font-extrabold text-lg rounded-2xl shadow-lg flex items-center justify-center gap-2 transition"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Stay in Match</span>
          </button>

          <button
            type="button"
            data-testid="leave-match-btn"
            onClick={() => {
              Sound.playClick();
              onLeaveMatch();
            }}
            className="w-full sm:flex-1 py-3 px-4 bg-[#381914] hover:bg-[#4d211a] active:scale-95 text-red-200 border border-red-500/50 font-kalam font-bold text-lg rounded-2xl shadow flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Leave Match</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onRequestExit: () => void;
  onOpenSettings: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onRequestExit,
  onOpenSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none"
      data-testid="pause-modal"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm bg-[#1c120a] border-2 border-[#5a361c] rounded-3xl p-6 shadow-2xl text-center text-[#f3f4f6]">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#2e190d] border border-[#d4af37]/50 flex items-center justify-center text-[#f5d061]">
          <PauseCircle className="w-8 h-8" />
        </div>

        <h2 className="font-kalam font-extrabold text-3xl text-[#f5d061] mb-1">
          Match Paused
        </h2>
        <p className="text-xs text-gray-400 mb-5">Take a breather — the desk awaits!</p>

        <div className="space-y-2.5">
          <button
            type="button"
            data-testid="resume-match-btn"
            onClick={() => {
              Sound.playClick();
              onResume();
            }}
            className="w-full py-3 bg-gradient-to-r from-[#d4af37] via-[#f5d061] to-[#d4af37] text-black font-kalam font-extrabold text-lg rounded-xl shadow-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Resume Match</span>
          </button>

          <button
            type="button"
            onClick={() => {
              Sound.playClick();
              onRestart();
            }}
            className="w-full py-2.5 bg-[#2b180d] hover:bg-[#3d2313] text-[#f5c518] font-kalam font-bold text-base rounded-xl border border-[#5a361c] flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Match</span>
          </button>

          <button
            type="button"
            onClick={() => {
              Sound.playClick();
              onOpenSettings();
            }}
            className="w-full py-2.5 bg-[#24140a] hover:bg-[#331c0e] text-gray-200 font-kalam font-bold text-base rounded-xl border border-[#422512] transition"
          >
            Audio & Physics Settings
          </button>

          <button
            type="button"
            onClick={() => {
              Sound.playClick();
              onRequestExit();
            }}
            className="w-full py-2.5 bg-red-950/50 hover:bg-red-900/60 text-red-300 font-kalam font-bold text-base rounded-xl border border-red-500/40 flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Leave Match</span>
          </button>
        </div>
      </div>
    </div>
  );
};
