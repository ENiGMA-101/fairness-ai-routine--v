import React, { useState } from 'react';
import {
  X,
  Trophy,
  History,
  Award,
  Flame,
  Swords,
  CheckCircle2,
  Coins,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { PlayerProgress } from '../types/game';
import {
  ACHIEVEMENTS_CATALOG,
  evaluateUnlockedAchievements,
  LocalMatchHistoryItem,
} from '../game/storage';
import { Sound } from '../game/audio';

interface StatsAndHistoryModalProps {
  progress: PlayerProgress;
  matchHistory: LocalMatchHistoryItem[];
  onClaimDailyReward?: () => void;
  onClose: () => void;
}

export const StatsAndHistoryModal: React.FC<StatsAndHistoryModalProps> = ({
  progress,
  matchHistory,
  onClaimDailyReward,
  onClose,
}) => {
  const [tab, setTab] = useState<'stats' | 'history' | 'achievements'>('stats');
  const unlockedKeys = new Set(evaluateUnlockedAchievements(progress));

  const todayStr = new Date().toISOString().slice(0, 10);
  const dailyClaimedToday = progress.lastDailyDate === todayStr;

  const winRate =
    progress.matchesPlayed > 0
      ? Math.round((progress.matchesWon / progress.matchesPlayed) * 100)
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in"
      data-testid="stats-history-modal"
    >
      <div className="w-full max-w-2xl bg-[#1a110a] border-2 border-[#543319] rounded-2xl p-5 shadow-2xl text-[#f3f4f6] max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3d2313] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-[#f5c518]" />
            <div>
              <h2 className="font-kalam font-bold text-2xl text-[#f5d061] leading-none">
                Career Stats, History & Achievements
              </h2>
              <p className="text-xs text-gray-400">
                Track your classroom battles, match records, and milestones
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              Sound.playClick();
              onClose();
            }}
            aria-label="Close stats modal"
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1.5 bg-[#120a05] p-1 rounded-xl border border-[#3b2010] mb-4 text-xs">
          <button
            type="button"
            onClick={() => {
              Sound.playClick();
              setTab('stats');
            }}
            className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
              tab === 'stats'
                ? 'bg-[#d4af37] text-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Overview & Daily</span>
          </button>
          <button
            type="button"
            data-testid="tab-match-history"
            onClick={() => {
              Sound.playClick();
              setTab('history');
            }}
            className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
              tab === 'history'
                ? 'bg-[#d4af37] text-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Match History ({matchHistory.length})</span>
          </button>
          <button
            type="button"
            data-testid="tab-achievements"
            onClick={() => {
              Sound.playClick();
              setTab('achievements');
            }}
            className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
              tab === 'achievements'
                ? 'bg-[#d4af37] text-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>
              Achievements ({unlockedKeys.size}/{ACHIEVEMENTS_CATALOG.length})
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-3">
          {tab === 'stats' && (
            <>
              {/* Daily Attendance Bonus Card */}
              <div className="p-4 bg-gradient-to-r from-[#2c190c] to-[#1a0f07] border border-[#d4af37]/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#3d2511] border border-[#d4af37]/40 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-kalam font-bold text-lg text-[#f5d061] leading-none">
                        Daily Classroom Roll-Call Bonus
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/30">
                        <Flame className="w-3 h-3 inline mr-0.5" />
                        {progress.dailyStreak || 0} Day Streak
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1">
                      Claim +60 Coins & +50 XP every day you step up to the School Bench!
                    </p>
                  </div>
                </div>

                {onClaimDailyReward && (
                  <button
                    type="button"
                    disabled={dailyClaimedToday}
                    onClick={() => {
                      Sound.playClick();
                      onClaimDailyReward();
                    }}
                    data-testid="claim-daily-btn"
                    className={`px-4 py-2.5 rounded-xl font-kalam font-bold text-sm flex items-center justify-center gap-1.5 transition flex-shrink-0 ${
                      dailyClaimedToday
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 cursor-default'
                        : 'bg-gradient-to-r from-[#d4af37] to-[#f5d061] text-black hover:brightness-110 active:scale-95 shadow-lg'
                    }`}
                  >
                    {dailyClaimedToday ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Claimed Today</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Claim +60 🪙</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Career Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="bg-[#24150b] border border-[#422614] rounded-xl p-3">
                  <span className="text-[11px] text-gray-400 block">Matches Completed</span>
                  <span className="font-outfit font-extrabold text-2xl text-white">
                    {progress.matchesPlayed}
                  </span>
                </div>
                <div className="bg-[#24150b] border border-[#422614] rounded-xl p-3">
                  <span className="text-[11px] text-gray-400 block">Matches Won</span>
                  <span className="font-outfit font-extrabold text-2xl text-emerald-400">
                    {progress.matchesWon} ({winRate}%)
                  </span>
                </div>
                <div className="bg-[#24150b] border border-[#422614] rounded-xl p-3">
                  <span className="text-[11px] text-gray-400 block">Total Knockouts</span>
                  <span className="font-outfit font-extrabold text-2xl text-amber-400">
                    {progress.knockoutsCount}
                  </span>
                </div>
                <div className="bg-[#24150b] border border-[#422614] rounded-xl p-3">
                  <span className="text-[11px] text-gray-400 block">Championship Cups</span>
                  <span className="font-outfit font-extrabold text-2xl text-[#ffd700]">
                    🏆 {progress.championshipTrophies}
                  </span>
                </div>
                <div className="bg-[#24150b] border border-[#422614] rounded-xl p-3">
                  <span className="text-[11px] text-gray-400 block">Pens Unlocked</span>
                  <span className="font-outfit font-extrabold text-2xl text-cyan-300">
                    {progress.unlockedSkins.length} / 19
                  </span>
                </div>
                <div className="bg-[#24150b] border border-[#422614] rounded-xl p-3">
                  <span className="text-[11px] text-gray-400 block">Challenges Cleared</span>
                  <span className="font-outfit font-extrabold text-2xl text-purple-300">
                    {progress.completedChallenges.length} / 6
                  </span>
                </div>
              </div>
            </>
          )}

          {tab === 'history' && (
            <div className="space-y-2" data-testid="match-history-list">
              {matchHistory.length === 0 ? (
                <div className="p-8 text-center bg-[#24150b] border border-[#422614] rounded-2xl text-gray-400 text-xs">
                  <Swords className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                  <p className="font-bold text-sm text-gray-300">No completed matches yet</p>
                  <p className="mt-1">
                    Finish a Quick Match, Friendly Match, or AI Battle to record your match history!
                  </p>
                </div>
              ) : (
                matchHistory.map((m) => (
                  <div
                    key={m.idempotencyKey || m.id}
                    className="p-3 bg-[#24150b] border border-[#422614] rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`px-2.5 py-1 rounded-lg font-extrabold uppercase text-[10px] flex-shrink-0 ${
                          m.result === 'win'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : m.result === 'draw'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                            : 'bg-red-950 text-red-300 border border-red-500/40'
                        }`}
                      >
                        {m.result}
                      </span>
                      <div className="min-w-0">
                        <div className="font-kalam font-bold text-base text-white truncate">
                          vs {m.opponentName}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          Mode: <span className="capitalize">{m.matchMode.replace(/_/g, ' ')}</span>{' '}
                          &bull; {m.shotsTaken} shots &bull; {m.knockouts} KOs
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-amber-400 flex items-center justify-end gap-1">
                        <Coins className="w-3 h-3" />
                        <span>+{m.coinsAwarded}</span>
                        <span className="text-purple-300 ml-1">+{m.xpAwarded} XP</span>
                      </div>
                      <span className="text-[10px] text-gray-500 block mt-0.5">
                        {new Date(m.playedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'achievements' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" data-testid="achievements-list">
              {ACHIEVEMENTS_CATALOG.map((ach) => {
                const isEarned = unlockedKeys.has(ach.key);
                return (
                  <div
                    key={ach.key}
                    className={`p-3 rounded-xl border flex items-start gap-3 transition ${
                      isEarned
                        ? 'bg-[#2c1b0e] border-[#f5c518] shadow-md'
                        : 'bg-[#160d07] border-[#38200f] opacity-65'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#1f1209] border border-[#4a2b16] flex items-center justify-center text-xl flex-shrink-0">
                      {ach.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-kalam font-bold text-base text-white truncate">
                          {ach.title}
                        </h4>
                        {isEarned && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        )}
                      </div>
                      <span className="font-bangla text-[11px] text-[#d8536b] block">
                        {ach.banglaTitle}
                      </span>
                      <p className="text-[11px] text-gray-300 mt-1 leading-snug">{ach.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
