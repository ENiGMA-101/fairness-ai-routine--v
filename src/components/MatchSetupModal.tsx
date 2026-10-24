import React, { useState } from 'react';
import {
  X,
  Play,
  User,
  Bot,
  AlertCircle,
  CheckCircle2,
  Shield,
  Sparkles,
  ArrowRight,
  Edit3,
} from 'lucide-react';
import { PlayerConfig } from '../types/game';
import { SKINS_DATA, getSkin, DEFAULT_PEN_ID } from '../game/skins';
import { BOT_ROSTER } from '../game/bots';
import { Sound } from '../game/audio';
import { MatchFormat } from '../game/seriesState';
import {
  MAX_PLAYER_NAME_LENGTH,
  validateMatchRoster,
  validatePlayerName,
} from '../game/playerValidation';
import { getTableConfig } from '../game/tableConfig';

interface MatchSetupModalProps {
  mode: 'quick' | 'pass_and_play' | 'ai_battle';
  onClose: () => void;
  onStart: (players: PlayerConfig[], format?: MatchFormat) => void;
  defaultSkinId: string;
  defaultPlayerName?: string;
  selectedTableId?: string;
}

export const MatchSetupModal: React.FC<MatchSetupModalProps> = ({
  mode,
  onClose,
  onStart,
  defaultSkinId,
  defaultPlayerName,
  selectedTableId = 'school_bench',
}) => {
  const isFriendly = mode === 'pass_and_play';
  const [playerCount, setPlayerCount] = useState<2 | 3>(2);
  const [format, setFormat] = useState<MatchFormat>('single');
  const [touched, setTouched] = useState<Record<number, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showSummaryStep, setShowSummaryStep] = useState(false);

  const [players, setPlayers] = useState<PlayerConfig[]>([
    {
      id: 'player_1',
      name: isFriendly ? '' : defaultPlayerName || 'Player 1',
      skinId: defaultSkinId || DEFAULT_PEN_ID,
      isBot: false,
    },
    {
      id: 'player_2',
      name: mode === 'ai_battle' ? BOT_ROSTER[0].name : '',
      skinId: mode === 'ai_battle' ? BOT_ROSTER[0].defaultSkinId : 'matador_alltime',
      isBot: mode === 'ai_battle',
      botPersonalityId: mode === 'ai_battle' ? BOT_ROSTER[0].id : undefined,
    },
    {
      id: 'player_3',
      name: mode === 'ai_battle' ? BOT_ROSTER[2].name : '',
      skinId: mode === 'ai_battle' ? BOT_ROSTER[2].defaultSkinId : 'matador_iteen',
      isBot: mode === 'ai_battle',
      botPersonalityId: mode === 'ai_battle' ? BOT_ROSTER[2].id : undefined,
    },
  ]);

  const activeTable = getTableConfig(selectedTableId);
  const validation = validateMatchRoster(players, playerCount);

  const updatePlayer = (idx: number, updates: Partial<PlayerConfig>) => {
    setPlayers((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...updates };
      return next;
    });
  };

  const handleSelectBotRoster = (playerIdx: number, botId: string) => {
    const personality = BOT_ROSTER.find((b) => b.id === botId);
    if (!personality) return;
    Sound.playClick();
    updatePlayer(playerIdx, {
      name: personality.name,
      skinId: personality.defaultSkinId,
      isBot: true,
      botPersonalityId: personality.id,
    });
  };

  const handleReviewOrStart = () => {
    Sound.playClick();
    setSubmitAttempted(true);
    if (!validation.valid) {
      return;
    }
    if (isFriendly && !showSummaryStep) {
      setShowSummaryStep(true);
      return;
    }
    onStart(validation.normalizedPlayers, playerCount === 3 ? 'single' : format);
  };

  const handleConfirmStart = () => {
    Sound.playClick();
    if (!validation.valid) return;
    onStart(validation.normalizedPlayers, playerCount === 3 ? 'single' : format);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      data-testid="match-setup-modal"
    >
      <div className="w-full max-w-xl bg-[#1c120a] border-2 border-[#5a361c] rounded-2xl p-4 sm:p-5 shadow-2xl max-h-[92vh] overflow-y-auto text-[#f3f4f6]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3d2313] pb-3 mb-4">
          <div>
            <h2 className="font-kalam font-bold text-2xl text-[#f5d061]">
              {isFriendly ? (
                <>
                  Friendly Match Setup{' '}
                  <span className="font-bangla text-lg text-[#d8536b] font-normal">
                    (বন্ধুদের সাথে)
                  </span>
                </>
              ) : mode === 'ai_battle' ? (
                <>
                  AI Battle Match{' '}
                  <span className="font-bangla text-lg text-[#d8536b] font-normal">
                    (বটদের সাথে)
                  </span>
                </>
              ) : (
                <>
                  Match Setup{' '}
                  <span className="font-bangla text-lg text-[#d8536b] font-normal">
                    (ম্যাচ প্রস্তুতি)
                  </span>
                </>
              )}
            </h2>
            <p className="text-xs text-[#9ca3af]">
              {isFriendly
                ? 'Enter each player’s name, pick your pens, and choose match format'
                : 'Select your pen, difficulty format, and classroom AI opponents'}
            </p>
          </div>
          <button
            onClick={() => {
              Sound.playClick();
              onClose();
            }}
            aria-label="Close setup modal"
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 2: Dedicated Match Summary View for Friendly Match */}
        {showSummaryStep ? (
          <div className="space-y-4 animate-fade-in" data-testid="friendly-match-summary">
            <div className="bg-[#24150b] border border-[#5a361c] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#3d2313] pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#f5c518] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Match Summary • ম্যাচের সারসংক্ষেপ</span>
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#3b2514] text-[#f5d061] border border-[#d4af37]/40">
                  {playerCount === 3 || format === 'single' ? 'Single Match' : 'Best of 5 Series'}
                </span>
              </div>

              {/* Participants List */}
              <div className="space-y-2">
                {validation.normalizedPlayers.map((p, idx) => {
                  const skin = getSkin(p.skinId);
                  return (
                    <div
                      key={p.id}
                      data-testid={`summary-player-${idx + 1}`}
                      className="flex items-center justify-between bg-[#160d07] border border-[#3d2313] rounded-xl p-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow flex-shrink-0"
                          style={{ backgroundColor: skin.ui }}
                        >
                          P{idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="font-kalam font-bold text-base text-white truncate">
                            {p.name}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {p.isBot ? 'AI Opponent' : `Human Player ${idx + 1}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-bold text-[#f5c518] block">
                          {skin.name}
                        </span>
                        <span className="text-[10px] text-gray-400 capitalize">{skin.rarity}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Arena & Rules Note */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="bg-[#160d07] border border-[#38200f] rounded-xl p-2.5">
                  <span className="text-[10px] text-gray-400 block">Selected Table</span>
                  <span className="font-bold text-white">{activeTable.name}</span>
                </div>
                <div className="bg-[#160d07] border border-[#38200f] rounded-xl p-2.5">
                  <span className="text-[10px] text-gray-400 block">Start Mode</span>
                  <span className="font-bold text-emerald-400">Secret Private Placement</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  Sound.playClick();
                  setShowSummaryStep(false);
                }}
                data-testid="edit-match-setup-btn"
                className="px-4 py-3 bg-[#2a170d] hover:bg-[#3d2313] text-gray-200 font-kalam font-bold text-base rounded-xl border border-[#4d2b17] flex items-center gap-1.5 transition"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Setup</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmStart}
                data-testid="confirm-start-match-btn"
                className="flex-1 py-3 bg-gradient-to-r from-[#22c55e] to-[#15803d] text-white font-kalam font-extrabold text-lg rounded-xl shadow-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Begin Private Pen Placement</span>
              </button>
            </div>
          </div>
        ) : (
          /* STEP 1: Setup Form */
          <>
            {/* Player Count & Match Format Segments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {/* Player Count */}
              <div className="flex items-center justify-between bg-[#2a170d] p-2 rounded-xl border border-[#4d2b17]">
                <span className="text-xs font-bold text-[#e5e7eb] pl-1">Players</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    data-testid="player-count-2-btn"
                    onClick={() => {
                      Sound.playClick();
                      setPlayerCount(2);
                    }}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      playerCount === 2
                        ? 'bg-[#d4af37] text-black shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    2 Players
                  </button>
                  <button
                    type="button"
                    data-testid="player-count-3-btn"
                    onClick={() => {
                      Sound.playClick();
                      setPlayerCount(3);
                      if (format === 'bo5') setFormat('single');
                    }}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      playerCount === 3
                        ? 'bg-[#d4af37] text-black shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    3 Players
                  </button>
                </div>
              </div>

              {/* Match Format Toggle */}
              <div className="flex items-center justify-between bg-[#2a170d] p-2 rounded-xl border border-[#4d2b17]">
                <span className="text-xs font-bold text-[#e5e7eb] pl-1">Format</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    data-testid="format-single-btn"
                    onClick={() => {
                      Sound.playClick();
                      setFormat('single');
                    }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                      format === 'single'
                        ? 'bg-[#d4af37] text-black shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Single Match
                  </button>
                  <button
                    type="button"
                    data-testid="format-bo5-btn"
                    disabled={playerCount === 3}
                    onClick={() => {
                      Sound.playClick();
                      setFormat('bo5');
                    }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                      format === 'bo5'
                        ? 'bg-[#d4af37] text-black shadow'
                        : playerCount === 3
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Best of 5
                  </button>
                </div>
              </div>
            </div>

            {/* Players Cards */}
            <div className="space-y-3 mb-4">
              {players.slice(0, playerCount).map((p, idx) => {
                const currentSkin = getSkin(p.skinId);
                const fieldError = validation.errors[idx];
                const showError = (touched[idx] || submitAttempted) && !p.isBot && !!fieldError;

                return (
                  <div
                    key={p.id}
                    data-testid={`player-setup-card-${idx + 1}`}
                    className={`bg-[#24150b] border rounded-xl p-3 shadow-inner transition ${
                      showError ? 'border-red-500/80' : 'border-[#422614]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <label
                          htmlFor={`player-name-input-${idx + 1}`}
                          className="text-[11px] font-bold uppercase tracking-wider text-[#d4af37] block mb-1"
                        >
                          {p.isBot
                            ? `Opponent ${idx} (AI Bot)`
                            : `Player ${idx + 1} Name (Max ${MAX_PLAYER_NAME_LENGTH} chars)`}
                        </label>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full shadow flex-shrink-0"
                            style={{ backgroundColor: currentSkin.ui }}
                          />
                          {p.isBot ? (
                            <span className="font-kalam font-bold text-lg text-white px-1 py-0.5">
                              {p.name}
                            </span>
                          ) : (
                            <input
                              id={`player-name-input-${idx + 1}`}
                              data-testid={`player-name-input-${idx + 1}`}
                              type="text"
                              value={p.name}
                              placeholder={`Enter Player ${idx + 1}’s name...`}
                              maxLength={24}
                              onBlur={() => setTouched((prev) => ({ ...prev, [idx]: true }))}
                              onChange={(e) => {
                                setTouched((prev) => ({ ...prev, [idx]: true }));
                                updatePlayer(idx, { name: e.target.value });
                              }}
                              className={`bg-[#150c06] border rounded-lg font-kalam font-bold text-base text-white px-2.5 py-1.5 outline-none flex-1 w-full transition ${
                                showError
                                  ? 'border-red-500 focus:border-red-400'
                                  : 'border-[#5a361c] focus:border-[#d4af37]'
                              }`}
                            />
                          )}
                        </div>
                        {/* Inline Validation Error */}
                        {showError && (
                          <div
                            data-testid={`player-name-error-${idx + 1}`}
                            className="flex items-center gap-1.5 text-red-400 text-[11px] font-semibold mt-1.5"
                          >
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{fieldError}</span>
                          </div>
                        )}
                      </div>

                      {/* Human / Bot toggle (only shown in non-AI-only slots or when customizing) */}
                      {mode !== 'ai_battle' || idx > 0 ? (
                        <div className="flex gap-1 bg-[#150c06] p-1 rounded-lg border border-[#3d2313] self-start sm:self-center">
                          {mode !== 'ai_battle' && (
                            <button
                              type="button"
                              onClick={() =>
                                updatePlayer(idx, {
                                  isBot: false,
                                  name: p.isBot ? '' : p.name,
                                })
                              }
                              className={`flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded ${
                                !p.isBot
                                  ? 'bg-[#3b82f6] text-white shadow'
                                  : 'text-gray-500 hover:text-gray-300'
                              }`}
                            >
                              <User className="w-3 h-3" />
                              <span>Human</span>
                            </button>
                          )}
                          {!isFriendly && (
                            <button
                              type="button"
                              onClick={() => {
                                const bot = BOT_ROSTER[idx % BOT_ROSTER.length];
                                updatePlayer(idx, {
                                  isBot: true,
                                  name: bot.name,
                                  skinId: bot.defaultSkinId,
                                  botPersonalityId: bot.id,
                                });
                              }}
                              className={`flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded ${
                                p.isBot
                                  ? 'bg-[#ec4899] text-white shadow'
                                  : 'text-gray-500 hover:text-gray-300'
                              }`}
                            >
                              <Bot className="w-3 h-3" />
                              <span>Bot</span>
                            </button>
                          )}
                        </div>
                      ) : null}
                    </div>

                    {/* If bot, show quick personality selector */}
                    {p.isBot && (
                      <div className="mb-2 p-2 bg-[#180e07] rounded-lg border border-amber-950/40">
                        <span className="text-[10px] font-bold text-gray-400 block mb-1">
                          Choose Opponent Personality ({BOT_ROSTER.find((b) => b.id === p.botPersonalityId)?.skill || 'normal'}):
                        </span>
                        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                          {BOT_ROSTER.map((bot) => {
                            const isChosen = p.botPersonalityId === bot.id;
                            return (
                              <button
                                type="button"
                                key={bot.id}
                                onClick={() => handleSelectBotRoster(idx, bot.id)}
                                className={`flex-shrink-0 px-2 py-1 rounded-lg border flex items-center gap-1.5 transition ${
                                  isChosen
                                    ? 'border-[#f5c518] bg-[#3d2511] text-[#f5c518] shadow'
                                    : 'border-[#38200f] bg-[#120a05] text-gray-400 hover:text-white'
                                }`}
                              >
                                <span>{bot.avatar}</span>
                                <span className="font-semibold">{bot.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Skin Selector Row */}
                    <div className="mt-2">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                        Pen: <span className="text-[#f5d061]">{currentSkin.name}</span>{' '}
                        {currentSkin.isAuthentic && '(Matador BD)'}
                      </span>
                      <div className="flex gap-1.5 overflow-x-auto pb-1.5">
                        {SKINS_DATA.map((skin) => {
                          const isTaken = players
                            .slice(0, playerCount)
                            .some((other, j) => j !== idx && other.skinId === skin.id);
                          const isSelected = p.skinId === skin.id;

                          return (
                            <button
                              type="button"
                              key={skin.id}
                              disabled={isTaken}
                              onClick={() => {
                                Sound.playClick();
                                updatePlayer(idx, { skinId: skin.id });
                              }}
                              className={`flex-shrink-0 px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition ${
                                isSelected
                                  ? 'border-[#d4af37] bg-[#3d2716] text-[#f5d061] shadow'
                                  : isTaken
                                  ? 'opacity-30 border-transparent bg-black/20 text-gray-600 cursor-not-allowed'
                                  : 'border-[#3d2313] bg-[#1a0e06] text-gray-300 hover:border-gray-500'
                              }`}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: skin.ui }}
                              />
                              <span>{skin.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Match Summary Preview Box */}
            <div
              data-testid="setup-live-summary"
              className="mb-4 bg-[#140b06] border border-[#3d2313] rounded-xl p-3 text-xs flex flex-wrap items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#f5c518] flex-shrink-0" />
                <div>
                  <span className="font-bold text-[#f5d061]">
                    {playerCount}-Player {isFriendly ? 'Pass & Play' : 'Battle'} &bull;{' '}
                    {playerCount === 3 || format === 'single' ? 'Single Match' : 'Best of 5'}
                  </span>
                  <span className="text-[11px] text-gray-400 block">
                    Table: {activeTable.name} ({activeTable.baseWidth}&times;{activeTable.baseHeight})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                {validation.normalizedPlayers.map((p, i) => (
                  <span
                    key={p.id}
                    className="px-2 py-0.5 rounded-full bg-[#24150b] border border-[#4a2b16] text-gray-200 font-semibold truncate max-w-[100px]"
                  >
                    {p.name || `P${i + 1}?`}
                  </span>
                ))}
              </div>
            </div>

            {/* Start / Review Game Action */}
            <button
              type="button"
              data-testid="start-match-setup-btn"
              onClick={handleReviewOrStart}
              className="w-full py-3.5 bg-gradient-to-r from-[#d4af37] via-[#f5d061] to-[#d4af37] text-black font-kalam font-extrabold text-xl rounded-xl shadow-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition"
            >
              {isFriendly ? (
                <>
                  <span>Review Match Summary</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>START THE FIGHT (যুদ্ধ শুরু)</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
