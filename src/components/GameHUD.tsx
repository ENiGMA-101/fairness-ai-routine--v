import React, { useState } from 'react';
import {
  RotateCcw,
  Home,
  Pause,
  ChevronDown,
  ChevronUp,
  Columns,
  Swords,
  Crosshair,
} from 'lucide-react';
import { AttackSideIndex, GamePhase, InGamePlayer } from '../types/game';
import { ATTACK_SIDES } from '../game/constants';
import { Sound } from '../game/audio';
import { PowerMeter } from './PowerMeter';
import { SeriesScoreboard } from './SeriesScoreboard';
import { SeriesState } from '../game/seriesState';
import { ResponsiveLayoutMode } from '../game/layout';

interface GameHUDProps {
  players: InGamePlayer[];
  currentTurnIndex: number;
  phase: GamePhase;
  power: number;
  side: AttackSideIndex;
  bannerMessage: { title: string; sub?: string } | null;
  layoutMode: ResponsiveLayoutMode;
  sidebarOverride?: 'auto' | 'sidebar' | 'bottom';
  onToggleSidebarOverride?: () => void;
  onSetPower: (val: number) => void;
  onSetSide: (side: AttackSideIndex) => void;
  onFlick: (launchPower?: number) => void;
  onRestart: () => void;
  onExit: () => void;
  onPause?: () => void;
  isPractice?: boolean;
  series?: SeriesState | null;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  players,
  currentTurnIndex,
  phase,
  power,
  side,
  bannerMessage,
  layoutMode,
  onToggleSidebarOverride,
  onSetPower,
  onSetSide,
  onFlick,
  onRestart,
  onExit,
  onPause,
  isPractice,
  series,
}) => {
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);

  const currentPlayer = players[currentTurnIndex];
  const isHumanTurn =
    phase === 'aim' && currentPlayer && !currentPlayer.isBot && currentPlayer.alive;
  const currentSideInfo = ATTACK_SIDES[side] || ATTACK_SIDES[1];
  const isDesktopSidebar = layoutMode === 'desktop-sidebar';

  const speakingPlayer = players.find(
    (p) => p.speech && p.speechTime && performance.now() - p.speechTime < 3200
  );

  return (
    <>
      {/* Top HUD Bar */}
      <div
        data-testid="hud-top-panel"
        style={isDesktopSidebar ? { left: '284px' } : undefined}
        className="fixed top-11 left-0 right-0 z-20 px-2.5 sm:px-4 py-1.5 flex items-start justify-between gap-2 pointer-events-none"
      >
        {/* Player Status Chips */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pointer-events-auto max-w-[74%]">
          {players.map((p, idx) => {
            const isActive = idx === currentTurnIndex && p.alive && phase !== 'over';
            return (
              <div
                key={p.id}
                data-testid={`player-chip-${p.id}`}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-md ${
                  !p.alive
                    ? 'bg-black/60 text-gray-500 line-through border border-white/10 opacity-60'
                    : isActive
                    ? 'bg-[#2b180d] text-white border-2 border-[#f5c518] shadow-lg shadow-[#d4af37]/20 scale-105'
                    : 'bg-[#18110b]/85 text-gray-300 border border-[#3d2414]'
                }`}
              >
                {p.botPersonality?.avatar ? (
                  <span className="text-sm leading-none">{p.botPersonality.avatar}</span>
                ) : (
                  <span
                    className="w-3 h-3 rounded-full shadow-inner flex-shrink-0"
                    style={{ backgroundColor: p.skin.ui }}
                  />
                )}
                <span className="truncate max-w-[88px] sm:max-w-[120px]">{p.name}</span>
                <span className="hidden md:inline text-[10px] text-amber-300/80 font-normal truncate max-w-[90px]">
                  ({p.skin.name})
                </span>
                {!p.alive && <span className="text-[10px] text-red-400 font-normal">out</span>}
              </div>
            );
          })}
          {isPractice && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-950/85 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
              Practice Range
            </span>
          )}
        </div>

        {/* Top Right Match Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto flex-shrink-0">
          {onToggleSidebarOverride && (
            <button
              onClick={() => {
                Sound.playClick();
                onToggleSidebarOverride();
              }}
              aria-label="Toggle control panel layout"
              title="Switch Sidebar / Bottom Controls"
              className="hidden lg:flex p-2 bg-[#2b180d]/90 hover:bg-[#3d2414] text-[#e5e7eb] border border-[#5a361c] rounded-xl shadow active:scale-95 transition"
            >
              <Columns className="w-4 h-4" />
            </button>
          )}
          {onPause && (
            <button
              onClick={() => {
                Sound.playClick();
                onPause();
              }}
              data-testid="pause-match-btn"
              aria-label="Pause match"
              title="Pause Match"
              className="p-2 bg-[#2b180d]/90 hover:bg-[#3d2414] text-[#f5d061] border border-[#5a361c] rounded-xl shadow active:scale-95 transition"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => {
              Sound.playClick();
              onRestart();
            }}
            data-testid="restart-match-btn"
            aria-label="Restart match"
            title="Restart Match"
            className="p-2 bg-[#2b180d]/90 hover:bg-[#3d2414] text-[#f5c518] border border-[#5a361c] rounded-xl shadow active:scale-95 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              Sound.playClick();
              onExit();
            }}
            data-testid="exit-match-btn"
            aria-label="Exit to main menu"
            title="Exit to Menu"
            className="p-2 bg-[#2b180d]/90 hover:bg-[#3d2414] text-[#f87171] border border-[#5a361c] rounded-xl shadow active:scale-95 transition"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Series Bo5 Scoreboard on Mobile/Tablet (positioned cleanly in top-right below action buttons) */}
      {!isDesktopSidebar && series && (
        <div className="fixed top-22 right-2.5 z-20 pointer-events-auto max-w-[240px] animate-fade-in hidden sm:block">
          <SeriesScoreboard series={series} compact />
        </div>
      )}

      {/* Center Dynamic Turn Banner */}
      {bannerMessage && (
        <div
          style={isDesktopSidebar ? { left: 'calc(50% + 140px)' } : undefined}
          className="fixed top-22 left-1/2 -translate-x-1/2 z-25 pointer-events-none animate-bounce-subtle text-center max-w-[90vw]"
        >
          <div className="px-5 py-2 bg-[#1a0e06]/92 border-2 border-[#f5c518] rounded-2xl shadow-2xl backdrop-blur-md">
            <h3 className="font-kalam font-extrabold text-xl sm:text-2xl text-[#f5d061] leading-tight">
              {bannerMessage.title}
            </h3>
            {bannerMessage.sub && (
              <p className="text-xs text-[#e5e7eb] font-bangla font-medium mt-0.5">
                {bannerMessage.sub}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Floating Bot Contextual Speech Bubble */}
      {speakingPlayer && speakingPlayer.speech && (
        <div
          style={isDesktopSidebar ? { left: 'calc(50% + 140px)' } : undefined}
          className="fixed top-34 left-1/2 -translate-x-1/2 z-25 pointer-events-none animate-fade-in text-center max-w-xs sm:max-w-md"
        >
          <div className="px-4 py-2 bg-[#29170c]/95 border-2 border-[#d4af37] rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 text-left">
            <span className="text-2xl flex-shrink-0">
              {speakingPlayer.botPersonality?.avatar || '💬'}
            </span>
            <div>
              <span className="text-[11px] font-bold text-[#f5c518] block leading-tight">
                {speakingPlayer.name}:
              </span>
              <p className="text-xs text-white italic font-medium leading-tight">
                "{speakingPlayer.speech}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP LEFT CONTROL SIDEBAR */}
      {isDesktopSidebar ? (
        <aside
          data-testid="hud-left-sidebar"
          className="fixed top-12 bottom-3 left-3 z-20 w-[268px] xl:w-[280px] bg-[#1a1109]/95 backdrop-blur-md border-2 border-[#54341b] rounded-2xl p-3 shadow-2xl flex flex-col justify-between gap-2.5 overflow-y-auto select-none"
        >
          {/* Top Section: Active Player Turn & Attack Styles */}
          <div className="flex flex-col gap-2.5">
            {/* Turn Header Card */}
            <div className="bg-[#24160c] border border-[#4a2d18] rounded-xl p-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-inner flex-shrink-0"
                  style={{ backgroundColor: currentPlayer?.skin.ui || '#2563eb' }}
                >
                  {currentPlayer?.botPersonality?.avatar || <Swords className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#d4af37] block">
                    {isHumanTurn ? 'Your Turn to Strike' : 'Active Turn'}
                  </span>
                  <span
                    data-testid="sidebar-active-player"
                    className="font-kalam font-bold text-base text-white truncate block leading-tight"
                  >
                    {currentPlayer?.name || 'Player'}
                  </span>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                  isHumanTurn
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-950/90 text-amber-300 border-amber-500/40'
                }`}
              >
                {phase === 'aim' ? (currentPlayer?.isBot ? 'AI Thinking' : 'Aiming') : 'In Motion'}
              </span>
            </div>

            {/* Attack Style Selector (Top Strike, Middle Push, Bottom Slam) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#f5d061]">
                  Attack Style
                </span>
                <span className="text-[10px] text-gray-400">Select strike point</span>
              </div>

              <div className="grid grid-cols-1 gap-1.5" data-testid="attack-styles-list">
                {ATTACK_SIDES.map((s, idx) => {
                  const isSelected = side === s.id;
                  const shortTitle =
                    idx === 0 ? 'Top Strike' : idx === 1 ? 'Middle Push' : 'Bottom Slam';
                  const tagText =
                    idx === 0 ? 'Side 1 • Spin & Curve' : idx === 1 ? 'Side 2 • Straight Push' : 'Side 3 • Heavy Slam';

                  return (
                    <button
                      key={s.id}
                      data-testid={`attack-side-btn-${s.id}`}
                      disabled={!isHumanTurn}
                      onClick={() => {
                        Sound.playClick();
                        onSetSide(s.id);
                      }}
                      className={`w-full py-2 px-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all text-left ${
                        isSelected
                          ? 'bg-[#3b2514] border-[#f5c518] text-[#f5c518] shadow-md'
                          : 'bg-[#140c06] border-[#38200f] text-gray-300 hover:border-[#5a361c] hover:text-white'
                      } ${!isHumanTurn ? 'opacity-60 cursor-not-allowed' : 'active:scale-[0.98]'}`}
                    >
                      <div className="min-w-0">
                        <div className="font-kalam font-bold text-sm leading-tight">
                          {shortTitle}
                        </div>
                        <div className="text-[10px] text-gray-400 leading-tight mt-0.5">
                          {tagText}
                        </div>
                      </div>

                      {/* Pen SVG showing impact point */}
                      <svg viewBox="0 0 70 14" className="w-14 h-3.5 flex-shrink-0">
                        <rect
                          x="2"
                          y="3.5"
                          width="54"
                          height="7"
                          rx="3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                        <path
                          d="M56 3.5 L67 7 L56 10.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                        <circle
                          cx={idx === 0 ? 59 : idx === 1 ? 32 : 8}
                          cy="7"
                          r="3.3"
                          className={isSelected ? 'fill-[#f5c518]' : 'fill-[#d8536b]'}
                        />
                      </svg>
                    </button>
                  );
                })}
              </div>

              {/* Selected Attack Concise Description */}
              <div
                data-testid="selected-attack-description"
                className="bg-[#130b05] border border-[#38200f] rounded-xl p-2 text-[11px] text-[#c7b6a6] leading-snug"
              >
                <span className="font-bold text-[#f5c518] block mb-0.5">
                  {currentSideInfo.title}
                </span>
                <span>{currentSideInfo.desc}</span>
              </div>
            </div>
          </div>

          {/* Middle Section: Vertical Power Meter, Slider & Hold-to-Flick Button */}
          <PowerMeter
            power={power}
            side={side}
            disabled={!isHumanTurn}
            variant="sidebar"
            onSetPower={onSetPower}
            onExecuteShot={(finalPower) => onFlick(finalPower)}
          />

          {/* Bottom Section: Series Scoreboard (if Bo5) + Aiming Tip */}
          <div className="flex flex-col gap-2">
            {series && <SeriesScoreboard series={series} compact />}

            <div className="flex items-center gap-1.5 text-[10px] text-[#a89584] px-1">
              <Crosshair className="w-3.5 h-3.5 text-[#f5c518] flex-shrink-0" />
              <span>Drag anywhere on the wooden bench to aim your shot.</span>
            </div>
          </div>
        </aside>
      ) : (
        /* TABLET & MOBILE BOTTOM CONTROL PANEL */
        <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-center px-1.5 sm:px-3 pb-1.5 sm:pb-2.5 pointer-events-none">
          <div
            data-testid="hud-bottom-panel"
            className="pointer-events-auto w-full max-w-xl bg-[#1b120a]/95 backdrop-blur-md border-2 border-[#54341b] rounded-2xl p-2 sm:p-2.5 shadow-2xl flex flex-col gap-1.5 sm:gap-2 select-none touch-none"
          >
            {/* Optional Tablet Collapsible Header */}
            {layoutMode === 'tablet-compact' && (
              <div className="flex items-center justify-between px-1 text-[11px] text-[#d4af37]">
                <span className="font-bold">
                  {currentPlayer?.name}’s Controls &middot; {currentSideInfo.title}
                </span>
                <button
                  type="button"
                  onClick={() => setDrawerCollapsed((c) => !c)}
                  className="flex items-center gap-1 text-xs text-gray-300 hover:text-white px-2 py-0.5 rounded bg-[#2a170c] border border-[#4a2b16]"
                >
                  <span>{drawerCollapsed ? 'Expand Controls' : 'Compact View'}</span>
                  {drawerCollapsed ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}

            {!drawerCollapsed && (
              <>
                {/* Top Row: Attack Sides (Side 1, Side 2, Side 3) */}
                <div className="flex items-center justify-between gap-1 sm:gap-1.5">
                  {ATTACK_SIDES.map((s, idx) => {
                    const isSelected = side === s.id;
                    return (
                      <button
                        key={s.id}
                        data-testid={`attack-side-btn-${s.id}`}
                        disabled={!isHumanTurn}
                        onClick={() => {
                          Sound.playClick();
                          onSetSide(s.id);
                        }}
                        className={`flex-1 py-1 sm:py-1.5 px-1 rounded-xl border flex flex-col items-center justify-center transition-all min-w-0 ${
                          isSelected
                            ? 'bg-[#3b2514] border-[#f5c518] text-[#f5c518] shadow-md scale-[1.01]'
                            : 'bg-[#150d06] border-[#38200f] text-gray-400 hover:text-gray-200'
                        } ${!isHumanTurn ? 'opacity-60 cursor-not-allowed' : 'active:scale-95'}`}
                      >
                        <svg viewBox="0 0 70 14" className="w-11 sm:w-14 h-3 mb-0.5">
                          <rect
                            x="2"
                            y="3.5"
                            width="54"
                            height="7"
                            rx="3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          />
                          <path
                            d="M56 3.5 L67 7 L56 10.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          />
                          <circle
                            cx={idx === 0 ? 59 : idx === 1 ? 32 : 8}
                            cy="7"
                            r="3.2"
                            className={isSelected ? 'fill-[#f5c518]' : 'fill-[#d8536b]'}
                          />
                        </svg>
                        <span className="font-kalam font-bold text-[11px] sm:text-xs leading-none truncate max-w-full">
                          {idx === 0 ? 'Top Strike' : idx === 1 ? 'Middle Push' : 'Bottom Slam'}
                        </span>
                        <span className="text-[9px] text-gray-400 font-sans truncate max-w-full">
                          {idx === 0 ? 'Side 1 (Spin)' : idx === 1 ? 'Side 2 (Direct)' : 'Side 3 (Heavy)'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Middle Row: Charge-and-Release Power Meter */}
                <PowerMeter
                  power={power}
                  side={side}
                  disabled={!isHumanTurn}
                  variant="compact"
                  onSetPower={onSetPower}
                  onExecuteShot={(finalPower) => {
                    onFlick(finalPower);
                  }}
                />

                {/* Bottom Hint */}
                <div
                  data-testid="selected-attack-description"
                  className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#a89584] leading-tight px-1"
                >
                  <span className="truncate">
                    <b className="text-[#f5c518]">{currentSideInfo.name}:</b> {currentSideInfo.desc}
                  </span>
                  <span className="hidden sm:inline-block text-[10px] text-gray-400 pl-2 flex-shrink-0">
                    Drag on desk to aim
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
