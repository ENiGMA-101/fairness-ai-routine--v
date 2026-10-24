import { GamePhase } from '../types/game';

export type ResponsiveLayoutMode = 'desktop-sidebar' | 'tablet-compact' | 'mobile-compact';

export interface MeasuredHudBounds {
  topBottom?: number;
  bottomHeight?: number;
  leftWidth?: number;
  rightWidth?: number;
}

export interface CameraViewResult {
  scale: number;
  ox: number;
  oy: number;
  layoutMode: ResponsiveLayoutMode;
  reserved: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  availW: number;
  availH: number;
  tableScreenRect: {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  };
}

/**
 * Determines the responsive layout mode based on viewport dimensions.
 * - Desktop (>= 1180px width and >= 600px height): Two-column layout with permanent Left Control Sidebar
 * - Tablet (700px - 1179px width): Balanced layout with compact bottom control panel / drawer
 * - Mobile (< 700px width): Touch-friendly compact bottom controls
 */
export function resolveResponsiveLayoutMode(
  viewportWidth: number,
  viewportHeight: number
): ResponsiveLayoutMode {
  if (viewportWidth >= 1180 && viewportHeight >= 600) {
    return 'desktop-sidebar';
  }
  if (viewportWidth >= 700) {
    return 'tablet-compact';
  }
  return 'mobile-compact';
}

/**
 * Computes the authoritative camera transformation (scale, ox, oy) for the gameplay canvas.
 * Ensures the entire table (all 4 corners and borders) fits inside the unoccluded viewport area
 * while preserving the table's exact aspect ratio.
 */
export function computeCameraView(params: {
  viewportWidth: number;
  viewportHeight: number;
  deskWidth: number;
  deskHeight: number;
  isPlaying: boolean;
  phase: GamePhase;
  measuredBounds?: MeasuredHudBounds;
  sidebarOverride?: 'auto' | 'sidebar' | 'bottom';
}): CameraViewResult {
  const {
    viewportWidth: w,
    viewportHeight: h,
    deskWidth,
    deskHeight,
    isPlaying,
    phase,
    measuredBounds,
    sidebarOverride = 'auto',
  } = params;

  let layoutMode = resolveResponsiveLayoutMode(w, h);
  if (sidebarOverride === 'sidebar' && w >= 960) {
    layoutMode = 'desktop-sidebar';
  } else if (sidebarOverride === 'bottom' && layoutMode === 'desktop-sidebar') {
    layoutMode = 'tablet-compact';
  }

  const isPlacing = phase === 'placing' || phase === 'handover';

  let topReserved = 16;
  let bottomReserved = 16;
  let leftReserved = 16;
  let rightReserved = 16;

  if (isPlaying) {
    if (isPlacing) {
      topReserved = Math.max(88, (measuredBounds?.topBottom ?? (w < 640 ? 108 : 96)) + 12);
      bottomReserved = Math.max(120, (measuredBounds?.bottomHeight ?? (w < 640 ? 156 : 132)) + 14);
      leftReserved = Math.max(12, Math.min(28, w * 0.02));
      rightReserved = Math.max(12, Math.min(28, w * 0.02));
    } else if (layoutMode === 'desktop-sidebar') {
      // Left sidebar holds attack controls, vertical power meter, slider, and flick button
      const sidebarW = measuredBounds?.leftWidth ?? (w >= 1440 ? 288 : 268);
      leftReserved = sidebarW + 20;
      rightReserved = Math.max(20, (measuredBounds?.rightWidth ?? 0) + 20);
      topReserved = Math.max(88, (measuredBounds?.topBottom ?? 88) + 12);
      bottomReserved = 20;
    } else if (layoutMode === 'tablet-compact') {
      topReserved = Math.max(86, (measuredBounds?.topBottom ?? 86) + 10);
      bottomReserved = Math.max(150, (measuredBounds?.bottomHeight ?? 168) + 14);
      leftReserved = Math.max(16, Math.min(28, w * 0.022));
      rightReserved = Math.max(16, Math.min(28, w * 0.022));
    } else {
      // mobile-compact (including 320x568, 390x844, 430x932)
      topReserved = Math.max(76, (measuredBounds?.topBottom ?? (w <= 350 ? 80 : 88)) + 8);
      bottomReserved = Math.max(162, (measuredBounds?.bottomHeight ?? (w <= 350 ? 172 : 188)) + 10);
      leftReserved = w <= 350 ? 8 : 12;
      rightReserved = w <= 350 ? 8 : 12;
    }
  }

  const availW = Math.max(80, w - leftReserved - rightReserved);
  const availH = Math.max(80, h - topReserved - bottomReserved);

  // Uniform scale preserves exact aspect ratio (never stretches a rectangle into a square)
  const scale = Math.min(availW / deskWidth, availH / deskHeight);

  const renderedWidth = deskWidth * scale;
  const renderedHeight = deskHeight * scale;

  const ox = leftReserved + (availW - renderedWidth) / 2;
  const oy = topReserved + (availH - renderedHeight) / 2;

  return {
    scale,
    ox,
    oy,
    layoutMode,
    reserved: {
      top: topReserved,
      bottom: bottomReserved,
      left: leftReserved,
      right: rightReserved,
    },
    availW,
    availH,
    tableScreenRect: {
      left: ox,
      top: oy,
      right: ox + renderedWidth,
      bottom: oy + renderedHeight,
      width: renderedWidth,
      height: renderedHeight,
    },
  };
}

/**
 * Converts client (mouse/touch) coordinates into authoritative game world coordinates.
 */
export function screenToWorld(
  clientX: number,
  clientY: number,
  canvasRect: { left: number; top: number },
  view: { scale: number; ox: number; oy: number }
): { x: number; y: number } {
  const safeScale = view.scale > 1e-6 ? view.scale : 1;
  return {
    x: (clientX - canvasRect.left - view.ox) / safeScale,
    y: (clientY - canvasRect.top - view.oy) / safeScale,
  };
}

/**
 * Converts authoritative game world coordinates into screen coordinates relative to the viewport.
 */
export function worldToScreen(
  wx: number,
  wy: number,
  canvasRect: { left: number; top: number },
  view: { scale: number; ox: number; oy: number }
): { x: number; y: number } {
  return {
    x: canvasRect.left + view.ox + wx * view.scale,
    y: canvasRect.top + view.oy + wy * view.scale,
  };
}
