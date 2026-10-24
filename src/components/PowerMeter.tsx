import React, { useState, useEffect, useRef } from 'react';
import { Zap, Sparkles } from 'lucide-react';
import { Sound } from '../game/audio';
import { launchSpeed } from '../game/physics';
import { AttackSideIndex } from '../types/game';

interface PowerMeterProps {
  power: number;
  side?: AttackSideIndex;
  disabled?: boolean;
  variant?: 'sidebar' | 'compact';
  onSetPower: (val: number) => void;
  onExecuteShot: (power: number) => void;
}

export const PowerMeter: React.FC<PowerMeterProps> = ({
  power,
  side = 1,
  disabled = false,
  variant = 'compact',
  onSetPower,
  onExecuteShot,
}) => {
  const [isCharging, setIsCharging] = useState(false);
  const chargeRef = useRef<number>(power);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastSoundTickRef = useRef<number>(0);

  useEffect(() => {
    chargeRef.current = power;
  }, [power]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const startCharging = (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {}

    setIsCharging(true);
    startTimeRef.current = performance.now();
    lastSoundTickRef.current = 0;
    Sound.playClick();

    const CHARGE_DURATION = 1600; // 1.6 seconds from 5% to 100%

    const loop = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(1, elapsed / CHARGE_DURATION);

      const newPower = Math.round(5 + progress * 95);
      chargeRef.current = newPower;
      onSetPower(newPower);

      const quarter = Math.floor(newPower / 25);
      if (quarter > lastSoundTickRef.current) {
        lastSoundTickRef.current = quarter;
        Sound.playClick();
      }

      // At 100%, hold steady until user releases pointer
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
  };

  const endCharging = (e: React.PointerEvent) => {
    if (!isCharging) return;
    e.preventDefault();
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsCharging(false);
    startTimeRef.current = null;

    const finalPower = Math.max(5, Math.min(100, chargeRef.current));
    onExecuteShot(finalPower);
  };

  const cancelCharging = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsCharging(false);
    startTimeRef.current = null;
  };

  const isMax = power >= 98;
  const estSpeed = launchSpeed(power / 100, side).toFixed(1);

  const getGradient = () => {
    if (power < 35) return 'from-emerald-500 to-green-400';
    if (power < 70) return 'from-yellow-500 to-amber-400';
    return 'from-orange-500 to-red-500';
  };

  const getPowerLabel = () => {
    if (power < 35) return 'Low (Positioning)';
    if (power < 70) return 'Medium (Balanced)';
    return 'High (Heavy Risk)';
  };

  if (variant === 'sidebar') {
    return (
      <div
        className="flex flex-col gap-2.5 bg-[#150d06] p-3 rounded-2xl border border-[#3d2414] shadow-inner select-none touch-none"
        data-testid="power-meter-sidebar"
      >
        {/* Header Row: Shot Power % & Speed */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-200 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#f5c518]" />
              <span>Shot Power</span>
            </span>
            <span className="text-[10px] text-[#a89584] block">{getPowerLabel()}</span>
          </div>
          <div className="text-right">
            <span
              data-testid="shot-power-value"
              className={`font-kalam font-extrabold text-2xl leading-none block ${
                isMax ? 'text-red-400 animate-pulse' : 'text-[#f5c518]'
              }`}
            >
              {power}%
            </span>
            <span className="text-[9px] font-mono text-gray-400">{estSpeed} u/s</span>
          </div>
        </div>

        {/* Middle Row: Vertical Power Meter + Slider & Status */}
        <div className="flex items-stretch gap-3">
          {/* Vertical Power Meter Bar */}
          <div
            data-testid="vertical-power-meter"
            className={`relative w-11 h-36 bg-[#0a0604] rounded-xl p-1 border flex flex-col justify-end cursor-pointer touch-none transition-all flex-shrink-0 ${
              isCharging
                ? 'border-[#f5c518] shadow-lg shadow-[#d4af37]/30 scale-[1.03]'
                : 'border-[#452815] hover:border-[#633a1e]'
            } ${disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}
            onPointerDown={startCharging}
            onPointerUp={endCharging}
            onPointerCancel={cancelCharging}
            role="slider"
            aria-label="Hold to charge shot power, release to fire"
            aria-valuenow={power}
            aria-valuemin={5}
            aria-valuemax={100}
          >
            <div className="relative w-full h-full bg-[#1b110a] rounded-lg overflow-hidden flex flex-col justify-end">
              <div className="absolute inset-0 flex flex-col justify-between py-2 px-1 pointer-events-none z-10 opacity-30">
                <div className="border-b border-white w-full" />
                <div className="border-b border-white w-2/3" />
                <div className="border-b border-white w-full" />
                <div className="border-b border-white w-2/3" />
                <div className="border-b border-white w-full" />
              </div>

              <div
                className={`w-full rounded-b-lg bg-gradient-to-t ${getGradient()} transition-all duration-75 relative ${
                  isMax ? 'animate-pulse' : ''
                }`}
                style={{ height: `${power}%` }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-white shadow-[0_0_8px_#ffffff]" />
              </div>
            </div>

            {isMax && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-md animate-bounce">
                MAX
              </div>
            )}
          </div>

          {/* Right side: Power Slider + Quick Presets + Charge Status */}
          <div className="flex-1 flex flex-col justify-between py-0.5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-gray-400">
                <span>Fine Tune Slider</span>
                <span className="font-mono text-[#f5d061]">{power}%</span>
              </div>
              <input
                data-testid="power-slider"
                type="range"
                min="5"
                max="100"
                value={power}
                disabled={disabled}
                onChange={(e) => onSetPower(+e.target.value)}
                aria-label="Shot power percentage slider"
                className="w-full accent-[#d4af37] h-2 bg-[#2a170c] rounded-lg cursor-pointer disabled:opacity-40"
              />
              {/* Quick Power Preset Pills */}
              <div className="grid grid-cols-4 gap-1 pt-0.5">
                {[25, 50, 75, 100].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      Sound.playClick();
                      onSetPower(preset);
                    }}
                    className={`py-1 rounded text-[10px] font-bold border transition ${
                      Math.abs(power - preset) <= 3
                        ? 'bg-[#3b2514] border-[#f5c518] text-[#f5c518]'
                        : 'bg-[#1b1109] border-[#38200f] text-gray-400 hover:text-white'
                    } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-gray-400 leading-snug bg-[#100904] p-1.5 rounded-lg border border-[#2c190d]">
              {isCharging
                ? isMax
                  ? '⚡ 100% LOCKED! Release button to strike!'
                  : '⚡ Charging… release at desired power!'
                : 'Hold bar or button below to charge & release to flick.'}
            </p>
          </div>
        </div>

        {/* Hold-to-Charge & Flick Action Button */}
        <button
          data-testid="hold-to-flick-btn"
          disabled={disabled}
          onPointerDown={startCharging}
          onPointerUp={endCharging}
          onPointerCancel={cancelCharging}
          className={`w-full py-2.5 px-3 rounded-xl font-kalam font-black text-base flex items-center justify-center gap-1.5 shadow-lg transition-all select-none touch-none ${
            disabled
              ? 'bg-[#24150d] text-gray-500 border border-[#3d2414] cursor-not-allowed'
              : isCharging
              ? 'bg-gradient-to-r from-[#e11d48] to-[#f59e0b] text-white scale-[1.02] shadow-[#f59e0b]/40 ring-2 ring-[#f5c518]'
              : 'bg-gradient-to-r from-[#d4af37] via-[#f5d061] to-[#d4af37] text-black hover:brightness-110 active:scale-95 shadow-[#d4af37]/30'
          }`}
        >
          <Sparkles className="w-4 h-4 fill-current flex-shrink-0" />
          <span>{isCharging ? 'RELEASE TO FLICK!' : 'HOLD TO CHARGE & FLICK'}</span>
        </button>
      </div>
    );
  }

  // Compact variant for Mobile & Tablet bottom panel
  return (
    <div
      className="flex items-center gap-2.5 bg-[#150d06] p-2 rounded-2xl border border-[#3d2414] shadow-inner select-none touch-none"
      data-testid="power-meter-compact"
    >
      {/* Vertical Power Meter Bar */}
      <div
        data-testid="vertical-power-meter"
        className={`relative w-8 sm:w-9 h-24 sm:h-28 bg-[#0a0604] rounded-xl p-1 border flex flex-col justify-end cursor-pointer touch-none transition-all flex-shrink-0 ${
          isCharging
            ? 'border-[#f5c518] shadow-lg shadow-[#d4af37]/30 scale-[1.03]'
            : 'border-[#452815] hover:border-[#633a1e]'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}
        onPointerDown={startCharging}
        onPointerUp={endCharging}
        onPointerCancel={cancelCharging}
        role="slider"
        aria-label="Hold to charge shot power, release to fire"
        aria-valuenow={power}
        aria-valuemin={5}
        aria-valuemax={100}
      >
        <div className="relative w-full h-full bg-[#1b110a] rounded-lg overflow-hidden flex flex-col justify-end">
          <div className="absolute inset-0 flex flex-col justify-between py-1.5 px-1 pointer-events-none z-10 opacity-30">
            <div className="border-b border-white w-full" />
            <div className="border-b border-white w-2/3" />
            <div className="border-b border-white w-full" />
            <div className="border-b border-white w-2/3" />
            <div className="border-b border-white w-full" />
          </div>

          <div
            className={`w-full rounded-b-lg bg-gradient-to-t ${getGradient()} transition-all duration-75 relative ${
              isMax ? 'animate-pulse' : ''
            }`}
            style={{ height: `${power}%` }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-white shadow-[0_0_8px_#ffffff]" />
          </div>
        </div>

        {isMax && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] font-black px-1 py-0.5 rounded-full uppercase tracking-tighter shadow-md animate-bounce">
            MAX
          </div>
        )}
      </div>

      {/* Control Details & Main Action Button */}
      <div className="flex-1 flex flex-col justify-between h-24 sm:h-28 py-0.5 min-w-0">
        <div>
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1 truncate">
              <Zap className="w-3.5 h-3.5 text-[#f5c518] flex-shrink-0" />
              <span>Shot Power</span>
              <span className="hidden xs:inline text-[9px] text-gray-400 font-normal">
                ({getPowerLabel()})
              </span>
            </span>
            <span
              data-testid="shot-power-value"
              className={`font-kalam font-extrabold text-base sm:text-lg leading-none flex-shrink-0 ${
                isMax ? 'text-red-400 animate-pulse' : 'text-[#f5c518]'
              }`}
            >
              {power}%
            </span>
          </div>

          <p className="text-[10px] text-gray-400 mt-0.5 leading-tight truncate">
            {isCharging
              ? isMax
                ? '⚡ 100% LOCKED! Release to strike!'
                : '⚡ Charging… release anytime to flick!'
              : 'Hold bar or button to charge & release'}
          </p>
        </div>

        {/* Manual Adjuster Slider */}
        <div className="flex items-center gap-2">
          <input
            data-testid="power-slider"
            type="range"
            min="5"
            max="100"
            value={power}
            disabled={disabled}
            onChange={(e) => onSetPower(+e.target.value)}
            aria-label="Shot power percentage slider"
            className="w-full accent-[#d4af37] h-1.5 bg-[#2a170c] rounded cursor-pointer disabled:opacity-40"
          />
        </div>

        {/* Hold or Click Flick Button */}
        <button
          data-testid="hold-to-flick-btn"
          disabled={disabled}
          onPointerDown={startCharging}
          onPointerUp={endCharging}
          onPointerCancel={cancelCharging}
          className={`w-full py-1.5 sm:py-2 px-2.5 rounded-xl font-kalam font-black text-sm sm:text-base flex items-center justify-center gap-1.5 shadow-lg transition-all select-none touch-none ${
            disabled
              ? 'bg-[#24150d] text-gray-500 border border-[#3d2414] cursor-not-allowed'
              : isCharging
              ? 'bg-gradient-to-r from-[#e11d48] to-[#f59e0b] text-white scale-[1.02] shadow-[#f59e0b]/40 ring-2 ring-[#f5c518]'
              : 'bg-gradient-to-r from-[#d4af37] via-[#f5d061] to-[#d4af37] text-black hover:brightness-110 active:scale-95 shadow-[#d4af37]/30'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 fill-current flex-shrink-0" />
          <span className="truncate">
            {isCharging ? 'RELEASE TO FLICK!' : 'HOLD TO CHARGE & FLICK'}
          </span>
        </button>
      </div>
    </div>
  );
};
