import React from 'react';
import { RotateCcw, RotateCw, Check, ShieldAlert, EyeOff, Hand, Compass, ArrowLeft } from 'lucide-react';
import { InGamePlayer } from '../types/game';
import { Sound } from '../game/audio';

interface PenPlacementHUDProps {
  currentPlayer: InGamePlayer;
  playerIndex: number;
  totalHumanPlayers: number;
  isValidPlacement: boolean;
  validationReason?: string;
  isHandoverPrompt: boolean;
  onAcknowledgeHandover: () => void;
  onRotate: (deltaRadians: number) => void;
  onResetAngle: () => void;
  onConfirmPlacement: () => void;
  onExit: () => void;
}

export const PenPlacementHUD: React.FC<PenPlacementHUDProps> = ({
  currentPlayer,
  playerIndex,
  totalHumanPlayers,
  isValidPlacement,
  validationReason,
  isHandoverPrompt,
  onAcknowledgeHandover,
  onRotate,
  onResetAngle,
  onConfirmPlacement,
  onExit,
}) => {
  const skin = currentPlayer.skin;

  if (isHandoverPrompt) {
    return (
      <div
        className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
        data-testid="placement-handover-modal"
      >
        <div className="w-full max-w-md bg-[#1f130a] border-2 border-[#d4af37] rounded-3xl p-6 text-center shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-[#382112] border border-[#d4af37]/50 flex items-center justify-center text-[#f5c518]">
            <Hand className="w-8 h-8 animate-bounce" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Secret Pen Placement • Pass Device
          </span>
          <h2 className="font-kalam font-extrabold text-3xl text-white mt-1">
            Hand Device to {currentPlayer.name}
          </h2>
          <p className="text-xs text-gray-300 mt-2 leading-relaxed">
            Other players must look away! {currentPlayer.name} will now privately position{' '}
            <strong className="text-[#f5d061]">{skin.name}</strong> on the desk. Previously placed pens are hidden.
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              data-testid="handover-ready-btn"
              onClick={() => {
                Sound.playClick();
                onAcknowledgeHandover();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-[#d4af37] via-[#f5d061] to-[#d4af37] text-[#1a0e05] font-kalam font-extrabold text-xl rounded-xl shadow-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition"
            >
              <EyeOff className="w-5 h-5" />
              <span>I AM {currentPlayer.name.toUpperCase()} — PLACE PEN</span>
            </button>
            <button
              type="button"
              data-testid="handover-exit-btn"
              onClick={() => {
                Sound.playClick();
                onExit();
              }}
              className="py-2 text-xs text-gray-400 hover:text-white transition"
            >
              Exit Match
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-2.5 sm:p-4 select-none"
      data-testid="placement-hud"
    >
      {/* Top Banner */}
      <div className="w-full max-w-xl mx-auto flex items-center justify-between gap-2 bg-[#1a1008]/95 border border-[#5c3a21] rounded-2xl px-3.5 py-2.5 shadow-xl pointer-events-auto backdrop-blur-md">
        <button
          type="button"
          data-testid="placement-exit-btn"
          onClick={() => {
            Sound.playClick();
            onExit();
          }}
          className="p-2 rounded-xl bg-[#2a190d] hover:bg-[#3d2514] text-gray-300 border border-[#523018] transition active:scale-95"
          title="Leave Match"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="text-center flex-1 min-w-0">
          <div className="flex items-center justify-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
              Place Your Pen ({playerIndex + 1}/{totalHumanPlayers})
            </span>
            {totalHumanPlayers > 1 && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-[10px] font-bold">
                <EyeOff className="w-3 h-3" /> Secret Mode
              </span>
            )}
          </div>
          <h3 className="font-kalam font-bold text-lg sm:text-xl text-[#f5d061] leading-tight mt-0.5 truncate">
            {currentPlayer.name} — Position {skin.name}
          </h3>
          <p className="text-[11px] text-gray-300 truncate">
            Drag pen anywhere on the table &bull; Rotate below &bull; Keep full pen inside edges
          </p>
        </div>

        <div className="w-8" />
      </div>

      {/* Bottom Placement Controls */}
      <div className="w-full max-w-md mx-auto bg-[#1a1008]/95 border-2 border-[#5c3a21] rounded-2xl p-3 shadow-2xl pointer-events-auto backdrop-blur-md">
        {!isValidPlacement && (
          <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-red-950/90 border border-red-500/60 text-red-200 text-xs font-bold flex items-center justify-center gap-1.5 animate-pulse">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              {validationReason === 'overlap'
                ? 'Too close to another pen position! Move slightly.'
                : 'Pen must be completely inside the table boundaries!'}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mb-2.5">
          <button
            type="button"
            data-testid="placement-rotate-ccw"
            onClick={() => {
              Sound.playClick();
              onRotate(-Math.PI / 12);
            }}
            className="flex-1 py-2 px-2.5 bg-[#2a190d] hover:bg-[#3b2313] text-amber-200 border border-[#523018] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-[#f5c518]" />
            <span>Rotate -15°</span>
          </button>

          <button
            type="button"
            data-testid="placement-reset-angle"
            onClick={() => {
              Sound.playClick();
              onResetAngle();
            }}
            className="py-2 px-3 bg-[#2a190d] hover:bg-[#3b2313] text-gray-300 border border-[#523018] rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition active:scale-95"
            title="Align Straight"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Align</span>
          </button>

          <button
            type="button"
            data-testid="placement-rotate-cw"
            onClick={() => {
              Sound.playClick();
              onRotate(Math.PI / 12);
            }}
            className="flex-1 py-2 px-2.5 bg-[#2a190d] hover:bg-[#3b2313] text-amber-200 border border-[#523018] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <RotateCw className="w-4 h-4 text-[#f5c518]" />
            <span>Rotate +15°</span>
          </button>
        </div>

        <button
          type="button"
          data-testid="placement-confirm-btn"
          disabled={!isValidPlacement}
          onClick={() => {
            if (!isValidPlacement) return;
            Sound.playClick();
            onConfirmPlacement();
          }}
          className={`w-full py-3 rounded-xl font-kalam font-extrabold text-xl flex items-center justify-center gap-2 transition shadow-lg ${
            isValidPlacement
              ? 'bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#16a34a] text-[#052e16] hover:brightness-110 active:scale-98 cursor-pointer'
              : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
          }`}
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>CONFIRM PEN PLACEMENT</span>
        </button>
      </div>
    </div>
  );
};
