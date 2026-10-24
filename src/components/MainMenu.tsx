import React, { useRef, useEffect } from 'react';
import {
  Play,
  Bot,
  Users,
  Trophy,
  Target,
  Layout,
  Sparkles,
  BookOpen,
  Settings,
  Cloud,
  Award,
  Flame,
  HelpCircle,
} from 'lucide-react';
import { GameSettings, PlayerProgress } from '../types/game';
import { getSkin } from '../game/skins';
import { getTableConfig } from '../game/tableConfig';
import { drawDetailedPen } from '../game/renderer';
import { Sound } from '../game/audio';
import { formatSyncStatusLabel, SyncStatus } from '../game/cloudSync';
import { AuthenticatedUser } from './AccountModal';

interface MainMenuProps {
  progress: PlayerProgress;
  settings?: GameSettings;
  selectedTableId?: string;
  user?: AuthenticatedUser | null;
  syncStatus?: SyncStatus;
  onStartQuickMatch: () => void;
  onOpenSetup: (mode: 'quick' | 'pass_and_play' | 'ai_battle') => void;
  onStartPractice: () => void;
  onOpenLocker: () => void;
  onOpenArenas: () => void;
  onOpenChampionship: () => void;
  onOpenChallenges: () => void;
  onOpenHowTo: () => void;
  onOpenSettings?: () => void;
  onOpenAccount?: () => void;
  onOpenStats?: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  progress,
  settings,
  selectedTableId = 'school_bench',
  user = null,
  syncStatus = 'offline',
  onStartQuickMatch,
  onOpenSetup,
  onStartPractice,
  onOpenLocker,
  onOpenArenas,
  onOpenChampionship,
  onOpenChallenges,
  onOpenHowTo,
  onOpenSettings,
  onOpenAccount,
  onOpenStats,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const equippedSkin = getSkin(progress.equippedSkin);
  const activeTable = getTableConfig(selectedTableId);
  const reducedMotion = Boolean(settings?.reducedMotion);

  // Animated 3D-inspired rotating pen showcase in main menu
  useEffect(() => {
    let animId: number;
    let angle = -0.15;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (!reducedMotion) {
        angle += 0.012;
      }
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(angle);
      const scale = Math.min((w - 20) / 180, (h - 20) / 45);
      ctx.scale(scale, scale);

      drawDetailedPen(ctx, equippedSkin, {
        shadow: { blur: 14, x: 4, y: 8 },
        activeSide: 1,
        aura: equippedSkin.rarity === 'legendary',
      });
      ctx.restore();

      if (!reducedMotion) {
        animId = requestAnimationFrame(render);
      }
    };

    render();
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [equippedSkin, reducedMotion]);

  return (
    <div
      className="relative z-10 w-full min-h-screen flex flex-col items-center justify-between px-3 sm:px-4 pt-14 pb-5 overflow-y-auto"
      data-testid="main-menu"
    >
      {/* Top Status Strip: Save Status & Selected Table */}
      <div className="w-full max-w-lg flex items-center justify-between gap-2 mt-1">
        <button
          type="button"
          onClick={() => {
            Sound.playClick();
            onOpenAccount?.();
          }}
          data-testid="menu-save-status-pill"
          className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/40 rounded-full text-[11px] font-semibold text-emerald-300 transition truncate"
        >
          <Cloud className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="truncate">{formatSyncStatusLabel(syncStatus)}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            Sound.playClick();
            onOpenArenas();
          }}
          className="flex items-center gap-1 text-[11px] font-bold text-amber-300/90 bg-amber-950/60 hover:bg-amber-900/70 px-3 py-1 rounded-full border border-amber-600/30 transition flex-shrink-0"
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Table: {activeTable.name}</span>
        </button>
      </div>

      {/* Hero Showcase Card */}
      <div className="w-full max-w-lg my-2.5 bg-gradient-to-b from-[#23160d]/95 to-[#170e08]/95 border-2 border-[#5c3a21] rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-2.5 left-3 w-3 h-1 bg-[#8c6d1f] rounded-full rotate-45" />
        <div className="absolute top-2.5 right-3 w-3 h-1 bg-[#8c6d1f] rounded-full -rotate-45" />

        {/* Title Branding */}
        <div className="text-center">
          <h1 className="font-kalam font-extrabold text-4xl sm:text-5xl text-[#f5d061] tracking-tight drop-shadow-md leading-none">
            Clash of Pens
          </h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="h-[2px] w-8 bg-[#d8536b]" />
            <span className="font-bangla font-bold text-xl sm:text-2xl text-[#d8536b]">
              কলম যুদ্ধ • Pen Fight
            </span>
            <span className="h-[2px] w-8 bg-[#d8536b]" />
          </div>
          <p className="text-xs text-[#b8a28f] mt-1 font-outfit">
            Classroom School Bench Edition &middot; Authentic Physics & Stationery
          </p>
        </div>

        {/* 360 Pen Preview */}
        <div className="relative my-2.5 flex flex-col items-center">
          <div className="w-full h-22 sm:h-26 flex items-center justify-center">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-[#f5c518] mt-1">
            <span
              data-testid="menu-equipped-pen"
              className="px-2.5 py-0.5 rounded-full bg-[#382011] border border-[#d4af37]/40"
            >
              {equippedSkin.name}
            </span>
            <span className="capitalize text-[10px] text-[#d1d5db] px-2 py-0.5 rounded-full bg-black/50 border border-white/10">
              {equippedSkin.rarity}
            </span>
            {onOpenStats && (
              <button
                type="button"
                onClick={() => {
                  Sound.playClick();
                  onOpenStats();
                }}
                className="text-[10px] text-amber-300 hover:text-white px-2 py-0.5 rounded-full bg-[#2c190d] border border-[#523018] flex items-center gap-1 transition"
              >
                <Award className="w-3 h-3" />
                <span>
                  {progress.matchesWon} Wins &bull; 🏆 {progress.championshipTrophies}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Primary Action: PLAY NOW */}
        <button
          onClick={() => {
            Sound.playClick();
            onStartQuickMatch();
          }}
          data-testid="play-now-btn"
          className="w-full py-3.5 bg-gradient-to-r from-[#d4af37] via-[#f5d061] to-[#d4af37] text-[#1a0e05] font-kalam font-extrabold text-2xl rounded-2xl shadow-lg shadow-[#d4af37]/25 border border-[#fff3b0] flex items-center justify-center gap-3 transition-all hover:brightness-110 active:scale-[0.98]"
        >
          <Play className="w-6 h-6 fill-current" />
          <span>PLAY NOW (দ্রুত ম্যাচ)</span>
        </button>
      </div>

      {/* Main Game Modes Grid (AI Battle, Friendly Match, Championship, Challenges) */}
      <div className="w-full max-w-lg grid grid-cols-2 gap-2.5 my-1">
        {/* AI Battle */}
        <button
          onClick={() => {
            Sound.playClick();
            onOpenSetup('ai_battle');
          }}
          data-testid="menu-ai-battle-btn"
          className="p-3 bg-[#24170f]/95 hover:bg-[#322015] border border-[#52331c] rounded-2xl flex items-center gap-3 text-left transition active:scale-95 group shadow-md"
        >
          <div className="p-2.5 rounded-xl bg-[#3d2414] text-[#ec4899] border border-[#be185d]/40 group-hover:scale-105 transition flex-shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-kalam font-bold text-base text-[#f3f4f6] leading-tight truncate">
              AI Battle
            </h3>
            <p className="text-[10px] text-[#9ca3af] leading-tight mt-0.5 truncate">
              Easy, Normal & Sharp Bots
            </p>
          </div>
        </button>

        {/* Friendly Match (Pass & Play) */}
        <button
          onClick={() => {
            Sound.playClick();
            onOpenSetup('pass_and_play');
          }}
          data-testid="menu-friendly-match-btn"
          className="p-3 bg-[#24170f]/95 hover:bg-[#322015] border border-[#52331c] rounded-2xl flex items-center gap-3 text-left transition active:scale-95 group shadow-md"
        >
          <div className="p-2.5 rounded-xl bg-[#3d2414] text-[#38bdf8] border border-[#0284c7]/40 group-hover:scale-105 transition flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-kalam font-bold text-base text-[#f3f4f6] leading-tight truncate">
              Friendly Match
            </h3>
            <p className="text-[10px] text-[#9ca3af] leading-tight mt-0.5 truncate">
              2-3 Named Players Pass & Play
            </p>
          </div>
        </button>

        {/* Championship Tournament */}
        <button
          onClick={() => {
            Sound.playClick();
            onOpenChampionship();
          }}
          data-testid="menu-championship-btn"
          className="p-3 bg-[#24170f]/95 hover:bg-[#322015] border border-[#52331c] rounded-2xl flex items-center gap-3 text-left transition active:scale-95 group shadow-md"
        >
          <div className="p-2.5 rounded-xl bg-[#3d2414] text-[#eab308] border border-[#ca8a04]/40 group-hover:scale-105 transition flex-shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-kalam font-bold text-base text-[#f3f4f6] leading-tight truncate">
              Championship
            </h3>
            <p className="text-[10px] text-[#9ca3af] leading-tight mt-0.5 truncate">
              3-Round Cup Tournament
            </p>
          </div>
        </button>

        {/* Trick Shot Challenges */}
        <button
          onClick={() => {
            Sound.playClick();
            onOpenChallenges();
          }}
          data-testid="menu-challenges-btn"
          className="p-3 bg-[#24170f]/95 hover:bg-[#322015] border border-[#52331c] rounded-2xl flex items-center gap-3 text-left transition active:scale-95 group shadow-md"
        >
          <div className="p-2.5 rounded-xl bg-[#3d2414] text-[#a855f7] border border-[#7e22ce]/40 group-hover:scale-105 transition flex-shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-kalam font-bold text-base text-[#f3f4f6] leading-tight truncate">
              Challenges
            </h3>
            <p className="text-[10px] text-[#9ca3af] leading-tight mt-0.5 truncate">
              Trick Shots & Missions
            </p>
          </div>
        </button>
      </div>

      {/* Secondary Action Bar: Pen Locker, Table Selection, Practice */}
      <div className="w-full max-w-lg grid grid-cols-3 gap-2 mt-1.5">
        <button
          onClick={() => {
            Sound.playClick();
            onOpenLocker();
          }}
          data-testid="menu-locker-btn"
          className="py-2.5 px-2 bg-[#2c1a0e] hover:bg-[#3d2414] border border-[#6b4226] rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-[#f5c518] shadow transition active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-[#ffd700] flex-shrink-0" />
          <span className="truncate">Pen Locker</span>
        </button>

        <button
          onClick={() => {
            Sound.playClick();
            onOpenArenas();
          }}
          data-testid="menu-table-selection-btn"
          className="py-2.5 px-2 bg-[#2c1a0e] hover:bg-[#3d2414] border border-[#6b4226] rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-[#e0a96d] shadow transition active:scale-95"
        >
          <Layout className="w-4 h-4 text-[#d48c46] flex-shrink-0" />
          <span className="truncate">Table Selection</span>
        </button>

        <button
          onClick={() => {
            Sound.playClick();
            onStartPractice();
          }}
          data-testid="menu-practice-btn"
          className="py-2.5 px-2 bg-[#2c1a0e] hover:bg-[#3d2414] border border-[#6b4226] rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-[#6ee7b7] shadow transition active:scale-95"
        >
          <BookOpen className="w-4 h-4 text-[#34d399] flex-shrink-0" />
          <span className="truncate">Practice</span>
        </button>
      </div>

      {/* Bottom Utility Actions: How to Play, Settings, Account & Cloud Save */}
      <div className="w-full max-w-lg grid grid-cols-3 gap-2 mt-2">
        <button
          type="button"
          onClick={() => {
            Sound.playClick();
            onOpenHowTo();
          }}
          data-testid="menu-howto-btn"
          className="py-2 px-2 bg-[#1c120a]/90 hover:bg-[#2a1a0e] border border-[#4a2b16] rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-[#f5d061] transition"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#f5c518] flex-shrink-0" />
          <span className="truncate">How to Play</span>
        </button>

        <button
          type="button"
          onClick={() => {
            Sound.playClick();
            onOpenSettings?.();
          }}
          data-testid="menu-settings-btn"
          className="py-2 px-2 bg-[#1c120a]/90 hover:bg-[#2a1a0e] border border-[#4a2b16] rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-[#f5d061] transition"
        >
          <Settings className="w-3.5 h-3.5 text-[#f5c518] flex-shrink-0" />
          <span className="truncate">Settings</span>
        </button>

        <button
          type="button"
          onClick={() => {
            Sound.playClick();
            onOpenAccount?.();
          }}
          data-testid="menu-account-btn"
          className="py-2 px-2 bg-[#1c120a]/90 hover:bg-[#2a1a0e] border border-[#4a2b16] rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-[#f5d061] transition"
        >
          <Cloud className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span className="truncate">{user ? 'Cloud Account' : 'Account & Cloud'}</span>
        </button>
      </div>
    </div>
  );
};
