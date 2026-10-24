import React, { useState, useEffect, useRef, useCallback } from 'react';
import Matter from 'matter-js';
import {
  AttackSideIndex,
  ChallengeItem,
  GameMode,
  GamePhase,
  GameSettings,
  InGamePlayer,
  PlayerConfig,
  PlayerProgress,
  TournamentMatch,
} from './types/game';
import {
  ATTACK_SIDES,
  BASE_DENSITY,
  BASE_RESTITUTION,
  PEN_LENGTH,
  PEN_WIDTH,
  SUB_DT,
} from './game/constants';
import { getSkin, DEFAULT_PEN_ID } from './game/skins';
import { getArena } from './game/arenas';
import { getBotPersonality, getRandomBot } from './game/bots';
import {
  loadProgress,
  saveProgress,
  loadSettings,
  saveSettings,
  loadSaveMetadata,
  saveSaveMetadata,
  loadLocalMatchHistory,
  appendLocalMatchHistory,
  calculateLevel,
  LocalMatchHistoryItem,
} from './game/storage';
import {
  angDiff,
  applyLaunch,
  clamp,
  contactPoint,
  isOffDesk,
  resolveCustomStrike,
  simulateTrajectory,
  stepBodyDynamics,
} from './game/physics';
import { planBotShot } from './game/bot';
import { drawDetailedPen, generateDeskCanvas } from './game/renderer';
import { Sound } from './game/audio';
import {
  getTableConfig,
  resolveTableDimensions,
  getTableSpawnPositions,
} from './game/tableConfig';
import {
  MatchFormat,
  SeriesState,
  createNewSeries,
  commitSeriesMatchResult,
  saveSeriesState,
} from './game/seriesState';
import {
  PenPlacement,
  generateRandomBotPlacement,
  getSuggestedPlacement,
  validatePlacement,
} from './game/placement';
import {
  computeCameraView,
  screenToWorld,
  worldToScreen,
} from './game/layout';
import { disambiguateDisplayNames } from './game/playerValidation';
import {
  buildSaveApiPayload,
  cloudSaveToPlayerProgress,
  ConflictResolutionChoice,
  evaluateSyncComparison,
  mergeLocalAndCloudProgress,
  SaveConflictDetails,
  SyncStatus,
} from './game/cloudSync';
import type { CloudSaveRecord } from './server/db';

// UI Components
import { HeaderNav } from './components/HeaderNav';
import { MainMenu } from './components/MainMenu';
import { GameHUD } from './components/GameHUD';
import { PenPlacementHUD } from './components/PenPlacementHUD';
import { MatchSetupModal } from './components/MatchSetupModal';
import { PenLockerModal } from './components/PenLockerModal';
import { TableSelectionModal } from './components/TableSelectionModal';
import { ChampionshipModal } from './components/ChampionshipModal';
import { ChallengesModal } from './components/ChallengesModal';
import { SettingsModal } from './components/SettingsModal';
import { HowToModal } from './components/HowToModal';
import { MatchOverModal } from './components/MatchOverModal';
import { ExitConfirmModal, PauseModal } from './components/ExitConfirmModal';
import {
  AccountModal,
  AuthenticatedUser,
  ServerConfigState,
} from './components/AccountModal';
import { StatsAndHistoryModal } from './components/StatsAndHistoryModal';

const { Engine, World, Bodies, Body, Events } = Matter;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  decay: number;
  kind?: 'spark' | 'ring';
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export function App() {
  // Persistent State
  const [progress, setProgress] = useState<PlayerProgress>(() => loadProgress());
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [matchHistory, setMatchHistory] = useState<LocalMatchHistoryItem[]>(() =>
    loadLocalMatchHistory()
  );

  // Cloud & Auth State
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [serverConfig, setServerConfig] = useState<ServerConfigState>({
    databaseConfigured: false,
    googleAuthConfigured: false,
    googleClientId: null,
  });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() =>
    typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'saved'
  );
  const [syncError, setSyncError] = useState<string | null>(null);
  const [conflictDetails, setConflictDetails] = useState<SaveConflictDetails | null>(
    null
  );

  // Selected Table Configuration
  const [selectedTableId, setSelectedTableId] = useState<string>('school_bench');
  const [customTableDims, setCustomTableDims] = useState<{
    width: number;
    height: number;
  }>({ width: 1000, height: 620 });

  // Responsive Viewport & Layout State
  const [viewport, setViewport] = useState<{ width: number; height: number }>(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 720,
  }));
  const [sidebarOverride, setSidebarOverride] = useState<
    'auto' | 'sidebar' | 'bottom'
  >('auto');

  // Game Flow State
  const [isInMenu, setIsInMenu] = useState<boolean>(true);
  const [phase, setPhase] = useState<GamePhase>('aim');
  const [gameMode, setGameMode] = useState<GameMode>('quick');
  const [matchFormat, setMatchFormat] = useState<MatchFormat>('single');
  const [seriesState, setSeriesState] = useState<SeriesState | null>(null);
  const [players, setPlayers] = useState<InGamePlayer[]>([]);
  const [turnIndex, setTurnIndex] = useState<number>(0);
  const [power, setPower] = useState<number>(55);
  const [side, setSide] = useState<AttackSideIndex>(1);
  const [bannerMessage, setBannerMessage] = useState<{
    title: string;
    sub?: string;
  } | null>(null);

  // Match End State
  const [matchWinner, setMatchWinner] = useState<InGamePlayer | null>(null);
  const [eliminatedOrder, setEliminatedOrder] = useState<InGamePlayer[]>([]);
  const [lastCoinsAwarded, setLastCoinsAwarded] = useState<number>(0);
  const [lastXpAwarded, setLastXpAwarded] = useState<number>(0);

  // Pen Placement Phase State
  const [placingPlayerIdx, setPlacingPlayerIdx] = useState<number>(0);
  const [placementHandover, setPlacementHandover] = useState<boolean>(false);
  const [placementValid, setPlacementValid] = useState<boolean>(true);
  const [placementInvalidReason, setPlacementInvalidReason] = useState<
    string | undefined
  >(undefined);

  // Active Mode Context
  const [activeChallenge, setActiveChallenge] = useState<ChallengeItem | null>(null);
  const [activeTournamentRound, setActiveTournamentRound] =
    useState<TournamentMatch | null>(null);
  const [lastSetupConfigs, setLastSetupConfigs] = useState<{
    configs: PlayerConfig[];
    mode: GameMode;
    format: MatchFormat;
  } | null>(null);

  // Modals State
  const [activeModal, setActiveModal] = useState<
    | 'none'
    | 'setup_quick'
    | 'setup_pass'
    | 'setup_ai'
    | 'locker'
    | 'arenas'
    | 'championship'
    | 'challenges'
    | 'settings'
    | 'howto'
    | 'account'
    | 'stats'
  >('none');

  // Exit Confirmation & Pause State
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [pendingExitAction, setPendingExitAction] = useState<(() => void) | null>(
    null
  );
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Physics & Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const playersRef = useRef<InGamePlayer[]>([]);
  const isInMenuRef = useRef<boolean>(true);
  const phaseRef = useRef<GamePhase>('aim');
  const turnIndexRef = useRef<number>(0);
  const powerRef = useRef<number>(55);
  const sideRef = useRef<AttackSideIndex>(1);
  const aimAngleRef = useRef<number>(0);
  const settleTimerRef = useRef<number>(0);
  const shotElapsedRef = useRef<number>(0);
  const tableSizeRef = useRef<{ w: number; h: number; frictionAir: number }>({
    w: 1200,
    h: 650,
    frictionAir: 0.036,
  });
  const deskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const floatTextsRef = useRef<FloatingText[]>([]);
  const screenShakeRef = useRef<number>(0);
  const draggingAimRef = useRef<boolean>(false);
  const draggingPlacementRef = useRef<boolean>(false);
  const placingPlayerIdxRef = useRef<number>(0);
  const placementHandoverRef = useRef<boolean>(false);
  const confirmedPlacementsRef = useRef<Map<number, PenPlacement>>(new Map());
  const eliminatedOrderRef = useRef<InGamePlayer[]>([]);
  const matchStartTimeRef = useRef<number>(Date.now());
  const currentMatchInstanceIdRef = useRef<string>('');
  const isPausedRef = useRef<boolean>(false);

  // Session guard for cancelling stale async timers on match exit
  const matchSessionIdRef = useRef<number>(0);
  const activeTimeoutsRef = useRef<number[]>([]);

  const scheduleMatchTimeout = useCallback((fn: () => void, delayMs: number) => {
    const sessionAtSchedule = matchSessionIdRef.current;
    const id = window.setTimeout(() => {
      activeTimeoutsRef.current = activeTimeoutsRef.current.filter((t) => t !== id);
      if (matchSessionIdRef.current !== sessionAtSchedule) return;
      fn();
    }, delayMs);
    activeTimeoutsRef.current.push(id);
    return id;
  }, []);

  const clearAllMatchTimeouts = useCallback(() => {
    for (const id of activeTimeoutsRef.current) {
      window.clearTimeout(id);
    }
    activeTimeoutsRef.current = [];
  }, []);

  // Sync refs with state
  const settingsRef = useRef<GameSettings>(settings);
  const progressRef = useRef<PlayerProgress>(progress);
  const gameModeRef = useRef<GameMode>(gameMode);
  const matchFormatRef = useRef<MatchFormat>(matchFormat);
  const seriesStateRef = useRef<SeriesState | null>(seriesState);
  const activeChallengeRef = useRef<ChallengeItem | null>(activeChallenge);
  const activeTournamentRoundRef = useRef<TournamentMatch | null>(
    activeTournamentRound
  );
  const selectedTableIdRef = useRef<string>(selectedTableId);
  const customTableDimsRef = useRef(customTableDims);
  const sidebarOverrideRef = useRef(sidebarOverride);

  useEffect(() => {
    settingsRef.current = settings;
    Sound.setSoundEnabled(settings.sound);
    Sound.setMusicEnabled(settings.music);
    Sound.setVibrateEnabled(settings.vibrate);
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    gameModeRef.current = gameMode;
  }, [gameMode]);

  useEffect(() => {
    matchFormatRef.current = matchFormat;
  }, [matchFormat]);

  useEffect(() => {
    seriesStateRef.current = seriesState;
  }, [seriesState]);

  useEffect(() => {
    activeChallengeRef.current = activeChallenge;
  }, [activeChallenge]);

  useEffect(() => {
    activeTournamentRoundRef.current = activeTournamentRound;
  }, [activeTournamentRound]);

  useEffect(() => {
    selectedTableIdRef.current = selectedTableId;
  }, [selectedTableId]);

  useEffect(() => {
    customTableDimsRef.current = customTableDims;
  }, [customTableDims]);

  useEffect(() => {
    sidebarOverrideRef.current = sidebarOverride;
  }, [sidebarOverride]);

  useEffect(() => {
    isInMenuRef.current = isInMenu;
  }, [isInMenu]);

  useEffect(() => {
    placingPlayerIdxRef.current = placingPlayerIdx;
  }, [placingPlayerIdx]);

  useEffect(() => {
    placementHandoverRef.current = placementHandover;
  }, [placementHandover]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const updatePhase = (newPhase: GamePhase) => {
    phaseRef.current = newPhase;
    setPhase(newPhase);
  };

  const showBanner = useCallback(
    (title: string, sub?: string, duration = 1800) => {
      setBannerMessage({ title, sub });
      if (duration > 0) {
        window.setTimeout(() => {
          setBannerMessage((prev) => (prev?.title === title ? null : prev));
        }, duration);
      }
    },
    []
  );

  // Viewport resize & orientation listener
  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Online / Offline listener
  useEffect(() => {
    const onOnline = () => {
      setSyncStatus((prev) => (prev === 'offline' ? 'saved' : prev));
    };
    const onOffline = () => {
      setSyncStatus('offline');
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Push progress to Cloud Save when authenticated
  const pushSaveToCloud = useCallback(
    async (
      nextProgress: PlayerProgress,
      nextSettings: GameSettings,
      expectedRevision?: number,
      forceOverwrite = false
    ) => {
      if (!user || !csrfToken) {
        setSyncStatus(navigator.onLine ? 'saved' : 'offline');
        return;
      }
      if (!navigator.onLine) {
        setSyncStatus('offline');
        return;
      }

      setSyncStatus('syncing');
      setSyncError(null);
      try {
        const meta = loadSaveMetadata();
        const payload = buildSaveApiPayload(
          nextProgress,
          nextSettings,
          selectedTableIdRef.current,
          expectedRevision !== undefined
            ? expectedRevision
            : meta.lastSyncedRevision ?? undefined,
          forceOverwrite
        );
        const res = await fetch('/api/save', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.status === 409 && data.cloudSave) {
          setConflictDetails({
            localProgress: nextProgress,
            localRevision: meta.revision,
            localUpdatedAt: meta.updatedAt,
            cloudSave: data.cloudSave as CloudSaveRecord,
          });
          setSyncStatus('error');
          setSyncError('Save conflict detected between this device and cloud.');
          return;
        }
        if (res.ok && data.save) {
          saveSaveMetadata({
            revision: data.save.revision,
            updatedAt: data.save.updatedAt,
            lastSyncedRevision: data.save.revision,
            lastSyncedUserId: user.id,
          });
          setConflictDetails(null);
          setSyncStatus('saved');
        } else {
          setSyncStatus('error');
          setSyncError(data.error || 'Failed to sync cloud save.');
        }
      } catch {
        setSyncStatus('offline');
      }
    },
    [user, csrfToken]
  );

  // Fetch initial session from /api/me
  const refreshCloudSession = useCallback(async () => {
    try {
      const res = await fetch('/api/me');
      if (!res.ok) return;
      const data = await res.json();
      if (data.config) {
        setServerConfig(data.config);
      }
      if (data.authenticated && data.user) {
        setUser(data.user);
        setCsrfToken(data.csrfToken || null);
        const cloudSave = (data.save as CloudSaveRecord | null) || null;
        const meta = loadSaveMetadata();
        const decision = evaluateSyncComparison(
          progressRef.current,
          meta.lastSyncedRevision,
          cloudSave
        );
        if (decision === 'pull_cloud' && cloudSave) {
          const cloudProg = cloudSaveToPlayerProgress(cloudSave);
          setProgress(cloudProg);
          saveProgress(cloudProg, false);
          saveSaveMetadata({
            revision: cloudSave.revision,
            updatedAt: cloudSave.updatedAt,
            lastSyncedRevision: cloudSave.revision,
            lastSyncedUserId: data.user.id,
          });
          setSyncStatus('saved');
        } else if (decision === 'conflict' && cloudSave) {
          setConflictDetails({
            localProgress: progressRef.current,
            localRevision: meta.revision,
            localUpdatedAt: meta.updatedAt,
            cloudSave,
          });
          setSyncStatus('error');
          setSyncError('Cloud save differs from local progress.');
        } else if (decision === 'push_local') {
          setSyncStatus('saved');
        } else {
          setSyncStatus('saved');
        }
      } else {
        setUser(null);
        setCsrfToken(null);
        setSyncStatus(navigator.onLine ? 'saved' : 'offline');
      }
    } catch {
      setSyncStatus(navigator.onLine ? 'saved' : 'offline');
    }
  }, []);

  useEffect(() => {
    refreshCloudSession();
  }, [refreshCloudSession]);

  // Spawn visual particles
  const spawnParticles = (
    x: number,
    y: number,
    color: string,
    count = 16,
    speed = 5,
    includeRing = false
  ) => {
    const actualCount = settingsRef.current.reducedMotion
      ? Math.ceil(count * 0.4)
      : count;
    for (let i = 0; i < actualCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 1 + Math.random() * speed;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        size: 2 + Math.random() * 3.5,
        color,
        life: 1,
        decay: 0.025 + Math.random() * 0.025,
        kind: 'spark',
      });
    }
    if (includeRing && !settingsRef.current.reducedMotion) {
      particlesRef.current.push({
        x,
        y,
        vx: 0,
        vy: 0,
        size: 10,
        color,
        life: 1,
        decay: 0.05,
        kind: 'ring',
      });
    }
  };

  const spawnFloatText = (
    x: number,
    y: number,
    text: string,
    color = '#ffe066'
  ) => {
    floatTextsRef.current.push({ x, y, text, color, life: 1 });
  };

  // Setup Desk Texture for Given Table Config
  const rebuildTableEnvironment = useCallback(
    (tableId: string, customDims?: { width: number; height: number }) => {
      const tableCfg = getTableConfig(
        tableId,
        customDims || customTableDimsRef.current
      );
      const dims = resolveTableDimensions(tableCfg);
      tableSizeRef.current = {
        w: dims.width,
        h: dims.height,
        frictionAir: tableCfg.frictionAir,
      };
      const arena = getArena(settingsRef.current.desk);
      deskCanvasRef.current = generateDeskCanvas(dims.width, dims.height, {
        ...arena,
        theme: tableCfg.theme,
      });
      return {
        tableCfg,
        tw: dims.width,
        th: dims.height,
        frictionAir: tableCfg.frictionAir,
      };
    },
    []
  );

  // Build initial desk on mount
  useEffect(() => {
    rebuildTableEnvironment(selectedTableId);
  }, [rebuildTableEnvironment, selectedTableId]);

  // Build Physics World & Start Match
  const startMatch = useCallback(
    (
      playerConfigs: PlayerConfig[],
      mode: GameMode,
      formatOverride: MatchFormat = 'single',
      challengeData: ChallengeItem | null = null,
      tourneyRound: TournamentMatch | null = null,
      existingSeries: SeriesState | null = null,
      skipPlacementPhase = false
    ) => {
      matchSessionIdRef.current += 1;
      clearAllMatchTimeouts();
      setIsPaused(false);
      setShowExitConfirm(false);
      setPendingExitAction(null);
      setActiveModal('none');
      setIsInMenu(false);
      isInMenuRef.current = false;

      // Disambiguate player names cleanly
      const uniqueNames = disambiguateDisplayNames(
        playerConfigs.map((c) => c.name)
      );
      const normalizedConfigs: PlayerConfig[] = playerConfigs.map((cfg, idx) => ({
        ...cfg,
        name: uniqueNames[idx] || `Player ${idx + 1}`,
      }));

      setGameMode(mode);
      setMatchFormat(formatOverride);
      setActiveChallenge(challengeData);
      setActiveTournamentRound(tourneyRound);
      setMatchWinner(null);
      setEliminatedOrder([]);
      eliminatedOrderRef.current = [];
      confirmedPlacementsRef.current = new Map();
      matchStartTimeRef.current = Date.now();
      currentMatchInstanceIdRef.current = `inst_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 7)}`;

      setLastSetupConfigs({
        configs: normalizedConfigs,
        mode,
        format: formatOverride,
      });

      if (formatOverride === 'bo5' && normalizedConfigs.length >= 2) {
        const nextSeries =
          existingSeries ||
          createNewSeries(
            { id: normalizedConfigs[0].id, name: normalizedConfigs[0].name },
            { id: normalizedConfigs[1].id, name: normalizedConfigs[1].name },
            'bo5'
          );
        setSeriesState(nextSeries);
        seriesStateRef.current = nextSeries;
      } else {
        setSeriesState(null);
        seriesStateRef.current = null;
        saveSeriesState(null);
      }

      const { tw, th, frictionAir } = rebuildTableEnvironment(
        selectedTableIdRef.current
      );

      const engine = Engine.create();
      engine.gravity.x = 0;
      engine.gravity.y = 0;
      engine.gravity.scale = 0;
      engineRef.current = engine;

      const defaultSpawns = getTableSpawnPositions(
        tw,
        th,
        normalizedConfigs.length
      );

      const inGamePlayers: InGamePlayer[] = normalizedConfigs.map((cfg, idx) => {
        const skin = getSkin(cfg.skinId);
        let spawn = defaultSpawns[idx] || { x: tw / 2, y: th / 2, a: 0 };

        if (mode === 'challenge' && challengeData) {
          if (idx === 0) {
            spawn = {
              x: clamp(challengeData.playerPos.x, 70, tw - 70),
              y: clamp(challengeData.playerPos.y, 70, th - 70),
              a: challengeData.playerPos.a,
            };
          } else {
            const targetSpec = challengeData.targets[idx - 1];
            if (targetSpec) {
              spawn = {
                x: clamp(targetSpec.x, 70, tw - 70),
                y: clamp(targetSpec.y, 70, th - 70),
                a: targetSpec.a,
              };
            }
          }
        } else if (!cfg.isBot && mode !== 'practice' && !skipPlacementPhase) {
          const suggested = getSuggestedPlacement(
            idx,
            normalizedConfigs.length,
            tw,
            th,
            Math.random,
            []
          );
          spawn = { x: suggested.x, y: suggested.y, a: suggested.angle };
        }

        const body = Bodies.rectangle(spawn.x, spawn.y, PEN_LENGTH, PEN_WIDTH, {
          angle: spawn.a,
          frictionAir,
          restitution: BASE_RESTITUTION,
          friction: 0.12,
          frictionStatic: 0.2,
          density: BASE_DENSITY,
          chamfer: { radius: 7 },
          label: `pen_${idx}`,
        });
        (body as any).deltaTime = SUB_DT;

        World.add(engine.world, body);

        const botPers = cfg.botPersonalityId
          ? getBotPersonality(cfg.botPersonalityId)
          : cfg.isBot
          ? getRandomBot(settingsRef.current.skill)
          : undefined;

        const initialSide: AttackSideIndex =
          mode === 'challenge' &&
          idx === 0 &&
          challengeData?.sideRequired !== undefined
            ? challengeData.sideRequired
            : 1;

        return {
          id: cfg.id,
          name: cfg.name,
          skin,
          isBot: cfg.isBot,
          botPersonality: botPers,
          idx,
          body,
          alive: true,
          lastPower: 55,
          lastSide: initialSide,
          flickCount: 0,
          knockouts: 0,
        };
      });

      // Collision listener with calibrated custom impulse & sound
      Events.on(engine, 'collisionStart', (ev) => {
        for (const pair of ev.pairs) {
          const relSpeed = Matter.Vector.magnitude(
            Matter.Vector.sub(pair.bodyA.velocity, pair.bodyB.velocity)
          );
          if (relSpeed > 0.35) {
            const att = playersRef.current[turnIndexRef.current];
            let impactSpeed = relSpeed;

            if (att && (pair.bodyA === att.body || pair.bodyB === att.body)) {
              const otherBody =
                pair.bodyA === att.body ? pair.bodyB : pair.bodyA;
              const otherPlayer = playersRef.current.find(
                (p) => p.body === otherBody
              );
              if (otherPlayer) {
                const strikeFactor =
                  ATTACK_SIDES[att.lastSide]?.strike ?? 0.75;
                const resolved = resolveCustomStrike(
                  att.body,
                  otherPlayer.body,
                  pair,
                  strikeFactor
                );
                if (resolved > 0) impactSpeed = resolved;
              }
            }

            Sound.playHit(clamp(impactSpeed / 16, 0.15, 1));
            if (!settingsRef.current.reducedMotion) {
              screenShakeRef.current = Math.min(9, impactSpeed * 0.42);
            }

            const cx = (pair.bodyA.position.x + pair.bodyB.position.x) / 2;
            const cy = (pair.bodyA.position.y + pair.bodyB.position.y) / 2;
            spawnParticles(
              cx,
              cy,
              '#ffe066',
              Math.min(22, Math.floor(impactSpeed * 1.4)),
              Math.min(6.5, impactSpeed * 0.32),
              impactSpeed > 8.5
            );

            if (impactSpeed > 11.5) {
              spawnFloatText(cx, cy - 16, 'CRACK! 💥', '#fbbf24');
            } else if (impactSpeed > 6.0) {
              spawnFloatText(cx, cy - 12, 'CLACK!', '#fde047');
            }
          }
        }
      });

      playersRef.current = inGamePlayers;
      setPlayers([...inGamePlayers]);
      turnIndexRef.current = 0;
      setTurnIndex(0);
      powerRef.current = 55;
      setPower(55);

      const initialSide = inGamePlayers[0]?.lastSide ?? 1;
      sideRef.current = initialSide;
      setSide(initialSide);

      // Aim player 0 toward opponent or table center
      const p0 = inGamePlayers[0];
      const p1 = inGamePlayers[1];
      if (p0) {
        aimAngleRef.current = p1
          ? Math.atan2(
              p1.body.position.y - p0.body.position.y,
              p1.body.position.x - p0.body.position.x
            )
          : 0;
      }

      // Enter Pen Placement Phase for human players in standard modes
      const firstHumanIdx = inGamePlayers.findIndex((p) => !p.isBot);
      const shouldUsePlacement =
        !skipPlacementPhase &&
        mode !== 'practice' &&
        mode !== 'challenge' &&
        firstHumanIdx !== -1;

      if (shouldUsePlacement) {
        setPlacingPlayerIdx(firstHumanIdx);
        placingPlayerIdxRef.current = firstHumanIdx;
        setPlacementHandover(false);
        placementHandoverRef.current = false;
        setPlacementValid(true);
        setPlacementInvalidReason(undefined);
        updatePhase('placing');
        showBanner(
          `${inGamePlayers[firstHumanIdx].name}: Place Your Pen`,
          'Drag inside the wooden desk and confirm'
        );
      } else {
        // Mark all placements confirmed immediately
        inGamePlayers.forEach((p) => {
          confirmedPlacementsRef.current.set(p.idx, {
            x: p.body.position.x,
            y: p.body.position.y,
            angle: p.body.angle,
          });
        });
        updatePhase('aim');
        if (mode === 'challenge' && challengeData) {
          showBanner(challengeData.title, challengeData.desc, 2400);
        } else if (mode === 'practice') {
          showBanner('Practice Mode', 'Test attack sides and shot power!');
        } else {
          showBanner(`${inGamePlayers[0].name}'s Turn!`);
        }
      }
    },
    [clearAllMatchTimeouts, rebuildTableEnvironment, showBanner]
  );

  // Validate currently placing player's pen against boundaries and confirmed placements
  const revalidateCurrentPlacement = useCallback((idx: number): boolean => {
    const pls = playersRef.current;
    const current = pls[idx];
    if (!current) return true;
    const { w: tw, h: th } = tableSizeRef.current;

    const existingConfirmed: PenPlacement[] = [];
    confirmedPlacementsRef.current.forEach((val, key) => {
      if (key !== idx) existingConfirmed.push(val);
    });

    const check = validatePlacement(
      {
        x: current.body.position.x,
        y: current.body.position.y,
        angle: current.body.angle,
      },
      existingConfirmed,
      tw,
      th
    );

    setPlacementValid(check.valid);
    setPlacementInvalidReason(check.reason);
    return check.valid;
  }, []);

  const handleRotatePlacement = (deltaRadians: number) => {
    const idx = placingPlayerIdxRef.current;
    const p = playersRef.current[idx];
    if (!p || (phaseRef.current !== 'placing' && phaseRef.current !== 'handover'))
      return;
    Body.setAngle(p.body, p.body.angle + deltaRadians);
    revalidateCurrentPlacement(idx);
    setPlayers([...playersRef.current]);
  };

  const handleResetPlacementAngle = () => {
    const idx = placingPlayerIdxRef.current;
    const p = playersRef.current[idx];
    if (!p || (phaseRef.current !== 'placing' && phaseRef.current !== 'handover'))
      return;
    const defaultAngle = idx === 0 ? Math.PI / 2 : -Math.PI / 2;
    Body.setAngle(p.body, defaultAngle);
    revalidateCurrentPlacement(idx);
    setPlayers([...playersRef.current]);
  };

  const handleConfirmPlacement = () => {
    const idx = placingPlayerIdxRef.current;
    const pls = playersRef.current;
    const current = pls[idx];
    if (!current || (phaseRef.current !== 'placing' && phaseRef.current !== 'handover'))
      return;

    if (!revalidateCurrentPlacement(idx)) {
      Sound.playFall();
      return;
    }

    confirmedPlacementsRef.current.set(idx, {
      x: current.body.position.x,
      y: current.body.position.y,
      angle: current.body.angle,
    });

    const { w: tw, h: th } = tableSizeRef.current;

    // Check if another human player needs to place their pen privately
    const nextHumanIdx = pls.findIndex((p, i) => i > idx && !p.isBot);
    if (nextHumanIdx !== -1) {
      const nextPlayer = pls[nextHumanIdx];
      const existingConfirmed = Array.from(
        confirmedPlacementsRef.current.values()
      );

      const safeSpawn = getSuggestedPlacement(
        nextHumanIdx,
        pls.length,
        tw,
        th,
        Math.random,
        existingConfirmed
      );
      Body.setPosition(nextPlayer.body, { x: safeSpawn.x, y: safeSpawn.y });
      Body.setAngle(nextPlayer.body, safeSpawn.angle);

      setPlacingPlayerIdx(nextHumanIdx);
      placingPlayerIdxRef.current = nextHumanIdx;
      setPlacementHandover(true);
      placementHandoverRef.current = true;
      updatePhase('handover');
      revalidateCurrentPlacement(nextHumanIdx);
      setPlayers([...pls]);
      return;
    }

    // All human players have confirmed! Now generate randomized valid positions for AI bots
    const confirmedList = Array.from(confirmedPlacementsRef.current.values());
    for (let i = 0; i < pls.length; i++) {
      const p = pls[i];
      if (p.isBot) {
        const botPlacement = generateRandomBotPlacement(
          confirmedList,
          tw,
          th,
          Math.random,
          i,
          pls.length
        );
        Body.setPosition(p.body, { x: botPlacement.x, y: botPlacement.y });
        Body.setAngle(p.body, botPlacement.angle);
        confirmedPlacementsRef.current.set(i, botPlacement);
        confirmedList.push(botPlacement);
      }
    }

    setPlacementHandover(false);
    placementHandoverRef.current = false;
    turnIndexRef.current = 0;
    setTurnIndex(0);

    // Orient Player 1 aim towards opponent
    const p0 = pls[0];
    const p1 = pls[1];
    if (p0 && p1) {
      aimAngleRef.current = Math.atan2(
        p1.body.position.y - p0.body.position.y,
        p1.body.position.x - p0.body.position.x
      );
    }

    setPlayers([...pls]);
    updatePhase('aim');
    showBanner(
      `${pls[0].name}'s Turn!`,
      'Aim on the desk or use the Power Meter'
    );
  };

  // Execute Shot (launch active pen)
  const executeShot = useCallback((overridePower?: number) => {
    if (phaseRef.current !== 'aim') return;
    const p = playersRef.current[turnIndexRef.current];
    if (!p || !p.alive) return;

    const launchPwr = clamp(
      overridePower !== undefined ? overridePower : powerRef.current,
      5,
      100
    );
    const chosenSide = sideRef.current;

    p.lastPower = launchPwr;
    p.lastSide = chosenSide;
    p.flickCount += 1;

    applyLaunch(p.body, aimAngleRef.current, launchPwr / 100, chosenSide);

    Sound.playFlick(launchPwr / 100);
    const pt = contactPoint(p.body.position, p.body.angle, chosenSide);
    spawnParticles(pt.x, pt.y, '#ffffff', 12, 3.2);

    settleTimerRef.current = 0;
    shotElapsedRef.current = 0;
    updatePhase('moving');
    setPlayers([...playersRef.current]);
  }, []);

  // Bot Thinking Trigger
  const triggerBotTurn = useCallback(
    (botIdx: number) => {
      const botPlayer = playersRef.current[botIdx];
      if (!botPlayer || !botPlayer.alive) return;

      showBanner(`${botPlayer.name} is aiming...`, botPlayer.botPersonality?.title);

      scheduleMatchTimeout(() => {
        if (isInMenuRef.current || phaseRef.current !== 'aim') return;
        const alive = playersRef.current.filter((p) => p.alive);
        if (alive.length < 2) return;

        const { w: tw, h: th, frictionAir } = tableSizeRef.current;
        const skill =
          botPlayer.botPersonality?.skill || settingsRef.current.skill;
        const plan = planBotShot(
          botPlayer,
          alive,
          tw,
          th,
          frictionAir,
          skill,
          settingsRef.current.fall
        );

        aimAngleRef.current = plan.aim;
        sideRef.current = plan.side;
        powerRef.current = plan.power;
        setSide(plan.side);
        setPower(plan.power);
        setPlayers([...playersRef.current]);

        scheduleMatchTimeout(() => {
          if (isInMenuRef.current || phaseRef.current !== 'aim') return;
          executeShot(plan.power);
        }, 420);
      }, 650);
    },
    [executeShot, scheduleMatchTimeout, showBanner]
  );

  // Record match completion to local history & cloud
  const recordCompletedMatchAndSync = useCallback(
    async (
      nextProgress: PlayerProgress,
      item: Omit<LocalMatchHistoryItem, 'id' | 'playedAt'>
    ) => {
      const fullItem: LocalMatchHistoryItem = {
        ...item,
        id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        playedAt: new Date().toISOString(),
      };
      appendLocalMatchHistory(fullItem);
      setMatchHistory(loadLocalMatchHistory());

      if (user && csrfToken && navigator.onLine) {
        setSyncStatus('syncing');
        try {
          await fetch('/api/matches', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': csrfToken,
            },
            body: JSON.stringify({
              idempotencyKey: fullItem.idempotencyKey,
              matchMode: fullItem.matchMode,
              result: fullItem.result,
              opponentType: fullItem.opponentType,
              opponentName: fullItem.opponentName,
              shotsTaken: fullItem.shotsTaken,
              knockouts: fullItem.knockouts,
              durationSeconds: fullItem.durationSeconds,
              coinsAwarded: fullItem.coinsAwarded,
              xpAwarded: fullItem.xpAwarded,
            }),
          });
          await pushSaveToCloud(nextProgress, settingsRef.current);
        } catch {
          setSyncStatus('offline');
        }
      } else {
        setSyncStatus(navigator.onLine ? 'saved' : 'offline');
      }
    },
    [user, csrfToken, pushSaveToCloud]
  );

  // Handle Turn Resolution after pens settle
  const resolveTurnOutcome = useCallback(() => {
    const mode = gameModeRef.current;
    const format = matchFormatRef.current;
    const pls = playersRef.current;
    const currentIdx = turnIndexRef.current;

    // Reset all body densities to base density at turn end
    for (const pl of pls) {
      if (pl.alive) {
        Body.setDensity(pl.body, BASE_DENSITY);
      }
    }

    // 1. Practice Mode: respawn fallen target pens immediately
    if (mode === 'practice') {
      const fallen = pls.filter((p) => !p.alive);
      if (fallen.length > 0) {
        const { tw, th } = rebuildTableEnvironment(selectedTableIdRef.current);
        const spawns = getTableSpawnPositions(tw, th, pls.length);
        fallen.forEach((fp) => {
          fp.alive = true;
          const sp = spawns[fp.idx] || { x: tw / 2, y: th / 2, a: 0 };
          Body.setPosition(fp.body, { x: sp.x, y: sp.y });
          Body.setVelocity(fp.body, { x: 0, y: 0 });
          Body.setAngularVelocity(fp.body, 0);
          Body.setAngle(fp.body, sp.a);
          if (engineRef.current) {
            World.add(engineRef.current.world, fp.body);
          }
        });
        eliminatedOrderRef.current = [];
        setEliminatedOrder([]);
        showBanner('Target Knocked Off!', 'Respawning practice dummy...');
      }
      updatePhase('aim');
      setPlayers([...pls]);
      return;
    }

    // 2. Challenge Mode
    if (mode === 'challenge' && activeChallengeRef.current) {
      const ch = activeChallengeRef.current;
      const playerPen = pls[0];
      const targets = pls.slice(1);
      const allTargetsEliminated = targets.every((t) => !t.alive);

      if (!playerPen.alive) {
        updatePhase('over');
        setMatchWinner(targets[0] || null);
        setLastCoinsAwarded(10);
        setLastXpAwarded(15);
        return;
      }

      if (allTargetsEliminated) {
        Sound.playWin();
        const prog = { ...progressRef.current };
        const isFirstClear = !prog.completedChallenges.includes(ch.id);
        const coinsEarned = isFirstClear
          ? ch.rewardCoins
          : Math.floor(ch.rewardCoins * 0.25);
        const xpEarned = isFirstClear
          ? ch.rewardXp
          : Math.floor(ch.rewardXp * 0.25);

        prog.coins += coinsEarned;
        prog.xp += xpEarned;
        prog.level = calculateLevel(prog.xp);
        prog.trickShotsCount += 1;
        if (isFirstClear) {
          prog.completedChallenges = [...prog.completedChallenges, ch.id];
        }
        saveProgress(prog);
        setProgress(prog);
        pushSaveToCloud(prog, settingsRef.current);

        setLastCoinsAwarded(coinsEarned);
        setLastXpAwarded(xpEarned);
        setMatchWinner(playerPen);
        updatePhase('over');
        return;
      }

      if (playerPen.flickCount >= ch.maxTurns) {
        Sound.playFall();
        setLastCoinsAwarded(10);
        setLastXpAwarded(15);
        setMatchWinner(targets.find((t) => t.alive) || targets[0] || null);
        updatePhase('over');
        return;
      }

      if (ch.sideRequired !== undefined) {
        sideRef.current = ch.sideRequired;
        setSide(ch.sideRequired);
      }
      updatePhase('aim');
      setPlayers([...pls]);
      showBanner(
        `Turns Left: ${ch.maxTurns - playerPen.flickCount}`,
        ch.title
      );
      return;
    }

    // 3. Standard / Pass & Play / AI Battle / Championship
    const alive = pls.filter((p) => p.alive);

    if (alive.length <= 1) {
      const roundWinner = alive[0] || null;

      // Update Best-of-5 Series State if active
      let currentSeries = seriesStateRef.current;
      if (format === 'bo5' && currentSeries) {
        const { updatedSeries } = commitSeriesMatchResult(
          currentSeries,
          currentMatchInstanceIdRef.current,
          roundWinner ? roundWinner.id : null,
          roundWinner ? roundWinner.name : null
        );
        currentSeries = updatedSeries;
        setSeriesState(updatedSeries);
        seriesStateRef.current = updatedSeries;
        saveSeriesState(updatedSeries);
      }

      const prog = { ...progressRef.current };
      prog.matchesPlayed += 1;
      prog.knockoutsCount += pls[0]?.knockouts || 0;

      const humanWon = Boolean(roundWinner && !roundWinner.isBot && roundWinner.idx === 0);
      let coinsEarned = 25;
      let xpEarned = 35;

      if (humanWon || (mode === 'pass_and_play' && roundWinner)) {
        Sound.playWin();
        coinsEarned = mode === 'championship' ? 150 : 80;
        xpEarned = 85;
        if (humanWon) {
          prog.matchesWon += 1;
          if (
            mode === 'championship' &&
            activeTournamentRoundRef.current &&
            activeTournamentRoundRef.current.round === 3
          ) {
            prog.championshipTrophies += 1;
            coinsEarned += 250;
          }
        }
      }

      prog.coins += coinsEarned;
      prog.xp += xpEarned;
      prog.level = calculateLevel(prog.xp);
      saveProgress(prog);
      setProgress(prog);

      const p1 = pls[0];
      const p2 = pls[1] || pls[0];
      const durationSeconds = Math.max(
        1,
        Math.round((Date.now() - matchStartTimeRef.current) / 1000)
      );

      recordCompletedMatchAndSync(prog, {
        idempotencyKey: currentMatchInstanceIdRef.current,
        matchMode: mode,
        result: !roundWinner ? 'draw' : roundWinner.idx === 0 ? 'win' : 'loss',
        opponentType: p2.isBot ? 'bot' : 'human',
        opponentName: p2.name,
        shotsTaken: p1.flickCount,
        knockouts: p1.knockouts,
        durationSeconds,
        coinsAwarded: coinsEarned,
        xpAwarded: xpEarned,
      });

      setLastCoinsAwarded(coinsEarned);
      setLastXpAwarded(xpEarned);
      setMatchWinner(roundWinner);
      setEliminatedOrder([...eliminatedOrderRef.current]);
      updatePhase('over');
      return;
    }

    // Advance to next alive player's turn
    let nextIdx = (currentIdx + 1) % pls.length;
    while (!pls[nextIdx].alive) {
      nextIdx = (nextIdx + 1) % pls.length;
    }

    turnIndexRef.current = nextIdx;
    setTurnIndex(nextIdx);
    const nextPlayer = pls[nextIdx];
    sideRef.current = nextPlayer.lastSide;
    setSide(nextPlayer.lastSide);
    powerRef.current = nextPlayer.lastPower || 55;
    setPower(nextPlayer.lastPower || 55);

    const nearestEnemy = alive
      .filter((p) => p.idx !== nextPlayer.idx)
      .sort(
        (a, b) =>
          Math.hypot(
            a.body.position.x - nextPlayer.body.position.x,
            a.body.position.y - nextPlayer.body.position.y
          ) -
          Math.hypot(
            b.body.position.x - nextPlayer.body.position.x,
            b.body.position.y - nextPlayer.body.position.y
          )
      )[0];

    if (nearestEnemy) {
      aimAngleRef.current = Math.atan2(
        nearestEnemy.body.position.y - nextPlayer.body.position.y,
        nearestEnemy.body.position.x - nextPlayer.body.position.x
      );
    }

    updatePhase('aim');
    setPlayers([...pls]);

    if (nextPlayer.isBot) {
      triggerBotTurn(nextIdx);
    } else {
      showBanner(`${nextPlayer.name}'s Turn!`);
    }
  }, [
    pushSaveToCloud,
    rebuildTableEnvironment,
    recordCompletedMatchAndSync,
    showBanner,
    triggerBotTurn,
  ]);

  // Main Animation & Physics Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const step = (now: number) => {
      const dt = Math.min(35, now - lastTime);
      lastTime = now;

      const currentPhase = phaseRef.current;
      const engine = engineRef.current;
      const { w: tw, h: th } = tableSizeRef.current;

      if (!isPausedRef.current && !isInMenuRef.current) {
        if ((currentPhase === 'moving' || currentPhase === 'settling') && engine) {
          shotElapsedRef.current += dt;

          for (let s = 0; s < 2; s++) {
            Engine.update(engine, SUB_DT);

            for (const pl of playersRef.current) {
              if (pl.alive) {
                stepBodyDynamics(pl.body);
              }
            }

            // Check desk edges using center + footprint overhang rules
            for (const pl of playersRef.current) {
              if (!pl.alive) continue;
              if (isOffDesk(pl.body, tw, th, settingsRef.current.fall)) {
                pl.alive = false;
                eliminatedOrderRef.current.push(pl);
                setEliminatedOrder([...eliminatedOrderRef.current]);

                const attacker = playersRef.current[turnIndexRef.current];
                if (attacker && attacker.idx !== pl.idx) {
                  attacker.knockouts += 1;
                }

                World.remove(engine.world, pl.body);
                Sound.playFall();
                spawnParticles(
                  clamp(pl.body.position.x, 0, tw),
                  clamp(pl.body.position.y, 0, th),
                  '#ef4444',
                  24,
                  5.5,
                  true
                );
                spawnFloatText(
                  clamp(pl.body.position.x, 40, tw - 40),
                  clamp(pl.body.position.y, 40, th - 40),
                  `${pl.name} OUT! 💥`,
                  '#f87171'
                );
              }
            }
          }

          // Check if all alive pens have settled
          const aliveCount = playersRef.current.filter((p) => p.alive).length;
          const allSettled = playersRef.current.every((pl) => {
            if (!pl.alive) return true;
            const speed = Matter.Vector.magnitude(pl.body.velocity);
            const angSpeed = Math.abs(pl.body.angularVelocity);
            return speed < 0.12 && angSpeed < 0.007;
          });

          if (allSettled || aliveCount <= 1 || shotElapsedRef.current > 6500) {
            settleTimerRef.current += dt;
            if (settleTimerRef.current > 260 || shotElapsedRef.current > 6500) {
              for (const pl of playersRef.current) {
                if (pl.alive) {
                  Body.setVelocity(pl.body, { x: 0, y: 0 });
                  Body.setAngularVelocity(pl.body, 0);
                }
              }
              resolveTurnOutcome();
            }
          } else {
            settleTimerRef.current = 0;
          }
        }
      }

      renderScene();
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [resolveTurnOutcome]);

  // Canvas Scene Renderer using Authoritative computeCameraView
  const renderScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cw = window.innerWidth;
    const ch = window.innerHeight;
    if (
      canvas.width !== Math.round(cw * dpr) ||
      canvas.height !== Math.round(ch * dpr)
    ) {
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);

    const { w: tw, h: th, frictionAir } = tableSizeRef.current;

    // Warm dark classroom background
    const bgGrad = ctx.createRadialGradient(
      cw / 2,
      ch / 2,
      40,
      cw / 2,
      ch / 2,
      Math.max(cw, ch) * 0.85
    );
    bgGrad.addColorStop(0, '#22150c');
    bgGrad.addColorStop(1, '#0c0704');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, cw, ch);

    const camera = computeCameraView({
      viewportWidth: cw,
      viewportHeight: ch,
      deskWidth: tw,
      deskHeight: th,
      isPlaying: !isInMenuRef.current,
      phase: phaseRef.current,
      sidebarOverride: sidebarOverrideRef.current,
    });

    let shakeX = 0;
    let shakeY = 0;
    if (screenShakeRef.current > 0.1 && !settingsRef.current.reducedMotion) {
      shakeX = (Math.random() - 0.5) * screenShakeRef.current * 2;
      shakeY = (Math.random() - 0.5) * screenShakeRef.current * 2;
      screenShakeRef.current *= 0.86;
    } else {
      screenShakeRef.current = 0;
    }

    ctx.save();
    ctx.translate(camera.ox + shakeX, camera.oy + shakeY);
    ctx.scale(camera.scale, camera.scale);

    // Desk Drop Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.78)';
    ctx.shadowBlur = 46;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 20;
    ctx.fillStyle = '#241409';
    ctx.fillRect(0, 0, tw, th);
    ctx.restore();

    // Wooden Desk Texture
    if (deskCanvasRef.current) {
      ctx.drawImage(deskCanvasRef.current, 0, 0, tw, th);
    }

    if (isInMenuRef.current) {
      ctx.restore();
      return;
    }

    const currentPhase = phaseRef.current;
    const currentTurn = turnIndexRef.current;
    const currentPlacingIdx = placingPlayerIdxRef.current;

    // Placement Phase Boundary & Guide Overlay
    if (currentPhase === 'placing' && !placementHandoverRef.current) {
      const placingPlayer = playersRef.current[currentPlacingIdx];
      if (placingPlayer) {
        const safePad = 20;
        ctx.save();
        ctx.strokeStyle = placementValid
          ? 'rgba(74, 222, 128, 0.5)'
          : 'rgba(248, 113, 113, 0.8)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([10, 6]);
        ctx.strokeRect(safePad, safePad, tw - safePad * 2, th - safePad * 2);
        ctx.restore();

        ctx.save();
        ctx.translate(
          placingPlayer.body.position.x,
          placingPlayer.body.position.y
        );
        ctx.beginPath();
        ctx.arc(0, 0, PEN_LENGTH / 2 + 16, 0, Math.PI * 2);
        ctx.strokeStyle = placementValid
          ? 'rgba(74, 222, 128, 0.8)'
          : 'rgba(248, 113, 113, 0.9)';
        ctx.lineWidth = 2.2;
        ctx.setLineDash([6, 5]);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Aiming Guide & Trajectory Preview (uses exact same physics simulation as live shots!)
    const activePlayer = playersRef.current[currentTurn];
    if (
      activePlayer &&
      activePlayer.alive &&
      !activePlayer.isBot &&
      currentPhase === 'aim'
    ) {
      const activeSideIdx = sideRef.current;
      const worldPt = contactPoint(
        activePlayer.body.position,
        activePlayer.body.angle,
        activeSideIdx
      );

      // Highlight box around active pen
      ctx.save();
      ctx.translate(activePlayer.body.position.x, activePlayer.body.position.y);
      ctx.rotate(activePlayer.body.angle);
      ctx.strokeStyle = '#f5d061';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(
        -PEN_LENGTH / 2 - 8,
        -PEN_WIDTH / 2 - 8,
        PEN_LENGTH + 16,
        PEN_WIDTH + 16
      );
      ctx.restore();

      const previewPowerNorm = clamp(powerRef.current / 100, 0.05, 1.0);

      if (settingsRef.current.guide) {
        const otherBodies = playersRef.current
          .filter((q) => q.alive && q.idx !== activePlayer.idx)
          .map((q) => ({
            idx: q.idx,
            pos: q.body.position,
            angle: q.body.angle,
          }));

        const sim = simulateTrajectory(
          {
            x: activePlayer.body.position.x,
            y: activePlayer.body.position.y,
            angle: activePlayer.body.angle,
          },
          aimAngleRef.current,
          previewPowerNorm,
          activeSideIdx,
          otherBodies,
          tw,
          th,
          frictionAir,
          settingsRef.current.fall
        );

        ctx.save();
        const stepStride = Math.max(1, Math.floor(sim.path.length / 22));
        for (let i = 1; i < sim.path.length; i += stepStride) {
          const pt = sim.path[i];
          const ratio = i / sim.path.length;
          const alpha = (1 - ratio) * 0.78;
          ctx.fillStyle = sim.exit
            ? `rgba(248, 113, 113, ${alpha})`
            : `rgba(255, 230, 102, ${alpha})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3.3 - ratio * 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
        if (sim.hit) {
          ctx.strokeStyle = '#4ade80';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(sim.hit.x, sim.hit.y, 9, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Direction Arrow from Selected Strike Point
      const arrowLen = 45 + powerRef.current * 1.05;
      const ex = worldPt.x + Math.cos(aimAngleRef.current) * arrowLen;
      const ey = worldPt.y + Math.sin(aimAngleRef.current) * arrowLen;

      ctx.save();
      const arrowGrad = ctx.createLinearGradient(worldPt.x, worldPt.y, ex, ey);
      arrowGrad.addColorStop(0, '#ffe066');
      arrowGrad.addColorStop(1, '#38bdf8');
      ctx.strokeStyle = arrowGrad;
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(worldPt.x, worldPt.y);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      const headLen = 12;
      const a1 = aimAngleRef.current + Math.PI * 0.82;
      const a2 = aimAngleRef.current - Math.PI * 0.82;
      ctx.fillStyle = '#ffe066';
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex + Math.cos(a1) * headLen, ey + Math.sin(a1) * headLen);
      ctx.lineTo(ex + Math.cos(a2) * headLen, ey + Math.sin(a2) * headLen);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Draw Pens (During placement phase, ONLY draw the currently placing player's pen!)
    for (let i = 0; i < playersRef.current.length; i++) {
      const pl = playersRef.current[i];
      if (!pl.alive) continue;

      if (currentPhase === 'placing' || currentPhase === 'handover') {
        if (placementHandoverRef.current) continue;
        if (i !== currentPlacingIdx) continue;
      }

      ctx.save();
      ctx.translate(pl.body.position.x, pl.body.position.y);
      ctx.rotate(pl.body.angle);

      const isTurnPen = i === currentTurn && currentPhase === 'aim';

      drawDetailedPen(ctx, pl.skin, {
        shadow: { blur: 12, x: 3, y: 6 },
        activeSide: isTurnPen ? sideRef.current : null,
        aura: pl.skin.rarity === 'legendary',
      });

      ctx.restore();

      // Player Name Tag above Pen
      ctx.save();
      ctx.font = "bold 11px 'Outfit', sans-serif";
      ctx.textAlign = 'center';
      const tagY = pl.body.position.y - 24;
      const label = pl.name;
      const metrics = ctx.measureText(label);
      const padX = 6;
      ctx.fillStyle = 'rgba(15, 10, 6, 0.82)';
      ctx.beginPath();
      ctx.roundRect(
        pl.body.position.x - metrics.width / 2 - padX,
        tagY - 10,
        metrics.width + padX * 2,
        15,
        5
      );
      ctx.fill();
      ctx.fillStyle = i === currentTurn ? '#f5d061' : '#e5e7eb';
      ctx.fillText(label, pl.body.position.x, tagY + 1);
      ctx.restore();
    }

    // Render Collision & Knockout Particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const pt = particlesRef.current[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life -= pt.decay;
      if (pt.life <= 0) {
        particlesRef.current.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.life);
      if (pt.kind === 'ring') {
        pt.size += 2.6;
        ctx.strokeStyle = pt.color;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Render Floating Impact Callouts
    for (let i = floatTextsRef.current.length - 1; i >= 0; i--) {
      const ft = floatTextsRef.current[i];
      ft.y -= 0.85;
      ft.life -= 0.022;
      if (ft.life <= 0) {
        floatTextsRef.current.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.life);
      ctx.font = "extrabold 15px 'Kalam', cursive";
      ctx.textAlign = 'center';
      ctx.fillStyle = ft.color;
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    ctx.restore();
  };

  // Pointer Events for Placement Dragging & Canvas Aiming (using computeCameraView)
  const getCurrentCamera = () => {
    const { w: tw, h: th } = tableSizeRef.current;
    return computeCameraView({
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      deskWidth: tw,
      deskHeight: th,
      isPlaying: !isInMenuRef.current,
      phase: phaseRef.current,
      sidebarOverride: sidebarOverrideRef.current,
    });
  };

  const updateCanvasAimFromClientPos = (clientX: number, clientY: number) => {
    const activePlayer = playersRef.current[turnIndexRef.current];
    if (
      !activePlayer ||
      activePlayer.isBot ||
      phaseRef.current !== 'aim' ||
      isInMenuRef.current
    )
      return;

    const canvas = canvasRef.current;
    const rect = canvas
      ? canvas.getBoundingClientRect()
      : { left: 0, top: 0 };
    const camera = getCurrentCamera();
    const worldPt = contactPoint(
      activePlayer.body.position,
      activePlayer.body.angle,
      sideRef.current
    );

    const screenOrigin = worldToScreen(worldPt.x, worldPt.y, rect, camera);
    const dx = clientX - screenOrigin.x;
    const dy = clientY - screenOrigin.y;
    if (Math.hypot(dx, dy) > 6) {
      aimAngleRef.current = Math.atan2(dy, dx);
    }
  };

  const updatePlacementFromClientPos = (clientX: number, clientY: number) => {
    if (
      (phaseRef.current !== 'placing' && phaseRef.current !== 'handover') ||
      placementHandoverRef.current
    )
      return;
    const idx = placingPlayerIdxRef.current;
    const p = playersRef.current[idx];
    if (!p) return;

    const canvas = canvasRef.current;
    const rect = canvas
      ? canvas.getBoundingClientRect()
      : { left: 0, top: 0 };
    const { w: tw, h: th } = tableSizeRef.current;
    const camera = getCurrentCamera();
    const worldPos = screenToWorld(clientX, clientY, rect, camera);

    const clampedX = clamp(worldPos.x, 24, tw - 24);
    const clampedY = clamp(worldPos.y, 24, th - 24);

    Body.setPosition(p.body, { x: clampedX, y: clampedY });
    revalidateCurrentPlacement(idx);
    setPlayers([...playersRef.current]);
  };

  const handleCanvasPointerDown = (
    e: React.PointerEvent<HTMLCanvasElement>
  ) => {
    if (isInMenuRef.current) return;
    if (
      (phaseRef.current === 'placing' || phaseRef.current === 'handover') &&
      !placementHandoverRef.current
    ) {
      draggingPlacementRef.current = true;
      updatePlacementFromClientPos(e.clientX, e.clientY);
      return;
    }
    if (phaseRef.current !== 'aim') return;
    draggingAimRef.current = true;
    updateCanvasAimFromClientPos(e.clientX, e.clientY);
  };

  const handleCanvasPointerMove = (
    e: React.PointerEvent<HTMLCanvasElement>
  ) => {
    if (draggingPlacementRef.current && phaseRef.current === 'placing') {
      updatePlacementFromClientPos(e.clientX, e.clientY);
      return;
    }
    if (!draggingAimRef.current || phaseRef.current !== 'aim') return;
    updateCanvasAimFromClientPos(e.clientX, e.clientY);
  };

  const handleCanvasPointerUp = () => {
    draggingAimRef.current = false;
    draggingPlacementRef.current = false;
  };

  // Leave Match Confirmation Flow (Phase 6)
  const abandonMatchAndPerform = useCallback(
    (afterAbandon?: () => void) => {
      matchSessionIdRef.current += 1;
      clearAllMatchTimeouts();
      setIsPaused(false);
      setShowExitConfirm(false);
      setPendingExitAction(null);
      setPlacementHandover(false);
      placementHandoverRef.current = false;
      setMatchWinner(null);
      setSeriesState(null);
      seriesStateRef.current = null;
      saveSeriesState(null);

      if (afterAbandon) {
        afterAbandon();
      } else {
        setIsInMenu(true);
        isInMenuRef.current = true;
      }
    },
    [clearAllMatchTimeouts]
  );

  const requestLeaveMatch = useCallback(
    (customAction?: () => void) => {
      if (isInMenuRef.current || phaseRef.current === 'over') {
        abandonMatchAndPerform(customAction);
        return;
      }
      setPendingExitAction(
        () =>
          customAction ||
          (() => {
            setIsInMenu(true);
            isInMenuRef.current = true;
          })
      );
      setShowExitConfirm(true);
    },
    [abandonMatchAndPerform]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showExitConfirm) {
          setShowExitConfirm(false);
          setPendingExitAction(null);
          return;
        }
        if (!isInMenuRef.current && phaseRef.current !== 'over') {
          requestLeaveMatch();
          return;
        }
      }

      if (isInMenuRef.current || phaseRef.current !== 'aim' || isPausedRef.current)
        return;
      const p = playersRef.current[turnIndexRef.current];
      if (!p || p.isBot) return;

      if (e.code === 'ArrowLeft') {
        aimAngleRef.current = angDiff(0, aimAngleRef.current - 0.06);
      } else if (e.code === 'ArrowRight') {
        aimAngleRef.current = angDiff(0, aimAngleRef.current + 0.06);
      } else if (['Digit1', 'Digit2', 'Digit3'].includes(e.code)) {
        const idx = (parseInt(e.code.replace('Digit', ''), 10) -
          1) as AttackSideIndex;
        sideRef.current = idx;
        setSide(idx);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [requestLeaveMatch, showExitConfirm]);

  // Quick Match Helper
  const handleStartQuickMatch = () => {
    const bot = getRandomBot(settings.skill);
    const configs: PlayerConfig[] = [
      {
        id: 'p1',
        name: 'Player 1',
        skinId: progress.equippedSkin || DEFAULT_PEN_ID,
        isBot: false,
      },
      {
        id: 'p2_bot',
        name: bot.name,
        skinId: bot.defaultSkinId,
        isBot: true,
        botPersonalityId: bot.id,
      },
    ];
    startMatch(configs, 'quick', 'single');
  };

  // Practice Mode Helper
  const handleStartPractice = () => {
    const configs: PlayerConfig[] = [
      {
        id: 'p1',
        name: 'You',
        skinId: progress.equippedSkin || DEFAULT_PEN_ID,
        isBot: false,
      },
      {
        id: 'dummy_1',
        name: 'Target Pen 1',
        skinId: 'matador_alltime',
        isBot: true,
      },
      {
        id: 'dummy_2',
        name: 'Target Pen 2',
        skinId: 'matador_iteen',
        isBot: true,
      },
    ];
    startMatch(configs, 'practice', 'single', null, null, null, true);
  };

  // Championship Round Helper
  const handleStartChampionshipRound = (round: TournamentMatch) => {
    const configs: PlayerConfig[] = [
      {
        id: 'p1',
        name: 'Player 1',
        skinId: progress.equippedSkin || DEFAULT_PEN_ID,
        isBot: false,
      },
      {
        id: `champ_bot_${round.round}`,
        name: round.opponent.name,
        skinId: round.opponent.skinId,
        isBot: true,
        botPersonalityId: round.opponent.botPersonalityId,
      },
    ];
    startMatch(configs, 'championship', 'single', null, round);
  };

  // Challenge Helper
  const handleStartChallenge = (ch: ChallengeItem) => {
    const configs: PlayerConfig[] = [
      {
        id: 'p1',
        name: 'You',
        skinId: progress.equippedSkin || DEFAULT_PEN_ID,
        isBot: false,
      },
      ...ch.targets.map((t, idx) => ({
        id: `target_${idx + 1}`,
        name: t.name,
        skinId: t.skinId,
        isBot: true,
      })),
    ];
    startMatch(configs, 'challenge', 'single', ch, null, null, true);
  };

  // Locker Handlers
  const handleUnlockSkin = (skinId: string, price: number) => {
    if (progress.coins < price || progress.unlockedSkins.includes(skinId))
      return;
    Sound.playWin();
    const next: PlayerProgress = {
      ...progress,
      coins: progress.coins - price,
      unlockedSkins: [...progress.unlockedSkins, skinId],
      equippedSkin: skinId,
    };
    saveProgress(next);
    setProgress(next);
    pushSaveToCloud(next, settings);
  };

  const handleEquipSkin = (skinId: string) => {
    const next = { ...progress, equippedSkin: skinId };
    saveProgress(next);
    setProgress(next);
    pushSaveToCloud(next, settings);
  };

  // Table Selection Handler
  const handleSelectTable = (
    tableId: string,
    customDims?: { width: number; height: number }
  ) => {
    setSelectedTableId(tableId);
    if (customDims) {
      setCustomTableDims(customDims);
      customTableDimsRef.current = customDims;
    }
    rebuildTableEnvironment(tableId, customDims);
    setActiveModal('none');
  };

  // Daily Bonus Handler
  const handleClaimDailyBonus = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (progress.lastDailyDate === todayStr) return;
    const rewardCoins = 75;
    const updatedProgress: PlayerProgress = {
      ...progress,
      coins: progress.coins + rewardCoins,
      xp: progress.xp + 50,
      level: calculateLevel(progress.xp + 50),
      lastDailyDate: todayStr,
      dailyStreak: progress.dailyStreak + 1,
    };
    Sound.playWin();
    saveProgress(updatedProgress);
    setProgress(updatedProgress);
    pushSaveToCloud(updatedProgress, settings);
    showBanner(`Daily Bonus: +${rewardCoins} Coins!`, 'Streak updated!');
  };

  // Cloud Account Handlers
  const handleStartGoogleRedirect = () => {
    window.location.href = '/api/auth/google/start';
  };

  const handleSubmitGoogleCredential = async (idToken: string) => {
    setSyncStatus('syncing');
    setSyncError(null);
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: idToken }),
    });
    const data = await res.json();
    if (!res.ok) {
      setSyncStatus('error');
      setSyncError(data.error || 'Google authentication failed.');
      return;
    }
    await refreshCloudSession();
  };

  const handleResolveConflict = async (choice: ConflictResolutionChoice) => {
    if (!conflictDetails) return;
    const cloudSave = conflictDetails.cloudSave;

    if (choice === 'keep_cloud') {
      const cloudProg = cloudSaveToPlayerProgress(cloudSave);
      setProgress(cloudProg);
      saveProgress(cloudProg, false);
      saveSaveMetadata({
        revision: cloudSave.revision,
        updatedAt: cloudSave.updatedAt,
        lastSyncedRevision: cloudSave.revision,
        lastSyncedUserId: user?.id || null,
      });
      setConflictDetails(null);
      setSyncStatus('saved');
      setSyncError(null);
      return;
    }

    const nextProgress =
      choice === 'merge'
        ? mergeLocalAndCloudProgress(progress, settings, cloudSave).progress
        : progress;

    setProgress(nextProgress);
    saveProgress(nextProgress, false);
    await pushSaveToCloud(nextProgress, settings, cloudSave.revision, true);
  };

  const handleSignOut = async () => {
    if (csrfToken) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfToken },
      }).catch(() => {});
    }
    setUser(null);
    setCsrfToken(null);
    setConflictDetails(null);
    setSyncStatus(navigator.onLine ? 'saved' : 'offline');
  };

  const handleDeleteAccount = async () => {
    if (!csrfToken) return;
    const res = await fetch('/api/account', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({ confirm: 'DELETE_MY_ACCOUNT' }),
    });
    if (res.ok) {
      setUser(null);
      setCsrfToken(null);
      setConflictDetails(null);
      setSyncStatus(navigator.onLine ? 'saved' : 'offline');
      showBanner('Cloud Account Deleted', 'Local save remains on this device.');
    }
  };

  // Compute responsive camera & layout mode
  const { w: tw, h: th } = tableSizeRef.current;
  const cameraView = computeCameraView({
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    deskWidth: tw,
    deskHeight: th,
    isPlaying: !isInMenu,
    phase,
    sidebarOverride,
  });

  const isPlacingPhase = phase === 'placing' || phase === 'handover';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0f0a06] select-none">
      {/* Interactive 2D Physics & Desk Canvas */}
      <canvas
        ref={canvasRef}
        data-testid="game-canvas"
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onPointerCancel={handleCanvasPointerUp}
        className={`fixed inset-0 w-full h-full touch-none ${
          !isInMenu &&
          (phase === 'aim' || (isPlacingPhase && !placementHandover))
            ? 'cursor-crosshair'
            : 'cursor-default'
        }`}
      />

      {/* Top Navigation Bar */}
      <HeaderNav
        progress={progress}
        settings={settings}
        inGame={!isInMenu}
        sidebarOffset={
          !isInMenu &&
          !isPlacingPhase &&
          cameraView.layoutMode === 'desktop-sidebar'
        }
        syncStatus={syncStatus}
        user={user}
        onToggleSound={() => setSettings((s) => ({ ...s, sound: !s.sound }))}
        onOpenSettings={() => setActiveModal('settings')}
        onOpenHowTo={() => setActiveModal('howto')}
        onOpenLocker={() => setActiveModal('locker')}
        onOpenAccount={() => setActiveModal('account')}
        onOpenStats={() => setActiveModal('stats')}
        onGoHome={() => requestLeaveMatch()}
      />

      {/* Main Menu Overlay */}
      {isInMenu && (
        <MainMenu
          progress={progress}
          settings={settings}
          selectedTableId={selectedTableId}
          user={user}
          syncStatus={syncStatus}
          onStartQuickMatch={handleStartQuickMatch}
          onOpenSetup={(m) => {
            if (m === 'quick') setActiveModal('setup_quick');
            else if (m === 'pass_and_play') setActiveModal('setup_pass');
            else setActiveModal('setup_ai');
          }}
          onStartPractice={handleStartPractice}
          onOpenLocker={() => setActiveModal('locker')}
          onOpenArenas={() => setActiveModal('arenas')}
          onOpenChampionship={() => setActiveModal('championship')}
          onOpenChallenges={() => setActiveModal('challenges')}
          onOpenHowTo={() => setActiveModal('howto')}
          onOpenSettings={() => setActiveModal('settings')}
          onOpenAccount={() => setActiveModal('account')}
          onOpenStats={() => setActiveModal('stats')}
        />
      )}

      {/* Pre-Match Pen Placement Phase HUD */}
      {!isInMenu && isPlacingPhase && players[placingPlayerIdx] && (
        <PenPlacementHUD
          currentPlayer={players[placingPlayerIdx]}
          playerIndex={placingPlayerIdx}
          totalHumanPlayers={players.filter((p) => !p.isBot).length}
          isValidPlacement={placementValid}
          validationReason={placementInvalidReason}
          isHandoverPrompt={placementHandover}
          onAcknowledgeHandover={() => {
            setPlacementHandover(false);
            placementHandoverRef.current = false;
            updatePhase('placing');
            showBanner(
              `${players[placingPlayerIdx].name}: Place Your Pen`,
              'Previously placed pens are hidden'
            );
          }}
          onRotate={handleRotatePlacement}
          onResetAngle={handleResetPlacementAngle}
          onConfirmPlacement={handleConfirmPlacement}
          onExit={() => requestLeaveMatch()}
        />
      )}

      {/* Active Gameplay HUD (Desktop Left Control Sidebar or Responsive Bottom Bar) */}
      {!isInMenu && !isPlacingPhase && (
        <GameHUD
          players={players}
          currentTurnIndex={turnIndex}
          phase={phase}
          power={power}
          side={side}
          bannerMessage={bannerMessage}
          layoutMode={cameraView.layoutMode}
          sidebarOverride={sidebarOverride}
          onToggleSidebarOverride={() => {
            setSidebarOverride((prev) =>
              prev === 'bottom' ? 'sidebar' : 'bottom'
            );
          }}
          onSetPower={(val) => {
            powerRef.current = val;
            setPower(val);
          }}
          onSetSide={(s) => {
            sideRef.current = s;
            setSide(s);
          }}
          onFlick={(launchPower) => executeShot(launchPower)}
          onRestart={() => {
            if (gameMode === 'practice') {
              handleStartPractice();
            } else if (gameMode === 'challenge' && activeChallenge) {
              handleStartChallenge(activeChallenge);
            } else if (lastSetupConfigs) {
              startMatch(
                lastSetupConfigs.configs,
                lastSetupConfigs.mode,
                lastSetupConfigs.format,
                null,
                activeTournamentRound,
                seriesState
              );
            } else {
              handleStartQuickMatch();
            }
          }}
          onExit={() => requestLeaveMatch()}
          onPause={() => setIsPaused(true)}
          isPractice={gameMode === 'practice'}
          series={seriesState}
        />
      )}

      {/* Pause Modal */}
      <PauseModal
        isOpen={isPaused}
        onResume={() => setIsPaused(false)}
        onRestart={() => {
          setIsPaused(false);
          if (lastSetupConfigs) {
            startMatch(
              lastSetupConfigs.configs,
              lastSetupConfigs.mode,
              lastSetupConfigs.format
            );
          } else {
            handleStartQuickMatch();
          }
        }}
        onOpenSettings={() => setActiveModal('settings')}
        onRequestExit={() => {
          setIsPaused(false);
          requestLeaveMatch();
        }}
      />

      {/* Match Over Modal */}
      {!isInMenu && phase === 'over' && (
        <MatchOverModal
          winner={matchWinner}
          eliminatedOrder={eliminatedOrder}
          coinsAwarded={lastCoinsAwarded}
          xpAwarded={lastXpAwarded}
          series={seriesState}
          onContinueSeries={() => {
            if (lastSetupConfigs && seriesState && !seriesState.isComplete) {
              startMatch(
                lastSetupConfigs.configs,
                lastSetupConfigs.mode,
                'bo5',
                null,
                null,
                seriesState
              );
            }
          }}
          onRematch={() => {
            if (gameMode === 'challenge' && activeChallenge) {
              handleStartChallenge(activeChallenge);
            } else if (gameMode === 'championship' && activeTournamentRound) {
              handleStartChampionshipRound(activeTournamentRound);
            } else if (lastSetupConfigs) {
              startMatch(
                lastSetupConfigs.configs,
                lastSetupConfigs.mode,
                lastSetupConfigs.format
              );
            } else {
              handleStartQuickMatch();
            }
          }}
          onExit={() => {
            setSeriesState(null);
            seriesStateRef.current = null;
            saveSeriesState(null);
            setIsInMenu(true);
            isInMenuRef.current = true;
          }}
        />
      )}

      {/* Exit Confirmation Dialog (Phase 6) */}
      <ExitConfirmModal
        isOpen={showExitConfirm}
        isPlacementPhase={isPlacingPhase}
        onStayInMatch={() => {
          setShowExitConfirm(false);
          setPendingExitAction(null);
        }}
        onLeaveMatch={() => {
          const action = pendingExitAction;
          abandonMatchAndPerform(action || undefined);
        }}
      />

      {/* Modals */}
      {(activeModal === 'setup_quick' ||
        activeModal === 'setup_pass' ||
        activeModal === 'setup_ai') && (
        <MatchSetupModal
          mode={
            activeModal === 'setup_pass'
              ? 'pass_and_play'
              : activeModal === 'setup_ai'
              ? 'ai_battle'
              : 'quick'
          }
          defaultSkinId={progress.equippedSkin || DEFAULT_PEN_ID}
          selectedTableId={selectedTableId}
          onClose={() => setActiveModal('none')}
          onStart={(configs, format) => {
            const targetMode: GameMode =
              activeModal === 'setup_pass'
                ? 'pass_and_play'
                : activeModal === 'setup_ai'
                ? 'ai_battle'
                : 'quick';
            startMatch(configs, targetMode, format || 'single');
          }}
        />
      )}

      {activeModal === 'locker' && (
        <PenLockerModal
          progress={progress}
          onEquipSkin={handleEquipSkin}
          onUnlockSkin={handleUnlockSkin}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'arenas' && (
        <TableSelectionModal
          currentTableId={selectedTableId}
          customWidth={customTableDims.width}
          customHeight={customTableDims.height}
          onSelectTable={handleSelectTable}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'championship' && (
        <ChampionshipModal
          progress={progress}
          onStartRound={handleStartChampionshipRound}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'challenges' && (
        <ChallengesModal
          progress={progress}
          onStartChallenge={handleStartChallenge}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'settings' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={(nextSettings) => {
            setSettings(nextSettings);
            pushSaveToCloud(progress, nextSettings);
          }}
          onClose={() => setActiveModal('none')}
          onResetProgress={() => {
            localStorage.clear();
            const freshProg = loadProgress();
            setProgress(freshProg);
            setMatchHistory([]);
          }}
        />
      )}

      {activeModal === 'howto' && (
        <HowToModal onClose={() => setActiveModal('none')} />
      )}

      {activeModal === 'account' && (
        <AccountModal
          user={user}
          serverConfig={serverConfig}
          syncStatus={syncStatus}
          syncError={syncError}
          progress={progress}
          conflictDetails={conflictDetails}
          onClose={() => setActiveModal('none')}
          onStartGoogleRedirect={handleStartGoogleRedirect}
          onSubmitGoogleCredential={handleSubmitGoogleCredential}
          onSyncNow={() => pushSaveToCloud(progress, settings)}
          onResolveConflict={handleResolveConflict}
          onSignOut={handleSignOut}
          onDeleteAccount={handleDeleteAccount}
        />
      )}

      {activeModal === 'stats' && (
        <StatsAndHistoryModal
          progress={progress}
          matchHistory={matchHistory}
          onClaimDailyReward={handleClaimDailyBonus}
          onClose={() => setActiveModal('none')}
        />
      )}
    </div>
  );
}
export default App;
