import Matter from 'matter-js';
import { AttackSideIndex, FallRule } from '../types/game';
import {
  ATTACK_SIDES,
  BASE_DENSITY,
  BASE_RESTITUTION,
  CENTER_OVERHANG_RATIO,
  MAX_ANGULAR_SPEED,
  MAX_LAUNCH_SPEED,
  MAX_SPEED,
  MIN_LAUNCH_SPEED,
  PEN_LENGTH,
  PEN_WIDTH,
  STRICT_OVERHANG_RATIO,
  SUB_DT,
} from './constants';

const { Engine, Bodies, Body, Composite } = Matter;

export const clamp = (v: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, v));

export function angDiff(a: number, b: number): number {
  let d = b - a;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
}

/**
 * Smooth non-linear power response curve:
 * - Low power (10-25%): fine control and short tactical positioning
 * - Medium power (50%): balanced, reliable mid-range slides
 * - High power (75-100%): strong long-range strikes with increased self-knockout risk
 */
export function powerCurve(powerNormalized: number): number {
  const p = clamp(powerNormalized, 0, 1);
  if (p <= 0) return 0;
  return 0.35 * p + 0.65 * Math.pow(p, 1.35);
}

export function launchSpeed(
  powerNormalized: number,
  sideIndex: AttackSideIndex,
  maxBaseLaunchSpeed: number = MAX_LAUNCH_SPEED
): number {
  const p = clamp(powerNormalized, 0, 1);
  if (p <= 0) return 0;
  const side = ATTACK_SIDES[sideIndex] || ATTACK_SIDES[1];
  const curved = powerCurve(p);
  const baseSpeed = MIN_LAUNCH_SPEED + (maxBaseLaunchSpeed - MIN_LAUNCH_SPEED) * curved;
  return Math.min(MAX_SPEED, baseSpeed * side.mult);
}

/**
 * Inverse mapping from desired speed to normalized power [0, 1] for AI planning.
 */
export function powerFromTargetSpeed(
  targetSpeed: number,
  sideIndex: AttackSideIndex,
  maxBaseLaunchSpeed: number = MAX_LAUNCH_SPEED
): number {
  const side = ATTACK_SIDES[sideIndex] || ATTACK_SIDES[1];
  const baseNeeded = targetSpeed / side.mult;
  const targetCurved = clamp(
    (baseNeeded - MIN_LAUNCH_SPEED) / Math.max(1, maxBaseLaunchSpeed - MIN_LAUNCH_SPEED),
    0.05,
    1.0
  );
  // Binary search inverse of monotonic powerCurve
  let lo = 0.05;
  let hi = 1.0;
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2;
    if (powerCurve(mid) < targetCurved) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function contactPoint(
  position: { x: number; y: number },
  angle: number,
  sideIndex: AttackSideIndex
): { x: number; y: number } {
  const side = ATTACK_SIDES[sideIndex] || ATTACK_SIDES[1];
  const ax = Math.cos(angle);
  const ay = Math.sin(angle);
  const offset = side.offset * PEN_LENGTH;
  return {
    x: position.x + ax * offset,
    y: position.y + ay * offset,
  };
}

export function applyLaunch(
  body: Matter.Body,
  angle: number,
  powerNormalized: number,
  sideIndex: AttackSideIndex
): void {
  const side = ATTACK_SIDES[sideIndex] || ATTACK_SIDES[1];

  // Ensure body density matches the attack style consistently in both simulation and live play
  Body.setDensity(body, BASE_DENSITY * side.dens);

  const v = launchSpeed(powerNormalized, sideIndex);
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);

  Body.setVelocity(body, { x: ux * v, y: uy * v });

  const ax = Math.cos(body.angle);
  const ay = Math.sin(body.angle);
  const rx = ax * side.offset * PEN_LENGTH;
  const ry = ay * side.offset * PEN_LENGTH;

  // Calibrated rotational impulse per attack style:
  // Top Strike (0) produces dynamic spin & subtle curve; Middle Push (1) has zero spin; Bottom Slam (2) has heavier linear drive with moderate spin
  const spinScale = sideIndex === 0 ? 0.82 : sideIndex === 2 ? 0.52 : 0;
  const J = body.mass * v * spinScale;

  const rawAngularVel = (rx * uy * J - ry * ux * J) / body.inertia;
  const angularVel = clamp(rawAngularVel, -MAX_ANGULAR_SPEED, MAX_ANGULAR_SPEED);
  Body.setAngularVelocity(body, angularVel);

  // Store spin-curve metadata for Top Strike curved drift
  (body as any).attackSideIndex = sideIndex;
  (body as any).initialSpinSign =
    Math.abs(angularVel) > 0.015 ? Math.sign(angularVel) : sideIndex === 0 ? 1 : 0;
}

/**
 * Applies subtle surface-spin lateral curve during physics substeps and enforces speed caps.
 * Shared between live gameplay and trajectory preview so predictions remain 100% accurate.
 */
export function stepBodyDynamics(body: Matter.Body): void {
  const vel = Body.getVelocity(body);
  const spd = Math.hypot(vel.x, vel.y);
  const angVel = Body.getAngularVelocity(body);

  // Subtle curved drift for spinning Top Strike shots
  const sideIdx: AttackSideIndex | undefined = (body as any).attackSideIndex;
  if (sideIdx === 0 && spd > 0.6 && Math.abs(angVel) > 0.008) {
    const curveFactor = clamp(angVel * 0.018, -0.0065, 0.0065);
    const nx = -vel.y * curveFactor;
    const ny = vel.x * curveFactor;
    Body.setVelocity(body, { x: vel.x + nx, y: vel.y + ny });
  }

  // Enforce linear speed cap
  const curVel = Body.getVelocity(body);
  const curSpd = Math.hypot(curVel.x, curVel.y);
  if (curSpd > MAX_SPEED) {
    const scale = MAX_SPEED / curSpd;
    Body.setVelocity(body, { x: curVel.x * scale, y: curVel.y * scale });
  }

  // Enforce angular velocity cap
  if (Math.abs(angVel) > MAX_ANGULAR_SPEED) {
    Body.setAngularVelocity(body, Math.sign(angVel) * MAX_ANGULAR_SPEED);
  }
}

export function segOf(
  pos: { x: number; y: number },
  ang: number
): [{ x: number; y: number }, { x: number; y: number }] {
  const half = PEN_LENGTH / 2 - PEN_WIDTH / 2;
  const cx = Math.cos(ang) * half;
  const cy = Math.sin(ang) * half;
  return [
    { x: pos.x - cx, y: pos.y - cy },
    { x: pos.x + cx, y: pos.y + cy },
  ];
}

export function segClosest(
  p1: { x: number; y: number },
  q1: { x: number; y: number },
  p2: { x: number; y: number },
  q2: { x: number; y: number }
): [number, number, number] {
  const d1x = q1.x - p1.x;
  const d1y = q1.y - p1.y;
  const d2x = q2.x - p2.x;
  const d2y = q2.y - p2.y;
  const rx = p1.x - p2.x;
  const ry = p1.y - p2.y;

  const a = d1x * d1x + d1y * d1y;
  const e = d2x * d2x + d2y * d2y;
  const f = d2x * rx + d2y * ry;
  const c = d1x * rx + d1y * ry;
  const b = d1x * d2x + d1y * d2y;
  const den = a * e - b * b;

  let s = den > 1e-9 ? clamp((b * f - c * e) / den, 0, 1) : 0;
  let t = (b * s + f) / e;

  if (t < 0) {
    t = 0;
    s = clamp(-c / a, 0, 1);
  } else if (t > 1) {
    t = 1;
    s = clamp((b - c) / a, 0, 1);
  }

  const c1x = p1.x + d1x * s;
  const c1y = p1.y + d1y * s;
  const c2x = p2.x + d2x * t;
  const c2y = p2.y + d2y * t;

  return [Math.hypot(c1x - c2x, c1y - c2y), (c1x + c2x) / 2, (c1y + c2y) / 2];
}

/**
 * Computes the proportion (0.0 to 1.0) of a pen's physical footprint
 * that extends outside the authoritative playable table boundary [0, deskWidth] x [0, deskHeight].
 */
export function getPenFootprintOverhangRatio(
  pos: { x: number; y: number },
  angle: number,
  deskWidth: number,
  deskHeight: number
): number {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const halfL = PEN_LENGTH / 2;
  const halfW = PEN_WIDTH / 2;

  const lengthSteps = 11;
  const widthOffsets = [-halfW, 0, halfW];
  let outsideCount = 0;
  let totalCount = 0;

  for (let i = 0; i < lengthSteps; i++) {
    const lx = -halfL + (i / (lengthSteps - 1)) * PEN_LENGTH;
    for (let j = 0; j < widthOffsets.length; j++) {
      const ly = widthOffsets[j];
      const wx = pos.x + lx * cos - ly * sin;
      const wy = pos.y + lx * sin + ly * cos;
      totalCount++;
      if (wx < 0 || wy < 0 || wx > deskWidth || wy > deskHeight) {
        outsideCount++;
      }
    }
  }

  return outsideCount / totalCount;
}

/**
 * Authoritative table-boundary knockout check in world coordinates.
 * - A pen is always eliminated when its center of mass crosses the playable table boundary [0, deskWidth] x [0, deskHeight].
 * - In 'strict' mode, a pen is also eliminated when >= STRICT_OVERHANG_RATIO (32%) of its physical footprint moves outside.
 * - In 'center' mode, a pen is eliminated when its center crosses the boundary or >= CENTER_OVERHANG_RATIO (50%) of its footprint is outside.
 * - Pens near the edge with minor tip overhang (< threshold) can teeter safely without premature elimination.
 */
export function isOffDesk(
  body: Matter.Body,
  deskWidth: number,
  deskHeight: number,
  rule: FallRule,
  customOverhangRatio?: number
): boolean {
  const p = body.position;
  // 1. Authoritative center-of-mass check: no pen may remain outside the playable table
  if (p.x < 0 || p.y < 0 || p.x > deskWidth || p.y > deskHeight) {
    return true;
  }

  // 2. Fast bounding check: if all vertices are inside [0, deskWidth] x [0, deskHeight], definitely safe
  let anyVertexOutside = false;
  if (body.vertices && body.vertices.length > 0) {
    for (const v of body.vertices) {
      if (v.x < 0 || v.y < 0 || v.x > deskWidth || v.y > deskHeight) {
        anyVertexOutside = true;
        break;
      }
    }
    if (!anyVertexOutside) return false;
  }

  // 3. Footprint overhang ratio check
  const overhangRatio = getPenFootprintOverhangRatio(
    p,
    body.angle,
    deskWidth,
    deskHeight
  );
  const threshold =
    customOverhangRatio !== undefined
      ? clamp(customOverhangRatio, 0.05, 0.95)
      : rule === 'center'
      ? CENTER_OVERHANG_RATIO
      : STRICT_OVERHANG_RATIO;

  return overhangRatio >= threshold;
}

export function resolveCustomStrike(
  bodyA: Matter.Body,
  bodyB: Matter.Body,
  collisionPair: any,
  restitution = 0.72
): number {
  const safeRestitution = clamp(restitution, 0.15, 0.90);
  const nn = collisionPair?.collision?.normal || {
    x: bodyB.position.x - bodyA.position.x,
    y: bodyB.position.y - bodyA.position.y,
  };
  const nLen = Math.hypot(nn.x, nn.y) || 1;
  let nx = nn.x / nLen;
  let ny = nn.y / nLen;

  if (
    (bodyB.position.x - bodyA.position.x) * nx +
      (bodyB.position.y - bodyA.position.y) * ny <
    0
  ) {
    nx = -nx;
    ny = -ny;
  }

  // Gently resolve deep overlaps to prevent pens from sticking or double-colliding
  const depth = collisionPair?.collision?.depth || 0;
  if (depth > 0.6) {
    const sep = Math.min(4.0, (depth - 0.3) * 0.5);
    Body.setPosition(bodyA, {
      x: bodyA.position.x - nx * sep,
      y: bodyA.position.y - ny * sep,
    });
    Body.setPosition(bodyB, {
      x: bodyB.position.x + nx * sep,
      y: bodyB.position.y + ny * sep,
    });
  }

  let cx = 0;
  let cy = 0;
  let count = 0;
  if (collisionPair?.collision?.supports) {
    for (const s of collisionPair.collision.supports) {
      if (s && Number.isFinite(s.x) && Number.isFinite(s.y)) {
        cx += s.x;
        cy += s.y;
        count++;
      }
    }
  }
  if (!count) {
    cx = (bodyA.position.x + bodyB.position.x) / 2;
    cy = (bodyA.position.y + bodyB.position.y) / 2;
  } else {
    cx /= count;
    cy /= count;
  }

  const va = Body.getVelocity(bodyA);
  const vb = Body.getVelocity(bodyB);
  const wa = Body.getAngularVelocity(bodyA);
  const wb = Body.getAngularVelocity(bodyB);

  const ra = { x: cx - bodyA.position.x, y: cy - bodyA.position.y };
  const rb = { x: cx - bodyB.position.x, y: cy - bodyB.position.y };

  // Dampen rotational lever arm contribution slightly to prevent unrealistic angular railgun spikes
  const rotFactor = 0.55;
  const pa = {
    x: va.x - wa * ra.y * rotFactor,
    y: va.y + wa * ra.x * rotFactor,
  };
  const pb = {
    x: vb.x - wb * rb.y * rotFactor,
    y: vb.y + wb * rb.x * rotFactor,
  };

  const vn = (pb.x - pa.x) * nx + (pb.y - pa.y) * ny;
  if (vn >= 0) return 0;

  const ran = (ra.x * ny - ra.y * nx) * rotFactor;
  const rbn = (rb.x * ny - rb.y * nx) * rotFactor;

  const denom =
    1 / bodyA.mass +
    1 / bodyB.mass +
    (ran * ran) / bodyA.inertia +
    (rbn * rbn) / bodyB.inertia;

  if (!Number.isFinite(denom) || denom <= 1e-9) return 0;

  const impulse = (-(1 + safeRestitution) * vn) / denom;

  const nextVa = {
    x: va.x - (impulse * nx) / bodyA.mass,
    y: va.y - (impulse * ny) / bodyA.mass,
  };
  const nextVb = {
    x: vb.x + (impulse * nx) / bodyB.mass,
    y: vb.y + (impulse * ny) / bodyB.mass,
  };

  // Clamp post-collision linear and angular speeds for fairness and stability
  const spdA = Math.hypot(nextVa.x, nextVa.y);
  if (spdA > MAX_SPEED) {
    nextVa.x *= MAX_SPEED / spdA;
    nextVa.y *= MAX_SPEED / spdA;
  }
  const spdB = Math.hypot(nextVb.x, nextVb.y);
  if (spdB > MAX_SPEED) {
    nextVb.x *= MAX_SPEED / spdB;
    nextVb.y *= MAX_SPEED / spdB;
  }

  Body.setVelocity(bodyA, nextVa);
  Body.setAngularVelocity(
    bodyA,
    clamp(wa - (ran * impulse) / bodyA.inertia, -MAX_ANGULAR_SPEED, MAX_ANGULAR_SPEED)
  );

  Body.setVelocity(bodyB, nextVb);
  Body.setAngularVelocity(
    bodyB,
    clamp(wb + (rbn * impulse) / bodyB.inertia, -MAX_ANGULAR_SPEED, MAX_ANGULAR_SPEED)
  );

  return Math.min(MAX_SPEED, -vn);
}

export interface TrajectoryResult {
  path: Array<{ x: number; y: number; d: number }>;
  hit: {
    targetIndex: number;
    x: number;
    y: number;
    d: number;
    cx: number;
    cy: number;
    a: number;
  } | null;
  exit: { x: number; y: number; d: number } | null;
  endA: number;
  total: number;
}

let ghostEngine: Matter.Engine | null = null;

export function simulateTrajectory(
  attackerPos: { x: number; y: number; angle: number },
  angle: number,
  powerNormalized: number,
  sideIndex: AttackSideIndex,
  otherPlayers: Array<{ idx: number; pos: { x: number; y: number }; angle: number }>,
  deskWidth: number,
  deskHeight: number,
  frictionAir: number,
  fallRule: FallRule
): TrajectoryResult {
  if (!ghostEngine) {
    ghostEngine = Engine.create();
    ghostEngine.gravity.x = 0;
    ghostEngine.gravity.y = 0;
  }
  Composite.clear(ghostEngine.world, false);

  const side = ATTACK_SIDES[sideIndex] || ATTACK_SIDES[1];
  const ghostBody = Bodies.rectangle(
    attackerPos.x,
    attackerPos.y,
    PEN_LENGTH,
    PEN_WIDTH,
    {
      chamfer: { radius: 7 },
      frictionAir,
      friction: 0.12,
      frictionStatic: 0.2,
      restitution: BASE_RESTITUTION,
      density: BASE_DENSITY * side.dens,
      angle: attackerPos.angle,
    }
  );
  (ghostBody as any).deltaTime = SUB_DT;
  Composite.add(ghostEngine.world, ghostBody);

  applyLaunch(ghostBody, angle, powerNormalized, sideIndex);

  const others = otherPlayers.map((q) => ({
    idx: q.idx,
    seg: segOf(q.pos, q.angle),
  }));

  const path: Array<{ x: number; y: number; d: number }> = [
    { x: ghostBody.position.x, y: ghostBody.position.y, d: 0 },
  ];
  let hit: TrajectoryResult['hit'] = null;
  let exit: TrajectoryResult['exit'] = null;
  let dist = 0;

  for (let step = 0; step < 500; step++) {
    for (let sub = 0; sub < 2; sub++) {
      Engine.update(ghostEngine, SUB_DT);
      stepBodyDynamics(ghostBody);
    }
    const last = path[path.length - 1];
    dist += Math.hypot(ghostBody.position.x - last.x, ghostBody.position.y - last.y);
    const pt = { x: ghostBody.position.x, y: ghostBody.position.y, d: dist };
    path.push(pt);

    if (isOffDesk(ghostBody, deskWidth, deskHeight, fallRule)) {
      exit = pt;
      break;
    }

    const sg = segOf(ghostBody.position, ghostBody.angle);
    for (const o of others) {
      const r = segClosest(sg[0], sg[1], o.seg[0], o.seg[1]);
      if (r[0] < PEN_WIDTH) {
        hit = {
          targetIndex: o.idx,
          x: r[1],
          y: r[2],
          d: dist,
          cx: pt.x,
          cy: pt.y,
          a: ghostBody.angle,
        };
        break;
      }
    }
    if (hit) break;

    if (ghostBody.speed < 0.04 && Math.abs(ghostBody.angularVelocity) < 0.002) {
      break;
    }
  }

  return {
    path,
    hit,
    exit,
    endA: ghostBody.angle,
    total: dist,
  };
}
