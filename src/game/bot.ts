import { AttackSideIndex, BotSkill, FallRule, InGamePlayer } from '../types/game';
import { clamp, launchSpeed, powerFromTargetSpeed, simulateTrajectory } from './physics';

export interface BotPlan {
  aim: number;
  power: number; // 0..100
  side: AttackSideIndex;
  score: number;
}

export function planBotShot(
  botPlayer: InGamePlayer,
  alivePlayers: InGamePlayer[],
  deskWidth: number,
  deskHeight: number,
  deskFriction: number,
  skillLevel: BotSkill,
  fallRule: FallRule = 'center'
): BotPlan {
  const skillParams = {
    easy: { err: 0.16, powerErr: 0.18, maxPower: 0.65, missRate: 0.26 },
    normal: { err: 0.07, powerErr: 0.10, maxPower: 0.84, missRate: 0.10 },
    sharp: { err: 0.025, powerErr: 0.04, maxPower: 0.96, missRate: 0.0 },
  }[skillLevel] || { err: 0.07, powerErr: 0.10, maxPower: 0.84, missRate: 0.10 };

  const mePos = botPlayer.body.position;
  const targets = alivePlayers
    .filter((q) => q.idx !== botPlayer.idx)
    .sort((a, b) => {
      const da = Math.hypot(a.body.position.x - mePos.x, a.body.position.y - mePos.y);
      const db = Math.hypot(b.body.position.x - mePos.x, b.body.position.y - mePos.y);
      return da - db;
    })
    .slice(0, 2);

  let bestPlan: BotPlan | null = null;

  for (const target of targets) {
    const tp = target.body.position;
    const baseAngle = Math.atan2(tp.y - mePos.y, tp.x - mePos.x);

    // Calculate how close the target is to the desk edge
    const distToEdge = Math.min(tp.x, deskWidth - tp.x, tp.y, deskHeight - tp.y);
    const edgeVulnerability = 1 - clamp(distToEdge / (Math.min(deskWidth, deskHeight) / 2), 0, 1);

    const otherBodies = alivePlayers
      .filter((q) => q.idx !== botPlayer.idx)
      .map((q) => ({ idx: q.idx, pos: q.body.position, angle: q.body.angle }));

    // Evaluate side attacks: Middle (1), Top (0), Bottom (2)
    const sidesToTest: AttackSideIndex[] = [1, 0, 2];
    const angleOffsets = [0, -0.07, 0.07, -0.14, 0.14];

    for (const sideIdx of sidesToTest) {
      for (const off of angleOffsets) {
        const testAngle = baseAngle + off;
        const sim = simulateTrajectory(
          { x: mePos.x, y: mePos.y, angle: botPlayer.body.angle },
          testAngle,
          1.0,
          sideIdx,
          otherBodies,
          deskWidth,
          deskHeight,
          deskFriction,
          fallRule
        );

        if (!sim.hit || sim.hit.targetIndex !== target.idx) continue;

        const fullSpeed = launchSpeed(1.0, sideIdx);
        const margin = sideIdx === 1 ? 105 : 80;
        const neededSpeed = fullSpeed * Math.min(1, (sim.hit.d + margin) / Math.max(1, sim.total));
        const normalizedPower = clamp(
          powerFromTargetSpeed(neededSpeed, sideIdx),
          0.14,
          skillParams.maxPower
        );

        // Verify at actual chosen power that our own shot doesn't exit the desk
        const actualSim = simulateTrajectory(
          { x: mePos.x, y: mePos.y, angle: botPlayer.body.angle },
          testAngle,
          normalizedPower,
          sideIdx,
          otherBodies,
          deskWidth,
          deskHeight,
          deskFriction,
          fallRule
        );

        const selfPreservationPenalty = actualSim.exit ? 4.5 : 0.0;

        const score =
          edgeVulnerability * 2.2 +
          (sideIdx === 1 ? 0.4 : 0.15) -
          Math.abs(off) * 2.6 -
          normalizedPower * 0.45 -
          selfPreservationPenalty +
          Math.random() * 0.6;

        if (!bestPlan || score > bestPlan.score) {
          bestPlan = {
            aim: testAngle,
            power: Math.round(normalizedPower * 100),
            side: sideIdx,
            score,
          };
        }
      }
    }
  }

  // Fallback if no single-shot direct hit found (e.g., long distance positioning shot)
  if (!bestPlan) {
    const firstTarget = targets[0];
    const fallbackAngle = firstTarget
      ? Math.atan2(firstTarget.body.position.y - mePos.y, firstTarget.body.position.x - mePos.x)
      : 0;
    const dist = firstTarget
      ? Math.hypot(firstTarget.body.position.x - mePos.x, firstTarget.body.position.y - mePos.y)
      : 350;
    const safePower = clamp(Math.round((dist / 700) * 65), 25, 65);
    bestPlan = {
      aim: fallbackAngle,
      power: safePower,
      side: 1,
      score: 0,
    };
  }

  // Apply skill variance / human-like imperfection
  if (Math.random() < skillParams.missRate) {
    bestPlan.aim += (Math.random() < 0.5 ? -1 : 1) * (0.14 + Math.random() * 0.16);
  }
  bestPlan.aim += (Math.random() - 0.5) * 2 * skillParams.err;
  bestPlan.power = Math.round(
    clamp(bestPlan.power + (Math.random() - 0.5) * 2 * skillParams.powerErr * 100, 15, 95)
  );

  return bestPlan;
}
