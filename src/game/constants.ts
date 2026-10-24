import { AttackSide, GameSettings } from '../types/game';

export const PEN_LENGTH = 170;
export const PEN_WIDTH = 16;
export const BASE_DENSITY = 0.002;
export const BASE_RESTITUTION = 0.22;
export const SUB_DT = 1000 / 120;
export const DESK_MARGIN = 34;

// Calibrated launch & maximum speed limits (world units per physics update)
export const MIN_LAUNCH_SPEED = 2.0;
export const MAX_LAUNCH_SPEED = 24.8;
export const MAX_SPEED = 28.0;
export const MAX_ANGULAR_SPEED = 0.42;

// Configurable physical footprint overhang ratios for edge elimination
export const STRICT_OVERHANG_RATIO = 0.32;
export const CENTER_OVERHANG_RATIO = 0.50;

export const DESK_FRICTION_MAP: Record<string, number> = {
  polished: 0.031,
  normal: 0.037,
  rough: 0.048,
};

export const ATTACK_SIDES: AttackSide[] = [
  {
    id: 0,
    name: 'Top Strike (Side 1)',
    banglaName: 'শীর্ষ আঘাত (সাইড ১)',
    offset: 0.40,
    mult: 1.04,
    strike: 0.62,
    dens: 1.0,
    title: 'Spinning Nib Attack',
    desc: 'Controlled spin and curved movement. Strikes the nib end to sweep a wide arc and clip angled targets.',
  },
  {
    id: 1,
    name: 'Middle Push (Side 2)',
    banglaName: 'সরাসরি ধাক্কা (সাইড ২)',
    offset: 0.00,
    mult: 0.94,
    strike: 0.86,
    dens: 1.10,
    title: 'Direct Momentum Transfer',
    desc: 'Predictable, straight movement with zero spin. Transfers clean forward momentum on a direct hit.',
  },
  {
    id: 2,
    name: 'Bottom Slam (Side 3)',
    banglaName: 'ভারী আঘাত (সাইড ৩)',
    offset: -0.40,
    mult: 1.12,
    strike: 0.52,
    dens: 1.38,
    title: 'Heavyweight Bulldoze',
    desc: 'Strong impact potential with heavy follow-through mass, but carries higher risk of sliding off the edge.',
  },
];

export const DEFAULT_SETTINGS: GameSettings = {
  fall: 'center',
  sound: true,
  music: true,
  vibrate: true,
  guide: true,
  desk: 'classic',
  skill: 'normal',
  reducedMotion: false,
  dragFlickGesture: true,
};

export const BOT_NAMES = ['Rabiul Master', 'Bot Tutul', 'Bot Shimul', 'Bot Mitu', 'Exam Proctor Bot'];
