import React from 'react';
import {
  Volume2,
  VolumeX,
  Settings,
  Award,
  Cloud,
  CloudOff,
  RefreshCw,
  AlertTriangle,
  User,
  Home,
  HelpCircle,
} from 'lucide-react';
import { PlayerProgress, GameSettings } from '../types/game';
import { calculateLevel, xpForNextLevel } from '../game/storage';
import { formatSyncStatusLabel, SyncStatus } from '../game/cloudSync';
import { AuthenticatedUser } from './AccountModal';

interface HeaderNavProps {
  progress: PlayerProgress;
  settings: GameSettings;
  inGame?: boolean;
  sidebarOffset?: boolean;
  user?: AuthenticatedUser | null;
  syncStatus?: SyncStatus;
  onToggleSound?: () => void;
  onUpdateSettings?: (newSettings: GameSettings) => void;
  onOpenSettings: () => void;
  onOpenHowTo?: () => void;
  onOpenLocker?: () => void;
  onOpenAccount?: () => void;
  onOpenStats?: () => void;
  onGoHome?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  progress,
  settings,
  inGame = false,
  sidebarOffset = false,
  user = null,
  syncStatus = 'offline',
  onToggleSound,
  onUpdateSettings,
  onOpenSettings,
  onOpenHowTo,
  onOpenLocker,
  onOpenAccount,
  onOpenStats,
  onGoHome,
}) => {
  const level = calculateLevel(progress.xp);
  const nextLvlXp = xpForNextLevel(level);
  const prevLvlXp = xpForNextLevel(level - 1);
  const xpPercent = Math.min(
    100,
    Math.max(0, Math.round(((progress.xp - prevLvlXp) / Math.max(1, nextLvlXp - prevLvlXp)) * 100))
  );

  const toggleSound = () => {
    if (onToggleSound) {
      onToggleSound();
    } else if (onUpdateSettings) {
      onUpdateSettings({ ...settings, sound: !settings.sound });
    }
  };

  const syncLabel = formatSyncStatusLabel(syncStatus);

  return (
    <header
      data-testid="header-nav"
      className={`fixed top-0 right-0 z-30 h-11 px-2.5 sm:px-4 flex items-center justify-between bg-[#18120d]/90 backdrop-blur-md border-b border-[#3d2719] text-[#e7ebf3] select-none ${
        sidebarOffset ? 'left-[280px]' : 'left-0'
      }`}
    >
      {/* Left: Home Button (in-game) + Player Level, XP Bar & Coins */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        {inGame && onGoHome && (
          <button
            type="button"
            onClick={onGoHome}
            data-testid="header-home-btn"
            aria-label="Leave Match"
            title="Leave Match"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#2b180d] hover:bg-red-950/80 border border-[#52321c] hover:border-red-500/50 rounded-lg text-xs font-bold text-amber-200 hover:text-red-200 transition active:scale-95 flex-shrink-0"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Menu</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onOpenLocker?.()}
          aria-label="Open Pen Locker"
          className="flex items-center gap-1.5 px-2 py-1 bg-[#2b180d] hover:bg-[#3d2212] border border-[#d4af37]/40 rounded-full transition-all active:scale-95 text-left flex-shrink-0"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8c6d1f] flex items-center justify-center font-outfit font-extrabold text-[11px] text-[#1a0e05] shadow-inner">
            {level}
          </div>
          <div className="flex flex-col pr-1">
            <span className="text-[10px] font-bold text-[#f5c518] leading-tight">LVL {level}</span>
            <div className="w-12 sm:w-16 h-1.5 bg-[#140b05] rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#e0559a] to-[#ffd700] rounded-full transition-all duration-300"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </button>

        {/* Coins Badge */}
        <button
          type="button"
          onClick={() => onOpenLocker?.()}
          className="cursor-pointer flex items-center gap-1 px-2.5 py-1 bg-[#25150a] border border-[#d4af37]/30 rounded-full text-xs font-bold font-outfit text-[#f5d061] shadow-sm hover:border-[#d4af37] transition flex-shrink-0"
        >
          <span className="text-xs">🪙</span>
          <span>{progress.coins.toLocaleString()}</span>
        </button>

        {/* Save / Cloud Status Pill */}
        {onOpenAccount && (
          <button
            type="button"
            onClick={onOpenAccount}
            data-testid="header-sync-status-btn"
            title={syncLabel}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
              syncStatus === 'saved'
                ? 'bg-emerald-950/75 text-emerald-300 border-emerald-500/40'
                : syncStatus === 'syncing'
                ? 'bg-blue-950/75 text-blue-300 border-blue-500/40'
                : syncStatus === 'error'
                ? 'bg-red-950/75 text-red-300 border-red-500/50'
                : 'bg-[#24160c] text-[#c7b6a6] border-[#4a2d18]'
            }`}
          >
            {syncStatus === 'saved' ? (
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            ) : syncStatus === 'syncing' ? (
              <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
            ) : syncStatus === 'error' ? (
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <CloudOff className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="truncate max-w-[165px]">{syncLabel}</span>
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Account / Cloud Save Button */}
        {onOpenAccount && (
          <button
            type="button"
            onClick={onOpenAccount}
            data-testid="header-account-btn"
            aria-label="Account and Cloud Save"
            title="Account & Cloud Save"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#2b180d] hover:bg-[#3d2212] text-[#f5d061] text-xs font-bold rounded-lg border border-[#52321c] transition active:scale-95"
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline truncate max-w-[90px]">
              {user ? user.displayName : 'Account'}
            </span>
          </button>
        )}

        {/* Career Stats & Achievements */}
        {onOpenStats && (
          <button
            type="button"
            onClick={onOpenStats}
            data-testid="header-stats-btn"
            aria-label="Career Stats and Match History"
            title="Stats, History & Achievements"
            className="p-1.5 rounded-lg bg-[#2b180d] hover:bg-[#3d2212] text-[#f5c518] border border-[#52321c] transition active:scale-95"
          >
            <Award className="w-4 h-4" />
          </button>
        )}

        {/* How To Play */}
        {onOpenHowTo && (
          <button
            type="button"
            onClick={onOpenHowTo}
            data-testid="header-howto-btn"
            aria-label="How to Play"
            title="How to Play"
            className="p-1.5 rounded-lg bg-[#2b180d] hover:bg-[#3d2212] text-amber-300 border border-[#52321c] transition active:scale-95"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}

        {/* Sound toggle */}
        <button
          type="button"
          onClick={toggleSound}
          aria-label={settings.sound ? 'Mute sound' : 'Unmute sound'}
          className="p-1.5 rounded-lg bg-[#2b180d] hover:bg-[#3d2212] text-[#f5d061] border border-[#52321c] transition active:scale-95"
        >
          {settings.sound ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4 text-red-400" />
          )}
        </button>

        {/* Settings button */}
        <button
          type="button"
          onClick={onOpenSettings}
          data-testid="header-settings-btn"
          aria-label="Open settings"
          className="p-1.5 rounded-lg bg-[#2b180d] hover:bg-[#3d2212] text-[#e7ebf3] border border-[#52321c] transition active:scale-95"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
